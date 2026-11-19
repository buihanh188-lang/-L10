export type Role = 'student' | 'teacher' | 'admin';

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export type QuestionType = 'multiple_choice' | 'true_false_context' | 'short_answer' | 'matching';

export interface UserProfile {
  id: string;
  role: Role;
  studentType?: 'official' | 'extended'; // Nhóm 1: Chính thức (lớp cô Hạnh) | Nhóm 2: Mở rộng
  username?: string;
  name: string;
  code: string; // Mã học sinh hoặc Mã giáo viên
  className?: string; // Lớp (ví dụ: 10A1, 10A2)
  school: string; // Tên trường THPT
  commune?: string;
  province: string;
  department?: string; // Ví dụ: TỔ SỬ – ĐỊA – GDKTPL
  email?: string;
  avatar?: string;
  isActivated?: boolean;
  lastLoginAt?: string;
  managedByTeacher?: string; // 'Bùi Thị Hồng Hạnh'
  gender?: string;
  dateOfBirth?: string;
  joinedDate: string;
}

export interface CurriculumPart {
  id: string; // 'phan-1' | 'phan-2' | 'phan-3'
  number: number; // 1, 2, 3
  title: string;
  description: string;
}

export interface CurriculumChapter {
  id: string; // 'chuong-1' to 'chuong-13'
  partId: string; // 'phan-2' | 'phan-3'
  number: number; // 1 to 13
  title: string;
  description: string;
  lessonsCount: number;
}

// Backward compatibility alias
export interface Topic {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  lessonsCount: number;
}

export interface KeyKnowledgeSection {
  sectionTitle: string;
  content: string[];
  highlight?: string;
  diagramAscii?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface Lesson {
  id: string; // 'bai-1' to 'bai-40'
  partId: string; // 'phan-1' | 'phan-2' | 'phan-3'
  chapterId?: string | null; // 'chuong-1' to 'chuong-13' (Bài 1 không thuộc chương nào trong 13 chương)
  topicId: string; // Alias for backward compatibility
  number: number; // 1 to 40
  title: string;
  subtitle: string;
  durationMinutes: number;
  isPracticeLesson?: boolean; // Các bài thực hành (Bài 8, 10, 13, 16, 27, 32, 38)
  objectives: string[];
  keyKnowledge: KeyKnowledgeSection[];
  keyTerms: {
    term: string;
    definition: string;
  }[];
  realWorldExamples: string[];
  keyTakeaways: string[];
  visualData: {
    title: string;
    description: string;
    type: 'earth' | 'map' | 'chart' | 'diagram' | 'data';
    tags: string[];
  };
}

// Dạng 1: Trắc nghiệm 4 lựa chọn
export interface MultipleChoiceQuestion {
  id: string;
  topicId: string;
  chapterId?: string | null;
  partId?: string;
  lessonId: string;
  type: 'multiple_choice';
  cognitiveLevel: CognitiveLevel;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string;
  referenceData?: string;
  funFact?: string;
  curiosityHook?: string;
  illustrationEmoji?: string;
}

// Dạng 2: Trắc nghiệm Đúng/Sai có ngữ liệu bắt buộc
export interface TrueFalseStatement {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean; // true = Đúng, false = Sai
  explanation: string;
}

export interface TrueFalseContextQuestion {
  id: string;
  topicId: string;
  chapterId?: string | null;
  partId?: string;
  lessonId: string;
  type: 'true_false_context';
  cognitiveLevel: CognitiveLevel;
  contextTitle: string;
  contextText: string;
  contextDataGrid?: {
    headers: string[];
    rows: (string | number)[][];
  };
  contextSource?: string;
  statements: [TrueFalseStatement, TrueFalseStatement, TrueFalseStatement, TrueFalseStatement];
  funFact?: string;
  curiosityHook?: string;
  illustrationEmoji?: string;
}

// Dạng 3: Bài tập tính toán địa lí (học sinh nhập kết quả bằng số)
export interface ShortAnswerQuestion {
  id: string;
  topicId: string;
  chapterId?: string | null;
  partId?: string;
  lessonId: string;
  type: 'short_answer';
  cognitiveLevel: CognitiveLevel;
  question: string;
  formula?: string; // Công thức tính toán địa lí
  calculationSteps?: string[]; // Các bước giải và phép tính chi tiết
  numericValue?: number; // Giá trị số chuẩn của kết quả
  tolerance?: number; // Sai số cho phép (dung sai, ví dụ 0.1 hoặc 0.05)
  roundingRule?: string; // Yêu cầu làm tròn số (ví dụ: làm tròn 1 chữ số thập phân, làm tròn hàng đơn vị)
  unit: string; // Đơn vị tính địa lí (%, °C, mm, người/km², kg/người, triệu tấn.km, tỉ m³, giờ, km,...)
  guide: string; // Hướng dẫn cách làm và công thức
  acceptedAnswers: string[]; // Danh sách các cách viết đáp án số được chấp nhận
  standardAnswer: string;
  explanation: string;
  funFact?: string;
  curiosityHook?: string;
  illustrationEmoji?: string;
}

// Dạng 4: Câu hỏi nối cột
export interface MatchingPair {
  id: string;
  left: string; // Cột A
  right: string; // Cột B
  reason?: string; // Giải thích ngắn gọn vì sao cặp này nối với nhau
}

export interface MatchingQuestion {
  id: string;
  topicId: string;
  chapterId?: string | null;
  partId?: string;
  lessonId: string;
  type: 'matching';
  cognitiveLevel: CognitiveLevel;
  title: string;
  columnATitle: string;
  columnBTitle: string;
  pairs: MatchingPair[];
  explanation: string;
  funFact?: string;
  curiosityHook?: string;
  illustrationEmoji?: string;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseContextQuestion
  | ShortAnswerQuestion
  | MatchingQuestion;

// Answers state during test
export interface StudentAnswers {
  [questionId: string]: {
    multipleChoiceIndex?: number;
    trueFalseSelections?: { [stmtId in 'a' | 'b' | 'c' | 'd']?: boolean };
    shortAnswerText?: string;
    matchingConnections?: { [leftId: string]: string }; // leftId -> rightId
    isFlagged?: boolean;
  };
}

export interface QuestionGradingDetail {
  questionId: string;
  lessonId?: string;
  chapterId?: string | null;
  topicId?: string;
  type: QuestionType;
  status?: 'correct' | 'wrong' | 'unanswered';
  maxScore: number;
  earnedScore: number;
  isFullyCorrect: boolean;
  isPartiallyCorrect?: boolean;
  isUnanswered?: boolean;
  feedback: string;
  questionText?: string;
  userAnswerText?: string;
  correctAnswerText?: string;
  explanation?: string;
  options?: string[];
  selectedOptionIndex?: number;
  shortAnswerRaw?: string;
  trueFalseSelections?: { [stmtId: string]: boolean | undefined };
  matchingConnections?: { [leftId: string]: string };
  contextTitle?: string;
  contextText?: string;
  contextSource?: string;
  statementsDetail?: {
    id: string;
    text: string;
    userAnswer?: boolean;
    correctAnswer: boolean;
    isCorrect: boolean;
    explanation?: string;
  }[];
  pairsDetail?: {
    leftId?: string;
    left: string;
    userRightId?: string;
    userRight?: string;
    correctRightId?: string;
    correctRight: string;
    isCorrect: boolean;
  }[];
}

export interface ExamRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  schoolName: string; // Tên trường (Bắt buộc theo mô hình nhiều trường)
  className: string; // Tên lớp (Bắt buộc)
  lessonId?: string; // Mã bài học (ví dụ: 'bai-1' đến 'bai-40')
  chapterId?: string | null;
  lessonTitle?: string;
  questionType?: QuestionType | 'all';
  title: string;
  mode: 'practice_topic' | 'practice_type' | 'practice_comprehensive' | 'official_test';
  timestamp: number;
  date?: string;
  durationSeconds: number;
  timeLimitMinutes?: number;
  totalQuestions: number;
  answeredCount?: number;
  unansweredCount?: number;
  score: number; // Thang 10
  correctCount: number;
  wrongCount: number;
  accuracyRate: number; // %
  language?: 'vi' | 'en'; // Ngôn ngữ làm bài (Hỗ trợ song ngữ Việt - Anh)
  details: QuestionGradingDetail[];
  studentAnswers?: StudentAnswers;
  topicBreakdown: { [topicId: string]: { total: number; correct: number } };
  typeBreakdown: { [type in QuestionType]: { total: number; correct: number } };
  weakTopics: string[];
  strongTopics: string[];
  recommendation: string;
}

export interface Classroom {
  id: string;
  name: string;
  schoolName: string;
  teacherName: string;
  joinCode: string;
  studentCount: number;
  academicYear: string;
}

export interface ExamDeadlineHistoryItem {
  id: string;
  modifiedAt: string; // ISO string with VN real-time
  type: 'initial' | 'extend' | 'revoke' | 'restore';
  previousDeadline?: string;
  newDeadline?: string;
  reason?: string;
  teacherName?: string;
}

export interface TeacherExamConfig {
  id: string;
  title: string;
  schoolName?: string;
  className: string;
  timeMinutes: number;
  questionIds: string[];
  createdAt: string; // Thời điểm tạo đề
  assignedAt?: string; // Thời điểm giáo viên thực sự giao đề cho học sinh (ISO string)
  isAssigned?: boolean; // Trạng thái đã giao đề chính thức (true) hay là bản nháp/đề mẫu (false)
  isSample?: boolean; // Đánh dấu đề mẫu ngân hàng
  deadline?: string;
  isActive: boolean;
  isRevoked?: boolean;
  revokedAt?: string;
  deadlineHistory?: ExamDeadlineHistoryItem[];
}

// Multi-School Statistical Models
export interface SchoolStats {
  schoolName: string;
  code?: string;
  commune?: string;
  province?: string;
  classCount: number;
  studentCount: number;
  attemptCount: number;
  practiceCount: number;
  examCount: number;
  avgScore: number;
  highestScore: number;
  completionRate: number; // %
  classes: string[];
}

export interface ClassStats {
  schoolName: string;
  className: string;
  studentCount: number;
  activeStudentCount?: number;
  attemptCount: number;
  practiceCount: number;
  examCount: number;
  avgScore: number;
  highestScore: number;
  completionRate: number;
  students: StudentStatsSummary[];
}

export interface StudentStatsSummary {
  studentId: string;
  studentName: string;
  studentCode: string;
  schoolName: string;
  className: string;
  studentType: 'official' | 'extended';
  username?: string;
  isActivated?: boolean;
  lastLoginAt?: string;
  managedByTeacher?: string;
  gender?: string;
  dateOfBirth?: string;
  attemptCount: number;
  practiceCount: number;
  examCount: number;
  totalQuestionsAnswered: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  unansweredAnswersCount?: number;
  avgScore: number;
  highestScore: number;
  completionRate: number;
  latestAttemptDate: string;
  progressHistory: {
    id: string;
    timestamp: number;
    score: number;
    title: string;
    mode: string;
    lessonTitle?: string;
    accuracyRate: number;
  }[];
  chapterBreakdown?: { [chapterId: string]: { total: number; correct: number; rate: number } };
  lessonBreakdown?: { [lessonId: string]: { total: number; correct: number; rate: number } };
  typeBreakdown?: { [type in QuestionType]?: { total: number; correct: number; rate: number } };
  weakTopics?: string[];
  frequentMistakes?: { questionText: string; topicTitle: string; count: number }[];
}

export interface ImportStudentRow {
  code: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  className: string;
  school: string;
  username?: string;
  initialPassword?: string;
}

export interface SKKNEfficacyComparison {
  metric: string;
  preWebApp: {
    scoreAvg: number;
    goodRate: number; // % Giỏi (>= 8.0)
    fairRate: number; // % Khá (6.5 - 7.9)
    avgRate: number; // % Trung bình (5.0 - 6.4)
    weakRate: number; // % Yếu (< 5.0)
    shortAnswerAccuracy: number; // % đúng dạng trả lời ngắn
    trueFalseAccuracy: number; // % đúng dạng đúng sai ngữ liệu
  };
  postWebApp: {
    scoreAvg: number;
    goodRate: number;
    fairRate: number;
    avgRate: number;
    weakRate: number;
    shortAnswerAccuracy: number;
    trueFalseAccuracy: number;
  };
  growth: {
    scoreDelta: number;
    goodRateDelta: number;
    weakRateDelta: number;
    shortAnswerDelta: number;
  };
}

export interface SystemSummary {
  totalSchools: number;
  totalClasses: number;
  totalStudents: number;
  totalAttempts: number;
  totalPracticeAttempts: number;
  totalExamAttempts: number;
  overallAvgScore: number;
  averageCompletionRate: number;
}

export interface MultiSchoolFilterOptions {
  schoolName: string; // 'all' hoặc tên trường
  className: string; // 'all' hoặc tên lớp
  studentName: string;
  lessonId: string; // 'all' hoặc 'bai-1'..'bai-40'
  questionType: string; // 'all' hoặc QuestionType
  mode: string; // 'all' hoặc 'practice_topic' | 'practice_type' | 'official_test'
  timeRange: 'all' | 'today' | '7days' | '30days';
}

export type LessonVideoStatus =
  | 'not_created'
  | 'script_ready'
  | 'processing'
  | 'completed'
  | 'error';

export type VideoPipelineStep =
  | 'idle'
  | 'reading_lesson'
  | 'analyzing_objectives'
  | 'generating_script'
  | 'splitting_scenes'
  | 'creating_visuals'
  | 'synthesizing_audio'
  | 'compositing_video'
  | 'ready_for_approval'
  | 'failed';

export interface VideoScenePlan {
  sceneNumber: number;
  phase: 'intro' | 'objectives' | 'knowledge' | 'local_example' | 'practice_bridge' | 'summary';
  title: string;
  durationSeconds: number;
  narration: string;
  onScreenKeywords: string[];
  visualPrompt: string;
  visualType: 'illustration' | 'map_diagram' | 'chart_data' | 'motion_clip';
  subtitleText: string;
  assetImagePath?: string;
  assetClipPath?: string;
  assetAudioPath?: string;
}

export interface LessonVideoScript {
  lessonId: string;
  title: string;
  learningObjectivesSummary: string;
  targetDurationSeconds: number;
  voiceStyle: string;
  fullNarration: string;
  webVttContent: string;
  scenes: VideoScenePlan[];
  updatedAt: number;
  generatedBy: 'ai_gemini' | 'teacher_edited';
}

export type ExternalVideoProvider = 'google_drive' | 'youtube' | 'direct_url';

export interface ExternalVideoLink {
  rawUrl: string;
  normalizedUrl: string;
  provider: ExternalVideoProvider;
  playbackType: 'iframe' | 'html5_video';
  durationSeconds?: number | null;
  subtitleUrl?: string | null;
  note?: string;
  updatedAt: number;
}

export interface VideoArtifactMeta {
  version: number;
  videoUrl: string;
  subtitleUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number;
  fileSizeBytes: number;
  createdAt: number;
}

export interface LessonVideoRecord {
  lessonId: string;
  lessonNumber: number;
  partId: string;
  chapterId: string | null;
  lessonTitle: string;
  isPracticeLesson: boolean;
  status: LessonVideoStatus;
  currentStep: VideoPipelineStep;
  stepMessage: string;
  progressPercent: number;
  durationSeconds: number | null;
  videoUrl: string | null;
  subtitleUrl: string | null;
  thumbnailUrl: string | null;
  fileSizeBytes: number | null;
  version: number;
  draftVideo: VideoArtifactMeta | null;
  externalVideo?: ExternalVideoLink | null;
  isApproved: boolean;
  isPublished: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  script: LessonVideoScript | null;
  errorCode: string | null;
  errorMessage: string | null;
  updatedAt: number;
  createdAt: number | null;
}

export interface VideoQueueState {
  isRunning: boolean;
  isPaused: boolean;
  mode: 'idle' | 'scripts_batch' | 'videos_batch' | 'single_video';
  activeLessonId: string | null;
  pendingLessonIds: string[];
  completedCount: number;
  failedCount: number;
  totalQueued: number;
  startedAt: number | null;
  updatedAt: number;
  lastError: string | null;
}

export interface VideoCapabilities {
  geminiConfigured: boolean;
  offlineMode?: boolean;
  piperAvailable?: boolean;
  resvgAvailable?: boolean;
  zeroCostOffline?: boolean;
  ffmpegAvailable: boolean;
  ffprobeAvailable: boolean;
  sdkPackageVersion: string;
  models: {
    script: string;
    tts: string;
    image: string;
    video: string;
  };
  paidTierRequiredForMedia: boolean;
  missingRequirements: string[];
  storageDir: string;
}


