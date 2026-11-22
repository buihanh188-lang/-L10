import React, { useMemo, useState } from 'react';
import {
  Activity,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Film,
  Filter,
  Layers,
  PlayCircle,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';
import { LESSONS } from '../data/lessons';
import type { LearningActivity, LearningActivityType } from '../types';
import { formatVNDateTime } from '../utils/dateUtils';
import {
  normalizeClassName,
  normalizeSchoolKey,
  normalizeSchoolName,
  normalizeStudentName,
} from '../utils/normalize';
import { useLanguage } from '../contexts/LanguageContext';

interface SchoolClassRow {
  key: string;
  schoolName: string;
  className: string;
  rosterCount: number;
  uniqueStudents: Set<string>;
  videoStudents: Set<string>;
  visitCount: number;
  videoViewCount: number;
  lessonViewCount: number;
}

interface LessonVideoRankRow {
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  videoViews: number;
  lessonViews: number;
  uniqueVideoStudents: Set<string>;
  uniqueLessonStudents: Set<string>;
}

interface StudentEngagementRow {
  key: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  schoolName: string;
  visitCount: number;
  videoViewCount: number;
  lessonViewCount: number;
  videoLessonIds: string[];
  lessonViewIds: string[];
  latestTimestamp: number;
  hasVisited: boolean;
  hasWatchedVideo: boolean;
  hasStudiedLesson: boolean;
}

function escapeCsvCell(value: string | number | undefined | null): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function getLessonShortLabel(lessonId: string): string {
  const match = LESSONS.find((l) => l.id === lessonId);
  if (match) return `Bài ${match.number}`;
  const numMatch = lessonId.match(/(\d+)/);
  return numMatch ? `Bài ${numMatch[1]}` : lessonId;
}

function getLessonOrder(lessonId: string): number {
  const match = LESSONS.find((l) => l.id === lessonId);
  if (match) return match.number;
  const numMatch = lessonId.match(/(\d+)/);
  return numMatch ? Number(numMatch[1]) : 999;
}

function makeStudentIdentityKey(
  schoolName: string,
  className: string,
  studentCode: string,
  studentId: string
): string {
  const sKey = normalizeSchoolKey(schoolName || 'TRƯỜNG THPT HÒA BÌNH');
  const cKey = normalizeClassName(className || '10A1');
  const codeKey = String(studentCode || '').trim().toUpperCase();
  if (codeKey && codeKey !== 'HS') {
    return `${sKey}|${cKey}|CODE:${codeKey}`;
  }
  return `${sKey}|${cKey}|ID:${String(studentId || '').trim()}`;
}

export const LearningEngagementPanel: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<
    'all' | 'visited_app' | 'watched_video' | 'studied_lesson' | 'not_watched_video' | 'not_visited'
  >('all');
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | LearningActivityType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [version, setVersion] = useState(0);

  React.useEffect(() => {
    const unsub = apiService.subscribeToDataChanges(() => {
      setVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const allActivities = useMemo(
    () => apiService.getLearningActivities({ timeRange: 'all' }),
    [version]
  );

  const allRosterStudents = useMemo(
    () => apiService.getAllStudents().filter((s) => s && s.role === 'student'),
    [version]
  );

  // Build available schools & classes list (from roster, registered classes, and activity logs)
  const { schoolOptions, classOptions } = useMemo(() => {
    const schoolMap = new Map<string, string>();
    const classSet = new Set<string>();

    const register = (schoolRaw?: string, classRaw?: string) => {
      const normSchool = normalizeSchoolName(schoolRaw || 'TRƯỜNG THPT HÒA BÌNH');
      const sKey = normalizeSchoolKey(normSchool);
      if (!schoolMap.has(sKey)) schoolMap.set(sKey, normSchool);
      if (
        classRaw &&
        (selectedSchool === 'all' || sKey === normalizeSchoolKey(selectedSchool))
      ) {
        classSet.add(normalizeClassName(classRaw));
      }
    };

    StorageService.getClasses().forEach((cls) => register(cls.schoolName, cls.name));
    allRosterStudents.forEach((st) => register(st.school, st.className));
    allActivities.forEach((act) => register(act.schoolName, act.className));

    return {
      schoolOptions: Array.from(schoolMap.values()).sort((a, b) => a.localeCompare(b, 'vi')),
      classOptions: Array.from(classSet).sort((a, b) => a.localeCompare(b, 'vi')),
    };
  }, [allActivities, allRosterStudents, selectedSchool, version]);

  // Activities filtered by school, class, and time range (before lesson filter)
  const scopedActivities = useMemo(
    () =>
      apiService.getLearningActivities({
        schoolName: selectedSchool,
        className: selectedClass,
        timeRange,
      }),
    [selectedSchool, selectedClass, timeRange, version]
  );

  // Activities filtered by selected lesson (for lesson-specific stats & logs)
  const lessonScopedActivities = useMemo(() => {
    if (selectedLessonId === 'all') return scopedActivities;
    return scopedActivities.filter((act) => act.lessonId === selectedLessonId);
  }, [scopedActivities, selectedLessonId]);

  const selectedLessonObj = useMemo(
    () => (selectedLessonId === 'all' ? null : LESSONS.find((l) => l.id === selectedLessonId) || null),
    [selectedLessonId]
  );

  // Build comprehensive per-student engagement rows combining official roster + active students
  const studentRows = useMemo<StudentEngagementRow[]>(() => {
    const map = new Map<
      string,
      {
        key: string;
        studentId: string;
        studentCode: string;
        studentName: string;
        className: string;
        schoolName: string;
        visitCount: number;
        videoViewCount: number;
        lessonViewCount: number;
        videoLessonSet: Set<string>;
        lessonViewSet: Set<string>;
        latestTimestamp: number;
      }
    >();

    // 1. Seed from roster matching selected school & class so cô Hạnh also sees who HAS NOT studied
    allRosterStudents.forEach((st) => {
      const normSchool = normalizeSchoolName(st.school || 'TRƯỜNG THPT HÒA BÌNH');
      const normClass = normalizeClassName(st.className || '10A1');
      if (
        selectedSchool !== 'all' &&
        normalizeSchoolKey(normSchool) !== normalizeSchoolKey(selectedSchool)
      ) {
        return;
      }
      if (selectedClass !== 'all' && normClass !== normalizeClassName(selectedClass)) {
        return;
      }
      const key = makeStudentIdentityKey(normSchool, normClass, st.code, st.id);
      if (!map.has(key)) {
        map.set(key, {
          key,
          studentId: st.id,
          studentCode: st.code || 'HS',
          studentName: normalizeStudentName(st.name || 'Học sinh'),
          className: normClass,
          schoolName: normSchool,
          visitCount: 0,
          videoViewCount: 0,
          lessonViewCount: 0,
          videoLessonSet: new Set<string>(),
          lessonViewSet: new Set<string>(),
          latestTimestamp: 0,
        });
      }
    });

    // 2. Overlay all matching activities
    scopedActivities.forEach((act) => {
      const normSchool = normalizeSchoolName(act.schoolName || 'TRƯỜNG THPT HÒA BÌNH');
      const normClass = normalizeClassName(act.className || '10A1');
      const key = makeStudentIdentityKey(normSchool, normClass, act.studentCode, act.studentId);

      let entry = map.get(key);
      if (!entry) {
        entry = {
          key,
          studentId: act.studentId,
          studentCode: act.studentCode || 'HS',
          studentName: normalizeStudentName(act.studentName || 'Học sinh'),
          className: normClass,
          schoolName: normSchool,
          visitCount: 0,
          videoViewCount: 0,
          lessonViewCount: 0,
          videoLessonSet: new Set<string>(),
          lessonViewSet: new Set<string>(),
          latestTimestamp: 0,
        };
        map.set(key, entry);
      }

      if (act.type === 'visit') {
        entry.visitCount++;
        if (selectedLessonId === 'all' && act.timestamp > entry.latestTimestamp) {
          entry.latestTimestamp = act.timestamp;
        }
      } else if (act.type === 'video_view') {
        if (selectedLessonId === 'all' || act.lessonId === selectedLessonId) {
          entry.videoViewCount++;
          if (act.lessonId) entry.videoLessonSet.add(act.lessonId);
          if (act.timestamp > entry.latestTimestamp) {
            entry.latestTimestamp = act.timestamp;
          }
        }
      } else if (act.type === 'lesson_view') {
        if (selectedLessonId === 'all' || act.lessonId === selectedLessonId) {
          entry.lessonViewCount++;
          if (act.lessonId) entry.lessonViewSet.add(act.lessonId);
          if (act.timestamp > entry.latestTimestamp) {
            entry.latestTimestamp = act.timestamp;
          }
        }
      }
    });

    return Array.from(map.values())
      .map((item) => {
        const videoLessonIds = Array.from(item.videoLessonSet).sort(
          (a, b) => getLessonOrder(a) - getLessonOrder(b)
        );
        const lessonViewIds = Array.from(item.lessonViewSet).sort(
          (a, b) => getLessonOrder(a) - getLessonOrder(b)
        );
        const hasWatchedVideo = item.videoViewCount > 0;
        const hasStudiedLesson = item.lessonViewCount > 0;
        const hasVisited =
          selectedLessonId === 'all'
            ? item.visitCount > 0 || hasWatchedVideo || hasStudiedLesson
            : hasWatchedVideo || hasStudiedLesson;

        return {
          key: item.key,
          studentId: item.studentId,
          studentCode: item.studentCode,
          studentName: item.studentName,
          className: item.className,
          schoolName: item.schoolName,
          visitCount: item.visitCount,
          videoViewCount: item.videoViewCount,
          lessonViewCount: item.lessonViewCount,
          videoLessonIds,
          lessonViewIds,
          latestTimestamp: item.latestTimestamp,
          hasVisited,
          hasWatchedVideo,
          hasStudiedLesson,
        };
      })
      .sort((a, b) => {
        if (a.className !== b.className) return a.className.localeCompare(b.className, 'vi');
        return a.studentCode.localeCompare(b.studentCode, 'vi', { numeric: true });
      });
  }, [allRosterStudents, scopedActivities, selectedSchool, selectedClass, selectedLessonId]);

  // Student status counts & filtered list for the roster table
  const studentStatusCounts = useMemo(() => {
    let visitedApp = 0;
    let watchedVideo = 0;
    let studiedLesson = 0;
    let notWatchedVideo = 0;
    let notVisited = 0;
    studentRows.forEach((r) => {
      if (r.hasVisited) visitedApp++;
      else notVisited++;
      if (r.hasWatchedVideo) watchedVideo++;
      else notWatchedVideo++;
      if (r.hasStudiedLesson) studiedLesson++;
    });
    return {
      total: studentRows.length,
      visitedApp,
      watchedVideo,
      studiedLesson,
      notWatchedVideo,
      notVisited,
    };
  }, [studentRows]);

  const filteredStudentRows = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return studentRows.filter((row) => {
      if (studentStatusFilter === 'visited_app' && !row.hasVisited) return false;
      if (studentStatusFilter === 'watched_video' && !row.hasWatchedVideo) return false;
      if (studentStatusFilter === 'studied_lesson' && !row.hasStudiedLesson) return false;
      if (studentStatusFilter === 'not_watched_video' && row.hasWatchedVideo) return false;
      if (studentStatusFilter === 'not_visited' && row.hasVisited) return false;
      if (q) {
        const matchName = row.studentName.toLowerCase().includes(q);
        const matchCode = row.studentCode.toLowerCase().includes(q);
        const matchClass = row.className.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchClass) return false;
      }
      return true;
    });
  }, [studentRows, studentStatusFilter, studentSearch]);

  // Core KPI metrics
  const summary = useMemo(() => {
    let totalVisits = 0;
    let totalVideoViews = 0;
    let totalLessonViews = 0;
    const activeStudentSet = new Set<string>();
    const videoStudentSet = new Set<string>();
    const lessonStudentSet = new Set<string>();

    scopedActivities.forEach((act) => {
      const sKey = makeStudentIdentityKey(
        act.schoolName,
        act.className,
        act.studentCode,
        act.studentId
      );
      if (act.type === 'visit') {
        totalVisits++;
        if (selectedLessonId === 'all') activeStudentSet.add(sKey);
      } else if (act.type === 'video_view') {
        if (selectedLessonId === 'all' || act.lessonId === selectedLessonId) {
          totalVideoViews++;
          videoStudentSet.add(sKey);
          activeStudentSet.add(sKey);
        }
      } else if (act.type === 'lesson_view') {
        if (selectedLessonId === 'all' || act.lessonId === selectedLessonId) {
          totalLessonViews++;
          lessonStudentSet.add(sKey);
          activeStudentSet.add(sKey);
        }
      }
    });

    return {
      totalVisits,
      totalVideoViews,
      totalLessonViews,
      uniqueStudents: activeStudentSet.size,
      uniqueVideoStudents: videoStudentSet.size,
      uniqueLessonStudents: lessonStudentSet.size,
      rosterTotal: studentRows.length,
    };
  }, [scopedActivities, selectedLessonId, studentRows.length]);

  // Per-School & Per-Class Breakdown
  const schoolClassBreakdown = useMemo(() => {
    const map = new Map<string, SchoolClassRow>();

    const ensureRow = (schoolRaw: string, classRaw: string) => {
      const normSchool = normalizeSchoolName(schoolRaw || 'TRƯỜNG THPT HÒA BÌNH');
      const normClass = normalizeClassName(classRaw || '10A1');
      const key = `${normalizeSchoolKey(normSchool)}__${normClass}`;
      let row = map.get(key);
      if (!row) {
        row = {
          key,
          schoolName: normSchool,
          className: normClass,
          rosterCount: 0,
          uniqueStudents: new Set<string>(),
          videoStudents: new Set<string>(),
          visitCount: 0,
          videoViewCount: 0,
          lessonViewCount: 0,
        };
        map.set(key, row);
      }
      return row;
    };

    studentRows.forEach((st) => {
      const row = ensureRow(st.schoolName, st.className);
      row.rosterCount++;
      if (st.hasVisited) row.uniqueStudents.add(st.key);
      if (st.hasWatchedVideo) row.videoStudents.add(st.key);
      row.visitCount += st.visitCount;
      row.videoViewCount += st.videoViewCount;
      row.lessonViewCount += st.lessonViewCount;
    });

    return Array.from(map.values()).sort((a, b) => {
      const totalA = a.visitCount + a.videoViewCount + a.lessonViewCount;
      const totalB = b.visitCount + b.videoViewCount + b.lessonViewCount;
      if (totalB !== totalA) return totalB - totalA;
      return a.className.localeCompare(b.className, 'vi');
    });
  }, [studentRows]);

  // Top Video Lectures & Lessons Ranking (across all lessons in current school/class/time filter)
  const lessonRankings = useMemo(() => {
    const map = new Map<string, LessonVideoRankRow>();

    scopedActivities.forEach((act) => {
      if (act.type !== 'video_view' && act.type !== 'lesson_view') return;
      if (!act.lessonId && !act.lessonTitle) return;
      const key = act.lessonId || act.lessonTitle || 'unknown';
      const sKey = makeStudentIdentityKey(
        act.schoolName,
        act.className,
        act.studentCode,
        act.studentId
      );
      let row = map.get(key);
      if (!row) {
        row = {
          lessonId: act.lessonId || key,
          lessonNumber: getLessonOrder(act.lessonId || key),
          lessonTitle: act.lessonTitle || act.lessonId || 'Bài học Địa lí 10',
          videoViews: 0,
          lessonViews: 0,
          uniqueVideoStudents: new Set<string>(),
          uniqueLessonStudents: new Set<string>(),
        };
        map.set(key, row);
      }
      if (act.type === 'video_view') {
        row.videoViews++;
        row.uniqueVideoStudents.add(sKey);
      }
      if (act.type === 'lesson_view') {
        row.lessonViews++;
        row.uniqueLessonStudents.add(sKey);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.videoViews !== a.videoViews) return b.videoViews - a.videoViews;
      if (b.lessonViews !== a.lessonViews) return b.lessonViews - a.lessonViews;
      return a.lessonNumber - b.lessonNumber;
    });
  }, [scopedActivities]);

  const maxVideoViews = useMemo(
    () => Math.max(1, ...lessonRankings.map((r) => r.videoViews)),
    [lessonRankings]
  );

  // Recent Activity Log
  const recentLogs = useMemo(() => {
    const base = selectedLessonId === 'all' ? scopedActivities : lessonScopedActivities;
    const source =
      logTypeFilter === 'all' ? base : base.filter((a) => a.type === logTypeFilter);
    return source.slice(0, 60);
  }, [scopedActivities, lessonScopedActivities, selectedLessonId, logTypeFilter]);

  const handleRefreshCloud = async () => {
    setRefreshing(true);
    try {
      await apiService.refreshCloudData();
      setVersion((v) => v + 1);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportCsv = () => {
    const scopeTitle = selectedLessonObj
      ? `Bài ${selectedLessonObj.number}: ${selectedLessonObj.title}`
      : 'Tất cả 40 bài học';

    const rows: string[][] = [
      [
        'BÁO CÁO THỐNG KÊ TRUY CẬP HỌC TẬP & XEM VIDEO BÀI GIẢNG – ĐỊA LÍ 10',
        `Phạm vi bài: ${scopeTitle}`,
        `Ngày xuất: ${formatVNDateTime(Date.now())}`,
      ],
      [
        'Tổng lượt truy cập học tập',
        String(summary.totalVisits),
        'Tổng lượt xem video bài giảng',
        String(summary.totalVideoViews),
        'Lượt học bài lý thuyết',
        String(summary.totalLessonViews),
        'Số HS đã tham gia / Sĩ số',
        `${summary.uniqueStudents}/${summary.rosterTotal}`,
      ],
      [],
      ['1. BẢNG THEO DÕI CHI TIẾT TỪNG HỌC SINH'],
      [
        'STT',
        'Mã HS',
        'Họ và tên',
        'Lớp',
        'Trường THPT',
        'Trạng thái',
        'Lượt truy cập',
        'Lượt xem Video',
        'Các bài đã xem Video',
        'Lượt học Lý thuyết',
        'Các bài đã học Lý thuyết',
        'Lần hoạt động gần nhất',
      ],
      ...studentRows.map((st, idx) => [
        String(idx + 1),
        st.studentCode,
        st.studentName,
        st.className,
        st.schoolName,
        st.hasWatchedVideo && st.hasStudiedLesson
          ? 'Đã xem Video & Học bài'
          : st.hasWatchedVideo
          ? 'Đã xem Video'
          : st.hasStudiedLesson
          ? 'Đã học Lý thuyết (chưa xem Video)'
          : st.hasVisited
          ? 'Đã truy cập (chưa mở bài/video)'
          : 'Chưa vào học',
        String(st.visitCount),
        String(st.videoViewCount),
        st.videoLessonIds.map(getLessonShortLabel).join('; ') || 'Chưa xem',
        String(st.lessonViewCount),
        st.lessonViewIds.map(getLessonShortLabel).join('; ') || 'Chưa mở',
        st.latestTimestamp > 0 ? formatVNDateTime(st.latestTimestamp) : 'Chưa có',
      ]),
      [],
      ['2. THỐNG KÊ THEO TRƯỜNG & LỚP'],
      [
        'Trường THPT',
        'Lớp',
        'Sĩ số',
        'HS đã vào học',
        'HS đã xem Video',
        'Lượt truy cập học tập',
        'Lượt xem Video',
        'Lượt học Lý thuyết',
      ],
      ...schoolClassBreakdown.map((r) => [
        r.schoolName,
        r.className,
        String(r.rosterCount),
        String(r.uniqueStudents.size),
        String(r.videoStudents.size),
        String(r.visitCount),
        String(r.videoViewCount),
        String(r.lessonViewCount),
      ]),
      [],
      ['3. XẾP HẠNG VIDEO BÀI GIẢNG & BÀI HỌC ĐƯỢC XEM'],
      ['Bài học', 'Lượt xem Video', 'Số HS xem Video', 'Lượt mở Lý thuyết', 'Số HS học Lý thuyết'],
      ...lessonRankings.map((r) => [
        r.lessonTitle,
        String(r.videoViews),
        String(r.uniqueVideoStudents.size),
        String(r.lessonViews),
        String(r.uniqueLessonStudents.size),
      ]),
      [],
      ['4. NHẬT KÝ HOẠT ĐỘNG CHI TIẾT'],
      ['Thời gian', 'Mã HS', 'Họ và tên', 'Lớp', 'Trường THPT', 'Loại hoạt động', 'Nội dung bài học'],
      ...lessonScopedActivities.map((act: LearningActivity) => [
        formatVNDateTime(act.timestamp),
        act.studentCode,
        act.studentName,
        act.className,
        act.schoolName,
        act.type === 'visit'
          ? 'Truy cập học tập'
          : act.type === 'video_view'
          ? 'Xem video bài giảng'
          : 'Học bài lý thuyết',
        act.lessonTitle || 'Truy cập hệ thống học tập',
      ]),
    ];

    const csvContent =
      '\uFEFF' + rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `theo-doi-hoc-tap-xem-video-diali10-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {isEn
                    ? 'Learning Visits & Video Lecture Tracking'
                    : 'Thống kê Truy Cập Học Tập & Xem Video Theo Lớp, Bài, Học Sinh'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isEn
                    ? 'Private teacher analytics synced automatically from student sessions (excludes teacher previews).'
                    : 'Theo dõi chi tiết từng học sinh đã hay chưa vào học và xem video từng bài • Tự động đồng bộ từ máy học sinh.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshCloud}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{isEn ? 'Refresh' : 'Làm mới số liệu'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEn ? 'Export Excel (.csv)' : 'Xuất Excel chi tiết (.csv)'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: School, Class, Lesson, Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'School' : 'Trường THPT'}</span>
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setSelectedClass('all');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">{isEn ? 'All schools' : 'Tất cả các trường'}</option>
              {schoolOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Class' : 'Lớp'}</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">{isEn ? 'All classes' : 'Tất cả các lớp'}</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {isEn ? `Class ${c}` : `Lớp ${c}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Lesson (1 - 40)' : 'Bài học (Bài 1 → 40)'}</span>
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">{isEn ? 'All 40 lessons' : 'Tất cả 40 bài học'}</option>
              {LESSONS.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  Bài {lesson.number}: {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Time Range' : 'Khoảng thời gian'}</span>
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">{isEn ? 'All time' : 'Toàn thời gian'}</option>
              <option value="today">{isEn ? 'Today' : 'Hôm nay'}</option>
              <option value="7days">{isEn ? 'Last 7 days' : '7 ngày gần nhất'}</option>
              <option value="30days">{isEn ? 'Last 30 days' : '30 ngày gần nhất'}</option>
            </select>
          </div>
        </div>

        {selectedLessonObj && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs">
            <span className="font-bold text-teal-900">
              {isEn ? 'Inspecting Lesson:' : 'Đang kiểm tra riêng:'}{' '}
              <span className="font-black">
                Bài {selectedLessonObj.number}: {selectedLessonObj.title}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedLessonId('all')}
              className="text-[11px] font-bold text-teal-800 underline hover:text-teal-950 cursor-pointer"
            >
              {isEn ? 'View all 40 lessons' : 'Quay lại xem tất cả 40 bài'}
            </button>
          </div>
        )}
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedLessonObj
                ? isEn
                  ? 'Students Watched Video'
                  : 'HS đã xem Video bài này'
                : isEn
                ? 'Total App Visits'
                : 'Tổng lượt truy cập vào App'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-sky-700 tabular-nums">
            {selectedLessonObj
              ? `${summary.uniqueVideoStudents}/${summary.rosterTotal}`
              : summary.totalVisits}
          </div>
          <div className="text-[11px] text-slate-400">
            {selectedLessonObj
              ? isEn
                ? 'Unique students who played video'
                : 'Số học sinh đã bấm xem video bài này'
              : isEn
              ? 'Counted once per browser session'
              : 'Tính ngay khi HS mở App vào học (1 lượt/phiên)'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedLessonObj
                ? isEn
                  ? 'Video Views (This Lesson)'
                  : 'Lượt xem Video bài này'
                : isEn
                ? 'Video Lecture Views'
                : 'Tổng lượt xem video bài giảng'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-teal-700 tabular-nums">
            {summary.totalVideoViews}
          </div>
          <div className="text-[11px] text-slate-400">
            {isEn
              ? `${summary.uniqueVideoStudents} students watched videos`
              : `${summary.uniqueVideoStudents} học sinh đã xem video`}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedLessonObj
                ? isEn
                  ? 'Lesson Theory Opens'
                  : 'Lượt mở học Lý thuyết bài này'
                : isEn
                ? 'Lesson Theory Views'
                : 'Lượt mở học bài lý thuyết'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-700 tabular-nums">
            {summary.totalLessonViews}
          </div>
          <div className="text-[11px] text-slate-400">
            {isEn
              ? `${summary.uniqueLessonStudents} students opened lessons`
              : `${summary.uniqueLessonStudents} học sinh đã mở bài học`}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedLessonObj
                ? isEn
                  ? 'Not Yet Studied'
                  : 'HS chưa học bài này'
                : isEn
                ? 'Active Students / Roster'
                : 'Số HS đã truy cập / Sĩ số'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700 tabular-nums">
            {selectedLessonObj
              ? studentStatusCounts.notVisited
              : `${summary.uniqueStudents}/${summary.rosterTotal}`}
          </div>
          <div className="text-[11px] text-slate-400">
            {selectedLessonObj
              ? isEn
                ? 'Neither opened theory nor video'
                : 'Chưa mở xem lý thuyết và chưa xem video'
              : isEn
              ? `${studentStatusCounts.notVisited} students not visited yet`
              : `Còn ${studentStatusCounts.notVisited} HS chưa ghi nhận truy cập`}
          </div>
        </div>
      </div>

      {/* SECTION 1: STUDENT-BY-STUDENT TRACKING ROSTER (WHO WATCHED / WHO DIDN'T) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>
                  {selectedLessonObj
                    ? isEn
                      ? `Student Tracking for Lesson ${selectedLessonObj.number}`
                      : `Danh sách theo dõi từng Học sinh – Bài ${selectedLessonObj.number}: ${selectedLessonObj.title}`
                    : isEn
                    ? 'Student-by-Student Learning & Video Tracking'
                    : 'Bảng theo dõi chi tiết theo từng Học sinh (Ai đã học / Ai chưa xem video)'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isEn
                  ? 'Cross-referenced against the full class roster so you immediately know who has watched and who has not.'
                  : 'Đối chiếu trực tiếp với danh sách sĩ số lớp (10A1, 10A2 và HS mở rộng) để biết chính xác từng em đã vào học, đã xem những bài video nào hay chưa học.'}
              </p>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder={isEn ? 'Search name or student code...' : 'Tìm theo họ tên hoặc mã HS...'}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Quick Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  id: 'all',
                  label: isEn
                    ? `All Students (${studentStatusCounts.total})`
                    : `Tất cả HS (${studentStatusCounts.total})`,
                },
                {
                  id: 'visited_app',
                  label: isEn
                    ? `Visited App (${studentStatusCounts.visitedApp})`
                    : selectedLessonObj
                    ? `Đã học bài này (${studentStatusCounts.visitedApp})`
                    : `Đã truy cập App (${studentStatusCounts.visitedApp})`,
                },
                {
                  id: 'watched_video',
                  label: isEn
                    ? `Watched Video (${studentStatusCounts.watchedVideo})`
                    : `Đã xem Video (${studentStatusCounts.watchedVideo})`,
                },
                {
                  id: 'studied_lesson',
                  label: isEn
                    ? `Studied Theory (${studentStatusCounts.studiedLesson})`
                    : `Đã học Lý thuyết (${studentStatusCounts.studiedLesson})`,
                },
                {
                  id: 'not_watched_video',
                  label: isEn
                    ? `Not Watched Video (${studentStatusCounts.notWatchedVideo})`
                    : `Chưa xem Video (${studentStatusCounts.notWatchedVideo})`,
                },
                {
                  id: 'not_visited',
                  label: isEn
                    ? `Not Studied Yet (${studentStatusCounts.notVisited})`
                    : selectedLessonObj
                    ? `Chưa học bài này (${studentStatusCounts.notVisited})`
                    : `Chưa truy cập App (${studentStatusCounts.notVisited})`,
                },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStudentStatusFilter(chip.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  studentStatusFilter === chip.id
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {filteredStudentRows.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {isEn
              ? 'No students match the current filter.'
              : 'Không có học sinh nào khớp với bộ lọc đang chọn.'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-3 py-3 text-center w-10">STT</th>
                  <th className="px-3 py-3">{isEn ? 'Student' : 'Học sinh'}</th>
                  <th className="px-3 py-3">{isEn ? 'Class' : 'Lớp'}</th>
                  <th className="px-3 py-3">{isEn ? 'Status' : 'Trạng thái'}</th>
                  <th className="px-3 py-3 text-right">{isEn ? 'Visits' : 'Truy cập'}</th>
                  <th className="px-3 py-3">{isEn ? 'Video Views' : 'Xem Video bài giảng'}</th>
                  <th className="px-3 py-3">{isEn ? 'Theory Lessons' : 'Học Lý thuyết'}</th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    {isEn ? 'Last Active' : 'Lần gần nhất'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudentRows.map((st, idx) => (
                  <tr
                    key={st.key}
                    className={`transition ${
                      st.hasWatchedVideo
                        ? 'bg-white hover:bg-teal-50/40'
                        : st.hasVisited
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/40 hover:bg-rose-50/30'
                    }`}
                  >
                    <td className="px-3 py-3 text-center text-slate-400 font-bold tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900">{st.studentName}</div>
                      <div className="text-[11px] text-slate-500">{st.studentCode}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-black text-slate-800">{st.className}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {st.schoolName}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {st.hasWatchedVideo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {st.hasStudiedLesson
                              ? isEn
                                ? 'Video + Theory'
                                : 'Đã xem Video & Học bài'
                              : isEn
                              ? 'Watched Video'
                              : 'Đã xem Video'}
                          </span>
                        </span>
                      ) : st.hasStudiedLesson ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Theory Only' : 'Mới đọc bài (chưa xem Video)'}</span>
                        </span>
                      ) : st.hasVisited ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Visited Only' : 'Đã vào web (chưa mở bài)'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>
                            {selectedLessonObj
                              ? isEn
                                ? 'Not Studied'
                                : 'Chưa học bài này'
                              : isEn
                              ? 'Not Visited'
                              : 'Chưa vào học'}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-black text-sky-700 tabular-nums">
                      {st.visitCount}
                    </td>
                    <td className="px-3 py-3">
                      {st.videoViewCount > 0 ? (
                        <div className="space-y-1">
                          <span className="font-black text-teal-700 tabular-nums">
                            {st.videoViewCount} {isEn ? 'views' : 'lượt'}
                          </span>
                          {!selectedLessonObj && st.videoLessonIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {st.videoLessonIds.slice(0, 6).map((lid) => (
                                <button
                                  key={lid}
                                  type="button"
                                  onClick={() => setSelectedLessonId(lid)}
                                  title="Bấm để lọc riêng bài này"
                                  className="px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold cursor-pointer"
                                >
                                  {getLessonShortLabel(lid)}
                                </button>
                              ))}
                              {st.videoLessonIds.length > 6 && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  +{st.videoLessonIds.length - 6} bài
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {st.lessonViewCount > 0 ? (
                        <div className="space-y-1">
                          <span className="font-bold text-amber-700 tabular-nums">
                            {st.lessonViewCount} {isEn ? 'views' : 'lượt'}
                          </span>
                          {!selectedLessonObj && st.lessonViewIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {st.lessonViewIds.slice(0, 6).map((lid) => (
                                <button
                                  key={lid}
                                  type="button"
                                  onClick={() => setSelectedLessonId(lid)}
                                  title="Bấm để lọc riêng bài này"
                                  className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer"
                                >
                                  {getLessonShortLabel(lid)}
                                </button>
                              ))}
                              {st.lessonViewIds.length > 6 && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  +{st.lessonViewIds.length - 6} bài
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                      {st.latestTimestamp > 0 ? formatVNDateTime(st.latestTimestamp) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: PER-CLASS SUMMARY + TOP WATCHED LESSONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Per-School & Per-Class Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {isEn ? 'Breakdown by School & Class' : 'Tổng hợp theo từng Trường & từng Lớp'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? 'Total learning visits, video views, and active ratio per class'
                  : 'Tỉ lệ học sinh đã vào học và xem video của từng lớp (phục vụ báo cáo SKKN)'}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 tabular-nums">
              {schoolClassBreakdown.length} {isEn ? 'classes' : 'lớp'}
            </span>
          </div>

          {schoolClassBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {isEn ? 'No class data available.' : 'Chưa có dữ liệu lớp học trong bộ lọc đang chọn.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-3">{isEn ? 'School' : 'Trường THPT'}</th>
                    <th className="px-3 py-3">{isEn ? 'Class' : 'Lớp'}</th>
                    <th className="px-3 py-3 text-right">{isEn ? 'Active / Total' : 'Đã học / Sĩ số'}</th>
                    <th className="px-3 py-3 text-right">{isEn ? 'Watched Video' : 'HS xem Video'}</th>
                    <th className="px-3 py-3 text-right">{isEn ? 'Visits' : 'Truy cập'}</th>
                    <th className="px-4 py-3 text-right">{isEn ? 'Video Views' : 'Lượt Video'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {schoolClassBreakdown.map((row) => (
                    <tr
                      key={row.key}
                      onClick={() => {
                        setSelectedSchool(row.schoolName);
                        setSelectedClass(row.className);
                      }}
                      title="Bấm để lọc riêng lớp này"
                      className="hover:bg-sky-50/60 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.schoolName}</td>
                      <td className="px-3 py-3 font-black text-slate-900">{row.className}</td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-700 tabular-nums">
                        {row.uniqueStudents.size}/{row.rosterCount}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-teal-700 tabular-nums">
                        {row.videoStudents.size}/{row.rosterCount}
                      </td>
                      <td className="px-3 py-3 text-right font-black text-sky-700 tabular-nums">
                        {row.visitCount}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-teal-700 tabular-nums">
                        {row.videoViewCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Top Video Lectures & Lessons Ranking */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-teal-600" />
              <span>
                {isEn ? 'Views by Lesson (Click to Inspect)' : 'Lượt xem theo từng Bài học (Bấm để xem DS HS)'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {isEn
                ? 'Click any lesson below to see exactly which students watched it'
                : 'Bấm trực tiếp vào một bài để lọc ngay danh sách học sinh đã / chưa xem bài đó'}
            </p>
          </div>

          {lessonRankings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {isEn
                ? 'No video or lesson views recorded yet.'
                : 'Chưa có lượt xem video hoặc mở bài học nào được ghi nhận.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {lessonRankings.slice(0, 20).map((item, idx) => {
                const widthPct = Math.max(8, Math.round((item.videoViews / maxVideoViews) * 100));
                const isSelected = selectedLessonId === item.lessonId;
                return (
                  <button
                    key={item.lessonId}
                    type="button"
                    onClick={() =>
                      setSelectedLessonId(isSelected ? 'all' : item.lessonId)
                    }
                    className={`w-full text-left px-5 py-3.5 space-y-1.5 transition cursor-pointer ${
                      isSelected ? 'bg-teal-50/90' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-2">
                          {item.lessonTitle}
                        </span>
                      </div>
                      <span className="text-xs font-black text-teal-700 shrink-0 tabular-nums">
                        {item.videoViews} video
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all"
                        style={{ width: `${item.videoViews > 0 ? widthPct : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {isEn ? 'Watched video:' : 'HS xem video:'}{' '}
                        <strong className="text-teal-700 tabular-nums">
                          {item.uniqueVideoStudents.size}
                        </strong>
                      </span>
                      <span>
                        {isEn ? 'Opened theory:' : 'Mở lý thuyết:'}{' '}
                        <strong className="text-slate-700 tabular-nums">
                          {item.lessonViews} ({item.uniqueLessonStudents.size} HS)
                        </strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: RECENT ACTIVITY LOG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {isEn ? 'Recent Learning & Video Activity Log' : 'Nhật ký truy cập học tập & xem video gần nhất'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isEn
                ? 'Showing up to 60 latest student activity events'
                : 'Hiển thị tối đa 60 hoạt động mới nhất (tên học sinh, lớp, thời gian và bài đã xem)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: isEn ? 'All' : 'Tất cả' },
                { id: 'visit', label: isEn ? 'Visits' : 'Truy cập học tập' },
                { id: 'video_view', label: isEn ? 'Video Views' : 'Xem Video' },
                { id: 'lesson_view', label: isEn ? 'Lesson Study' : 'Học bài lý thuyết' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLogTypeFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  logTypeFilter === opt.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {isEn ? 'No activity logs yet.' : 'Chưa có nhật ký hoạt động nào trong bộ lọc này.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-4 py-3">{isEn ? 'Time' : 'Thời gian'}</th>
                  <th className="px-4 py-3">{isEn ? 'Student' : 'Học sinh'}</th>
                  <th className="px-4 py-3">{isEn ? 'Class / School' : 'Lớp / Trường'}</th>
                  <th className="px-4 py-3">{isEn ? 'Activity' : 'Hoạt động'}</th>
                  <th className="px-4 py-3">{isEn ? 'Detail' : 'Nội dung bài học'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentLogs.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                      {formatVNDateTime(act.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{act.studentName}</div>
                      <div className="text-[11px] text-slate-500">{act.studentCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{act.className}</div>
                      <div className="text-[11px] text-slate-500">{act.schoolName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {act.type === 'video_view' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                          <Film className="w-3 h-3" />
                          <span>{isEn ? 'Video View' : 'Xem Video'}</span>
                        </span>
                      ) : act.type === 'lesson_view' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                          <BookOpen className="w-3 h-3" />
                          <span>{isEn ? 'Lesson Study' : 'Học bài lý thuyết'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
                          <Activity className="w-3 h-3" />
                          <span>{isEn ? 'Learning Visit' : 'Truy cập học tập'}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {act.lessonTitle ||
                        (isEn ? 'Entered learning platform' : 'Vào hệ thống học tập Địa lí 10')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
