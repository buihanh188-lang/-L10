import json
import time

schools_data = [
    {
        "name": "TRƯỜNG THPT HÒA BÌNH",
        "commune": "XÃ VẠN LINH",
        "province": "TỈNH LẠNG SƠN",
        "code": "THPT-HB",
        "classes": [
            {"id": "class-hb-10a1", "name": "10A1", "teacherName": "Bùi Thị Hồng Hạnh", "studentCount": 38, "joinCode": "HB10A1"},
            {"id": "class-hb-10a2", "name": "10A2", "teacherName": "Bùi Thị Hồng Hạnh", "studentCount": 40, "joinCode": "HB10A2"},
            {"id": "class-hb-10a3", "name": "10A3", "teacherName": "Bùi Thị Hồng Hạnh", "studentCount": 36, "joinCode": "HB10A3"},
        ],
        "students": [
            {"id": "hs-hb-01", "name": "Hoàng Văn Dũng", "code": "HB-1001", "className": "10A1"},
            {"id": "hs-hb-02", "name": "Nông Thị Mai", "code": "HB-1002", "className": "10A1"},
            {"id": "hs-hb-03", "name": "Triệu Thị Hoa", "code": "HB-1003", "className": "10A1"},
            {"id": "hs-hb-04", "name": "Lăng Thị Lan", "code": "HB-1004", "className": "10A2"},
            {"id": "hs-hb-05", "name": "Triệu Văn Khải", "code": "HB-1005", "className": "10A2"},
            {"id": "hs-hb-06", "name": "Hoàng Minh Tuấn", "code": "HB-1006", "className": "10A2"},
            {"id": "hs-hb-07", "name": "Vy Thu Phương", "code": "HB-1007", "className": "10A3"},
            {"id": "hs-hb-08", "name": "Lăng Văn Phúc", "code": "HB-1008", "className": "10A3"},
            {"id": "hs-hb-09", "name": "Đặng Thu Trang", "code": "HB-1009", "className": "10A3"}
        ]
    },
    {
        "name": "TRƯỜNG THPT CHI LĂNG",
        "commune": "XÃ CHI LĂNG",
        "province": "TỈNH LẠNG SƠN",
        "code": "THPT-CL",
        "classes": [
            {"id": "class-cl-10a1", "name": "10A1", "teacherName": "Trần Văn Nam", "studentCount": 39, "joinCode": "CL10A1"},
            {"id": "class-cl-10a2", "name": "10A2", "teacherName": "Trần Văn Nam", "studentCount": 37, "joinCode": "CL10A2"},
            {"id": "class-cl-10b1", "name": "10B1", "teacherName": "Nguyễn Thị Loan", "studentCount": 42, "joinCode": "CL10B1"},
        ],
        "students": [
            {"id": "hs-cl-01", "name": "Lương Văn Đạt", "code": "CL-1001", "className": "10A1"},
            {"id": "hs-cl-02", "name": "Nguyễn Thị Bích", "code": "CL-1002", "className": "10A1"},
            {"id": "hs-cl-03", "name": "Hoàng Thị Thu", "code": "CL-1003", "className": "10A2"},
            {"id": "hs-cl-04", "name": "Nông Quốc Việt", "code": "CL-1004", "className": "10A2"},
            {"id": "hs-cl-05", "name": "Chu Thị Lan", "code": "CL-1005", "className": "10B1"},
            {"id": "hs-cl-06", "name": "Triệu Đức Thắng", "code": "CL-1006", "className": "10B1"},
            {"id": "hs-cl-07", "name": "Lăng Văn Cường", "code": "CL-1007", "className": "10B1"}
        ]
    },
    {
        "name": "TRƯỜNG THPT HỮU LŨNG",
        "commune": "",
        "province": "TỈNH LẠNG SƠN",
        "code": "THPT-HL",
        "classes": [
            {"id": "class-hl-10a1", "name": "10A1", "teacherName": "Lê Văn Hưng", "studentCount": 41, "joinCode": "HL10A1"},
            {"id": "class-hl-10a4", "name": "10A4", "teacherName": "Lê Văn Hưng", "studentCount": 38, "joinCode": "HL10A4"},
        ],
        "students": [
            {"id": "hs-hl-01", "name": "Đinh Văn Hùng", "code": "HL-1001", "className": "10A1"},
            {"id": "hs-hl-02", "name": "Mã Thị Nguyệt", "code": "HL-1002", "className": "10A1"},
            {"id": "hs-hl-03", "name": "Hoàng Văn Kiên", "code": "HL-1003", "className": "10A4"},
            {"id": "hs-hl-04", "name": "Nguyễn Phương Thảo", "code": "HL-1004", "className": "10A4"}
        ]
    }
]

# Generate realistic test records
sample_lessons = [
    ("bai-1", "Bài 1. Môn Địa lí với định hướng nghề nghiệp"),
    ("bai-2", "Bài 2. Phương pháp biểu hiện các đối tượng địa lí trên bản đồ"),
    ("bai-3", "Bài 3. Sử dụng bản đồ trong học tập và đời sống, một số ứng dụng của GPS và bản đồ số"),
    ("bai-4", "Bài 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất"),
    ("bai-5", "Bài 5. Hệ quả địa lí các chuyển động của Trái Đất"),
    ("bai-6", "Bài 6. Thạch quyển, thuyết kiến tạo mảng"),
    ("bai-7", "Bài 7. Tác động của nội lực và ngoại lực đến địa hình bề mặt Trái Đất"),
    ("bai-9", "Bài 9. Khí quyển, các yếu tố khí hậu"),
    ("bai-11", "Bài 11. Thủy quyển, nước trên lục địa"),
    ("bai-14", "Bài 14. Đất trên Trái Đất"),
    ("bai-15", "Bài 15. Sinh quyển"),
    ("bai-17", "Bài 17. Vỏ địa lí, quy luật thống nhất và hoàn chỉnh của vỏ địa lí"),
    ("bai-19", "Bài 19. Quy mô và sự gia tăng dân số"),
    ("bai-20", "Bài 20. Cơ cấu dân số"),
    ("bai-21", "Bài 21. Các nguồn lực phát triển kinh tế"),
    ("bai-22", "Bài 22. Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia"),
    ("bai-24", "Bài 24. Địa lí ngành nông nghiệp"),
    ("bai-28", "Bài 28. Địa lí ngành công nghiệp"),
    ("bai-33", "Bài 33. Cơ cấu, vai trò, đặc điểm và các nhân tố ảnh hưởng đến phát triển ngành dịch vụ"),
    ("bai-39", "Bài 39. Môi trường và tài nguyên thiên nhiên"),
]

attempts = []
now_ms = int(time.time() * 1000)

counter = 1

# Generate records for THPT Hòa Bình
hb = schools_data[0]
for st in hb["students"]:
    # Each student has 2 to 4 records
    records_to_create = [
        (sample_lessons[0], "official_test", "all", 8.5, 10, 8, 12, 1),
        (sample_lessons[1], "practice_topic", "all", 9.0, 40, 36, 45, 3),
        (sample_lessons[3], "practice_type", "short_answer", 8.0, 10, 8, 15, 6),
    ]
    if st["id"] in ["hs-hb-01", "hs-hb-02", "hs-hb-04"]:
        records_to_create.append((sample_lessons[6], "official_test", "all", 9.5, 20, 19, 25, 12))

    for (les_id, les_title), mode, q_type, score, total_q, corr_q, dur_m, days_ago in records_to_create:
        ts = now_ms - days_ago * 86400 * 1000 - (counter * 3600 * 1000)
        dur_sec = dur_m * 60 + (counter % 30)
        attempts.append({
            "id": f"rec-hb-{counter:03d}",
            "studentId": st["id"],
            "studentName": st["name"],
            "studentCode": st["code"],
            "schoolName": hb["name"],
            "className": st["className"],
            "lessonId": les_id,
            "lessonTitle": les_title,
            "questionType": q_type,
            "title": f"{'Kiểm tra đánh giá' if mode == 'official_test' else 'Luyện tập'}: {les_title}",
            "mode": mode,
            "timestamp": ts,
            "durationSeconds": dur_sec,
            "timeLimitMinutes": dur_m,
            "totalQuestions": total_q,
            "score": score,
            "correctCount": corr_q,
            "wrongCount": total_q - corr_q,
            "accuracyRate": round((corr_q / total_q) * 100, 1),
            "details": [],
            "topicBreakdown": {},
            "typeBreakdown": {
                "multiple_choice": {"total": int(total_q * 0.4), "correct": int(corr_q * 0.4)},
                "true_false_context": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
                "short_answer": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
                "matching": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
            },
            "weakTopics": [],
            "strongTopics": [les_id],
            "recommendation": "Tiếp tục phát huy kết quả học tập tốt môn Địa lí 10."
        })
        counter += 1

# Generate records for THPT Chi Lăng
cl = schools_data[1]
for st in cl["students"]:
    records_to_create = [
        (sample_lessons[1], "official_test", "all", 8.0, 10, 8, 14, 2),
        (sample_lessons[4], "practice_topic", "all", 8.5, 40, 34, 40, 5),
    ]
    if st["id"] in ["hs-cl-01", "hs-cl-03", "hs-cl-05"]:
        records_to_create.append((sample_lessons[18], "official_test", "all", 9.0, 15, 14, 20, 10))

    for (les_id, les_title), mode, q_type, score, total_q, corr_q, dur_m, days_ago in records_to_create:
        ts = now_ms - days_ago * 86400 * 1000 - (counter * 3600 * 1000)
        dur_sec = dur_m * 60 + (counter % 45)
        attempts.append({
            "id": f"rec-cl-{counter:03d}",
            "studentId": st["id"],
            "studentName": st["name"],
            "studentCode": st["code"],
            "schoolName": cl["name"],
            "className": st["className"],
            "lessonId": les_id,
            "lessonTitle": les_title,
            "questionType": q_type,
            "title": f"{'Kiểm tra đánh giá' if mode == 'official_test' else 'Luyện tập'}: {les_title}",
            "mode": mode,
            "timestamp": ts,
            "durationSeconds": dur_sec,
            "timeLimitMinutes": dur_m,
            "totalQuestions": total_q,
            "score": score,
            "correctCount": corr_q,
            "wrongCount": total_q - corr_q,
            "accuracyRate": round((corr_q / total_q) * 100, 1),
            "details": [],
            "topicBreakdown": {},
            "typeBreakdown": {
                "multiple_choice": {"total": int(total_q * 0.4), "correct": int(corr_q * 0.4)},
                "true_false_context": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
                "short_answer": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
                "matching": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
            },
            "weakTopics": [],
            "strongTopics": [les_id],
            "recommendation": "Rèn luyện thêm bài tập tính toán tỉ trọng và tốc độ tăng trưởng."
        })
        counter += 1

# Generate records for THPT Hữu Lũng
hl = schools_data[2]
for st in hl["students"]:
    records_to_create = [
        (sample_lessons[2], "official_test", "all", 7.5, 10, 7, 15, 3),
        (sample_lessons[5], "practice_type", "multiple_choice", 8.0, 10, 8, 12, 8),
    ]
    for (les_id, les_title), mode, q_type, score, total_q, corr_q, dur_m, days_ago in records_to_create:
        ts = now_ms - days_ago * 86400 * 1000 - (counter * 3600 * 1000)
        dur_sec = dur_m * 60 + (counter % 30)
        attempts.append({
            "id": f"rec-hl-{counter:03d}",
            "studentId": st["id"],
            "studentName": st["name"],
            "studentCode": st["code"],
            "schoolName": hl["name"],
            "className": st["className"],
            "lessonId": les_id,
            "lessonTitle": les_title,
            "questionType": q_type,
            "title": f"{'Kiểm tra đánh giá' if mode == 'official_test' else 'Luyện tập'}: {les_title}",
            "mode": mode,
            "timestamp": ts,
            "durationSeconds": dur_sec,
            "timeLimitMinutes": dur_m,
            "totalQuestions": total_q,
            "score": score,
            "correctCount": corr_q,
            "wrongCount": total_q - corr_q,
            "accuracyRate": round((corr_q / total_q) * 100, 1),
            "details": [],
            "topicBreakdown": {},
            "typeBreakdown": {
                "multiple_choice": {"total": int(total_q * 0.4), "correct": int(corr_q * 0.4)},
                "true_false_context": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
                "short_answer": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
                "matching": {"total": int(total_q * 0.2), "correct": int(corr_q * 0.2)},
            },
            "weakTopics": [],
            "strongTopics": [les_id],
            "recommendation": "Củng cố thêm kiến thức bản đồ và định vị GPS."
        })
        counter += 1

# Flatten students and classes
all_students = []
for s in schools_data:
    for st in s["students"]:
        all_students.append({
            "id": st["id"],
            "role": "student",
            "name": st["name"],
            "code": st["code"],
            "className": st["className"],
            "school": s["name"],
            "commune": s["commune"],
            "province": s["province"],
            "joinedDate": "2026-09-05"
        })

all_classes = []
for s in schools_data:
    for cl_item in s["classes"]:
        all_classes.append({
            "id": cl_item["id"],
            "name": cl_item["name"],
            "schoolName": s["name"],
            "teacherName": cl_item["teacherName"],
            "joinCode": cl_item["joinCode"],
            "studentCount": cl_item["studentCount"],
            "academicYear": "2026 - 2027"
        })

# Write to src/data/mockUsers.ts
output_ts = f"""import {{ Classroom, ExamRecord, UserProfile }} from '../types';

export const TEACHER_PROFILE: UserProfile = {{
  id: 'teacher-bui-thi-hong-hanh',
  role: 'admin',
  name: 'Bùi Thị Hồng Hạnh',
  code: 'GV-DL10',
  school: 'TRƯỜNG THPT HÒA BÌNH',
  commune: 'XÃ VẠN LINH',
  province: 'TỈNH LẠNG SƠN',
  department: 'TỔ SỬ – ĐỊA – GDKTPL',
  email: 'buihanh188@gmail.com',
  joinedDate: '2023-09-05',
}};

export const REGISTERED_SCHOOLS: {{ name: string; commune: string; province: string; code: string }}[] = {json.dumps([{"name": s["name"], "commune": s["commune"], "province": s["province"], "code": s["code"]} for s in schools_data], ensure_ascii=False, indent=2)};

export const INITIAL_STUDENTS: UserProfile[] = {json.dumps(all_students, ensure_ascii=False, indent=2)};

export const INITIAL_CLASSES: Classroom[] = {json.dumps(all_classes, ensure_ascii=False, indent=2)};

export const INITIAL_EXAM_RECORDS: ExamRecord[] = {json.dumps(attempts, ensure_ascii=False, indent=2)};
"""

with open("src/data/mockUsers.ts", "w", encoding="utf-8") as f:
    f.write(output_ts)

# Also create data directory and write initial data/system_database.json
import os
os.makedirs("data", exist_ok=True)
db_content = {
    "schools": [
        {"name": s["name"], "commune": s["commune"], "province": s["province"], "code": s["code"]} for s in schools_data
    ],
    "classes": all_classes,
    "students": all_students,
    "attempts": attempts,
    "updatedAt": int(time.time() * 1000)
}
with open("data/system_database.json", "w", encoding="utf-8") as f:
    json.dump(db_content, f, ensure_ascii=False, indent=2)

print(f"Generated {len(schools_data)} schools, {len(all_classes)} classes, {len(all_students)} students, {len(attempts)} attempts.")
