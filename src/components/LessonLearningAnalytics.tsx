import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileSpreadsheet,
  Filter,
  HelpCircle,
  Layers,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ExamRecord, Lesson, Question, QuestionType, UserProfile } from '../types';
import { LESSONS } from '../data/lessons';
import { CURRICULUM_CHAPTERS, CURRICULUM_PARTS } from '../data/curriculum';
import { getLocalizedChapter, getLocalizedLesson } from '../data/bilingualCurriculum';
import { localizeQuestion, localizeStoredAnswerText } from '../services/bilingualQuestions';
import { apiService } from '../services/api';
import { normalizeClassName, normalizeSchoolKey } from '../utils/normalize';
import { formatVNDateTime } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface LessonLearningAnalyticsProps {
  questions: Question[];
  currentUser: UserProfile;
}

interface AttemptMetrics {
  hasDetailedLogs: boolean;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  unansweredCount: number;
  correctRate: number; // % of answered
  wrongRate: number; // % of answered
  completionPct: number; // % answered / totalQuestions
}

function getAttemptMetrics(attempt: ExamRecord): AttemptMetrics {
  const details = Array.isArray(attempt.details) ? attempt.details : [];
  if (details.length > 0) {
    const totalQuestions = details.length;
    const isUnans = (d: any) => d.status === 'unanswered' || !!d.isUnanswered;
    const isWrongOrPartial = (d: any) =>
      !isUnans(d) && (d.status === 'wrong' || !!d.isPartiallyCorrect || !d.isFullyCorrect);
    const unansweredCount = details.filter(isUnans).length;
    const answeredCount = totalQuestions - unansweredCount;
    const correctCount = details.filter(
      (d) => !isUnans(d) && !isWrongOrPartial(d) && (d.status === 'correct' || !!d.isFullyCorrect)
    ).length;
    const partialCount = details.filter(
      (d) => !isUnans(d) && !d.isFullyCorrect && !!d.isPartiallyCorrect
    ).length;
    const wrongCount = details.filter(isWrongOrPartial).length;

    return {
      hasDetailedLogs: true,
      totalQuestions,
      answeredCount,
      correctCount,
      partialCount,
      wrongCount,
      unansweredCount,
      correctRate: answeredCount > 0 ? parseFloat(((correctCount / answeredCount) * 100).toFixed(1)) : 0,
      wrongRate: answeredCount > 0 ? parseFloat(((wrongCount / answeredCount) * 100).toFixed(1)) : 0,
      completionPct: totalQuestions > 0 ? parseFloat(((answeredCount / totalQuestions) * 100).toFixed(1)) : 0,
    };
  }

  // Historical summary-only records (no synthesized details)
  const totalQuestions = Number(attempt.totalQuestions) || 0;
  const correctCount = Number(attempt.correctCount) || 0;
  const wrongCount = Number(attempt.wrongCount) || 0;
  const unansweredCount =
    attempt.unansweredCount !== undefined
      ? Math.max(0, Number(attempt.unansweredCount))
      : Math.max(0, totalQuestions - correctCount - wrongCount);
  const answeredCount = Math.max(0, totalQuestions - unansweredCount);

  return {
    hasDetailedLogs: false,
    totalQuestions,
    answeredCount,
    correctCount,
    partialCount: 0,
    wrongCount,
    unansweredCount,
    correctRate: answeredCount > 0 ? parseFloat(((correctCount / answeredCount) * 100).toFixed(1)) : 0,
    wrongRate: answeredCount > 0 ? parseFloat(((wrongCount / answeredCount) * 100).toFixed(1)) : 0,
    completionPct: totalQuestions > 0 ? parseFloat(((answeredCount / totalQuestions) * 100).toFixed(1)) : 0,
  };
}

function getStudentIdentityKey(a: ExamRecord): string {
  const sch = normalizeSchoolKey(a.schoolName || '');
  const cls = normalizeClassName(a.className || '');
  const idPart = (a.studentCode || a.studentName || a.studentId || '').trim().toLowerCase();
  return `${sch}::${cls}::${idPart}`;
}

export const LessonLearningAnalytics: React.FC<LessonLearningAnalyticsProps> = ({
  questions,
  currentUser,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(Date.now());

  // Missed Questions API state (GET /api/teacher/analytics/missed-questions)
  const [missedApiData, setMissedApiData] = useState<
    Awaited<ReturnType<typeof apiService.getMissedQuestionsAnalytics>> | null
  >(null);
  const [missedLoading, setMissedLoading] = useState<boolean>(true);
  const [missedError, setMissedError] = useState<string | null>(null);
  const [missedRefreshKey, setMissedRefreshKey] = useState<number>(0);

  // Filters
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [studentQuery, setStudentQuery] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'all' | QuestionType>('all');

  // Sub-views & drilldown
  const [subView, setSubView] = useState<'overview' | 'students' | 'missed'>('overview');
  const [drilldownLessonId, setDrilldownLessonId] = useState<string>('bai-1');
  const [missedLessonFilter, setMissedLessonFilter] = useState<string>('all');
  const [missedDisplayMode, setMissedDisplayMode] = useState<'table' | 'cards'>('table');
  const [selectedMissedQuestion, setSelectedMissedQuestion] = useState<any | null>(null);

  // Student Attempt History Modal
  const [selectedStudentRow, setSelectedStudentRow] = useState<{
    studentKey: string;
    studentName: string;
    studentCode: string;
    schoolName: string;
    className: string;
    lessonTitle: string;
    attempts: ExamRecord[];
  } | null>(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  const loadLiveRecords = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setRecordsError(null);
    try {
      const serverRecords = await apiService.getAttempts({ schoolName: 'all' }, currentUser, true);
      const map = new Map<string, ExamRecord>();
      serverRecords.forEach((r) => {
        if (r && r.id) map.set(r.id, r);
      });

      const sorted = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
      setRecords(sorted);
      setLastSyncedAt(Date.now());
    } catch (err: any) {
      console.error('Error loading live server attempts:', err);
      if (!silent) setRecords([]);
      setRecordsError(
        err?.message ||
          (isEn
            ? 'Failed to load learning analytics. Please verify teacher login and try again.'
            : 'Không thể tải dữ liệu thống kê. Vui lòng kiểm tra phiên đăng nhập Giáo viên và thử lại.')
      );
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveRecords(false);
  }, [currentUser.id]);

  // Live subscription so new student attempts update without remounting or losing filters
  useEffect(() => {
    let timer: number | null = null;
    const unsub = apiService.subscribeToDataChanges(() => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        loadLiveRecords(true);
        setMissedRefreshKey((k) => k + 1);
      }, 250);
    });
    return () => {
      unsub();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [currentUser.id]);

  // Fetch Frequently Missed Questions whenever filters or live data change
  useEffect(() => {
    let cancelled = false;
    const effectiveLessonId =
      selectedLessonId !== 'all'
        ? selectedLessonId
        : missedLessonFilter !== 'all'
        ? missedLessonFilter
        : 'all';

    if (!missedApiData) setMissedLoading(true);
    setMissedError(null);

    apiService
      .getMissedQuestionsAnalytics(
        {
          schoolName: selectedSchool,
          className: selectedClass,
          studentName: studentQuery,
          chapterId: selectedChapterId,
          lessonId: effectiveLessonId,
          questionType: selectedFormat,
        },
        currentUser
      )
      .then((data) => {
        if (!cancelled) {
          setMissedApiData(data);
          setMissedError(null);
          setLastSyncedAt(Date.now());
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setMissedApiData(null);
          setMissedError(
            err?.message ||
              (isEn
                ? 'Failed to load missed questions analytics from server.'
                : 'Không thể tải dữ liệu thống kê câu hỏi hay sai từ máy chủ.')
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMissedLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    currentUser.id,
    selectedSchool,
    selectedClass,
    selectedChapterId,
    selectedLessonId,
    missedLessonFilter,
    selectedFormat,
    studentQuery,
    missedRefreshKey,
  ]);

  // Dynamic filter options derived from live records
  const dynamicSchools = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      if (!r.schoolName) return;
      const key = normalizeSchoolKey(r.schoolName);
      if (key && !map.has(key)) map.set(key, r.schoolName.trim());
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [records]);

  const dynamicClasses = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (selectedSchool !== 'all' && normalizeSchoolKey(r.schoolName) !== selectedSchool) return;
      const cls = normalizeClassName(r.className || '');
      if (cls) set.add(cls);
    });
    return Array.from(set).sort();
  }, [records, selectedSchool]);

  const dynamicStudents = useMemo(() => {
    const map = new Map<
      string,
      { key: string; value: string; name: string; code: string; className: string; schoolName: string }
    >();
    records.forEach((r) => {
      if (selectedSchool !== 'all' && normalizeSchoolKey(r.schoolName) !== selectedSchool) return;
      const cls = normalizeClassName(r.className || '');
      if (selectedClass !== 'all' && cls !== selectedClass) return;
      const idKey = getStudentIdentityKey(r);
      const val = (r.studentCode || r.studentName || '').trim();
      if (!val || map.has(idKey)) return;
      map.set(idKey, {
        key: idKey,
        value: val,
        name: (r.studentName || '').trim(),
        code: (r.studentCode || '').trim(),
        className: cls,
        schoolName: (r.schoolName || '').trim(),
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [records, selectedSchool, selectedClass]);

  // Chapters & Parts filter list (Part 1 + 13 chapters)
  const chapterFilterOptions = useMemo(() => {
    const part1 = CURRICULUM_PARTS.find((p) => p.id === 'phan-1');
    return [
      {
        id: 'phan-1',
        label: isEn
          ? 'Part 1: General Foundations (Lesson 1)'
          : part1?.title || 'PHẦN 1. MỘT SỐ VẤN ĐỀ CHUNG (Bài 1)',
      },
      ...CURRICULUM_CHAPTERS.map((c) => {
        const loc = getLocalizedChapter(c, language);
        return { id: c.id, label: loc.title };
      }),
    ];
  }, [language, isEn]);

  const lessonsInChapter = useMemo(() => {
    if (selectedChapterId === 'all') return LESSONS;
    if (selectedChapterId === 'phan-1') return LESSONS.filter((l) => l.partId === 'phan-1');
    return LESSONS.filter((l) => l.chapterId === selectedChapterId);
  }, [selectedChapterId]);

  // Helper: map any attempt to its lessonId (from explicit lessonId or title prefix like "Bài 1:")
  const resolveAttemptLessonId = (r: ExamRecord): string | null => {
    if (r.lessonId && LESSONS.some((l) => l.id === r.lessonId)) return r.lessonId;
    const titleStr = (r.lessonTitle || r.title || '').trim();
    const match = titleStr.match(/^(?:Bài|Lesson)\s+(\d+)\b/i);
    if (match) {
      const candidate = `bai-${match[1]}`;
      if (LESSONS.some((l) => l.id === candidate)) return candidate;
    }
    return null;
  };

  // Filtered records (respecting school, chapter, lesson, class, student search)
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedSchool !== 'all' && normalizeSchoolKey(r.schoolName) !== selectedSchool) return false;
      if (selectedClass !== 'all' && normalizeClassName(r.className || '') !== selectedClass) return false;
      if (studentQuery.trim()) {
        const q = studentQuery.trim().toLowerCase();
        const matchName = (r.studentName || '').toLowerCase().includes(q);
        const matchCode = (r.studentCode || '').toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }

      const lid = resolveAttemptLessonId(r);
      if (selectedLessonId !== 'all') {
        if (lid !== selectedLessonId) return false;
      } else if (selectedChapterId !== 'all') {
        const allowedLessonIds = new Set(lessonsInChapter.map((l) => l.id));
        if (!lid || !allowedLessonIds.has(lid)) return false;
      }

      if (selectedFormat !== 'all') {
        const hasTypeInBreakdown =
          r.typeBreakdown && r.typeBreakdown[selectedFormat] && r.typeBreakdown[selectedFormat].total > 0;
        const hasTypeInDetails =
          Array.isArray(r.details) && r.details.some((d) => d.type === selectedFormat);
        const matchesTopType = r.questionType === selectedFormat;
        if (!hasTypeInBreakdown && !hasTypeInDetails && !matchesTopType) return false;
      }

      return true;
    });
  }, [
    records,
    selectedSchool,
    selectedClass,
    studentQuery,
    selectedLessonId,
    selectedChapterId,
    lessonsInChapter,
    selectedFormat,
  ]);

  // Global KPIs over filtered records
  const globalKpis = useMemo(() => {
    const uniqueStudents = new Set<string>();
    const activeLessons = new Set<string>();
    let totalScore = 0;
    let totalQuestions = 0;
    let totalAnswered = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnanswered = 0;

    filteredRecords.forEach((r) => {
      uniqueStudents.add(getStudentIdentityKey(r));
      const lid = resolveAttemptLessonId(r);
      if (lid) activeLessons.add(lid);
      totalScore += Number(r.score) || 0;

      const m = getAttemptMetrics(r);
      totalQuestions += m.totalQuestions;
      totalAnswered += m.answeredCount;
      totalCorrect += m.correctCount;
      totalWrong += m.wrongCount;
      totalUnanswered += m.unansweredCount;
    });

    const attemptsCount = filteredRecords.length;
    const avgScore = attemptsCount > 0 ? parseFloat((totalScore / attemptsCount).toFixed(2)) : 0;
    const correctRate = totalAnswered > 0 ? parseFloat(((totalCorrect / totalAnswered) * 100).toFixed(1)) : 0;
    const wrongRate = totalAnswered > 0 ? parseFloat(((totalWrong / totalAnswered) * 100).toFixed(1)) : 0;

    return {
      uniqueStudentsCount: uniqueStudents.size,
      attemptsCount,
      activeLessonsCount: activeLessons.size,
      avgScore,
      totalQuestions,
      totalAnswered,
      totalCorrect,
      totalWrong,
      totalUnanswered,
      correctRate,
      wrongRate,
    };
  }, [filteredRecords]);

  // 4 Question Formats Analytics over filteredRecords
  const formatStats = useMemo(() => {
    const formats: QuestionType[] = [
      'multiple_choice',
      'true_false_context',
      'short_answer',
      'matching',
    ];

    const map: Record<
      QuestionType,
      {
        type: QuestionType;
        total: number;
        answered: number;
        correct: number;
        partial: number;
        wrong: number;
        unanswered: number;
      }
    > = {
      multiple_choice: { type: 'multiple_choice', total: 0, answered: 0, correct: 0, partial: 0, wrong: 0, unanswered: 0 },
      true_false_context: { type: 'true_false_context', total: 0, answered: 0, correct: 0, partial: 0, wrong: 0, unanswered: 0 },
      short_answer: { type: 'short_answer', total: 0, answered: 0, correct: 0, partial: 0, wrong: 0, unanswered: 0 },
      matching: { type: 'matching', total: 0, answered: 0, correct: 0, partial: 0, wrong: 0, unanswered: 0 },
    };

    filteredRecords.forEach((r) => {
      if (Array.isArray(r.details) && r.details.length > 0) {
        r.details.forEach((d) => {
          const b = map[d.type];
          if (!b) return;
          b.total += 1;
          const isUnans = d.status === 'unanswered' || !!d.isUnanswered;
          const isPartial = !isUnans && !!d.isPartiallyCorrect && !d.isFullyCorrect;
          const isRight =
            !isUnans && !isPartial && d.status !== 'wrong' && (d.status === 'correct' || !!d.isFullyCorrect);

          if (isUnans) {
            b.unanswered += 1;
          } else {
            b.answered += 1;
            if (isRight) {
              b.correct += 1;
            } else {
              if (isPartial) b.partial += 1;
              b.wrong += 1;
            }
          }
        });
      } else if (r.typeBreakdown && typeof r.typeBreakdown === 'object') {
        formats.forEach((t) => {
          const tb = r.typeBreakdown[t];
          if (!tb || !tb.total) return;
          const b = map[t];
          const tot = Number(tb.total) || 0;
          const cor = Math.floor(Number(tb.correct) || 0);
          b.total += tot;
          b.answered += tot; // legacy records had 0 unanswered tracked
          b.correct += cor;
          b.wrong += Math.max(0, tot - cor);
        });
      }
    });

    return formats.map((t) => {
      const b = map[t];
      return {
        ...b,
        correctRate: b.answered > 0 ? parseFloat(((b.correct / b.answered) * 100).toFixed(1)) : 0,
        wrongRate: b.answered > 0 ? parseFloat(((b.wrong / b.answered) * 100).toFixed(1)) : 0,
      };
    });
  }, [filteredRecords]);

  // Per-Lesson Summary across all 40 lessons (scoped by selectedChapterId/selectedLessonId)
  const visibleLessons = useMemo(() => {
    if (selectedLessonId !== 'all') {
      return LESSONS.filter((l) => l.id === selectedLessonId);
    }
    return lessonsInChapter;
  }, [selectedLessonId, lessonsInChapter]);

  const lessonSummaries = useMemo(() => {
    return visibleLessons.map((lesson) => {
      const locLesson = getLocalizedLesson(lesson, language);
      const chapterObj = CURRICULUM_CHAPTERS.find((c) => c.id === lesson.chapterId);
      const chapterLabel = chapterObj
        ? getLocalizedChapter(chapterObj, language).title
        : isEn
        ? 'Part 1: General Foundations'
        : 'Phần 1: Một số vấn đề chung';

      const lRecords = filteredRecords.filter((r) => resolveAttemptLessonId(r) === lesson.id);
      const uniqueStudents = new Set(lRecords.map(getStudentIdentityKey));

      let totalScore = 0;
      let totalCompletionPct = 0;
      let totalQuestions = 0;
      let totalAnswered = 0;
      let totalCorrect = 0;
      let totalWrong = 0;
      let totalUnanswered = 0;
      let detailedAttemptsCount = 0;

      lRecords.forEach((r) => {
        totalScore += Number(r.score) || 0;
        const m = getAttemptMetrics(r);
        if (m.hasDetailedLogs) detailedAttemptsCount++;
        totalCompletionPct += m.completionPct;
        totalQuestions += m.totalQuestions;
        totalAnswered += m.answeredCount;
        totalCorrect += m.correctCount;
        totalWrong += m.wrongCount;
        totalUnanswered += m.unansweredCount;
      });

      const attemptCount = lRecords.length;
      const avgScore = attemptCount > 0 ? parseFloat((totalScore / attemptCount).toFixed(2)) : 0;
      const completionRate =
        attemptCount > 0 ? parseFloat((totalCompletionPct / attemptCount).toFixed(1)) : 0;
      const correctRate =
        totalAnswered > 0 ? parseFloat(((totalCorrect / totalAnswered) * 100).toFixed(1)) : 0;
      const wrongRate =
        totalAnswered > 0 ? parseFloat(((totalWrong / totalAnswered) * 100).toFixed(1)) : 0;

      return {
        lesson,
        title: locLesson.title,
        chapterLabel,
        uniqueStudentsCount: uniqueStudents.size,
        attemptCount,
        avgScore,
        completionRate,
        totalQuestions,
        totalAnswered,
        totalCorrect,
        totalWrong,
        totalUnanswered,
        correctRate,
        wrongRate,
        detailedAttemptsCount,
      };
    });
  }, [visibleLessons, filteredRecords, language, isEn]);

  // Drilldown lesson (always kept valid inside lessonsInChapter or selectedLessonId)
  const activeDrilldownLessonId =
    selectedLessonId !== 'all'
      ? selectedLessonId
      : drilldownLessonId;

  const activeDrilldownLesson: Lesson | undefined = useMemo(
    () => LESSONS.find((l) => l.id === activeDrilldownLessonId) || visibleLessons[0] || LESSONS[0],
    [activeDrilldownLessonId, visibleLessons]
  );

  // Student Detail Roster for Selected Lesson (Level 2)
  const lessonStudentRows = useMemo(() => {
    if (!activeDrilldownLesson) return [];
    const lRecords = filteredRecords
      .filter((r) => resolveAttemptLessonId(r) === activeDrilldownLesson.id)
      .sort((a, b) => a.timestamp - b.timestamp);

    const byStudent = new Map<
      string,
      {
        studentKey: string;
        studentName: string;
        studentCode: string;
        schoolName: string;
        className: string;
        attempts: ExamRecord[];
      }
    >();

    lRecords.forEach((r) => {
      const key = getStudentIdentityKey(r);
      const existing = byStudent.get(key);
      if (existing) {
        existing.attempts.push(r);
      } else {
        byStudent.set(key, {
          studentKey: key,
          studentName: r.studentName,
          studentCode: r.studentCode,
          schoolName: r.schoolName,
          className: normalizeClassName(r.className || ''),
          attempts: [r],
        });
      }
    });

    return Array.from(byStudent.values())
      .map((row) => {
        const chronological = [...row.attempts].sort((a, b) => a.timestamp - b.timestamp);
        const latest = chronological[chronological.length - 1];
        const scores = chronological.map((a) => Number(a.score) || 0);
        const avgScore = parseFloat((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2));
        const bestScore = Math.max(...scores);

        // Aggregated across attempts
        let aggAnswered = 0;
        let aggCorrect = 0;
        let aggWrong = 0;
        let aggUnanswered = 0;
        chronological.forEach((a) => {
          const m = getAttemptMetrics(a);
          aggAnswered += m.answeredCount;
          aggCorrect += m.correctCount;
          aggWrong += m.wrongCount;
          aggUnanswered += m.unansweredCount;
        });

        const latestMetrics = getAttemptMetrics(latest);
        const aggCorrectRate = aggAnswered > 0 ? parseFloat(((aggCorrect / aggAnswered) * 100).toFixed(1)) : 0;
        const aggWrongRate = aggAnswered > 0 ? parseFloat(((aggWrong / aggAnswered) * 100).toFixed(1)) : 0;

        return {
          ...row,
          chronologicalAttempts: chronological,
          attemptsCount: chronological.length,
          scores,
          avgScore,
          bestScore,
          latestTimestamp: latest.timestamp,
          latestMetrics,
          aggAnswered,
          aggCorrect,
          aggWrong,
          aggUnanswered,
          aggCorrectRate,
          aggWrongRate,
        };
      })
      .sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  }, [activeDrilldownLesson, filteredRecords]);

  // Frequently Missed Questions Diagnostics (strictly sourced from GET /api/teacher/analytics/missed-questions)
  const missedQuestionsData = useMemo(() => {
    const detailedAttemptsCount = missedApiData?.detailedAttempts || 0;
    const summaryOnlyCount = missedApiData?.summaryOnlyAttempts || 0;
    const apiQuestions = Array.isArray(missedApiData?.questions) ? missedApiData.questions : [];

    const ranked = apiQuestions.map((apiQ) => {
      const rawQ = questions.find((q) => q.id === apiQ.questionId);
      const locQ = rawQ ? localizeQuestion(rawQ, language) : null;

      const displayText =
        (locQ
          ? locQ.type === 'true_false_context'
            ? `[${locQ.contextTitle}] ${locQ.contextText}`
            : locQ.type === 'matching'
            ? locQ.title
            : locQ.question
          : apiQ.questionText) || apiQ.questionId;

      const standardAnswerDisplay = locQ
        ? locQ.type === 'multiple_choice'
          ? `${['A', 'B', 'C', 'D'][locQ.correctIndex]}. ${locQ.options[locQ.correctIndex] || ''}`
          : locQ.type === 'true_false_context'
          ? locQ.statements
              .map((s) => `${s.id.toUpperCase()}: ${s.isCorrect ? (isEn ? 'True' : 'Đúng') : (isEn ? 'False' : 'Sai')}`)
              .join(' | ')
          : locQ.type === 'short_answer'
          ? `${locQ.standardAnswer}${locQ.unit ? ' ' + locQ.unit : ''}`
          : locQ.pairs.map((p) => `${p.left} ➔ ${p.right}`).join(' | ')
        : localizeStoredAnswerText(apiQ.correctAnswerText, language);

      const commonWrongAnswers = (apiQ.commonWrongAnswers || []).map((cw) => ({
        answer: localizeStoredAnswerText(cw.answer, language) || cw.answer,
        count: cw.count,
        pctOfWrong:
          apiQ.timesWrong > 0 ? parseFloat(((cw.count / apiQ.timesWrong) * 100).toFixed(1)) : 0,
      }));

      const wrongAttempts = (apiQ.wrongAttempts || []).map((wa) => ({
        ...wa,
        className: normalizeClassName(wa.className || ''),
        studentAnswerDisplay: localizeStoredAnswerText(wa.userAnswerText, language) || wa.userAnswerText || '—',
        correctAnswerDisplay:
          localizeStoredAnswerText(wa.correctAnswerText, language) || standardAnswerDisplay || '—',
      }));

      const studentSummaryMap = new Map<
        string,
        {
          studentKey: string;
          studentName: string;
          studentCode: string;
          className: string;
          schoolName: string;
          wrongCount: number;
          studentTotalAnswered: number;
        }
      >();
      wrongAttempts.forEach((wa) => {
        const prev = studentSummaryMap.get(wa.studentKey);
        if (prev) {
          prev.wrongCount += 1;
        } else {
          studentSummaryMap.set(wa.studentKey, {
            studentKey: wa.studentKey,
            studentName: wa.studentName,
            studentCode: wa.studentCode,
            className: wa.className,
            schoolName: wa.schoolName,
            wrongCount: 1,
            studentTotalAnswered: wa.studentTotalAnswered || 1,
          });
        }
      });
      const studentSummaries = Array.from(studentSummaryMap.values());

      const studentsList = studentSummaries.map((st) => {
        const countSuffix =
          st.studentTotalAnswered > 1
            ? ` - ${st.studentTotalAnswered} ${isEn ? 'ans' : 'lần'}`
            : '';
        return `${st.studentName} (${st.className}${countSuffix})`;
      });

      return {
        questionId: apiQ.questionId,
        lessonId: apiQ.lessonId,
        chapterId: apiQ.chapterId || '',
        type: apiQ.type,
        questionText: displayText,
        rawQuestion: rawQ,
        locQuestion: locQ,
        correctAnswerDisplay: standardAnswerDisplay,
        timesAnswered: apiQ.timesAnswered,
        timesCorrect: apiQ.timesCorrect,
        timesWrong: apiQ.timesWrong,
        timesUnanswered: apiQ.timesUnanswered,
        wrongRate: apiQ.wrongRate,
        uniqueStudentsCount: apiQ.uniqueStudentsWrong,
        studentsList,
        studentSummaries,
        commonWrongAnswers,
        wrongAttempts,
      };
    });

    return {
      totalScopeAttempts: detailedAttemptsCount + summaryOnlyCount,
      attemptsWithDetailsCount: detailedAttemptsCount,
      summaryOnlyCount,
      ranked,
    };
  }, [missedApiData, questions, language, isEn]);

  const formatTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'multiple_choice':
        return isEn ? 'Multiple Choice (4 options)' : 'Trắc nghiệm 4 phương án';
      case 'true_false_context':
        return isEn ? 'True / False Context' : 'Đúng / Sai ngữ liệu';
      case 'short_answer':
        return isEn ? 'Short Answer / Calc' : 'Trả lời ngắn / Tính toán';
      case 'matching':
        return isEn ? 'Column Matching' : 'Ghép cột';
    }
  };

  const handleExportAnalyticsExcel = () => {
    const wb = XLSX.utils.book_new();

    const lessonRows = lessonSummaries.map((item, idx) =>
      isEn
        ? {
            'No.': idx + 1,
            'Lesson ID': item.lesson.id,
            'Lesson Name': item.title,
            'Chapter / Part': item.chapterLabel,
            'Unique Students': item.uniqueStudentsCount,
            'Practice Attempts': item.attemptCount,
            'Average Score': item.avgScore,
            'Completion Rate (%)': item.completionRate,
            'Total Answered': item.totalAnswered,
            'Correct Answers': item.totalCorrect,
            'Wrong Answers': item.totalWrong,
            Unanswered: item.totalUnanswered,
            'Accuracy Rate (%)': item.correctRate,
            'Error Rate (%)': item.wrongRate,
          }
        : {
            STT: idx + 1,
            'Mã bài': item.lesson.id,
            'Tên bài học': item.title,
            'Chương / Phần': item.chapterLabel,
            'Số HS tham gia (thực tế)': item.uniqueStudentsCount,
            'Số lượt luyện tập': item.attemptCount,
            'Điểm trung bình': item.avgScore,
            'Tỉ lệ hoàn thành (%)': item.completionRate,
            'Tổng câu đã trả lời': item.totalAnswered,
            'Số câu đúng': item.totalCorrect,
            'Số câu sai': item.totalWrong,
            'Chưa trả lời': item.totalUnanswered,
            'Tỉ lệ đúng (%)': item.correctRate,
            'Tỉ lệ sai (%)': item.wrongRate,
          }
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(lessonRows),
      isEn ? 'Summary40Lessons' : 'ThongKe40Bai'
    );

    const studentRows = lessonStudentRows.map((st, idx) =>
      isEn
        ? {
            'No.': idx + 1,
            'Full Name': st.studentName,
            'Student ID': st.studentCode,
            School: st.schoolName,
            Class: st.className,
            Attempts: st.attemptsCount,
            'Attempt Scores': st.scores.join(', '),
            'Avg Score': st.avgScore,
            'Answered (Total)': st.aggAnswered,
            'Correct (Total)': st.aggCorrect,
            'Wrong (Total)': st.aggWrong,
            'Unanswered (Total)': st.aggUnanswered,
            'Accuracy Rate (%)': st.aggCorrectRate,
            'Latest Practice': formatVNDateTime(new Date(st.latestTimestamp).toISOString(), language),
          }
        : {
            STT: idx + 1,
            'Họ và tên': st.studentName,
            'Mã HS': st.studentCode,
            Trường: st.schoolName,
            Lớp: st.className,
            'Số lần làm': st.attemptsCount,
            'Điểm từng lần': st.scores.join(', '),
            'Điểm TB': st.avgScore,
            'Đã trả lời (Tổng)': st.aggAnswered,
            'Đúng (Tổng)': st.aggCorrect,
            'Sai (Tổng)': st.aggWrong,
            'Chưa trả lời (Tổng)': st.aggUnanswered,
            'Tỉ lệ đúng (%)': st.aggCorrectRate,
            'Gần nhất': formatVNDateTime(new Date(st.latestTimestamp).toISOString(), language),
          }
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(studentRows),
      isEn ? 'StudentDetails' : 'ChiTietHocSinh'
    );

    const formatRows = formatStats.map((f) =>
      isEn
        ? {
            'Question Format': formatTypeLabel(f.type),
            'Total Questions': f.total,
            Answered: f.answered,
            Correct: f.correct,
            Wrong: f.wrong,
            Unanswered: f.unanswered,
            'Accuracy Rate (%)': f.correctRate,
            'Error Rate (%)': f.wrongRate,
          }
        : {
            'Dạng bài tập': formatTypeLabel(f.type),
            'Tổng số câu': f.total,
            'Đã trả lời': f.answered,
            'Câu đúng': f.correct,
            'Câu sai': f.wrong,
            'Chưa trả lời': f.unanswered,
            'Tỉ lệ đúng (%)': f.correctRate,
            'Tỉ lệ sai (%)': f.wrongRate,
          }
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(formatRows),
      isEn ? 'QuestionFormats' : '4DangBaiTap'
    );

    const missedRows = missedQuestionsData.ranked.map((mq, idx) => {
      const lessonObj = LESSONS.find((l) => l.id === mq.lessonId);
      const lTitle = lessonObj ? getLocalizedLesson(lessonObj, language).title : mq.lessonId;
      const topWrongStr = mq.commonWrongAnswers
        .slice(0, 3)
        .map((cw) => `${cw.answer} (${cw.count})`)
        .join(' | ');
      return isEn
        ? {
            'No.': idx + 1,
            'Question ID': mq.questionId,
            Lesson: lTitle,
            Format: formatTypeLabel(mq.type),
            Question: mq.questionText,
            'Unique Students Wrong': mq.uniqueStudentsCount,
            'Total Answered': mq.timesAnswered,
            'Correct Attempts': mq.timesCorrect,
            'Wrong Attempts': mq.timesWrong,
            'Error Rate (%)': mq.wrongRate,
            Unanswered: mq.timesUnanswered,
            'Common Wrong Answers': topWrongStr,
          }
        : {
            STT: idx + 1,
            'Mã câu hỏi': mq.questionId,
            'Bài học': lTitle,
            'Dạng câu hỏi': formatTypeLabel(mq.type),
            'Nội dung câu hỏi': mq.questionText,
            'Số HS trả lời sai': mq.uniqueStudentsCount,
            'Tổng lượt trả lời': mq.timesAnswered,
            'Số lượt đúng': mq.timesCorrect,
            'Số lượt sai': mq.timesWrong,
            'Tỉ lệ sai (%)': mq.wrongRate,
            'Chưa trả lời': mq.timesUnanswered,
            'Đáp án hay chọn sai': topWrongStr,
          };
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(missedRows),
      isEn ? 'FrequentlyMissed' : 'CauHoiHaySai'
    );

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(
      wb,
      isEn
        ? `Lesson_Analytics_Geography10_${dateStr}.xlsx`
        : `ThongKe_TheoBaiHoc_DiaLi10_${dateStr}.xlsx`
    );
  };

  const activeLessonLocalized = activeDrilldownLesson
    ? getLocalizedLesson(activeDrilldownLesson, language)
    : null;

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {isEn
              ? 'LESSON-BASED LEARNING ANALYTICS · 13 CHAPTERS · 40 LESSONS'
              : 'THỐNG KÊ HỌC TẬP THEO TỪNG BÀI · 13 CHƯƠNG · 40 BÀI HỌC'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {isEn
              ? 'Lesson-Based Learning Analytics (13 Chapters / 40 Lessons)'
              : 'THỐNG KÊ HỌC TẬP THEO TỪNG BÀI (LESSON-BASED LEARNING ANALYTICS)'}
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            {isEn
              ? 'Real-time tracking of unique participating students, practice attempts, right/wrong/unanswered counts strictly from grading results, 4 question formats, and frequently missed questions.'
              : 'Theo dõi sát thực tế từng bài học: phân biệt số học sinh thực tế và số lượt làm bài, thống kê câu Đúng – Câu Sai – Chưa trả lời tách biệt hoàn toàn theo kết quả chấm bài, 4 dạng bài tập và câu hỏi hay sai.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              loadLiveRecords();
              setMissedRefreshKey((k) => k + 1);
            }}
            disabled={isLoading || missedLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || missedLoading ? 'animate-spin' : ''}`} />
            <span>{isEn ? 'Refresh Live Data' : 'Cập nhật dữ liệu'}</span>
          </button>
          <button
            onClick={handleExportAnalyticsExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isEn ? 'Export Excel' : 'Xuất Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {recordsError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {isEn ? 'Server Analytics Loading Error' : 'Lỗi tải dữ liệu thống kê từ máy chủ'}
              </div>
              <div className="mt-0.5 text-rose-700">{recordsError}</div>
            </div>
          </div>
          <button
            onClick={() => loadLiveRecords(false)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition cursor-pointer"
          >
            {isEn ? 'Retry' : 'Thử lại'}
          </button>
        </div>
      )}

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>{isEn ? 'Filter Analytics Scope' : 'Bộ lọc dữ liệu theo Bài học · Chương · Trường · Lớp · Học sinh'}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>
              {isEn ? 'Synced:' : 'Đồng bộ lúc:'}{' '}
              <strong className="text-slate-600 font-mono">
                {new Date(lastSyncedAt).toLocaleTimeString(isEn ? 'en-US' : 'vi-VN')}
              </strong>
            </span>
            <button
              onClick={() => {
                setSelectedSchool('all');
                setSelectedChapterId('all');
                setSelectedLessonId('all');
                setMissedLessonFilter('all');
                setSelectedClass('all');
                setStudentQuery('');
                setSelectedFormat('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEn ? 'Reset' : 'Đặt lại'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {/* School */}
          <select
            value={selectedSchool}
            onChange={(e) => {
              setSelectedSchool(e.target.value);
              setSelectedClass('all');
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{isEn ? 'All Schools' : 'Tất cả các trường'}</option>
            {dynamicSchools.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Chapter */}
          <select
            value={selectedChapterId}
            onChange={(e) => {
              const chap = e.target.value;
              setSelectedChapterId(chap);
              setSelectedLessonId('all');
              setMissedLessonFilter('all');
              const firstInChap =
                chap === 'all'
                  ? LESSONS[0]
                  : chap === 'phan-1'
                  ? LESSONS.find((l) => l.partId === 'phan-1')
                  : LESSONS.find((l) => l.chapterId === chap);
              if (firstInChap) setDrilldownLessonId(firstInChap.id);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{isEn ? 'All 13 Chapters + Part 1' : 'Tất cả 13 chương & Phần 1'}</option>
            {chapterFilterOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Lesson */}
          <select
            value={selectedLessonId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedLessonId(val);
              if (val !== 'all') setDrilldownLessonId(val);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">
              {isEn ? `All ${lessonsInChapter.length} Lessons` : `Tất cả ${lessonsInChapter.length} bài học`}
            </option>
            {lessonsInChapter.map((l) => {
              const loc = getLocalizedLesson(l, language);
              return (
                <option key={l.id} value={l.id}>
                  {loc.title}
                </option>
              );
            })}
          </select>

          {/* Class */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{isEn ? 'All Classes' : 'Tất cả các lớp'}</option>
            {dynamicClasses.map((cls) => (
              <option key={cls} value={cls}>
                {isEn ? `Class ${cls}` : `Lớp ${cls}`}
              </option>
            ))}
          </select>

          {/* Question Format */}
          <select
            value={selectedFormat}
            onChange={(e: any) => setSelectedFormat(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{isEn ? 'All 4 Formats' : 'Cả 4 dạng bài tập'}</option>
            <option value="multiple_choice">{formatTypeLabel('multiple_choice')}</option>
            <option value="true_false_context">{formatTypeLabel('true_false_context')}</option>
            <option value="short_answer">{formatTypeLabel('short_answer')}</option>
            <option value="matching">{formatTypeLabel('matching')}</option>
          </select>

          {/* Specific Student Dropdown */}
          <select
            value={
              dynamicStudents.some((st) => st.value === studentQuery) ? studentQuery : ''
            }
            onChange={(e) => setStudentQuery(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{isEn ? 'All Students' : 'Tất cả học sinh'}</option>
            {dynamicStudents.map((st) => (
              <option key={st.key} value={st.value}>
                {st.name} ({st.className}
                {st.code ? ` · ${st.code}` : ''})
              </option>
            ))}
          </select>

          {/* Student Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              placeholder={isEn ? 'Student name or ID...' : 'Tìm tên hoặc mã HS...'}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Top 4 KPI Summary Strip (Strictly Clean SaaS Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>{isEn ? 'Unique Students / Attempts' : 'HS thực tế / Lượt luyện tập'}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900">
            {globalKpis.uniqueStudentsCount}{' '}
            <span className="text-sm font-bold text-slate-400">/ {globalKpis.attemptsCount} {isEn ? 'attempts' : 'lượt'}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isEn ? 'Retakes never inflate student count' : 'Làm lại nhiều lần không tính trùng HS'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>{isEn ? 'Lessons Active / Avg Score' : 'Bài có dữ liệu / Điểm TB'}</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900">
            {globalKpis.activeLessonsCount}/40{' '}
            <span className="text-sm font-bold text-amber-600">· {globalKpis.avgScore.toFixed(1)}/10</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isEn ? 'Standard 10-point grading scale' : 'Tính trên toàn bộ lượt làm trong bộ lọc'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>{isEn ? 'Correct Answers' : 'Câu trả lời Đúng'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-emerald-700">
            {globalKpis.totalCorrect}{' '}
            <span className="text-sm font-bold text-slate-500">
              / {globalKpis.totalAnswered} ({globalKpis.correctRate}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isEn ? 'Ratio over answered questions' : 'Tỉ lệ đúng tính trên tổng câu đã trả lời'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>{isEn ? 'Wrong & Unanswered' : 'Câu Sai & Chưa trả lời'}</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-rose-700">
            {globalKpis.totalWrong}{' '}
            <span className="text-sm font-bold text-slate-500">({globalKpis.wrongRate}%)</span>
            <span className="text-xs font-bold text-amber-700 ml-2">
              · {globalKpis.totalUnanswered} {isEn ? 'unans.' : 'chưa TL'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isEn ? 'Unanswered tracked separately from wrong' : 'Câu chưa trả lời được tách riêng, không gộp câu sai'}
          </p>
        </div>
      </div>

      {/* 4 Question Formats Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {isEn
                ? 'Performance Across All 4 Assessment Formats'
                : 'Thống Kê Riêng Kết Quả 4 Dạng Bài Tập'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEn
                ? 'Calculated strictly from stored grading records (no inferred counts).'
                : 'Tổng hợp trực tiếp từ kết quả chấm từng dạng bài (không tự suy diễn số liệu).'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {formatStats.map((f) => (
            <div key={f.type} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-xs font-bold text-slate-800">{formatTypeLabel(f.type)}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black font-mono tabular-nums text-slate-900">
                  {f.correctRate}%
                </span>
                <span className="text-[11px] font-mono tabular-nums text-slate-500">
                  {f.answered} {isEn ? 'answered' : 'đã trả lời'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{ width: `${Math.min(100, f.correctRate)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600 pt-0.5">
                <span className="text-emerald-700 font-semibold">
                  {isEn ? 'Right:' : 'Đúng:'} {f.correct}
                </span>
                <span className="text-rose-700 font-semibold">
                  {isEn ? 'Wrong:' : 'Sai:'} {f.wrong}
                </span>
                <span className="text-amber-700 font-semibold">
                  {isEn ? 'Unans:' : 'Chưa TL:'} {f.unanswered}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex flex-wrap sm:flex-nowrap gap-1">
        <button
          onClick={() => setSubView('overview')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            subView === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isEn ? `All ${visibleLessons.length} Lessons Matrix` : `Bảng Tổng Hợp (${visibleLessons.length} Bài học)`}</span>
        </button>

        <button
          onClick={() => setSubView('students')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            subView === 'students' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>
            {isEn
              ? `Student Drilldown (${lessonStudentRows.length})`
              : `Chi Tiết Học Sinh (${lessonStudentRows.length} HS)`}
          </span>
        </button>

        <button
          onClick={() => setSubView('missed')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            subView === 'missed' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>
            {missedLoading
              ? isEn
                ? 'Frequently Missed Questions (...)'
                : 'Câu Hỏi Hay Sai (...)'
              : missedError
              ? isEn
                ? 'Frequently Missed Questions (!)'
                : 'Câu Hỏi Hay Sai (!)'
              : isEn
              ? `Frequently Missed Questions (${missedQuestionsData.ranked.length})`
              : `Câu Hỏi Hay Sai (${missedQuestionsData.ranked.length})`}
          </span>
        </button>
      </div>

      {/* ================================================================== */}
      {/* SUB-VIEW 1: ALL 40 LESSONS OVERVIEW TABLE                          */}
      {/* ================================================================== */}
      {subView === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEn
                  ? 'Lesson-by-Lesson Practice & Accuracy Table'
                  : 'Bảng Thống Kê Hoạt Động Luyện Tập & Tỉ Lệ Đúng – Sai Theo Từng Bài'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Select any lesson to inspect student roster, attempts history, right/wrong breakdown, and common errors.'
                  : 'Chọn vào bất kỳ bài học nào để xem chi tiết từng học sinh, điểm từng lần làm, câu đúng/sai và câu hay sai.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <th className="py-3 px-4">{isEn ? 'Lesson / Chapter' : 'Bài học / Chương'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Students' : 'Số HS'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Attempts' : 'Lượt làm'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Avg Score' : 'Điểm TB'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Completion' : 'Hoàn thành'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Answered' : 'Đã trả lời'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Correct (%)' : 'Đúng (%)'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Wrong (%)' : 'Sai (%)'}</th>
                  <th className="py-3 px-3 text-center">{isEn ? 'Unanswered' : 'Chưa TL'}</th>
                  <th className="py-3 px-4 text-right">{isEn ? 'Drilldown' : 'Chi tiết'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lessonSummaries.map((item) => {
                  const hasData = item.attemptCount > 0;
                  return (
                    <tr key={item.lesson.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.chapterLabel}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-slate-900">
                        {item.uniqueStudentsCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-slate-700">
                        {item.attemptCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-amber-700">
                        {hasData ? item.avgScore.toFixed(1) : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-slate-700">
                        {hasData ? `${item.completionRate}%` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-700">
                        {hasData ? item.totalAnswered : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-emerald-700">
                        {hasData ? `${item.totalCorrect} (${item.correctRate}%)` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-rose-700">
                        {hasData ? `${item.totalWrong} (${item.wrongRate}%)` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-amber-700">
                        {hasData ? item.totalUnanswered : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setMissedLessonFilter(item.lesson.id);
                              setSubView('missed');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                            title={isEn ? 'View missed questions for this lesson' : 'Xem câu hay sai của bài này'}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>{isEn ? 'Missed Qs' : 'Câu sai'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setDrilldownLessonId(item.lesson.id);
                              setSubView('students');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>{isEn ? 'Inspect' : 'Xem HS'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-VIEW 2: STUDENT DRILLDOWN FOR SELECTED LESSON                  */}
      {/* ================================================================== */}
      {subView === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                {isEn ? 'Selected Lesson Student Roster' : 'Danh sách chi tiết từng học sinh theo bài học'}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {activeLessonLocalized?.title || activeDrilldownLesson?.title}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Shows unique students, score per attempt, latest score, aggregated answered/correct/wrong/unanswered counts, and click-to-inspect attempt history.'
                  : 'Hiển thị rõ từng học sinh, điểm từng lần làm, điểm trung bình, số câu đúng/sai/chưa trả lời (tách biệt lần gần nhất và tổng hợp). Bấm "Lịch sử làm bài" để xem từng lượt riêng.'}
              </p>
            </div>

            <select
              value={activeDrilldownLesson?.id || 'bai-1'}
              onChange={(e) => {
                setDrilldownLessonId(e.target.value);
                if (selectedLessonId !== 'all') setSelectedLessonId(e.target.value);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-sm"
            >
              {LESSONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {getLocalizedLesson(l, language).title}
                </option>
              ))}
            </select>
          </div>

          {lessonStudentRows.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">
                {isEn ? 'No practice attempts recorded for this lesson yet.' : 'Chưa có lượt luyện tập nào được ghi nhận cho bài học này.'}
              </div>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Data will appear automatically as soon as students complete practice for this lesson.'
                  : 'Dữ liệu sẽ tự động cập nhật ngay khi học sinh hoàn thành luyện tập bài học này.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                    <th className="py-3 px-4">{isEn ? 'Student' : 'Họ tên & Trường'}</th>
                    <th className="py-3 px-3 text-center">{isEn ? 'Class' : 'Lớp'}</th>
                    <th className="py-3 px-3 text-center">{isEn ? 'Attempts' : 'Số lần'}</th>
                    <th className="py-3 px-3">{isEn ? 'Score per Attempt' : 'Điểm từng lần làm'}</th>
                    <th className="py-3 px-3 text-center">{isEn ? 'Avg Score' : 'Điểm TB'}</th>
                    <th className="py-3 px-3 text-center">{isEn ? 'Latest Right/Wrong/Unans' : 'Lần gần nhất (Đ/S/Chưa TL)'}</th>
                    <th className="py-3 px-3 text-center">{isEn ? 'Total Right/Wrong' : 'Tổng hợp (Đ/S · %Đ)'}</th>
                    <th className="py-3 px-3">{isEn ? 'Latest Practice' : 'Thời gian gần nhất'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'History' : 'Chi tiết'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lessonStudentRows.map((st) => (
                    <tr key={st.studentKey} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{st.studentName}</div>
                        <div className="text-[11px] text-slate-500">
                          {st.studentCode} · {st.schoolName}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{st.className}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-blue-700">
                        {st.attemptsCount}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-[11px] text-slate-700 max-w-xs">
                        {st.scores.map((sc, i) => `${isEn ? 'Try ' : 'L'}${i + 1}: ${sc.toFixed(1)}`).join(' · ')}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-black text-amber-700">
                        {st.avgScore.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        <span className="text-emerald-700 font-bold">{st.latestMetrics.correctCount}</span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-rose-700 font-bold">{st.latestMetrics.wrongCount}</span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-amber-700 font-semibold">{st.latestMetrics.unansweredCount}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        <span className="text-emerald-700 font-bold">{st.aggCorrect}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-rose-700 font-bold">{st.aggWrong}</span>
                        <span className="text-slate-500 ml-1">({st.aggCorrectRate}%)</span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                        {formatVNDateTime(new Date(st.latestTimestamp).toISOString(), language)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentRow({
                              studentKey: st.studentKey,
                              studentName: st.studentName,
                              studentCode: st.studentCode,
                              schoolName: st.schoolName,
                              className: st.className,
                              lessonTitle: activeLessonLocalized?.title || '',
                              attempts: [...st.chronologicalAttempts].reverse(),
                            });
                            setExpandedAttemptId(st.chronologicalAttempts[st.chronologicalAttempts.length - 1]?.id || null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Attempts' : 'Lịch sử làm'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-VIEW 3: FREQUENTLY MISSED QUESTIONS DIAGNOSTICS                */}
      {/* ================================================================== */}
      {subView === 'missed' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEn
                  ? 'Frequently Missed Questions Diagnostics'
                  : 'Thống Kê Câu Hỏi Học Sinh Thường Trả Lời Sai'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Ranks questions by real incorrect responses (unanswered excluded). Shows unique students wrong, total answered/right/wrong counts, error rate, and most frequent wrong answers.'
                  : 'Xếp hạng câu hỏi có nhiều học sinh trả lời sai thực tế nhất (không tính câu chưa trả lời vào câu sai). Thống kê rõ số HS sai, tổng lượt trả lời, lượt đúng/sai và đáp án thường chọn sai.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMissedDisplayMode('table')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    missedDisplayMode === 'table'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isEn ? 'Summary Table' : 'Bảng thống kê'}
                </button>
                <button
                  type="button"
                  onClick={() => setMissedDisplayMode('cards')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    missedDisplayMode === 'cards'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isEn ? 'Detailed Cards' : 'Thẻ chi tiết'}
                </button>
              </div>

              {selectedLessonId === 'all' && (
                <select
                  value={missedLessonFilter}
                  onChange={(e) => setMissedLessonFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-sm"
                >
                  <option value="all">
                    {isEn
                      ? `All Lessons in Filter (${lessonsInChapter.length} lessons)`
                      : `Tất cả bài học trong bộ lọc (${lessonsInChapter.length} bài)`}
                  </option>
                  {lessonsInChapter.map((l) => (
                    <option key={l.id} value={l.id}>
                      {getLocalizedLesson(l, language).title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {missedLoading ? (
            <div className="p-10 text-center space-y-2.5 border border-slate-200 rounded-xl bg-slate-50/50">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                {isEn
                  ? 'Loading frequently missed questions from server...'
                  : 'Đang tải dữ liệu thống kê câu hỏi hay sai từ máy chủ...'}
              </div>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Querying itemized student response logs by selected filters.'
                  : 'Đang truy vấn trực tiếp chi tiết câu trả lời theo bộ lọc hiện tại.'}
              </p>
            </div>
          ) : missedError ? (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold">
                    {isEn
                      ? 'Unable to Load Missed Questions Data'
                      : 'Lỗi tải dữ liệu thống kê câu hỏi hay sai'}
                  </div>
                  <p className="text-xs text-rose-800">{missedError}</p>
                </div>
              </div>
              <button
                onClick={() => setMissedRefreshKey((k) => k + 1)}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isEn ? 'Retry Loading' : 'Thử tải lại dữ liệu'}</span>
              </button>
            </div>
          ) : (
            <>
              {missedQuestionsData.summaryOnlyCount > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    {isEn ? (
                      <>
                        Note: <strong>{missedQuestionsData.summaryOnlyCount}</strong> historical record(s) in this scope only stored total scores and summary correct/wrong counts without per-question itemized logs (never fabricated).{' '}
                        <strong>{missedQuestionsData.attemptsWithDetailsCount}</strong> attempt(s) contain full per-question response logs.
                      </>
                    ) : (
                      <>
                        Lưu ý dữ liệu thực tế: Trong phạm vi này có{' '}
                        <strong>{missedQuestionsData.summaryOnlyCount}</strong> lượt làm lịch sử chỉ lưu điểm tổng hợp (hệ thống bảo toàn nguyên trạng, không tạo đáp án giả), và{' '}
                        <strong>{missedQuestionsData.attemptsWithDetailsCount}</strong> lượt làm có lưu chi tiết từng câu.
                      </>
                    )}
                  </div>
                </div>
              )}

              {missedQuestionsData.ranked.length === 0 ? (
                <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 rounded-xl">
                  <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-700">
                    {missedQuestionsData.attemptsWithDetailsCount === 0
                      ? isEn
                        ? 'No itemized per-question logs recorded yet for this selection.'
                        : 'Chưa có lượt làm có chi tiết từng câu hỏi được lưu trong phạm vi bài học này.'
                      : isEn
                      ? 'No incorrect answers recorded in itemized attempts!'
                      : 'Chưa ghi nhận câu trả lời sai nào trong các lượt làm có chi tiết câu hỏi.'}
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {isEn
                      ? 'Whenever a student completes a practice or exam session, every question response across all 4 formats is saved and aggregated here automatically.'
                      : 'Mỗi khi học sinh hoàn thành lượt luyện tập hoặc kiểm tra mới, toàn bộ chi tiết từng câu của cả 4 dạng sẽ được lưu và thống kê tự động tại đây.'}
                  </p>
                </div>
              ) : missedDisplayMode === 'table' ? (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <th className="py-3 px-3">{isEn ? '# / ID & Lesson' : 'STT / Mã CH & Bài'}</th>
                          <th className="py-3 px-3 min-w-[220px]">{isEn ? 'Question Content' : 'Nội dung câu hỏi'}</th>
                          <th className="py-3 px-3 min-w-[180px]">{isEn ? 'Correct Answer' : 'Đáp án đúng'}</th>
                          <th className="py-3 px-2.5 text-center">{isEn ? 'Students' : 'HS sai'}</th>
                          <th className="py-3 px-2.5 text-center">{isEn ? 'Answered' : 'Tổng TL'}</th>
                          <th className="py-3 px-2.5 text-center">{isEn ? 'Right' : 'Đúng'}</th>
                          <th className="py-3 px-2.5 text-center">{isEn ? 'Wrong' : 'Sai'}</th>
                          <th className="py-3 px-2.5 text-center">{isEn ? 'Unans.' : 'Bỏ trống'}</th>
                          <th className="py-3 px-2.5 text-center">{isEn ? 'Err %' : 'Tỉ lệ sai'}</th>
                          <th className="py-3 px-3 min-w-[200px]">
                            {isEn ? 'Students & Common Wrong Answers' : 'Thông tin HS sai & Đáp án hay chọn sai'}
                          </th>
                          <th className="py-3 px-3 text-right">{isEn ? 'Details' : 'Chi tiết'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {missedQuestionsData.ranked.map((item, idx) => {
                          const lessonObj = LESSONS.find((l) => l.id === item.lessonId);
                          const lessonTitle = lessonObj
                            ? getLocalizedLesson(lessonObj, language).title
                            : item.lessonId;
                          return (
                            <tr
                              key={`${item.questionId}-${idx}`}
                              className="hover:bg-slate-50/80 transition align-top"
                            >
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-mono font-bold text-slate-900">
                                  #{idx + 1} · {item.questionId}
                                </div>
                                <div className="text-[11px] font-semibold text-blue-700 mt-0.5 max-w-[170px] whitespace-normal">
                                  {lessonTitle}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {formatTypeLabel(item.type)}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-slate-900 font-medium leading-relaxed">
                                {item.questionText}
                              </td>
                              <td className="py-3 px-3">
                                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-900 leading-snug">
                                  {item.correctAnswerDisplay || '—'}
                                </div>
                              </td>
                              <td className="py-3 px-2.5 text-center font-mono tabular-nums font-black text-rose-700">
                                {item.uniqueStudentsCount}
                              </td>
                              <td className="py-3 px-2.5 text-center font-mono tabular-nums font-bold text-slate-800">
                                {item.timesAnswered}
                              </td>
                              <td className="py-3 px-2.5 text-center font-mono tabular-nums font-bold text-emerald-700">
                                {item.timesCorrect}
                              </td>
                              <td className="py-3 px-2.5 text-center font-mono tabular-nums font-black text-rose-700">
                                {item.timesWrong}
                              </td>
                              <td className="py-3 px-2.5 text-center font-mono tabular-nums font-semibold text-amber-700">
                                {item.timesUnanswered}
                              </td>
                              <td className="py-3 px-2.5 text-center font-mono tabular-nums font-black text-amber-800">
                                {item.wrongRate}%
                              </td>
                              <td className="py-3 px-3 space-y-1.5">
                                {item.studentSummaries.slice(0, 3).map((st: any) => (
                                  <div
                                    key={st.studentKey}
                                    className="text-[11px] text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                  >
                                    <span className="font-bold">{st.studentName}</span>{' '}
                                    <span className="text-slate-500 font-mono">({st.studentCode})</span>
                                    <div className="text-[10px] text-slate-500">
                                      {st.className} · {st.schoolName} ·{' '}
                                      <span className="text-rose-700 font-bold">
                                        {st.wrongCount} {isEn ? 'wrong' : 'lượt sai'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {item.studentSummaries.length > 3 && (
                                  <div className="text-[10px] text-blue-700 font-semibold">
                                    +{item.studentSummaries.length - 3}{' '}
                                    {isEn ? 'more students' : 'học sinh khác'}
                                  </div>
                                )}
                                {item.commonWrongAnswers.slice(0, 2).map((cw: any, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    className="text-[10px] text-rose-800 bg-rose-50/70 border border-rose-100 rounded px-2 py-0.5"
                                  >
                                    <span className="font-semibold">{isEn ? 'Wrong choice:' : 'Chọn sai:'}</span>{' '}
                                    {cw.answer} ({cw.count})
                                  </div>
                                ))}
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedMissedQuestion(item)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isEn ? 'View' : 'Chi tiết'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
            <div className="space-y-3">
              {missedQuestionsData.ranked.map((item, idx) => {
                const lessonObj = LESSONS.find((l) => l.id === item.lessonId);
                const lessonTitle = lessonObj ? getLocalizedLesson(lessonObj, language).title : item.lessonId;
                return (
                  <div
                    key={`${item.questionId}-${idx}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-rose-200 transition space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                      <div className="text-xs font-bold text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-900">#{idx + 1}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {item.questionId}
                        </span>
                        <span>·</span>
                        <span className="text-blue-700">{lessonTitle}</span>
                        <span>·</span>
                        <span>{formatTypeLabel(item.type)}</span>
                      </div>

                      <button
                        onClick={() => setSelectedMissedQuestion(item)}
                        className="self-start lg:self-auto px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          {isEn
                            ? 'Inspect Question & Students'
                            : 'Xem chi tiết câu hỏi & DS học sinh sai'}
                        </span>
                      </button>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {item.questionText}
                    </div>

                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-900">
                      <strong className="uppercase tracking-wider text-[10px] mr-1.5">
                        {isEn ? 'Correct Answer:' : 'Đáp án đúng:'}
                      </strong>
                      <span className="font-semibold">{item.correctAnswerDisplay || '—'}</span>
                    </div>

                    {/* Quantitative Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs">
                      <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                        <div className="text-[10px] font-bold uppercase text-rose-600">
                          {isEn ? 'Students Wrong' : 'Số HS trả lời sai'}
                        </div>
                        <div className="font-mono font-black text-rose-700 text-sm tabular-nums">
                          {item.uniqueStudentsCount} {isEn ? 'students' : 'HS'}
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          {isEn ? 'Total Answered' : 'Tổng lượt trả lời'}
                        </div>
                        <div className="font-mono font-black text-slate-800 text-sm tabular-nums">
                          {item.timesAnswered} {isEn ? 'attempts' : 'lượt'}
                        </div>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        <div className="text-[10px] font-bold uppercase text-emerald-700">
                          {isEn ? 'Correct' : 'Số lượt đúng'}
                        </div>
                        <div className="font-mono font-black text-emerald-700 text-sm tabular-nums">
                          {item.timesCorrect} {isEn ? 'attempts' : 'lượt'}
                        </div>
                      </div>
                      <div className="bg-rose-50/70 border border-rose-100 rounded-lg px-3 py-2">
                        <div className="text-[10px] font-bold uppercase text-rose-700">
                          {isEn ? 'Wrong' : 'Số lượt sai'}
                        </div>
                        <div className="font-mono font-black text-rose-700 text-sm tabular-nums">
                          {item.timesWrong} {isEn ? 'attempts' : 'lượt'}
                        </div>
                      </div>
                      <div className="bg-amber-50/70 border border-amber-200 rounded-lg px-3 py-2">
                        <div className="text-[10px] font-bold uppercase text-amber-700">
                          {isEn ? 'Unanswered' : 'Bỏ trống'}
                        </div>
                        <div className="font-mono font-black text-amber-800 text-sm tabular-nums">
                          {item.timesUnanswered} {isEn ? 'attempts' : 'lượt'}
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <div className="text-[10px] font-bold uppercase text-amber-700">
                          {isEn ? 'Error Rate' : 'Tỉ lệ sai'}
                        </div>
                        <div className="font-mono font-black text-amber-800 text-sm tabular-nums">
                          {item.wrongRate}%
                        </div>
                      </div>
                    </div>

                    {/* Common Wrong Answers */}
                    {item.commonWrongAnswers.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          {isEn ? 'Most Frequently Chosen Wrong Answers:' : 'Đáp án học sinh thường chọn sai:'}
                        </div>
                        <div className="space-y-1">
                          {item.commonWrongAnswers.slice(0, 3).map((cw: any, cIdx: number) => (
                            <div
                              key={cIdx}
                              className="text-xs flex items-start justify-between gap-2 text-slate-700"
                            >
                              <span className="font-medium text-rose-800 break-words">{cw.answer}</span>
                              <span className="font-mono font-bold text-slate-600 shrink-0 tabular-nums">
                                {cw.count} {isEn ? 'times' : 'lượt'} ({cw.pctOfWrong}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.studentSummaries.length > 0 && (
                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-700">
                          {isEn ? 'Students who missed:' : 'Thông tin học sinh trả lời sai:'}
                        </strong>{' '}
                        {item.studentSummaries
                          .map(
                            (st: any) =>
                              `${st.studentName} (${st.studentCode} · ${st.className} · ${st.schoolName} – ${st.wrongCount} ${isEn ? 'wrong' : 'lượt sai'})`
                          )
                          .join(' | ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* LEVEL 3: PER-ATTEMPT HISTORY & ITEMIZED RIGHT/WRONG MODAL          */}
      {/* ================================================================== */}
      {selectedStudentRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  {isEn ? 'Per-Attempt Practice History' : 'Lịch sử từng lần làm bài & Thống kê Đúng – Sai'}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {selectedStudentRow.studentName} ({selectedStudentRow.className})
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedStudentRow.studentCode} · {selectedStudentRow.schoolName} · {selectedStudentRow.lessonTitle}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentRow(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedStudentRow.attempts.map((att, idx) => {
                const m = getAttemptMetrics(att);
                const attemptNum = selectedStudentRow.attempts.length - idx;
                const isExpanded = expandedAttemptId === att.id;

                return (
                  <div key={att.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedAttemptId(isExpanded ? null : att.id)}
                      className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm text-slate-900 flex flex-wrap items-center gap-2">
                          <span>
                            {isEn ? `Attempt #${attemptNum}` : `Lần làm thứ ${attemptNum}`}
                          </span>
                          <span className="text-xs font-normal text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatVNDateTime(new Date(att.timestamp).toISOString(), language)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              apiService.isAttemptSyncedToCloud(att.id)
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : apiService.isAttemptPending(att.id)
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {apiService.isAttemptSyncedToCloud(att.id)
                              ? 'Firebase'
                              : apiService.isAttemptPending(att.id)
                              ? isEn
                                ? 'Pending on device'
                                : 'Đang chờ trên máy'
                              : isEn
                              ? 'Device cache'
                              : 'Lưu cục bộ'}
                          </span>
                        </div>
                        <div className="text-xs font-mono tabular-nums text-slate-600">
                          {isEn
                            ? `Total: ${m.totalQuestions} · Answered: ${m.answeredCount} · Right: ${m.correctCount} (${m.correctRate}%) · Wrong: ${m.wrongCount} (${m.wrongRate}%) · Unanswered: ${m.unansweredCount}`
                            : `Tổng: ${m.totalQuestions} câu · Đã trả lời: ${m.answeredCount} · Đúng: ${m.correctCount} (${m.correctRate}%) · Sai: ${m.wrongCount} (${m.wrongRate}%) · Chưa TL: ${m.unansweredCount}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-lg font-black font-mono tabular-nums text-blue-700">
                          {(Number(att.score) || 0).toFixed(1)}/10
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {isExpanded ? (isEn ? 'Hide' : 'Thu gọn') : (isEn ? 'Details' : 'Xem câu')}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-200 space-y-2.5">
                        {!m.hasDetailedLogs ? (
                          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            {isEn
                              ? 'This historical attempt record stored summary scores and totals (Right/Wrong counts) without itemized question-by-question logs.'
                              : 'Bản ghi lịch sử này chỉ lưu điểm và số câu Đúng/Sai tổng hợp, chưa lưu chi tiết từng câu hỏi riêng lẻ.'}
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {att.details.map((d, qIdx) => {
                              const statusLabel = d.isUnanswered
                                ? isEn ? 'Unanswered' : 'Chưa trả lời'
                                : d.isFullyCorrect
                                ? isEn ? 'Correct' : 'Đúng'
                                : d.isPartiallyCorrect
                                ? isEn ? 'Partial (Counted Wrong)' : 'Đúng 1 phần (tính sai)'
                                : isEn ? 'Incorrect' : 'Sai';

                              const statusColor = d.isUnanswered
                                ? 'text-amber-700'
                                : d.isFullyCorrect
                                ? 'text-emerald-700'
                                : d.isPartiallyCorrect
                                ? 'text-blue-700'
                                : 'text-rose-700';

                              const rawQ = questions.find((q) => q.id === d.questionId);
                              const locQ = rawQ ? localizeQuestion(rawQ, language) : null;
                              const displayQText =
                                locQ
                                  ? locQ.type === 'true_false_context'
                                    ? `${locQ.contextTitle}: ${locQ.contextText}`
                                    : locQ.type === 'matching'
                                    ? locQ.title
                                    : locQ.question
                                  : d.questionText;
                              const displayStandard = locQ
                                ? locQ.type === 'multiple_choice'
                                  ? `${['A', 'B', 'C', 'D'][locQ.correctIndex]}. ${locQ.options[locQ.correctIndex] || ''}`
                                  : locQ.type === 'true_false_context'
                                  ? locQ.statements
                                      .map((s) => `${s.id.toUpperCase()}: ${s.isCorrect ? (isEn ? 'True' : 'Đúng') : (isEn ? 'False' : 'Sai')}`)
                                      .join(' | ')
                                  : locQ.type === 'short_answer'
                                  ? `${locQ.standardAnswer}${locQ.unit ? ' ' + locQ.unit : ''}`
                                  : locQ.pairs.map((p) => `${p.left} ➔ ${p.right}`).join(' | ')
                                : localizeStoredAnswerText(d.correctAnswerText, language);
                              const displayUser = localizeStoredAnswerText(d.userAnswerText, language);

                              return (
                                <div
                                  key={`${d.questionId}-${qIdx}`}
                                  className="p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-800">
                                      {isEn ? `Q${qIdx + 1}` : `Câu ${qIdx + 1}`} · {formatTypeLabel(d.type)}
                                    </span>
                                    <span className={`font-bold font-mono ${statusColor}`}>
                                      {statusLabel} ({d.earnedScore}/{d.maxScore})
                                    </span>
                                  </div>
                                  {displayQText && (
                                    <div className="text-slate-800 font-medium">{displayQText}</div>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                                    <div className="text-slate-600">
                                      <strong>{isEn ? 'Student answer:' : 'HS chọn:'}</strong>{' '}
                                      {displayUser || '—'}
                                    </div>
                                    <div className="text-slate-600">
                                      <strong>{isEn ? 'Standard answer:' : 'Đáp án đúng:'}</strong>{' '}
                                      {displayStandard || '—'}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: MISSED QUESTION DETAILS & STUDENTS WHO ANSWERED WRONG       */}
      {/* ================================================================== */}
      {selectedMissedQuestion && (() => {
        const mq = selectedMissedQuestion;
        const lessonObj = LESSONS.find((l) => l.id === mq.lessonId);
        const lessonTitle = lessonObj ? getLocalizedLesson(lessonObj, language).title : mq.lessonId;
        const locQ: Question | null = mq.rawQuestion ? localizeQuestion(mq.rawQuestion, language) : null;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                    {lessonTitle} · {formatTypeLabel(mq.type)} · {mq.questionId}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1 leading-snug">
                    {mq.questionText}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMissedQuestion(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Full Question Details by Format */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                {locQ?.type === 'multiple_choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {locQ.options.map((opt, oIdx) => {
                      const isCorr = oIdx === locQ.correctIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border ${
                            isCorr
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-mono mr-1.5">{['A', 'B', 'C', 'D'][oIdx]}.</span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {locQ?.type === 'true_false_context' && (
                  <div className="space-y-2">
                    {locQ.contextDataGrid && (
                      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold">
                              {locQ.contextDataGrid.headers.map((h, i) => (
                                <th key={i} className="px-2.5 py-1.5 border-b border-slate-200">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {locQ.contextDataGrid.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-100 last:border-b-0">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-2.5 py-1.5 font-mono">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {locQ.statements.map((st) => (
                        <div key={st.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start justify-between gap-2">
                          <div>
                            <strong className="font-mono uppercase mr-1.5">{st.id})</strong>
                            <span className="text-slate-800">{st.text}</span>
                          </div>
                          <span
                            className={`font-bold shrink-0 ${
                              st.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {st.isCorrect ? (isEn ? 'True' : 'Đúng') : (isEn ? 'False' : 'Sai')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {locQ?.type === 'short_answer' && (
                  <div className="space-y-1.5">
                    <div className="text-emerald-800 font-bold">
                      {isEn ? 'Standard Answer:' : 'Đáp án đúng:'} {locQ.standardAnswer} {locQ.unit}
                    </div>
                    {locQ.formula && (
                      <div className="text-slate-700">
                        <strong>{isEn ? 'Formula:' : 'Công thức:'}</strong> {locQ.formula}
                      </div>
                    )}
                  </div>
                )}

                {locQ?.type === 'matching' && (
                  <div className="space-y-1.5">
                    {locQ.pairs.map((p) => (
                      <div key={p.id} className="bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        <strong>{p.left}</strong> ➔ <span className="text-emerald-700 font-semibold">{p.right}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!locQ && (
                  <div className="text-emerald-800 font-bold">
                    {isEn ? 'Standard Answer:' : 'Đáp án đúng:'} {mq.correctAnswerDisplay}
                  </div>
                )}

                {locQ && 'explanation' in locQ && locQ.explanation && (
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <strong>{isEn ? 'Explanation:' : 'Giải thích:'}</strong> {locQ.explanation}
                  </div>
                )}
              </div>

              {/* Quantitative Metrics & Common Wrong Answers */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-rose-700">{isEn ? 'Students Wrong' : 'Số HS sai'}</div>
                  <div className="font-mono font-black text-rose-800 text-base tabular-nums">{mq.uniqueStudentsCount}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-500">{isEn ? 'Total Answered' : 'Tổng lượt TL'}</div>
                  <div className="font-mono font-black text-slate-900 text-base tabular-nums">{mq.timesAnswered}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-emerald-700">{isEn ? 'Correct' : 'Số lượt đúng'}</div>
                  <div className="font-mono font-black text-emerald-800 text-base tabular-nums">{mq.timesCorrect}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-rose-700">{isEn ? 'Wrong' : 'Số lượt sai'}</div>
                  <div className="font-mono font-black text-rose-800 text-base tabular-nums">{mq.timesWrong}</div>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-700">{isEn ? 'Unanswered' : 'Bỏ trống'}</div>
                  <div className="font-mono font-black text-amber-800 text-base tabular-nums">{mq.timesUnanswered || 0}</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-700">{isEn ? 'Error Rate' : 'Tỉ lệ sai'}</div>
                  <div className="font-mono font-black text-amber-800 text-base tabular-nums">{mq.wrongRate}%</div>
                </div>
              </div>

              {mq.commonWrongAnswers.length > 0 && (
                <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    {isEn ? 'Common Wrong Answers Breakdown' : 'Thống kê đáp án học sinh thường chọn sai'}
                  </div>
                  <div className="space-y-1.5">
                    {mq.commonWrongAnswers.map((cw: any, cIdx: number) => (
                      <div key={cIdx} className="flex items-center justify-between gap-3 text-xs bg-white px-3 py-2 rounded-lg border border-rose-100">
                        <span className="font-semibold text-slate-800">{cw.answer}</span>
                        <span className="font-mono font-bold text-rose-700 shrink-0 tabular-nums">
                          {cw.count} {isEn ? 'times' : 'lượt'} ({cw.pctOfWrong}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Students Who Missed Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isEn
                    ? `Students Who Answered Incorrectly (${mq.uniqueStudentsCount} student(s) · ${mq.wrongAttempts.length} wrong attempt(s))`
                    : `Danh sách học sinh trả lời sai (${mq.uniqueStudentsCount} học sinh · ${mq.wrongAttempts.length} lượt sai)`}
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3">{isEn ? 'No.' : 'STT'}</th>
                        <th className="py-2.5 px-3">{isEn ? 'Student' : 'Học sinh'}</th>
                        <th className="py-2.5 px-3">{isEn ? 'Class / School' : 'Lớp / Trường'}</th>
                        <th className="py-2.5 px-3">{isEn ? 'Student Answer' : 'Đáp án HS chọn/nhập'}</th>
                        <th className="py-2.5 px-3 text-center">{isEn ? 'Attempts' : 'Số lần trả lời'}</th>
                        <th className="py-2.5 px-3 text-center">{isEn ? 'Score' : 'Điểm'}</th>
                        <th className="py-2.5 px-3">{isEn ? 'Submitted At' : 'Thời gian'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mq.wrongAttempts.map((wa: any, wIdx: number) => (
                        <tr key={`${wa.attemptId}-${wIdx}`} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{wIdx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{wa.studentName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{wa.studentCode}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{wa.className}</div>
                            <div className="text-[11px] text-slate-500">{wa.schoolName}</div>
                          </td>
                          <td className="py-2.5 px-3 text-rose-800 font-medium max-w-xs break-words">
                            {wa.studentAnswerDisplay}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="font-mono font-bold text-slate-800 tabular-nums">
                              {wa.studentTotalAnswered || 1} {isEn ? 'times' : 'lần'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                              {isEn
                                ? `${wa.studentTotalWrong || 1} wrong · ${wa.studentTotalCorrect || 0} right`
                                : `${wa.studentTotalWrong || 1} sai · ${wa.studentTotalCorrect || 0} đúng`}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 tabular-nums">
                            <div>{wa.earnedScore}/{wa.maxScore}</div>
                            {wa.earnedScore > 0 && wa.earnedScore < wa.maxScore && (
                              <div className="text-[10px] font-sans font-semibold text-amber-700">
                                {isEn ? 'Partial (counted wrong)' : 'Đúng 1 phần (tính sai)'}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                            {formatVNDateTime(new Date(wa.timestamp).toISOString(), language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
