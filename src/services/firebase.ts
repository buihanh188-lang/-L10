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
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
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

// Local browser cache for verified student profile UIDs & profile sync signatures
// avoids redundant getDoc() reads on every attempt write (preserving Spark free read quota).
const CLOUD_PROFILE_UIDS_KEY = 'dia_li_10_cloud_profile_uids';
const SYNCED_PROFILE_SIG_KEY = 'dia_li_10_synced_profile_sig';
const PROFILE_SIG_TTL_MS = 12 * 60 * 60 * 1000;
const verifiedProfileUidSet = new Set<string>();

function readCachedProfileUids(): Set<string> {
  if (verifiedProfileUidSet.size > 0) return verifiedProfileUidSet;
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(CLOUD_PROFILE_UIDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => {
            if (typeof id === 'string' && id) verifiedProfileUidSet.add(id);
          });
        }
      }
    }
  } catch {
    // ignore storage access issues
  }
  return verifiedProfileUidSet;
}

function markCachedProfileUid(uid: string): void {
  if (!uid) return;
  const set = readCachedProfileUids();
  if (set.has(uid)) return;
  set.add(uid);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CLOUD_PROFILE_UIDS_KEY, JSON.stringify(Array.from(set).slice(-30)));
    }
  } catch {
    // ignore
  }
}

function clearCachedProfileUid(uid: string): void {
  if (!uid) return;
  const set = readCachedProfileUids();
  set.delete(uid);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CLOUD_PROFILE_UIDS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {
    // ignore
  }
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
  profileVerified?: boolean;
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

export function isFirestoreQuotaError(error: unknown): boolean {
  if (!error) return false;
  const code = String((error as any)?.code || '').toLowerCase();
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource exhausted') ||
    msg.includes('quota') ||
    msg.includes('free daily read units')
  );
}

const pendingProfileOpByUid = new Map<string, Promise<boolean>>();

async function ensureStudentProfileDocExists(
  uid: string,
  profile: Partial<UserProfile>,
  forceCheck = false
): Promise<boolean> {
  if (!forceCheck && readCachedProfileUids().has(uid)) {
    return true;
  }
  const existingOp = pendingProfileOpByUid.get(uid);
  if (existingOp) {
    return existingOp;
  }
  const op = (async () => {
    const studentRef = doc(db, 'students', uid);
    const createData = buildStudentProfileCreatePayload(uid, profile);
    try {
      // Create-first: costs 0 Firestore reads for brand-new students, so they can submit even if read quota is exhausted.
      await setDoc(studentRef, createData);
      markCachedProfileUid(uid);
      return true;
    } catch (err: any) {
      if (isFirestoreQuotaError(err)) {
        throw err;
      }
      const code = String(err?.code || '').toLowerCase();
      if (code.includes('permission-denied')) {
        // Likely students/{uid} already existed on Firestore (update rejected createdAt overwrite):
        // verify existence once via getDoc on non-quota failures.
        const snap = await getDoc(studentRef);
        if (snap.exists()) {
          const data = snap.data();
          if (!data?.ownerUid || data.ownerUid === uid) {
            markCachedProfileUid(uid);
            return true;
          }
        }
      }
      throw err;
    }
  })();
  pendingProfileOpByUid.set(uid, op);
  try {
    return await op;
  } finally {
    if (pendingProfileOpByUid.get(uid) === op) {
      pendingProfileOpByUid.delete(uid);
    }
  }
}

// =========================================================================
// FIRESTORE CRUD & REAL-TIME SYNC OPERATIONS
// =========================================================================
export async function syncStudentProfileToCloud(
  profile: Partial<UserProfile>,
  force = false,
  onQuotaError?: (errorMessage: string) => void
): Promise<boolean> {
  const user = auth.currentUser;
  if (!isCloudSyncEligibleUser(user)) return false;

  const uid = user.uid;
  const sig = `${uid}|${profile.name || ''}|${profile.code || ''}|${profile.className || ''}|${profile.school || ''}`;

  if (!force && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(SYNCED_PROFILE_SIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          parsed.sig === sig &&
          typeof parsed.ts === 'number' &&
          Date.now() - parsed.ts < PROFILE_SIG_TTL_MS
        ) {
          markCachedProfileUid(uid);
          return true;
        }
      }
    } catch {
      // ignore
    }
  }

  const inflight = pendingProfileOpByUid.get(uid);
  if (inflight) {
    return inflight;
  }

  const studentPath = `students/${uid}`;
  const ref = doc(db, 'students', uid);

  const op = (async () => {
    try {
      if (readCachedProfileUids().has(uid)) {
        try {
          await updateDoc(ref, buildStudentProfileUpdatePayload(profile));
        } catch (updErr: any) {
          if (isFirestoreQuotaError(updErr)) throw updErr;
          const updCode = String(updErr?.code || '').toLowerCase();
          if (updCode.includes('not-found')) {
            clearCachedProfileUid(uid);
            await setDoc(ref, buildStudentProfileCreatePayload(uid, profile));
          } else {
            throw updErr;
          }
        }
      } else {
        try {
          // Create-first with 0 reads so brand-new students succeed even if read quota is exhausted.
          await setDoc(ref, buildStudentProfileCreatePayload(uid, profile));
        } catch (createErr: any) {
          if (isFirestoreQuotaError(createErr)) throw createErr;
          const createCode = String(createErr?.code || '').toLowerCase();
          if (createCode.includes('permission-denied')) {
            const snap = await getDoc(ref);
            if (!snap.exists()) {
              throw createErr;
            }
            const existingData = snap.data();
            if (existingData && existingData.ownerUid === uid && existingData.createdAt) {
              await updateDoc(ref, buildStudentProfileUpdatePayload(profile));
            }
          } else {
            throw createErr;
          }
        }
      }

      markCachedProfileUid(uid);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(SYNCED_PROFILE_SIG_KEY, JSON.stringify({ sig, ts: Date.now() }));
        } catch {
          // ignore
        }
      }
      return true;
    } catch (error) {
      const info = logFirestoreError(error, OperationType.WRITE, studentPath);
      if (isFirestoreQuotaError(error) && onQuotaError) {
        onQuotaError(info.error);
      }
      return false;
    }
  })();

  pendingProfileOpByUid.set(uid, op);
  try {
    return await op;
  } finally {
    if (pendingProfileOpByUid.get(uid) === op) {
      pendingProfileOpByUid.delete(uid);
    }
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

  // Teacher admin mirroring a local/server student record directly into Firestore
  if (isTeacherFirebaseUser(user)) {
    try {
      await setDoc(attemptRef, payload);
      return { synced: true, attemptId: safeAttemptId, profileVerified: true };
    } catch (error: any) {
      const isQuotaErr = isFirestoreQuotaError(error);
      if (!isQuotaErr) {
        try {
          const existingAttempt = await getDoc(attemptRef);
          if (existingAttempt.exists()) {
            return { synced: true, attemptId: safeAttemptId, alreadyExists: true, profileVerified: true };
          }
        } catch {
          // ignore secondary check failure
        }
      }
      const info = logFirestoreError(error, OperationType.CREATE, attemptPath);
      return {
        synced: false,
        attemptId: safeAttemptId,
        errorCode: isQuotaErr ? 'resource-exhausted' : String(error?.code || 'firestore/write-failed'),
        errorMessage: info.error,
      };
    }
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

  let profileVerified = false;
  try {
    // 1. Ensure students/{uid} exists (0 Firestore reads for both cached returning and brand-new students)
    profileVerified = await ensureStudentProfileDocExists(uid, studentProfileSeed, false);

    // 2. Write attempts/{id} directly without pre-reading attempts/{id} (saves 1-2 reads per submit)
    try {
      await setDoc(attemptRef, payload);
      return { synced: true, attemptId: safeAttemptId, profileVerified: true };
    } catch (writeErr: any) {
      if (isFirestoreQuotaError(writeErr)) {
        throw writeErr;
      }
      const writeCode = String(writeErr?.code || '').toLowerCase();
      // Always re-verify/re-create students/{uid} once and retry setDoc on permission-denied
      if (writeCode.includes('permission-denied')) {
        clearCachedProfileUid(uid);
        profileVerified = await ensureStudentProfileDocExists(uid, studentProfileSeed, true);
        await setDoc(attemptRef, payload);
        return { synced: true, attemptId: safeAttemptId, profileVerified: true };
      }
      throw writeErr;
    }
  } catch (error: any) {
    const rawCode = String(error?.code || '');
    const isQuotaErr = isFirestoreQuotaError(error);

    // Idempotency check ONLY on non-quota failures: if attempt already landed on Firestore under this UID, mark synced without overwriting
    if (!isQuotaErr) {
      try {
        const existingAttempt = await getDoc(attemptRef);
        if (existingAttempt.exists()) {
          return { synced: true, attemptId: safeAttemptId, alreadyExists: true, profileVerified };
        }
      } catch {
        // Keep original write error below
      }
    }

    const info = logFirestoreError(error, OperationType.CREATE, attemptPath);
    const errorCode = isQuotaErr ? 'resource-exhausted' : (rawCode || 'firestore/write-failed');
    return {
      synced: false,
      attemptId: safeAttemptId,
      profileVerified,
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
    // Create-first: 0 pre-reads on normal activity sync to conserve Spark read quota
    await setDoc(activityRef, payload);
    return { synced: true, activityId: safeActivityId };
  } catch (error: any) {
    const isQuotaErr = isFirestoreQuotaError(error);
    if (!isQuotaErr) {
      try {
        const existing = await getDoc(activityRef);
        if (existing.exists()) {
          return { synced: true, activityId: safeActivityId, alreadyExists: true };
        }
      } catch {
        // ignore
      }
    }
    const info = logFirestoreError(error, OperationType.CREATE, activityPath);
    return {
      synced: false,
      activityId: safeActivityId,
      errorCode: isQuotaErr ? 'resource-exhausted' : String(error?.code || 'firestore/write-failed'),
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

function extractCreatedAtMs(data: Record<string, any> | undefined): number {
  if (!data) return 0;
  const c = data.createdAt;
  if (c && typeof c.toMillis === 'function') {
    const ms = c.toMillis();
    if (Number.isFinite(ms) && ms > 0) return ms;
  }
  if (c && typeof c.seconds === 'number') {
    return c.seconds * 1000 + Math.floor((Number(c.nanoseconds) || 0) / 1e6);
  }
  const rawTs = Number(data.timestamp);
  return Number.isFinite(rawTs) && rawTs > 0 ? rawTs : 0;
}

const DEFAULT_ADMIN_PAGE_SIZE = 250;
const STUDENTS_PAGE_SIZE = 400;
const MAX_STUDENTS_PAGES = 5;
const DELTA_OVERLAP_MS = 60_000;

let lastAttemptDocCursor: QueryDocumentSnapshot<DocumentData> | null = null;
let lastActivityDocCursor: QueryDocumentSnapshot<DocumentData> | null = null;

export function resetPaginationCursors(): void {
  lastAttemptDocCursor = null;
  lastActivityDocCursor = null;
}

export interface SubscribeCloudOptions {
  attemptsSinceCreatedMs?: number;
  activitiesSinceCreatedMs?: number;
  pageSize?: number;
}

export interface CloudUpdatePayload {
  attempts?: ExamRecord[];
  students?: UserProfile[];
  activities?: LearningActivity[];
  collection?: 'attempts' | 'students' | 'activities';
  isDelta?: boolean;
  hasMoreAttempts?: boolean;
  hasMoreActivities?: boolean;
  latestAttemptCreatedMs?: number;
  oldestAttemptCreatedMs?: number;
  latestActivityCreatedMs?: number;
  oldestActivityCreatedMs?: number;
}

export function subscribeAttemptsData(
  user: FirebaseUser,
  onUpdate: (payload: CloudUpdatePayload) => void,
  onError?: (err: Error, collectionName?: 'attempts') => void,
  options?: Pick<SubscribeCloudOptions, 'attemptsSinceCreatedMs' | 'pageSize'>
): Unsubscribe {
  if (!isTeacherFirebaseUser(user)) {
    return () => {};
  }

  const pageLimit = options?.pageSize || DEFAULT_ADMIN_PAGE_SIZE;
  const attemptsSinceMs = Number(options?.attemptsSinceCreatedMs) || 0;
  const effectiveSinceMs =
    attemptsSinceMs > 0 ? Math.max(0, attemptsSinceMs - DELTA_OVERLAP_MS) : 0;

  const attemptsQuery =
    effectiveSinceMs > 0
      ? query(
          collection(db, 'attempts'),
          where('createdAt', '>', Timestamp.fromMillis(effectiveSinceMs)),
          orderBy('createdAt', 'desc'),
          limit(pageLimit)
        )
      : query(collection(db, 'attempts'), orderBy('createdAt', 'desc'), limit(pageLimit));

  return onSnapshot(
    attemptsQuery,
    (snapshot) => {
      if (attemptsSinceMs === 0) {
        lastAttemptDocCursor =
          snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      }
      let latestCreated = 0;
      let oldestCreated = 0;
      const attempts: ExamRecord[] = [];
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const cMs = extractCreatedAtMs(data);
        if (cMs > latestCreated) latestCreated = cMs;
        if (cMs > 0 && (oldestCreated === 0 || cMs < oldestCreated)) oldestCreated = cMs;
        const parsed = safeParseExamRecord(d.id, data);
        if (parsed && parsed.id) attempts.push(parsed);
      });
      attempts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate({
        attempts,
        collection: 'attempts',
        isDelta: attemptsSinceMs > 0,
        hasMoreAttempts: attemptsSinceMs === 0 ? snapshot.docs.length >= pageLimit : undefined,
        latestAttemptCreatedMs: latestCreated || undefined,
        oldestAttemptCreatedMs: attemptsSinceMs === 0 ? oldestCreated || undefined : undefined,
      });
    },
    (error) => {
      const info = logFirestoreError(error, OperationType.LIST, 'attempts');
      if (onError) onError(new Error(info.error), 'attempts');
    }
  );
}

export function subscribeActivitiesData(
  user: FirebaseUser,
  onUpdate: (payload: CloudUpdatePayload) => void,
  onError?: (err: Error, collectionName?: 'activities') => void,
  options?: Pick<SubscribeCloudOptions, 'activitiesSinceCreatedMs' | 'pageSize'>
): Unsubscribe {
  if (!isTeacherFirebaseUser(user)) {
    return () => {};
  }

  const pageLimit = options?.pageSize || DEFAULT_ADMIN_PAGE_SIZE;
  const activitiesSinceMs = Number(options?.activitiesSinceCreatedMs) || 0;
  const effectiveSinceMs =
    activitiesSinceMs > 0 ? Math.max(0, activitiesSinceMs - DELTA_OVERLAP_MS) : 0;

  const activitiesQuery =
    effectiveSinceMs > 0
      ? query(
          collection(db, 'activities'),
          where('createdAt', '>', Timestamp.fromMillis(effectiveSinceMs)),
          orderBy('createdAt', 'desc'),
          limit(pageLimit)
        )
      : query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(pageLimit));

  return onSnapshot(
    activitiesQuery,
    (snapshot) => {
      if (activitiesSinceMs === 0) {
        lastActivityDocCursor =
          snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      }
      let latestCreated = 0;
      let oldestCreated = 0;
      const activities: LearningActivity[] = [];
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const cMs = extractCreatedAtMs(data);
        if (cMs > latestCreated) latestCreated = cMs;
        if (cMs > 0 && (oldestCreated === 0 || cMs < oldestCreated)) oldestCreated = cMs;
        const parsed = safeParseLearningActivity(d.id, data);
        if (parsed && parsed.id) activities.push(parsed);
      });
      activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate({
        activities,
        collection: 'activities',
        isDelta: activitiesSinceMs > 0,
        hasMoreActivities: activitiesSinceMs === 0 ? snapshot.docs.length >= pageLimit : undefined,
        latestActivityCreatedMs: latestCreated || undefined,
        oldestActivityCreatedMs: activitiesSinceMs === 0 ? oldestCreated || undefined : undefined,
      });
    },
    (error) => {
      const info = logFirestoreError(error, OperationType.LIST, 'activities');
      if (onError) onError(new Error(info.error), 'activities');
    }
  );
}

export function subscribeCloudData(
  user: FirebaseUser,
  onUpdate: (payload: CloudUpdatePayload) => void,
  onError?: (err: Error, collectionName?: 'attempts' | 'students' | 'activities') => void,
  options?: SubscribeCloudOptions
): Unsubscribe {
  // Strictly attach live Firestore listeners ONLY for verified Teacher Admin.
  // Students write directly to Firestore and read from localStorage — 0 continuous reads per student!
  if (!isTeacherFirebaseUser(user)) {
    return () => {};
  }

  const unsubAttempts = subscribeAttemptsData(user, onUpdate, onError, options);
  const unsubActivities = subscribeActivitiesData(user, onUpdate, onError, options);

  return () => {
    try {
      unsubAttempts();
    } catch {
      // ignore
    }
    try {
      unsubActivities();
    } catch {
      // ignore
    }
  };
}

export interface FetchCloudSnapshotResult {
  attempts: ExamRecord[];
  students: UserProfile[];
  activities: LearningActivity[];
  isDelta: {
    attempts: boolean;
    activities: boolean;
  };
  hasMore: {
    attempts?: boolean;
    activities?: boolean;
  };
  latestCreatedMs: {
    attempts?: number;
    activities?: number;
  };
  oldestCreatedMs: {
    attempts?: number;
    activities?: number;
  };
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

export async function fetchCloudDataOnce(options?: {
  attemptsSinceCreatedMs?: number;
  activitiesSinceCreatedMs?: number;
  includeAttempts?: boolean;
  includeActivities?: boolean;
  includeStudents?: boolean;
  pageSize?: number;
}): Promise<FetchCloudSnapshotResult | null> {
  const user = auth.currentUser;
  if (!isTeacherFirebaseUser(user)) return null;

  const pageLimit = options?.pageSize || DEFAULT_ADMIN_PAGE_SIZE;
  const attemptsSinceMs = Number(options?.attemptsSinceCreatedMs) || 0;
  const activitiesSinceMs = Number(options?.activitiesSinceCreatedMs) || 0;
  const shouldFetchAttempts = options?.includeAttempts !== false;
  const shouldFetchActivities = options?.includeActivities !== false;

  let attempts: ExamRecord[] = [];
  let students: UserProfile[] = [];
  let activities: LearningActivity[] = [];
  const fetched = { attempts: false, students: false, activities: false };
  const hasMore: { attempts?: boolean; activities?: boolean } = {};
  const latestCreatedMs: { attempts?: number; activities?: number } = {};
  const oldestCreatedMs: { attempts?: number; activities?: number } = {};
  const errors: { attempts?: string; students?: string; activities?: string } = {};

  const attemptsTask = (async () => {
    if (!shouldFetchAttempts) return;
    try {
      const effectiveAttemptsSinceMs =
        attemptsSinceMs > 0 ? Math.max(0, attemptsSinceMs - DELTA_OVERLAP_MS) : 0;
      const attemptsQuery =
        effectiveAttemptsSinceMs > 0
          ? query(
              collection(db, 'attempts'),
              where('createdAt', '>', Timestamp.fromMillis(effectiveAttemptsSinceMs)),
              orderBy('createdAt', 'desc'),
              limit(pageLimit)
            )
          : query(collection(db, 'attempts'), orderBy('createdAt', 'desc'), limit(pageLimit));
      const attSnap = await getDocs(attemptsQuery);
      if (attemptsSinceMs === 0) {
        lastAttemptDocCursor =
          attSnap.docs.length > 0 ? attSnap.docs[attSnap.docs.length - 1] : null;
      }
      let maxC = 0;
      let minC = 0;
      const list: ExamRecord[] = [];
      attSnap.docs.forEach((d) => {
        const data = d.data();
        const cMs = extractCreatedAtMs(data);
        if (cMs > maxC) maxC = cMs;
        if (cMs > 0 && (minC === 0 || cMs < minC)) minC = cMs;
        const parsed = safeParseExamRecord(d.id, data);
        if (parsed && parsed.id) list.push(parsed);
      });
      attempts = list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      if (maxC > 0) latestCreatedMs.attempts = maxC;
      if (attemptsSinceMs === 0) {
        hasMore.attempts = attSnap.docs.length >= pageLimit;
        if (minC > 0) oldestCreatedMs.attempts = minC;
      }
      fetched.attempts = true;
    } catch (error) {
      const info = logFirestoreError(error, OperationType.LIST, 'attempts');
      errors.attempts = info.error;
    }
  })();

  const activitiesTask = (async () => {
    if (!shouldFetchActivities) return;
    try {
      const effectiveActivitiesSinceMs =
        activitiesSinceMs > 0 ? Math.max(0, activitiesSinceMs - DELTA_OVERLAP_MS) : 0;
      const activitiesQuery =
        effectiveActivitiesSinceMs > 0
          ? query(
              collection(db, 'activities'),
              where('createdAt', '>', Timestamp.fromMillis(effectiveActivitiesSinceMs)),
              orderBy('createdAt', 'desc'),
              limit(pageLimit)
            )
          : query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(pageLimit));
      const actSnap = await getDocs(activitiesQuery);
      if (activitiesSinceMs === 0) {
        lastActivityDocCursor =
          actSnap.docs.length > 0 ? actSnap.docs[actSnap.docs.length - 1] : null;
      }
      let maxC = 0;
      let minC = 0;
      const list: LearningActivity[] = [];
      actSnap.docs.forEach((d) => {
        const data = d.data();
        const cMs = extractCreatedAtMs(data);
        if (cMs > maxC) maxC = cMs;
        if (cMs > 0 && (minC === 0 || cMs < minC)) minC = cMs;
        const parsed = safeParseLearningActivity(d.id, data);
        if (parsed && parsed.id) list.push(parsed);
      });
      activities = list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      if (maxC > 0) latestCreatedMs.activities = maxC;
      if (activitiesSinceMs === 0) {
        hasMore.activities = actSnap.docs.length >= pageLimit;
        if (minC > 0) oldestCreatedMs.activities = minC;
      }
      fetched.activities = true;
    } catch (error) {
      const info = logFirestoreError(error, OperationType.LIST, 'activities');
      errors.activities = info.error;
    }
  })();

  const studentsTask = (async () => {
    if (!options?.includeStudents) return;
    const collected: UserProfile[] = [];
    try {
      let lastStudentDoc: QueryDocumentSnapshot<DocumentData> | null = null;
      for (let page = 0; page < MAX_STUDENTS_PAGES; page++) {
        const stQuery: Query<DocumentData> = lastStudentDoc
          ? query(collection(db, 'students'), startAfter(lastStudentDoc), limit(STUDENTS_PAGE_SIZE))
          : query(collection(db, 'students'), limit(STUDENTS_PAGE_SIZE));
        const stSnap: QuerySnapshot<DocumentData> = await getDocs(stQuery);
        stSnap.docs.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
          const parsed = safeParseUserProfile(d.id, d.data());
          if (parsed && parsed.id) collected.push(parsed);
        });
        if (stSnap.docs.length < STUDENTS_PAGE_SIZE) {
          break;
        }
        lastStudentDoc = stSnap.docs[stSnap.docs.length - 1];
      }
      students = collected;
      fetched.students = true;
    } catch (error) {
      if (collected.length > 0) {
        students = collected;
        fetched.students = true;
      }
      const info = logFirestoreError(error, OperationType.LIST, 'students');
      errors.students = info.error;
    }
  })();

  await Promise.allSettled([attemptsTask, activitiesTask, studentsTask]);

  return {
    attempts,
    students,
    activities,
    isDelta: { attempts: attemptsSinceMs > 0, activities: activitiesSinceMs > 0 },
    hasMore,
    latestCreatedMs,
    oldestCreatedMs,
    fetched,
    errors,
  };
}

export async function fetchOlderAttemptsPage(
  beforeCreatedMs: number,
  pageSize = DEFAULT_ADMIN_PAGE_SIZE
): Promise<{
  attempts: ExamRecord[];
  hasMore: boolean;
  oldestCreatedMs?: number;
  error?: string;
}> {
  const user = auth.currentUser;
  if (!isTeacherFirebaseUser(user)) {
    return { attempts: [], hasMore: false, error: 'Chưa xác thực tài khoản giáo viên.' };
  }
  try {
    // Prefer DocumentSnapshot cursor (tie-safe); fall back to startAt(Timestamp) after cache reload
    // so tied createdAt timestamps at page boundaries are never skipped (merged by doc ID).
    const usedDocCursor = Boolean(lastAttemptDocCursor);
    const q = lastAttemptDocCursor
      ? query(
          collection(db, 'attempts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastAttemptDocCursor),
          limit(pageSize)
        )
      : query(
          collection(db, 'attempts'),
          orderBy('createdAt', 'desc'),
          startAt(Timestamp.fromMillis(beforeCreatedMs)),
          limit(pageSize)
        );
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      lastAttemptDocCursor = snap.docs[snap.docs.length - 1];
    } else {
      lastAttemptDocCursor = null;
    }
    let minC = 0;
    const list: ExamRecord[] = [];
    snap.docs.forEach((d) => {
      const data = d.data();
      const cMs = extractCreatedAtMs(data);
      if (cMs > 0 && (minC === 0 || cMs < minC)) minC = cMs;
      const parsed = safeParseExamRecord(d.id, data);
      if (parsed && parsed.id) list.push(parsed);
    });
    const attempts = list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return {
      attempts,
      hasMore: usedDocCursor ? snap.docs.length >= pageSize : snap.docs.length >= pageSize,
      oldestCreatedMs: minC || undefined,
    };
  } catch (error) {
    const info = logFirestoreError(error, OperationType.LIST, 'attempts');
    return { attempts: [], hasMore: false, error: info.error };
  }
}

export async function fetchAttemptsTimestampFallback(
  pageSize = DEFAULT_ADMIN_PAGE_SIZE
): Promise<{
  attempts: ExamRecord[];
  error?: string;
}> {
  const user = auth.currentUser;
  if (!isTeacherFirebaseUser(user)) {
    return { attempts: [], error: 'Chưa xác thực tài khoản giáo viên.' };
  }
  try {
    const q = query(collection(db, 'attempts'), orderBy('timestamp', 'desc'), limit(pageSize));
    const snap = await getDocs(q);
    const list: ExamRecord[] = [];
    snap.docs.forEach((d) => {
      const parsed = safeParseExamRecord(d.id, d.data());
      if (parsed && parsed.id) list.push(parsed);
    });
    return { attempts: list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) };
  } catch (error) {
    const info = logFirestoreError(error, OperationType.LIST, 'attempts');
    return { attempts: [], error: info.error };
  }
}

export async function fetchOlderActivitiesPage(
  beforeCreatedMs: number,
  pageSize = DEFAULT_ADMIN_PAGE_SIZE
): Promise<{
  activities: LearningActivity[];
  hasMore: boolean;
  oldestCreatedMs?: number;
  error?: string;
}> {
  const user = auth.currentUser;
  if (!isTeacherFirebaseUser(user)) {
    return { activities: [], hasMore: false, error: 'Chưa xác thực tài khoản giáo viên.' };
  }
  try {
    const q = lastActivityDocCursor
      ? query(
          collection(db, 'activities'),
          orderBy('createdAt', 'desc'),
          startAfter(lastActivityDocCursor),
          limit(pageSize)
        )
      : query(
          collection(db, 'activities'),
          orderBy('createdAt', 'desc'),
          startAt(Timestamp.fromMillis(beforeCreatedMs)),
          limit(pageSize)
        );
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      lastActivityDocCursor = snap.docs[snap.docs.length - 1];
    } else {
      lastActivityDocCursor = null;
    }
    let minC = 0;
    const list: LearningActivity[] = [];
    snap.docs.forEach((d) => {
      const data = d.data();
      const cMs = extractCreatedAtMs(data);
      if (cMs > 0 && (minC === 0 || cMs < minC)) minC = cMs;
      const parsed = safeParseLearningActivity(d.id, data);
      if (parsed && parsed.id) list.push(parsed);
    });
    const activities = list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return {
      activities,
      hasMore: snap.docs.length >= pageSize,
      oldestCreatedMs: minC || undefined,
    };
  } catch (error) {
    const info = logFirestoreError(error, OperationType.LIST, 'activities');
    return { activities: [], hasMore: false, error: info.error };
  }
}
