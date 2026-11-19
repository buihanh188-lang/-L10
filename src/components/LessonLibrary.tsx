import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  MapPin,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Tag,
  X,
  Film,
} from 'lucide-react';
import { Lesson, Question, UserProfile } from '../types';
import { LESSONS } from '../data/lessons';
import { CURRICULUM_CHAPTERS, CURRICULUM_PARTS } from '../data/curriculum';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getLocalizedLesson,
  getLocalizedChapter,
  getLocalizedPart,
} from '../data/bilingualCurriculum';
import { localizeQuestion } from '../services/bilingualQuestions';
import {
  filterCustomPracticeQuestions,
  prepareExamQuestions,
  sortQuestionsByStandardOrder,
} from '../utils/quizUtils';
import { apiService } from '../services/api';
import { LessonVideoPlayer } from './LessonVideoPlayer';

interface LessonLibraryProps {
  questions: Question[];
  currentUser: UserProfile;
  onStartLessonPractice: (lessonQuestions: Question[], lessonTitle: string) => void;
  onStartCustomPractice: (
    lessonQuestions: Question[],
    lessonTitle: string,
    instantFeedback: boolean
  ) => void;
  onStartExam: (
    lessonQuestions: Question[],
    lessonTitle: string,
    timeLimitMinutes: number
  ) => void;
}

export const LessonLibrary: React.FC<LessonLibraryProps> = ({
  questions,
  currentUser,
  onStartLessonPractice,
  onStartCustomPractice,
  onStartExam,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [selectedPartId, setSelectedPartId] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Modal states for Distinct Mode 2 (Custom Practice) and Mode 3 (Exam Briefing)
  const [showCustomPracticeModal, setShowCustomPracticeModal] = useState(false);
  const [showExamBriefingModal, setShowExamBriefingModal] = useState(false);

  // Custom Practice options
  const [customType, setCustomType] = useState<string>('all');
  const [customLevel, setCustomLevel] = useState<string>('all');
  const [customCount, setCustomCount] = useState<number>(10);
  const [customInstantFeedback, setCustomInstantFeedback] = useState<boolean>(true);

  // Exam Briefing options
  const [examConfig, setExamConfig] = useState<'standard_40' | 'quick_15' | 'speed_10'>('standard_40');
  const [publishedVideoMap, setPublishedVideoMap] = useState<Record<string, { durationSeconds: number; videoUrl: string }>>({});

  React.useEffect(() => {
    apiService.getPublishedVideosSummaryMap().then((map) => {
      setPublishedVideoMap(map || {});
    });
  }, [activeLesson]);

  // Available chapters based on selected part
  const availableChapters =
    selectedPartId === 'all'
      ? CURRICULUM_CHAPTERS
      : CURRICULUM_CHAPTERS.filter((c) => c.partId === selectedPartId);

  // Filter lessons
  const filteredLessons = LESSONS.filter((lesson) => {
    if (selectedPartId !== 'all' && lesson.partId !== selectedPartId) return false;
    if (selectedChapterId !== 'all' && lesson.chapterId !== selectedChapterId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const loc = getLocalizedLesson(lesson, language);
      const matchTitle = loc.title.toLowerCase().includes(q) || lesson.title.toLowerCase().includes(q);
      const matchSubtitle = loc.subtitle.toLowerCase().includes(q) || lesson.subtitle.toLowerCase().includes(q);
      const matchNumber =
        `bài ${lesson.number}`.includes(q) ||
        `lesson ${lesson.number}`.includes(q) ||
        `${lesson.number}` === q.trim();
      return matchTitle || matchSubtitle || matchNumber;
    }
    return true;
  });

  const getLessonQuestions = (lessonId: string) => {
    const raw = questions.filter((q) => q.lessonId === lessonId);
    return raw.map((q) => localizeQuestion(q, language));
  };

  // Launch Mode 1: Full 40 Questions Practice
  const handleLaunchFullPractice = () => {
    if (!activeLesson) return;
    const lQuestions = getLessonQuestions(activeLesson.id);
    const pool =
      lQuestions.length > 0
        ? lQuestions
        : questions.slice(0, 40).map((q) => localizeQuestion(q, language));
    const ordered = sortQuestionsByStandardOrder(pool);
    const loc = getLocalizedLesson(activeLesson, language);
    onStartLessonPractice(
      ordered,
      isEn
        ? `Full 40 Questions Practice (All 4 Formats): Lesson ${loc.number} - ${loc.title}`
        : `Luyện tập trọn bộ 40 câu (Đủ 4 dạng): Bài ${loc.number} - ${loc.title}`
    );
  };

  // Launch Mode 2: Custom Practice
  const handleLaunchCustomPractice = () => {
    if (!activeLesson) return;
    const lQuestions = getLessonQuestions(activeLesson.id);
    const pool =
      lQuestions.length > 0
        ? lQuestions
        : questions.slice(0, 40).map((q) => localizeQuestion(q, language));
    const filtered = filterCustomPracticeQuestions(pool, {
      type: customType,
      cognitiveLevel: customLevel,
      count: customCount,
    });
    setShowCustomPracticeModal(false);
    const loc = getLocalizedLesson(activeLesson, language);
    onStartCustomPractice(
      filtered.length > 0 ? filtered : pool.slice(0, customCount),
      isEn
        ? `Custom Practice (${customCount} questions): Lesson ${loc.number} - ${loc.title}`
        : `Luyện tập tự chọn (${customCount} câu): Bài ${loc.number} - ${loc.title}`,
      customInstantFeedback
    );
  };

  // Launch Mode 3: Official Examination
  const handleLaunchExam = () => {
    if (!activeLesson) return;
    const lQuestions = getLessonQuestions(activeLesson.id);
    const pool =
      lQuestions.length > 0
        ? lQuestions
        : questions.slice(0, 40).map((q) => localizeQuestion(q, language));

    let count = 28;
    let timeMinutes = 45;
    let label = isEn
      ? 'Periodic 45-Minute Exam (28 Questions Aligned with 2018 Standards)'
      : 'Bài kiểm tra định kỳ 45 phút (28 câu chuẩn GDPT 2018)';

    if (examConfig === 'quick_15') {
      count = 10;
      timeMinutes = 15;
      label = isEn ? '15-Minute Frequent Test (10 Questions)' : 'Bài kiểm tra thường xuyên 15 phút (10 câu)';
    } else if (examConfig === 'speed_10') {
      count = 15;
      timeMinutes = 20;
      label = isEn
        ? 'Periodic Topic Survey (15 Questions / 20 Minutes)'
        : 'Khảo sát định kì chủ đề (15 câu / 20 phút)';
    }

    const preparedQuestions = prepareExamQuestions(pool, count);
    setShowExamBriefingModal(false);
    const loc = getLocalizedLesson(activeLesson, language);
    onStartExam(
      preparedQuestions,
      `${label}: ${isEn ? `Lesson ${loc.number}` : `Bài ${loc.number}`} - ${loc.title}`,
      timeMinutes
    );
  };

  // If a lesson is clicked, show its full structured reader
  if (activeLesson) {
    const locLesson = getLocalizedLesson(activeLesson, language);
    const lessonQuestions = getLessonQuestions(activeLesson.id);
    const partObj = CURRICULUM_PARTS.find((p) => p.id === activeLesson.partId);
    const chapterObj = CURRICULUM_CHAPTERS.find((c) => c.id === activeLesson.chapterId);
    const locPart = partObj ? getLocalizedPart(partObj, language) : undefined;
    const locChapter = chapterObj ? getLocalizedChapter(chapterObj, language) : undefined;

    // Compute preview count for custom modal
    const availableCustomCount = lessonQuestions.filter((q) => {
      if (customType !== 'all' && q.type !== customType) return false;
      if (customLevel !== 'all' && q.cognitiveLevel !== customLevel) return false;
      return true;
    }).length;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setActiveLesson(null)}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEn ? 'Back to 40 Lessons directory' : 'Quay lại danh mục 40 bài học'}</span>
        </button>

        {/* Lesson Hero Banner - Xanh Navy đậm sang trọng, Tên bài học xanh ngọc */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
              {locPart?.title || (isEn ? 'Geography 10' : 'Địa lí 10')}
            </span>
            {locChapter && (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-teal-300 text-xs font-bold border border-slate-700">
                {isEn ? `Chapter ${locChapter.number}` : `Chương ${locChapter.number}`}: {locChapter.title}
              </span>
            )}
            {activeLesson.isPracticeLesson && (
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-xs">
                {isEn ? 'Practice Lesson' : 'Bài Thực hành'}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-200 text-xs font-medium">
              {isEn ? `Duration: ${activeLesson.durationMinutes} mins` : `Thời lượng: ${activeLesson.durationMinutes} phút`}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-teal-200 text-xs font-medium border border-teal-500/30">
              {isEn ? 'Connecting Knowledge to Life' : 'Kết nối tri thức với cuộc sống'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400">
              {isEn ? 'STANDARD CURRICULUM LESSON • GDPT 2018' : 'BÀI HỌC CHÍNH KHÓA • GDPT 2018'}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-teal-200 leading-tight">
              {isEn ? `Lesson ${locLesson.number}` : `Bài ${locLesson.number}`}: {locLesson.title}
            </h1>
          </div>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">{locLesson.subtitle}</p>

          {/* 3 DISTINCT ACTION PATHWAYS IN HERO */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? '3 DISTINCT PRACTICE & ASSESSMENT MODES:'
                  : '3 CHẾ ĐỘ LUYỆN TẬP VÀ KIỂM TRA ĐÁNH GIÁ RIÊNG BIỆT:'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Option 1: Full 40 Practice */}
              <button
                onClick={handleLaunchFullPractice}
                className="p-3.5 rounded-2xl bg-teal-800/60 hover:bg-teal-700 text-white text-left transition-all border border-teal-500/40 shadow-sm hover:scale-102 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-400 text-slate-950 uppercase">
                      {isEn ? 'Mode 1' : 'Chế độ 1'}
                    </span>
                    <Layers className="w-4 h-4 text-teal-200 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm">
                    {isEn ? 'Full 40 Questions Practice' : 'Luyện tập trọn bộ 40 câu'}
                  </div>
                  <p className="text-[11px] text-teal-100 mt-1 line-clamp-2">
                    {isEn
                      ? 'All 4 formats (10 questions/format). Free navigation and question flagging.'
                      : 'Làm đủ 4 dạng thức (10 câu/dạng). Tự do chuyển câu, gắn cờ xem lại.'}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-teal-300 flex items-center space-x-1">
                  <span>{isEn ? 'Start 40 questions' : 'Vào luyện 40 câu'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 2: Custom Practice */}
              <button
                onClick={() => setShowCustomPracticeModal(true)}
                className="p-3.5 rounded-2xl bg-purple-900/60 hover:bg-purple-800 text-white text-left transition-all border border-purple-500/40 shadow-sm hover:scale-102 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-300 text-slate-950 uppercase">
                      {isEn ? 'Mode 2' : 'Chế độ 2'}
                    </span>
                    <Sliders className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm">
                    {isEn ? 'Flexible Custom Practice' : 'Luyện tập tự chọn linh hoạt'}
                  </div>
                  <p className="text-[11px] text-purple-100 mt-1 line-clamp-2">
                    {isEn
                      ? 'Filter by question type, cognitive level, count (5-20), instant feedback.'
                      : 'Tùy chọn dạng câu, mức độ, số lượng (5-20 câu), xem phản hồi tức thì.'}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-purple-300 flex items-center space-x-1">
                  <span>{isEn ? 'Configure practice' : 'Cấu hình tự chọn'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 3: Official Examination */}
              <button
                onClick={() => setShowExamBriefingModal(true)}
                className="p-3.5 rounded-2xl bg-rose-900/60 hover:bg-rose-800 text-white text-left transition-all border border-rose-500/40 shadow-sm hover:scale-102 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-400 text-slate-950 uppercase">
                      {isEn ? 'Mode 3' : 'Chế độ 3'}
                    </span>
                    <GraduationCap className="w-4 h-4 text-rose-200 group-hover:-rotate-12 transition-transform" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm">
                    {isEn ? 'Assessment Exam Room' : 'Làm bài kiểm tra đánh giá'}
                  </div>
                  <p className="text-[11px] text-rose-100 mt-1 line-clamp-2">
                    {isEn
                      ? 'Official room: Live countdown, shuffled order, hidden hints, auto-submit on timeout.'
                      : 'Phòng thi chính thức: Đếm ngược thời gian, đề xáo trộn, ẩn gợi ý, tự nộp khi hết giờ.'}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-rose-300 flex items-center space-x-1">
                  <span>{isEn ? 'Enter exam hall' : 'Vào phòng thi'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* VIDEO BÀI GIẢNG (CHỈ HIỂN THỊ VIDEO ĐÃ ĐƯỢC GIÁO VIÊN DUYỆT & XUẤT BẢN) */}
        <LessonVideoPlayer
          lessonId={activeLesson.id}
          lessonNumber={locLesson.number}
          lessonTitle={locLesson.title}
          isEn={isEn}
          onJumpToKnowledge={() => {
            document.getElementById('lesson-core-knowledge')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onJumpToPractice={() => {
            document.getElementById('lesson-practice-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 1. MỤC TIÊU BÀI HỌC */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-2.5">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <span>
              {isEn
                ? '1. LESSON OBJECTIVES (LEARNING OUTCOMES UNDER 2018 CURRICULUM)'
                : '1. MỤC TIÊU BÀI HỌC (YÊU CẦU CẦN ĐẠT THEO CHƯƠNG TRÌNH GDPT 2018)'}
            </span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {locLesson.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <span className="text-teal-600 font-extrabold">✓</span>
                <span className="leading-relaxed font-medium">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. KIẾN THỨC TRỌNG TÂM - Mục kiến thức vàng cam nhạt, Lưu ý quan trọng màu cam */}
        <div id="lesson-core-knowledge" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-2.5">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span>
              {isEn ? '2. CORE KNOWLEDGE TO MASTER' : '2. KIẾN THỨC TRỌNG TÂM CẦN LÀM CHỦ'}
            </span>
          </div>

          <div className="space-y-6">
            {locLesson.keyKnowledge.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-3">
                {/* Đề mục kiến thức: Vàng cam nhạt theo quy chuẩn */}
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-950 font-extrabold text-sm sm:text-base flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                    {sIdx + 1}
                  </span>
                  <span>{sec.sectionTitle}</span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  {sec.content.map((p, pIdx) => (
                    <p key={pIdx} className="pl-4 border-l-3 border-amber-400/80 bg-slate-50/50 py-1.5 pr-2 rounded-r-lg">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Lưu ý quan trọng / Điểm cốt lõi: Màu cam theo quy chuẩn */}
                {sec.highlight && (
                  <div className="p-3.5 bg-orange-50 border border-orange-300 rounded-xl text-xs text-orange-950 font-medium flex items-start gap-2.5 shadow-2xs">
                    <span className="text-orange-600 font-bold shrink-0 text-sm">⚠️</span>
                    <div>
                      <strong className="font-extrabold text-orange-900 uppercase tracking-wide">
                        {isEn ? 'Key Point & Critical Note:' : 'Lưu ý quan trọng & Điểm cốt lõi:'}
                      </strong>{' '}
                      <span>{sec.highlight}</span>
                    </div>
                  </div>
                )}

                {sec.diagramAscii && (
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-teal-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-slate-800">
                    {sec.diagramAscii.trim()}
                  </pre>
                )}

                {sec.tableData && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                          {sec.tableData.headers.map((h, i) => (
                            <th key={i} className="p-2.5">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {sec.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 font-medium">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. KHÁI NIỆM & THUẬT NGỮ QUAN TRỌNG */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <Tag className="w-5 h-5 text-purple-600" />
            <span>
              {isEn ? '3. KEY CONCEPTS & TERMINOLOGY' : '3. CÁC KHÁI NIỆM & THUẬT NGỮ QUAN TRỌNG'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locLesson.keyTerms.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-1">
                <div className="font-bold text-purple-950 text-xs sm:text-sm">{t.term}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{t.definition}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. VÍ DỤ THỰC TIỄN & ĐỊA PHƯƠNG HÓA */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            <span>
              {isEn
                ? '4. REAL-WORLD EXAMPLES & LOCAL CASE STUDIES (VAN LINH, CHI LANG, LANG SON PROVINCE)'
                : '4. VÍ DỤ THỰC TIỄN ĐỜI SỐNG & LIÊN HỆ ĐỊA PHƯƠNG (XÃ VẠN LINH, XÃ CHI LĂNG, TỈNH LẠNG SƠN)'}
            </span>
          </div>
          <div className="space-y-2">
            {locLesson.realWorldExamples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-xs sm:text-sm text-slate-800 leading-relaxed flex items-start space-x-2"
              >
                <span className="text-rose-600 font-bold">📍</span>
                <span>{ex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. NỘI DUNG CỐT LÕI CẦN GHI NHỚ - Nền xanh nhạt chuẩn quy định */}
        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-sky-950 font-extrabold text-base border-b border-sky-200/70 pb-2.5">
            <Lightbulb className="w-5 h-5 text-sky-600" />
            <span>
              {isEn ? '5. KEY TAKEAWAYS TO REMEMBER' : '5. NỘI DUNG CỐT LÕI CẦN GHI NHỚ'}
            </span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-sky-950">
            {locLesson.keyTakeaways.map((tak, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <span className="text-sky-600 font-black">★</span>
                <span className="font-medium leading-relaxed">{tak}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. MỤC LUYỆN TẬP VÀ KIỂM TRA ĐÁNH GIÁ (3 MỤC RIÊNG BIỆT) */}
        <div id="lesson-practice-section" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-1 border border-teal-200">
              <span>
                {isEn
                  ? `COMPETENCY ASSESSMENT SYSTEM FOR LESSON ${locLesson.number}`
                  : `HỆ THỐNG ĐÁNH GIÁ NĂNG LỰC BÀI ${locLesson.number}`}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {isEn
                ? '6. CHOOSE PRACTICE & ASSESSMENT FORMAT'
                : '6. LỰA CHỌN PHƯƠNG THỨC LUYỆN TẬP & KIỂM TRA'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isEn
                ? 'Select one of the 3 pathways below to begin. Each pathway provides a tailored learning experience:'
                : 'Học sinh lựa chọn một trong 3 phương thức dưới đây để bắt đầu. Mỗi phương thức có luồng xử lý và mục tiêu học tập riêng biệt:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Card 1 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-teal-50/70 to-white border border-teal-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {isEn ? '1. Full 40 Questions Practice' : '1. Luyện tập đầy đủ 40 câu'}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isEn
                    ? 'All 4 formats (10 multiple choice, 10 true/false, 10 calculation short answers, 10 column matchings). Sequential or flexible review.'
                    : 'Trọn bộ 40 câu hỏi gồm đủ 4 dạng thức (10 câu TN 4 lựa chọn, 10 câu Đúng/Sai, 10 bài tập tính toán số, 10 câu nối cột). Làm lần lượt hoặc tự do chuyển đổi, xem giải thích sau khi nộp bài.'}
                </p>
              </div>
              <button
                onClick={handleLaunchFullPractice}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-teal-700/20 cursor-pointer"
              >
                <span>{isEn ? 'Start 40 questions' : 'Bắt đầu luyện 40 câu'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-50/70 to-white border border-purple-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {isEn ? '2. Flexible Custom Practice' : '2. Luyện tập tự chọn linh hoạt'}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isEn
                    ? 'Filter by format, cognitive level (Recognition, Understanding, Application), and count (5-20). Instant feedback mode supported.'
                    : 'Tùy biến dạng câu (TN, Đúng/Sai, Tính toán, Ghép nối), chọn mức độ (Nhận biết, Thông hiểu, Vận dụng) và số câu (5-20 câu). Hỗ trợ kiểm tra đáp án và xem phản hồi tức thì sau từng câu.'}
                </p>
              </div>
              <button
                onClick={() => setShowCustomPracticeModal(true)}
                className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-purple-700/20 cursor-pointer"
              >
                <span>{isEn ? 'Configure custom' : 'Cấu hình tự chọn'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-rose-50/70 to-white border border-rose-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {isEn ? '3. Formal Assessment Exam' : '3. Làm bài kiểm tra đánh giá'}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isEn
                    ? 'Formal exam environment: Countdown clock, randomized question and option order, hidden formulas and hints. Auto-submit on time.'
                    : 'Chế độ thi chính thức: Có đồng hồ đếm ngược, xáo trộn câu hỏi và đáp án, ẩn toàn bộ công thức và gợi ý giải. Tự động thu bài khi hết giờ và lưu kết quả vào lịch sử kiểm tra.'}
                </p>
              </div>
              <button
                onClick={() => setShowExamBriefingModal(true)}
                className="w-full py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-rose-700/20 cursor-pointer"
              >
                <span>{isEn ? 'Enter exam room' : 'Vào phòng thi'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 1: CẤU HÌNH LUYỆN TẬP TỰ CHỌN */}
        {showCustomPracticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {isEn ? 'Custom Practice Configuration' : 'Cấu hình Luyện tập Tự chọn'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isEn ? `Lesson ${locLesson.number}: ${locLesson.title}` : `Bài ${locLesson.number}: ${locLesson.title}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomPracticeModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* 1. Chọn dạng câu hỏi */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    {isEn ? '1. Target Question Format:' : '1. Dạng câu hỏi muốn rèn luyện:'}
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="all">
                      {isEn ? 'All 4 combined question formats' : 'Tất cả 4 dạng câu hỏi kết hợp'}
                    </option>
                    <option value="multiple_choice">
                      {isEn ? 'Format 1: Multiple Choice (4 Options)' : 'Dạng 1: Trắc nghiệm 4 lựa chọn'}
                    </option>
                    <option value="true_false_context">
                      {isEn ? 'Format 2: Contextual True / False' : 'Dạng 2: Đúng / Sai có ngữ liệu'}
                    </option>
                    <option value="short_answer">
                      {isEn ? 'Format 3: Geography Calculations (Short Answer)' : 'Dạng 3: Bài tập tính toán địa lí (nhập số)'}
                    </option>
                    <option value="matching">
                      {isEn ? 'Format 4: Column Matching' : 'Dạng 4: Ghép nối hai cột'}
                    </option>
                  </select>
                </div>

                {/* 2. Chọn mức độ nhận thức */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    {isEn ? '2. Cognitive Level:' : '2. Mức độ nhận thức:'}
                  </label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="all">
                      {isEn ? 'All Levels (Recognition, Understanding, Application)' : 'Mọi mức độ (Nhận biết, Thông hiểu, Vận dụng)'}
                    </option>
                    <option value="nhan_biet">{isEn ? 'Recognition' : 'Nhận biết'}</option>
                    <option value="thong_hieu">{isEn ? 'Understanding' : 'Thông hiểu'}</option>
                    <option value="van_dung">{isEn ? 'Application' : 'Vận dụng'}</option>
                  </select>
                </div>

                {/* 3. Chọn số lượng câu */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    {isEn ? '3. Number of Questions:' : '3. Số lượng câu hỏi cho lượt này:'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCustomCount(c)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          customCount === c
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {c} {isEn ? 'qs' : 'câu'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Chọn chế độ phản hồi */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <label className="font-bold text-slate-700">
                    {isEn ? '4. Feedback Mode:' : '4. Chế độ phản hồi đáp án:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomInstantFeedback(true)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                        customInstantFeedback
                          ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">{isEn ? '✓ Instant per question' : '✓ Xem ngay sau từng câu'}</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {isEn ? 'Check answer immediately after answering' : 'Học sinh bấm kiểm tra đáp án tức thì'}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomInstantFeedback(false)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                        !customInstantFeedback
                          ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">{isEn ? '✓ Full review on submit' : '✓ Nộp bài xem tổng thể'}</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {isEn ? 'View explanations after finishing all' : 'Làm xong toàn bộ mới xem kết quả'}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-slate-700 text-xs flex items-center justify-between">
                  <span>{isEn ? 'Available questions matching filter:' : 'Số câu hỏi khả dụng theo bộ lọc:'}</span>
                  <span className="font-bold text-purple-700 text-sm">
                    {availableCustomCount} {isEn ? 'questions' : 'câu'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowCustomPracticeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isEn ? 'Close' : 'Đóng'}
                </button>
                <button
                  onClick={handleLaunchCustomPractice}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-500/20"
                >
                  {isEn ? 'Start Custom Practice' : 'Bắt đầu luyện tập tự chọn'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: MÀN HÌNH GIỚI THIỆU PHÒNG THI & QUY CHẾ KIỂM TRA (EXAM BRIEFING) */}
        {showExamBriefingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {isEn ? 'Competency Assessment Exam Room' : 'Phòng Kiểm Tra Đánh Giá Năng Lực'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isEn
                        ? 'Hoa Binh High School – History • Geography • Citizen Education'
                        : 'Trường THPT Hòa Bình – Tổ Sử – Địa – GDKTPL'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExamBriefingModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student and Exam Meta */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block">{isEn ? 'Exam:' : 'Bài kiểm tra:'}</span>
                  <strong className="text-slate-900">
                    {isEn ? `Lesson ${locLesson.number} - ${locLesson.title}` : `Bài ${locLesson.number} - ${locLesson.title}`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isEn ? 'Instructor:' : 'Giáo viên phụ trách:'}</span>
                  <strong className="text-slate-900">Bùi Thị Hồng Hạnh</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isEn ? 'Candidate:' : 'Thí sinh:'}</span>
                  <strong className="text-blue-700">
                    {currentUser.name} ({isEn ? `Class ${currentUser.className || '10'}` : `Lớp ${currentUser.className || '10'}`})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{isEn ? 'Grading Scale:' : 'Thang điểm:'}</span>
                  <strong className="text-emerald-700">
                    {isEn ? '10.0 Points (2018 Standards)' : '10.0 điểm (Chuẩn GDPT 2018)'}
                  </strong>
                </div>
              </div>

              {/* Choose Exam Configuration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  {isEn ? 'Select Exam Configuration:' : 'Chọn cấu hình đề kiểm tra:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamConfig('standard_40')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      examConfig === 'standard_40'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{isEn ? 'Standard Exam' : 'Đề tiêu chuẩn'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isEn ? '28 Qs / 45 mins' : '28 câu / 45 phút'}
                    </div>
                    <div className="text-[10px] text-rose-700 mt-1 font-semibold">
                      {isEn ? 'All 4 formats' : 'Đủ 4 dạng thức'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamConfig('quick_15')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      examConfig === 'quick_15'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{isEn ? '15-Min Test' : 'Kiểm tra 15 phút'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isEn ? '10 Qs / 15 mins' : '10 câu / 15 phút'}
                    </div>
                    <div className="text-[10px] text-rose-700 mt-1 font-semibold">
                      {isEn ? 'Key concepts' : 'Trọng tâm bài'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamConfig('speed_10')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      examConfig === 'speed_10'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{isEn ? 'Topic Survey' : 'Khảo sát chủ đề'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isEn ? '15 Qs / 20 mins' : '15 câu / 20 phút'}
                    </div>
                    <div className="text-[10px] text-rose-700 mt-1 font-semibold">
                      {isEn ? 'Competency test' : 'Khảo sát kiến thức'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Strict Examination Rules */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 space-y-2">
                <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>{isEn ? 'OFFICIAL EXAM ROOM RULES:' : 'QUY CHẾ PHÒNG THI CHÍNH THỨC:'}</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-700">
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold">1.</span>
                    <span>
                      {isEn
                        ? 'Questions and answer choices are automatically randomized by the system.'
                        : 'Đề thi được hệ thống xáo trộn tự động cả thứ tự câu hỏi và thứ tự phương án.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold">2.</span>
                    <span>
                      {isEn
                        ? 'Formulas, hints, and explanations are strictly hidden throughout the test.'
                        : 'Tuyệt đối ẩn công thức, gợi ý và giải thích trong suốt quá trình làm bài.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold">3.</span>
                    <span>
                      {isEn
                        ? 'Countdown timer runs continuously; auto-submits when time runs out.'
                        : 'Đồng hồ đếm ngược hoạt động liên tục; tự động thu bài khi hết giờ.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold">4.</span>
                    <span>
                      {isEn
                        ? 'Each candidate submits once only. Result is recorded to official academic history.'
                        : 'Học sinh chỉ được nộp bài 01 lần duy nhất. Kết quả được lưu vào Lịch sử kiểm tra chính thức.'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowExamBriefingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isEn ? 'Cancel' : 'Hủy bỏ'}
                </button>
                <button
                  onClick={handleLaunchExam}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-500/20 flex items-center justify-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Confirm & Start Exam Timer' : 'Xác nhận vào thi & Bắt đầu tính giờ'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>
            {isEn
              ? 'TEXTBOOK CONNECTING KNOWLEDGE TO LIFE – 2018 CURRICULUM'
              : 'SGK KẾT NỐI TRI THỨC VỚI CUỘC SỐNG – CHƯƠNG TRÌNH GDPT 2018'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isEn ? 'Digital Learning Hub for All 40 Lessons' : 'Kho Học Liệu Điện Tử Toàn Bộ 40 Bài Học'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          {isEn
            ? 'Standard structure of 3 Parts • 13 Chapters • 40 Lessons with 1,600 questions across all 4 competency-based formats.'
            : 'Cấu trúc chuẩn 3 Phần • 13 Chương • 40 Bài học với 1.600 câu hỏi (đầy đủ 4 dạng thức: Trắc nghiệm 4 lựa chọn, Đúng/Sai ngữ liệu, Trả lời ngắn tính toán và Ghép nối).'}
        </p>
      </div>

      {/* Part Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => {
            setSelectedPartId('all');
            setSelectedChapterId('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            selectedPartId === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isEn ? 'All 40 Lessons' : 'Tất cả 40 bài học'}
        </button>
        {CURRICULUM_PARTS.map((part) => {
          const locP = getLocalizedPart(part, language);
          return (
            <button
              key={part.id}
              onClick={() => {
                setSelectedPartId(part.id);
                setSelectedChapterId('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedPartId === part.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {locP.title}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={
              isEn
                ? 'Search lesson name, number (e.g. lesson 5, practice)...'
                : 'Tìm theo tên bài học, số bài (ví dụ: bài 5, thực hành)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Chapter Filter */}
        <div className="w-full md:w-auto flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-600 shrink-0">
            {isEn ? 'Chapter:' : 'Chương:'}
          </span>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full md:w-72 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-800"
          >
            <option value="all">{isEn ? 'All Chapters' : 'Tất cả các chương'}</option>
            {availableChapters.map((c) => {
              const locC = getLocalizedChapter(c, language);
              return (
                <option key={c.id} value={c.id}>
                  {locC.title} ({c.lessonsCount} {isEn ? 'lessons' : 'bài'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Lesson Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          {isEn
            ? <>Showing <strong>{filteredLessons.length}</strong> / 40 lessons</>
            : <>Hiển thị <strong>{filteredLessons.length}</strong> / 40 bài học</>}
        </span>
        <span>
          {isEn
            ? 'Each lesson equipped with 40 questions (10 per format)'
            : 'Mỗi bài học được trang bị tối thiểu 40 câu hỏi (10 câu / dạng)'}
        </span>
      </div>

      {/* Lessons List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.map((lesson) => {
          const locLesson = getLocalizedLesson(lesson, language);
          const chapterObj = CURRICULUM_CHAPTERS.find((c) => c.id === lesson.chapterId);
          const locChapter = chapterObj ? getLocalizedChapter(chapterObj, language) : undefined;
          const qCount = getLessonQuestions(lesson.id).length;

          return (
            <div
              key={lesson.id}
              onClick={() => setActiveLesson(lesson)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Chapter tag in dark navy and Lesson badge in teal */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                      {isEn ? `Lesson ${locLesson.number}` : `Bài ${locLesson.number}`}
                    </span>
                    {lesson.isPracticeLesson && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        {isEn ? 'Practice' : 'Thực hành'}
                      </span>
                    )}
                  </div>
                  {locChapter && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-900 text-slate-100 border border-slate-800 truncate max-w-[170px]">
                      {isEn ? `Ch. ${locChapter.number}` : `Chương ${locChapter.number}`}: {locChapter.title}
                    </span>
                  )}
                </div>

                <div>
                  {/* Tên bài học màu xanh ngọc chuẩn quy định */}
                  <h3 className="text-base font-extrabold text-teal-800 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                    {locLesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{locLesson.subtitle}</p>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap font-medium">
                  <span>⏱ {lesson.durationMinutes} {isEn ? 'mins' : 'phút'}</span>
                  <span>•</span>
                  <span>
                    🎯 {locLesson.objectives.length} {isEn ? 'learning goals' : 'mục tiêu cần đạt'}
                  </span>
                  {publishedVideoMap[lesson.id] && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-teal-700 font-bold">
                        <Film className="w-3 h-3" />
                        <span>{isEn ? 'Video Lecture' : 'Có Video bài giảng'}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {qCount > 0
                      ? isEn ? `${qCount} questions (4 formats)` : `${qCount} câu hỏi (4 dạng)`
                      : isEn ? '40 questions (4 formats)' : '40 câu hỏi (4 dạng)'}
                  </span>
                </span>

                <div className="flex items-center space-x-1 text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
                  <span>{isEn ? 'View details' : 'Xem chi tiết'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

