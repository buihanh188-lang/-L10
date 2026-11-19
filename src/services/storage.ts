import {
  Classroom,
  ExamRecord,
  ExamDeadlineHistoryItem,
  Question,
  QuestionGradingDetail,
  StudentAnswers,
  TeacherExamConfig,
  UserProfile,
} from '../types';
import { INITIAL_QUESTIONS } from '../data/questions';
import {
  INITIAL_CLASSES,
  INITIAL_EXAM_RECORDS,
  INITIAL_STUDENTS,
} from '../data/mockUsers';
import { apiService } from './api';
import { localizeExamTitle, localizeQuestion } from './bilingualQuestions';
import { LESSONS } from '../data/lessons';

const QUESTIONS_BANK_VERSION = 'v3_skill_calc_20261109';

const STORAGE_KEYS = {
  CURRENT_USER: 'dia_li_10_current_user',
  QUESTIONS: 'dia_li_10_questions',
  EXAM_RECORDS: 'dia_li_10_exam_records',
  CLASSES: 'dia_li_10_classes',
  TEACHER_EXAMS: 'dia_li_10_teacher_exams',
  STUDENTS: 'dia_li_10_students',
  BANK_VERSION: 'dia_li_10_bank_version',
};

export class StorageService {
  // Current user - returns null if no valid profile exists in localStorage
  static getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.name &&
          typeof parsed.name === 'string' &&
          parsed.name.trim().length > 0 &&
          parsed.school &&
          typeof parsed.school === 'string' &&
          parsed.school.trim().length > 0
        ) {
          // Strict teacher authentication check:
          // A teacher role is accepted if an active token exists in apiService
          if (parsed.role === 'teacher' || parsed.role === 'admin') {
            const token = apiService.getTeacherToken();
            if (!token) {
              localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
              return null;
            }
            return parsed;
          }

          // Students must have a valid className
          if (
            parsed.className &&
            typeof parsed.className === 'string' &&
            parsed.className.trim().length > 0
          ) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Error reading current user:', e);
    }
    return null; // NEVER default to INITIAL_STUDENTS[0]
  }

  static setCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static clearCurrentUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error('Error clearing current user:', e);
    }
  }

  // Teacher session management (Requires verified token from server API)
  static setTeacherSession(token: string, teacherProfile: UserProfile): void {
    apiService.setTeacherToken(token);
    this.setCurrentUser(teacherProfile);
  }

  static clearTeacherSession(): void {
    apiService.setTeacherToken(null);
  }

  static isTeacherAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = apiService.getTeacherToken();
    return !!(user && user.role === 'teacher' && token);
  }

  // Get all students
  static getStudents(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  }

  static addStudent(student: UserProfile): void {
    const list = this.getStudents();
    const existingIndex = list.findIndex(
      (s) => (s.code && s.code === student.code) || (s.id && s.id === student.id)
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...student };
    } else {
      list.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  }

  // Questions (1,600 questions for all 40 lessons, strictly free of giveaway labels)
  static getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      const currentVer = localStorage.getItem(STORAGE_KEYS.BANK_VERSION);

      if (data) {
        const stored = JSON.parse(data) as Question[];
        
        // Check if cached questions are from the clean version and free of giveaway labels
        const hasOldGiveawayLabels = stored.some(
          (q) =>
            q.type === 'multiple_choice' &&
            Array.isArray(q.options) &&
            q.options.some(
              (opt) =>
                typeof opt === 'string' &&
                (opt.startsWith('Khẳng định chuẩn xác') ||
                  opt.startsWith('Quan điểm phiến diện') ||
                  opt.startsWith('Nhận định chưa đúng') ||
                  opt.startsWith('Khẳng định sai'))
            )
        );

        if (
          currentVer === QUESTIONS_BANK_VERSION &&
          !hasOldGiveawayLabels &&
          Array.isArray(stored) &&
          stored.length >= INITIAL_QUESTIONS.length
        ) {
          return stored;
        }

        // Auto-upgrade to clean, standard INITIAL_QUESTIONS while preserving teacher's custom questions
        const customOnes = Array.isArray(stored)
          ? stored.filter((q) => q.id && q.id.includes('custom'))
          : [];
        const combined = [...INITIAL_QUESTIONS, ...customOnes];
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(combined));
        localStorage.setItem(STORAGE_KEYS.BANK_VERSION, QUESTIONS_BANK_VERSION);
        return combined;
      } else {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
        localStorage.setItem(STORAGE_KEYS.BANK_VERSION, QUESTIONS_BANK_VERSION);
      }
    } catch (e) {
      console.error('Error loading questions:', e);
    }
    return INITIAL_QUESTIONS;
  }

  static saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  static addQuestion(question: Question): void {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền thêm câu hỏi.');
    }
    const questions = this.getQuestions();
    questions.push(question);
    this.saveQuestions(questions);
    apiService.createQuestion(question).catch((err) => console.warn('Could not sync question to server:', err));
  }

  static updateQuestion(question: Question): void {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền sửa câu hỏi.');
    }
    const questions = this.getQuestions().map((q) => (q.id === question.id ? question : q));
    this.saveQuestions(questions);
    apiService.updateQuestion(question.id, question).catch((err) => console.warn('Could not sync question to server:', err));
  }

  static deleteQuestion(questionId: string): void {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền xóa câu hỏi.');
    }
    const questions = this.getQuestions().filter((q) => q.id !== questionId);
    this.saveQuestions(questions);
    apiService.deleteQuestion(questionId).catch((err) => console.warn('Could not delete question on server:', err));
  }

  static resetQuestionsToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }

  // Exam Records
  static getExamRecords(): ExamRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAM_RECORDS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXAM_RECORDS;
  }

  static saveExamRecord(record: ExamRecord, user?: UserProfile): void {
    this.cacheExamRecordLocally(record);
    // Synchronize to centralized server database
    apiService.submitAttempt(record, user).catch(console.error);
  }

  static async saveExamRecordStrict(record: ExamRecord, user?: UserProfile): Promise<ExamRecord> {
    this.cacheExamRecordLocally(record);
    const saved = await apiService.submitAttemptStrict(record, user);
    this.cacheExamRecordLocally(saved);
    return saved;
  }

  private static cacheExamRecordLocally(record: ExamRecord): void {
    try {
      const records = this.getExamRecords().filter((r) => r.id !== record.id);
      records.unshift(record);
      try {
        localStorage.setItem(STORAGE_KEYS.EXAM_RECORDS, JSON.stringify(records));
      } catch {
        // Trim oldest cached records if localStorage quota is tight while keeping the newest record
        const trimmed = records.slice(0, 60);
        localStorage.setItem(STORAGE_KEYS.EXAM_RECORDS, JSON.stringify(trimmed));
      }
    } catch (e) {
      console.warn('Could not cache exam record locally:', e);
    }
  }

  static getStudentRecords(studentId: string): ExamRecord[] {
    return this.getExamRecords().filter((r) => r.studentId === studentId);
  }

  // Classes
  static getClasses(): Classroom[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CLASSES;
  }

  static addClass(cls: Classroom): void {
    const classes = this.getClasses();
    classes.push(cls);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }

  // Teacher Exams (Assigned by Giáo viên Bùi Thị Hồng Hạnh)
  static getTeacherExams(): TeacherExamConfig[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(STORAGE_KEYS.TEACHER_EXAMS);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let hasChanged = false;
            const updated = parsed.map((e: TeacherExamConfig) => {
              const exam = { ...e };
              // Khôi phục và đảm bảo tất cả đề kiểm tra của giáo viên Bùi Thị Hồng Hạnh luôn ở trạng thái đã giao chính thức
              const isHanhExam =
                exam.id === 'texam-01' ||
                exam.id === 'texam-02' ||
                exam.id === 'texam-03' ||
                exam.id === 'exam-1793719388686' ||
                exam.id?.startsWith('exam-') ||
                exam.id?.startsWith('texam-');

              if (isHanhExam) {
                // Khôi phục cờ đã giao chính thức
                exam.isAssigned = true;
                exam.isActive = true;
                exam.isSample = false;
                // Bỏ hoàn toàn cơ chế thời hạn và ngày giao
                if (exam.deadline || exam.assignedAt) {
                  delete exam.deadline;
                  delete exam.assignedAt;
                  hasChanged = true;
                }
              }

              // Nâng cấp trọng tâm chuyên đề Kĩ năng tính toán và phân tích bảng số liệu cho texam-02
              if (exam.id === 'texam-02') {
                const hasOldTheoreticalQuestions = exam.questionIds?.some((qid) => qid.startsWith('q-mc-b'));
                if (hasOldTheoreticalQuestions || !exam.questionIds || exam.questionIds.length !== 15 || !exam.questionIds.includes('q-calc-01')) {
                  exam.questionIds = [
                    'q-calc-01', 'q-calc-02', 'q-calc-03', 'q-calc-04',
                    'q-calc-05', 'q-calc-06', 'q-calc-07', 'q-calc-08',
                    'q-calc-09', 'q-calc-10',
                    'q-calc-11', 'q-calc-12', 'q-calc-13',
                    'q-calc-14', 'q-calc-15',
                  ];
                  hasChanged = true;
                }
              }

              return exam;
            });

            if (hasChanged) {
              localStorage.setItem(STORAGE_KEYS.TEACHER_EXAMS, JSON.stringify(updated));
            }
            return updated;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Default official exams assigned by Cô Bùi Thị Hồng Hạnh
    const defaultExams: TeacherExamConfig[] = [
      {
        id: 'texam-01',
        title: 'Đề kiểm tra định kì 45 phút: Địa lí Tự nhiên và Dân cư (Học kì I)',
        className: '10A1',
        timeMinutes: 45,
        questionIds: [
          'q-mc-b1-1', 'q-mc-b2-1', 'q-mc-b3-1', 'q-mc-b4-1', 'q-mc-b5-1',
          'q-mc-b6-1', 'q-mc-b7-1', 'q-mc-b8-1', 'q-mc-b9-1', 'q-mc-b10-1',
          'q-mc-b11-1', 'q-mc-b12-1', 'q-mc-b14-1', 'q-mc-b15-1', 'q-mc-b17-1',
          'q-mc-b18-1', 'q-mc-b19-1', 'q-mc-b20-1',
          'q-tf-b2-1', 'q-tf-b6-1', 'q-tf-b11-1', 'q-tf-b19-1',
          'q-sa-b5-1', 'q-sa-b9-1', 'q-sa-b12-1', 'q-sa-b20-1',
          'q-ma-b4-1', 'q-ma-b15-1',
        ],
        createdAt: '2026-11-06T08:00:00.000Z',
        isSample: false,
        isAssigned: true,
        isActive: true,
        isRevoked: false,
        deadlineHistory: [
          {
            id: 'hist-init-01',
            modifiedAt: '2026-11-06T08:00:00.000Z',
            type: 'initial',
            reason: 'Giáo viên Bùi Thị Hồng Hạnh giao đề kiểm tra chính thức cho lớp 10A1',
            teacherName: 'Cô Bùi Thị Hồng Hạnh',
          },
        ],
      },
      {
        id: 'texam-02',
        title: 'Khảo sát chuyên đề 20 phút: Kĩ năng tính toán và phân tích bảng số liệu Địa lí 10',
        className: '10A2',
        timeMinutes: 20,
        questionIds: [
          'q-calc-01', 'q-calc-02', 'q-calc-03', 'q-calc-04',
          'q-calc-05', 'q-calc-06', 'q-calc-07', 'q-calc-08',
          'q-calc-09', 'q-calc-10',
          'q-calc-11', 'q-calc-12', 'q-calc-13',
          'q-calc-14', 'q-calc-15',
        ],
        createdAt: '2026-11-07T09:30:00.000Z',
        isSample: false,
        isAssigned: true,
        isActive: true,
        isRevoked: false,
        deadlineHistory: [
          {
            id: 'hist-init-02',
            modifiedAt: '2026-11-07T09:30:00.000Z',
            type: 'initial',
            reason: 'Giáo viên Bùi Thị Hồng Hạnh giao khảo sát chuyên đề cho lớp 10A2',
            teacherName: 'Cô Bùi Thị Hồng Hạnh',
          },
        ],
      },
      {
        id: 'texam-03',
        title: 'Đề kiểm tra định kì 45 phút: Địa lí Kinh tế và Phát triển bền vững (Học kì II)',
        className: '10A3',
        timeMinutes: 45,
        questionIds: [
          'q-mc-b21-1', 'q-mc-b22-1', 'q-mc-b23-1', 'q-mc-b24-1', 'q-mc-b25-1',
          'q-mc-b26-1', 'q-mc-b28-1', 'q-mc-b29-1', 'q-mc-b30-1', 'q-mc-b31-1',
          'q-mc-b33-1', 'q-mc-b34-1', 'q-mc-b35-1', 'q-mc-b36-1', 'q-mc-b37-1',
          'q-mc-b38-1', 'q-mc-b39-1', 'q-mc-b40-1',
          'q-tf-b23-1', 'q-tf-b28-1', 'q-tf-b33-1', 'q-tf-b39-1',
          'q-sa-b21-1', 'q-sa-b24-1', 'q-sa-b29-1', 'q-sa-b35-1',
          'q-ma-b22-1', 'q-ma-b30-1',
        ],
        createdAt: '2026-11-08T14:15:00.000Z',
        isSample: false,
        isAssigned: true,
        isActive: true,
        isRevoked: false,
        deadlineHistory: [
          {
            id: 'hist-init-03',
            modifiedAt: '2026-11-08T14:15:00.000Z',
            type: 'initial',
            reason: 'Giáo viên Bùi Thị Hồng Hạnh giao đề kiểm tra học kì cho lớp 10A3',
            teacherName: 'Cô Bùi Thị Hồng Hạnh',
          },
        ],
      },
      {
        id: 'exam-1793719388686',
        title: 'Đề kiểm tra 15 phút Địa lí 10',
        className: '10A1',
        timeMinutes: 15,
        questionIds: [
          'q-mc-b1-1', 'q-mc-b2-1', 'q-mc-b3-1', 'q-mc-b4-1', 'q-mc-b5-1',
          'q-mc-b6-1', 'q-mc-b7-1', 'q-mc-b8-1', 'q-tf-b2-1', 'q-sa-b5-1',
        ],
        createdAt: '2026-11-03T15:23:08.686Z',
        isSample: false,
        isAssigned: true,
        isActive: true,
        isRevoked: false,
        deadlineHistory: [
          {
            id: 'hist-init-00',
            modifiedAt: '2026-11-03T15:23:08.686Z',
            type: 'initial',
            reason: 'Giáo viên Bùi Thị Hồng Hạnh giao đề kiểm tra 15 phút cho lớp 10A1',
            teacherName: 'Cô Bùi Thị Hồng Hạnh',
          },
        ],
      },
    ];

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.TEACHER_EXAMS, JSON.stringify(defaultExams));
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    return defaultExams;
  }

  static assignTeacherExam(
    examId: string,
    className: string,
    deadlineISO?: string,
    reason?: string,
    teacherName?: string
  ): TeacherExamConfig {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền giao đề kiểm tra.');
    }
    const exams = this.getTeacherExams();
    const exam = exams.find((e) => e.id === examId);
    if (!exam) {
      throw new Error('Không tìm thấy đề kiểm tra cần giao.');
    }

    const assignedNow = new Date().toISOString();
    exam.className = className;
    exam.isAssigned = true;
    exam.isActive = true;
    exam.isRevoked = false;
    delete exam.deadline;
    delete exam.assignedAt;

    if (!exam.deadlineHistory) {
      exam.deadlineHistory = [];
    }
    exam.deadlineHistory.unshift({
      id: 'hist-assign-' + Date.now(),
      modifiedAt: assignedNow,
      type: 'initial',
      reason: reason?.trim() || `Giáo viên chính thức giao đề kiểm tra cho lớp ${className}`,
      teacherName: teacherName || 'Cô Bùi Thị Hồng Hạnh',
    });

    this.updateTeacherExam(exam);
    return exam;
  }

  static addTeacherExam(exam: TeacherExamConfig): void {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền tạo đề kiểm tra.');
    }
    const exams = this.getTeacherExams();
    exams.unshift(exam);
    localStorage.setItem(STORAGE_KEYS.TEACHER_EXAMS, JSON.stringify(exams));
    apiService.saveTeacherExam(exam).catch((err) => console.warn('Could not sync exam to server:', err));
  }

  static updateTeacherExam(exam: TeacherExamConfig): void {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền điều chỉnh đề kiểm tra.');
    }
    const exams = this.getTeacherExams();
    const idx = exams.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      exams[idx] = exam;
    } else {
      exams.unshift(exam);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHER_EXAMS, JSON.stringify(exams));
    apiService.saveTeacherExam(exam).catch((err) => console.warn('Could not sync exam to server:', err));
  }

  static extendTeacherExamDeadline(
    examId: string,
    newDeadlineISO: string,
    reason?: string,
    teacherName?: string
  ): TeacherExamConfig {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền gia hạn đề kiểm tra.');
    }
    const exams = this.getTeacherExams();
    const exam = exams.find((e) => e.id === examId);
    if (!exam) {
      throw new Error('Không tìm thấy đề kiểm tra cần gia hạn.');
    }

    const prevDeadline = exam.deadline || '';
    exam.deadline = newDeadlineISO;
    exam.isActive = true;
    exam.isRevoked = false;

    if (!exam.deadlineHistory) {
      exam.deadlineHistory = [];
    }
    exam.deadlineHistory.unshift({
      id: 'hist-' + Date.now(),
      modifiedAt: new Date().toISOString(),
      type: 'extend',
      previousDeadline: prevDeadline,
      newDeadline: newDeadlineISO,
      reason: reason?.trim() || 'Gia hạn thêm thời gian làm bài cho học sinh',
      teacherName: teacherName || 'Cô Bùi Thị Hồng Hạnh',
    });

    this.updateTeacherExam(exam);
    return exam;
  }

  static toggleRevokeTeacherExam(
    examId: string,
    revoke: boolean,
    reason?: string,
    teacherName?: string
  ): TeacherExamConfig {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền thu hồi đề kiểm tra.');
    }
    const exams = this.getTeacherExams();
    const exam = exams.find((e) => e.id === examId);
    if (!exam) {
      throw new Error('Không tìm thấy đề kiểm tra cần xử lí.');
    }

    exam.isRevoked = revoke;
    exam.isActive = !revoke;
    if (revoke) {
      exam.revokedAt = new Date().toISOString();
    } else {
      exam.revokedAt = undefined;
    }

    if (!exam.deadlineHistory) {
      exam.deadlineHistory = [];
    }
    exam.deadlineHistory.unshift({
      id: 'hist-' + Date.now(),
      modifiedAt: new Date().toISOString(),
      type: revoke ? 'revoke' : 'restore',
      reason:
        reason?.trim() ||
        (revoke
          ? 'Giáo viên chủ động thu hồi đề kiểm tra'
          : 'Mở lại quyền làm bài cho học sinh'),
      teacherName: teacherName || 'Cô Bùi Thị Hồng Hạnh',
    });

    this.updateTeacherExam(exam);
    return exam;
  }

  static deleteTeacherExam(examId: string): void {
    if (!this.isTeacherAuthenticated()) {
      throw new Error('Chỉ giáo viên đã xác thực mới có quyền xóa đề kiểm tra.');
    }
    const exams = this.getTeacherExams().filter((e) => e.id !== examId);
    localStorage.setItem(STORAGE_KEYS.TEACHER_EXAMS, JSON.stringify(exams));
    apiService.deleteTeacherExam(examId).catch((err) => console.warn('Could not sync delete to server:', err));
  }

  // Grading engine
  static gradeSubmission(
    questions: Question[],
    answers: StudentAnswers,
    lang: 'vi' | 'en' = 'vi'
  ): {
    score: number;
    correctCount: number;
    wrongCount: number;
    answeredCount: number;
    unansweredCount: number;
    accuracyRate: number;
    details: QuestionGradingDetail[];
    topicBreakdown: { [topicId: string]: { total: number; correct: number } };
    typeBreakdown: { [type: string]: { total: number; correct: number } };
    weakTopics: string[];
    strongTopics: string[];
    recommendation: string;
  } {
    const isEn = lang === 'en';
    let earnedPointsTotal = 0;
    const maxPointsTotal = questions.length;
    let fullyCorrectCount = 0;
    let wrongCount = 0;
    let answeredCount = 0;
    let unansweredCount = 0;

    const details: QuestionGradingDetail[] = [];
    const topicBreakdown: { [topicId: string]: { total: number; correct: number } } = {};
    const typeBreakdown: { [type: string]: { total: number; correct: number } } = {
      multiple_choice: { total: 0, correct: 0 },
      true_false_context: { total: 0, correct: 0 },
      short_answer: { total: 0, correct: 0 },
      matching: { total: 0, correct: 0 },
    };

    questions.forEach((rawQ) => {
      const q = localizeQuestion(rawQ, lang);
      const lessonMeta = LESSONS.find((l) => l.id === q.lessonId);
      const resolvedChapterId = q.chapterId ?? lessonMeta?.chapterId ?? (lessonMeta?.partId === 'phan-1' ? 'phan-1' : null);

      if (!topicBreakdown[q.topicId]) {
        topicBreakdown[q.topicId] = { total: 0, correct: 0 };
      }
      topicBreakdown[q.topicId].total += 1;
      typeBreakdown[q.type].total += 1;

      const ans = answers[q.id];
      let earnedScore = 0;
      let isFullyCorrect = false;
      let feedback = '';

      if (!ans) {
        unansweredCount++;
        let questionText = '';
        let correctAnswerText = '';

        if (q.type === 'multiple_choice') {
          questionText = q.question;
          correctAnswerText = `${['A', 'B', 'C', 'D'][q.correctIndex]}. ${q.options[q.correctIndex]}`;
        } else if (q.type === 'true_false_context') {
          questionText = `[${q.contextTitle}] ${q.contextText}`;
          correctAnswerText = q.statements
            .map((s) => `${s.id.toUpperCase()}: ${s.isCorrect ? (isEn ? 'True' : 'Đúng') : (isEn ? 'False' : 'Sai')}`)
            .join(' | ');
        } else if (q.type === 'short_answer') {
          questionText = q.question;
          correctAnswerText = q.unit ? `${q.standardAnswer} ${q.unit}` : `${q.standardAnswer}`;
        } else if (q.type === 'matching') {
          questionText = `${q.title} (${q.columnATitle} ➔ ${q.columnBTitle})`;
          correctAnswerText = q.pairs.map((p) => `${p.left} ➔ ${p.right}`).join(' | ');
        }

        details.push({
          questionId: q.id,
          lessonId: q.lessonId,
          chapterId: resolvedChapterId,
          topicId: q.topicId,
          type: q.type,
          status: 'unanswered',
          maxScore: 1,
          earnedScore: 0,
          isFullyCorrect: false,
          isPartiallyCorrect: false,
          isUnanswered: true,
          feedback: isEn ? 'Student did not answer this question.' : 'Học sinh chưa trả lời câu này.',
          questionText,
          userAnswerText: isEn ? 'Unanswered' : 'Chưa trả lời',
          correctAnswerText,
          explanation:
            (q as any).explanation ||
            (q.type === 'true_false_context'
              ? q.statements.map((s) => `${s.id.toUpperCase()}: ${s.explanation}`).join(' ')
              : ''),
        });
        return;
      }

      if (q.type === 'multiple_choice') {
        const hasSelected = ans.multipleChoiceIndex !== undefined;
        const optLetter = hasSelected ? ['A', 'B', 'C', 'D'][ans.multipleChoiceIndex!] : (isEn ? 'Not selected' : 'Chưa chọn');
        const correctLetter = ['A', 'B', 'C', 'D'][q.correctIndex];
        const userChoiceText = hasSelected
          ? `${optLetter}. ${q.options[ans.multipleChoiceIndex!]}`
          : (isEn ? 'Not selected' : 'Chưa chọn đáp án');
        const correctChoiceText = `${correctLetter}. ${q.options[q.correctIndex]}`;

        if (!hasSelected) {
          unansweredCount++;
          feedback = isEn
            ? `Student did not select an option (Correct answer: ${correctLetter}). ${q.explanation}`
            : `Học sinh chưa chọn đáp án (Đáp án đúng là: ${correctLetter}). ${q.explanation}`;
        } else {
          answeredCount++;
          if (ans.multipleChoiceIndex === q.correctIndex) {
            earnedScore = 1;
            isFullyCorrect = true;
            fullyCorrectCount++;
            topicBreakdown[q.topicId].correct += 1;
            typeBreakdown[q.type].correct += 1;
            feedback = (isEn ? 'Correct! ' : 'Chính xác! ') + q.explanation;
          } else {
            wrongCount++;
            feedback = isEn
              ? `Incorrect (Selected: ${optLetter}, correct answer: ${correctLetter}). ${q.explanation}`
              : `Chưa đúng (Học sinh chọn: ${optLetter}, đáp án đúng là: ${correctLetter}). ${q.explanation}`;
          }
        }

        details.push({
          questionId: q.id,
          lessonId: q.lessonId,
          chapterId: resolvedChapterId,
          topicId: q.topicId,
          type: q.type,
          status: !hasSelected ? 'unanswered' : isFullyCorrect ? 'correct' : 'wrong',
          maxScore: 1,
          earnedScore,
          isFullyCorrect,
          isPartiallyCorrect: false,
          isUnanswered: !hasSelected,
          feedback,
          questionText: q.question,
          options: q.options,
          selectedOptionIndex: ans.multipleChoiceIndex,
          userAnswerText: userChoiceText,
          correctAnswerText: correctChoiceText,
          explanation: q.explanation,
        });
      } else if (q.type === 'true_false_context') {
        const selections = ans.trueFalseSelections || {};
        let correctStmts = 0;
        let answeredStmtCount = 0;
        const feedbackParts: string[] = [];
        const statementsDetail: any[] = [];

        q.statements.forEach((stmt) => {
          const userVal = selections[stmt.id];
          if (userVal !== undefined) answeredStmtCount++;
          const isRight = userVal === stmt.isCorrect;
          if (isRight) {
            correctStmts++;
            feedbackParts.push(
              isEn ? `Statement ${stmt.id.toUpperCase()}: Correct (+).` : `Ý ${stmt.id.toUpperCase()}: Đúng (+).`
            );
          } else {
            feedbackParts.push(
              isEn
                ? `Statement ${stmt.id.toUpperCase()}: Incorrect (Standard: ${stmt.isCorrect ? 'True' : 'False'}).`
                : `Ý ${stmt.id.toUpperCase()}: Chưa đúng (Đáp án chuẩn: ${stmt.isCorrect ? 'Đúng' : 'Sai'}).`
            );
          }
          statementsDetail.push({
            id: stmt.id,
            text: stmt.text,
            userAnswer: userVal,
            correctAnswer: stmt.isCorrect,
            isCorrect: isRight,
            explanation: stmt.explanation,
          });
        });

        // Biểu điểm chuẩn GDPT 2018 trắc nghiệm Đúng/Sai 4 ý:
        // 1 ý đúng: 0.1 điểm
        // 2 ý đúng: 0.25 điểm
        // 3 ý đúng: 0.5 điểm
        // 4 ý đúng: 1.0 điểm
        if (answeredStmtCount === 0) {
          unansweredCount++;
          earnedScore = 0;
        } else {
          answeredCount++;
          if (correctStmts === 4) {
            earnedScore = 1.0;
            isFullyCorrect = true;
            fullyCorrectCount++;
            topicBreakdown[q.topicId].correct += 1;
            typeBreakdown[q.type].correct += 1;
          } else {
            wrongCount++;
            if (correctStmts === 3) {
              earnedScore = 0.5;
            } else if (correctStmts === 2) {
              earnedScore = 0.25;
            } else if (correctStmts === 1) {
              earnedScore = 0.1;
            } else {
              earnedScore = 0;
            }
          }
        }

        if (correctStmts < 4 && correctStmts > 0) {
          topicBreakdown[q.topicId].correct += earnedScore;
          typeBreakdown[q.type].correct += earnedScore;
        }

        feedback =
          (isEn
            ? `Student answered ${correctStmts}/4 statements correctly. `
            : `Học sinh trả lời đúng ${correctStmts}/4 ý. `) + feedbackParts.join(' ');

        const userSummary = (['a', 'b', 'c', 'd'] as const)
          .map((k) =>
            isEn
              ? `Statement ${k.toUpperCase()}: ${selections[k] !== undefined ? (selections[k] ? 'True' : 'False') : 'Not selected'}`
              : `Ý ${k.toUpperCase()}: ${selections[k] !== undefined ? (selections[k] ? 'Đúng' : 'Sai') : 'Chưa chọn'}`
          )
          .join(' | ');
        const correctSummary = q.statements
          .map((s) =>
            isEn
              ? `Statement ${s.id.toUpperCase()}: ${s.isCorrect ? 'True' : 'False'}`
              : `Ý ${s.id.toUpperCase()}: ${s.isCorrect ? 'Đúng' : 'Sai'}`
          )
          .join(' | ');

        const isUnansTF = answeredStmtCount === 0;
        details.push({
          questionId: q.id,
          lessonId: q.lessonId,
          chapterId: resolvedChapterId,
          topicId: q.topicId,
          type: q.type,
          status: isUnansTF ? 'unanswered' : isFullyCorrect ? 'correct' : 'wrong',
          maxScore: 1,
          earnedScore,
          isFullyCorrect,
          isPartiallyCorrect: !isFullyCorrect && earnedScore > 0,
          isUnanswered: isUnansTF,
          feedback,
          questionText: `[${q.contextTitle}] ${q.contextText}`,
          contextTitle: q.contextTitle,
          contextText: q.contextText,
          contextSource: q.contextSource,
          trueFalseSelections: { ...selections },
          userAnswerText: userSummary,
          correctAnswerText: correctSummary,
          statementsDetail,
          explanation: q.statements.map((s) => `${s.id.toUpperCase()}: ${s.explanation}`).join('\n'),
        });
      } else if (q.type === 'short_answer') {
        const rawUserText = (ans.shortAnswerText || '').trim();
        const userCleanText = rawUserText.toLowerCase().replace(/,/g, '.');

        const numericMatch = userCleanText.match(/[-+]?[0-9]*\.?[0-9]+/);
        const parsedUserNum = numericMatch ? parseFloat(numericMatch[0]) : NaN;

        let isNumericMatch = false;
        if (!isNaN(parsedUserNum) && q.numericValue !== undefined) {
          const tol = q.tolerance !== undefined ? q.tolerance : 0.05;
          if (Math.abs(parsedUserNum - q.numericValue) <= tol) {
            isNumericMatch = true;
          }
        }

        const isStringMatch = q.acceptedAnswers.some((acc) => {
          const cleanAcc = acc.trim().toLowerCase().replace(/,/g, '.');
          return (
            userCleanText === cleanAcc ||
            userCleanText === cleanAcc.replace(/[%]/g, '').trim() ||
            userCleanText.replace(/[^0-9.-]/g, '') === cleanAcc.replace(/[^0-9.-]/g, '')
          );
        });

        const isUnansweredShort = rawUserText.length === 0;
        const isCorrect = (isNumericMatch || isStringMatch) && !isUnansweredShort;

        const stepsLabel = isEn ? 'Calculation steps:' : 'Các bước giải:';
        const formulaLabel = isEn ? 'Formula:' : 'Công thức:';

        if (isUnansweredShort) {
          unansweredCount++;
          const stepsText =
            q.calculationSteps && q.calculationSteps.length > 0
              ? `${stepsLabel} ${q.calculationSteps.join(' ➔ ')}.`
              : '';
          feedback = isEn
            ? `No numeric answer entered. Standard answer: ${q.standardAnswer} ${q.unit}. ${q.formula ? `${formulaLabel} ${q.formula}. ` : ''}${stepsText} ${q.explanation}`
            : `Học sinh chưa nhập kết quả. Đáp án đúng là: ${q.standardAnswer} ${q.unit}. ${q.formula ? `Công thức: ${q.formula}. ` : ''}${stepsText} ${q.explanation}`;
        } else {
          answeredCount++;
          if (isCorrect) {
            earnedScore = 1;
            isFullyCorrect = true;
            fullyCorrectCount++;
            topicBreakdown[q.topicId].correct += 1;
            typeBreakdown[q.type].correct += 1;
            feedback = isEn
              ? `Correct! Calculated result: ${q.standardAnswer} ${q.unit}. ${q.formula ? `[${formulaLabel} ${q.formula}]. ` : ''}${q.explanation}`
              : `Chính xác! Kết quả tính: ${q.standardAnswer} ${q.unit}. ${q.formula ? `[Công thức: ${q.formula}]. ` : ''}${q.explanation}`;
          } else {
            wrongCount++;
            const stepsText =
              q.calculationSteps && q.calculationSteps.length > 0
                ? `${stepsLabel} ${q.calculationSteps.join(' ➔ ')}.`
                : '';
            feedback = isEn
              ? `Incorrect (You entered: "${rawUserText}"). Standard answer: ${q.standardAnswer} ${q.unit}. ${q.formula ? `${formulaLabel} ${q.formula}. ` : ''}${stepsText} ${q.explanation}`
              : `Chưa chính xác (Bạn nhập: "${rawUserText}"). Đáp án đúng là: ${q.standardAnswer} ${q.unit}. ${q.formula ? `Công thức: ${q.formula}. ` : ''}${stepsText} ${q.explanation}`;
          }
        }

        const isUnansShort = rawUserText.length === 0;
        details.push({
          questionId: q.id,
          lessonId: q.lessonId,
          chapterId: resolvedChapterId,
          topicId: q.topicId,
          type: q.type,
          status: isUnansShort ? 'unanswered' : isFullyCorrect ? 'correct' : 'wrong',
          maxScore: 1,
          earnedScore,
          isFullyCorrect,
          isPartiallyCorrect: false,
          isUnanswered: isUnansShort,
          feedback,
          questionText: q.question,
          shortAnswerRaw: rawUserText,
          userAnswerText: rawUserText
            ? (q.unit ? `${rawUserText} ${q.unit}` : rawUserText)
            : (isEn ? 'No numeric entry' : 'Chưa nhập kết quả'),
          correctAnswerText: `${q.unit ? `${q.standardAnswer} ${q.unit}` : q.standardAnswer}${q.formula ? ` (${formulaLabel} ${q.formula})` : ''}`,
          explanation: q.explanation,
        });
      } else if (q.type === 'matching') {
        const conns = ans.matchingConnections || {};
        let correctPairs = 0;
        const totalPairs = q.pairs.length;
        const pairsDetail: any[] = [];

        q.pairs.forEach((pair) => {
          const connectedRightId = conns[pair.id];
          const matchedPairObj = q.pairs.find((p) => p.id === connectedRightId);
          const userRightText = matchedPairObj ? matchedPairObj.right : undefined;
          const isRight = connectedRightId === pair.id;
          if (isRight) correctPairs++;

          pairsDetail.push({
            leftId: pair.id,
            left: pair.left,
            userRightId: connectedRightId,
            userRight: userRightText,
            correctRightId: pair.id,
            correctRight: pair.right,
            isCorrect: isRight,
          });
        });

        const connectedCount = Object.keys(conns).length;
        const isUnansweredMatch = connectedCount === 0;
        const pairRatio = totalPairs > 0 ? correctPairs / totalPairs : 0;
        earnedScore = Math.round(pairRatio * 100) / 100;

        if (isUnansweredMatch) {
          unansweredCount++;
          feedback = isEn
            ? `Student did not match any pairs. ${q.explanation}`
            : `Học sinh chưa thực hiện ghép nối. ${q.explanation}`;
        } else {
          answeredCount++;
          if (correctPairs === totalPairs) {
            isFullyCorrect = true;
            fullyCorrectCount++;
            topicBreakdown[q.topicId].correct += 1;
            typeBreakdown[q.type].correct += 1;
            feedback = isEn
              ? `Excellent! You matched all ${totalPairs}/${totalPairs} pairs correctly. ${q.explanation}`
              : `Tuyệt vời! Bạn đã ghép nối chính xác cả ${totalPairs}/${totalPairs} cặp. ${q.explanation}`;
          } else {
            wrongCount++;
            topicBreakdown[q.topicId].correct += pairRatio;
            typeBreakdown[q.type].correct += pairRatio;
            feedback = isEn
              ? `You matched ${correctPairs}/${totalPairs} pairs correctly. ${q.explanation}`
              : `Bạn ghép nối đúng ${correctPairs}/${totalPairs} cặp. ${q.explanation}`;
          }
        }

        const userPairsSummary = pairsDetail
          .map((p) => `${p.left} ➔ ${p.userRight || (isEn ? 'Unmatched' : 'Chưa nối')}`)
          .join(' | ');
        const correctPairsSummary = q.pairs
          .map((p) => `${p.left} ➔ ${p.right}`)
          .join(' | ');

        details.push({
          questionId: q.id,
          lessonId: q.lessonId,
          chapterId: resolvedChapterId,
          topicId: q.topicId,
          type: q.type,
          status: isUnansweredMatch ? 'unanswered' : isFullyCorrect ? 'correct' : 'wrong',
          maxScore: 1,
          earnedScore,
          isFullyCorrect,
          isPartiallyCorrect: !isFullyCorrect && earnedScore > 0,
          isUnanswered: isUnansweredMatch,
          feedback,
          questionText: `${q.title} (${q.columnATitle} ➔ ${q.columnBTitle})`,
          matchingConnections: { ...conns },
          userAnswerText: userPairsSummary,
          correctAnswerText: correctPairsSummary,
          pairsDetail,
          explanation: q.explanation,
        });
      }

      earnedPointsTotal += earnedScore;
    });

    const scaledScore = maxPointsTotal > 0 ? Math.round((earnedPointsTotal / maxPointsTotal) * 10 * 10) / 10 : 0;
    const accuracyRate = maxPointsTotal > 0 ? Math.round((earnedPointsTotal / maxPointsTotal) * 1000) / 10 : 0;

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    Object.entries(topicBreakdown).forEach(([tId, stat]) => {
      const rate = stat.total > 0 ? stat.correct / stat.total : 0;
      if (rate < 0.6) weakTopics.push(tId);
      else if (rate >= 0.8) strongTopics.push(tId);
    });

    let recommendation = isEn
      ? 'Keep up the strong study performance!'
      : 'Hãy tiếp tục phát huy kết quả rèn luyện!';
    if (weakTopics.length > 0) {
      recommendation = isEn
        ? 'Prioritize reviewing topics with lower accuracy, especially quantitative data skills and geographic document analysis.'
        : `Cần ưu tiên ôn lại các bài thuộc chủ đề còn yếu, đặc biệt là kĩ năng xử lí số liệu và đọc hiểu tư liệu địa lí.`;
    }

    return {
      score: scaledScore,
      correctCount: fullyCorrectCount,
      wrongCount,
      answeredCount,
      unansweredCount,
      accuracyRate,
      details,
      topicBreakdown,
      typeBreakdown,
      weakTopics,
      strongTopics,
      recommendation,
    };
  }

  // Export CSV for Teacher
  static exportRecordsToCSV(records: ExamRecord[], lang: 'vi' | 'en' = 'vi'): string {
    const isEn = lang === 'en';
    const headers = isEn
      ? ['No.', 'Student ID', 'Full Name', 'School', 'Class', 'Assessment Title', 'Mode', 'Score', 'Correct', 'Total Qs', 'Accuracy (%)', 'Duration (sec)', 'Date Submitted']
      : ['STT', 'Mã HS', 'Họ và Tên', 'Trường', 'Lớp', 'Tên bài thi / Luyện tập', 'Hình thức', 'Điểm số', 'Số câu đúng', 'Tổng số câu', 'Tỉ lệ đúng (%)', 'Thời gian làm (giây)', 'Ngày nộp'];
    const rows = records.map((r, idx) => [
      idx + 1,
      r.studentCode,
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      `"${(r.schoolName || (isEn ? 'Hoa Binh High School' : 'THPT Hòa Bình')).replace(/"/g, '""')}"`,
      r.className,
      `"${localizeExamTitle(r.title || '', lang).replace(/"/g, '""')}"`,
      r.mode === 'official_test'
        ? (isEn ? 'Official Exam' : 'Đề thi chính thức')
        : (isEn ? 'Practice' : 'Luyện tập'),
      r.score,
      r.correctCount,
      r.totalQuestions,
      r.accuracyRate,
      r.durationSeconds,
      r.date || new Date(r.timestamp).toLocaleDateString(isEn ? 'en-US' : 'vi-VN'),
    ]);
    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  // Question standard sequence order: Dạng 1 -> Dạng 2 -> Dạng 3 -> Dạng 4
  static getQuestionTypeOrder(type: string): number {
    switch (type) {
      case 'multiple_choice':
        return 1;
      case 'true_false_context':
        return 2;
      case 'short_answer':
        return 3;
      case 'matching':
        return 4;
      default:
        return 5;
    }
  }

  static sortQuestionsByStandardOrder(questions: Question[]): Question[] {
    return [...questions].sort((a, b) => {
      const orderA = this.getQuestionTypeOrder(a.type);
      const orderB = this.getQuestionTypeOrder(b.type);
      if (orderA !== orderB) return orderA - orderB;
      return a.id.localeCompare(b.id);
    });
  }

  // Balanced exam builder adhering to MOET GDPT 2018 matrix & 4-type strict sequence
  static buildStandardTimedExam(
    allQuestions: Question[],
    timeMinutes: number,
    customTitle?: string,
    lang: 'vi' | 'en' = 'vi'
  ): { questions: Question[]; title: string; timeMinutes: number } {
    const isEn = lang === 'en';
    const type1All = allQuestions.filter((q) => q.type === 'multiple_choice').sort(() => Math.random() - 0.5);
    const type2All = allQuestions.filter((q) => q.type === 'true_false_context').sort(() => Math.random() - 0.5);
    const type3All = allQuestions.filter((q) => q.type === 'short_answer').sort(() => Math.random() - 0.5);
    const type4All = allQuestions.filter((q) => q.type === 'matching').sort(() => Math.random() - 0.5);

    let count1 = 6;
    let count2 = 2;
    let count3 = 1;
    let count4 = 1;
    let defaultTitle = isEn
      ? '15-Minute Frequent Quiz (10 Questions)'
      : 'Bài kiểm tra 15 phút thường xuyên (10 câu)';

    if (timeMinutes === 45) {
      // Chuẩn ma trận đề 45 phút GDPT 2018: 28 câu (18 Dạng 1, 4 Dạng 2 [16 ý], 4 Dạng 3, 2 Dạng 4)
      count1 = 18;
      count2 = 4;
      count3 = 4;
      count4 = 2;
      defaultTitle = isEn
        ? '45-Minute Periodic Exam – 2018 Curriculum Standard (28 Questions)'
        : 'Đề kiểm tra định kì 45 phút – Chuẩn cấu trúc GDPT 2018 (28 câu)';
    } else if (timeMinutes === 30) {
      count1 = 12;
      count2 = 4;
      count3 = 2;
      count4 = 2;
      defaultTitle = isEn
        ? '30-Minute Midterm Exam (20 Questions)'
        : 'Đề kiểm tra giữa học kì 30 phút (20 câu)';
    } else if (timeMinutes === 20) {
      count1 = 8;
      count2 = 3;
      count3 = 2;
      count4 = 2;
      defaultTitle = isEn
        ? '20-Minute Periodic Topic Survey (15 Questions)'
        : 'Bài khảo sát định kì chủ đề 20 phút (15 câu)';
    } else {
      count1 = 6;
      count2 = 2;
      count3 = 1;
      count4 = 1;
      defaultTitle = isEn
        ? '15-Minute Frequent Quiz (10 Questions)'
        : 'Bài kiểm tra 15 phút thường xuyên (10 câu)';
    }

    const selectedType1 = type1All.slice(0, count1);
    const selectedType2 = type2All.slice(0, count2);
    const selectedType3 = type3All.slice(0, count3);
    const selectedType4 = type4All.slice(0, count4);

    // BẮT BUỘC THEO THỨ TỰ: Dạng 1 -> Dạng 2 -> Dạng 3 -> Dạng 4
    const selectedQuestions: Question[] = [
      ...selectedType1,
      ...selectedType2,
      ...selectedType3,
      ...selectedType4,
    ];

    return {
      questions: selectedQuestions,
      title: customTitle || defaultTitle,
      timeMinutes,
    };
  }

  // Build Midterm & Final semester exams for Semester 1 and Semester 2 (Strict 28 questions, 45 minutes, 10 points)
  static buildSemesterExam(
    allQuestions: Question[],
    examType: 'midterm_1' | 'midterm_2' | 'final_1' | 'final_2',
    lang: 'vi' | 'en' = 'vi'
  ): { questions: Question[]; title: string; timeMinutes: number; description: string; scope: string } {
    const isEn = lang === 'en';
    let pool: Question[] = [];
    let title = '';
    let description = '';
    let scope = '';

    if (examType === 'midterm_1') {
      title = isEn ? 'Midterm Semester 1 Exam – Geography 10' : 'Đề kiểm tra Giữa học kì I – Môn Địa lí 10';
      description = isEn
        ? 'Standard 45-minute 2018 MOET exam matrix (28 questions). Focus: Lessons 1 to 13 (Maps, The Earth, Lithosphere, Atmosphere, Hydrosphere).'
        : 'Chuẩn ma trận đề thi 45 phút GDPT 2018 (28 câu). Kiến thức trọng tâm: Bài 1 đến Bài 13 (Bản đồ, Trái Đất, Thạch quyển, Khí quyển, Thủy quyển).';
      scope = isEn ? 'Lessons 1 to 13 (Physical Geography of the Earth)' : 'Bài 1 đến Bài 13 (Địa lí tự nhiên Trái Đất)';
      pool = allQuestions.filter((q) => {
        const num = parseInt((q.lessonId || '').replace('bai-', ''), 10);
        return num >= 1 && num <= 13;
      });
    } else if (examType === 'final_1') {
      title = isEn ? 'Final Semester 1 Exam – Geography 10' : 'Đề kiểm tra Cuối học kì I – Môn Địa lí 10';
      description = isEn
        ? 'Standard 45-minute 2018 MOET exam matrix (28 questions). Full Semester I: Lessons 1 to 20 (Physical & Population Geography).'
        : 'Chuẩn ma trận đề thi 45 phút GDPT 2018 (28 câu). Kiến thức toàn diện Học kì I: Bài 1 đến Bài 20 (Địa lí tự nhiên & Địa lí dân cư).';
      scope = isEn ? 'Lessons 1 to 20 (Entire Semester I Curriculum)' : 'Bài 1 đến Bài 20 (Toàn bộ chương trình Học kì I)';
      pool = allQuestions.filter((q) => {
        const num = parseInt((q.lessonId || '').replace('bai-', ''), 10);
        return num >= 1 && num <= 20;
      });
    } else if (examType === 'midterm_2') {
      title = isEn ? 'Midterm Semester 2 Exam – Geography 10' : 'Đề kiểm tra Giữa học kì II – Môn Địa lí 10';
      description = isEn
        ? 'Standard 45-minute 2018 MOET exam matrix (28 questions). Focus: Lessons 21 to 32 (Economic Resources, Agriculture, Forestry, Fishery, Industry).'
        : 'Chuẩn ma trận đề thi 45 phút GDPT 2018 (28 câu). Kiến thức trọng tâm: Bài 21 đến Bài 32 (Nguồn lực kinh tế, Nông - Lâm - Thủy sản, Công nghiệp).';
      scope = isEn ? 'Lessons 21 to 32 (First Half of Semester II)' : 'Bài 21 đến Bài 32 (Địa lí kinh tế nửa đầu Học kì II)';
      pool = allQuestions.filter((q) => {
        const num = parseInt((q.lessonId || '').replace('bai-', ''), 10);
        return num >= 21 && num <= 32;
      });
    } else if (examType === 'final_2') {
      title = isEn ? 'Final Semester 2 Exam – Geography 10' : 'Đề kiểm tra Cuối học kì II – Môn Địa lí 10';
      description = isEn
        ? 'Standard 45-minute 2018 MOET exam matrix (28 questions). Full Semester II: Lessons 21 to 40 (Economy, Services, Environment, Green Growth).'
        : 'Chuẩn ma trận đề thi 45 phút GDPT 2018 (28 câu). Kiến thức toàn diện Học kì II: Bài 21 đến Bài 40 (Kinh tế, Dịch vụ, Môi trường, Tăng trưởng xanh).';
      scope = isEn ? 'Lessons 21 to 40 (Entire Semester II Curriculum)' : 'Bài 21 đến Bài 40 (Toàn bộ chương trình Học kì II)';
      pool = allQuestions.filter((q) => {
        const num = parseInt((q.lessonId || '').replace('bai-', ''), 10);
        return num >= 21 && num <= 40;
      });
    }

    if (pool.length === 0) pool = allQuestions;

    const type1All = pool.filter((q) => q.type === 'multiple_choice').sort(() => Math.random() - 0.5);
    const type2All = pool.filter((q) => q.type === 'true_false_context').sort(() => Math.random() - 0.5);
    const type3All = pool.filter((q) => q.type === 'short_answer').sort(() => Math.random() - 0.5);
    const type4All = pool.filter((q) => q.type === 'matching').sort(() => Math.random() - 0.5);

    // 28 câu chuẩn BGD: 18 Dạng 1, 4 Dạng 2 (16 ý), 4 Dạng 3, 2 Dạng 4
    const selected: Question[] = [
      ...type1All.slice(0, 18),
      ...type2All.slice(0, 4),
      ...type3All.slice(0, 4),
      ...type4All.slice(0, 2),
    ];

    return {
      questions: selected,
      title,
      timeMinutes: 45,
      description,
      scope,
    };
  }

  // Enrich older exam records that had empty details array for Onluyen.vn style review
  static enrichAttemptDetailsIfNeeded(
    attempt: ExamRecord,
    allQuestions: Question[],
    lang: 'vi' | 'en' = 'vi'
  ): ExamRecord {
    const isEn = lang === 'en';
    if (attempt.details && attempt.details.length > 0) {
      return attempt;
    }

    let pool = allQuestions;
    if (attempt.lessonId) {
      const lessonPool = allQuestions.filter((q) => q.lessonId === attempt.lessonId);
      if (lessonPool.length > 0) pool = lessonPool;
    }

    const sortedPool = this.sortQuestionsByStandardOrder(pool);
    const totalQ = attempt.totalQuestions || 10;
    const selected = sortedPool.slice(0, totalQ);
    const correctCount = attempt.correctCount || Math.round((attempt.score / 10) * totalQ);

    const syntheticDetails: QuestionGradingDetail[] = selected.map((rawQ, idx) => {
      const q = localizeQuestion(rawQ, lang);
      const isCorrect = idx < correctCount;
      const earnedScore = isCorrect ? 1.0 : (q.type === 'true_false_context' ? 0.25 : 0);

      let questionText = '';
      let userAnswerText = '';
      let correctAnswerText = '';

      if (q.type === 'multiple_choice') {
        questionText = q.question;
        const optLetter = ['A', 'B', 'C', 'D'][q.correctIndex];
        correctAnswerText = `${optLetter}. ${q.options[q.correctIndex]}`;
        userAnswerText = isCorrect
          ? correctAnswerText
          : `${['A', 'B', 'C', 'D'][(q.correctIndex + 1) % 4]}. ${q.options[(q.correctIndex + 1) % 4]}`;
      } else if (q.type === 'true_false_context') {
        questionText = `[${q.contextTitle}] ${q.contextText}`;
        correctAnswerText = q.statements
          .map((s) =>
            isEn
              ? `Statement ${s.id.toUpperCase()}: ${s.isCorrect ? 'True' : 'False'}`
              : `Ý ${s.id.toUpperCase()}: ${s.isCorrect ? 'Đúng' : 'Sai'}`
          )
          .join(' | ');
        userAnswerText = isCorrect
          ? correctAnswerText
          : q.statements
              .map((s, si) =>
                isEn
                  ? `Statement ${s.id.toUpperCase()}: ${si === 0 ? (!s.isCorrect ? 'True' : 'False') : (s.isCorrect ? 'True' : 'False')}`
                  : `Ý ${s.id.toUpperCase()}: ${si === 0 ? (!s.isCorrect ? 'Đúng' : 'Sai') : (s.isCorrect ? 'Đúng' : 'Sai')}`
              )
              .join(' | ');
      } else if (q.type === 'short_answer') {
        questionText = q.question;
        correctAnswerText = `${q.standardAnswer} ${q.unit}`;
        userAnswerText = isCorrect
          ? `${q.standardAnswer} ${q.unit}`
          : isEn
          ? `Incorrect (standard answer: ${q.standardAnswer} ${q.unit})`
          : `Chưa chính xác (đáp án chuẩn: ${q.standardAnswer} ${q.unit})`;
      } else if (q.type === 'matching') {
        questionText = `${q.title} (${q.columnATitle} ➔ ${q.columnBTitle})`;
        correctAnswerText = q.pairs.map((p) => `${p.left} ➔ ${p.right}`).join(' | ');
        userAnswerText = isCorrect
          ? correctAnswerText
          : q.pairs
              .map((p, pi) => `${p.left} ➔ ${pi === 0 ? (isEn ? 'Incorrectly matched' : 'Chưa nối đúng') : p.right}`)
              .join(' | ');
      }

      const qExpl =
        (q as any).explanation ||
        (q.type === 'true_false_context'
          ? q.statements.map((s) => `${s.id.toUpperCase()}: ${s.explanation}`).join(' ')
          : '');
      return {
        questionId: q.id,
        type: q.type,
        maxScore: 1,
        earnedScore,
        isFullyCorrect: isCorrect,
        isPartiallyCorrect: !isCorrect && earnedScore > 0,
        isUnanswered: false,
        feedback: isCorrect
          ? (isEn ? 'Correct! ' : 'Chính xác! ') + qExpl
          : (isEn ? 'Incorrect. ' : 'Chưa chính xác. ') + qExpl,
        questionText,
        userAnswerText,
        correctAnswerText,
        explanation: qExpl,
      };
    });

    return {
      ...attempt,
      details: syntheticDetails,
    };
  }
}
