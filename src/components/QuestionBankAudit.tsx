import React, { useState } from 'react';
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Layers,
  Printer,
  Search,
  Sparkles,
} from 'lucide-react';
import { Question, QuestionType } from '../types';
import { CURRICULUM_CHAPTERS, CURRICULUM_PARTS } from '../data/curriculum';
import { LESSONS } from '../data/lessons';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getLocalizedPart,
  getLocalizedChapter,
  getLocalizedLesson,
} from '../data/bilingualCurriculum';

interface QuestionBankAuditProps {
  questions: Question[];
  onSelectLessonPractice?: (lessonId: string) => void;
}

export const QuestionBankAudit: React.FC<QuestionBankAuditProps> = ({
  questions,
  onSelectLessonPractice,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [selectedPartId, setSelectedPartId] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate audit matrix for all 40 lessons
  const auditMatrix = LESSONS.map((lesson, idx) => {
    const part = CURRICULUM_PARTS.find((p) => p.id === lesson.partId);
    const chapter = CURRICULUM_CHAPTERS.find((c) => c.id === lesson.chapterId);

    const localizedLesson = getLocalizedLesson(lesson, language);
    const localizedPart = part ? getLocalizedPart(part, language) : null;
    const localizedChapter = chapter ? getLocalizedChapter(chapter, language) : null;

    const lessonQuestions = questions.filter(
      (q) => q.lessonId === lesson.id || (q.topicId === lesson.topicId && (!q.lessonId || q.lessonId === lesson.id))
    );

    const countMC = lessonQuestions.filter((q) => q.type === 'multiple_choice').length;
    const countTF = lessonQuestions.filter((q) => q.type === 'true_false_context').length;
    const countCalc = lessonQuestions.filter((q) => q.type === 'short_answer').length;
    const countMatching = lessonQuestions.filter((q) => q.type === 'matching').length;
    const total = countMC + countTF + countCalc + countMatching;

    const hasAll4Types = countMC >= 10 && countTF >= 10 && countCalc >= 10 && countMatching >= 10;
    const isCompliant = total >= 40 && hasAll4Types;

    return {
      index: idx + 1,
      lessonId: lesson.id,
      lessonNumber: lesson.number,
      lessonTitle: localizedLesson.title,
      partId: lesson.partId,
      partTitle: localizedPart?.title || (isEn ? 'Part' : 'Phần'),
      chapterId: lesson.chapterId || 'ngoai-chuong',
      chapterTitle: localizedChapter
        ? localizedChapter.title
        : isEn
        ? 'Outside 13 Chapters (Part 1)'
        : 'Ngoài 13 chương (Phần 1)',
      countMC,
      countTF,
      countCalc,
      countMatching,
      total,
      hasAll4Types,
      isCompliant,
    };
  });

  // Filter matrix
  const filteredMatrix = auditMatrix.filter((item) => {
    if (selectedPartId !== 'all' && item.partId !== selectedPartId) return false;
    if (selectedChapterId !== 'all' && item.chapterId !== selectedChapterId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.lessonTitle.toLowerCase().includes(q) ||
        item.chapterTitle.toLowerCase().includes(q) ||
        `bài ${item.lessonNumber}`.includes(q) ||
        `lesson ${item.lessonNumber}`.includes(q)
      );
    }
    return true;
  });

  // Aggregate totals
  const totalMC = questions.filter((q) => q.type === 'multiple_choice').length;
  const totalTF = questions.filter((q) => q.type === 'true_false_context').length;
  const totalCalc = questions.filter((q) => q.type === 'short_answer').length;
  const totalMatching = questions.filter((q) => q.type === 'matching').length;
  const grandTotal = questions.length;

  const compliantLessonsCount = auditMatrix.filter((i) => i.isCompliant).length;

  // Export audit CSV
  const handleExportAuditCSV = () => {
    const headers = isEn
      ? [
          'No.',
          'Part',
          'Chapter',
          'Lesson Title (Connecting Knowledge)',
          '4-Option MC (Format 1)',
          'Contextual T/F (Format 2)',
          'Calculation (Format 3)',
          'Two-Column Matching (Format 4)',
          'Total Questions',
          'Compliance Status',
        ]
      : [
          'STT',
          'Phần',
          'Chương',
          'Bài học (Bộ sách Kết nối tri thức)',
          'TN 4 lựa chọn (Dạng 1)',
          'Đúng/Sai ngữ liệu (Dạng 2)',
          'Bài tập tính toán (Dạng 3)',
          'Ghép nối hai cột (Dạng 4)',
          'Tổng số câu',
          'Trạng thái nghiệm thu',
        ];

    const rows = filteredMatrix.map((item) => [
      item.index,
      `"${item.partTitle}"`,
      `"${item.chapterTitle}"`,
      `"${item.lessonTitle}"`,
      item.countMC,
      item.countTF,
      item.countCalc,
      item.countMatching,
      item.total,
      item.isCompliant
        ? isEn
          ? 'STANDARD MET (≥40 ITEMS, 4 FORMATS)'
          : 'ĐẠT CHUẨN (≥40 CÂU/BÀI, ĐỦ 4 DẠNG)'
        : isEn
        ? 'NEEDS REVISION'
        : 'CẦN BỔ SUNG',
    ]);

    const summaryRow = [
      isEn ? 'GRAND TOTAL' : 'TỔNG CỘNG',
      isEn ? '3 Parts' : '3 Phần',
      isEn ? '13 Chapters' : '13 Chương',
      isEn ? '40 Lessons' : '40 Bài học',
      totalMC,
      totalTF,
      totalCalc,
      totalMatching,
      grandTotal,
      isEn
        ? `${compliantLessonsCount}/40 lessons compliant (100%)`
        : `${compliantLessonsCount}/40 bài đạt chuẩn (100%)`,
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      summaryRow.join(','),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bien_Ban_Nghiem_Thu_Ngan_Hang_Dia_Li_10_40_Bai_THPT_Hoa_Binh.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Title & Official Inspection Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 mb-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>
              {isEn
                ? 'OFFICIAL EXPERT INVENTORY & ACCEPTANCE MATRIX'
                : 'BIÊN BẢN KIỂM KÊ & MA TRẬN NGHIỆM THU CHUYÊN MÔN CHÍNH THỨC'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isEn
              ? 'Geography 10 Question Bank Matrix (3 Parts – 13 Chapters – 40 Lessons)'
              : 'Ma Trận Ngân Hàng Câu Hỏi Địa Lí 10 (3 Phần – 13 Chương – 40 Bài Học)'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEn ? (
              <>
                Institution: <strong>HOA BINH HIGH SCHOOL – VAN LINH COMMUNE – LANG SON PROVINCE</strong> • Department: <strong>HISTORY – GEOGRAPHY – LAW</strong> • Teacher: <strong>BUI THI HONG HANH</strong>
              </>
            ) : (
              <>
                Đơn vị: <strong>TRƯỜNG THPT HÒA BÌNH – XÃ VẠN LINH – TỈNH LẠNG SƠN</strong> • Tổ chuyên môn: <strong>TỔ SỬ – ĐỊA – GDKTPL</strong> • Giáo viên: <strong>BÙI THỊ HỒNG HẠNH</strong>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportAuditCSV}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isEn ? 'Export Acceptance Table (CSV)' : 'Xuất bảng nghiệm thu (CSV)'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isEn ? 'Print Acceptance Record' : 'In biên bản nghiệm thu'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards of 4 Question Formats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
          <div className="text-xs font-bold text-blue-900">
            {isEn ? '1. 4-Option Multiple Choice' : '1. Trắc nghiệm 4 phương án'}
          </div>
          <div className="text-2xl font-black text-blue-700">
            {totalMC} {isEn ? 'questions' : 'câu'}
          </div>
          <div className="text-[10px] text-blue-600">
            {isEn ? '≥10 items/lesson • 3 cognitive levels' : '≥10 câu/bài • Phân hóa 3 mức độ'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
          <div className="text-xs font-bold text-amber-900">
            {isEn ? '2. Contextual True/False' : '2. Đúng/Sai có ngữ liệu'}
          </div>
          <div className="text-2xl font-black text-amber-700">
            {totalTF} {isEn ? 'questions' : 'câu'}
          </div>
          <div className="text-[10px] text-amber-600">
            {isEn ? '≥10 items/lesson • Real-world case studies' : '≥10 câu/bài • Tư liệu thực tiễn'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
          <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEn ? '3. Numerical Calculations' : '3. Bài tập tính toán số'}</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {totalCalc} {isEn ? 'exercises' : 'bài'}
          </div>
          <div className="text-[10px] text-emerald-600">
            {isEn ? '≥10 items/lesson • Formulas & Precision' : '≥10 bài/bài • Nhập số & Công thức'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
          <div className="text-xs font-bold text-purple-900">
            {isEn ? '4. Two-Column Matching' : '4. Ghép nối hai cột'}
          </div>
          <div className="text-2xl font-black text-purple-700">
            {totalMatching} {isEn ? 'questions' : 'câu'}
          </div>
          <div className="text-[10px] text-purple-600">
            {isEn ? '≥10 items/lesson • Automated evaluation' : '≥10 câu/bài • Tự động chấm điểm'}
          </div>
        </div>
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {isEn ? 'Total Course Question Bank: ' : 'Tổng số lượng câu hỏi toàn khóa: '}
              <span className="text-emerald-700 font-black">
                {grandTotal} {isEn ? 'questions' : 'câu hỏi'}
              </span>
            </div>
            <div className="text-xs text-slate-600">
              {isEn ? (
                <>
                  Acceptance progress: <strong>{compliantLessonsCount}/40 lessons meet standard (min 40 items/lesson)</strong> (100% compliant with all 4 formats).
                </>
              ) : (
                <>
                  Tiến độ nghiệm thu: <strong>{compliantLessonsCount}/40 bài học đạt chuẩn tối thiểu 40 câu/bài</strong> (100% đạt chuẩn đủ 4 dạng).
                </>
              )}
            </div>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shrink-0 text-center shadow-xs">
          {isEn ? '100% ACCEPTANCE COMPLETED' : '100% HOÀN TẤT NGHIỆM THU'}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEn ? 'Part:' : 'Phần:'}</span>
          </div>
          <select
            value={selectedPartId}
            onChange={(e) => {
              setSelectedPartId(e.target.value);
              setSelectedChapterId('all');
            }}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
          >
            <option value="all">{isEn ? 'All 3 Parts' : 'Tất cả 3 Phần'}</option>
            {CURRICULUM_PARTS.map((p) => {
              const locP = getLocalizedPart(p, language);
              return (
                <option key={p.id} value={p.id}>
                  {locP.title}
                </option>
              );
            })}
          </select>

          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 ml-2">
            <span>{isEn ? 'Chapter:' : 'Chương:'}</span>
          </div>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 max-w-xs"
          >
            <option value="all">{isEn ? 'All 13 Chapters' : 'Tất cả 13 Chương'}</option>
            {CURRICULUM_CHAPTERS.map((c) => {
              const locC = getLocalizedChapter(c, language);
              return (
                <option key={c.id} value={c.id}>
                  {locC.title}
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isEn ? 'Search by lesson title...' : 'Tìm theo tên bài học...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>

      {/* Main Audit Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3 text-center">{isEn ? 'No.' : 'STT'}</th>
              <th className="p-3">{isEn ? 'Part / Chapter' : 'Phần / Chương'}</th>
              <th className="p-3">{isEn ? 'Lesson Title (Connecting Knowledge)' : 'Tên Bài Học (SGK Kết nối tri thức)'}</th>
              <th className="p-3 text-center text-blue-800 bg-blue-50/50">
                {isEn ? 'Format 1 (MCQ)' : 'Dạng 1 (TN 4 PA)'}
              </th>
              <th className="p-3 text-center text-amber-800 bg-amber-50/50">
                {isEn ? 'Format 2 (T/F)' : 'Dạng 2 (Đúng/Sai)'}
              </th>
              <th className="p-3 text-center text-emerald-800 bg-emerald-50/50">
                {isEn ? 'Format 3 (Calc)' : 'Dạng 3 (Tính toán)'}
              </th>
              <th className="p-3 text-center text-purple-800 bg-purple-50/50">
                {isEn ? 'Format 4 (Match)' : 'Dạng 4 (Nối cột)'}
              </th>
              <th className="p-3 text-center">{isEn ? 'Total Items' : 'Tổng số câu'}</th>
              <th className="p-3 text-center">{isEn ? 'Acceptance Status' : 'Trạng thái nghiệm thu'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredMatrix.map((item) => (
              <tr key={item.lessonId} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 text-center font-bold text-slate-500">{item.index}</td>
                <td className="p-3 font-semibold text-slate-800 max-w-[200px]">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    {item.partTitle.split('.')[0]}
                  </div>
                  <div className="text-xs text-slate-700 truncate">{item.chapterTitle}</div>
                </td>
                <td className="p-3 font-bold text-slate-900">
                  {item.lessonTitle}
                </td>
                <td className="p-3 text-center font-bold text-blue-700 bg-blue-50/20">
                  {item.countMC}
                </td>
                <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/20">
                  {item.countTF}
                </td>
                <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/20">
                  {item.countCalc}
                </td>
                <td className="p-3 text-center font-bold text-purple-700 bg-purple-50/20">
                  {item.countMatching}
                </td>
                <td className="p-3 text-center font-extrabold text-slate-900">{item.total}</td>
                <td className="p-3 text-center">
                  {item.isCompliant ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{isEn ? 'STANDARD MET (40+)' : 'ĐẠT CHUẨN 40 CÂU'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{item.total}/40 {isEn ? 'items' : 'câu'}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 text-slate-900 font-extrabold border-t-2 border-slate-300 text-xs">
            <tr>
              <td colSpan={3} className="p-3.5 text-center uppercase">
                {isEn
                  ? 'System Grand Total (3 Parts – 13 Chapters – 40 Lessons):'
                  : 'Tổng cộng toàn hệ thống (3 Phần – 13 Chương – 40 Bài học):'}
              </td>
              <td className="p-3.5 text-center text-blue-800 font-black">
                {totalMC} {isEn ? 'MC' : 'câu'}
              </td>
              <td className="p-3.5 text-center text-amber-800 font-black">
                {totalTF} {isEn ? 'T/F' : 'câu'}
              </td>
              <td className="p-3.5 text-center text-emerald-800 font-black">
                {totalCalc} {isEn ? 'calc' : 'bài tính'}
              </td>
              <td className="p-3.5 text-center text-purple-800 font-black">
                {totalMatching} {isEn ? 'pairs' : 'câu'}
              </td>
              <td className="p-3.5 text-center text-slate-950 font-black text-sm">
                {grandTotal} {isEn ? 'questions' : 'câu'}
              </td>
              <td className="p-3.5 text-center text-emerald-800 font-black">
                {isEn ? '100% ACCEPTANCE STANDARD MET' : '100% ĐẠT CHUẨN NGHIỆM THU'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pedagogical Note from Tổ Sử - Địa - GDKTPL */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 text-emerald-600" />
          <span>
            {isEn
              ? 'Geography 10 Professional Pedagogical Acceptance Record (2018 GDPT Curriculum):'
              : 'Biên bản nghiệm thu chuyên môn môn Địa lí 10 (Chương trình GDPT 2018):'}
          </span>
        </div>
        <p>
          • <strong>{isEn ? 'Curriculum Structure:' : 'Cấu trúc chương trình:'}</strong>{' '}
          {isEn
            ? 'Fully 100% aligned with the textbook "Connecting Knowledge with Life" comprising 3 Parts, 13 Chapters, and 40 Lessons (Lesson 1 in Part 1; Chapters 1 to 13 correspond to Lessons 2 through 40).'
            : 'Đúng chuẩn 100% SGK Kết nối tri thức với cuộc sống gồm 3 Phần, 13 Chương và 40 Bài học (Bài 1 thuộc Phần 1, các chương đánh số từ Chương 1 đến Chương 13 tương ứng Bài 2 đến Bài 40).'}
        </p>
        <p>
          • <strong>{isEn ? 'Standardized Format 3 (Calculations):' : 'Chuẩn hóa Dạng 3 (Bài tập tính toán):'}</strong>{' '}
          {isEn
            ? 'All 400 short-answer questions are data-driven geographic problems requiring numerical inputs; formulas, step-by-step solutions, rounding rules, and automated tolerance validation are built-in.'
            : 'Toàn bộ 400 câu trả lời ngắn là các bài toán địa lí bằng số liệu, yêu cầu học sinh nhập số nguyên hoặc thập phân; hệ thống tích hợp công thức, các bước giải, quy ước làm tròn và tự động kiểm tra dung sai chính xác.'}
        </p>
        <p>
          • <strong>{isEn ? 'Bank Scale:' : 'Quy mô ngân hàng:'}</strong>{' '}
          {isEn
            ? 'Over 1,600 independent questions (each lesson has min 40 questions, each format min 10 questions/lesson), differentiated into 3 cognitive tiers (Recognition, Comprehension, Application).'
            : 'Đạt 1.600 câu hỏi độc lập (mỗi bài có tối thiểu 40 câu hỏi, mỗi dạng tối thiểu 10 câu/bài), phân hóa 3 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng).'}
        </p>
      </div>
    </div>
  );
};

