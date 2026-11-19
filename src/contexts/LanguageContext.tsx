import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  isEn: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const LANGUAGE_STORAGE_KEY = 'dia_li_10_language';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  vi: {
    // Top Bar & Identity
    'app.program': 'GDPT 2018',
    'app.school_name': 'TRƯỜNG THPT HÒA BÌNH – XÃ VẠN LINH – TỈNH LẠNG SƠN',
    'app.department': 'TỔ SỬ – ĐỊA – GDKTPL',
    'app.textbook': 'KẾT NỐI TRI THỨC VỚI CUỘC SỐNG',
    'app.teacher_in_charge': 'Giáo viên phụ trách:',
    'app.title': 'ĐỊA LÍ 10',
    'app.subtitle': 'CHINH PHỤC TRI THỨC',
    'app.platform_desc': 'Nền tảng giáo dục số • THPT Hòa Bình – Lạng Sơn',

    // Navigation Tabs
    'nav.home': 'Trang chủ',
    'nav.lessons': 'Kho bài học (40 bài)',
    'nav.practice': 'Luyện tập 4 dạng',
    'nav.exams': 'Thi & Kiểm tra',
    'nav.stats': 'Tiến độ cá nhân',
    'nav.teacher_admin': 'Quản trị Giáo viên',

    // User Profile
    'user.profile_title': 'Hồ sơ người học',
    'user.class': 'Lớp',
    'user.school': 'Trường',
    'user.official_student': 'Học sinh chính thức',
    'user.extended_learner': 'Người học mở rộng',
    'user.teacher_role': 'Giáo viên bộ môn',
    'user.switch_user': 'Đổi học sinh',
    'user.logout': 'Đăng xuất',
    'user.login_as_teacher': 'Đăng nhập Giáo viên',

    // Home Screen
    'home.hero_badge': 'HỆ THỐNG DẠY HỌC & KIỂM TRA ĐÁNH GIÁ SỐ HÓA',
    'home.hero_title': 'Khám phá chương trình môn Địa lí 10 – Đầy đủ 40 bài học',
    'home.hero_desc': 'Giải pháp chuyển đổi số hỗ trợ học sinh THPT Hòa Bình và người học phát triển năng lực tự học, làm chủ kiến thức và đạt điểm cao theo chuẩn Chương trình GDPT 2018.',
    'home.cta_explore': 'Khám phá 40 bài học',
    'home.cta_practice': 'Luyện tập 4 dạng chuẩn',
    'home.curriculum_overview': 'Cấu trúc chương trình SGK Địa lí 10 – Kết nối tri thức',
    'home.part1_title': 'Phần 1: Một số vấn đề chung',
    'home.part1_desc': 'Định hướng nghề nghiệp, vị trí và vai trò của tri thức địa lí trong đời sống hiện đại.',
    'home.part2_title': 'Phần 2: Địa lí Tự nhiên (7 chương, 18 bài)',
    'home.part2_desc': 'Bản đồ, Trái Đất, thạch quyển, khí quyển, thủy quyển, sinh quyển và các quy luật tự nhiên.',
    'home.part3_title': 'Phần 3: Địa lí Kinh tế – Xã hội (5 chương, 21 bài)',
    'home.part3_desc': 'Dân cư, nguồn lực phát triển, nông nghiệp, công nghiệp, dịch vụ và phát triển bền vững.',
    'home.formats_title': 'Ma trận câu hỏi 4 dạng theo cấu trúc Bộ Giáo dục & Đào tạo',
    'home.format1_title': 'Trắc nghiệm 4 lựa chọn',
    'home.format1_desc': 'Kiểm tra nhận thức cốt lõi, khả năng suy luận và hiểu biết địa lí toàn diện.',
    'home.format2_title': 'Đúng / Sai có ngữ liệu',
    'home.format2_desc': 'Khai thác tư liệu, bảng số liệu, bản đồ, rèn luyện tư duy phản biện đa chiều.',
    'home.format3_title': 'Bài tập tính toán địa lí',
    'home.format3_desc': 'Tập trung tính tỉ trọng, tốc độ tăng trưởng, mật độ dân số, bình quân đầu người, năng suất.',
    'home.format4_title': 'Ghép nối hai cột',
    'home.format4_desc': 'Xác lập mối liên hệ nhân quả, quy luật địa lí và lựa chọn biểu đồ thích hợp.',
    'home.quote_teacher': 'Nhắn gửi từ cô Bùi Thị Hồng Hạnh (Tổ Sử – Địa – GDKTPL):',
    'home.quote_text': 'Môn Địa lí không chỉ trang bị kiến thức về tự nhiên và xã hội mà còn rèn luyện cho các em tư duy không gian, khả năng đọc hiểu dữ liệu và tinh thần trách nhiệm với quê hương Lạng Sơn.',

    // Lessons Screen
    'lessons.title': 'Thư Viện Bài Học Chuẩn SGK',
    'lessons.subtitle': 'Đầy đủ 40 bài học môn Địa lí 10 bộ sách Kết nối tri thức với cuộc sống. Tích hợp mục tiêu, kiến thức trọng tâm, khái niệm then chốt và ví dụ thực tiễn.',
    'lessons.search_placeholder': 'Tìm kiếm bài học, khái niệm, chương...',
    'lessons.all_parts': 'Tất cả các phần',
    'lessons.filter_chapter': 'Lọc theo chương',
    'lessons.duration': 'thời lượng',
    'lessons.view_details': 'Xem kiến thức trọng tâm',
    'lessons.start_practice': 'Luyện tập bài này',
    'lessons.objectives': 'Mục tiêu bài học cần đạt',
    'lessons.key_knowledge': 'Đơn vị kiến thức trọng tâm',
    'lessons.key_terms': 'Thuật ngữ & Khái niệm then chốt',
    'lessons.real_world': 'Liên hệ thực tiễn & Địa phương',
    'lessons.key_takeaways': 'Ghi nhớ cốt lõi',

    // Practice Hub
    'practice.title': 'Trung Tâm Luyện Tập Trắc Nghiệm',
    'practice.subtitle': 'Rèn luyện kĩ năng giải quyết 4 dạng câu hỏi chuẩn GDPT 2018. Tự động chấm điểm, phân tích tỉ mỉ và phản hồi tức thời.',
    'practice.select_mode': 'Chọn hình thức luyện tập',
    'practice.by_lesson': 'Luyện tập theo từng bài học',
    'practice.by_format': 'Luyện tập chuyên sâu theo dạng',
    'practice.comprehensive': 'Luyện tập tổng hợp đa dạng',
    'practice.question_count': 'Số lượng câu hỏi',
    'practice.time_limit': 'Thời gian làm bài',
    'practice.start_button': 'Bắt đầu làm bài ngay',

    // Exam Hub
    'exam.title': 'Phòng Thi & Kiểm Tra Trực Tuyến',
    'exam.subtitle': 'Hệ thống đánh giá định kì, khảo sát chuyên đề và thi học kì môn Địa lí 10 có giới hạn thời gian và xếp loại tự động.',
    'exam.tab_teacher': 'Đề do GV Bùi Thị Hồng Hạnh giao',
    'exam.tab_midterm': 'Đề thi Giữa kì',
    'exam.tab_final': 'Đề thi Cuối kì',
    'exam.tab_speed': 'Đề kiểm tra nhanh 15 phút',
    'exam.official_badge': 'Đề kiểm tra chính thức',
    'exam.assigned_at': 'Ngày giao:',
    'exam.deadline': 'Hạn chót:',
    'exam.status_open': 'Đang mở làm bài',
    'exam.status_expired': 'Đã hết hạn làm bài',
    'exam.status_revoked': 'Đã thu hồi đề',
    'exam.start_button': 'Vào làm bài kiểm tra',
    'exam.review_button': 'Xem lại kết quả',
    'exam.locked_notice': 'Đề thi đã khóa do hết thời hạn nộp bài.',

    // Quiz Runner
    'quiz.time_remaining': 'Thời gian còn lại:',
    'quiz.question': 'Câu',
    'quiz.flag': 'Gắn cờ',
    'quiz.unflag': 'Bỏ gắn cờ',
    'quiz.previous': 'Câu trước',
    'quiz.next': 'Câu tiếp theo',
    'quiz.submit': 'Nộp bài kiểm tra',
    'quiz.confirm_submit_title': 'Xác nhận nộp bài',
    'quiz.confirm_submit_text': 'Bạn có chắc chắn muốn nộp bài? Hãy kiểm tra lại các câu chưa trả lời hoặc câu đã gắn cờ.',
    'quiz.unanswered_warning': 'Số câu chưa trả lời:',
    'quiz.cancel': 'Tiếp tục làm bài',
    'quiz.confirm': 'Đồng ý nộp bài',
    'quiz.data_source': 'Ngữ liệu & Bảng số liệu:',
    'quiz.short_answer_hint': 'Nhập số vào ô bên dưới (không cần gõ đơn vị)',
    'quiz.matching_instruction': 'Nhấp vào một mục ở Cột A rồi nhấp vào mục tương ứng ở Cột B để nối',

    // Quiz Result
    'quiz_result.title': 'Kết Quả Bài Làm Kiểm Tra',
    'quiz_result.score': 'Điểm số đạt được:',
    'quiz_result.correct': 'Số câu đúng:',
    'quiz_result.wrong': 'Số câu sai:',
    'quiz_result.accuracy': 'Tỉ lệ chính xác:',
    'quiz_result.duration': 'Thời gian làm:',
    'quiz_result.rank_excellent': 'Xuất sắc',
    'quiz_result.rank_good': 'Giỏi',
    'quiz_result.rank_fair': 'Khá',
    'quiz_result.rank_average': 'Trung bình',
    'quiz_result.rank_poor': 'Cần cố gắng',
    'quiz_result.detailed_review': 'Xem Lại Chi Tiết & Lời Giải Chuẩn',
    'quiz_result.return_home': 'Về trang chủ',
    'quiz_result.try_again': 'Làm lại đề này',

    // Student Stats
    'stats.title': 'Báo Cáo Tiến Độ & Năng Lực Cá Nhân',
    'stats.subtitle': 'Theo dõi lịch sử rèn luyện, tỉ lệ chính xác theo từng chương, từng dạng bài và các chủ đề cần củng cố.',
    'stats.total_attempts': 'Tổng lượt làm bài',
    'stats.avg_score': 'Điểm trung bình',
    'stats.highest_score': 'Điểm cao nhất',
    'stats.completion_rate': 'Tỉ lệ hoàn thành',
    'stats.by_chapter': 'Năng lực theo từng chương',
    'stats.by_format': 'Năng lực theo 4 dạng bài',
    'stats.recent_history': 'Lịch sử làm bài gần đây',

    // Teacher Dashboard
    'teacher.title': 'Cổng Quản Trị Chuyên Môn Giáo Viên',
    'teacher.subtitle': 'Quản lí phân quyền, giao đề kiểm tra, giám sát chất lượng học sinh chính thức và xuất báo cáo Sáng kiến kinh nghiệm.',
    'teacher.tab_multischool': 'Mạng lưới nhiều trường',
    'teacher.tab_analytics': 'Phân tích lớp học',
    'teacher.tab_questions': 'Ngân hàng câu hỏi',
    'teacher.tab_exams': 'Quản lí đề thi & Giao bài',
    'teacher.tab_classes': 'Danh sách học sinh',
    'teacher.tab_report': 'Báo cáo SKKN',
    'teacher.language_filter': 'Lọc ngôn ngữ bài nộp:',
    'teacher.all_languages': 'Tất cả (Song ngữ)',
    'teacher.lang_vi': 'Tiếng Việt',
    'teacher.lang_en': 'English',
    'teacher.assign_exam': 'Giao đề kiểm tra',
    'teacher.extend_deadline': 'Gia hạn nộp bài',
    'teacher.revoke_exam': 'Thu hồi đề',
    'teacher.history': 'Lịch sử điều chỉnh',

    // Footer
    'footer.school_credit': 'TRƯỜNG THPT HÒA BÌNH – XÃ VẠN LINH, TỈNH LẠNG SƠN',
    'footer.subject_credit': 'Tổ Sử – Địa – GDKTPL • Giáo viên phụ trách: Bùi Thị Hồng Hạnh',
    'footer.rights': 'Bản quyền thuộc về Trường THPT Hòa Bình. Chuẩn chương trình GDPT 2018.',
  },
  en: {
    // Top Bar & Identity
    'app.program': 'NATIONAL CURRICULUM 2018',
    'app.school_name': 'HOA BINH HIGH SCHOOL – VAN LINH COMMUNE – LANG SON PROVINCE',
    'app.department': 'DEPARTMENT OF HISTORY – GEOGRAPHY – CITIZENSHIP EDUCATION',
    'app.textbook': 'CONNECTING KNOWLEDGE TO LIFE TEXTBOOK',
    'app.teacher_in_charge': 'Subject Teacher:',
    'app.title': 'GEOGRAPHY 10',
    'app.subtitle': 'KNOWLEDGE CONQUEST',
    'app.platform_desc': 'Digital Education Platform • Hoa Binh High School – Lang Son',

    // Navigation Tabs
    'nav.home': 'Home',
    'nav.lessons': 'Lesson Library (40 Lessons)',
    'nav.practice': '4-Format Practice',
    'nav.exams': 'Exams & Tests',
    'nav.stats': 'Personal Progress',
    'nav.teacher_admin': 'Teacher Portal',

    // User Profile
    'user.profile_title': 'Learner Profile',
    'user.class': 'Class',
    'user.school': 'School',
    'user.official_student': 'Official Student',
    'user.extended_learner': 'Open Learner',
    'user.teacher_role': 'Subject Teacher',
    'user.switch_user': 'Switch Student',
    'user.logout': 'Sign Out',
    'user.login_as_teacher': 'Teacher Sign In',

    // Home Screen
    'home.hero_badge': 'DIGITAL TEACHING & STANDARDIZED ASSESSMENT SYSTEM',
    'home.hero_title': 'Explore Grade 10 Geography Curriculum – Complete 40 Lessons',
    'home.hero_desc': 'A digital learning solution empowering Hoa Binh High School students and independent learners to master geographic skills, achieve high performance, and excel under the 2018 General Education Curriculum.',
    'home.cta_explore': 'Explore 40 Lessons',
    'home.cta_practice': 'Practice 4 Formats',
    'home.curriculum_overview': 'Curriculum Framework: Geography 10 – Connecting Knowledge',
    'home.part1_title': 'Part 1: General Issues',
    'home.part1_desc': 'Career orientation, position and core role of geographic knowledge in modern life.',
    'home.part2_title': 'Part 2: Physical Geography (7 Chapters, 18 Lessons)',
    'home.part2_desc': 'Maps, Earth, lithosphere, atmosphere, hydrosphere, biosphere, and planetary geographic laws.',
    'home.part3_title': 'Part 3: Socio-Economic Geography (5 Chapters, 21 Lessons)',
    'home.part3_desc': 'Global population, development resources, agriculture, industry, services, and green growth.',
    'home.formats_title': 'Standard 4-Format Assessment Matrix (Ministry of Education & Training)',
    'home.format1_title': 'Multiple Choice (4 Options)',
    'home.format1_desc': 'Assess core comprehension, spatial reasoning, and holistic geographic literacy.',
    'home.format2_title': 'True / False with Context Data',
    'home.format2_desc': 'Analyze real scientific texts, statistical tables, and maps to cultivate critical thinking.',
    'home.format3_title': 'Geographic Calculation & Numerical Entry',
    'home.format3_desc': 'Calculate percentage shares, growth rates, population density, GDP per capita, and agricultural yields.',
    'home.format4_title': 'Two-Column Matching',
    'home.format4_desc': 'Establish cause-effect links, geographic laws, and identify optimal chart representations.',
    'home.quote_teacher': 'Message from Teacher Bui Thi Hong Hanh (History – Geography – Law):',
    'home.quote_text': 'Geography not only equips you with knowledge of nature and human society, but also trains your spatial reasoning, quantitative data analysis, and sense of stewardship for our homeland Lang Son.',

    // Lessons Screen
    'lessons.title': 'Standardized Lesson Library',
    'lessons.subtitle': 'Complete 40 lessons of Grade 10 Geography (Connecting Knowledge). Integrated with learning objectives, core knowledge, key terms, and local case studies.',
    'lessons.search_placeholder': 'Search lessons, key terms, chapters...',
    'lessons.all_parts': 'All Parts',
    'lessons.filter_chapter': 'Filter by Chapter',
    'lessons.duration': 'duration',
    'lessons.view_details': 'View Core Knowledge',
    'lessons.start_practice': 'Practice This Lesson',
    'lessons.objectives': 'Learning Objectives',
    'lessons.key_knowledge': 'Core Knowledge Units',
    'lessons.key_terms': 'Key Concepts & Definitions',
    'lessons.real_world': 'Real-World & Local Applications',
    'lessons.key_takeaways': 'Key Takeaways',

    // Practice Hub
    'practice.title': 'Practice & Assessment Hub',
    'practice.subtitle': 'Sharpen your skills across 4 standardized question formats. Instant scoring, step-by-step guidance, and real-time feedback.',
    'practice.select_mode': 'Select Practice Mode',
    'practice.by_lesson': 'Practice by Individual Lesson',
    'practice.by_format': 'Specialized Practice by Format',
    'practice.comprehensive': 'Comprehensive Multi-Format Test',
    'practice.question_count': 'Number of Questions',
    'practice.time_limit': 'Time Limit',
    'practice.start_button': 'Start Practice Now',

    // Exam Hub
    'exam.title': 'Online Examination & Testing Hall',
    'exam.subtitle': 'Periodic evaluations, specialized skill surveys, and semester exams in Grade 10 Geography with official timers and automated ranking.',
    'exam.tab_teacher': 'Teacher Bui Thi Hong Hanh Assigned Exams',
    'exam.tab_midterm': 'Midterm Examinations',
    'exam.tab_final': 'Final Semester Examinations',
    'exam.tab_speed': '15-Minute Speed Checks',
    'exam.official_badge': 'Official Examination',
    'exam.assigned_at': 'Assigned on:',
    'exam.deadline': 'Deadline:',
    'exam.status_open': 'Currently Open',
    'exam.status_expired': 'Submission Expired',
    'exam.status_revoked': 'Exam Revoked',
    'exam.start_button': 'Start Examination',
    'exam.review_button': 'Review Submission',
    'exam.locked_notice': 'This exam is locked because the submission deadline has passed.',

    // Quiz Runner
    'quiz.time_remaining': 'Time Remaining:',
    'quiz.question': 'Question',
    'quiz.flag': 'Flag',
    'quiz.unflag': 'Unflag',
    'quiz.previous': 'Previous',
    'quiz.next': 'Next',
    'quiz.submit': 'Submit Test',
    'quiz.confirm_submit_title': 'Confirm Submission',
    'quiz.confirm_submit_text': 'Are you sure you want to submit your test? Please check any unanswered or flagged questions.',
    'quiz.unanswered_warning': 'Unanswered questions:',
    'quiz.cancel': 'Keep Working',
    'quiz.confirm': 'Yes, Submit',
    'quiz.data_source': 'Scientific Context & Data Grid:',
    'quiz.short_answer_hint': 'Enter numerical value only (do not type units)',
    'quiz.matching_instruction': 'Click an item in Column A, then click the matching item in Column B',

    // Quiz Result
    'quiz_result.title': 'Assessment Results & Score Report',
    'quiz_result.score': 'Final Score:',
    'quiz_result.correct': 'Correct Answers:',
    'quiz_result.wrong': 'Incorrect Answers:',
    'quiz_result.accuracy': 'Accuracy Rate:',
    'quiz_result.duration': 'Time Spent:',
    'quiz_result.rank_excellent': 'Excellent',
    'quiz_result.rank_good': 'Good',
    'quiz_result.rank_fair': 'Fair',
    'quiz_result.rank_average': 'Average',
    'quiz_result.rank_poor': 'Needs Improvement',
    'quiz_result.detailed_review': 'Detailed Answer Review & Solutions',
    'quiz_result.return_home': 'Back to Home',
    'quiz_result.try_again': 'Retake This Test',

    // Student Stats
    'stats.title': 'Personal Competency & Progress Report',
    'stats.subtitle': 'Track your learning trajectory, accuracy rates across chapters and question formats, and pinpoint areas for reinforcement.',
    'stats.total_attempts': 'Total Attempts',
    'stats.avg_score': 'Average Score',
    'stats.highest_score': 'Highest Score',
    'stats.completion_rate': 'Completion Rate',
    'stats.by_chapter': 'Competency by Chapter',
    'stats.by_format': 'Competency by 4 Formats',
    'stats.recent_history': 'Recent Attempt History',

    // Teacher Dashboard
    'teacher.title': 'Teacher Academic Administration Portal',
    'teacher.subtitle': 'Manage access roles, assign standardized exams, monitor student growth, and generate pedagogical research evidence.',
    'teacher.tab_multischool': 'Multi-School Network',
    'teacher.tab_analytics': 'Class Analytics',
    'teacher.tab_questions': 'Question Bank Audit',
    'teacher.tab_exams': 'Exam Management & Assigning',
    'teacher.tab_classes': 'Student Roster',
    'teacher.tab_report': 'SKKN Scientific Report',
    'teacher.language_filter': 'Filter Submissions by Language:',
    'teacher.all_languages': 'All Languages (Bilingual)',
    'teacher.lang_vi': 'Vietnamese Submissions',
    'teacher.lang_en': 'English Submissions',
    'teacher.assign_exam': 'Assign New Exam',
    'teacher.extend_deadline': 'Extend Deadline',
    'teacher.revoke_exam': 'Revoke Exam',
    'teacher.history': 'Adjustment Log',

    // Footer
    'footer.school_credit': 'HOA BINH HIGH SCHOOL – VAN LINH COMMUNE, LANG SON PROVINCE',
    'footer.subject_credit': 'Department of History – Geography – Law • Teacher in charge: Bui Thi Hong Hanh',
    'footer.rights': 'All rights reserved by Hoa Binh High School. National Curriculum 2018.',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  isEn: false,
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
        if (saved === 'vi' || saved === 'en') return saved;
      }
    } catch {
      // Ignore SecurityError in restricted iframes
    }
    return 'vi';
  });

  const isEn = language === 'en';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        window.dispatchEvent(new CustomEvent('app_language_changed', { detail: lang }));
      }
    } catch {
      // Ignore storage write errors in restricted iframes
    }
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && (e.newValue === 'vi' || e.newValue === 'en')) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = (key: string, defaultText?: string): string => {
    return TRANSLATIONS[language]?.[key] || defaultText || TRANSLATIONS.vi[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isEn, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/**
 * Modern, responsive Bilingual Language Switcher with 🇻🇳 TIẾNG VIỆT and 🇬🇧 ENGLISH buttons.
 */
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xs backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
          language === 'vi'
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs ring-1 ring-amber-300/50 scale-[1.02]'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title="Chuyển sang giao diện Tiếng Việt"
      >
        <span className="text-sm">🇻🇳</span>
        <span className="tracking-wide">TIẾNG VIỆT</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs ring-1 ring-blue-300/50 scale-[1.02]'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title="Switch to English interface"
      >
        <span className="text-sm">🇬🇧</span>
        <span className="tracking-wide">ENGLISH</span>
      </button>
    </div>
  );
};
