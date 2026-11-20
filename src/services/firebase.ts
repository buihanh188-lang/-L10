import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { ExamRecord, QuestionGradingDetail, QuestionType, UserProfile } from '../types';
import {
  normalizeClassName,
  normalizeSchoolKey,
  normalizeSchoolName,
  normalizeStudentName,
} from '../utils/normalize';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const TEACHER_ADMIN_EMAIL = 'buihanh188@gmail.com';
const OFFICIAL_SCHOOL_KEY = normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH');

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection validation per Firebase integration guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
if (typeof window !== 'undefined') {
  testConnection();
}

export function isVerifiedFirebaseUser(user: FirebaseUser | null | undefined): user is FirebaseUser {
  return Boolean(user && user.uid && user.emailVerified);
}

export function isCloudSyncEligibleUser(
  user: FirebaseUser | null | undefined
): user is FirebaseUser {
  return Boolean(user && user.uid && (user.emailVerified || user.isAnonymous));
}

export function isTeacherFirebaseUser(user: FirebaseUser | null | undefined): boolean {
  return Boolean(
    isVerifiedFirebaseUser(user) &&
      user.email &&
      user.email.toLowerCase() === TEACHER_ADMIN_EMAIL
  );
}

let pendingAnonSignIn: Promise<{
  user: FirebaseUser | null;
  needsConsoleEnable?: boolean;
  errorCode?: string;
}> | null = null;

export async function ensureAnonymousStudentSession(): Promise<{
  user: FirebaseUser | null;
  needsConsoleEnable?: boolean;
  errorCode?: string;
}> {
  try {
    await auth.authStateReady();
  } catch {
    // proceed
  }

  if (isCloudSyncEligibleUser(auth.currentUser)) {
    return { user: auth.currentUser };
  }

  if (pendingAnonSignIn) {
    return pendingAnonSignIn;
  }

  pendingAnonSignIn = (async () => {
    try {
      const cred = await signInAnonymously(auth);
      return { user: cred.user };
    } catch (err: any) {
      const code = String(err?.code || err?.message || '');
      const needsConsoleEnable =
        code.includes('admin-restricted-operation') ||
        code.includes('operation-not-allowed');
      console.warn('Silent student Firebase session notice:', code);
      return { user: null, needsConsoleEnable, errorCode: code };
    } finally {
      pendingAnonSignIn = null;
    }
  })();

  return pendingAnonSignIn;
}

export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase signOut warning:', e);
  }
}

export function subscribeFirebaseAuth(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// =========================================================================
// DEFENSIVE PAYLOAD SANITIZATION (STRICT BLUEPRINT SYNCHRONICITY)
// =========================================================================
export function sanitizeFirestoreId(raw: string, fallbackPrefix = 'id'): string {
  const cleaned = String(raw || '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  if (cleaned.length >= 1) return cleaned;
  return `${fallbackPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const s = String(val ?? fallback).trim();
  if (!s && fallback) return fallback.slice(0, maxLen);
  return s.slice(0, maxLen);
}

function clampNumber(val: unknown, min: number, max: number, fallback = 0): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function compactDetailItem(d: QuestionGradingDetail): Record<string, unknown> {
  return {
    questionId: clampString(d.questionId, 80, 'q'),
    lessonId: clampString(d.lessonId || '', 64),
    chapterId: clampString(d.chapterId || '', 64),
    type:
      d.type === 'multiple_choice' ||
      d.type === 'true_false_context' ||
      d.type === 'short_answer' ||
      d.type === 'matching'
        ? d.type
        : 'multiple_choice',
    status:
      d.status === 'correct' || d.status === 'wrong' || d.status === 'unanswered'
        ? d.status
        : d.isUnanswered
        ? 'unanswered'
        : d.isFullyCorrect
        ? 'correct'
        : 'wrong',
    maxScore: clampNumber(d.maxScore, 0, 10, 1),
    earnedScore: clampNumber(d.earnedScore, 0, 10, 0),
    isFullyCorrect: Boolean(d.isFullyCorrect),
    isUnanswered: Boolean(d.isUnanswered || d.status === 'unanswered'),
    questionText: clampString(d.questionText || '', 260),
    userAnswerText: clampString(d.userAnswerText || '', 180),
    correctAnswerText: clampString(d.correctAnswerText || '', 180),
    feedback: clampString(d.feedback || '', 180),
  };
}

function sanitizeBreakdownMap(raw: unknown): Record<string, { total: number; correct: number }> {
  const out: Record<string, { total: number; correct: number }> = {};
  if (!raw || typeof raw !== 'object') return out;
  const entries = Object.entries(raw as Record<string, any>).slice(0, 30);
  for (const [k, v] of entries) {
    if (!k) continue;
    out[String(k).slice(0, 64)] = {
      total: clampNumber(v?.total, 0, 200, 0),
      correct: clampNumber(v?.correct, 0, 200, 0),
    };
  }
  return out;
}

export function buildStudentProfileCreatePayload(uid: string, profile: Partial<UserProfile>) {
  const nowIso = new Date().toISOString();
  const school = clampString(
    normalizeSchoolName(profile.school || 'TRƯỜNG THPT HÒA BÌNH'),
    160,
    'TRƯỜNG THPT HÒA BÌNH'
  );
  const studentType =
    profile.studentType === 'official' || profile.studentType === 'extended'
      ? profile.studentType
      : normalizeSchoolKey(school) === OFFICIAL_SCHOOL_KEY
      ? 'official'
      : 'extended';

  return {
    ownerUid: sanitizeFirestoreId(uid, 'uid'),
    role: 'student' as const,
    studentId: sanitizeFirestoreId(profile.id || uid, 'hs'),
    studentType,
    name: clampString(normalizeStudentName(profile.name || 'Học sinh'), 120, 'Học sinh'),
    studentCode: clampString(profile.code || `HS-${uid.slice(0, 6).toUpperCase()}`, 64, 'HS'),
    className: clampString(normalizeClassName(profile.className || '10A1'), 32, '10A1'),
    school,
    province: clampString(profile.province || 'TỈNH LẠNG SƠN', 100, 'TỈNH LẠNG SƠN'),
    joinedDate: clampString(profile.joinedDate || nowIso.slice(0, 10), 32, nowIso.slice(0, 10)),
    lastLoginAt: clampString(profile.lastLoginAt || nowIso, 64, nowIso),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildStudentProfileUpdatePayload(profile: Partial<UserProfile>) {
  const nowIso = new Date().toISOString();
  const school = clampString(
    normalizeSchoolName(profile.school || 'TRƯỜNG THPT HÒA BÌNH'),
    160,
    'TRƯỜNG THPT HÒA BÌNH'
  );
  const studentType =
    profile.studentType === 'official' || profile.studentType === 'extended'
      ? profile.studentType
      : normalizeSchoolKey(school) === OFFICIAL_SCHOOL_KEY
      ? 'official'
      : 'extended';

  return {
    studentId: sanitizeFirestoreId(profile.id || 'hs', 'hs'),
    studentType,
    name: clampString(normalizeStudentName(profile.name || 'Học sinh'), 120, 'Học sinh'),
    studentCode: clampString(profile.code || 'HS', 64, 'HS'),
    className: clampString(normalizeClassName(profile.className || '10A1'), 32, '10A1'),
    school,
    province: clampString(profile.province || 'TỈNH LẠNG SƠN', 100, 'TỈNH LẠNG SƠN'),
    lastLoginAt: clampString(nowIso, 64, nowIso),
    updatedAt: serverTimestamp(),
  };
}

export function buildAttemptCreatePayload(uid: string, record: ExamRecord) {
  const safeAttemptId = sanitizeFirestoreId(record.id, 'att');
  const validModes = [
    'practice_topic',
    'practice_type',
    'practice_comprehensive',
    'official_test',
  ] as const;
  const mode = validModes.includes(record.mode as any) ? record.mode : 'practice_topic';

  const validQTypes = [
    'multiple_choice',
    'true_false_context',
    'short_answer',
    'matching',
    'all',
  ] as const;
  const questionType = validQTypes.includes(record.questionType as any)
    ? (record.questionType as QuestionType | 'all')
    : 'all';

  const totalQuestions = clampNumber(record.totalQuestions, 1, 200, 1);
  const correctCount = clampNumber(record.correctCount, 0, 200, 0);
  const wrongCount = clampNumber(record.wrongCount, 0, 200, 0);
  const unansweredCount = clampNumber(record.unansweredCount ?? 0, 0, 200, 0);
  const answeredCount = clampNumber(
    record.answeredCount ?? Math.max(0, totalQuestions - unansweredCount),
    0,
    200,
    0
  );

  const compactDetails = Array.isArray(record.details)
    ? record.details.slice(0, 60).map(compactDetailItem)
    : [];

  const weakTopics = Array.isArray(record.weakTopics)
    ? record.weakTopics
        .map((t) => clampString(t, 80))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const strongTopics = Array.isArray(record.strongTopics)
    ? record.strongTopics
        .map((t) => clampString(t, 80))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  return {
    safeAttemptId,
    payload: {
      id: safeAttemptId,
      ownerUid: sanitizeFirestoreId(uid, 'uid'),
      status: 'submitted' as const,
      studentId: clampString(record.studentId || uid, 128, uid),
      studentName: clampString(normalizeStudentName(record.studentName || 'Học sinh'), 120, 'Học sinh'),
      studentCode: clampString(record.studentCode || 'HS', 64, 'HS'),
      schoolName: clampString(
        normalizeSchoolName(record.schoolName || 'TRƯỜNG THPT HÒA BÌNH'),
        160,
        'TRƯỜNG THPT HÒA BÌNH'
      ),
      className: clampString(normalizeClassName(record.className || '10A1'), 32, '10A1'),
      lessonId: clampString(record.lessonId || '', 64),
      chapterId: clampString(record.chapterId || '', 64),
      lessonTitle: clampString(record.lessonTitle || '', 200),
      questionType,
      title: clampString(record.title || 'Bài luyện tập Địa lí 10', 200, 'Bài luyện tập Địa lí 10'),
      mode,
      timestamp: clampNumber(record.timestamp || Date.now(), 0, 9999999999999, Date.now()),
      date: clampString(
        record.date || new Date(record.timestamp || Date.now()).toLocaleDateString('vi-VN'),
        32
      ),
      durationSeconds: clampNumber(record.durationSeconds, 0, 86400, 0),
      timeLimitMinutes: clampNumber(record.timeLimitMinutes ?? 0, 0, 600, 0),
      totalQuestions,
      answeredCount,
      unansweredCount,
      score: clampNumber(record.score, 0, 10, 0),
      correctCount,
      wrongCount,
      accuracyRate: clampNumber(record.accuracyRate, 0, 100, 0),
      language: record.language === 'en' ? ('en' as const) : ('vi' as const),
      details: compactDetails,
      typeBreakdown: sanitizeBreakdownMap(record.typeBreakdown),
      topicBreakdown: sanitizeBreakdownMap(record.topicBreakdown),
      weakTopics,
      strongTopics,
      recommendation: clampString(record.recommendation || '', 500),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  };
}

// =========================================================================
// FIRESTORE CRUD & REAL-TIME SYNC OPERATIONS
// =========================================================================
export async function syncStudentProfileToCloud(profile: Partial<UserProfile>): Promise<boolean> {
  const user = auth.currentUser;
  if (!isCloudSyncEligibleUser(user)) return false;

  const uid = user.uid;
  const studentPath = `students/${uid}`;
  const ref = doc(db, 'students', uid);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const createData = buildStudentProfileCreatePayload(uid, profile);
      await setDoc(ref, createData);
    } else {
      const updateData = buildStudentProfileUpdatePayload(profile);
      await updateDoc(ref, updateData);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, studentPath);
  }
}

export async function syncAttemptToCloud(
  record: ExamRecord,
  profile?: Partial<UserProfile>
): Promise<{ synced: boolean; attemptId: string }> {
  const user = auth.currentUser;
  if (!isCloudSyncEligibleUser(user)) {
    return { synced: false, attemptId: record.id };
  }

  const uid = user.uid;
  const { safeAttemptId, payload } = buildAttemptCreatePayload(uid, record);
  const studentRef = doc(db, 'students', uid);
  const attemptRef = doc(db, 'attempts', safeAttemptId);
  const attemptPath = `attempts/${safeAttemptId}`;

  try {
    const studentSnap = await getDoc(studentRef);
    const batch = writeBatch(db);

    if (!studentSnap.exists()) {
      const studentCreate = buildStudentProfileCreatePayload(uid, {
        id: profile?.id || record.studentId || uid,
        name: profile?.name || record.studentName,
        code: profile?.code || record.studentCode,
        className: profile?.className || record.className,
        school: profile?.school || record.schoolName,
        province: profile?.province || 'TỈNH LẠNG SƠN',
        studentType: profile?.studentType,
        joinedDate: profile?.joinedDate,
      });
      batch.set(studentRef, studentCreate);
    } else {
      const studentUpdate = buildStudentProfileUpdatePayload({
        id: profile?.id || record.studentId || uid,
        name: profile?.name || record.studentName,
        code: profile?.code || record.studentCode,
        className: profile?.className || record.className,
        school: profile?.school || record.schoolName,
        province: profile?.province || 'TỈNH LẠNG SƠN',
        studentType: profile?.studentType,
      });
      batch.update(studentRef, studentUpdate);
    }

    batch.set(attemptRef, payload);
    await batch.commit();
    return { synced: true, attemptId: safeAttemptId };
  } catch (error) {
    // Idempotency check: if this attempt already exists and belongs to this user, treat as synced
    try {
      const existingAttempt = await getDoc(attemptRef);
      if (existingAttempt.exists()) {
        return { synced: true, attemptId: safeAttemptId };
      }
    } catch {
      // fall through to primary error handler
    }
    handleFirestoreError(error, OperationType.CREATE, attemptPath);
  }
}

export async function deleteAttemptFromCloud(attemptId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!isTeacherFirebaseUser(user)) return false;

  const safeId = sanitizeFirestoreId(attemptId, 'att');
  const attemptPath = `attempts/${safeId}`;
  try {
    await deleteDoc(doc(db, 'attempts', safeId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, attemptPath);
  }
}

function docToExamRecord(data: Record<string, any>): ExamRecord {
  return {
    id: String(data.id || ''),
    studentId: String(data.studentId || data.ownerUid || ''),
    studentName: String(data.studentName || 'Học sinh'),
    studentCode: String(data.studentCode || 'HS'),
    schoolName: String(data.schoolName || 'TRƯỜNG THPT HÒA BÌNH'),
    className: String(data.className || '10A1'),
    lessonId: data.lessonId || undefined,
    chapterId: data.chapterId || null,
    lessonTitle: data.lessonTitle || undefined,
    questionType: data.questionType || 'all',
    title: String(data.title || 'Bài luyện tập Địa lí 10'),
    mode: data.mode || 'practice_topic',
    timestamp: Number(data.timestamp) || Date.now(),
    date: data.date || new Date(Number(data.timestamp) || Date.now()).toLocaleDateString('vi-VN'),
    durationSeconds: Number(data.durationSeconds) || 0,
    timeLimitMinutes: Number(data.timeLimitMinutes) || undefined,
    totalQuestions: Number(data.totalQuestions) || 0,
    answeredCount: Number(data.answeredCount) || 0,
    unansweredCount: Number(data.unansweredCount) || 0,
    score: Number(data.score) || 0,
    correctCount: Number(data.correctCount) || 0,
    wrongCount: Number(data.wrongCount) || 0,
    accuracyRate: Number(data.accuracyRate) || 0,
    language: data.language === 'en' ? 'en' : 'vi',
    details: Array.isArray(data.details) ? (data.details as QuestionGradingDetail[]) : [],
    topicBreakdown: (data.topicBreakdown && typeof data.topicBreakdown === 'object'
      ? data.topicBreakdown
      : {}) as ExamRecord['topicBreakdown'],
    typeBreakdown: (data.typeBreakdown && typeof data.typeBreakdown === 'object'
      ? data.typeBreakdown
      : {}) as ExamRecord['typeBreakdown'],
    weakTopics: Array.isArray(data.weakTopics) ? data.weakTopics : [],
    strongTopics: Array.isArray(data.strongTopics) ? data.strongTopics : [],
    recommendation: String(data.recommendation || ''),
  };
}

function docToUserProfile(docId: string, data: Record<string, any>): UserProfile {
  return {
    id: String(data.studentId || docId),
    role: 'student',
    studentType: data.studentType === 'official' ? 'official' : 'extended',
    name: String(data.name || 'Học sinh'),
    code: String(data.studentCode || 'HS'),
    className: String(data.className || '10A1'),
    school: String(data.school || 'TRƯỜNG THPT HÒA BÌNH'),
    province: String(data.province || 'TỈNH LẠNG SƠN'),
    joinedDate: String(data.joinedDate || new Date().toISOString().slice(0, 10)),
    lastLoginAt: data.lastLoginAt ? String(data.lastLoginAt) : undefined,
    isActivated: true,
  };
}

export function subscribeCloudData(
  user: FirebaseUser,
  onUpdate: (payload: { attempts?: ExamRecord[]; students?: UserProfile[] }) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!isCloudSyncEligibleUser(user)) {
    return () => {};
  }

  const unsubs: Unsubscribe[] = [];
  const isTeacher = isTeacherFirebaseUser(user);

  const attemptsQuery = isTeacher
    ? collection(db, 'attempts')
    : query(collection(db, 'attempts'), where('ownerUid', '==', user.uid));

  const unsubAttempts = onSnapshot(
    attemptsQuery,
    (snapshot) => {
      const attempts = snapshot.docs
        .map((d) => docToExamRecord(d.data()))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate({ attempts });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'attempts');
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
  unsubs.push(unsubAttempts);

  if (isTeacher) {
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const students = snapshot.docs.map((d) => docToUserProfile(d.id, d.data()));
        onUpdate({ students });
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'students');
        } catch (wrapped) {
          if (onError && wrapped instanceof Error) onError(wrapped);
        }
      }
    );
    unsubs.push(unsubStudents);
  } else {
    const studentPath = `students/${user.uid}`;
    const unsubSelf = onSnapshot(
      doc(db, 'students', user.uid),
      (snap) => {
        if (snap.exists()) {
          onUpdate({ students: [docToUserProfile(snap.id, snap.data())] });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, studentPath);
        } catch (wrapped) {
          if (onError && wrapped instanceof Error) onError(wrapped);
        }
      }
    );
    unsubs.push(unsubSelf);
  }

  return () => {
    unsubs.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
  };
}

export async function fetchCloudDataOnce(): Promise<{
  attempts: ExamRecord[];
  students: UserProfile[];
} | null> {
  const user = auth.currentUser;
  if (!isCloudSyncEligibleUser(user)) return null;

  const isTeacher = isTeacherFirebaseUser(user);
  let attempts: ExamRecord[] = [];
  let students: UserProfile[] = [];

  try {
    const attemptsQuery = isTeacher
      ? collection(db, 'attempts')
      : query(collection(db, 'attempts'), where('ownerUid', '==', user.uid));
    const attSnap = await getDocs(attemptsQuery);
    attempts = attSnap.docs
      .map((d) => docToExamRecord(d.data()))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'attempts');
  }

  try {
    if (isTeacher) {
      const stSnap = await getDocs(collection(db, 'students'));
      students = stSnap.docs.map((d) => docToUserProfile(d.id, d.data()));
    } else {
      const selfSnap = await getDoc(doc(db, 'students', user.uid));
      if (selfSnap.exists()) {
        students = [docToUserProfile(selfSnap.id, selfSnap.data())];
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, isTeacher ? 'students' : `students/${user.uid}`);
  }

  return { attempts, students };
}
