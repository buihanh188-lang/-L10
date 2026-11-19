import {
  ClassStats,
  ExamRecord,
  MultiSchoolFilterOptions,
  SchoolStats,
  StudentStatsSummary,
  SystemSummary,
  UserProfile,
  Question,
  LessonVideoRecord,
  VideoCapabilities,
  VideoQueueState,
  VideoScenePlan,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_EXAM_RECORDS,
  INITIAL_STUDENTS,
} from '../data/mockUsers';
import { normalizeClassName, normalizeSchoolKey } from '../utils/normalize';

const TEACHER_TOKEN_KEY = 'dia_li_10_teacher_token';
const PENDING_ATTEMPTS_KEY = 'dia_li_10_pending_attempts';

class ApiService {
  private msg(vi: string, en: string): string {
    try {
      return localStorage.getItem('dia_li_10_language') === 'en' ? en : vi;
    } catch {
      return vi;
    }
  }

  getTeacherToken(): string | null {
    try {
      return sessionStorage.getItem(TEACHER_TOKEN_KEY) || localStorage.getItem(TEACHER_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setTeacherToken(token: string | null): void {
    try {
      if (token) {
        sessionStorage.setItem(TEACHER_TOKEN_KEY, token);
        localStorage.setItem(TEACHER_TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(TEACHER_TOKEN_KEY);
        localStorage.removeItem(TEACHER_TOKEN_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }

  private getHeaders(user?: UserProfile): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getTeacherToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (user) {
      headers['x-user-role'] = user.role;
      headers['x-user-school'] = encodeURIComponent(user.school || '');
      headers['x-user-name'] = encodeURIComponent(user.name || '');
      headers['x-user-id'] = encodeURIComponent(user.id || '');
    }
    return headers;
  }

  // Teacher Authentication
  async teacherLogin(username: string, password: string): Promise<{ success: boolean; token: string; user: UserProfile }> {
    const res = await fetch('/api/auth/teacher-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || this.msg('Đăng nhập không thành công.', 'Login failed.'));
    }

    this.setTeacherToken(data.token);
    return data;
  }

  async teacherLogout(): Promise<void> {
    const token = this.getTeacherToken();
    if (token) {
      try {
        await fetch('/api/auth/teacher-logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.warn('Logout network error:', e);
      }
    }
    this.setTeacherToken(null);
  }

  async verifyTeacherSession(): Promise<boolean> {
    const token = this.getTeacherToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/auth/teacher-verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.authenticated;
      }
    } catch {
      // fallback
    }
    return false;
  }

  // Check if admin account exists (Strict real-time check, no caching)
  async getTeacherSystemStatus(): Promise<{ hasAdminAccount: boolean; totalAccounts: number; teacherInfo?: any }> {
    try {
      const res = await fetch(`/api/auth/teacher-status?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Error checking teacher system status:', e);
    }
    return { hasAdminAccount: false, totalAccounts: 0 };
  }

  // 1. System Summary
  async getSystemSummary(user?: UserProfile): Promise<SystemSummary> {
    try {
      const res = await fetch('/api/system/summary', {
        headers: this.getHeaders(user),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API error, using local fallback:', err);
    }

    // Local fallback calculation (purely dynamic, no hardcoded 3-school cap)
    const attempts = this.getLocalAttempts();
    const schools = new Set([
      ...INITIAL_STUDENTS.map((s) => normalizeSchoolKey(s.school)),
      ...attempts.map((a) => normalizeSchoolKey(a.schoolName)),
    ].filter(Boolean));
    const classes = new Set([
      ...INITIAL_STUDENTS.map((s) => `${normalizeSchoolKey(s.school)}::${normalizeClassName(s.className || '')}`),
      ...attempts.map((a) => `${normalizeSchoolKey(a.schoolName)}::${normalizeClassName(a.className)}`),
    ].filter((k) => !k.startsWith('::') && !k.endsWith('::')));
    const students = new Set([
      ...INITIAL_STUDENTS.map((s) => `${normalizeSchoolKey(s.school)}::${s.name.trim().toLowerCase()}`),
      ...attempts.map((a) => `${normalizeSchoolKey(a.schoolName)}::${a.studentName.trim().toLowerCase()}`),
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
      averageCompletionRate: attempts.length > 0 ? parseFloat(((passCount / attempts.length) * 100).toFixed(1)) : 0,
    };
  }

  // 2. Schools
  async getSchools(user?: UserProfile): Promise<SchoolStats[]> {
    try {
      const res = await fetch('/api/schools', {
        headers: this.getHeaders(user),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API error, using local fallback:', err);
    }

    // Dynamic fallback across students + attempts
    const attempts = this.getLocalAttempts();
    const schMap = new Map<string, string>();
    INITIAL_STUDENTS.forEach((st) => {
      const k = normalizeSchoolKey(st.school);
      if (k && !schMap.has(k)) schMap.set(k, st.school);
    });
    attempts.forEach((a) => {
      const k = normalizeSchoolKey(a.schoolName);
      if (k && !schMap.has(k)) schMap.set(k, a.schoolName);
    });

    return Array.from(schMap.entries()).map(([schKey, schName]) => {
      const sAttempts = attempts.filter((a) => normalizeSchoolKey(a.schoolName) === schKey);
      const sStudents = INITIAL_STUDENTS.filter((st) => normalizeSchoolKey(st.school) === schKey);
      const sClasses = Array.from(
        new Set([
          ...sStudents.map((st) => normalizeClassName(st.className || '')).filter(Boolean),
          ...sAttempts.map((a) => normalizeClassName(a.className)).filter(Boolean),
        ])
      );
      const totalScore = sAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0);
      const passCount = sAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;

      return {
        schoolName: schName,
        classCount: sClasses.length,
        studentCount: Math.max(sStudents.length, new Set(sAttempts.map((a) => a.studentName)).size),
        attemptCount: sAttempts.length,
        practiceCount: sAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length,
        examCount: sAttempts.filter((a) => a.mode === 'official_test').length,
        avgScore: sAttempts.length > 0 ? parseFloat((totalScore / sAttempts.length).toFixed(2)) : 0,
        highestScore: sAttempts.length > 0 ? Math.max(...sAttempts.map((a) => Number(a.score) || 0)) : 0,
        completionRate: sAttempts.length > 0 ? parseFloat(((passCount / sAttempts.length) * 100).toFixed(1)) : 0,
        classes: sClasses,
      };
    });
  }

  // 3. Classes of a School (supports 'all')
  async getClassesBySchool(schoolName: string, user?: UserProfile): Promise<ClassStats[]> {
    try {
      const res = await fetch(`/api/schools/${encodeURIComponent(schoolName)}/classes`, {
        headers: this.getHeaders(user),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API error, using local fallback:', err);
    }

    const isAll = schoolName === 'all';
    const schKey = normalizeSchoolKey(schoolName);
    const attempts = this.getLocalAttempts().filter((a) => isAll || normalizeSchoolKey(a.schoolName) === schKey);
    const students = INITIAL_STUDENTS.filter((s) => isAll || normalizeSchoolKey(s.school) === schKey);
    const classNames = Array.from(
      new Set([
        ...INITIAL_CLASSES.filter((c) => isAll || normalizeSchoolKey(c.schoolName) === schKey).map((c) => normalizeClassName(c.name)),
        ...students.map((s) => normalizeClassName(s.className || '')).filter(Boolean),
        ...attempts.map((a) => normalizeClassName(a.className)).filter(Boolean),
      ])
    );

    return classNames.map((cls) => {
      const cAttempts = attempts.filter((a) => normalizeClassName(a.className) === cls);
      const cStudents = students.filter((s) => normalizeClassName(s.className || '') === cls);
      const activeStudentCount = new Set(cAttempts.map((a) => (a.studentId || a.studentName).trim().toLowerCase())).size;
      const totalScore = cAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0);
      const passCount = cAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;

      return {
        schoolName,
        className: cls,
        studentCount: Math.max(cStudents.length, activeStudentCount),
        activeStudentCount,
        attemptCount: cAttempts.length,
        practiceCount: cAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length,
        examCount: cAttempts.filter((a) => a.mode === 'official_test').length,
        avgScore: cAttempts.length > 0 ? parseFloat((totalScore / cAttempts.length).toFixed(2)) : 0,
        highestScore: cAttempts.length > 0 ? Math.max(...cAttempts.map((a) => Number(a.score) || 0)) : 0,
        completionRate: cAttempts.length > 0 ? parseFloat(((passCount / cAttempts.length) * 100).toFixed(1)) : 0,
        students: [],
      };
    });
  }

  // 4. Students of a Class (supports 'all')
  async getStudentsByClass(
    schoolName: string,
    className: string,
    user?: UserProfile
  ): Promise<StudentStatsSummary[]> {
    try {
      const res = await fetch(
        `/api/schools/${encodeURIComponent(schoolName)}/classes/${encodeURIComponent(className)}/students`,
        { headers: this.getHeaders(user) }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API error, using local fallback:', err);
    }

    const isAllSch = schoolName === 'all';
    const isAllCls = className === 'all';
    const schKey = normalizeSchoolKey(schoolName);
    const clsKey = normalizeClassName(className);
    const attempts = this.getLocalAttempts().filter(
      (a) =>
        (isAllSch || normalizeSchoolKey(a.schoolName) === schKey) &&
        (isAllCls || normalizeClassName(a.className) === clsKey)
    );
    const students = INITIAL_STUDENTS.filter(
      (s) =>
        (isAllSch || normalizeSchoolKey(s.school) === schKey) &&
        (isAllCls || normalizeClassName(s.className || '') === clsKey)
    );

    return students.map((st) => {
      const stSchKey = normalizeSchoolKey(st.school);
      const stAttempts = attempts
        .filter((a) => a.studentId === st.id || (a.studentName === st.name && normalizeSchoolKey(a.schoolName) === stSchKey))
        .sort((a, b) => b.timestamp - a.timestamp);

      const totalScore = stAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0);
      const passCount = stAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;

      return {
        studentId: st.id,
        studentName: st.name,
        studentCode: st.code,
        schoolName: st.school,
        className: st.className || className,
        studentType: normalizeSchoolKey(st.school) === normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH') ? 'official' : 'extended',
        attemptCount: stAttempts.length,
        practiceCount: stAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length,
        examCount: stAttempts.filter((a) => a.mode === 'official_test').length,
        totalQuestionsAnswered: stAttempts.reduce((sum, a) => sum + ((Number(a.totalQuestions) || 0) - (Number(a.unansweredCount) || 0)), 0),
        correctAnswersCount: stAttempts.reduce((sum, a) => sum + (Number(a.correctCount) || 0), 0),
        wrongAnswersCount: stAttempts.reduce((sum, a) => sum + (Number(a.wrongCount) || 0), 0),
        unansweredAnswersCount: stAttempts.reduce((sum, a) => sum + (Number(a.unansweredCount) || 0), 0),
        avgScore: stAttempts.length > 0 ? parseFloat((totalScore / stAttempts.length).toFixed(2)) : 0,
        highestScore: stAttempts.length > 0 ? Math.max(...stAttempts.map((a) => Number(a.score) || 0)) : 0,
        completionRate: stAttempts.length > 0 ? parseFloat(((passCount / stAttempts.length) * 100).toFixed(1)) : 0,
        latestAttemptDate: stAttempts.length > 0 ? new Date(stAttempts[0].timestamp).toISOString() : st.joinedDate,
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
  }

  // 5. Query Attempts
  async getAttempts(
    filters: Partial<MultiSchoolFilterOptions>,
    user?: UserProfile,
    strict = false
  ): Promise<ExamRecord[]> {
    if (strict && !this.getTeacherToken()) {
      throw new Error(
        this.msg(
          'Phiên đăng nhập Giáo viên đã hết hạn hoặc thiếu mã xác thực. Vui lòng đăng nhập lại.',
          'Teacher session expired or missing authentication token. Please sign in again.'
        )
      );
    }

    try {
      const params = new URLSearchParams();
      if (filters.schoolName) params.append('schoolName', filters.schoolName);
      if (filters.className) params.append('className', filters.className);
      if (filters.studentName) params.append('studentName', filters.studentName);
      if (filters.lessonId) params.append('lessonId', filters.lessonId);
      if (filters.questionType) params.append('questionType', filters.questionType);
      if (filters.mode) params.append('mode', filters.mode);
      if (filters.timeRange) params.append('timeRange', filters.timeRange);

      const res = await fetch(`/api/attempts?${params.toString()}`, {
        headers: this.getHeaders(user),
      });
      if (res.ok) {
        return await res.json();
      }
      if (strict) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            (res.status === 401 || res.status === 403
              ? this.msg(
                  'Phiên làm việc của Giáo viên đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
                  'Teacher session expired or invalid. Please sign in again.'
                )
              : this.msg(
                  `Không thể tải dữ liệu lượt làm bài (HTTP ${res.status}).`,
                  `Failed to load attempt records (HTTP ${res.status}).`
                ))
        );
      }
    } catch (err: any) {
      if (strict) {
        throw err instanceof Error
          ? err
          : new Error(
              this.msg(
                'Lỗi kết nối máy chủ khi tải dữ liệu thống kê.',
                'Server connection error while loading analytics data.'
              )
            );
      }
      console.warn('API error, using local fallback:', err);
    }

    // Local filter fallback (non-strict mode only)
    let list = this.getLocalAttempts();
    if (filters.schoolName && filters.schoolName !== 'all') {
      const targetKey = normalizeSchoolKey(filters.schoolName);
      list = list.filter((a) => normalizeSchoolKey(a.schoolName) === targetKey);
    }
    if (filters.className && filters.className !== 'all') {
      const targetCls = normalizeClassName(filters.className);
      list = list.filter((a) => normalizeClassName(a.className) === targetCls);
    }
    if (filters.studentName && filters.studentName.trim()) {
      const q = filters.studentName.trim().toLowerCase();
      list = list.filter((a) => a.studentName.toLowerCase().includes(q));
    }
    if (filters.lessonId && filters.lessonId !== 'all') {
      list = list.filter((a) => a.lessonId === filters.lessonId);
    }
    if (filters.mode && filters.mode !== 'all') {
      list = list.filter((a) => a.mode === filters.mode);
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  // 5b. Frequently Missed Questions Analytics (Teacher Auth Required, Strict API Only)
  async getMissedQuestionsAnalytics(
    filters: {
      schoolName?: string;
      className?: string;
      studentName?: string;
      chapterId?: string;
      lessonId?: string;
      questionType?: string;
    },
    user?: UserProfile
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
    const token = this.getTeacherToken();
    if (!token) {
      throw new Error(
        this.msg(
          'Phiên đăng nhập Giáo viên đã hết hạn hoặc thiếu mã xác thực. Vui lòng đăng nhập lại.',
          'Teacher session expired or missing authentication token. Please sign in again.'
        )
      );
    }

    const params = new URLSearchParams();
    if (filters.schoolName && filters.schoolName !== 'all') params.append('schoolName', filters.schoolName);
    if (filters.className && filters.className !== 'all') params.append('className', filters.className);
    if (filters.studentName && filters.studentName.trim()) params.append('studentName', filters.studentName.trim());
    if (filters.chapterId && filters.chapterId !== 'all') params.append('chapterId', filters.chapterId);
    if (filters.lessonId && filters.lessonId !== 'all') params.append('lessonId', filters.lessonId);
    if (filters.questionType && filters.questionType !== 'all') params.append('questionType', filters.questionType);

    const res = await fetch(`/api/teacher/analytics/missed-questions?${params.toString()}`, {
      cache: 'no-store',
      headers: this.getHeaders(user),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData.error ||
          (res.status === 401 || res.status === 403
            ? this.msg(
                'Phiên làm việc của Giáo viên đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
                'Teacher session expired or invalid. Please sign in again.'
              )
            : this.msg(
                `Không thể tải thống kê câu hỏi hay sai (HTTP ${res.status}).`,
                `Failed to load frequently missed questions analytics (HTTP ${res.status}).`
              ))
      );
    }

    return await res.json();
  }

  // 6. Submit Attempt (Central server storage with pending-sync guarantee)
  async submitAttemptStrict(record: ExamRecord, user?: UserProfile): Promise<ExamRecord> {
    this.saveLocalAttempt(record);
    this.enqueuePendingAttempt(record);

    const res = await fetch('/api/attempts', {
      method: 'POST',
      cache: 'no-store',
      headers: this.getHeaders(user),
      body: JSON.stringify(record),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData.error ||
          this.msg(
            `Không thể lưu kết quả bài làm lên máy chủ (HTTP ${res.status}). Dữ liệu đã được giữ tạm để đồng bộ lại.`,
            `Unable to save your attempt to the server (HTTP ${res.status}). Your attempt is safely cached for retry.`
          )
      );
    }

    const saved: ExamRecord = await res.json();
    this.removePendingAttempt(record.id);
    if (saved.id && saved.id !== record.id) {
      this.removePendingAttempt(saved.id);
    }
    this.saveLocalAttempt(saved);
    this.flushPendingAttempts(user).catch(() => {});
    return saved;
  }

  async submitAttempt(record: ExamRecord, user?: UserProfile): Promise<ExamRecord> {
    try {
      return await this.submitAttemptStrict(record, user);
    } catch (err) {
      console.warn('Could not post to server API, kept in pending sync queue:', err);
      return record;
    }
  }

  getPendingAttempts(): ExamRecord[] {
    try {
      const raw = localStorage.getItem(PENDING_ATTEMPTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading pending attempts:', e);
    }
    return [];
  }

  private enqueuePendingAttempt(record: ExamRecord): void {
    try {
      const pending = this.getPendingAttempts().filter((r) => r && r.id !== record.id);
      pending.unshift(record);
      localStorage.setItem(PENDING_ATTEMPTS_KEY, JSON.stringify(pending.slice(0, 50)));
    } catch (e) {
      console.warn('Unable to queue pending attempt locally:', e);
    }
  }

  private removePendingAttempt(recordId: string): void {
    try {
      const pending = this.getPendingAttempts().filter((r) => r && r.id !== recordId);
      localStorage.setItem(PENDING_ATTEMPTS_KEY, JSON.stringify(pending));
    } catch (e) {
      console.warn('Unable to clear pending attempt:', e);
    }
  }

  async flushPendingAttempts(user?: UserProfile): Promise<{ synced: number; failed: number }> {
    const pending = this.getPendingAttempts();
    if (pending.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    for (const item of pending) {
      try {
        const res = await fetch('/api/attempts', {
          method: 'POST',
          cache: 'no-store',
          headers: this.getHeaders(user),
          body: JSON.stringify(item),
        });
        if (res.ok) {
          const saved: ExamRecord = await res.json();
          this.removePendingAttempt(item.id);
          this.saveLocalAttempt(saved);
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    return { synced, failed };
  }

  // 7. Update Student Profile
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Could not update profile on server:', err);
    }
    return profile as UserProfile;
  }

  // 8. Download Excel report
  downloadExcelReport(filters: Partial<MultiSchoolFilterOptions>) {
    const params = new URLSearchParams();
    if (filters.schoolName) params.append('schoolName', filters.schoolName);
    if (filters.className) params.append('className', filters.className);
    if (filters.studentName) params.append('studentName', filters.studentName);
    if (filters.lessonId) params.append('lessonId', filters.lessonId);
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.timeRange) params.append('timeRange', filters.timeRange);

    window.location.href = `/api/export-excel?${params.toString()}`;
  }

  // 9. Question Management (Teacher Authorized)
  async createQuestion(question: Partial<Question>): Promise<Question> {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(question),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || this.msg('Không thể tạo câu hỏi.', 'Unable to create question.'));
    }
    return await res.json();
  }

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(question),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || this.msg('Không thể cập nhật câu hỏi.', 'Unable to update question.'));
    }
    return await res.json();
  }

  async deleteQuestion(id: string): Promise<void> {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || this.msg('Không thể xóa câu hỏi.', 'Unable to delete question.'));
    }
  }

  // 10. Teacher Exam Configurations
  async getTeacherExams(): Promise<any[]> {
    const res = await fetch('/api/teacher/exams', {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  }

  async saveTeacherExam(exam: any): Promise<any> {
    const res = await fetch('/api/teacher/exams', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(exam),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || this.msg('Không thể lưu đề kiểm tra.', 'Unable to save exam.'));
    }
    return await res.json();
  }

  async deleteTeacherExam(id: string): Promise<void> {
    const res = await fetch(`/api/teacher/exams/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || this.msg('Không thể xóa đề thi.', 'Unable to delete exam.'));
    }
  }

  // 11. Student Authentication & Registration
  async studentLogin(username: string, password: string): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || this.msg('Đăng nhập không thành công.', 'Login failed.'));
    }
    return data;
  }

  async studentRegisterExtended(data: { name: string; school: string; className: string }): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/student-register-extended', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || this.msg('Không thể đăng ký học tập mở rộng.', 'Unable to register extended learner session.'));
    }
    return resData;
  }

  // 12. Student Management for Teachers
  async importStudentsToClass(className: string, students: any[], schoolName?: string): Promise<any> {
    const res = await fetch(`/api/teacher/classes/${encodeURIComponent(className)}/import-students`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ className, students, schoolName }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể nhập danh sách học sinh.', 'Unable to import student list.'));
    }
    return data;
  }

  async resetStudentPassword(studentId: string, newPassword?: string): Promise<any> {
    const res = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể đặt lại mật khẩu học sinh.', 'Unable to reset student password.'));
    }
    return data;
  }

  async deleteStudent(studentId: string): Promise<void> {
    const res = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || this.msg('Không thể xóa hồ sơ học sinh.', 'Unable to delete student profile.'));
    }
  }

  // 13. SKKN Analytics Report
  async getSKKNAnalytics(filters: any = {}): Promise<any> {
    const params = new URLSearchParams();
    if (filters.schoolName) params.append('schoolName', filters.schoolName);
    if (filters.className) params.append('className', filters.className);
    if (filters.studentName) params.append('studentName', filters.studentName);
    if (filters.lessonId) params.append('lessonId', filters.lessonId);
    if (filters.questionType) params.append('questionType', filters.questionType);
    if (filters.timeRange) params.append('timeRange', filters.timeRange);

    const res = await fetch(`/api/teacher/analytics/skkn?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(this.msg('Không thể tải dữ liệu báo cáo SKKN.', 'Unable to load SKKN analytics report.'));
    }
    return await res.json();
  }

  // 14. AI Video Lecture System (Teacher & Student)
  async getTeacherVideoCatalog(): Promise<{
    records: LessonVideoRecord[];
    queue: VideoQueueState;
    capabilities: VideoCapabilities;
    chapters: any[];
    parts: any[];
  }> {
    const res = await fetch('/api/teacher/videos', {
      cache: 'no-store',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể tải danh sách video bài giảng.', 'Failed to load video lecture repository.'));
    }
    return data;
  }

  async generateLessonVideoScript(lessonId: string): Promise<LessonVideoRecord> {
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/script`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể tạo kịch bản AI.', 'Failed to generate AI script.'));
    }
    return data;
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
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/script`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể lưu kịch bản.', 'Failed to save script edits.'));
    }
    return data;
  }

  async generateSingleLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể tạo video bài giảng.', 'Failed to produce lesson video.'));
    }
    return data;
  }

  async approveLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể duyệt xuất bản video.', 'Failed to approve video.'));
    }
    return data;
  }

  async approveAllLessonVideos(lessonIds?: string[]): Promise<{
    approvedCount: number;
    skippedCount: number;
    approvedLessonIds: string[];
    records: LessonVideoRecord[];
    queue: VideoQueueState;
  }> {
    const res = await fetch('/api/teacher/videos/batch/approve', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ lessonIds }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data.error ||
          this.msg('Không thể duyệt xuất bản hàng loạt video.', 'Failed to batch approve videos.')
      );
    }
    return data;
  }

  async unpublishLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/unpublish`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể ẩn video.', 'Failed to unpublish video.'));
    }
    return data;
  }

  async resetLessonVideo(lessonId: string): Promise<LessonVideoRecord> {
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/reset`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể đặt lại trạng thái.', 'Failed to reset video status.'));
    }
    return data;
  }

  async startBatchLessonScripts(lessonIds?: string[]): Promise<{ queue: VideoQueueState }> {
    const res = await fetch('/api/teacher/videos/batch/scripts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ lessonIds }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể tạo kịch bản hàng loạt.', 'Failed to start batch script queue.'));
    }
    return data;
  }

  async startBatchLessonVideos(lessonIds?: string[]): Promise<{ queue: VideoQueueState }> {
    const res = await fetch('/api/teacher/videos/batch/generate', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ lessonIds }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể tạo video hàng loạt.', 'Failed to start batch video queue.'));
    }
    return data;
  }

  async pauseVideoQueue(): Promise<{ queue: VideoQueueState }> {
    const res = await fetch('/api/teacher/videos/queue/pause', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Pause failed');
    return data;
  }

  async resumeVideoQueue(): Promise<{ queue: VideoQueueState }> {
    const res = await fetch('/api/teacher/videos/queue/resume', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Resume failed');
    return data;
  }

  async retryFailedVideoQueue(): Promise<{ queue: VideoQueueState }> {
    const res = await fetch('/api/teacher/videos/queue/retry-failed', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Retry failed');
    return data;
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
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/external-link`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể gắn link video bền vững.', 'Failed to attach external video link.'));
    }
    return data;
  }

  async removeLessonExternalVideoLink(lessonId: string): Promise<LessonVideoRecord> {
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/external-link`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể gỡ link video ngoài.', 'Failed to remove external video link.'));
    }
    return data;
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
    const res = await fetch('/api/teacher/videos/external-links/bulk', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ items, autoApprove }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể gắn hàng loạt link video.', 'Failed to save bulk external links.'));
    }
    return data;
  }

  async exportExternalVideoLinks(): Promise<{
    schema: string;
    exportedAt: string;
    totalLinked: number;
    links: Record<string, any>;
  }> {
    const res = await fetch('/api/teacher/videos/external-links/export', {
      headers: this.getHeaders(),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể xuất sao lưu link video.', 'Failed to export external links.'));
    }
    return data;
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
    const res = await fetch('/api/teacher/videos/external-links/import', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ backup, restoreApprovalState }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || this.msg('Không thể khôi phục link video từ tệp JSON.', 'Failed to import external links.'));
    }
    return data;
  }

  async uploadLessonVideoToDrive(
    lessonId: string,
    driveAccessToken: string,
    options?: { autoApprove?: boolean; folderName?: string }
  ): Promise<{
    record: LessonVideoRecord;
    driveFileId: string;
    driveFileName: string;
    driveFolderId: string;
    driveFolderName: string;
    driveShareUrl: string;
  }> {
    const res = await fetch(`/api/teacher/videos/${encodeURIComponent(lessonId)}/upload-drive`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'X-Drive-Authorization': `Bearer ${driveAccessToken}`,
      },
      body: JSON.stringify({
        autoApprove: options?.autoApprove ?? true,
        folderName: options?.folderName,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(
        data.error || this.msg('Không thể tải video lên Google Drive.', 'Failed to upload video to Google Drive.')
      );
      err.code = data.code;
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async syncBackupToGoogleDrive(
    driveAccessToken: string,
    folderName?: string
  ): Promise<{
    driveFileId: string;
    driveFolderId: string;
    driveFolderName: string;
    totalLinked: number;
    webViewLink: string;
  }> {
    const res = await fetch('/api/teacher/videos/drive/sync-backup', {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'X-Drive-Authorization': `Bearer ${driveAccessToken}`,
      },
      body: JSON.stringify({ folderName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(
        data.error || this.msg('Không thể lưu tệp sao lưu lên Google Drive.', 'Failed to sync backup JSON to Google Drive.')
      );
      err.code = data.code;
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async getPublishedLessonVideo(lessonId: string): Promise<{
    lessonId: string;
    available: boolean;
    approvalStatus?: 'published' | 'restoring' | 'awaiting_approval' | 'processing' | 'unpublished' | 'not_created';
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
    try {
      const res = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/video`, {
        cache: 'no-store',
      });
      if (res.ok) return await res.json();
    } catch {
      // ignore network error gracefully
    }
    return { lessonId, available: false, approvalStatus: 'not_created', video: null };
  }

  async getPublishedVideosSummaryMap(): Promise<Record<string, { durationSeconds: number; videoUrl: string }>> {
    try {
      const res = await fetch('/api/lessons/videos/published', { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return {};
  }

  // Client Cache helpers
  private getLocalAttempts(): ExamRecord[] {
    try {
      const raw = localStorage.getItem('dia_li_10_exam_records');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXAM_RECORDS;
  }

  private saveLocalAttempt(record: ExamRecord) {
    try {
      const list = this.getLocalAttempts().filter((r) => r.id !== record.id);
      list.unshift(record);
      try {
        localStorage.setItem('dia_li_10_exam_records', JSON.stringify(list));
      } catch {
        localStorage.setItem('dia_li_10_exam_records', JSON.stringify(list.slice(0, 50)));
      }
    } catch (e) {
      console.warn('Unable to cache attempt locally:', e);
    }
  }
}

export const apiService = new ApiService();
