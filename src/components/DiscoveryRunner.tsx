import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Globe2,
  HelpCircle,
  Lightbulb,
  Link2,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';
import {
  MatchingPair,
  MatchingQuestion,
  MultipleChoiceQuestion,
  Question,
  ShortAnswerQuestion,
  TrueFalseContextQuestion,
  UserProfile,
} from '../types';
import { getWarmupDiscoveryQuestions } from '../data/discoveryQuestions';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeQuestion } from '../services/bilingualQuestions';

const getQuestionExplanation = (q: Question, isEn: boolean): string => {
  if (q.type === 'true_false_context') {
    return q.statements
      .map((s) => `${isEn ? 'Statement' : 'Ý'} ${s.id.toUpperCase()}: ${s.explanation}`)
      .join(' ');
  }
  return (q as any).explanation || '';
};

interface DiscoveryRunnerProps {
  currentUser: UserProfile;
  onExit: () => void;
  onNavigateToLessons: () => void;
}

export const DiscoveryRunner: React.FC<DiscoveryRunnerProps> = ({
  currentUser,
  onExit,
  onNavigateToLessons,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Load 10 random discovery questions from dedicated bank
  const [questions, setQuestions] = useState<Question[]>(() => getWarmupDiscoveryQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Discovery answers state
  const [selectedMCIndex, setSelectedMCIndex] = useState<number | null>(null);
  const [tfAnswers, setTfAnswers] = useState<{ [stmtId: string]: boolean }>({});
  const [saInput, setSaInput] = useState<string>('');
  const [matchingConnections, setMatchingConnections] = useState<{ [leftId: string]: string }>({});
  const [selectedMatchingLeftId, setSelectedMatchingLeftId] = useState<string | null>(null);

  // Shuffled right-column options for matching question
  const [shuffledRightOptions, setShuffledRightOptions] = useState<{ id: string; right: string }[]>([]);

  // Has the student revealed the explanation for the current question?
  const [isRevealed, setIsRevealed] = useState(false);

  // History of revealed questions to show at completion
  const [exploredList, setExploredList] = useState<
    Array<{
      question: Question;
      isCorrect: boolean;
      userGuess: string;
    }>
  >([]);

  // Is finished?
  const [isCompleted, setIsCompleted] = useState(false);

  const rawQ = questions[currentIndex];
  const currentQ = rawQ ? localizeQuestion(rawQ, language) : rawQ;

  // Shuffle right options when switching to a matching question
  useEffect(() => {
    if (currentQ && currentQ.type === 'matching') {
      const ma = currentQ as MatchingQuestion;
      const shuffled = [...ma.pairs]
        .map((p) => ({ id: p.id, right: p.right }))
        .sort(() => Math.random() - 0.5);
      setShuffledRightOptions(shuffled);
    } else {
      setShuffledRightOptions([]);
    }
  }, [currentIndex, currentQ?.id, language]);

  // Helper to restart with 10 brand-new random discovery questions
  const handleRestart = () => {
    setQuestions(getWarmupDiscoveryQuestions());
    setCurrentIndex(0);
    resetQuestionState();
    setExploredList([]);
    setIsCompleted(false);
  };

  const resetQuestionState = () => {
    setSelectedMCIndex(null);
    setTfAnswers({});
    setSaInput('');
    setMatchingConnections({});
    setSelectedMatchingLeftId(null);
    setIsRevealed(false);
  };

  // Determine if student has provided an answer for current question
  const hasAnsweredCurrent = (): boolean => {
    if (!currentQ) return false;
    if (currentQ.type === 'multiple_choice') {
      return selectedMCIndex !== null;
    }
    if (currentQ.type === 'true_false_context') {
      return Object.keys(tfAnswers).length === 4;
    }
    if (currentQ.type === 'short_answer') {
      return saInput.trim().length > 0;
    }
    if (currentQ.type === 'matching') {
      return true;
    }
    return false;
  };

  // Check correctness for celebration without pressure
  const computeIsCorrect = (): { isCorrect: boolean; guessText: string } => {
    if (!currentQ) return { isCorrect: false, guessText: '' };

    if (currentQ.type === 'multiple_choice') {
      const mc = currentQ as MultipleChoiceQuestion;
      const ok = selectedMCIndex === mc.correctIndex;
      const guess = selectedMCIndex !== null ? mc.options[selectedMCIndex] : (isEn ? 'Not selected' : 'Chưa chọn');
      return { isCorrect: ok, guessText: guess };
    }

    if (currentQ.type === 'true_false_context') {
      const tf = currentQ as TrueFalseContextQuestion;
      let okCount = 0;
      tf.statements.forEach((s) => {
        if (tfAnswers[s.id] === s.isCorrect) okCount++;
      });
      return {
        isCorrect: okCount >= 3,
        guessText: isEn
          ? `Correctly predicted ${okCount}/4 statements`
          : `Đoán đúng ${okCount}/4 ý khẳng định`,
      };
    }

    if (currentQ.type === 'short_answer') {
      const sa = currentQ as ShortAnswerQuestion;
      const raw = saInput.trim().toLowerCase().replace(/,/g, '.');
      const numMatch = raw.match(/[-+]?[0-9]*\.?[0-9]+/);
      const parsed = numMatch ? parseFloat(numMatch[0]) : NaN;

      let ok = false;
      if (!isNaN(parsed) && sa.numericValue !== undefined) {
        const tol = sa.tolerance !== undefined ? sa.tolerance : 0.5;
        if (Math.abs(parsed - sa.numericValue) <= tol) ok = true;
      }
      if (!ok) {
        ok = sa.acceptedAnswers.some(
          (acc) => raw.includes(acc.toLowerCase()) || acc.toLowerCase().includes(raw)
        );
      }
      return { isCorrect: ok, guessText: saInput ? `${saInput} ${sa.unit}` : (isEn ? 'Not entered' : 'Chưa nhập') };
    }

    if (currentQ.type === 'matching') {
      const ma = currentQ as MatchingQuestion;
      let matchedRight = 0;
      let matchedWrong = 0;
      let unlinked = 0;

      ma.pairs.forEach((p) => {
        const connId = matchingConnections[p.id];
        if (!connId) {
          unlinked++;
        } else if (connId === p.id) {
          matchedRight++;
        } else {
          matchedWrong++;
        }
      });

      return {
        isCorrect: matchedRight === ma.pairs.length,
        guessText: isEn
          ? `Matched ${matchedRight}/${ma.pairs.length} pairs (Wrong: ${matchedWrong}, Unlinked: ${unlinked})`
          : `Đúng ${matchedRight}/${ma.pairs.length} cặp (Sai: ${matchedWrong}, Chưa nối: ${unlinked})`,
      };
    }

    return { isCorrect: false, guessText: '' };
  };


  // Reveal answer
  const handleRevealAnswer = () => {
    if (!hasAnsweredCurrent()) return;
    setIsRevealed(true);
    const { isCorrect, guessText } = computeIsCorrect();
    setExploredList((prev) => [
      ...prev,
      {
        question: currentQ,
        isCorrect,
        userGuess: guessText,
      },
    ]);
  };

  // Move to next question or complete
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      setIsCompleted(true);
    }
  };

  // Multiple Choice click handler
  const handleSelectMC = (idx: number) => {
    if (isRevealed) return;
    setSelectedMCIndex(idx);
  };

  // True/False click handler
  const handleSelectTF = (stmtId: string, val: boolean) => {
    if (isRevealed) return;
    setTfAnswers((prev) => ({ ...prev, [stmtId]: val }));
  };

  // Matching pair connection handler
  const handleSelectLeftPair = (leftId: string) => {
    if (isRevealed) return;
    setSelectedMatchingLeftId(leftId);
  };

  const handleSelectRightPair = (rightId: string) => {
    if (isRevealed || !selectedMatchingLeftId) return;
    setMatchingConnections((prev) => ({
      ...prev,
      [selectedMatchingLeftId]: rightId,
    }));
    setSelectedMatchingLeftId(null);
  };

  const handleClearConnection = (leftId: string) => {
    if (isRevealed) return;
    setMatchingConnections((prev) => {
      const copy = { ...prev };
      delete copy[leftId];
      return copy;
    });
  };

  // Friendly type badge
  const getQuestionTypeBadge = (type: string, index: number) => {
    if (type === 'multiple_choice') {
      return {
        stepName: isEn ? 'Format 1: Discovery Multiple Choice' : 'Dạng 1: Trắc nghiệm khám phá',
        icon: '💡',
        tag: isEn ? `Question ${index + 1}/10` : `Câu ${index + 1}/10`,
      };
    }
    if (type === 'true_false_context') {
      return {
        stepName: isEn ? 'Format 2: Fascinating Data True/False' : 'Dạng 2: Đúng / Sai tư liệu kì thú',
        icon: '📖',
        tag: isEn ? `Question ${index + 1}/10` : `Câu ${index + 1}/10`,
      };
    }
    if (type === 'short_answer') {
      return {
        stepName: isEn ? 'Format 3: Quick Guess Challenge' : 'Dạng 3: Thử tài đoán nhanh',
        icon: '🎯',
        tag: isEn ? `Question ${index + 1}/10` : `Câu ${index + 1}/10`,
      };
    }
    return {
      stepName: isEn ? 'Format 4: Wonder Column Matching' : 'Dạng 4: Ghép nối điều kì diệu',
      icon: '🔗',
      tag: isEn ? `Question ${index + 1}/10` : `Câu ${index + 1}/10`,
    };
  };

  // ==========================================================================
  // VIEW: KHÁM PHÁ HOÀN TẤT (CELEBRATION / ZERO PRESSURE)
  // ==========================================================================
  if (isCompleted) {
    const correctCount = exploredList.filter((item) => item.isCorrect).length;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Celebration Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-800 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 animate-bounce" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-amber-200 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isEn ? 'DISCOVERY EXPEDITION COMPLETED' : 'HOÀN THÀNH CHUYẾN DU HÀNH KHÁM PHÁ'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isEn ? 'Did You Know? Geography Discovery 🌍' : 'Em Có Biết? Khám Phá Địa Lí 🌍'}
              </h1>
              <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
                {isEn ? (
                  <>
                    Congratulations <strong className="text-amber-300 font-bold">{currentUser.name || 'Student'}</strong>! You have successfully completed the 10 fascinating Earth wonders exploration today. Curiosity and a passion for inquiry are the very best foundation to master geographic knowledge!
                  </>
                ) : (
                  <>
                    Xin chúc mừng <strong className="text-amber-300 font-bold">{currentUser.name || 'em'}</strong>! Em đã hoàn thành xuất sắc chuyến thám hiểm 10 điều kì thú về Trái Đất hôm nay. Trí tò mò và niềm say mê khám phá chính là khởi đầu tuyệt vời nhất để chinh phục tri thức!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Achievement ribbon */}
          <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-blue-200">
                {isEn ? 'Explorer Title' : 'Danh hiệu thám hiểm'}
              </div>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                {isEn ? '🏅 Global Explorer' : '🏅 Nhà Thám Hiểm Địa Cầu'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-blue-200">
                {isEn ? 'Unlocked Mysteries' : 'Điều kì thú đã mở khóa'}
              </div>
              <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5">
                {isEn ? '10 / 10 Earth Secrets' : '10 / 10 Bí mật Trái Đất'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-blue-200">
                {isEn ? 'Sharp Intuition' : 'Phán đoán nhạy bén'}
              </div>
              <div className="text-sm sm:text-base font-bold text-emerald-300 mt-0.5">
                {isEn
                  ? `${correctCount} / 10 Accurate Predictions`
                  : `${correctCount} / 10 Dự đoán chính xác`}
              </div>
            </div>
          </div>
        </div>

        {/* 10 Unlocked Knowledge Cards Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isEn
                  ? '10 Geographic Secrets You Unlocked Today'
                  : '10 Bí Mật Địa Lí Em Vừa Mở Khóa Hôm Nay'}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {isEn ? 'Save and share with teachers & peers' : 'Lưu lại để chia sẻ cùng thầy cô và bạn bè'}
            </span>
          </div>

          <div className="space-y-4">
            {exploredList.map((item, idx) => {
              const q = item.question;
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 hover:border-blue-300 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-700 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">
                        {idx + 1}
                      </span>
                      <span>
                        {q.curiosityHook ||
                          (q.type === 'multiple_choice'
                            ? isEn ? 'Discovery Multiple Choice' : 'Trắc nghiệm khám phá'
                            : q.type === 'true_false_context'
                            ? (q as TrueFalseContextQuestion).contextTitle
                            : q.type === 'short_answer'
                            ? isEn ? 'Quick Guess' : 'Thử tài đoán nhanh'
                            : isEn ? 'Wonder Matching' : 'Ghép nối kì diệu')}
                      </span>
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {isEn ? 'Unlocked ✨' : 'Đã mở khóa ✨'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    {q.type === 'multiple_choice' && (q as MultipleChoiceQuestion).question}
                    {q.type === 'true_false_context' &&
                      (q as TrueFalseContextQuestion).contextText.slice(0, 160) + '...'}
                    {q.type === 'short_answer' && (q as ShortAnswerQuestion).question}
                    {q.type === 'matching' && (q as MatchingQuestion).title}
                  </p>

                  {/* Fact box */}
                  <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 font-bold">
                        {isEn ? 'Fascinating Fact: ' : 'Bật mí thú vị: '}
                      </strong>
                      <span>{q.funFact || getQuestionExplanation(q, isEn)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            onClick={onExit}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEn ? 'Back to Home' : 'Quay về Trang chủ'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isEn ? 'Explore 10 New Mysteries' : 'Khám phá 10 bí mật mới lạ khác'}</span>
            </button>

            <button
              onClick={onNavigateToLessons}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? 'Ready for 40 Textbook Lessons' : 'Sẵn sàng học 40 bài học SGK'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW: PLAYING THE 10 DISCOVERY QUESTIONS
  // ==========================================================================
  const badgeInfo = getQuestionTypeBadge(currentQ.type, currentIndex);
  const canReveal = hasAnsweredCurrent();
  const { isCorrect } = computeIsCorrect();

  // For matching question: compute detailed score breakdown
  const getMatchingScoreBreakdown = () => {
    if (currentQ.type !== 'matching') {
      return { total: 0, correct: 0, wrong: 0, unlinked: 0 };
    }
    const ma = currentQ as MatchingQuestion;
    let correct = 0;
    let wrong = 0;
    let unlinked = 0;

    ma.pairs.forEach((p) => {
      const connId = matchingConnections[p.id];
      if (!connId) unlinked++;
      else if (connId === p.id) correct++;
      else wrong++;
    });

    return { total: ma.pairs.length, correct, wrong, unlinked };
  };

  const matchingBreakdown = getMatchingScoreBreakdown();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                {isEn ? 'DID YOU KNOW? – GEOGRAPHY DISCOVERY' : 'EM CÓ BIẾT? – KHÁM PHÁ ĐỊA LÍ'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {isEn ? 'Warm-up Activity' : 'Hoạt động Khởi động'}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {isEn
                ? 'Spark curiosity • Discover Earth • Zero stress'
                : 'Khơi gợi tò mò • Khám phá Trái Đất • Không áp lực điểm số'}
            </div>
          </div>
        </div>

        <button
          onClick={onExit}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isEn ? 'Exit warm-up activity' : 'Thoát hoạt động khởi động'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Question Progress Tracker */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <span>{badgeInfo.icon}</span>
            <span>{badgeInfo.stepName}</span>
          </div>
          <div className="font-medium text-slate-500">
            {isEn ? 'Mystery ' : 'Điều khám phá '}
            <strong>{currentIndex + 1}</strong> / <strong>{questions.length}</strong>
          </div>
        </div>


        {/* 10 Step Progress Bar */}
        <div className="grid grid-cols-10 gap-1.5">
          {questions.map((q, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1'
                    : isDone
                    ? 'bg-emerald-400'
                    : 'bg-slate-200'
                }`}
                title={`${isEn ? 'Mystery' : 'Điều'} ${idx + 1}: ${q.type}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        {/* Curiosity Hook Header */}
        {currentQ.curiosityHook && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{currentQ.curiosityHook}</span>
          </div>
        )}

        {/* ========================================================== */}
        {/* DẠNG 1: TRẮC NGHIỆM KHÁM PHÁ */}
        {/* ========================================================== */}
        {currentQ.type === 'multiple_choice' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {(currentQ as MultipleChoiceQuestion).question}
            </h2>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {(currentQ as MultipleChoiceQuestion).options.map((opt, idx) => {
                const optLetter = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selectedMCIndex === idx;
                const isCorrectOpt = idx === (currentQ as MultipleChoiceQuestion).correctIndex;

                let optClass =
                  'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80 text-slate-800';
                if (isRevealed) {
                  if (isCorrectOpt) {
                    optClass =
                      'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400';
                  } else if (isSelected && !isCorrectOpt) {
                    optClass = 'border-rose-400 bg-rose-50/80 text-rose-900 line-through';
                  } else {
                    optClass = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  optClass = 'border-blue-500 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-400';
                }

                return (
                  <button
                    key={idx}
                    disabled={isRevealed}
                    onClick={() => handleSelectMC(idx)}
                    className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm transition-all border flex items-center space-x-3.5 ${optClass}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isRevealed && isCorrectOpt
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="leading-relaxed flex-1">{opt}</span>
                    {isRevealed && isCorrectOpt && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* DẠNG 2: ĐÚNG / SAI CÓ NGỮ LIỆU TƯ LIỆU KÌ THÚ */}
        {/* ========================================================== */}
        {currentQ.type === 'true_false_context' && (
          <div className="space-y-5">
            {/* Context Card */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Globe2 className="w-4 h-4 text-amber-700" />
                <span>{(currentQ as TrueFalseContextQuestion).contextTitle}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                {(currentQ as TrueFalseContextQuestion).contextText}
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isEn
                  ? 'Decide whether each statement is [True] or [False]:'
                  : 'Em hãy thử phán đoán xem mỗi khẳng định sau là [Đúng] hay [Sai]:'}
              </div>

              {(currentQ as TrueFalseContextQuestion).statements.map((stmt) => {
                const currentVal = tfAnswers[stmt.id];
                const isStmtCorrect = stmt.isCorrect;

                return (
                  <div
                    key={stmt.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-900 leading-relaxed">
                      <span className="font-bold text-blue-700 uppercase">{stmt.id})</span>
                      <span>{stmt.text}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        disabled={isRevealed}
                        onClick={() => handleSelectTF(stmt.id, true)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentVal === true
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        {isEn ? 'True' : 'Đúng'}
                      </button>
                      <button
                        disabled={isRevealed}
                        onClick={() => handleSelectTF(stmt.id, false)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentVal === false
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50'
                        }`}
                      >
                        {isEn ? 'False' : 'Sai'}
                      </button>

                      {isRevealed && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isStmtCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          ({isEn ? 'Answer: ' : 'Đáp án: '}
                          {isStmtCorrect ? (isEn ? 'True' : 'Đúng') : (isEn ? 'False' : 'Sai')})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* DẠNG 3: TRẢ LỜI NGẮN / THỬ TÀI ĐOÁN SỐ ĐỊA LÍ */}
        {/* ========================================================== */}
        {currentQ.type === 'short_answer' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {(currentQ as ShortAnswerQuestion).question}
            </h2>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>{isEn ? 'Hint: ' : 'Gợi ý: '}</strong>
                {(currentQ as ShortAnswerQuestion).guide} ({isEn ? 'Unit: ' : 'Đơn vị: '}
                <strong>{(currentQ as ShortAnswerQuestion).unit}</strong>)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  disabled={isRevealed}
                  value={saInput}
                  onChange={(e) => setSaInput(e.target.value)}
                  placeholder={isEn ? 'Enter number or prediction...' : 'Nhập con số hoặc dự đoán...'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-900 bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {(currentQ as ShortAnswerQuestion).unit}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* DẠNG 4: NỐI CỘT GHÉP ĐÔI HIỆN TƯỢNG VÀ BÍ MẬT */}
        {/* ========================================================== */}
        {currentQ.type === 'matching' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {(currentQ as MatchingQuestion).title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {!isRevealed
                  ? isEn
                    ? 'Click 1 item in Column A, then click the matching item in Column B. You can click "Check Answers" at any time.'
                    : 'Nhấp chọn 1 ô ở Cột A rồi nhấp chọn 1 ô tương ứng ở Cột B để ghép đôi. Bạn có thể nhấn "Kiểm tra đáp án" bất kì lúc nào.'
                  : isEn
                  ? 'Detailed evaluation and verified matching comparisons for all pairs are displayed below.'
                  : 'Dưới đây là bảng chấm điểm chi tiết và đối chiếu đáp án chuẩn xác cho toàn bộ các cặp nối.'}
              </p>
            </div>

            {/* Interactive Matching Board (Active while not revealed) */}
            {!isRevealed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Column A */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center justify-between">
                    <span>{(currentQ as MatchingQuestion).columnATitle}</span>
                    <span className="text-[11px] font-normal text-blue-600">
                      {isEn ? 'Select item to match' : 'Chọn mục để nối'}
                    </span>
                  </div>
                  {(currentQ as MatchingQuestion).pairs.map((pair) => {
                    const isSelectedLeft = selectedMatchingLeftId === pair.id;
                    const connectedRightId = matchingConnections[pair.id];
                    const connectedRightObj = (currentQ as MatchingQuestion).pairs.find(
                      (p) => p.id === connectedRightId
                    );

                    return (
                      <div
                        key={pair.id}
                        onClick={() => handleSelectLeftPair(pair.id)}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          isSelectedLeft
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 shadow-xs'
                            : connectedRightId
                            ? 'border-teal-400 bg-teal-50/60 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{pair.left}</span>
                          {connectedRightId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearConnection(pair.id);
                              }}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline ml-2 shrink-0"
                            >
                              {isEn ? 'Unlink' : 'Hủy nối'}
                            </button>
                          )}
                        </div>
                        {connectedRightObj ? (
                          <div className="text-[11px] text-teal-800 font-bold mt-1.5 bg-teal-100/70 p-2 rounded-lg flex items-center space-x-1.5">
                            <Link2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            <span>{isEn ? '➔ Linked with:' : '➔ Đã nối với:'}</span>
                            <span className="truncate">{connectedRightObj.right}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 mt-1 italic">
                            {isEn ? 'Not linked with Column B' : 'Chưa ghép nối với Cột B'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column B (Shuffled for authentic challenge) */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span>{(currentQ as MatchingQuestion).columnBTitle}</span>
                    <span className="text-[11px] font-normal text-emerald-600">
                      {selectedMatchingLeftId
                        ? isEn ? '👉 Click to link' : '👉 Nhấp chọn để ghép'
                        : isEn ? 'Select Column A first' : 'Chọn Cột A trước'}
                    </span>
                  </div>
                  {shuffledRightOptions.map((opt) => {
                    const connectedLeftPairId = Object.keys(matchingConnections).find(
                      (lId) => matchingConnections[lId] === opt.id
                    );
                    const connectedLeftObj = connectedLeftPairId
                      ? (currentQ as MatchingQuestion).pairs.find((p) => p.id === connectedLeftPairId)
                      : null;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectRightPair(opt.id)}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          selectedMatchingLeftId
                            ? 'border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 shadow-2xs'
                            : connectedLeftObj
                            ? 'border-slate-200 bg-slate-50/70 text-slate-700'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="text-slate-800 leading-relaxed">{opt.right}</div>
                        {connectedLeftObj && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1 font-medium">
                            <span className="text-teal-700 font-bold">
                              {isEn ? '✓ Linked to:' : '✓ Đã ghép cho:'}
                            </span>
                            <span className="truncate">{connectedLeftObj.left}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REVEALED RESULTS & SCOREBOARD FOR MATCHING QUESTION */}
            {isRevealed && (
              <div className="space-y-5 animate-fadeIn">
                {/* 1. Scoreboard Banner */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    matchingBreakdown.correct === matchingBreakdown.total
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : matchingBreakdown.correct > 0
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-rose-50/90 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-center sm:text-left">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        matchingBreakdown.correct === matchingBreakdown.total
                          ? 'bg-emerald-600 text-white'
                          : matchingBreakdown.correct > 0
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {matchingBreakdown.correct === matchingBreakdown.total ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : matchingBreakdown.correct > 0 ? (
                        <Sparkles className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-extrabold">
                        {matchingBreakdown.correct === matchingBreakdown.total
                          ? isEn
                            ? '🎉 EXCELLENT! YOU MATCHED 4/4 PAIRS WITH 100% ACCURACY!'
                            : '🎉 XUẤT SẮC! BẠN ĐÃ GHÉP NỐI CHÍNH XÁC TUYỆT ĐỐI 4/4 CẶP!'
                          : matchingBreakdown.correct > 0
                          ? isEn
                            ? `👏 YOU MATCHED ${matchingBreakdown.correct}/${matchingBreakdown.total} PAIRS CORRECTLY`
                            : `👏 BẠN ĐÃ GHÉP NỐI ĐÚNG ${matchingBreakdown.correct}/${matchingBreakdown.total} CẶP`
                          : isEn
                          ? '💡 NO MATCHES IDENTIFIED YET'
                          : '💡 BẠN CHƯA GHÉP ĐÚNG CẶP NÀO HOẶC CHƯA THỰC HIỆN GHÉP'}
                      </div>
                      <div className="text-xs mt-0.5 opacity-90">
                        {matchingBreakdown.correct === matchingBreakdown.total
                          ? isEn
                            ? 'You have keen associative intuition and analytical geographic reasoning!'
                            : 'Bạn có tư duy liên kết và phân tích hiện tượng địa lí cực kì chuẩn xác!'
                          : isEn
                          ? 'Review the detailed comparison and explanations below:'
                          : 'Hãy xem kĩ bảng đối chiếu chi tiết và lý giải vì sao nối như vậy ở bên dưới nhé:'}
                      </div>
                    </div>
                  </div>

                  {/* Badges Count */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
                      {isEn ? '✓ Correct: ' : '✓ Đúng: '}{matchingBreakdown.correct}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold">
                      {isEn ? '✗ Wrong: ' : '✗ Sai: '}{matchingBreakdown.wrong}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                      {isEn ? '⚠ Unlinked: ' : '⚠ Chưa nối: '}{matchingBreakdown.unlinked}
                    </span>
                  </div>
                </div>

                {/* 2. Detailed Per-Pair Comparison Cards */}
                <div className="space-y-3.5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <span>
                      {isEn
                        ? 'Detailed Pair Comparison Table & Explanations:'
                        : 'Bảng Đối Chiếu Chi Tiết Từng Cặp Nối & Lời Giải Thích:'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {(currentQ as MatchingQuestion).pairs.map((pair, pIdx) => {
                      const userChosenRightId = matchingConnections[pair.id];
                      const userChosenRightObj = userChosenRightId
                        ? (currentQ as MatchingQuestion).pairs.find((p) => p.id === userChosenRightId)
                        : null;
                      const isPairCorrect = userChosenRightId === pair.id;
                      const isPairUnlinked = !userChosenRightId;

                      return (
                        <div
                          key={pair.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                            isPairCorrect
                              ? 'bg-emerald-50/50 border-emerald-300'
                              : isPairUnlinked
                              ? 'bg-amber-50/50 border-amber-300 border-dashed'
                              : 'bg-rose-50/50 border-rose-300'
                          }`}
                        >
                          {/* Pair Header & Status Badge */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                                {pIdx + 1}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {pair.left}
                              </span>
                            </div>

                            {/* Badge */}
                            <div>
                              {isPairCorrect ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isEn ? 'CORRECT MATCH' : 'GHÉP ĐÚNG'}</span>
                                </span>
                              ) : isPairUnlinked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-2xs">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{isEn ? 'UNLINKED' : 'CHƯA NỐI'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-2xs">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>{isEn ? 'MISMATCHED' : 'NỐI SAI'}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Student Answer vs Standard Answer Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                            {/* Student's Pick */}
                            <div className="p-3 rounded-xl bg-white border border-slate-200/90 space-y-1">
                              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                {isEn ? 'Your Selection:' : 'Lựa chọn của bạn:'}
                              </div>
                              <div className="font-semibold">
                                {isPairCorrect ? (
                                  <span className="text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{pair.right}</span>
                                  </span>
                                ) : isPairUnlinked ? (
                                  <span className="text-amber-700 italic">
                                    {isEn ? '(Not linked)' : '(Chưa thực hiện ghép nối cặp này)'}
                                  </span>
                                ) : (
                                  <span className="text-rose-700 flex items-center gap-1 line-through">
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{userChosenRightObj?.right || (isEn ? 'Incorrect' : 'Ghép nhầm')}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Standard Correct Match */}
                            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-1">
                              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                                {isEn ? '➔ Standard Verified Match:' : '➔ Đáp án ghép nối chuẩn xác:'}
                              </div>
                              <div className="font-bold text-emerald-900 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{pair.right}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pair Rationale / Explanation: Vì sao phải nối như vậy? */}
                          <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-800 space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{isEn ? 'Why this matching?' : 'Vì sao lại ghép như vậy?'}</span>
                            </div>
                            <p className="leading-relaxed font-normal">
                              {pair.reason || (currentQ as MatchingQuestion).explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* REVEALED EXPLANATION & CURIOSITY FUN FACT (ZERO STRESS) */}
        {/* ========================================================== */}
        {isRevealed && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
            {/* Friendly celebration status (for non-matching, matching has its own top scoreboard) */}
            {currentQ.type !== 'matching' && (
              <div
                className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-bold border ${
                  isCorrect
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>
                  {isCorrect
                    ? isEn
                      ? '👏 Wonderful! You have very keen geographic intuition!'
                      : '👏 Tuyệt vời! Bạn có phán đoán địa lí rất chính xác và nhạy bén!'
                    : isEn
                      ? '💡 A fascinating surprise! Let’s explore why:'
                      : '💡 Khám phá thật bất ngờ phải không nào! Hãy cùng giải mã điều thú vị này nhé:'}
                </span>
              </div>
            )}

            {/* Scientific Explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isEn ? '🔬 Scientific Overview:' : '🔬 Lời giải thích khoa học tổng quan:'}
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                {getQuestionExplanation(currentQ, isEn)}
              </p>
            </div>

            {/* Fun Fact Gold Card */}
            {currentQ.funFact && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-yellow-50 border border-amber-300 text-amber-950 space-y-1.5 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>{isEn ? 'GEOGRAPHY INSIGHT 🌍' : 'BẬT MÍ ĐỊA LÍ THÚ VỊ 🌍'}</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                  {currentQ.funFact}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            {!isRevealed
              ? currentQ.type === 'matching'
                ? isEn
                  ? 'Link pairs in Column A with Column B, then click Check Answers'
                  : 'Nối các cặp ở Cột A với Cột B rồi bấm Kiểm tra đáp án'
                : isEn
                ? 'Select an answer to unlock this geographic secret'
                : 'Nhấp chọn đáp án để mở khóa bí mật địa lí'
              : isEn
              ? `Unlocked secret ${currentIndex + 1}/10`
              : `Đã mở khóa điều thứ ${currentIndex + 1}/10`}
          </div>

          <div className="flex items-center space-x-3">
            {!isRevealed ? (
              <button
                disabled={!canReveal}
                onClick={handleRevealAnswer}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                  canReveal
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {currentQ.type === 'matching'
                    ? Object.keys(matchingConnections).length ===
                      (currentQ as MatchingQuestion).pairs.length
                      ? isEn ? 'Check Answers & Reveal ✨' : 'Kiểm tra đáp án & Bật mí ✨'
                      : Object.keys(matchingConnections).length > 0
                      ? isEn
                        ? `Check Answers (${Object.keys(matchingConnections).length}/${
                            (currentQ as MatchingQuestion).pairs.length
                          } pairs) ✨`
                        : `Kiểm tra đáp án (${Object.keys(matchingConnections).length}/${
                            (currentQ as MatchingQuestion).pairs.length
                          } cặp) ✨`
                      : isEn ? 'Check Answers ✨' : 'Kiểm tra đáp án ✨'
                    : isEn ? 'Reveal Answer & Insights ✨' : 'Khám phá đáp án & Bật mí ✨'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
              >
                <span>
                  {currentIndex < questions.length - 1
                    ? isEn ? 'Explore Next Mystery' : 'Khám phá điều tiếp theo'
                    : isEn ? 'View Expedition Results' : 'Xem thành quả thám hiểm'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

