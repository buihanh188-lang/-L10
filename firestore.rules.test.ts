/**
 * Phase 0 Security Rules Verification Spec ("Dirty Dozen" Payloads)
 *
 * Verifies all 12 adversarial payloads against firestore.rules constraints.
 * Designed for execution with @firebase/rules-unit-testing when the Firestore
 * emulator is available, and also validates static schema/payload invariants.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
  enforcedBy: string;
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated attempt creation',
    operation: 'create',
    path: '/attempts/att-unauth-1',
    auth: null,
    payload: { id: 'att-unauth-1', score: 10 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isVerifiedUser() requires request.auth != null',
  },
  {
    id: 2,
    name: 'Unverified admin email spoofing on list',
    operation: 'list',
    path: '/attempts',
    auth: { uid: 'spoof-uid', email: 'buihanh188@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isVerifiedUser() enforces request.auth.token.email_verified == true',
  },
  {
    id: 3,
    name: 'Self-assigned teacher role during student profile creation',
    operation: 'create',
    path: '/students/student-a',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { ownerUid: 'student-a', role: 'teacher' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isValidStudentProfile() enforces data.role == "student"',
  },
  {
    id: 4,
    name: 'Direct client write to admins collection',
    operation: 'create',
    path: '/admins/student-a',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { uid: 'student-a', email: 'hs1@gmail.com' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: '/admins/{adminUid} allow write: if false',
  },
  {
    id: 5,
    name: 'Identity spoofing via mismatched ownerUid',
    operation: 'create',
    path: '/attempts/att-spoof-owner',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { id: 'att-spoof-owner', ownerUid: 'student-b', status: 'submitted', score: 9 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'incoming().ownerUid == request.auth.uid',
  },
  {
    id: 6,
    name: 'Orphaned attempt creation without student profile',
    operation: 'create',
    path: '/attempts/att-orphan-1',
    auth: { uid: 'student-no-profile', email: 'orphan@gmail.com', email_verified: true },
    payload: { id: 'att-orphan-1', ownerUid: 'student-no-profile', status: 'submitted', score: 8 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'existsAfter(/databases/$(database)/documents/students/$(request.auth.uid))',
  },
  {
    id: 7,
    name: 'Shadow ghost field injection on attempt create',
    operation: 'create',
    path: '/attempts/att-ghost-1',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { id: 'att-ghost-1', ownerUid: 'student-a', ghostApproved: true },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isValidAttempt() enforces data.keys().hasOnly([...])',
  },
  {
    id: 8,
    name: 'Student score tampering after submission (terminal state bypass)',
    operation: 'update',
    path: '/attempts/att-1',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { score: 10 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'attempts allow update requires isAdmin()',
  },
  {
    id: 9,
    name: 'Forged client createdAt timestamp',
    operation: 'create',
    path: '/attempts/att-time-forgery',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { id: 'att-time-forgery', ownerUid: 'student-a', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'incoming().createdAt == request.time && incoming().updatedAt == request.time',
  },
  {
    id: 10,
    name: 'Cross-student PII profile read',
    operation: 'get',
    path: '/students/student-b',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'students allow get requires isOwner(userId) || isAdmin()',
  },
  {
    id: 11,
    name: 'Path ID poisoning with invalid characters or excessive length',
    operation: 'create',
    path: '/attempts/bad$id..injection',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { id: 'bad$id..injection', ownerUid: 'student-a' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isValidId(attemptId) matches ^[a-zA-Z0-9_\\-]+$ with size <= 128',
  },
  {
    id: 12,
    name: 'Numeric range and array overflow poisoning',
    operation: 'create',
    path: '/attempts/att-overflow',
    auth: { uid: 'student-a', email: 'hs1@gmail.com', email_verified: true },
    payload: { id: 'att-overflow', ownerUid: 'student-a', score: 999, details: new Array(120).fill({}) },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isValidAttempt() enforces score 0..10 and details.size() <= 60',
  },
];
