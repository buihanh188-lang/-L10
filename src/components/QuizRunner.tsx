import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  Flag,
  FileText,
  HelpCircle,
  Lock,
  RotateCcw,
  Send,
  ShieldCheck,
  Sliders,
  XCircle,
} from 'lucide-react';
import { ExamRecord, Question, StudentAnswers, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeExamTitle, localizeQuestion } from '../services/bilingualQuestions';

interface QuizRunnerProps {
  questions: Question[];
  title: string;
  mode: 'practice_topic' | 'practice_type' | 'practice_comprehensive' | 'official_test';
  lessonId?: string;
  timeLimitMinutes?: number;
  instantFeedback?: boolean;
  currentUser: UserProfile;
  onComplete: (record: ExamRecord) => void;
  onExit: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  title,
  mode,
  lessonId,
  timeLimitMinutes,
  instantFeedback = false,
  currentUser,
  onComplete,
  onExit,
}) => {
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    timeLimitMinutes ? timeLimitMinutes * 60 : null
  );
  const [startTime] = useState<number>(Date.now());
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [timeExpiredModal, setTimeExpiredModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);
  const hasAutoSubmittedRef = useRef(false);
  const sessionAttemptIdRef = useRef(
    'rec-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900)
  );
  const pendingRecordRef = useRef<ExamRecord | null>(null);

  // Instant check state for custom practice mode
  const [checkedQuestions, setCheckedQuestions] = useState<{ [qId: string]: boolean }>({});

  // Matching helper state: currently selected left item
  const [selectedMatchingLeftId, setSelectedMatchingLeftId] = useState<string | null>(null);

  // Timer effect (tracks session time limit like 45m or 15m)
  useEffect(() => {
    if (secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      if (!hasAutoSubmittedRef.current) {
        handleAutoSubmitOnTimeOut();
      }
      return;
    }
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const rawQ = questions[currentIndex];
  if (!rawQ) return null;
  const currentQ = localizeQuestion(rawQ, language);

  const currentAnswer = answers[currentQ.id] || {};
  const isChecked = !!checkedQuestions[currentQ.id];

  // Answer handlers
  const handleSelectMultipleChoice = (index: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        multipleChoiceIndex: index,
      },
    }));
  };

  const handleSelectTrueFalse = (stmtId: 'a' | 'b' | 'c' | 'd', value: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        trueFalseSelections: {
          ...(prev[currentQ.id]?.trueFalseSelections || {}),
          [stmtId]: value,
        },
      },
    }));
  };

  const handleShortAnswerChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        shortAnswerText: text,
      },
    }));
  };

  const handleConnectMatching = (leftId: string, rightId: string) => {
    setAnswers((prev) => {
      const existingConns = { ...(prev[currentQ.id]?.matchingConnections || {}) };
      // Remove any existing connection to rightId to prevent collision
      Object.keys(existingConns).forEach((k) => {
        if (existingConns[k] === rightId) delete existingConns[k];
      });
      existingConns[leftId] = rightId;
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          matchingConnections: existingConns,
        },
      };
    });
    setSelectedMatchingLeftId(null);
  };

  const handleRemoveMatching = (leftId: string) => {
    setAnswers((prev) => {
      const existingConns = { ...(prev[currentQ.id]?.matchingConnections || {}) };
      delete existingConns[leftId];
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          matchingConnections: existingConns,
        },
      };
    });
  };

  const handleToggleFlag = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        isFlagged: !prev[currentQ.id]?.isFlagged,
      },
    }));
  };

  // Check if a question has been answered
  const isQuestionAnswered = (q: Question) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === 'multiple_choice') return a.multipleChoiceIndex !== undefined;
    if (q.type === 'true_false_context') {
      const sels = a.trueFalseSelections || {};
      return ['a', 'b', 'c', 'd'].every((k) => sels[k as 'a' | 'b' | 'c' | 'd'] !== undefined);
    }
    if (q.type === 'short_answer') {
      return (a.shortAnswerText || '').trim().length > 0;
    }
    if (q.type === 'matching') {
      const conns = a.matchingConnections || {};
      return Object.keys(conns).length === q.pairs.length;
    }
    return false;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  const handleAutoSubmitOnTimeOut = () => {
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    setTimeExpiredModal(true);
    setTimeout(() => {
      doGradingAndSave();
    }, 1800);
  };

  const buildGradedRecord = (): ExamRecord => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const localizedQuestions = questions.map((q) => localizeQuestion(q, language));
    const localizedTitle = localizeExamTitle(title, language);
    const grading = StorageService.gradeSubmission(localizedQuestions, answers, language);

    const distinctLessonIds = Array.from(new Set(questions.map((q) => q.lessonId).filter(Boolean)));
    const resolvedLessonId =
      lessonId || (distinctLessonIds.length === 1 ? distinctLessonIds[0] : undefined);

    const distinctChapterIds = Array.from(
      new Set(grading.details.map((d) => d.chapterId).filter((c): c is string => !!c))
    );
    const resolvedChapterId = distinctChapterIds.length === 1 ? distinctChapterIds[0] : undefined;

    const distinctTypes = Array.from(new Set(questions.map((q) => q.type).filter(Boolean)));
    const resolvedQuestionType =
      distinctTypes.length === 1 ? (distinctTypes[0] as any) : 'all';

    const nowTs = Date.now();
    return {
      id: sessionAttemptIdRef.current,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentCode: currentUser.code,
      schoolName: currentUser.school,
      className: currentUser.className || (currentUser.role === 'teacher' ? 'GV' : ''),
      lessonId: resolvedLessonId,
      chapterId: resolvedChapterId,
      lessonTitle: localizedTitle,
      questionType: resolvedQuestionType,
      title: localizedTitle,
      mode,
      language,
      timestamp: nowTs,
      date: new Date(nowTs).toISOString().split('T')[0],
      durationSeconds,
      timeLimitMinutes,
      totalQuestions: questions.length,
      answeredCount: grading.answeredCount,
      unansweredCount: grading.unansweredCount,
      score: grading.score,
      correctCount: grading.correctCount,
      wrongCount: grading.wrongCount,
      accuracyRate: grading.accuracyRate,
      details: grading.details,
      studentAnswers: answers,
      topicBreakdown: grading.topicBreakdown,
      typeBreakdown: grading.typeBreakdown as any,
      weakTopics: grading.weakTopics,
      strongTopics: grading.strongTopics,
      recommendation: grading.recommendation,
    };
  };

  const doGradingAndSave = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    const record = pendingRecordRef.current || buildGradedRecord();
    pendingRecordRef.current = record;

    try {
      const savedRecord = await StorageService.saveExamRecordStrict(record, currentUser);
      pendingRecordRef.current = null;
      setShowConfirmSubmit(false);
      setTimeExpiredModal(false);
      onComplete(savedRecord);
    } catch (err: any) {
      const isEnLang = language === 'en';
      const fallbackMsg = isEnLang
        ? 'Could not save your submission to the server. Your answers are safely queued locally—please retry.'
        : 'Chưa thể lưu bài làm lên máy chủ. Kết quả đã được giữ an toàn trên thiết bị—vui lòng bấm thử lại.';
      setSubmitError(err?.message || fallbackMsg);
      setTimeExpiredModal(false);
      setShowConfirmSubmit(true);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Instant feedback evaluation for current question
  const evaluateCurrentQuestion = () => {
    const isEn = language === 'en';
    if (!currentAnswer) return { isCorrect: false, text: isEn ? 'No answer yet' : 'Chưa có câu trả lời' };

    if (currentQ.type === 'multiple_choice') {
      const isRight = currentAnswer.multipleChoiceIndex === currentQ.correctIndex;
      const chosenLetter = currentAnswer.multipleChoiceIndex !== undefined ? ['A', 'B', 'C', 'D'][currentAnswer.multipleChoiceIndex] : (isEn ? 'Not selected' : 'Chưa chọn');
      const correctLetter = ['A', 'B', 'C', 'D'][currentQ.correctIndex];
      return {
        isCorrect: isRight,
        text: isRight
          ? (isEn ? `Correct! The right answer is ${correctLetter}.` : `Chính xác! Đáp án đúng là ${correctLetter}.`)
          : (isEn ? `Incorrect! You selected ${chosenLetter}, the correct answer is ${correctLetter}.` : `Chưa đúng! Bạn đã chọn ${chosenLetter}, đáp án chuẩn xác là ${correctLetter}.`),
      };
    }

    if (currentQ.type === 'true_false_context') {
      const sels = currentAnswer.trueFalseSelections || {};
      const correctCount = currentQ.statements.filter((s) => sels[s.id] === s.isCorrect).length;
      return {
        isCorrect: correctCount === 4,
        text: isEn
          ? `You answered correctly ${correctCount}/4 statements based on lesson context.`
          : `Bạn trả lời đúng ${correctCount}/4 nhận định theo ngữ liệu bài học.`,
      };
    }

    if (currentQ.type === 'short_answer') {
      const raw = (currentAnswer.shortAnswerText || '').trim().toLowerCase().replace(/,/g, '.');
      const numMatch = raw.match(/[-+]?[0-9]*\.?[0-9]+/);
      const parsedNum = numMatch ? parseFloat(numMatch[0]) : NaN;
      let matched = false;
      if (!isNaN(parsedNum) && currentQ.numericValue !== undefined) {
        const tol = currentQ.tolerance !== undefined ? currentQ.tolerance : 0.05;
        if (Math.abs(parsedNum - currentQ.numericValue) <= tol) matched = true;
      }
      const stringMatched = currentQ.acceptedAnswers.some(
        (a) => raw === a.trim().toLowerCase().replace(/,/g, '.')
      );
      const right = matched || stringMatched;
      return {
        isCorrect: right,
        text: right
          ? (isEn ? `Correct! Calculated result: ${currentQ.standardAnswer} ${currentQ.unit}.` : `Chính xác! Kết quả tính toán: ${currentQ.standardAnswer} ${currentQ.unit}.`)
          : (isEn ? `Incorrect (You entered: "${currentAnswer.shortAnswerText || 'none'}"). Standard answer: ${currentQ.standardAnswer} ${currentQ.unit}.` : `Chưa chính xác (Bạn nhập: "${currentAnswer.shortAnswerText || 'chưa nhập'}"). Đáp án chuẩn: ${currentQ.standardAnswer} ${currentQ.unit}.`),
      };
    }

    if (currentQ.type === 'matching') {
      const conns = currentAnswer.matchingConnections || {};
      const correctCount = currentQ.pairs.filter((p) => conns[p.id] === p.id).length;
      return {
        isCorrect: correctCount === currentQ.pairs.length,
        text: isEn
          ? `You correctly matched ${correctCount}/${currentQ.pairs.length} pairs.`
          : `Bạn đã ghép nối đúng ${correctCount}/${currentQ.pairs.length} cặp thông tin.`,
      };
    }

    return { isCorrect: false, text: '' };
  };

  const instantEval = isChecked ? evaluateCurrentQuestion() : null;

  const isEn = language === 'en';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* MODE SPECIFIC HERO BANNER */}
      {mode === 'official_test' && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>{isEn ? '🏛️ OFFICIAL COMPETENCY EXAMINATION HALL' : '🏛️ PHÒNG KIỂM TRA ĐÁNH GIÁ NĂNG LỰC CHÍNH THỨC'}</span>
                <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                  {isEn ? '10-Point Scale' : 'Thang 10 điểm'}
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                {isEn
                  ? 'Questions and answer choices shuffled. Formulas and hints hidden. Auto-submits when time expires.'
                  : 'Đề thi đã xáo trộn câu hỏi và đáp án. Ẩn toàn bộ công thức & gợi ý giải. Tự động thu bài khi hết giờ.'}
              </p>
            </div>
          </div>
          {secondsRemaining !== null && (
            <div className="bg-white/20 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{isEn ? 'Time remaining: ' : 'Thời gian còn: '}{formatTimer(secondsRemaining)}</span>
            </div>
          )}
        </div>
      )}

      {mode === 'practice_topic' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>{isEn ? '📚 FULL 40-QUESTION PRACTICE MODE (4 FORMATS)' : '📚 CHẾ ĐỘ LUYỆN TẬP ĐẦY ĐỦ 40 CÂU (4 DẠNG THỨC)'}</span>
                <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                  {isEn ? 'Complete Lesson' : 'Trọn bộ bài học'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {isEn
                  ? 'Includes all 4 formats (10 Multiple Choice, 10 True/False, 10 Numerical Calculations, 10 Column Matching). Freely navigate and flag for review.'
                  : 'Gồm đủ 4 dạng thức (10 câu TN 4 lựa chọn, 10 câu Đúng/Sai, 10 bài tập tính toán số, 10 câu ghép nối). Tự do chuyển câu, gắn cờ xem lại.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {mode === 'practice_type' && (
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>{isEn ? '⚡ FLEXIBLE CUSTOM PRACTICE MODE' : '⚡ CHẾ ĐỘ LUYỆN TẬP TỰ CHỌN LINH HOẠT'}</span>
                {instantFeedback && (
                  <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                    {isEn ? 'Instant Question Feedback' : 'Phản hồi tức thì từng câu'}
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-100 mt-0.5">
                {isEn
                  ? `Practice by custom format and cognitive level. ${instantFeedback ? 'Check answers immediately for effective revision.' : 'Submit upon completion to view score report.'}`
                  : `Luyện tập theo dạng và mức độ tự chọn. ${instantFeedback ? 'Học sinh có thể kiểm tra đáp án ngay để ôn luyện hiệu quả.' : 'Làm xong rồi nộp bài xem bảng điểm tổng hợp.'}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar with Timer & Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => {
              if (
                window.confirm(
                  isEn
                    ? 'Are you sure you want to exit? Your current test progress will not be saved.'
                    : 'Bạn có chắc chắn muốn thoát khỏi bài làm? Tiến trình hiện tại sẽ không được lưu.'
                )
              ) {
                onExit();
              }
            }}
            className="flex items-center space-x-1 text-xs text-slate-500 hover:text-red-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? 'Exit Test' : 'Thoát ra ngoài'}</span>
          </button>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">{localizeExamTitle(title, language)}</h2>
          <div className="text-xs text-slate-500">
            {isEn ? 'Student:' : 'Học sinh:'} <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.className || '10'})
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {secondsRemaining !== null && (
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
                secondsRemaining <= 120
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          )}

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-500/20 transition-all hover:scale-102"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isEn ? `Submit (${answeredCount}/${questions.length})` : `Nộp bài (${answeredCount}/${questions.length})`}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Question Navigator */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {isEn ? (
              <>Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong> questions</>
            ) : (
              <>Câu hỏi <strong>{currentIndex + 1}</strong> trên tổng số <strong>{questions.length}</strong> câu</>
            )}
          </span>
          <span>
            {isEn ? (
              <>Answered: <strong className="text-emerald-600">{answeredCount}</strong> | Remaining: <strong className="text-amber-600">{unansweredCount}</strong></>
            ) : (
              <>Đã làm: <strong className="text-emerald-600">{answeredCount}</strong> | Còn lại: <strong className="text-amber-600">{unansweredCount}</strong></>
            )}
          </span>
        </div>

        {/* Linear Progress */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* 4-Section quick filter for 40 questions full practice with distinct identity colors */}
        {questions.length === 40 && mode === 'practice_topic' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px]">
            <span className="font-bold text-slate-500 mr-1">{isEn ? 'Quick format jump:' : 'Chuyển nhanh dạng:'}</span>
            <button
              onClick={() => setCurrentIndex(0)}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                currentIndex < 10
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-blue-50/70 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {isEn ? '1. MC (1-10)' : '1. TN 4 lựa chọn (1-10)'}
            </button>
            <button
              onClick={() => setCurrentIndex(10)}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                currentIndex >= 10 && currentIndex < 20
                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                  : 'bg-purple-50/70 text-purple-700 border-purple-200 hover:bg-purple-100'
              }`}
            >
              {isEn ? '2. Context T/F (11-20)' : '2. Đúng/Sai ngữ liệu (11-20)'}
            </button>
            <button
              onClick={() => setCurrentIndex(20)}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                currentIndex >= 20 && currentIndex < 30
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs font-black'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isEn ? '3. Calculation (21-30)' : '3. Tính toán số (21-30)'}
            </button>
            <button
              onClick={() => setCurrentIndex(30)}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                currentIndex >= 30
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isEn ? '4. Matching (31-40)' : '4. Nối cột (31-40)'}
            </button>
          </div>
        )}

        {/* Question Bubbles Navigator */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const isAnswered = isQuestionAnswered(q);
            const isCurrent = idx === currentIndex;
            const isFlagged = answers[q.id]?.isFlagged;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 bg-blue-600 text-white shadow-xs'
                    : isAnswered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Display Box */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
        {/* Header of Question with Type Tag & Flag Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <span
              className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center text-white ${
                currentQ.type === 'multiple_choice'
                  ? 'bg-blue-600'
                  : currentQ.type === 'true_false_context'
                  ? 'bg-purple-600'
                  : currentQ.type === 'short_answer'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-emerald-600'
              }`}
            >
              {currentIndex + 1}
            </span>
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                currentQ.type === 'multiple_choice'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : currentQ.type === 'true_false_context'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : currentQ.type === 'short_answer'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {currentQ.type === 'multiple_choice' && (isEn ? 'Format 1: Multiple Choice (4 Options)' : 'Dạng 1: Trắc nghiệm 4 lựa chọn')}
              {currentQ.type === 'true_false_context' && (isEn ? 'Format 2: True / False with Context Data' : 'Dạng 2: Đúng / Sai có ngữ liệu')}
              {currentQ.type === 'short_answer' && (isEn ? 'Format 3: Geographic Calculation & Numerical Entry' : 'Dạng 3: Bài tập tính toán địa lí bằng số')}
              {currentQ.type === 'matching' && (isEn ? 'Format 4: Two-Column Matching' : 'Dạng 4: Ghép nối hai cột')}
            </span>
            <span className="text-[11px] text-slate-400 capitalize hidden sm:inline font-medium">
              ({isEn ? 'Level' : 'Mức độ'}: {
                currentQ.cognitiveLevel === 'nhan_biet' ? (isEn ? 'Recognition' : 'Nhận biết') :
                currentQ.cognitiveLevel === 'thong_hieu' ? (isEn ? 'Comprehension' : 'Thông hiểu') :
                currentQ.cognitiveLevel === 'van_dung' ? (isEn ? 'Application' : 'Vận dụng') :
                currentQ.cognitiveLevel === 'van_dung_cao' ? (isEn ? 'Advanced Application' : 'Vận dụng cao') :
                currentQ.cognitiveLevel
              })
            </span>
          </div>

          <button
            onClick={handleToggleFlag}
            className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              currentAnswer.isFlagged
                ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${currentAnswer.isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>
              {currentAnswer.isFlagged
                ? (isEn ? 'Flagged for review' : 'Đã gắn cờ xem lại')
                : (isEn ? 'Flag' : 'Gắn cờ')}
            </span>
          </button>
        </div>

        {/* DẠNG 1: TRẮC NGHIỆM 4 LỰA CHỌN */}
        {currentQ.type === 'multiple_choice' && (
          <div className="space-y-4">
            <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
              {currentQ.question}
            </p>

            {currentQ.referenceData && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong>{isEn ? 'Reference Data:' : 'Số liệu tham chiếu:'}</strong> {currentQ.referenceData}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = currentAnswer.multipleChoiceIndex === oIdx;
                const optLetter = ['A', 'B', 'C', 'D'][oIdx];

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectMultipleChoice(oIdx)}
                    className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-all border flex items-center space-x-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-bold shadow-xs ring-1 ring-blue-400'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="leading-relaxed flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DẠNG 2: ĐÚNG / SAI CÓ NGỮ LIỆU BẮT BUỘC - Màu tím nhận diện */}
        {currentQ.type === 'true_false_context' && (
          <div className="space-y-5">
            {/* Context Box in Purple Tint */}
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200/90 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-purple-900 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>{isEn ? 'Scientific Context & Data:' : 'Ngữ liệu thông tin & số liệu:'} {currentQ.contextTitle}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                {currentQ.contextText}
              </p>

              {/* Data Table if available */}
              {currentQ.contextDataGrid && (
                <div className="overflow-x-auto rounded-xl border border-purple-200/80 bg-white shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-purple-100/70 text-purple-950 font-bold border-b border-purple-200">
                      <tr>
                        {currentQ.contextDataGrid.headers.map((h, i) => (
                          <th key={i} className="p-2 sm:p-2.5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100 text-slate-700">
                      {currentQ.contextDataGrid.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-purple-50/40">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 sm:p-2.5 font-medium">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {currentQ.contextSource && (
                <div className="text-[11px] text-purple-800/80 italic text-right">
                  {isEn ? 'Source:' : 'Nguồn:'} {currentQ.contextSource}
                </div>
              )}
            </div>

            {/* 4 Statements a, b, c, d */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isEn ? 'Select [True] or [False] for each statement below:' : 'Học sinh lựa chọn [Đúng] hoặc [Sai] cho từng nhận định sau:'}
              </div>

              {currentQ.statements.map((stmt) => {
                const currentVal = currentAnswer.trueFalseSelections?.[stmt.id];

                return (
                  <div
                    key={stmt.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-2 text-sm text-slate-900 leading-relaxed">
                      <span className="font-bold uppercase text-blue-700">{stmt.id})</span>
                      <span>{stmt.text}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleSelectTrueFalse(stmt.id, true)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentVal === true
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {isEn ? 'True' : 'Đúng'}
                      </button>
                      <button
                        onClick={() => handleSelectTrueFalse(stmt.id, false)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentVal === false
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        {isEn ? 'False' : 'Sai'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DẠNG 3: BÀI TẬP TÍNH TOÁN ĐỊA LÍ (NHẬP KẾT QUẢ BẰNG SỐ) - Vàng cam nhận diện */}
        {currentQ.type === 'short_answer' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-black text-amber-950 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300 w-fit">
              <span>{isEn ? 'GEOGRAPHIC CALCULATION – ENTER NUMERIC VALUE ONLY' : 'BÀI TẬP TÍNH TOÁN ĐỊA LÍ – CHỈ NHẬP KẾT QUẢ BẰNG SỐ'}</span>
            </div>

            <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
              {currentQ.question}
            </p>

            {/* In Official Test: Hide formulas and guidance so it tests real knowledge */}
            {mode === 'official_test' ? (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isEn ? 'EXAMINATION REGULATION:' : 'QUY CHẾ KIỂM TRA ĐÁNH GIÁ:'}</span>
                </div>
                <p className="leading-relaxed">
                  {isEn
                    ? 'Students independently apply formulas to calculate accurate numeric results. All formulas and detailed steps will be visible after submitting.'
                    : 'Học sinh tự vận dụng công thức đã học để tính toán kết quả số chuẩn xác. Toàn bộ công thức và các bước giải chi tiết sẽ hiển thị sau khi nộp bài.'}
                </p>
                {currentQ.roundingRule && (
                  <div className="text-amber-800 font-semibold pt-1">
                    ⚠️ <strong>{isEn ? 'Rounding rule:' : 'Quy ước làm tròn:'}</strong> {currentQ.roundingRule}
                  </div>
                )}
              </div>
            ) : (
              /* In Practice mode: Show Formula & Calculation Guidance Box */
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isEn ? 'CALCULATION GUIDANCE & FORMULA:' : 'HƯỚNG DẪN TÍNH TOÁN & CÔNG THỨC:'}</span>
                </div>
                <p className="leading-relaxed">{currentQ.guide}</p>
                
                {currentQ.formula && (
                  <div className="p-2.5 rounded-lg bg-white border border-amber-200 font-mono text-amber-950 font-bold text-xs">
                    📐 {isEn ? 'Formula:' : 'Công thức:'} {currentQ.formula}
                  </div>
                )}

                {currentQ.roundingRule && (
                  <div className="text-amber-800 font-semibold flex items-center gap-1 text-[11px]">
                    <span>⚠️ {isEn ? 'Rounding rule:' : 'Quy ước làm tròn:'}</span>
                    <span>{currentQ.roundingRule}</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Box for Numeric Answer */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {isEn ? 'Enter your calculated numeric result (integer or decimal):' : 'Nhập kết quả số tính toán của bạn (số nguyên hoặc số thập phân):'}
              </label>
              <div className="flex items-center max-w-md space-x-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentAnswer.shortAnswerText || ''}
                  onChange={(e) => handleShortAnswerChange(e.target.value)}
                  placeholder={isEn ? 'e.g. 18.2 or 95...' : 'Ví dụ: 18.2 hoặc 95...'}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-lg text-slate-900 bg-white shadow-2xs"
                />
                <span className="text-sm font-bold text-slate-700 px-3.5 py-3 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                  {currentQ.unit}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isEn
                  ? '* You may use a dot (.) or comma (,) for decimals. Do not type letters or text into this field.'
                  : '* Học sinh có thể dùng dấu chấm (.) hoặc dấu phẩy (,) khi nhập số thập phân. Không nhập chữ viết vào ô này.'}
              </div>
            </div>
          </div>
        )}

        {/* DẠNG 4: MATCHING COLUMNS */}
        {currentQ.type === 'matching' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentQ.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {isEn
                  ? 'Click an item in Column A, then click the matching item in Column B to link them.'
                  : 'Nhấp chọn 1 mục ở Cột A, sau đó nhấp chọn mục tương ứng ở Cột B để kết nối ghép cặp.'}
              </p>
            </div>

            {/* Current connections summary */}
            {Object.keys(currentAnswer.matchingConnections || {}).length > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-emerald-900">{isEn ? 'Your connected pairs:' : 'Các cặp bạn đã nối:'}</div>
                <div className="space-y-1">
                  {Object.entries(currentAnswer.matchingConnections || {}).map(([lId, rId]) => {
                    const leftObj = currentQ.pairs.find((p) => p.id === lId);
                    const rightObj = currentQ.pairs.find((p) => p.id === rId);
                    if (!leftObj || !rightObj) return null;

                    return (
                      <div
                        key={lId}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-emerald-200 text-slate-800"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-blue-700">{leftObj.left}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-medium text-emerald-800">{rightObj.right}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMatching(lId)}
                          className="text-[11px] text-red-500 hover:text-red-700 font-bold px-2 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                        >
                          {isEn ? 'Disconnect' : 'Hủy nối'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interactive Two Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column A */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 p-2 rounded-lg border border-blue-200">
                  {currentQ.columnATitle}
                </div>
                {currentQ.pairs.map((p) => {
                  const isPaired = !!currentAnswer.matchingConnections?.[p.id];
                  const isSelected = selectedMatchingLeftId === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedMatchingLeftId(isSelected ? null : p.id)}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm transition-all border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-md'
                          : isPaired
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <span>{p.left}</span>
                      {isPaired && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Column B */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {currentQ.columnBTitle}
                </div>
                {currentQ.pairs.map((p) => {
                  const connectedLeftKey = Object.keys(currentAnswer.matchingConnections || {}).find(
                    (k) => currentAnswer.matchingConnections?.[k] === p.id
                  );
                  const isUsed = !!connectedLeftKey;

                  return (
                    <button
                      key={p.id}
                      disabled={!selectedMatchingLeftId}
                      onClick={() => {
                        if (selectedMatchingLeftId) {
                          handleConnectMatching(selectedMatchingLeftId, p.id);
                        }
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm transition-all border ${
                        selectedMatchingLeftId
                          ? 'cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/70 border-slate-300'
                          : 'cursor-default opacity-85'
                      } ${
                        isUsed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <span>{p.right}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Instant Feedback Box for Custom Practice Mode */}
        {instantFeedback && mode === 'practice_type' && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  setCheckedQuestions((prev) => ({
                    ...prev,
                    [currentQ.id]: true,
                  }))
                }
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isEn ? 'Check answer for this question' : 'Kiểm tra đáp án câu này ngay'}</span>
              </button>

              {isChecked && (
                <button
                  onClick={() =>
                    setCheckedQuestions((prev) => ({
                      ...prev,
                      [currentQ.id]: false,
                    }))
                  }
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Hide explanation' : 'Ẩn giải thích'}</span>
                </button>
              )}
            </div>

            {isChecked && instantEval && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 animate-in fade-in duration-200 ${
                  instantEval.isCorrect
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-sm">
                  {instantEval.isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{instantEval.text}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>{instantEval.text}</span>
                    </>
                  )}
                </div>

                <div className="text-slate-700 text-xs bg-white/90 p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <div className="font-bold text-slate-900">{isEn ? 'Detailed solution:' : 'Lời giải chi tiết:'}</div>
                  {currentQ.type === 'true_false_context' ? (
                    <div className="space-y-1 pt-1">
                      {currentQ.statements.map((st) => (
                        <div key={st.id} className="text-[11px] text-slate-700 pl-2 border-l-2 border-amber-300">
                          <strong>{st.id.toUpperCase()}) [{st.isCorrect ? (isEn ? 'TRUE' : 'ĐÚNG') : (isEn ? 'FALSE' : 'SAI')}]:</strong> {st.explanation}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="leading-relaxed">{currentQ.explanation}</p>
                  )}
                  {currentQ.type === 'short_answer' && currentQ.calculationSteps && (
                    <div className="pt-1 space-y-0.5">
                      <div className="font-semibold text-slate-800">{isEn ? 'Calculation steps:' : 'Các bước tính:'}</div>
                      {currentQ.calculationSteps.map((st, i) => (
                        <div key={i} className="pl-2 border-l-2 border-blue-400 text-[11px]">
                          • {st}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons (Prev / Next) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEn ? 'Previous' : 'Câu trước'}</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center space-x-1 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>{isEn ? 'Next Question' : 'Câu kế tiếp'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isEn ? 'Submit Test Now' : 'Nộp bài ngay'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {isEn
                  ? (mode === 'official_test' ? 'Confirm Official Exam Submission' : 'Confirm Test Submission')
                  : (mode === 'official_test' ? 'Xác nhận nộp bài thi chính thức' : 'Xác nhận hoàn thành bài làm')}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn
                  ? `The system will grade your answers and record them in your ${mode === 'official_test' ? 'official examination' : 'practice'} history.`
                  : `Hệ thống sẽ chấm điểm và lưu kết quả vào lịch sử ${mode === 'official_test' ? 'kiểm tra' : 'luyện tập'}.`}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">{isEn ? 'Total questions:' : 'Tổng số câu hỏi:'}</span>
                <span className="font-bold text-slate-900">{questions.length} {isEn ? 'questions' : 'câu'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{isEn ? 'Answered:' : 'Đã trả lời:'}</span>
                <span className="font-bold text-emerald-600">{answeredCount} {isEn ? 'questions' : 'câu'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{isEn ? 'Unanswered:' : 'Chưa trả lời:'}</span>
                <span className="font-bold text-amber-600">{unansweredCount} {isEn ? 'questions' : 'câu'}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {isEn
                    ? `You still have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
                    : `Bạn còn ${unansweredCount} câu chưa làm. Bạn có chắc chắn muốn nộp không?`}
                </span>
              </div>
            )}

            {submitError && (
              <div className="flex items-start space-x-2 text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="space-y-1">
                  <p className="font-semibold">
                    {isEn ? 'Server synchronization failed' : 'Chưa đồng bộ được lên máy chủ'}
                  </p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => {
                  pendingRecordRef.current = null;
                  setSubmitError(null);
                  setShowConfirmSubmit(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                {isEn ? 'Keep Working' : 'Tiếp tục làm bài'}
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => {
                  doGradingAndSave();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                {isSubmitting
                  ? (isEn ? 'Saving to Server...' : 'Đang lưu lên máy chủ...')
                  : submitError
                  ? (isEn ? 'Retry Saving' : 'Thử lưu lại')
                  : (isEn ? 'Confirm Submit' : 'Xác nhận nộp bài')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Submit Notification on Time Expiry */}
      {timeExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-3 animate-in zoom-in">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{isEn ? 'Time is Up!' : 'Đã hết giờ làm bài!'}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isEn
                ? 'The examination period has ended. The system is automatically collecting your test and transitioning to scoring...'
                : 'Thời gian kiểm tra đã kết thúc. Hệ thống đang tự động thu bài và chuyển sang màn hình chấm điểm...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
