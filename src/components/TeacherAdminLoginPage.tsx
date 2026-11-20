import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  School,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { UserProfile } from '../types';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';
import { useLanguage, LanguageSwitcher } from '../contexts/LanguageContext';

interface TeacherAdminLoginPageProps {
  onLoginSuccess: (teacher: UserProfile) => void;
  onExitToStudent: () => void;
}

export const TeacherAdminLoginPage: React.FC<TeacherAdminLoginPageProps> = ({
  onLoginSuccess,
  onExitToStudent,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAdminAccount, setHasAdminAccount] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    apiService
      .getTeacherSystemStatus()
      .then((status) => {
        if (mounted) {
          setHasAdminAccount(Boolean(status.hasAdminAccount));
        }
      })
      .catch(() => {
        if (mounted) setHasAdminAccount(false);
      });

    // Auto-load remembered credentials or prefill default for teacher
    try {
      const saved = localStorage.getItem('dia_li_10_saved_admin_creds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.password) setPassword(parsed.password);
        setRememberMe(true);
      } else {
        setUsername('buihanh188');
        setPassword('CoHanh@DiaLi10');
      }
    } catch {
      setUsername('buihanh188');
      setPassword('CoHanh@DiaLi10');
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();
    if (!cleanUser || !cleanPass) {
      setLoginError(
        isEn
          ? 'Please enter both username and password.'
          : 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.'
      );
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      const result = await apiService.teacherLogin(cleanUser, cleanPass);
      if (rememberMe) {
        try {
          localStorage.setItem(
            'dia_li_10_saved_admin_creds',
            JSON.stringify({ username: cleanUser, password: cleanPass })
          );
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem('dia_li_10_saved_admin_creds');
        } catch (e) {}
      }
      StorageService.setCurrentUser(result.user);
      onLoginSuccess(result.user);
    } catch (err: any) {
      setLoginError(
        err?.message ||
          (isEn
            ? 'Incorrect username or password. Please verify your credentials.'
            : 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleTeacherLogin = async () => {
    setIsSubmitting(true);
    setLoginError('');
    try {
      const result = await apiService.teacherLoginWithGoogle();
      StorageService.setCurrentUser(result.user);
      onLoginSuccess(result.user);
    } catch (err: any) {
      setLoginError(
        err?.message ||
          (isEn
            ? 'Google sign-in failed. Please select your teacher Gmail account (buihanh188@gmail.com).'
            : 'Đăng nhập Google không thành công. Cô vui lòng chọn đúng Gmail giáo viên (buihanh188@gmail.com).')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full pt-4 pb-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/25 border border-white/20">
            {isEn ? 'GEO' : 'ĐL'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {isEn ? 'GEOGRAPHY 10' : 'ĐỊA LÍ 10'}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {isEn ? 'KNOWLEDGE MASTERY' : 'CHINH PHỤC TRI THỨC'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isEn
                ? 'Connecting Knowledge Series – 2018 General Education Curriculum'
                : 'Bộ sách Kết nối tri thức với cuộc sống – Chương trình GDPT 2018'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <button
            onClick={onExitToStudent}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? 'Back to Student Area' : 'Về trang học sinh'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="max-w-md mx-auto w-full py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-white/40 space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-700/30">
              <KeyRound className="w-7 h-7 text-amber-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {isEn ? 'TEACHER MANAGEMENT' : 'QUẢN TRỊ GIÁO VIÊN – THPT HÒA BÌNH'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn
                ? 'Geography 10 Professional Administration & Student Monitoring Portal'
                : 'Cổng Quản Trị Chuyên Môn & Theo Dõi Học Tập Bộ Môn Địa Lí 10'}
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <School className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                {isEn
                  ? 'Teacher: Bui Thi Hong Hanh – Hoa Binh High School (Van Linh, Lang Son)'
                  : 'GV: Bùi Thị Hồng Hạnh – THPT Hòa Bình (Xã Vạn Linh, tỉnh Lạng Sơn)'}
              </span>
            </div>
          </div>

          {/* System Security Notice */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-950 font-medium">
            <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              {isEn
                ? 'Sign in with your teacher Google account (buihanh188@gmail.com) to automatically receive student scores in real time from Firebase Cloud.'
                : 'Đăng nhập bằng tài khoản Google giáo viên (buihanh188@gmail.com) để tự động nhận toàn bộ điểm học sinh đồng bộ trực tiếp từ đám mây Firebase.'}
            </span>
          </div>

          {/* 1-Click Google Cloud Admin Sign-In */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleTeacherLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-emerald-500 text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isEn
                ? 'Sign in with Google (buihanh188@gmail.com)'
                : 'Đăng nhập nhanh bằng Google (Tự động đồng bộ điểm)'}
            </span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase shrink-0">
              {isEn ? 'or use password' : 'hoặc dùng mật khẩu'}
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isEn ? 'Username' : 'Tên đăng nhập'}</span>
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder={isEn ? 'Enter username' : 'Nhập tên đăng nhập'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 bg-white"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isEn ? 'Password' : 'Mật khẩu'}</span>
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder={isEn ? 'Enter password' : 'Nhập mật khẩu'}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember password & Auto-fill */}
            <div className="flex items-center justify-between pt-1 pb-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
                />
                <span>{isEn ? 'Remember credentials' : 'Ghi nhớ mật khẩu'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setUsername('buihanh188');
                  setPassword('CoHanh@DiaLi10');
                  setRememberMe(true);
                  try {
                    localStorage.setItem(
                      'dia_li_10_saved_admin_creds',
                      JSON.stringify({ username: 'buihanh188', password: 'CoHanh@DiaLi10' })
                    );
                  } catch (e) {}
                }}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                title={isEn ? 'Click to auto-fill credentials' : 'Bấm để tự động điền sẵn mật khẩu'}
              >
                <span>{isEn ? 'Auto-fill credentials' : 'Tự điền mật khẩu'}</span>
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-800 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? isEn
                    ? 'AUTHENTICATING ON SERVER...'
                    : 'ĐANG XÁC THỰC MÁY CHỦ...'
                  : isEn
                  ? 'LOG IN TO ADMIN'
                  : 'ĐĂNG NHẬP QUẢN TRỊ'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security feature note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEn ? 'Server Security Mechanism:' : 'Cơ chế bảo mật máy chủ:'}</span>
            </div>
            <p className="leading-relaxed">
              {isEn
                ? 'Credentials are protected with salted SHA-256 on the server. Access authorization is validated using secure 256-bit session tokens.'
                : 'Mật khẩu được mã hóa SHA-256 kết hợp chuỗi ngẫu nhiên (salt 128-bit) trên máy chủ. Quyền truy cập được xác thực bằng khóa phiên 256-bit an toàn.'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-400 border-t border-white/10">
        {isEn
          ? 'Hoa Binh High School – Van Linh Commune, Lang Son Province • Teacher: Ms. Bui Thi Hong Hanh'
          : 'Trường THPT Hòa Bình – Xã Vạn Linh, tỉnh Lạng Sơn • Giáo viên: Cô Bùi Thị Hồng Hạnh'}
      </footer>
    </div>
  );
};

