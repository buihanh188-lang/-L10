import React from 'react';
import { BookOpen, Globe2, Heart, Lock, Mail, MapPin, School, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Unit Branding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center text-white font-extrabold text-sm">
                {isEn ? 'GEO' : 'ĐL'}
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                {isEn ? 'GEOGRAPHY 10 – KNOWLEDGE CONQUEST' : 'ĐỊA LÍ 10 – CHINH PHỤC TRI THỨC'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {isEn
                ? 'Online practice and standardized assessment system for Grade 10 Geography under the 2018 General Education Curriculum, Connecting Knowledge to Life textbook series.'
                : 'Hệ thống ôn luyện và kiểm tra đánh giá trực tuyến môn Địa lí lớp 10 theo Chương trình GDPT 2018, bộ sách Kết nối tri thức với cuộc sống.'}
            </p>
            <div className="pt-1 flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isEn
                  ? 'Digital educational product for high school teaching & self-directed learning'
                  : 'Sản phẩm phục vụ dạy học và tự học THPT'}
              </span>
            </div>
          </div>

          {/* School & Location Info */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              {isEn ? 'Institution & Location' : 'Đơn Vị & Địa Chỉ'}
            </div>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-start space-x-2">
                <School className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-200">
                  {isEn ? 'HOA BINH HIGH SCHOOL' : 'TRƯỜNG THPT HÒA BÌNH'}
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  {isEn ? 'VAN LINH COMMUNE – LANG SON PROVINCE' : 'XÃ VẠN LINH – TỈNH LẠNG SƠN'}
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isEn
                    ? 'Subject: Geography 10 (Connecting Knowledge to Life)'
                    : 'Môn: Địa lí 10 (Sách Kết nối tri thức với cuộc sống)'}
                </span>
              </div>
            </div>
          </div>

          {/* Teacher In Charge */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              {isEn ? 'Academic Teacher In Charge' : 'Giáo Viên Phụ Trách Chuyên Môn'}
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="text-sm font-bold text-amber-300">
                BÙI THỊ HỒNG HẠNH
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">
                {isEn
                  ? 'DEPT OF HISTORY – GEOGRAPHY – LAW • HOA BINH HIGH SCHOOL'
                  : 'TỔ SỬ – ĐỊA – GDKTPL • TRƯỜNG THPT HÒA BÌNH'}
              </div>
              <div className="text-[11px] text-emerald-400">
                {isEn ? 'Van Linh Commune – Lang Son Province' : 'Xã Vạn Linh – Tỉnh Lạng Sơn'}
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>buihanh188@gmail.com</span>
              </div>
              <div className="pt-2">
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = window.location.origin + '/admin';
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title={isEn ? 'Open Teacher Admin Portal' : 'Mở Cổng Quản Trị Giáo Viên'}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Teacher Admin Portal' : 'Cổng Quản Trị Giáo Viên'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            {isEn
              ? '© 2026 HOA BINH HIGH SCHOOL – VAN LINH COMMUNE, LANG SON PROVINCE. All rights reserved.'
              : '© 2026 TRƯỜNG THPT HÒA BÌNH – XÃ VẠN LINH, TỈNH LẠNG SƠN. All rights reserved.'}
          </div>
          <div className="flex items-center space-x-1">
            <span>
              {isEn
                ? 'Built with dedication for student progress and geographical competency'
                : 'Xây dựng với tâm huyết giáo dục vì sự tiến bộ của học sinh'}
            </span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
