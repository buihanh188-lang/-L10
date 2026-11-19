import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { calculateRemainingTime, RemainingTimeInfo } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface ExamCountdownBadgeProps {
  deadline?: string;
  isRevoked?: boolean;
  className?: string;
  compact?: boolean;
}

export const ExamCountdownBadge: React.FC<ExamCountdownBadgeProps> = ({
  deadline,
  isRevoked = false,
  className = '',
  compact = false,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [timeInfo, setTimeInfo] = useState<RemainingTimeInfo>(() =>
    calculateRemainingTime(deadline, isRevoked, language)
  );

  useEffect(() => {
    // Immediate calculation
    setTimeInfo(calculateRemainingTime(deadline, isRevoked, language));

    // Tick every second for live countdown
    const timer = setInterval(() => {
      setTimeInfo(calculateRemainingTime(deadline, isRevoked, language));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, isRevoked, language]);

  if (timeInfo.isRevoked) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        title={isEn ? 'This test has been revoked by the teacher' : 'Đề kiểm tra này đã được giáo viên thu hồi'}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>{isEn ? 'Revoked' : 'Đã thu hồi'}</span>
      </span>
    );
  }

  if (timeInfo.isExpired) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 ${className}`}
        title={isEn ? 'Submission deadline has passed' : 'Đã quá thời hạn làm bài quy định'}
      >
        <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>{isEn ? 'Deadline Expired' : 'Hết hạn nộp bài'}</span>
      </span>
    );
  }

  if (timeInfo.badgeStyle === 'warning') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse ${className}`}
        title={isEn ? 'Expiring soon' : 'Sắp hết hạn làm bài'}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-mono tracking-tight">{timeInfo.displayText}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}
      title={isEn ? 'Remaining exam time' : 'Thời gian làm bài còn lại'}
    >
      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span className="font-mono tracking-tight">{timeInfo.displayText}</span>
    </span>
  );
};

