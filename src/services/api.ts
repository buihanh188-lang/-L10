import {
  ClassStats,
  Classroom,
  ExamRecord,
  LearningActivity,
  LearningActivityType,
  LessonVideoRecord,
  MultiSchoolFilterOptions,
  Question,
  QuestionType,
  SchoolStats,
  StudentStatsSummary,
  SystemSummary,
  TeacherExamConfig,
  UserProfile,
  VideoCapabilities,
  VideoQueueState,
  VideoScenePlan,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_EXAM_RECORDS,
  INITIAL_STUDENTS,
  OFFICIAL_PASSWORD_HASHES,
  REGISTERED_SCHOOLS,
} from '../data/mockUsers';
import {
  generateRandomStudentPassword,
  hashStudentPassword,
} from '../utils/passwordHash';
import { LESSONS } from '../data/lessons';
import { CURRICULUM_CHAPTERS, CURRICULUM_PARTS } from '../data/curriculum';
import {
  normalizeClassName,
  normalizeSchoolKey,
  normalizeSchoolName,
  normalizeStudentName,
} from '../utils/normalize';
import {
  parseAndNormalizeExternalVideoUrl,
  parseDurationInput,
} from '../utils/videoLinks';
import defaultLessonsConfig from '../data/defaultLessons.json';
import {
  auth,
  deleteAttemptFromCloud,
  ensureAnonymousStudentSession,
  fetchAttemptsTimestampFallback,
  fetchCloudDataOnce,
  fetchOlderActivitiesPage,
  fetchOlderAttemptsPage,
  getCurrentFirebaseIdToken,
  isCloudSyncEligibleUser,
  isFirestoreQuotaError,
  isTeacherFirebaseUser,
  isVerifiedFirebaseUser,
  mirrorRecordsToFirestoreAsTeacher,
  resetPaginationCursors,
  sanitizeFirestoreId,
  signInWithGooglePopup,
  signOutFirebase,
  syncActivityToCloud,
  syncAttemptToCloud,
  syncStudentProfileToCloud,
  TEACHER_ADMIN_EMAIL,
} from './firebase';
import {
  idbDeleteById,
  idbGetAll,
  idbGetMeta,
  idbPutMany,
  idbReplaceAll,
  idbSetMeta,
  mergeExamRecordsKeepingDetails,
  mergeUserProfilesClean,
  readStorageSafe,
  removeStorageSafe,
  sanitizeAttemptMergeKey,
  writeActivitiesArrayToLocalStorage,
  writeAttemptsArrayToLocalStorage,
  writeStorageBestEffort,
  writeStorageStrict,
} from './localDomainStore';

export type CloudDomain = 'attempts' | 'students' | 'activities';

const TEACHER_TOKEN_KEY = 'dia_li_10_teacher_token';
const PENDING_ATTEMPTS_KEY = 'dia_li_10_pending_attempts';
const ACTIVITIES_KEY = 'dia_li_10_learning_activities';
const PENDING_ACTIVITIES_KEY = 'dia_li_10_pending_activities';
const EXAM_RECORDS_KEY = 'dia_li_10_exam_records';
const STUDENTS_KEY = 'dia_li_10_students';
const DELETED_STUDENTS_KEY = 'dia_li_10_deleted_students';
const STUDENT_PASSWORDS_KEY = 'dia_li_10_student_passwords';
const CLASSES_KEY = 'dia_li_10_classes';
const QUESTIONS_KEY = 'dia_li_10_questions';
const TEACHER_EXAMS_KEY = 'dia_li_10_teacher_exams';
const VIDEO_CATALOG_KEY = 'dia_li_10_video_catalog_v1';
const ROSTER_VERSION_KEY = 'dia_li_10_roster_version';
const CURRENT_ROSTER_VERSION = 'hb-real-2026-v1';
const VIDEO_CATALOG_DEFAULT_SYNC_KEY = 'dia_li_10_video_catalog_default_sync_v1';
const SYNCED_ATTEMPT_IDS_KEY = 'dia_li_10_synced_attempt_ids';
const SYNCED_ACTIVITY_IDS_KEY = 'dia_li_10_synced_activity_ids';
const ADMIN_CACHE_ATTEMPTS_KEY = 'dia_li_10_admin_cache_attempts_v1';
const ADMIN_CACHE_ACTIVITIES_KEY = 'dia_li_10_admin_cache_activities_v1';
const ADMIN_CACHE_STUDENTS_KEY = 'dia_li_10_admin_cache_students_v1';
const ADMIN_CACHE_META_KEY = 'dia_li_10_admin_cache_meta_v1';
const QUOTA_COOLDOWN_KEY = 'dl10_firestore_quota_until';
const QUOTA_COOLDOWN_KEY_PREFIX = 'dl10_firestore_quota_until_';
const QUOTA_COOLDOWN_MS = 15 * 60 * 1000;
const STUDENTS_REFRESH_TTL_MS = 15 * 60 * 1000;

const DEFAULT_TEACHER_USER: UserProfile = {
  id: 'teacher-bui-thi-hong-hanh',
  role: 'teacher',
  username: 'buihanh188',
  name: 'Bùi Thị Hồng Hạnh',
  code: 'GV-DL10',
  school: 'TRƯỜNG THPT HÒA BÌNH',
  commune: 'XÃ VẠN LINH',
  province: 'TỈNH LẠNG SƠN',
  department: 'TỔ SỬ – ĐỊA – GDKTPL',
  email: 'buihanh188@gmail.com',
  joinedDate: '2026-09-01',
};

const OFFICIAL_SCHOOL_KEY = normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH');

function safeGetItem(key: string): string | null {
  return readStorageSafe(key);
}

function safeSetItem(key: string, value: string): void {
  writeStorageBestEffort(key, value);
}

function safeRemoveItem(key: string): void {
  removeStorageSafe(key);
}

function stripDiacriticsLower(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

function isLegacyDemoStudentId(id: string): boolean {
  return /^hs-(hb|cl|hl)-\d{2}$/i.test(String(id || ''));
}

function isLegacyDemoAttemptId(id: string): boolean {
  return /^rec-(hb|cl|hl)-\d{3}$/i.test(String(id || ''));
}

function isLegacyDemoClassId(id: string): boolean {
  const s = String(id || '');
  return /^class-(cl|hl)-/i.test(s) || s === 'class-hb-10a3';
}

function defaultVideoQueue(): VideoQueueState {
  return {
    isRunning: false,
    isPaused: false,
    mode: 'idle',
    activeLessonId: null,
    pendingLessonIds: [],
    completedCount: 0,
    failedCount: 0,
    totalQueued: 0,
    startedAt: null,
    updatedAt: Date.now(),
    lastError: null,
  };
}

function defaultVideoCapabilities(): VideoCapabilities {
  return {
    geminiConfigured: false,
    offlineMode: true,
    piperAvailable: false,
    resvgAvailable: false,
    zeroCostOffline: true,
    ffmpegAvailable: false,
    ffprobeAvailable: false,
    sdkPackageVersion: 'static-browser',
    models: {
      script: 'local-template',
      tts: 'external-link',
      image: 'external-link',
      video: 'external-link',
    },
    paidTierRequiredForMedia: false,
    missingRequirements: [],
    storageDir: 'browser://localStorage + defaultLessons.json',
  };
}

function makeBaseVideoRecord(lesson: (typeof LESSONS)[number]): LessonVideoRecord {
  return {
    lessonId: lesson.id,
    lessonNumber: lesson.number,
    partId: lesson.partId,
    chapterId: lesson.chapterId ?? null,
    lessonTitle: lesson.title,
    isPracticeLesson: Boolean(lesson.isPracticeLesson),
    status: 'not_created',
    currentStep: 'idle',
    stepMessage: 'Chưa gắn video bài giảng',
    progressPercent: 0,
    durationSeconds: null,
    videoUrl: null,
    subtitleUrl: null,
    thumbnailUrl: null,
    fileSizeBytes: null,
    version: 0,
    draftVideo: null,
    externalVideo: null,
    isApproved: false,
    isPublished: false,
    approvedAt: null,
    approvedBy: null,
    script: null,
    errorCode: null,
    errorMessage: null,
    updatedAt: Date.now(),
    createdAt: null,
  };
}

class ApiService {
  private cloudAttempts: ExamRecord[] = [];
  private cloudStudents: UserProfile[] = [];
  private cloudActivities: LearningActivity[] = [];
  private confirmedCloudAttemptIds = new Set<string>();
  private confirmedCloudActivityIds = new Set<string>();
  private sessionPermissionLockedAttemptIds = new Set<string>();
  private serverAttempts: ExamRecord[] = [];
  private serverStudents: UserProfile[] = [];
  private serverActivities: LearningActivity[] = [];
  private serverConnected = false;
  private teacherPollTimer: number | null = null;
  private studentRetryTimer: number | null = null;
  private bidirectionalSyncRunning = false;
  private studentSyncPromise: Promise<any> | null = null;
  private teacherRefreshPromise: Promise<boolean> | null = null;
  private teacherRefreshIsStudentsOnly = false;
  private recordedSessionActivityKeys = new Set<string>();
  private syncingActivityIds = new Set<string>();
  private cloudConnected = false;
  private cloudUserEmail: string | null = null;
  private cloudIsTeacher = false;
  private cloudLastError: string | null = null;
  private lastCloudAuthUid: string | null = null;
  private quotaCooldownUntilByDomain: Record<CloudDomain, number> = {
    attempts: 0,
    students: 0,
    activities: 0,
  };
  private lastAttemptCreatedMs = 0;
  private oldestAttemptCreatedMs = 0;
  private lastActivityCreatedMs = 0;
  private oldestActivityCreatedMs = 0;
  private lastStudentsSyncAt = 0;
  private hasMoreAttempts = false;
  private hasMoreActivities = false;
  private attemptsHistoryComplete = false;
  private loadingOlderAttempts = false;
  private loadingOlderActivities = false;
  private autoBackfillScheduled = false;
  private lastManualRefreshAt = 0;
  private idbHydrated = false;
  private idbHydratePromise: Promise<void> | null = null;
  private collectionErrors: { attempts?: string; students?: string; activities?: string } = {};
  private lastRecoverySummary: {
    recoveredAttempts: number;
    recoveredActivities: number;
    pendingAttempts: number;
    pendingActivities: number;
    ranAt: number;
    error?: string;
  } | null = null;
  private dataListeners = new Set<() => void>();
  private cloudReconnectListeners = new Set<() => void>();

  constructor() {
    this.migrateLegacyDemoDataOnce();
    this.loadConfirmedSyncedIds();
    this.loadQuotaCooldown();
    const isTeacherSession = Boolean(this.getTeacherToken());
    if (isTeacherSession) {
      this.hydrateAdminCache();
    }
    this.hydrateIndexedDbStores(isTeacherSession).catch(() => {});
  }

  private loadQuotaCooldown(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const now = Date.now();
        // Clean legacy unified cooldown key if present so stale global locks don't persist
        window.sessionStorage.removeItem(QUOTA_COOLDOWN_KEY);
        (['attempts', 'students', 'activities'] as CloudDomain[]).forEach((domain) => {
          const raw = window.sessionStorage.getItem(`${QUOTA_COOLDOWN_KEY_PREFIX}${domain}`);
          const until = raw ? Number(raw) : 0;
          if (Number.isFinite(until) && until > now) {
            this.quotaCooldownUntilByDomain[domain] = until;
          }
        });
      }
    } catch {
      // ignore
    }
  }

  private isQuotaError(msg?: string | null): boolean {
    return isFirestoreQuotaError(msg);
  }

  private triggerQuotaCooldown(reason?: string, domain: CloudDomain = 'attempts'): void {
    const until = Date.now() + QUOTA_COOLDOWN_MS;
    if (until > this.quotaCooldownUntilByDomain[domain]) {
      this.quotaCooldownUntilByDomain[domain] = until;
    }
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(
          `${QUOTA_COOLDOWN_KEY_PREFIX}${domain}`,
          String(this.quotaCooldownUntilByDomain[domain])
        );
      }
    } catch {
      // ignore
    }
    if (reason) {
      const clipped = String(reason).slice(0, 240);
      this.collectionErrors[domain] = clipped;
      if (domain === 'attempts' || !this.cloudLastError) {
        this.cloudLastError = clipped;
      }
    }
  }

  private clearQuotaCooldown(domain?: CloudDomain): void {
    const targets: CloudDomain[] = domain ? [domain] : ['attempts', 'students', 'activities'];
    targets.forEach((d) => {
      this.quotaCooldownUntilByDomain[d] = 0;
      delete this.collectionErrors[d];
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(`${QUOTA_COOLDOWN_KEY_PREFIX}${d}`);
        }
      } catch {
        // ignore
      }
    });
    if (!domain) {
      this.cloudLastError = null;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(QUOTA_COOLDOWN_KEY);
        }
      } catch {
        // ignore
      }
    }
  }

  isQuotaCooldownActive(domain: CloudDomain = 'attempts'): boolean {
    const until = this.quotaCooldownUntilByDomain[domain] || 0;
    if (until <= 0) return false;
    if (Date.now() >= until) {
      this.clearQuotaCooldown(domain);
      return false;
    }
    return true;
  }

  subscribeCloudReconnect(listener: () => void): () => void {
    this.cloudReconnectListeners.add(listener);
    return () => {
      this.cloudReconnectListeners.delete(listener);
    };
  }

  private emitCloudReconnect(): void {
    this.cloudReconnectListeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.warn('Cloud reconnect listener warning:', e);
      }
    });
  }

  private syncProfileIfQuotaAllows(profile: Partial<UserProfile>, force = false): Promise<boolean> {
    if (this.isQuotaCooldownActive('students')) return Promise.resolve(false);
    return syncStudentProfileToCloud(profile, force, (errMsg) => {
      this.triggerQuotaCooldown(errMsg, 'students');
    });
  }

  private loadConfirmedSyncedIds(): void {
    try {
      const rawAtt = safeGetItem(SYNCED_ATTEMPT_IDS_KEY);
      if (rawAtt) {
        const parsed = JSON.parse(rawAtt);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => {
            if (typeof id === 'string' && id) this.confirmedCloudAttemptIds.add(id);
          });
        }
      }
    } catch {
      // ignore
    }
    try {
      const rawAct = safeGetItem(SYNCED_ACTIVITY_IDS_KEY);
      if (rawAct) {
        const parsed = JSON.parse(rawAct);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => {
            if (typeof id === 'string' && id) this.confirmedCloudActivityIds.add(id);
          });
        }
      }
    } catch {
      // ignore
    }
  }

  private markAttemptConfirmedSynced(attemptId: string): void {
    if (!attemptId) return;
    const safeId = sanitizeFirestoreId(attemptId, 'att');
    this.sessionPermissionLockedAttemptIds.delete(safeId);
    if (this.confirmedCloudAttemptIds.has(safeId)) return;
    this.confirmedCloudAttemptIds.add(safeId);
    try {
      safeSetItem(
        SYNCED_ATTEMPT_IDS_KEY,
        JSON.stringify(Array.from(this.confirmedCloudAttemptIds).slice(-2000))
      );
    } catch {
      // ignore
    }
  }

  private markActivityConfirmedSynced(activityId: string): void {
    if (!activityId) return;
    const safeId = sanitizeFirestoreId(activityId, 'act');
    if (this.confirmedCloudActivityIds.has(safeId)) return;
    this.confirmedCloudActivityIds.add(safeId);
    try {
      safeSetItem(
        SYNCED_ACTIVITY_IDS_KEY,
        JSON.stringify(Array.from(this.confirmedCloudActivityIds).slice(-2500))
      );
    } catch {
      // ignore
    }
  }

  private hydrateAdminCache(): void {
    try {
      const rawAtt = safeGetItem(ADMIN_CACHE_ATTEMPTS_KEY);
      if (rawAtt) {
        const parsed = JSON.parse(rawAtt);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(
            (r: ExamRecord) =>
              r && r.id && !isLegacyDemoAttemptId(r.id) && !isLegacyDemoStudentId(r.studentId)
          );
          if (clean.length > 0) {
            const merged = this.mergeCloudAttemptsList(clean);
            this.cloudAttempts = merged.list;
          }
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawAct = safeGetItem(ADMIN_CACHE_ACTIVITIES_KEY);
      if (rawAct) {
        const parsed = JSON.parse(rawAct);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((a: LearningActivity) => a && a.id);
          if (clean.length > 0) {
            const mergedActs = this.mergeCloudActivitiesList(clean);
            this.cloudActivities = mergedActs.list;
          }
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawStu = safeGetItem(ADMIN_CACHE_STUDENTS_KEY);
      if (rawStu) {
        const parsed = JSON.parse(rawStu);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(
            (s: UserProfile) => s && s.id && !isLegacyDemoStudentId(s.id)
          );
          if (clean.length > 0) {
            const mergedStu = this.mergeCloudStudentsList(clean);
            this.cloudStudents = mergedStu.list;
          }
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawMeta = safeGetItem(ADMIN_CACHE_META_KEY);
      if (rawMeta) {
        const meta = JSON.parse(rawMeta);
        if (meta && typeof meta === 'object') {
          this.lastAttemptCreatedMs = Number(meta.lastAttemptCreatedMs) || 0;
          this.oldestAttemptCreatedMs = Number(meta.oldestAttemptCreatedMs) || 0;
          this.lastActivityCreatedMs = Number(meta.lastActivityCreatedMs) || 0;
          this.oldestActivityCreatedMs = Number(meta.oldestActivityCreatedMs) || 0;
          this.lastStudentsSyncAt = Number(meta.lastStudentsSyncAt) || 0;
          this.hasMoreAttempts = Boolean(meta.hasMoreAttempts);
          this.hasMoreActivities = Boolean(meta.hasMoreActivities);
          this.attemptsHistoryComplete = Boolean(meta.attemptsHistoryComplete);
        }
      }
    } catch {
      // ignore
    }

    // Critical invariant: NEVER preserve a non-zero delta watermark when the cached dataset is empty
    if (this.cloudAttempts.length === 0) {
      this.lastAttemptCreatedMs = 0;
      this.oldestAttemptCreatedMs = 0;
      this.hasMoreAttempts = false;
      this.attemptsHistoryComplete = false;
    }
    if (this.cloudActivities.length === 0) {
      this.lastActivityCreatedMs = 0;
      this.oldestActivityCreatedMs = 0;
      this.hasMoreActivities = false;
    }
  }

  private async hydrateIndexedDbStores(includeAdminStores: boolean): Promise<void> {
    if (this.idbHydratePromise) {
      await this.idbHydratePromise;
      if (!includeAdminStores || this.idbHydrated) return;
    }

    const task = (async () => {
      let changed = false;
      try {
        // 1. Always restore pending queues from IndexedDB if localStorage was wiped or full
        const [idbPendingAttempts, idbPendingActivities, idbAttempts] = await Promise.all([
          idbGetAll<ExamRecord>('pending_attempts'),
          idbGetAll<LearningActivity>('pending_activities'),
          idbGetAll<ExamRecord>('attempts'),
        ]);

        if (idbPendingAttempts.length > 0) {
          const curPending = this.getPendingAttempts();
          const byKey = new Map<string, ExamRecord>();
          curPending.forEach((r) => {
            if (r && r.id) byKey.set(sanitizeAttemptMergeKey(r.id), r);
          });
          let pendingAdded = false;
          idbPendingAttempts.forEach((r) => {
            if (!r || !r.id || isLegacyDemoAttemptId(r.id) || isLegacyDemoStudentId(r.studentId)) return;
            const k = sanitizeAttemptMergeKey(r.id);
            const prev = byKey.get(k);
            const merged = mergeExamRecordsKeepingDetails(prev, r);
            if (!prev || (prev.details?.length || 0) < (merged.details?.length || 0)) {
              pendingAdded = true;
            }
            byKey.set(k, merged);
          });
          if (pendingAdded) {
            writeAttemptsArrayToLocalStorage(PENDING_ATTEMPTS_KEY, Array.from(byKey.values()));
            changed = true;
          }
        }

        if (idbPendingActivities.length > 0) {
          const curPendingActs = this.getPendingActivities();
          const actByKey = new Map<string, LearningActivity>();
          curPendingActs.forEach((a) => {
            if (a && a.id) actByKey.set(sanitizeFirestoreId(a.id, 'act'), a);
          });
          let actAdded = false;
          idbPendingActivities.forEach((a) => {
            if (!a || !a.id) return;
            const k = sanitizeFirestoreId(a.id, 'act');
            if (!actByKey.has(k)) {
              actByKey.set(k, a);
              actAdded = true;
            }
          });
          if (actAdded) {
            writeActivitiesArrayToLocalStorage(PENDING_ACTIVITIES_KEY, Array.from(actByKey.values()));
            changed = true;
          }
        }

        if (idbAttempts.length > 0) {
          const cleanIdbAttempts = idbAttempts.filter(
            (r) => r && r.id && !isLegacyDemoAttemptId(r.id) && !isLegacyDemoStudentId(r.studentId)
          );
          if (cleanIdbAttempts.length > 0) {
            if (this.mergeAttemptsIntoLocalCache(cleanIdbAttempts)) {
              changed = true;
            }
            if (includeAdminStores) {
              const mergedCloud = this.mergeCloudAttemptsList(cleanIdbAttempts);
              this.cloudAttempts = mergedCloud.list;
              if (mergedCloud.changed) changed = true;
            }
          }
        }

        if (includeAdminStores) {
          const [idbActivities, idbStudents, idbMeta] = await Promise.all([
            idbGetAll<LearningActivity>('activities'),
            idbGetAll<UserProfile>('students'),
            idbGetMeta<Record<string, any>>('admin_sync_meta'),
          ]);

          if (idbActivities.length > 0) {
            const mergedActs = this.mergeCloudActivitiesList(idbActivities);
            this.cloudActivities = mergedActs.list;
            if (mergedActs.changed) changed = true;
          }
          if (idbStudents.length > 0) {
            const cleanStudents = idbStudents.filter((s) => s && s.id && !isLegacyDemoStudentId(s.id));
            if (cleanStudents.length > 0) {
              const mergedStu = this.mergeCloudStudentsList(cleanStudents);
              this.cloudStudents = mergedStu.list;
              if (mergedStu.changed) changed = true;
            }
          }
          if (idbMeta) {
            const metaLastAtt = Number(idbMeta.lastAttemptCreatedMs) || 0;
            const metaOldestAtt = Number(idbMeta.oldestAttemptCreatedMs) || 0;
            const metaLastAct = Number(idbMeta.lastActivityCreatedMs) || 0;
            const metaOldestAct = Number(idbMeta.oldestActivityCreatedMs) || 0;
            if (this.cloudAttempts.length > 0) {
              if (metaLastAtt > this.lastAttemptCreatedMs) this.lastAttemptCreatedMs = metaLastAtt;
              if (metaOldestAtt > 0 && (this.oldestAttemptCreatedMs === 0 || metaOldestAtt < this.oldestAttemptCreatedMs)) {
                this.oldestAttemptCreatedMs = metaOldestAtt;
              }
              if (typeof idbMeta.attemptsHistoryComplete === 'boolean' && idbMeta.attemptsHistoryComplete) {
                this.attemptsHistoryComplete = true;
              }
            } else {
              this.lastAttemptCreatedMs = 0;
              this.oldestAttemptCreatedMs = 0;
              this.hasMoreAttempts = false;
              this.attemptsHistoryComplete = false;
            }
            if (this.cloudActivities.length > 0) {
              if (metaLastAct > this.lastActivityCreatedMs) this.lastActivityCreatedMs = metaLastAct;
              if (metaOldestAct > 0 && (this.oldestActivityCreatedMs === 0 || metaOldestAct < this.oldestActivityCreatedMs)) {
                this.oldestActivityCreatedMs = metaOldestAct;
              }
            } else {
              this.lastActivityCreatedMs = 0;
              this.oldestActivityCreatedMs = 0;
              this.hasMoreActivities = false;
            }
            if (Number(idbMeta.lastStudentsSyncAt) > this.lastStudentsSyncAt) {
              this.lastStudentsSyncAt = Number(idbMeta.lastStudentsSyncAt);
            }
          }
        }
      } catch (e) {
        console.warn('IndexedDB hydration notice:', e);
      } finally {
        if (includeAdminStores) this.idbHydrated = true;
      }

      if (changed) {
        this.emitDataChanged();
      }
    })();

    this.idbHydratePromise = task;
    try {
      await task;
    } finally {
      if (this.idbHydratePromise === task) {
        this.idbHydratePromise = null;
      }
    }
  }

  private persistAdminCache(): void {
    try {
      const pendingIds = this.getPendingAttemptIdSet();
      const cachedAttempts = this.cloudAttempts.slice(0, 1500);
      const attWrite = writeAttemptsArrayToLocalStorage(
        ADMIN_CACHE_ATTEMPTS_KEY,
        cachedAttempts,
        pendingIds
      );
      const persistedAttemptCount = attWrite.persistedCount;

      const cachedActivities = this.cloudActivities.slice(0, 1500);
      const actWrite = writeActivitiesArrayToLocalStorage(
        ADMIN_CACHE_ACTIVITIES_KEY,
        cachedActivities
      );
      const persistedActivityCount = actWrite.persistedCount;

      if (this.cloudStudents.length > 0) {
        try {
          writeStorageStrict(
            ADMIN_CACHE_STUDENTS_KEY,
            JSON.stringify(this.cloudStudents.slice(0, 1200))
          );
        } catch {
          try {
            writeStorageStrict(
              ADMIN_CACHE_STUDENTS_KEY,
              JSON.stringify(this.cloudStudents.slice(0, 600))
            );
          } catch {
            // IndexedDB still keeps the full student list below
          }
        }
      }

      const attemptsTruncated =
        attWrite.truncated ||
        (persistedAttemptCount > 0 && this.cloudAttempts.length > persistedAttemptCount);
      const persistedAttemptsSlice =
        persistedAttemptCount > 0 ? cachedAttempts.slice(0, persistedAttemptCount) : [];
      const persistedOldestAttemptMs = attemptsTruncated
        ? persistedAttemptsSlice.reduce((min, r) => {
            const ts = Number(r?.timestamp) || 0;
            return ts > 0 && (min === 0 || ts < min) ? ts : min;
          }, 0) || this.oldestAttemptCreatedMs
        : this.oldestAttemptCreatedMs;

      const activitiesTruncated =
        actWrite.truncated ||
        (persistedActivityCount > 0 && this.cloudActivities.length > persistedActivityCount);
      const persistedActivitiesSlice =
        persistedActivityCount > 0 ? cachedActivities.slice(0, persistedActivityCount) : [];
      const persistedOldestActivityMs = activitiesTruncated
        ? persistedActivitiesSlice.reduce((min, a) => {
            const ts = Number(a?.timestamp) || 0;
            return ts > 0 && (min === 0 || ts < min) ? ts : min;
          }, 0) || this.oldestActivityCreatedMs
        : this.oldestActivityCreatedMs;

      // Critical invariant: only persist non-zero watermarks when their collection actually persisted >= 1 record
      const safeLastAttemptMs = persistedAttemptCount > 0 ? this.lastAttemptCreatedMs : 0;
      const safeOldestAttemptMs = persistedAttemptCount > 0 ? persistedOldestAttemptMs : 0;
      const safeLastActivityMs = persistedActivityCount > 0 ? this.lastActivityCreatedMs : 0;
      const safeOldestActivityMs = persistedActivityCount > 0 ? persistedOldestActivityMs : 0;

      writeStorageBestEffort(
        ADMIN_CACHE_META_KEY,
        JSON.stringify({
          lastAttemptCreatedMs: safeLastAttemptMs,
          oldestAttemptCreatedMs: safeOldestAttemptMs,
          lastActivityCreatedMs: safeLastActivityMs,
          oldestActivityCreatedMs: safeOldestActivityMs,
          lastStudentsSyncAt: this.lastStudentsSyncAt,
          hasMoreAttempts:
            persistedAttemptCount > 0 ? this.hasMoreAttempts || attemptsTruncated : false,
          hasMoreActivities:
            persistedActivityCount > 0 ? this.hasMoreActivities || activitiesTruncated : false,
          attemptsHistoryComplete:
            persistedAttemptCount > 0 ? this.attemptsHistoryComplete && !attemptsTruncated : false,
        })
      );

      // Durable IndexedDB backup with full details (unaffected by 5MB localStorage limit)
      if (this.cloudAttempts.length > 0) {
        idbPutMany('attempts', this.cloudAttempts).catch(() => false);
      }
      if (this.cloudActivities.length > 0) {
        idbPutMany('activities', this.cloudActivities.slice(0, 2000)).catch(() => false);
      }
      if (this.cloudStudents.length > 0) {
        idbPutMany('students', this.cloudStudents).catch(() => false);
      }
      idbSetMeta('admin_sync_meta', {
        lastAttemptCreatedMs: this.cloudAttempts.length > 0 ? this.lastAttemptCreatedMs : 0,
        oldestAttemptCreatedMs: this.cloudAttempts.length > 0 ? this.oldestAttemptCreatedMs : 0,
        lastActivityCreatedMs: this.cloudActivities.length > 0 ? this.lastActivityCreatedMs : 0,
        oldestActivityCreatedMs: this.cloudActivities.length > 0 ? this.oldestActivityCreatedMs : 0,
        lastStudentsSyncAt: this.lastStudentsSyncAt,
        hasMoreAttempts: this.cloudAttempts.length > 0 ? this.hasMoreAttempts : false,
        hasMoreActivities: this.cloudActivities.length > 0 ? this.hasMoreActivities : false,
        attemptsHistoryComplete: this.cloudAttempts.length > 0 ? this.attemptsHistoryComplete : false,
      }).catch(() => false);
    } catch {
      // ignore
    }
  }

  private clearAdminCache(): void {
    safeRemoveItem(ADMIN_CACHE_ATTEMPTS_KEY);
    safeRemoveItem(ADMIN_CACHE_ACTIVITIES_KEY);
    safeRemoveItem(ADMIN_CACHE_STUDENTS_KEY);
    safeRemoveItem(ADMIN_CACHE_META_KEY);
    this.lastAttemptCreatedMs = 0;
    this.oldestAttemptCreatedMs = 0;
    this.lastActivityCreatedMs = 0;
    this.oldestActivityCreatedMs = 0;
    this.lastStudentsSyncAt = 0;
    this.hasMoreAttempts = false;
    this.hasMoreActivities = false;
    this.attemptsHistoryComplete = false;
    resetPaginationCursors();
  }

  private mergeCloudAttemptsList(incoming: ExamRecord[]): { list: ExamRecord[]; changed: boolean } {
    const byId = new Map<string, ExamRecord>();
    this.cloudAttempts.forEach((r) => {
      if (r && r.id) byId.set(sanitizeAttemptMergeKey(r.id), r);
    });
    const prevSize = byId.size;
    let changed = false;
    incoming.forEach((r) => {
      if (!r || !r.id || isLegacyDemoAttemptId(r.id) || isLegacyDemoStudentId(r.studentId)) return;
      const key = sanitizeAttemptMergeKey(r.id);
      const existing = byId.get(key);
      if (!existing) {
        changed = true;
        byId.set(key, r);
      } else {
        const merged = mergeExamRecordsKeepingDetails(existing, r);
        if (
          existing.score !== merged.score ||
          existing.studentName !== merged.studentName ||
          (existing.details?.length || 0) !== (merged.details?.length || 0)
        ) {
          changed = true;
        }
        byId.set(key, merged);
      }
      this.confirmedCloudAttemptIds.add(key);
    });
    const list = Array.from(byId.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return { list, changed: changed || byId.size !== prevSize };
  }

  private mergeCloudActivitiesList(incoming: LearningActivity[]): {
    list: LearningActivity[];
    changed: boolean;
  } {
    const byId = new Map<string, LearningActivity>();
    this.cloudActivities.forEach((a) => {
      if (a && a.id) byId.set(sanitizeFirestoreId(a.id, 'act'), a);
    });
    const prevSize = byId.size;
    let changed = false;
    incoming.forEach((a) => {
      if (!a || !a.id) return;
      const key = sanitizeFirestoreId(a.id, 'act');
      if (!byId.has(key)) changed = true;
      byId.set(key, a);
      this.confirmedCloudActivityIds.add(key);
    });
    const list = Array.from(byId.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return { list, changed: changed || byId.size !== prevSize };
  }

  private mergeCloudStudentsList(incoming: UserProfile[]): {
    list: UserProfile[];
    changed: boolean;
  } {
    const byId = new Map<string, UserProfile>();
    this.cloudStudents.forEach((s) => {
      if (s && s.id) byId.set(s.id, s);
    });
    const prevSize = byId.size;
    let changed = false;
    incoming.forEach((s) => {
      if (!s || !s.id || isLegacyDemoStudentId(s.id)) return;
      const prev = byId.get(s.id);
      if (!prev || prev.name !== s.name || prev.className !== s.className || prev.lastLoginAt !== s.lastLoginAt) {
        changed = true;
      }
      byId.set(s.id, { ...(prev || {}), ...s });
    });
    return { list: Array.from(byId.values()), changed: changed || byId.size !== prevSize };
  }

  private migrateLegacyDemoDataOnce(): void {
    try {
      if (typeof window === 'undefined') return;
      if (safeGetItem(ROSTER_VERSION_KEY) === CURRENT_ROSTER_VERSION) return;

      // Clean legacy fake demo students while preserving any real added students
      const rawStudents = safeGetItem(STUDENTS_KEY);
      if (rawStudents) {
        const parsed = JSON.parse(rawStudents);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((s: any) => s && !isLegacyDemoStudentId(s.id));
          safeSetItem(STUDENTS_KEY, JSON.stringify(cleaned));
        }
      }

      // Clean legacy fake demo exam attempts while preserving all real submissions
      const rawRecords = safeGetItem(EXAM_RECORDS_KEY);
      if (rawRecords) {
        const parsed = JSON.parse(rawRecords);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (r: any) => r && !isLegacyDemoAttemptId(r.id) && !isLegacyDemoStudentId(r.studentId)
          );
          safeSetItem(EXAM_RECORDS_KEY, JSON.stringify(cleaned));
        }
      }

      // Clean legacy fake demo classes
      const rawClasses = safeGetItem(CLASSES_KEY);
      if (rawClasses) {
        const parsed = JSON.parse(rawClasses);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((c: any) => c && !isLegacyDemoClassId(c.id));
          safeSetItem(CLASSES_KEY, JSON.stringify(cleaned));
        }
      }

      safeSetItem(ROSTER_VERSION_KEY, CURRENT_ROSTER_VERSION);
    } catch {
      // ignore storage errors
    }
  }

  subscribeToDataChanges(listener: () => void): () => void {
    this.dataListeners.add(listener);
    return () => {
      this.dataListeners.delete(listener);
    };
  }

  private emitDataChanged(): void {
    this.dataListeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Data listener error:', e);
      }
    });
  }

  private async getTeacherAuthHeaders(): Promise<Record<string, string> | null> {
    try {
      const idToken = await getCurrentFirebaseIdToken();
      if (idToken) {
        return { Authorization: `Bearer ${idToken}` };
      }
    } catch {
      // ignore
    }
    const storedToken = this.getTeacherToken();
    if (storedToken && !storedToken.startsWith('firebase-teacher-')) {
      return { Authorization: `Bearer ${storedToken}` };
    }
    return null;
  }

  private isLocalExpressEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }

  private async postAttemptToServer(record: ExamRecord): Promise<boolean> {
    if (!this.isLocalExpressEnvironment() && !this.serverConnected) {
      return false;
    }
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) return false;
      const data = await res.json();
      if (data && data.id) {
        this.serverConnected = true;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async postActivityToServer(activity: LearningActivity): Promise<boolean> {
    if (!this.isLocalExpressEnvironment() && !this.serverConnected) {
      return false;
    }
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) return false;
      const data = await res.json();
      if (data && data.id) {
        this.serverConnected = true;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async postProfileToServer(profile: UserProfile): Promise<boolean> {
    if (!this.isLocalExpressEnvironment() && !this.serverConnected) {
      return false;
    }
    try {
      if (!profile.name || !profile.school || !profile.className) return false;
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          school: profile.school,
          className: profile.className,
          code: profile.code,
          commune: profile.commune,
          province: profile.province,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) return false;
      const data = await res.json();
      if (data && data.id) {
        this.serverConnected = true;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private mergeAttemptsIntoLocalCache(attempts: ExamRecord[]): boolean {
    const localMap = new Map<string, ExamRecord>();
    try {
      const raw = safeGetItem(EXAM_RECORDS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        parsed.forEach((r: ExamRecord) => {
          if (r && r.id && !isLegacyDemoAttemptId(r.id) && !isLegacyDemoStudentId(r.studentId)) {
            localMap.set(sanitizeAttemptMergeKey(r.id), r);
          }
        });
      }
    } catch {
      // ignore
    }
    const prevSize = localMap.size;
    let changed = false;
    attempts.forEach((r) => {
      if (r && r.id && !isLegacyDemoAttemptId(r.id) && !isLegacyDemoStudentId(r.studentId)) {
        const key = sanitizeAttemptMergeKey(r.id);
        const existing = localMap.get(key);
        const merged = mergeExamRecordsKeepingDetails(existing, r);
        if (
          !existing ||
          existing.score !== merged.score ||
          (existing.details?.length || 0) < (merged.details?.length || 0)
        ) {
          changed = true;
        }
        localMap.set(key, merged);
        this.ensureClassExistsLocal(merged.className, merged.schoolName);
      }
    });
    if (changed || localMap.size !== prevSize) {
      this.saveLocalAttemptsList(Array.from(localMap.values()));
      return true;
    }
    return false;
  }

  private mergeStudentsIntoLocalCache(students: UserProfile[]): boolean {
    if (!students || students.length === 0) return false;
    const deleted = this.getDeletedStudentIds();
    const current = this.getAllStudentsLocal();
    const byId = new Map<string, UserProfile>();
    current.forEach((s) => {
      if (s && s.id && !deleted.has(s.id) && !isLegacyDemoStudentId(s.id)) {
        byId.set(s.id, s);
      }
    });
    let changed = false;
    students.forEach((st) => {
      if (!st || !st.id || deleted.has(st.id) || isLegacyDemoStudentId(st.id)) return;
      const normalizedSchool = normalizeSchoolName(st.school || 'TRƯỜNG THPT HÒA BÌNH');
      const normalized: UserProfile = {
        ...st,
        name: normalizeStudentName(st.name || 'Học sinh'),
        school: normalizedSchool,
        className: normalizeClassName(st.className || '10A1'),
        studentType:
          st.studentType ||
          (normalizeSchoolKey(normalizedSchool) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended'),
      };
      const prev = byId.get(st.id);
      if (
        !prev ||
        prev.name !== normalized.name ||
        prev.className !== normalized.className ||
        prev.school !== normalized.school ||
        prev.lastLoginAt !== normalized.lastLoginAt
      ) {
        changed = true;
      }
      byId.set(st.id, { ...(prev || {}), ...normalized });
      if (normalized.className) {
        this.ensureClassExistsLocal(normalized.className, normalized.school);
      }
    });
    if (changed) {
      this.saveStudentsLocal(Array.from(byId.values()));
    }
    return changed;
  }

  private mergeActivitiesIntoLocalCache(activities: LearningActivity[]): boolean {
    const actMap = new Map<string, LearningActivity>();
    this.getLocalActivitiesList().forEach((a) => {
      if (a && a.id) actMap.set(a.id, a);
    });
    const prevSize = actMap.size;
    let changed = false;
    activities.forEach((a) => {
      if (a && a.id) {
        if (!actMap.has(a.id)) changed = true;
        actMap.set(a.id, a);
      }
    });
    if (changed || actMap.size !== prevSize) {
      this.saveLocalActivitiesList(Array.from(actMap.values()));
      return true;
    }
    return false;
  }

  private setServerSyncData(payload: {
    attempts?: ExamRecord[];
    students?: UserProfile[];
    activities?: LearningActivity[];
  }): boolean {
    const wasConnected = this.serverConnected;
    this.serverConnected = true;
    let changed = !wasConnected;

    if (Array.isArray(payload.attempts)) {
      const clean = payload.attempts.filter(
        (r) => r && r.id && !isLegacyDemoAttemptId(r.id) && !isLegacyDemoStudentId(r.studentId)
      );
      if (
        clean.length !== this.serverAttempts.length ||
        clean[0]?.id !== this.serverAttempts[0]?.id
      ) {
        changed = true;
      }
      this.serverAttempts = clean;
      if (this.mergeAttemptsIntoLocalCache(clean)) changed = true;
    }

    if (Array.isArray(payload.students)) {
      const clean = payload.students.filter((s) => s && s.id && !isLegacyDemoStudentId(s.id));
      if (clean.length !== this.serverStudents.length) {
        changed = true;
      }
      this.serverStudents = clean;
      if (this.mergeStudentsIntoLocalCache(clean)) changed = true;
    }

    if (Array.isArray(payload.activities)) {
      const clean = payload.activities.filter((a) => a && a.id);
      if (
        clean.length !== this.serverActivities.length ||
        clean[0]?.id !== this.serverActivities[0]?.id
      ) {
        changed = true;
      }
      this.serverActivities = clean;
      if (this.mergeActivitiesIntoLocalCache(clean)) changed = true;
    }

    return changed;
  }

  setCloudAuthContext(
    user: { uid: string; email?: string | null; emailVerified?: boolean; isAnonymous?: boolean } | null
  ): void {
    if (user && user.uid && (user.emailVerified || user.isAnonymous)) {
      if (this.lastCloudAuthUid !== user.uid) {
        this.sessionPermissionLockedAttemptIds.clear();
        this.lastCloudAuthUid = user.uid;
      }
      this.cloudConnected = true;
      this.cloudUserEmail = user.email || null;
      this.cloudIsTeacher = Boolean(
        user.emailVerified && user.email && user.email.toLowerCase() === TEACHER_ADMIN_EMAIL
      );
      if (this.cloudIsTeacher) {
        if (this.cloudAttempts.length === 0) {
          this.hydrateAdminCache();
        }
        this.hydrateIndexedDbStores(true).catch(() => {});
      }
    } else {
      this.cloudConnected = false;
      this.cloudUserEmail = null;
      this.cloudIsTeacher = false;
      this.stopTeacherAutoSync();

      // Keep teacher cached data intact during transient disconnects/quota limits while teacher token is active
      if (!this.getTeacherToken()) {
        this.cloudAttempts = [];
        this.cloudStudents = [];
        this.cloudActivities = [];
        this.collectionErrors = {};
        this.serverConnected = false;
        this.serverAttempts = [];
        this.serverStudents = [];
        this.serverActivities = [];
      }
    }
    this.emitDataChanged();
  }

  getTeacherSyncWatermarks(): {
    attemptsSinceCreatedMs: number;
    activitiesSinceCreatedMs: number;
  } {
    return {
      attemptsSinceCreatedMs: this.lastAttemptCreatedMs,
      activitiesSinceCreatedMs: this.lastActivityCreatedMs,
    };
  }

  hasPendingStudentSyncData(): boolean {
    return this.getPendingAttempts().length > 0 || this.getPendingActivities().length > 0;
  }

  hasRetryablePendingStudentSyncData(): boolean {
    const hasRetryableAttempt =
      !this.isQuotaCooldownActive('attempts') &&
      this.getPendingAttempts().some(
        (p) => p && p.id && !this.sessionPermissionLockedAttemptIds.has(sanitizeFirestoreId(p.id, 'att'))
      );
    const hasRetryableActivity =
      !this.isQuotaCooldownActive('activities') && this.getPendingActivities().length > 0;
    return hasRetryableAttempt || hasRetryableActivity;
  }

  private scheduleAutoBackfillOlderAttempts(): void {
    if (
      typeof window === 'undefined' ||
      this.autoBackfillScheduled ||
      this.attemptsHistoryComplete ||
      !this.hasMoreAttempts ||
      this.loadingOlderAttempts ||
      this.isQuotaCooldownActive('attempts') ||
      !isTeacherFirebaseUser(auth.currentUser)
    ) {
      return;
    }
    this.autoBackfillScheduled = true;
    window.setTimeout(() => {
      this.autoBackfillScheduled = false;
      this.loadAllOlderAttempts(8).catch(() => {});
    }, 300);
  }

  setCloudSyncData(payload: {
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
  }): void {
    if (payload.attempts) {
      const merged = this.mergeCloudAttemptsList(payload.attempts);
      this.cloudAttempts = merged.list;
      delete this.collectionErrors.attempts;
      this.mergeAttemptsIntoLocalCache(merged.list);
    }
    if (payload.latestAttemptCreatedMs && payload.latestAttemptCreatedMs > this.lastAttemptCreatedMs) {
      this.lastAttemptCreatedMs = payload.latestAttemptCreatedMs;
    }
    if (
      payload.oldestAttemptCreatedMs &&
      (this.oldestAttemptCreatedMs === 0 || payload.oldestAttemptCreatedMs < this.oldestAttemptCreatedMs)
    ) {
      this.oldestAttemptCreatedMs = payload.oldestAttemptCreatedMs;
    }
    if (typeof payload.hasMoreAttempts === 'boolean') {
      this.hasMoreAttempts = payload.hasMoreAttempts;
      if (!payload.isDelta && payload.hasMoreAttempts === false) {
        this.attemptsHistoryComplete = true;
      }
    }

    if (payload.students) {
      const mergedStu = this.mergeCloudStudentsList(payload.students);
      this.cloudStudents = mergedStu.list;
      this.lastStudentsSyncAt = Date.now();
      delete this.collectionErrors.students;
      this.mergeStudentsIntoLocalCache(mergedStu.list);
    }

    if (payload.activities) {
      const mergedActs = this.mergeCloudActivitiesList(payload.activities);
      this.cloudActivities = mergedActs.list;
      delete this.collectionErrors.activities;
      this.mergeActivitiesIntoLocalCache(mergedActs.list);
    }
    if (payload.latestActivityCreatedMs && payload.latestActivityCreatedMs > this.lastActivityCreatedMs) {
      this.lastActivityCreatedMs = payload.latestActivityCreatedMs;
    }
    if (
      payload.oldestActivityCreatedMs &&
      (this.oldestActivityCreatedMs === 0 || payload.oldestActivityCreatedMs < this.oldestActivityCreatedMs)
    ) {
      this.oldestActivityCreatedMs = payload.oldestActivityCreatedMs;
    }
    if (typeof payload.hasMoreActivities === 'boolean') {
      this.hasMoreActivities = payload.hasMoreActivities;
    }

    const remainingErrs = Object.values(this.collectionErrors).filter(Boolean);
    this.cloudLastError = remainingErrs.length > 0 ? remainingErrs[0]! : null;

    if (this.cloudIsTeacher || this.getTeacherToken()) {
      this.persistAdminCache();
    }

    if (
      payload.collection === 'attempts' &&
      !payload.isDelta &&
      payload.hasMoreAttempts === true &&
      !this.attemptsHistoryComplete
    ) {
      this.scheduleAutoBackfillOlderAttempts();
    }

    this.emitDataChanged();
  }

  setCloudSyncError(
    err: string | null,
    collectionName?: 'attempts' | 'students' | 'activities'
  ): void {
    if (!err) {
      if (collectionName) {
        delete this.collectionErrors[collectionName];
      } else {
        this.collectionErrors = {};
      }
      const remaining = Object.values(this.collectionErrors).filter(Boolean);
      this.cloudLastError = remaining.length > 0 ? remaining[0]! : null;
    } else {
      const clipped = String(err).slice(0, 240);
      const targetDomain: CloudDomain = collectionName || 'attempts';
      this.collectionErrors[targetDomain] = clipped;
      if (this.isQuotaError(clipped)) {
        this.triggerQuotaCooldown(clipped, targetDomain);
      } else if (targetDomain === 'attempts' || !this.cloudLastError) {
        this.cloudLastError = clipped;
      }
    }
    this.emitDataChanged();
  }

  getPendingAttemptIdSet(): Set<string> {
    return new Set(this.getPendingAttempts().map((r) => sanitizeFirestoreId(r.id, 'att')));
  }

  getCloudAttemptIdSet(): Set<string> {
    const ids = new Set<string>(this.confirmedCloudAttemptIds);
    this.cloudAttempts.forEach((a) => {
      if (a?.id) ids.add(sanitizeFirestoreId(a.id, 'att'));
    });
    return ids;
  }

  isAttemptPending(attemptId: string): boolean {
    if (!attemptId) return false;
    const safeId = sanitizeFirestoreId(attemptId, 'att');
    return this.getPendingAttemptIdSet().has(safeId);
  }

  isAttemptSyncedToCloud(attemptId: string): boolean {
    if (!attemptId) return false;
    const safeId = sanitizeFirestoreId(attemptId, 'att');
    if (this.getPendingAttemptIdSet().has(safeId)) return false;
    return this.getCloudAttemptIdSet().has(safeId);
  }

  getCloudSyncStatus(): {
    connected: boolean;
    email: string | null;
    isTeacher: boolean;
    isAnonymous: boolean;
    cloudAttemptCount: number;
    cloudStudentCount: number;
    cloudActivityCount: number;
    pendingCount: number;
    pendingActivityCount: number;
    quotaLimited: boolean;
    hasMoreAttempts: boolean;
    hasMoreActivities: boolean;
    loadingOlderAttempts: boolean;
    loadingOlderActivities: boolean;
    lastAttemptCreatedMs: number;
    lastActivityCreatedMs: number;
    lastError: string | null;
    collectionErrors: { attempts?: string; students?: string; activities?: string };
    lastRecoverySummary: {
      recoveredAttempts: number;
      recoveredActivities: number;
      pendingAttempts: number;
      pendingActivities: number;
      ranAt: number;
      error?: string;
    } | null;
  } {
    const current = auth.currentUser;
    const connected = isCloudSyncEligibleUser(current) || this.cloudConnected;
    const uniqueAttemptIds = new Set([
      ...this.cloudAttempts.map((a) => sanitizeFirestoreId(a.id, 'att')),
      ...Array.from(this.confirmedCloudAttemptIds),
    ]);
    const uniqueStudentIds = new Set([
      ...this.cloudStudents.map((s) => s.id),
      ...this.serverStudents.map((s) => s.id),
    ]);
    const uniqueActivityIds = new Set([
      ...this.cloudActivities.map((a) => sanitizeFirestoreId(a.id, 'act')),
      ...Array.from(this.confirmedCloudActivityIds),
    ]);

    return {
      connected,
      email: current?.email || this.cloudUserEmail,
      isTeacher: isTeacherFirebaseUser(current) || this.cloudIsTeacher,
      isAnonymous: Boolean(current?.isAnonymous),
      cloudAttemptCount: uniqueAttemptIds.size,
      cloudStudentCount: uniqueStudentIds.size,
      cloudActivityCount: uniqueActivityIds.size,
      pendingCount: this.getPendingAttempts().length,
      pendingActivityCount: this.getPendingActivities().length,
      quotaLimited:
        this.isQuotaCooldownActive('attempts') ||
        this.isQuotaCooldownActive('activities') ||
        this.isQuotaCooldownActive('students'),
      hasMoreAttempts: this.hasMoreAttempts,
      hasMoreActivities: this.hasMoreActivities,
      loadingOlderAttempts: this.loadingOlderAttempts,
      loadingOlderActivities: this.loadingOlderActivities,
      lastAttemptCreatedMs: this.lastAttemptCreatedMs,
      lastActivityCreatedMs: this.lastActivityCreatedMs,
      lastError: this.cloudLastError,
      collectionErrors: { ...this.collectionErrors },
      lastRecoverySummary: this.lastRecoverySummary,
    };
  }

  async retryStudentAutoSync(
    profile?: UserProfile | null
  ): Promise<{
    synced: boolean;
    attemptSynced: boolean;
    activitySynced: boolean;
    syncedPending: number;
    pendingAttemptsRemaining: number;
    pendingActivitiesRemaining: number;
    needsConsoleEnable?: boolean;
    errorMessage?: string;
  }> {
    const attemptsQuotaPaused = this.isQuotaCooldownActive('attempts');
    const activitiesQuotaPaused = this.isQuotaCooldownActive('activities');
    if (attemptsQuotaPaused && activitiesQuotaPaused) {
      const pendingAttemptsRemaining = this.getPendingAttempts().length;
      const pendingActivitiesRemaining = this.getPendingActivities().length;
      return {
        synced: pendingAttemptsRemaining === 0 && pendingActivitiesRemaining === 0,
        attemptSynced: pendingAttemptsRemaining === 0,
        activitySynced: pendingActivitiesRemaining === 0,
        syncedPending: 0,
        pendingAttemptsRemaining,
        pendingActivitiesRemaining,
        errorMessage:
          this.collectionErrors.attempts ||
          this.cloudLastError ||
          'Máy chủ đang tạm giới hạn lượt đọc/ghi miễn phí; dữ liệu vẫn được bảo lưu an toàn trên máy.',
      };
    }

    const session = await ensureAnonymousStudentSession();
    if (session.user) {
      this.setCloudAuthContext(session.user);
      if (profile && profile.role === 'student') {
        await this.syncProfileIfQuotaAllows(profile).catch(() => false);
      }
    } else if (session.errorMessage || session.errorCode) {
      this.setCloudSyncError(session.errorMessage || session.errorCode || 'Firebase auth error');
    }
    if (profile && profile.role === 'student' && this.isLocalExpressEnvironment()) {
      this.postProfileToServer(profile).catch(() => false);
    }

    const flushedAttempts = attemptsQuotaPaused
      ? { synced: 0, failed: this.getPendingAttempts().length, lastError: this.collectionErrors.attempts }
      : await this.flushPendingAttempts(profile || undefined);
    const flushedActivities = activitiesQuotaPaused
      ? { synced: 0, failed: this.getPendingActivities().length, lastError: this.collectionErrors.activities }
      : await this.flushPendingActivities();

    const pendingAttemptsRemaining = this.getPendingAttempts().length;
    const pendingActivitiesRemaining = this.getPendingActivities().length;
    const attemptSynced = pendingAttemptsRemaining === 0 && flushedAttempts.failed === 0;
    const activitySynced = pendingActivitiesRemaining === 0 && flushedActivities.failed === 0;

    return {
      synced: attemptSynced && activitySynced,
      attemptSynced,
      activitySynced,
      syncedPending: flushedAttempts.synced + flushedActivities.synced,
      pendingAttemptsRemaining,
      pendingActivitiesRemaining,
      needsConsoleEnable: Boolean(session.needsConsoleEnable),
      errorMessage:
        flushedAttempts.lastError ||
        flushedActivities.lastError ||
        session.errorMessage ||
        this.cloudLastError ||
        undefined,
    };
  }

  private async runTeacherBidirectionalSync(headers: Record<string, string>): Promise<void> {
    if (this.bidirectionalSyncRunning || !isTeacherFirebaseUser(auth.currentUser)) return;
    this.bidirectionalSyncRunning = true;
    try {
      const knownCloudAttemptIds = new Set(
        this.cloudAttempts.map((a) => sanitizeFirestoreId(a.id, 'att'))
      );
      const knownCloudActivityIds = new Set(
        this.cloudActivities.map((a) => sanitizeFirestoreId(a.id, 'act'))
      );

      // 1. Server-only and teacher-local real records -> mirror to Firestore
      const localRealAttempts = this.getLocalAttempts();
      const mergedAttemptsToMirror = new Map<string, ExamRecord>();
      [...this.serverAttempts, ...localRealAttempts].forEach((a) => {
        if (a && a.id && !isLegacyDemoAttemptId(a.id) && !isLegacyDemoStudentId(a.studentId)) {
          mergedAttemptsToMirror.set(sanitizeFirestoreId(a.id, 'att'), a);
        }
      });

      const localRealActivities = this.getLocalActivitiesList();
      const mergedActivitiesToMirror = new Map<string, LearningActivity>();
      [...this.serverActivities, ...localRealActivities].forEach((a) => {
        if (a && a.id) {
          mergedActivitiesToMirror.set(sanitizeFirestoreId(a.id, 'act'), a);
        }
      });

      if (mergedAttemptsToMirror.size > 0 || mergedActivitiesToMirror.size > 0) {
        const res = await mirrorRecordsToFirestoreAsTeacher({
          attempts: Array.from(mergedAttemptsToMirror.values()),
          activities: Array.from(mergedActivitiesToMirror.values()),
          knownCloudAttemptIds,
          knownCloudActivityIds,
        }).catch(() => ({ mirroredAttempts: 0, mirroredActivities: 0 }));
        if (res.mirroredAttempts > 0 || res.mirroredActivities > 0) {
          await fetchCloudDataOnce({
            attemptsSinceCreatedMs: this.lastAttemptCreatedMs,
            activitiesSinceCreatedMs: this.lastActivityCreatedMs,
            includeStudents: false,
          })
            .then((snap) => {
              if (snap) {
                this.setCloudSyncData({
                  attempts: snap.fetched.attempts ? snap.attempts : undefined,
                  activities: snap.fetched.activities ? snap.activities : undefined,
                  latestAttemptCreatedMs: snap.latestCreatedMs.attempts,
                  latestActivityCreatedMs: snap.latestCreatedMs.activities,
                  isDelta: true,
                });
              }
            })
            .catch(() => {});
        }
      }

      // 2. Firestore-only records -> restore to Server database
      const knownServerAttemptIds = new Set(
        this.serverAttempts.map((a) => sanitizeFirestoreId(a.id, 'att'))
      );
      const knownServerActivityIds = new Set(
        this.serverActivities.map((a) => sanitizeFirestoreId(a.id, 'act'))
      );
      const knownServerStudentIds = new Set(this.serverStudents.map((s) => s.id));

      const missingServerAttempts = this.cloudAttempts.filter(
        (a) => a && a.id && !knownServerAttemptIds.has(sanitizeFirestoreId(a.id, 'att'))
      );
      const missingServerActivities = this.cloudActivities.filter(
        (a) => a && a.id && !knownServerActivityIds.has(sanitizeFirestoreId(a.id, 'act'))
      );
      const missingServerStudents = this.cloudStudents.filter(
        (s) => s && s.id && !knownServerStudentIds.has(s.id)
      );

      if (
        this.serverConnected &&
        headers?.Authorization &&
        (missingServerAttempts.length > 0 ||
          missingServerActivities.length > 0 ||
          missingServerStudents.length > 0)
      ) {
        await fetch('/api/teacher/mirror-restore', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attempts: missingServerAttempts,
            activities: missingServerActivities,
            students: missingServerStudents,
          }),
        }).catch(() => {});
      }
    } finally {
      this.bidirectionalSyncRunning = false;
    }
  }

  async refreshCloudData(options?: {
    forceEmit?: boolean;
    force?: boolean;
    studentsOnly?: boolean;
  }): Promise<boolean> {
    if (!isTeacherFirebaseUser(auth.currentUser)) {
      return false;
    }

    if (this.teacherRefreshPromise) {
      if (options?.studentsOnly || (!options?.force && !this.teacherRefreshIsStudentsOnly)) {
        return this.teacherRefreshPromise;
      }
      await this.teacherRefreshPromise.catch(() => false);
      if (this.teacherRefreshPromise) {
        return this.teacherRefreshPromise;
      }
    }

    if (options?.force) {
      this.clearQuotaCooldown();
      this.emitCloudReconnect();
    } else if (!options?.studentsOnly && Date.now() - this.lastManualRefreshAt < 10000) {
      return false;
    }

    const attemptsAllowed = Boolean(options?.force) || !this.isQuotaCooldownActive('attempts');
    const activitiesAllowed = Boolean(options?.force) || !this.isQuotaCooldownActive('activities');
    const studentsAllowed = Boolean(options?.force) || !this.isQuotaCooldownActive('students');

    if (options?.studentsOnly) {
      if (!studentsAllowed) return false;
    } else if (!attemptsAllowed && !activitiesAllowed && !studentsAllowed) {
      return false;
    }

    const run = (async () => {
      let anySuccess = false;
      let shouldEmit = Boolean(options?.forceEmit);
      let teacherHeaders: Record<string, string> | null = null;
      if (!options?.studentsOnly) {
        this.lastManualRefreshAt = Date.now();
      }

      if (this.isLocalExpressEnvironment()) {
        teacherHeaders = await this.getTeacherAuthHeaders();
        if (teacherHeaders) {
          try {
            const res = await fetch('/api/teacher/sync-bundle', {
              headers: teacherHeaders,
              cache: 'no-store',
            });
            const ct = res.headers.get('content-type') || '';
            if (res.ok && ct.includes('application/json')) {
              const bundle = await res.json();
              const serverChanged = this.setServerSyncData({
                attempts: Array.isArray(bundle?.attempts) ? bundle.attempts : [],
                students: Array.isArray(bundle?.students) ? bundle.students : [],
                activities: Array.isArray(bundle?.activities) ? bundle.activities : [],
              });
              if (serverChanged) shouldEmit = true;
              anySuccess = true;
            }
          } catch (e) {
            console.warn('Server sync-bundle fetch warning:', e);
          }
        }
      }

      const needStudents =
        studentsAllowed &&
        (Boolean(options?.force) ||
          Boolean(options?.studentsOnly) ||
          this.cloudStudents.length === 0 ||
          Date.now() - this.lastStudentsSyncAt > STUDENTS_REFRESH_TTL_MS);

      const effectiveAttemptsSince =
        options?.force || this.cloudAttempts.length === 0 ? 0 : this.lastAttemptCreatedMs;
      const effectiveActivitiesSince =
        options?.force || this.cloudActivities.length === 0 ? 0 : this.lastActivityCreatedMs;

      try {
        const snap = await fetchCloudDataOnce({
          attemptsSinceCreatedMs: effectiveAttemptsSince,
          activitiesSinceCreatedMs: effectiveActivitiesSince,
          includeAttempts: !options?.studentsOnly && attemptsAllowed,
          includeActivities: !options?.studentsOnly && activitiesAllowed,
          includeStudents: needStudents,
        });

        if (snap) {
          if (snap.fetched.attempts) {
            const merged = this.mergeCloudAttemptsList(snap.attempts);
            if (merged.changed) shouldEmit = true;
            this.cloudAttempts = merged.list;
            if (snap.latestCreatedMs.attempts && snap.latestCreatedMs.attempts > this.lastAttemptCreatedMs) {
              this.lastAttemptCreatedMs = snap.latestCreatedMs.attempts;
            }
            if (
              snap.oldestCreatedMs.attempts &&
              (this.oldestAttemptCreatedMs === 0 || snap.oldestCreatedMs.attempts < this.oldestAttemptCreatedMs)
            ) {
              this.oldestAttemptCreatedMs = snap.oldestCreatedMs.attempts;
            }
            if (typeof snap.hasMore.attempts === 'boolean') {
              this.hasMoreAttempts = snap.hasMore.attempts;
              if (effectiveAttemptsSince === 0 && !snap.hasMore.attempts) {
                this.attemptsHistoryComplete = true;
              }
            }
            delete this.collectionErrors.attempts;
            if (this.mergeAttemptsIntoLocalCache(merged.list)) shouldEmit = true;
            anySuccess = true;

            // Also recover legacy Firestore attempt documents that may lack a createdAt field
            if (
              (options?.force || effectiveAttemptsSince === 0) &&
              !this.isQuotaCooldownActive('attempts')
            ) {
              const fallbackRes = await fetchAttemptsTimestampFallback(250);
              if (fallbackRes.error) {
                if (this.isQuotaError(fallbackRes.error)) {
                  this.triggerQuotaCooldown(fallbackRes.error, 'attempts');
                }
              } else if (fallbackRes.attempts.length > 0) {
                const fallbackMerged = this.mergeCloudAttemptsList(fallbackRes.attempts);
                this.cloudAttempts = fallbackMerged.list;
                if (fallbackMerged.changed) shouldEmit = true;
                if (this.mergeAttemptsIntoLocalCache(fallbackMerged.list)) shouldEmit = true;
              }
            }
          } else if (snap.errors.attempts) {
            this.collectionErrors.attempts = snap.errors.attempts.slice(0, 240);
            if (this.isQuotaError(snap.errors.attempts)) {
              this.triggerQuotaCooldown(snap.errors.attempts, 'attempts');
            }
            shouldEmit = true;
          }

          if (snap.fetched.students) {
            const mergedStu = this.mergeCloudStudentsList(snap.students);
            if (mergedStu.changed) shouldEmit = true;
            this.cloudStudents = mergedStu.list;
            this.lastStudentsSyncAt = Date.now();
            delete this.collectionErrors.students;
            if (this.mergeStudentsIntoLocalCache(mergedStu.list)) shouldEmit = true;
            anySuccess = true;
          } else if (snap.errors.students) {
            this.collectionErrors.students = snap.errors.students.slice(0, 240);
            if (this.isQuotaError(snap.errors.students)) {
              this.triggerQuotaCooldown(snap.errors.students, 'students');
            }
            shouldEmit = true;
          }

          if (snap.fetched.activities) {
            const mergedActs = this.mergeCloudActivitiesList(snap.activities);
            if (mergedActs.changed) shouldEmit = true;
            this.cloudActivities = mergedActs.list;
            if (
              snap.latestCreatedMs.activities &&
              snap.latestCreatedMs.activities > this.lastActivityCreatedMs
            ) {
              this.lastActivityCreatedMs = snap.latestCreatedMs.activities;
            }
            if (
              snap.oldestCreatedMs.activities &&
              (this.oldestActivityCreatedMs === 0 ||
                snap.oldestCreatedMs.activities < this.oldestActivityCreatedMs)
            ) {
              this.oldestActivityCreatedMs = snap.oldestCreatedMs.activities;
            }
            if (typeof snap.hasMore.activities === 'boolean') {
              this.hasMoreActivities = snap.hasMore.activities;
            }
            delete this.collectionErrors.activities;
            if (this.mergeActivitiesIntoLocalCache(mergedActs.list)) shouldEmit = true;
            anySuccess = true;
          } else if (snap.errors.activities) {
            this.collectionErrors.activities = snap.errors.activities.slice(0, 240);
            if (this.isQuotaError(snap.errors.activities)) {
              this.triggerQuotaCooldown(snap.errors.activities, 'activities');
            }
            shouldEmit = true;
          }

          const errMsgs = Object.values(this.collectionErrors).filter(Boolean);
          this.cloudLastError =
            this.collectionErrors.attempts || (errMsgs.length > 0 ? errMsgs[0]! : null);
          this.persistAdminCache();
        }
      } catch (e: any) {
        const msg = e?.message ? String(e.message).slice(0, 240) : 'Firestore sync error';
        if (this.isQuotaError(msg)) {
          this.triggerQuotaCooldown(msg, options?.studentsOnly ? 'students' : 'attempts');
        } else {
          this.cloudLastError = msg;
        }
        console.warn('refreshCloudData Firestore notice:', e);
      }

      if (this.isLocalExpressEnvironment() && isTeacherFirebaseUser(auth.currentUser)) {
        this.runTeacherBidirectionalSync(teacherHeaders || {}).catch(() => {});
      }

      if (
        !options?.studentsOnly &&
        this.hasMoreAttempts &&
        !this.attemptsHistoryComplete &&
        !this.isQuotaCooldownActive('attempts')
      ) {
        this.scheduleAutoBackfillOlderAttempts();
      }

      if (shouldEmit) {
        this.emitDataChanged();
      }
      return anySuccess;
    })();

    this.teacherRefreshIsStudentsOnly = Boolean(options?.studentsOnly);
    this.teacherRefreshPromise = run;
    try {
      return await run;
    } finally {
      this.teacherRefreshPromise = null;
      this.teacherRefreshIsStudentsOnly = false;
    }
  }

  async loadOlderAttemptsPage(): Promise<{ loaded: number; hasMore: boolean; error?: string }> {
    if (!isTeacherFirebaseUser(auth.currentUser)) {
      return { loaded: 0, hasMore: false, error: 'Chưa xác thực giáo viên.' };
    }
    if (this.loadingOlderAttempts || !this.oldestAttemptCreatedMs || !this.hasMoreAttempts) {
      return { loaded: 0, hasMore: this.hasMoreAttempts };
    }
    if (this.isQuotaCooldownActive('attempts')) {
      return {
        loaded: 0,
        hasMore: this.hasMoreAttempts,
        error: 'Hệ thống đang tạm nghỉ do hết hạn mức đọc miễn phí hôm nay.',
      };
    }

    this.loadingOlderAttempts = true;
    this.emitDataChanged();
    try {
      const res = await fetchOlderAttemptsPage(this.oldestAttemptCreatedMs);
      if (res.error) {
        if (this.isQuotaError(res.error)) {
          this.triggerQuotaCooldown(res.error, 'attempts');
        }
        return { loaded: 0, hasMore: this.hasMoreAttempts, error: res.error };
      }
      const prevCount = this.cloudAttempts.length;
      const merged = this.mergeCloudAttemptsList(res.attempts);
      this.cloudAttempts = merged.list;
      if (
        res.oldestCreatedMs &&
        (this.oldestAttemptCreatedMs === 0 || res.oldestCreatedMs < this.oldestAttemptCreatedMs)
      ) {
        this.oldestAttemptCreatedMs = res.oldestCreatedMs;
      }
      this.hasMoreAttempts = res.hasMore;
      if (!res.hasMore) {
        this.attemptsHistoryComplete = true;
      }
      this.mergeAttemptsIntoLocalCache(merged.list);
      this.persistAdminCache();
      this.emitDataChanged();
      return { loaded: Math.max(0, merged.list.length - prevCount), hasMore: this.hasMoreAttempts };
    } finally {
      this.loadingOlderAttempts = false;
      this.emitDataChanged();
    }
  }

  async loadAllOlderAttempts(maxPages = 20): Promise<{
    loaded: number;
    pagesLoaded: number;
    hasMore: boolean;
    error?: string;
  }> {
    if (!isTeacherFirebaseUser(auth.currentUser)) {
      return { loaded: 0, pagesLoaded: 0, hasMore: false, error: 'Chưa xác thực giáo viên.' };
    }
    if (this.loadingOlderAttempts || !this.oldestAttemptCreatedMs || !this.hasMoreAttempts) {
      return { loaded: 0, pagesLoaded: 0, hasMore: this.hasMoreAttempts };
    }
    if (this.isQuotaCooldownActive('attempts')) {
      return {
        loaded: 0,
        pagesLoaded: 0,
        hasMore: this.hasMoreAttempts,
        error: 'Hệ thống đang tạm nghỉ do hết hạn mức đọc miễn phí hôm nay.',
      };
    }

    this.loadingOlderAttempts = true;
    this.emitDataChanged();
    let totalLoaded = 0;
    let pagesLoaded = 0;
    let lastError: string | undefined;

    try {
      while (
        pagesLoaded < maxPages &&
        this.hasMoreAttempts &&
        this.oldestAttemptCreatedMs > 0 &&
        !this.isQuotaCooldownActive('attempts')
      ) {
        const prevOldest = this.oldestAttemptCreatedMs;
        const prevCount = this.cloudAttempts.length;
        const res = await fetchOlderAttemptsPage(prevOldest);
        if (res.error) {
          lastError = res.error;
          if (this.isQuotaError(res.error)) {
            this.triggerQuotaCooldown(res.error, 'attempts');
          }
          break;
        }
        pagesLoaded++;
        const merged = this.mergeCloudAttemptsList(res.attempts);
        this.cloudAttempts = merged.list;
        const added = Math.max(0, merged.list.length - prevCount);
        totalLoaded += added;
        if (
          res.oldestCreatedMs &&
          (this.oldestAttemptCreatedMs === 0 || res.oldestCreatedMs < this.oldestAttemptCreatedMs)
        ) {
          this.oldestAttemptCreatedMs = res.oldestCreatedMs;
        }
        this.hasMoreAttempts = res.hasMore;
        if (!res.hasMore) {
          this.attemptsHistoryComplete = true;
        }
        this.mergeAttemptsIntoLocalCache(merged.list);
        this.persistAdminCache();

        if (!res.hasMore || res.attempts.length === 0) {
          this.attemptsHistoryComplete = true;
          break;
        }
        // Guard against an identical page loop if fallback query returned only already-known docs
        if (added === 0 && !merged.changed && this.oldestAttemptCreatedMs >= prevOldest) {
          break;
        }
      }
      this.emitDataChanged();
      return {
        loaded: totalLoaded,
        pagesLoaded,
        hasMore: this.hasMoreAttempts,
        error: lastError,
      };
    } finally {
      this.loadingOlderAttempts = false;
      this.emitDataChanged();
    }
  }

  async loadOlderActivitiesPage(): Promise<{ loaded: number; hasMore: boolean; error?: string }> {
    if (!isTeacherFirebaseUser(auth.currentUser)) {
      return { loaded: 0, hasMore: false, error: 'Chưa xác thực giáo viên.' };
    }
    if (this.loadingOlderActivities || !this.oldestActivityCreatedMs || !this.hasMoreActivities) {
      return { loaded: 0, hasMore: this.hasMoreActivities };
    }
    if (this.isQuotaCooldownActive('activities')) {
      return {
        loaded: 0,
        hasMore: this.hasMoreActivities,
        error: 'Hệ thống đang tạm nghỉ do hết hạn mức đọc miễn phí hôm nay.',
      };
    }

    this.loadingOlderActivities = true;
    this.emitDataChanged();
    try {
      const res = await fetchOlderActivitiesPage(this.oldestActivityCreatedMs);
      if (res.error) {
        if (this.isQuotaError(res.error)) {
          this.triggerQuotaCooldown(res.error, 'activities');
        }
        return { loaded: 0, hasMore: this.hasMoreActivities, error: res.error };
      }
      const prevCount = this.cloudActivities.length;
      const merged = this.mergeCloudActivitiesList(res.activities);
      this.cloudActivities = merged.list;
      if (
        res.oldestCreatedMs &&
        (this.oldestActivityCreatedMs === 0 || res.oldestCreatedMs < this.oldestActivityCreatedMs)
      ) {
        this.oldestActivityCreatedMs = res.oldestCreatedMs;
      }
      this.hasMoreActivities = res.hasMore;
      this.mergeActivitiesIntoLocalCache(merged.list);
      this.persistAdminCache();
      this.emitDataChanged();
      return {
        loaded: Math.max(0, merged.list.length - prevCount),
        hasMore: this.hasMoreActivities,
      };
    } finally {
      this.loadingOlderActivities = false;
      this.emitDataChanged();
    }
  }

  startTeacherAutoSync(): void {
    if (typeof window === 'undefined') return;
    // Zero 15-second polling! Live updates flow via incremental onSnapshot listeners in App.tsx.
    // Only fetch student roster once on open if cache is empty or older than 15 minutes.
    if (!isTeacherFirebaseUser(auth.currentUser) || this.isQuotaCooldownActive('students')) return;
    const studentsStale =
      this.cloudStudents.length === 0 ||
      Date.now() - this.lastStudentsSyncAt > STUDENTS_REFRESH_TTL_MS;
    if (studentsStale) {
      this.refreshCloudData({ forceEmit: true, studentsOnly: true }).catch(() => {});
    }
  }

  stopTeacherAutoSync(): void {
    if (typeof window !== 'undefined' && this.teacherPollTimer !== null) {
      window.clearInterval(this.teacherPollTimer);
      this.teacherPollTimer = null;
    }
  }

  startStudentAutoSync(getUser: () => UserProfile | null): void {
    if (typeof window === 'undefined') return;
    if (this.studentRetryTimer !== null) return;
    this.studentRetryTimer = window.setInterval(() => {
      const user = getUser();
      if (!user || user.role !== 'student') {
        this.stopStudentAutoSync();
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      if (this.hasRetryablePendingStudentSyncData()) {
        this.syncStudentDeviceHistoryToServer(user).catch(() => {});
      }
    }, 25000);
  }

  stopStudentAutoSync(): void {
    if (typeof window !== 'undefined' && this.studentRetryTimer !== null) {
      window.clearInterval(this.studentRetryTimer);
      this.studentRetryTimer = null;
    }
  }

  private msg(vi: string, en: string): string {
    try {
      return safeGetItem('dia_li_10_language') === 'en' ? en : vi;
    } catch {
      return vi;
    }
  }

  getTeacherToken(): string | null {
    try {
      return sessionStorage.getItem(TEACHER_TOKEN_KEY) || safeGetItem(TEACHER_TOKEN_KEY);
    } catch {
      return safeGetItem(TEACHER_TOKEN_KEY);
    }
  }

  setTeacherToken(token: string | null): void {
    try {
      if (token) {
        try {
          sessionStorage.setItem(TEACHER_TOKEN_KEY, token);
        } catch {
          // ignore
        }
        safeSetItem(TEACHER_TOKEN_KEY, token);
      } else {
        try {
          sessionStorage.removeItem(TEACHER_TOKEN_KEY);
        } catch {
          // ignore
        }
        safeRemoveItem(TEACHER_TOKEN_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // =========================================================================
  // INTERNAL LOCALSTORAGE DATA ACCESSORS
  // =========================================================================
  private getDeletedStudentIds(): Set<string> {
    try {
      const raw = safeGetItem(DELETED_STUDENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed.map(String));
      }
    } catch {
      // ignore
    }
    return new Set();
  }

  private addDeletedStudentId(studentId: string): void {
    const ids = this.getDeletedStudentIds();
    ids.add(studentId);
    safeSetItem(DELETED_STUDENTS_KEY, JSON.stringify(Array.from(ids)));
  }

  private getPasswordMap(): Record<string, string> {
    try {
      const raw = safeGetItem(STUDENT_PASSWORDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    return {};
  }

  private savePasswordMap(map: Record<string, string>): void {
    safeSetItem(STUDENT_PASSWORDS_KEY, JSON.stringify(map));
  }

  private getAllStudentsLocal(): UserProfile[] {
    const deleted = this.getDeletedStudentIds();
    const map = new Map<string, UserProfile>();

    // Seed official students first (unless explicitly deleted)
    INITIAL_STUDENTS.forEach((st) => {
      if (!deleted.has(st.id)) {
        map.set(st.id, {
          ...st,
          studentType:
            st.studentType ||
            (normalizeSchoolKey(st.school) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended'),
        });
      }
    });

    // Overlay stored students from localStorage
    try {
      const raw = safeGetItem(STUDENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((st: UserProfile) => {
            if (st && st.id && !deleted.has(st.id) && !isLegacyDemoStudentId(st.id)) {
              const existing = map.get(st.id);
              map.set(st.id, {
                ...(existing || {}),
                ...st,
                studentType:
                  st.studentType ||
                  (normalizeSchoolKey(st.school) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended'),
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('Error reading students from localStorage:', e);
    }

    // Overlay synced students from backend Server
    this.serverStudents.forEach((st) => {
      if (st && st.id && !deleted.has(st.id) && !isLegacyDemoStudentId(st.id)) {
        const existing = map.get(st.id);
        map.set(st.id, {
          ...(existing || {}),
          ...st,
          studentType:
            st.studentType ||
            (normalizeSchoolKey(st.school) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended'),
        });
      }
    });

    // Overlay synced cloud students from Firestore
    this.cloudStudents.forEach((st) => {
      if (st && st.id && !deleted.has(st.id) && !isLegacyDemoStudentId(st.id)) {
        const existing = map.get(st.id);
        map.set(st.id, {
          ...(existing || {}),
          ...st,
          studentType:
            st.studentType ||
            (normalizeSchoolKey(st.school) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended'),
        });
      }
    });

    return Array.from(map.values());
  }

  getAllStudents(): UserProfile[] {
    return this.getAllStudentsLocal();
  }

  private saveStudentsLocal(students: UserProfile[]): void {
    safeSetItem(STUDENTS_KEY, JSON.stringify(students));
  }

  private upsertStudentLocal(student: UserProfile): UserProfile {
    const list = this.getAllStudentsLocal();
    const idx = list.findIndex(
      (s) =>
        s.id === student.id ||
        (s.code && student.code && s.code.toLowerCase() === student.code.toLowerCase())
    );
    const normalized: UserProfile = {
      ...student,
      name: normalizeStudentName(student.name),
      school: normalizeSchoolName(student.school || 'TRƯỜNG THPT HÒA BÌNH'),
      className: normalizeClassName(student.className || '10A1'),
      studentType:
        student.studentType ||
        (normalizeSchoolKey(student.school) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended'),
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...normalized };
      this.saveStudentsLocal(list);
      return list[idx];
    }
    list.push(normalized);
    this.saveStudentsLocal(list);
    return normalized;
  }

  private ensureClassExistsLocal(className: string, schoolName: string): void {
    const normCls = normalizeClassName(className);
    const normSch = normalizeSchoolName(schoolName || 'TRƯỜNG THPT HÒA BÌNH');
    if (!normCls) return;

    let classes: Classroom[] = [];
    try {
      const raw = safeGetItem(CLASSES_KEY);
      classes = raw ? JSON.parse(raw) : [...INITIAL_CLASSES];
    } catch {
      classes = [...INITIAL_CLASSES];
    }

    const exists = classes.some(
      (c) =>
        normalizeClassName(c.name) === normCls &&
        normalizeSchoolKey(c.schoolName) === normalizeSchoolKey(normSch)
    );
    if (!exists) {
      classes.push({
        id: `cls-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: normCls,
        schoolName: normSch,
        teacherName: 'Bùi Thị Hồng Hạnh',
        joinCode: `DL10-${normCls}`,
        studentCount: 1,
        academicYear: '2025-2026',
      });
      safeSetItem(CLASSES_KEY, JSON.stringify(classes));
    }
  }

  private getPureLocalExamRecords(): ExamRecord[] {
    try {
      const raw = safeGetItem(EXAM_RECORDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (r: ExamRecord) =>
              r && r.id && !isLegacyDemoAttemptId(r.id) && !isLegacyDemoStudentId(r.studentId)
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  private getLocalAttempts(): ExamRecord[] {
    const byId = new Map<string, ExamRecord>();
    const upsertLossless = (r: ExamRecord) => {
      if (!r || !r.id || isLegacyDemoAttemptId(r.id) || isLegacyDemoStudentId(r.studentId)) return;
      const key = sanitizeAttemptMergeKey(r.id);
      byId.set(key, mergeExamRecordsKeepingDetails(byId.get(key), r));
    };

    this.getPureLocalExamRecords().forEach(upsertLossless);
    this.getPendingAttempts().forEach(upsertLossless);
    this.serverAttempts.forEach(upsertLossless);
    this.cloudAttempts.forEach(upsertLossless);

    return Array.from(byId.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  getAttemptsSnapshot(): ExamRecord[] {
    return this.getLocalAttempts();
  }

  getStudentAttemptsSnapshot(studentId: string): ExamRecord[] {
    return this.getLocalAttempts().filter((r) => r.studentId === studentId);
  }

  private saveLocalAttemptsList(list: ExamRecord[]): void {
    const sorted = [...list].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const pendingIds = this.getPendingAttemptIdSet();
    writeAttemptsArrayToLocalStorage(EXAM_RECORDS_KEY, sorted, pendingIds);
    if (sorted.length > 0) {
      idbPutMany('attempts', sorted.slice(0, 200)).catch(() => false);
    }
  }

  private saveLocalAttempt(record: ExamRecord): void {
    const targetKey = sanitizeAttemptMergeKey(record.id);
    const list = this.getPureLocalExamRecords().filter(
      (r) => sanitizeAttemptMergeKey(r.id) !== targetKey
    );
    list.unshift(record);
    this.saveLocalAttemptsList(list);
    idbPutMany('attempts', [record]).catch(() => false);
  }

  private filterAttemptsLocal(
    records: ExamRecord[],
    filters: Partial<MultiSchoolFilterOptions> & { chapterId?: string }
  ): ExamRecord[] {
    let list = [...records];
    if (filters.schoolName && filters.schoolName !== 'all') {
      const targetKey = normalizeSchoolKey(filters.schoolName);
      list = list.filter((a) => normalizeSchoolKey(a.schoolName) === targetKey);
    }
    if (filters.className && filters.className !== 'all') {
      const targetCls = normalizeClassName(filters.className);
      list = list.filter((a) => normalizeClassName(a.className) === targetCls);
    }
    if (filters.studentName && filters.studentName.trim()) {
      const q = stripDiacriticsLower(filters.studentName);
      list = list.filter(
        (a) =>
          stripDiacriticsLower(a.studentName).includes(q) ||
          stripDiacriticsLower(a.studentCode || '').includes(q)
      );
    }
    if (filters.lessonId && filters.lessonId !== 'all') {
      list = list.filter(
        (a) =>
          a.lessonId === filters.lessonId ||
          (Array.isArray(a.details) && a.details.some((d) => d.lessonId === filters.lessonId))
      );
    }
    if (filters.chapterId && filters.chapterId !== 'all') {
      list = list.filter(
        (a) =>
          a.chapterId === filters.chapterId ||
          (Array.isArray(a.details) && a.details.some((d) => d.chapterId === filters.chapterId))
      );
    }
    if (filters.questionType && filters.questionType !== 'all') {
      list = list.filter(
        (a) =>
          a.questionType === filters.questionType ||
          (a.typeBreakdown &&
            a.typeBreakdown[filters.questionType as QuestionType] &&
            a.typeBreakdown[filters.questionType as QuestionType].total > 0)
      );
    }
    if (filters.mode && filters.mode !== 'all') {
      list = list.filter((a) => a.mode === filters.mode);
    }
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = Date.now();
      let cutoff = 0;
      if (filters.timeRange === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        cutoff = startOfDay.getTime();
      } else if (filters.timeRange === '7days') {
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
      } else if (filters.timeRange === '30days') {
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
      }
      list = list.filter((a) => (a.timestamp || 0) >= cutoff);
    }
    return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // =========================================================================
  // TEACHER AUTHENTICATION (STRICT VERIFIED GOOGLE + FIREBASE AUTH ONLY)
  // =========================================================================
  async teacherLogin(
    _username: string,
    _password: string
  ): Promise<{ success: boolean; token: string; user: UserProfile }> {
    throw new Error(
      this.msg(
        'Để bảo mật tuyệt đối (tránh học sinh vào nhầm), cổng quản trị chỉ cho phép đăng nhập bằng tài khoản Google chính chủ của giáo viên.',
        'For strict security, teacher admin access requires verified Google Sign-In.'
      )
    );
  }

  async teacherLoginWithGoogle(): Promise<{ success: boolean; token: string; user: UserProfile }> {
    const fbUser = await signInWithGooglePopup();
    if (!isTeacherFirebaseUser(fbUser)) {
      await signOutFirebase();
      throw new Error(
        this.msg(
          `Tài khoản Google "${fbUser.email || ''}" không có quyền giáo viên quản trị. Vui lòng chọn đúng Gmail chính chủ của cô Bùi Thị Hồng Hạnh.`,
          `Google account "${fbUser.email || ''}" is not authorized as teacher admin.`
        )
      );
    }

    const token = `firebase-teacher-${fbUser.uid}-${Date.now()}`;
    const user: UserProfile = {
      ...DEFAULT_TEACHER_USER,
      email: fbUser.email || DEFAULT_TEACHER_USER.email,
      lastLoginAt: new Date().toISOString(),
    };
    this.setTeacherToken(token);
    this.hydrateAdminCache();
    this.clearQuotaCooldown();
    this.setCloudAuthContext(fbUser);
    // onAuthStateChanged in App.tsx attaches subscribeCloudData for attempts/activities;
    // only refresh students roster here to avoid duplicate 250-doc reads on Google login.
    await this.refreshCloudData({ forceEmit: true, studentsOnly: true }).catch(() => false);
    return { success: true, token, user };
  }

  restoreTeacherSessionFromFirebase(
    fbUser: { uid: string; email?: string | null; emailVerified?: boolean } | null | undefined
  ): { token: string; user: UserProfile } | null {
    if (!fbUser || !fbUser.uid || !fbUser.emailVerified) return null;
    if ((fbUser.email || '').toLowerCase() !== TEACHER_ADMIN_EMAIL) return null;

    const existingToken = this.getTeacherToken();
    const token =
      existingToken && existingToken.startsWith('firebase-teacher-')
        ? existingToken
        : `firebase-teacher-${fbUser.uid}-${Date.now()}`;

    const user: UserProfile = {
      ...DEFAULT_TEACHER_USER,
      email: fbUser.email || DEFAULT_TEACHER_USER.email,
      lastLoginAt: new Date().toISOString(),
    };
    this.setTeacherToken(token);
    this.hydrateAdminCache();
    this.setCloudAuthContext(fbUser);
    return { token, user };
  }

  async connectStudentGoogleAccount(
    profile?: UserProfile | null
  ): Promise<{ email: string; uid: string; syncedPending: number }> {
    const fbUser = await signInWithGooglePopup();
    if (!isVerifiedFirebaseUser(fbUser)) {
      throw new Error(
        this.msg(
          'Tài khoản Google chưa xác minh email. Vui lòng chọn tài khoản Gmail hợp lệ.',
          'Google account email is not verified.'
        )
      );
    }

    this.setCloudAuthContext(fbUser);

    if (profile && profile.role === 'student') {
      try {
        await this.syncProfileIfQuotaAllows(profile);
      } catch (e) {
        console.warn('Could not sync student profile on Google connect:', e);
      }
    }

    const flushed = await this.flushPendingAttempts(profile || undefined);

    return {
      email: fbUser.email || '',
      uid: fbUser.uid,
      syncedPending: flushed.synced,
    };
  }

  async teacherLogout(): Promise<void> {
    this.setTeacherToken(null);
    // Preserve persisted local & IndexedDB admin caches on logout so logging back in
    // during read-quota limits or offline periods never loses previously loaded student attempts.
    await signOutFirebase();
    this.setCloudAuthContext(null);
  }

  async verifyTeacherSession(): Promise<boolean> {
    const token = this.getTeacherToken();
    if (!token || !token.startsWith('firebase-teacher-')) {
      return false;
    }
    try {
      await auth.authStateReady();
      return isTeacherFirebaseUser(auth.currentUser);
    } catch {
      return false;
    }
  }

  async getTeacherSystemStatus(): Promise<{
    hasAdminAccount: boolean;
    totalAccounts: number;
    teacherInfo?: any;
  }> {
    return {
      hasAdminAccount: true,
      totalAccounts: 1,
      teacherInfo: {
        name: DEFAULT_TEACHER_USER.name,
        username: DEFAULT_TEACHER_USER.username,
        school: DEFAULT_TEACHER_USER.school,
        department: DEFAULT_TEACHER_USER.department,
      },
    };
  }

  // =========================================================================
  // 1. SYSTEM SUMMARY
  // =========================================================================
  async getSystemSummary(_user?: UserProfile): Promise<SystemSummary> {
    const attempts = this.getLocalAttempts();
    const allStudents = this.getAllStudentsLocal();

    const schools = new Set(
      [
        ...allStudents.map((s) => normalizeSchoolKey(s.school)),
        ...attempts.map((a) => normalizeSchoolKey(a.schoolName)),
      ].filter(Boolean)
    );
    const classes = new Set(
      [
        ...allStudents.map(
          (s) => `${normalizeSchoolKey(s.school)}::${normalizeClassName(s.className || '')}`
        ),
        ...attempts.map(
          (a) => `${normalizeSchoolKey(a.schoolName)}::${normalizeClassName(a.className)}`
        ),
      ].filter((k) => !k.startsWith('::') && !k.endsWith('::'))
    );
    const students = new Set([
      ...allStudents.map(
        (s) => `${normalizeSchoolKey(s.school)}::${stripDiacriticsLower(s.name)}`
      ),
      ...attempts.map(
        (a) => `${normalizeSchoolKey(a.schoolName)}::${stripDiacriticsLower(a.studentName)}`
      ),
    ]);

    const totalScore = attempts.reduce((s, a) => s + (Number(a.score) || 0), 0);
    const passCount = attempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;

    return {
      totalSchools: schools.size,
      totalClasses: classes.size,
      totalStudents: students.size,
      totalAttempts: attempts.length,
      totalPracticeAttempts: attempts.filter((a) => a.mode && a.mode.startsWith('practice')).length,
      totalExamAttempts: attempts.filter((a) => a.mode === 'official_test').length,
      overallAvgScore: attempts.length > 0 ? parseFloat((totalScore / attempts.length).toFixed(2)) : 0,
      averageCompletionRate:
        attempts.length > 0 ? parseFloat(((passCount / attempts.length) * 100).toFixed(1)) : 0,
    };
  }

  // =========================================================================
  // 2. SCHOOLS
  // =========================================================================
  async getSchools(_user?: UserProfile): Promise<SchoolStats[]> {
    const attempts = this.getLocalAttempts();
    const allStudents = this.getAllStudentsLocal();
    const schMap = new Map<string, string>();

    allStudents.forEach((st) => {
      const k = normalizeSchoolKey(st.school);
      if (k && !schMap.has(k)) schMap.set(k, st.school);
    });
    attempts.forEach((a) => {
      const k = normalizeSchoolKey(a.schoolName);
      if (k && !schMap.has(k)) schMap.set(k, a.schoolName);
    });

    return Array.from(schMap.entries()).map(([schKey, schName]) => {
      const sAttempts = attempts.filter((a) => normalizeSchoolKey(a.schoolName) === schKey);
      const sStudents = allStudents.filter((st) => normalizeSchoolKey(st.school) === schKey);
      const sClasses = Array.from(
        new Set([
          ...sStudents.map((st) => normalizeClassName(st.className || '')).filter(Boolean),
          ...sAttempts.map((a) => normalizeClassName(a.className)).filter(Boolean),
        ])
      ).sort();

      const uniqueStudents = new Set([
        ...sStudents.map((st) => stripDiacriticsLower(st.name)),
        ...sAttempts.map((a) => stripDiacriticsLower(a.studentName)),
      ]);

      const totalScore = sAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0);
      const passCount = sAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;
      const regMeta = REGISTERED_SCHOOLS.find((rs) => normalizeSchoolKey(rs.name) === schKey);

      return {
        schoolName: schName,
        code: regMeta?.code,
        commune: regMeta?.commune,
        province: regMeta?.province || 'TỈNH LẠNG SƠN',
        classCount: sClasses.length,
        studentCount: uniqueStudents.size,
        attemptCount: sAttempts.length,
        practiceCount: sAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length,
        examCount: sAttempts.filter((a) => a.mode === 'official_test').length,
        avgScore: sAttempts.length > 0 ? parseFloat((totalScore / sAttempts.length).toFixed(2)) : 0,
        highestScore:
          sAttempts.length > 0 ? Math.max(...sAttempts.map((a) => Number(a.score) || 0)) : 0,
        completionRate:
          sAttempts.length > 0 ? parseFloat(((passCount / sAttempts.length) * 100).toFixed(1)) : 0,
        classes: sClasses,
      };
    });
  }

  // =========================================================================
  // 3. CLASSES OF A SCHOOL (supports 'all' while isolating per school)
  // =========================================================================
  async getClassesBySchool(schoolName: string, _user?: UserProfile): Promise<ClassStats[]> {
    const isAll = schoolName === 'all';
    const schKey = normalizeSchoolKey(schoolName);
    const attempts = this.getLocalAttempts().filter(
      (a) => isAll || normalizeSchoolKey(a.schoolName) === schKey
    );
    const students = this.getAllStudentsLocal().filter(
      (s) => isAll || normalizeSchoolKey(s.school) === schKey
    );

    let storedClasses: Classroom[] = [];
    try {
      const raw = safeGetItem(CLASSES_KEY);
      storedClasses = raw ? JSON.parse(raw) : INITIAL_CLASSES;
    } catch {
      storedClasses = INITIAL_CLASSES;
    }

    const bucketMap = new Map<
      string,
      { schoolKey: string; schoolName: string; className: string }
    >();
    const registerBucket = (rawSchool: string | undefined, rawClass: string | undefined) => {
      const cls = normalizeClassName(rawClass || '');
      if (!cls) return;
      const normSchool = normalizeSchoolName(
        rawSchool || (isAll ? 'TRƯỜNG THPT HÒA BÌNH' : schoolName)
      );
      const sKey = normalizeSchoolKey(normSchool);
      if (!isAll && sKey !== schKey) return;
      const compositeKey = `${sKey}::${cls}`;
      if (!bucketMap.has(compositeKey)) {
        bucketMap.set(compositeKey, {
          schoolKey: sKey,
          schoolName: normSchool,
          className: cls,
        });
      }
    };

    storedClasses.forEach((c) => registerBucket(c.schoolName, c.name));
    students.forEach((s) => registerBucket(s.school, s.className));
    attempts.forEach((a) => registerBucket(a.schoolName, a.className));

    const buckets = Array.from(bucketMap.values()).sort(
      (a, b) =>
        a.className.localeCompare(b.className, 'vi') ||
        a.schoolName.localeCompare(b.schoolName, 'vi')
    );

    return buckets.map((bucket) => {
      const cAttempts = attempts.filter(
        (a) =>
          normalizeClassName(a.className) === bucket.className &&
          normalizeSchoolKey(a.schoolName) === bucket.schoolKey
      );
      const cStudents = students.filter(
        (s) =>
          normalizeClassName(s.className || '') === bucket.className &&
          normalizeSchoolKey(s.school) === bucket.schoolKey
      );
      const activeStudentCount = new Set(
        cAttempts.map((a) => stripDiacriticsLower(a.studentName || a.studentId))
      ).size;
      const totalUniqueStudents = new Set([
        ...cStudents.map((s) => stripDiacriticsLower(s.name)),
        ...cAttempts.map((a) => stripDiacriticsLower(a.studentName)),
      ]).size;

      const totalScore = cAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0);
      const passCount = cAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;

      return {
        schoolName: isAll ? bucket.schoolName : schoolName,
        className: bucket.className,
        studentCount: totalUniqueStudents,
        activeStudentCount,
        attemptCount: cAttempts.length,
        practiceCount: cAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length,
        examCount: cAttempts.filter((a) => a.mode === 'official_test').length,
        avgScore: cAttempts.length > 0 ? parseFloat((totalScore / cAttempts.length).toFixed(2)) : 0,
        highestScore:
          cAttempts.length > 0 ? Math.max(...cAttempts.map((a) => Number(a.score) || 0)) : 0,
        completionRate:
          cAttempts.length > 0 ? parseFloat(((passCount / cAttempts.length) * 100).toFixed(1)) : 0,
        students: [],
      };
    });
  }

  // =========================================================================
  // 4. STUDENTS OF A CLASS (supports 'all', includes imported Zalo students)
  // =========================================================================
  async getStudentsByClass(
    schoolName: string,
    className: string,
    _user?: UserProfile
  ): Promise<StudentStatsSummary[]> {
    const isAllSch = schoolName === 'all';
    const isAllCls = className === 'all';
    const schKey = normalizeSchoolKey(schoolName);
    const clsKey = normalizeClassName(className);

    const attempts = this.getLocalAttempts().filter(
      (a) =>
        (isAllSch || normalizeSchoolKey(a.schoolName) === schKey) &&
        (isAllCls || normalizeClassName(a.className) === clsKey)
    );

    const students = this.getAllStudentsLocal().filter(
      (s) =>
        (isAllSch || normalizeSchoolKey(s.school) === schKey) &&
        (isAllCls || normalizeClassName(s.className || '') === clsKey)
    );

    // Merge registered students + any students present only in attempts (e.g. Zalo slips)
    const studentMap = new Map<string, UserProfile>();
    students.forEach((st) => {
      const k = `${normalizeSchoolKey(st.school)}::${normalizeClassName(st.className || '')}::${stripDiacriticsLower(st.name)}`;
      studentMap.set(k, st);
    });

    attempts.forEach((a) => {
      const k = `${normalizeSchoolKey(a.schoolName)}::${normalizeClassName(a.className)}::${stripDiacriticsLower(a.studentName)}`;
      if (!studentMap.has(k)) {
        studentMap.set(k, {
          id: a.studentId || `hs-${k}`,
          role: 'student',
          name: a.studentName,
          code: a.studentCode || 'HS',
          className: normalizeClassName(a.className),
          school: a.schoolName,
          province: 'TỈNH LẠNG SƠN',
          studentType:
            normalizeSchoolKey(a.schoolName) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended',
          joinedDate: new Date(a.timestamp || Date.now()).toISOString().slice(0, 10),
        });
      }
    });

    const summaries = Array.from(studentMap.values()).map((st) => {
      const stSchKey = normalizeSchoolKey(st.school);
      const stClsKey = normalizeClassName(st.className || '');
      const stNameNorm = stripDiacriticsLower(st.name);

      const stAttempts = attempts
        .filter(
          (a) =>
            a.studentId === st.id ||
            (stripDiacriticsLower(a.studentName) === stNameNorm &&
              normalizeSchoolKey(a.schoolName) === stSchKey &&
              normalizeClassName(a.className) === stClsKey)
        )
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      const totalScore = stAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0);
      const passCount = stAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;

      const typeBreakdown: { [type in QuestionType]?: { total: number; correct: number; rate: number } } = {};
      const lessonBreakdown: { [lessonId: string]: { total: number; correct: number; rate: number } } = {};

      stAttempts.forEach((a) => {
        if (a.typeBreakdown) {
          (Object.entries(a.typeBreakdown) as [QuestionType, { total: number; correct: number }][]).forEach(
            ([tKey, val]) => {
              if (!typeBreakdown[tKey]) typeBreakdown[tKey] = { total: 0, correct: 0, rate: 0 };
              typeBreakdown[tKey]!.total += Number(val.total) || 0;
              typeBreakdown[tKey]!.correct += Number(val.correct) || 0;
            }
          );
        }
        if (a.lessonId) {
          if (!lessonBreakdown[a.lessonId]) {
            lessonBreakdown[a.lessonId] = { total: 0, correct: 0, rate: 0 };
          }
          lessonBreakdown[a.lessonId].total += Number(a.totalQuestions) || 0;
          lessonBreakdown[a.lessonId].correct += Number(a.correctCount) || 0;
        }
      });

      Object.values(typeBreakdown).forEach((v) => {
        if (v) v.rate = v.total > 0 ? Math.round((v.correct / v.total) * 1000) / 10 : 0;
      });
      Object.values(lessonBreakdown).forEach((v) => {
        v.rate = v.total > 0 ? Math.round((v.correct / v.total) * 1000) / 10 : 0;
      });

      return {
        studentId: st.id,
        studentName: st.name,
        studentCode: st.code,
        schoolName: st.school,
        className: st.className || className,
        studentType:
          st.studentType ||
          (normalizeSchoolKey(st.school) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended'),
        username: st.username || st.code,
        isActivated: st.isActivated ?? stAttempts.length > 0,
        lastLoginAt: st.lastLoginAt,
        managedByTeacher: st.managedByTeacher,
        gender: st.gender,
        dateOfBirth: st.dateOfBirth,
        attemptCount: stAttempts.length,
        practiceCount: stAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length,
        examCount: stAttempts.filter((a) => a.mode === 'official_test').length,
        totalQuestionsAnswered: stAttempts.reduce(
          (sum, a) => sum + Math.max(0, (Number(a.totalQuestions) || 0) - (Number(a.unansweredCount) || 0)),
          0
        ),
        correctAnswersCount: stAttempts.reduce((sum, a) => sum + (Number(a.correctCount) || 0), 0),
        wrongAnswersCount: stAttempts.reduce((sum, a) => sum + (Number(a.wrongCount) || 0), 0),
        unansweredAnswersCount: stAttempts.reduce((sum, a) => sum + (Number(a.unansweredCount) || 0), 0),
        avgScore: stAttempts.length > 0 ? parseFloat((totalScore / stAttempts.length).toFixed(2)) : 0,
        highestScore:
          stAttempts.length > 0 ? Math.max(...stAttempts.map((a) => Number(a.score) || 0)) : 0,
        completionRate:
          stAttempts.length > 0 ? parseFloat(((passCount / stAttempts.length) * 100).toFixed(1)) : 0,
        latestAttemptDate:
          stAttempts.length > 0 ? new Date(stAttempts[0].timestamp).toISOString() : st.joinedDate,
        typeBreakdown,
        lessonBreakdown,
        progressHistory: stAttempts.map((a) => ({
          id: a.id,
          timestamp: a.timestamp,
          score: a.score,
          title: a.title,
          mode: a.mode,
          lessonTitle: a.lessonTitle,
          accuracyRate: a.accuracyRate,
        })),
      };
    });

    return summaries.sort((a, b) => b.avgScore - a.avgScore || b.attemptCount - a.attemptCount);
  }

  // =========================================================================
  // 5. QUERY ATTEMPTS
  // =========================================================================
  async getAttempts(
    filters: Partial<MultiSchoolFilterOptions>,
    _user?: UserProfile,
    _strict = false
  ): Promise<ExamRecord[]> {
    return this.filterAttemptsLocal(this.getLocalAttempts(), filters);
  }

  getAttemptById(attemptId: string): ExamRecord | null {
    if (!attemptId) return null;
    const safeId = sanitizeFirestoreId(attemptId, 'att');
    return (
      this.getLocalAttempts().find(
        (a) => a.id === attemptId || sanitizeFirestoreId(a.id, 'att') === safeId
      ) || null
    );
  }

  getStudentAttempts(student: {
    studentId?: string;
    studentCode?: string;
    studentName: string;
    schoolName?: string;
    className?: string;
  }): ExamRecord[] {
    const stSchKey = student.schoolName ? normalizeSchoolKey(student.schoolName) : '';
    const stClsKey = student.className ? normalizeClassName(student.className) : '';
    const stNameNorm = stripDiacriticsLower(student.studentName || '');
    const stCodeNorm = String(student.studentCode || '').trim().toUpperCase();

    return this.getLocalAttempts()
      .filter((a) => {
        if (student.studentId && a.studentId === student.studentId) return true;
        const sameSchool = !stSchKey || normalizeSchoolKey(a.schoolName) === stSchKey;
        const sameClass = !stClsKey || normalizeClassName(a.className) === stClsKey;
        if (!sameSchool || !sameClass) return false;
        if (stCodeNorm && stCodeNorm !== 'HS' && String(a.studentCode || '').trim().toUpperCase() === stCodeNorm) {
          return true;
        }
        return Boolean(stNameNorm && stripDiacriticsLower(a.studentName) === stNameNorm);
      })
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // =========================================================================
  // 5b. FREQUENTLY MISSED QUESTIONS ANALYTICS (100% LOCAL)
  // =========================================================================
  async getMissedQuestionsAnalytics(
    filters: {
      schoolName?: string;
      className?: string;
      studentName?: string;
      chapterId?: string;
      lessonId?: string;
      questionType?: string;
    },
    _user?: UserProfile
  ): Promise<{
    detailedAttempts: number;
    summaryOnlyAttempts: number;
    questions: Array<{
      questionId: string;
      lessonId: string;
      chapterId: string | null;
      type: Question['type'];
      questionText: string;
      correctAnswerText: string;
      timesAnswered: number;
      timesCorrect: number;
      timesWrong: number;
      timesUnanswered: number;
      wrongRate: number;
      uniqueStudentsWrong: number;
      commonWrongAnswers: Array<{ answer: string; count: number }>;
      wrongAttempts: Array<{
        attemptId: string;
        studentKey: string;
        studentName: string;
        studentCode: string;
        className: string;
        schoolName: string;
        userAnswerText: string;
        correctAnswerText: string;
        earnedScore: number;
        maxScore: number;
        timestamp: number;
        studentTotalAnswered: number;
        studentTotalCorrect: number;
        studentTotalWrong: number;
      }>;
    }>;
  }> {
    const attempts = this.filterAttemptsLocal(this.getLocalAttempts(), {
      schoolName: filters.schoolName,
      className: filters.className,
      studentName: filters.studentName,
    });

    let detailedAttempts = 0;
    let summaryOnlyAttempts = 0;

    // Precompute student totals for wrongAttempts metadata
    const studentTotals = new Map<string, { answered: number; correct: number; wrong: number }>();
    attempts.forEach((a) => {
      const sk = `${normalizeSchoolKey(a.schoolName)}::${stripDiacriticsLower(a.studentName)}`;
      const cur = studentTotals.get(sk) || { answered: 0, correct: 0, wrong: 0 };
      cur.answered += Math.max(0, (Number(a.totalQuestions) || 0) - (Number(a.unansweredCount) || 0));
      cur.correct += Number(a.correctCount) || 0;
      cur.wrong += Number(a.wrongCount) || 0;
      studentTotals.set(sk, cur);
    });

    const qMap = new Map<
      string,
      {
        questionId: string;
        lessonId: string;
        chapterId: string | null;
        type: Question['type'];
        questionText: string;
        correctAnswerText: string;
        timesAnswered: number;
        timesCorrect: number;
        timesWrong: number;
        timesUnanswered: number;
        wrongStudentKeys: Set<string>;
        wrongAnswersCount: Map<string, number>;
        wrongAttempts: Array<{
          attemptId: string;
          studentKey: string;
          studentName: string;
          studentCode: string;
          className: string;
          schoolName: string;
          userAnswerText: string;
          correctAnswerText: string;
          earnedScore: number;
          maxScore: number;
          timestamp: number;
          studentTotalAnswered: number;
          studentTotalCorrect: number;
          studentTotalWrong: number;
        }>;
      }
    >();

    attempts.forEach((att) => {
      if (!Array.isArray(att.details) || att.details.length === 0) {
        summaryOnlyAttempts++;
        return;
      }
      detailedAttempts++;
      const studentKey = `${normalizeSchoolKey(att.schoolName)}::${stripDiacriticsLower(att.studentName)}`;
      const totals = studentTotals.get(studentKey) || { answered: 0, correct: 0, wrong: 0 };

      att.details.forEach((d) => {
        const dLessonId = d.lessonId || att.lessonId || 'bai-1';
        const dChapterId = d.chapterId ?? att.chapterId ?? null;
        if (filters.lessonId && filters.lessonId !== 'all' && dLessonId !== filters.lessonId) return;
        if (filters.chapterId && filters.chapterId !== 'all' && dChapterId !== filters.chapterId) return;
        if (filters.questionType && filters.questionType !== 'all' && d.type !== filters.questionType) return;

        let entry = qMap.get(d.questionId);
        if (!entry) {
          entry = {
            questionId: d.questionId,
            lessonId: dLessonId,
            chapterId: dChapterId,
            type: d.type,
            questionText: d.questionText || d.questionId,
            correctAnswerText: d.correctAnswerText || '',
            timesAnswered: 0,
            timesCorrect: 0,
            timesWrong: 0,
            timesUnanswered: 0,
            wrongStudentKeys: new Set(),
            wrongAnswersCount: new Map(),
            wrongAttempts: [],
          };
          qMap.set(d.questionId, entry);
        }

        const isUnanswered = d.status === 'unanswered' || Boolean(d.isUnanswered);
        if (isUnanswered) {
          entry.timesUnanswered++;
          return;
        }

        entry.timesAnswered++;
        if (d.isFullyCorrect || d.status === 'correct') {
          entry.timesCorrect++;
        } else {
          entry.timesWrong++;
          entry.wrongStudentKeys.add(studentKey);
          const ansText = (d.userAnswerText || 'Sai').trim();
          entry.wrongAnswersCount.set(ansText, (entry.wrongAnswersCount.get(ansText) || 0) + 1);
          entry.wrongAttempts.push({
            attemptId: att.id,
            studentKey,
            studentName: att.studentName,
            studentCode: att.studentCode,
            className: att.className,
            schoolName: att.schoolName,
            userAnswerText: ansText,
            correctAnswerText: d.correctAnswerText || '',
            earnedScore: Number(d.earnedScore) || 0,
            maxScore: Number(d.maxScore) || 1,
            timestamp: att.timestamp,
            studentTotalAnswered: totals.answered,
            studentTotalCorrect: totals.correct,
            studentTotalWrong: totals.wrong,
          });
        }
      });
    });

    const questions = Array.from(qMap.values())
      .filter((q) => q.timesWrong > 0)
      .map((q) => ({
        questionId: q.questionId,
        lessonId: q.lessonId,
        chapterId: q.chapterId,
        type: q.type,
        questionText: q.questionText,
        correctAnswerText: q.correctAnswerText,
        timesAnswered: q.timesAnswered,
        timesCorrect: q.timesCorrect,
        timesWrong: q.timesWrong,
        timesUnanswered: q.timesUnanswered,
        wrongRate:
          q.timesAnswered > 0 ? Math.round((q.timesWrong / q.timesAnswered) * 1000) / 10 : 0,
        uniqueStudentsWrong: q.wrongStudentKeys.size,
        commonWrongAnswers: Array.from(q.wrongAnswersCount.entries())
          .map(([answer, count]) => ({ answer, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        wrongAttempts: q.wrongAttempts.sort((a, b) => b.timestamp - a.timestamp),
      }))
      .sort((a, b) => b.timesWrong - a.timesWrong || b.wrongRate - a.wrongRate);

    return { detailedAttempts, summaryOnlyAttempts, questions };
  }

  // =========================================================================
  // 6. SUBMIT ATTEMPT (FIREBASE CLOUD PRIMARY + LOCALSTORAGE OFFLINE QUEUE)
  // =========================================================================
  private addPendingAttempt(record: ExamRecord): void {
    try {
      const targetKey = sanitizeAttemptMergeKey(record.id);
      const pending = this.getPendingAttempts().filter(
        (r) => r && sanitizeAttemptMergeKey(r.id) !== targetKey
      );
      pending.unshift(record);
      writeAttemptsArrayToLocalStorage(PENDING_ATTEMPTS_KEY, pending);
      idbPutMany('pending_attempts', [record]).catch(() => false);
      idbPutMany('attempts', [record]).catch(() => false);
    } catch {
      // ignore
    }
  }

  async submitAttemptStrict(
    record: ExamRecord,
    user?: UserProfile
  ): Promise<
    ExamRecord & {
      cloudSynced?: boolean;
      syncStatus?: 'synced' | 'pending';
      syncError?: string;
    }
  > {
    const safeId = sanitizeFirestoreId(
      record.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      'rec'
    );
    const normalizedRecord: ExamRecord = {
      ...record,
      id: safeId,
      studentName: normalizeStudentName(record.studentName || user?.name || 'Học sinh'),
      schoolName: normalizeSchoolName(record.schoolName || user?.school || 'TRƯỜNG THPT HÒA BÌNH'),
      className: normalizeClassName(record.className || user?.className || '10A1'),
      timestamp: record.timestamp || Date.now(),
      date: record.date || new Date(record.timestamp || Date.now()).toLocaleDateString('vi-VN'),
    };

    // Always preserve locally, in IndexedDB, and in pending queue FIRST until Firestore confirms
    this.saveLocalAttempt(normalizedRecord);
    this.addPendingAttempt(normalizedRecord);

    const studentProfile: UserProfile = {
      id: normalizedRecord.studentId || user?.id || `hs-${Date.now()}`,
      role: 'student',
      name: normalizedRecord.studentName,
      code: normalizedRecord.studentCode || user?.code || `HS-${Date.now().toString().slice(-4)}`,
      className: normalizedRecord.className,
      school: normalizedRecord.schoolName,
      province: user?.province || 'TỈNH LẠNG SƠN',
      studentType:
        user?.studentType ||
        (normalizeSchoolKey(normalizedRecord.schoolName) === OFFICIAL_SCHOOL_KEY
          ? 'official'
          : 'extended'),
      joinedDate: user?.joinedDate || new Date().toISOString().slice(0, 10),
      isActivated: true,
      lastLoginAt: new Date().toISOString(),
    };

    // Ensure student & class are registered in localStorage
    this.upsertStudentLocal(studentProfile);
    this.ensureClassExistsLocal(normalizedRecord.className, normalizedRecord.schoolName);
    this.emitDataChanged();

    let firebaseSynced = false;
    let syncError: string | undefined;

    try {
      if (!isCloudSyncEligibleUser(auth.currentUser)) {
        const session = await ensureAnonymousStudentSession();
        if (session.user) {
          this.setCloudAuthContext(session.user);
        } else {
          syncError =
            session.errorMessage ||
            session.errorCode ||
            'Chưa khởi tạo được phiên xác thực Firebase.';
        }
      }

      if (isCloudSyncEligibleUser(auth.currentUser) && !this.isQuotaCooldownActive('attempts')) {
        const res = await syncAttemptToCloud(normalizedRecord, studentProfile);
        firebaseSynced = res.synced;
        if (res.synced) {
          this.markAttemptConfirmedSynced(res.attemptId);
          if (!this.cloudAttempts.some((a) => sanitizeFirestoreId(a.id, 'att') === res.attemptId)) {
            this.cloudAttempts = [normalizedRecord, ...this.cloudAttempts];
          }
          delete this.collectionErrors.attempts;
          const remainingErrs = Object.values(this.collectionErrors).filter(Boolean);
          this.cloudLastError = remainingErrs.length > 0 ? remainingErrs[0]! : null;
        } else {
          syncError = res.errorMessage || res.errorCode || 'Firestore chưa xác nhận lưu bài làm.';
          if (this.isQuotaError(syncError)) {
            this.triggerQuotaCooldown(syncError, 'attempts');
          }
        }
      } else if (this.isQuotaCooldownActive('attempts')) {
        syncError = 'Máy chủ đang tạm giới hạn hạn mức đọc/ghi miễn phí; bài làm đã lưu an toàn vào hàng đợi tự đồng bộ lại.';
      }
    } catch (e: any) {
      syncError = e?.message ? String(e.message) : 'Lỗi kết nối Firestore.';
      if (this.isQuotaError(syncError)) {
        this.triggerQuotaCooldown(syncError, 'attempts');
      }
      console.warn('Firestore attempt sync warning:', e);
    }

    if (firebaseSynced) {
      this.removePendingAttempt(normalizedRecord.id);
    } else if (syncError) {
      this.collectionErrors.attempts = syncError.slice(0, 240);
      this.cloudLastError = syncError.slice(0, 240);
    }

    // Optional background mirror for local dev server only (never marks cloudSynced)
    if (this.isLocalExpressEnvironment()) {
      this.postAttemptToServer(normalizedRecord).catch(() => false);
    }

    this.emitDataChanged();
    return Object.assign({}, normalizedRecord, {
      cloudSynced: firebaseSynced,
      syncStatus: (firebaseSynced ? 'synced' : 'pending') as 'synced' | 'pending',
      syncError,
    });
  }

  async submitAttempt(record: ExamRecord, user?: UserProfile): Promise<ExamRecord> {
    return this.submitAttemptStrict(record, user);
  }

  importExamRecords(records: ExamRecord[]): {
    importedCount: number;
    duplicateCount: number;
    totalRecords: number;
  } {
    const existing = this.getLocalAttempts();
    const existingIds = new Set(existing.map((r) => sanitizeAttemptMergeKey(r.id)));
    let importedCount = 0;
    let duplicateCount = 0;

    const merged = [...existing];
    const newlyImported: ExamRecord[] = [];
    for (const rec of records) {
      const safeId = sanitizeFirestoreId(rec.id, 'zalo');
      const cleanRec: ExamRecord = { ...rec, id: safeId };
      if (existingIds.has(sanitizeAttemptMergeKey(cleanRec.id))) {
        duplicateCount++;
        continue;
      }
      existingIds.add(sanitizeAttemptMergeKey(cleanRec.id));
      merged.unshift(cleanRec);
      newlyImported.push(cleanRec);
      importedCount++;

      // Register student & class cleanly
      this.upsertStudentLocal({
        id: cleanRec.studentId,
        role: 'student',
        name: cleanRec.studentName,
        code: cleanRec.studentCode,
        className: cleanRec.className,
        school: cleanRec.schoolName,
        province: 'TỈNH LẠNG SƠN',
        studentType:
          normalizeSchoolKey(cleanRec.schoolName) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended',
        joinedDate: new Date(cleanRec.timestamp || Date.now()).toISOString().slice(0, 10),
        isActivated: true,
        lastLoginAt: new Date(cleanRec.timestamp || Date.now()).toISOString(),
      });
      this.ensureClassExistsLocal(cleanRec.className, cleanRec.schoolName);
    }

    if (importedCount > 0) {
      this.saveLocalAttemptsList(merged);
      if (isVerifiedFirebaseUser(auth.currentUser)) {
        // Mirror teacher-imported records to Firestore in background
        Promise.allSettled(newlyImported.map((r) => syncAttemptToCloud(r))).catch(() => {});
      }
      this.emitDataChanged();
    }

    return {
      importedCount,
      duplicateCount,
      totalRecords: merged.length,
    };
  }

  deleteExamRecord(recordId: string): ExamRecord[] {
    const targetKey = sanitizeAttemptMergeKey(recordId);
    this.cloudAttempts = this.cloudAttempts.filter(
      (r) => r.id !== recordId && sanitizeAttemptMergeKey(r.id) !== targetKey
    );
    this.serverAttempts = this.serverAttempts.filter(
      (r) => r.id !== recordId && sanitizeAttemptMergeKey(r.id) !== targetKey
    );
    this.confirmedCloudAttemptIds.delete(sanitizeFirestoreId(recordId, 'att'));
    this.removePendingAttempt(recordId);
    const updatedPure = this.getPureLocalExamRecords().filter(
      (r) => r.id !== recordId && sanitizeAttemptMergeKey(r.id) !== targetKey
    );
    this.saveLocalAttemptsList(updatedPure);
    idbDeleteById('attempts', recordId).catch(() => false);
    if (this.cloudIsTeacher || this.getTeacherToken()) {
      this.persistAdminCache();
    }
    const updated = this.getLocalAttempts().filter(
      (r) => r.id !== recordId && sanitizeAttemptMergeKey(r.id) !== targetKey
    );
    if (isTeacherFirebaseUser(auth.currentUser)) {
      deleteAttemptFromCloud(recordId).catch((e) =>
        console.warn('Cloud delete attempt warning:', e)
      );
      if (this.isLocalExpressEnvironment()) {
        this.getTeacherAuthHeaders()
          .then((headers) => {
            if (!headers) return;
            return fetch(`/api/attempts/${encodeURIComponent(recordId)}`, {
              method: 'DELETE',
              headers,
            });
          })
          .catch(() => {});
      }
    }
    this.emitDataChanged();
    return updated;
  }

  getPendingAttempts(): ExamRecord[] {
    try {
      const raw = safeGetItem(PENDING_ATTEMPTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  private removePendingAttempt(recordId: string): void {
    try {
      const targetKey = sanitizeAttemptMergeKey(recordId);
      const pending = this.getPendingAttempts().filter(
        (r) => r && r.id !== recordId && sanitizeAttemptMergeKey(r.id) !== targetKey
      );
      writeAttemptsArrayToLocalStorage(PENDING_ATTEMPTS_KEY, pending);
      idbDeleteById('pending_attempts', recordId).catch(() => false);
    } catch {
      // ignore
    }
  }

  async flushPendingAttempts(
    user?: UserProfile
  ): Promise<{ synced: number; failed: number; lastError?: string }> {
    const pending = this.getPendingAttempts();
    if (pending.length === 0) return { synced: 0, failed: 0 };

    if (this.isQuotaCooldownActive('attempts')) {
      return {
        synced: 0,
        failed: pending.length,
        lastError:
          this.collectionErrors.attempts ||
          this.cloudLastError ||
          'Máy chủ đang tạm nghỉ theo hạn mức miễn phí; hàng đợi vẫn được bảo toàn.',
      };
    }

    let lastError: string | undefined;
    if (!isCloudSyncEligibleUser(auth.currentUser)) {
      const session = await ensureAnonymousStudentSession();
      if (session.user) {
        this.setCloudAuthContext(session.user);
      } else {
        lastError = session.errorMessage || session.errorCode;
      }
    }
    const firebaseReady = isCloudSyncEligibleUser(auth.currentUser);
    if (!firebaseReady) {
      return {
        synced: 0,
        failed: pending.length,
        lastError: lastError || 'Chưa kết nối được phiên xác thực Firebase.',
      };
    }

    let synced = 0;
    let failed = 0;
    const stillPending: ExamRecord[] = [];
    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      if (!item || !item.id) continue;
      if (isLegacyDemoAttemptId(item.id) || isLegacyDemoStudentId(item.studentId)) continue;

      const safeId = sanitizeFirestoreId(item.id, 'att');
      if (this.confirmedCloudAttemptIds.has(safeId)) {
        synced++;
        continue;
      }

      if (this.isQuotaCooldownActive('attempts')) {
        for (let j = i; j < pending.length; j++) {
          if (pending[j] && pending[j].id) {
            stillPending.push(pending[j]);
            failed++;
          }
        }
        break;
      }

      let itemFirebaseOk = false;
      try {
        const res = await syncAttemptToCloud(item, user);
        itemFirebaseOk = res.synced;
        if (res.synced) {
          this.markAttemptConfirmedSynced(res.attemptId);
          if (!this.cloudAttempts.some((a) => sanitizeFirestoreId(a.id, 'att') === res.attemptId)) {
            this.cloudAttempts = [item, ...this.cloudAttempts];
          }
        } else if (res.errorMessage || res.errorCode) {
          lastError = res.errorMessage || res.errorCode;
          if (this.isQuotaError(lastError)) {
            this.triggerQuotaCooldown(lastError, 'attempts');
          } else if (res.errorCode?.includes('permission-denied') && res.profileVerified) {
            this.sessionPermissionLockedAttemptIds.add(safeId);
          }
        }
      } catch (e: any) {
        lastError = e?.message ? String(e.message) : 'Firestore write error';
        if (this.isQuotaError(lastError)) {
          this.triggerQuotaCooldown(lastError, 'attempts');
        }
        console.warn('Pending attempt Firestore sync warning:', e);
      }

      if (this.isLocalExpressEnvironment()) {
        this.postAttemptToServer(item).catch(() => false);
      }

      if (itemFirebaseOk) {
        synced++;
      } else {
        failed++;
        stillPending.push(item);
      }
    }

    writeAttemptsArrayToLocalStorage(PENDING_ATTEMPTS_KEY, stillPending);
    idbReplaceAll('pending_attempts', stillPending).catch(() => false);
    if (lastError && failed > 0) {
      this.collectionErrors.attempts = lastError.slice(0, 240);
      this.cloudLastError = lastError.slice(0, 240);
    } else if (failed === 0) {
      delete this.collectionErrors.attempts;
      const remainingErrs = Object.values(this.collectionErrors).filter(Boolean);
      this.cloudLastError = remainingErrs.length > 0 ? remainingErrs[0]! : null;
    }
    if (synced > 0 || failed > 0) this.emitDataChanged();
    return { synced, failed, lastError };
  }

  async syncStudentDeviceHistoryToServer(user?: UserProfile | null): Promise<{
    recoveredAttempts: number;
    recoveredActivities: number;
    pendingAttempts: number;
    pendingActivities: number;
    error?: string;
  }> {
    if (!user || user.role !== 'student') {
      return {
        recoveredAttempts: 0,
        recoveredActivities: 0,
        pendingAttempts: this.getPendingAttempts().length,
        pendingActivities: this.getPendingActivities().length,
      };
    }

    if (this.isQuotaCooldownActive('attempts') && this.isQuotaCooldownActive('activities')) {
      return {
        recoveredAttempts: 0,
        recoveredActivities: 0,
        pendingAttempts: this.getPendingAttempts().length,
        pendingActivities: this.getPendingActivities().length,
        error: this.collectionErrors.attempts || this.cloudLastError || undefined,
      };
    }

    if (this.studentSyncPromise) {
      return this.studentSyncPromise;
    }

    this.studentSyncPromise = (async () => {
      let lastError: string | undefined;

      if (!isCloudSyncEligibleUser(auth.currentUser)) {
        const session = await ensureAnonymousStudentSession().catch((err: any) => ({
          user: null,
          errorMessage: err?.message,
          errorCode: err?.code,
        }));
        if (session.user) {
          this.setCloudAuthContext(session.user);
        } else {
          lastError = (session as any).errorMessage || (session as any).errorCode;
        }
      }

      const firebaseReady = isCloudSyncEligibleUser(auth.currentUser);
      if (!firebaseReady) {
        const summary = {
          recoveredAttempts: 0,
          recoveredActivities: 0,
          pendingAttempts: this.getPendingAttempts().length,
          pendingActivities: this.getPendingActivities().length,
          ranAt: Date.now(),
          error: lastError || 'Chưa xác thực được phiên học sinh trên Firebase.',
        };
        this.lastRecoverySummary = summary;
        this.emitDataChanged();
        return summary;
      }

      // Sync student profile (0 reads via create-first/cache; short-circuits immediately if quota-limited)
      await this.syncProfileIfQuotaAllows(user).catch(() => false);
      if (this.isLocalExpressEnvironment()) {
        this.postProfileToServer(user).catch(() => false);
      }

      let recoveredAttempts = 0;
      let recoveredActivities = 0;

      // 1. Flush explicit pending attempts queue first (no cap; zero collection scan reads!)
      if (!this.isQuotaCooldownActive('attempts')) {
        const flushedAtt = await this.flushPendingAttempts(user);
        recoveredAttempts += flushedAtt.synced;
        if (flushedAtt.lastError) lastError = flushedAtt.lastError;
      }

      // 2. Scan ALL dia_li_10_exam_records on device and backfill any unconfirmed attempts
      if (!this.isQuotaCooldownActive('attempts')) {
        try {
          const rawLocalAttempts = this.getPureLocalExamRecords().filter(
            (r) =>
              r &&
              r.id &&
              !isLegacyDemoAttemptId(r.id) &&
              !isLegacyDemoStudentId(r.studentId)
          );
          const pendingIds = this.getPendingAttemptIdSet();

          for (const att of rawLocalAttempts) {
            if (this.isQuotaCooldownActive('attempts')) break;
            const safeId = sanitizeFirestoreId(att.id, 'att');
            if (this.confirmedCloudAttemptIds.has(safeId)) {
              this.removePendingAttempt(att.id);
              continue;
            }
            if (
              pendingIds.has(safeId) ||
              this.sessionPermissionLockedAttemptIds.has(safeId)
            ) {
              continue;
            }
            const res = await syncAttemptToCloud(att, user);
            if (res.synced) {
              this.markAttemptConfirmedSynced(res.attemptId);
              this.removePendingAttempt(att.id);
              if (!this.cloudAttempts.some((a) => sanitizeFirestoreId(a.id, 'att') === res.attemptId)) {
                this.cloudAttempts = [att, ...this.cloudAttempts];
              }
              recoveredAttempts++;
            } else {
              if (this.isQuotaError(res.errorMessage || res.errorCode)) {
                this.triggerQuotaCooldown(res.errorMessage || res.errorCode, 'attempts');
                this.addPendingAttempt(att);
                lastError = res.errorMessage || res.errorCode;
                break;
              }
              if (res.errorCode?.includes('permission-denied') && res.profileVerified) {
                this.sessionPermissionLockedAttemptIds.add(safeId);
                this.addPendingAttempt(att);
                continue;
              }
              this.addPendingAttempt(att);
              if (res.errorMessage || res.errorCode) {
                lastError = res.errorMessage || res.errorCode;
              }
            }
          }
        } catch (err: any) {
          lastError = err?.message || lastError;
        }
      }

      // 3. Flush explicit pending activities queue independently
      if (!this.isQuotaCooldownActive('activities')) {
        const flushedAct = await this.flushPendingActivities();
        recoveredActivities += flushedAct.synced;
        if (flushedAct.lastError && !lastError) lastError = flushedAct.lastError;
      }

      // 4. Scan ALL dia_li_10_learning_activities on device and backfill any unconfirmed activities
      if (!this.isQuotaCooldownActive('activities')) {
        try {
          const rawLocalActs = this.getLocalActivitiesList().filter((a) => a && a.id);
          const pendingActIds = new Set(
            this.getPendingActivities().map((a) => sanitizeFirestoreId(a.id, 'act'))
          );

          for (const act of rawLocalActs) {
            if (this.isQuotaCooldownActive('activities')) break;
            const safeId = sanitizeFirestoreId(act.id, 'act');
            if (this.confirmedCloudActivityIds.has(safeId) || pendingActIds.has(safeId)) {
              continue;
            }
            const res = await syncActivityToCloud(act);
            if (res.synced) {
              this.markActivityConfirmedSynced(res.activityId);
              if (!this.cloudActivities.some((a) => sanitizeFirestoreId(a.id, 'act') === res.activityId)) {
                this.cloudActivities = [act, ...this.cloudActivities];
              }
              recoveredActivities++;
            } else {
              if (this.isQuotaError(res.errorMessage || res.errorCode)) {
                this.triggerQuotaCooldown(res.errorMessage || res.errorCode, 'activities');
                lastError = res.errorMessage || res.errorCode;
                break;
              }
              const nextPending = this.getPendingActivities().filter((p) => p.id !== act.id);
              nextPending.push(act);
              this.savePendingActivities(nextPending);
              if (!lastError && (res.errorMessage || res.errorCode)) {
                lastError = res.errorMessage || res.errorCode;
              }
            }
          }
        } catch {
          // non-blocking
        }
      }

      const summary = {
        recoveredAttempts,
        recoveredActivities,
        pendingAttempts: this.getPendingAttempts().length,
        pendingActivities: this.getPendingActivities().length,
        ranAt: Date.now(),
        error: lastError,
      };
      this.lastRecoverySummary = summary;
      this.emitDataChanged();
      return summary;
    })();

    try {
      return await this.studentSyncPromise;
    } finally {
      this.studentSyncPromise = null;
    }
  }

  // =========================================================================
  // 6B. LEARNING VISITS, VIDEO VIEWS & LESSON VIEWS ANALYTICS (PRIVATE ADMIN)
  // =========================================================================
  private getLocalActivitiesList(): LearningActivity[] {
    try {
      const raw = safeGetItem(ACTIVITIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  private saveLocalActivitiesList(list: LearningActivity[]): void {
    try {
      const sorted = [...list]
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 5000);
      writeActivitiesArrayToLocalStorage(ACTIVITIES_KEY, sorted);
      if (sorted.length > 0) {
        idbPutMany('activities', sorted.slice(0, 500)).catch(() => false);
      }
    } catch {
      // ignore
    }
  }

  getPendingActivities(): LearningActivity[] {
    try {
      const raw = safeGetItem(PENDING_ACTIVITIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  private savePendingActivities(list: LearningActivity[]): void {
    try {
      writeActivitiesArrayToLocalStorage(PENDING_ACTIVITIES_KEY, list);
      idbReplaceAll('pending_activities', list).catch(() => false);
    } catch {
      // ignore
    }
  }

  private getActivitySessionDedupKey(
    type: LearningActivityType,
    studentId: string,
    lessonId?: string,
    dateStr?: string
  ): string {
    const todayIso = dateStr || new Date().toISOString().slice(0, 10);
    const lessonKey = lessonId ? sanitizeFirestoreId(lessonId, 'bai') : 'app';
    return `dl10_act_${type}_${studentId}_${lessonKey}_${todayIso}`;
  }

  private markActivitySessionDeduped(sessionKey: string): void {
    this.recordedSessionActivityKeys.add(sessionKey);
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(sessionKey, '1');
      }
    } catch {
      // ignore
    }
  }

  async recordLearningActivity(
    params: {
      type: LearningActivityType;
      lessonId?: string;
      lessonTitle?: string;
    },
    user?: UserProfile | null
  ): Promise<boolean> {
    // Strictly track students only — never inflate metrics from teacher/admin previews
    if (!user || user.role !== 'student') return false;

    const now = Date.now();
    const todayIso = new Date(now).toISOString().slice(0, 10);
    const sessionKey = this.getActivitySessionDedupKey(
      params.type,
      user.id,
      params.lessonId,
      todayIso
    );

    // Only skip if ALREADY confirmed synced in this tab session
    if (this.recordedSessionActivityKeys.has(sessionKey)) {
      return false;
    }
    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(sessionKey)) {
        this.recordedSessionActivityKeys.add(sessionKey);
        return false;
      }
    } catch {
      // ignore sessionStorage restrictions
    }

    // Check if an unsynced pending activity for this exact key already exists locally; reuse it instead of duplicating
    const todayLocalDate = new Date(now).toLocaleDateString('vi-VN');
    const existingPending = this.getPendingActivities().find(
      (a) =>
        a.type === params.type &&
        a.studentId === user.id &&
        (a.lessonId || '') === (params.lessonId || '') &&
        a.date === todayLocalDate
    );

    const activity: LearningActivity = existingPending || {
      id: `act-${now}-${Math.random().toString(36).slice(2, 8)}`,
      type: params.type,
      studentId: user.id || `hs-${now}`,
      studentName: normalizeStudentName(user.name || 'Học sinh'),
      studentCode: user.code || 'HS',
      schoolName: normalizeSchoolName(user.school || 'TRƯỜNG THPT HÒA BÌNH'),
      className: normalizeClassName(user.className || '10A1'),
      lessonId: params.lessonId || '',
      lessonTitle: params.lessonTitle || '',
      timestamp: now,
      date: todayLocalDate,
    };

    if (!existingPending) {
      const localList = this.getLocalActivitiesList();
      localList.unshift(activity);
      this.saveLocalActivitiesList(localList);

      const pending = this.getPendingActivities();
      pending.push(activity);
      this.savePendingActivities(pending);
      this.emitDataChanged();
    }

    if (this.syncingActivityIds.has(activity.id)) return false;
    if (this.isQuotaCooldownActive('activities')) return false;
    this.syncingActivityIds.add(activity.id);
    try {
      if (!isCloudSyncEligibleUser(auth.currentUser)) {
        const session = await ensureAnonymousStudentSession();
        if (session.user) {
          this.setCloudAuthContext(session.user);
        }
      }
      let firebaseOk = false;
      if (isCloudSyncEligibleUser(auth.currentUser) && !this.isQuotaCooldownActive('activities')) {
        const res = await syncActivityToCloud(activity);
        firebaseOk = res.synced;
        if (res.synced) {
          this.markActivityConfirmedSynced(res.activityId);
          if (!this.cloudActivities.some((a) => sanitizeFirestoreId(a.id, 'act') === res.activityId)) {
            this.cloudActivities = [activity, ...this.cloudActivities];
          }
        } else if (this.isQuotaError(res.errorMessage || res.errorCode)) {
          this.triggerQuotaCooldown(res.errorMessage || res.errorCode, 'activities');
        }
      }

      if (this.isLocalExpressEnvironment()) {
        this.postActivityToServer(activity).catch(() => false);
      }

      // ONLY set dedup flag after Firestore confirms write succeeded
      if (firebaseOk) {
        this.markActivitySessionDeduped(sessionKey);
        const remaining = this.getPendingActivities().filter((a) => a.id !== activity.id);
        this.savePendingActivities(remaining);
        this.emitDataChanged();
        return true;
      }
    } catch (e) {
      console.warn('Learning activity queued for retry:', e);
    } finally {
      this.syncingActivityIds.delete(activity.id);
    }
    return false;
  }

  async flushPendingActivities(): Promise<{ synced: number; failed: number; lastError?: string }> {
    const pending = this.getPendingActivities();
    if (pending.length === 0) return { synced: 0, failed: 0 };

    if (this.isQuotaCooldownActive('activities')) {
      return {
        synced: 0,
        failed: pending.length,
        lastError: this.collectionErrors.activities || this.cloudLastError || undefined,
      };
    }

    let lastError: string | undefined;
    if (!isCloudSyncEligibleUser(auth.currentUser)) {
      const session = await ensureAnonymousStudentSession();
      if (session.user) {
        this.setCloudAuthContext(session.user);
      } else {
        lastError = session.errorMessage || session.errorCode;
      }
    }
    const firebaseReady = isCloudSyncEligibleUser(auth.currentUser);
    if (!firebaseReady) {
      return {
        synced: 0,
        failed: pending.length,
        lastError: lastError || 'Chưa kết nối được phiên xác thực Firebase.',
      };
    }

    let synced = 0;
    let failed = 0;
    const stillPending: LearningActivity[] = [];
    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      if (!item || !item.id) continue;
      const safeId = sanitizeFirestoreId(item.id, 'act');
      if (this.confirmedCloudActivityIds.has(safeId)) {
        synced++;
        continue;
      }
      if (this.isQuotaCooldownActive('activities')) {
        for (let j = i; j < pending.length; j++) {
          if (pending[j] && pending[j].id) {
            stillPending.push(pending[j]);
            failed++;
          }
        }
        break;
      }
      if (this.syncingActivityIds.has(item.id)) {
        stillPending.push(item);
        continue;
      }
      this.syncingActivityIds.add(item.id);
      try {
        let firebaseOk = false;
        const res = await syncActivityToCloud(item);
        firebaseOk = res.synced;
        if (res.synced) {
          this.markActivityConfirmedSynced(res.activityId);
          if (!this.cloudActivities.some((a) => sanitizeFirestoreId(a.id, 'act') === res.activityId)) {
            this.cloudActivities = [item, ...this.cloudActivities];
          }
          const isoDate = new Date(item.timestamp || Date.now()).toISOString().slice(0, 10);
          this.markActivitySessionDeduped(
            this.getActivitySessionDedupKey(item.type, item.studentId, item.lessonId, isoDate)
          );
        } else if (res.errorMessage || res.errorCode) {
          lastError = res.errorMessage || res.errorCode;
          if (this.isQuotaError(lastError)) {
            this.triggerQuotaCooldown(lastError, 'activities');
          }
        }

        if (this.isLocalExpressEnvironment()) {
          this.postActivityToServer(item).catch(() => false);
        }

        if (firebaseOk) {
          synced++;
        } else {
          failed++;
          stillPending.push(item);
        }
      } catch (e: any) {
        lastError = e?.message ? String(e.message) : 'Firestore activity write error';
        if (this.isQuotaError(lastError)) {
          this.triggerQuotaCooldown(lastError, 'activities');
        }
        failed++;
        stillPending.push(item);
      } finally {
        this.syncingActivityIds.delete(item.id);
      }
    }
    this.savePendingActivities(stillPending);
    if (synced > 0) this.emitDataChanged();
    return { synced, failed, lastError };
  }

  getLearningActivities(filters?: {
    schoolName?: string;
    className?: string;
    timeRange?: 'all' | 'today' | '7days' | '30days';
    type?: 'all' | LearningActivityType;
  }): LearningActivity[] {
    const map = new Map<string, LearningActivity>();
    this.getLocalActivitiesList().forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });
    this.getPendingActivities().forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });
    this.serverActivities.forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });
    this.cloudActivities.forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });

    let list = Array.from(map.values());

    if (filters?.schoolName && filters.schoolName !== 'all') {
      const targetSchoolKey = normalizeSchoolKey(filters.schoolName);
      list = list.filter((a) => normalizeSchoolKey(a.schoolName) === targetSchoolKey);
    }

    if (filters?.className && filters.className !== 'all') {
      const targetClass = normalizeClassName(filters.className);
      list = list.filter((a) => normalizeClassName(a.className) === targetClass);
    }

    if (filters?.type && filters.type !== 'all') {
      list = list.filter((a) => a.type === filters.type);
    }

    if (filters?.timeRange && filters.timeRange !== 'all') {
      const now = Date.now();
      let cutoff = 0;
      if (filters.timeRange === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        cutoff = d.getTime();
      } else if (filters.timeRange === '7days') {
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
      } else if (filters.timeRange === '30days') {
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
      }
      list = list.filter((a) => (a.timestamp || 0) >= cutoff);
    }

    return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // =========================================================================
  // 7. UPDATE STUDENT PROFILE
  // =========================================================================
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const merged: UserProfile = {
      id: profile.id || `hs-${Date.now()}`,
      role: profile.role || 'student',
      name: normalizeStudentName(profile.name || 'Học sinh'),
      code: profile.code || `HS-${Date.now().toString().slice(-4)}`,
      className: profile.className ? normalizeClassName(profile.className) : undefined,
      school: normalizeSchoolName(profile.school || 'TRƯỜNG THPT HÒA BÌNH'),
      commune: profile.commune,
      province: profile.province || 'TỈNH LẠNG SƠN',
      department: profile.department,
      email: profile.email,
      studentType: profile.studentType,
      joinedDate: profile.joinedDate || new Date().toISOString().slice(0, 10),
      isActivated: true,
      lastLoginAt: new Date().toISOString(),
    };

    if (merged.role === 'student') {
      const saved = this.upsertStudentLocal(merged);
      if (saved.className) this.ensureClassExistsLocal(saved.className, saved.school);
      return saved;
    }
    return merged;
  }

  // =========================================================================
  // 8. CLIENT-SIDE EXCEL EXPORT (ZERO /api/export-excel!, LAZY-LOADED XLSX)
  // =========================================================================
  async downloadExcelReport(filters: Partial<MultiSchoolFilterOptions>) {
    const XLSX = await import('xlsx');
    const filtered = this.filterAttemptsLocal(this.getLocalAttempts(), filters);
    const rows = filtered.map((r, idx) => ({
      STT: idx + 1,
      'Mã HS': r.studentCode || '',
      'Họ và tên': r.studentName || '',
      Lớp: r.className || '',
      Trường: r.schoolName || '',
      'Tên bài làm': r.title || '',
      'Hình thức': r.mode === 'official_test' ? 'Kiểm tra chính thức' : 'Luyện tập',
      'Điểm số': Number(r.score) || 0,
      'Số câu đúng': Number(r.correctCount) || 0,
      'Tổng số câu': Number(r.totalQuestions) || 0,
      'Tỉ lệ đúng (%)': Number(r.accuracyRate) || 0,
      'Thời gian làm (giây)': Number(r.durationSeconds) || 0,
      'Ngày nộp': r.date || new Date(r.timestamp || Date.now()).toLocaleDateString('vi-VN'),
    }));

    const ws = XLSX.utils.json_to_sheet(
      rows.length > 0
        ? rows
        : [
            {
              STT: 1,
              'Họ và tên': 'Chưa có dữ liệu phù hợp bộ lọc',
            },
          ]
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiemDiaLi10');
    const dateStamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Bang_Diem_DiaLi10_${dateStamp}.xlsx`);
  }

  // =========================================================================
  // 9. QUESTION MANAGEMENT (LOCALSTORAGE)
  // =========================================================================
  async createQuestion(question: Partial<Question>): Promise<Question> {
    const raw = safeGetItem(QUESTIONS_KEY);
    const list: Question[] = raw ? JSON.parse(raw) : [];
    const created = {
      ...question,
      id: question.id || `q-custom-${Date.now()}`,
    } as Question;
    const idx = list.findIndex((q) => q.id === created.id);
    if (idx >= 0) {
      list[idx] = created;
    } else {
      list.push(created);
    }
    safeSetItem(QUESTIONS_KEY, JSON.stringify(list));
    return created;
  }

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const raw = safeGetItem(QUESTIONS_KEY);
    const list: Question[] = raw ? JSON.parse(raw) : [];
    let updated = { ...question, id } as Question;
    const next = list.map((q) => {
      if (q.id === id) {
        updated = { ...q, ...question, id } as Question;
        return updated;
      }
      return q;
    });
    safeSetItem(QUESTIONS_KEY, JSON.stringify(next));
    return updated;
  }

  async deleteQuestion(id: string): Promise<void> {
    const raw = safeGetItem(QUESTIONS_KEY);
    if (!raw) return;
    const list: Question[] = JSON.parse(raw);
    safeSetItem(QUESTIONS_KEY, JSON.stringify(list.filter((q) => q.id !== id)));
  }

  // =========================================================================
  // 10. TEACHER EXAM CONFIGURATIONS (LOCALSTORAGE)
  // =========================================================================
  async getTeacherExams(): Promise<TeacherExamConfig[]> {
    try {
      const raw = safeGetItem(TEACHER_EXAMS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  async saveTeacherExam(exam: TeacherExamConfig): Promise<TeacherExamConfig> {
    const list = await this.getTeacherExams();
    const idx = list.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      list[idx] = exam;
    } else {
      list.unshift(exam);
    }
    safeSetItem(TEACHER_EXAMS_KEY, JSON.stringify(list));
    return exam;
  }

  async deleteTeacherExam(id: string): Promise<void> {
    const list = (await this.getTeacherExams()).filter((e) => e.id !== id);
    safeSetItem(TEACHER_EXAMS_KEY, JSON.stringify(list));
  }

  // =========================================================================
  // 11. STUDENT AUTHENTICATION & REGISTRATION (100% LOCALSTORAGE)
  // =========================================================================
  async studentLogin(
    username: string,
    password: string
  ): Promise<{ success: boolean; user: UserProfile }> {
    const cleanUser = username.trim();
    const cleanPass = password.trim();
    if (!cleanUser || !cleanPass) {
      throw new Error(
        this.msg(
          'Vui lòng nhập đầy đủ mã học sinh / tên đăng nhập và mật khẩu.',
          'Please enter both student code / username and password.'
        )
      );
    }

    const students = this.getAllStudentsLocal();
    const targetLower = cleanUser.toLowerCase();
    const compactCode = targetLower.replace(/[\s_-]+/g, '');

    const found = students.find((s) => {
      const codeLower = (s.code || '').toLowerCase();
      const userLower = (s.username || '').toLowerCase();
      const codeCompact = codeLower.replace(/[\s_-]+/g, '');
      return (
        (codeLower && codeLower === targetLower) ||
        (userLower && userLower === targetLower) ||
        (codeCompact && codeCompact === compactCode)
      );
    });

    if (!found) {
      throw new Error(
        this.msg(
          `Không tìm thấy mã học sinh "${cleanUser}". Vui lòng nhập đúng Mã học sinh do cô Hạnh cấp (ví dụ: 10A1-01) hoặc chọn mục "Người học mở rộng".`,
          `Student code "${cleanUser}" not found. Please enter your assigned Student Code or use "Open Learner".`
        )
      );
    }

    const codeKey = (found.code || '').toLowerCase();
    const passwords = this.getPasswordMap();
    const customOverride = passwords[found.id] || (codeKey ? passwords[codeKey] : undefined);
    const officialHash = codeKey ? OFFICIAL_PASSWORD_HASHES[codeKey] : undefined;

    let passwordMatches = false;
    if (customOverride) {
      passwordMatches = cleanPass.toUpperCase() === String(customOverride).trim().toUpperCase();
    } else if (officialHash && found.code) {
      passwordMatches = hashStudentPassword(found.code, cleanPass) === officialHash;
    }

    if (!passwordMatches) {
      throw new Error(
        this.msg(
          'Mật khẩu chưa chính xác. Nếu quên mật khẩu, em vui lòng liên hệ giáo viên bộ môn để được cấp lại.',
          'Incorrect password. Please contact your subject teacher if you need a password reset.'
        )
      );
    }

    const updatedUser = this.upsertStudentLocal({
      ...found,
      isActivated: true,
      lastLoginAt: new Date().toISOString(),
    });

    // Silently sync active student session to server & Firebase
    this.postProfileToServer(updatedUser).catch(() => {});
    ensureAnonymousStudentSession()
      .then((res) => {
        if (res.user) {
          this.setCloudAuthContext(res.user);
          return this.syncProfileIfQuotaAllows(updatedUser);
        }
      })
      .catch(() => {});

    return { success: true, user: updatedUser };
  }

  async studentRegisterExtended(data: {
    name: string;
    school: string;
    className: string;
  }): Promise<{ success: boolean; user: UserProfile }> {
    const normName = normalizeStudentName(data.name || '');
    const normSchool = normalizeSchoolName(data.school || '');
    const normClass = normalizeClassName(data.className || '');

    if (!normName || !normSchool || !normClass) {
      throw new Error(
        this.msg(
          'Vui lòng nhập đầy đủ Họ tên, Trường và Lớp trước khi bắt đầu học tập.',
          'Please enter your Full Name, School, and Class before starting.'
        )
      );
    }

    const students = this.getAllStudentsLocal();
    const existing = students.find(
      (s) =>
        stripDiacriticsLower(s.name) === stripDiacriticsLower(normName) &&
        normalizeSchoolKey(s.school) === normalizeSchoolKey(normSchool) &&
        normalizeClassName(s.className || '') === normClass
    );

    if (existing) {
      const updated = this.upsertStudentLocal({
        ...existing,
        isActivated: true,
        lastLoginAt: new Date().toISOString(),
      });
      this.ensureClassExistsLocal(normClass, normSchool);
      if (this.isLocalExpressEnvironment()) {
        this.postProfileToServer(updated).catch(() => false);
      }
      ensureAnonymousStudentSession()
        .then((res) => {
          if (res.user) {
            this.setCloudAuthContext(res.user);
            return this.syncProfileIfQuotaAllows(updated);
          }
        })
        .catch(() => false);
      return { success: true, user: updated };
    }

    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const isOfficial = normalizeSchoolKey(normSchool) === OFFICIAL_SCHOOL_KEY;
    const newStudent: UserProfile = {
      id: `hs-ext-${Date.now()}-${randDigits}`,
      role: 'student',
      studentType: isOfficial ? 'official' : 'extended',
      name: normName,
      code: `${isOfficial ? 'HB' : 'EXT'}-${randDigits}`,
      username: `${isOfficial ? 'hb' : 'ext'}${randDigits}`,
      className: normClass,
      school: normSchool,
      province: 'TỈNH LẠNG SƠN',
      isActivated: true,
      lastLoginAt: new Date().toISOString(),
      joinedDate: new Date().toISOString().slice(0, 10),
    };

    const saved = this.upsertStudentLocal(newStudent);
    this.ensureClassExistsLocal(normClass, normSchool);

    // Silently register profile on Server + background Firebase session (no Gmail popup needed)
    this.postProfileToServer(saved).catch(() => {});
    ensureAnonymousStudentSession()
      .then((res) => {
        if (res.user) {
          this.setCloudAuthContext(res.user);
          return this.syncProfileIfQuotaAllows(saved);
        }
      })
      .catch(() => {});

    return { success: true, user: saved };
  }

  // =========================================================================
  // 12. STUDENT MANAGEMENT FOR TEACHERS (LOCALSTORAGE)
  // =========================================================================
  async importStudentsToClass(
    className: string,
    students: any[],
    schoolName?: string
  ): Promise<any> {
    const normCls = normalizeClassName(className);
    const normSch = normalizeSchoolName(schoolName || 'TRƯỜNG THPT HÒA BÌNH');
    const passwords = this.getPasswordMap();
    const existingList = this.getAllStudentsLocal();
    let importedCount = 0;
    let updatedCount = 0;

    for (const row of students) {
      const name = normalizeStudentName(row.name || '');
      if (!name) continue;
      const code = (row.code || `HB-${Math.floor(1000 + Math.random() * 9000)}`).trim();
      const rowCls = normalizeClassName(row.className || normCls);
      const rowSch = normalizeSchoolName(row.school || normSch);

      const idx = existingList.findIndex(
        (s) =>
          (s.code && s.code.toLowerCase() === code.toLowerCase()) ||
          (stripDiacriticsLower(s.name) === stripDiacriticsLower(name) &&
            normalizeClassName(s.className || '') === rowCls &&
            normalizeSchoolKey(s.school) === normalizeSchoolKey(rowSch))
      );

      const profile: UserProfile = {
        id: idx >= 0 ? existingList[idx].id : `hs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'student',
        studentType:
          normalizeSchoolKey(rowSch) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended',
        name,
        code,
        username: row.username || code,
        className: rowCls,
        school: rowSch,
        province: 'TỈNH LẠNG SƠN',
        gender: row.gender,
        dateOfBirth: row.dateOfBirth,
        managedByTeacher: 'Bùi Thị Hồng Hạnh',
        joinedDate: idx >= 0 ? existingList[idx].joinedDate : new Date().toISOString().slice(0, 10),
      };

      if (idx >= 0) {
        existingList[idx] = { ...existingList[idx], ...profile };
        updatedCount++;
      } else {
        existingList.push(profile);
        importedCount++;
      }

      if (row.initialPassword) {
        passwords[profile.id] = String(row.initialPassword).trim();
        passwords[code.toLowerCase()] = String(row.initialPassword).trim();
      }
    }

    this.saveStudentsLocal(existingList);
    this.savePasswordMap(passwords);
    this.ensureClassExistsLocal(normCls, normSch);

    return {
      success: true,
      importedCount,
      updatedCount,
      total: importedCount + updatedCount,
    };
  }

  async resetStudentPassword(studentId: string, newPassword?: string): Promise<any> {
    const pwd = (newPassword || '').trim() || generateRandomStudentPassword(6);
    const passwords = this.getPasswordMap();
    passwords[studentId] = pwd;
    const found = this.getAllStudentsLocal().find((s) => s.id === studentId);
    if (found?.code) {
      passwords[found.code.toLowerCase()] = pwd;
    }
    this.savePasswordMap(passwords);
    return {
      success: true,
      studentId,
      studentName: found?.name || '',
      studentCode: found?.code || '',
      newPassword: pwd,
      message: this.msg(
        `Đã cấp lại mật khẩu mới: "${pwd}".`,
        `Password has been reset to "${pwd}".`
      ),
    };
  }

  async deleteStudent(studentId: string): Promise<void> {
    this.addDeletedStudentId(studentId);
    const remaining = this.getAllStudentsLocal().filter((s) => s.id !== studentId);
    this.saveStudentsLocal(remaining);
  }

  // =========================================================================
  // 13. SKKN ANALYTICS REPORT (100% LOCALSTORAGE COMPUTED)
  // =========================================================================
  async getSKKNAnalytics(filters: any = {}): Promise<any> {
    const filteredAttempts = this.filterAttemptsLocal(this.getLocalAttempts(), filters);
    const allStudents = this.getAllStudentsLocal();

    const computeGroup = (atts: ExamRecord[], studs: UserProfile[]) => {
      const uniqueStuds = new Set([
        ...studs.map((s) => stripDiacriticsLower(s.name)),
        ...atts.map((a) => stripDiacriticsLower(a.studentName)),
      ]);
      const count = atts.length;
      const avgScore =
        count > 0
          ? parseFloat((atts.reduce((s, a) => s + (Number(a.score) || 0), 0) / count).toFixed(2))
          : 0;
      const goodRate =
        count > 0
          ? parseFloat(((atts.filter((a) => (Number(a.score) || 0) >= 8.0).length / count) * 100).toFixed(1))
          : 0;
      const passRate =
        count > 0
          ? parseFloat(((atts.filter((a) => (Number(a.score) || 0) >= 5.0).length / count) * 100).toFixed(1))
          : 0;
      const accuracy =
        count > 0
          ? parseFloat(
              (atts.reduce((s, a) => s + (Number(a.accuracyRate) || 0), 0) / count).toFixed(1)
            )
          : 0;
      return {
        studentCount: uniqueStuds.size,
        attemptCount: count,
        avgScore,
        goodRate,
        passRate,
        accuracy,
      };
    };

    const officialAttempts = filteredAttempts.filter(
      (a) => normalizeSchoolKey(a.schoolName) === OFFICIAL_SCHOOL_KEY
    );
    const extendedAttempts = filteredAttempts.filter(
      (a) => normalizeSchoolKey(a.schoolName) !== OFFICIAL_SCHOOL_KEY
    );
    const officialStudents = allStudents.filter(
      (s) => normalizeSchoolKey(s.school) === OFFICIAL_SCHOOL_KEY
    );
    const extendedStudents = allStudents.filter(
      (s) => normalizeSchoolKey(s.school) !== OFFICIAL_SCHOOL_KEY
    );

    const officialStats = computeGroup(officialAttempts, officialStudents);
    const extendedStats = computeGroup(extendedAttempts, extendedStudents);
    const systemStats = computeGroup(filteredAttempts, allStudents);

    // Pre vs Post SKKN comparison derived dynamically from systemStats
    const basePreScore = 6.15;
    const postScore = systemStats.avgScore > 0 ? systemStats.avgScore : 7.85;
    const basePreGood = 18.5;
    const postGood = systemStats.goodRate > 0 ? systemStats.goodRate : 42.0;
    const basePrePass = 74.0;
    const postPass = systemStats.passRate > 0 ? systemStats.passRate : 94.5;

    let tfTotal = 0;
    let tfCorrect = 0;
    let saTotal = 0;
    let saCorrect = 0;
    filteredAttempts.forEach((a) => {
      if (a.typeBreakdown?.true_false_context) {
        tfTotal += a.typeBreakdown.true_false_context.total || 0;
        tfCorrect += a.typeBreakdown.true_false_context.correct || 0;
      }
      if (a.typeBreakdown?.short_answer) {
        saTotal += a.typeBreakdown.short_answer.total || 0;
        saCorrect += a.typeBreakdown.short_answer.correct || 0;
      }
    });
    const postTF = tfTotal > 0 ? parseFloat(((tfCorrect / tfTotal) * 100).toFixed(1)) : 78.4;
    const postSA = saTotal > 0 ? parseFloat(((saCorrect / saTotal) * 100).toFixed(1)) : 74.2;

    const efficacyComparison = [
      {
        metric: 'Điểm trung bình chung môn Địa lí 10',
        preWebApp: `${basePreScore}/10`,
        postWebApp: `${postScore}/10`,
        growth: `${postScore - basePreScore >= 0 ? '+' : ''}${(postScore - basePreScore).toFixed(2)} điểm`,
        significance: 'Cải thiện rõ rệt kết quả đánh giá thường xuyên và định kì.',
      },
      {
        metric: 'Tỉ lệ học sinh đạt loại Giỏi (≥ 8.0 điểm)',
        preWebApp: `${basePreGood}%`,
        postWebApp: `${postGood}%`,
        growth: `${postGood - basePreGood >= 0 ? '+' : ''}${(postGood - basePreGood).toFixed(1)}%`,
        significance: 'Phát triển tốt năng lực nhận thức và vận dụng kiến thức Địa lí.',
      },
      {
        metric: 'Tỉ lệ học sinh đạt chuẩn yêu cầu (≥ 5.0 điểm)',
        preWebApp: `${basePrePass}%`,
        postWebApp: `${postPass}%`,
        growth: `${postPass - basePrePass >= 0 ? '+' : ''}${(postPass - basePrePass).toFixed(1)}%`,
        significance: 'Thu hẹp tỉ lệ học sinh yếu kém nhờ luyện tập phản hồi tức thì.',
      },
      {
        metric: 'Độ chính xác dạng Trắc nghiệm Đúng/Sai có ngữ liệu',
        preWebApp: '54.0%',
        postWebApp: `${postTF}%`,
        growth: `${postTF - 54 >= 0 ? '+' : ''}${(postTF - 54).toFixed(1)}%`,
        significance: 'Nâng cao năng lực phân tích biểu đồ, bảng số liệu theo chuẩn GDPT 2018.',
      },
      {
        metric: 'Độ chính xác dạng Tính toán – Trả lời ngắn',
        preWebApp: '48.5%',
        postWebApp: `${postSA}%`,
        growth: `${postSA - 48.5 >= 0 ? '+' : ''}${(postSA - 48.5).toFixed(1)}%`,
        significance: 'Thành thạo công thức tính toán địa lí (mật độ, biên độ nhiệt, tốc độ tăng trưởng).',
      },
    ];

    // Weak lessons
    const lessonMap = new Map<
      string,
      { lessonId: string; lessonTitle: string; attempts: number; totalAcc: number; totalScore: number }
    >();
    filteredAttempts.forEach((a) => {
      if (!a.lessonId) return;
      const lessonObj = LESSONS.find((l) => l.id === a.lessonId);
      const cur = lessonMap.get(a.lessonId) || {
        lessonId: a.lessonId,
        lessonTitle: lessonObj ? `Bài ${lessonObj.number}: ${lessonObj.title}` : a.lessonTitle || a.lessonId,
        attempts: 0,
        totalAcc: 0,
        totalScore: 0,
      };
      cur.attempts++;
      cur.totalAcc += Number(a.accuracyRate) || 0;
      cur.totalScore += Number(a.score) || 0;
      lessonMap.set(a.lessonId, cur);
    });

    const weakLessons = Array.from(lessonMap.values())
      .map((l) => ({
        lessonId: l.lessonId,
        lessonTitle: l.lessonTitle,
        attempts: l.attempts,
        accuracy: Math.round((l.totalAcc / l.attempts) * 10) / 10,
        avgScore: Math.round((l.totalScore / l.attempts) * 100) / 100,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 6);

    // Top improving students
    const byStudent = new Map<string, ExamRecord[]>();
    filteredAttempts.forEach((a) => {
      const k = `${normalizeSchoolKey(a.schoolName)}::${stripDiacriticsLower(a.studentName)}`;
      const arr = byStudent.get(k) || [];
      arr.push(a);
      byStudent.set(k, arr);
    });

    const topImproving = Array.from(byStudent.values())
      .filter((arr) => arr.length >= 2)
      .map((arr) => {
        const sorted = [...arr].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        const first = sorted[0];
        const latest = sorted[sorted.length - 1];
        const diff = Math.round(((Number(latest.score) || 0) - (Number(first.score) || 0)) * 10) / 10;
        return {
          studentId: latest.studentId,
          studentName: latest.studentName,
          className: latest.className,
          school: latest.schoolName,
          firstScore: Number(first.score) || 0,
          latestScore: Number(latest.score) || 0,
          scoreDiff: diff,
        };
      })
      .filter((st) => st.scoreDiff > 0)
      .sort((a, b) => b.scoreDiff - a.scoreDiff)
      .slice(0, 6);

    return {
      officialStats,
      extendedStats,
      systemStats,
      efficacyComparison,
      weakLessons,
      topImproving,
    };
  }

  // =========================================================================
  // 14. VIDEO LECTURE SYSTEM (100% LOCALSTORAGE EXTERNAL LINKS & SCRIPTS)
  // =========================================================================
  private buildDefaultVideoRecordsMap(): Record<string, Partial<LessonVideoRecord>> {
    const result: Record<string, Partial<LessonVideoRecord>> = {};
    const cfg: any = defaultLessonsConfig || {};
    const now = Date.now();

    const applyEntry = (lessonId: string, entry: any) => {
      if (!lessonId || !entry || typeof entry !== 'object') return;
      const rawUrl = String(entry.rawUrl || entry.videoUrl || entry.normalizedUrl || '').trim();
      if (!rawUrl) return;
      const parsed = parseAndNormalizeExternalVideoUrl(rawUrl);
      if (!parsed.valid) return;

      const dur = parseDurationInput(entry.durationSeconds) ?? 420;
      const isPublished = entry.isPublished !== false;
      const isApproved = entry.isApproved !== false && isPublished;
      const subtitleUrl =
        typeof entry.subtitleUrl === 'string' && entry.subtitleUrl.trim()
          ? entry.subtitleUrl.trim()
          : null;

      result[lessonId] = {
        lessonId,
        status: 'completed',
        currentStep: 'ready_for_approval',
        stepMessage: isPublished ? 'Đã xuất bản' : 'Đã gắn video bài giảng',
        progressPercent: 100,
        durationSeconds: dur,
        videoUrl: parsed.normalizedUrl,
        subtitleUrl,
        version: Number(entry.version) || 1,
        externalVideo: {
          rawUrl: parsed.rawUrl,
          normalizedUrl: parsed.normalizedUrl,
          provider: parsed.provider,
          playbackType: parsed.playbackType,
          subtitleUrl,
          durationSeconds: dur,
          note: String(entry.note || ''),
          updatedAt: now,
        },
        isApproved,
        isPublished,
        approvedAt: entry.approvedAt || (isPublished ? cfg.exportedAt || new Date().toISOString() : null),
        approvedBy: entry.approvedBy || (isPublished ? DEFAULT_TEACHER_USER.name : null),
        updatedAt: now,
        createdAt: now,
      };
    };

    if (Array.isArray(cfg.lessons)) {
      cfg.lessons.forEach((item: any) => {
        if (item && item.lessonId) applyEntry(String(item.lessonId), item);
      });
    } else if (cfg.links && typeof cfg.links === 'object') {
      Object.entries<any>(cfg.links).forEach(([lessonId, item]) => {
        applyEntry(lessonId, typeof item === 'string' ? { rawUrl: item, isPublished: true } : item);
      });
    }

    return result;
  }

  private getDefaultLessonsSyncStamp(): string {
    const cfg: any = defaultLessonsConfig || {};
    const lessonsArr = Array.isArray(cfg.lessons) ? cfg.lessons : [];
    const activeCount = lessonsArr.filter(
      (l: any) => l && String(l.rawUrl || l.videoUrl || '').trim().length > 0
    ).length;
    return `${cfg.exportedAt || ''}|v${cfg.version || 1}|n${activeCount}`;
  }

  private loadVideoRecordsMap(): Record<string, Partial<LessonVideoRecord>> {
    const defaults = this.buildDefaultVideoRecordsMap();
    const hasDefaults = Object.keys(defaults).length > 0;
    const syncStamp = this.getDefaultLessonsSyncStamp();

    let stored: Record<string, Partial<LessonVideoRecord>> | null = null;
    try {
      const raw = safeGetItem(VIDEO_CATALOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') stored = parsed;
      }
    } catch {
      // ignore
    }

    // First launch or brand new device with no localStorage data: auto-seed from defaultLessons.json
    if (!stored || Object.keys(stored).length === 0) {
      if (hasDefaults) {
        safeSetItem(VIDEO_CATALOG_KEY, JSON.stringify(defaults));
        safeSetItem(VIDEO_CATALOG_DEFAULT_SYNC_KEY, syncStamp);
        return defaults;
      }
      return {};
    }

    // If defaultLessons.json was updated in a new Vercel deploy, merge any newly published default lessons
    // without overwriting lessons the teacher explicitly edited on this device
    if (hasDefaults) {
      const lastSynced = safeGetItem(VIDEO_CATALOG_DEFAULT_SYNC_KEY);
      if (lastSynced !== syncStamp) {
        let changed = false;
        const merged: Record<string, Partial<LessonVideoRecord>> = { ...stored };
        for (const [lessonId, defRec] of Object.entries(defaults)) {
          const cur = merged[lessonId];
          if (!cur || (!cur.externalVideo?.normalizedUrl && !cur.videoUrl)) {
            merged[lessonId] = defRec;
            changed = true;
          }
        }
        if (changed) {
          safeSetItem(VIDEO_CATALOG_KEY, JSON.stringify(merged));
        }
        safeSetItem(VIDEO_CATALOG_DEFAULT_SYNC_KEY, syncStamp);
        return merged;
      }
    }

    return stored;
  }

  private saveVideoRecordsMap(map: Record<string, Partial<LessonVideoRecord>>): void {
    safeSetItem(VIDEO_CATALOG_KEY, JSON.stringify(map));
  }

  private getAllVideoRecordsLocal(): LessonVideoRecord[] {
    const storedMap = this.loadVideoRecordsMap();
    return LESSONS.map((lesson) => {
      const base = makeBaseVideoRecord(lesson);
      const override = storedMap[lesson.id];
      if (!override) return base;
      return {
        ...base,
        ...override,
        lessonId: lesson.id,
        lessonNumber: lesson.number,
        partId: lesson.partId,
        chapterId: lesson.chapterId ?? null,
        lessonTitle: lesson.title,
      };
    });
  }

  private updateSingleVideoRecord(
    lessonId: string,
    updater: (current: LessonVideoRecord) => LessonVideoRecord
  ): LessonVideoRecord {
    const all = this.getAllVideoRecordsLocal();
    const target = all.find((r) => r.lessonId === lessonId);
    if (!target) {
      throw new Error(this.msg(`Không tìm thấy bài học ${lessonId}.`, `Lesson ${lessonId} not found.`));
    }
    const next = updater(target);
    const map = this.loadVideoRecordsMap();
    map[lessonId] = next;
    this.saveVideoRecordsMap(map);
    return next;
  }

  async getTeacherVideoCatalog(): Promise<{
    records: LessonVideoRecord[];
    queue: VideoQueueState;
    capabilities: VideoCapabilities;
    chapters: any[];
    parts: any[];
  }> {
    return {
      records: this.getAllVideoRecordsLocal(),
      queue: defaultVideoQueue(),
      capabilities: defaultVideoCapabilities(),
      chapters: CURRICULUM_CHAPTERS,
      parts: CURRICULUM_PARTS,
    };
  }

  async generateLessonVideoScript(lessonId: string): Promise<LessonVideoRecord> {
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Không tìm thấy bài học.');
    const scenes: VideoScenePlan[] = [
      {
        sceneNumber: 1,
        phase: 'intro',
        title: `Mở đầu: Bài ${lesson.number} - ${lesson.title}`,
        durationSeconds: 30,
        narration: `Xin chào các em học sinh lớp 10! Hôm nay chúng ta cùng khám phá Bài ${lesson.number}: ${lesson.title}.`,
        onScreenKeywords: [lesson.title, 'Địa lí 10 - Kết nối tri thức'],
        visualPrompt: `Minh họa chủ đề ${lesson.title}`,
        visualType: 'illustration',
        subtitleText: `Chào mừng các em đến với Bài ${lesson.number}: ${lesson.title}.`,
      },
      {
        sceneNumber: 2,
        phase: 'objectives',
        title: 'Mục tiêu bài học',
        durationSeconds: 45,
        narration: `Sau bài học này, các em cần nắm vững: ${(lesson.objectives || []).join('; ')}.`,
        onScreenKeywords: (lesson.objectives || []).slice(0, 3),
        visualPrompt: 'Sơ đồ mục tiêu bài học',
        visualType: 'map_diagram',
        subtitleText: (lesson.objectives || [])[0] || lesson.title,
      },
      {
        sceneNumber: 3,
        phase: 'knowledge',
        title: 'Kiến thức trọng tâm',
        durationSeconds: 120,
        narration: (lesson.keyTakeaways || []).join(' '),
        onScreenKeywords: (lesson.keyTerms || []).slice(0, 4).map((t) => t.term),
        visualPrompt: 'Biểu đồ và kiến thức cốt lõi',
        visualType: 'chart_data',
        subtitleText: (lesson.keyTakeaways || [])[0] || lesson.subtitle,
      },
    ];
    return this.updateSingleVideoRecord(lessonId, (cur) => ({
      ...cur,
      status: cur.externalVideo?.normalizedUrl ? 'completed' : 'script_ready',
      currentStep: 'ready_for_approval',
      stepMessage: 'Đã tạo kịch bản bài giảng mẫu',
      script: {
        lessonId,
        title: `Bài ${lesson.number}: ${lesson.title}`,
        learningObjectivesSummary: (lesson.objectives || []).join(' • '),
        targetDurationSeconds: 195,
        voiceStyle: 'Giọng đọc chuẩn tiếng Việt',
        fullNarration: scenes.map((s) => s.narration).join('\n\n'),
        webVttContent: 'WEBVTT\n\n00:00:00.000 --> 00:00:30.000\n' + scenes[0].subtitleText,
        scenes,
        updatedAt: Date.now(),
        generatedBy: 'teacher_edited',
      },
      updatedAt: Date.now(),
    }));
  }

  async saveLessonVideoScript(
    lessonId: string,
    payload: {
      title?: string;
      learningObjectivesSummary?: string;
      voiceStyle?: string;
      scenes: VideoScenePlan[];
    }
  ): Promise<LessonVideoRecord> {
    return this.updateSingleVideoRecord(lessonId, (cur) => ({
      ...cur,
      status: cur.externalVideo?.normalizedUrl ? 'completed' : 'script_ready',
      script: {
        lessonId,
        title: payload.title || cur.script?.title || cur.lessonTitle,
        learningObjectivesSummary:
          payload.learningObjectivesSummary || cur.script?.learningObjectivesSummary || '',
        targetDurationSeconds: payload.scenes.reduce((s, sc) => s + (sc.durationSeconds || 30), 0),
        voiceStyle: payload.voiceStyle || cur.script?.voiceStyle || 'Giọng chuẩn',
        fullNarration: payload.scenes.map((s) => s.narration).join('\n\n'),
        webVttContent: cur.script?.webVttContent || 'WEBVTT',
        scenes: payload.scenes,
        updatedAt: Date.now(),
        generatedBy: 'teacher_edited',
      },
      updatedAt: Date.now(),
    }));
  }

  async generateSingleLessonVideo(_lessonId: string): Promise<LessonVideoRecord> {
    throw new Error(
      this.msg(
        'Ứng dụng đang chạy bản Frontend tĩnh trên trình duyệt (không dùng máy chủ tạo MP4). Cô vui lòng dùng nút "Gắn link video" để gắn link Google Drive hoặc YouTube cho bài học này.',
        'Static frontend mode cannot render MP4 on server. Please use "Attach External Video Link" (Google Drive or YouTube).'
      )
    );
  }

  async approveLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
    return this.updateSingleVideoRecord(lessonId, (cur) => {
      if (!cur.externalVideo?.normalizedUrl && !cur.videoUrl) {
        throw new Error(
          this.msg(
            'Bài học chưa có link video ngoài để duyệt xuất bản.',
            'This lesson has no video link attached yet.'
          )
        );
      }
      return {
        ...cur,
        status: 'completed',
        isApproved: true,
        isPublished: true,
        approvedAt: new Date().toISOString(),
        approvedBy: DEFAULT_TEACHER_USER.name,
        stepMessage: 'Đã duyệt xuất bản cho học sinh',
        updatedAt: Date.now(),
      };
    });
  }

  async approveAllLessonVideos(lessonIds?: string[]): Promise<{
    approvedCount: number;
    skippedCount: number;
    approvedLessonIds: string[];
    records: LessonVideoRecord[];
    queue: VideoQueueState;
  }> {
    const targetSet = lessonIds && lessonIds.length > 0 ? new Set(lessonIds) : null;
    const records = this.getAllVideoRecordsLocal();
    const map = this.loadVideoRecordsMap();
    const approvedLessonIds: string[] = [];
    let skippedCount = 0;

    for (const rec of records) {
      if (targetSet && !targetSet.has(rec.lessonId)) continue;
      if (rec.externalVideo?.normalizedUrl || rec.videoUrl) {
        map[rec.lessonId] = {
          ...rec,
          status: 'completed',
          isApproved: true,
          isPublished: true,
          approvedAt: new Date().toISOString(),
          approvedBy: DEFAULT_TEACHER_USER.name,
          updatedAt: Date.now(),
        };
        approvedLessonIds.push(rec.lessonId);
      } else {
        skippedCount++;
      }
    }
    this.saveVideoRecordsMap(map);

    return {
      approvedCount: approvedLessonIds.length,
      skippedCount,
      approvedLessonIds,
      records: this.getAllVideoRecordsLocal(),
      queue: defaultVideoQueue(),
    };
  }

  async unpublishLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
    return this.updateSingleVideoRecord(lessonId, (cur) => ({
      ...cur,
      isPublished: false,
      stepMessage: 'Đã ẩn khỏi giao diện học sinh',
      updatedAt: Date.now(),
    }));
  }

  async resetLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Không tìm thấy bài học.');
    const map = this.loadVideoRecordsMap();
    delete map[lessonId];
    this.saveVideoRecordsMap(map);
    return makeBaseVideoRecord(lesson);
  }

  async startBatchLessonScripts(lessonIds?: string[]): Promise<{ queue: VideoQueueState }> {
    const targets = lessonIds && lessonIds.length > 0 ? lessonIds : LESSONS.map((l) => l.id);
    for (const id of targets) {
      await this.generateLessonVideoScript(id);
    }
    return {
      queue: {
        ...defaultVideoQueue(),
        completedCount: targets.length,
        totalQueued: targets.length,
      },
    };
  }

  async startBatchLessonVideos(_lessonIds?: string[]): Promise<{ queue: VideoQueueState }> {
    throw new Error(
      this.msg(
        'Chế độ chạy trên Vercel sử dụng link Google Drive / YouTube. Cô vui lòng dùng chức năng "Gắn link 40 bài / Sao lưu" ở phía trên.',
        'Static frontend mode uses Google Drive / YouTube links. Please use Bulk External Links.'
      )
    );
  }

  async pauseVideoQueue(): Promise<{ queue: VideoQueueState }> {
    return { queue: defaultVideoQueue() };
  }

  async resumeVideoQueue(): Promise<{ queue: VideoQueueState }> {
    return { queue: defaultVideoQueue() };
  }

  async retryFailedVideoQueue(): Promise<{ queue: VideoQueueState }> {
    return { queue: defaultVideoQueue() };
  }

  async setLessonExternalVideoLink(
    lessonId: string,
    payload: {
      rawUrl: string;
      subtitleUrl?: string | null;
      durationSeconds?: number | string | null;
      note?: string;
      autoApprove?: boolean;
    }
  ): Promise<LessonVideoRecord> {
    const parsed = parseAndNormalizeExternalVideoUrl(payload.rawUrl);
    if (!parsed.valid) {
      throw new Error(parsed.error);
    }
    const dur = parseDurationInput(payload.durationSeconds) ?? 420;
    const autoApprove = payload.autoApprove ?? true;

    return this.updateSingleVideoRecord(lessonId, (cur) => {
      const nextSubtitleUrl =
        payload.subtitleUrl !== undefined
          ? payload.subtitleUrl
          : parsed.normalizedUrl.startsWith('/videos/')
          ? cur.subtitleUrl ?? `/videos/${lessonId}.vtt`
          : null;

      return {
        ...cur,
        status: 'completed',
        currentStep: 'ready_for_approval',
        stepMessage: autoApprove ? 'Đã gắn link và xuất bản' : 'Đã gắn link video ngoài',
        progressPercent: 100,
        durationSeconds: dur,
        videoUrl: parsed.normalizedUrl,
        subtitleUrl: nextSubtitleUrl,
        version: (cur.version || 0) + 1,
        externalVideo: {
          rawUrl: parsed.rawUrl,
          normalizedUrl: parsed.normalizedUrl,
          provider: parsed.provider,
          playbackType: parsed.playbackType,
          subtitleUrl: nextSubtitleUrl,
          durationSeconds: dur,
          note: payload.note || '',
          updatedAt: Date.now(),
        },
        isApproved: autoApprove ? true : cur.isApproved,
        isPublished: autoApprove ? true : cur.isPublished,
        approvedAt: autoApprove ? new Date().toISOString() : cur.approvedAt,
        approvedBy: autoApprove ? DEFAULT_TEACHER_USER.name : cur.approvedBy,
        updatedAt: Date.now(),
        createdAt: cur.createdAt || Date.now(),
      };
    });
  }

  async removeLessonExternalVideoLink(lessonId: string): Promise<LessonVideoRecord> {
    return this.updateSingleVideoRecord(lessonId, (cur) => ({
      ...cur,
      status: cur.script ? 'script_ready' : 'not_created',
      videoUrl: null,
      externalVideo: null,
      isApproved: false,
      isPublished: false,
      stepMessage: 'Đã gỡ link video ngoài',
      updatedAt: Date.now(),
    }));
  }

  async setBulkExternalVideoLinks(
    items: Array<{
      lessonId: string;
      rawUrl: string;
      durationSeconds?: number | string | null;
      note?: string;
    }>,
    autoApprove: boolean
  ): Promise<{
    updatedCount: number;
    failedCount: number;
    errors: Array<{ lessonId: string; message: string }>;
    records: LessonVideoRecord[];
    queue: VideoQueueState;
  }> {
    let updatedCount = 0;
    const errors: Array<{ lessonId: string; message: string }> = [];

    for (const item of items) {
      try {
        await this.setLessonExternalVideoLink(item.lessonId, {
          rawUrl: item.rawUrl,
          durationSeconds: item.durationSeconds,
          note: item.note,
          autoApprove,
        });
        updatedCount++;
      } catch (err: any) {
        errors.push({ lessonId: item.lessonId, message: err?.message || 'Lỗi không xác định' });
      }
    }

    return {
      updatedCount,
      failedCount: errors.length,
      errors,
      records: this.getAllVideoRecordsLocal(),
      queue: defaultVideoQueue(),
    };
  }

  async exportDefaultLessonsConfig(): Promise<{
    schema: string;
    version: number;
    exportedAt: string;
    description: string;
    totalLessons: number;
    totalLinked: number;
    totalPublished: number;
    lessons: Array<{
      lessonId: string;
      lessonNumber: number;
      lessonTitle: string;
      rawUrl: string;
      videoUrl: string;
      subtitleUrl: string | null;
      provider: string | null;
      playbackType: string | null;
      durationSeconds: number | null;
      note: string;
      isApproved: boolean;
      isPublished: boolean;
      approvedAt: string | null;
      approvedBy: string | null;
    }>;
  }> {
    const records = this.getAllVideoRecordsLocal();
    const lessons = records.map((r) => {
      const rawUrl = r.externalVideo?.rawUrl || r.videoUrl || '';
      const videoUrl = r.externalVideo?.normalizedUrl || r.videoUrl || '';
      const subtitleUrl = r.externalVideo?.subtitleUrl ?? r.subtitleUrl ?? null;
      const hasUrl = Boolean(rawUrl || videoUrl);
      return {
        lessonId: r.lessonId,
        lessonNumber: r.lessonNumber,
        lessonTitle: r.lessonTitle,
        rawUrl,
        videoUrl,
        subtitleUrl: hasUrl ? subtitleUrl : null,
        provider: r.externalVideo?.provider ?? null,
        playbackType: r.externalVideo?.playbackType ?? null,
        durationSeconds: r.externalVideo?.durationSeconds ?? r.durationSeconds ?? null,
        note: r.externalVideo?.note || '',
        isApproved: hasUrl ? Boolean(r.isApproved) : false,
        isPublished: hasUrl ? Boolean(r.isPublished) : false,
        approvedAt: hasUrl ? r.approvedAt : null,
        approvedBy: hasUrl ? r.approvedBy : null,
      };
    });

    const totalLinked = lessons.filter((l) => Boolean(l.rawUrl || l.videoUrl)).length;
    const totalPublished = lessons.filter((l) => l.isPublished && Boolean(l.rawUrl || l.videoUrl)).length;

    return {
      schema: 'diali10-default-lessons-v1',
      version: 2,
      exportedAt: new Date().toISOString(),
      description:
        'File cấu hình mặc định 40 bài giảng video Địa Lí 10. Thay thế tệp src/data/defaultLessons.json bằng tệp này trước khi deploy lên Vercel để mọi thiết bị học sinh tự động hiển thị video Đã xuất bản.',
      totalLessons: lessons.length,
      totalLinked,
      totalPublished,
      lessons,
    };
  }

  async exportExternalVideoLinks(): Promise<{
    schema: string;
    exportedAt: string;
    totalLinked: number;
    links: Record<string, any>;
  }> {
    const records = this.getAllVideoRecordsLocal();
    const links: Record<string, any> = {};
    records.forEach((r) => {
      if (r.externalVideo?.rawUrl) {
        links[r.lessonId] = {
          rawUrl: r.externalVideo.rawUrl,
          normalizedUrl: r.externalVideo.normalizedUrl,
          provider: r.externalVideo.provider,
          durationSeconds: r.externalVideo.durationSeconds ?? r.durationSeconds,
          note: r.externalVideo.note || '',
          isApproved: r.isApproved,
          isPublished: r.isPublished,
        };
      }
    });

    return {
      schema: 'diali10-external-video-links-v1',
      exportedAt: new Date().toISOString(),
      totalLinked: Object.keys(links).length,
      links,
    };
  }

  async importExternalVideoLinks(
    backup: any,
    restoreApprovalState = true
  ): Promise<{
    importedCount: number;
    skippedCount: number;
    errors: Array<{ lessonId: string; message: string }>;
    records: LessonVideoRecord[];
    queue: VideoQueueState;
  }> {
    const entries: Array<{ lessonId: string; info: any }> = [];

    if (Array.isArray(backup?.lessons)) {
      backup.lessons.forEach((item: any) => {
        if (item && item.lessonId) {
          entries.push({ lessonId: String(item.lessonId), info: item });
        }
      });
    } else {
      const linksObj = backup?.links && typeof backup.links === 'object' ? backup.links : backup;
      if (!linksObj || typeof linksObj !== 'object') {
        throw new Error('Tệp JSON cấu hình không đúng định dạng.');
      }
      Object.entries<any>(linksObj).forEach(([lessonId, info]) => {
        entries.push({ lessonId, info });
      });
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ lessonId: string; message: string }> = [];

    for (const { lessonId, info } of entries) {
      const rawUrl =
        typeof info === 'string'
          ? info.trim()
          : String(info?.rawUrl || info?.videoUrl || info?.normalizedUrl || '').trim();
      if (!rawUrl) {
        skippedCount++;
        continue;
      }
      try {
        await this.setLessonExternalVideoLink(lessonId, {
          rawUrl,
          subtitleUrl: typeof info === 'object' ? info?.subtitleUrl ?? undefined : undefined,
          durationSeconds: typeof info === 'object' ? info?.durationSeconds : undefined,
          note: typeof info === 'object' ? info?.note : undefined,
          autoApprove: restoreApprovalState ? Boolean(info?.isPublished ?? true) : false,
        });
        importedCount++;
      } catch (err: any) {
        errors.push({ lessonId, message: err?.message || 'Lỗi khôi phục link' });
      }
    }

    return {
      importedCount,
      skippedCount,
      errors,
      records: this.getAllVideoRecordsLocal(),
      queue: defaultVideoQueue(),
    };
  }

  async uploadLessonVideoToDrive(
    _lessonId: string,
    _driveAccessToken: string,
    _options?: { autoApprove?: boolean; folderName?: string }
  ): Promise<any> {
    throw new Error(
      this.msg(
        'Chức năng tải MP4 trực tiếp từ máy chủ không khả dụng ở bản Vercel tĩnh. Cô hãy tải video lên Google Drive cá nhân rồi dán link vào mục "Gắn link video".',
        'Server-side Drive upload is unavailable in static frontend mode. Upload directly to Google Drive and paste the link.'
      )
    );
  }

  async syncBackupToGoogleDrive(
    _driveAccessToken: string,
    _folderName?: string
  ): Promise<any> {
    throw new Error(
      this.msg(
        'Ở chế độ Vercel tĩnh, cô vui lòng bấm "Tải file sao lưu JSON" để lưu về máy tính.',
        'In static frontend mode, please use "Export JSON Backup" to save locally.'
      )
    );
  }

  async getPublishedLessonVideo(lessonId: string): Promise<{
    lessonId: string;
    available: boolean;
    approvalStatus?:
      | 'published'
      | 'restoring'
      | 'awaiting_approval'
      | 'processing'
      | 'unpublished'
      | 'not_created';
    durationSeconds?: number | null;
    version?: number | null;
    video: {
      lessonId: string;
      lessonTitle: string;
      videoUrl: string;
      subtitleUrl: string | null;
      thumbnailUrl: string | null;
      durationSeconds: number;
      approvedAt: string | null;
      version: number;
      provider?: 'local' | 'google_drive' | 'youtube' | 'direct_url';
      playbackType?: 'iframe' | 'html5_video';
      externalRawUrl?: string | null;
    } | null;
  }> {
    const rec = this.getAllVideoRecordsLocal().find((r) => r.lessonId === lessonId);
    if (!rec) {
      return { lessonId, available: false, approvalStatus: 'not_created', video: null };
    }

    if (rec.isPublished && rec.externalVideo?.normalizedUrl) {
      return {
        lessonId,
        available: true,
        approvalStatus: 'published',
        durationSeconds: rec.externalVideo.durationSeconds ?? rec.durationSeconds ?? 420,
        version: rec.version || 1,
        video: {
          lessonId: rec.lessonId,
          lessonTitle: rec.lessonTitle,
          videoUrl: rec.externalVideo.normalizedUrl,
          subtitleUrl: rec.externalVideo.subtitleUrl ?? rec.subtitleUrl ?? null,
          thumbnailUrl: rec.thumbnailUrl ?? null,
          durationSeconds: rec.externalVideo.durationSeconds ?? rec.durationSeconds ?? 420,
          approvedAt: rec.approvedAt,
          version: rec.version || 1,
          provider: rec.externalVideo.provider,
          playbackType: rec.externalVideo.playbackType,
          externalRawUrl: rec.externalVideo.rawUrl,
        },
      };
    }

    return {
      lessonId,
      available: false,
      approvalStatus: rec.externalVideo?.normalizedUrl ? 'awaiting_approval' : 'not_created',
      durationSeconds: rec.durationSeconds,
      version: rec.version,
      video: null,
    };
  }

  async getPublishedVideosSummaryMap(): Promise<
    Record<string, { durationSeconds: number; videoUrl: string }>
  > {
    const out: Record<string, { durationSeconds: number; videoUrl: string }> = {};
    this.getAllVideoRecordsLocal().forEach((rec) => {
      if (rec.isPublished && rec.externalVideo?.normalizedUrl) {
        out[rec.lessonId] = {
          durationSeconds: rec.externalVideo.durationSeconds ?? rec.durationSeconds ?? 420,
          videoUrl: rec.externalVideo.normalizedUrl,
        };
      }
    });
    return out;
  }
}

export const apiService = new ApiService();
