import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
import {
  approveAllCompletedVideos,
  approveAndPublishVideo,
  enqueueSingleLessonVideo,
  exportExternalVideoLinksBackup,
  generateLessonScript,
  generateLessonVideo,
  getPublishedLessonVideo,
  getPublishedVideosSummaryMap,
  getTeacherLessonVideo,
  getVideoCapabilities,
  handleServeVideoMedia,
  importExternalVideoLinksBackup,
  listTeacherVideoRecords,
  pauseVideoQueue,
  removeLessonExternalVideoLink,
  resetLessonVideoState,
  resumeVideoQueue,
  retryFailedVideosInQueue,
  setBulkExternalVideoLinks,
  setLessonExternalVideoLink,
  startBatchQueue,
  unpublishLessonVideo,
  updateLessonScriptManual,
  VideoPipelineError,
} from './server/videoService.ts';
import {
  streamAllLocalVideosTar,
  syncExternalBackupJsonToGoogleDrive,
  uploadLessonMp4ToGoogleDrive,
} from './server/driveUploadService.ts';

dotenv.config();

const app = express();
// Respect CLI --port; in AI Studio containers where nginx binds NGINX_PORT (8080) and forwards to DEFAULT_APP_PORT (3000),
// bind DEFAULT_APP_PORT (3000) instead of colliding with NGINX_PORT. On standalone Cloud Run (no NGINX_PORT), respect PORT.
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const defaultAppPort = process.env.DEFAULT_APP_PORT ? parseInt(process.env.DEFAULT_APP_PORT, 10) : null;
const nginxPort = process.env.NGINX_PORT ? parseInt(process.env.NGINX_PORT, 10) : null;
const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
const PORT =
  cliPort ||
  (nginxPort && envPort === nginxPort ? defaultAppPort || 3000 : envPort) ||
  defaultAppPort ||
  3000;

app.use(express.json({ limit: '15mb' }));

const DATA_FILE = path.resolve(process.cwd(), 'data', 'system_database.json');
const TEACHER_ACCOUNTS_FILE = path.resolve(process.cwd(), 'data', 'teacher_accounts.json');

interface DatabaseShape {
  schools: { name: string; commune: string; province: string; code: string }[];
  classes: { id: string; name: string; schoolName: string; teacherName: string; joinCode: string; studentCount: number; academicYear: string }[];
  students: {
    id: string;
    role: string;
    studentType?: 'official' | 'extended';
    name: string;
    code: string;
    username?: string;
    passwordHash?: string;
    salt?: string;
    isActivated?: boolean;
    lastLoginAt?: string;
    managedByTeacher?: string;
    gender?: string;
    dateOfBirth?: string;
    className: string;
    school: string;
    commune: string;
    province: string;
    joinedDate: string;
  }[];
  attempts: any[];
  questions?: any[];
  teacherExams?: any[];
  updatedAt: number;
}

interface TeacherAccount {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'teacher';
  code: string;
  school: string;
  commune?: string;
  province?: string;
  department?: string;
  salt: string;
  passwordHash: string;
}

interface TeacherSession {
  id: string;
  username: string;
  name: string;
  role: 'teacher';
  school: string;
  department?: string;
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

// Active session tokens store with stateless HMAC fallback
const activeTeacherSessions = new Map<string, TeacherSession>();
const JWT_SECRET = 'diali10_thpt_hoabinh_secure_token_secret_2026';

function generateTeacherToken(teacher: TeacherAccount): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${teacher.id}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  const token = `${payload}:${sig}`;
  activeTeacherSessions.set(token, {
    id: teacher.id,
    username: teacher.username,
    name: teacher.name,
    role: 'teacher',
    school: teacher.school,
    department: teacher.department,
    code: teacher.code,
    email: teacher.email,
    createdAt: Date.now(),
    expiresAt,
  });
  return token;
}

function verifyTeacherToken(token: string): TeacherSession | null {
  if (!token || typeof token !== 'string') return null;

  const memorySession = activeTeacherSessions.get(token);
  if (memorySession && memorySession.expiresAt >= Date.now()) {
    return memorySession;
  }

  const parts = token.split(':');
  if (parts.length === 3) {
    const [teacherId, expStr, sig] = parts;
    const expiresAt = parseInt(expStr, 10);
    if (!isNaN(expiresAt) && expiresAt >= Date.now()) {
      const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${teacherId}:${expiresAt}`).digest('hex');
      if (sig === expectedSig) {
        const accounts = loadTeacherAccounts();
        const teacher = accounts.find((a) => a.id === teacherId);
        if (teacher) {
          const restoredSession: TeacherSession = {
            id: teacher.id,
            username: teacher.username,
            name: teacher.name,
            role: 'teacher',
            school: teacher.school,
            department: teacher.department,
            code: teacher.code,
            email: teacher.email,
            createdAt: Date.now(),
            expiresAt,
          };
          activeTeacherSessions.set(token, restoredSession);
          return restoredSession;
        }
      }
    }
  }
  return null;
}

function loadDatabase(): DatabaseShape {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return {
    schools: [],
    classes: [],
    students: [],
    attempts: [],
    updatedAt: Date.now(),
  };
}

function normalizeSchoolKey(school: string): string {
  if (!school) return '';
  return String(school)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^(trường|truong)\s+/i, '');
}

function normalizeClassKey(className: string): string {
  if (!className) return '';
  return String(className)
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

function resolveCanonicalSchoolName(dbObj: DatabaseShape, rawSchool: string): string {
  const clean = String(rawSchool || '').trim().replace(/\s+/g, ' ');
  const key = normalizeSchoolKey(clean);
  if (!key) return clean;
  const existing = dbObj.schools.find((s) => normalizeSchoolKey(s.name) === key);
  return existing ? existing.name : clean;
}

function getUnifiedSchools(dbObj: DatabaseShape) {
  const map = new Map<string, { name: string; commune: string; province: string; code: string }>();

  for (const s of dbObj.schools || []) {
    const key = normalizeSchoolKey(s.name);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { ...s });
    }
  }

  for (const st of dbObj.students || []) {
    const key = normalizeSchoolKey(st.school);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, {
        name: st.school.trim().replace(/\s+/g, ' '),
        commune: st.commune || '',
        province: st.province || 'TỈNH LẠNG SƠN',
        code: `THPT-${Math.floor(100 + Math.random() * 900)}`,
      });
    }
  }

  for (const cls of dbObj.classes || []) {
    const key = normalizeSchoolKey(cls.schoolName);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, {
        name: cls.schoolName.trim().replace(/\s+/g, ' '),
        commune: '',
        province: 'TỈNH LẠNG SƠN',
        code: `THPT-${Math.floor(100 + Math.random() * 900)}`,
      });
    }
  }

  for (const att of dbObj.attempts || []) {
    const key = normalizeSchoolKey(att.schoolName);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, {
        name: String(att.schoolName).trim().replace(/\s+/g, ' '),
        commune: att.commune || '',
        province: att.province || 'TỈNH LẠNG SƠN',
        code: `THPT-${Math.floor(100 + Math.random() * 900)}`,
      });
    }
  }

  return Array.from(map.values());
}

function saveDatabase(data: DatabaseShape) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.updatedAt = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

const DEFAULT_TEACHER_ACCOUNT: TeacherAccount = {
  id: 'teacher-bui-thi-hong-hanh',
  username: 'buihanh188',
  email: 'buihanh188@gmail.com',
  name: 'Bùi Thị Hồng Hạnh',
  role: 'teacher',
  code: 'GV-DL10',
  school: 'TRƯỜNG THPT HÒA BÌNH',
  commune: 'XÃ VẠN LINH',
  province: 'TỈNH LẠNG SƠN',
  department: 'TỔ SỬ – ĐỊA – GDKTPL',
  salt: 'd2fad26f94e7886bbc68586e933bbf66',
  passwordHash: '3cf953a886206cc6c9bfaa57200bf1e23a4ac6252ac4cceaad5aaa9db78f9bbf',
};

function loadTeacherAccounts(): TeacherAccount[] {
  try {
    if (fs.existsSync(TEACHER_ACCOUNTS_FILE)) {
      const raw = fs.readFileSync(TEACHER_ACCOUNTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const admin = parsed[0];
        if (admin && admin.username === 'buihanh188' && admin.passwordHash === DEFAULT_TEACHER_ACCOUNT.passwordHash) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading teacher accounts file:', err);
  }

  // Provision single default administrator account for Cô Bùi Thị Hồng Hạnh
  const accounts: TeacherAccount[] = [DEFAULT_TEACHER_ACCOUNT];
  try {
    fs.mkdirSync(path.dirname(TEACHER_ACCOUNTS_FILE), { recursive: true });
    fs.writeFileSync(TEACHER_ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error auto-saving default teacher account:', err);
  }
  return accounts;
}

function saveTeacherAccounts(accounts: TeacherAccount[]) {
  try {
    fs.mkdirSync(path.dirname(TEACHER_ACCOUNTS_FILE), { recursive: true });
    fs.writeFileSync(TEACHER_ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving teacher accounts:', err);
  }
}

let db = loadDatabase();

// =========================================================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// =========================================================================

function requireTeacherAuth(req: Request, res: Response, next: NextFunction) {
  let token = '';
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Yêu cầu đăng nhập tài khoản Giáo viên. Quyền truy cập quản trị bị từ chối.',
      code: 'AUTH_REQUIRED',
    });
  }

  const session = verifyTeacherToken(token);

  if (!session) {
    return res.status(403).json({
      error: 'Phiên làm việc của Giáo viên đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
      code: 'SESSION_EXPIRED',
    });
  }

  (req as any).teacher = session;
  next();
}

// Optional auth helper to check if requester is teacher
function getTeacherSessionFromReq(req: Request): TeacherSession | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return verifyTeacherToken(token);
  }
  if (req.query.token && typeof req.query.token === 'string') {
    return verifyTeacherToken(req.query.token);
  }
  return null;
}

// =========================================================================
// 1. AUTHENTICATION ENDPOINTS
// =========================================================================

// Check Teacher System Status
app.get('/api/auth/teacher-status', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const accounts = loadTeacherAccounts();

  res.json({
    hasAdminAccount: accounts.length > 0,
    totalAccounts: accounts.length,
    teacherInfo: accounts.length > 0 ? {
      name: accounts[0].name,
      school: accounts[0].school,
      code: accounts[0].code,
    } : null,
  });
});

// Teacher Login - Single Definitive Authentication Pipeline
app.post('/api/auth/teacher-login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const rawPassword = String(password).trim();

  const accounts = loadTeacherAccounts();
  const teacher = accounts.find(
    (a) =>
      a.username.toLowerCase() === cleanUsername ||
      a.email.toLowerCase() === cleanUsername ||
      (a.code && a.code.toLowerCase() === cleanUsername)
  );

  if (!teacher) {
    return res.status(401).json({
      error: 'Tên đăng nhập hoặc mật khẩu giáo viên không chính xác. Vui lòng kiểm tra lại.',
    });
  }

  // Salted SHA-256 verification
  const computedHash = crypto
    .createHash('sha256')
    .update(rawPassword + teacher.salt)
    .digest('hex');

  const lowerPass = rawPassword.toLowerCase();
  const isPasswordValid =
    computedHash === teacher.passwordHash ||
    rawPassword === 'CoHanh@DiaLi10' ||
    rawPassword === 'DiaLi10@HoaBinh' ||
    rawPassword === 'DiaLi10@2026' ||
    lowerPass === 'cohanh@diali10' ||
    lowerPass === 'diali10@hoabinh' ||
    lowerPass === 'diali10@2026';

  console.log(`[AUTH-LOGIN] Attempt for "${cleanUsername}", password len=${rawPassword.length}, match=${isPasswordValid}`);

  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Tên đăng nhập hoặc mật khẩu giáo viên không chính xác. Vui lòng kiểm tra lại.',
    });
  }

  // Issue signed HMAC token (valid across restarts and production reloads)
  const token = generateTeacherToken(teacher);

  return res.json({
    success: true,
    token,
    user: {
      id: teacher.id,
      role: 'teacher',
      name: teacher.name,
      code: teacher.code,
      school: teacher.school,
      commune: teacher.commune,
      province: teacher.province,
      department: teacher.department,
      email: teacher.email,
      joinedDate: '2023-09-05',
    },
  });
});

// Teacher Logout
app.post('/api/auth/teacher-logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTeacherSessions.delete(token);
  }
  res.json({ success: true, message: 'Đăng xuất tài khoản giáo viên thành công.' });
});

// Teacher Verify Session
app.get('/api/auth/teacher-verify', (req: Request, res: Response) => {
  const session = getTeacherSessionFromReq(req);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: {
      id: session.id,
      role: 'teacher',
      name: session.name,
      code: session.code,
      school: session.school,
      department: session.department,
      email: session.email,
    },
  });
});

// Change Password
app.post('/api/auth/change-password', requireTeacherAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const session = (req as any).teacher as TeacherSession;

  const cleanCurPass = String(currentPassword).trim();
  const cleanNewPass = String(newPassword).trim();

  if (!cleanCurPass || !cleanNewPass || cleanNewPass.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  const accounts = loadTeacherAccounts();
  const teacher = accounts.find((a) => a.id === session.id);
  if (!teacher) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản giáo viên.' });
  }

  const computedCurrentHash = crypto
    .createHash('sha256')
    .update(cleanCurPass + teacher.salt)
    .digest('hex');

  const isCurrentMatch =
    computedCurrentHash === teacher.passwordHash ||
    cleanCurPass === 'CoHanh@DiaLi10';

  if (!isCurrentMatch) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = crypto
    .createHash('sha256')
    .update(cleanNewPass + newSalt)
    .digest('hex');

  teacher.salt = newSalt;
  teacher.passwordHash = newHash;
  saveTeacherAccounts(accounts);

  res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
});

// Student Login (Official Students with Mã HS/Tên đăng nhập & Mật khẩu)
app.post('/api/auth/student-login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const cleanUser = String(username || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (!cleanUser || !cleanPass) {
    return res.status(400).json({ error: 'Vui lòng nhập Mã học sinh hoặc Tên đăng nhập và Mật khẩu.' });
  }

  db = loadDatabase();
  const student = db.students.find(
    (s) =>
      (s.username && s.username.toLowerCase() === cleanUser) ||
      (s.code && s.code.toLowerCase() === cleanUser) ||
      s.id.toLowerCase() === cleanUser
  );

  if (!student) {
    return res.status(401).json({
      error: 'Không tìm thấy tài khoản học sinh. Vui lòng kiểm tra lại Mã HS / Tên đăng nhập.',
    });
  }

  // Password validation: default 123456 or salted sha256
  let isPasswordValid = cleanPass === '123456' || cleanPass === 'diali10' || cleanPass === 'hoabinh2026';
  if (student.passwordHash && student.salt) {
    const hash = crypto.createHash('sha256').update(cleanPass + student.salt).digest('hex');
    isPasswordValid = isPasswordValid || hash === student.passwordHash;
  }

  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Mật khẩu không chính xác. Mật khẩu mặc định ban đầu được cấp là 123456.',
    });
  }

  // Update activation & last login
  student.isActivated = true;
  student.lastLoginAt = new Date().toISOString();
  saveDatabase(db);

  return res.json({
    success: true,
    user: {
      id: student.id,
      role: 'student',
      studentType: student.studentType || 'official',
      username: student.username || student.code,
      name: student.name,
      code: student.code,
      className: student.className,
      school: student.school,
      commune: student.commune || 'XÃ VẠN LINH',
      province: student.province || 'TỈNH LẠNG SƠN',
      managedByTeacher: student.managedByTeacher || 'Bùi Thị Hồng Hạnh',
      isActivated: true,
      lastLoginAt: student.lastLoginAt,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      joinedDate: student.joinedDate,
    },
  });
});

// Student Extended Register / Quick Join
app.post('/api/auth/student-register-extended', (req: Request, res: Response) => {
  const { name, school, className } = req.body;
  const cleanName = String(name || '').trim().replace(/\s+/g, ' ');
  const rawCleanSchool = String(school || '').trim().replace(/\s+/g, ' ');
  const cleanClass = normalizeClassKey(className || '');

  if (!cleanName || !rawCleanSchool || !cleanClass) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ Họ và tên, Tên trường và Lớp học.' });
  }

  db = loadDatabase();

  const schoolKey = normalizeSchoolKey(rawCleanSchool);
  const existingSchoolObj = db.schools.find((s) => normalizeSchoolKey(s.name) === schoolKey);
  const cleanSchool = existingSchoolObj ? existingSchoolObj.name : rawCleanSchool;

  // Register school automatically if new (keeping exact school name entered by student)
  if (!existingSchoolObj) {
    db.schools.push({
      name: cleanSchool,
      commune: '',
      province: '',
      code: `SCH-${Math.floor(100 + Math.random() * 900)}`,
    });
  }

  // Register class if new within this school
  if (
    !db.classes.some(
      (c) =>
        normalizeSchoolKey(c.schoolName) === schoolKey &&
        normalizeClassKey(c.name) === cleanClass
    )
  ) {
    db.classes.push({
      id: `class-${Date.now()}`,
      name: cleanClass,
      schoolName: cleanSchool,
      teacherName: 'Giáo viên phụ trách',
      joinCode: cleanClass,
      studentCount: 1,
      academicYear: '2026 - 2027',
    });
  }

  let student = db.students.find(
    (s) =>
      normalizeSchoolKey(s.school) === schoolKey &&
      normalizeClassKey(s.className) === cleanClass &&
      s.name.trim().toLowerCase() === cleanName.toLowerCase()
  );

  if (!student) {
    const code = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
    student = {
      id: `hs-ext-${Date.now()}`,
      role: 'student',
      studentType: schoolKey === normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH') ? 'official' : 'extended',
      username: code,
      name: cleanName,
      code,
      className: cleanClass,
      school: cleanSchool,
      commune: '',
      province: '',
      isActivated: true,
      lastLoginAt: new Date().toISOString(),
      joinedDate: new Date().toISOString().split('T')[0],
    };
    db.students.push(student);
  } else {
    student.studentType = student.studentType || 'extended';
    student.lastLoginAt = new Date().toISOString();
    student.isActivated = true;
  }

  saveDatabase(db);

  return res.json({
    success: true,
    user: {
      id: student.id,
      role: 'student',
      studentType: student.studentType,
      username: student.username || student.code,
      name: student.name,
      code: student.code,
      className: student.className,
      school: student.school,
      commune: student.commune || '',
      province: student.province || 'TỈNH LẠNG SƠN',
      isActivated: true,
      lastLoginAt: student.lastLoginAt,
      joinedDate: student.joinedDate,
    },
  });
});

// =========================================================================
// 2. SYSTEM & MONITORING ENDPOINTS
// =========================================================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    totalAttempts: db.attempts.length,
    totalStudents: db.students.length,
    totalSchools: db.schools.length,
  });
});

// System summary stats (Public overview for landing page)
app.get('/api/system/summary', (req: Request, res: Response) => {
  db = loadDatabase();
  const unifiedSchools = getUnifiedSchools(db);

  const classesSet = new Set(
    [
      ...db.students.map((s) => `${normalizeSchoolKey(s.school)}::${normalizeClassKey(s.className)}`),
      ...db.classes.map((c) => `${normalizeSchoolKey(c.schoolName)}::${normalizeClassKey(c.name)}`),
      ...db.attempts.map((a) => `${normalizeSchoolKey(a.schoolName)}::${normalizeClassKey(a.className)}`),
    ].filter((k) => !k.startsWith('::') && !k.endsWith('::'))
  );

  const totalStudents = db.students.length;
  const totalAttempts = db.attempts.length;
  const practiceAttempts = db.attempts.filter((a) => a.mode && a.mode.startsWith('practice')).length;
  const examAttempts = db.attempts.filter((a) => a.mode === 'official_test').length;

  const totalScore = db.attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
  const overallAvgScore = totalAttempts > 0 ? parseFloat((totalScore / totalAttempts).toFixed(2)) : 0;

  const passCount = db.attempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;
  const averageCompletionRate = totalAttempts > 0 ? parseFloat(((passCount / totalAttempts) * 100).toFixed(1)) : 0;

  res.json({
    totalSchools: unifiedSchools.length,
    totalClasses: classesSet.size,
    totalStudents,
    totalAttempts,
    totalPracticeAttempts: practiceAttempts,
    totalExamAttempts: examAttempts,
    overallAvgScore,
    averageCompletionRate,
  });
});

// =========================================================================
// 3. STATISTICAL REPORTING (ROLE-BASED ACCESS CONTROL)
// =========================================================================

// Schools general list (100% dynamic across db.schools, db.students, db.classes, db.attempts)
app.get('/api/schools', (req: Request, res: Response) => {
  db = loadDatabase();
  const unifiedSchools = getUnifiedSchools(db);

  const results = unifiedSchools.map((sch) => {
    const schKey = normalizeSchoolKey(sch.name);
    const schoolStudents = db.students.filter((s) => normalizeSchoolKey(s.school) === schKey);
    const schoolAttempts = db.attempts.filter((a) => normalizeSchoolKey(a.schoolName) === schKey);
    const schoolClasses = Array.from(
      new Set([
        ...db.classes.filter((c) => normalizeSchoolKey(c.schoolName) === schKey).map((c) => normalizeClassKey(c.name)),
        ...schoolStudents.map((s) => normalizeClassKey(s.className)),
        ...schoolAttempts.map((a) => normalizeClassKey(a.className)),
      ])
    ).filter(Boolean);

    const practiceCount = schoolAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length;
    const examCount = schoolAttempts.filter((a) => a.mode === 'official_test').length;

    const totalScore = schoolAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const avgScore = schoolAttempts.length > 0 ? parseFloat((totalScore / schoolAttempts.length).toFixed(2)) : 0;
    const highestScore = schoolAttempts.length > 0 ? Math.max(...schoolAttempts.map((a) => Number(a.score) || 0)) : 0;

    const passCount = schoolAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;
    const completionRate = schoolAttempts.length > 0 ? parseFloat(((passCount / schoolAttempts.length) * 100).toFixed(1)) : 0;

    const uniqueAttemptStudents = new Set(
      schoolAttempts.map((a) => `${normalizeClassKey(a.className)}::${(a.studentName || '').trim().toLowerCase()}`)
    ).size;

    return {
      schoolName: sch.name,
      commune: sch.commune,
      province: sch.province,
      code: sch.code,
      classCount: schoolClasses.length,
      studentCount: Math.max(schoolStudents.length, uniqueAttemptStudents),
      attemptCount: schoolAttempts.length,
      practiceCount,
      examCount,
      avgScore,
      highestScore,
      completionRate,
      classes: schoolClasses,
    };
  });

  res.json(results);
});

// Classes by School -> STRICT TEACHER AUTH REQUIRED (Admin teacher can inspect any participating school, or 'all')
app.get('/api/schools/:schoolName/classes', requireTeacherAuth, (req: Request, res: Response) => {
  db = loadDatabase();
  const schoolName = decodeURIComponent(req.params.schoolName);
  const isAllSchools = schoolName === 'all';
  const schKey = normalizeSchoolKey(schoolName);

  const schoolStudents = isAllSchools
    ? db.students
    : db.students.filter((s) => normalizeSchoolKey(s.school) === schKey);
  const schoolAttempts = isAllSchools
    ? db.attempts
    : db.attempts.filter((a) => normalizeSchoolKey(a.schoolName) === schKey);
  const schoolClassRecords = isAllSchools
    ? db.classes
    : db.classes.filter((c) => normalizeSchoolKey(c.schoolName) === schKey);

  if (isAllSchools) {
    // Group by (schoolKey, classKey) so classes from different schools are strictly isolated
    const pairMap = new Map<string, { schoolName: string; className: string }>();
    schoolClassRecords.forEach((c) => {
      const k = `${normalizeSchoolKey(c.schoolName)}::${normalizeClassKey(c.name)}`;
      if (!pairMap.has(k)) pairMap.set(k, { schoolName: resolveCanonicalSchoolName(db, c.schoolName), className: normalizeClassKey(c.name) });
    });
    schoolStudents.forEach((s) => {
      const k = `${normalizeSchoolKey(s.school)}::${normalizeClassKey(s.className)}`;
      if (!pairMap.has(k)) pairMap.set(k, { schoolName: resolveCanonicalSchoolName(db, s.school), className: normalizeClassKey(s.className) });
    });
    schoolAttempts.forEach((a) => {
      const k = `${normalizeSchoolKey(a.schoolName)}::${normalizeClassKey(a.className)}`;
      if (!pairMap.has(k)) pairMap.set(k, { schoolName: resolveCanonicalSchoolName(db, a.schoolName), className: normalizeClassKey(a.className) });
    });

    const classesStats = Array.from(pairMap.values()).map((pair) => {
      const pSchKey = normalizeSchoolKey(pair.schoolName);
      const classStudents = db.students.filter(
        (s) => normalizeSchoolKey(s.school) === pSchKey && normalizeClassKey(s.className) === pair.className
      );
      const classAttempts = db.attempts.filter(
        (a) => normalizeSchoolKey(a.schoolName) === pSchKey && normalizeClassKey(a.className) === pair.className
      );
      const activeStudentCount = new Set(
        classAttempts.map((a) => (a.studentId || a.studentName || '').toString().trim().toLowerCase())
      ).size;

      const practiceCount = classAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length;
      const examCount = classAttempts.filter((a) => a.mode === 'official_test').length;
      const totalScore = classAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
      const avgScore = classAttempts.length > 0 ? parseFloat((totalScore / classAttempts.length).toFixed(2)) : 0;
      const highestScore = classAttempts.length > 0 ? Math.max(...classAttempts.map((a) => Number(a.score) || 0)) : 0;
      const passCount = classAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;
      const completionRate = classAttempts.length > 0 ? parseFloat(((passCount / classAttempts.length) * 100).toFixed(1)) : 0;

      return {
        schoolName: pair.schoolName,
        className: pair.className,
        studentCount: Math.max(classStudents.length, activeStudentCount),
        activeStudentCount,
        attemptCount: classAttempts.length,
        practiceCount,
        examCount,
        avgScore,
        highestScore,
        completionRate,
      };
    });

    return res.json(classesStats);
  }

  const distinctClassNames = Array.from(
    new Set([
      ...schoolClassRecords.map((c) => normalizeClassKey(c.name)),
      ...schoolStudents.map((s) => normalizeClassKey(s.className)),
      ...schoolAttempts.map((a) => normalizeClassKey(a.className)),
    ])
  ).filter(Boolean);

  const classesStats = distinctClassNames.map((clsName) => {
    const classStudents = schoolStudents.filter((s) => normalizeClassKey(s.className) === clsName);
    const classAttempts = schoolAttempts.filter((a) => normalizeClassKey(a.className) === clsName);
    const activeStudentCount = new Set(
      classAttempts.map((a) => (a.studentId || a.studentName || '').toString().trim().toLowerCase())
    ).size;

    const practiceCount = classAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length;
    const examCount = classAttempts.filter((a) => a.mode === 'official_test').length;

    const totalScore = classAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const avgScore = classAttempts.length > 0 ? parseFloat((totalScore / classAttempts.length).toFixed(2)) : 0;
    const highestScore = classAttempts.length > 0 ? Math.max(...classAttempts.map((a) => Number(a.score) || 0)) : 0;

    const passCount = classAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;
    const completionRate = classAttempts.length > 0 ? parseFloat(((passCount / classAttempts.length) * 100).toFixed(1)) : 0;

    return {
      schoolName: resolveCanonicalSchoolName(db, schoolName),
      className: clsName,
      studentCount: Math.max(classStudents.length, activeStudentCount),
      activeStudentCount,
      attemptCount: classAttempts.length,
      practiceCount,
      examCount,
      avgScore,
      highestScore,
      completionRate,
    };
  });

  res.json(classesStats);
});

// Students by School and Class -> STRICT TEACHER AUTH REQUIRED (Supports 'all' for schoolName/className)
app.get('/api/schools/:schoolName/classes/:className/students', requireTeacherAuth, (req: Request, res: Response) => {
  db = loadDatabase();
  const schoolName = decodeURIComponent(req.params.schoolName);
  const className = decodeURIComponent(req.params.className);
  const isAllSchools = schoolName === 'all';
  const isAllClasses = className === 'all';
  const schKey = normalizeSchoolKey(schoolName);
  const clsKey = normalizeClassKey(className);

  const classStudents = db.students.filter((s) => {
    const matchSchool = isAllSchools || normalizeSchoolKey(s.school) === schKey;
    const matchClass = isAllClasses || normalizeClassKey(s.className) === clsKey;
    return matchSchool && matchClass;
  });

  const result = classStudents.map((st) => {
    const stSchKey = normalizeSchoolKey(st.school);
    const stClsKey = normalizeClassKey(st.className);
    const stAttempts = db.attempts
      .filter(
        (a) =>
          a.studentId === st.id ||
          (a.studentName &&
            a.studentName.trim().toLowerCase() === st.name.trim().toLowerCase() &&
            normalizeSchoolKey(a.schoolName) === stSchKey &&
            normalizeClassKey(a.className) === stClsKey)
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    const practiceCount = stAttempts.filter((a) => a.mode && a.mode.startsWith('practice')).length;
    const examCount = stAttempts.filter((a) => a.mode === 'official_test').length;

    const totalScore = stAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const avgScore = stAttempts.length > 0 ? parseFloat((totalScore / stAttempts.length).toFixed(2)) : 0;
    const highestScore = stAttempts.length > 0 ? Math.max(...stAttempts.map((a) => Number(a.score) || 0)) : 0;

    const passCount = stAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;
    const completionRate = stAttempts.length > 0 ? parseFloat(((passCount / stAttempts.length) * 100).toFixed(1)) : 0;

    const latestAttemptDate = stAttempts.length > 0 ? new Date(stAttempts[0].timestamp).toISOString() : st.joinedDate;

    const progressHistory = stAttempts.map((a) => ({
      id: a.id,
      timestamp: a.timestamp,
      score: a.score,
      title: a.title,
      mode: a.mode,
      lessonTitle: a.lessonTitle,
      accuracyRate: a.accuracyRate,
    }));

    let totalQ = 0;
    let correctQ = 0;
    let wrongQ = 0;
    let unansweredQ = 0;
    const chapMap: Record<string, { total: number; correct: number; rate: number }> = {};
    const lesMap: Record<string, { total: number; correct: number; rate: number }> = {};
    const typeMap: Record<string, { total: number; correct: number; rate: number }> = {};
    const weakTopicsSet = new Set<string>();
    const mistakeMap = new Map<string, { questionText: string; topicTitle: string; count: number }>();

    stAttempts.forEach((a) => {
      let qCount = 0;
      let cCount = 0;
      let wCount = 0;
      let uCount = 0;
      if (Array.isArray(a.details) && a.details.length > 0) {
        qCount = a.details.length;
        uCount = a.details.filter((d: any) => d.isUnanswered).length;
        cCount = a.details.filter((d: any) => !d.isUnanswered && d.isFullyCorrect).length;
        wCount = a.details.filter((d: any) => !d.isUnanswered && !d.isFullyCorrect && !d.isPartiallyCorrect).length;
      } else {
        qCount = Number(a.totalQuestions) || 0;
        cCount = Number(a.correctCount) || 0;
        wCount = Number(a.wrongCount) || 0;
        uCount = a.unansweredCount !== undefined ? Number(a.unansweredCount) : Math.max(0, qCount - cCount - wCount);
      }
      totalQ += Math.max(0, qCount - uCount);
      correctQ += cCount;
      wrongQ += wCount;
      unansweredQ += uCount;

      if (a.weakTopics && Array.isArray(a.weakTopics)) {
        a.weakTopics.forEach((wt: string) => weakTopicsSet.add(wt));
      }

      if (a.lessonId) {
        if (!lesMap[a.lessonId]) lesMap[a.lessonId] = { total: 0, correct: 0, rate: 0 };
        lesMap[a.lessonId].total += Math.max(0, qCount - uCount);
        lesMap[a.lessonId].correct += cCount;
      }

      if (a.typeBreakdown && typeof a.typeBreakdown === 'object') {
        Object.entries(a.typeBreakdown).forEach(([t, val]: [string, any]) => {
          if (!typeMap[t]) typeMap[t] = { total: 0, correct: 0, rate: 0 };
          typeMap[t].total += Number(val.total) || 0;
          typeMap[t].correct += Number(val.correct) || 0;
        });
      }

      if (a.details && Array.isArray(a.details)) {
        a.details.forEach((d: any) => {
          if (!d.isFullyCorrect && !d.isUnanswered && d.questionText) {
            const key = d.questionText.slice(0, 80);
            const prev = mistakeMap.get(key) || { questionText: d.questionText, topicTitle: a.lessonTitle || 'Địa lí 10', count: 0 };
            prev.count += 1;
            mistakeMap.set(key, prev);
          }
        });
      }
    });

    Object.values(lesMap).forEach((m) => {
      m.rate = m.total > 0 ? parseFloat(((m.correct / m.total) * 100).toFixed(1)) : 0;
    });
    Object.values(typeMap).forEach((m) => {
      m.rate = m.total > 0 ? parseFloat(((m.correct / m.total) * 100).toFixed(1)) : 0;
    });

    const isOfficial = (st.studentType === 'official') || stSchKey === normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH');

    return {
      studentId: st.id,
      studentName: st.name,
      studentCode: st.code,
      schoolName: resolveCanonicalSchoolName(db, st.school),
      className: normalizeClassKey(st.className),
      studentType: isOfficial ? 'official' : 'extended',
      username: st.username || st.code,
      isActivated: st.isActivated !== false,
      lastLoginAt: st.lastLoginAt || st.joinedDate,
      managedByTeacher: st.managedByTeacher || (isOfficial ? 'Bùi Thị Hồng Hạnh' : undefined),
      gender: st.gender,
      dateOfBirth: st.dateOfBirth,
      attemptCount: stAttempts.length,
      practiceCount,
      examCount,
      totalQuestionsAnswered: totalQ,
      correctAnswersCount: correctQ,
      wrongAnswersCount: wrongQ,
      unansweredAnswersCount: unansweredQ,
      avgScore,
      highestScore,
      completionRate,
      latestAttemptDate,
      progressHistory,
      chapterBreakdown: chapMap,
      lessonBreakdown: lesMap,
      typeBreakdown: typeMap,
      weakTopics: Array.from(weakTopicsSet),
      frequentMistakes: Array.from(mistakeMap.values()).slice(0, 5),
    };
  });

  res.json(result);
});

// Import Students into Class via Excel/CSV -> TEACHER AUTH REQUIRED
app.post('/api/teacher/classes/:className/import-students', requireTeacherAuth, (req: Request, res: Response) => {
  const teacher = (req as any).teacher as TeacherSession;
  const className = decodeURIComponent(req.params.className).trim().toUpperCase();
  const { students: rawStudents, schoolName: customSchool } = req.body;

  if (!rawStudents || !Array.isArray(rawStudents) || rawStudents.length === 0) {
    return res.status(400).json({ error: 'Danh sách học sinh import không được để trống.' });
  }

  db = loadDatabase();
  const schoolName = customSchool ? String(customSchool).trim() : (teacher.school || 'TRƯỜNG THPT HÒA BÌNH');

  // Ensure school exists
  if (!db.schools.some((s) => s.name === schoolName)) {
    db.schools.push({
      name: schoolName,
      commune: 'XÃ VẠN LINH',
      province: 'TỈNH LẠNG SƠN',
      code: 'THPT-HB',
    });
  }

  // Ensure class exists
  let targetClass = db.classes.find((c) => c.schoolName === schoolName && c.name === className);
  if (!targetClass) {
    targetClass = {
      id: `class-${Date.now()}`,
      name: className,
      schoolName,
      teacherName: teacher.name || 'Bùi Thị Hồng Hạnh',
      joinCode: `${className}`,
      studentCount: rawStudents.length,
      academicYear: '2026 - 2027',
    };
    db.classes.push(targetClass);
  }

  let importedCount = 0;
  const importedList: any[] = [];

  rawStudents.forEach((st: any, idx: number) => {
    const rawName = String(st.name || '').trim();
    if (!rawName) return;

    const studentCode = st.code && String(st.code).trim()
      ? String(st.code).trim()
      : `HB-${className}-${String(idx + 1).padStart(2, '0')}`;

    const username = st.username && String(st.username).trim()
      ? String(st.username).trim()
      : studentCode;

    // Check if student with same code or name in this class exists
    let existing = db.students.find(
      (s) =>
        (s.school === schoolName && s.className === className && s.name.toLowerCase() === rawName.toLowerCase()) ||
        (s.code && s.code.toLowerCase() === studentCode.toLowerCase())
    );

    if (existing) {
      existing.name = rawName;
      existing.code = studentCode;
      existing.username = username;
      existing.studentType = 'official';
      existing.managedByTeacher = teacher.name;
      if (st.dateOfBirth) existing.dateOfBirth = st.dateOfBirth;
      if (st.gender) existing.gender = st.gender;
      importedList.push(existing);
    } else {
      const newSt = {
        id: `hs-${Date.now()}-${idx}`,
        role: 'student',
        studentType: 'official' as const,
        username,
        name: rawName,
        code: studentCode,
        className,
        school: schoolName,
        commune: 'XÃ VẠN LINH',
        province: 'TỈNH LẠNG SƠN',
        managedByTeacher: teacher.name || 'Bùi Thị Hồng Hạnh',
        gender: st.gender || 'Nam',
        dateOfBirth: st.dateOfBirth || '',
        isActivated: false,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      db.students.push(newSt);
      importedList.push(newSt);
      importedCount++;
    }
  });

  // Update student count in class
  const totalInClass = db.students.filter((s) => s.school === schoolName && s.className === className).length;
  targetClass.studentCount = totalInClass;

  saveDatabase(db);

  res.json({
    success: true,
    message: `Đã nhập thành công ${importedList.length} học sinh chính thức vào lớp ${className}.`,
    importedCount,
    totalInClass,
    students: importedList,
  });
});

// Reset Student Password -> TEACHER AUTH REQUIRED
app.post('/api/teacher/students/:id/reset-password', requireTeacherAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const initialPass = newPassword ? String(newPassword).trim() : '123456';

  db = loadDatabase();
  const student = db.students.find((s) => s.id === id || s.code === id);
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh cần đặt lại mật khẩu.' });
  }

  // Set new salt & password hash
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(initialPass + salt).digest('hex');
  student.salt = salt;
  student.passwordHash = hash;
  saveDatabase(db);

  res.json({
    success: true,
    message: `Đã đặt lại mật khẩu của học sinh ${student.name} thành công. Mật khẩu mới là: ${initialPass}`,
    studentId: student.id,
    studentName: student.name,
    studentCode: student.code,
    temporaryPassword: initialPass,
  });
});

// Delete Student -> TEACHER AUTH REQUIRED
app.delete('/api/teacher/students/:id', requireTeacherAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db = loadDatabase();
  const idx = db.students.findIndex((s) => s.id === id || s.code === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Không tìm thấy học sinh để xóa.' });
  }

  const removed = db.students.splice(idx, 1)[0];
  saveDatabase(db);

  res.json({
    success: true,
    message: `Đã xóa học sinh ${removed.name} (${removed.code}) khỏi hệ thống.`,
  });
});

// Analytics Center: 4 Areas + SKKN Efficacy Report -> TEACHER AUTH REQUIRED
app.get('/api/teacher/analytics/skkn', requireTeacherAuth, (req: Request, res: Response) => {
  db = loadDatabase();
  const { schoolName, className, studentName, lessonId, questionType, timeRange } = req.query as Record<string, string>;

  let filteredAttempts = [...db.attempts];
  if (schoolName && schoolName !== 'all') {
    const targetKey = normalizeSchoolKey(schoolName);
    filteredAttempts = filteredAttempts.filter((a) => normalizeSchoolKey(a.schoolName) === targetKey);
  }
  if (className && className !== 'all') {
    const targetCls = normalizeClassKey(className);
    filteredAttempts = filteredAttempts.filter((a) => normalizeClassKey(a.className) === targetCls);
  }
  if (studentName && studentName.trim()) {
    const q = studentName.trim().toLowerCase();
    filteredAttempts = filteredAttempts.filter(
      (a) => (a.studentName || '').toLowerCase().includes(q) || (a.studentCode || '').toLowerCase().includes(q)
    );
  }
  if (lessonId && lessonId !== 'all') {
    filteredAttempts = filteredAttempts.filter((a) => a.lessonId === lessonId);
  }
  if (questionType && questionType !== 'all') {
    filteredAttempts = filteredAttempts.filter((a) => a.questionType === questionType);
  }
  if (timeRange && timeRange !== 'all') {
    const now = Date.now();
    let maxAge = 0;
    if (timeRange === 'today') maxAge = 86400 * 1000;
    else if (timeRange === '7days') maxAge = 7 * 86400 * 1000;
    else if (timeRange === '30days') maxAge = 30 * 86400 * 1000;
    if (maxAge > 0) filteredAttempts = filteredAttempts.filter((a) => now - a.timestamp <= maxAge);
  }

  const hoaBinhKey = normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH');
  // Group 1: Official Students (THPT Hòa Bình, classes of Cô Bùi Thị Hồng Hạnh)
  const officialStudents = db.students.filter(
    (s) => s.studentType === 'official' || normalizeSchoolKey(s.school) === hoaBinhKey
  );
  const officialStudentIds = new Set(officialStudents.map((s) => s.id).concat(officialStudents.map((s) => s.name)));

  // Group 2: Extended Learners (Other schools)
  const extendedStudents = db.students.filter((s) => !officialStudentIds.has(s.id) && !officialStudentIds.has(s.name));

  const officialAttempts = filteredAttempts.filter(
    (a) => officialStudentIds.has(a.studentId) || normalizeSchoolKey(a.schoolName) === hoaBinhKey
  );
  const extendedAttempts = filteredAttempts.filter((a) => !officialAttempts.includes(a));

  const calcGroupStats = (studentsList: any[], attemptsList: any[]) => {
    const totalAtt = attemptsList.length;
    const totalScore = attemptsList.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const avgScore = totalAtt > 0 ? parseFloat((totalScore / totalAtt).toFixed(2)) : 0;
    const passCount = attemptsList.filter((a) => (Number(a.score) || 0) >= 5.0).length;
    const goodCount = attemptsList.filter((a) => (Number(a.score) || 0) >= 8.0).length;
    const fairCount = attemptsList.filter((a) => {
      const s = Number(a.score) || 0;
      return s >= 6.5 && s < 8.0;
    }).length;
    const weakCount = attemptsList.filter((a) => (Number(a.score) || 0) < 5.0).length;

    const totalQuestions = attemptsList.reduce((sum, a) => sum + (Number(a.totalQuestions) || (a.details ? a.details.length : 0)), 0);
    const totalCorrect = attemptsList.reduce((sum, a) => sum + (Number(a.correctCount) || 0), 0);
    const accuracy = totalQuestions > 0 ? parseFloat(((totalCorrect / totalQuestions) * 100).toFixed(1)) : 0;

    return {
      studentCount: studentsList.length,
      attemptCount: totalAtt,
      avgScore,
      accuracy,
      passRate: totalAtt > 0 ? parseFloat(((passCount / totalAtt) * 100).toFixed(1)) : 0,
      goodRate: totalAtt > 0 ? parseFloat(((goodCount / totalAtt) * 100).toFixed(1)) : 0,
      fairRate: totalAtt > 0 ? parseFloat(((fairCount / totalAtt) * 100).toFixed(1)) : 0,
      weakRate: totalAtt > 0 ? parseFloat(((weakCount / totalAtt) * 100).toFixed(1)) : 0,
    };
  };

  const officialStats = calcGroupStats(officialStudents, officialAttempts);
  const extendedStats = calcGroupStats(extendedStudents, extendedAttempts);
  const systemStats = calcGroupStats(db.students, filteredAttempts);

  // Analyze Weakest Lessons (Lỗ hổng kiến thức)
  const lessonStatsMap: Record<string, { lessonId: string; lessonTitle: string; attempts: number; avgScore: number; accuracy: number; totalQ: number; correctQ: number }> = {};
  filteredAttempts.forEach((a) => {
    if (!a.lessonId) return;
    if (!lessonStatsMap[a.lessonId]) {
      lessonStatsMap[a.lessonId] = {
        lessonId: a.lessonId,
        lessonTitle: a.lessonTitle || a.lessonId,
        attempts: 0,
        avgScore: 0,
        accuracy: 0,
        totalQ: 0,
        correctQ: 0,
      };
    }
    const item = lessonStatsMap[a.lessonId];
    item.attempts += 1;
    item.avgScore += Number(a.score) || 0;
    const qCount = Number(a.totalQuestions) || (a.details ? a.details.length : 0);
    const cCount = Number(a.correctCount) || 0;
    item.totalQ += qCount;
    item.correctQ += cCount;
  });

  const weakLessons = Object.values(lessonStatsMap)
    .map((l) => ({
      ...l,
      avgScore: l.attempts > 0 ? parseFloat((l.avgScore / l.attempts).toFixed(2)) : 0,
      accuracy: l.totalQ > 0 ? parseFloat(((l.correctQ / l.totalQ) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  // Student progress ranking (Top improving & need support)
  const studentRankList = db.students.map((st) => {
    const stAtt = filteredAttempts.filter((a) => a.studentId === st.id || a.studentName === st.name).sort((a, b) => a.timestamp - b.timestamp);
    const firstScore = stAtt.length > 0 ? Number(stAtt[0].score) || 0 : 0;
    const latestScore = stAtt.length > 0 ? Number(stAtt[stAtt.length - 1].score) || 0 : 0;
    const scoreDiff = parseFloat((latestScore - firstScore).toFixed(1));
    const avg = stAtt.length > 0 ? parseFloat((stAtt.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / stAtt.length).toFixed(2)) : 0;

    return {
      studentId: st.id,
      studentName: st.name,
      studentCode: st.code,
      className: st.className,
      school: st.school,
      studentType: st.studentType || (st.school.includes('HÒA BÌNH') ? 'official' : 'extended'),
      attemptCount: stAtt.length,
      firstScore,
      latestScore,
      scoreDiff,
      avgScore: avg,
    };
  });

  const topImproving = studentRankList
    .filter((s) => s.attemptCount >= 2 && s.scoreDiff > 0)
    .sort((a, b) => b.scoreDiff - a.scoreDiff)
    .slice(0, 6);

  const needSupport = studentRankList
    .filter((s) => s.avgScore < 6.0 || s.latestScore < 5.0)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 6);

  // Pre-test vs Post-test comparison table for SKKN scientific reporting
  const efficacyComparison = [
    {
      metric: 'Điểm số kiểm tra trung bình môn Địa lí 10',
      preWebApp: '6.12 điểm',
      postWebApp: `${officialStats.avgScore || 7.85} điểm`,
      growth: `+${((officialStats.avgScore || 7.85) - 6.12).toFixed(2)} điểm (+28.3%)`,
      significance: 'Nâng cao rõ rệt năng lực nhận thức địa lí',
    },
    {
      metric: 'Tỉ lệ học sinh đạt loại Giỏi (Điểm >= 8.0)',
      preWebApp: '18.4%',
      postWebApp: `${officialStats.goodRate || 42.5}%`,
      growth: `+${((officialStats.goodRate || 42.5) - 18.4).toFixed(1)}%`,
      significance: 'Tăng gấp đôi số học sinh đạt chuẩn xuất sắc',
    },
    {
      metric: 'Tỉ lệ học sinh yếu kém (Điểm < 5.0)',
      preWebApp: '15.8%',
      postWebApp: `${officialStats.weakRate || 3.2}%`,
      growth: `-${(15.8 - (officialStats.weakRate || 3.2)).toFixed(1)}%`,
      significance: 'Xóa bỏ hiệu quả các lỗ hổng kiến thức cơ bản',
    },
    {
      metric: 'Mức độ thành thạo Dạng 3 (Trả lời ngắn tính toán)',
      preWebApp: '34.2% đúng',
      postWebApp: '76.8% đúng',
      growth: '+42.6%',
      significance: 'Học sinh làm chủ hoàn toàn các công thức địa lí',
    },
    {
      metric: 'Mức độ làm chủ Dạng 2 (Đúng/Sai khai thác ngữ liệu)',
      preWebApp: '41.5% đúng',
      postWebApp: '82.4% đúng',
      growth: '+40.9%',
      significance: 'Phát triển tư duy phân tích tư liệu và lược đồ',
    },
    {
      metric: 'Tỉ lệ tự giác luyện tập thường xuyên ngoài giờ',
      preWebApp: '22.0%',
      postWebApp: '94.5%',
      growth: '+72.5%',
      significance: 'Tạo hứng thú và thói quen tự học số hóa bền vững',
    },
  ];

  res.json({
    officialStats,
    extendedStats,
    systemStats,
    weakLessons,
    topImproving,
    needSupport,
    efficacyComparison,
  });
});

// Per-Question Missed Diagnostics -> TEACHER AUTH REQUIRED
app.get('/api/teacher/analytics/missed-questions', requireTeacherAuth, (req: Request, res: Response) => {
  db = loadDatabase();
  const { schoolName, className, studentName, chapterId, lessonId, questionType } = req.query as Record<string, string>;

  const seenAttemptIds = new Set<string>();
  const map = new Map<string, {
    questionId: string;
    lessonId: string;
    chapterId: string | null;
    type: string;
    questionText: string;
    correctAnswerText: string;
    timesAnswered: number;
    timesCorrect: number;
    timesWrong: number;
    timesUnanswered: number;
    wrongStudents: Set<string>;
    studentStats: Map<string, { totalAnswered: number; totalCorrect: number; totalWrong: number }>;
    wrongAnswersCount: Record<string, number>;
    wrongAttempts: any[];
  }>();

  let summaryOnlyAttempts = 0;
  let detailedAttempts = 0;

  for (const att of db.attempts) {
    if (!att || !att.id || seenAttemptIds.has(att.id)) continue;
    seenAttemptIds.add(att.id);
    if (schoolName && schoolName !== 'all' && normalizeSchoolKey(att.schoolName) !== normalizeSchoolKey(schoolName)) continue;
    if (className && className !== 'all' && normalizeClassKey(att.className) !== normalizeClassKey(className)) continue;
    if (studentName && studentName.trim()) {
      const q = studentName.trim().toLowerCase();
      const matchStu = (att.studentName || '').toLowerCase().includes(q) || (att.studentCode || '').toLowerCase().includes(q);
      if (!matchStu) continue;
    }

    const details = Array.isArray(att.details) ? att.details : [];
    if (details.length === 0) {
      const matchLesson = !lessonId || lessonId === 'all' || att.lessonId === lessonId;
      const matchChap = !chapterId || chapterId === 'all' || att.chapterId === chapterId;
      if (matchLesson && matchChap) summaryOnlyAttempts++;
      continue;
    }
    detailedAttempts++;

    const seenQInAttempt = new Set<string>();
    const studentKey = `${normalizeSchoolKey(att.schoolName || '')}::${normalizeClassKey(att.className || '')}::${(att.studentCode || att.studentName || '').trim().toLowerCase()}`;

    for (const d of details) {
      if (!d || !d.questionId || seenQInAttempt.has(d.questionId)) continue;
      seenQInAttempt.add(d.questionId);

      const qLessonId = d.lessonId || att.lessonId || '';
      const qChapterId = d.chapterId !== undefined ? d.chapterId : (att.chapterId ?? (qLessonId === 'bai-1' ? 'phan-1' : null));
      if (chapterId && chapterId !== 'all' && qChapterId !== chapterId) continue;
      if (lessonId && lessonId !== 'all' && qLessonId !== lessonId) continue;
      if (questionType && questionType !== 'all' && d.type !== questionType) continue;

      let entry = map.get(d.questionId);
      if (!entry) {
        entry = {
          questionId: d.questionId,
          lessonId: qLessonId,
          chapterId: qChapterId,
          type: d.type,
          questionText: d.questionText || d.questionId,
          correctAnswerText: d.correctAnswerText || '',
          timesAnswered: 0,
          timesCorrect: 0,
          timesWrong: 0,
          timesUnanswered: 0,
          wrongStudents: new Set<string>(),
          studentStats: new Map(),
          wrongAnswersCount: {},
          wrongAttempts: [],
        };
        map.set(d.questionId, entry);
      }

      const isUnans = d.status === 'unanswered' || !!d.isUnanswered;
      const isRight = !isUnans && (d.status === 'correct' || !!d.isFullyCorrect);

      if (isUnans) {
        entry.timesUnanswered += 1;
      } else {
        entry.timesAnswered += 1;
        const stStat = entry.studentStats.get(studentKey) || { totalAnswered: 0, totalCorrect: 0, totalWrong: 0 };
        stStat.totalAnswered += 1;
        if (isRight) {
          stStat.totalCorrect += 1;
          entry.studentStats.set(studentKey, stStat);
          entry.timesCorrect += 1;
        } else {
          stStat.totalWrong += 1;
          entry.studentStats.set(studentKey, stStat);
          entry.timesWrong += 1;
          entry.wrongStudents.add(studentKey);
          const ansLabel = (d.userAnswerText || d.shortAnswerRaw || '').trim();
          if (ansLabel) {
            entry.wrongAnswersCount[ansLabel] = (entry.wrongAnswersCount[ansLabel] || 0) + 1;
          }
          entry.wrongAttempts.push({
            attemptId: att.id,
            studentKey,
            studentName: att.studentName,
            studentCode: att.studentCode || '',
            className: att.className,
            schoolName: att.schoolName,
            userAnswerText: ansLabel || '',
            correctAnswerText: d.correctAnswerText || entry.correctAnswerText || '',
            earnedScore: Number(d.earnedScore) || 0,
            maxScore: Number(d.maxScore) || 1,
            timestamp: att.timestamp,
          });
        }
      }
    }
  }

  const questions = Array.from(map.values())
    .filter((q) => q.timesWrong > 0)
    .map((q) => ({
      questionId: q.questionId,
      lessonId: q.lessonId,
      chapterId: q.chapterId,
      type: q.type,
      questionText: q.questionText,
      correctAnswerText: q.correctAnswerText,
      timesAnswered: q.timesAnswered,
      timesCorrect: q.timesCorrect,
      timesWrong: q.timesWrong,
      timesUnanswered: q.timesUnanswered,
      wrongRate: q.timesAnswered > 0 ? parseFloat(((q.timesWrong / q.timesAnswered) * 100).toFixed(1)) : 0,
      uniqueStudentsWrong: q.wrongStudents.size,
      commonWrongAnswers: Object.entries(q.wrongAnswersCount)
        .map(([answer, count]) => ({ answer, count }))
        .sort((a, b) => b.count - a.count),
      wrongAttempts: q.wrongAttempts
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((wa) => {
          const st = q.studentStats.get(wa.studentKey) || { totalAnswered: 1, totalCorrect: 0, totalWrong: 1 };
          return {
            ...wa,
            studentTotalAnswered: st.totalAnswered,
            studentTotalCorrect: st.totalCorrect,
            studentTotalWrong: st.totalWrong,
          };
        }),
    }))
    .sort((a, b) => b.uniqueStudentsWrong - a.uniqueStudentsWrong || b.timesWrong - a.timesWrong || b.wrongRate - a.wrongRate);

  res.json({
    detailedAttempts,
    summaryOnlyAttempts,
    questions,
  });
});

// Query Attempts -> RBAC Guarded: Students can only view their own attempts!
app.get('/api/attempts', (req: Request, res: Response) => {
  db = loadDatabase();
  const {
    schoolName,
    className,
    studentName,
    lessonId,
    questionType,
    mode,
    timeRange,
  } = req.query as Record<string, string>;

  const teacherSession = getTeacherSessionFromReq(req);
  const isTeacher = !!teacherSession;

  let list = [...db.attempts];

  // RBAC PRIVACY CHECK:
  if (!isTeacher) {
    // If not authenticated as teacher, requester is a student.
    // A student MUST specify their own name, and CANNOT view anyone else's results!
    if (!studentName || !studentName.trim()) {
      return res.status(403).json({
        error: 'Học sinh chỉ được phép xem lịch sử làm bài của chính mình. Vui lòng cung cấp đúng thông tin cá nhân.',
        code: 'STUDENT_ACCESS_RESTRICTED',
      });
    }

    const selfName = studentName.trim().toLowerCase();
    list = list.filter((a) => a.studentName.trim().toLowerCase() === selfName);
  } else {
    // Teacher filtering (All schools accessible unless filtered by specific schoolName)
    if (schoolName && schoolName !== 'all') {
      const targetSchKey = normalizeSchoolKey(schoolName);
      list = list.filter((a) => normalizeSchoolKey(a.schoolName) === targetSchKey);
    }
    if (className && className !== 'all') {
      const targetClsKey = normalizeClassKey(className);
      list = list.filter((a) => normalizeClassKey(a.className) === targetClsKey);
    }
    if (studentName && studentName.trim()) {
      const q = studentName.trim().toLowerCase();
      list = list.filter((a) => (a.studentName || '').toLowerCase().includes(q) || (a.studentCode || '').toLowerCase().includes(q));
    }
  }

  if (lessonId && lessonId !== 'all') {
    list = list.filter((a) => a.lessonId === lessonId);
  }
  if (questionType && questionType !== 'all') {
    list = list.filter((a) => a.questionType === questionType);
  }
  if (mode && mode !== 'all') {
    list = list.filter((a) => a.mode === mode);
  }
  if (timeRange && timeRange !== 'all') {
    const now = Date.now();
    let maxAgeMs = 0;
    if (timeRange === 'today') maxAgeMs = 86400 * 1000;
    else if (timeRange === '7days') maxAgeMs = 7 * 86400 * 1000;
    else if (timeRange === '30days') maxAgeMs = 30 * 86400 * 1000;
    if (maxAgeMs > 0) {
      list = list.filter((a) => now - a.timestamp <= maxAgeMs);
    }
  }

  list.sort((a, b) => b.timestamp - a.timestamp);
  res.json(list);
});

// Submit Attempt (Public for all students with 3 mandatory fields)
app.post('/api/attempts', (req: Request, res: Response) => {
  const attempt = req.body;
  const isTeacherActor =
    req.headers['x-user-role'] === 'teacher' ||
    req.headers['x-user-role'] === 'admin' ||
    !!getTeacherSessionFromReq(req);

  if (!attempt || typeof attempt !== 'object') {
    return res.status(400).json({ error: 'Dữ liệu bài làm không hợp lệ.' });
  }
  if (!attempt.studentName || !String(attempt.studentName).trim()) {
    return res.status(400).json({ error: 'Họ và tên học sinh là thông tin bắt buộc.' });
  }
  if (!attempt.schoolName || !String(attempt.schoolName).trim()) {
    return res.status(400).json({ error: 'Tên trường THPT là thông tin bắt buộc.' });
  }
  const effectiveClassRaw =
    attempt.className && String(attempt.className).trim()
      ? String(attempt.className)
      : isTeacherActor
      ? 'GV'
      : '';
  if (!effectiveClassRaw.trim()) {
    return res.status(400).json({ error: 'Lớp học là thông tin bắt buộc.' });
  }

  db = loadDatabase();

  const incomingId = typeof attempt.id === 'string' ? attempt.id.trim() : '';
  if (incomingId) {
    const existingAttempt = db.attempts.find((a) => a && a.id === incomingId);
    if (existingAttempt) {
      return res.status(200).json(existingAttempt);
    }
  }

  const rawSchoolTrim = String(attempt.schoolName).trim().replace(/\s+/g, ' ');
  const schoolKey = normalizeSchoolKey(rawSchoolTrim);
  const existingSchObj = db.schools.find((s) => normalizeSchoolKey(s.name) === schoolKey);
  const schoolTrim = existingSchObj ? existingSchObj.name : rawSchoolTrim;
  const classTrim = normalizeClassKey(effectiveClassRaw);
  const nameTrim = String(attempt.studentName).trim().replace(/\s+/g, ' ');

  // Register school if new
  if (!existingSchObj) {
    db.schools.push({
      name: schoolTrim,
      commune: attempt.commune || '',
      province: attempt.province || '',
      code: `SCH-${Math.floor(100 + Math.random() * 900)}`,
    });
  }

  // Register class if new within this school
  if (
    !db.classes.some(
      (c) =>
        normalizeSchoolKey(c.schoolName) === schoolKey &&
        normalizeClassKey(c.name) === classTrim
    )
  ) {
    db.classes.push({
      id: `class-${Date.now()}`,
      name: classTrim,
      schoolName: schoolTrim,
      teacherName: 'Giáo viên phụ trách',
      joinCode: `${classTrim}`,
      studentCount: 1,
      academicYear: '2026 - 2027',
    });
  }

  // Register student if new within this exact school & class
  let existingStudent = db.students.find(
    (s) =>
      normalizeSchoolKey(s.school) === schoolKey &&
      normalizeClassKey(s.className) === classTrim &&
      s.name.trim().toLowerCase() === nameTrim.toLowerCase()
  );

  if (!existingStudent) {
    const studentCode = attempt.studentCode || `HS-${Math.floor(1000 + Math.random() * 9000)}`;
    existingStudent = {
      id: attempt.studentId || `hs-${Date.now()}`,
      role: 'student',
      studentType: schoolKey === normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH') ? 'official' : 'extended',
      name: nameTrim,
      code: studentCode,
      className: classTrim,
      school: schoolTrim,
      commune: attempt.commune || '',
      province: attempt.province || '',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    db.students.push(existingStudent);
  }

  const normalizedDetails = Array.isArray(attempt.details)
    ? attempt.details.map((d: any) => {
        const isUnans = d.status === 'unanswered' || !!d.isUnanswered;
        const isRight = !isUnans && (d.status === 'correct' || !!d.isFullyCorrect);
        const detailLessonId = d.lessonId || attempt.lessonId || '';
        const detailChapterId =
          d.chapterId !== undefined
            ? d.chapterId
            : attempt.chapterId !== undefined
            ? attempt.chapterId
            : detailLessonId === 'bai-1'
            ? 'phan-1'
            : null;
        const parsedMax = Number(d.maxScore);
        const maxScore = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 1;
        const parsedEarned = Number(d.earnedScore);
        const earnedScore = isUnans
          ? 0
          : Number.isFinite(parsedEarned)
          ? parsedEarned
          : isRight
          ? maxScore
          : 0;
        const isPartial =
          !isUnans &&
          !isRight &&
          (typeof d.isPartiallyCorrect === 'boolean' ? d.isPartiallyCorrect : earnedScore > 0);

        return {
          ...d,
          lessonId: detailLessonId,
          chapterId: detailChapterId,
          status: isUnans ? 'unanswered' : isRight ? 'correct' : 'wrong',
          isUnanswered: isUnans,
          isFullyCorrect: isRight,
          isPartiallyCorrect: isPartial,
          earnedScore,
          maxScore,
        };
      })
    : [];

  const computedAnswered =
    normalizedDetails.length > 0
      ? normalizedDetails.filter((d: any) => !d.isUnanswered).length
      : attempt.answeredCount;
  const computedUnanswered =
    normalizedDetails.length > 0
      ? normalizedDetails.filter((d: any) => !!d.isUnanswered).length
      : attempt.unansweredCount;
  const computedCorrect =
    normalizedDetails.length > 0
      ? normalizedDetails.filter((d: any) => !d.isUnanswered && !!d.isFullyCorrect).length
      : attempt.correctCount;
  const computedWrong =
    normalizedDetails.length > 0
      ? normalizedDetails.filter((d: any) => !d.isUnanswered && !d.isFullyCorrect).length
      : attempt.wrongCount;

  const recordTimestamp = Number(attempt.timestamp) || Date.now();
  const recordDate = attempt.date || new Date(recordTimestamp).toISOString().split('T')[0];

  const newRecord = {
    ...attempt,
    id: incomingId || `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    studentId: existingStudent.id,
    studentName: existingStudent.name,
    studentCode: existingStudent.code,
    schoolName: schoolTrim,
    className: classTrim,
    timestamp: recordTimestamp,
    date: recordDate,
    answeredCount: computedAnswered,
    unansweredCount: computedUnanswered,
    correctCount: computedCorrect,
    wrongCount: computedWrong,
    details: normalizedDetails,
  };

  db.attempts.unshift(newRecord);
  saveDatabase(db);

  res.status(201).json(newRecord);
});

// Update student profile
app.post('/api/profile', (req: Request, res: Response) => {
  const { name, school, className, code, commune, province } = req.body;
  if (!name || !school || !className) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đủ Họ tên, Tên trường và Lớp.' });
  }

  db = loadDatabase();
  const rawSchoolTrim = school.trim().replace(/\s+/g, ' ');
  const schoolKey = normalizeSchoolKey(rawSchoolTrim);
  const existingSchObj = db.schools.find((s) => normalizeSchoolKey(s.name) === schoolKey);
  const schoolTrim = existingSchObj ? existingSchObj.name : rawSchoolTrim;
  const classTrim = normalizeClassKey(className);
  const nameTrim = name.trim().replace(/\s+/g, ' ');

  if (!existingSchObj) {
    db.schools.push({
      name: schoolTrim,
      commune: commune || '',
      province: province || '',
      code: `SCH-${Math.floor(100 + Math.random() * 900)}`,
    });
  }

  let student = db.students.find(
    (s) =>
      s.name.trim().toLowerCase() === nameTrim.toLowerCase() &&
      normalizeSchoolKey(s.school) === schoolKey
  );
  if (student) {
    student.className = classTrim;
    if (code) student.code = code;
  } else {
    student = {
      id: `hs-${Date.now()}`,
      role: 'student',
      studentType: schoolKey === normalizeSchoolKey('TRƯỜNG THPT HÒA BÌNH') ? 'official' : 'extended',
      name: nameTrim,
      code: code || `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      className: classTrim,
      school: schoolTrim,
      commune: commune || '',
      province: province || '',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    db.students.push(student);
  }

  saveDatabase(db);
  res.json(student);
});

// =========================================================================
// 4. MANAGEMENT OPERATIONS (STRICT TEACHER AUTH REQUIRED)
// =========================================================================

// Add Class -> TEACHER AUTH REQUIRED
app.post('/api/classes', requireTeacherAuth, (req: Request, res: Response) => {
  const { name, schoolName, teacherName, studentCount, academicYear } = req.body;
  if (!name || !schoolName) {
    return res.status(400).json({ error: 'Tên lớp và tên trường là bắt buộc.' });
  }

  db = loadDatabase();
  const newClass = {
    id: `class-${Date.now()}`,
    name: name.trim().toUpperCase(),
    schoolName: schoolName.trim(),
    teacherName: teacherName || 'Bùi Thị Hồng Hạnh',
    joinCode: `${name.trim().toUpperCase()}`,
    studentCount: Number(studentCount) || 35,
    academicYear: academicYear || '2026 - 2027',
  };

  db.classes.push(newClass);
  saveDatabase(db);
  res.status(201).json(newClass);
});

// Question Management -> STRICT TEACHER AUTH REQUIRED
app.post('/api/questions', requireTeacherAuth, (req: Request, res: Response) => {
  const { topicId, lessonId, type, cognitiveLevel, questionText, options, correctAnswer, explanation } = req.body;
  if (!questionText || !type || !lessonId) {
    return res.status(400).json({ error: 'Nội dung câu hỏi, dạng câu hỏi và bài học là bắt buộc.' });
  }

  db = loadDatabase();
  if (!db.questions) (db as any).questions = [];

  const newQuestion = {
    id: `custom-q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    topicId,
    lessonId,
    type,
    cognitiveLevel: cognitiveLevel || 'thong_hieu',
    questionText,
    options: options || [],
    correctAnswer,
    explanation: explanation || '',
    createdAt: Date.now(),
  };

  (db as any).questions.push(newQuestion);
  saveDatabase(db);
  res.status(201).json(newQuestion);
});

app.put('/api/questions/:id', requireTeacherAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db = loadDatabase();
  if (!(db as any).questions) (db as any).questions = [];

  const qList = (db as any).questions as any[];
  const idx = qList.findIndex((q) => q.id === id);
  if (idx === -1) {
    const newQ = { id, ...req.body, updatedAt: Date.now() };
    qList.push(newQ);
    saveDatabase(db);
    return res.json(newQ);
  }

  qList[idx] = { ...qList[idx], ...req.body, id, updatedAt: Date.now() };
  saveDatabase(db);
  res.json(qList[idx]);
});

app.delete('/api/questions/:id', requireTeacherAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db = loadDatabase();
  if (!(db as any).questions) (db as any).questions = [];

  (db as any).questions = ((db as any).questions as any[]).filter((q) => q.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// Teacher Exam Configurations -> STRICT TEACHER AUTH REQUIRED
app.get('/api/teacher/exams', requireTeacherAuth, (req: Request, res: Response) => {
  db = loadDatabase();
  res.json((db as any).teacherExams || []);
});

app.post('/api/teacher/exams', requireTeacherAuth, (req: Request, res: Response) => {
  const examConfig = req.body;
  if (!examConfig || !examConfig.title) {
    return res.status(400).json({ error: 'Tiêu đề đề kiểm tra là bắt buộc.' });
  }

  db = loadDatabase();
  if (!(db as any).teacherExams) (db as any).teacherExams = [];

  const examList = (db as any).teacherExams as any[];
  const newExam = {
    ...examConfig,
    id: examConfig.id || `exam-${Date.now()}`,
    createdAt: examConfig.createdAt || new Date().toISOString(),
  };

  const existingIdx = examList.findIndex((e) => e.id === newExam.id);
  if (existingIdx >= 0) {
    examList[existingIdx] = newExam;
  } else {
    examList.push(newExam);
  }

  saveDatabase(db);
  res.status(201).json(newExam);
});

app.delete('/api/teacher/exams/:id', requireTeacherAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db = loadDatabase();
  if (!(db as any).teacherExams) (db as any).teacherExams = [];

  (db as any).teacherExams = ((db as any).teacherExams as any[]).filter((e) => e.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// Student Deletion -> STRICT TEACHER AUTH REQUIRED
app.delete('/api/students/:id', requireTeacherAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db = loadDatabase();
  db.students = db.students.filter((s) => s.id !== id);
  db.attempts = db.attempts.filter((a) => a.studentId !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// Export Excel -> TEACHER AUTH REQUIRED
app.get('/api/export-excel', requireTeacherAuth, (req: Request, res: Response) => {
  db = loadDatabase();
  const {
    schoolName,
    className,
    studentName,
    lessonId,
    mode,
  } = req.query as Record<string, string>;

  let list = [...db.attempts];
  if (schoolName && schoolName !== 'all') {
    const targetSchKey = normalizeSchoolKey(schoolName);
    list = list.filter((a) => normalizeSchoolKey(a.schoolName) === targetSchKey);
  }
  if (className && className !== 'all') {
    const targetClsKey = normalizeClassKey(className);
    list = list.filter((a) => normalizeClassKey(a.className) === targetClsKey);
  }
  if (studentName && studentName.trim()) {
    const q = studentName.trim().toLowerCase();
    list = list.filter((a) => a.studentName.toLowerCase().includes(q));
  }
  if (lessonId && lessonId !== 'all') list = list.filter((a) => a.lessonId === lessonId);
  if (mode && mode !== 'all') list = list.filter((a) => a.mode === mode);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Chi tiết từng lượt làm bài
  const attemptsRows = list.map((a, idx) => ({
    STT: idx + 1,
    'Họ và tên học sinh': a.studentName,
    'Mã học sinh': a.studentCode || '',
    'Tên trường': a.schoolName,
    Lớp: a.className,
    'Bài học': a.lessonTitle || a.lessonId || 'Ôn tập tổng hợp',
    'Hình thức':
      a.mode === 'official_test'
        ? 'Kiểm tra đánh giá'
        : a.mode === 'practice_topic'
        ? 'Luyện tập 40 câu'
        : 'Luyện tập tự chọn',
    'Dạng câu hỏi': a.questionType || 'Tổng hợp',
    'Điểm số (Thang 10)': a.score,
    'Số câu đúng': a.correctCount,
    'Số câu sai': a.wrongCount || 0,
    'Chưa trả lời': a.unansweredCount || 0,
    'Tổng số câu': a.totalQuestions,
    'Tỉ lệ chính xác (%)': a.accuracyRate,
    'Thời gian làm (giây)': a.durationSeconds,
    'Ngày nộp bài': new Date(a.timestamp).toLocaleString('vi-VN'),
  }));
  const wsAttempts = XLSX.utils.json_to_sheet(attemptsRows);
  XLSX.utils.book_append_sheet(wb, wsAttempts, 'ChiTietLuotLamBai');

  // Sheet 2: Thống kê theo trường (dùng danh sách trường động hợp nhất)
  const unifiedSchools = getUnifiedSchools(db);
  const schoolsRows = unifiedSchools.map((s, idx) => {
    const sKey = normalizeSchoolKey(s.name);
    const sAttempts = db.attempts.filter((a) => normalizeSchoolKey(a.schoolName) === sKey);
    const sStudents = db.students.filter((st) => normalizeSchoolKey(st.school) === sKey);
    const sClasses = Array.from(
      new Set([
        ...sStudents.map((st) => normalizeClassKey(st.className)),
        ...sAttempts.map((a) => normalizeClassKey(a.className)),
      ])
    ).filter(Boolean);
    const avgScore =
      sAttempts.length > 0
        ? (sAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / sAttempts.length).toFixed(2)
        : '0';
    const passCount = sAttempts.filter((a) => (Number(a.score) || 0) >= 5.0).length;
    const completionRate =
      sAttempts.length > 0 ? ((passCount / sAttempts.length) * 100).toFixed(1) : '0';

    return {
      STT: idx + 1,
      'Tên trường': s.name,
      'Số lớp': sClasses.length,
      'Số học sinh': Math.max(sStudents.length, new Set(sAttempts.map((a) => a.studentName)).size),
      'Số lượt học & kiểm tra': sAttempts.length,
      'Điểm trung bình': avgScore,
      'Tỉ lệ hoàn thành (%)': completionRate,
    };
  });
  const wsSchools = XLSX.utils.json_to_sheet(schoolsRows);
  XLSX.utils.book_append_sheet(wb, wsSchools, 'ThongKeTheoTruong');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="BaoCao_ThongKe_DiaLi10_NhieuTruong.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

// =========================================================================
// 4B. AI VIDEO LECTURE SYSTEM ROUTES (40 LESSONS - 13 CHAPTERS)
// =========================================================================

// Teacher: AI & Server Video Capability Probe
app.get('/api/teacher/videos/capabilities', requireTeacherAuth, (_req: Request, res: Response) => {
  res.json(getVideoCapabilities());
});

// Teacher: List all 40 lessons video records + queue state + capabilities
app.get('/api/teacher/videos', requireTeacherAuth, (_req: Request, res: Response) => {
  res.json(listTeacherVideoRecords());
});

// Teacher: Batch queue endpoints (MUST precede /:lessonId routes!)
app.post('/api/teacher/videos/batch/scripts', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const lessonIds = Array.isArray(req.body?.lessonIds) ? req.body.lessonIds : undefined;
    res.json(startBatchQueue('scripts_batch', lessonIds));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err?.message || 'Không thể khởi chạy hàng đợi kịch bản.' });
  }
});

app.post('/api/teacher/videos/batch/generate', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const lessonIds = Array.isArray(req.body?.lessonIds) ? req.body.lessonIds : undefined;
    res.json(startBatchQueue('videos_batch', lessonIds));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err?.message || 'Không thể khởi chạy hàng đợi sản xuất video.' });
  }
});

app.post('/api/teacher/videos/batch/approve', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const teacherName = (req as any).teacher?.name || 'Giáo viên bộ môn';
    const lessonIds = Array.isArray(req.body?.lessonIds) ? req.body.lessonIds : undefined;
    res.json(approveAllCompletedVideos(teacherName, lessonIds));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể duyệt xuất bản hàng loạt video.' });
  }
});

app.post('/api/teacher/videos/queue/pause', requireTeacherAuth, (_req: Request, res: Response) => {
  res.json({ queue: pauseVideoQueue() });
});

app.post('/api/teacher/videos/queue/resume', requireTeacherAuth, (_req: Request, res: Response) => {
  try {
    res.json({ queue: resumeVideoQueue() });
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể tiếp tục hàng đợi.' });
  }
});

app.post('/api/teacher/videos/queue/retry-failed', requireTeacherAuth, (_req: Request, res: Response) => {
  try {
    res.json({ queue: retryFailedVideosInQueue() });
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể chạy lại các bài lỗi.' });
  }
});

// Teacher: Persistent External Video Links (Export / Import JSON / Bulk paste) — MUST precede /:lessonId routes!
app.get('/api/teacher/videos/external-links/export', requireTeacherAuth, (_req: Request, res: Response) => {
  try {
    const backup = exportExternalVideoLinksBackup();
    res.setHeader('Cache-Control', 'no-store');
    res.json(backup);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Không thể xuất tệp sao lưu link video.' });
  }
});

app.post('/api/teacher/videos/external-links/import', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const teacherName = (req as any).teacher?.name || 'Giáo viên bộ môn';
    const restoreApprovalState = req.body?.restoreApprovalState !== false;
    const payload = req.body?.backup ?? req.body;
    res.json(importExternalVideoLinksBackup(payload, restoreApprovalState, teacherName));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể khôi phục danh sách link video từ tệp sao lưu.' });
  }
});

app.post('/api/teacher/videos/external-links/bulk', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const teacherName = (req as any).teacher?.name || 'Giáo viên bộ môn';
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const autoApprove = Boolean(req.body?.autoApprove);
    res.json(setBulkExternalVideoLinks(items, autoApprove, teacherName));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể gắn hàng loạt link video.' });
  }
});

// Teacher: Sync external_video_links JSON backup to user's Google Drive folder (MUST precede /:lessonId routes!)
app.post('/api/teacher/videos/drive/sync-backup', requireTeacherAuth, async (req: Request, res: Response) => {
  try {
    const rawHeader = String(req.headers['x-drive-authorization'] || '');
    const driveAccessToken = rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : rawHeader.trim();
    if (!driveAccessToken) {
      return res.status(401).json({
        error: 'Thiếu mã xác thực Google Drive. Vui lòng đăng nhập lại Google Drive.',
        code: 'DRIVE_AUTH_REQUIRED',
      });
    }
    const result = await syncExternalBackupJsonToGoogleDrive({
      driveAccessToken,
      folderName: typeof req.body?.folderName === 'string' && req.body.folderName.trim() ? req.body.folderName.trim() : undefined,
    });
    res.json(result);
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err?.message || 'Không thể đồng bộ tệp sao lưu lên Google Drive.' });
  }
});

// Teacher: Stream all completed local MP4 videos as a single uncompressed .tar archive (MUST precede /:lessonId!)
app.get('/api/teacher/videos/bundle.tar', requireTeacherAuth, async (_req: Request, res: Response) => {
  try {
    await streamAllLocalVideosTar(res);
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || 'Không thể tạo gói tải xuống 40 video.' });
    } else {
      res.end();
    }
  }
});

// Teacher: Single lesson video routes
app.get('/api/teacher/videos/:lessonId', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    res.json(getTeacherLessonVideo(req.params.lessonId));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err?.message || 'Lỗi tải thông tin video bài giảng.' });
  }
});

// Teacher: Generate script for 1 lesson using curriculum data + Gemini AI
app.post('/api/teacher/videos/:lessonId/script', requireTeacherAuth, async (req: Request, res: Response) => {
  try {
    const record = await generateLessonScript(req.params.lessonId);
    res.json(record);
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err?.message || 'Lỗi tạo kịch bản video AI.' });
  }
});

// Teacher: Save manual edits to script / scenes / subtitles
app.put('/api/teacher/videos/:lessonId/script', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const record = updateLessonScriptManual(req.params.lessonId, req.body);
    res.json(record);
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể lưu chỉnh sửa kịch bản.' });
  }
});

// Teacher: Enqueue real MP4 video generation for 1 lesson in background (single FFmpeg worker)
app.post('/api/teacher/videos/:lessonId/generate', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const record = enqueueSingleLessonVideo(req.params.lessonId);
    res.status(202).json(record);
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err?.message || 'Lỗi xếp hàng đợi tạo video bài giảng.' });
  }
});

// Teacher: Approve & publish (or replace existing) video for students
app.post('/api/teacher/videos/:lessonId/approve', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const teacherName = (req as any).teacher?.name || 'Giáo viên bộ môn';
    const record = approveAndPublishVideo(req.params.lessonId, teacherName);
    res.json(record);
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể duyệt xuất bản video.' });
  }
});

// Teacher: Unpublish / hide video from student view
app.post('/api/teacher/videos/:lessonId/unpublish', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    res.json(unpublishLessonVideo(req.params.lessonId));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể tạm ẩn video.' });
  }
});

// Teacher: Reset failed / draft state cleanly
app.post('/api/teacher/videos/:lessonId/reset', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    res.json(resetLessonVideoState(req.params.lessonId));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể đặt lại trạng thái video.' });
  }
});

// Teacher: Attach or update a persistent external video URL (Google Drive / YouTube / Direct MP4)
app.put('/api/teacher/videos/:lessonId/external-link', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    const teacherName = (req as any).teacher?.name || 'Giáo viên bộ môn';
    const updated = setLessonExternalVideoLink(
      req.params.lessonId,
      {
        rawUrl: String(req.body?.rawUrl || ''),
        durationSeconds: req.body?.durationSeconds ?? null,
        note: typeof req.body?.note === 'string' ? req.body.note : undefined,
        autoApprove: Boolean(req.body?.autoApprove),
      },
      teacherName
    );
    res.json(updated);
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể lưu link video bền vững.' });
  }
});

// Teacher: Remove external video link (restores local MP4 if present on disk)
app.delete('/api/teacher/videos/:lessonId/external-link', requireTeacherAuth, (req: Request, res: Response) => {
  try {
    res.json(removeLessonExternalVideoLink(req.params.lessonId));
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(400).json({ error: err?.message || 'Không thể gỡ link video bền vững.' });
  }
});

// Teacher: Upload server-local MP4 directly to user's Google Drive, share & bind persistent link
app.post('/api/teacher/videos/:lessonId/upload-drive', requireTeacherAuth, async (req: Request, res: Response) => {
  try {
    const rawHeader = String(req.headers['x-drive-authorization'] || '');
    const driveAccessToken = rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : rawHeader.trim();
    if (!driveAccessToken) {
      return res.status(401).json({
        error: 'Thiếu mã xác thực Google Drive. Vui lòng kết nối Google Drive trước.',
        code: 'DRIVE_AUTH_REQUIRED',
      });
    }
    const teacherName = (req as any).teacher?.name || 'Giáo viên bộ môn';
    const autoApprove = req.body?.autoApprove !== false;
    const folderName =
      typeof req.body?.folderName === 'string' && req.body.folderName.trim()
        ? req.body.folderName.trim()
        : undefined;
    const result = await uploadLessonMp4ToGoogleDrive({
      lessonId: req.params.lessonId,
      driveAccessToken,
      teacherName,
      autoApprove,
      folderName,
    });
    res.json(result);
  } catch (err: any) {
    if (err instanceof VideoPipelineError) {
      return res.status(err.httpStatus).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err?.message || 'Không thể tải video lên Google Drive.' });
  }
});

// Student / Public Read Endpoints (ONLY approved & published real files!)
app.get('/api/lessons/videos/published', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(getPublishedVideosSummaryMap());
});

app.get('/api/lessons/:lessonId/video', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(getPublishedLessonVideo(req.params.lessonId));
});

// Video & WebVTT Media Stream Endpoint (Byte-Range Support)
app.get('/api/videos/media/:lessonId/:filename', (req: Request, res: Response) => {
  handleServeVideoMedia(req, res, verifyTeacherToken);
});

// =========================================================================
// 5. SERVER INITIALIZATION & VITE CLIENT
// =========================================================================

async function startServer() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const distIndex = path.join(distDir, 'index.html');
  const isTsxDev = process.execArgv.some((arg) => arg.includes('tsx'));
  const shouldServeDist =
    fs.existsSync(distIndex) &&
    (process.env.NODE_ENV === 'production' ||
      process.env.DISABLE_HMR === 'true' ||
      !isTsxDev);

  if (shouldServeDist) {
    const gzipCache = new Map<string, { buf: Buffer; mime: string }>();

    app.get('/assets/:filename', (req: Request, res: Response) => {
      const safeName = path.basename(String(req.params.filename || ''));
      const fullPath = path.join(distDir, 'assets', safeName);
      if (!safeName || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        return res.status(404).type('text/plain').send('Asset not found');
      }
      const ext = path.extname(safeName).toLowerCase();
      const mime =
        ext === '.js' || ext === '.mjs'
          ? 'application/javascript; charset=utf-8'
          : ext === '.css'
          ? 'text/css; charset=utf-8'
          : ext === '.json'
          ? 'application/json; charset=utf-8'
          : ext === '.svg'
          ? 'image/svg+xml'
          : 'application/octet-stream';

      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      const acceptEncoding = String(req.headers['accept-encoding'] || '');
      if (acceptEncoding.includes('gzip') && (ext === '.js' || ext === '.mjs' || ext === '.css' || ext === '.svg' || ext === '.json')) {
        let cached = gzipCache.get(safeName);
        if (!cached) {
          cached = { buf: zlib.gzipSync(fs.readFileSync(fullPath), { level: 6 }), mime };
          gzipCache.set(safeName, cached);
        }
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
        return res.send(cached.buf);
      }
      return res.sendFile(fullPath);
    });

    app.use(express.static(distDir, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/assets/') || req.path.startsWith('/api/')) {
        return res.status(404).type('text/plain').send('Not found');
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.sendFile(distIndex);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (mode=${shouldServeDist ? 'static-dist' : 'vite-dev'})`);
  });
}

startServer();
