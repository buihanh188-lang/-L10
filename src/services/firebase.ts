import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
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
import type {
  ExamRecord,
  LearningActivity,
  QuestionGradingDetail,
  QuestionType,
  UserProfile,
} from '../types';
import {
  normalizeClassName,
  normalizeSchoolKey,
  normalizeSchoolName,
  normalizeStudentName,
} from '../utils/normalize';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Explicitly persist Auth sessions locally across mobile Safari/Chrome restarts
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

export const TEACHER_ADMIN_EMAIL = 'buihanh188@gmail.com';
const OFFICIAL_SCHOOL_KEY = normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH');

const googleProvider = new GoogleAuthProvider();

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
  errorMessage?: string;
}> | null = null;

export async function ensureAnonymousStudentSession(): Promise<{
  user: FirebaseUser | null;
  needsConsoleEnable?: boolean;
  errorCode?: string;
  errorMessage?: string;
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
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      const cred = await signInAnonymously(auth);
      return { user: cred.user };
    } catch (err: any) {
      const code = String(err?.code || '');
      const message = String(err?.message || code || 'Anonymous auth failed');
      const needsConsoleEnable =
        code.includes('admin-restricted-operation') ||
        code.includes('operation-not-allowed') ||
        message.includes('admin-restricted-operation') ||
        message.includes('operation-not-allowed');
      console.warn('Silent student Firebase session notice:', code || message);
      return { user: null, needsConsoleEnable, errorCode: code || 'auth/error', errorMessage: message };
    } finally {
      pendingAnonSignIn = null;
    }
  })();

  return pendingAnonSignIn;
}

export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    // ignore
  }
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

export async function getCurrentFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
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

export function buildActivityCreatePayload(uid: string, activity: LearningActivity) {
  const safeActivityId = sanitizeFirestoreId(activity.id, 'act');
  const validTypes = ['visit', 'video_view', 'lesson_view'] as const;
  const type = validTypes.includes(activity.type as any) ? activity.type : 'visit';
  const ts = clampNumber(activity.timestamp || Date.now(), 0, 9999999999999, Date.now());

  return {
    safeActivityId,
    payload: {
      id: safeActivityId,
      ownerUid: sanitizeFirestoreId(uid, 'uid'),
      type,
      studentId: clampString(activity.studentId || uid, 128, uid),
      studentName: clampString(normalizeStudentName(activity.studentName || 'Học sinh'), 120, 'Học sinh'),
      studentCode: clampString(activity.studentCode || 'HS', 64, 'HS'),
      schoolName: clampString(
        normalizeSchoolName(activity.schoolName || 'TRƯỜNG THPT HÒA BÌNH'),
        160,
        'TRƯỜNG THPT HÒA BÌNH'
      ),
      className: clampString(normalizeClassName(activity.className || '10A1'), 32, '10A1'),
      lessonId: clampString(activity.lessonId || '', 64),
      lessonTitle: clampString(activity.lessonTitle || '', 200),
      timestamp: ts,
      date: clampString(activity.date || new Date(ts).toLocaleDateString('vi-VN'), 32),
      createdAt: serverTimestamp(),
    },
  };
}

function buildFirestoreErrorInfo(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  return {
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
}

function logFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export interface CloudSyncWriteResult {
  synced: boolean;
  attemptId: string;
  alreadyExists?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface CloudActivityWriteResult {
  synced: boolean;
  activityId: string;
  alreadyExists?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

async function ensureStudentProfileDocExists(
  uid: string,
  profile: Partial<UserProfile>
): Promise<boolean> {
  const studentRef = doc(db, 'students', uid);
  const snap = await getDoc(studentRef);
  if (snap.exists()) {
    return true;
  }
  const createData = buildStudentProfileCreatePayload(uid, profile);
  await setDoc(studentRef, createData);
  return true;
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
      return true;
    }

    const existingData = snap.data();
    // Only attempt profile update if existing doc conforms to immutable ownerUid & createdAt rules
    if (existingData && existingData.ownerUid === uid && existingData.createdAt) {
      const updateData = buildStudentProfileUpdatePayload(profile);
      await updateDoc(ref, updateData);
    }
    return true;
  } catch (error) {
    logFirestoreError(error, OperationType.WRITE, studentPath);
    return false;
  }
}

export async function syncAttemptToCloud(
  record: ExamRecord,
  profile?: Partial<UserProfile>
): Promise<CloudSyncWriteResult> {
  const safeAttemptId = sanitizeFirestoreId(record.id, 'att');
  const user = auth.currentUser;
  if (!isCloudSyncEligibleUser(user)) {
    return {
      synced: false,
      attemptId: safeAttemptId,
      errorCode: 'auth/not-signed-in',
      errorMessage: 'Chưa có phiên xác thực Firebase hợp lệ.',
    };
  }

  const uid = user.uid;
  const { payload } = buildAttemptCreatePayload(uid, { ...record, id: safeAttemptId });
  const attemptRef = doc(db, 'attempts', safeAttemptId);
  const attemptPath = `attempts/${safeAttemptId}`;

  try {
    // Never overwrite existing Firestore attempt records
    try {
      const existingAttempt = await getDoc(attemptRef);
      if (existingAttempt.exists()) {
        return { synced: true, attemptId: safeAttemptId, alreadyExists: true };
      }
    } catch (checkErr: any) {
      const checkCode = String(checkErr?.code || '');
      // If getDoc returned permission-denied for a non-teacher, the doc likely exists under another ownerUid
      if (checkCode === 'permission-denied' && !isTeacherFirebaseUser(user)) {
        logFirestoreError(checkErr, OperationType.GET, attemptPath);
        return {
          synced: false,
          attemptId: safeAttemptId,
          errorCode: checkCode,
          errorMessage: 'Không thể kiểm tra bản ghi trên Firestore (permission-denied).',
        };
      }
    }

    // Teacher admin mirroring a local/server student record directly into Firestore
    if (isTeacherFirebaseUser(user)) {
      await setDoc(attemptRef, payload);
      return { synced: true, attemptId: safeAttemptId };
    }

    const studentProfileSeed: Partial<UserProfile> = {
      id: profile?.id || record.studentId || uid,
      name: profile?.name || record.studentName,
      code: profile?.code || record.studentCode,
      className: profile?.className || record.className,
      school: profile?.school || record.schoolName,
      province: profile?.province || 'TỈNH LẠNG SƠN',
      studentType: profile?.studentType,
      joinedDate: profile?.joinedDate,
    };

    // Decouple attempt creation from student profile updates:
    // 1. Ensure students/{uid} exists (create-only if missing, NEVER update inside attempt write)
    await ensureStudentProfileDocExists(uid, studentProfileSeed);

    // 2. Write attempts/{id} standalone so any later students/{uid} rule quirk can never block scoring
    await setDoc(attemptRef, payload);

    // 3. Refresh student profile metadata asynchronously (non-blocking)
    syncStudentProfileToCloud(studentProfileSeed).catch(() => false);

    return { synced: true, attemptId: safeAttemptId };
  } catch (error: any) {
    // Idempotency check: if write actually landed on Firestore, treat as synced without overwriting
    try {
      const existingAttempt = await getDoc(attemptRef);
      if (existingAttempt.exists()) {
        return { synced: true, attemptId: safeAttemptId, alreadyExists: true };
      }
    } catch {
      // keep primary error below
    }

    const info = logFirestoreError(error, OperationType.CREATE, attemptPath);
    const errorCode = String(error?.code || 'firestore/write-failed');
    return {
      synced: false,
      attemptId: safeAttemptId,
      errorCode,
      errorMessage: info.error,
    };
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

export async function syncActivityToCloud(
  activity: LearningActivity
): Promise<CloudActivityWriteResult> {
  const safeActivityId = sanitizeFirestoreId(activity.id, 'act');
  const user = auth.currentUser;
  if (!isCloudSyncEligibleUser(user)) {
    return {
      synced: false,
      activityId: safeActivityId,
      errorCode: 'auth/not-signed-in',
      errorMessage: 'Chưa có phiên xác thực Firebase hợp lệ.',
    };
  }

  const uid = user.uid;
  const { payload } = buildActivityCreatePayload(uid, { ...activity, id: safeActivityId });
  const activityRef = doc(db, 'activities', safeActivityId);
  const activityPath = `activities/${safeActivityId}`;

  try {
    try {
      const existing = await getDoc(activityRef);
      if (existing.exists()) {
        return { synced: true, activityId: safeActivityId, alreadyExists: true };
      }
    } catch {
      // proceed to create
    }

    await setDoc(activityRef, payload);
    return { synced: true, activityId: safeActivityId };
  } catch (error: any) {
    try {
      const existing = await getDoc(activityRef);
      if (existing.exists()) {
        return { synced: true, activityId: safeActivityId, alreadyExists: true };
      }
    } catch {
      // ignore
    }
    const info = logFirestoreError(error, OperationType.CREATE, activityPath);
    return {
      synced: false,
      activityId: safeActivityId,
      errorCode: String(error?.code || 'firestore/write-failed'),
      errorMessage: info.error,
    };
  }
}

export async function mirrorRecordsToFirestoreAsTeacher(params: {
  attempts: ExamRecord[];
  activities: LearningActivity[];
  knownCloudAttemptIds: Set<string>;
  knownCloudActivityIds: Set<string>;
}): Promise<{ mirroredAttempts: number; mirroredActivities: number }> {
  const user = auth.currentUser;
  if (!isTeacherFirebaseUser(user)) {
    return { mirroredAttempts: 0, mirroredActivities: 0 };
  }

  let mirroredAttempts = 0;
  let mirroredActivities = 0;

  const missingAttempts = params.attempts
    .filter((a) => a && a.id && !params.knownCloudAttemptIds.has(sanitizeFirestoreId(a.id, 'att')))
    .slice(0, 50);

  for (const att of missingAttempts) {
    try {
      const res = await syncAttemptToCloud(att);
      if (res.synced) {
        params.knownCloudAttemptIds.add(res.attemptId);
        mirroredAttempts++;
      }
    } catch {
      // non-blocking
    }
  }

  const missingActivities = params.activities
    .filter((a) => a && a.id && !params.knownCloudActivityIds.has(sanitizeFirestoreId(a.id, 'act')))
    .slice(0, 80);

  for (const act of missingActivities) {
    try {
      const res = await syncActivityToCloud(act);
      if (res.synced) {
        params.knownCloudActivityIds.add(res.activityId);
        mirroredActivities++;
      }
    } catch {
      // non-blocking
    }
  }

  return { mirroredAttempts, mirroredActivities };
}

function safeParseExamRecord(docId: string, data: Record<string, any> | undefined): ExamRecord | null {
  try {
    if (!data || typeof data !== 'object') return null;
    const rawTs = Number(data.timestamp);
    const ts = Number.isFinite(rawTs) && rawTs > 0 ? rawTs : Date.now();
    return {
      id: String(data.id || docId || ''),
      studentId: String(data.studentId || data.ownerUid || ''),
      studentName: String(data.studentName || 'Học sinh'),
      studentCode: String(data.studentCode || 'HS'),
      schoolName: String(data.schoolName || 'TRƯỜNG THPT HÒA BÌNH'),
      className: String(data.className || '10A1'),
      lessonId: data.lessonId ? String(data.lessonId) : undefined,
      chapterId: data.chapterId ? String(data.chapterId) : null,
      lessonTitle: data.lessonTitle ? String(data.lessonTitle) : undefined,
      questionType: data.questionType || 'all',
      title: String(data.title || 'Bài luyện tập Địa lí 10'),
      mode: data.mode || 'practice_topic',
      timestamp: ts,
      date: String(data.date || new Date(ts).toLocaleDateString('vi-VN')),
      durationSeconds: Number(data.durationSeconds) || 0,
      timeLimitMinutes: data.timeLimitMinutes ? Number(data.timeLimitMinutes) : undefined,
      totalQuestions: Number(data.totalQuestions) || 0,
      answeredCount: Number(data.answeredCount) || 0,
      unansweredCount: Number(data.unansweredCount) || 0,
      score: Number(data.score) || 0,
      correctCount: Number(data.correctCount) || 0,
      wrongCount: Number(data.wrongCount) || 0,
      accuracyRate: Number(data.accuracyRate) || 0,
      language: data.language === 'en' ? 'en' : 'vi',
      details: Array.isArray(data.details) ? (data.details as QuestionGradingDetail[]) : [],
      topicBreakdown:
        data.topicBreakdown && typeof data.topicBreakdown === 'object'
          ? (data.topicBreakdown as ExamRecord['topicBreakdown'])
          : {},
      typeBreakdown:
        data.typeBreakdown && typeof data.typeBreakdown === 'object'
          ? (data.typeBreakdown as ExamRecord['typeBreakdown'])
          : {
              multiple_choice: { total: 0, correct: 0 },
              true_false_context: { total: 0, correct: 0 },
              short_answer: { total: 0, correct: 0 },
              matching: { total: 0, correct: 0 },
            },
      weakTopics: Array.isArray(data.weakTopics) ? data.weakTopics : [],
      strongTopics: Array.isArray(data.strongTopics) ? data.strongTopics : [],
      recommendation: String(data.recommendation || ''),
    };
  } catch (err) {
    console.warn('Skipped malformed attempt document:', docId, err);
    return null;
  }
}

function safeParseUserProfile(docId: string, data: Record<string, any> | undefined): UserProfile | null {
  try {
    if (!data || typeof data !== 'object') return null;
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
  } catch (err) {
    console.warn('Skipped malformed student document:', docId, err);
    return null;
  }
}

function safeParseLearningActivity(
  docId: string,
  data: Record<string, any> | undefined
): LearningActivity | null {
  try {
    if (!data || typeof data !== 'object') return null;
    const rawType = data.type;
    const type =
      rawType === 'video_view' || rawType === 'lesson_view' || rawType === 'visit'
        ? rawType
        : 'visit';
    const rawTs = Number(data.timestamp);
    const ts = Number.isFinite(rawTs) && rawTs > 0 ? rawTs : Date.now();
    return {
      id: String(data.id || docId || ''),
      type,
      studentId: String(data.studentId || data.ownerUid || ''),
      studentName: String(data.studentName || 'Học sinh'),
      studentCode: String(data.studentCode || 'HS'),
      schoolName: String(data.schoolName || 'TRƯỜNG THPT HÒA BÌNH'),
      className: String(data.className || '10A1'),
      lessonId: data.lessonId ? String(data.lessonId) : undefined,
      lessonTitle: data.lessonTitle ? String(data.lessonTitle) : undefined,
      timestamp: ts,
      date: String(data.date || new Date(ts).toLocaleDateString('vi-VN')),
    };
  } catch (err) {
    console.warn('Skipped malformed activity document:', docId, err);
    return null;
  }
}

export function subscribeCloudData(
  user: FirebaseUser,
  onUpdate: (payload: {
    attempts?: ExamRecord[];
    students?: UserProfile[];
    activities?: LearningActivity[];
    collection?: 'attempts' | 'students' | 'activities';
  }) => void,
  onError?: (err: Error, collectionName?: 'attempts' | 'students' | 'activities') => void
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
        .map((d) => safeParseExamRecord(d.id, d.data()))
        .filter((r): r is ExamRecord => Boolean(r && r.id))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate({ attempts, collection: 'attempts' });
    },
    (error) => {
      const info = logFirestoreError(error, OperationType.LIST, 'attempts');
      if (onError) onError(new Error(info.error), 'attempts');
    }
  );
  unsubs.push(unsubAttempts);

  const activitiesQuery = isTeacher
    ? collection(db, 'activities')
    : query(collection(db, 'activities'), where('ownerUid', '==', user.uid));

  const unsubActivities = onSnapshot(
    activitiesQuery,
    (snapshot) => {
      const activities = snapshot.docs
        .map((d) => safeParseLearningActivity(d.id, d.data()))
        .filter((a): a is LearningActivity => Boolean(a && a.id))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate({ activities, collection: 'activities' });
    },
    (error) => {
      const info = logFirestoreError(error, OperationType.LIST, 'activities');
      if (onError) onError(new Error(info.error), 'activities');
    }
  );
  unsubs.push(unsubActivities);

  if (isTeacher) {
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const students = snapshot.docs
          .map((d) => safeParseUserProfile(d.id, d.data()))
          .filter((s): s is UserProfile => Boolean(s && s.id));
        onUpdate({ students, collection: 'students' });
      },
      (error) => {
        const info = logFirestoreError(error, OperationType.LIST, 'students');
        if (onError) onError(new Error(info.error), 'students');
      }
    );
    unsubs.push(unsubStudents);
  } else {
    const studentPath = `students/${user.uid}`;
    const unsubSelf = onSnapshot(
      doc(db, 'students', user.uid),
      (snap) => {
        if (snap.exists()) {
          const parsed = safeParseUserProfile(snap.id, snap.data());
          if (parsed) {
            onUpdate({ students: [parsed], collection: 'students' });
          }
        }
      },
      (error) => {
        const info = logFirestoreError(error, OperationType.GET, studentPath);
        if (onError) onError(new Error(info.error), 'students');
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

export interface FetchCloudSnapshotResult {
  attempts: ExamRecord[];
  students: UserProfile[];
  activities: LearningActivity[];
  fetched: {
    attempts: boolean;
    students: boolean;
    activities: boolean;
  };
  errors: {
    attempts?: string;
    students?: string;
    activities?: string;
  };
}

export async function fetchCloudDataOnce(): Promise<FetchCloudSnapshotResult | null> {
  const user = auth.currentUser;
  if (!isCloudSyncEligibleUser(user)) return null;

  const isTeacher = isTeacherFirebaseUser(user);
  let attempts: ExamRecord[] = [];
  let students: UserProfile[] = [];
  let activities: LearningActivity[] = [];
  const fetched = { attempts: false, students: false, activities: false };
  const errors: { attempts?: string; students?: string; activities?: string } = {};

  const attemptsTask = (async () => {
    try {
      const attemptsQuery = isTeacher
        ? collection(db, 'attempts')
        : query(collection(db, 'attempts'), where('ownerUid', '==', user.uid));
      const attSnap = await getDocs(attemptsQuery);
      attempts = attSnap.docs
        .map((d) => safeParseExamRecord(d.id, d.data()))
        .filter((r): r is ExamRecord => Boolean(r && r.id))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      fetched.attempts = true;
    } catch (error) {
      const info = logFirestoreError(error, OperationType.LIST, 'attempts');
      errors.attempts = info.error;
    }
  })();

  const activitiesTask = (async () => {
    try {
      const activitiesQuery = isTeacher
        ? collection(db, 'activities')
        : query(collection(db, 'activities'), where('ownerUid', '==', user.uid));
      const actSnap = await getDocs(activitiesQuery);
      activities = actSnap.docs
        .map((d) => safeParseLearningActivity(d.id, d.data()))
        .filter((a): a is LearningActivity => Boolean(a && a.id))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      fetched.activities = true;
    } catch (error) {
      const info = logFirestoreError(error, OperationType.LIST, 'activities');
      errors.activities = info.error;
    }
  })();

  const studentsTask = (async () => {
    try {
      if (isTeacher) {
        const stSnap = await getDocs(collection(db, 'students'));
        students = stSnap.docs
          .map((d) => safeParseUserProfile(d.id, d.data()))
          .filter((s): s is UserProfile => Boolean(s && s.id));
      } else {
        const selfSnap = await getDoc(doc(db, 'students', user.uid));
        if (selfSnap.exists()) {
          const parsed = safeParseUserProfile(selfSnap.id, selfSnap.data());
          if (parsed) students = [parsed];
        }
      }
      fetched.students = true;
    } catch (error) {
      const info = logFirestoreError(
        error,
        isTeacher ? OperationType.LIST : OperationType.GET,
        isTeacher ? 'students' : `students/${user.uid}`
      );
      errors.students = info.error;
    }
  })();

  await Promise.allSettled([attemptsTask, activitiesTask, studentsTask]);

  return { attempts, students, activities, fetched, errors };
}
