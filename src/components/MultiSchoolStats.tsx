import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  GraduationCap,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Filter,
  Search,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  ArrowUpDown,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  RefreshCw,
  Sparkles,
  BarChart2,
  HelpCircle,
  Upload,
  Download,
  Printer,
  KeyRound,
  IdCard,
  AlertTriangle,
  X,
  UserPlus,
  FileText,
  BarChart3,
  PieChart,
  ArrowRight,
  Check,
  Lock,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ClassStats,
  ExamRecord,
  MultiSchoolFilterOptions,
  QuestionType,
  SchoolStats,
  StudentStatsSummary,
  SystemSummary,
  UserProfile,
} from '../types';
import { apiService } from '../services/api';
import { LESSONS } from '../data/lessons';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import { TOPICS } from '../data/topics';
import { getLocalizedLesson, getLocalizedTopic } from '../data/bilingualCurriculum';
import { localizeSknnEfficacyRow } from '../services/bilingualQuestions';
import { normalizeSchoolKey } from '../utils/normalize';
import { useLanguage } from '../contexts/LanguageContext';

interface MultiSchoolStatsProps {
  currentUser: UserProfile;
  onOpenIdentificationModal?: () => void;
}

export const MultiSchoolStats: React.FC<MultiSchoolStatsProps> = ({
  currentUser,
  onOpenIdentificationModal,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  // 4 Independent Analytics Areas
  const [activeArea, setActiveArea] = useState<'schools' | 'classes' | 'students' | 'skkn'>('schools');

  const effectiveRole: 'teacher' | 'student' = currentUser.role === 'teacher' ? 'teacher' : 'student';
  const [selectedSchoolForTeacher, setSelectedSchoolForTeacher] = useState<string>('all');

  // Data states
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [schools, setSchools] = useState<SchoolStats[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [classes, setClasses] = useState<ClassStats[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [students, setStudents] = useState<StudentStatsSummary[]>([]);
  const [attempts, setAttempts] = useState<ExamRecord[]>([]);
  const [skknData, setSkknData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Student Dossier Drawer/Modal
  const [selectedStudentDossier, setSelectedStudentDossier] = useState<StudentStatsSummary | null>(null);

  // Password reset feedback
  const [passwordResetFeedback, setPasswordResetFeedback] = useState<string | null>(null);

  // Excel Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importClass, setImportClass] = useState('10A1');
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Search & Filter in Area 3 (Students)
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentFilterType, setStudentFilterType] = useState<'all' | 'official' | 'extended'>('all');
  const [studentFilterClass, setStudentFilterClass] = useState('all');

  // Multi-dimensional filters for Area 4 (SKKN)
  const [skknFilters, setSkknFilters] = useState<MultiSchoolFilterOptions>({
    schoolName: 'all',
    className: 'all',
    studentName: '',
    lessonId: 'all',
    questionType: 'all',
    mode: 'all',
    timeRange: 'all',
  });

  const authUser: UserProfile = useMemo(() => {
    return {
      ...currentUser,
      role: effectiveRole,
      school:
        effectiveRole === 'teacher'
          ? selectedSchoolForTeacher === 'all'
            ? currentUser.school
            : selectedSchoolForTeacher
          : currentUser.school,
    };
  }, [currentUser, effectiveRole, selectedSchoolForTeacher]);

  const hoaBinhKey = normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH');

  // Load Initial & Live Data
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [sumData, schoolsData] = await Promise.all([
        apiService.getSystemSummary(authUser),
        apiService.getSchools(authUser),
      ]);
      setSummary(sumData);
      setSchools(schoolsData);

      const targetSchool =
        selectedSchool === 'all' || schoolsData.some((s) => normalizeSchoolKey(s.schoolName) === normalizeSchoolKey(selectedSchool))
          ? selectedSchool
          : 'all';
      if (targetSchool !== selectedSchool) setSelectedSchool(targetSchool);

      const classesData = await apiService.getClassesBySchool(targetSchool, authUser);
      setClasses(classesData);

      const targetClass =
        selectedClass === 'all' || classesData.some((c) => c.className === selectedClass)
          ? selectedClass
          : 'all';
      if (targetClass !== selectedClass) setSelectedClass(targetClass);

      const studentsData = await apiService.getStudentsByClass(targetSchool, targetClass, authUser);
      setStudents(studentsData);
      setSelectedStudentDossier((prev) => {
        if (!prev) return null;
        return studentsData.find((s) => s.studentId === prev.studentId || s.studentCode === prev.studentCode) || prev;
      });

      // Load SKKN analytics
      const skknRes = await apiService.getSKKNAnalytics(skknFilters);
      setSkknData(skknRes);

      // Load attempts
      const attemptsData = await apiService.getAttempts(skknFilters, authUser);
      setAttempts(attemptsData);
    } catch (err) {
      console.error('Error loading multi-school stats:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, [effectiveRole, selectedSchoolForTeacher]);

  // Live updates from Firestore listener without resetting filters, tabs, or open modals
  useEffect(() => {
    let timer: number | null = null;
    const unsub = apiService.subscribeToDataChanges(() => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        loadData(true);
      }, 250);
    });
    return () => {
      unsub();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [effectiveRole, selectedSchoolForTeacher, selectedSchool, selectedClass, skknFilters]);

  // Reload SKKN data when Area 4 filters change
  useEffect(() => {
    let active = true;
    apiService
      .getSKKNAnalytics(skknFilters)
      .then((res) => {
        if (active) setSkknData(res);
      })
      .catch((err) => console.warn('SKKN filter reload warning:', err));
    return () => {
      active = false;
    };
  }, [skknFilters]);

  // School Selection
  const handleSelectSchool = async (schName: string) => {
    setSelectedSchool(schName);
    setSelectedClass('all');
    setStudentFilterClass('all');
    try {
      const classesData = await apiService.getClassesBySchool(schName, authUser);
      setClasses(classesData);
      const studentsData = await apiService.getStudentsByClass(schName, 'all', authUser);
      setStudents(studentsData);
    } catch (err) {
      console.error(err);
    }
  };

  // Class Selection
  const handleSelectClass = async (clsName: string, overrideSchool?: string) => {
    setSelectedClass(clsName);
    const targetSch = overrideSchool || selectedSchool;
    try {
      const studentsData = await apiService.getStudentsByClass(targetSch, clsName, authUser);
      setStudents(studentsData);
    } catch (err) {
      console.error(err);
    }
  };

  // Password Reset for a Student (generates a fresh private random 6-char password)
  const handleResetPassword = async (studentId: string) => {
    try {
      const res = await apiService.resetStudentPassword(studentId);
      setPasswordResetFeedback(
        isEn
          ? `New private password for ${res.studentName} (${res.studentCode}): ${res.newPassword}`
          : `Đã cấp mật khẩu mới riêng cho ${res.studentName} (${res.studentCode}): ${res.newPassword}`
      );
      setTimeout(() => setPasswordResetFeedback(null), 10000);
    } catch (err: any) {
      setPasswordResetFeedback(
        err.message || (isEn ? 'Failed to reset password.' : 'Không thể đặt lại mật khẩu.')
      );
    }
  };

  // Handle Excel Import parsing
  const handleParseImportText = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    const parsed: any[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[\t,;]/).map((p) => p.trim());
      if (parts.length >= 1 && parts[0]) {
        // Formats: [Code, Name, DOB, Gender] or [Name, DOB, Gender] or [Name]
        let code = '';
        let name = '';
        let dateOfBirth = '';
        let gender = 'Nam';

        if (parts[0].match(/^(HB|CL|HL|\d|HS)/i) && parts.length > 1) {
          code = parts[0];
          name = parts[1];
          dateOfBirth = parts[2] || '';
          gender = parts[3] || 'Nam';
        } else {
          name = parts[0];
          code = `HB-${importClass}-${String(idx + 1).padStart(2, '0')}`;
          dateOfBirth = parts[1] || '';
          gender = parts[2] || 'Nam';
        }

        if (name && !name.toLowerCase().includes('họ và tên') && !name.toLowerCase().includes('ho ten') && !name.toLowerCase().includes('full name')) {
          parsed.push({ code, name, dateOfBirth, gender, className: importClass, school: selectedSchool });
        }
      }
    });

    setImportPreview(parsed);
  };

  // Handle File Upload for Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const parsed: any[] = [];
        data.forEach((row, idx) => {
          if (!row || row.length === 0) return;
          const strRow = row.map((c) => String(c || '').trim());
          const nameCandidate = strRow.find((c) => c.length > 2 && !c.match(/^\d+$/) && !c.match(/^(STT|Mã|Lớp|No|Code|Class)/i));
          if (nameCandidate) {
            const code = strRow.find((c) => c.match(/^(HB|CL|HL|HS)/i)) || `HB-${importClass}-${String(idx + 1).padStart(2, '0')}`;
            parsed.push({
              code,
              name: nameCandidate,
              dateOfBirth: strRow[2] || '',
              gender: strRow[3] || 'Nam',
              className: importClass,
              school: selectedSchool,
            });
          }
        });
        setImportPreview(parsed);
      } catch (err) {
        console.error('Error reading Excel file:', err);
        alert(isEn ? 'Cannot read Excel file. Please check format (.xlsx or .csv).' : 'Không thể đọc file Excel. Vui lòng kiểm tra định dạng .xlsx hoặc .csv.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Import
  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    setIsImporting(true);
    setImportSuccessMsg('');
    try {
      const targetImportSchool =
        selectedSchool === 'all' ? (currentUser.school || 'TRƯỜNG THPT HÒA BÌNH') : selectedSchool;
      const res = await apiService.importStudentsToClass(importClass, importPreview, targetImportSchool);
      setImportSuccessMsg(
        res.message ||
          (isEn
            ? `Successfully imported ${res.importedCount} students into class ${importClass}.`
            : `Đã nhập thành công ${res.importedCount} học sinh vào lớp ${importClass}.`)
      );
      loadData();
      setTimeout(() => {
        setShowImportModal(false);
        setImportPreview([]);
        setImportText('');
        setImportSuccessMsg('');
      }, 1800);
    } catch (err: any) {
      alert(err.message || (isEn ? 'Error importing student roster.' : 'Lỗi khi nhập danh sách học sinh.'));
    } finally {
      setIsImporting(false);
    }
  };

  // Client-side Excel Export Helpers
  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isEn ? 'Report' : 'BaoCao');
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filtered Students in Area 3
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchSearch =
        !studentSearchTerm.trim() ||
        st.studentName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        st.studentCode.toLowerCase().includes(studentSearchTerm.toLowerCase());

      const matchType =
        studentFilterType === 'all' ||
        (studentFilterType === 'official' && st.studentType === 'official') ||
        (studentFilterType === 'extended' && st.studentType === 'extended');

      const matchClass =
        studentFilterClass === 'all' || st.className.toUpperCase() === studentFilterClass.toUpperCase();

      return matchSearch && matchType && matchClass;
    });
  }, [students, studentSearchTerm, studentFilterType, studentFilterClass]);

  const formatScore = (num: number) => (typeof num === 'number' ? num.toFixed(1) : '0.0');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isEn
                  ? 'GEOGRAPHY 10 LEARNING MANAGEMENT & ANALYTICS CENTER'
                  : 'TRUNG TÂM QUẢN TRỊ & THỐNG KÊ HỌC TẬP ĐỊA LÍ 10'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isEn
                ? 'Multi-School Learning Analytics & Administration'
                : 'Phân Tích & Quản Trị Học Tập Đa Trường'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isEn
                ? 'Multi-dimensional tracking across 13 chapters, 40 lessons, and 4 question formats. Differentiates Official Students (Ms. Bui Thi Hong Hanh) and Open Learners.'
                : 'Theo dõi và phân tích đa chiều dữ liệu 13 chương, 40 bài học, 4 dạng câu hỏi. Phân định rõ 2 nhóm: Học sinh chính thức (cô Bùi Thị Hồng Hạnh) và Người học mở rộng.'}
            </p>
          </div>

          {/* Teacher Status Box */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isEn ? 'Session Role:' : 'Phiên làm việc:'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {effectiveRole === 'teacher'
                  ? isEn ? 'Teacher Bui Thi Hong Hanh' : 'GV Bùi Thị Hồng Hạnh'
                  : isEn ? 'Student' : 'Học sinh'}
              </span>
            </div>

            {effectiveRole === 'teacher' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">
                  {isEn ? 'School Scope (Dynamic):' : 'Phạm vi trường (Tự động):'}
                </label>
                <select
                  value={selectedSchoolForTeacher}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSchoolForTeacher(val);
                    setSelectedSchool(val);
                    handleSelectSchool(val);
                    setSkknFilters((prev) => ({ ...prev, schoolName: val }));
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="all">
                    {isEn ? `All Schools (${schools.length})` : `Tất cả các trường (${schools.length} trường)`}
                  </option>
                  {schools.map((s) => (
                    <option key={s.schoolName} value={s.schoolName}>
                      {s.schoolName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => loadData(false)}
              disabled={isLoading}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isEn ? 'Refresh Data' : 'Làm mới dữ liệu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation: 4 Independent Areas */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap sm:flex-nowrap gap-1">
        <button
          onClick={() => setActiveArea('schools')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeArea === 'schools'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isEn ? 'Area 1: By School' : 'Khu vực 1: Theo Trường'}</span>
        </button>

        <button
          onClick={() => setActiveArea('classes')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeArea === 'classes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isEn ? 'Area 2: By Class' : 'Khu vực 2: Theo Lớp'}</span>
        </button>

        <button
          onClick={() => setActiveArea('students')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeArea === 'students'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <IdCard className="w-4 h-4" />
          <span>{isEn ? 'Area 3: By Student' : 'Khu vực 3: Theo Học Sinh'}</span>
        </button>

        <button
          onClick={() => setActiveArea('skkn')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeArea === 'skkn'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isEn ? 'Area 4: SKKN Report' : 'Khu vực 4: Báo Cáo SKKN'}</span>
        </button>
      </div>

      {passwordResetFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{passwordResetFeedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHU VỰC 1: THỐNG KÊ THEO TRƯỜNG */}
      {/* ========================================================================= */}
      {activeArea === 'schools' && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">{isEn ? 'Total High Schools' : 'Tổng số trường'}</span>
              <div className="text-2xl font-black font-mono tabular-nums text-slate-900">{schools.length}</div>
              <p className="text-[11px] text-slate-400">{isEn ? 'Auto-detected on platform' : 'Tự động ghi nhận trên hệ thống'}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">{isEn ? 'Official Students' : 'Học sinh chính thức'}</span>
              <div className="text-2xl font-black font-mono tabular-nums text-blue-600">
                {schools.find((s) => normalizeSchoolKey(s.schoolName) === hoaBinhKey)?.studentCount || 0}
              </div>
              <p className="text-[11px] text-slate-400">{isEn ? "Under Ms. Hanh's charge" : 'Lớp cô Hạnh phụ trách'}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">{isEn ? 'Extended Learners' : 'Người học mở rộng'}</span>
              <div className="text-2xl font-black font-mono tabular-nums text-emerald-600">
                {schools.filter((s) => normalizeSchoolKey(s.schoolName) !== hoaBinhKey).reduce((sum, s) => sum + s.studentCount, 0)}
              </div>
              <p className="text-[11px] text-slate-400">{isEn ? 'From partner & new schools' : 'Từ các trường bạn & trường mới'}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">{isEn ? 'System Average Score' : 'Điểm TB toàn hệ thống'}</span>
              <div className="text-2xl font-black font-mono tabular-nums text-amber-600">
                {summary ? `${formatScore(summary.overallAvgScore)}/10` : '...'}
              </div>
              <p className="text-[11px] text-slate-400">
                {isEn ? `Completion rate ${summary?.averageCompletionRate || 0}%` : `Tỉ lệ hoàn thành ${summary?.averageCompletionRate || 0}%`}
              </p>
            </div>
          </div>

          {/* School Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>{isEn ? 'List of Participating High Schools' : 'Danh Sách Các Trường THPT Tham Gia Học Tập'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn
                    ? 'Click on any school to inspect its classes and student rosters. New schools entered by students appear automatically.'
                    : 'Bấm vào từng trường để xem chi tiết các lớp và học sinh. Trường mới do học sinh nhập sẽ tự động cập nhật tại đây.'}
                </p>
              </div>
              <button
                onClick={() => exportToExcel(schools, isEn ? 'Schools_Report' : 'Bao_Cao_Theo_Truong')}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? 'Export Schools Excel' : 'Xuất Excel Báo Cáo Trường'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-y border-slate-200">
                    <th className="py-3 px-4">{isEn ? 'High School Name' : 'Tên trường THPT'}</th>
                    <th className="py-3 px-4">{isEn ? 'Locality / Area' : 'Địa bàn'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Classes' : 'Số lớp'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Students' : 'Số học sinh'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Attempts' : 'Lượt làm bài'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Avg Score' : 'Điểm TB'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Pass Rate' : 'Tỉ lệ đạt'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'Action' : 'Thao tác'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.map((sch) => {
                    const isOfficial = normalizeSchoolKey(sch.schoolName) === hoaBinhKey;
                    return (
                      <tr key={sch.schoolName} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{sch.schoolName}</span>
                            {isOfficial && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                                {isEn ? 'Official Unit (Ms. Hanh)' : 'Đơn vị chính thức (Cô Hạnh)'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{isEn ? 'Code' : 'Mã'}: {sch.code || 'THPT'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {sch.commune && sch.province ? `${sch.commune}, ${sch.province}` : (sch.province || sch.commune || '—')}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800">{sch.classCount}</td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800">{sch.studentCount}</td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-semibold text-slate-600">{sch.attemptCount}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono tabular-nums font-black text-amber-600">{formatScore(sch.avgScore)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono tabular-nums font-bold text-emerald-600">{sch.completionRate}%</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              handleSelectSchool(sch.schoolName);
                              setActiveArea('classes');
                            }}
                            className="py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isEn ? 'View Classes' : 'Xem các lớp'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHU VỰC 2: THỐNG KÊ THEO LỚP */}
      {/* ========================================================================= */}
      {activeArea === 'classes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  {isEn ? 'Selected School:' : 'Đang chọn trường:'}{' '}
                  <strong className="text-blue-900">
                    {selectedSchool === 'all'
                      ? (isEn ? 'All Participating Schools' : 'Tất cả các trường')
                      : selectedSchool}
                  </strong>
                </div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>{isEn ? 'Classes & Participation Overview' : 'Danh Sách Lớp Học & Tình Hình Tham Gia'}</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isEn ? 'Import Student Roster (Excel)' : 'Nhập danh sách học sinh (Excel)'}</span>
                </button>
                <button
                  onClick={() =>
                    exportToExcel(
                      classes,
                      isEn ? `Class_Report_${selectedSchool}` : `Bao_Cao_Lop_${selectedSchool}`
                    )
                  }
                  className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? 'Export Classes Excel' : 'Xuất Excel Báo Cáo Lớp'}</span>
                </button>
              </div>
            </div>

            {/* School Selector inside Class Area */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-500 font-semibold shrink-0">{isEn ? 'Select school:' : 'Chọn trường:'}</span>
              <button
                onClick={() => handleSelectSchool('all')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedSchool === 'all'
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isEn ? 'All Schools' : 'Tất cả các trường'}
              </button>
              {schools.map((sch) => (
                <button
                  key={sch.schoolName}
                  onClick={() => handleSelectSchool(sch.schoolName)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedSchool === sch.schoolName
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sch.schoolName}
                </button>
              ))}
            </div>

            {/* Classes Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-y border-slate-200">
                    <th className="py-3 px-4">{isEn ? 'Class' : 'Lớp học'}</th>
                    {selectedSchool === 'all' && <th className="py-3 px-4">{isEn ? 'High School' : 'Trường'}</th>}
                    <th className="py-3 px-4">{isEn ? 'Lead Teacher' : 'Giáo viên phụ trách'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Students' : 'Sĩ số'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Active' : 'Đã làm bài'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Participation' : 'Tỉ lệ tham gia'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Attempts' : 'Số lượt làm'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Avg Score' : 'Điểm TB'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Pass Rate' : 'Tỉ lệ đạt'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'Action' : 'Thao tác'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map((cls) => {
                    const isHanhClass =
                      normalizeSchoolKey(cls.schoolName) === hoaBinhKey && ['10A1', '10A2', '10A3'].includes(cls.className);
                    const activeCount = cls.activeStudentCount ?? 0;
                    const participationPct =
                      cls.studentCount > 0 ? Math.min(100, Math.round((activeCount / cls.studentCount) * 100)) : 0;

                    return (
                      <tr key={`${cls.schoolName}::${cls.className}`} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{cls.className}</span>
                            {isHanhClass && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {isEn ? "Ms. Hanh's Class" : 'Lớp cô Hạnh'}
                              </span>
                            )}
                          </div>
                        </td>
                        {selectedSchool === 'all' && (
                          <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">{cls.schoolName}</td>
                        )}
                        <td className="py-3.5 px-4 text-slate-600">
                          {isHanhClass ? 'Bùi Thị Hồng Hạnh' : (isEn ? 'Subject Teacher' : 'Giáo viên bộ môn')}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800">{cls.studentCount}</td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-blue-600">{activeCount}</td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-emerald-600">{participationPct}%</td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-semibold text-slate-600">{cls.attemptCount}</td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-black text-amber-600">{formatScore(cls.avgScore)}</td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-emerald-600">{cls.completionRate}%</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedSchool(cls.schoolName);
                              handleSelectClass(cls.className, cls.schoolName);
                              setStudentFilterClass(cls.className);
                              setActiveArea('students');
                            }}
                            className="py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isEn ? 'View Students' : 'Xem danh sách HS'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHU VỰC 3: HỒ SƠ & THEO DÕI TỪNG HỌC SINH */}
      {/* ========================================================================= */}
      {activeArea === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  <span>
                    {isEn
                      ? `Student Profiles & Management (${filteredStudents.length} students)`
                      : `Hồ Sơ & Quản Trị Học Sinh (${filteredStudents.length} học sinh)`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn
                    ? 'Inspect 13 chapters, 40 lessons, 4 formats diagnostics, knowledge gaps, and reset student credentials.'
                    : 'Xem chi tiết kết quả 13 chương, 40 bài, 4 dạng câu hỏi, lỗ hổng kiến thức và cấp lại mật khẩu cho học sinh.'}
                </p>
              </div>
              <button
                onClick={() =>
                  exportToExcel(
                    filteredStudents,
                    isEn ? `Student_List_${selectedSchool}` : `Danh_Sach_Hoc_Sinh_${selectedSchool}`
                  )
                }
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? 'Export Students Excel' : 'Xuất Excel Danh Sách Học Sinh'}</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  placeholder={isEn ? 'Search by Student ID or Full Name...' : 'Tìm theo Mã HS hoặc Họ tên...'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 shrink-0">{isEn ? 'School:' : 'Trường:'}</span>
                <select
                  value={selectedSchool}
                  onChange={(e) => handleSelectSchool(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">{isEn ? 'All Schools' : 'Tất cả các trường'}</option>
                  {schools.map((s) => (
                    <option key={s.schoolName} value={s.schoolName}>
                      {s.schoolName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 shrink-0">{isEn ? 'Cohort:' : 'Phân loại:'}</span>
                <select
                  value={studentFilterType}
                  onChange={(e: any) => setStudentFilterType(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">{isEn ? 'All Learner Cohorts' : 'Tất cả nhóm người học'}</option>
                  <option value="official">{isEn ? 'Official Students (Ms. Hanh)' : 'Học sinh chính thức (cô Hạnh)'}</option>
                  <option value="extended">{isEn ? 'Extended Learners' : 'Người học mở rộng'}</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 shrink-0">{isEn ? 'Class:' : 'Lớp:'}</span>
                <select
                  value={studentFilterClass}
                  onChange={(e) => setStudentFilterClass(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">{isEn ? 'All Classes' : 'Tất cả các lớp'}</option>
                  {Array.from(new Set(classes.map((c) => c.className))).sort().map((clsName) => (
                    <option key={clsName} value={clsName}>
                      {isEn ? `Class ${clsName}` : `Lớp ${clsName}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-y border-slate-200">
                    <th className="py-3 px-4">{isEn ? 'Student ID / Login' : 'Mã HS / Tên đăng nhập'}</th>
                    <th className="py-3 px-4">{isEn ? 'Student Full Name' : 'Họ và tên'}</th>
                    <th className="py-3 px-4">{isEn ? 'School' : 'Trường'}</th>
                    <th className="py-3 px-4">{isEn ? 'Category' : 'Phân loại'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Class' : 'Lớp'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Status' : 'Trạng thái'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Attempts' : 'Lượt làm'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Avg Score' : 'Điểm TB'}</th>
                    <th className="py-3 px-4 text-right">{isEn ? 'Actions' : 'Thao tác'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st.studentId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                        {st.studentCode || st.username}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{st.studentName}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{st.schoolName}</td>
                      <td className="py-3.5 px-4">
                        {st.studentType === 'official' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                            {isEn ? 'Official (Ms. Hanh)' : 'Chính thức (Cô Hạnh)'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {isEn ? 'Extended' : 'Mở rộng'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{st.className}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {isEn ? 'Active' : 'Đã kích hoạt'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{st.attemptCount}</td>
                      <td className="py-3.5 px-4 text-center font-black text-amber-600">{formatScore(st.avgScore)}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedStudentDossier(st)}
                          className="py-1 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Dossier' : 'Hồ sơ chi tiết'}</span>
                        </button>
                        <button
                          onClick={() => handleResetPassword(st.studentId)}
                          className="py-1 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          title={isEn ? 'Generate a new random password' : 'Cấp mật khẩu mới ngẫu nhiên'}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{isEn ? 'New Pass' : 'Cấp MK mới'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHU VỰC 4: TOÀN HỆ THỐNG & BÁO CÁO SKKN */}
      {/* ========================================================================= */}
      {activeArea === 'skkn' && skknData && (
        <div className="space-y-6">
          {/* Segregated 3-Group Comparison Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{isEn ? 'PEDAGOGICAL INNOVATION EMPIRICAL DATA (SKKN)' : 'ĐỐI CHỨNG DỮ LIỆU SÁNG KIẾN KINH NGHIỆM'}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {isEn
                    ? 'Three-Group Comparative Matrix: Official vs Extended vs Overall System'
                    : 'Đối Chiếu 3 Nhóm Người Học: Chính Thức vs Mở Rộng vs Toàn Hệ Thống'}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={skknFilters.schoolName}
                  onChange={(e) => setSkknFilters((prev) => ({ ...prev, schoolName: e.target.value }))}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">{isEn ? 'All Schools' : 'Tất cả các trường'}</option>
                  {schools.map((s) => (
                    <option key={s.schoolName} value={s.schoolName}>
                      {s.schoolName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => window.print()}
                  className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>{isEn ? 'Print SKKN Report (PDF)' : 'In Báo Cáo SKKN (PDF)'}</span>
                </button>
                <button
                  onClick={() =>
                    exportToExcel(
                      (skknData.efficacyComparison || []).map((row: any) => {
                        const r = localizeSknnEfficacyRow(row, language);
                        return isEn
                          ? {
                              Indicator: r.metric,
                              'Pre Web App': r.preWebApp,
                              'Post Web App': r.postWebApp,
                              'Growth (Δ)': r.growth,
                              Significance: r.significance,
                            }
                          : r;
                      }),
                      isEn ? 'SKKN_Efficacy_Report' : 'Bao_Cao_SKKN_Hieu_Qua'
                    )
                  }
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isEn ? 'Export SKKN Excel' : 'Xuất Excel SKKN'}</span>
                </button>
              </div>
            </div>

            {/* 3 Columns Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group 1: Official */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase">{isEn ? 'Official Students' : 'Học sinh chính thức'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">{isEn ? "Ms. Hanh's Classes" : 'Lớp cô Hạnh'}</span>
                </div>
                <div className="text-3xl font-black text-blue-900">{skknData.officialStats.avgScore}/10</div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between"><span>{isEn ? 'Students:' : 'Số học sinh:'}</span><strong>{skknData.officialStats.studentCount} {isEn ? 'students' : 'HS'}</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Attempts:' : 'Số lượt làm bài:'}</span><strong>{skknData.officialStats.attemptCount} {isEn ? 'sessions' : 'lượt'}</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Good/Excellence (≥8.0):' : 'Tỉ lệ Giỏi (≥8.0):'}</span><strong className="text-blue-700">{skknData.officialStats.goodRate}%</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Standard Pass (≥5.0):' : 'Tỉ lệ Đạt chuẩn (≥5.0):'}</span><strong className="text-emerald-700">{skknData.officialStats.passRate}%</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Overall Accuracy:' : 'Tỉ lệ làm đúng chung:'}</span><strong>{skknData.officialStats.accuracy}%</strong></div>
                </div>
              </div>

              {/* Group 2: Extended */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase">{isEn ? 'Extended Learners' : 'Người học mở rộng'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">{isEn ? 'Partner Schools' : 'Trường khác'}</span>
                </div>
                <div className="text-3xl font-black text-emerald-900">{skknData.extendedStats.avgScore}/10</div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between"><span>{isEn ? 'Students:' : 'Số học sinh:'}</span><strong>{skknData.extendedStats.studentCount} {isEn ? 'students' : 'HS'}</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Attempts:' : 'Số lượt làm bài:'}</span><strong>{skknData.extendedStats.attemptCount} {isEn ? 'sessions' : 'lượt'}</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Good/Excellence (≥8.0):' : 'Tỉ lệ Giỏi (≥8.0):'}</span><strong className="text-emerald-700">{skknData.extendedStats.goodRate}%</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Standard Pass (≥5.0):' : 'Tỉ lệ Đạt chuẩn (≥5.0):'}</span><strong className="text-emerald-700">{skknData.extendedStats.passRate}%</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Overall Accuracy:' : 'Tỉ lệ làm đúng chung:'}</span><strong>{skknData.extendedStats.accuracy}%</strong></div>
                </div>
              </div>

              {/* Group 3: System */}
              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">{isEn ? 'Full System' : 'Toàn hệ thống'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-white">{isEn ? 'Aggregated' : 'Tổng hợp'}</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{skknData.systemStats.avgScore}/10</div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between"><span>{isEn ? 'Students:' : 'Số học sinh:'}</span><strong>{skknData.systemStats.studentCount} {isEn ? 'students' : 'HS'}</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Attempts:' : 'Số lượt làm bài:'}</span><strong>{skknData.systemStats.attemptCount} {isEn ? 'sessions' : 'lượt'}</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Good/Excellence (≥8.0):' : 'Tỉ lệ Giỏi (≥8.0):'}</span><strong>{skknData.systemStats.goodRate}%</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Standard Pass (≥5.0):' : 'Tỉ lệ Đạt chuẩn (≥5.0):'}</span><strong className="text-emerald-700">{skknData.systemStats.passRate}%</strong></div>
                  <div className="flex justify-between"><span>{isEn ? 'Overall Accuracy:' : 'Tỉ lệ làm đúng chung:'}</span><strong>{skknData.systemStats.accuracy}%</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-test vs Post-test Scientific Efficacy Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>{isEn ? 'Experimental Pre-test vs Post-test Empirical Validation Matrix' : 'Bảng Đối Chứng Hiệu Quả Thực Nghiệm Trước & Sau Khi Ứng Dụng Web App'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEn
                  ? 'Scientific evidence supporting the Pedagogical Innovation (SKKN) report by Teacher Bui Thi Hong Hanh (Dept of History - Geography - Law, Hoa Binh High School).'
                  : 'Minh chứng khoa học phục vụ báo cáo Sáng kiến kinh nghiệm của cô giáo Bùi Thị Hồng Hạnh (Tổ Sử - Địa - GDKTPL, THPT Hòa Bình).'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-y border-slate-200">
                    <th className="py-3 px-4">{isEn ? 'Pedagogical Competency Indicator' : 'Chỉ số năng lực chuyên môn'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Before Web App Adoption' : 'Trước khi áp dụng Web App'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'After Web App Adoption' : 'Sau khi áp dụng Web App'}</th>
                    <th className="py-3 px-4 text-center">{isEn ? 'Growth Index (Δ)' : 'Mức độ tăng trưởng (Δ)'}</th>
                    <th className="py-3 px-4">{isEn ? 'Pedagogical Significance for SKKN' : 'Ý nghĩa sư phạm đối với SKKN'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skknData.efficacyComparison.map((rawRow: any, i: number) => {
                    const row = localizeSknnEfficacyRow(rawRow, language);
                    return (
                      <tr key={i} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.metric}</td>
                        <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{row.preWebApp}</td>
                        <td className="py-3.5 px-4 text-center text-blue-700 font-black">{row.postWebApp}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{row.growth}</td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">{row.significance}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Knowledge Units Gap & Student Recognition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Lessons / Knowledge Gaps */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{isEn ? 'Knowledge Gap Alerts (Prioritize for Classroom Revision)' : 'Cảnh Báo Lỗ Hổng Kiến Thức (Cần Ôn Tập Trên Lớp)'}</span>
              </h4>
              <p className="text-xs text-slate-500">{isEn ? 'Lessons with lowest accuracy rates:' : 'Các bài học có tỉ lệ làm đúng thấp nhất:'}</p>
              <div className="space-y-2">
                {skknData.weakLessons.map((l: any) => {
                  const lessonObj = LESSONS.find((ls) => ls.id === l.lessonId);
                  const displayLessonTitle = lessonObj
                    ? getLocalizedLesson(lessonObj, language).title
                    : l.lessonTitle;
                  return (
                    <div key={l.lessonId} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-rose-950">{displayLessonTitle}</div>
                      <span className="text-[11px] text-slate-500">{l.attempts} {isEn ? 'attempts' : 'lượt ôn luyện'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-rose-700">{l.accuracy}% {isEn ? 'correct' : 'đúng'}</span>
                      <div className="text-[11px] text-slate-500">{isEn ? 'Avg Score:' : 'Điểm TB:'} {formatScore(l.avgScore)}</div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Top Improving Students */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? 'Top Improving Students (Commended in SKKN)' : 'Học Sinh Có Tiến Bộ Vượt Bậc (Biểu Dương SKKN)'}</span>
              </h4>
              <p className="text-xs text-slate-500">{isEn ? 'Students with the highest score gains across assessments:' : 'Học sinh có điểm số tăng trưởng nhiều nhất qua các bài kiểm tra:'}</p>
              <div className="space-y-2">
                {skknData.topImproving.map((st: any) => (
                  <div key={st.studentId} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-950">{st.studentName}</div>
                      <span className="text-[11px] text-slate-500">{isEn ? `Class ${st.className}` : `Lớp ${st.className}`} • {st.school}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700">+{st.scoreDiff} {isEn ? 'pts' : 'điểm'}</span>
                      <div className="text-[11px] text-slate-500">{isEn ? `From ${st.firstScore} to ${st.latestScore}` : `Từ ${st.firstScore} lên ${st.latestScore}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT PROFILE DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedStudentDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg">
                  {selectedStudentDossier.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedStudentDossier.studentName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{isEn ? 'ID:' : 'Mã:'} <strong className="text-blue-900 font-mono">{selectedStudentDossier.studentCode}</strong></span>
                    <span>·</span>
                    <span>{isEn ? 'Class:' : 'Lớp:'} <strong className="text-slate-900">{selectedStudentDossier.className}</strong></span>
                    <span>·</span>
                    <span>{selectedStudentDossier.schoolName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDossier(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500">{isEn ? 'Practice Attempts' : 'Số lượt luyện'}</span>
                <div className="text-xl font-black text-slate-900">{selectedStudentDossier.attemptCount}</div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[11px] text-blue-700">{isEn ? 'Avg Score' : 'Điểm TB'}</span>
                <div className="text-xl font-black text-blue-700">{formatScore(selectedStudentDossier.avgScore)}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-700">{isEn ? 'Highest Score' : 'Điểm cao nhất'}</span>
                <div className="text-xl font-black text-emerald-700">{formatScore(selectedStudentDossier.highestScore)}</div>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-[11px] text-purple-700">{isEn ? 'Completion Rate' : 'Tỉ lệ hoàn thành'}</span>
                <div className="text-xl font-black text-purple-700">{selectedStudentDossier.completionRate}%</div>
              </div>
            </div>

            {/* Questions Answered Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>{isEn ? 'Total questions answered:' : 'Tổng số câu hỏi đã trả lời:'}</span>
                <strong className="text-sm font-mono tabular-nums text-blue-900">{selectedStudentDossier.totalQuestionsAnswered} {isEn ? 'questions' : 'câu'}</strong>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums">
                <span className="text-emerald-700 font-semibold">{isEn ? 'Correct:' : 'Đúng:'} {selectedStudentDossier.correctAnswersCount} {isEn ? 'q' : 'câu'}</span>
                <span>·</span>
                <span className="text-rose-700 font-semibold">{isEn ? 'Wrong:' : 'Sai:'} {selectedStudentDossier.wrongAnswersCount} {isEn ? 'q' : 'câu'}</span>
                {(selectedStudentDossier.unansweredAnswersCount ?? 0) > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-amber-700 font-semibold">{isEn ? 'Unanswered:' : 'Chưa trả lời:'} {selectedStudentDossier.unansweredAnswersCount} {isEn ? 'q' : 'câu'}</span>
                  </>
                )}
                <span>·</span>
                <span>{isEn ? 'Accuracy rate:' : 'Tỉ lệ chính xác:'} {selectedStudentDossier.totalQuestionsAnswered > 0 ? ((selectedStudentDossier.correctAnswersCount / selectedStudentDossier.totalQuestionsAnswered) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>

            {/* Weak Topics */}
            {selectedStudentDossier.weakTopics && selectedStudentDossier.weakTopics.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isEn ? 'Knowledge areas needing reinforcement:' : 'Mạch kiến thức cần củng cố:'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudentDossier.weakTopics.map((wt, i) => {
                    const topicObj = TOPICS.find((t) => t.id === wt);
                    return (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-semibold border border-rose-200">
                        {topicObj ? getLocalizedTopic(topicObj, language).title : wt}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => handleResetPassword(selectedStudentDossier.studentId)}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isEn ? 'Generate New Password' : 'Cấp mật khẩu mới ngẫu nhiên'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isEn ? 'Print Student Profile' : 'In phiếu hồ sơ học sinh'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXCEL IMPORT MODAL */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>{isEn ? 'Import Official Student Roster from Excel' : 'Nhập Danh Sách Học Sinh Chính Thức Từ Excel'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isEn
                    ? 'Bulk account provisioning for classes of Ms. Bui Thi Hong Hanh (Hoa Binh High School).'
                    : 'Cấp tài khoản hàng loạt cho các lớp cô Bùi Thị Hồng Hạnh (THPT Hòa Bình).'}
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <label className="font-bold text-slate-700">{isEn ? 'Target class:' : 'Lớp cần nhập:'}</label>
                <select
                  value={importClass}
                  onChange={(e) => setImportClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="10A1">{isEn ? 'Class 10A1' : 'Lớp 10A1'}</option>
                  <option value="10A2">{isEn ? 'Class 10A2' : 'Lớp 10A2'}</option>
                  <option value="10A3">{isEn ? 'Class 10A3' : 'Lớp 10A3'}</option>
                  <option value="10A4">{isEn ? 'Class 10A4' : 'Lớp 10A4'}</option>
                </select>
                <span className="text-slate-400 text-[11px]">({isEn ? 'School' : 'Trường'}: {selectedSchool})</span>
              </div>

              {/* Upload file or paste text */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-700">{isEn ? 'Method 1: Upload Excel file (.xlsx or .csv)' : 'Cách 1: Tải lên file Excel (.xlsx hoặc .csv)'}</div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-700">{isEn ? 'Method 2: Copy & Paste directly from Excel table' : 'Cách 2: Sao chép & Dán trực tiếp từ bảng Excel'}</div>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Paste rows from Excel here (e.g. HB-1010 [Tab] Trieu Van Hung [Tab] 15/04/2010 [Tab] Nam)'
                      : 'Dán các dòng từ Excel vào đây (Ví dụ: HB-1010 [Tab] Triệu Văn Hùng [Tab] 15/04/2010 [Tab] Nam)'
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleParseImportText}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
                >
                  {isEn ? 'Process pasted data' : 'Xử lý dữ liệu đã dán'}
                </button>
              </div>

              {/* Preview Table */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{isEn ? `Preview roster (${importPreview.length} students):` : `Xem trước danh sách (${importPreview.length} học sinh):`}</span>
                    <span className="text-slate-500 text-[11px]">{isEn ? 'Private random password per student' : 'Cấp mật khẩu riêng từng học sinh'}</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold">
                        <tr>
                          <th className="p-2">{isEn ? 'Student ID' : 'Mã HS'}</th>
                          <th className="p-2">{isEn ? 'Full Name' : 'Họ và tên'}</th>
                          <th className="p-2">{isEn ? 'Class' : 'Lớp'}</th>
                          <th className="p-2">{isEn ? 'Gender' : 'Giới tính'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.map((p, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono font-bold text-blue-900">{p.code}</td>
                            <td className="p-2 font-semibold text-slate-900">{p.name}</td>
                            <td className="p-2 text-slate-600">{p.className}</td>
                            <td className="p-2 text-slate-600">{p.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Hủy bỏ'}
              </button>
              <button
                type="button"
                disabled={isImporting || importPreview.length === 0}
                onClick={handleExecuteImport}
                className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isImporting ? (isEn ? 'Importing...' : 'Đang nhập...') : isEn ? `Create ${importPreview.length} accounts` : `Tạo ${importPreview.length} tài khoản`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
