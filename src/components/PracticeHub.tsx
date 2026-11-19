import React, { useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Filter,
  Layers,
  Shuffle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Question, QuestionType } from '../types';
import { CURRICULUM_PARTS, CURRICULUM_CHAPTERS } from '../data/curriculum';
import { LESSONS } from '../data/lessons';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getLocalizedLesson,
  getLocalizedChapter,
  getLocalizedPart,
} from '../data/bilingualCurriculum';
import { localizeQuestion } from '../services/bilingualQuestions';
import {
  prepareExamQuestions,
  sortQuestionsByStandardOrder,
} from '../utils/quizUtils';

interface PracticeHubProps {
  questions: Question[];
  onStartQuiz: (selectedQuestions: Question[], title: string, mode: any) => void;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({ questions, onStartQuiz }) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'topic' | 'type' | 'comprehensive'>('topic');

  // Filter states
  const [selectedPartId, setSelectedPartId] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Available chapters based on selected part
  const availableChapters =
    selectedPartId === 'all'
      ? CURRICULUM_CHAPTERS
      : CURRICULUM_CHAPTERS.filter((c) => c.partId === selectedPartId);

  // Available lessons based on selected part and chapter
  const availableLessons = LESSONS.filter((l) => {
    if (selectedPartId !== 'all' && l.partId !== selectedPartId) return false;
    if (selectedChapterId !== 'all' && l.chapterId !== selectedChapterId) return false;
    return true;
  });

  // Filter questions for topic practice
  const getFilteredQuestions = () => {
    return questions.filter((q) => {
      if (selectedPartId !== 'all' && q.partId && q.partId !== selectedPartId) return false;
      if (selectedChapterId !== 'all' && q.chapterId && q.chapterId !== selectedChapterId) return false;
      if (selectedLessonId !== 'all' && q.lessonId !== selectedLessonId) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (selectedLevel !== 'all' && q.cognitiveLevel !== selectedLevel) return false;
      return true;
    });
  };

  const handleStartTopicPractice = () => {
    let pool = getFilteredQuestions();
    if (pool.length === 0) {
      alert(
        isEn
          ? 'No questions found matching current filters. Please broaden your selection.'
          : 'Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại. Vui lòng chọn điều kiện mở rộng hơn.'
      );
      return;
    }

    let selected: Question[] = [];

    if (selectedType !== 'all') {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    } else {
      if (questionCount === 40 && pool.length === 40) {
        selected = sortQuestionsByStandardOrder(pool);
      } else {
        selected = prepareExamQuestions(pool, Math.min(questionCount, pool.length));
      }
    }

    const partObj = CURRICULUM_PARTS.find((p) => p.id === selectedPartId);
    const chapterObj = CURRICULUM_CHAPTERS.find((c) => c.id === selectedChapterId);
    const lessonObj = LESSONS.find((l) => l.id === selectedLessonId);

    let title = isEn ? 'Lesson-Based Practice' : 'Luyện tập theo Bài học';
    if (lessonObj) {
      const locL = getLocalizedLesson(lessonObj, language);
      title = isEn ? `Practice: Lesson ${locL.number} - ${locL.title}` : `Luyện tập: Bài ${locL.number} - ${locL.title}`;
    } else if (chapterObj) {
      const locC = getLocalizedChapter(chapterObj, language);
      title = isEn ? `Practice: ${locC.title}` : `Luyện tập: ${locC.title}`;
    } else if (partObj) {
      const locP = getLocalizedPart(partObj, language);
      title = isEn ? `Practice: ${locP.title}` : `Luyện tập: ${locP.title}`;
    }

    const localizedQuestions = selected.map((q) => localizeQuestion(q, language));
    onStartQuiz(localizedQuestions, title, 'practice_topic');
  };

  // Start Type-specific practice
  const handleStartTypePractice = (type: QuestionType, typeName: string, typeNameEn: string) => {
    const pool = questions.filter((q) => q.type === type);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    const localized = selected.map((q) => localizeQuestion(q, language));
    onStartQuiz(
      localized,
      isEn ? `Specialized Practice: ${typeNameEn} (10 questions)` : `Luyện tập chuyên sâu: ${typeName} (10 câu)`,
      'practice_type'
    );
  };

  // Start Comprehensive practice (Guaranteed all 4 types in exact 1 -> 2 -> 3 -> 4 order)
  const handleStartComprehensive = (count: number) => {
    const selected = prepareExamQuestions(questions, count);
    const localized = selected.map((q) => localizeQuestion(q, language));
    onStartQuiz(
      localized,
      isEn
        ? `Comprehensive Practice (${count} questions - All 4 Formats)`
        : `Luyện tập tổng hợp ${count} câu (Đủ 4 dạng chuẩn Bộ GD&ĐT)`,
      'practice_comprehensive'
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isEn ? 'SKILL DRILLS & GEOGRAPHY 10 KNOWLEDGE' : 'RÈN LUYỆN KĨ NĂNG & TRI THỨC ĐỊA LÍ 10'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isEn ? 'Online Practice & Training Hub' : 'Trung Tâm Luyện Tập Trực Tuyến'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          {isEn
            ? '1,600-question bank encompassing all 40 lessons (3 Parts, 13 Chapters) with all 4 national competency assessment formats.'
            : 'Hệ thống ngân hàng 1.600 câu hỏi bao quát toàn bộ 40 bài học (3 Phần, 13 Chương) sách Kết nối tri thức, chuẩn hóa đầy đủ 4 dạng thức câu hỏi mới của Bộ GD&ĐT.'}
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('topic')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'topic'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isEn ? 'By Part, Chapter & Lesson (40 lessons)' : 'Luyện theo Phần, Chương & Bài (40 bài)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'type'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isEn ? 'By 4 Question Formats' : 'Luyện theo 4 Dạng thức'}</span>
          </button>
          <button
            onClick={() => setActiveTab('comprehensive')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'comprehensive'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>{isEn ? 'Comprehensive Mixed Drill' : 'Luyện tập Tổng hợp'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRACTICE BY PART / CHAPTER / LESSON */}
      {activeTab === 'topic' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>
              {isEn
                ? 'Configure filters for lesson and topic practice'
                : 'Thiết lập bộ lọc luyện tập theo bài học & chương trình'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Part Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isEn ? '1. Select Part:' : '1. Chọn Phần SGK:'}
              </label>
              <select
                value={selectedPartId}
                onChange={(e) => {
                  setSelectedPartId(e.target.value);
                  setSelectedChapterId('all');
                  setSelectedLessonId('all');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
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
            </div>

            {/* Chapter Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isEn ? '2. Select Chapter:' : '2. Chọn Chương:'}
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => {
                  setSelectedChapterId(e.target.value);
                  setSelectedLessonId('all');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="all">{isEn ? 'All Chapters' : 'Tất cả các chương'}</option>
                {availableChapters.map((c) => {
                  const locC = getLocalizedChapter(c, language);
                  return (
                    <option key={c.id} value={c.id}>
                      {locC.title}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Lesson Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isEn ? '3. Select Specific Lesson:' : '3. Chọn Bài học cụ thể:'}
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="all">
                  {isEn ? 'All lessons in selected scope' : 'Tất cả bài học trong phạm vi đã chọn'}
                </option>
                {availableLessons.map((l) => {
                  const locL = getLocalizedLesson(l, language);
                  return (
                    <option key={l.id} value={l.id}>
                      {isEn ? `Lesson ${locL.number}` : `Bài ${locL.number}`}: {locL.title}{' '}
                      {l.isPracticeLesson ? (isEn ? '(Practice)' : '(Thực hành)') : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Question Type Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isEn ? 'Question Format:' : 'Dạng thức câu hỏi:'}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="all">{isEn ? 'Combine all 4 question formats' : 'Kết hợp tất cả 4 dạng câu hỏi'}</option>
                <option value="multiple_choice">
                  {isEn ? 'Format 1: Multiple Choice (A, B, C, D)' : 'Dạng 1: Trắc nghiệm 4 lựa chọn (A, B, C, D)'}
                </option>
                <option value="true_false_context">
                  {isEn ? 'Format 2: Contextual True/False' : 'Dạng 2: Đúng/Sai có ngữ liệu thực tế'}
                </option>
                <option value="short_answer">
                  {isEn ? 'Format 3: Short Answer – Calculations' : 'Dạng 3: Trả lời ngắn – Bài tập tính toán số liệu'}
                </option>
                <option value="matching">
                  {isEn ? 'Format 4: Column Matching' : 'Dạng 4: Ghép nối hai cột'}
                </option>
              </select>
            </div>

            {/* Cognitive Level Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isEn ? 'Cognitive Level:' : 'Mức độ nhận thức:'}
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                <option value="all">
                  {isEn ? 'All levels (Recognition, Understanding, Application)' : 'Mọi mức độ (Nhận biết, Thông hiểu, Vận dụng)'}
                </option>
                <option value="nhan_biet">{isEn ? 'Recognition' : 'Nhận biết'}</option>
                <option value="thong_hieu">{isEn ? 'Understanding' : 'Thông hiểu'}</option>
                <option value="van_dung">{isEn ? 'Application & Higher-order' : 'Vận dụng & Vận dụng cao'}</option>
              </select>
            </div>
          </div>

          {/* Question count selector */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">
                {isEn ? 'Number of questions:' : 'Số lượng câu:'}
              </span>
              <div className="inline-flex space-x-1.5">
                {[5, 10, 15, 20, 40].map((c) => (
                  <button
                    key={c}
                    onClick={() => setQuestionCount(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      questionCount === c
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c} {isEn ? 'qs' : 'câu'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              {isEn ? 'Available:' : 'Khả dụng:'}{' '}
              <strong className="text-blue-600 font-bold">{getFilteredQuestions().length}</strong>{' '}
              {isEn ? 'questions in bank' : 'câu trong ngân hàng'}
            </div>
          </div>

          <button
            onClick={handleStartTopicPractice}
            className="w-full py-3.5 btn-primary font-extrabold text-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>
              {isEn
                ? `Start Practice Session (${questionCount} questions)`
                : `Bắt đầu lượt luyện tập (${questionCount} câu)`}
            </span>
          </button>
        </div>
      )}

      {/* TAB 2: PRACTICE BY 4 QUESTION TYPES */}
      {activeTab === 'type' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dạng 1: Xanh dương (Blue) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-blue-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm shadow-blue-600/30">
                1
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {isEn ? 'Multiple Choice (4 Options)' : 'Trắc nghiệm 4 lựa chọn'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEn
                  ? 'Format 1. Multiple Choice Questions (A, B, C, D)'
                  : 'Dạng 1. Trắc nghiệm 4 phương án (A, B, C, D)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isEn
                  ? 'Select the single best answer. Train recognition, comprehension, and fast chart and map reading. Available across all 40 lessons.'
                  : 'Lựa chọn một đáp án đúng duy nhất. Rèn luyện tư duy nhận biết, thông hiểu và khai thác nhanh thông tin bản đồ, bảng biểu. Toàn bộ 40 bài đều có đầy đủ ngân hàng câu hỏi.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() =>
                  handleStartTypePractice(
                    'multiple_choice',
                    'Trắc nghiệm 4 lựa chọn (A, B, C, D)',
                    'Multiple Choice (4 Options)'
                  )
                }
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-600/20 cursor-pointer"
              >
                <span>{isEn ? 'Practice Format 1 (10 questions)' : 'Luyện tập Dạng 1 (10 câu)'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dạng 2: Tím (Purple) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-purple-200/90 shadow-xs hover:border-purple-400 hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-sm shadow-purple-600/30">
                2
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                {isEn ? 'Contextual True/False' : 'Đúng - Sai ngữ liệu'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEn
                  ? 'Format 2. Contextual True / False Analysis'
                  : 'Dạng 2. Trắc nghiệm Đúng/Sai có đoạn ngữ liệu'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isEn
                  ? 'Analyze authentic geographical texts, charts, and statistics to judge True or False for 4 statements (a, b, c, d) with in-depth rationales.'
                  : 'Nghiên cứu đoạn tư liệu địa lí, biểu đồ hoặc số liệu thực tế, sau đó đánh giá Đúng hoặc Sai cho 4 nhận định a, b, c, d có giải thích chi tiết từng nhận định.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() =>
                  handleStartTypePractice(
                    'true_false_context',
                    'Đúng/Sai có ngữ liệu thực tế',
                    'Contextual True / False'
                  )
                }
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-purple-600/20 cursor-pointer"
              >
                <span>{isEn ? 'Practice Format 2 (10 questions)' : 'Luyện tập Dạng 2 (10 câu)'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dạng 3: Hổ phách (Amber) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-sm shadow-amber-500/30">
                3
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                {isEn ? 'Calculations / Short Answer' : 'Trả lời ngắn / Tính toán'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEn
                  ? 'Format 3. Short Answer – Geographical Calculations'
                  : 'Dạng 3. Trắc nghiệm trả lời ngắn (Bài tập tính toán bằng số)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isEn
                  ? 'Real data calculations: temperature amplitude, population density, growth rate, structure share, transport distance. Auto-evaluated via exact formula.'
                  : '100% là bài tập tính toán địa lí bằng số liệu thực tế (biên độ nhiệt, mật độ dân số, cự li vận chuyển, tỉ suất gia tăng tự nhiên, năng suất, tốc độ tăng trưởng, tỉ trọng cơ cấu). Tự động chấm điểm theo công thức chuẩn.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() =>
                  handleStartTypePractice(
                    'short_answer',
                    'Trả lời ngắn / Tính toán số liệu',
                    'Short Answer / Calculations'
                  )
                }
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-amber-500/20 cursor-pointer"
              >
                <span>{isEn ? 'Practice Format 3 (10 questions)' : 'Luyện tập Dạng 3 (10 câu)'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dạng 4: Ngọc lục bảo (Emerald) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-sm shadow-emerald-600/30">
                4
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                {isEn ? 'Column Matching A - B' : 'Nối cột A với cột B'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isEn
                  ? 'Format 4. Two-Column Matching (Column A - Column B)'
                  : 'Dạng 4. Câu hỏi ghép nối hai cột (Cột A - Cột B)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isEn
                  ? 'Connect geographical laws, winds, landforms, and resources with their corresponding definitions and distributions. Interactive drag/click.'
                  : 'Ghép nối các khái niệm, quy luật, loại gió, dạng địa hình, loại tài nguyên với định nghĩa, vai trò và biểu hiện tương ứng. Giao diện trực quan, chấm điểm tự động.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() =>
                  handleStartTypePractice(
                    'matching',
                    'Ghép nối hai cột',
                    'Column Matching'
                  )
                }
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <span>{isEn ? 'Practice Format 4 (10 questions)' : 'Luyện tập Dạng 4 (10 câu)'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPREHENSIVE PRACTICE */}
      {activeTab === 'comprehensive' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <Shuffle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEn ? 'Random Comprehensive Mixed Drills' : 'Luyện tập tổng hợp ngẫu nhiên'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEn
                ? 'Randomly draws questions from the 1,600 bank (40 lessons) across all 4 formats to reinforce all-around geographical competence.'
                : 'Hệ thống sẽ tự động bốc ngẫu nhiên câu hỏi từ ngân hàng 1.600 câu hỏi (40 bài học) và đan xen đầy đủ cả 4 dạng câu hỏi giúp học sinh rèn luyện phản xạ toàn diện.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-all text-center space-y-3">
              <div className="text-lg font-extrabold text-blue-700">
                {isEn ? '10-Question Pack' : 'Gói 10 câu'}
              </div>
              <div className="text-xs text-slate-600">
                {isEn ? 'Estimated: ~15 mins • All 4 formats' : 'Thời gian gợi ý: ~15 phút • Đủ cả 4 dạng thức'}
              </div>
              <button
                onClick={() => handleStartComprehensive(10)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isEn ? 'Start 10 questions' : 'Bắt đầu 10 câu'}
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 transition-all text-center space-y-3">
              <div className="text-lg font-extrabold text-emerald-700">
                {isEn ? '20-Question Pack' : 'Gói 20 câu'}
              </div>
              <div className="text-xs text-slate-600">
                {isEn ? 'Estimated: ~30 mins • Midterm scope' : 'Thời gian gợi ý: ~30 phút • Trọng tâm kiến thức kì'}
              </div>
              <button
                onClick={() => handleStartComprehensive(20)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isEn ? 'Start 20 questions' : 'Bắt đầu 20 câu'}
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/50 transition-all text-center space-y-3">
              <div className="text-lg font-extrabold text-purple-700">
                {isEn ? '40-Question Pack' : 'Gói 40 câu'}
              </div>
              <div className="text-xs text-slate-600">
                {isEn ? 'Estimated: ~50 mins • Full matrix' : 'Thời gian gợi ý: ~50 phút • Ma trận đề thi toàn diện'}
              </div>
              <button
                onClick={() => handleStartComprehensive(40)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isEn ? 'Start 40 questions' : 'Bắt đầu 40 câu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
