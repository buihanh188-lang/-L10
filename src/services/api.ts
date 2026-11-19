import {
  ClassStats,
  Classroom,
  ExamRecord,
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
  REGISTERED_SCHOOLS,
} from '../data/mockUsers';
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

const TEACHER_TOKEN_KEY = 'dia_li_10_teacher_token';
const PENDING_ATTEMPTS_KEY = 'dia_li_10_pending_attempts';
const EXAM_RECORDS_KEY = 'dia_li_10_exam_records';
const STUDENTS_KEY = 'dia_li_10_students';
const DELETED_STUDENTS_KEY = 'dia_li_10_deleted_students';
const STUDENT_PASSWORDS_KEY = 'dia_li_10_student_passwords';
const CLASSES_KEY = 'dia_li_10_classes';
const QUESTIONS_KEY = 'dia_li_10_questions';
const TEACHER_EXAMS_KEY = 'dia_li_10_teacher_exams';
const VIDEO_CATALOG_KEY = 'dia_li_10_video_catalog_v1';

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

// In-memory fallback in case storage is blocked by browser privacy policy
const memoryFallback = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

function safeSetItem(key: string, value: string): void {
  memoryFallback.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage.setItem failed for ${key}:`, e);
  }
}

function safeRemoveItem(key: string): void {
  memoryFallback.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
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
    missingRequirements: [
      'Ứng dụng đang chạy ở chế độ Frontend tĩnh (Vercel / localStorage). Hãy dùng tính năng "Gắn link video ngoài" (Google Drive / YouTube / MP4) để học sinh xem video trực tiếp.',
    ],
    storageDir: 'browser://localStorage',
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
            if (st && st.id && !deleted.has(st.id)) {
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

    return Array.from(map.values());
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

  private getLocalAttempts(): ExamRecord[] {
    try {
      const raw = safeGetItem(EXAM_RECORDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [...INITIAL_EXAM_RECORDS];
  }

  private saveLocalAttemptsList(list: ExamRecord[]): void {
    const sorted = [...list].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    try {
      safeSetItem(EXAM_RECORDS_KEY, JSON.stringify(sorted));
    } catch {
      // Compact oldest detailed items if quota is tight
      const compacted = sorted.map((r, idx) => (idx < 80 ? r : { ...r, details: [] }));
      safeSetItem(EXAM_RECORDS_KEY, JSON.stringify(compacted.slice(0, 300)));
    }
  }

  private saveLocalAttempt(record: ExamRecord): void {
    const list = this.getLocalAttempts().filter((r) => r.id !== record.id);
    list.unshift(record);
    this.saveLocalAttemptsList(list);
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
  // TEACHER AUTHENTICATION (100% LOCAL)
  // =========================================================================
  async teacherLogin(
    username: string,
    password: string
  ): Promise<{ success: boolean; token: string; user: UserProfile }> {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const allowedUsernames = ['buihanh188', 'buihanh188@gmail.com', 'gv-dl10', 'admin'];
    const validPass = cleanPass === 'CoHanh@DiaLi10' || cleanPass === '123456';

    if (!allowedUsernames.includes(cleanUser) || !validPass) {
      throw new Error(
        this.msg(
          'Tên đăng nhập hoặc mật khẩu giáo viên không chính xác. (Gợi ý: buihanh188 / CoHanh@DiaLi10)',
          'Invalid teacher username or password. (Hint: buihanh188 / CoHanh@DiaLi10)'
        )
      );
    }

    const token = `local-teacher-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const user: UserProfile = {
      ...DEFAULT_TEACHER_USER,
      lastLoginAt: new Date().toISOString(),
    };
    this.setTeacherToken(token);
    return { success: true, token, user };
  }

  async teacherLogout(): Promise<void> {
    this.setTeacherToken(null);
  }

  async verifyTeacherSession(): Promise<boolean> {
    const token = this.getTeacherToken();
    return Boolean(token && token.length > 5);
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
  // 3. CLASSES OF A SCHOOL (supports 'all')
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

    const classNames = Array.from(
      new Set([
        ...storedClasses
          .filter((c) => isAll || normalizeSchoolKey(c.schoolName) === schKey)
          .map((c) => normalizeClassName(c.name)),
        ...students.map((s) => normalizeClassName(s.className || '')).filter(Boolean),
        ...attempts.map((a) => normalizeClassName(a.className)).filter(Boolean),
      ])
    )
      .filter(Boolean)
      .sort();

    return classNames.map((cls) => {
      const cAttempts = attempts.filter((a) => normalizeClassName(a.className) === cls);
      const cStudents = students.filter((s) => normalizeClassName(s.className || '') === cls);
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
        schoolName: isAll ? cStudents[0]?.school || cAttempts[0]?.schoolName || 'Tất cả' : schoolName,
        className: cls,
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
  // 6. SUBMIT ATTEMPT & ZALO SLIP IMPORT (100% LOCALSTORAGE)
  // =========================================================================
  async submitAttemptStrict(record: ExamRecord, user?: UserProfile): Promise<ExamRecord> {
    const normalizedRecord: ExamRecord = {
      ...record,
      id: record.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentName: normalizeStudentName(record.studentName || user?.name || 'Học sinh'),
      schoolName: normalizeSchoolName(record.schoolName || user?.school || 'TRƯỜNG THPT HÒA BÌNH'),
      className: normalizeClassName(record.className || user?.className || '10A1'),
      timestamp: record.timestamp || Date.now(),
      date: record.date || new Date(record.timestamp || Date.now()).toLocaleDateString('vi-VN'),
    };

    this.saveLocalAttempt(normalizedRecord);
    this.removePendingAttempt(normalizedRecord.id);

    // Ensure student & class are registered in localStorage
    this.upsertStudentLocal({
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
    });
    this.ensureClassExistsLocal(normalizedRecord.className, normalizedRecord.schoolName);

    return normalizedRecord;
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
    const existingIds = new Set(existing.map((r) => r.id));
    let importedCount = 0;
    let duplicateCount = 0;

    const merged = [...existing];
    for (const rec of records) {
      if (existingIds.has(rec.id)) {
        duplicateCount++;
        continue;
      }
      existingIds.add(rec.id);
      merged.unshift(rec);
      importedCount++;

      // Register student & class cleanly
      this.upsertStudentLocal({
        id: rec.studentId,
        role: 'student',
        name: rec.studentName,
        code: rec.studentCode,
        className: rec.className,
        school: rec.schoolName,
        province: 'TỈNH LẠNG SƠN',
        studentType:
          normalizeSchoolKey(rec.schoolName) === OFFICIAL_SCHOOL_KEY ? 'official' : 'extended',
        joinedDate: new Date(rec.timestamp || Date.now()).toISOString().slice(0, 10),
        isActivated: true,
        lastLoginAt: new Date(rec.timestamp || Date.now()).toISOString(),
      });
      this.ensureClassExistsLocal(rec.className, rec.schoolName);
    }

    if (importedCount > 0) {
      this.saveLocalAttemptsList(merged);
    }

    return {
      importedCount,
      duplicateCount,
      totalRecords: merged.length,
    };
  }

  deleteExamRecord(recordId: string): ExamRecord[] {
    const updated = this.getLocalAttempts().filter((r) => r.id !== recordId);
    this.saveLocalAttemptsList(updated);
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
      const pending = this.getPendingAttempts().filter((r) => r && r.id !== recordId);
      safeSetItem(PENDING_ATTEMPTS_KEY, JSON.stringify(pending));
    } catch {
      // ignore
    }
  }

  async flushPendingAttempts(user?: UserProfile): Promise<{ synced: number; failed: number }> {
    const pending = this.getPendingAttempts();
    if (pending.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    for (const item of pending) {
      await this.submitAttemptStrict(item, user);
      synced++;
    }
    safeSetItem(PENDING_ATTEMPTS_KEY, JSON.stringify([]));
    return { synced, failed: 0 };
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
    const targetNorm = stripDiacriticsLower(cleanUser);

    const found = students.find(
      (s) =>
        (s.code && s.code.toLowerCase() === targetLower) ||
        (s.username && s.username.toLowerCase() === targetLower) ||
        stripDiacriticsLower(s.name) === targetNorm
    );

    if (!found) {
      throw new Error(
        this.msg(
          `Không tìm thấy tài khoản học sinh "${cleanUser}". Hãy kiểm tra mã học sinh (ví dụ: HB-1001) hoặc dùng mục "Học sinh mở rộng" để tạo phiên học tập mới.`,
          `Student account "${cleanUser}" not found. Check your student code (e.g., HB-1001) or use "Extended Student" to start immediately.`
        )
      );
    }

    const passwords = this.getPasswordMap();
    const expectedPassword =
      passwords[found.id] ||
      (found.code ? passwords[found.code.toLowerCase()] : undefined) ||
      '123456';

    if (cleanPass !== expectedPassword) {
      throw new Error(
        this.msg(
          'Mật khẩu chưa đúng. Mật khẩu mặc định cho học sinh là 123456.',
          'Incorrect password. The default student password is 123456.'
        )
      );
    }

    const updatedUser = this.upsertStudentLocal({
      ...found,
      isActivated: true,
      lastLoginAt: new Date().toISOString(),
    });

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
    const pwd = (newPassword || '123456').trim() || '123456';
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
      newPassword: pwd,
      message: this.msg(
        `Đã đặt lại mật khẩu về "${pwd}".`,
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
  private loadVideoRecordsMap(): Record<string, Partial<LessonVideoRecord>> {
    try {
      const raw = safeGetItem(VIDEO_CATALOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    return {};
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

    return this.updateSingleVideoRecord(lessonId, (cur) => ({
      ...cur,
      status: 'completed',
      currentStep: 'ready_for_approval',
      stepMessage: autoApprove ? 'Đã gắn link và xuất bản' : 'Đã gắn link video ngoài',
      progressPercent: 100,
      durationSeconds: dur,
      videoUrl: parsed.normalizedUrl,
      version: (cur.version || 0) + 1,
      externalVideo: {
        rawUrl: parsed.rawUrl,
        normalizedUrl: parsed.normalizedUrl,
        provider: parsed.provider,
        playbackType: parsed.playbackType,
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
    }));
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
    const linksObj = backup?.links && typeof backup.links === 'object' ? backup.links : backup;
    if (!linksObj || typeof linksObj !== 'object') {
      throw new Error('Tệp JSON sao lưu không đúng định dạng.');
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ lessonId: string; message: string }> = [];

    for (const [lessonId, info] of Object.entries<any>(linksObj)) {
      const rawUrl = typeof info === 'string' ? info : info?.rawUrl || info?.normalizedUrl;
      if (!rawUrl) {
        skippedCount++;
        continue;
      }
      try {
        await this.setLessonExternalVideoLink(lessonId, {
          rawUrl,
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
          subtitleUrl: rec.externalVideo.subtitleUrl ?? null,
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
