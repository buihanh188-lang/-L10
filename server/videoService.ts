import fs from 'fs';
import path from 'path';
import { execFile, execFileSync } from 'child_process';
import { promisify } from 'util';
import type { Request, Response } from 'express';
import { LESSONS } from '../src/data/lessons.ts';
import { CURRICULUM_CHAPTERS, CURRICULUM_PARTS } from '../src/data/curriculum.ts';
import type {
  ExternalVideoLink,
  Lesson,
  LessonVideoRecord,
  LessonVideoScript,
  VideoCapabilities,
  VideoQueueState,
  VideoScenePlan,
} from '../src/types/index.ts';
import {
  getExternalProviderLabel,
  parseAndNormalizeExternalVideoUrl,
  parseDurationInput,
} from '../src/utils/videoLinks.ts';
import {
  buildPhraseSyncedWebVtt,
  composeOfflineLessonScript,
  ensurePiperInstalled,
  getOfflineEngineStatus,
  isValidPngFile,
  probeValidMp4Duration,
  probeValidWavDuration,
  renderAnimatedSceneMp4,
  renderSceneSlidePng,
  synthesizePiperWav,
} from './offlineVideoEngine.ts';

const execFileAsync = promisify(execFile);

const VIDEO_DB_FILE = path.resolve(process.cwd(), 'data', 'video_library.json');
const VIDEO_APPROVALS_FILE = path.resolve(process.cwd(), 'data', 'video_approvals.json');
const EXTERNAL_LINKS_FILE = path.resolve(process.cwd(), 'data', 'external_video_links.json');
const VIDEOS_ROOT_DIR = path.resolve(process.cwd(), 'data', 'videos');

const MODEL_SCRIPT = 'SGK-Offline-Composer (0 đồng)';
const MODEL_TTS = 'Piper TTS vi_VN-vais1000-medium';
const MODEL_IMAGE = 'SVG + @resvg/resvg-js (1440x810 HD)';
const MODEL_VIDEO = 'FFmpeg H.264 Main (zoompan + faststart)';

interface VideoLibraryStore {
  records: Record<string, LessonVideoRecord>;
  queue: VideoQueueState;
  updatedAt: number;
}

export class VideoPipelineError extends Error {
  code: string;
  httpStatus: number;
  constructor(code: string, message: string, httpStatus = 412) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

function ensureDirectories() {
  const dataDir = path.dirname(VIDEO_DB_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(VIDEOS_ROOT_DIR)) fs.mkdirSync(VIDEOS_ROOT_DIR, { recursive: true });
}

function getBinaryAvailability(bin: string): boolean {
  const candidates = [`/usr/bin/${bin}`, `/usr/local/bin/${bin}`];
  for (const p of candidates) {
    if (fs.existsSync(p)) return true;
  }
  return false;
}

function getBinaryPath(bin: string): string {
  if (fs.existsSync(`/usr/bin/${bin}`)) return `/usr/bin/${bin}`;
  if (fs.existsSync(`/usr/local/bin/${bin}`)) return `/usr/local/bin/${bin}`;
  return bin;
}

interface ExternalLinksStore {
  version: number;
  updatedAt: number;
  links: Record<
    string,
    {
      externalVideo: ExternalVideoLink;
      durationSeconds?: number | null;
      isApproved?: boolean;
      isPublished?: boolean;
      approvedAt?: string | null;
      approvedBy?: string | null;
    }
  >;
}

function loadExternalLinksStore(): ExternalLinksStore {
  ensureDirectories();
  if (fs.existsSync(EXTERNAL_LINKS_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(EXTERNAL_LINKS_FILE, 'utf-8'));
      if (parsed && typeof parsed === 'object' && parsed.links && typeof parsed.links === 'object') {
        return {
          version: Number(parsed.version) || 1,
          updatedAt: Number(parsed.updatedAt) || Date.now(),
          links: parsed.links,
        };
      }
    } catch (err) {
      console.error('[VideoService] Error reading external_video_links.json:', err);
    }
  }
  return { version: 1, updatedAt: Date.now(), links: {} };
}

function saveExternalLinksStore(extStore: ExternalLinksStore) {
  ensureDirectories();
  extStore.updatedAt = Date.now();
  const tmpFile = `${EXTERNAL_LINKS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(extStore, null, 2), 'utf-8');
  fs.renameSync(tmpFile, EXTERNAL_LINKS_FILE);
}

function syncExternalLinksFileFromRecords(records: Record<string, LessonVideoRecord>) {
  const links: ExternalLinksStore['links'] = {};
  for (const lesson of LESSONS) {
    const rec = records[lesson.id];
    if (rec?.externalVideo?.normalizedUrl) {
      links[lesson.id] = {
        externalVideo: rec.externalVideo,
        durationSeconds: rec.durationSeconds ?? rec.externalVideo.durationSeconds ?? null,
        isApproved: rec.isApproved,
        isPublished: rec.isPublished,
        approvedAt: rec.approvedAt,
        approvedBy: rec.approvedBy,
      };
    }
  }
  saveExternalLinksStore({ version: 1, updatedAt: Date.now(), links });
}

interface PersistedApprovalEntry {
  lessonId: string;
  version: number;
  isApproved: boolean;
  isPublished: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  updatedAt: number;
}

function readAllPersistedApprovals(): Record<string, PersistedApprovalEntry> {
  const result: Record<string, PersistedApprovalEntry> = {};
  if (fs.existsSync(VIDEO_APPROVALS_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(VIDEO_APPROVALS_FILE, 'utf-8'));
      if (parsed && typeof parsed === 'object' && parsed.approvals && typeof parsed.approvals === 'object') {
        Object.assign(result, parsed.approvals);
      }
    } catch {
      // ignore corrupt sidecar
    }
  }
  for (const lesson of LESSONS) {
    const markerPath = path.join(VIDEOS_ROOT_DIR, lesson.id, 'published.json');
    if (fs.existsSync(markerPath)) {
      try {
        const entry = JSON.parse(fs.readFileSync(markerPath, 'utf-8'));
        if (entry && typeof entry === 'object') {
          const prev = result[lesson.id];
          if (!prev || Number(entry.updatedAt || 0) >= Number(prev.updatedAt || 0)) {
            result[lesson.id] = {
              lessonId: lesson.id,
              version: Number(entry.version) || 1,
              isApproved: Boolean(entry.isApproved),
              isPublished: Boolean(entry.isPublished),
              approvedAt: entry.approvedAt || null,
              approvedBy: entry.approvedBy || null,
              updatedAt: Number(entry.updatedAt) || Date.now(),
            };
          }
        }
      } catch {
        // ignore corrupt per-lesson marker
      }
    }
  }
  return result;
}

function writePersistedApprovals(records: Record<string, LessonVideoRecord>) {
  ensureDirectories();
  const existingPersisted = readAllPersistedApprovals();
  const approvals: Record<string, PersistedApprovalEntry> = {};
  for (const lesson of LESSONS) {
    const rec = records[lesson.id];
    if (!rec) continue;
    const prev = existingPersisted[lesson.id];
    const preserveMissingLocalApproval =
      rec.errorCode === 'LOCAL_MEDIA_MISSING' && Boolean(prev?.isApproved && prev?.isPublished);

    const entry: PersistedApprovalEntry = preserveMissingLocalApproval && prev
      ? {
          ...prev,
          lessonId: lesson.id,
        }
      : {
          lessonId: lesson.id,
          version: rec.version || 1,
          isApproved: Boolean(rec.isApproved),
          isPublished: Boolean(rec.isPublished),
          approvedAt: rec.approvedAt || null,
          approvedBy: rec.approvedBy || null,
          updatedAt: rec.updatedAt || Date.now(),
        };
    if (entry.isApproved || entry.isPublished) {
      approvals[lesson.id] = entry;
    }
    const lessonDir = path.join(VIDEOS_ROOT_DIR, lesson.id);
    if (fs.existsSync(lessonDir)) {
      const markerPath = path.join(lessonDir, 'published.json');
      try {
        fs.writeFileSync(markerPath, JSON.stringify(entry, null, 2), 'utf-8');
      } catch {
        // ignore per-lesson marker write failure
      }
    }
  }
  const tmpFile = `${VIDEO_APPROVALS_FILE}.tmp`;
  fs.writeFileSync(
    tmpFile,
    JSON.stringify({ version: 1, updatedAt: Date.now(), approvals }, null, 2),
    'utf-8'
  );
  fs.renameSync(tmpFile, VIDEO_APPROVALS_FILE);
}

function parseVttDurationSeconds(vttPath: string): number {
  try {
    const content = fs.readFileSync(vttPath, 'utf-8');
    const matches = Array.from(content.matchAll(/-->\s*(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?/g));
    if (matches.length === 0) return 0;
    const last = matches[matches.length - 1];
    return Math.round(Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3]));
  } catch {
    return 0;
  }
}

function createInitialRecord(lesson: Lesson): LessonVideoRecord {
  return {
    lessonId: lesson.id,
    lessonNumber: lesson.number,
    partId: lesson.partId,
    chapterId: lesson.chapterId ?? null,
    lessonTitle: lesson.title,
    isPracticeLesson: Boolean(lesson.isPracticeLesson),
    status: 'not_created',
    currentStep: 'idle',
    stepMessage: 'Chưa tạo video bài giảng',
    progressPercent: 0,
    durationSeconds: null,
    videoUrl: null,
    subtitleUrl: null,
    thumbnailUrl: null,
    fileSizeBytes: null,
    version: 0,
    draftVideo: null,
    externalVideo: null,
    isApproved: false,
    isPublished: false,
    approvedAt: null,
    approvedBy: null,
    script: null,
    errorCode: null,
    errorMessage: null,
    updatedAt: Date.now(),
    createdAt: null,
  };
}

function defaultQueueState(): VideoQueueState {
  return {
    isRunning: false,
    isPaused: false,
    mode: 'idle',
    activeLessonId: null,
    pendingLessonIds: [],
    completedCount: 0,
    failedCount: 0,
    totalQueued: 0,
    startedAt: null,
    updatedAt: Date.now(),
    lastError: null,
  };
}

function loadVideoStore(): VideoLibraryStore {
  ensureDirectories();
  let parsed: Partial<VideoLibraryStore> | null = null;
  if (fs.existsSync(VIDEO_DB_FILE)) {
    try {
      parsed = JSON.parse(fs.readFileSync(VIDEO_DB_FILE, 'utf-8'));
    } catch (err) {
      console.error('[VideoService] Error reading video_library.json:', err);
    }
  }

  const extStore = loadExternalLinksStore();
  const records: Record<string, LessonVideoRecord> = {};
  for (const lesson of LESSONS) {
    const existing = parsed?.records?.[lesson.id];
    const base = existing
      ? {
          ...createInitialRecord(lesson),
          ...existing,
          lessonId: lesson.id,
          lessonNumber: lesson.number,
          partId: lesson.partId,
          chapterId: lesson.chapterId ?? null,
          lessonTitle: lesson.title,
          isPracticeLesson: Boolean(lesson.isPracticeLesson),
        }
      : createInitialRecord(lesson);

    // Rehydrate persistent external link if video_library.json was restored to snapshot
    const savedExt = extStore.links[lesson.id];
    if (savedExt?.externalVideo?.normalizedUrl && !base.externalVideo) {
      base.externalVideo = savedExt.externalVideo;
      base.status = 'completed';
      base.currentStep = 'ready_for_approval';
      base.progressPercent = 100;
      base.version = Math.max(1, base.version || 1);
      base.videoUrl = savedExt.externalVideo.normalizedUrl;
      base.durationSeconds = savedExt.durationSeconds ?? savedExt.externalVideo.durationSeconds ?? base.durationSeconds ?? null;
      base.isApproved = Boolean(savedExt.isApproved);
      base.isPublished = Boolean(savedExt.isPublished);
      base.approvedAt = savedExt.approvedAt ?? base.approvedAt ?? null;
      base.approvedBy = savedExt.approvedBy ?? base.approvedBy ?? null;
      base.draftVideo =
        base.isApproved && base.isPublished
          ? null
          : {
              version: base.version,
              videoUrl: savedExt.externalVideo.normalizedUrl,
              subtitleUrl: base.subtitleUrl,
              thumbnailUrl: base.thumbnailUrl,
              durationSeconds: base.durationSeconds || 0,
              fileSizeBytes: base.fileSizeBytes || 0,
              createdAt: savedExt.externalVideo.updatedAt || Date.now(),
            };
      base.stepMessage = base.isPublished
        ? `Đã xuất bản từ kho lưu trữ bền vững (${getExternalProviderLabel(savedExt.externalVideo.provider)}).`
        : `Đã gắn link bền vững (${getExternalProviderLabel(savedExt.externalVideo.provider)}) - Chờ giáo viên duyệt.`;
    }

    records[lesson.id] = base;
  }

  const queue: VideoQueueState = {
    ...defaultQueueState(),
    ...(parsed?.queue || {}),
  };

  return {
    records,
    queue,
    updatedAt: parsed?.updatedAt || Date.now(),
  };
}

function saveVideoStore(store: VideoLibraryStore) {
  ensureDirectories();
  store.updatedAt = Date.now();
  const tmpFile = `${VIDEO_DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tmpFile, VIDEO_DB_FILE);
}

function cleanStaleTempFilesInDir(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) return;
    for (const entry of fs.readdirSync(dirPath)) {
      if (entry.includes('.tmp.')) {
        try { fs.unlinkSync(path.join(dirPath, entry)); } catch { /* ignore */ }
      }
    }
  } catch {
    // ignore cleanup errors
  }
}

function findLatestLessonAsset(lessonDir: string, prefix: string, ext: string): string | null {
  if (!fs.existsSync(lessonDir)) return null;
  const escapedExt = ext.replace('.', '\\.');
  const re = new RegExp(`^${prefix}-v(\\d+)${escapedExt}$`);
  let bestFile: string | null = null;
  let bestVer = -1;
  for (const name of fs.readdirSync(lessonDir)) {
    const m = name.match(re);
    if (m) {
      const ver = Number(m[1]);
      if (ver > bestVer) {
        bestVer = ver;
        bestFile = name;
      }
    }
  }
  return bestFile;
}

// Recover cleanly if server restarted mid-processing or video_library.json fell behind existing disk MP4s
function recoverInterruptedJobsOnBoot() {
  const store = loadVideoStore();
  const persistedApprovals = readAllPersistedApprovals();
  let changed = false;
  const ffprobeBin = getBinaryAvailability('ffprobe') ? getBinaryPath('ffprobe') : null;

  for (const lesson of LESSONS) {
    const lessonId = lesson.id;
    const rec = store.records[lessonId];
    const persisted = persistedApprovals[lessonId];
    const lessonDir = path.join(VIDEOS_ROOT_DIR, lessonId);
    if (fs.existsSync(lessonDir)) {
      for (const item of fs.readdirSync(lessonDir)) {
        if (item.startsWith('build-v')) {
          cleanStaleTempFilesInDir(path.join(lessonDir, item));
        } else if (item.includes('.tmp.')) {
          try { fs.unlinkSync(path.join(lessonDir, item)); } catch { /* ignore */ }
        }
      }
    }

    if (rec.status === 'processing') {
      rec.status = rec.script ? 'script_ready' : 'error';
      rec.currentStep = rec.script ? 'splitting_scenes' : 'failed';
      rec.stepMessage = 'Tiến trình bị gián đoạn khi khởi động lại máy chủ. Các tệp cảnh hợp lệ vẫn được bảo toàn, có thể bấm Tạo video để tiếp tục.';
      rec.errorCode = rec.script ? null : 'INTERRUPTED_ON_RESTART';
      rec.errorMessage = rec.script ? null : 'Máy chủ đã khởi động lại trong lúc xử lý. Dữ liệu đã lưu được bảo toàn.';
      rec.updatedAt = Date.now();
      changed = true;
    }

    // Reconcile existing completed MP4 on disk if video_library.json was reset/stale, preserving persisted approvals!
    if (rec.status !== 'completed' && fs.existsSync(lessonDir)) {
      const latestMp4 = findLatestLessonAsset(lessonDir, 'lecture', '.mp4');
      if (latestMp4) {
        const mp4Path = path.join(lessonDir, latestMp4);
        const verMatch = latestMp4.match(/lecture-v(\d+)\.mp4$/);
        const ver = verMatch ? Number(verMatch[1]) : 1;
        try {
          const stat = fs.statSync(mp4Path);
          const vttExact = `subtitles-v${ver}.vtt`;
          const vttFile = fs.existsSync(path.join(lessonDir, vttExact))
            ? vttExact
            : findLatestLessonAsset(lessonDir, 'subtitles', '.vtt');
          const thumbExact = `thumb-v${ver}.png`;
          const thumbFile = fs.existsSync(path.join(lessonDir, thumbExact))
            ? thumbExact
            : findLatestLessonAsset(lessonDir, 'thumb', '.png');

          let durSec = vttFile ? parseVttDurationSeconds(path.join(lessonDir, vttFile)) : 0;
          let validStreams = stat.size > 100000 && durSec > 10;
          if (!validStreams && stat.size > 10000 && ffprobeBin) {
            const out = execFileSync(
              ffprobeBin,
              ['-v', 'error', '-show_entries', 'format=duration', '-show_entries', 'stream=codec_type', '-of', 'json', mp4Path],
              { encoding: 'utf8', timeout: 8000 }
            );
            const probed = JSON.parse(out);
            durSec = Math.round(Number(probed?.format?.duration || 0));
            const streams = Array.isArray(probed?.streams) ? probed.streams : [];
            const hasV = streams.some((s: any) => s.codec_type === 'video');
            const hasA = streams.some((s: any) => s.codec_type === 'audio');
            validStreams = durSec > 10 && hasV && hasA;
          }
          if (validStreams) {
            const videoUrl = `/api/videos/media/${lessonId}/${latestMp4}`;
            const subtitleUrl = vttFile ? `/api/videos/media/${lessonId}/${vttFile}` : null;
            const thumbnailUrl = thumbFile ? `/api/videos/media/${lessonId}/${thumbFile}` : null;

            if (!rec.script) {
              const part = CURRICULUM_PARTS.find((p) => p.id === lesson.partId);
              const chapter = lesson.chapterId ? CURRICULUM_CHAPTERS.find((c) => c.id === lesson.chapterId) : null;
              const composed = composeOfflineLessonScript(
                lesson,
                part?.title || 'Chương trình Địa lí 10',
                chapter?.title || 'Phần mở đầu chương trình'
              );
              composed.targetDurationSeconds = durSec;
              if (vttFile) {
                try {
                  composed.webVttContent = fs.readFileSync(path.join(lessonDir, vttFile), 'utf8');
                } catch { /* ignore */ }
              }
              rec.script = composed;
            }

            const shouldRestorePublished = Boolean(persisted?.isApproved && persisted?.isPublished);
            const shouldRestoreApprovedHidden = Boolean(persisted?.isApproved && !persisted?.isPublished);

            rec.status = 'completed';
            rec.currentStep = 'ready_for_approval';
            rec.progressPercent = 100;
            rec.version = ver;
            rec.durationSeconds = durSec;
            rec.fileSizeBytes = stat.size;
            rec.videoUrl = videoUrl;
            rec.subtitleUrl = subtitleUrl;
            rec.thumbnailUrl = thumbnailUrl;
            if (shouldRestorePublished) {
              rec.draftVideo = null;
              rec.isApproved = true;
              rec.isPublished = true;
              rec.approvedAt = persisted.approvedAt || new Date().toISOString();
              rec.approvedBy = persisted.approvedBy || 'Bùi Thị Hồng Hạnh';
              rec.stepMessage = `Đã duyệt & xuất bản công khai cho học sinh (v${ver}).`;
            } else if (shouldRestoreApprovedHidden) {
              rec.draftVideo = null;
              rec.isApproved = true;
              rec.isPublished = false;
              rec.approvedAt = persisted.approvedAt || new Date().toISOString();
              rec.approvedBy = persisted.approvedBy || 'Bùi Thị Hồng Hạnh';
              rec.stepMessage = 'Đã tạm ẩn khỏi giao diện học sinh.';
            } else {
              rec.draftVideo = {
                version: ver,
                videoUrl,
                subtitleUrl,
                thumbnailUrl,
                durationSeconds: durSec,
                fileSizeBytes: stat.size,
                createdAt: stat.mtimeMs,
              };
              rec.isApproved = false;
              rec.isPublished = false;
              rec.stepMessage = `Đã sản xuất xong video ngoại tuyến v${ver} (${Math.floor(durSec / 60)}p ${durSec % 60}s). Chờ giáo viên xem trước & Duyệt xuất bản.`;
            }
            rec.errorCode = null;
            rec.errorMessage = null;
            rec.createdAt = rec.createdAt || stat.mtimeMs;
            rec.updatedAt = Date.now();
            changed = true;
          }
        } catch (err) {
          console.warn(`[VideoService] Failed reconciling ${lessonId}:`, err);
        }
      }
    } else if (rec.status === 'completed') {
      const isExternal = Boolean(rec.externalVideo?.normalizedUrl || (rec.videoUrl && /^https?:\/\//i.test(rec.videoUrl)));
      if (!isExternal) {
        // Verify local MP4 still exists on disk; never pretend a missing local MP4 is published
        const expectedFile = rec.videoUrl ? path.basename(rec.videoUrl) : null;
        let actualMp4File =
          expectedFile && fs.existsSync(path.join(lessonDir, expectedFile))
            ? expectedFile
            : findLatestLessonAsset(lessonDir, 'lecture', '.mp4');

        if (!actualMp4File) {
          rec.status = rec.script ? 'script_ready' : 'not_created';
          rec.currentStep = 'idle';
          rec.progressPercent = 0;
          rec.isPublished = false;
          rec.videoUrl = null;
          rec.subtitleUrl = null;
          rec.thumbnailUrl = null;
          rec.draftVideo = null;
          rec.fileSizeBytes = null;
          rec.errorCode = 'LOCAL_MEDIA_MISSING';
          rec.errorMessage = null;
          rec.stepMessage = persisted?.isPublished
            ? 'Đã được cô duyệt xuất bản trước đó nhưng tệp MP4 nội bộ bị dọn khi máy chủ tạm nghỉ — hệ thống sẽ tự khôi phục khi mở bài hoặc cô bấm khôi phục.'
            : 'Tệp MP4 nội bộ không còn trên máy chủ. Hãy bấm tạo lại video hoặc gắn link Google Drive bền vững.';
          rec.updatedAt = Date.now();
          changed = true;
          continue;
        }

        const expectedUrl = `/api/videos/media/${lessonId}/${actualMp4File}`;
        if (rec.videoUrl !== expectedUrl) {
          rec.videoUrl = expectedUrl;
          changed = true;
        }
      }

      if (fs.existsSync(lessonDir)) {
        // Fix stale subtitle/thumbnail pointers if exact version file is missing on disk while a fallback exists
        const fixUrlIfMissing = (url: string | null, prefix: string, ext: string): string | null => {
          if (!url) return null;
          if (/^https?:\/\//i.test(url)) return url;
          const fname = path.basename(url);
          if (fs.existsSync(path.join(lessonDir, fname))) return url;
          const fallback = findLatestLessonAsset(lessonDir, prefix, ext);
          return fallback ? `/api/videos/media/${lessonId}/${fallback}` : null;
        };
        const fixedSub = fixUrlIfMissing(rec.subtitleUrl, 'subtitles', '.vtt');
        const fixedThumb = fixUrlIfMissing(rec.thumbnailUrl, 'thumb', '.png');
        if (fixedSub !== rec.subtitleUrl || fixedThumb !== rec.thumbnailUrl) {
          rec.subtitleUrl = fixedSub;
          rec.thumbnailUrl = fixedThumb;
          if (rec.draftVideo) {
            rec.draftVideo.subtitleUrl = fixUrlIfMissing(rec.draftVideo.subtitleUrl, 'subtitles', '.vtt');
            rec.draftVideo.thumbnailUrl = fixUrlIfMissing(rec.draftVideo.thumbnailUrl, 'thumb', '.png');
          }
          changed = true;
        }
      }

      // Restore persisted approval if snapshot reverted this record to unapproved
      if (!rec.approvedAt && !rec.isApproved && persisted?.isApproved && persisted?.isPublished) {
        rec.draftVideo = null;
        rec.isApproved = true;
        rec.isPublished = true;
        rec.approvedAt = persisted.approvedAt || new Date().toISOString();
        rec.approvedBy = persisted.approvedBy || 'Bùi Thị Hồng Hạnh';
        rec.stepMessage = `Đã duyệt & xuất bản công khai cho học sinh (v${rec.version || 1}).`;
        rec.updatedAt = Date.now();
        changed = true;
      }
    }
  }

  if (store.queue.isRunning) {
    store.queue.isRunning = false;
    store.queue.isPaused = store.queue.pendingLessonIds.length > 0;
    store.queue.activeLessonId = null;
    store.queue.updatedAt = Date.now();
    changed = true;
  }
  if (changed) saveVideoStore(store);
}

recoverInterruptedJobsOnBoot();

export function getVideoCapabilities(): VideoCapabilities {
  const ffmpegAvailable = getBinaryAvailability('ffmpeg');
  const ffprobeAvailable = getBinaryAvailability('ffprobe');
  const offline = getOfflineEngineStatus();

  const missingRequirements: string[] = [];
  if (!offline.piperAvailable || !offline.piperVoiceAvailable) {
    missingRequirements.push(
      'Thiếu Piper TTS hoặc mô hình giọng đọc tiếng Việt (/tmp/diali10-tools/piper/voices/vi_VN-vais1000-medium.onnx).'
    );
  }
  if (!offline.resvgAvailable || !offline.fontsAvailable) {
    missingRequirements.push('Thiếu thư viện @resvg/resvg-js hoặc phông chữ Noto Sans tiếng Việt trên máy chủ.');
  }
  if (!ffmpegAvailable || !ffprobeAvailable) {
    missingRequirements.push('Thiếu công cụ FFmpeg / FFprobe trên máy chủ để dựng chuyển động và xuất tệp .mp4.');
  }

  return {
    geminiConfigured: true, // Backward compatible UI flag: offline engine replaces Gemini paid dependency
    offlineMode: true,
    piperAvailable: offline.piperAvailable && offline.piperVoiceAvailable,
    resvgAvailable: offline.resvgAvailable && offline.fontsAvailable,
    zeroCostOffline: true,
    ffmpegAvailable,
    ffprobeAvailable,
    sdkPackageVersion: 'offline-piper-resvg-ffmpeg',
    models: {
      script: MODEL_SCRIPT,
      tts: MODEL_TTS,
      image: MODEL_IMAGE,
      video: MODEL_VIDEO,
    },
    paidTierRequiredForMedia: false,
    missingRequirements,
    storageDir: 'data/videos',
  };
}

function classifyPipelineError(err: any): { code: string; message: string; httpStatus: number } {
  if (err instanceof VideoPipelineError) {
    return { code: err.code, message: err.message, httpStatus: err.httpStatus };
  }
  const rawMsg = String(err?.message || err || 'Lỗi không xác định từ bộ dựng video ngoại tuyến');
  return {
    code: 'OFFLINE_VIDEO_PIPELINE_ERROR',
    message: rawMsg,
    httpStatus: 500,
  };
}

function formatVttTime(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const rem = sec % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}.000`;
}

export function buildWebVttFromScenes(scenes: VideoScenePlan[]): string {
  const lines: string[] = ['WEBVTT', ''];
  let cursor = 0;
  scenes.forEach((scene, index) => {
    const duration = Math.max(8, Math.round(scene.durationSeconds || 30));
    const text = (scene.subtitleText || scene.narration || scene.title).trim();
    const start = cursor;
    const end = cursor + duration;
    lines.push(`${index + 1}`);
    lines.push(`${formatVttTime(start)} --> ${formatVttTime(end)}`);
    lines.push(text);
    lines.push('');
    cursor = end;
  });
  return lines.join('\n');
}

function getLessonContextOrThrow(lessonId: string): {
  lesson: Lesson;
  partTitle: string;
  chapterTitle: string;
} {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) {
    throw new VideoPipelineError('LESSON_NOT_FOUND', `Không tìm thấy bài học ${lessonId} trong chương trình 40 bài.`, 404);
  }
  const part = CURRICULUM_PARTS.find((p) => p.id === lesson.partId);
  const chapter = lesson.chapterId ? CURRICULUM_CHAPTERS.find((c) => c.id === lesson.chapterId) : null;
  return {
    lesson,
    partTitle: part?.title || 'Chương trình Địa lí 10',
    chapterTitle: chapter?.title || 'Phần mở đầu chương trình',
  };
}

function updateLessonProgress(
  lessonId: string,
  patch: Partial<LessonVideoRecord>
): LessonVideoRecord {
  const store = loadVideoStore();
  const current = store.records[lessonId];
  const updated: LessonVideoRecord = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };
  store.records[lessonId] = updated;
  saveVideoStore(store);
  return updated;
}

export function listTeacherVideoRecords(): {
  records: LessonVideoRecord[];
  queue: VideoQueueState;
  capabilities: VideoCapabilities;
  chapters: typeof CURRICULUM_CHAPTERS;
  parts: typeof CURRICULUM_PARTS;
} {
  const store = loadVideoStore();
  const persistedApprovals = readAllPersistedApprovals();
  let mutated = false;

  const records = LESSONS.map((l) => {
    const rec = store.records[l.id];
    const isExternal = Boolean(rec.externalVideo?.normalizedUrl || (rec.videoUrl && /^https?:\/\//i.test(rec.videoUrl)));
    if (rec.status === 'completed' && !isExternal) {
      const lessonDir = path.join(VIDEOS_ROOT_DIR, l.id);
      const fname = rec.videoUrl ? path.basename(rec.videoUrl) : null;
      const exists = Boolean(fname && fs.existsSync(path.join(lessonDir, fname)));
      if (!exists) {
        const fallbackMp4 = findLatestLessonAsset(lessonDir, 'lecture', '.mp4');
        if (fallbackMp4) {
          rec.videoUrl = `/api/videos/media/${l.id}/${fallbackMp4}`;
          mutated = true;
        } else {
          const persisted = persistedApprovals[l.id];
          rec.status = rec.script ? 'script_ready' : 'not_created';
          rec.currentStep = 'idle';
          rec.progressPercent = 0;
          rec.isPublished = false;
          rec.videoUrl = null;
          rec.subtitleUrl = null;
          rec.thumbnailUrl = null;
          rec.draftVideo = null;
          rec.fileSizeBytes = null;
          rec.errorCode = 'LOCAL_MEDIA_MISSING';
          rec.stepMessage = persisted?.isPublished
            ? 'Đã được cô duyệt xuất bản trước đó nhưng tệp MP4 nội bộ bị dọn khi máy chủ tạm nghỉ — hệ thống sẽ tự khôi phục khi mở bài hoặc cô bấm khôi phục.'
            : 'Tệp MP4 nội bộ không còn trên máy chủ.';
          mutated = true;
        }
      }
    }
    return rec;
  });

  if (mutated) {
    saveVideoStore(store);
  }

  return {
    records,
    queue: store.queue,
    capabilities: getVideoCapabilities(),
    chapters: CURRICULUM_CHAPTERS,
    parts: CURRICULUM_PARTS,
  };
}

export function getTeacherLessonVideo(lessonId: string): LessonVideoRecord {
  getLessonContextOrThrow(lessonId);
  const store = loadVideoStore();
  return store.records[lessonId];
}

export async function generateLessonScript(lessonId: string): Promise<LessonVideoRecord> {
  const { lesson, partTitle, chapterTitle } = getLessonContextOrThrow(lessonId);

  updateLessonProgress(lessonId, {
    status: 'processing',
    currentStep: 'reading_lesson',
    stepMessage: 'Đọc dữ liệu bài học từ chương trình chuẩn 40 bài SGK Địa lí 10...',
    progressPercent: 15,
    errorCode: null,
    errorMessage: null,
  });

  try {
    updateLessonProgress(lessonId, {
      currentStep: 'generating_script',
      stepMessage: 'Tự động biên soạn kịch bản sư phạm 4–6 phút ngoại tuyến (0 đồng)...',
      progressPercent: 60,
    });

    const script = composeOfflineLessonScript(lesson, partTitle, chapterTitle);
    const totalSec = script.targetDurationSeconds;

    const lessonDir = path.join(VIDEOS_ROOT_DIR, lessonId);
    if (!fs.existsSync(lessonDir)) fs.mkdirSync(lessonDir, { recursive: true });

    const rec = loadVideoStore().records[lessonId];
    const nextVersion = (rec.version || 0) + 1;
    const vttFilename = `subtitles-v${nextVersion}.vtt`;
    fs.writeFileSync(path.join(lessonDir, vttFilename), script.webVttContent, 'utf-8');

    const finalRec = updateLessonProgress(lessonId, {
      status: rec.draftVideo || rec.videoUrl ? rec.status : 'script_ready',
      currentStep: 'splitting_scenes',
      stepMessage: `Đã biên soạn xong kịch bản sư phạm ${script.scenes.length} cảnh (${Math.floor(totalSec / 60)}p ${totalSec % 60}s). Sẵn sàng tạo video ngoại tuyến.`,
      progressPercent: 100,
      script,
      subtitleUrl: rec.isPublished ? rec.subtitleUrl : `/api/videos/media/${lessonId}/${vttFilename}`,
      errorCode: null,
      errorMessage: null,
    });
    return finalRec;
  } catch (err: any) {
    const classified = classifyPipelineError(err);
    updateLessonProgress(lessonId, {
      status: 'error',
      currentStep: 'failed',
      stepMessage: 'Lỗi khi biên soạn kịch bản bài giảng',
      progressPercent: 0,
      errorCode: classified.code,
      errorMessage: classified.message,
    });
    throw new VideoPipelineError(classified.code, classified.message, classified.httpStatus);
  }
}

export function updateLessonScriptManual(
  lessonId: string,
  payload: {
    title?: string;
    learningObjectivesSummary?: string;
    voiceStyle?: string;
    scenes: VideoScenePlan[];
  }
): LessonVideoRecord {
  const { lesson } = getLessonContextOrThrow(lessonId);
  const store = loadVideoStore();
  const current = store.records[lessonId];

  if (!Array.isArray(payload.scenes) || payload.scenes.length === 0) {
    throw new VideoPipelineError('INVALID_SCRIPT', 'Kịch bản phải có ít nhất 1 cảnh giảng.', 400);
  }

  const normalizedScenes: VideoScenePlan[] = payload.scenes.map((s, idx) => ({
    ...s,
    sceneNumber: idx + 1,
    durationSeconds: Math.max(10, Math.min(180, Number(s.durationSeconds) || 40)),
    narration: String(s.narration || '').trim(),
    subtitleText: String(s.subtitleText || s.narration || '').trim(),
    onScreenKeywords: Array.isArray(s.onScreenKeywords) ? s.onScreenKeywords.map(String) : [],
    visualPrompt: String(s.visualPrompt || lesson.visualData.description),
  }));

  const targetDurationSeconds = normalizedScenes.reduce((sum, s) => sum + s.durationSeconds, 0);
  const fullNarration = normalizedScenes.map((s) => `[${s.title}]\n${s.narration}`).join('\n\n');
  const webVttContent = buildPhraseSyncedWebVtt(
    normalizedScenes.map((s) => ({ scene: s, startSec: 0, durationSec: s.durationSeconds })),
    true
  );

  const script: LessonVideoScript = {
    lessonId,
    title: payload.title?.trim() || current.script?.title || lesson.title,
    learningObjectivesSummary:
      payload.learningObjectivesSummary?.trim() || current.script?.learningObjectivesSummary || lesson.subtitle,
    targetDurationSeconds,
    voiceStyle: payload.voiceStyle?.trim() || current.script?.voiceStyle || 'Piper TTS tiếng Việt chuẩn sư phạm',
    fullNarration,
    webVttContent,
    scenes: normalizedScenes,
    updatedAt: Date.now(),
    generatedBy: 'teacher_edited',
  };

  const lessonDir = path.join(VIDEOS_ROOT_DIR, lessonId);
  if (!fs.existsSync(lessonDir)) fs.mkdirSync(lessonDir, { recursive: true });
  const vttFile = `subtitles-edited.vtt`;
  fs.writeFileSync(path.join(lessonDir, vttFile), webVttContent, 'utf-8');

  current.script = script;
  if (current.status === 'not_created' || current.status === 'error') {
    current.status = 'script_ready';
    current.errorCode = null;
    current.errorMessage = null;
  }
  current.stepMessage = 'Giáo viên đã cập nhật kịch bản và phụ đề.';
  current.updatedAt = Date.now();
  store.records[lessonId] = current;
  saveVideoStore(store);
  return current;
}

async function probeDurationSeconds(filePath: string): Promise<number> {
  const ffprobe = getBinaryPath('ffprobe');
  const { stdout } = await execFileAsync(ffprobe, [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath,
  ]);
  const val = parseFloat(stdout.trim());
  return Number.isFinite(val) && val > 0 ? val : 10;
}

export async function generateLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
  const { lesson, partTitle, chapterTitle } = getLessonContextOrThrow(lessonId);
  await ensurePiperInstalled();
  const caps = getVideoCapabilities();

  if (caps.missingRequirements.length > 0) {
    const msg = caps.missingRequirements.join(' ');
    updateLessonProgress(lessonId, {
      status: 'error',
      currentStep: 'failed',
      stepMessage: 'Thiếu công cụ sản xuất video ngoại tuyến trên máy chủ',
      progressPercent: 0,
      errorCode: 'OFFLINE_TOOLS_MISSING',
      errorMessage: msg,
    });
    throw new VideoPipelineError('OFFLINE_TOOLS_MISSING', msg, 500);
  }

  let record = loadVideoStore().records[lessonId];
  if (!record.script) {
    record = await generateLessonScript(lessonId);
  }

  const script = record.script!;
  const lessonDir = path.join(VIDEOS_ROOT_DIR, lessonId);
  if (!fs.existsSync(lessonDir)) fs.mkdirSync(lessonDir, { recursive: true });

  const nextVersion = (record.version || 0) + 1;
  const workDir = path.join(lessonDir, `build-v${nextVersion}`);
  fs.mkdirSync(workDir, { recursive: true });
  cleanStaleTempFilesInDir(workDir);
  cleanStaleTempFilesInDir(lessonDir);

  const ffmpeg = getBinaryPath('ffmpeg');

  try {
    updateLessonProgress(lessonId, {
      status: 'processing',
      currentStep: 'creating_visuals',
      stepMessage: `Đang kiểm tra & dựng ${script.scenes.length} cảnh (bảo toàn các tệp hợp lệ sẵn có)...`,
      progressPercent: 10,
      errorCode: null,
      errorMessage: null,
    });

    const sceneMp4Paths: string[] = [];
    const updatedScenes: VideoScenePlan[] = [...script.scenes];
    const timedScenes: Array<{ scene: VideoScenePlan; startSec: number; durationSec: number }> = [];
    let thumbnailFilename: string | null = null;
    let cumulativeStartSec = 0;

    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const wavPath = path.join(workDir, `scene-${i + 1}.wav`);
      const imgPath = path.join(workDir, `scene-${i + 1}.png`);
      const sceneOutMp4 = path.join(workDir, `scene-${i + 1}.mp4`);

      // 1. Preserve valid slide PNG or render new 1316x740 PNG
      const pngValid = isValidPngFile(imgPath);
      if (!pngValid) {
        if (fs.existsSync(imgPath)) {
          try { fs.unlinkSync(imgPath); } catch { /* ignore */ }
        }
        renderSceneSlidePng(lesson, scene, i, script.scenes.length, partTitle, chapterTitle, imgPath);
      }

      if (i === 0) {
        thumbnailFilename = `thumb-v${nextVersion}.png`;
        const thumbTarget = path.join(lessonDir, thumbnailFilename);
        if (!isValidPngFile(thumbTarget)) {
          fs.copyFileSync(imgPath, thumbTarget);
        }
      }

      // 2. Preserve valid Piper WAV or synthesize missing/corrupt WAV
      let audioDur = await probeValidWavDuration(wavPath);
      if (!audioDur) {
        if (fs.existsSync(wavPath)) {
          try { fs.unlinkSync(wavPath); } catch { /* ignore */ }
        }
        updateLessonProgress(lessonId, {
          status: 'processing',
          currentStep: 'synthesizing_audio',
          stepMessage: `Cảnh ${i + 1}/${script.scenes.length}: Tổng hợp giọng đọc tiếng Việt Piper TTS...`,
          progressPercent: 12 + Math.round((i / script.scenes.length) * 75),
        });
        audioDur = await synthesizePiperWav(scene.narration, wavPath);
      }

      // 3. Preserve valid scene MP4 or delete corrupt MP4 and render atomically via .tmp.mp4
      let mp4Check = await probeValidMp4Duration(sceneOutMp4, false);
      if (!mp4Check.valid) {
        if (fs.existsSync(sceneOutMp4)) {
          try { fs.unlinkSync(sceneOutMp4); } catch { /* ignore */ }
        }
        updateLessonProgress(lessonId, {
          status: 'processing',
          currentStep: 'creating_visuals',
          stepMessage: `Cảnh ${i + 1}/${script.scenes.length}: Đang dựng video phân cảnh 720p (chỉ 1 tiến trình FFmpeg)...`,
          progressPercent: 12 + Math.round(((i + 0.45) / script.scenes.length) * 75),
        });
        await renderAnimatedSceneMp4(imgPath, wavPath, audioDur, i, sceneOutMp4);
        mp4Check = await probeValidMp4Duration(sceneOutMp4, false);
        if (!mp4Check.valid) {
          throw new VideoPipelineError(
            'SCENE_MP4_INVALID',
            `Cảnh ${i + 1} xuất ra không hợp lệ: ${mp4Check.error || 'unknown'}`,
            500
          );
        }
      }

      const realSceneDur = mp4Check.durationSeconds;
      const updatedScene: VideoScenePlan = {
        ...scene,
        durationSeconds: Math.round(realSceneDur),
        assetImagePath: imgPath,
        assetAudioPath: wavPath,
      };
      updatedScenes[i] = updatedScene;
      timedScenes.push({
        scene: updatedScene,
        startSec: cumulativeStartSec,
        durationSec: realSceneDur,
      });
      cumulativeStartSec += realSceneDur;
      sceneMp4Paths.push(sceneOutMp4);

      // Persist scene-level checkpoint immediately so any interruption keeps full resume state
      const pctAfterScene = 12 + Math.round(((i + 1) / script.scenes.length) * 75);
      updateLessonProgress(lessonId, {
        status: 'processing',
        currentStep: 'creating_visuals',
        stepMessage: `Đã hoàn tất cảnh ${i + 1}/${script.scenes.length} (${Math.round(realSceneDur)}s). Tiến độ đã lưu an toàn.`,
        progressPercent: pctAfterScene,
        script: {
          ...script,
          scenes: updatedScenes,
          updatedAt: Date.now(),
        },
      });
    }

    updateLessonProgress(lessonId, {
      status: 'processing',
      currentStep: 'compositing_video',
      stepMessage: 'Đang ghép 8 phân cảnh thành tệp .mp4 hoàn chỉnh & kiểm tra giải mã FFprobe/FFmpeg...',
      progressPercent: 92,
    });

    const concatListFile = path.join(workDir, 'concat.txt');
    fs.writeFileSync(
      concatListFile,
      sceneMp4Paths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'),
      'utf-8'
    );

    const outVideoFilename = `lecture-v${nextVersion}.mp4`;
    const outVttFilename = `subtitles-v${nextVersion}.vtt`;
    const outVideoPath = path.join(lessonDir, outVideoFilename);
    const outTmpVideoPath = `${outVideoPath}.tmp.mp4`;
    const outVttPath = path.join(lessonDir, outVttFilename);

    if (fs.existsSync(outTmpVideoPath)) {
      try { fs.unlinkSync(outTmpVideoPath); } catch { /* ignore */ }
    }

    const exactVtt = buildPhraseSyncedWebVtt(timedScenes, false);
    fs.writeFileSync(outVttPath, exactVtt, 'utf-8');

    await execFileAsync(ffmpeg, [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatListFile,
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      outTmpVideoPath,
    ]);

    const finalCheck = await probeValidMp4Duration(outTmpVideoPath, true);
    if (!finalCheck.valid) {
      try { if (fs.existsSync(outTmpVideoPath)) fs.unlinkSync(outTmpVideoPath); } catch { /* ignore */ }
      throw new VideoPipelineError(
        'INVALID_OUTPUT_MP4',
        `Tệp MP4 ghép cuối không vượt qua kiểm tra giải mã FFmpeg/FFprobe: ${finalCheck.error || 'unknown'}`,
        500
      );
    }

    fs.renameSync(outTmpVideoPath, outVideoPath);
    const stat = fs.statSync(outVideoPath);
    const realDuration = Math.round(finalCheck.durationSeconds);

    const draftMeta = {
      version: nextVersion,
      videoUrl: `/api/videos/media/${lessonId}/${outVideoFilename}`,
      subtitleUrl: `/api/videos/media/${lessonId}/${outVttFilename}`,
      thumbnailUrl: thumbnailFilename ? `/api/videos/media/${lessonId}/${thumbnailFilename}` : null,
      durationSeconds: realDuration,
      fileSizeBytes: stat.size,
      createdAt: Date.now(),
    };

    const syncedScript: LessonVideoScript = {
      ...script,
      targetDurationSeconds: realDuration,
      webVttContent: exactVtt,
      scenes: updatedScenes,
      updatedAt: Date.now(),
    };

    // Clean temporary build files ONLY after final lecture-vX.mp4 passed full verification
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }

    // Preserve already published live videoUrl until teacher explicitly approves replacing it;
    // If this lesson was previously approved & published (e.g. local MP4 was evicted on container sleep),
    // automatically restore its published status so students can watch immediately!
    const currentStoreRecord = loadVideoStore().records[lessonId];
    const hasLiveExistingPublished = Boolean(
      currentStoreRecord.isPublished &&
        currentStoreRecord.videoUrl &&
        (/^https?:\/\//i.test(currentStoreRecord.videoUrl) ||
          fs.existsSync(path.join(VIDEOS_ROOT_DIR, lessonId, path.basename(currentStoreRecord.videoUrl))))
    );
    const persistedApproval = readAllPersistedApprovals()[lessonId];
    const shouldAutoRestorePublished = Boolean(
      !hasLiveExistingPublished && persistedApproval?.isApproved && persistedApproval?.isPublished
    );

    const completedRecord = updateLessonProgress(lessonId, {
      status: 'completed',
      currentStep: 'ready_for_approval',
      stepMessage: hasLiveExistingPublished
        ? `Đã tạo phiên bản mới v${nextVersion}. Chờ giáo viên xem trước và bấm "Duyệt & Thay thế video cũ".`
        : shouldAutoRestorePublished
        ? `Đã khôi phục video ngoại tuyến v${nextVersion} (${Math.floor(realDuration / 60)}p ${realDuration % 60}s) & tự động giữ nguyên trạng thái Đã xuất bản.`
        : `Đã sản xuất xong video ngoại tuyến v${nextVersion} (${Math.floor(realDuration / 60)}p ${realDuration % 60}s). Chờ giáo viên xem trước & Duyệt xuất bản.`,
      progressPercent: 100,
      version: nextVersion,
      draftVideo: shouldAutoRestorePublished ? null : draftMeta,
      isApproved: shouldAutoRestorePublished ? true : currentStoreRecord.isApproved,
      isPublished: shouldAutoRestorePublished ? true : currentStoreRecord.isPublished,
      approvedAt: shouldAutoRestorePublished
        ? persistedApproval.approvedAt || new Date().toISOString()
        : currentStoreRecord.approvedAt,
      approvedBy: shouldAutoRestorePublished
        ? persistedApproval.approvedBy || 'Bùi Thị Hồng Hạnh'
        : currentStoreRecord.approvedBy,
      videoUrl: hasLiveExistingPublished ? currentStoreRecord.videoUrl : draftMeta.videoUrl,
      subtitleUrl: hasLiveExistingPublished ? currentStoreRecord.subtitleUrl : draftMeta.subtitleUrl,
      thumbnailUrl: hasLiveExistingPublished ? currentStoreRecord.thumbnailUrl : draftMeta.thumbnailUrl,
      durationSeconds: hasLiveExistingPublished ? currentStoreRecord.durationSeconds : realDuration,
      fileSizeBytes: hasLiveExistingPublished ? currentStoreRecord.fileSizeBytes : stat.size,
      script: syncedScript,
      errorCode: null,
      errorMessage: null,
      createdAt: currentStoreRecord.createdAt || Date.now(),
    });

    if (shouldAutoRestorePublished) {
      writePersistedApprovals(loadVideoStore().records);
    }

    return completedRecord;
  } catch (err: any) {
    // NEVER wipe workDir on error: preserve valid cached scene WAVs, PNGs, and MP4s for resume!
    cleanStaleTempFilesInDir(workDir);
    const classified = classifyPipelineError(err);
    updateLessonProgress(lessonId, {
      status: 'error',
      currentStep: 'failed',
      stepMessage: `Tạm dừng ở bài ${lesson.number} (${classified.code}) — đã bảo toàn các cảnh hợp lệ để tiếp tục.`,
      progressPercent: 0,
      errorCode: classified.code,
      errorMessage: classified.message,
    });
    throw new VideoPipelineError(classified.code, classified.message, classified.httpStatus);
  }
}

export function approveAndPublishVideo(lessonId: string, teacherName: string): LessonVideoRecord {
  getLessonContextOrThrow(lessonId);
  const store = loadVideoStore();
  const rec = store.records[lessonId];

  const candidate = rec.draftVideo || (rec.videoUrl && rec.status === 'completed'
    ? {
        version: rec.version || 1,
        videoUrl: rec.videoUrl,
        subtitleUrl: rec.subtitleUrl,
        thumbnailUrl: rec.thumbnailUrl,
        durationSeconds: rec.durationSeconds || 0,
        fileSizeBytes: rec.fileSizeBytes || 0,
        createdAt: rec.createdAt || Date.now(),
      }
    : null);

  if (!candidate) {
    throw new VideoPipelineError(
      'NO_VIDEO_TO_APPROVE',
      'Chưa có tệp video thực tế hoàn chỉnh để duyệt xuất bản cho bài học này.',
      400
    );
  }

  // Verify local file exists on disk unless candidate points to a persistent external URL
  const isExternalCandidate = /^https?:\/\//i.test(candidate.videoUrl);
  if (!isExternalCandidate) {
    const filename = path.basename(candidate.videoUrl);
    const absPath = path.join(VIDEOS_ROOT_DIR, lessonId, filename);
    if (!fs.existsSync(absPath)) {
      throw new VideoPipelineError(
        'VIDEO_FILE_NOT_ON_DISK',
        'Tệp video chưa tồn tại trên đĩa máy chủ. Vui lòng tạo lại video thực tế trước khi duyệt.',
        400
      );
    }
  }

  rec.version = candidate.version || rec.version || 1;
  rec.videoUrl = candidate.videoUrl;
  rec.subtitleUrl = candidate.subtitleUrl;
  rec.thumbnailUrl = candidate.thumbnailUrl;
  rec.durationSeconds = candidate.durationSeconds;
  rec.fileSizeBytes = candidate.fileSizeBytes;
  rec.draftVideo = null;
  rec.isApproved = true;
  rec.isPublished = true;
  rec.approvedAt = new Date().toISOString();
  rec.approvedBy = teacherName || 'Giáo viên bộ môn';
  rec.status = 'completed';
  rec.stepMessage = isExternalCandidate && rec.externalVideo
    ? `Đã duyệt & xuất bản từ kho lưu trữ (${getExternalProviderLabel(rec.externalVideo.provider)}).`
    : `Đã duyệt & xuất bản công khai cho học sinh (v${candidate.version}).`;
  rec.updatedAt = Date.now();

  store.records[lessonId] = rec;
  saveVideoStore(store);
  writePersistedApprovals(store.records);
  if (rec.externalVideo) {
    syncExternalLinksFileFromRecords(store.records);
  }
  return rec;
}

export function approveAllCompletedVideos(
  teacherName: string,
  lessonIds?: string[]
): {
  approvedCount: number;
  skippedCount: number;
  approvedLessonIds: string[];
  records: LessonVideoRecord[];
  queue: VideoQueueState;
} {
  const store = loadVideoStore();
  const targetIds =
    Array.isArray(lessonIds) && lessonIds.length > 0
      ? lessonIds.filter((id) => Boolean(store.records[id]))
      : LESSONS.map((l) => l.id);

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const approvedLessonIds: string[] = [];
  let skippedCount = 0;

  for (const lessonId of targetIds) {
    const rec = store.records[lessonId];
    if (!rec) {
      skippedCount += 1;
      continue;
    }

    if (rec.isApproved && rec.isPublished && !rec.draftVideo) {
      skippedCount += 1;
      continue;
    }

    const candidate =
      rec.draftVideo ||
      (rec.videoUrl && rec.status === 'completed'
        ? {
            version: rec.version || 1,
            videoUrl: rec.videoUrl,
            subtitleUrl: rec.subtitleUrl,
            thumbnailUrl: rec.thumbnailUrl,
            durationSeconds: rec.durationSeconds || 0,
            fileSizeBytes: rec.fileSizeBytes || 0,
            createdAt: rec.createdAt || nowMs,
          }
        : null);

    if (!candidate) {
      skippedCount += 1;
      continue;
    }

    const isExternalCandidate = /^https?:\/\//i.test(candidate.videoUrl);
    if (!isExternalCandidate) {
      const filename = path.basename(candidate.videoUrl);
      const absPath = path.join(VIDEOS_ROOT_DIR, lessonId, filename);
      if (!fs.existsSync(absPath)) {
        skippedCount += 1;
        continue;
      }
    }

    rec.version = candidate.version || rec.version || 1;
    rec.videoUrl = candidate.videoUrl;
    rec.subtitleUrl = candidate.subtitleUrl;
    rec.thumbnailUrl = candidate.thumbnailUrl;
    rec.durationSeconds = candidate.durationSeconds;
    rec.fileSizeBytes = candidate.fileSizeBytes;
    rec.draftVideo = null;
    rec.isApproved = true;
    rec.isPublished = true;
    rec.approvedAt = nowIso;
    rec.approvedBy = teacherName || 'Giáo viên bộ môn';
    rec.status = 'completed';
    rec.currentStep = 'ready_for_approval';
    rec.stepMessage = isExternalCandidate && rec.externalVideo
      ? `Đã duyệt & xuất bản từ kho lưu trữ (${getExternalProviderLabel(rec.externalVideo.provider)}).`
      : `Đã duyệt & xuất bản công khai cho học sinh (v${rec.version}).`;
    rec.updatedAt = nowMs;

    store.records[lessonId] = rec;
    approvedLessonIds.push(lessonId);
  }

  if (approvedLessonIds.length > 0) {
    saveVideoStore(store);
    writePersistedApprovals(store.records);
    syncExternalLinksFileFromRecords(store.records);
  }

  return {
    approvedCount: approvedLessonIds.length,
    skippedCount,
    approvedLessonIds,
    records: LESSONS.map((l) => store.records[l.id]),
    queue: store.queue,
  };
}

function applyExternalLinkToRecord(
  rec: LessonVideoRecord,
  rawUrl: string,
  durationSeconds: number | null | undefined,
  note: string | undefined,
  autoApprove: boolean,
  teacherName: string
): LessonVideoRecord {
  const parsed = parseAndNormalizeExternalVideoUrl(rawUrl);
  if (!parsed.valid) {
    throw new VideoPipelineError('INVALID_EXTERNAL_URL', parsed.error, 400);
  }

  const nowMs = Date.now();
  const parsedDur = parseDurationInput(durationSeconds) ?? rec.durationSeconds ?? null;
  const nextVer = Math.max(1, rec.version || 1);

  const extLink: ExternalVideoLink = {
    rawUrl: parsed.rawUrl,
    normalizedUrl: parsed.normalizedUrl,
    provider: parsed.provider,
    playbackType: parsed.playbackType,
    durationSeconds: parsedDur,
    subtitleUrl: rec.subtitleUrl || null,
    note: note ? String(note).trim() : undefined,
    updatedAt: nowMs,
  };

  rec.externalVideo = extLink;
  rec.status = 'completed';
  rec.currentStep = 'ready_for_approval';
  rec.progressPercent = 100;
  rec.version = nextVer;
  rec.videoUrl = extLink.normalizedUrl;
  rec.durationSeconds = parsedDur;
  rec.errorCode = null;
  rec.errorMessage = null;
  rec.createdAt = rec.createdAt || nowMs;
  rec.updatedAt = nowMs;

  if (autoApprove) {
    rec.draftVideo = null;
    rec.isApproved = true;
    rec.isPublished = true;
    rec.approvedAt = new Date().toISOString();
    rec.approvedBy = teacherName || 'Giáo viên bộ môn';
    rec.stepMessage = `Đã gắn link bền vững (${getExternalProviderLabel(extLink.provider)}) & xuất bản cho học sinh.`;
  } else {
    rec.draftVideo = {
      version: nextVer,
      videoUrl: extLink.normalizedUrl,
      subtitleUrl: rec.subtitleUrl,
      thumbnailUrl: rec.thumbnailUrl,
      durationSeconds: parsedDur || 0,
      fileSizeBytes: rec.fileSizeBytes || 0,
      createdAt: nowMs,
    };
    rec.isApproved = false;
    rec.isPublished = false;
    rec.stepMessage = `Đã gắn link bền vững (${getExternalProviderLabel(extLink.provider)}) - Chờ giáo viên duyệt.`;
  }

  return rec;
}

export function setLessonExternalVideoLink(
  lessonId: string,
  payload: {
    rawUrl: string;
    durationSeconds?: number | string | null;
    note?: string;
    autoApprove?: boolean;
  },
  teacherName: string
): LessonVideoRecord {
  getLessonContextOrThrow(lessonId);
  const store = loadVideoStore();
  const parsedDur = parseDurationInput(payload.durationSeconds);
  const updated = applyExternalLinkToRecord(
    store.records[lessonId],
    payload.rawUrl,
    parsedDur,
    payload.note,
    Boolean(payload.autoApprove),
    teacherName
  );
  store.records[lessonId] = updated;
  saveVideoStore(store);
  writePersistedApprovals(store.records);
  syncExternalLinksFileFromRecords(store.records);
  return updated;
}

export function removeLessonExternalVideoLink(lessonId: string): LessonVideoRecord {
  const { lesson } = getLessonContextOrThrow(lessonId);
  const store = loadVideoStore();
  const rec = store.records[lessonId];
  rec.externalVideo = null;

  // Restore local disk MP4 if one exists; otherwise return cleanly to script_ready/not_created
  const lessonDir = path.join(VIDEOS_ROOT_DIR, lessonId);
  const latestMp4 = findLatestLessonAsset(lessonDir, 'lecture', '.mp4');
  if (latestMp4) {
    const verMatch = latestMp4.match(/lecture-v(\d+)\.mp4$/);
    const ver = verMatch ? Number(verMatch[1]) : 1;
    const vttFile = findLatestLessonAsset(lessonDir, 'subtitles', '.vtt');
    const thumbFile = findLatestLessonAsset(lessonDir, 'thumb', '.png');
    const stat = fs.statSync(path.join(lessonDir, latestMp4));
    const localUrl = `/api/videos/media/${lessonId}/${latestMp4}`;
    rec.status = 'completed';
    rec.currentStep = 'ready_for_approval';
    rec.progressPercent = 100;
    rec.version = ver;
    rec.videoUrl = localUrl;
    rec.subtitleUrl = vttFile ? `/api/videos/media/${lessonId}/${vttFile}` : null;
    rec.thumbnailUrl = thumbFile ? `/api/videos/media/${lessonId}/${thumbFile}` : null;
    rec.fileSizeBytes = stat.size;
    rec.draftVideo = {
      version: ver,
      videoUrl: localUrl,
      subtitleUrl: rec.subtitleUrl,
      thumbnailUrl: rec.thumbnailUrl,
      durationSeconds: rec.durationSeconds || 0,
      fileSizeBytes: stat.size,
      createdAt: stat.mtimeMs,
    };
    rec.isApproved = false;
    rec.isPublished = false;
    rec.stepMessage = `Đã gỡ link ngoài và khôi phục bản dựng nội bộ v${ver} (Chờ duyệt).`;
    rec.updatedAt = Date.now();
  } else {
    const preservedScript = rec.script;
    const fresh = createInitialRecord(lesson);
    fresh.script = preservedScript;
    if (preservedScript) {
      fresh.status = 'script_ready';
      fresh.currentStep = 'splitting_scenes';
      fresh.stepMessage = 'Đã gỡ link ngoài. Kịch bản AI vẫn được giữ nguyên.';
    }
    store.records[lessonId] = fresh;
  }

  saveVideoStore(store);
  writePersistedApprovals(store.records);
  syncExternalLinksFileFromRecords(store.records);
  return store.records[lessonId];
}

export function setBulkExternalVideoLinks(
  items: Array<{
    lessonId: string;
    rawUrl: string;
    durationSeconds?: number | string | null;
    note?: string;
  }>,
  autoApprove: boolean,
  teacherName: string
): {
  updatedCount: number;
  failedCount: number;
  errors: Array<{ lessonId: string; message: string }>;
  records: LessonVideoRecord[];
  queue: VideoQueueState;
} {
  if (!Array.isArray(items) || items.length === 0) {
    throw new VideoPipelineError('EMPTY_BULK_LINKS', 'Danh sách đường dẫn video đang trống.', 400);
  }
  const store = loadVideoStore();
  let updatedCount = 0;
  const errors: Array<{ lessonId: string; message: string }> = [];

  for (const item of items) {
    const lessonId = String(item?.lessonId || '').trim();
    if (!store.records[lessonId]) {
      errors.push({ lessonId: lessonId || 'unknown', message: `Mã bài học không hợp lệ (${lessonId}).` });
      continue;
    }
    try {
      const parsedDur = parseDurationInput(item.durationSeconds);
      store.records[lessonId] = applyExternalLinkToRecord(
        store.records[lessonId],
        item.rawUrl,
        parsedDur,
        item.note,
        autoApprove,
        teacherName
      );
      updatedCount += 1;
    } catch (err: any) {
      errors.push({
        lessonId,
        message: err?.message || 'Link video không hợp lệ.',
      });
    }
  }

  if (updatedCount > 0) {
    saveVideoStore(store);
    writePersistedApprovals(store.records);
    syncExternalLinksFileFromRecords(store.records);
  }

  return {
    updatedCount,
    failedCount: errors.length,
    errors,
    records: LESSONS.map((l) => store.records[l.id]),
    queue: store.queue,
  };
}

export function exportExternalVideoLinksBackup() {
  const store = loadVideoStore();
  const links: Record<
    string,
    {
      lessonId: string;
      lessonNumber: number;
      lessonTitle: string;
      rawUrl: string;
      normalizedUrl: string;
      provider: string;
      durationSeconds: number | null;
      note: string;
      isApproved: boolean;
      isPublished: boolean;
      updatedAt: number;
    }
  > = {};

  for (const lesson of LESSONS) {
    const rec = store.records[lesson.id];
    if (rec?.externalVideo?.normalizedUrl) {
      links[lesson.id] = {
        lessonId: lesson.id,
        lessonNumber: lesson.number,
        lessonTitle: lesson.title,
        rawUrl: rec.externalVideo.rawUrl,
        normalizedUrl: rec.externalVideo.normalizedUrl,
        provider: rec.externalVideo.provider,
        durationSeconds: rec.durationSeconds ?? rec.externalVideo.durationSeconds ?? null,
        note: rec.externalVideo.note || '',
        isApproved: rec.isApproved,
        isPublished: rec.isPublished,
        updatedAt: rec.externalVideo.updatedAt,
      };
    }
  }

  return {
    schema: 'diali10-external-video-links-v1',
    exportedAt: new Date().toISOString(),
    totalLinked: Object.keys(links).length,
    links,
  };
}

export function importExternalVideoLinksBackup(
  payload: any,
  restoreApprovalState: boolean,
  teacherName: string
): {
  importedCount: number;
  skippedCount: number;
  errors: Array<{ lessonId: string; message: string }>;
  records: LessonVideoRecord[];
  queue: VideoQueueState;
} {
  const rawLinks = payload?.links;
  if (!rawLinks || typeof rawLinks !== 'object') {
    throw new VideoPipelineError(
      'INVALID_BACKUP_FILE',
      'Tệp JSON sao lưu không đúng định dạng (thiếu trường links).',
      400
    );
  }

  const store = loadVideoStore();
  let importedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ lessonId: string; message: string }> = [];

  for (const [lessonId, entry] of Object.entries<any>(rawLinks)) {
    if (!store.records[lessonId]) {
      skippedCount += 1;
      continue;
    }
    const rawUrl = entry?.rawUrl || entry?.externalVideo?.rawUrl || entry?.normalizedUrl;
    if (!rawUrl) {
      skippedCount += 1;
      continue;
    }
    try {
      const shouldApprove = Boolean(restoreApprovalState && entry?.isApproved && entry?.isPublished);
      const parsedDur = parseDurationInput(entry?.durationSeconds ?? entry?.externalVideo?.durationSeconds);
      const note = entry?.note ?? entry?.externalVideo?.note;
      store.records[lessonId] = applyExternalLinkToRecord(
        store.records[lessonId],
        rawUrl,
        parsedDur,
        note,
        shouldApprove,
        teacherName
      );
      importedCount += 1;
    } catch (err: any) {
      errors.push({ lessonId, message: err?.message || 'URL không hợp lệ.' });
    }
  }

  if (importedCount > 0) {
    saveVideoStore(store);
    writePersistedApprovals(store.records);
    syncExternalLinksFileFromRecords(store.records);
  }

  return {
    importedCount,
    skippedCount,
    errors,
    records: LESSONS.map((l) => store.records[l.id]),
    queue: store.queue,
  };
}

export function unpublishLessonVideo(lessonId: string): LessonVideoRecord {
  getLessonContextOrThrow(lessonId);
  const store = loadVideoStore();
  const rec = store.records[lessonId];
  rec.isPublished = false;
  rec.stepMessage = 'Đã tạm ẩn khỏi giao diện học sinh.';
  rec.updatedAt = Date.now();
  store.records[lessonId] = rec;
  saveVideoStore(store);
  writePersistedApprovals(store.records);
  return rec;
}

export function resetLessonVideoState(lessonId: string): LessonVideoRecord {
  const { lesson } = getLessonContextOrThrow(lessonId);
  const store = loadVideoStore();
  const prev = store.records[lessonId];
  // Reset failed or non-published job cleanly without deleting published video unless it has none
  if (prev.isPublished && prev.videoUrl) {
    prev.status = 'completed';
    prev.errorCode = null;
    prev.errorMessage = null;
    prev.draftVideo = null;
    prev.stepMessage = 'Đã giữ nguyên bản đã xuất bản.';
    prev.updatedAt = Date.now();
    store.records[lessonId] = prev;
  } else {
    store.records[lessonId] = createInitialRecord(lesson);
  }
  saveVideoStore(store);
  return store.records[lessonId];
}

// =========================================================================
// SEQUENTIAL RATE-LIMITED BATCH QUEUE (PAUSE / RESUME / RETRY)
// =========================================================================

let activeWorkerRunning = false;

async function runQueueWorker() {
  if (activeWorkerRunning) return;
  activeWorkerRunning = true;

  try {
    while (true) {
      const store = loadVideoStore();
      const q = store.queue;
      if (!q.isRunning || q.isPaused || q.pendingLessonIds.length === 0) {
        q.isRunning = false;
        q.activeLessonId = null;
        if (q.pendingLessonIds.length === 0) {
          q.mode = 'idle';
        }
        q.updatedAt = Date.now();
        saveVideoStore(store);
        break;
      }

      const nextLessonId = q.pendingLessonIds[0];
      q.activeLessonId = nextLessonId;
      q.updatedAt = Date.now();
      saveVideoStore(store);

      const mode = q.mode;
      try {
        if (mode === 'scripts_batch') {
          await generateLessonScript(nextLessonId);
        } else {
          await generateLessonVideo(nextLessonId);
        }
        const afterStore = loadVideoStore();
        afterStore.queue.pendingLessonIds = afterStore.queue.pendingLessonIds.filter((id) => id !== nextLessonId);
        afterStore.queue.completedCount += 1;
        afterStore.queue.activeLessonId = null;
        afterStore.queue.updatedAt = Date.now();
        saveVideoStore(afterStore);
      } catch (err: any) {
        const errStore = loadVideoStore();
        errStore.queue.pendingLessonIds = errStore.queue.pendingLessonIds.filter((id) => id !== nextLessonId);
        errStore.queue.failedCount += 1;
        errStore.queue.activeLessonId = null;
        errStore.queue.lastError = err?.message || 'Lỗi xử lý hàng đợi';

        if (err instanceof VideoPipelineError && err.code === 'OFFLINE_TOOLS_MISSING') {
          errStore.queue.isPaused = true;
          errStore.queue.isRunning = false;
        }
        errStore.queue.updatedAt = Date.now();
        saveVideoStore(errStore);
      }

      // Light pacing between consecutive lessons
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  } finally {
    activeWorkerRunning = false;
  }
}

export function enqueueSingleLessonVideo(lessonId: string): LessonVideoRecord {
  getLessonContextOrThrow(lessonId);
  const caps = getVideoCapabilities();
  if (!caps.ffmpegAvailable || !caps.ffprobeAvailable || !caps.resvgAvailable) {
    throw new VideoPipelineError('OFFLINE_TOOLS_MISSING', caps.missingRequirements.join(' '), 500);
  }

  const store = loadVideoStore();
  const q = store.queue;
  const alreadyQueued = q.activeLessonId === lessonId || q.pendingLessonIds.includes(lessonId);

  if (!alreadyQueued) {
    if (!q.isRunning && !q.isPaused) {
      store.queue = {
        isRunning: true,
        isPaused: false,
        mode: 'single_video',
        activeLessonId: null,
        pendingLessonIds: [lessonId],
        completedCount: 0,
        failedCount: 0,
        totalQueued: 1,
        startedAt: Date.now(),
        updatedAt: Date.now(),
        lastError: null,
      };
    } else {
      q.pendingLessonIds = [...q.pendingLessonIds, lessonId];
      q.totalQueued = Math.max(q.totalQueued, q.completedCount + q.pendingLessonIds.length);
      if (q.isPaused) q.isPaused = false;
      q.isRunning = true;
      q.updatedAt = Date.now();
    }
  } else if (q.isPaused) {
    q.isPaused = false;
    q.isRunning = true;
    q.updatedAt = Date.now();
  }

  const rec = store.records[lessonId];
  rec.status = 'processing';
  rec.currentStep = 'reading_lesson';
  rec.stepMessage = 'Đã đưa vào hàng đợi nền (1 tiến trình FFmpeg). Đang chuẩn bị xử lý từng cảnh...';
  rec.progressPercent = Math.max(5, rec.progressPercent || 5);
  rec.errorCode = null;
  rec.errorMessage = null;
  rec.updatedAt = Date.now();
  store.records[lessonId] = rec;
  saveVideoStore(store);

  setImmediate(() => {
    runQueueWorker().catch((err) => console.error('[VideoQueue]', err));
  });

  return rec;
}

export function startBatchQueue(
  mode: 'scripts_batch' | 'videos_batch',
  lessonIds?: string[]
): { queue: VideoQueueState; preflightError?: string } {
  const caps = getVideoCapabilities();
  if (mode === 'videos_batch' && (!caps.ffmpegAvailable || !caps.ffprobeAvailable || !caps.resvgAvailable)) {
    throw new VideoPipelineError(
      'OFFLINE_TOOLS_MISSING',
      caps.missingRequirements.join(' '),
      500
    );
  }

  const store = loadVideoStore();
  const targets =
    Array.isArray(lessonIds) && lessonIds.length > 0
      ? lessonIds.filter((id) => Boolean(store.records[id]))
      : LESSONS.map((l) => l.id).filter((id) => {
          const rec = store.records[id];
          if (mode === 'scripts_batch') return !rec.script;
          return rec.status !== 'completed';
        });

  store.queue = {
    isRunning: targets.length > 0,
    isPaused: false,
    mode: targets.length > 0 ? mode : 'idle',
    activeLessonId: null,
    pendingLessonIds: targets,
    completedCount: 0,
    failedCount: 0,
    totalQueued: targets.length,
    startedAt: targets.length > 0 ? Date.now() : null,
    updatedAt: Date.now(),
    lastError: null,
  };
  saveVideoStore(store);

  if (targets.length > 0) {
    setImmediate(() => {
      runQueueWorker().catch((err) => console.error('[VideoQueue]', err));
    });
  }

  return { queue: store.queue };
}

export function pauseVideoQueue(): VideoQueueState {
  const store = loadVideoStore();
  store.queue.isPaused = true;
  store.queue.isRunning = false;
  store.queue.updatedAt = Date.now();
  saveVideoStore(store);
  return store.queue;
}

export function resumeVideoQueue(): VideoQueueState {
  const caps = getVideoCapabilities();
  if (!caps.ffmpegAvailable || !caps.ffprobeAvailable || !caps.resvgAvailable) {
    throw new VideoPipelineError(
      'OFFLINE_TOOLS_MISSING',
      caps.missingRequirements.join(' '),
      500
    );
  }
  const store = loadVideoStore();
  if (store.queue.pendingLessonIds.length === 0) {
    store.queue.isRunning = false;
    store.queue.isPaused = false;
    store.queue.mode = 'idle';
    saveVideoStore(store);
    return store.queue;
  }
  store.queue.isPaused = false;
  store.queue.isRunning = true;
  if (store.queue.mode === 'idle') store.queue.mode = 'videos_batch';
  store.queue.updatedAt = Date.now();
  saveVideoStore(store);

  setImmediate(() => {
    runQueueWorker().catch((err) => console.error('[VideoQueue]', err));
  });
  return store.queue;
}

export function retryFailedVideosInQueue(): VideoQueueState {
  const store = loadVideoStore();
  const failedIds = LESSONS.map((l) => l.id).filter((id) => store.records[id]?.status === 'error');
  if (failedIds.length === 0) {
    return store.queue;
  }
  return startBatchQueue('videos_batch', failedIds).queue;
}

// =========================================================================
// STUDENT PUBLIC READ & MEDIA RANGE STREAMING
// =========================================================================

function enqueuePriorityAutoRestore(lessonId: string): void {
  try {
    const caps = getVideoCapabilities();
    if (!caps.ffmpegAvailable || !caps.ffprobeAvailable || !caps.resvgAvailable || !caps.piperAvailable) {
      return;
    }
    const store = loadVideoStore();
    const rec = store.records[lessonId];
    if (!rec) return;

    const q = store.queue;
    if (q.activeLessonId === lessonId) {
      if (!activeWorkerRunning && q.isRunning && !q.isPaused) {
        setImmediate(() => {
          runQueueWorker().catch((err) => console.error('[VideoAutoRestore]', err));
        });
      }
      return;
    }

    // Move or insert lessonId at the FRONT of pendingLessonIds so the lesson the student opened renders first
    const rest = q.pendingLessonIds.filter((id) => id !== lessonId);
    if (!q.isRunning && !q.isPaused) {
      store.queue = {
        isRunning: true,
        isPaused: false,
        mode: 'videos_batch',
        activeLessonId: null,
        pendingLessonIds: [lessonId],
        completedCount: 0,
        failedCount: 0,
        totalQueued: 1,
        startedAt: Date.now(),
        updatedAt: Date.now(),
        lastError: null,
      };
    } else {
      q.pendingLessonIds = [lessonId, ...rest];
      q.totalQueued = Math.max(q.totalQueued, q.completedCount + q.pendingLessonIds.length);
      if (q.isPaused) q.isPaused = false;
      q.isRunning = true;
      if (q.mode === 'idle') q.mode = 'videos_batch';
      q.updatedAt = Date.now();
    }

    rec.status = 'processing';
    rec.currentStep = 'reading_lesson';
    rec.stepMessage = 'Đang tự động khôi phục video bài giảng đã duyệt xuất bản (~15 giây)...';
    rec.progressPercent = Math.max(8, rec.progressPercent || 8);
    rec.errorCode = null;
    rec.errorMessage = null;
    rec.updatedAt = Date.now();
    store.records[lessonId] = rec;
    saveVideoStore(store);

    setImmediate(() => {
      runQueueWorker().catch((err) => console.error('[VideoAutoRestore]', err));
    });
  } catch (err) {
    console.warn(`[VideoAutoRestore] Could not enqueue ${lessonId}:`, err);
  }
}

export function getPublishedLessonVideo(
  lessonId: string,
  options?: { autoRestore?: boolean }
): {
  lessonId: string;
  available: boolean;
  approvalStatus: 'published' | 'restoring' | 'awaiting_approval' | 'processing' | 'unpublished' | 'not_created';
  durationSeconds: number | null;
  version: number | null;
  video: {
    lessonId: string;
    lessonTitle: string;
    videoUrl: string;
    subtitleUrl: string | null;
    thumbnailUrl: string | null;
    durationSeconds: number;
    approvedAt: string | null;
    version: number;
    provider: 'local' | 'google_drive' | 'youtube' | 'direct_url';
    playbackType: 'iframe' | 'html5_video';
    externalRawUrl?: string | null;
  } | null;
} {
  const store = loadVideoStore();
  const rec = store.records[lessonId];
  if (!rec) {
    return {
      lessonId,
      available: false,
      approvalStatus: 'not_created',
      durationSeconds: null,
      version: null,
      video: null,
    };
  }

  const hasValidTarget = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (/^https?:\/\//i.test(url)) return true;
    const filename = path.basename(url);
    return fs.existsSync(path.join(VIDEOS_ROOT_DIR, lessonId, filename));
  };

  // Case 1: Explicitly approved & published by teacher, verify real file or external URL
  if (rec.isApproved && rec.isPublished && rec.videoUrl && hasValidTarget(rec.videoUrl)) {
    const isExternal = /^https?:\/\//i.test(rec.videoUrl);
    return {
      lessonId,
      available: true,
      approvalStatus: 'published',
      durationSeconds: rec.durationSeconds || 0,
      version: rec.version,
      video: {
        lessonId: rec.lessonId,
        lessonTitle: rec.lessonTitle,
        videoUrl: rec.videoUrl,
        subtitleUrl: rec.subtitleUrl,
        thumbnailUrl: rec.thumbnailUrl,
        durationSeconds: rec.durationSeconds || 0,
        approvedAt: rec.approvedAt,
        version: rec.version,
        provider: isExternal ? rec.externalVideo?.provider || 'direct_url' : 'local',
        playbackType: isExternal ? rec.externalVideo?.playbackType || 'html5_video' : 'html5_video',
        externalRawUrl: isExternal ? rec.externalVideo?.rawUrl || rec.videoUrl : null,
      },
    };
  }

  // Case 1.5: Teacher ALREADY approved & published this lesson, but local MP4 was evicted during container sleep/deploy
  const persistedApproval = readAllPersistedApprovals()[lessonId];
  if (persistedApproval?.isApproved && persistedApproval?.isPublished) {
    if (options?.autoRestore !== false) {
      enqueuePriorityAutoRestore(lessonId);
    }
    return {
      lessonId,
      available: false,
      approvalStatus: 'restoring',
      durationSeconds: rec.durationSeconds || rec.script?.targetDurationSeconds || null,
      version: rec.version || persistedApproval.version || 1,
      video: null,
    };
  }

  // Case 2: Real draft/completed video or external link exists, waiting for teacher approval
  const draftOrCompletedUrl = rec.draftVideo?.videoUrl || (rec.status === 'completed' ? rec.videoUrl : null);
  if (hasValidTarget(draftOrCompletedUrl)) {
    if (rec.isApproved && !rec.isPublished) {
      return {
        lessonId,
        available: false,
        approvalStatus: 'unpublished',
        durationSeconds: rec.durationSeconds || rec.draftVideo?.durationSeconds || null,
        version: rec.version || rec.draftVideo?.version || null,
        video: null,
      };
    }
    return {
      lessonId,
      available: false,
      approvalStatus: 'awaiting_approval',
      durationSeconds: rec.draftVideo?.durationSeconds ?? rec.durationSeconds ?? null,
      version: rec.draftVideo?.version ?? rec.version ?? null,
      video: null,
    };
  }

  // Case 3: Actively processing or not yet created
  return {
    lessonId,
    available: false,
    approvalStatus: rec.status === 'processing' ? 'processing' : 'not_created',
    durationSeconds: null,
    version: rec.version || null,
    video: null,
  };
}

export function getPublishedVideosSummaryMap(): Record<string, { durationSeconds: number; videoUrl: string }> {
  const map: Record<string, { durationSeconds: number; videoUrl: string }> = {};
  for (const l of LESSONS) {
    const pub = getPublishedLessonVideo(l.id, { autoRestore: false });
    if (pub.available && pub.video) {
      map[l.id] = {
        durationSeconds: pub.video.durationSeconds,
        videoUrl: pub.video.videoUrl,
      };
    } else if (pub.approvalStatus === 'restoring') {
      map[l.id] = {
        durationSeconds: pub.durationSeconds || 330,
        videoUrl: `/api/lessons/${l.id}/video`,
      };
    }
  }
  return map;
}

export function handleServeVideoMedia(
  req: Request,
  res: Response,
  verifyTeacherTokenFn: (token: string) => unknown
) {
  const lessonId = String(req.params.lessonId || '');
  const filename = String(req.params.filename || '');

  if (!/^bai-([1-9]|[1-3][0-9]|40)$/.test(lessonId)) {
    return res.status(400).json({ error: 'Mã bài học không hợp lệ.' });
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(filename) || filename.includes('..')) {
    return res.status(400).json({ error: 'Tên tệp không hợp lệ.' });
  }

  const ext = path.extname(filename).toLowerCase();
  if (!['.mp4', '.vtt', '.png', '.jpg', '.webp'].includes(ext)) {
    return res.status(403).json({ error: 'Định dạng tệp không được phép truy cập.' });
  }

  const store = loadVideoStore();
  const rec = store.records[lessonId];
  const isPublishedAsset =
    Boolean(rec?.isPublished && rec?.isApproved) &&
    (rec.videoUrl?.endsWith(`/${filename}`) ||
      rec.subtitleUrl?.endsWith(`/${filename}`) ||
      rec.thumbnailUrl?.endsWith(`/${filename}`));

  if (!isPublishedAsset) {
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const queryToken = typeof req.query.token === 'string' ? req.query.token.trim() : '';
    const token = bearer || queryToken;
    if (!token || !verifyTeacherTokenFn(token)) {
      return res.status(403).json({ error: 'Video chưa được xuất bản hoặc thiếu quyền xem trước của Giáo viên.' });
    }
  }

  const filePath = path.join(VIDEOS_ROOT_DIR, lessonId, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Không tìm thấy tệp video trên máy chủ.' });
  }

  const stat = fs.statSync(filePath);
  const isDownload = req.query.download === '1' || req.query.download === 'true';
  if (isDownload) {
    res.setHeader('Content-Disposition', `attachment; filename="${lessonId}-${filename}"`);
  }

  if (ext === '.vtt') {
    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return fs.createReadStream(filePath).pipe(res);
  }
  if (ext === '.png' || ext === '.jpg' || ext === '.webp') {
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.setHeader('Content-Type', mime);
    return fs.createReadStream(filePath).pipe(res);
  }

  // Byte-range streaming for MP4 HTML5 video seeking
  const fileSize = stat.size;
  const range = req.headers.range;
  if (!isDownload && range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }
    const chunksize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });
    return fs.createReadStream(filePath, { start, end }).pipe(res);
  }

  res.writeHead(200, {
    'Content-Length': fileSize,
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
  });
  return fs.createReadStream(filePath).pipe(res);
}
