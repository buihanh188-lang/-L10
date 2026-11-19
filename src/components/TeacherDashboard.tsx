import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Ban,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardPaste,
  Clock,
  Cloud,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  History,
  Layers,
  Lightbulb,
  Lock,
  PieChart,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';
import {
  Classroom,
  ExamDeadlineHistoryItem,
  ExamRecord,
  Question,
  QuestionType,
  TeacherExamConfig,
  UserProfile,
} from '../types';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';
import { TOPICS } from '../data/topics';
import { LESSONS } from '../data/lessons';
import { MultiSchoolStats } from './MultiSchoolStats';
import {
  formatVNDateTime,
} from '../utils/dateUtils';
import { QuestionBankAudit } from './QuestionBankAudit';
import { LessonLearningAnalytics } from './LessonLearningAnalytics';
import { VideoLectureManager } from './VideoLectureManager';
import { ZaloScoreAggregator } from './ZaloScoreAggregator';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeExamTitle, localizeQuestion, localizeTeacherHistoryReason } from '../services/bilingualQuestions';
import { getLocalizedChapter, getLocalizedLesson, getLocalizedTopic } from '../data/bilingualCurriculum';

interface TeacherDashboardProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onRefreshData: () => void;
  currentUser?: UserProfile | null;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  questions,
  onQuestionsChange,
  onRefreshData,
  currentUser = StorageService.getCurrentUser(),
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  // Enforce teacher authentication check
  if (!currentUser || currentUser.role !== 'teacher' || !apiService.getTeacherToken()) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-rose-200 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-rose-950 mb-2">
          {isEn ? 'Teacher Access Denied' : 'Truy Cập Quản Trị Bị Từ Chối'}
        </h2>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          {isEn
            ? 'The administration portal is restricted to authorized subject teachers with valid server credentials.'
            : 'Khu vực quản trị chỉ dành riêng cho Giáo viên bộ môn đã xác thực danh tính qua máy chủ.'}
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<
    'zalo_import' | 'multi_school' | 'lesson_analytics' | 'videos' | 'analytics' | 'questions' | 'audit' | 'exams' | 'classes' | 'pedagogical_report' | 'cloud'
  >('zalo_import');
  const [dataVersion, setDataVersion] = useState(0);
  const handleDataChanged = () => {
    setDataVersion((v) => v + 1);
    onRefreshData();
  };

  // Filter states for analytics
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Questions management states
  const [qFilterTopic, setQFilterTopic] = useState<string>('all');
  const [qFilterType, setQFilterType] = useState<string>('all');
  const [qFilterLevel, setQFilterLevel] = useState<string>('all');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // New Question Form state
  const [newQType, setNewQType] = useState<QuestionType>('multiple_choice');
  const [newQTopicId, setNewQTopicId] = useState<string>('chude-1');
  const [newQLessonId, setNewQLessonId] = useState<string>('bai-1');
  const [newQCognitive, setNewQCognitive] = useState<any>('thong_hieu');
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState<[string, string, string, string]>([
    '',
    '',
    '',
    '',
  ]);
  const [newQCorrectIdx, setNewQCorrectIdx] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState('');

  // Dạng 2: True/False Context form states
  const [newTFContextTitle, setNewTFContextTitle] = useState('');
  const [newTFContextText, setNewTFContextText] = useState('');
  const [newTFStmts, setNewTFStmts] = useState([
    { id: 'a', text: '', isCorrect: true, explanation: '' },
    { id: 'b', text: '', isCorrect: false, explanation: '' },
    { id: 'c', text: '', isCorrect: true, explanation: '' },
    { id: 'd', text: '', isCorrect: false, explanation: '' },
  ]);

  // Dạng 3: Short answer form states
  const [newSAGuide, setNewSAGuide] = useState('');
  const [newSAAccepted, setNewSAAccepted] = useState('');
  const [newSAStandard, setNewSAStandard] = useState('');
  const [newSAUnit, setNewSAUnit] = useState('');

  // Dạng 4: Matching form states
  const [newMTitle, setNewMTitle] = useState('');
  const [newMColA, setNewMColA] = useState('Cột A (Khái niệm / Hiện tượng)');
  const [newMColB, setNewMColB] = useState('Cột B (Ý nghĩa / Biểu hiện)');
  const [newMPairs, setNewMPairs] = useState([
    { id: 'p1', left: '', right: '' },
    { id: 'p2', left: '', right: '' },
    { id: 'p3', left: '', right: '' },
    { id: 'p4', left: '', right: '' },
  ]);

  // Create Exam Form state (Default 3 days from now in VN Time)
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamClass, setNewExamClass] = useState('10A1');
  const [newExamDuration, setNewExamDuration] = useState(20);
  const [newExamSelectedQIds, setNewExamSelectedQIds] = useState<string[]>([]);
  // Create exam mode: 'assign_now' (default: official assignment) or 'save_draft'
  const [createExamMode, setCreateExamMode] = useState<'assign_now' | 'save_draft'>('assign_now');

  // Assign Exam modal state (for unassigned drafts/samples, or re-assigning)
  const [examToAssign, setExamToAssign] = useState<TeacherExamConfig | null>(null);
  const [assignClass, setAssignClass] = useState<string>('10A1');
  const [assignReason, setAssignReason] = useState<string>('');

  // Revoke / Restore modal state
  const [examToRevoke, setExamToRevoke] = useState<TeacherExamConfig | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');

  // Adjustment History modal state
  const [examForHistory, setExamForHistory] = useState<TeacherExamConfig | null>(null);

  // Class management modal
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCount, setNewClassCount] = useState(38);

  // Load live data from Storage
  const allRecords = StorageService.getExamRecords();
  const allStudents = StorageService.getStudents();
  const storedClasses = StorageService.getClasses();
  // Dynamically include every class that exists in records or students
  const dynamicClassNames = Array.from(
    new Set([
      ...storedClasses.map((c) => c.name),
      ...allStudents.map((s) => s.className).filter(Boolean) as string[],
      ...allRecords.map((r) => r.className).filter(Boolean) as string[],
    ])
  ).sort();

  const allClasses = dynamicClassNames.map((name) => {
    const existing = storedClasses.find((c) => c.name === name);
    if (existing) return existing;
    return {
      id: `class-${name}`,
      name,
      schoolName: 'THPT Hòa Bình',
      teacherName: 'Bùi Thị Hồng Hạnh',
      joinCode: `HB${name.toUpperCase().replace(/\s+/g, '')}`,
      studentCount: allStudents.filter((s) => s.className === name).length || 1,
      academicYear: '2025-2026',
    };
  });

  // Reactive Teacher Exams list with reload helper
  const [teacherExams, setTeacherExams] = useState<TeacherExamConfig[]>(() =>
    StorageService.getTeacherExams()
  );
  const reloadTeacherExams = () => {
    setTeacherExams(StorageService.getTeacherExams());
  };

  // Filtered records by class
  const filteredRecords = allRecords.filter((r) => {
    if (selectedClass !== 'all' && r.className !== selectedClass) return false;
    return true;
  });

  // Unique students count in filter
  const participatingStudentCodes = new Set(filteredRecords.map((r) => r.studentCode));
  const totalSubmissions = filteredRecords.length;

  const classAvgScore =
    totalSubmissions > 0
      ? Math.round(
          (filteredRecords.reduce((acc, r) => acc + r.score, 0) / totalSubmissions) * 10
        ) / 10
      : 0;

  const classMaxScore =
    totalSubmissions > 0 ? Math.max(...filteredRecords.map((r) => r.score)) : 0;
  const classMinScore =
    totalSubmissions > 0 ? Math.min(...filteredRecords.map((r) => r.score)) : 0;

  // Grade Tier Distribution
  const tierExcellent = filteredRecords.filter((r) => r.score >= 8.0).length; // Giỏi
  const tierGood = filteredRecords.filter((r) => r.score >= 6.5 && r.score < 8.0).length; // Khá
  const tierAverage = filteredRecords.filter((r) => r.score >= 5.0 && r.score < 6.5).length; // Trung bình
  const tierWeak = filteredRecords.filter((r) => r.score < 5.0).length; // Chưa đạt

  // Students table data computed from records
  const studentTableMap: {
    [code: string]: {
      name: string;
      code: string;
      school: string;
      className: string;
      attempts: number;
      scores: number[];
      recentScore: number | null;
      highestScore: number | null;
      practiceCount: number;
      examCount: number;
      correctCount: number;
      totalQCount: number;
      lastDate?: string;
    };
  } = {};

  allStudents.forEach((std) => {
    studentTableMap[std.code] = {
      name: std.name,
      code: std.code,
      school: std.school || (isEn ? 'Hoa Binh High School' : 'THPT Hòa Bình'),
      className: std.className || (isEn ? 'Unassigned' : 'Chưa phân lớp'),
      attempts: 0,
      scores: [],
      recentScore: null,
      highestScore: null,
      practiceCount: 0,
      examCount: 0,
      correctCount: 0,
      totalQCount: 0,
      lastDate: std.joinedDate || '',
    };
  });

  filteredRecords.forEach((r) => {
    if (!studentTableMap[r.studentCode]) {
      studentTableMap[r.studentCode] = {
        name: r.studentName,
        code: r.studentCode,
        school: r.schoolName || (isEn ? 'Hoa Binh High School' : 'THPT Hòa Bình'),
        className: r.className || (isEn ? 'Unassigned' : 'Chưa phân lớp'),
        attempts: 0,
        scores: [],
        recentScore: null,
        highestScore: null,
        practiceCount: 0,
        examCount: 0,
        correctCount: 0,
        totalQCount: 0,
        lastDate: r.date || '',
      };
    }
    const item = studentTableMap[r.studentCode];
    item.attempts += 1;
    item.scores.push(r.score);
    if (r.mode === 'official_test') {
      item.examCount += 1;
    } else {
      item.practiceCount += 1;
    }
    item.correctCount += r.correctCount;
    item.totalQCount += r.totalQuestions;
    if (item.highestScore === null || r.score > item.highestScore) {
      item.highestScore = r.score;
    }
    item.recentScore = r.score;
    if (r.date) item.lastDate = r.date;
  });

  const studentTableRows = Object.values(studentTableMap)
    .filter((s) => {
      if (selectedClass !== 'all' && s.className !== selectedClass) return false;
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.attempts - a.attempts);

  // Type Breakdown across class
  const classTypeStats: { [k in QuestionType]: { total: number; correct: number } } = {
    multiple_choice: { total: 0, correct: 0 },
    true_false_context: { total: 0, correct: 0 },
    short_answer: { total: 0, correct: 0 },
    matching: { total: 0, correct: 0 },
  };

  filteredRecords.forEach((rec) => {
    if (rec.typeBreakdown) {
      Object.entries(rec.typeBreakdown).forEach(([tKey, val]) => {
        if (classTypeStats[tKey as QuestionType]) {
          classTypeStats[tKey as QuestionType].total += val.total;
          classTypeStats[tKey as QuestionType].correct += val.correct;
        }
      });
    }
  });

  // Topic Breakdown across class
  const classTopicStats: { [tId: string]: { total: number; correct: number } } = {};
  filteredRecords.forEach((rec) => {
    if (rec.topicBreakdown) {
      Object.entries(rec.topicBreakdown).forEach(([tId, val]) => {
        if (!classTopicStats[tId]) classTopicStats[tId] = { total: 0, correct: 0 };
        classTopicStats[tId].total += val.total;
        classTopicStats[tId].correct += val.correct;
      });
    }
  });

  // Filtered Questions list for management tab
  const managedQuestions = questions.filter((q) => {
    if (qFilterTopic !== 'all' && q.topicId !== qFilterTopic) return false;
    if (qFilterType !== 'all' && q.type !== qFilterType) return false;
    if (qFilterLevel !== 'all' && q.cognitiveLevel !== qFilterLevel) return false;
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = StorageService.exportRecordsToCSV(filteredRecords, language);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      isEn
        ? `Geography10_Score_Report_Hoa_Binh_${selectedClass}.csv`
        : `Bao_Cao_Diem_Dia_Li_10_THPT_Hoa_Binh_${selectedClass}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Questions JSON
  const handleExportQuestionsJSON = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      isEn ? 'Geography10_Question_Bank.json' : 'Ngan_hang_cau_hoi_Dia_li_10.json'
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Question Handler
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    let createdQ: Question;

    if (newQType === 'multiple_choice') {
      createdQ = {
        id: 'q-mc-custom-' + Date.now(),
        topicId: newQTopicId,
        lessonId: newQLessonId,
        type: 'multiple_choice',
        cognitiveLevel: newQCognitive,
        question: newQText.trim(),
        options: newQOptions,
        correctIndex: newQCorrectIdx,
        explanation:
          newQExplanation.trim() ||
          (isEn
            ? 'Solution updated by teacher Bui Thi Hong Hanh.'
            : 'Lời giải được cập nhật bởi giáo viên Bùi Thị Hồng Hạnh.'),
      };
    } else if (newQType === 'true_false_context') {
      createdQ = {
        id: 'q-tf-custom-' + Date.now(),
        topicId: newQTopicId,
        lessonId: newQLessonId,
        type: 'true_false_context',
        cognitiveLevel: newQCognitive,
        contextTitle: newTFContextTitle.trim() || (isEn ? 'Fieldwork Context' : 'Tư liệu thực địa'),
        contextText: newTFContextText.trim(),
        statements: newTFStmts.map((st) => ({
          id: st.id as 'a' | 'b' | 'c' | 'd',
          text: st.text,
          isCorrect: st.isCorrect,
          explanation:
            st.explanation ||
            (st.isCorrect
              ? isEn
                ? 'This statement is true according to Grade 10 Geography curriculum standards.'
                : 'Ý này đúng theo nội dung chuẩn kiến thức SGK Địa lí 10.'
              : isEn
              ? 'This statement is false and inconsistent with Grade 10 Geography curriculum standards.'
              : 'Ý này sai, không phù hợp với chuẩn kiến thức SGK Địa lí 10.'),
        })) as any,
      };
    } else if (newQType === 'short_answer') {
      const acceptedList = newSAAccepted
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      if (newSAStandard && !acceptedList.includes(newSAStandard)) {
        acceptedList.unshift(newSAStandard);
      }
      createdQ = {
        id: 'q-sa-custom-' + Date.now(),
        topicId: newQTopicId,
        lessonId: newQLessonId,
        type: 'short_answer',
        cognitiveLevel: newQCognitive,
        question: newQText.trim(),
        guide:
          newSAGuide.trim() ||
          (isEn ? 'Enter the exact numeric value or term.' : 'Nhập kết quả số hoặc thuật ngữ chính xác.'),
        acceptedAnswers: acceptedList,
        standardAnswer: newSAStandard.trim(),
        unit: newSAUnit.trim(),
        explanation: newQExplanation.trim(),
      };
    } else {
      // Matching
      createdQ = {
        id: 'q-ma-custom-' + Date.now(),
        topicId: newQTopicId,
        lessonId: newQLessonId,
        type: 'matching',
        cognitiveLevel: newQCognitive,
        title: newMTitle.trim() || (isEn ? 'Match the corresponding items' : 'Ghép nối các mục tương ứng'),
        columnATitle:
          isEn && newMColA === 'Cột A (Khái niệm / Hiện tượng)'
            ? 'Column A (Concept / Phenomenon)'
            : newMColA,
        columnBTitle:
          isEn && newMColB === 'Cột B (Ý nghĩa / Biểu hiện)'
            ? 'Column B (Meaning / Manifestation)'
            : newMColB,
        pairs: newMPairs.filter((p) => p.left && p.right),
        explanation: newQExplanation.trim(),
      };
    }

    StorageService.addQuestion(createdQ);
    onQuestionsChange(StorageService.getQuestions());
    setShowAddQuestionModal(false);
    alert(
      isEn
        ? 'Question successfully added to question bank!'
        : 'Đã bổ sung thành công câu hỏi mới vào ngân hàng dữ liệu!'
    );
  };

  // Create Exam Handler
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || newExamSelectedQIds.length === 0) {
      alert(
        isEn
          ? 'Please enter an exam title and select at least 1 question.'
          : 'Vui lòng nhập tên đề kiểm tra và tích chọn ít nhất 1 câu hỏi.'
      );
      return;
    }

    const realTimeNow = new Date().toISOString();

    const newExam: TeacherExamConfig = {
      id: 'texam-' + Date.now(),
      title: newExamTitle.trim(),
      className: newExamClass,
      timeMinutes: newExamDuration,
      questionIds: newExamSelectedQIds,
      createdAt: realTimeNow,
      isAssigned: createExamMode === 'assign_now',
      isActive: createExamMode === 'assign_now',
      isRevoked: false,
    };

    StorageService.addTeacherExam(newExam);
    reloadTeacherExams();
    setShowCreateExamModal(false);

    // Reset create exam form
    setNewExamTitle('');
    setNewExamSelectedQIds([]);
    setCreateExamMode('assign_now');

    if (createExamMode === 'assign_now') {
      alert(
        isEn
          ? `Created and officially assigned exam for class ${newExamClass}!`
          : `Đã tạo và chính thức giao đề kiểm tra cho lớp ${newExamClass}!`
      );
    } else {
      alert(
        isEn
          ? `Saved draft exam "${newExam.title}". This exam is not yet assigned; students will not see it until you click "Assign to students".`
          : `Đã lưu bản nháp đề kiểm tra "${newExam.title}". Đề này chưa được giao, học sinh chưa thể nhìn thấy cho đến khi bạn bấm "Giao đề cho học sinh".`
      );
    }
  };

  // Open Assign Modal (for sample/draft exams, or re-assigning)
  const handleOpenAssignModal = (exam: TeacherExamConfig) => {
    setExamToAssign(exam);
    setAssignClass(exam.className || '10A1');
    setAssignReason(
      isEn
        ? `Teacher officially assigned exam for class ${exam.className || '10A1'}`
        : `Giáo viên chính thức giao đề kiểm tra cho lớp ${exam.className || '10A1'}`
    );
  };

  // Confirm Assign
  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examToAssign) return;

    StorageService.assignTeacherExam(
      examToAssign.id,
      assignClass,
      undefined,
      assignReason.trim() ||
        (isEn
          ? `Teacher officially assigned exam for class ${assignClass}`
          : `Giáo viên chính thức giao đề kiểm tra cho lớp ${assignClass}`),
      currentUser?.name || (isEn ? 'Teacher Bui Thi Hong Hanh' : 'Cô Bùi Thị Hồng Hạnh')
    );

    reloadTeacherExams();
    setExamToAssign(null);
    alert(
      isEn
        ? `Exam successfully assigned for class ${assignClass}!`
        : `Đã giao thành công đề kiểm tra cho lớp ${assignClass}!`
    );
  };

  // Confirm Revoke or Restore Exam
  const handleConfirmRevoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examToRevoke) return;
    const willRevoke = !examToRevoke.isRevoked;
    StorageService.toggleRevokeTeacherExam(
      examToRevoke.id,
      willRevoke,
      revokeReason.trim() ||
        (willRevoke
          ? isEn
            ? 'Teacher temporarily revoked exam access'
            : 'Giáo viên tạm thu hồi đề kiểm tra'
          : isEn
          ? 'Reopened exam for students to take the test'
          : 'Mở lại đề kiểm tra cho học sinh làm bài'),
      currentUser?.name || (isEn ? 'Teacher Bui Thi Hong Hanh' : 'Cô Bùi Thị Hồng Hạnh')
    );
    reloadTeacherExams();
    setExamToRevoke(null);
    alert(
      willRevoke
        ? isEn
          ? 'Exam revoked successfully! Students are now locked from taking this exam.'
          : 'Đã thu hồi đề kiểm tra thành công! Học sinh sẽ bị khóa truy cập đề này.'
        : isEn
        ? 'Exam reopened successfully! Students can access and take the test.'
        : 'Đã mở lại đề kiểm tra thành công! Học sinh có thể truy cập và làm bài.'
    );
  };

  // Delete Exam
  const handleDeleteExam = (examId: string, title: string) => {
    const locTitle = localizeExamTitle(title, language);
    if (
      window.confirm(
        isEn
          ? `Are you sure you want to delete exam "${locTitle}"? Existing submission statistics and student attempts will be preserved.`
          : `Bạn có chắc chắn muốn xóa đề kiểm tra "${locTitle}"? Dữ liệu thống kê bài làm đã có sẽ vẫn được bảo lưu.`
      )
    ) {
      StorageService.deleteTeacherExam(examId);
      reloadTeacherExams();
    }
  };

  // Add Class Handler
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newCls: Classroom = {
      id: 'class-' + Date.now(),
      name: newClassName.trim(),
      schoolName: 'TRƯỜNG THPT HÒA BÌNH',
      teacherName: 'Bùi Thị Hồng Hạnh',
      joinCode: 'HB' + newClassName.trim().toUpperCase(),
      studentCount: Number(newClassCount) || 35,
      academicYear: '2026 - 2027',
    };

    StorageService.addClass(newCls);
    setShowAddClassModal(false);
    setNewClassName('');
    alert(
      isEn
        ? `Created class ${newCls.name} with join code: ${newCls.joinCode}`
        : `Đã tạo lớp ${newCls.name} với mã tham gia: ${newCls.joinCode}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Teacher Profile */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-3xl font-black text-amber-300 shadow-inner">
            H
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold">BÙI THỊ HỒNG HẠNH</h1>
              <span className="px-3 py-0.5 rounded-full bg-amber-400 text-blue-950 font-extrabold text-[11px]">
                {isEn ? 'ADMINISTRATOR TEACHER' : 'GIÁO VIÊN QUẢN TRỊ'}
              </span>
            </div>
            <div className="text-xs text-emerald-200 font-semibold">
              {isEn
                ? 'DEPT OF HISTORY – GEOGRAPHY – LAW • HOA BINH HIGH SCHOOL • VAN LINH COMMUNE – LANG SON PROVINCE'
                : 'TỔ SỬ – ĐỊA – GDKTPL • TRƯỜNG THPT HÒA BÌNH • XÃ VẠN LINH – TỈNH LẠNG SƠN'}
            </div>
            <div className="text-[11px] text-teal-200">
              {isEn
                ? 'Specialty: High School Geography • Textbook: Connecting Knowledge to Life'
                : 'Chuyên môn: Địa lí THPT • Bộ sách: Kết nối tri thức với cuộc sống'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isEn ? 'Export Gradebook (CSV)' : 'Xuất bảng điểm (CSV)'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isEn ? 'Print Report' : 'In báo cáo'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('zalo_import')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'zalo_import'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-teal-800 bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/70'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>{isEn ? 'Import Zalo Result Slips' : 'Tổng hợp phiếu Zalo'}</span>
        </button>

        <button
          onClick={() => setActiveTab('multi_school')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'multi_school'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-300" />
          <span>{isEn ? 'Multi-School Network' : 'Thống kê liên trường THPT (Đa trường)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('lesson_analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'lesson_analytics'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isEn ? 'Lesson-Based Learning Analytics' : 'Thống kê học tập theo từng bài'}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isEn ? 'Class Analytics & Gradebook' : 'Bảng điều khiển & Thống kê học tập'}</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isEn ? `Question Bank (${questions.length})` : `Quản lí Ngân hàng (${questions.length} câu)`}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-300" />
          <span>{isEn ? 'Curriculum Audit (40 Lessons)' : 'Kiểm kê & Nghiệm thu (40 bài)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{isEn ? 'Exams & Assignment' : 'Quản lí Đề kiểm tra & Giao bài'}</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isEn ? `Classes (${allClasses.length})` : `Quản lí Lớp học (${allClasses.length} lớp)`}</span>
        </button>

        <button
          onClick={() => setActiveTab('pedagogical_report')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'pedagogical_report'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>{isEn ? 'Pedagogical Report (SKKN)' : 'Báo cáo phân tích sư phạm'}</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{isEn ? 'AI Video Lectures (40)' : 'KHO VIDEO BÀI GIẢNG AI'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'cloud'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>{isEn ? 'Cloud Sync & Backup' : 'Đồng bộ & Firebase'}</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB ZALO: DÁN PHIẾU KẾT QUẢ TỪ ZALO ĐỂ TỔNG HỢP ĐIỂM     */}
      {/* ============================================================ */}
      {activeTab === 'zalo_import' && (
        <ZaloScoreAggregator onDataChanged={handleDataChanged} />
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 0: TRUNG TÂM THỐNG KÊ 4 KHU VỰC & BÁO CÁO SKKN */}
      {/* ============================================================ */}
      {activeTab === 'multi_school' && (
        <MultiSchoolStats key={`ms-${dataVersion}`} currentUser={currentUser} />
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 0.5: THỐNG KÊ HỌC TẬP THEO TỪNG BÀI (40 BÀI HỌC)     */}
      {/* ============================================================ */}
      {activeTab === 'lesson_analytics' && (
        <LessonLearningAnalytics key={`la-${dataVersion}`} questions={questions} currentUser={currentUser} />
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 0.8: KHO VIDEO BÀI GIẢNG AI (40 BÀI - 13 CHƯƠNG)     */}
      {/* ============================================================ */}
      {activeTab === 'videos' && (
        <VideoLectureManager />
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 1: ANALYTICS & STUDENT GRADEBOOK */}
      {/* ============================================================ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Class Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">
                {isEn ? 'Filter by Teaching Class:' : 'Lọc theo Lớp giảng dạy:'}
              </span>
              <div className="inline-flex space-x-1">
                <button
                  onClick={() => setSelectedClass('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedClass === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isEn ? 'Entire Grade 10' : 'Toàn khối 10'}
                </button>
                {allClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedClass === cls.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isEn ? `Class ${cls.name}` : `Lớp ${cls.name}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              {isEn ? 'Total active students:' : 'Tổng số học sinh tham gia:'}{' '}
              <strong className="text-slate-900">
                {participatingStudentCodes.size} {isEn ? 'students' : 'học sinh'}
              </strong>
            </div>
          </div>

          {/* 5 Big Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-medium text-slate-500">
                {isEn ? 'Total Submissions' : 'Tổng số lượt làm bài'}
              </div>
              <div className="text-2xl font-black text-blue-600">{totalSubmissions}</div>
              <div className="text-[10px] text-slate-400">
                {isEn ? 'Across whole system' : 'Trên toàn hệ thống'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-medium text-slate-500">
                {isEn ? 'Average Score' : 'Điểm trung bình'}
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {classAvgScore} {isEn ? 'pts' : 'đ'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isEn ? 'Standard 10-pt scale' : 'Thang điểm 10 chuẩn'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-medium text-slate-500">
                {isEn ? 'Highest Score' : 'Điểm cao nhất'}
              </div>
              <div className="text-2xl font-black text-amber-500">
                {classMaxScore} {isEn ? 'pts' : 'đ'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isEn ? 'Top benchmark' : 'Thủ khoa môn'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-medium text-slate-500">
                {isEn ? 'Lowest Score' : 'Điểm thấp nhất'}
              </div>
              <div className="text-2xl font-black text-rose-500">
                {classMinScore} {isEn ? 'pts' : 'đ'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isEn ? 'Needs reinforcement' : 'Cần bồi dưỡng thêm'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-medium text-slate-500">
                {isEn ? 'Completion Rate' : 'Tỉ lệ hoàn thành'}
              </div>
              <div className="text-2xl font-black text-purple-600">
                {allStudents.length > 0
                  ? Math.round((participatingStudentCodes.size / allStudents.length) * 100)
                  : 0}
                %
              </div>
              <div className="text-[10px] text-slate-400">
                {isEn ? 'Active engagement' : 'Tham gia tích cực'}
              </div>
            </div>
          </div>

          {/* Charts Row: Score Distribution & 4-Format Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phân bố điểm số */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-blue-600" />
                  <span>
                    {isEn
                      ? `Score Distribution (${selectedClass === 'all' ? 'Entire Grade 10' : `Class ${selectedClass}`})`
                      : `Phân bố điểm số học sinh (${selectedClass === 'all' ? 'Toàn khối' : `Lớp ${selectedClass}`})`}
                  </span>
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-emerald-800">
                      {isEn ? 'Excellent (8.0 - 10.0 pts)' : 'Loại Giỏi (8.0 - 10.0 đ)'}
                    </span>
                    <span className="font-bold text-slate-900">
                      {tierExcellent} {isEn ? 'tests' : 'bài'} (
                      {totalSubmissions > 0
                        ? Math.round((tierExcellent / totalSubmissions) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${
                          totalSubmissions > 0 ? (tierExcellent / totalSubmissions) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-blue-800">
                      {isEn ? 'Good (6.5 - 7.9 pts)' : 'Loại Khá (6.5 - 7.9 đ)'}
                    </span>
                    <span className="font-bold text-slate-900">
                      {tierGood} {isEn ? 'tests' : 'bài'} (
                      {totalSubmissions > 0 ? Math.round((tierGood / totalSubmissions) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          totalSubmissions > 0 ? (tierGood / totalSubmissions) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-800">
                      {isEn ? 'Average (5.0 - 6.4 pts)' : 'Trung bình (5.0 - 6.4 đ)'}
                    </span>
                    <span className="font-bold text-slate-900">
                      {tierAverage} {isEn ? 'tests' : 'bài'} (
                      {totalSubmissions > 0
                        ? Math.round((tierAverage / totalSubmissions) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          totalSubmissions > 0 ? (tierAverage / totalSubmissions) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-rose-800">
                      {isEn ? 'Below Average (< 5.0 pts)' : 'Dưới trung bình (< 5.0 đ)'}
                    </span>
                    <span className="font-bold text-slate-900">
                      {tierWeak} {isEn ? 'tests' : 'bài'} (
                      {totalSubmissions > 0 ? Math.round((tierWeak / totalSubmissions) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{
                        width: `${
                          totalSubmissions > 0 ? (tierWeak / totalSubmissions) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* So sánh 4 dạng câu hỏi */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isEn
                      ? 'Accuracy Comparison Across 4 Question Formats'
                      : 'So sánh tỉ lệ trả lời đúng theo 4 Dạng thức câu hỏi'}
                  </span>
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    name: isEn
                      ? 'Format 1: 4-Option Multiple Choice'
                      : 'Dạng 1: Trắc nghiệm 4 phương án',
                    stat: classTypeStats.multiple_choice,
                    color: 'bg-blue-600',
                  },
                  {
                    name: isEn
                      ? 'Format 2: Contextual True/False'
                      : 'Dạng 2: Đúng/Sai có ngữ liệu',
                    stat: classTypeStats.true_false_context,
                    color: 'bg-amber-500',
                  },
                  {
                    name: isEn
                      ? 'Format 3: Short Answer (Calculation)'
                      : 'Dạng 3: Trả lời ngắn (Tính toán)',
                    stat: classTypeStats.short_answer,
                    color: 'bg-emerald-600',
                  },
                  {
                    name: isEn
                      ? 'Format 4: Column Matching'
                      : 'Dạng 4: Ghép nối hai cột',
                    stat: classTypeStats.matching,
                    color: 'bg-purple-600',
                  },
                ].map((item, i) => {
                  const rate =
                    item.stat.total > 0
                      ? Math.round((item.stat.correct / item.stat.total) * 100)
                      : 0;

                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <span className="font-bold text-slate-900">
                          {rate}% {isEn ? 'correct' : 'đúng'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Student Gradebook Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn
                    ? 'Student Gradebook & Detailed Academic Records'
                    : 'Bảng Thống Kê Điểm Số Chi Tiết Từng Học Sinh'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn
                    ? 'Automatically updated when students complete practice rounds and official exams'
                    : 'Cập nhật tự động khi học sinh hoàn thành các lượt luyện tập và bài kiểm tra'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={
                      isEn ? 'Search student code or name...' : 'Tìm mã hoặc tên học sinh...'
                    }
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors flex items-center space-x-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Export CSV' : 'Xuất CSV'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 text-center">{isEn ? 'No.' : 'STT'}</th>
                    <th className="p-3">{isEn ? 'Student Code' : 'Mã HS'}</th>
                    <th className="p-3">{isEn ? 'Full Name' : 'Họ và Tên'}</th>
                    <th className="p-3">{isEn ? 'High School' : 'Trường'}</th>
                    <th className="p-3 text-center">{isEn ? 'Class' : 'Lớp'}</th>
                    <th className="p-3 text-center">{isEn ? 'Attempts' : 'Lượt học/thi'}</th>
                    <th className="p-3 text-center">{isEn ? 'Recent Score' : 'Điểm gần nhất'}</th>
                    <th className="p-3 text-center">{isEn ? 'Highest Score' : 'Điểm cao nhất'}</th>
                    <th className="p-3 text-center">{isEn ? 'Avg Score' : 'Điểm TB'}</th>
                    <th className="p-3 text-center">{isEn ? 'Status' : 'Trạng thái'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {studentTableRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-400">
                        {isEn
                          ? 'No matching students found.'
                          : 'Không tìm thấy học sinh nào phù hợp.'}
                      </td>
                    </tr>
                  ) : (
                    studentTableRows.map((s, idx) => {
                      const avg =
                        s.scores.length > 0
                          ? Math.round(
                              (s.scores.reduce((a, b) => a + b, 0) / s.scores.length) * 10
                            ) / 10
                          : 0;
                      const max =
                        s.highestScore !== null
                          ? s.highestScore
                          : s.scores.length > 0
                          ? Math.max(...s.scores)
                          : '-';
                      const recent =
                        s.recentScore !== null
                          ? `${s.recentScore} ${isEn ? 'pts' : 'đ'}`
                          : '-';
                      const status =
                        s.examCount > 0
                          ? {
                              label: isEn ? 'Exam Completed' : 'Đã hoàn thành thi',
                              color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                            }
                          : s.attempts > 0
                          ? {
                              label: isEn ? 'Practicing' : 'Đang luyện tập',
                              color: 'bg-blue-100 text-blue-800 border-blue-200',
                            }
                          : {
                              label: isEn ? 'Not Joined' : 'Chưa tham gia',
                              color: 'bg-slate-100 text-slate-600 border-slate-200',
                            };

                      return (
                        <tr key={s.code} className="hover:bg-slate-50/60">
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-mono font-semibold text-blue-700">{s.code}</td>
                          <td className="p-3 font-bold text-slate-900">{s.name}</td>
                          <td
                            className="p-3 text-xs text-slate-600 max-w-[180px] truncate"
                            title={s.school}
                          >
                            {s.school}
                          </td>
                          <td className="p-3 text-center font-medium">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                              {s.className}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">
                            {s.attempts} {isEn ? 'attempts' : 'lượt'}
                          </td>
                          <td className="p-3 text-center font-bold text-blue-600">{recent}</td>
                          <td className="p-3 text-center font-bold text-amber-600">
                            {max !== '-' ? `${max} ${isEn ? 'pts' : 'đ'}` : '-'}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-600">
                            {s.scores.length > 0 ? `${avg} ${isEn ? 'pts' : 'đ'}` : '-'}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: QUESTION BANK MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={qFilterTopic}
                onChange={(e) => setQFilterTopic(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="all">{isEn ? 'All Chapters / Topics' : 'Tất cả Chủ đề'}</option>
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isEn ? getLocalizedTopic(t, 'en').title : `Chủ đề ${t.number}: ${t.title}`}
                  </option>
                ))}
              </select>

              <select
                value={qFilterType}
                onChange={(e) => setQFilterType(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="all">{isEn ? 'All 4 Formats' : 'Tất cả 4 Dạng thức'}</option>
                <option value="multiple_choice">
                  {isEn ? 'Format 1: Multiple Choice' : 'Dạng 1: Trắc nghiệm 4 lựa chọn'}
                </option>
                <option value="true_false_context">
                  {isEn ? 'Format 2: Contextual True/False' : 'Dạng 2: Đúng/Sai ngữ liệu'}
                </option>
                <option value="short_answer">
                  {isEn ? 'Format 3: Numerical Calculation' : 'Dạng 3: Trả lời ngắn / Tính toán'}
                </option>
                <option value="matching">
                  {isEn ? 'Format 4: Column Matching' : 'Dạng 4: Ghép nối hai cột'}
                </option>
              </select>

              <select
                value={qFilterLevel}
                onChange={(e) => setQFilterLevel(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="all">{isEn ? 'All Cognitive Levels' : 'Mọi mức độ nhận thức'}</option>
                <option value="nhan_biet">{isEn ? 'Recognition' : 'Nhận biết'}</option>
                <option value="thong_hieu">{isEn ? 'Comprehension' : 'Thông hiểu'}</option>
                <option value="van_dung">{isEn ? 'Application' : 'Vận dụng'}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportQuestionsJSON}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isEn ? 'Export JSON' : 'Xuất JSON'}</span>
              </button>

              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEn ? 'Add New Question' : 'Thêm câu hỏi mới'}</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-semibold">
              {isEn ? 'Showing:' : 'Hiển thị:'}{' '}
              <strong>{managedQuestions.length}</strong> / {questions.length}{' '}
              {isEn ? 'questions in database' : 'câu hỏi trong hệ thống'}
            </div>

            <div className="space-y-3">
              {managedQuestions.map((rawQ, idx) => {
                const q = isEn ? localizeQuestion(rawQ, 'en') : rawQ;
                const topicObj = TOPICS.find((t) => t.id === q.topicId);
                const lessonObj = LESSONS.find((l) => l.id === q.lessonId);

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                          {isEn ? `#Q${idx + 1}` : `#Câu ${idx + 1}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {q.type === 'multiple_choice' && (isEn ? 'Format 1: Multiple Choice' : 'Dạng 1: Trắc nghiệm 4 lựa chọn')}
                          {q.type === 'true_false_context' && (isEn ? 'Format 2: Context True/False' : 'Dạng 2: Đúng/Sai có ngữ liệu')}
                          {q.type === 'short_answer' && (isEn ? 'Format 3: Numerical Calculation' : 'Dạng 3: Trả lời ngắn / Tính toán')}
                          {q.type === 'matching' && (isEn ? 'Format 4: Column Matching' : 'Dạng 4: Ghép nối hai cột')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {lessonObj
                            ? isEn
                              ? `Lesson ${lessonObj.number}`
                              : `Bài ${lessonObj.number}`
                            : topicObj
                            ? getLocalizedTopic(topicObj, language).title
                            : ''}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              isEn
                                ? 'Are you sure you want to delete this question from the bank?'
                                : 'Cô có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?'
                            )
                          ) {
                            StorageService.deleteQuestion(q.id);
                            onQuestionsChange(StorageService.getQuestions());
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title={isEn ? 'Delete question' : 'Xóa câu hỏi'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question summary preview */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {q.type === 'multiple_choice' && (
                        <div>
                          <p className="font-semibold text-slate-900">{q.question}</p>
                          <div className="mt-2 text-xs text-emerald-700 font-medium">
                            {isEn ? 'Standard Answer:' : 'Đáp án chuẩn:'} <strong>{['A', 'B', 'C', 'D'][q.correctIndex]}. {q.options[q.correctIndex]}</strong>
                          </div>
                        </div>
                      )}

                      {q.type === 'true_false_context' && (
                        <div>
                          <p className="font-bold text-amber-900">
                            [{isEn ? 'Context Data:' : 'Ngữ liệu:'} {q.contextTitle}]
                          </p>
                          <p className="text-slate-600 text-xs mt-0.5 line-clamp-2">{q.contextText}</p>
                          <div className="mt-2 text-xs text-slate-700 space-y-0.5">
                            {q.statements.map((s) => (
                              <div key={s.id}>
                                • {s.id.toUpperCase()}) {s.text} ➔{' '}
                                <strong className={s.isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                                  {s.isCorrect ? (isEn ? 'TRUE' : 'ĐÚNG') : (isEn ? 'FALSE' : 'SAI')}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.type === 'short_answer' && (
                        <div>
                          <p className="font-semibold text-slate-900">{q.question}</p>
                          <div className="mt-1 text-xs text-emerald-700">
                            {isEn ? 'Standard Answer:' : 'Đáp án chuẩn:'} <strong>{q.standardAnswer}</strong> {q.unit && `(${q.unit})`}
                          </div>
                        </div>
                      )}

                      {q.type === 'matching' && (
                        <div>
                          <p className="font-semibold text-slate-900">{q.title}</p>
                          <div className="mt-1 text-xs text-slate-600">
                            {isEn ? `${q.pairs.length} matched pairs (${q.columnATitle} ➔ ${q.columnBTitle})` : `Gồm ${q.pairs.length} cặp nối (${q.columnATitle} ➔ ${q.columnBTitle})`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB: QUESTION BANK AUDIT MATRIX (40 LESSONS - 3 PARTS - 13 CHAPTERS) */}
      {/* ============================================================ */}
      {activeTab === 'audit' && (
        <QuestionBankAudit questions={questions} />
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: EXAM MANAGEMENT & ASSIGNMENTS */}
      {/* ============================================================ */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEn ? 'Subject Exam Management & Assignments' : 'Danh Sách Đề Kiểm Tra Chuyên Môn'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Create custom exams, configure question matrix, and assign tests directly to students by class'
                  : 'Tạo đề kiểm tra tùy chỉnh, ấn định ma trận câu hỏi và giao bài trực tiếp cho học sinh theo lớp'}
              </p>
            </div>
            <button
              onClick={() => setShowCreateExamModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? 'Create New Exam' : 'Tạo đề kiểm tra mới'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {teacherExams.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-sm text-slate-700">
                  {isEn ? 'No subject exams created yet' : 'Chưa có đề kiểm tra chuyên môn nào'}
                </p>
                <p className="text-xs">
                  {isEn
                    ? 'Click "Create New Exam" above to create and assign tests to students.'
                    : 'Bấm "Tạo đề kiểm tra mới" ở góc trên để tạo và giao đề thi cho học sinh.'}
                </p>
              </div>
            ) : (
              teacherExams.map((exam) => {
                const isDraftOrSample = exam.isAssigned === false;

                return (
                  <div
                    key={exam.id}
                    className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                      isDraftOrSample
                        ? 'border-dashed border-slate-300 bg-slate-50/50 hover:border-purple-300'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                          {isEn ? `Class ${exam.className}` : `Lớp ${exam.className}`}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold">
                          {exam.timeMinutes} {isEn ? 'mins' : 'phút'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {exam.questionIds.length} {isEn ? 'questions' : 'câu hỏi'}
                        </span>

                        {/* Status Badge */}
                        {isDraftOrSample ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {exam.isSample
                                ? isEn
                                  ? 'Sample Bank Exam (Unassigned)'
                                  : 'Đề mẫu ngân hàng (Chưa giao)'
                                : isEn
                                ? 'Draft (Unassigned)'
                                : 'Bản nháp (Chưa giao)'}
                            </span>
                          </span>
                        ) : exam.isRevoked ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300 flex items-center gap-1">
                            <Ban className="w-3 h-3 text-slate-500" />
                            <span>{isEn ? 'Exam Revoked' : 'Đã thu hồi đề'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isEn ? 'Active / Open' : 'Đang mở làm bài'}</span>
                          </span>
                        )}

                        {exam.deadlineHistory && exam.deadlineHistory.length > 1 && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            {isEn
                              ? `Adjusted ${exam.deadlineHistory.length - 1} time(s)`
                              : `Đã điều chỉnh ${exam.deadlineHistory.length - 1} lần`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{localizeExamTitle(exam.title, language)}</h3>

                      {isDraftOrSample ? (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <div>
                            {isEn ? 'Created:' : 'Khởi tạo:'}{' '}
                            <strong>{formatVNDateTime(exam.createdAt, language)}</strong>
                          </div>
                          <span>•</span>
                          <div className="text-amber-700 font-semibold">
                            {isEn
                              ? 'Unpublished (Students cannot see this test in the exam hall yet)'
                              : 'Chưa phát hành (Học sinh chưa thấy đề này trong phòng thi)'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <div className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {isEn
                                ? 'Maintained & permanently accessible by students'
                                : 'Đang duy trì mở cho học sinh tự do truy cập làm bài'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teacher Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {isDraftOrSample ? (
                        <button
                          onClick={() => handleOpenAssignModal(exam)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                          title={isEn ? 'Assign this exam to students' : 'Giao đề này cho học sinh làm bài'}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Assign to Students' : 'Giao đề cho học sinh'}</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setExamToRevoke(exam);
                              setRevokeReason('');
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition-all shadow-2xs ${
                              exam.isRevoked
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                            title={
                              exam.isRevoked
                                ? isEn
                                  ? 'Reopen exam for students'
                                  : 'Mở lại đề thi cho học sinh'
                                : isEn
                                ? 'Revoke exam and lock access'
                                : 'Thu hồi đề thi, khóa học sinh truy cập'
                            }
                          >
                            {exam.isRevoked ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isEn ? 'Reopen Exam' : 'Mở lại đề'}</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5 text-amber-700" />
                                <span>{isEn ? 'Revoke Exam' : 'Thu hồi đề'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenAssignModal(exam)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1.5 transition-all shadow-2xs"
                            title={
                              isEn
                                ? 'Reassign exam to another class'
                                : 'Giao lại đề thi cho lớp khác'
                            }
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Reassign' : 'Giao lại'}</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setExamForHistory(exam)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all shadow-2xs"
                        title={
                          isEn
                            ? 'View timeline history of adjustments'
                            : 'Xem lịch sử điều chỉnh thời hạn & trạng thái đề'
                        }
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {isEn ? 'History' : 'Lịch sử'} (
                          {exam.deadlineHistory
                            ? exam.deadlineHistory.length
                            : isDraftOrSample
                            ? 0
                            : 1}
                          )
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteExam(exam.id, exam.title)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-rose-200"
                        title={isEn ? 'Delete exam' : 'Xóa đề thi'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 4: CLASSROOMS MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEn ? 'Classroom & Student Access Code Management' : 'Quản Lí Lớp Học & Mã Học Sinh'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Access control and enrollment code allocation for students of Hoa Binh High School'
                  : 'Phân quyền theo dõi và cấp mã tham gia lớp học cho học sinh trường THPT Hòa Bình'}
              </p>
            </div>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isEn ? 'Add New Class' : 'Thêm lớp mới'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {allClasses.map((cls) => {
              const studentsInClass = allStudents.filter((s) => s.className === cls.name);

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-teal-700">
                      {isEn ? `Class ${cls.name}` : `Lớp ${cls.name}`}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                      {isEn ? 'Code:' : 'Mã:'} {cls.joinCode}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      {isEn ? 'Teacher:' : 'Giáo viên:'}{' '}
                      <strong>{isEn ? 'Teacher Bui Thi Hong Hanh' : 'Cô Bùi Thị Hồng Hạnh'}</strong>
                    </div>
                    <div>
                      {isEn ? 'Official Roster:' : 'Sĩ số chính thức:'}{' '}
                      <strong>
                        {cls.studentCount} {isEn ? 'students' : 'học sinh'}
                      </strong>
                    </div>
                    <div>
                      {isEn ? 'Academic Year:' : 'Năm học:'} {cls.academicYear}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      {isEn
                        ? `Activated student accounts (${studentsInClass.length}):`
                        : `Học sinh đã kích hoạt tài khoản (${studentsInClass.length}):`}
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto text-xs pr-1">
                      {studentsInClass.map((std) => (
                        <div
                          key={std.id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 text-slate-700"
                        >
                          <span className="font-semibold">{std.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{std.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 5: PEDAGOGICAL AUTOMATED REPORT */}
      {/* ============================================================ */}
      {activeTab === 'pedagogical_report' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>
                {isEn
                  ? 'AUTOMATED EMPIRICAL PEDAGOGICAL QUALITY REPORT'
                  : 'BÁO CÁO PHÂN TÍCH TỰ ĐỘNG DỰA TRÊN DỮ LIỆU THỰC TẾ'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEn
                ? 'Teaching & Learning Quality Report - Grade 10 Geography - Hoa Binh High School'
                : 'Báo Cáo Chất Lượng Dạy & Học Môn Địa Lí 10 - THPT Hòa Bình'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEn
                ? `Prepared by: Teacher Bui Thi Hong Hanh • Dept of History - Geography - Law • Date: ${new Date().toLocaleDateString(
                    'en-US'
                  )}`
                : `Người lập: Giáo viên Bùi Thị Hồng Hạnh • TỔ SỬ – ĐỊA – GDKTPL • Ngày lập: ${new Date().toLocaleDateString(
                    'vi-VN'
                  )}`}
            </p>
          </div>

          {/* Section 1: Nội dung học sinh đã nắm vững */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {isEn
                  ? '1. Knowledge areas and core competencies mastered by students:'
                  : '1. Nội dung kiến thức học sinh đã nắm vững:'}
              </span>
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-950 leading-relaxed space-y-1.5">
              <p>
                •{' '}
                <strong>
                  {isEn
                    ? 'Earth Geography and Movement Consequences:'
                    : 'Chủ đề Trái Đất và hệ quả chuyển động:'}
                </strong>{' '}
                {isEn
                  ? 'Most students firmly grasp seasonal day/night length principles and GMT timezone calculations.'
                  : 'Đa số học sinh nắm chắc nguyên lí ngày đêm dài ngắn theo mùa và tính toán giờ theo múi giờ GMT.'}
              </p>
              <p>
                •{' '}
                <strong>
                  {isEn
                    ? 'Format 1 (4-Option Multiple Choice):'
                    : 'Dạng 1 (Trắc nghiệm 4 phương án):'}
                </strong>{' '}
                {isEn
                  ? 'High correct response rate (above 85%), demonstrating prompt recall on foundational theory questions.'
                  : 'Tỉ lệ trả lời đúng đạt mức cao (trên 85%), học sinh có phản xạ nhanh với các câu hỏi nhận biết lí thuyết cơ bản.'}
              </p>
              <p>
                •{' '}
                <strong>
                  {isEn
                    ? 'Agricultural, Forestry and Aquacultural Geography:'
                    : 'Địa lí Nông - Lâm - Thủy sản:'}
                </strong>{' '}
                {isEn
                  ? 'Deep understanding of agricultural land as the primary means of production and Asian wet-rice distribution patterns.'
                  : 'Nắm chắc đặc điểm đất trồng là tư liệu sản xuất chủ yếu và sự phân bố lúa gạo tại châu Á.'}
              </p>
            </div>
          </div>

          {/* Section 2: Nội dung còn hạn chế */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-rose-900 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>
                {isEn
                  ? '2. Content areas and skills requiring further improvement:'
                  : '2. Nội dung kiến thức và kĩ năng học sinh còn hạn chế:'}
              </span>
            </h3>
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs sm:text-sm text-rose-950 leading-relaxed space-y-1.5">
              <p>
                •{' '}
                <strong>
                  {isEn
                    ? 'Contextual Statement Analysis (Format 2):'
                    : 'Kĩ năng phân tích ngữ liệu (Dạng 2):'}
                </strong>{' '}
                {isEn
                  ? 'Students experience difficulty evaluating true/false cause-and-effect propositions (notably relationships between cold ocean currents and west-coast continental aridity).'
                  : 'Học sinh còn lúng túng khi đánh giá tính đúng/sai của các nhận định mang tính liên hệ nhân - quả (đặc biệt là mối quan hệ giữa dòng hải lưu lạnh và sự khô cằn của bờ tây lục địa).'}
              </p>
              <p>
                •{' '}
                <strong>
                  {isEn
                    ? 'Numerical Calculation Skills (Format 3):'
                    : 'Kĩ năng tính toán số liệu (Dạng 3):'}
                </strong>{' '}
                {isEn
                  ? 'Frequent confusion between per mille (‰) in crude birth/death rates and percent (%) in natural increase rates; rounding precision errors.'
                  : 'Thường nhầm lẫn giữa đơn vị phần nghìn (‰) của tỉ suất sinh/tử thô và phần trăm (%) của tỉ suất gia tăng tự nhiên; làm tròn số chưa đúng quy định.'}
              </p>
              <p>
                •{' '}
                <strong>
                  {isEn
                    ? 'The Lithosphere and Endogenic/Exogenic Forces:'
                    : 'Thạch quyển và nội lực - ngoại lực:'}
                </strong>{' '}
                {isEn
                  ? 'A subset of students confuses physical mechanical weathering with chemical weathering in limestone karst formations.'
                  : 'Một bộ phận học sinh chưa phân biệt rõ ràng giữa phong hóa lí học và phong hóa hóa học trong địa hình karst đá vôi.'}
              </p>
            </div>
          </div>

          {/* Section 3: Đề xuất biện pháp sư phạm */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span>
                {isEn
                  ? '3. Recommended pedagogical interventions to elevate student achievement:'
                  : '3. Đề xuất biện pháp sư phạm hỗ trợ nâng cao kết quả học tập:'}
              </span>
            </h3>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs sm:text-sm text-blue-950 leading-relaxed space-y-2">
              <p>
                1.{' '}
                <strong>
                  {isEn
                    ? 'Reinforce Format 2 & Format 3 specialized training:'
                    : 'Tăng cường rèn luyện chuyên đề Dạng 2 & Dạng 3:'}
                </strong>{' '}
                {isEn
                  ? 'Organize workshop sessions focused on statistical table reading, climographs, and formulas for population density, temperature range, and freight turnover.'
                  : 'Tổ chức các buổi học chuyên đề rèn luyện kĩ năng đọc bảng số liệu, biểu đồ và các công thức tính mật độ dân số, biên độ nhiệt và khối lượng luân chuyển vận tải.'}
              </p>
              <p>
                2.{' '}
                <strong>
                  {isEn
                    ? 'Integrate Lang Son local field examples:'
                    : 'Tích hợp hình ảnh thực địa Lạng Sơn:'}
                </strong>{' '}
                {isEn
                  ? 'Incorporate vivid real-world local cases such as karst limestone towers in Chi Lang commune and Van Linh commune, Mau Son summit, and Ky Cung River into lectures to anchor theory in hometown realities.'
                  : 'Sử dụng ví dụ trực quan về núi đá vôi tại xã Chi Lăng và xã Vạn Linh, đỉnh Mẫu Sơn, sông Kỳ Cùng vào bài giảng để học sinh gắn lí thuyết với thực tiễn quê hương.'}
              </p>
              <p>
                3.{' '}
                <strong>
                  {isEn
                    ? 'Targeted ability grouping and remediation:'
                    : 'Phân nhóm bồi dưỡng:'}
                </strong>{' '}
                {isEn
                  ? 'Assign concise 10-question practice quizzes to students scoring under 6.5 pts to solidify foundational competencies before final semester exams.'
                  : 'Giao thêm bài kiểm tra 10 câu ngắn cho nhóm học sinh dưới 6.5 điểm nhằm củng cố kiến thức nền tảng trước khi bước vào bài thi cuối kì.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 6: CLOUD & FIREBASE INTEGRATION */}
      {/* ============================================================ */}
      {activeTab === 'cloud' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 text-slate-900">
            <Cloud className="w-7 h-7 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">
                {isEn
                  ? 'Storage Architecture & Firebase Cloud Integration Guide'
                  : 'Kiến Trúc Lưu Trữ & Hướng Dẫn Tích Hợp Firebase'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Cloud infrastructure deployment guidelines for Hoa Binh High School'
                  : 'Sẵn sàng cho việc triển khai lưu trữ đám mây chính thức cho trường THPT Hòa Bình'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed space-y-2">
            <div className="font-bold text-slate-900 text-sm">
              {isEn
                ? 'Current Status: Running in persistent offline LocalStorage mode'
                : 'Trạng thái hiện tại: Đang chạy ở chế độ LocalStorage offline bền vững'}
            </div>
            <p className="text-slate-600">
              {isEn
                ? 'All scores, practice attempts, and newly added questions are safely persisted in the browser storage of teachers and students.'
                : 'Toàn bộ dữ liệu điểm số, lịch sử làm bài và câu hỏi mới thêm được lưu trữ an toàn trong bộ nhớ trình duyệt máy tính của cô và học sinh.'}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              {isEn
                ? 'Firestore Database connection procedures when deploying campus-wide:'
                : 'Quy trình kết nối Firestore Database cho nhà trường khi triển khai trên diện rộng:'}
            </h3>
            <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 leading-relaxed">
              <li>
                <strong>
                  {isEn ? 'Firestore Collection Architecture:' : 'Cấu hình Firestore Collection:'}
                </strong>
                <ul className="list-disc list-inside ml-4 mt-1 text-slate-600 space-y-0.5">
                  <li>
                    Collection{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">users</code>:{' '}
                    {isEn ? 'Student and teacher profiles' : 'Lưu hồ sơ học sinh và giáo viên'}
                  </li>
                  <li>
                    Collection{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">
                      questions
                    </code>
                    :{' '}
                    {isEn
                      ? '4-format Geography question bank'
                      : 'Lưu trữ ngân hàng câu hỏi 4 dạng'}
                  </li>
                  <li>
                    Collection{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">
                      exam_records
                    </code>
                    :{' '}
                    {isEn
                      ? 'Test scores, timestamps, and answer logs'
                      : 'Lưu điểm thi và thời gian thực hiện'}
                  </li>
                  <li>
                    Collection{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">classes</code>:{' '}
                    {isEn ? 'Class rosters and join codes' : 'Lưu danh sách lớp và mã tham gia'}
                  </li>
                </ul>
              </li>
              <li>
                <strong>
                  {isEn
                    ? 'Role-based Security Rules (Firestore Security Rules):'
                    : 'Bảo mật phân quyền (Firestore Security Rules):'}
                </strong>{' '}
                {isEn
                  ? 'Students can only read/write their own attempt records. Only authenticated teacher accounts (Bui Thi Hong Hanh) can manage questions and view gradebooks across all classes.'
                  : 'Học sinh chỉ được phép đọc và ghi điểm vào bản ghi của chính mình. Chỉ có tài khoản giáo viên (Bùi Thị Hồng Hạnh) có quyền thêm sửa xóa câu hỏi và xem toàn bộ lớp.'}
              </li>
              <li>
                <strong>
                  {isEn
                    ? 'Multi-device real-time synchronization:'
                    : 'Đồng bộ đa thiết bị:'}
                </strong>{' '}
                {isEn
                  ? 'Students can take tests on smartphones or school desktop labs with instant real-time sync to the teacher gradebook.'
                  : 'Học sinh có thể làm bài trên điện thoại hoặc máy tính ở trường mà kết quả luôn được cập nhật về bảng điểm giáo viên theo thời gian thực.'}
              </li>
            </ol>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isEn
                ? 'Regularly backup your records via Export CSV or Export JSON in the management tabs.'
                : 'Sao lưu dữ liệu định kì bằng nút Xuất CSV hoặc Xuất JSON ở các tab quản lí.'}
            </span>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    isEn
                      ? 'Reset question bank to initial default curriculum state?'
                      : 'Khôi phục ngân hàng câu hỏi về trạng thái gốc chuẩn ban đầu?'
                  )
                ) {
                  StorageService.resetQuestionsToDefault();
                  onQuestionsChange(StorageService.getQuestions());
                  alert(
                    isEn
                      ? 'Question bank successfully restored!'
                      : 'Đã khôi phục ngân hàng câu hỏi thành công!'
                  );
                }
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Restore Default Question Bank' : 'Khôi phục dữ liệu gốc'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD NEW QUESTION (All 4 formats supported!) */}
      {/* ============================================================ */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEn ? 'Add New Question to Database' : 'Thêm câu hỏi mới vào ngân hàng'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn
                    ? 'Supports all 4 question formats for Grade 10 Geography (Connecting Knowledge)'
                    : 'Hỗ trợ đầy đủ 4 dạng thức câu hỏi môn Địa lí 10 (Bộ sách Kết nối tri thức)'}
                </p>
              </div>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewQuestion} className="space-y-4 text-xs">
              {/* Type Select */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Question Format:' : 'Dạng thức câu hỏi:'}
                  </label>
                  <select
                    value={newQType}
                    onChange={(e) => setNewQType(e.target.value as QuestionType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="multiple_choice">
                      {isEn ? 'Format 1: Multiple Choice (4 Options)' : 'Dạng 1: Trắc nghiệm 4 lựa chọn'}
                    </option>
                    <option value="true_false_context">
                      {isEn ? 'Format 2: Contextual True/False' : 'Dạng 2: Đúng/Sai có ngữ liệu'}
                    </option>
                    <option value="short_answer">
                      {isEn ? 'Format 3: Short Answer (Calculation)' : 'Dạng 3: Trả lời ngắn / Tính toán'}
                    </option>
                    <option value="matching">
                      {isEn ? 'Format 4: Column Matching' : 'Dạng 4: Ghép nối hai cột'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Cognitive Level:' : 'Mức độ nhận thức:'}
                  </label>
                  <select
                    value={newQCognitive}
                    onChange={(e) => setNewQCognitive(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="nhan_biet">{isEn ? 'Recognition' : 'Nhận biết'}</option>
                    <option value="thong_hieu">{isEn ? 'Comprehension' : 'Thông hiểu'}</option>
                    <option value="van_dung">{isEn ? 'Application' : 'Vận dụng'}</option>
                  </select>
                </div>
              </div>

              {/* Topic & Lesson Select */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Chapter / Topic:' : 'Chủ đề:'}
                  </label>
                  <select
                    value={newQTopicId}
                    onChange={(e) => setNewQTopicId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {TOPICS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {isEn ? getLocalizedTopic(t, 'en').title : `Chủ đề ${t.number}: ${t.title}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Lesson:' : 'Bài học:'}
                  </label>
                  <select
                    value={newQLessonId}
                    onChange={(e) => setNewQLessonId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {LESSONS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {isEn ? getLocalizedLesson(l, 'en').title : `Bài ${l.number}: ${l.title}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type 1 specific fields */}
              {newQType === 'multiple_choice' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Question prompt:' : 'Câu hỏi:'}
                    </label>
                    <textarea
                      rows={3}
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Enter multiple-choice question content...'
                          : 'Nhập nội dung câu hỏi trắc nghiệm...'
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">
                      {isEn ? '4 Options and select correct answer:' : '4 Phương án và chọn đáp án đúng:'}
                    </label>
                    {newQOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newQCorrectIdx === oIdx}
                          onChange={() => setNewQCorrectIdx(oIdx)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="font-bold text-slate-600 w-4">
                          {['A', 'B', 'C', 'D'][oIdx]}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newQOptions] as [string, string, string, string];
                            updated[oIdx] = e.target.value;
                            setNewQOptions(updated);
                          }}
                          placeholder={
                            isEn
                              ? `Option ${['A', 'B', 'C', 'D'][oIdx]}`
                              : `Phương án ${['A', 'B', 'C', 'D'][oIdx]}`
                          }
                          className="flex-1 p-2 rounded-lg border border-slate-200 bg-white"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Type 2 specific fields (Context + Statements) */}
              {newQType === 'true_false_context' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Context title:' : 'Tiêu đề ngữ liệu:'}
                    </label>
                    <input
                      type="text"
                      value={newTFContextTitle}
                      onChange={(e) => setNewTFContextTitle(e.target.value)}
                      placeholder={
                        isEn
                          ? 'E.g., Informational excerpt regarding Lang Son climate...'
                          : 'Ví dụ: Đoạn thông tin về khí hậu tỉnh Lạng Sơn...'
                      }
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Context passage (Required):' : 'Đoạn ngữ liệu (bắt buộc):'}
                    </label>
                    <textarea
                      rows={3}
                      value={newTFContextText}
                      onChange={(e) => setNewTFContextText(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Enter geographic text passage, statistical data, documentation...'
                          : 'Nhập đoạn văn bản địa lí, trích dẫn tài liệu, số liệu...'
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">
                      {isEn ? '4 Statements (a, b, c, d):' : '4 Nhận định a, b, c, d:'}
                    </label>
                    {newTFStmts.map((st, idx) => (
                      <div key={st.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-blue-700">
                            {isEn ? `Statement ${st.id.toUpperCase()})` : `Ý ${st.id})`}
                          </span>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`tf-${st.id}`}
                                checked={st.isCorrect === true}
                                onChange={() => {
                                  const updated = [...newTFStmts];
                                  updated[idx].isCorrect = true;
                                  setNewTFStmts(updated);
                                }}
                              />
                              <span className="text-emerald-700 font-bold">
                                {isEn ? 'True' : 'Đúng'}
                              </span>
                            </label>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`tf-${st.id}`}
                                checked={st.isCorrect === false}
                                onChange={() => {
                                  const updated = [...newTFStmts];
                                  updated[idx].isCorrect = false;
                                  setNewTFStmts(updated);
                                }}
                              />
                              <span className="text-rose-700 font-bold">
                                {isEn ? 'False' : 'Sai'}
                              </span>
                            </label>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={st.text}
                          onChange={(e) => {
                            const updated = [...newTFStmts];
                            updated[idx].text = e.target.value;
                            setNewTFStmts(updated);
                          }}
                          placeholder={
                            isEn
                              ? `Content of statement ${st.id})`
                              : `Nội dung nhận định ${st.id})`
                          }
                          className="w-full p-1.5 rounded border border-slate-200 bg-white"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Type 3 specific fields */}
              {newQType === 'short_answer' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Question prompt:' : 'Đề bài câu hỏi:'}
                    </label>
                    <textarea
                      rows={2}
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      placeholder={
                        isEn
                          ? 'E.g., Calculate population density of Lang Son province in 2023...'
                          : 'Ví dụ: Tính mật độ dân số tỉnh Lạng Sơn năm 2023...'
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Instructions / rounding rules:' : 'Hướng dẫn làm bài:'}
                    </label>
                    <input
                      type="text"
                      value={newSAGuide}
                      onChange={(e) => setNewSAGuide(e.target.value)}
                      placeholder={
                        isEn
                          ? 'E.g., Round to whole number; Formula: Population / Area...'
                          : 'Ví dụ: Làm tròn đến hàng đơn vị, công thức: Số dân : Diện tích...'
                      }
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isEn ? 'Standard Answer:' : 'Đáp án chuẩn:'}
                      </label>
                      <input
                        type="text"
                        value={newSAStandard}
                        onChange={(e) => setNewSAStandard(e.target.value)}
                        placeholder={isEn ? 'E.g., 95 people/km²' : 'Ví dụ: 95 người/km²'}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isEn
                          ? 'Equivalent accepted answers (semicolon-separated):'
                          : 'Đáp án tương đương (phân cách bằng dấu chấm phẩy):'}
                      </label>
                      <input
                        type="text"
                        value={newSAAccepted}
                        onChange={(e) => setNewSAAccepted(e.target.value)}
                        placeholder={
                          isEn ? 'E.g., 95; 95 people/km2; 95' : 'Ví dụ: 95; 95 nguoi/km2; 95 người'
                        }
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Type 4 specific fields */}
              {newQType === 'matching' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isEn ? 'Matching exercise title:' : 'Tiêu đề bài nối:'}
                    </label>
                    <input
                      type="text"
                      value={newMTitle}
                      onChange={(e) => setNewMTitle(e.target.value)}
                      placeholder={
                        isEn
                          ? 'E.g., Match soil types with their corresponding characteristics...'
                          : 'Ví dụ: Nối các loại đất với đặc điểm tương ứng...'
                      }
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">
                      {isEn
                        ? 'Standard matched pairs (Column A - Column B):'
                        : 'Các cặp ghép chuẩn (Cột A - Cột B):'}
                    </label>
                    {newMPairs.map((p, idx) => (
                      <div key={p.id} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={p.left}
                          onChange={(e) => {
                            const updated = [...newMPairs];
                            updated[idx].left = e.target.value;
                            setNewMPairs(updated);
                          }}
                          placeholder={isEn ? `Item ${idx + 1} (Col A)` : `Mục ${idx + 1} (Cột A)`}
                          className="p-2 rounded-lg border border-slate-200 bg-white"
                          required
                        />
                        <input
                          type="text"
                          value={p.right}
                          onChange={(e) => {
                            const updated = [...newMPairs];
                            updated[idx].right = e.target.value;
                            setNewMPairs(updated);
                          }}
                          placeholder={isEn ? `Matched target (Col B)` : `Nối tương ứng (Cột B)`}
                          className="p-2 rounded-lg border border-slate-200 bg-white"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation field */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn
                    ? 'Detailed explanation after submission:'
                    : 'Lời giải thích chi tiết sau khi nộp bài:'}
                </label>
                <textarea
                  rows={2}
                  value={newQExplanation}
                  onChange={(e) => setNewQExplanation(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Explain why this answer is correct and cite relevant concepts...'
                      : 'Giải thích vì sao chọn đáp án này, kiến thức liên quan...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  {isEn ? 'Cancel' : 'Hủy bỏ'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {isEn ? 'Save Question' : 'Lưu câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE EXAM */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {isEn ? 'Create New Subject Exam' : 'Tạo đề kiểm tra mới'}
              </h3>
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Exam Title:' : 'Tên đề thi:'}
                </label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder={
                    isEn
                      ? 'E.g., 15-Minute Quiz: Atmosphere and Hydrosphere...'
                      : 'Ví dụ: Kiểm tra 15 phút: Khí quyển và Thủy quyển...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Target Class:' : 'Lớp áp dụng:'}
                  </label>
                  <select
                    value={newExamClass}
                    onChange={(e) => setNewExamClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {allClasses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {isEn ? `Class ${c.name}` : `Lớp ${c.name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEn ? 'Duration (minutes):' : 'Thời gian làm (phút):'}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    {isEn
                      ? `Select questions for exam (${newExamSelectedQIds.length} selected):`
                      : `Chọn câu hỏi vào đề (${newExamSelectedQIds.length} câu đã chọn):`}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (newExamSelectedQIds.length === questions.length) {
                        setNewExamSelectedQIds([]);
                      } else {
                        setNewExamSelectedQIds(questions.slice(0, 15).map((q) => q.id));
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    {isEn ? 'Quick pick 15 questions' : 'Chọn nhanh 15 câu'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-xl">
                  {questions.map((rawQ) => {
                    const q = isEn ? localizeQuestion(rawQ, 'en') : rawQ;
                    return (
                      <label
                        key={q.id}
                        className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newExamSelectedQIds.includes(q.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewExamSelectedQIds([...newExamSelectedQIds, q.id]);
                            } else {
                              setNewExamSelectedQIds(newExamSelectedQIds.filter((id) => id !== q.id));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          [{q.type.toUpperCase()}]{' '}
                          {q.type === 'multiple_choice'
                            ? q.question
                            : q.type === 'true_false_context'
                            ? q.contextTitle
                            : q.type === 'short_answer'
                            ? q.question
                            : q.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  {isEn ? 'Cancel' : 'Hủy bỏ'}
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    onClick={() => setCreateExamMode('save_draft')}
                    className="px-4 py-2 border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl font-bold transition-all"
                    title={
                      isEn
                        ? 'Save draft exam, unassigned to students'
                        : 'Lưu bản nháp đề thi, chưa phát hành cho học sinh'
                    }
                  >
                    {isEn ? 'Save Draft (Unassigned)' : 'Lưu bản nháp (Chưa giao)'}
                  </button>
                  <button
                    type="submit"
                    onClick={() => setCreateExamMode('assign_now')}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                    title={
                      isEn
                        ? 'Record actual timestamp and assign immediately'
                        : 'Ghi nhận thời điểm giao đề thực tế và phát hành ngay'
                    }
                  >
                    <Send className="w-4 h-4" />
                    <span>{isEn ? 'Assign Now to Students' : 'Giao đề ngay cho học sinh'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN EXAM */}
      {examToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {examToAssign.isAssigned
                      ? isEn
                        ? 'Reassign Exam'
                        : 'Giao lại đề kiểm tra'
                      : isEn
                      ? 'Assign Exam to Students'
                      : 'Giao đề kiểm tra cho học sinh'}
                  </h3>
                  <p className="text-[11px] text-slate-500">{localizeExamTitle(examToAssign.title, language)}</p>
                </div>
              </div>
              <button
                onClick={() => setExamToAssign(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-purple-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-purple-700" />
                  <span>
                    {isEn ? 'Direct Assignment to Class' : 'Giao đề trực tiếp cho lớp'}
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {isEn
                    ? 'Students in the selected class will immediately be able to access and take this test as long as it is maintained.'
                    : 'Học sinh trong lớp được chỉ định sẽ có quyền truy cập và làm bài ngay khi đề được giao và duy trì mở.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Target Class:' : 'Lớp áp dụng:'}
                </label>
                <select
                  value={assignClass}
                  onChange={(e) => setAssignClass(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {allClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {isEn ? `Class ${c.name}` : `Lớp ${c.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Assignment note (optional):' : 'Ghi chú giao đề (không bắt buộc):'}
                </label>
                <input
                  type="text"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  placeholder={
                    isEn
                      ? 'E.g., Periodic subject assessment per school timetable...'
                      : 'Ví dụ: Kiểm tra chuyên môn định kì theo thời khóa biểu...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExamToAssign(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  {isEn ? 'Cancel' : 'Hủy bỏ'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Confirm Assignment' : 'Xác nhận giao đề'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVOKE / RESTORE EXAM */}
      {examToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    examToRevoke.isRevoked
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {examToRevoke.isRevoked ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {examToRevoke.isRevoked
                    ? isEn
                      ? 'Reopen Exam'
                      : 'Mở lại đề kiểm tra'
                    : isEn
                    ? 'Revoke Exam'
                    : 'Thu hồi đề kiểm tra'}
                </h3>
              </div>
              <button
                onClick={() => setExamToRevoke(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRevoke} className="space-y-4 text-xs">
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  examToRevoke.isRevoked
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {examToRevoke.isRevoked ? (
                  <p>
                    {isEn ? (
                      <>
                        You are about to <strong>reopen</strong> the exam "{localizeExamTitle(examToRevoke.title, language)}".
                        Students will be permitted to access and take the test immediately.
                      </>
                    ) : (
                      <>
                        Bạn đang chuẩn bị <strong>mở lại</strong> đề thi "{localizeExamTitle(examToRevoke.title, language)}". Học sinh
                        sẽ tiếp tục được truy cập và làm bài thi này.
                      </>
                    )}
                  </p>
                ) : (
                  <p>
                    {isEn ? (
                      <>
                        When <strong>revoked</strong>, the exam "{localizeExamTitle(examToRevoke.title, language)}" will be locked
                        immediately. Students will not be able to start or continue this test.
                      </>
                    ) : (
                      <>
                        Khi <strong>thu hồi</strong>, đề thi "{localizeExamTitle(examToRevoke.title, language)}" sẽ bị khóa ngay lập
                        tức. Học sinh sẽ không thể bắt đầu hoặc tiếp tục làm bài thi này.
                      </>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn
                    ? `Reason for ${examToRevoke.isRevoked ? 'reopening' : 'revocation'}:`
                    : `Lý do ${examToRevoke.isRevoked ? 'mở lại' : 'thu hồi'}:`}
                </label>
                <input
                  type="text"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder={
                    examToRevoke.isRevoked
                      ? isEn
                        ? 'E.g., Issue resolved, reopening test for students...'
                        : 'Ví dụ: Đã khắc phục sự cố, mở lại đề cho các em làm...'
                      : isEn
                      ? 'E.g., Matrix adjustment required, temporary lock...'
                      : 'Ví dụ: Cần điều chỉnh lại ma trận đề thi...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExamToRevoke(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  {isEn ? 'Cancel' : 'Hủy bỏ'}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-bold shadow-xs ${
                    examToRevoke.isRevoked
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {examToRevoke.isRevoked
                    ? isEn
                      ? 'Confirm Reopen'
                      : 'Xác nhận mở lại đề'
                    : isEn
                    ? 'Confirm Revoke'
                    : 'Xác nhận thu hồi đề'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUSTMENT HISTORY */}
      {examForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isEn
                      ? 'Exam Status & Assignment History'
                      : 'Lịch sử giao & điều chỉnh trạng thái đề'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {localizeExamTitle(examForHistory.title, language)} (
                    {isEn ? `Class ${examForHistory.className}` : `Lớp ${examForHistory.className}`})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExamForHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-slate-200">
                <div>
                  <span className="text-slate-500">
                    {isEn ? 'Target Class: ' : 'Lớp áp dụng: '}
                  </span>
                  <strong className="text-purple-700 font-bold">
                    {isEn ? `Class ${examForHistory.className}` : `Lớp ${examForHistory.className}`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">{isEn ? 'Status: ' : 'Trạng thái: '}</span>
                  {examForHistory.isRevoked ? (
                    <span className="font-bold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full text-[11px]">
                      {isEn ? 'Revoked' : 'Đã thu hồi'}
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                      {isEn ? 'Active / Open' : 'Đang mở làm bài'}
                    </span>
                  )}
                </div>
              </div>

              <div className="font-bold text-slate-800 pt-1">
                {isEn
                  ? 'Timeline log of modifications (Vietnam Time UTC+7):'
                  : 'Nhật ký điều chỉnh theo dòng thời gian (UTC+7):'}
              </div>

              {!examForHistory.deadlineHistory || examForHistory.deadlineHistory.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                  {isEn
                    ? 'No supplementary adjustments recorded for this exam.'
                    : 'Chưa ghi nhận lịch sử điều chỉnh bổ sung nào cho đề thi này.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {examForHistory.deadlineHistory.map((item, idx) => {
                    const badgeColor =
                      item.type === 'initial'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : item.type === 'revoke'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                    const typeName =
                      item.type === 'initial'
                        ? isEn
                          ? 'Exam Initialized & Assigned'
                          : 'Khởi tạo & giao đề thi'
                        : item.type === 'revoke'
                        ? isEn
                          ? 'Exam Revoked'
                          : 'Thu hồi đề thi'
                        : isEn
                        ? 'Exam Reopened'
                        : 'Mở lại đề thi';

                    return (
                      <div
                        key={item.id || idx}
                        className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs hover:border-slate-300"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                            {typeName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {formatVNDateTime(item.modifiedAt, language)}
                          </span>
                        </div>

                        <div className="text-slate-600">
                          <span className="text-slate-400">{isEn ? 'Action note: ' : 'Ghi chú: '}</span>
                          <span className="font-medium text-slate-800">{localizeTeacherHistoryReason(item.reason || '', language)}</span>
                        </div>

                        <div className="text-[11px] text-slate-400">
                          {isEn ? 'Performed by: ' : 'Người thực hiện: '}
                          <strong className="text-slate-600">{item.teacherName}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExamForHistory(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                {isEn ? 'Close' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLASS */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isEn ? 'Add New Classroom' : 'Thêm lớp học mới'}
              </h3>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Class Name:' : 'Tên lớp:'}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? 'E.g., 10A4' : 'Ví dụ: 10A4'}
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isEn ? 'Projected Enrollment:' : 'Sĩ số dự kiến:'}
                </label>
                <input
                  type="number"
                  value={newClassCount}
                  onChange={(e) => setNewClassCount(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                >
                  {isEn ? 'Cancel' : 'Hủy'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-xs"
                >
                  {isEn ? 'Create Class' : 'Tạo lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
