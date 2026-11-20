import React, { useState } from 'react';
import {
  CheckCircle2,
  GraduationCap,
  School,
  Sparkles,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  IdCard,
  Lock,
  Globe,
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';
import {
  normalizeClassName,
  normalizeSchoolName,
  normalizeStudentName,
} from '../utils/normalize';
import { useLanguage, LanguageSwitcher } from '../contexts/LanguageContext';

interface StudentWelcomeScreenProps {
  onStart: (user: UserProfile) => void;
}

export const StudentWelcomeScreen: React.FC<StudentWelcomeScreenProps> = ({
  onStart,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Mode: 'official' (Mã HS + Mật khẩu) vs 'extended' (3 ô nhập tự do)
  const [mode, setMode] = useState<'official' | 'extended'>('official');

  // Official student inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Extended learner inputs
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Official Login
  const handleOfficialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError(
        isEn
          ? 'Please enter your Student Code or Username.'
          : 'Vui lòng nhập Mã học sinh hoặc Tên đăng nhập.'
      );
      return;
    }
    if (!cleanPass) {
      setError(
        isEn
          ? 'Please enter your assigned student password.'
          : 'Vui lòng nhập Mật khẩu học sinh do giáo viên cung cấp.'
      );
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await apiService.studentLogin(cleanUser, cleanPass);
      if (res.success && res.user) {
        StorageService.setCurrentUser(res.user);
        StorageService.addStudent(res.user);
        onStart(res.user);
      } else {
        setError(
          isEn
            ? 'Login failed. Please verify your credentials.'
            : 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.'
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          (isEn
            ? 'Incorrect student code or password.'
            : 'Mã học sinh hoặc mật khẩu không chính xác.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Extended Learner Registration
  const handleExtendedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawName = name.trim();
    const rawSchool = school.trim();
    const rawClass = className.trim();

    if (!rawName) {
      setError(
        isEn
          ? 'Please enter your full name.'
          : 'Vui lòng nhập đầy đủ Họ và tên học sinh.'
      );
      return;
    }
    if (!rawSchool) {
      setError(
        isEn
          ? 'Please enter your high school name.'
          : 'Vui lòng nhập Tên trường THPT của bạn.'
      );
      return;
    }
    if (!rawClass) {
      setError(
        isEn
          ? 'Please enter your class (e.g., 10A1, 10A2).'
          : 'Vui lòng nhập Lớp học của bạn (Ví dụ: 10A1, 10A2).'
      );
      return;
    }

    const finalName = normalizeStudentName(rawName);
    const finalSchool = normalizeSchoolName(rawSchool);
    const finalClass = normalizeClassName(rawClass);

    setIsSubmitting(true);
    setError('');

    try {
      const res = await apiService.studentRegisterExtended({
        name: finalName,
        school: finalSchool,
        className: finalClass,
      });

      if (res.success && res.user) {
        StorageService.setCurrentUser(res.user);
        StorageService.addStudent(res.user);
        onStart(res.user);
      } else {
        const studentCode = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
        const fallbackProfile: UserProfile = {
          id: `hs-ext-${Date.now()}`,
          role: 'student',
          studentType: 'extended',
          name: finalName,
          code: studentCode,
          className: finalClass,
          school: finalSchool,
          province: 'TỈNH LẠNG SƠN',
          joinedDate: new Date().toISOString().split('T')[0],
        };
        StorageService.setCurrentUser(fallbackProfile);
        StorageService.addStudent(fallbackProfile);
        onStart(fallbackProfile);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        isEn
          ? 'An error occurred while initializing your session. Please try again.'
          : 'Có lỗi xảy ra khi khởi tạo phiên học tập. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Identity Header */}
      <header className="max-w-5xl mx-auto w-full pt-2 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-900/30 border border-blue-400/20">
              {isEn ? 'GEO' : 'ĐL'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isEn ? 'GEOGRAPHY 10' : 'ĐỊA LÍ 10'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isEn ? 'KNOWLEDGE MASTERY' : 'CHINH PHỤC TRI THỨC'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {isEn
                  ? 'Connecting Knowledge Series – 2018 General Education Curriculum'
                  : 'Bộ sách Kết nối tri thức với cuộc sống – Chương trình GDPT 2018'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="flex items-center gap-2 text-right text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">
                  {isEn
                    ? 'Hoa Binh High School – Van Linh Commune'
                    : 'Trường THPT Hòa Bình – Xã Vạn Linh'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isEn
                    ? 'History – Geography – Law Dept • Teacher: '
                    : 'Tổ Sử – Địa – GDKTPL • GV: '}
                  <strong className="text-amber-400">Bùi Thị Hồng Hạnh</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-4">
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 px-6 sm:px-8 py-6 text-white text-center border-b border-slate-800">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? 'Learning & Assessment System'
                  : 'Hệ Thống Học Tập & Kiểm Tra Đánh Giá'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
              {isEn ? 'START LEARNING SESSION' : 'BẮT ĐẦU PHIÊN HỌC TẬP'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              {isEn
                ? 'Select your method to save personal results, track progress, and view rankings.'
                : 'Lựa chọn phương thức tham gia học tập phù hợp để lưu kết quả và xếp hạng tiến bộ.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="p-2 bg-slate-100 flex items-center gap-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('official');
                setError('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                mode === 'official'
                  ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IdCard className="w-4 h-4 text-blue-600" />
              <span>{isEn ? 'Official Student' : 'Học sinh chính thức'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('extended');
                setError('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                mode === 'extended'
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? 'Open Learner' : 'Người học mở rộng'}</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: OFFICIAL STUDENT LOGIN */}
            {mode === 'official' && (
              <form onSubmit={handleOfficialSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/60 text-xs text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>
                      {isEn
                        ? "Teacher Bui Thi Hong Hanh's Classes (Hoa Binh High School)"
                        : 'Lớp cô Bùi Thị Hồng Hạnh (THPT Hòa Bình)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isEn
                      ? 'Use your personal Student Code and Password issued by your subject teacher to log in.'
                      : 'Sử dụng Mã học sinh và Mật khẩu riêng do giáo viên bộ môn cung cấp để đăng nhập vào học.'}
                  </p>
                </div>

                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{isEn ? 'Student Code / Username' : 'Mã học sinh / Tên đăng nhập'}</span>
                    </span>
                    <span className="text-rose-600 font-bold text-xs">
                      {isEn ? '* Required' : '* Bắt buộc'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={
                      isEn
                        ? 'Enter your assigned student code'
                        : 'Nhập mã học sinh do giáo viên cấp'
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
                    autoFocus
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      <span>{isEn ? 'Password' : 'Mật khẩu học sinh'}</span>
                    </span>
                    <span className="text-rose-600 font-bold text-xs">
                      {isEn ? '* Required' : '* Bắt buộc'}
                    </span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={
                      isEn ? 'Enter your personal password' : 'Nhập mật khẩu cá nhân'
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                {/* Identity Lock Notice */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? 'Official student identification (Full Name, Class, School) is synced with teacher Bui Thi Hong Hanh gradebook to ensure academic integrity.'
                      : 'Học sinh chính thức được cố định thông tin định danh (Họ tên, Lớp, Trường) theo danh sách sổ điểm điện tử của cô Bùi Thị Hồng Hạnh để đảm bảo tính khách quan của dữ liệu.'}
                  </span>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isSubmitting
                        ? isEn
                          ? 'AUTHENTICATING...'
                          : 'ĐANG XÁC THỰC...'
                        : isEn
                        ? 'LOG IN TO LEARN'
                        : 'ĐĂNG NHẬP VÀO HỌC'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: EXTENDED LEARNER REGISTRATION */}
            {mode === 'extended' && (
              <form onSubmit={handleExtendedSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isEn
                        ? 'For Guest Students & Open Learners'
                        : 'Dành cho học sinh các trường THPT bạn & tự do'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isEn
                      ? 'Enter 3 fields to access all 13 chapters, 40 lessons, 4 question formats, and online examinations.'
                      : 'Nhập 3 thông tin để tham gia đầy đủ 13 chương, 40 bài học, luyện tập 4 dạng câu hỏi và làm đề thi trực tuyến.'}
                  </p>
                </div>

                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>{isEn ? 'Student Full Name' : 'Họ và tên học sinh'}</span>
                    </span>
                    <span className="text-rose-600 font-bold text-xs">
                      {isEn ? '* Required' : '* Bắt buộc'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={
                      isEn
                        ? 'Enter student full name (e.g.: Nguyen Van An)'
                        : 'Nhập họ và tên học sinh (Ví dụ: Nguyễn Văn An)'
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                    autoFocus
                  />
                </div>

                {/* 2. School Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <School className="w-4 h-4 text-emerald-600" />
                      <span>{isEn ? 'High School Name' : 'Tên trường THPT'}</span>
                    </span>
                    <span className="text-rose-600 font-bold text-xs">
                      {isEn ? '* Required' : '* Bắt buộc'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => {
                      setSchool(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={
                      isEn
                        ? 'Enter high school name (e.g.: Chi Lang High School, Huu Lung High School...)'
                        : 'Nhập tên trường THPT (Ví dụ: THPT Chi Lăng, THPT Hữu Lũng...)'
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                {/* 3. Class Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>{isEn ? 'Class' : 'Lớp học'}</span>
                    </span>
                    <span className="text-rose-600 font-bold text-xs">
                      {isEn ? '* Required' : '* Bắt buộc'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => {
                      setClassName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={
                      isEn
                        ? 'Enter class (e.g.: 10A1, 10A2, 10B1...)'
                        : 'Nhập tên lớp học (Ví dụ: 10A1, 10A2, 10B1...)'
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isEn ? 'Open Learner Privileges:' : 'Quyền lợi học tập mở rộng:'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {isEn
                      ? 'Open learners gain full access to the standard 2018 General Education curriculum question bank, store personal learning history, and review ranking progress across the system.'
                      : 'Học sinh mở rộng được tiếp cận toàn bộ ngân hàng câu hỏi chuẩn GDPT 2018, lưu lịch sử học tập cá nhân và đối chiếu tiến bộ trong bảng xếp hạng toàn hệ thống.'}
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isSubmitting
                        ? isEn
                          ? 'INITIALIZING...'
                          : 'ĐANG KHỞI TẠO...'
                        : isEn
                        ? 'START LEARNING NOW'
                        : 'BẮT ĐẦU HỌC TẬP NGAY'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-5xl mx-auto w-full pt-4 pb-2 text-center text-xs text-slate-400">
        <p>
          {isEn
            ? 'Geography 10 Learning & Assessment Application – Connecting Knowledge Series.'
            : 'Ứng dụng học tập và kiểm tra đánh giá môn Địa lí 10 – Kết nối tri thức với cuộc sống.'}
        </p>
        <p className="text-[11px] mt-1 text-slate-500">
          {isEn
            ? 'History – Geography – Law Dept, Hoa Binh High School, Van Linh Commune, Lang Son Province.'
            : 'Tổ Sử – Địa – GDKTPL, Trường THPT Hòa Bình, xã Vạn Linh, tỉnh Lạng Sơn.'}
        </p>
      </footer>
    </div>
  );
};

