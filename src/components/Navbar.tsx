import React, { useState } from 'react';
import {
  BookOpen,
  Building2,
  CheckCircle,
  Edit3,
  GraduationCap,
  Home,
  Layers,
  LogOut,
  RefreshCw,
  Sparkles,
  User,
  Users,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';
import { StudentIdentificationModal } from './StudentIdentificationModal';
import { useLanguage, LanguageSwitcher } from '../contexts/LanguageContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  isTeacherVerified?: boolean;
  onUserChange: (user: UserProfile) => void;
  onResetUser?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  isTeacherVerified = false,
  onUserChange,
  onResetUser,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { t, isEn } = useLanguage();

  const handleOpenTeacherAdmin = () => {
    if (currentUser.role === 'teacher' && isTeacherVerified) {
      setCurrentTab('teacher_admin');
    }
  };

  const handleTeacherLogout = async () => {
    setShowProfileMenu(false);
    await apiService.teacherLogout();
    StorageService.clearTeacherSession();
    if (onResetUser) {
      onResetUser();
    } else {
      StorageService.clearCurrentUser();
      window.location.reload();
    }
  };

  const handleNewSession = () => {
    setShowProfileMenu(false);
    if (onResetUser) {
      onResetUser();
    } else {
      StorageService.clearCurrentUser();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner with School Identity - Xanh Navy đậm sang trọng */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-medium tracking-wide">
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase text-[10px] tracking-wider shadow-xs">
              {t('app.program')}
            </span>
            <span className="font-bold text-slate-100">{t('app.school_name')}</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-amber-300 font-extrabold">
              {t('app.department')}
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-teal-300 font-semibold">
              {t('app.textbook')}
            </span>
          </div>

          {/* Teacher Credit & Language Switcher at Top Right */}
          <div className="flex items-center space-x-3 text-[11px] text-slate-300">
            <span className="hidden lg:inline">
              {t('app.teacher_in_charge')}{' '}
              <strong className="text-amber-300 font-bold">Bùi Thị Hồng Hạnh</strong>
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-black text-lg text-amber-300">{isEn ? 'GEO' : 'ĐL'}</span>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                <span>{t('app.title')}</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                  {t('app.subtitle')}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block font-medium">
                {t('app.platform_desc')}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-teal-50 text-teal-800 font-extrabold shadow-2xs border border-teal-200'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('nav.home')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('lessons')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                currentTab === 'lessons'
                  ? 'bg-teal-50 text-teal-800 font-extrabold shadow-2xs border border-teal-200'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('nav.lessons')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('practice')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                currentTab === 'practice'
                  ? 'bg-teal-50 text-teal-800 font-extrabold shadow-2xs border border-teal-200'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>{t('nav.practice')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('exam')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                currentTab === 'exam'
                  ? 'bg-teal-50 text-teal-800 font-extrabold shadow-2xs border border-teal-200'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t('nav.exams')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('stats')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                currentTab === 'stats'
                  ? 'bg-teal-50 text-teal-800 font-extrabold shadow-2xs border border-teal-200'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('nav.stats')}</span>
            </button>

            {currentUser.role === 'teacher' && isTeacherVerified && (
              <button
                onClick={handleOpenTeacherAdmin}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all ml-2 cursor-pointer ${
                  currentTab === 'teacher_admin'
                    ? 'bg-slate-900 text-amber-300 shadow-sm border border-slate-800'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-amber-500" />
                <span>{t('nav.teacher_admin')}</span>
              </button>
            )}
          </nav>

          {/* User Profile Capsule */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProfileMenu(true)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left shadow-2xs cursor-pointer group"
              title={isEn ? "View session / Switch student" : "Xem thông tin phiên học / Đổi học sinh"}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  currentUser.role === 'teacher' ? 'bg-amber-600' : 'bg-blue-600'
                }`}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  {currentUser.role === 'teacher' && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold">
                      {isEn ? 'TEACHER' : 'GV'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                  {currentUser.role === 'teacher'
                    ? t('user.teacher_role')
                    : `${t('user.class')} ${currentUser.className || '10'} • ${currentUser.school || 'THPT'}`}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100 text-xs">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1.5 rounded-md font-medium shrink-0 ${
              currentTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.home')}
          </button>
          <button
            onClick={() => setCurrentTab('lessons')}
            className={`px-3 py-1.5 rounded-md font-medium shrink-0 ${
              currentTab === 'lessons' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.lessons')}
          </button>
          <button
            onClick={() => setCurrentTab('practice')}
            className={`px-3 py-1.5 rounded-md font-medium shrink-0 ${
              currentTab === 'practice' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.practice')}
          </button>
          <button
            onClick={() => setCurrentTab('exam')}
            className={`px-3 py-1.5 rounded-md font-medium shrink-0 ${
              currentTab === 'exam' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.exams')}
          </button>
          <button
            onClick={() => setCurrentTab('stats')}
            className={`px-3 py-1.5 rounded-md font-medium shrink-0 ${
              currentTab === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.stats')}
          </button>
          {currentUser.role === 'teacher' && isTeacherVerified && (
            <button
              onClick={handleOpenTeacherAdmin}
              className={`px-3 py-1.5 rounded-md font-medium shrink-0 cursor-pointer ${
                currentTab === 'teacher_admin' ? 'bg-emerald-600 text-white' : 'text-emerald-700 bg-emerald-50'
              }`}
            >
              {t('nav.teacher_admin')}
            </button>
          )}
        </div>
      </div>

      {/* User Session Profile Dialog */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-bold text-lg text-white">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{isEn ? 'Session Profile' : 'Thông Tin Phiên Học Tập'}</h3>
                  <p className="text-xs text-blue-100">{isEn ? 'Active user account and session details' : 'Hồ sơ người dùng đang hoạt động'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {isEn ? 'Student Full Name' : 'Họ và tên học sinh'}
                    </span>
                    <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{currentUser.name}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                    {currentUser.role === 'teacher' ? (isEn ? 'Teacher' : 'Giáo viên') : (currentUser.code || (isEn ? 'Student' : 'Học sinh'))}
                  </span>
                </div>

                <div className="border-t border-slate-200/60 pt-2 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {isEn ? 'High School' : 'Trường THPT'}
                    </span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{currentUser.school}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {isEn ? 'Class' : 'Lớp học'}
                    </span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{currentUser.className || '10'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* 1. Update Info (Only for extended learners; official students are locked) */}
                {currentUser.role === 'student' && currentUser.studentType === 'official' ? (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{isEn ? 'Identity information is protected' : 'Thông tin định danh được bảo mật'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {isEn
                        ? "Full name, School, and Class of official students are synchronized with Teacher Bui Thi Hong Hanh's electronic gradebook."
                        : 'Họ tên, Trường và Lớp của học sinh chính thức được cố định theo danh sách sổ điểm điện tử của GV Bùi Thị Hồng Hạnh.'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowEditModal(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span>{isEn ? 'Update Profile (Name, School, Class)' : 'Cập nhật thông tin (Họ tên, Trường, Lớp)'}</span>
                  </button>
                )}

                {/* 2. Start New Session / Switch Student */}
                <button
                  onClick={handleNewSession}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isEn ? 'Start New Session / Switch Student' : 'Bắt đầu phiên học mới / Đổi học sinh'}</span>
                </button>
              </div>

              {/* Teacher logout option - ONLY visible when currently logged in as teacher */}
              {currentUser.role === 'teacher' && (
                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    onClick={handleTeacherLogout}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Sign out Teacher Role' : 'Đăng xuất vai trò Giáo viên'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Info Modal */}
      {showEditModal && (
        <StudentIdentificationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentUser={currentUser}
          onUpdateUser={(updated) => {
            StorageService.setCurrentUser(updated);
            onUserChange(updated);
            setShowEditModal(false);
          }}
        />
      )}
    </header>
  );
};
