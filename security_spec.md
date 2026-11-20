# Security Specification — Địa Lí 10 (Firestore Security Rules)

## 1. Data Invariants
1. **Default Deny**: All unspecified Firestore paths deny read and write (`match /{document=**}`).
2. **Verified Authentication Required**: Every read and write requires `request.auth != null && request.auth.token.email_verified == true`.
3. **Zero Privilege Escalation**: Students can only create `/students/{userId}` where `userId == request.auth.uid`, `ownerUid == request.auth.uid`, and `role == 'student'`. `/admins/{adminUid}` is never writable from any client SDK.
4. **Master Source of Truth & Atomicity**: An exam attempt in `/attempts/{attemptId}` cannot be created unless the submitting student has a valid `/students/$(request.auth.uid)` document (`existsAfter`).
5. **Terminal State Locking**: Once an attempt is submitted (`status == 'submitted'`), students cannot alter scores, timestamps, or answers. Only the verified teacher admin (`buihanh188@gmail.com` or an entry in `/admins/{uid}`) can update or delete an attempt.
6. **PII Isolation & Query Enforcement**: Students can only read or list their own `/students/{uid}` and `/attempts/{id}` (`resource.data.ownerUid == request.auth.uid`). No blanket reads exist. No `get()` or `exists()` calls are placed inside `allow list`.
7. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation; `createdAt` and `ownerUid` are immutable on update.
8. **Strict Key & Size Guards**: Every document enforces exact `hasAll` + `hasOnly` keys, `isValidId()` on single-document path IDs, `.size()` bounds on all strings and lists, and numeric ranges (`score` 0..10, `accuracyRate` 0..100).

## 2. The "Dirty Dozen" Adversarial Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Write**: Creating `/attempts/att-1` with `request.auth == null`.
2. **Unverified Admin Email Spoof**: Reading `/attempts` with `email == 'buihanh188@gmail.com'` and `email_verified == false`.
3. **Self-Assigned Admin Role**: Creating `/students/{uid}` with `role: 'teacher'` or `role: 'admin'`.
4. **Client Admin Grant Injection**: Creating `/admins/{uid}` directly from client SDK.
5. **Identity Spoofing on Attempt**: Student A creating `/attempts/att-2` with `ownerUid: 'student-B-uid'`.
6. **Orphaned Attempt Write**: Student A creating `/attempts/att-3` without an existing `/students/{studentA}` profile.
7. **Shadow Ghost Field Injection**: Creating `/attempts/att-4` with all valid fields plus an extra `isVerifiedByTeacher: true`.
8. **Score Tampering / Terminal State Bypass**: Student A updating their submitted `/attempts/att-1` to change `score` from `4.5` to `10.0`.
9. **Client Timestamp Forgery**: Creating `/attempts/att-5` with a forged `createdAt` not equal to `request.time`.
10. **Cross-Student PII Read**: Student A calling `get` or `list` on `/students/{studentB}` or `/attempts` belonging to Student B.
11. **Path ID Poisoning**: Creating `/attempts/invalid$id..with..1500chars` failing `isValidId()`.
12. **Value & Array Poisoning**: Creating `/attempts/att-6` with `score: 999`, `title` > 200 chars, or `details` array > 60 items.
