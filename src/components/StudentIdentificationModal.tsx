import React, { useState } from 'react';
import { School, User, GraduationCap, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';
import {
  normalizeClassName,
  normalizeSchoolName,
  normalizeStudentName,
} from '../utils/normalize';
import { useLanguage } from '../contexts/LanguageContext';

interface StudentIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const StudentIdentificationModal: React.FC<StudentIdentificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [name, setName] = useState(currentUser.name || '');
  const [school, setSchool] = useState(currentUser.school || '');
  const [className, setClassName] = useState(currentUser.className || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawName = name.trim();
    const rawSchool = school.trim();
    const rawClass = className.trim();

    if (!rawName) {
      setError(
        isEn
          ? 'Please enter student full name.'
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
      const updated: UserProfile = {
        ...currentUser,
        name: finalName,
        school: finalSchool,
        className: finalClass,
        code: currentUser.code || `HS-${Math.floor(1000 + Math.random() * 9000)}`,
        role: currentUser.role === 'admin' ? 'admin' : (currentUser.role === 'teacher' ? 'teacher' : 'student'),
      };

      StorageService.setCurrentUser(updated);
      StorageService.addStudent(updated);
      onUpdateUser(updated);

      // Sync to centralized server database
      await apiService.updateProfile({
        name: finalName,
        school: finalSchool,
        className: finalClass,
        code: updated.code,
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError(
        isEn
          ? 'Could not update profile. Please try again.'
          : 'Không thể cập nhật thông tin. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isEn ? 'Update Student Profile' : 'Cập Nhật Thông Tin Học Sinh'}
              </h2>
              <p className="text-xs text-blue-100">
                {isEn
                  ? 'Synchronize profile with tests, exams, and transcripts'
                  : 'Đồng bộ hồ sơ với mọi lượt làm bài, bài kiểm tra và học bạ'}
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

        {/* Form Body - 3 pure text inputs */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {isEn ? 'Student Full Name' : 'Họ và tên học sinh'}{' '}
                <strong className="text-rose-500">*</strong>
              </span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isEn
                  ? 'Enter student full name (e.g. Nguyen Van An)'
                  : 'Nhập họ và tên học sinh (Ví dụ: Nguyễn Văn An)'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
          </div>

          {/* 2. High School - Pure Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isEn ? 'High School Name' : 'Tên trường THPT'}{' '}
                <strong className="text-rose-500">*</strong>
              </span>
            </label>
            <input
              type="text"
              required
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isEn
                  ? 'Enter high school name (e.g. Hoa Binh High School, Chi Lang High School...)'
                  : 'Nhập tên trường THPT của bạn (Ví dụ: THPT Hòa Bình, THPT Chi Lăng...)'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 bg-white"
            />
          </div>

          {/* 3. Class - Pure Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {isEn ? 'Class' : 'Lớp học'}{' '}
                <strong className="text-rose-500">*</strong>
              </span>
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isEn
                  ? 'Enter class (e.g.: 10A1, 10A2, 10D1...)'
                  : 'Nhập tên lớp học (Ví dụ: 10A1, 10A2, 10D1...)'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          {/* Notice */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isEn
                  ? 'Standardized Profile Synchronization:'
                  : 'Chuẩn hóa định danh thống nhất:'}
              </span>
            </div>
            <p>
              {isEn
                ? 'The system normalizes whitespace and formats school/class names to accurately aggregate practice and exam scores into the rankings.'
                : 'Hệ thống tự động chuẩn hóa khoảng trắng và định dạng tên trường, lớp để tổng hợp kết quả luyện tập và kiểm tra chính xác vào bảng xếp hạng.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Hủy'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md transition hover:scale-102 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? isEn
                    ? 'Saving...'
                    : 'Đang lưu...'
                  : isEn
                  ? 'Save Changes'
                  : 'Lưu Thay Đổi'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

