import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardPaste,
  Clock,
  FileSpreadsheet,
  Filter,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { ExamRecord } from '../types';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';
import {
  formatSlipDuration,
  parseResultSlips,
} from '../utils/resultSlip';
import { normalizeSchoolKey } from '../utils/normalize';
import { useLanguage } from '../contexts/LanguageContext';

interface ZaloScoreAggregatorProps {
  onDataChanged: () => void;
}

const SAMPLE_ZALO_SLIPS = `=== PHIẾU KẾT QUẢ ĐỊA LÍ 10 ===
Họ tên: Hoàng Văn Dũng
Mã HS: HB-1001
Lớp: 10A1
Trường: TRƯỜNG THPT HÒA BÌNH
Bài làm: Bài 1: Môn Địa lí với định hướng nghề nghiệp
Điểm số: 9.0/10 (Đúng 18/20 câu - 90%)
Thời gian làm bài: 5 phút 42 giây
Thời điểm nộp: 19/11/2026 08:15
Mã phiếu: zalo-sample-hb1001-b1
===============================

=== PHIẾU KẾT QUẢ ĐỊA LÍ 10 ===
Họ tên: Nông Thị Mai
Mã HS: HB-1002
Lớp: 10A1
Trường: TRƯỜNG THPT HÒA BÌNH
Bài làm: Bài 1: Môn Địa lí với định hướng nghề nghiệp
Điểm số: 8.5/10 (Đúng 17/20 câu - 85%)
Thời gian làm bài: 6 phút 18 giây
Thời điểm nộp: 19/11/2026 08:20
Mã phiếu: zalo-sample-hb1002-b1
===============================

=== PHIẾU KẾT QUẢ ĐỊA LÍ 10 ===
Họ tên: Lăng Thị Lan
Mã HS: HB-1004
Lớp: 10A2
Trường: TRƯỜNG THPT HÒA BÌNH
Bài làm: Đề kiểm tra 15 phút Địa lí 10
Điểm số: 7.5/10 (Đúng 15/20 câu - 75%)
Thời gian làm bài: 8 phút 05 giây
Thời điểm nộp: 19/11/2026 08:32
Mã phiếu: zalo-sample-hb1004-kt15
===============================`;

export const ZaloScoreAggregator: React.FC<ZaloScoreAggregatorProps> = ({
  onDataChanged,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [rawPaste, setRawPaste] = useState('');
  const [records, setRecords] = useState<ExamRecord[]>(() =>
    StorageService.getExamRecords()
  );
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'info' | 'warning';
    text: string;
  } | null>(null);

  // Gradebook filters & sort
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterTitle, setFilterTitle] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'rank' | 'newest'>('rank');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const existingIds = useMemo(() => new Set(records.map((r) => r.id)), [records]);

  const parsedPreview = useMemo(() => parseResultSlips(rawPaste), [rawPaste]);

  const newValidSlips = useMemo(
    () => parsedPreview.valid.filter((item) => !existingIds.has(item.record.id)),
    [parsedPreview.valid, existingIds]
  );

  const duplicateCountInPaste =
    parsedPreview.valid.length - newValidSlips.length;

  const handleImportSlips = () => {
    if (parsedPreview.valid.length === 0) {
      setStatusBanner({
        type: 'warning',
        text: isEn
          ? 'No valid result slips found. Please paste student slips copied from Zalo.'
          : 'Chưa nhận diện được phiếu kết quả hợp lệ nào. Cô vui lòng dán nội dung phiếu học sinh gửi qua Zalo.',
      });
      return;
    }

    const res = apiService.importExamRecords(
      parsedPreview.valid.map((item) => item.record)
    );
    const refreshed = StorageService.getExamRecords();
    setRecords(refreshed);
    onDataChanged();

    if (res.importedCount > 0) {
      setRawPaste('');
      setStatusBanner({
        type: 'success',
        text: isEn
          ? `Imported ${res.importedCount} new result slip(s) into the gradebook${
              res.duplicateCount > 0
                ? ` (${res.duplicateCount} duplicate skipped)`
                : ''
            }. All rankings and statistics are updated.`
          : `Đã tổng hợp thành công ${res.importedCount} phiếu kết quả mới vào bảng điểm${
              res.duplicateCount > 0
                ? ` (bỏ qua ${res.duplicateCount} phiếu đã tồn tại)`
                : ''
            }. Bảng xếp hạng và thống kê toàn hệ thống đã tự động cập nhật.`,
      });
    } else {
      setStatusBanner({
        type: 'info',
        text: isEn
          ? `All ${res.duplicateCount} pasted slip(s) were already in the gradebook.`
          : `Tất cả ${res.duplicateCount} phiếu vừa dán đều đã có trong bảng điểm trước đó.`,
      });
    }
  };

  const handleDeleteRow = (id: string) => {
    const updated = apiService.deleteExamRecord(id);
    setRecords(updated);
    setConfirmDeleteId(null);
    onDataChanged();
  };

  // Dynamic filter dropdown options (deduplicated by normalized school key)
  const schoolOptions = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      const k = normalizeSchoolKey(r.schoolName);
      if (k && !map.has(k)) map.set(k, r.schoolName);
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }, [records]);

  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .filter(
              (r) =>
                filterSchool === 'all' ||
                normalizeSchoolKey(r.schoolName) === filterSchool
            )
            .map((r) => r.className)
            .filter(Boolean)
        )
      ).sort(),
    [records, filterSchool]
  );
  const titleOptions = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.title).filter(Boolean))).sort(),
    [records]
  );

  // Filtered + Sorted Gradebook rows
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = records.filter((r) => {
      if (
        filterSchool !== 'all' &&
        normalizeSchoolKey(r.schoolName) !== filterSchool
      ) {
        return false;
      }
      if (filterClass !== 'all' && r.className !== filterClass) return false;
      if (filterTitle !== 'all' && r.title !== filterTitle) return false;
      if (q) {
        const hay = `${r.studentName} ${r.studentCode} ${r.className} ${r.schoolName} ${r.title}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortMode === 'rank') {
      return [...list].sort(
        (a, b) =>
          (Number(b.score) || 0) - (Number(a.score) || 0) ||
          (Number(a.durationSeconds) || 999999) - (Number(b.durationSeconds) || 999999) ||
          (b.timestamp || 0) - (a.timestamp || 0)
      );
    }
    return [...list].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [records, filterSchool, filterClass, filterTitle, searchQuery, sortMode]);

  // Summary KPIs
  const summaryStats = useMemo(() => {
    const count = filteredRows.length;
    if (count === 0) {
      return {
        count: 0,
        avgScore: 0,
        maxScore: 0,
        passRate: 0,
        goodRate: 0,
      };
    }
    const sum = filteredRows.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const max = Math.max(...filteredRows.map((r) => Number(r.score) || 0));
    const pass = filteredRows.filter((r) => (Number(r.score) || 0) >= 5.0).length;
    const good = filteredRows.filter((r) => (Number(r.score) || 0) >= 8.0).length;
    return {
      count,
      avgScore: Math.round((sum / count) * 100) / 100,
      maxScore: max,
      passRate: Math.round((pass / count) * 1000) / 10,
      goodRate: Math.round((good / count) * 1000) / 10,
    };
  }, [filteredRows]);

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const exportRows = filteredRows.map((r, idx) => ({
      [sortMode === 'rank' ? 'Xếp hạng' : 'STT']: idx + 1,
      'Họ và tên': r.studentName,
      'Mã HS': r.studentCode,
      Lớp: r.className,
      Trường: r.schoolName,
      'Bài làm': r.title,
      'Điểm số': Number(r.score) || 0,
      'Số câu đúng': `${r.correctCount}/${r.totalQuestions}`,
      'Tỉ lệ đúng (%)': r.accuracyRate,
      'Thời gian làm bài': formatSlipDuration(r.durationSeconds),
      'Thời gian (giây)': r.durationSeconds,
      'Ngày nộp': r.date || new Date(r.timestamp).toLocaleDateString('vi-VN'),
    }));

    const ws = XLSX.utils.json_to_sheet(
      exportRows.length > 0
        ? exportRows
        : [{ STT: 1, 'Họ và tên': 'Chưa có dữ liệu' }]
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TongHopPhieuZalo');
    const stamp = new Date().toISOString().slice(0, 10);
    const clsSuffix = filterClass !== 'all' ? `_${filterClass}` : '';
    XLSX.writeFile(wb, `Bang_Diem_Tong_Hop_DiaLi10${clsSuffix}_${stamp}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner + Paste Box */}
      <div className="bg-white rounded-3xl border border-teal-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-blue-800 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold tracking-wide uppercase">
              <ClipboardPaste className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isEn
                  ? 'Zalo Result Slip Aggregator (Browser LocalStorage)'
                  : 'Tổng hợp phiếu kết quả từ Zalo (Không cần máy chủ)'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold">
              {isEn
                ? 'Paste Student Result Slips to Build Gradebook & Rankings'
                : 'Dán phiếu kết quả học sinh gửi qua Zalo để tổng hợp bảng điểm'}
            </h2>
            <p className="text-xs text-teal-100 max-w-2xl leading-relaxed">
              {isEn
                ? 'Copy one or dozens of student result slips directly from your class Zalo group and paste them below. The system automatically parses names, classes, schools, scores, and durations, filters duplicates, and updates all rankings.'
                : 'Cô chỉ cần bôi đen, sao chép 1 hoặc hàng chục phiếu kết quả học sinh gửi trong nhóm Zalo lớp rồi dán vào ô bên dưới. Hệ thống sẽ tự tách Họ tên, Lớp, Trường, Điểm số, Thời gian làm bài, chống trùng lặp và lập bảng xếp hạng ngay lập tức.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setRawPaste(SAMPLE_ZALO_SLIPS);
                setStatusBanner(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isEn ? 'Load Sample Slips' : 'Dán thử 3 phiếu mẫu'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {statusBanner && (
            <div
              className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : statusBanner.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{statusBanner.text}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {isEn
                ? 'Paste student result slips from Zalo here (supports multiple slips at once):'
                : 'Ô dán phiếu kết quả học sinh (có thể dán cùng lúc nhiều tin nhắn từ nhóm Zalo):'}
            </label>
            <textarea
              value={rawPaste}
              onChange={(e) => {
                setRawPaste(e.target.value);
                setStatusBanner(null);
              }}
              rows={7}
              placeholder={`Dán phiếu kết quả học sinh vào đây, ví dụ:\n=== PHIẾU KẾT QUẢ ĐỊA LÍ 10 ===\nHọ tên: Nguyễn Văn An\nLớp: 10A1\nTrường: TRƯỜNG THPT HÒA BÌNH\nBài làm: Bài 1: Môn Địa lí với định hướng nghề nghiệp\nĐiểm số: 8.5/10 (Đúng 17/20 câu - 85%)\nThời gian làm bài: 6 phút 20 giây\n===============================`}
              className="w-full rounded-2xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 p-4 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/70 focus:bg-white outline-none transition"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {rawPaste.trim() && (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                    {isEn
                      ? `Valid new: ${newValidSlips.length}`
                      : `Phiếu mới hợp lệ: ${newValidSlips.length}`}
                  </span>
                  {duplicateCountInPaste > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                      {isEn
                        ? `Already saved: ${duplicateCountInPaste}`
                        : `Đã có sẵn: ${duplicateCountInPaste}`}
                    </span>
                  )}
                  {parsedPreview.errors.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                      {isEn
                        ? `Format warnings: ${parsedPreview.errors.length}`
                        : `Cảnh báo định dạng: ${parsedPreview.errors.length}`}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {rawPaste.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setRawPaste('');
                    setStatusBanner(null);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  {isEn ? 'Clear' : 'Xóa ô dán'}
                </button>
              )}
              <button
                type="button"
                onClick={handleImportSlips}
                disabled={parsedPreview.valid.length === 0}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isEn
                    ? `Import into Gradebook (${newValidSlips.length})`
                    : `Tổng hợp vào bảng điểm (${newValidSlips.length} phiếu mới)`}
                </span>
              </button>
            </div>
          </div>

          {/* Live Preview Table when pasting */}
          {rawPaste.trim() && (parsedPreview.valid.length > 0 || parsedPreview.errors.length > 0) && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {parsedPreview.errors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      {isEn
                        ? 'Some blocks could not be parsed:'
                        : 'Một số đoạn chưa đúng định dạng phiếu kết quả:'}
                    </span>
                  </div>
                  {parsedPreview.errors.map((err, i) => (
                    <div key={i} className="pl-5 text-amber-800">
                      • Đoạn #{err.blockIndex}: {err.reason}
                    </div>
                  ))}
                </div>
              )}

              {parsedPreview.valid.length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                    {isEn
                      ? `Preview Parsed Result Slips (${parsedPreview.valid.length})`
                      : `Xem trước dữ liệu nhận diện được (${parsedPreview.valid.length} phiếu)`}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">{isEn ? 'Student' : 'Họ tên'}</th>
                          <th className="py-2.5 px-3">{isEn ? 'Class' : 'Lớp'}</th>
                          <th className="py-2.5 px-3">{isEn ? 'School' : 'Trường'}</th>
                          <th className="py-2.5 px-3">{isEn ? 'Assessment' : 'Bài làm'}</th>
                          <th className="py-2.5 px-3 text-center">{isEn ? 'Score' : 'Điểm'}</th>
                          <th className="py-2.5 px-3">{isEn ? 'Duration' : 'Thời gian'}</th>
                          <th className="py-2.5 px-3 text-center">{isEn ? 'Status' : 'Trạng thái'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedPreview.valid.map((item, idx) => {
                          const isDup = existingIds.has(item.record.id);
                          return (
                            <tr key={item.record.id + idx} className={isDup ? 'bg-slate-50/70 text-slate-400' : ''}>
                              <td className="py-2 px-3 font-semibold">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{item.record.studentName}</td>
                              <td className="py-2 px-3 font-semibold">{item.record.className}</td>
                              <td className="py-2 px-3">{item.record.schoolName}</td>
                              <td className="py-2 px-3 max-w-[220px] truncate">{item.record.title}</td>
                              <td className="py-2 px-3 text-center font-extrabold text-teal-700">
                                {item.record.score}/10
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                {formatSlipDuration(item.record.durationSeconds)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {isDup ? (
                                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold">
                                    {isEn ? 'Duplicate' : 'Đã có'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    {isEn ? 'Ready' : 'Mới'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aggregated Gradebook & Ranking Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>
                {isEn
                  ? 'Aggregated Gradebook & Student Rankings'
                  : 'Bảng điểm tổng hợp & Xếp hạng học sinh'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn
                ? 'Includes both direct attempts on this browser and all imported Zalo result slips.'
                : 'Tự động tổng hợp gồm cả bài làm trực tiếp trên máy và toàn bộ phiếu kết quả cô đã dán từ Zalo.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer self-start md:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {isEn ? 'Export Gradebook (.xlsx)' : 'Xuất bảng điểm Excel (.xlsx)'}
            </span>
          </button>
        </div>

        {/* 5 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70">
            <div className="text-[11px] font-semibold text-blue-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{isEn ? 'Submissions' : 'Tổng bài nộp'}</span>
            </div>
            <div className="text-2xl font-black text-blue-950 mt-1">{summaryStats.count}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
            <div className="text-[11px] font-semibold text-emerald-800">
              {isEn ? 'Average Score' : 'Điểm trung bình'}
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {summaryStats.avgScore}
              <span className="text-xs font-bold text-emerald-700">/10</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
            <div className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{isEn ? 'Highest Score' : 'Điểm cao nhất'}</span>
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {summaryStats.maxScore}
              <span className="text-xs font-bold text-amber-700">/10</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/70">
            <div className="text-[11px] font-semibold text-teal-800">
              {isEn ? 'Pass Rate (≥ 5.0)' : 'Tỉ lệ Đạt (≥ 5.0)'}
            </div>
            <div className="text-2xl font-black text-teal-900 mt-1">{summaryStats.passRate}%</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-indigo-800">
              {isEn ? 'Excellent (≥ 8.0)' : 'Loại Giỏi (≥ 8.0)'}
            </div>
            <div className="text-2xl font-black text-indigo-900 mt-1">{summaryStats.goodRate}%</div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search student...' : 'Tìm họ tên, mã HS...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={filterSchool}
            onChange={(e) => {
              setFilterSchool(e.target.value);
              setFilterClass('all');
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-teal-500"
          >
            <option value="all">{isEn ? 'All Schools' : 'Tất cả các trường'}</option>
            {schoolOptions.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-teal-500"
          >
            <option value="all">{isEn ? 'All Classes' : 'Tất cả các lớp'}</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {isEn ? `Class ${c}` : `Lớp ${c}`}
              </option>
            ))}
          </select>

          <select
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-teal-500"
          >
            <option value="all">{isEn ? 'All Assessments' : 'Tất cả bài làm'}</option>
            {titleOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as 'rank' | 'newest')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="rank">{isEn ? 'Sort: Ranking (High → Low)' : 'Xếp hạng (Điểm cao → thấp)'}</option>
              <option value="newest">{isEn ? 'Sort: Newest First' : 'Mới nộp gần nhất'}</option>
            </select>
          </div>
        </div>

        {/* Gradebook Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                <th className="py-3 px-3.5 text-center w-16">
                  {sortMode === 'rank' ? (isEn ? 'Rank' : 'Hạng') : 'STT'}
                </th>
                <th className="py-3 px-3.5">{isEn ? 'Student' : 'Học sinh'}</th>
                <th className="py-3 px-3.5">{isEn ? 'Class / School' : 'Lớp / Trường'}</th>
                <th className="py-3 px-3.5">{isEn ? 'Assessment' : 'Tên bài làm'}</th>
                <th className="py-3 px-3.5 text-center">{isEn ? 'Score' : 'Điểm số'}</th>
                <th className="py-3 px-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Duration' : 'Thời gian'}</span>
                  </span>
                </th>
                <th className="py-3 px-3.5 text-center">{isEn ? 'Date' : 'Ngày nộp'}</th>
                <th className="py-3 px-3.5 text-center w-20">{isEn ? 'Action' : 'Xóa'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-500">
                    {isEn
                      ? 'No records match the current filter.'
                      : 'Chưa có dữ liệu điểm nào phù hợp bộ lọc. Hãy dán phiếu kết quả từ Zalo ở phía trên.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((rec, idx) => {
                  const rank = idx + 1;
                  const rankBadge =
                    sortMode === 'rank' && rank === 1
                      ? 'bg-amber-400 text-amber-950'
                      : sortMode === 'rank' && rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : sortMode === 'rank' && rank === 3
                          ? 'bg-orange-300 text-orange-950'
                          : 'bg-slate-100 text-slate-600';

                  const scoreBadge =
                    rec.score >= 8.0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : rec.score >= 6.5
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : rec.score >= 5.0
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${rankBadge}`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{rec.studentName}</div>
                        <div className="text-[11px] text-slate-500">{rec.studentCode}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800">{rec.className}</div>
                        <div className="text-[11px] text-slate-500 max-w-[180px] truncate">
                          {rec.schoolName}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="text-xs font-medium text-slate-800 max-w-[240px] line-clamp-2">
                          {rec.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {rec.correctCount}/{rec.totalQuestions} câu ({rec.accuracyRate}%)
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl font-black text-sm border ${scoreBadge}`}
                        >
                          {rec.score}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-xs text-slate-700 whitespace-nowrap font-medium">
                        {formatSlipDuration(rec.durationSeconds)}
                      </td>
                      <td className="py-3 px-3.5 text-center text-xs text-slate-500 whitespace-nowrap">
                        {rec.date || new Date(rec.timestamp).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {confirmDeleteId === rec.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(rec.id)}
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              {isEn ? 'Yes' : 'Xóa'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              {isEn ? 'No' : 'Hủy'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(rec.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title={isEn ? 'Delete record' : 'Xóa dòng điểm này'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
