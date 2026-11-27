import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Ban,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Question, TeacherExamConfig, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeExamTitle, localizeQuestion } from '../services/bilingualQuestions';

interface ExamHubProps {
  questions: Question[];
  currentUser: UserProfile;
  onStartExam: (
    selectedQuestions: Question[],
    title: string,
    timeLimitMinutes: number,
    mode: 'official_test'
  ) => void;
}

export const ExamHub: React.FC<ExamHubProps> = ({
  questions,
  currentUser,
  onStartExam,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const [, setSyncTick] = useState(0);

  React.useEffect(() => {
    return apiService.subscribeToDataChanges(() => setSyncTick((n) => n + 1));
  }, []);

  const [activeTab, setActiveTab] = useState<'teacher' | 'midterm' | 'final' | 'speed'>('teacher');
  const allTeacherExams = StorageService.getTeacherExams();
  // Học sinh xem toàn bộ các đề do Giáo viên Bùi Thị Hồng Hạnh chính thức giao và đang phát hành
  const teacherExams = allTeacherExams.filter(
    (e) => e.isAssigned !== false && e.isActive !== false
  );
  const allRecords = apiService.getAttemptsSnapshot();

  // Find completion status for a given exam title (matches both VI and EN titles)
  const getAttemptForExam = (title: string) => {
    const candidates = Array.from(
      new Set([
        title.toLowerCase().trim(),
        localizeExamTitle(title, 'en').toLowerCase().trim(),
        localizeExamTitle(title, 'vi').toLowerCase().trim(),
      ])
    );
    if (title === 'Giữa học kì I') candidates.push('midterm exam 1', 'midterm semester 1');
    if (title === 'Giữa học kì II') candidates.push('midterm exam 2', 'midterm semester 2');
    if (title === 'Cuối học kì I') candidates.push('final semester 1');
    if (title === 'Cuối học kì II') candidates.push('final semester 2');

    return allRecords.find((r) => {
      const sameStudent = r.studentId === currentUser.id || r.studentName === currentUser.name;
      if (!sameStudent) return false;
      const rNorm = r.title.toLowerCase().trim();
      const rEn = localizeExamTitle(r.title, 'en').toLowerCase().trim();
      return candidates.some(
        (cand) => rNorm.includes(cand) || cand.includes(rNorm) || rEn.includes(cand) || cand.includes(rEn)
      );
    });
  };

  // Launch Teacher Exam
  const handleStartTeacherExam = (exam: TeacherExamConfig) => {
    const examQuestions = questions.filter((q) => exam.questionIds.includes(q.id));
    const finalQuestions =
      examQuestions.length > 0 ? examQuestions : questions.slice(0, 28);

    const orderedQuestions = StorageService.sortQuestionsByStandardOrder(finalQuestions);

    onStartExam(
      orderedQuestions,
      localizeExamTitle(exam.title, language),
      exam.timeMinutes,
      'official_test'
    );
  };

  // Launch Semester Exam (Giữa kì I, Giữa kì II, Cuối kì I, Cuối kì II)
  const handleStartSemesterExam = (examType: 'midterm_1' | 'midterm_2' | 'final_1' | 'final_2') => {
    const built = StorageService.buildSemesterExam(questions, examType, language);
    let title = built.title;
    if (isEn) {
      if (examType === 'midterm_1') title = 'Grade 10 Geography – Midterm Exam 1 (Semester I)';
      if (examType === 'midterm_2') title = 'Grade 10 Geography – Midterm Exam 2 (Semester II)';
      if (examType === 'final_1') title = 'Grade 10 Geography – Final Semester 1 Exam';
      if (examType === 'final_2') title = 'Grade 10 Geography – Final Semester 2 Exam';
    }
    onStartExam(built.questions, title, built.timeMinutes, 'official_test');
  };

  // Launch Standard Timed Exam
  const handleStartStandardExam = (
    count: number,
    timeMinutes: number,
    titleVi: string,
    titleEn: string
  ) => {
    const chosenTitle = isEn ? titleEn : titleVi;
    const built = StorageService.buildStandardTimedExam(questions, timeMinutes, chosenTitle, language);
    onStartExam(built.questions, chosenTitle, built.timeMinutes, 'official_test');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span>
            {isEn
              ? 'FORMAL COMPETENCY ASSESSMENT SYSTEM – 2018 CURRICULUM'
              : 'HỆ THỐNG KIỂM TRA ĐÁNH GIÁ CHÍNH QUY – GDPT 2018'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isEn ? 'Online Examination & Assessment Hall' : 'Phòng Thi & Kiểm Tra Trực Tuyến'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          {isEn
            ? 'Grade 10 Geography assessment suite (Connecting Knowledge to Life textbook), strictly aligned with MOET 45-minute exam matrix across all 4 timed formats.'
            : 'Bộ đề kiểm tra đánh giá năng lực môn Địa lí 10 (bộ sách Kết nối tri thức với cuộc sống), chuẩn ma trận đề thi 45 phút của Bộ GD&ĐT với đầy đủ 4 dạng câu hỏi tính giờ nghiêm túc.'}
        </p>
      </div>

      {/* Guidelines Box */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1">
          <div className="font-bold text-sm text-amber-900">
            {isEn ? 'Strict Online Examination Rules:' : 'Quy chế phòng thi trực tuyến nghiêm ngặt:'}
          </div>
          {isEn ? (
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 leading-relaxed">
              <li><strong>Live countdown timer</strong> starts immediately upon clicking "Start Exam".</li>
              <li><strong>Strict format sequence</strong>: Format 1 (Multiple Choice) ➔ Format 2 (Contextual True/False) ➔ Format 3 (Short Answer / Calculations) ➔ Format 4 (Matching).</li>
              <li>Formulas and correct answers are strictly concealed until test submission.</li>
              <li><strong>Automatic submission upon timeout:</strong> Grades and answers are automatically recorded into your personal transcript. No unauthorized extra time is granted.</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 leading-relaxed">
              <li><strong>Đồng hồ đếm ngược 45 phút</strong> chạy tự động ngay khi học sinh bấm "Bắt đầu làm bài".</li>
              <li><strong>Đủ chính xác 4 dạng thức câu hỏi</strong> theo đúng thứ tự quy chuẩn: Dạng 1 (Trắc nghiệm 4 lựa chọn) ➔ Dạng 2 (Đúng - Sai ngữ liệu) ➔ Dạng 3 (Trả lời ngắn / Tính toán) ➔ Dạng 4 (Nối cột).</li>
              <li>Trong chế độ thi, học sinh không xem được đáp án trước khi nộp bài.</li>
              <li><strong>Tự động nộp bài khi hết giờ:</strong> Điểm số và toàn bộ câu trả lời sẽ được đồng bộ ngay lên hệ thống học bạ điện tử cá nhân. Học sinh không được tự ý kéo dài thời gian.</li>
            </ul>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center overflow-x-auto pb-1">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs space-x-1">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'teacher'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>
              {isEn
                ? `Teacher Bui Thi Hong Hanh's Tests (${teacherExams.length})`
                : `Đề do GV Bùi Thị Hồng Hạnh giao (${teacherExams.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('midterm')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'midterm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isEn ? 'Midterm Exams (Sem 1 & 2)' : 'Kiểm tra Giữa kì (HK I & HK II)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('final')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'final'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isEn ? 'Final Semester Exams (Sem 1 & 2)' : 'Kiểm tra Cuối kì (HK I & HK II)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('speed')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'speed'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isEn ? 'Timed Surveys' : 'Khảo sát theo thời lượng'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEACHER ASSIGNED EXAMS */}
      {activeTab === 'teacher' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>
                  {isEn
                    ? 'Section 1: Official Tests Assigned by Teacher Bui Thi Hong Hanh'
                    : 'Mục 1: Đề kiểm tra do Giáo viên Bùi Thị Hồng Hạnh giao'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Official tests for Grade 10 Geography configured directly by Teacher Hanh from the curriculum question bank. All 4 formats in exact standard order.'
                  : 'Đề kiểm tra chính thức môn Địa lí 10 do cô Hạnh cấu hình trực tiếp từ ngân hàng câu hỏi chuẩn. Đầy đủ 4 dạng theo đúng thứ tự.'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0">
              {teacherExams.length} {isEn ? 'official tests' : 'đề thi chính thức'}
            </span>
          </div>

          <div className="space-y-4">
            {teacherExams.map((exam) => {
              const attempt = getAttemptForExam(exam.title);
              const isDone = !!attempt;

              return (
                <div
                  key={exam.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs ${
                    exam.isRevoked
                      ? 'border-slate-300 bg-slate-50/50 opacity-90'
                      : isDone
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {exam.className === 'all' || !exam.className || exam.className.toLowerCase().includes('toàn khối')
                          ? isEn ? 'Scope: Entire Grade 10' : 'Áp dụng: Toàn khối 10'
                          : isEn ? `Class ${exam.className}` : `Lớp ${exam.className}`}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {exam.timeMinutes} {isEn ? 'mins' : 'phút'}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                        {exam.questionIds.length} {isEn ? 'questions (4 formats)' : 'câu hỏi (Đủ 4 dạng)'}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        {isEn ? 'Scale: 10 pts' : 'Thang điểm: 10'}
                      </span>

                      {/* Status Badges */}
                      {exam.isRevoked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300 flex items-center gap-1">
                          <Ban className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEn ? 'Revoked' : 'Đã thu hồi đề'}</span>
                        </span>
                      ) : isDone ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {isEn ? `Submitted: ${attempt.score}/10 pts` : `Đã nộp bài: ${attempt.score}/10 điểm`}
                          </span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isEn ? 'Active / Ready' : 'Đang mở làm bài'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {localizeExamTitle(exam.title, language)}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isEn
                        ? 'Standard structure: Format 1 (Multiple Choice) ➔ Format 2 (Contextual True/False) ➔ Format 3 (Short Answer / Calculations) ➔ Format 4 (Column Matching). Automatically scored and synced with transcript.'
                        : 'Cấu trúc chuẩn: Dạng 1 (Trắc nghiệm nhiều lựa chọn) ➔ Dạng 2 (Đúng - Sai ngữ liệu) ➔ Dạng 3 (Trả lời ngắn / Tính toán) ➔ Dạng 4 (Nối cột). Tự động chấm điểm và lưu vào cơ sở dữ liệu học bạ.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
                      <span>
                        {isEn ? 'Instructor:' : 'Giáo viên ra đề:'}{' '}
                        <strong>Bùi Thị Hồng Hạnh</strong> ({isEn ? 'History – Geography – Citizen Ed.' : 'Tổ Sử – Địa – GDKTPL'})
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end justify-center gap-2">
                    {isDone && (
                      <div className="text-right text-xs text-slate-500">
                        {isEn ? 'Accuracy:' : 'Chính xác:'}{' '}
                        <strong className="text-emerald-600">{attempt.accuracyRate}%</strong> ({attempt.correctCount}/{attempt.totalQuestions}{' '}
                        {isEn ? 'qs' : 'câu'})
                      </div>
                    )}

                    {exam.isRevoked ? (
                      <button
                        disabled
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center space-x-2 border border-slate-300"
                        title={isEn ? 'This exam has been temporarily revoked' : 'Đề thi đã bị giáo viên tạm thu hồi'}
                      >
                        <Ban className="w-4 h-4" />
                        <span>{isEn ? 'Exam Revoked' : 'Đề đã bị thu hồi'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartTeacherExam(exam)}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                          isDone
                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-102'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {isDone
                            ? isEn ? 'Retake Exam' : 'Làm lại bài thi'
                            : isEn ? "Start Teacher's Exam" : 'Vào làm bài thi của GV'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MIDTERM SEMESTER EXAMS */}
      {activeTab === 'midterm' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>
                  {isEn
                    ? 'Section 2: Midterm Examination (45 Mins – 28-Question MOET Standards)'
                    : 'Mục 2: Đề Kiểm Tra Giữa Học Kì (45 phút – Chuẩn 28 câu ma trận GDPT 2018)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Separate Midterm 1 and Midterm 2 exams. Distinct knowledge scopes with all 4 formats in strict MOET order.'
                  : 'Gồm Giữa học kì I và Giữa học kì II riêng biệt. Nội dung kiến thức độc lập, đủ 4 dạng theo đúng thứ tự chuẩn Bộ GD&ĐT.'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shrink-0">
              {isEn ? '2 Standardized Midterm Exams' : '2 đề giữa kì chuẩn hóa'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Midterm 1 Card */}
            {(() => {
              const attempt = getAttemptForExam('Giữa học kì I');
              const isDone = !!attempt;

              return (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                        {isEn ? 'SEMESTER I' : 'HỌC KÌ I'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-blue-600" /> {isEn ? '45 mins • 10-point scale' : '45 phút • Thang điểm 10'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {isEn ? 'Grade 10 Geography – Midterm Exam 1' : 'Đề kiểm tra Giữa học kì I – Địa lí 10'}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>{isEn ? 'Knowledge Scope:' : 'Phạm vi kiến thức:'}</strong>{' '}
                      {isEn
                        ? 'Lessons 1 to 13 (General Concepts, Map Usage, Earth, Lithosphere, Atmosphere, Hydrosphere).'
                        : 'Bài 1 đến Bài 13 (Một số vấn đề chung, Sử dụng bản đồ, Trái Đất, Thạch quyển, Khí quyển, Thủy quyển).'}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700">
                        {isEn ? '28-Question Structure (Standard Order):' : 'Cấu trúc 28 câu hỏi (Đúng thứ tự chuẩn BGD):'}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {isEn ? (
                          <>
                            <div>• <strong>Format 1:</strong> 18 MC Qs</div>
                            <div>• <strong>Format 2:</strong> 4 True/False (16 pts)</div>
                            <div>• <strong>Format 3:</strong> 4 Calculations</div>
                            <div>• <strong>Format 4:</strong> 2 Column Matchings</div>
                          </>
                        ) : (
                          <>
                            <div>• <strong>Dạng 1:</strong> 18 câu TN 4 lựa chọn</div>
                            <div>• <strong>Dạng 2:</strong> 4 câu Đ/S (16 ý)</div>
                            <div>• <strong>Dạng 3:</strong> 4 câu Tính toán</div>
                            <div>• <strong>Dạng 4:</strong> 2 câu Nối cột</div>
                          </>
                        )}
                      </div>
                    </div>

                    {isDone && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isEn ? `Completed: ${attempt.score}/10 pts` : `Đã làm: ${attempt.score}/10 điểm`}</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {isEn ? `Accuracy: ${attempt.accuracyRate}%` : `Độ chính xác: ${attempt.accuracyRate}%`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartSemesterExam('midterm_1')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {isDone
                        ? isEn ? 'Retake Midterm 1 (45 mins)' : 'Làm lại đề Giữa kì I (45 ph)'
                        : isEn ? 'Start Midterm 1 (45 mins)' : 'Bắt đầu thi Giữa kì I (45 ph)'}
                    </span>
                  </button>
                </div>
              );
            })()}

            {/* Midterm 2 Card */}
            {(() => {
              const attempt = getAttemptForExam('Giữa học kì II');
              const isDone = !!attempt;

              return (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {isEn ? 'SEMESTER II' : 'HỌC KÌ II'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" /> {isEn ? '45 mins • 10-point scale' : '45 phút • Thang điểm 10'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {isEn ? 'Grade 10 Geography – Midterm Exam 2' : 'Đề kiểm tra Giữa học kì II – Địa lí 10'}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>{isEn ? 'Knowledge Scope:' : 'Phạm vi kiến thức:'}</strong>{' '}
                      {isEn
                        ? 'Lessons 21 to 32 (Development Resources, Agriculture, Forestry, Fisheries, and Industry).'
                        : 'Bài 21 đến Bài 32 (Nguồn lực phát triển, Địa lí ngành Nông nghiệp, Lâm nghiệp, Thủy sản và Công nghiệp).'}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700">
                        {isEn ? '28-Question Structure (Standard Order):' : 'Cấu trúc 28 câu hỏi (Đúng thứ tự chuẩn BGD):'}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {isEn ? (
                          <>
                            <div>• <strong>Format 1:</strong> 18 MC Qs</div>
                            <div>• <strong>Format 2:</strong> 4 True/False (16 pts)</div>
                            <div>• <strong>Format 3:</strong> 4 Calculations</div>
                            <div>• <strong>Format 4:</strong> 2 Column Matchings</div>
                          </>
                        ) : (
                          <>
                            <div>• <strong>Dạng 1:</strong> 18 câu TN 4 lựa chọn</div>
                            <div>• <strong>Dạng 2:</strong> 4 câu Đ/S (16 ý)</div>
                            <div>• <strong>Dạng 3:</strong> 4 câu Tính toán</div>
                            <div>• <strong>Dạng 4:</strong> 2 câu Nối cột</div>
                          </>
                        )}
                      </div>
                    </div>

                    {isDone && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isEn ? `Completed: ${attempt.score}/10 pts` : `Đã làm: ${attempt.score}/10 điểm`}</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {isEn ? `Accuracy: ${attempt.accuracyRate}%` : `Độ chính xác: ${attempt.accuracyRate}%`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartSemesterExam('midterm_2')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {isDone
                        ? isEn ? 'Retake Midterm 2 (45 mins)' : 'Làm lại đề Giữa kì II (45 ph)'
                        : isEn ? 'Start Midterm 2 (45 mins)' : 'Bắt đầu thi Giữa kì II (45 ph)'}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 3: FINAL SEMESTER EXAMS */}
      {activeTab === 'final' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>
                  {isEn
                    ? 'Section 3: Final Semester Examination (45 Mins – Comprehensive Assessment)'
                    : 'Mục 3: Đề Kiểm Tra Cuối Học Kì (45 phút – Tổng Hợp Toàn Diện)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Includes Semester 1 Final (Lessons 1-20: Physical & Population) and Semester 2 Final (Lessons 21-40: Economy & Environment).'
                  : 'Gồm Cuối học kì I (Bài 1-20: Tự nhiên & Dân cư) và Cuối học kì II (Bài 21-40: Kinh tế & Môi trường). Đủ 4 dạng bài tập không sao chép trùng lặp.'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full shrink-0">
              {isEn ? '2 Standardized Final Exams' : '2 đề cuối kì chuẩn hóa'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Final 1 Card */}
            {(() => {
              const attempt = getAttemptForExam('Cuối học kì I');
              const isDone = !!attempt;

              return (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-purple-400 transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                        {isEn ? 'FULL SEMESTER I' : 'TOÀN DIỆN HỌC KÌ I'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-purple-600" /> {isEn ? '45 mins • 10-point scale' : '45 phút • Thang điểm 10'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {isEn ? 'Grade 10 Geography – Final Semester 1 Exam' : 'Đề kiểm tra Cuối học kì I – Địa lí 10'}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>{isEn ? 'Knowledge Scope:' : 'Phạm vi kiến thức:'}</strong>{' '}
                      {isEn
                        ? 'Entire Semester I from Lesson 1 to Lesson 20 (Physical Geography, Biosphere, Geographic Envelope, Population, and Global Urbanization).'
                        : 'Toàn bộ Học kì I từ Bài 1 đến Bài 20 (Địa lí tự nhiên Trái Đất, Sinh quyển, Vỏ địa lí, Địa lí dân cư và đô thị hóa toàn cầu).'}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700">
                        {isEn ? '28-Question Structure (Standard Order):' : 'Cấu trúc 28 câu hỏi (Đúng thứ tự chuẩn BGD):'}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {isEn ? (
                          <>
                            <div>• <strong>Format 1:</strong> 18 MC Qs</div>
                            <div>• <strong>Format 2:</strong> 4 True/False (16 pts)</div>
                            <div>• <strong>Format 3:</strong> 4 Calculations</div>
                            <div>• <strong>Format 4:</strong> 2 Column Matchings</div>
                          </>
                        ) : (
                          <>
                            <div>• <strong>Dạng 1:</strong> 18 câu TN 4 lựa chọn</div>
                            <div>• <strong>Dạng 2:</strong> 4 câu Đ/S (16 ý)</div>
                            <div>• <strong>Dạng 3:</strong> 4 câu Tính toán</div>
                            <div>• <strong>Dạng 4:</strong> 2 câu Nối cột</div>
                          </>
                        )}
                      </div>
                    </div>

                    {isDone && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isEn ? `Completed: ${attempt.score}/10 pts` : `Đã làm: ${attempt.score}/10 điểm`}</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {isEn ? `Accuracy: ${attempt.accuracyRate}%` : `Độ chính xác: ${attempt.accuracyRate}%`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartSemesterExam('final_1')}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {isDone
                        ? isEn ? 'Retake Final Sem 1 (45 mins)' : 'Làm lại đề Cuối kì I (45 ph)'
                        : isEn ? 'Start Final Sem 1 (45 mins)' : 'Bắt đầu thi Cuối kì I (45 ph)'}
                    </span>
                  </button>
                </div>
              );
            })()}

            {/* Final 2 Card */}
            {(() => {
              const attempt = getAttemptForExam('Cuối học kì II');
              const isDone = !!attempt;

              return (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                        {isEn ? 'FULL SEMESTER II' : 'TOÀN DIỆN HỌC KÌ II'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> {isEn ? '45 mins • 10-point scale' : '45 phút • Thang điểm 10'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {isEn ? 'Grade 10 Geography – Final Semester 2 Exam' : 'Đề kiểm tra Cuối học kì II – Địa lí 10'}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>{isEn ? 'Knowledge Scope:' : 'Phạm vi kiến thức:'}</strong>{' '}
                      {isEn
                        ? 'Entire Semester II from Lesson 21 to Lesson 40 (Economic Geography, Agriculture, Industry, Services, Environment, Sustainable Development, and Green Growth).'
                        : 'Toàn bộ Học kì II từ Bài 21 đến Bài 40 (Địa lí kinh tế, nông nghiệp, công nghiệp, dịch vụ, môi trường, phát triển bền vững và tăng trưởng xanh).'}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700">
                        {isEn ? '28-Question Structure (Standard Order):' : 'Cấu trúc 28 câu hỏi (Đúng thứ tự chuẩn BGD):'}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {isEn ? (
                          <>
                            <div>• <strong>Format 1:</strong> 18 MC Qs</div>
                            <div>• <strong>Format 2:</strong> 4 True/False (16 pts)</div>
                            <div>• <strong>Format 3:</strong> 4 Calculations</div>
                            <div>• <strong>Format 4:</strong> 2 Column Matchings</div>
                          </>
                        ) : (
                          <>
                            <div>• <strong>Dạng 1:</strong> 18 câu TN 4 lựa chọn</div>
                            <div>• <strong>Dạng 2:</strong> 4 câu Đ/S (16 ý)</div>
                            <div>• <strong>Dạng 3:</strong> 4 câu Tính toán</div>
                            <div>• <strong>Dạng 4:</strong> 2 câu Nối cột</div>
                          </>
                        )}
                      </div>
                    </div>

                    {isDone && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isEn ? `Completed: ${attempt.score}/10 pts` : `Đã làm: ${attempt.score}/10 điểm`}</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700">
                          {isEn ? `Accuracy: ${attempt.accuracyRate}%` : `Độ chính xác: ${attempt.accuracyRate}%`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartSemesterExam('final_2')}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {isDone
                        ? isEn ? 'Retake Final Sem 2 (45 mins)' : 'Làm lại đề Cuối kì II (45 ph)'
                        : isEn ? 'Start Final Sem 2 (45 mins)' : 'Bắt đầu thi Cuối kì II (45 ph)'}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: TIMED EXAMS */}
      {activeTab === 'speed' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>
                  {isEn
                    ? 'Section 4: Standardized Timed Competency Surveys'
                    : 'Mục 4: Các Bài Khảo Sát Chuẩn Hóa Theo Thời Lượng'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Flexible durations (15, 20, 30, 45 minutes). All tests strictly feature all 4 formats in standard 1 ➔ 2 ➔ 3 ➔ 4 sequence.'
                  : 'Linh hoạt thời lượng làm bài (15, 20, 30, 45 phút). Tất cả các bài đều có đủ 4 dạng câu hỏi theo đúng thứ tự 1 ➔ 2 ➔ 3 ➔ 4.'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shrink-0">
              {isEn ? 'Randomized Question Order' : 'Tự động xáo trộn câu hỏi'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 10 Questions - 15 mins */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {isEn ? '10 Questions' : 'Bài 10 câu'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> 15 {isEn ? 'mins' : 'phút'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2.5">
                  {isEn ? '15-Minute Frequent Quiz' : 'Kiểm tra 15 phút thường xuyên'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEn
                    ? 'Rapid check: 6 Format 1, 2 Format 2, 1 Format 3, 1 Format 4.'
                    : 'Đánh giá nhanh kiến thức: 6 Dạng 1, 2 Dạng 2, 1 Dạng 3, 1 Dạng 4.'}
                </p>
              </div>
              <button
                onClick={() =>
                  handleStartStandardExam(
                    10,
                    15,
                    'Bài kiểm tra 15 phút thường xuyên (10 câu)',
                    '15-Minute Frequent Quiz (10 Questions)'
                  )
                }
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isEn ? 'Start Test (15 mins)' : 'Bắt đầu thi (15 ph)'}</span>
              </button>
            </div>

            {/* 15 Questions - 20 mins */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {isEn ? '15 Questions' : 'Bài 15 câu'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> 20 {isEn ? 'mins' : 'phút'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2.5">
                  {isEn ? 'Periodic Topic Survey' : 'Khảo sát định kì chủ đề'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEn
                    ? '8 Format 1, 3 Format 2, 2 Format 3, 2 Format 4.'
                    : '8 Dạng 1, 3 Dạng 2, 2 Dạng 3 (tính toán số), 2 Dạng 4 (nối cột).'}
                </p>
              </div>
              <button
                onClick={() =>
                  handleStartStandardExam(
                    15,
                    20,
                    'Bài khảo sát định kì chủ đề (15 câu / 20 phút)',
                    'Periodic Topic Survey (15 Questions / 20 Minutes)'
                  )
                }
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isEn ? 'Start Test (20 mins)' : 'Bắt đầu thi (20 ph)'}</span>
              </button>
            </div>

            {/* 20 Questions - 30 mins */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    {isEn ? '20 Questions' : 'Bài 20 câu'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> 30 {isEn ? 'mins' : 'phút'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2.5">
                  {isEn ? '30-Minute Thematic Test' : 'Kiểm tra chuyên đề 30 phút'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEn
                    ? '12 Format 1, 4 Format 2, 2 Format 3, 2 Format 4.'
                    : '12 Dạng 1, 4 Dạng 2, 2 Dạng 3, 2 Dạng 4 theo ma trận chuẩn.'}
                </p>
              </div>
              <button
                onClick={() =>
                  handleStartStandardExam(
                    20,
                    30,
                    'Đề kiểm tra chuyên đề 30 phút (20 câu)',
                    '30-Minute Thematic Exam (20 Questions)'
                  )
                }
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isEn ? 'Start Test (30 mins)' : 'Bắt đầu thi (30 ph)'}</span>
              </button>
            </div>

            {/* 28 Questions - 45 mins */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                    {isEn ? 'Standard 28 Qs' : 'Chuẩn 28 câu BGD'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> 45 {isEn ? 'mins' : 'phút'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2.5">
                  {isEn ? '45-Minute Periodic Exam' : 'Kiểm tra định kì 45 phút (Tự do)'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEn
                    ? '18 Multiple Choice + 4 True/False + 4 Calculations + 2 Matchings.'
                    : '18 câu TN 4 lựa chọn + 4 câu Đ/S (16 ý) + 4 câu trả lời ngắn + 2 câu nối cột.'}
                </p>
              </div>
              <button
                onClick={() =>
                  handleStartStandardExam(
                    28,
                    45,
                    'Đề kiểm tra định kì 45 phút – Chuẩn cấu trúc GDPT 2018 (28 câu)',
                    '45-Minute Periodic Exam – 2018 Curriculum Standard (28 Questions)'
                  )
                }
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isEn ? 'Start Exam (45 mins)' : 'Bắt đầu thi (45 ph)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
