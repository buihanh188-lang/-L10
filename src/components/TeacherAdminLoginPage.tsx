import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  School,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Lock,
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

  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Purge any legacy saved local credentials from earlier versions
  useEffect(() => {
    try {
      localStorage.removeItem('dia_li_10_saved_admin_creds');
    } catch {
      // ignore
    }
  }, []);

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
            ? 'Google authentication failed. Only the authorized teacher account (buihanh188@gmail.com) can access this portal.'
            : 'Xác thực Google không thành công. Chỉ duy nhất Gmail giáo viên quản trị (buihanh188@gmail.com) mới được phép truy cập.')
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

          {/* Strict Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {isEn
                ? 'Strictly protected by Google Authentication. Only Ms. Bui Thi Hong Hanh’s verified Gmail account can sign in. Students cannot access this portal.'
                : 'Khu vực bảo mật tuyệt đối bằng xác thực Google. Chỉ duy nhất Gmail cá nhân của cô Bùi Thị Hồng Hạnh mới được phép vào. Học sinh không thể truy cập.'}
            </span>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Google-Only Verified Teacher Sign-In */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleTeacherLogin}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-800 text-white text-sm font-extrabold shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span>
              {isSubmitting
                ? isEn
                  ? 'VERIFYING GOOGLE ACCOUNT...'
                  : 'ĐANG XÁC THỰC GOOGLE...'
                : isEn
                  ? 'SIGN IN WITH TEACHER GOOGLE ACCOUNT'
                  : 'ĐĂNG NHẬP QUẢN TRỊ BẰNG GOOGLE'}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          {/* Security feature note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEn ? 'Google + Firebase Security:' : 'Bảo mật xác thực Google + Firebase:'}</span>
            </div>
            <p className="leading-relaxed">
              {isEn
                ? 'No password is stored or pre-filled in the browser. Access is verified directly by Google Identity and Firebase Security Rules.'
                : 'Không lưu hay điền sẵn mật khẩu trên trình duyệt. Quyền quản trị được xác thực trực tiếp qua Google và quy tắc bảo mật Firebase.'}
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
