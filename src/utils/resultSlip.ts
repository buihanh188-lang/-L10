import { ExamRecord } from '../types';
import {
  normalizeClassName,
  normalizeSchoolName,
  normalizeStudentName,
} from './normalize';

export interface ParsedResultSlip {
  record: ExamRecord;
  slipId: string;
  rawBlock: string;
  submittedLabel: string;
}

export interface ResultSlipParseError {
  blockIndex: number;
  reason: string;
  preview: string;
}

export interface ResultSlipParseOutput {
  valid: ParsedResultSlip[];
  errors: ResultSlipParseError[];
}

export function formatSlipDuration(secs: number): string {
  const safe = Math.max(0, Math.round(Number(secs) || 0));
  const mins = Math.floor(safe / 60);
  const remSecs = safe % 60;
  if (mins > 0 && remSecs > 0) return `${mins} phút ${remSecs} giây`;
  if (mins > 0) return `${mins} phút 0 giây`;
  return `${remSecs} giây`;
}

export function formatSlipDateTime(timestamp: number): string {
  const d = new Date(timestamp || Date.now());
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatResultSlip(record: ExamRecord): string {
  const name = (record.studentName || '').trim() || 'Chưa rõ';
  const className = (record.className || '').trim() || 'Chưa rõ';
  const schoolName = (record.schoolName || '').trim() || 'THPT Hòa Bình';
  const studentCode = (record.studentCode || '').trim();
  const title = (record.title || '').trim() || 'Bài luyện tập Địa lí 10';
  const score = Number.isFinite(Number(record.score)) ? Number(record.score) : 0;
  const totalQ = Number(record.totalQuestions) || 0;
  const correctQ = Number(record.correctCount) || 0;
  const acc = Number.isFinite(Number(record.accuracyRate))
    ? Number(record.accuracyRate)
    : totalQ > 0
      ? Math.round((correctQ / totalQ) * 1000) / 10
      : Math.round(score * 10);
  const durationText = formatSlipDuration(record.durationSeconds);
  const submittedAt = formatSlipDateTime(record.timestamp || Date.now());
  const slipId = record.id || `zalo-${Date.now()}`;

  const lines = [
    '=== PHIẾU KẾT QUẢ ĐỊA LÍ 10 ===',
    `Họ tên: ${name}`,
    ...(studentCode ? [`Mã HS: ${studentCode}`] : []),
    `Lớp: ${className}`,
    `Trường: ${schoolName}`,
    `Bài làm: ${title}`,
    totalQ > 0
      ? `Điểm số: ${score}/10 (Đúng ${correctQ}/${totalQ} câu - ${acc}%)`
      : `Điểm số: ${score}/10`,
    `Thời gian làm bài: ${durationText}`,
    `Thời điểm nộp: ${submittedAt}`,
    `Mã phiếu: ${slipId}`,
    '===============================',
  ];

  return lines.join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to textarea below (works reliably inside iframes / mobile browsers)
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function stripDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function parseDurationToSeconds(raw: string): number {
  const clean = stripDiacritics(raw).toLowerCase().trim();
  if (!clean) return 0;

  // Format: "1 giờ 5 phút 20 giây" / "6 phút 25 giây" / "6p 25s" / "6m 25s"
  let total = 0;
  let matchedUnit = false;

  const hMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:gio|h|hr|hour|hours)\b/);
  if (hMatch) {
    total += parseFloat(hMatch[1].replace(',', '.')) * 3600;
    matchedUnit = true;
  }
  const mMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:phut|p|m|min|mins|minute|minutes)\b/);
  if (mMatch) {
    total += parseFloat(mMatch[1].replace(',', '.')) * 60;
    matchedUnit = true;
  }
  const sMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:giay|s|sec|secs|second|seconds)\b/);
  if (sMatch) {
    total += parseFloat(sMatch[1].replace(',', '.'));
    matchedUnit = true;
  }
  if (matchedUnit) return Math.max(0, Math.round(total));

  // Format: "mm:ss" or "hh:mm:ss"
  const colonMatch = clean.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (colonMatch) {
    if (colonMatch[3] !== undefined) {
      return (
        Number(colonMatch[1]) * 3600 +
        Number(colonMatch[2]) * 60 +
        Number(colonMatch[3])
      );
    }
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  // Fallback bare number (assume seconds)
  const bare = clean.match(/(\d+)/);
  return bare ? Number(bare[1]) : 0;
}

function parseSubmittedDate(raw: string): { timestamp: number; label: string } {
  const clean = (raw || '').trim();
  if (!clean) {
    const now = Date.now();
    return { timestamp: now, label: formatSlipDateTime(now) };
  }

  // DD/MM/YYYY HH:mm or DD-MM-YYYY HH:mm
  const vnMatch = clean.match(
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (vnMatch) {
    const day = Number(vnMatch[1]);
    const month = Number(vnMatch[2]) - 1;
    const year = Number(vnMatch[3]);
    const hour = vnMatch[4] ? Number(vnMatch[4]) : 12;
    const min = vnMatch[5] ? Number(vnMatch[5]) : 0;
    const sec = vnMatch[6] ? Number(vnMatch[6]) : 0;
    const d = new Date(year, month, day, hour, min, sec);
    if (!Number.isNaN(d.getTime())) {
      return { timestamp: d.getTime(), label: formatSlipDateTime(d.getTime()) };
    }
  }

  const parsed = Date.parse(clean);
  if (!Number.isNaN(parsed)) {
    return { timestamp: parsed, label: formatSlipDateTime(parsed) };
  }

  const now = Date.now();
  return { timestamp: now, label: clean };
}

function stableHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function inferLessonIdFromTitle(title: string): string | undefined {
  const m = stripDiacritics(title).match(/\bbai\s*(\d{1,2})\b/i);
  if (m) {
    const num = Number(m[1]);
    if (num >= 1 && num <= 40) return `bai-${num}`;
  }
  return undefined;
}

function inferModeFromTitle(
  title: string
): ExamRecord['mode'] {
  const norm = stripDiacritics(title).toLowerCase();
  if (
    norm.includes('kiem tra') ||
    norm.includes('de thi') ||
    norm.includes('khao sat') ||
    norm.includes('official') ||
    norm.includes('exam')
  ) {
    return 'official_test';
  }
  if (norm.includes('bai ')) return 'practice_topic';
  return 'practice_comprehensive';
}

interface ExtractedFields {
  studentName?: string;
  studentCode?: string;
  className?: string;
  schoolName?: string;
  title?: string;
  scoreRaw?: string;
  durationRaw?: string;
  submittedRaw?: string;
  slipId?: string;
}

function matchFieldLine(line: string): [keyof ExtractedFields, string] | null {
  // Strip leading bullets, emojis, quotes, markdown asterisks
  const cleaned = line
    .replace(/^[\s•\-\*▸►▶✅📌📝🎓🏫👤⏱📅🔖🆔>]+/u, '')
    .replace(/\*\*/g, '')
    .trim();
  if (!cleaned) return null;

  const sepIdx = cleaned.indexOf(':');
  if (sepIdx <= 0) return null;

  const rawKey = cleaned.slice(0, sepIdx).trim();
  const value = cleaned.slice(sepIdx + 1).trim();
  if (!value) return null;

  const key = stripDiacritics(rawKey).toLowerCase().replace(/\s+/g, ' ');

  if (
    key === 'ho ten' ||
    key === 'ho va ten' ||
    key === 'ten hoc sinh' ||
    key === 'hoc sinh' ||
    key === 'student' ||
    key === 'student name' ||
    key === 'full name' ||
    key === 'name'
  ) {
    return ['studentName', value];
  }
  if (
    key === 'ma hs' ||
    key === 'ma hoc sinh' ||
    key === 'student id' ||
    key === 'student code' ||
    key === 'code'
  ) {
    return ['studentCode', value];
  }
  if (key === 'lop' || key === 'ten lop' || key === 'class' || key === 'class name') {
    return ['className', value];
  }
  if (key === 'truong' || key === 'ten truong' || key === 'school' || key === 'school name') {
    return ['schoolName', value];
  }
  if (
    key === 'bai lam' ||
    key === 'ten bai' ||
    key === 'ten bai thi' ||
    key === 'de thi' ||
    key === 'bai kiem tra' ||
    key === 'bai tap' ||
    key === 'assessment' ||
    key === 'exam' ||
    key === 'title'
  ) {
    return ['title', value];
  }
  if (
    key === 'diem so' ||
    key === 'diem' ||
    key === 'ket qua' ||
    key === 'score'
  ) {
    return ['scoreRaw', value];
  }
  if (
    key === 'thoi gian lam bai' ||
    key === 'thoi gian' ||
    key === 'thoi luong' ||
    key === 'duration' ||
    key === 'time spent' ||
    key === 'time'
  ) {
    return ['durationRaw', value];
  }
  if (
    key === 'thoi diem nop' ||
    key === 'ngay nop' ||
    key === 'ngay lam' ||
    key === 'submitted' ||
    key === 'date'
  ) {
    return ['submittedRaw', value];
  }
  if (
    key === 'ma phieu' ||
    key === 'ma ket qua' ||
    key === 'slip id' ||
    key === 'id'
  ) {
    return ['slipId', value];
  }

  return null;
}

export function parseResultSlips(rawText: string): ResultSlipParseOutput {
  const valid: ParsedResultSlip[] = [];
  const errors: ResultSlipParseError[] = [];

  const text = String(rawText || '').trim();
  if (!text) return { valid, errors };

  const lines = text.split(/\r?\n/);

  interface DraftBlock {
    fields: ExtractedFields;
    rawLines: string[];
  }

  const blocks: DraftBlock[] = [];
  let current: DraftBlock | null = null;

  const isHeaderLine = (l: string) =>
    /^=+\s*(phi[eế]u\s*k[eế]t\s*qu[aả]|result\s*slip)/i.test(l.trim()) ||
    /^(phi[eế]u\s*k[eế]t\s*qu[aả]\s*đ[iị]a\s*l[ií])/i.test(l.trim());

  const isFooterLine = (l: string) => /^={5,}$/.test(l.trim()) || /^-{5,}$/.test(l.trim());

  const pushCurrent = () => {
    if (current && Object.keys(current.fields).length > 0) {
      blocks.push(current);
    }
    current = null;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (isHeaderLine(trimmed)) {
      pushCurrent();
      current = { fields: {}, rawLines: [trimmed] };
      continue;
    }

    if (isFooterLine(trimmed)) {
      if (current) {
        current.rawLines.push(trimmed);
        pushCurrent();
      }
      continue;
    }

    const matched = matchFieldLine(trimmed);
    if (matched) {
      const [fieldKey, fieldVal] = matched;
      // Start a new slip if we see a second Họ tên when the current slip already has one
      if (fieldKey === 'studentName' && current && current.fields.studentName) {
        pushCurrent();
      }
      if (!current) {
        current = { fields: {}, rawLines: [] };
      }
      if (!current.fields[fieldKey]) {
        current.fields[fieldKey] = fieldVal;
      }
      current.rawLines.push(trimmed);
    }
  }
  pushCurrent();

  if (blocks.length === 0) {
    errors.push({
      blockIndex: 1,
      reason: 'Không tìm thấy dòng dữ liệu phiếu kết quả hợp lệ (cần có ít nhất Họ tên và Điểm số).',
      preview: text.slice(0, 120),
    });
    return { valid, errors };
  }

  blocks.forEach((block, idx) => {
    const f = block.fields;
    const rawBlock = block.rawLines.join('\n');
    const preview = rawBlock.slice(0, 110);

    if (!f.studentName || !f.studentName.trim()) {
      errors.push({
        blockIndex: idx + 1,
        reason: 'Thiếu thông tin "Họ tên".',
        preview,
      });
      return;
    }

    if (!f.scoreRaw) {
      errors.push({
        blockIndex: idx + 1,
        reason: `Phiếu của "${f.studentName}" thiếu thông tin "Điểm số".`,
        preview,
      });
      return;
    }

    // Parse score (e.g., "8.5/10 (Đúng 17/20 câu - 85%)" or "8,5")
    const scoreNumMatch = f.scoreRaw.match(/(\d+(?:[.,]\d+)?)/);
    if (!scoreNumMatch) {
      errors.push({
        blockIndex: idx + 1,
        reason: `Không đọc được điểm số "${f.scoreRaw}" của "${f.studentName}".`,
        preview,
      });
      return;
    }

    const parsedScore = Math.min(
      10,
      Math.max(0, Math.round(parseFloat(scoreNumMatch[1].replace(',', '.')) * 10) / 10)
    );

    // Optional correct/total & accuracy inside parentheses
    const ratioMatch = f.scoreRaw.match(/(\d+)\s*\/\s*(\d+)\s*(?:c[aâ]u|q|questions)/i);
    const pctMatch = f.scoreRaw.match(/(\d+(?:[.,]\d+)?)\s*%/);

    const totalQuestions = ratioMatch ? Number(ratioMatch[2]) : 10;
    const correctCount = ratioMatch
      ? Math.min(totalQuestions, Number(ratioMatch[1]))
      : Math.round((parsedScore / 10) * totalQuestions);
    const wrongCount = Math.max(0, totalQuestions - correctCount);
    const accuracyRate = pctMatch
      ? Math.min(100, Math.max(0, parseFloat(pctMatch[1].replace(',', '.'))))
      : totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 1000) / 10
        : Math.round(parsedScore * 10);

    const studentName = normalizeStudentName(f.studentName);
    const className = normalizeClassName(f.className || '10A1');
    const schoolName = normalizeSchoolName(f.schoolName || 'TRƯỜNG THPT HÒA BÌNH');
    const title = (f.title || '').trim() || 'Bài luyện tập Địa lí 10 (Nhập từ Zalo)';
    const durationSeconds = parseDurationToSeconds(f.durationRaw || '');
    const { timestamp, label: submittedLabel } = parseSubmittedDate(f.submittedRaw || '');

    const slipId =
      (f.slipId || '').trim() ||
      `zalo-${stableHash(
        `${schoolName.toLowerCase()}|${className}|${studentName.toLowerCase()}|${title.toLowerCase()}|${parsedScore}|${durationSeconds}|${submittedLabel}`
      )}`;

    const studentCode =
      (f.studentCode || '').trim() ||
      `ZL-${stableHash(`${schoolName.toLowerCase()}|${className}|${studentName.toLowerCase()}`).slice(0, 6).toUpperCase()}`;

    const studentId = `hs-zalo-${stableHash(`${schoolName.toLowerCase()}|${className}|${studentName.toLowerCase()}`)}`;
    const lessonId = inferLessonIdFromTitle(title);

    const record: ExamRecord = {
      id: slipId,
      studentId,
      studentName,
      studentCode,
      schoolName,
      className,
      lessonId,
      lessonTitle: lessonId ? title : undefined,
      title,
      mode: inferModeFromTitle(title),
      timestamp,
      date: new Date(timestamp).toLocaleDateString('vi-VN'),
      durationSeconds,
      totalQuestions,
      answeredCount: totalQuestions,
      unansweredCount: 0,
      score: parsedScore,
      correctCount,
      wrongCount,
      accuracyRate,
      language: 'vi',
      details: [],
      topicBreakdown: {},
      typeBreakdown: {
        multiple_choice: { total: 0, correct: 0 },
        true_false_context: { total: 0, correct: 0 },
        short_answer: { total: 0, correct: 0 },
        matching: { total: 0, correct: 0 },
      },
      weakTopics: [],
      strongTopics: [],
      recommendation:
        parsedScore >= 8
          ? 'Kết quả tốt! Tiếp tục phát huy tinh thần tự học môn Địa lí 10.'
          : parsedScore >= 5
            ? 'Đạt yêu cầu. Cần ôn tập thêm các dạng bài vận dụng và tính toán.'
            : 'Cần ôn tập lại kiến thức trọng tâm và thực hành thêm các bài luyện tập.',
    };

    valid.push({
      record,
      slipId,
      rawBlock,
      submittedLabel,
    });
  });

  return { valid, errors };
}
