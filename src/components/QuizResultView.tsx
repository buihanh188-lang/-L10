import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Home,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { ExamRecord, Question } from '../types';
import { TOPICS } from '../data/topics';
import { getLocalizedTopic } from '../data/bilingualCurriculum';
import { useLanguage } from '../contexts/LanguageContext';
import {
  localizeExamTitle,
  localizeQuestion,
  localizeRecommendationText,
  localizeStoredAnswerText,
} from '../services/bilingualQuestions';

interface QuizResultViewProps {
  record: ExamRecord;
  questions: Question[];
  onRetry: () => void;
  onHome: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  record,
  questions,
  onRetry,
  onHome,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    if (record.score >= 8.0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [record.score]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return isEn ? `${m} min ${s} sec` : `${m} phút ${s} giây`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (score >= 8.0) return 'text-blue-600 bg-blue-50 border-blue-300';
    if (score >= 6.5) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-rose-600 bg-rose-50 border-rose-300';
  };

  const getScoreRating = (score: number) => {
    if (score >= 9.0) {
      return {
        title: isEn ? 'Outstanding!' : 'Xuất sắc!',
        sub: isEn
          ? 'You have flawlessly mastered Grade 10 Geography!'
          : 'Bạn đã làm chủ hoàn hảo kiến thức Địa lí 10!',
      };
    }
    if (score >= 8.0) {
      return {
        title: isEn ? 'Proficient / Good!' : 'Giỏi!',
        sub: isEn
          ? 'Impressive score with sharp geographic reasoning!'
          : 'Kết quả rất ấn tượng, tư duy địa lí rất tốt!',
      };
    }
    if (score >= 6.5) {
      return {
        title: isEn ? 'Fair / Competent!' : 'Khá!',
        sub: isEn
          ? 'Firm grasp of fundamentals, practice more numerical calculations.'
          : 'Nắm vững kiến thức cơ bản, cần rèn thêm bài tập vận dụng.',
      };
    }
    if (score >= 5.0) {
      return {
        title: isEn ? 'Average' : 'Trung bình',
        sub: isEn
          ? 'Review core concepts, formulas, and textbook definitions.'
          : 'Cần ôn lại các khái niệm và công thức tính toán.',
      };
    }
    return {
      title: isEn ? 'Needs More Practice' : 'Cần cố gắng nhiều hơn',
      sub: isEn
        ? 'Re-read lesson objectives and retake this practice session.'
        : 'Hãy xem lại mục tiêu bài học và làm lại bài luyện tập.',
    };
  };

  const rating = getScoreRating(record.score);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Hero Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-500" />

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
          <Award className="w-4 h-4 text-amber-500" />
          <span>{isEn ? 'OFFICIAL ASSESSMENT SCORE REPORT' : 'KẾT QUẢ ĐÁNH GIÁ CHÍNH THỨC'}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{localizeExamTitle(record.title, language)}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {isEn ? 'Student:' : 'Học sinh:'} <strong className="text-slate-800">{record.studentName}</strong> ({record.className}) • {isEn ? 'Student ID:' : 'Mã HS:'} {record.studentCode}
        </p>

        {/* Big Score Display */}
        <div className="my-6 flex flex-col items-center">
          <div
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 ${getScoreColor(
              record.score
            )}`}
          >
            <span className="text-4xl font-extrabold tracking-tight">{record.score}</span>
            <span className="text-xs font-bold uppercase tracking-wider mt-0.5">
              {isEn ? '10-Point Scale' : 'Thang điểm 10'}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-900">{rating.title}</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-0.5">{rating.sub}</p>
          </div>
        </div>

        {/* 4 Key Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-center space-x-1 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold">{isEn ? 'Correct Answers' : 'Câu đúng'}</span>
            </div>
            <div className="text-xl font-bold text-slate-900">{record.correctCount}</div>
            <div className="text-[11px] text-slate-500">/{record.totalQuestions} {isEn ? 'questions' : 'câu'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-center space-x-1 text-rose-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">{isEn ? 'Incorrect' : 'Câu sai'}</span>
            </div>
            <div className="text-xl font-bold text-slate-900">{record.wrongCount}</div>
            <div className="text-[11px] text-slate-500">
              {record.unansweredCount && record.unansweredCount > 0
                ? (isEn ? `${record.unansweredCount} unanswered` : `${record.unansweredCount} chưa trả lời`)
                : (isEn ? 'needs review' : 'cần rèn luyện')}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">{isEn ? 'Accuracy Rate' : 'Tỉ lệ chính xác'}</span>
            </div>
            <div className="text-xl font-bold text-slate-900">{record.accuracyRate}%</div>
            <div className="text-[11px] text-slate-500">{isEn ? 'score achieved' : 'tổng điểm đạt'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-center space-x-1 text-slate-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">{isEn ? 'Time Spent' : 'Thời gian'}</span>
            </div>
            <div className="text-sm font-bold text-slate-900 pt-1">
              {formatDuration(record.durationSeconds)}
            </div>
            <div className="text-[11px] text-slate-500">{isEn ? 'completion time' : 'hoàn thành bài'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 transition-all hover:scale-102 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isEn ? 'Retake This Test' : 'Làm lại bài này'}</span>
          </button>
          <button
            onClick={onHome}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{isEn ? 'Back to Home' : 'Về trang chủ'}</span>
          </button>
        </div>
      </div>

      {/* Recommendations & Pedagogical Guidance */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
          <AlertCircle className="w-4 h-4 text-emerald-600" />
          <span>
            {isEn
              ? 'PEDAGOGICAL GUIDANCE & FEEDBACK FROM TEACHER BUI THI HONG HANH (DEPT OF HISTORY – GEOGRAPHY – LAW)'
              : 'LỜI KHUYÊN & ĐỊNH HƯỚNG TỪ GIÁO VIÊN BÙI THỊ HỒNG HẠNH (TỔ SỬ – ĐỊA – GDKTPL)'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
          {localizeRecommendationText(record.recommendation, language) ||
            (isEn
              ? record.weakTopics.length > 0
                ? 'Prioritize reviewing topics with lower accuracy, especially quantitative calculation skills and geographical document analysis.'
                : 'Keep up the strong study performance!'
              : record.recommendation)}
        </p>
        {record.weakTopics.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-emerald-900">{isEn ? 'Topics to reinforce:' : 'Chủ đề cần củng cố:'}</span>
            {record.weakTopics.map((wId) => {
              const topObj = TOPICS.find((t) => t.id === wId);
              return (
                <span
                  key={wId}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-emerald-800 text-xs font-medium"
                >
                  {topObj ? getLocalizedTopic(topObj, language).title : wId}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 4-Type Competency Breakdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>
              {isEn
                ? 'Performance by 4 Assessment Formats (Ministry of Education & Training Standards)'
                : 'Kết quả theo 4 dạng thức câu hỏi mới (Chuẩn Bộ GD&ĐT)'}
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            {isEn ? 'Format Competency Assessment' : 'Đánh giá năng lực chuyên biệt'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Dạng 1: Xanh dương */}
          {(() => {
            const stat = record.typeBreakdown?.multiple_choice || { total: 0, correct: 0 };
            const rate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <span className="text-[11px] font-bold text-blue-800 block">
                  {isEn ? 'Format 1: Multiple Choice' : 'Dạng 1: Trắc nghiệm 4 lựa chọn'}
                </span>
                <div className="text-lg font-black text-blue-950">
                  {stat.correct}/{stat.total} {isEn ? 'questions' : 'câu'} ({rate}%)
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Dạng 2: Tím */}
          {(() => {
            const stat = record.typeBreakdown?.true_false_context || { total: 0, correct: 0 };
            const rate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                <span className="text-[11px] font-bold text-purple-800 block">
                  {isEn ? 'Format 2: Context True/False' : 'Dạng 2: Đúng – Sai có ngữ liệu'}
                </span>
                <div className="text-lg font-black text-purple-950">
                  {stat.correct}/{stat.total} {isEn ? 'questions' : 'câu'} ({rate}%)
                </div>
                <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Dạng 3: Vàng cam nhạt / Hổ phách */}
          {(() => {
            const stat = record.typeBreakdown?.short_answer || { total: 0, correct: 0 };
            const rate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 block">
                  {isEn ? 'Format 3: Numerical Calculation' : 'Dạng 3: Trả lời ngắn / Tính toán'}
                </span>
                <div className="text-lg font-black text-amber-950">
                  {stat.correct}/{stat.total} {isEn ? 'questions' : 'câu'} ({rate}%)
                </div>
                <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Dạng 4: Ngọc lục bảo / Xanh lá */}
          {(() => {
            const stat = record.typeBreakdown?.matching || { total: 0, correct: 0 };
            const rate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 block">
                  {isEn ? 'Format 4: Column Matching' : 'Dạng 4: Ghép nối 2 cột'}
                </span>
                <div className="text-lg font-black text-emerald-950">
                  {stat.correct}/{stat.total} {isEn ? 'questions' : 'câu'} ({rate}%)
                </div>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* In-depth Question-by-Question Review */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center justify-between">
          <span>{isEn ? 'Detailed Question Review & Standard Solutions' : 'Chi tiết bài làm & Lời giải thích tường minh'}</span>
          <span className="text-xs font-normal text-slate-500">
            {questions.length} {isEn ? 'questions' : 'câu hỏi'}
          </span>
        </h2>

        <div className="space-y-4">
          {questions.map((rawQ, qIdx) => {
            const q = localizeQuestion(rawQ, language);
            const detail = record.details.find((d) => d.questionId === q.id);
            const isFull = detail?.isFullyCorrect;
            const isPart = detail?.isPartiallyCorrect;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  isFull
                    ? 'border-emerald-200/90 shadow-2xs'
                    : isPart
                    ? 'border-amber-200 shadow-2xs'
                    : 'border-rose-200/90 shadow-2xs'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                        isFull ? 'bg-emerald-600' : isPart ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    >
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {q.type === 'multiple_choice' && (isEn ? 'Format 1: Multiple Choice' : 'Dạng 1: Trắc nghiệm 4 lựa chọn')}
                      {q.type === 'true_false_context' && (isEn ? 'Format 2: Context True/False' : 'Dạng 2: Đúng/Sai có ngữ liệu')}
                      {q.type === 'short_answer' && (isEn ? 'Format 3: Numerical Calculation' : 'Dạng 3: Trả lời ngắn / Tính toán')}
                      {q.type === 'matching' && (isEn ? 'Format 4: Column Matching' : 'Dạng 4: Ghép nối hai cột')}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isFull
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isPart
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isFull ? `+1.0 ${isEn ? 'pt' : 'điểm'}` : isPart ? `+${detail?.earnedScore} ${isEn ? 'pts' : 'điểm'}` : `0 ${isEn ? 'pt' : 'điểm'}`}
                  </span>
                </div>

                {/* Question Content Display */}
                <div className="space-y-2 text-xs sm:text-sm">
                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900 whitespace-pre-wrap">{q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                              oIdx === q.correctIndex
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold">{['A', 'B', 'C', 'D'][oIdx]}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.type === 'true_false_context' && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-slate-800">
                        <strong className="text-amber-900">{isEn ? 'Context Data:' : 'Ngữ liệu:'}</strong> {q.contextTitle} - {q.contextText}
                      </div>
                      <div className="space-y-1">
                        {q.statements.map((st) => (
                          <div
                            key={st.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <span>
                              <strong className="uppercase">{st.id})</strong> {st.text}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                st.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isEn ? 'Standard:' : 'Đáp án chuẩn:'} {st.isCorrect ? (isEn ? 'TRUE' : 'ĐÚNG') : (isEn ? 'FALSE' : 'SAI')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">{q.question}</p>
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">{isEn ? 'Standard numeric answer:' : 'Đáp án số chuẩn:'}</span>
                          <span className="font-mono font-bold text-sm px-2.5 py-1 bg-white rounded-lg border border-blue-300 text-blue-900 shadow-2xs">
                            {q.standardAnswer} {q.unit}
                          </span>
                        </div>
                        {q.formula && (
                          <div className="text-[11px] font-mono bg-white p-2.5 rounded-lg border border-blue-200 text-blue-900">
                            📐 <strong>{isEn ? 'Formula:' : 'Công thức:'}</strong> {q.formula}
                          </div>
                        )}
                        {q.calculationSteps && q.calculationSteps.length > 0 && (
                          <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                            <span className="font-bold text-slate-800">{isEn ? 'Calculation steps:' : 'Các bước giải & tính toán:'}</span>
                            {q.calculationSteps.map((step, idx) => (
                              <div key={idx} className="pl-2 border-l-2 border-emerald-400">
                                • {step}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.roundingRule && (
                          <div className="text-[11px] text-amber-800 italic flex items-center gap-1">
                            <span>⚠️ {isEn ? 'Convention:' : 'Quy ước:'}</span>
                            <span>{q.roundingRule}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {q.type === 'matching' && (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">{q.title}</p>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-800">{isEn ? 'Standard matching pairs:' : 'Các cặp ghép chuẩn:'}</div>
                        {q.pairs.map((p) => (
                          <div key={p.id} className="flex items-center space-x-2 text-slate-700">
                            <span className="font-bold text-blue-700">{p.left}</span>
                            <span className="text-slate-400">➔</span>
                            <span className="font-medium text-emerald-800">{p.right}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Answer vs System Standard Answer */}
                  {(() => {
                    const liveStandardAnswer =
                      q.type === 'multiple_choice'
                        ? `${['A', 'B', 'C', 'D'][q.correctIndex]}. ${q.options[q.correctIndex] || ''}`
                        : q.type === 'true_false_context'
                        ? q.statements
                            .map((s) => `${s.id.toUpperCase()}: ${s.isCorrect ? (isEn ? 'True' : 'Đúng') : (isEn ? 'False' : 'Sai')}`)
                            .join(' | ')
                        : q.type === 'short_answer'
                        ? `${q.standardAnswer}${q.unit ? ' ' + q.unit : ''}`
                        : q.pairs.map((p) => `${p.left} ➔ ${p.right}`).join(' | ');

                    const liveExplanation =
                      q.type === 'true_false_context'
                        ? q.statements.map((s) => `${s.id.toUpperCase()}: ${s.explanation}`).join('\n')
                        : q.explanation;

                    const displayUserAnswer = detail?.userAnswerText
                      ? localizeStoredAnswerText(detail.userAnswerText, language)
                      : isEn
                      ? 'No answer entered/selected'
                      : 'Học sinh chưa chọn/nhập đáp án';

                    const displayStandardAnswer =
                      liveStandardAnswer ||
                      (detail?.correctAnswerText
                        ? localizeStoredAnswerText(detail.correctAnswerText, language)
                        : isEn
                        ? 'Correct Answer'
                        : 'Đáp án chính xác');

                    const displayFeedbackText =
                      liveExplanation || detail?.explanation || detail?.feedback || '';

                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          <div
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              isFull
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                                : detail?.isUnanswered
                                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                                : 'bg-rose-50/80 border-rose-300 text-rose-950'
                            }`}
                          >
                            <div className="font-bold flex items-center justify-between">
                              <span>{isEn ? 'Your Answer:' : 'Câu trả lời của bạn:'}</span>
                              <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-white/80">
                                {isFull
                                  ? isEn ? '✓ Correct' : '✓ Đúng'
                                  : detail?.isUnanswered
                                  ? isEn ? 'Unanswered' : 'Chưa trả lời'
                                  : isEn ? '✗ Incorrect' : '✗ Sai'}
                              </span>
                            </div>
                            <div className="font-medium">{displayUserAnswer}</div>
                          </div>

                          <div className="p-3 rounded-xl border bg-blue-50/70 border-blue-200 text-blue-950 text-xs space-y-1">
                            <div className="font-bold text-blue-900">
                              {isEn ? 'System Standard Answer:' : 'Đáp án chuẩn của hệ thống:'}
                            </div>
                            <div className="font-medium text-slate-800">{displayStandardAnswer}</div>
                          </div>
                        </div>

                        {/* Feedback and Explanation */}
                        <div className="mt-2 p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                          <div className="font-bold text-blue-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {isEn ? 'Methodology & Detailed Solution:' : 'Hướng dẫn phương pháp & Lời giải chi tiết:'}
                            </span>
                          </div>
                          <div className="text-slate-800 whitespace-pre-wrap">{displayFeedbackText}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
