import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  X,
  ArrowRight,
  School,
  KeyRound,
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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();
    if (!cleanUser || !cleanPass) {
      setError(
        isEn
          ? 'Please enter both username and password.'
          : 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.'
      );
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await apiService.teacherLogin(cleanUser, cleanPass);
      // Update local storage currentUser to authenticated teacher
      StorageService.setCurrentUser(result.user);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
          (isEn
            ? 'Incorrect username or password.'
            : 'Tài khoản hoặc mật khẩu không chính xác.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header with High-Security Theme */}
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
                  ? 'Server-side credential verification required'
                  : 'Yêu cầu mật khẩu chuyên môn từ máy chủ'}
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
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {isEn
              ? 'Restricted Area: Students are not permitted to access.'
              : 'Khu vực bảo mật: Học sinh không được phép truy cập.'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account/Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEn ? 'Username' : 'Tên đăng nhập'}</span>
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder={isEn ? 'Enter username' : 'Nhập tên đăng nhập'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>{isEn ? 'Password' : 'Mật khẩu'}</span>
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder={isEn ? 'Enter password' : 'Nhập mật khẩu'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
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

          {/* Security Policy Information */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? 'System Security Policy' : 'Chính sách bảo mật hệ thống'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {isEn
                ? 'The administrative portal is exclusively reserved for subject teachers with verified credentials. All operations are authenticated and logged securely on the server.'
                : 'Khu vực quản trị chỉ dành riêng cho giáo viên được cấp tài khoản định danh riêng. Mọi yêu cầu truy cập và thao tác đều được kiểm soát và ghi nhận bảo mật trên máy chủ.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {isEn ? 'Cancel / Close' : 'Hủy / Đóng'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md transition hover:scale-102 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? isEn
                    ? 'AUTHENTICATING...'
                    : 'ĐANG XÁC THỰC...'
                  : isEn
                  ? 'LOG IN TO ADMIN'
                  : 'ĐANG NHẬP QUẢN TRỊ'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

