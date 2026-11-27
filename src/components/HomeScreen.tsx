import React from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  Compass,
  Globe2,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';
import { CURRICULUM_PARTS, CURRICULUM_CHAPTERS } from '../data/curriculum';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedPart, getLocalizedChapter } from '../data/bilingualCurriculum';

interface HomeScreenProps {
  currentUser: UserProfile;
  isTeacherVerified?: boolean;
  onNavigate: (tab: string) => void;
  onStartQuickPractice: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  isTeacherVerified = false,
  onNavigate,
  onStartQuickPractice,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const [, setSyncTick] = React.useState(0);

  React.useEffect(() => {
    return apiService.subscribeToDataChanges(() => setSyncTick((n) => n + 1));
  }, []);

  const studentRecords = apiService.getStudentAttemptsSnapshot(currentUser.id);
  const totalQuestionsDone = studentRecords.reduce((acc, r) => acc + r.totalQuestions, 0);
  const avgScore =
    studentRecords.length > 0
      ? Math.round(
          (studentRecords.reduce((acc, r) => acc + r.score, 0) / studentRecords.length) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-10 pb-12">
      {/* ============================================================ */}
      {/* 1. HERO BANNER WITH 3D EARTH & MAP AESTHETICS */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-emerald-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-6 sm:p-10 lg:p-14 shadow-xl border border-blue-800/40">
        {/* Decorative background visual elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Official Affiliation Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-white">
              {isEn
                ? 'HOA BINH HIGH SCHOOL • VAN LINH COMMUNE – LANG SON PROVINCE'
                : 'TRƯỜNG THPT HÒA BÌNH • XÃ VẠN LINH – TỈNH LẠNG SƠN'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {isEn ? 'GEOGRAPHY 10 –' : 'ĐỊA LÍ 10 –'} <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
              {isEn ? 'MASTERING KNOWLEDGE' : 'CHINH PHỤC TRI THỨC'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            {isEn ? (
              <>
                Comprehensive online learning & assessment platform for Grade 10 Geography following the 2018 General Education Curriculum, textbook{' '}
                <strong className="text-amber-300 font-bold">CONNECTING KNOWLEDGE TO LIFE</strong>. Standardized structure of 3 Parts • 13 Chapters • 40 Lessons with 1,600 questions integrating all 4 national assessment formats.
              </>
            ) : (
              <>
                Nền tảng học tập & ôn luyện trực tuyến môn Địa lí lớp 10 theo Chương trình GDPT 2018, bộ sách{' '}
                <strong className="text-amber-300 font-bold">KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</strong>. Cấu trúc chuẩn mực 3 Phần • 13 Chương • 40 Bài học với 1.600 câu hỏi, tích hợp đủ 4 dạng thức đánh giá năng lực mới của Bộ GD&ĐT.
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs px-3 py-1 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 font-medium flex items-center gap-1.5">
              <span>{isEn ? 'Department:' : 'Tổ chuyên môn:'}</span>
              <strong className="text-amber-300">
                {isEn ? 'HISTORY – GEOGRAPHY – CITIZEN EDUCATION' : 'TỔ SỬ – ĐỊA – GDKTPL'}
              </strong>
            </span>
            <span className="text-xs px-3 py-1 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 font-medium flex items-center gap-1.5">
              <span>{isEn ? '👩‍🏫 Instructor:' : '👩‍🏫 Giáo viên phụ trách:'}</span>
              <strong className="text-white">BÙI THỊ HỒNG HẠNH</strong>
            </span>
            <span className="text-xs px-3 py-1 rounded-lg bg-blue-900/60 text-blue-200 border border-blue-500/30">
              📚 {isEn ? '3 Parts • 13 Chapters • 40 Lessons • 1,600 Questions' : '3 Phần • 13 Chương • 40 Bài học • 1.600 câu hỏi'}
            </span>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('lessons')}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center space-x-3 hover:scale-102 cursor-pointer group"
            >
              <BookOpen className="w-5 h-5 text-amber-200 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">
                  {isEn ? 'Curriculum 2018 • 40 Lessons' : 'Chương trình GDPT 2018 • 40 bài học'}
                </div>
                <div className="text-sm font-extrabold tracking-wide">
                  {isEn ? 'Start Learning Now' : 'Bắt đầu học tập ngay'}
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('practice')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md transition-all flex items-center space-x-2.5 cursor-pointer hover:scale-102"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isEn ? 'Practice 4 Question Formats' : 'Luyện tập 4 dạng câu hỏi'}</span>
            </button>
          </div>
        </div>

        {/* Floating Globe Graphic Badge (Top Right) */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col items-center justify-center p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl text-center space-y-3 w-64">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Globe2 className="w-10 h-10 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
              {isEn ? '3D GLOBE' : 'ĐỊA CẦU 3D'}
            </div>
            <div className="text-sm font-bold text-white">
              {isEn ? 'Explore The World' : 'Chinh Phục Thế Giới'}
            </div>
            <div className="text-[11px] text-blue-200 mt-0.5">
              {isEn ? 'Discover physical & socio-economic geography' : 'Khám phá tự nhiên & kinh tế'}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STUDENT SNAPSHOT PROGRESS CARD */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isEn ? 'Your learning progress:' : 'Tiến độ học tập của em:'}
              </span>
              <strong className="text-slate-900 text-sm">{currentUser.name}</strong>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                {isEn ? `Grade ${currentUser.className || '10'}` : `Lớp ${currentUser.className || '10'}`}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                {currentUser.school}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isEn ? (
                <>
                  Completed <strong className="text-slate-800">{studentRecords.length}</strong> practice tests & exams • Accumulated <strong className="text-slate-800">{totalQuestionsDone}</strong> questions.
                </>
              ) : (
                <>
                  Đã hoàn thành <strong className="text-slate-800">{studentRecords.length}</strong> bài luyện tập & kiểm tra • Tích lũy <strong className="text-slate-800">{totalQuestionsDone}</strong> câu hỏi.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4 self-end md:self-center">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isEn ? 'Average Score' : 'Điểm trung bình'}</div>
              <div className="text-xl font-black text-emerald-600">{avgScore} {isEn ? 'pts' : 'đ'}</div>
            </div>
            <button
              onClick={() => onNavigate('stats')}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
            >
              <span>{isEn ? 'View Detailed Transcript' : 'Xem chi tiết học bạ'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2.5. HIGHLIGHT WARMUP DISCOVERY BANNER */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 mt-1">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                <span>{isEn ? 'PRE-LESSON WARM-UP ACTIVITY' : 'HOẠT ĐỘNG KHỞI ĐỘNG TRƯỚC GIỜ HỌC'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isEn ? 'DID YOU KNOW? – EXPLORING GEOGRAPHY 🌍' : 'EM CÓ BIẾT? – KHÁM PHÁ ĐỊA LÍ 🌍'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
                {isEn
                  ? 'Spark your curiosity and unlock surprising secrets about Planet Earth, nature, world records, and geographical wonders. 10 questions per run across 4 formats with instant feedback and exciting trivia!'
                  : 'Khơi gợi sự tò mò và mở khóa các bí mật bất ngờ về Trái Đất, thiên nhiên, kỉ lục thế giới và các hiện tượng kì thú trong đời sống. Mỗi lượt 10 câu đủ 4 dạng, không áp lực điểm số, nhận ngay lời giải thích và bật mí thú vị sau mỗi câu!'}
              </p>
            </div>
          </div>

          <button
            onClick={onStartQuickPractice}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-500 hover:to-emerald-500 text-slate-950 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-amber-400/20 transition-all flex items-center justify-center space-x-2 shrink-0 hover:scale-103 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-950" />
            <span>{isEn ? 'Start Exploring Now' : 'Bắt đầu Khám phá ngay'}</span>
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FOUR CORE FUNCTIONAL PILLARS */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isEn ? 'Core Learning Hubs' : 'Các Khu Vực Học Tập Cốt Lõi'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEn
                ? 'Comprehensive learning and revision system following the 2018 curriculum'
                : 'Hệ thống học tập và ôn luyện toàn diện theo chương trình GDPT 2018'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Kho bài học */}
          <div
            onClick={() => onNavigate('lessons')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {isEn ? '1. 40 Textbook Lessons' : '1. Kho 40 Bài Học SGK'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isEn
                  ? 'All 3 Parts, 13 Chapters, 40 lessons aligned with textbook: learning goals, core knowledge, bilingual glossary, and Lang Son local applications.'
                  : 'Đầy đủ 3 Phần, 13 Chương, 40 bài học chuẩn SGK Kết nối tri thức: mục tiêu, kiến thức cốt lõi, bảng thuật ngữ và liên hệ Lạng Sơn.'}
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>{isEn ? 'Open 40 lessons' : 'Mở kho 40 bài'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Luyện tập 4 dạng */}
          <div
            onClick={() => onNavigate('practice')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {isEn ? '2. Practice All 4 Formats' : '2. Luyện Tập Đủ 4 Dạng'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isEn
                  ? '1,600 questions (40/lesson): Multiple Choice, Contextual True/False, Calculation Short Answers, and Two-column Matching.'
                  : 'Ngân hàng 1.600 câu hỏi (40 câu/bài) gồm: Trắc nghiệm 4 lựa chọn, Đúng/Sai ngữ liệu, Trả lời ngắn tính toán và Ghép nối hai cột.'}
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>{isEn ? 'Enter practice hall' : 'Vào phòng luyện'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Thi & Kiểm tra */}
          <div
            onClick={() => onNavigate('exam')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                {isEn ? '3. Periodic Testing & Exams' : '3. Thi & Kiểm Tra Định Kì'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isEn
                  ? '10, 15, 20, 30-question exam packages with live timer, anti-cheat, auto-submit on timeout, and transcript recording.'
                  : 'Các gói đề 10, 15, 20, 30 câu có đồng hồ đếm ngược, chống xem trước đáp án, tự động nộp bài khi hết giờ và ghi điểm học bạ.'}
              </p>
            </div>
            <div className="text-xs font-bold text-purple-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>{isEn ? 'Enter exam hall' : 'Vào phòng thi'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Kết Quả & Học Bạ */}
          <div
            onClick={() => onNavigate('stats')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                {isEn ? '4. Results & Transcript' : '4. Kết Quả & Học Bạ'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isEn
                  ? 'Track score charts, test history, accuracy across all 4 assessment formats, and individual competency analytics.'
                  : 'Theo dõi biểu đồ điểm số, lịch sử bài làm, độ chính xác qua 4 dạng thức đánh giá và phân tích năng lực cá nhân.'}
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>{isEn ? 'View personal transcript' : 'Xem học bạ cá nhân'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Khu vực quản trị CHỈ hiển thị khi giáo viên đã được xác thực phía máy chủ */}
        {currentUser.role === 'teacher' && isTeacherVerified && (
          <div className="mt-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  {isEn ? 'Verified Teacher Session' : 'Phiên làm việc Giáo viên đã xác thực'}
                </div>
                <div className="text-sm font-bold text-white">
                  {isEn
                    ? 'Teaching Administration & Question Bank Dashboard'
                    : 'Bảng Điều Khiển Quản Trị Giảng Dạy & Ngân Hàng Câu Hỏi'}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('teacher_admin')}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-2 shadow-md"
            >
              <Users className="w-4 h-4" />
              <span>{isEn ? 'Open Teacher Administration' : 'Mở Khu Quản Trị Giáo Viên'}</span>
            </button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 4. OVERVIEW OF 3 PARTS & 13 CHAPTERS CURRICULUM */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isEn
                ? 'Curriculum Structure: 3 Parts & 13 Chapters Aligned with Standard Textbook'
                : 'Cấu Trúc Chương Trình: 3 Phần & 13 Chương Chuẩn SGK Kết Nối Tri Thức'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEn
                ? 'Explore Grade 10 Geography Curriculum – All 40 Lessons'
                : 'Khám phá chương trình môn Địa lí 10 – Đầy đủ 40 bài học'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('lessons')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>{isEn ? 'View all lessons' : 'Xem tất cả bài'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Parts Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CURRICULUM_PARTS.map((part) => {
            const locPart = getLocalizedPart(part, language);
            const lessonCountText =
              part.id === 'phan-1'
                ? isEn ? '1 lesson' : '1 bài học'
                : part.id === 'phan-2'
                ? isEn ? '17 lessons (Chapters 1-7)' : '17 bài học (Chương 1-7)'
                : isEn ? '22 lessons (Chapters 8-13)' : '22 bài học (Chương 8-13)';

            return (
              <div
                key={part.id}
                onClick={() => onNavigate('lessons')}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {isEn ? `Part ${part.number}` : `Phần ${part.number}`}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {lessonCountText}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {locPart.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {locPart.description}
                </p>
                <div className="pt-2 flex items-center space-x-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>{isEn ? 'Explore lessons' : 'Khám phá các bài học'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 13 Chapters Grid - Chương học xanh navy đậm, phân cấp thẻ riêng */}
        <div className="pt-2">
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isEn ? '13 CHAPTER DIRECTORY' : 'DANH MỤC 13 CHƯƠNG HỌC TẬP'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CURRICULUM_CHAPTERS.map((chapter) => {
              const locChapter = getLocalizedChapter(chapter, language);
              return (
                <div
                  key={chapter.id}
                  onClick={() => onNavigate('lessons')}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-500 shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
                >
                  {/* Dải màu thẻ riêng Chương học: Xanh Navy đậm chuẩn quy định */}
                  <div className="bg-slate-900 px-4 py-2.5 text-white flex items-center justify-between border-b border-slate-800">
                    <span className="text-xs font-black tracking-wide text-amber-300">
                      {isEn ? `CHAPTER ${chapter.number}` : `CHƯƠNG ${chapter.number}`}
                    </span>
                    <span className="text-[11px] font-bold text-teal-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      {chapter.lessonsCount} {isEn ? 'lessons' : 'bài học'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 leading-snug">
                      {locChapter.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {locChapter.description}
                    </p>
                  </div>

                  <div className="px-4 pb-3 pt-1 flex items-center justify-between text-xs font-bold text-teal-700 border-t border-slate-100">
                    <span>{isEn ? 'View lessons' : 'Xem các bài học'}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. ANNOUNCEMENTS & USER GUIDELINES */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>
              {isEn
                ? 'Announcements & Self-Study Guidelines for Students of Hoa Binh High School'
                : 'Thông Báo & Hướng Dẫn Tự Học Dành Cho Học Sinh THPT Hòa Bình'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-blue-900">
                {isEn ? '📌 High-Yield Revision Methods:' : '📌 Phương pháp ôn luyện đạt kết quả cao:'}
              </div>
              {isEn ? (
                <p>
                  1. For Format 1 (Multiple Choice), carefully identify key terms, eliminate distractors to choose the single best answer.
                  <br />
                  2. For Format 2 (Contextual True/False), analyze data tables, maps, and excerpts thoroughly before deciding each item.
                  <br />
                  3. For Format 3 (Calculations & Short Answer), apply formulas accurately and strictly follow rounding guidelines.
                  <br />
                  4. For Format 4 (Column Matching), link each item correctly with its corresponding concept to achieve full score.
                </p>
              ) : (
                <p>
                  1. Với Dạng 1 (Trắc nghiệm nhiều phương án lựa chọn), đọc kĩ câu hỏi, xác định từ khóa, loại trừ các phương án nhiễu để chọn đáp án đúng nhất.
                  <br />
                  2. Với Dạng 2 (Đúng/Sai ngữ liệu), đọc kĩ số liệu trong bảng, lược đồ trước khi chọn.
                  <br />
                  3. Với Dạng 3 (Tính toán số liệu), áp dụng chính xác công thức và chú ý quy ước làm tròn.
                  <br />
                  4. Với Dạng 4 (Ghép nối), nối chính xác từng cặp tương ứng để đạt điểm trọn vẹn.
                </p>
              )}
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-emerald-900">
                {isEn
                  ? '👩‍🏫 Message from Teacher Bui Thi Hong Hanh (History – Geography – Citizen Education):'
                  : '👩‍🏫 Nhắn gửi từ cô Bùi Thị Hồng Hạnh (Tổ Sử – Địa – GDKTPL):'}
              </div>
              <p>
                {isEn
                  ? '"Grade 10 Geography is not merely rote memorization, but the foundational key to comprehending the natural laws of our Earth and the socio-economic dynamics of human society as well as our homeland Lang Son. All 40 lessons and 1,600 questions are ready to accompany your journey!"'
                  : '"Địa lí 10 không phải là môn học ghi nhớ máy móc, mà là nền tảng giúp các em hiểu rõ quy luật tự nhiên của Trái Đất và sự phát triển kinh tế – xã hội của nhân loại cũng như quê hương Lạng Sơn. Toàn bộ 40 bài học và 1.600 câu hỏi đã sẵn sàng đồng hành cùng các em!"'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

