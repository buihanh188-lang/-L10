import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudUpload,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileJson,
  Film,
  Filter,
  HardDrive,
  Layers,
  Link2,
  Loader2,
  LogOut,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import {
  LessonVideoRecord,
  VideoCapabilities,
  VideoQueueState,
  VideoScenePlan,
} from '../types';
import { apiService } from '../services/api';
import {
  clearCachedDriveToken,
  DriveConnectedAccount,
  getDriveAccessToken,
  googleDriveSignIn,
  googleDriveSignInDirect,
  googleDriveSignInRedirect,
  googleDriveSignOut,
  initDriveAuth,
  isEmbeddedPreview,
  mapDriveAuthErrorMessage,
} from '../services/googleDriveAuth';
import { CURRICULUM_CHAPTERS, CURRICULUM_PARTS } from '../data/curriculum';
import { LESSONS } from '../data/lessons';
import {
  getExternalProviderLabel,
  parseAndNormalizeExternalVideoUrl,
  parseBulkExternalLinksText,
} from '../utils/videoLinks';

const STATUS_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  not_created: {
    label: 'Chưa tạo',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  script_ready: {
    label: 'Đã có kịch bản',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  processing: {
    label: 'Đang xử lý',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  completed: {
    label: 'Đã tạo',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  error: {
    label: 'Lỗi',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}p ${String(secs).padStart(2, '0')}s`;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const VideoLectureManager: React.FC = () => {
  const [records, setRecords] = useState<LessonVideoRecord[]>([]);
  const [queue, setQueue] = useState<VideoQueueState | null>(null);
  const [capabilities, setCapabilities] = useState<VideoCapabilities | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);
  const [busyLessonId, setBusyLessonId] = useState<string | null>(null);

  // Filters
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Script Editor Modal
  const [editingRecord, setEditingRecord] = useState<LessonVideoRecord | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSummary, setEditSummary] = useState<string>('');
  const [editVoiceStyle, setEditVoiceStyle] = useState<string>('');
  const [editScenes, setEditScenes] = useState<VideoScenePlan[]>([]);
  const [savingScript, setSavingScript] = useState<boolean>(false);

  // Video Preview & Approve Modal
  const [previewRecord, setPreviewRecord] = useState<LessonVideoRecord | null>(null);
  const [subtitlesOn, setSubtitlesOn] = useState<boolean>(true);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Bulk Approve Confirmation Modal
  const [confirmBulkApproveOpen, setConfirmBulkApproveOpen] = useState<boolean>(false);
  const [bulkApproving, setBulkApproving] = useState<boolean>(false);

  // Single Lesson External Link Modal
  const [linkModalRecord, setLinkModalRecord] = useState<LessonVideoRecord | null>(null);
  const [linkUrlInput, setLinkUrlInput] = useState<string>('');
  const [linkDurationInput, setLinkDurationInput] = useState<string>('');
  const [linkNoteInput, setLinkNoteInput] = useState<string>('');
  const [linkAutoApprove, setLinkAutoApprove] = useState<boolean>(true);
  const [savingExternalLink, setSavingExternalLink] = useState<boolean>(false);
  const [removingExternalLink, setRemovingExternalLink] = useState<boolean>(false);

  // Bulk External Links & JSON Backup/Restore Modal
  const [bulkLinkModalOpen, setBulkLinkModalOpen] = useState<boolean>(false);
  const [bulkTab, setBulkTab] = useState<'paste' | 'backup' | 'guide'>('paste');
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkAutoApprove, setBulkAutoApprove] = useState<boolean>(true);
  const [savingBulkLinks, setSavingBulkLinks] = useState<boolean>(false);
  const [restoreApprovalOnImport, setRestoreApprovalOnImport] = useState<boolean>(true);
  const [importingBackup, setImportingBackup] = useState<boolean>(false);
  const [exportingBackup, setExportingBackup] = useState<boolean>(false);
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

  // Google Drive Direct Upload State (in-memory access token only)
  const [driveUser, setDriveUser] = useState<DriveConnectedAccount | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(() => getDriveAccessToken());
  const [driveSigningIn, setDriveSigningIn] = useState<boolean>(false);
  const [drivePopupFallbackSuggested, setDrivePopupFallbackSuggested] = useState<boolean>(false);
  const embeddedPreview = useMemo(() => isEmbeddedPreview(), []);
  const [pendingDriveUpload, setPendingDriveUpload] = useState<{
    lessonIds: string[];
    title: string;
  } | null>(null);
  const [driveUploadAutoApprove, setDriveUploadAutoApprove] = useState<boolean>(true);
  const [driveUploading, setDriveUploading] = useState<boolean>(false);
  const [driveUploadProgress, setDriveUploadProgress] = useState<{
    total: number;
    done: number;
    failed: number;
    currentLessonTitle: string;
  } | null>(null);
  const [autoSyncNewToDrive, setAutoSyncNewToDrive] = useState<boolean>(false);
  const [confirmEnableAutoDrive, setConfirmEnableAutoDrive] = useState<boolean>(false);
  const [confirmSyncBackupDrive, setConfirmSyncBackupDrive] = useState<boolean>(false);
  const [syncingDriveBackup, setSyncingDriveBackup] = useState<boolean>(false);
  const autoUploadedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsub = initDriveAuth(
      (account, token) => {
        setDriveUser(account);
        setDriveToken(token);
      },
      () => {
        setDriveToken(null);
      }
    );
    return () => unsub();
  }, []);

  const loadCatalog = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setLoadError(null);
    }
    try {
      const data = await apiService.getTeacherVideoCatalog();
      setRecords(data.records || []);
      setQueue(data.queue || null);
      setCapabilities(data.capabilities || null);
      setLoadError(null);
    } catch (err: any) {
      if (!silent) {
        setLoadError(err?.message || 'Không thể kết nối máy chủ Kho Video Bài Giảng AI.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Poll while batch queue or any single lesson is processing
  const hasActiveProcessing = useMemo(() => {
    if (queue?.isRunning) return true;
    return records.some((r) => r.status === 'processing');
  }, [queue, records]);

  useEffect(() => {
    if (!hasActiveProcessing) return;
    const timer = setInterval(() => {
      loadCatalog(true);
    }, 2500);
    return () => clearInterval(timer);
  }, [hasActiveProcessing, loadCatalog]);

  // Keep preview video text track in sync
  useEffect(() => {
    const el = previewVideoRef.current;
    if (!el || !el.textTracks || el.textTracks.length === 0) return;
    el.textTracks[0].mode = subtitlesOn ? 'showing' : 'hidden';
  }, [subtitlesOn, previewRecord]);

  // Metrics across 40 lessons
  const stats = useMemo(() => {
    const total = records.length || 40;
    const completed = records.filter((r) => r.status === 'completed').length;
    const published = records.filter((r) => r.isApproved && r.isPublished).length;
    const readyToApprove = records.filter(
      (r) => r.status === 'completed' && (!r.isApproved || !r.isPublished || Boolean(r.draftVideo))
    ).length;
    const scriptReady = records.filter((r) => Boolean(r.script)).length;
    const externalLinked = records.filter((r) => Boolean(r.externalVideo?.normalizedUrl)).length;
    const localUploadableIds = records
      .filter((r) => {
        const u = r.draftVideo?.videoUrl || r.videoUrl || '';
        return u.startsWith('/api/videos/media/') && r.status === 'completed';
      })
      .map((r) => r.lessonId);
    const localPendingDriveIds = records
      .filter((r) => {
        const u = r.draftVideo?.videoUrl || r.videoUrl || '';
        return u.startsWith('/api/videos/media/') && r.status === 'completed' && !r.externalVideo?.normalizedUrl;
      })
      .map((r) => r.lessonId);
    const missingLocalMediaIds = records
      .filter((r) => r.errorCode === 'LOCAL_MEDIA_MISSING')
      .map((r) => r.lessonId);
    const errored = records.filter((r) => r.status === 'error').length;
    const processing = records.filter((r) => r.status === 'processing').length;
    return {
      total,
      completed,
      published,
      readyToApprove,
      scriptReady,
      externalLinked,
      localUploadableIds,
      localPendingDriveIds,
      missingLocalMediaIds,
      errored,
      processing,
    };
  }, [records]);

  const parsedSingleLink = useMemo(() => {
    if (!linkUrlInput.trim()) return null;
    return parseAndNormalizeExternalVideoUrl(linkUrlInput);
  }, [linkUrlInput]);

  const parsedBulkLines = useMemo(() => {
    if (!bulkText.trim()) return [];
    return parseBulkExternalLinksText(bulkText);
  }, [bulkText]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (chapterFilter === 'phan-1') {
        if (r.partId !== 'phan-1') return false;
      } else if (chapterFilter !== 'all') {
        if (r.chapterId !== chapterFilter) return false;
      }
      if (statusFilter === 'published') {
        if (!r.isPublished) return false;
      } else if (statusFilter === 'awaiting_approval') {
        if (!(r.status === 'completed' && (!r.isApproved || r.draftVideo))) return false;
      } else if (statusFilter !== 'all') {
        if (r.status !== statusFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !r.lessonTitle.toLowerCase().includes(q) &&
          !`bài ${r.lessonNumber}`.includes(q) &&
          !r.lessonId.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [records, chapterFilter, statusFilter, searchQuery]);

  const handleGenerateScript = async (lessonId: string) => {
    setBusyLessonId(lessonId);
    setActionBanner(null);
    try {
      const updated = await apiService.generateLessonVideoScript(lessonId);
      setActionBanner({
        type: 'success',
        text: `Đã tạo xong kịch bản AI cho ${updated.lessonTitle}.`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({
        type: 'error',
        text: err?.message || 'Lỗi tạo kịch bản AI.',
      });
      await loadCatalog(true);
    } finally {
      setBusyLessonId(null);
    }
  };

  const handleGenerateSingleVideo = async (lessonId: string) => {
    setBusyLessonId(lessonId);
    setActionBanner({
      type: 'info',
      text: `Đang khởi chạy sản xuất video bài giảng cho ${lessonId}...`,
    });
    try {
      const updated = await apiService.generateSingleLessonVideo(lessonId);
      setActionBanner({
        type: updated.status === 'completed' ? 'success' : 'info',
        text:
          updated.status === 'completed'
            ? `Đã hoàn thành video cho ${updated.lessonTitle}. Vui lòng Xem trước và Duyệt xuất bản.`
            : `Đã đưa ${updated.lessonTitle} vào hàng đợi nền (chạy từng cảnh, tự động cập nhật tiến độ).`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({
        type: 'error',
        text: err?.message || 'Không thể sản xuất video bài giảng.',
      });
      await loadCatalog(true);
    } finally {
      setBusyLessonId(null);
    }
  };

  const handleBatchScripts = async () => {
    setActionBanner(null);
    try {
      const res = await apiService.startBatchLessonScripts();
      setQueue(res.queue);
      setActionBanner({
        type: 'success',
        text: `Đã xếp hàng đợi tạo kịch bản AI cho ${res.queue.totalQueued} bài học.`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({
        type: 'error',
        text: err?.message || 'Không thể khởi chạy tạo kịch bản hàng loạt 40 bài.',
      });
    }
  };

  const handleBatchVideos = async () => {
    setActionBanner(null);
    try {
      const res = await apiService.startBatchLessonVideos();
      setQueue(res.queue);
      setActionBanner({
        type: 'success',
        text: `Đã khởi chạy hàng đợi sản xuất tuần tự cho ${res.queue.totalQueued} bài học.`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({
        type: 'error',
        text: err?.message || 'Không thể khởi chạy tạo video hàng loạt 40 bài.',
      });
    }
  };

  const handlePauseQueue = async () => {
    try {
      const res = await apiService.pauseVideoQueue();
      setQueue(res.queue);
      setActionBanner({ type: 'info', text: 'Đã tạm dừng hàng đợi sản xuất video.' });
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Lỗi tạm dừng.' });
    }
  };

  const handleResumeQueue = async () => {
    try {
      const res = await apiService.resumeVideoQueue();
      setQueue(res.queue);
      setActionBanner({ type: 'success', text: 'Đã tiếp tục hàng đợi sản xuất video.' });
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể tiếp tục hàng đợi.' });
    }
  };

  const handleRetryFailed = async () => {
    try {
      const res = await apiService.retryFailedVideoQueue();
      setQueue(res.queue);
      setActionBanner({ type: 'info', text: 'Đã đưa các bài lỗi vào hàng đợi tạo lại.' });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể chạy lại các bài lỗi.' });
    }
  };

  const handleApproveVideo = async (lessonId: string) => {
    setBusyLessonId(lessonId);
    try {
      const updated = await apiService.approveLessonVideo(lessonId);
      setActionBanner({
        type: 'success',
        text: `Đã duyệt & xuất bản video ${updated.lessonTitle} lên giao diện học sinh.`,
      });
      if (previewRecord?.lessonId === lessonId) {
        setPreviewRecord(updated);
      }
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể duyệt xuất bản.' });
    } finally {
      setBusyLessonId(null);
    }
  };

  const handleBulkApproveAll = async () => {
    setBulkApproving(true);
    try {
      const res = await apiService.approveAllLessonVideos();
      if (Array.isArray(res.records)) {
        setRecords(res.records);
      }
      if (res.queue) {
        setQueue(res.queue);
      }
      setConfirmBulkApproveOpen(false);
      setActionBanner({
        type: res.approvedCount > 0 ? 'success' : 'info',
        text:
          res.approvedCount > 0
            ? `Đã duyệt & xuất bản đồng loạt ${res.approvedCount} video bài giảng lên giao diện học sinh.`
            : 'Không có video hoàn chỉnh nào đang chờ duyệt.',
      });
      await loadCatalog(true);
    } catch (err: any) {
      setConfirmBulkApproveOpen(false);
      setActionBanner({
        type: 'error',
        text: err?.message || 'Không thể duyệt xuất bản hàng loạt video.',
      });
    } finally {
      setBulkApproving(false);
    }
  };

  const handleUnpublish = async (lessonId: string) => {
    setBusyLessonId(lessonId);
    try {
      const updated = await apiService.unpublishLessonVideo(lessonId);
      setActionBanner({ type: 'info', text: `Đã tạm ẩn video ${updated.lessonTitle} khỏi học sinh.` });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể ẩn video.' });
    } finally {
      setBusyLessonId(null);
    }
  };

  const handleResetError = async (lessonId: string) => {
    setBusyLessonId(lessonId);
    try {
      await apiService.resetLessonVideo(lessonId);
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể đặt lại trạng thái.' });
    } finally {
      setBusyLessonId(null);
    }
  };

  const openScriptEditor = (rec: LessonVideoRecord) => {
    const lesson = LESSONS.find((l) => l.id === rec.lessonId);
    if (rec.script) {
      setEditTitle(rec.script.title);
      setEditSummary(rec.script.learningObjectivesSummary);
      setEditVoiceStyle(rec.script.voiceStyle);
      setEditScenes(rec.script.scenes.map((s) => ({ ...s })));
    } else if (lesson) {
      // Seed draft scene blueprint directly from existing lesson structure for manual editing even before AI run
      const initialScenes: VideoScenePlan[] = [
        {
          sceneNumber: 1,
          phase: 'intro',
          title: `Mở đầu & Dẫn nhập: ${lesson.title}`,
          durationSeconds: 35,
          narration: `Chào mừng các em đến với ${lesson.title}. ${lesson.subtitle}.`,
          onScreenKeywords: [lesson.title, 'Địa lí 10 - Kết nối tri thức'],
          visualPrompt: lesson.visualData.description,
          visualType: 'illustration',
          subtitleText: `Chào mừng các em đến với ${lesson.title}.`,
        },
        {
          sceneNumber: 2,
          phase: 'objectives',
          title: 'Mục tiêu cần đạt của bài học',
          durationSeconds: 40,
          narration: lesson.objectives.join(' '),
          onScreenKeywords: lesson.objectives.slice(0, 3),
          visualPrompt: `Infographic showing learning objectives of ${lesson.title}`,
          visualType: 'map_diagram',
          subtitleText: lesson.objectives[0] || lesson.subtitle,
        },
        ...lesson.keyKnowledge.map((sec, idx) => ({
          sceneNumber: idx + 3,
          phase: 'knowledge' as const,
          title: sec.sectionTitle,
          durationSeconds: 65,
          narration: `${sec.content.join(' ')}${sec.highlight ? ' Lưu ý: ' + sec.highlight : ''}`,
          onScreenKeywords: [sec.sectionTitle],
          visualPrompt: `${lesson.visualData.description} — ${sec.sectionTitle}`,
          visualType: (lesson.visualData.type === 'chart' ? 'chart_data' : 'map_diagram') as VideoScenePlan['visualType'],
          subtitleText: sec.highlight || sec.content[0] || sec.sectionTitle,
        })),
        {
          sceneNumber: lesson.keyKnowledge.length + 3,
          phase: 'local_example',
          title: 'Liên hệ thực tiễn & Địa phương Lạng Sơn',
          durationSeconds: 45,
          narration: lesson.realWorldExamples.join(' '),
          onScreenKeywords: ['Xã Vạn Linh', 'Chi Lăng', 'Lạng Sơn'],
          visualPrompt: 'Scenic karst mountain valley and terraced fields in Lang Son Vietnam',
          visualType: 'motion_clip',
          subtitleText: lesson.realWorldExamples[0] || 'Vận dụng tri thức địa lí vào thực tiễn địa phương.',
        },
        {
          sceneNumber: lesson.keyKnowledge.length + 4,
          phase: 'summary',
          title: 'Tổng kết trọng tâm & Định hướng luyện tập 4 dạng bài',
          durationSeconds: 45,
          narration: `${lesson.keyTakeaways.join(' ')} Sau video này, các em hãy chuyển sang làm luyện tập 4 dạng câu hỏi để củng cố kiến thức nhé.`,
          onScreenKeywords: lesson.keyTakeaways.slice(0, 3),
          visualPrompt: 'Summary concept map for geography lesson review',
          visualType: 'illustration',
          subtitleText: lesson.keyTakeaways[0] || 'Ghi nhớ trọng tâm và bắt đầu luyện tập.',
        },
      ];
      setEditTitle(lesson.title);
      setEditSummary(lesson.subtitle);
      setEditVoiceStyle('Giọng nữ giáo viên chuẩn miền Bắc, tốc độ vừa phải');
      setEditScenes(initialScenes);
    }
    setEditingRecord(rec);
  };

  const handleSaveScriptEdits = async () => {
    if (!editingRecord) return;
    setSavingScript(true);
    try {
      const updated = await apiService.saveLessonVideoScript(editingRecord.lessonId, {
        title: editTitle,
        learningObjectivesSummary: editSummary,
        voiceStyle: editVoiceStyle,
        scenes: editScenes,
      });
      setActionBanner({
        type: 'success',
        text: `Đã lưu chỉnh sửa kịch bản & phụ đề cho ${updated.lessonTitle}.`,
      });
      setEditingRecord(null);
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Lỗi lưu kịch bản.' });
    } finally {
      setSavingScript(false);
    }
  };

  const openExternalLinkModal = (rec: LessonVideoRecord) => {
    setLinkModalRecord(rec);
    setLinkUrlInput(rec.externalVideo?.rawUrl || '');
    const dur = rec.externalVideo?.durationSeconds ?? rec.durationSeconds;
    if (dur && dur > 0) {
      const m = Math.floor(dur / 60);
      const s = Math.round(dur % 60);
      setLinkDurationInput(`${m}:${String(s).padStart(2, '0')}`);
    } else {
      setLinkDurationInput('');
    }
    setLinkNoteInput(rec.externalVideo?.note || '');
    setLinkAutoApprove(true);
  };

  const handleSaveSingleExternalLink = async () => {
    if (!linkModalRecord) return;
    if (!parsedSingleLink || !parsedSingleLink.valid) {
      setActionBanner({
        type: 'error',
        text: parsedSingleLink?.error || 'Vui lòng dán đường dẫn video hợp lệ.',
      });
      return;
    }
    setSavingExternalLink(true);
    try {
      const updated = await apiService.setLessonExternalVideoLink(linkModalRecord.lessonId, {
        rawUrl: linkUrlInput.trim(),
        durationSeconds: linkDurationInput.trim() || null,
        note: linkNoteInput.trim(),
        autoApprove: linkAutoApprove,
      });
      setLinkModalRecord(null);
      setActionBanner({
        type: 'success',
        text: linkAutoApprove
          ? `Đã gắn link bền vững (${getExternalProviderLabel(updated.externalVideo?.provider)}) & xuất bản cho ${updated.lessonTitle}.`
          : `Đã gắn link bền vững cho ${updated.lessonTitle} (Chờ giáo viên duyệt).`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể gắn link video bền vững.' });
    } finally {
      setSavingExternalLink(false);
    }
  };

  const handleRemoveSingleExternalLink = async () => {
    if (!linkModalRecord) return;
    setRemovingExternalLink(true);
    try {
      const updated = await apiService.removeLessonExternalVideoLink(linkModalRecord.lessonId);
      setLinkModalRecord(null);
      setActionBanner({
        type: 'info',
        text: `Đã gỡ link ngoài khỏi ${updated.lessonTitle}.`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể gỡ link video.' });
    } finally {
      setRemovingExternalLink(false);
    }
  };

  const handleSaveBulkLinks = async () => {
    const validItems = parsedBulkLines
      .filter((item) => item.lessonId && item.parseResult.valid)
      .map((item) => ({
        lessonId: item.lessonId!,
        rawUrl: item.rawUrl,
        durationSeconds: item.durationSeconds,
        note: item.note,
      }));
    if (validItems.length === 0) {
      setActionBanner({
        type: 'error',
        text: 'Chưa có dòng link hợp lệ nào để lưu. Vui lòng kiểm tra định dạng danh sách.',
      });
      return;
    }
    setSavingBulkLinks(true);
    try {
      const res = await apiService.setBulkExternalVideoLinks(validItems, bulkAutoApprove);
      if (Array.isArray(res.records)) setRecords(res.records);
      setBulkLinkModalOpen(false);
      setActionBanner({
        type: res.updatedCount > 0 ? 'success' : 'error',
        text:
          res.failedCount > 0
            ? `Đã gắn link bền vững cho ${res.updatedCount} bài (${res.failedCount} bài lỗi).`
            : `Đã gắn link bền vững cho ${res.updatedCount} bài học${bulkAutoApprove ? ' & xuất bản ngay cho học sinh' : ''}.`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể lưu danh sách link hàng loạt.' });
    } finally {
      setSavingBulkLinks(false);
    }
  };

  const handleExportBackupJson = async () => {
    setExportingBackup(true);
    try {
      const backup = await apiService.exportExternalVideoLinks();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = blobUrl;
      a.download = `diali10-video-links-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      setActionBanner({
        type: 'success',
        text: `Đã tải xuống tệp sao lưu JSON gồm ${backup.totalLinked} link video bền vững.`,
      });
    } catch (err: any) {
      setActionBanner({ type: 'error', text: err?.message || 'Không thể xuất tệp sao lưu JSON.' });
    } finally {
      setExportingBackup(false);
    }
  };

  const handleImportBackupFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportingBackup(true);
    try {
      const rawText = await file.text();
      const parsedJson = JSON.parse(rawText);
      const res = await apiService.importExternalVideoLinks(parsedJson, restoreApprovalOnImport);
      if (Array.isArray(res.records)) setRecords(res.records);
      setBulkLinkModalOpen(false);
      setActionBanner({
        type: 'success',
        text: `Đã khôi phục thành công ${res.importedCount} link video từ tệp sao lưu JSON.`,
      });
      await loadCatalog(true);
    } catch (err: any) {
      setActionBanner({
        type: 'error',
        text: err?.message || 'Tệp JSON không hợp lệ hoặc không thể khôi phục.',
      });
    } finally {
      setImportingBackup(false);
    }
  };

  const handleDriveSignIn = async (mode: 'firebase' | 'gis' | 'redirect' = 'firebase') => {
    setDriveSigningIn(true);
    try {
      if (mode === 'redirect') {
        await googleDriveSignInRedirect();
        return;
      }
      const res =
        mode === 'gis'
          ? await googleDriveSignInDirect()
          : await googleDriveSignIn();
      setDriveUser(res.account);
      setDriveToken(res.accessToken);
      setDrivePopupFallbackSuggested(false);
      setActionBanner({
        type: 'success',
        text: `Đã kết nối Google Drive (${res.account.email || res.account.displayName || 'Tài khoản Google'}).`,
      });
    } catch (err: any) {
      const mapped = mapDriveAuthErrorMessage(err, mode === 'gis' ? 'gis' : 'firebase');
      if (mapped.isPopupIssue) {
        setDrivePopupFallbackSuggested(true);
      }
      setActionBanner({
        type: 'error',
        text: mapped.message,
      });
    } finally {
      setDriveSigningIn(false);
    }
  };

  const handleDriveSignOut = async () => {
    setAutoSyncNewToDrive(false);
    await googleDriveSignOut();
    setDriveUser(null);
    setDriveToken(null);
    setActionBanner({ type: 'info', text: 'Đã ngắt kết nối Google Drive.' });
  };

  const uploadLessonListToDrive = useCallback(
    async (lessonIds: string[], token: string, autoApprove: boolean, isAutoSync = false) => {
      if (lessonIds.length === 0) return;
      setDriveUploading(true);
      setDriveUploadProgress({
        total: lessonIds.length,
        done: 0,
        failed: 0,
        currentLessonTitle: lessonIds[0],
      });

      let done = 0;
      let failed = 0;
      let lastError = '';
      let lastFolderName = 'Địa lí 10 - Kho Video Bài Giảng';

      for (const id of lessonIds) {
        const rec = records.find((r) => r.lessonId === id);
        setDriveUploadProgress({
          total: lessonIds.length,
          done,
          failed,
          currentLessonTitle: rec ? `Bài ${rec.lessonNumber}: ${rec.lessonTitle}` : id,
        });
        try {
          const uploaded = await apiService.uploadLessonVideoToDrive(id, token, { autoApprove });
          lastFolderName = uploaded.driveFolderName;
          autoUploadedKeysRef.current.add(`${id}:${rec?.version || 1}`);
          done += 1;
        } catch (err: any) {
          failed += 1;
          lastError = err?.message || 'Lỗi tải lên Google Drive';
          if (err?.status === 401 || err?.code === 'DRIVE_TOKEN_EXPIRED' || err?.code === 'DRIVE_AUTH_REQUIRED') {
            clearCachedDriveToken();
            setDriveToken(null);
            setAutoSyncNewToDrive(false);
            break;
          }
        }
      }

      if (done > 0 && getDriveAccessToken()) {
        try {
          await apiService.syncBackupToGoogleDrive(getDriveAccessToken()!);
        } catch {
          // non-fatal if backup sync fails after successful video upload
        }
      }

      setDriveUploading(false);
      setDriveUploadProgress(null);
      await loadCatalog(true);

      if (done > 0 && failed === 0) {
        setActionBanner({
          type: 'success',
          text: isAutoSync
            ? `Đã tự động đẩy ${done} video mới lên thư mục "${lastFolderName}" trên Google Drive & gắn link bền vững.`
            : `Đã tải xong ${done} video lên thư mục "${lastFolderName}" trên Google Drive và gắn link bền vững thành công.`,
        });
      } else if (done > 0) {
        setActionBanner({
          type: 'info',
          text: `Đã tải ${done}/${lessonIds.length} video lên Google Drive (${failed} bài chưa thành công: ${lastError}).`,
        });
      } else {
        setActionBanner({
          type: 'error',
          text: lastError || 'Không thể tải video lên Google Drive. Vui lòng kiểm tra lại đăng nhập Google.',
        });
      }
    },
    [records, loadCatalog]
  );

  // Automatic background upload to Google Drive right after newly generated videos finish (only when confirmed by teacher)
  useEffect(() => {
    if (!autoSyncNewToDrive || !driveToken || driveUploading) return;
    const nextReady = records.find((r) => {
      const localUrl = r.draftVideo?.videoUrl || r.videoUrl || '';
      const key = `${r.lessonId}:${r.version}`;
      return (
        r.status === 'completed' &&
        localUrl.startsWith('/api/videos/media/') &&
        !r.externalVideo?.normalizedUrl &&
        !autoUploadedKeysRef.current.has(key)
      );
    });
    if (!nextReady) return;
    autoUploadedKeysRef.current.add(`${nextReady.lessonId}:${nextReady.version}`);
    uploadLessonListToDrive([nextReady.lessonId], driveToken, true, true);
  }, [autoSyncNewToDrive, driveToken, driveUploading, records, uploadLessonListToDrive]);

  const handleConfirmDriveUpload = async () => {
    if (!pendingDriveUpload || !driveToken) return;
    const ids = pendingDriveUpload.lessonIds;
    setPendingDriveUpload(null);
    await uploadLessonListToDrive(ids, driveToken, driveUploadAutoApprove, false);
  };

  const handleConfirmSyncBackupToDrive = async () => {
    if (!driveToken) return;
    setSyncingDriveBackup(true);
    try {
      const res = await apiService.syncBackupToGoogleDrive(driveToken);
      setConfirmSyncBackupDrive(false);
      setActionBanner({
        type: 'success',
        text: `Đã lưu tệp sao lưu (${res.totalLinked} link) vào thư mục "${res.driveFolderName}" trên Google Drive.`,
      });
    } catch (err: any) {
      if (err?.status === 401 || err?.code === 'DRIVE_TOKEN_EXPIRED') {
        clearCachedDriveToken();
        setDriveToken(null);
      }
      setConfirmSyncBackupDrive(false);
      setActionBanner({ type: 'error', text: err?.message || 'Không thể đồng bộ tệp sao lưu lên Google Drive.' });
    } finally {
      setSyncingDriveBackup(false);
    }
  };

  const teacherToken = apiService.getTeacherToken() || '';
  const withToken = (url: string | null) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(teacherToken)}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-10 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          Đang tải Kho Video Bài Giảng AI (40 bài học – 13 chương)...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-rose-800 font-bold">
          <XCircle className="w-5 h-5" />
          <span>Không thể tải dữ liệu Kho Video Bài Giảng AI</span>
        </div>
        <p className="text-xs text-rose-700">{loadError}</p>
        <button
          onClick={() => loadCatalog()}
          className="px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 cursor-pointer"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  const percentCompleted = Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Header & Honest Server AI Readiness Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  KHO VIDEO BÀI GIẢNG AI – ĐỊA LÍ 10 (40 BÀI / 13 CHƯƠNG)
                </h2>
                <p className="text-xs text-slate-500">
                  Tự động đọc nội dung bài học từ chương trình Kết nối tri thức, biên soạn kịch bản 4–6 phút, đọc tiếng Việt (Piper TTS), dựng slide sơ đồ chuyển động HD, phụ đề WebVTT đồng bộ và xuất bản sau khi giáo viên duyệt (100% miễn phí – ngoại tuyến).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBatchScripts}
              disabled={Boolean(queue?.isRunning)}
              className="px-3.5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>TẠO KỊCH BẢN 40 BÀI</span>
            </button>

            <button
              onClick={handleBatchVideos}
              disabled={Boolean(queue?.isRunning)}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>TẠO VIDEO HÀNG LOẠT 40 BÀI</span>
            </button>

            <button
              onClick={() => setConfirmBulkApproveOpen(true)}
              disabled={stats.readyToApprove === 0 || bulkApproving}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
              title="Duyệt & xuất bản đồng loạt tất cả các bài đã tạo xong video"
            >
              {bulkApproving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>DUYỆT &amp; XUẤT BẢN TẤT CẢ ({stats.readyToApprove})</span>
            </button>

            <button
              onClick={() => {
                setBulkTab('paste');
                setBulkLinkModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
              title="Gắn link Google Drive / YouTube / Kho lưu trữ cố định & Sao lưu JSON để không bao giờ mất video"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>GẮN LINK 40 BÀI / SAO LƯU</span>
            </button>

            <button
              onClick={() => loadCatalog()}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              title="Làm mới trạng thái"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Honest Capability Check Banner */}
        {capabilities && capabilities.missingRequirements.length > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
            <div className="flex items-center space-x-2 text-amber-950 font-extrabold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>MÁY CHỦ CHƯA ĐỦ CÔNG CỤ NGOẠI TUYẾN ĐỂ TẠO VIDEO</span>
            </div>
            <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
              {capabilities.missingRequirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
            <div className="text-[11px] text-amber-800 pt-1">
              Công cụ ngoại tuyến 0 đồng: Piper TTS ({capabilities.piperAvailable ? 'Sẵn sàng' : 'Thiếu'}) • SVG/Resvg ({capabilities.resvgAvailable ? 'Sẵn sàng' : 'Thiếu'}) • FFmpeg ({capabilities.ffmpegAvailable ? 'Sẵn sàng' : 'Thiếu'}).
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center space-x-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Máy chủ sẵn sàng sản xuất video bài giảng 100% MIỄN PHÍ – NGOẠI TUYẾN (Piper TTS tiếng Việt + SVG HD + FFmpeg .mp4). Không dùng API trả phí.
              </span>
            </div>
            <span className="text-[11px] text-emerald-700">Lưu trữ tại: {capabilities?.storageDir}</span>
          </div>
        )}

        {/* Google Drive Auto-Upload & Persistent Sync Bar */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CloudUpload className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-extrabold text-indigo-950 flex flex-wrap items-center gap-2">
                <span>ĐẨY THẲNG VIDEO LÊN GOOGLE DRIVE CỦA CÔ</span>
                {driveToken && driveUser && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    Đã kết nối: {driveUser.email || driveUser.displayName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-900/90">
                Tự động tải tệp .mp4 từ máy chủ vào thư mục <strong>&ldquo;Địa lí 10 - Kho Video Bài Giảng&rdquo;</strong> trên Google Drive của cô, bật quyền xem cho học sinh và gắn link vĩnh viễn.
              </p>
              {(embeddedPreview || drivePopupFallbackSuggested) && !driveToken && (
                <p className="text-[11px] text-amber-900 bg-amber-100/80 border border-amber-300 rounded-lg px-2.5 py-1.5 mt-1 font-semibold">
                  {embeddedPreview
                    ? 'Đang mở trong khung xem trước AI Studio (trình duyệt thường chặn cửa sổ Google trả quyền về khung nhúng). Cô bấm "Mở tab riêng để kết nối Drive" bên cạnh để đăng nhập Google mượt mà nhất, hoặc bấm "Tải gói 40 MP4 (.tar)".'
                    : 'Nếu cửa sổ Pop-up bị đóng sớm, cô hãy bấm "Đăng nhập không dùng Pop-up" để cấp quyền Google trực tiếp trên tab này.'}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!driveToken ? (
              <>
                {embeddedPreview && (
                  <a
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600 shadow-xs font-extrabold flex items-center space-x-1.5 transition-colors"
                    title="Mở trang Quản trị sang một tab trình duyệt độc lập để kết nối Google Drive không bị chặn bởi khung nhúng"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở tab riêng để kết nối Drive</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDriveSignIn('firebase')}
                  disabled={driveSigningIn}
                  className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 shadow-xs text-slate-800 text-xs font-bold cursor-pointer disabled:opacity-60 transition-colors"
                >
                  <span className="gsi-material-button-icon w-4 h-4 shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </span>
                  <span className="gsi-material-button-contents">
                    {driveSigningIn ? 'Đang kết nối Google...' : 'Sign in with Google'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDriveSignIn('gis')}
                  disabled={driveSigningIn}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-60 transition-colors"
                  title="Kết nối trực tiếp qua Google Identity Services"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Đăng nhập Drive (Trực tiếp)</span>
                </button>

                {!embeddedPreview && (
                  <button
                    type="button"
                    onClick={() => handleDriveSignIn('redirect')}
                    disabled={driveSigningIn}
                    className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-60 transition-colors border ${
                      drivePopupFallbackSuggested
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-white hover:bg-indigo-100/70 text-indigo-800 border-indigo-300'
                    }`}
                    title="Chuyển toàn trang sang màn hình cấp quyền Google Drive rồi tự quay lại (không dùng cửa sổ bật lên)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Đăng nhập không dùng Pop-up</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={driveUploading || stats.localUploadableIds.length === 0}
                  onClick={() =>
                    setPendingDriveUpload({
                      lessonIds:
                        stats.localPendingDriveIds.length > 0
                          ? stats.localPendingDriveIds
                          : stats.localUploadableIds,
                      title:
                        stats.localPendingDriveIds.length > 0
                          ? `Đẩy ${stats.localPendingDriveIds.length} video chưa lưu lên Google Drive`
                          : `Đẩy ${stats.localUploadableIds.length} video trên máy chủ lên Google Drive`,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  {driveUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudUpload className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {stats.localPendingDriveIds.length > 0
                      ? `Đẩy lên Drive (${stats.localPendingDriveIds.length} bài)`
                      : `Đẩy tất cả lên Drive (${stats.localUploadableIds.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (autoSyncNewToDrive) {
                      setAutoSyncNewToDrive(false);
                    } else {
                      setConfirmEnableAutoDrive(true);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl font-bold border flex items-center space-x-1.5 cursor-pointer ${
                    autoSyncNewToDrive
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-100/70'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {autoSyncNewToDrive ? 'Tự động đẩy khi tạo xong: BẬT' : 'Bật tự động đẩy khi tạo xong'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={syncingDriveBackup || stats.externalLinked === 0}
                  onClick={() => setConfirmSyncBackupDrive(true)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-indigo-100/60 disabled:opacity-50 text-indigo-800 border border-indigo-200 font-bold flex items-center space-x-1 cursor-pointer"
                  title="Lưu bản sao diali10-video-links-backup.json vào thư mục Google Drive"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Lưu JSON lên Drive</span>
                </button>

                <button
                  type="button"
                  onClick={handleDriveSignOut}
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold flex items-center space-x-1 cursor-pointer"
                  title="Ngắt kết nối Google Drive"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ngắt kết nối</span>
                </button>
              </>
            )}

          </div>
        </div>

        {/* Live Google Drive Batch Upload Progress */}
        {driveUploadProgress && (
          <div className="p-3.5 rounded-2xl bg-indigo-900 text-white space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                <span>
                  Đang tải lên Google Drive ({driveUploadProgress.done + 1}/{driveUploadProgress.total}):{' '}
                  {driveUploadProgress.currentLessonTitle}
                </span>
              </div>
              <span className="tabular-nums text-indigo-200">
                Xong: {driveUploadProgress.done} • Lỗi: {driveUploadProgress.failed}
              </span>
            </div>
            <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all"
                style={{
                  width: `${Math.round(((driveUploadProgress.done + 0.5) / driveUploadProgress.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Missing Local MP4 Recovery Callout (truthfully matches Student View when container sleep evicted local MP4s) */}
        {stats.missingLocalMediaIds.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-300 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2 text-sky-950">
              <AlertTriangle className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">
                  Phát hiện {stats.missingLocalMediaIds.length} bài bị thiếu tệp MP4 nội bộ do máy chủ dọn bộ nhớ tạm khi nghỉ (kịch bản &amp; xác nhận duyệt của cô vẫn được giữ nguyên).
                </div>
                <div className="text-[11px] text-sky-800">
                  Khi học sinh mở các bài này, hệ thống sẽ tự khôi phục tệp phát trong ~45–60 giây. Cô cũng có thể bấm nút bên cạnh để dựng lại gọn nhẹ (~3 MB/bài) rồi đẩy lên Google Drive để lưu vĩnh viễn.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await apiService.startBatchLessonVideos(stats.missingLocalMediaIds);
                  setActionBanner({
                    type: 'info',
                    text: `Đã đưa ${stats.missingLocalMediaIds.length} bài thiếu tệp MP4 vào hàng đợi khôi phục nhanh (tự giữ nguyên trạng thái Đã xuất bản).`,
                  });
                  await loadCatalog(true);
                } catch (err: any) {
                  setActionBanner({
                    type: 'error',
                    text: err?.message || 'Không thể khởi chạy hàng đợi khôi phục.',
                  });
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer shrink-0 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Khôi phục ngay ({stats.missingLocalMediaIds.length} bài)</span>
            </button>
          </div>
        )}

        {/* Quick Bulk Approval Callout when completed videos are awaiting teacher approval */}
        {stats.readyToApprove > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 font-bold text-amber-950">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Hiện có {stats.readyToApprove} bài học đã tạo xong video hoàn chỉnh và đang chờ giáo viên duyệt xuất bản lên trang học sinh.
              </span>
            </div>
            <button
              onClick={() => setConfirmBulkApproveOpen(true)}
              disabled={bulkApproving}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Duyệt &amp; Xuất bản 1 lúc ({stats.readyToApprove} bài)</span>
            </button>
          </div>
        )}

        {/* Action feedback banner */}
        {actionBanner && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              actionBanner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : actionBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}
          >
            <span>{actionBanner.text}</span>
            <button
              onClick={() => setActionBanner(null)}
              className="text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Floating Action Toast so scrolled-down row clicks always show immediate feedback */}
        {actionBanner && (
          <div
            className={`fixed bottom-5 right-5 z-40 max-w-md p-3.5 rounded-2xl border shadow-xl text-xs font-semibold flex items-center justify-between gap-3 ${
              actionBanner.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : actionBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-sky-50 border-sky-300 text-sky-950'
            }`}
          >
            <span>{actionBanner.text}</span>
            <button
              onClick={() => setActionBanner(null)}
              className="text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overall Progress & Queue Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500">Tiến độ tổng thể</div>
            <div className="text-xl font-black text-slate-900 tabular-nums mt-0.5">
              {stats.completed}/{stats.total} video
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${percentCompleted}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-800">Đã duyệt & Xuất bản</div>
            <div className="text-xl font-black text-emerald-700 tabular-nums mt-0.5">
              {stats.published}/{stats.total} bài
            </div>
            <div className="text-[10px] text-emerald-700 mt-1">Hiển thị cho học sinh</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <div className="text-[11px] font-semibold text-indigo-800">Link bền vững (Drive/Web)</div>
            <div className="text-xl font-black text-indigo-700 tabular-nums mt-0.5">
              {stats.externalLinked}/{stats.total} bài
            </div>
            <div className="text-[10px] text-indigo-700 mt-1">Không mất khi reset server</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
            <div className="text-[11px] font-semibold text-sky-800">Kịch bản đã biên soạn</div>
            <div className="text-xl font-black text-sky-700 tabular-nums mt-0.5">
              {stats.scriptReady}/{stats.total} bài
            </div>
            <div className="text-[10px] text-sky-700 mt-1">Tự động từ SGK & chỉnh sửa</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="text-[11px] font-semibold text-amber-800">Đang xử lý</div>
            <div className="text-xl font-black text-amber-700 tabular-nums mt-0.5">
              {stats.processing} bài
            </div>
            <div className="text-[10px] text-amber-700 mt-1">
              {queue?.isPaused ? 'Hàng đợi đang tạm dừng' : queue?.isRunning ? 'Đang chạy tuần tự' : 'Nhàn rỗi'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="text-[11px] font-semibold text-rose-800">Bài bị lỗi</div>
            <div className="text-xl font-black text-rose-700 tabular-nums mt-0.5">
              {stats.errored} bài
            </div>
            <div className="text-[10px] text-rose-700 mt-1">Có thể bấm Tạo lại</div>
          </div>
        </div>

        {/* Queue Status Bar when active, paused, or errored */}
        {(queue?.isRunning || queue?.isPaused || stats.errored > 0) && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              {queue?.isRunning ? (
                <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {queue?.isRunning
                    ? `Đang xử lý hàng đợi (${queue.mode === 'scripts_batch' ? 'Kịch bản' : 'Video'}): còn ${queue.pendingLessonIds.length} bài`
                    : queue?.isPaused
                    ? `Hàng đợi đang tạm dừng (còn ${queue.pendingLessonIds.length} bài chờ)`
                    : `Có ${stats.errored} bài gặp lỗi trong quá trình tạo`}
                </span>
                {queue?.lastError && (
                  <p className="text-[11px] text-rose-300 mt-0.5 line-clamp-1">{queue.lastError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {queue?.isRunning && (
                <button
                  onClick={handlePauseQueue}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Tạm dừng</span>
                </button>
              )}
              {queue?.isPaused && queue.pendingLessonIds.length > 0 && (
                <button
                  onClick={handleResumeQueue}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Tiếp tục</span>
                </button>
              )}
              {stats.errored > 0 && (
                <button
                  onClick={handleRetryFailed}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tạo lại bài bị lỗi ({stats.errored})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mr-1">
            <Filter className="w-4 h-4 text-teal-700" />
            <span>Bộ lọc:</span>
          </div>

          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="all">Tất cả 13 chương & Phần 1 (40 bài)</option>
            <option value="phan-1">{CURRICULUM_PARTS[0]?.title} (Bài 1)</option>
            {CURRICULUM_CHAPTERS.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title} ({ch.lessonsCount} bài)
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="not_created">Chưa tạo</option>
            <option value="script_ready">Đã có kịch bản</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Đã tạo xong</option>
            <option value="awaiting_approval">Chờ giáo viên duyệt</option>
            <option value="published">Đã duyệt & Xuất bản</option>
            <option value="error">Bị lỗi</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số bài hoặc tên bài..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* 40 Lessons Video Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-700" />
            <span>
              Hiển thị {filteredRecords.length} / {records.length} bài học chương trình Địa lí 10
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Mỗi bài học liên kết tự động với mục tiêu, kiến thức trọng tâm & thực tiễn địa phương
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[11px] font-bold">
              <tr>
                <th className="p-3.5 w-16 text-center">Bài</th>
                <th className="p-3.5">Bài học & Chương</th>
                <th className="p-3.5 w-36">Trạng thái</th>
                <th className="p-3.5 w-28 text-center">Thời lượng</th>
                <th className="p-3.5 w-36 text-center">Xuất bản HS</th>
                <th className="p-3.5 text-right">Thao tác quản lí & sản xuất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => {
                const chapter = rec.chapterId
                  ? CURRICULUM_CHAPTERS.find((c) => c.id === rec.chapterId)
                  : null;
                const statusInfo = STATUS_META[rec.status] || STATUS_META.not_created;
                const isBusy = busyLessonId === rec.lessonId || rec.status === 'processing';
                const hasPreviewableVideo = Boolean(rec.draftVideo?.videoUrl || (rec.status === 'completed' && rec.videoUrl));

                return (
                  <tr key={rec.lessonId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-center font-black text-teal-800 tabular-nums">
                      {rec.lessonNumber}
                    </td>

                    <td className="p-3.5 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>{rec.lessonTitle}</span>
                        {rec.isPracticeLesson && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            Thực hành
                          </span>
                        )}
                        {rec.externalVideo?.normalizedUrl && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                            <HardDrive className="w-2.5 h-2.5" />
                            <span>{getExternalProviderLabel(rec.externalVideo.provider)}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {chapter ? chapter.title : CURRICULUM_PARTS[0]?.title}
                      </div>
                      {rec.stepMessage && (
                        <div className="text-[11px] text-slate-600">
                          {rec.stepMessage}
                        </div>
                      )}
                      {rec.status === 'processing' && (
                        <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-amber-500 transition-all"
                            style={{ width: `${rec.progressPercent}%` }}
                          />
                        </div>
                      )}
                      {rec.status === 'error' && rec.errorMessage && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 max-w-xl">
                          <strong>{rec.errorCode}:</strong> {rec.errorMessage}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      {rec.status === 'completed' ? (
                        !rec.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold bg-amber-50 text-amber-900 border-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>Video đã tạo - Chờ giáo viên duyệt</span>
                          </span>
                        ) : rec.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold bg-emerald-50 text-emerald-800 border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã duyệt &amp; Xuất bản</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold bg-slate-100 text-slate-700 border-slate-300">
                            <EyeOff className="w-3 h-3" />
                            <span>Đã duyệt - Đang ẩn</span>
                          </span>
                        )
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${statusInfo.badgeClass}`}
                        >
                          {rec.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>{statusInfo.label}</span>
                        </span>
                      )}
                      {rec.draftVideo && rec.isPublished && (
                        <div className="text-[10px] text-amber-700 font-semibold mt-1">
                          Có bản mới v{rec.draftVideo.version} chờ duyệt thay thế
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-semibold text-slate-700 tabular-nums">
                      <div>{formatDuration(rec.draftVideo?.durationSeconds ?? rec.durationSeconds ?? rec.script?.targetDurationSeconds)}</div>
                      {rec.fileSizeBytes && (
                        <div className="text-[10px] text-slate-400">{formatFileSize(rec.fileSizeBytes)}</div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {rec.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <Eye className="w-3 h-3" />
                          <span>Đang hiển thị</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                          <EyeOff className="w-3 h-3" />
                          <span>Chưa xuất bản</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          onClick={() => openScriptEditor(rec)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center space-x-1 cursor-pointer"
                          title="Xem & chỉnh sửa kịch bản / phụ đề"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{rec.script ? 'Sửa kịch bản' : 'Xem kịch bản'}</span>
                        </button>

                        <button
                          onClick={() => handleGenerateScript(rec.lessonId)}
                          disabled={isBusy}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold disabled:opacity-50 cursor-pointer"
                          title="Dùng AI tạo/làm mới kịch bản từ nội dung bài học"
                        >
                          Tạo kịch bản AI
                        </button>

                        <button
                          onClick={() => handleGenerateSingleVideo(rec.lessonId)}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Video className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {rec.status === 'completed' || rec.isPublished
                              ? 'Tạo lại video'
                              : 'TẠO VIDEO TỪNG BÀI'}
                          </span>
                        </button>

                        {hasPreviewableVideo && (
                          <button
                            onClick={() => setPreviewRecord(rec)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>
                              {rec.draftVideo && rec.isPublished
                                ? 'Xem & Thay thế'
                                : rec.isPublished
                                ? 'Xem trước'
                                : 'Xem & Duyệt'}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => openExternalLinkModal(rec)}
                          disabled={isBusy}
                          className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center space-x-1 cursor-pointer border ${
                            rec.externalVideo?.normalizedUrl
                              ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                              : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                          title="Gắn link video từ Google Drive / YouTube / Kho lưu trữ cố định"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>{rec.externalVideo?.normalizedUrl ? 'Sửa link' : 'Gắn link'}</span>
                        </button>

                        {(() => {
                          const localMp4Url =
                            rec.draftVideo?.videoUrl && rec.draftVideo.videoUrl.startsWith('/api/videos/media/')
                              ? rec.draftVideo.videoUrl
                              : rec.videoUrl && rec.videoUrl.startsWith('/api/videos/media/')
                              ? rec.videoUrl
                              : null;
                          if (!localMp4Url) return null;
                          return (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingDriveUpload({
                                    lessonIds: [rec.lessonId],
                                    title: `Đẩy video Bài ${rec.lessonNumber} lên Google Drive`,
                                  })
                                }
                                disabled={isBusy || driveUploading}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold flex items-center space-x-1 cursor-pointer"
                                title="Tải thẳng video MP4 này lên Google Drive của cô & gắn link vĩnh viễn"
                              >
                                <CloudUpload className="w-3.5 h-3.5" />
                                <span>Đẩy Drive</span>
                              </button>

                              <a
                                href={`${withToken(localMp4Url)}&download=1`}
                                download={`${rec.lessonId}.mp4`}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center space-x-1"
                                title="Tải tệp MP4 về máy tính"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Tải MP4</span>
                              </a>
                            </>
                          );
                        })()}

                        {rec.isPublished && (
                          <button
                            onClick={() => handleUnpublish(rec.lessonId)}
                            disabled={isBusy}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                          >
                            Ẩn
                          </button>
                        )}

                        {rec.status === 'error' && (
                          <button
                            onClick={() => handleResetError(rec.lessonId)}
                            className="px-2 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold cursor-pointer"
                          >
                            Đặt lại
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SCRIPT & SCENES EDITOR */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Biên tập Kịch bản & Phụ đề: {editingRecord.lessonTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Giáo viên có thể rà soát, chỉnh sửa lời thuyết minh, thời lượng từng cảnh và phụ đề WebVTT trước hoặc sau khi tạo video.
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề video bài giảng:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phong cách giọng đọc AI:</label>
                <input
                  type="text"
                  value={editVoiceStyle}
                  onChange={(e) => setEditVoiceStyle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Tóm tắt mục tiêu bài giảng:</label>
              <textarea
                rows={2}
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>
                  Chi tiết {editScenes.length} cảnh (Tổng thời lượng dự kiến:{' '}
                  {formatDuration(editScenes.reduce((s, sc) => s + (Number(sc.durationSeconds) || 0), 0))})
                </span>
              </div>

              {editScenes.map((sc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-black text-teal-800">
                      Cảnh {idx + 1} ({sc.phase})
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-slate-600 font-semibold">Thời lượng (giây):</label>
                      <input
                        type="number"
                        min={10}
                        max={180}
                        value={sc.durationSeconds}
                        onChange={(e) => {
                          const next = [...editScenes];
                          next[idx] = { ...sc, durationSeconds: Number(e.target.value) || 30 };
                          setEditScenes(next);
                        }}
                        className="w-20 p-1.5 rounded-lg border border-slate-200 bg-white text-center font-bold"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={sc.title}
                    onChange={(e) => {
                      const next = [...editScenes];
                      next[idx] = { ...sc, title: e.target.value };
                      setEditScenes(next);
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                    placeholder="Tiêu đề cảnh..."
                  />

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Lời giảng thuyết minh (tiếng Việt):</label>
                    <textarea
                      rows={3}
                      value={sc.narration}
                      onChange={(e) => {
                        const next = [...editScenes];
                        next[idx] = { ...sc, narration: e.target.value };
                        setEditScenes(next);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Phụ đề hiển thị (WebVTT):</label>
                    <input
                      type="text"
                      value={sc.subtitleText}
                      onChange={(e) => {
                        const next = [...editScenes];
                        next[idx] = { ...sc, subtitleText: e.target.value };
                        setEditScenes(next);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveScriptEdits}
                disabled={savingScript}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {savingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Lưu kịch bản & Phụ đề</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIDEO PREVIEW & APPROVE / REPLACE */}
      {previewRecord && (() => {
        const previewUrl = previewRecord.draftVideo?.videoUrl || previewRecord.videoUrl || '';
        const isPreviewIframe = Boolean(
          previewRecord.externalVideo?.playbackType === 'iframe' &&
            previewUrl === previewRecord.externalVideo.normalizedUrl
        );
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Xem trước & Duyệt xuất bản: {previewRecord.lessonTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewRecord.externalVideo?.normalizedUrl
                      ? `Nguồn lưu trữ bền vững: ${getExternalProviderLabel(previewRecord.externalVideo.provider)} • Thời lượng ${formatDuration(previewRecord.draftVideo?.durationSeconds ?? previewRecord.durationSeconds)}`
                      : previewRecord.draftVideo && previewRecord.isPublished
                      ? `Đang xem phiên bản mới v${previewRecord.draftVideo.version} (Chờ duyệt thay thế bản đang xuất bản)`
                      : `Phiên bản v${previewRecord.version} • Thời lượng ${formatDuration(previewRecord.draftVideo?.durationSeconds ?? previewRecord.durationSeconds)}`}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800">
                {isPreviewIframe ? (
                  <iframe
                    key={`${previewRecord.lessonId}-${previewUrl}`}
                    src={previewUrl}
                    title={previewRecord.lessonTitle}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={`${previewRecord.lessonId}-${previewRecord.draftVideo?.version || previewRecord.version}-${previewUrl}`}
                    ref={previewVideoRef}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full"
                    src={withToken(previewUrl)}
                    onLoadedMetadata={() => {
                      const el = previewVideoRef.current;
                      if (el && el.textTracks && el.textTracks.length > 0) {
                        el.textTracks[0].mode = subtitlesOn ? 'showing' : 'hidden';
                      }
                    }}
                  >
                    {(previewRecord.draftVideo?.subtitleUrl || previewRecord.subtitleUrl) && (
                      <track
                        kind="subtitles"
                        srcLang="vi"
                        label="Tiếng Việt"
                        src={withToken(previewRecord.draftVideo?.subtitleUrl || previewRecord.subtitleUrl)}
                        default={subtitlesOn}
                      />
                    )}
                  </video>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {!isPreviewIframe ? (
                  <button
                    onClick={() => setSubtitlesOn((v) => !v)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {subtitlesOn ? 'Phụ đề tiếng Việt: ĐANG BẬT' : 'Phụ đề tiếng Việt: ĐANG TẮT'}
                  </button>
                ) : (
                  <span className="text-[11px] text-indigo-700 font-semibold">
                    Đang phát trực tiếp qua {getExternalProviderLabel(previewRecord.externalVideo?.provider)} (bền vững khi máy chủ khởi động lại)
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewRecord(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => handleApproveVideo(previewRecord.lessonId)}
                    disabled={busyLessonId === previewRecord.lessonId}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {previewRecord.draftVideo && previewRecord.isPublished
                        ? 'Duyệt & Thay thế video cũ'
                        : previewRecord.isPublished
                        ? 'Đã xuất bản'
                        : 'Duyệt & Xuất bản cho học sinh'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* MODAL: CONFIRM BULK APPROVE ALL */}
      {confirmBulkApproveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Duyệt &amp; Xuất bản tất cả
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xuất bản đồng loạt lên trang học sinh
                  </p>
                </div>
              </div>
              <button
                onClick={() => !bulkApproving && setConfirmBulkApproveOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                Hệ thống sẽ duyệt và xuất bản công khai{' '}
                <strong className="text-emerald-700">{stats.readyToApprove} bài học</strong>{' '}
                đã tạo xong tệp video .mp4 hoàn chỉnh lên giao diện học sinh.
              </p>
              <p className="text-slate-500">
                Các bài chưa tạo xong video (nếu có) sẽ tự động được bỏ qua. Sau khi xuất bản, giáo viên vẫn có thể bấm nút <strong>Ẩn</strong> trên từng bài bất cứ lúc nào.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmBulkApproveOpen(false)}
                disabled={bulkApproving}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkApproveAll}
                disabled={bulkApproving || stats.readyToApprove === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                {bulkApproving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Xác nhận duyệt {stats.readyToApprove} bài</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE LESSON EXTERNAL PERSISTENT LINK */}
      {linkModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Gắn link video bền vững – Bài {linkModalRecord.lessonNumber}
                  </h3>
                  <p className="text-xs text-slate-500">{linkModalRecord.lessonTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setLinkModalRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đường dẫn video (Google Drive / YouTube / Link .mp4 cố định):
                </label>
                <input
                  type="url"
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {parsedSingleLink && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-[11px] ${
                      parsedSingleLink.valid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {parsedSingleLink.valid ? (
                      <div className="space-y-0.5">
                        <div className="font-bold">
                          Nhận diện: {getExternalProviderLabel(parsedSingleLink.provider)} (
                          {parsedSingleLink.playbackType === 'iframe' ? 'Phát nhúng iframe' : 'Phát MP4 trực tiếp'})
                        </div>
                        <div className="text-[10px] break-all text-emerald-700">
                          Chuẩn hóa: {parsedSingleLink.normalizedUrl}
                        </div>
                      </div>
                    ) : (
                      <div className="font-semibold">{parsedSingleLink.error}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thời lượng hiển thị (phút:giây hoặc giây):
                  </label>
                  <input
                    type="text"
                    value={linkDurationInput}
                    onChange={(e) => setLinkDurationInput(e.target.value)}
                    placeholder="Ví dụ: 5:30"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ghi chú lưu trữ (tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={linkNoteInput}
                    onChange={(e) => setLinkNoteInput(e.target.value)}
                    placeholder="VD: Drive cô Hạnh - Bản chuẩn 2026"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkAutoApprove}
                  onChange={(e) => setLinkAutoApprove(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">
                  Duyệt &amp; xuất bản ngay cho học sinh xem sau khi lưu
                </span>
              </label>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mẹo Google Drive: Mở tệp MP4 trên Drive → bấm <strong>Chia sẻ</strong> → chọn{' '}
                <strong>Bất kỳ ai có đường liên kết (Người xem)</strong> → sao chép đường liên kết dán vào đây.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div>
                {linkModalRecord.externalVideo?.normalizedUrl && (
                  <button
                    onClick={handleRemoveSingleExternalLink}
                    disabled={removingExternalLink || savingExternalLink}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Gỡ link ngoài</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLinkModalRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSingleExternalLink}
                  disabled={savingExternalLink || !parsedSingleLink?.valid}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  {savingExternalLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu link bền vững</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BULK 40 LINKS, JSON BACKUP/RESTORE & GOOGLE DRIVE GUIDE */}
      {bulkLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Kho Link Video Bền Vững (Google Drive / Cloud) &amp; Sao Lưu 40 Bài
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lưu trữ video trên Google Drive hoặc Cloud ngoài và đồng bộ tệp JSON sao lưu để 40 video không bao giờ bị mất khi máy chủ khởi động lại.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBulkLinkModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 text-xs">
              <button
                onClick={() => setBulkTab('paste')}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer ${
                  bulkTab === 'paste'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Dán hàng loạt 40 link</span>
              </button>
              <button
                onClick={() => setBulkTab('backup')}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer ${
                  bulkTab === 'backup'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Sao lưu &amp; Khôi phục (.json)</span>
              </button>
              <button
                onClick={() => setBulkTab('guide')}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer ${
                  bulkTab === 'guide'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Hướng dẫn Google Drive</span>
              </button>
            </div>

            {bulkTab === 'paste' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1">
                  <div className="font-bold">Hỗ trợ nhiều định dạng dán nhanh (mỗi bài 1 dòng):</div>
                  <div className="text-[11px] font-mono text-indigo-800 space-y-0.5">
                    <div>bai-1 | https://drive.google.com/file/d/1ABC.../view | 5:30</div>
                    <div>2: https://drive.google.com/file/d/1DEF.../view</div>
                    <div>Hoặc dán lần lượt các URL theo thứ tự từ Bài 1 đến Bài 40</div>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`bai-1 | https://drive.google.com/file/d/.../view | 5:20\nbai-2 | https://drive.google.com/file/d/.../view | 6:10`}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-white font-mono text-[11px] focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />

                {parsedBulkLines.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                      <span>
                        Đã phân tích {parsedBulkLines.length} dòng:{' '}
                        <span className="text-emerald-700">
                          {parsedBulkLines.filter((l) => l.lessonId && l.parseResult.valid).length} hợp lệ
                        </span>
                        {parsedBulkLines.some((l) => !l.lessonId || !l.parseResult.valid) && (
                          <span className="text-rose-700 ml-2">
                            • {parsedBulkLines.filter((l) => !l.lessonId || !l.parseResult.valid).length} dòng lỗi
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 text-[11px]">
                      {parsedBulkLines.slice(0, 40).map((line) => (
                        <div
                          key={line.lineNumber}
                          className={`px-2 py-1 rounded-lg flex items-center justify-between gap-2 ${
                            line.lessonId && line.parseResult.valid
                              ? 'bg-emerald-50 text-emerald-900'
                              : 'bg-rose-50 text-rose-900'
                          }`}
                        >
                          <span className="font-bold shrink-0">
                            Dòng {line.lineNumber} → {line.lessonId || 'Không rõ bài'}
                          </span>
                          <span className="truncate">
                            {line.parseResult.valid
                              ? `${getExternalProviderLabel(line.parseResult.provider)}: ${line.parseResult.normalizedUrl}`
                              : line.parseResult.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkAutoApprove}
                    onChange={(e) => setBulkAutoApprove(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Duyệt &amp; xuất bản đồng loạt tất cả các bài hợp lệ lên trang học sinh
                  </span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setBulkLinkModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleSaveBulkLinks}
                    disabled={
                      savingBulkLinks ||
                      parsedBulkLines.filter((l) => l.lessonId && l.parseResult.valid).length === 0
                    }
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    {savingBulkLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>
                      Áp dụng cho {parsedBulkLines.filter((l) => l.lessonId && l.parseResult.valid).length} bài
                    </span>
                  </button>
                </div>
              </div>
            )}

            {bulkTab === 'backup' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">
                    1. Tải tệp sao lưu 40 đường dẫn video (.json) về máy giáo viên
                  </div>
                  <p className="text-slate-600">
                    Hiện đang có <strong>{stats.externalLinked}/40 bài</strong> đã gắn link bền vững (đồng thời lưu tại{' '}
                    <code>data/external_video_links.json</code> trên máy chủ). Hãy tải tệp .json về máy để dự phòng an toàn tuyệt đối.
                  </p>
                  <button
                    onClick={handleExportBackupJson}
                    disabled={exportingBackup || stats.externalLinked === 0}
                    className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    {exportingBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>Tải xuống tệp sao lưu (.json) ({stats.externalLinked} bài)</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                  <div className="font-bold text-indigo-950">
                    2. Khôi phục nhanh toàn bộ 40 link từ tệp sao lưu (.json)
                  </div>
                  <p className="text-indigo-900">
                    Nếu chuyển máy chủ hoặc máy chủ vừa khởi động lại trắng dữ liệu, cô chỉ cần chọn lại tệp <code>.json</code> đã sao lưu — toàn bộ 40 video sẽ hoạt động lại ngay trong 1 giây, không cần tạo lại video.
                  </p>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restoreApprovalOnImport}
                      onChange={(e) => setRestoreApprovalOnImport(e.target.checked)}
                      className="rounded border-indigo-300 text-indigo-600"
                    />
                    <span className="font-semibold text-indigo-950">
                      Khôi phục nguyên trạng thái Đã duyệt &amp; Xuất bản cho học sinh
                    </span>
                  </label>
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportBackupFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => backupFileInputRef.current?.click()}
                    disabled={importingBackup}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    {importingBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Chọn tệp sao lưu (.json) để khôi phục ngay</span>
                  </button>
                </div>
              </div>
            )}

            {bulkTab === 'guide' && (
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="font-black text-emerald-900">
                    Quy trình chuẩn 3 bước để 40 video không bao giờ bị mất
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>
                      <strong>Tạo &amp; tải MP4 về máy:</strong> Sau khi bấm tạo video trên máy chủ, cô bấm nút{' '}
                      <strong>Tải MP4</strong> ngay tại dòng bài học đó để lưu tệp <code>.mp4</code> về máy tính.
                    </li>
                    <li>
                      <strong>Tải lên Google Drive cố định:</strong> Đưa 40 tệp MP4 vào một thư mục trên Google Drive của cô. Chọn từng tệp (hoặc cả nhóm) → <strong>Chia sẻ</strong> → chọn{' '}
                      <strong>Bất kỳ ai có đường liên kết</strong> (quyền <strong>Người xem</strong>).
                    </li>
                    <li>
                      <strong>Gắn link &amp; tải file JSON sao lưu:</strong> Mở tab <strong>Dán hàng loạt 40 link</strong> để dán 40 đường link Drive, bấm Áp dụng; sau đó sang tab{' '}
                      <strong>Sao lưu &amp; Khôi phục (.json)</strong> tải về 1 tệp <code>.json</code> cất cùng thư mục Drive đó. Học sinh sẽ xem video phát trực tiếp từ Google Drive mượt mà ngay cả khi máy chủ khởi động lại.
                    </li>
                  </ol>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ngoài Google Drive, hệ thống cũng tự động hỗ trợ link video YouTube (công khai / không công khai) và link MP4 trực tiếp từ Cloudflare R2, Firebase Storage hoặc AWS S3.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EXPLICIT USER CONFIRMATION FOR GOOGLE DRIVE UPLOAD */}
      {pendingDriveUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {pendingDriveUpload.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xác nhận lưu trữ video lên Google Drive cá nhân
                  </p>
                </div>
              </div>
              <button
                onClick={() => !driveUploading && setPendingDriveUpload(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                <div>
                  <strong>Số lượng:</strong> {pendingDriveUpload.lessonIds.length} video (.mp4)
                </div>
                <div>
                  <strong>Thư mục đích trên Google Drive:</strong> Địa lí 10 - Kho Video Bài Giảng
                </div>
                <div>
                  <strong>Thao tác thực hiện:</strong> Tải tệp <code>.mp4</code> lên Drive, bật quyền xem công khai (<em>Bất kỳ ai có đường liên kết - Người xem</em>), gắn link bền vững vào từng bài và cập nhật tệp sao lưu JSON trên Drive.
                </div>
              </div>

              {!driveToken && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-950">
                    Bước 1: Đăng nhập Google Drive để cấp quyền tải video
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {embeddedPreview && (
                      <a
                        href="/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600 text-xs font-extrabold flex items-center space-x-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở tab riêng để kết nối Drive</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDriveSignIn('firebase')}
                      disabled={driveSigningIn}
                      className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 shadow-xs text-slate-800 text-xs font-bold cursor-pointer disabled:opacity-60"
                    >
                      <span className="gsi-material-button-icon w-4 h-4 shrink-0">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </span>
                      <span className="gsi-material-button-contents">
                        {driveSigningIn ? 'Đang kết nối Google...' : 'Sign in with Google'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDriveSignIn('gis')}
                      disabled={driveSigningIn}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>Đăng nhập Drive (Trực tiếp)</span>
                    </button>

                    {!embeddedPreview && (
                      <button
                        type="button"
                        onClick={() => handleDriveSignIn('redirect')}
                        disabled={driveSigningIn}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Đăng nhập không dùng Pop-up</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={driveUploadAutoApprove}
                  onChange={(e) => setDriveUploadAutoApprove(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="font-semibold text-slate-800">
                  Duyệt &amp; xuất bản ngay cho học sinh sau khi tải xong lên Drive
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPendingDriveUpload(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDriveUpload}
                disabled={!driveToken || driveUploading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <CloudUpload className="w-4 h-4" />
                <span>Xác nhận tải lên Google Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPLICIT USER CONFIRMATION TO ENABLE AUTO-SYNC TO DRIVE */}
      {confirmEnableAutoDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Bật tự động đẩy video mới lên Google Drive?
              </h3>
              <button
                onClick={() => setConfirmEnableAutoDrive(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Khi bật chế độ này trong phiên làm việc hiện tại, mỗi bài học vừa tạo xong tệp <code>.mp4</code> trên máy chủ sẽ tự động được tải vào thư mục{' '}
              <strong>&ldquo;Địa lí 10 - Kho Video Bài Giảng&rdquo;</strong> trên Google Drive của cô, bật quyền xem cho học sinh và xuất bản ngay.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmEnableAutoDrive(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setAutoSyncNewToDrive(true);
                  setConfirmEnableAutoDrive(false);
                  setActionBanner({
                    type: 'success',
                    text: 'Đã bật chế độ tự động đẩy video mới tạo xong lên Google Drive.',
                  });
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Xác nhận bật tự động
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPLICIT USER CONFIRMATION TO SYNC BACKUP JSON TO DRIVE */}
      {confirmSyncBackupDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Lưu tệp sao lưu JSON lên Google Drive?
              </h3>
              <button
                onClick={() => !syncingDriveBackup && setConfirmSyncBackupDrive(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Thao tác này sẽ tạo hoặc cập nhật tệp <code>diali10-video-links-backup.json</code> ({stats.externalLinked} link bài giảng) trong thư mục{' '}
              <strong>&ldquo;Địa lí 10 - Kho Video Bài Giảng&rdquo;</strong> trên Google Drive của cô.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmSyncBackupDrive(false)}
                disabled={syncingDriveBackup}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSyncBackupToDrive}
                disabled={syncingDriveBackup}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                {syncingDriveBackup && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xác nhận lưu lên Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
