import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { LessonLibrary } from './components/LessonLibrary';
import { PracticeHub } from './components/PracticeHub';
import { ExamHub } from './components/ExamHub';
import { StudentStats } from './components/StudentStats';
const TeacherDashboard = React.lazy(() =>
  import('./components/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard }))
);
import { QuizRunner } from './components/QuizRunner';
import { QuizResultView } from './components/QuizResultView';
import { Footer } from './components/Footer';
import { ExamRecord, Question, UserProfile } from './types';
import { StorageService } from './services/storage';
import { apiService } from './services/api';
import { StudentWelcomeScreen } from './components/StudentWelcomeScreen';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { TeacherAdminLoginPage } from './components/TeacherAdminLoginPage';
import { DiscoveryRunner } from './components/DiscoveryRunner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ArrowLeft, KeyRound, Lock, ShieldAlert } from 'lucide-react';
import { LanguageProvider, useLanguage, LanguageSwitcher } from './contexts/LanguageContext';
import {
  ensureAnonymousStudentSession,
  isCloudSyncEligibleUser,
  isTeacherFirebaseUser,
  subscribeCloudData,
  subscribeFirebaseAuth,
} from './services/firebase';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    StorageService.getCurrentUser()
  );
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [questions, setQuestions] = useState<Question[]>(() =>
    StorageService.getQuestions()
  );
  const [isTeacherVerified, setIsTeacherVerified] = useState<boolean>(false);
  const [firebaseAuthReady, setFirebaseAuthReady] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const p = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    return (
      p === '/admin' ||
      p.startsWith('/admin/') ||
      params.get('portal') === 'teacher' ||
      params.get('admin') === 'login'
    );
  });

  // Active server-side token validation for teacher role
  React.useEffect(() => {
    let isCancelled = false;
    if (currentUser?.role === 'teacher') {
      const token = apiService.getTeacherToken();
      if (!token) {
        setIsTeacherVerified(false);
        setCurrentUser(null);
        return;
      }
      apiService.verifyTeacherSession().then((valid) => {
        if (!isCancelled) {
          if (valid) {
            setIsTeacherVerified(true);
          } else {
            setIsTeacherVerified(false);
            apiService.setTeacherToken(null);
            StorageService.clearCurrentUser();
            setCurrentUser(null);
          }
        }
      });
    } else {
      setIsTeacherVerified(false);
    }
    return () => {
      isCancelled = true;
    };
  }, [currentUser?.role]);

  // Firebase Auth & Real-time Firestore Cloud Sync Listener
  React.useEffect(() => {
    let unsubCloud: (() => void) | null = null;
    const unsubAuth = subscribeFirebaseAuth((fbUser) => {
      setFirebaseAuthReady(true);

      if (unsubCloud) {
        unsubCloud();
        unsubCloud = null;
      }

      if (isCloudSyncEligibleUser(fbUser)) {
        apiService.setCloudAuthContext(fbUser);

        // Automatically restore verified teacher session when returning to /admin
        if (isTeacherFirebaseUser(fbUser)) {
          const p = window.location.pathname;
          const params = new URLSearchParams(window.location.search);
          const onAdminPath =
            p === '/admin' ||
            p.startsWith('/admin/') ||
            params.get('portal') === 'teacher' ||
            params.get('admin') === 'login';
          const stored = StorageService.getCurrentUser();
          if (onAdminPath || stored?.role === 'teacher') {
            const restored = apiService.restoreTeacherSessionFromFirebase(fbUser);
            if (restored) {
              StorageService.setTeacherSession(restored.token, restored.user);
              setCurrentUser(restored.user);
              setIsTeacherVerified(true);
            }
          }
          apiService.startTeacherAutoSync();
        } else {
          apiService.stopTeacherAutoSync();
        }

        unsubCloud =
          isTeacherFirebaseUser(fbUser) && apiService.isQuotaCooldownActive()
            ? () => {}
            : subscribeCloudData(
                fbUser,
                (payload) => {
                  apiService.setCloudSyncError(null, payload.collection);
                  apiService.setCloudSyncData(payload);
                },
                (err, collectionName) => {
                  apiService.setCloudSyncError(err.message, collectionName);
                  console.warn('Firestore live listener notice:', collectionName, err.message);
                },
                isTeacherFirebaseUser(fbUser) ? apiService.getTeacherSyncWatermarks() : undefined
              );
        // Automatically recover device history & flush any queued offline student attempts & learning activities
        const activeOnAuth = StorageService.getCurrentUser();
        if (activeOnAuth?.role === 'student') {
          apiService.syncStudentDeviceHistoryToServer(activeOnAuth).catch(() => {});
        } else {
          apiService.flushPendingAttempts(activeOnAuth || undefined).catch(() => {});
          apiService.flushPendingActivities().catch(() => {});
        }
      } else {
        apiService.stopTeacherAutoSync();
        apiService.setCloudAuthContext(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubCloud) unsubCloud();
      apiService.stopTeacherAutoSync();
    };
  }, []);

  // Automatically sync active student's profile, pending queue, and prior local history to Firebase Firestore
  // and silently record 1 learning visit per browser session for private teacher analytics
  React.useEffect(() => {
    let cancelled = false;
    const triggerStudentSync = async (user: UserProfile) => {
      if (!user || user.role !== 'student') return;
      try {
        await ensureAnonymousStudentSession().catch(() => null);
        if (cancelled) return;
        await apiService.syncStudentDeviceHistoryToServer(user).catch(() => {});
        if (cancelled) return;
        await apiService.recordLearningActivity({ type: 'visit' }, user).catch(() => false);
      } catch {
        // non-blocking
      }
    };

    if (currentUser?.role === 'student') {
      triggerStudentSync(currentUser);
      apiService.startStudentAutoSync(() => StorageService.getCurrentUser());
    } else {
      apiService.stopStudentAutoSync();
    }

    const handleResumeSync = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      if (apiService.isQuotaCooldownActive()) return;
      const activeUser = StorageService.getCurrentUser();
      if (activeUser?.role === 'student') {
        if (apiService.hasPendingStudentSyncData()) {
          apiService.syncStudentDeviceHistoryToServer(activeUser).catch(() => {});
        }
        apiService.recordLearningActivity({ type: 'visit' }, activeUser).catch(() => false);
      } else {
        if (apiService.hasPendingStudentSyncData()) {
          apiService.flushPendingAttempts(activeUser || undefined).catch(() => {});
          apiService.flushPendingActivities().catch(() => {});
        }
      }
    };

    window.addEventListener('online', handleResumeSync);
    document.addEventListener('visibilitychange', handleResumeSync);
    return () => {
      cancelled = true;
      window.removeEventListener('online', handleResumeSync);
      document.removeEventListener('visibilitychange', handleResumeSync);
      apiService.stopStudentAutoSync();
    };
  }, [currentUser?.id, currentUser?.role]);

  // Discreet teacher portal trigger via URL path /admin, query param (?portal=teacher / ?admin=login) or secret shortcut (Alt+Shift+T / Ctrl+Shift+A)
  React.useEffect(() => {
    const checkRoute = () => {
      const p = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const isAdmin =
        p === '/admin' ||
        p.startsWith('/admin/') ||
        params.get('portal') === 'teacher' ||
        params.get('admin') === 'login';
      setIsAdminRoute(isAdmin);
      if (isAdmin && !(currentUser?.role === 'teacher' && isTeacherVerified)) {
        // on /admin route
      }
    };

    window.addEventListener('popstate', checkRoute);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.shiftKey && (e.key === 'T' || e.key === 't')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a'))
      ) {
        e.preventDefault();
        setShowAdminLoginModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser, isTeacherVerified]);

  // Active quiz session state
  const [activeQuiz, setActiveQuiz] = useState<{
    questions: Question[];
    title: string;
    mode: 'practice_topic' | 'practice_type' | 'practice_comprehensive' | 'official_test';
    lessonId?: string;
    timeLimitMinutes?: number;
    instantFeedback?: boolean;
  } | null>(null);

  // Completed quiz result to display
  const [completedRecord, setCompletedRecord] = useState<{
    record: ExamRecord;
    questions: Question[];
  } | null>(null);

  // Active state for "EM CÓ BIẾT? – KHÁM PHÁ ĐỊA LÍ" Warmup Discovery activity
  const [isDiscoveryActive, setIsDiscoveryActive] = useState<boolean>(false);

  // Canonicalize quiz questions back to raw stored/curriculum objects so language toggling mid-quiz or on results always stays live
  const toCanonicalQuestions = (qs: Question[]) =>
    qs.map((sq) => questions.find((rq) => rq.id === sq.id) || sq);

  // Handlers for starting quizzes
  const handleStartPractice = (
    selectedQuestions: Question[],
    title: string,
    mode: any
  ) => {
    setCompletedRecord(null);
    const canonical = toCanonicalQuestions(selectedQuestions);
    const distinctLessons = Array.from(new Set(canonical.map((q) => q.lessonId).filter(Boolean)));
    setActiveQuiz({
      questions: canonical,
      title,
      mode,
      lessonId: distinctLessons.length === 1 ? distinctLessons[0] : undefined,
    });
  };

  const handleStartExam = (
    selectedQuestions: Question[],
    title: string,
    timeLimitMinutes: number,
    mode: 'official_test'
  ) => {
    setCompletedRecord(null);
    const canonical = toCanonicalQuestions(selectedQuestions);
    const distinctLessons = Array.from(new Set(canonical.map((q) => q.lessonId).filter(Boolean)));
    setActiveQuiz({
      questions: canonical,
      title,
      mode,
      lessonId: distinctLessons.length === 1 ? distinctLessons[0] : undefined,
      timeLimitMinutes,
    });
  };

  const handleLessonPractice = (lessonQuestions: Question[], lessonTitle: string) => {
    setCompletedRecord(null);
    const canonical = toCanonicalQuestions(lessonQuestions);
    const distinctLessons = Array.from(new Set(canonical.map((q) => q.lessonId).filter(Boolean)));
    setActiveQuiz({
      questions: canonical,
      title: lessonTitle,
      mode: 'practice_topic',
      lessonId: distinctLessons.length === 1 ? distinctLessons[0] : undefined,
    });
  };

  const handleLessonCustomPractice = (
    lessonQuestions: Question[],
    lessonTitle: string,
    instantFeedback: boolean
  ) => {
    setCompletedRecord(null);
    const canonical = toCanonicalQuestions(lessonQuestions);
    const distinctLessons = Array.from(new Set(canonical.map((q) => q.lessonId).filter(Boolean)));
    setActiveQuiz({
      questions: canonical,
      title: lessonTitle,
      mode: 'practice_type',
      lessonId: distinctLessons.length === 1 ? distinctLessons[0] : undefined,
      instantFeedback,
    });
  };

  const handleLessonExam = (
    lessonQuestions: Question[],
    lessonTitle: string,
    timeLimitMinutes: number
  ) => {
    setCompletedRecord(null);
    const canonical = toCanonicalQuestions(lessonQuestions);
    const distinctLessons = Array.from(new Set(canonical.map((q) => q.lessonId).filter(Boolean)));
    setActiveQuiz({
      questions: canonical,
      title: lessonTitle,
      mode: 'official_test',
      lessonId: distinctLessons.length === 1 ? distinctLessons[0] : undefined,
      timeLimitMinutes,
    });
  };

  const { language } = useLanguage();

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.title =
        language === 'en'
          ? 'GEOGRAPHY 10 – KNOWLEDGE CONQUEST | Connecting Knowledge'
          : 'ĐỊA LÍ 10 – CHINH PHỤC TRI THỨC | Kết nối tri thức';
    }
  }, [language]);

  const handleQuizComplete = (record: ExamRecord) => {
    record.language = language;
    if (activeQuiz) {
      setCompletedRecord({
        record,
        questions: activeQuiz.questions,
      });
    }
    setActiveQuiz(null);
  };

  const handleRetryCurrentQuiz = () => {
    if (completedRecord) {
      setActiveQuiz({
        questions: completedRecord.questions,
        title: completedRecord.record.title,
        mode: completedRecord.record.mode,
        lessonId: completedRecord.record.lessonId,
        timeLimitMinutes: completedRecord.record.timeLimitMinutes,
      });
      setCompletedRecord(null);
    }
  };

  // If user is not an authenticated teacher, never allow currentTab or URL to access 'teacher_admin'
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get('tab') || params.get('page');
    const isTeacher = currentUser && currentUser.role === 'teacher' && isTeacherVerified;

    // Support unified access for "Em có biết – Khám phá Địa lí" via ?tab=discovery / ?tab=kham-pha
    if (
      requestedTab === 'discovery' ||
      requestedTab === 'kham-pha' ||
      requestedTab === 'em-co-biet'
    ) {
      setIsDiscoveryActive(true);
    }

    if (
      currentTab === 'teacher_admin' ||
      requestedTab === 'teacher_admin' ||
      requestedTab === 'admin'
    ) {
      if (!isTeacher) {
        setCurrentTab('home');
        if (requestedTab) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('tab');
          cleanUrl.searchParams.delete('page');
          window.history.replaceState({}, '', cleanUrl.toString());
        }
      }
    }
  }, [currentTab, currentUser, isTeacherVerified]);

  // Dedicated Teacher Admin Route (/admin or ?portal=teacher)
  if (isAdminRoute) {
    if (currentUser?.role === 'teacher' && isTeacherVerified) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
          <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-sm border border-white/20">
                {language === 'en' ? 'GEO' : 'ĐL'}
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">
                  {language === 'en'
                    ? 'TEACHER MANAGEMENT – HOA BINH HIGH SCHOOL'
                    : 'QUẢN TRỊ GIÁO VIÊN – THPT HÒA BÌNH'}
                </span>
                <span className="text-[11px] text-emerald-300 font-medium">
                  {language === 'en'
                    ? 'Teacher Bui Thi Hong Hanh • Geography 10'
                    : 'Cô Bùi Thị Hồng Hạnh • Môn Địa lí 10'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <button
                onClick={() => {
                  window.history.pushState(null, '', '/');
                  setIsAdminRoute(false);
                  setCurrentTab('home');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {language === 'en' ? 'Student View' : 'Xem giao diện học sinh'}
                </span>
                <span className="sm:hidden">
                  {language === 'en' ? 'Student' : 'Học sinh'}
                </span>
              </button>
              <button
                onClick={() => {
                  apiService.teacherLogout().catch(() => {});
                  StorageService.clearCurrentUser();
                  setCurrentUser(null);
                  setIsTeacherVerified(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              >
                {language === 'en' ? 'Sign out' : 'Đăng xuất'}
              </button>
            </div>
          </header>
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
            <React.Suspense
              fallback={
                <div className="py-16 text-center text-sm font-semibold text-slate-500">
                  {language === 'en' ? 'Loading Teacher Dashboard...' : 'Đang tải trang Quản trị Giáo viên...'}
                </div>
              }
            >
              <TeacherDashboard
                questions={questions}
                onQuestionsChange={(newQuestions) => setQuestions(newQuestions)}
                onRefreshData={() => {
                  setQuestions(StorageService.getQuestions());
                }}
                currentUser={currentUser}
              />
            </React.Suspense>
          </main>
          <Footer />
        </div>
      );
    }

    if (!firebaseAuthReady) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black">
              ĐL
            </div>
            <p className="text-sm font-bold">
              {language === 'en'
                ? 'Restoring Teacher Admin session...'
                : 'Đang khôi phục phiên Quản trị Giáo viên...'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <TeacherAdminLoginPage
        onLoginSuccess={(teacher) => {
          setCurrentUser(teacher);
          setIsTeacherVerified(true);
        }}
        onExitToStudent={() => {
          window.history.pushState(null, '', '/');
          setIsAdminRoute(false);
          setCurrentTab('home');
        }}
      />
    );
  }

  // 1. Mandatory gating: If no valid student profile is set, display StudentWelcomeScreen only
  if (!currentUser) {
    return (
      <>
        <StudentWelcomeScreen
          onStart={(user) => {
            setCurrentUser(user);
            setCurrentTab('home');
          }}
        />
        {/* Secure Teacher Authentication Modal (triggered solely by discrete teacher shortcut/url) */}
        {showAdminLoginModal && (
          <TeacherLoginModal
            isOpen={showAdminLoginModal}
            onClose={() => setShowAdminLoginModal(false)}
            onSuccess={(teacher) => {
              setCurrentUser(teacher);
              setIsTeacherVerified(true);
              setShowAdminLoginModal(false);
              setCurrentTab('teacher_admin');
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveQuiz(null);
          setCompletedRecord(null);
          setIsDiscoveryActive(false);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        isTeacherVerified={isTeacherVerified}
        onUserChange={(usr) => setCurrentUser(usr)}
        onResetUser={() => {
          StorageService.clearCurrentUser();
          setIsTeacherVerified(false);
          setActiveQuiz(null);
          setCompletedRecord(null);
          setIsDiscoveryActive(false);
          setCurrentUser(null);
        }}
      />

      {/* Main App Content */}
      <main className="flex-1 py-4">
        {/* If Active Quiz is running, display Quiz Runner */}
        {activeQuiz ? (
          <QuizRunner
            questions={activeQuiz.questions}
            title={activeQuiz.title}
            mode={activeQuiz.mode}
            lessonId={activeQuiz.lessonId}
            timeLimitMinutes={activeQuiz.timeLimitMinutes}
            instantFeedback={activeQuiz.instantFeedback}
            currentUser={currentUser}
            onComplete={handleQuizComplete}
            onExit={() => setActiveQuiz(null)}
          />
        ) : completedRecord ? (
          /* If Quiz is finished, display Results View */
          <QuizResultView
            record={completedRecord.record}
            questions={completedRecord.questions}
            onRetry={handleRetryCurrentQuiz}
            onHome={() => {
              setCompletedRecord(null);
              setCurrentTab('home');
            }}
          />
        ) : isDiscoveryActive ? (
          /* EM CÓ BIẾT? – KHÁM PHÁ ĐỊA LÍ (Warmup Discovery Experience) */
          <DiscoveryRunner
            currentUser={currentUser}
            onExit={() => {
              setIsDiscoveryActive(false);
              const cleanUrl = new URL(window.location.href);
              if (
                cleanUrl.searchParams.has('tab') &&
                ['discovery', 'kham-pha', 'em-co-biet'].includes(
                  cleanUrl.searchParams.get('tab') || ''
                )
              ) {
                cleanUrl.searchParams.delete('tab');
                window.history.replaceState({}, '', cleanUrl.toString());
              }
            }}
            onNavigateToLessons={() => {
              setIsDiscoveryActive(false);
              setCurrentTab('lessons');
              const cleanUrl = new URL(window.location.href);
              if (
                cleanUrl.searchParams.has('tab') &&
                ['discovery', 'kham-pha', 'em-co-biet'].includes(
                  cleanUrl.searchParams.get('tab') || ''
                )
              ) {
                cleanUrl.searchParams.delete('tab');
                window.history.replaceState({}, '', cleanUrl.toString());
              }
            }}
          />
        ) : (
          /* Regular Tabs */
          <>
            {currentTab === 'home' && (
              <HomeScreen
                currentUser={currentUser}
                isTeacherVerified={isTeacherVerified}
                onNavigate={(tab) => {
                  setIsDiscoveryActive(false);
                  setCurrentTab(tab);
                }}
                onStartQuickPractice={() => {
                  setCompletedRecord(null);
                  setActiveQuiz(null);
                  setIsDiscoveryActive(true);
                }}
              />
            )}

            {currentTab === 'lessons' && (
              <LessonLibrary
                questions={questions}
                currentUser={currentUser}
                onStartLessonPractice={handleLessonPractice}
                onStartCustomPractice={handleLessonCustomPractice}
                onStartExam={handleLessonExam}
              />
            )}

            {currentTab === 'practice' && (
              <PracticeHub
                questions={questions}
                onStartQuiz={handleStartPractice}
              />
            )}

            {currentTab === 'exam' && (
              <ExamHub
                questions={questions}
                currentUser={currentUser}
                onStartExam={handleStartExam}
              />
            )}

            {currentTab === 'stats' && (
              <StudentStats
                currentUser={currentUser}
                onGoPractice={() => setCurrentTab('practice')}
              />
            )}

            {currentTab === 'teacher_admin' && (
              currentUser.role === 'teacher' && isTeacherVerified ? (
                <React.Suspense
                  fallback={
                    <div className="py-16 text-center text-sm font-semibold text-slate-500">
                      {language === 'en' ? 'Loading Teacher Dashboard...' : 'Đang tải trang Quản trị Giáo viên...'}
                    </div>
                  }
                >
                  <TeacherDashboard
                    questions={questions}
                    onQuestionsChange={(newQuestions) => setQuestions(newQuestions)}
                    onRefreshData={() => {
                      setQuestions(StorageService.getQuestions());
                    }}
                    currentUser={currentUser}
                  />
                </React.Suspense>
              ) : (
                <div className="max-w-md mx-auto my-12 px-4 text-center">
                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                      <Lock className="w-7 h-7" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {language === 'en' ? 'Page Not Found' : 'Không tìm thấy nội dung'}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {language === 'en'
                        ? 'The page you are trying to access does not exist or you do not have permission to view this content.'
                        : 'Trang bạn đang truy cập không tồn tại hoặc bạn không có quyền xem nội dung này.'}
                    </p>
                    <button
                      onClick={() => setCurrentTab('home')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{language === 'en' ? 'Back to Home' : 'Quay lại Trang chủ'}</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer with Mandatory School & Teacher Recognition */}
      <Footer />

      {/* Admin Login Modal for direct access attempts */}
      {showAdminLoginModal && (
        <TeacherLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={(teacher) => {
            setCurrentUser(teacher);
            setIsTeacherVerified(true);
            setShowAdminLoginModal(false);
            setCurrentTab('teacher_admin');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
