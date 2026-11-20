import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  X,
  ArrowRight,
  KeyRound,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';
import { useLanguage } from '../contexts/LanguageContext';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (teacher: UserProfile) => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const result = await apiService.teacherLoginWithGoogle();
      StorageService.setCurrentUser(result.user);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
          (isEn
            ? 'Google authentication failed. Only the authorized teacher account can access.'
            : 'Đăng nhập Google không thành công. Chỉ duy nhất Gmail giáo viên quản trị mới được phép truy cập.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEn ? 'Teacher Admin Authentication' : 'Xác Thực Quản Trị Giáo Viên'}
              </h2>
              <p className="text-xs text-emerald-100">
                {isEn
                  ? 'Verified Teacher Google Account Required'
                  : 'Yêu cầu xác thực đúng Gmail giáo viên quản trị'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-900 font-medium">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {isEn
              ? 'Restricted Area: Students are not permitted to access.'
              : 'Khu vực bảo mật: Học sinh không được phép truy cập.'}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-extrabold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
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

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? 'Zero-Password Browser Security' : 'Bảo mật xác thực Gmail chính chủ'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {isEn
                ? 'Only the authorized teacher Gmail account (Ms. Bui Thi Hong Hanh) verified by Google can enter this administrative dashboard.'
                : 'Chỉ duy nhất tài khoản Gmail của cô Bùi Thị Hồng Hạnh được Google xác thực mới có thể mở trang quản trị. Học sinh không thể tự đăng nhập.'}
            </p>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {isEn ? 'Close' : 'Đóng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
