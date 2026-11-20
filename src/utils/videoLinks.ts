import type { ExternalVideoProvider } from '../types/index.ts';

export interface ParsedExternalVideoUrl {
  valid: true;
  rawUrl: string;
  normalizedUrl: string;
  provider: ExternalVideoProvider;
  playbackType: 'iframe' | 'html5_video';
  fileId?: string;
}

export interface InvalidExternalVideoUrl {
  valid: false;
  error: string;
}

export type ExternalVideoParseResult = ParsedExternalVideoUrl | InvalidExternalVideoUrl;

export function parseDurationInput(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? Math.round(input) : null;
  }
  const clean = String(input).trim();
  if (!clean) return null;
  if (/^\d+$/.test(clean)) {
    const n = Number(clean);
    return n > 0 ? n : null;
  }
  const mmss = clean.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (mmss) {
    const mins = Number(mmss[1]);
    const secs = Number(mmss[2]);
    const total = mins * 60 + secs;
    return total > 0 ? total : null;
  }
  return null;
}

export function parseAndNormalizeExternalVideoUrl(rawInput: string): ExternalVideoParseResult {
  const rawUrl = String(rawInput || '').trim();
  if (!rawUrl) {
    return { valid: false, error: 'Đường dẫn video không được để trống.' };
  }

  // 0. Static bundled video files served from public/videos/ (works locally & on Vercel)
  if (rawUrl.startsWith('/videos/') && !rawUrl.includes('..') && /^\/videos\/[a-zA-Z0-9._/-]+$/.test(rawUrl)) {
    return {
      valid: true,
      rawUrl,
      normalizedUrl: rawUrl,
      provider: 'direct_url',
      playbackType: 'html5_video',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, error: 'Đường dẫn không đúng định dạng URL (cần bắt đầu bằng https://, http:// hoặc /videos/).' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { valid: false, error: 'Chỉ hỗ trợ liên kết https://, http:// hoặc đường dẫn /videos/.' };
  }

  const host = parsed.hostname.toLowerCase();

  // Reject Google Drive folder URLs with clear guidance
  if (
    (host.includes('drive.google.com') || host.includes('docs.google.com')) &&
    parsed.pathname.includes('/folders/')
  ) {
    return {
      valid: false,
      error:
        'Đây là link thư mục Google Drive. Vui lòng mở tệp video cụ thể, chọn Chia sẻ -> "Bất kỳ ai có đường liên kết" rồi dán link của tệp video.',
    };
  }

  // 1. Google Drive File URLs
  if (host.includes('drive.google.com') || host.includes('docs.google.com')) {
    const pathMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
    const queryId = parsed.searchParams.get('id');
    const fileId = pathMatch?.[1] || (queryId && /^[a-zA-Z0-9_-]{10,}$/.test(queryId) ? queryId : null);

    if (!fileId) {
      return {
        valid: false,
        error:
          'Không nhận diện được mã tệp Google Drive. Link hợp lệ có dạng: https://drive.google.com/file/d/.../view',
      };
    }

    return {
      valid: true,
      rawUrl,
      normalizedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      provider: 'google_drive',
      playbackType: 'iframe',
      fileId,
    };
  }

  // 2. YouTube URLs
  if (host === 'youtu.be' || host.endsWith('.youtube.com') || host === 'youtube.com') {
    let videoId: string | null = null;
    if (host === 'youtu.be') {
      const seg = parsed.pathname.replace(/^\/+/, '').split('/')[0];
      if (seg && /^[a-zA-Z0-9_-]{6,}$/.test(seg)) videoId = seg;
    } else if (parsed.pathname === '/watch') {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{6,}$/.test(v)) videoId = v;
    } else {
      const m = parsed.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{6,})/);
      if (m) videoId = m[1];
    }

    if (!videoId) {
      return {
        valid: false,
        error: 'Không nhận diện được mã video YouTube. Vui lòng kiểm tra lại đường dẫn.',
      };
    }

    return {
      valid: true,
      rawUrl,
      normalizedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
      provider: 'youtube',
      playbackType: 'iframe',
      fileId: videoId,
    };
  }

  // 3. Direct MP4 / Cloud Storage / R2 / S3 / Firebase Storage URL
  return {
    valid: true,
    rawUrl,
    normalizedUrl: rawUrl,
    provider: 'direct_url',
    playbackType: 'html5_video',
  };
}

export interface BulkParsedLine {
  lineNumber: number;
  lessonId: string | null;
  rawUrl: string;
  durationSeconds: number | null;
  note: string;
  parseResult: ExternalVideoParseResult;
}

export function parseBulkExternalLinksText(rawText: string): BulkParsedLine[] {
  const lines = String(rawText || '').split(/\r?\n/);
  const results: BulkParsedLine[] = [];
  let autoIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    let lessonId: string | null = null;
    let urlPart = '';
    let durationPart: string | undefined;
    let notePart = '';

    // Check formats:
    // "bai-1 | https://... | 7:45 | Ghi chú"
    // "bai-1, https://..." or "1: https://..." or "Bài 1: https://..."
    if (line.includes('|') || line.includes('\t')) {
      const cols = line.split(/\||\t/).map((c) => c.trim());
      const firstMatch = cols[0].match(/^(?:b[aà]i[\s_-]*)?(\d{1,2})$/i);
      if (firstMatch) {
        const num = Number(firstMatch[1]);
        if (num >= 1 && num <= 40) lessonId = `bai-${num}`;
        urlPart = cols[1] || '';
        durationPart = cols[2];
        notePart = cols[3] || '';
      } else if (/^https?:\/\//i.test(cols[0])) {
        if (autoIndex <= 40) lessonId = `bai-${autoIndex++}`;
        urlPart = cols[0];
        durationPart = cols[1];
        notePart = cols[2] || '';
      } else {
        urlPart = cols[1] || cols[0];
      }
    } else {
      const prefixMatch = line.match(/^(?:b[aà]i[\s_-]*)?(\d{1,2})\s*[:=,\-]\s*(https?:\/\/\S+)(?:\s+(.*))?$/i);
      if (prefixMatch) {
        const num = Number(prefixMatch[1]);
        if (num >= 1 && num <= 40) lessonId = `bai-${num}`;
        urlPart = prefixMatch[2].trim();
        durationPart = prefixMatch[3]?.trim();
      } else if (/^https?:\/\//i.test(line)) {
        const parts = line.split(/\s+/);
        urlPart = parts[0];
        durationPart = parts[1];
        if (autoIndex <= 40) lessonId = `bai-${autoIndex++}`;
      } else {
        urlPart = line;
      }
    }

    results.push({
      lineNumber: i + 1,
      lessonId,
      rawUrl: urlPart,
      durationSeconds: parseDurationInput(durationPart),
      note: notePart,
      parseResult: parseAndNormalizeExternalVideoUrl(urlPart),
    });
  }

  return results;
}

export function getExternalProviderLabel(provider?: ExternalVideoProvider | 'local' | null): string {
  if (provider === 'google_drive') return 'Google Drive';
  if (provider === 'youtube') return 'YouTube';
  if (provider === 'direct_url') return 'Video MP4 trực tiếp';
  return 'Máy chủ nội bộ';
}
