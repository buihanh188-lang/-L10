import React from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  FileCheck,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { ExamRecord, QuestionType, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { TOPICS } from '../data/topics';
import { getLocalizedTopic } from '../data/bilingualCurriculum';
import { localizeExamTitle } from '../services/bilingualQuestions';
import { useLanguage } from '../contexts/LanguageContext';

interface StudentStatsProps {
  currentUser: UserProfile;
  onRetakeExam?: (record: ExamRecord) => void;
  onGoPractice: () => void;
}

export const StudentStats: React.FC<StudentStatsProps> = ({
  currentUser,
  onGoPractice,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const allRecords = StorageService.getStudentRecords(currentUser.id);

  // Compute metrics
  const totalAttempts = allRecords.length;
  const officialExamsCount = allRecords.filter((r) => r.mode === 'official_test').length;
  const totalQuestionsDone = allRecords.reduce((acc, r) => acc + r.totalQuestions, 0);
  const totalCorrect = allRecords.reduce((acc, r) => acc + r.correctCount, 0);
  const totalWrong = allRecords.reduce((acc, r) => acc + r.wrongCount, 0);
  const totalDurationSeconds = allRecords.reduce((acc, r) => acc + r.durationSeconds, 0);

  const avgScore =
    totalAttempts > 0
      ? Math.round(
          (allRecords.reduce((acc, r) => acc + r.score, 0) / totalAttempts) * 10
        ) / 10
      : 0;

  const maxScore =
    totalAttempts > 0 ? Math.max(...allRecords.map((r) => r.score)) : 0;

  const latestRecord = allRecords[0] || null;
  const overallAccuracy =
    totalQuestionsDone > 0
      ? Math.round((totalCorrect / totalQuestionsDone) * 1000) / 10
      : 0;

  // Breakdown by 4 Question Types
  const typeStats: { [k in QuestionType]: { total: number; correct: number } } = {
    multiple_choice: { total: 0, correct: 0 },
    true_false_context: { total: 0, correct: 0 },
    short_answer: { total: 0, correct: 0 },
    matching: { total: 0, correct: 0 },
  };

  allRecords.forEach((rec) => {
    if (rec.typeBreakdown) {
      Object.entries(rec.typeBreakdown).forEach(([tKey, val]) => {
        if (typeStats[tKey as QuestionType]) {
          typeStats[tKey as QuestionType].total += val.total;
          typeStats[tKey as QuestionType].correct += val.correct;
        }
      });
    }
  });

  // Breakdown by Topic
  const topicStats: { [topicId: string]: { total: number; correct: number } } = {};
  allRecords.forEach((rec) => {
    if (rec.topicBreakdown) {
      Object.entries(rec.topicBreakdown).forEach(([tId, val]) => {
        if (!topicStats[tId]) topicStats[tId] = { total: 0, correct: 0 };
        topicStats[tId].total += val.total;
        topicStats[tId].correct += val.correct;
      });
    }
  });

  // Weak vs Strong topics
  const strongTopicIds: string[] = [];
  const weakTopicIds: string[] = [];
  Object.entries(topicStats).forEach(([tId, stat]) => {
    if (stat.total >= 3) {
      const rate = stat.correct / stat.total;
      if (rate >= 0.8) strongTopicIds.push(tId);
      else if (rate < 0.65) weakTopicIds.push(tId);
    }
  });

  const formatHoursMinutes = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (isEn) {
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m ${secs % 60}s`;
    }
    if (hours > 0) return `${hours} giờ ${mins} phút`;
    return `${mins} phút ${secs % 60} giây`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Student Profile Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-2xl font-black text-amber-300 shadow-inner">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-blue-950 font-extrabold text-[11px]">
                {isEn ? 'Class' : 'Lớp'} {currentUser.className || '10'}
              </span>
            </div>
            <div className="text-xs text-blue-200">
              {isEn ? 'Student ID:' : 'Mã học sinh:'} <strong className="text-white">{currentUser.code}</strong> • {currentUser.school}
            </div>
            <div className="text-[11px] text-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'National Curriculum 2018 - Connecting Knowledge to Life' : 'Chương trình GDPT 2018 - SGK Kết nối tri thức'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onGoPractice}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all self-start md:self-center hover:scale-102 cursor-pointer"
        >
          {isEn ? 'Practice Right Now' : 'Luyện tập ngay bây giờ'}
        </button>
      </div>

      {/* 6 Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-xs text-slate-500 font-medium">{isEn ? 'Total Attempts' : 'Lượt luyện tập'}</div>
          <div className="text-2xl font-black text-blue-600">{totalAttempts}</div>
          <div className="text-[10px] text-slate-400">
            {officialExamsCount} {isEn ? 'official exams' : 'bài thi chính quy'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-xs text-slate-500 font-medium">{isEn ? 'Average Score' : 'Điểm trung bình'}</div>
          <div className="text-2xl font-black text-emerald-600">{avgScore}</div>
          <div className="text-[10px] text-slate-400">{isEn ? '10-Point Scale' : 'Thang điểm 10'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-xs text-slate-500 font-medium">{isEn ? 'Highest Score' : 'Điểm cao nhất'}</div>
          <div className="text-2xl font-black text-amber-500">{maxScore}</div>
          <div className="text-[10px] text-slate-400">{isEn ? 'Personal Record' : 'Kỉ lục cá nhân'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-xs text-slate-500 font-medium">{isEn ? 'Accuracy Rate' : 'Tỉ lệ đúng'}</div>
          <div className="text-2xl font-black text-purple-600">{overallAccuracy}%</div>
          <div className="text-[10px] text-slate-400">
            {totalCorrect}/{totalQuestionsDone} {isEn ? 'correct' : 'câu đúng'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-xs text-slate-500 font-medium">{isEn ? 'Latest Score' : 'Điểm gần nhất'}</div>
          <div className="text-2xl font-black text-teal-600">{latestRecord ? latestRecord.score : '-'}</div>
          <div className="text-[10px] text-slate-400">{isEn ? 'Most recent test' : 'Bài làm gần nhất'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-xs text-slate-500 font-medium">{isEn ? 'Total Study Time' : 'Thời gian học'}</div>
          <div className="text-sm font-black text-slate-800 pt-1.5 line-clamp-1">
            {formatHoursMinutes(totalDurationSeconds)}
          </div>
          <div className="text-[10px] text-slate-400">{isEn ? 'Active learning' : 'Tích lũy thực tế'}</div>
        </div>
      </div>

      {/* Intelligent Diagnostic & Remediation Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>{isEn ? 'Competency Diagnostics & Recommended Learning Plan' : 'Chẩn đoán năng lực & Đề xuất kế hoạch học tập'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strong topics */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? 'Mastered Topics (Strengths)' : 'Chủ đề em đã nắm vững (Điểm mạnh)'}</span>
            </div>
            {strongTopicIds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {strongTopicIds.map((tId) => {
                  const tObj = TOPICS.find((t) => t.id === tId);
                  const topicTitle = tObj ? getLocalizedTopic(tObj, language).title : tId;
                  return (
                    <span
                      key={tId}
                      className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-semibold text-xs border border-emerald-300 shadow-2xs"
                    >
                      {topicTitle}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-emerald-800">
                {isEn
                  ? 'Complete more exercises to help the system verify your academic strengths.'
                  : 'Hãy làm thêm các bài kiểm tra để hệ thống xác nhận các chủ đề thế mạnh của em.'}
              </p>
            )}
          </div>

          {/* Weak topics */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{isEn ? 'Topics Needing Reinforcement (Areas for Improvement)' : 'Chủ đề cần tăng cường ôn tập (Điểm yếu)'}</span>
            </div>
            {weakTopicIds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {weakTopicIds.map((tId) => {
                  const tObj = TOPICS.find((t) => t.id === tId);
                  const topicTitle = tObj ? getLocalizedTopic(tObj, language).title : tId;
                  return (
                    <span
                      key={tId}
                      className="px-2.5 py-1 rounded-lg bg-white text-amber-900 font-semibold text-xs border border-amber-300 shadow-2xs"
                    >
                      {topicTitle}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-amber-800">
                {isEn
                  ? 'Well-balanced performance! No severe knowledge gaps detected.'
                  : 'Phong độ học tập rất đồng đều! Không phát hiện chủ đề nào bị hổng kiến thức nghiêm trọng.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Performance by 4 Question Formats */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>{isEn ? 'Competency Assessment Across 4 Question Formats' : 'Đánh giá kết quả theo 4 Dạng thức câu hỏi'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Format 1 */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="text-xs font-bold text-slate-700">
              {isEn ? 'Format 1: Multiple Choice' : 'Dạng 1: Trắc nghiệm 4 lựa chọn'}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-blue-600">
                {typeStats.multiple_choice.total > 0
                  ? Math.round(
                      (typeStats.multiple_choice.correct / typeStats.multiple_choice.total) * 100
                    )
                  : 0}
                %
              </span>
              <span className="text-xs text-slate-500">
                {typeStats.multiple_choice.correct}/{typeStats.multiple_choice.total} {isEn ? 'q' : 'câu'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{
                  width: `${
                    typeStats.multiple_choice.total > 0
                      ? (typeStats.multiple_choice.correct / typeStats.multiple_choice.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Format 2: Tím */}
          <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-2">
            <div className="text-xs font-bold text-purple-950">
              {isEn ? 'Format 2: Context True/False' : 'Dạng 2: Đúng/Sai ngữ liệu'}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-purple-600">
                {typeStats.true_false_context.total > 0
                  ? Math.round(
                      (typeStats.true_false_context.correct / typeStats.true_false_context.total) * 100
                    )
                  : 0}
                %
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {Math.round(typeStats.true_false_context.correct * 10) / 10}/{typeStats.true_false_context.total} {isEn ? 'q' : 'câu'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600"
                style={{
                  width: `${
                    typeStats.true_false_context.total > 0
                      ? (typeStats.true_false_context.correct / typeStats.true_false_context.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Format 3: Vàng cam nhạt / Hổ phách */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="text-xs font-bold text-amber-950">
              {isEn ? 'Format 3: Numerical Calculation' : 'Dạng 3: Trả lời ngắn / Tính toán'}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-amber-600">
                {typeStats.short_answer.total > 0
                  ? Math.round(
                      (typeStats.short_answer.correct / typeStats.short_answer.total) * 100
                    )
                  : 0}
                %
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {typeStats.short_answer.correct}/{typeStats.short_answer.total} {isEn ? 'q' : 'câu'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${
                    typeStats.short_answer.total > 0
                      ? (typeStats.short_answer.correct / typeStats.short_answer.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Format 4: Ngọc lục bảo / Xanh lá */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="text-xs font-bold text-emerald-950">
              {isEn ? 'Format 4: Two-Column Matching' : 'Dạng 4: Ghép nối hai cột'}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-emerald-600">
                {typeStats.matching.total > 0
                  ? Math.round((typeStats.matching.correct / typeStats.matching.total) * 100)
                  : 0}
                %
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {Math.round(typeStats.matching.correct * 10) / 10}/{typeStats.matching.total} {isEn ? 'q' : 'câu'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600"
                style={{
                  width: `${
                    typeStats.matching.total > 0
                      ? (typeStats.matching.correct / typeStats.matching.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* History of Exam & Practice Records */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <span>
              {isEn ? `Attempt History (${allRecords.length} sessions)` : `Lịch sử các lượt làm bài (${allRecords.length} lượt)`}
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            {isEn ? 'Saved on device' : 'Lưu trữ trên thiết bị'}
          </span>
        </div>

        {allRecords.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            {isEn
              ? 'No attempts yet. Click "Practice Right Now" to start accumulating scores!'
              : 'Chưa có lượt làm bài nào. Hãy bấm "Luyện tập ngay bây giờ" để bắt đầu tích lũy điểm số!'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {allRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.mode === 'official_test'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {rec.mode === 'official_test' ? (isEn ? 'Exam' : 'Kiểm tra') : (isEn ? 'Practice' : 'Luyện tập')}
                    </span>
                    {rec.language && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {rec.language === 'en' ? '🇬🇧 EN' : '🇻🇳 VI'}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900">{localizeExamTitle(rec.title, language)}</h3>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>📅 {new Date(rec.timestamp).toLocaleDateString(isEn ? 'en-US' : 'vi-VN')}</span>
                    <span>•</span>
                    <span>⏱ {rec.durationSeconds} {isEn ? 'sec' : 'giây'}</span>
                    <span>•</span>
                    <span>
                      {rec.correctCount}/{rec.totalQuestions} {isEn ? 'correct' : 'câu đúng'} ({rec.accuracyRate}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <div
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-base border ${
                      rec.score >= 8.0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : rec.score >= 6.5
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                  >
                    {rec.score} {isEn ? 'pts' : 'đ'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
