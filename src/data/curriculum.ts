import type { CurriculumChapter, CurriculumPart, Topic } from '../types/index.ts';

export const CURRICULUM_PARTS: CurriculumPart[] = [
  {
    id: 'phan-1',
    number: 1,
    title: 'PHẦN 1. MỘT SỐ VẤN ĐỀ CHUNG',
    description: 'Định hướng nghề nghiệp, vị trí và vai trò cốt lõi của môn Địa lí trong kỉ nguyên số.',
  },
  {
    id: 'phan-2',
    number: 2,
    title: 'PHẦN 2. ĐỊA LÍ TỰ NHIÊN',
    description: 'Các quyển cấu tạo vỏ Trái Đất, quy luật tự nhiên, tương tác thạch quyển, khí quyển, thủy quyển và sinh quyển.',
  },
  {
    id: 'phan-3',
    number: 3,
    title: 'PHẦN 3. ĐỊA LÍ KINH TẾ – XÃ HỘI',
    description: 'Dân cư toàn cầu, nguồn lực phát triển, các ngành nông nghiệp, công nghiệp, dịch vụ và tăng trưởng xanh.',
  },
];

export const CURRICULUM_CHAPTERS: CurriculumChapter[] = [
  {
    id: 'chuong-1',
    partId: 'phan-2',
    number: 1,
    title: 'CHƯƠNG 1. SỬ DỤNG BẢN ĐỒ',
    description: 'Phương pháp biểu hiện các đối tượng địa lí trên bản đồ, ứng dụng GPS và bản đồ số trong đời sống.',
    lessonsCount: 2, // Bài 2, Bài 3
  },
  {
    id: 'chuong-2',
    partId: 'phan-2',
    number: 2,
    title: 'CHƯƠNG 2. TRÁI ĐẤT',
    description: 'Sự hình thành Trái Đất, vật liệu vỏ Trái Đất và hệ quả các chuyển động tự quay, quanh Mặt Trời.',
    lessonsCount: 2, // Bài 4, Bài 5
  },
  {
    id: 'chuong-3',
    partId: 'phan-2',
    number: 3,
    title: 'CHƯƠNG 3. THẠCH QUYỂN',
    description: 'Thạch quyển, thuyết kiến tạo mảng, tác động của nội lực và ngoại lực, vành đai động đất - núi lửa.',
    lessonsCount: 3, // Bài 6, Bài 7, Bài 8
  },
  {
    id: 'chuong-4',
    partId: 'phan-2',
    number: 4,
    title: 'CHƯƠNG 4. KHÍ QUYỂN',
    description: 'Cấu trúc khí quyển, sự phân bố nhiệt độ, khí áp, hoàn lưu gió mùa, các đới và kiểu khí hậu.',
    lessonsCount: 2, // Bài 9, Bài 10
  },
  {
    id: 'chuong-5',
    partId: 'phan-2',
    number: 5,
    title: 'CHƯƠNG 5. THỦY QUYỂN',
    description: 'Thủy quyển, nước trên lục địa, nước biển và đại dương, phân tích chế độ dòng chảy sông ngòi.',
    lessonsCount: 3, // Bài 11, Bài 12, Bài 13
  },
  {
    id: 'chuong-6',
    partId: 'phan-2',
    number: 6,
    title: 'CHƯƠNG 6. SINH QUYỂN',
    description: 'Đất trên Trái Đất, các nhân tố hình thành đất, giới sinh vật và quy luật phân bố thảm thực vật.',
    lessonsCount: 3, // Bài 14, Bài 15, Bài 16
  },
  {
    id: 'chuong-7',
    partId: 'phan-2',
    number: 7,
    title: 'CHƯƠNG 7. MỘT SỐ QUY LUẬT CỦA VỎ ĐỊA LÍ',
    description: 'Vỏ địa lí, quy luật thống nhất hoàn chỉnh, quy luật địa đới và quy luật phi địa đới.',
    lessonsCount: 2, // Bài 17, Bài 18
  },
  {
    id: 'chuong-8',
    partId: 'phan-3',
    number: 8,
    title: 'CHƯƠNG 8. ĐỊA LÍ DÂN CƯ',
    description: 'Quy mô dân số, gia tăng tự nhiên, cơ cấu dân số theo tuổi/giới tính, phân bố dân cư và đô thị hóa.',
    lessonsCount: 2, // Bài 19, Bài 20
  },
  {
    id: 'chuong-9',
    partId: 'phan-3',
    number: 9,
    title: 'CHƯƠNG 9. CÁC NGUỒN LỰC, MỘT SỐ TIÊU CHÍ ĐÁNH GIÁ SỰ PHÁT TRIỂN KINH TẾ',
    description: 'Các nguồn lực phát triển kinh tế, cơ cấu ngành kinh tế, chỉ số GDP và tổng thu nhập quốc gia GNI.',
    lessonsCount: 2, // Bài 21, Bài 22
  },
  {
    id: 'chuong-10',
    partId: 'phan-3',
    number: 10,
    title: 'CHƯƠNG 10. ĐỊA LÍ NGÀNH NÔNG NGHIỆP, LÂM NGHIỆP, THỦY SẢN',
    description: 'Vai trò, đặc điểm ngành nông - lâm - thủy sản, tổ chức lãnh thổ và xu hướng nông nghiệp hiện đại.',
    lessonsCount: 5, // Bài 23, Bài 24, Bài 25, Bài 26, Bài 27
  },
  {
    id: 'chuong-11',
    partId: 'phan-3',
    number: 11,
    title: 'CHƯƠNG 11. ĐỊA LÍ NGÀNH CÔNG NGHIỆP',
    description: 'Vai trò, cơ cấu ngành công nghiệp, các ngành mũi nhọn, tổ chức lãnh thổ công nghiệp và môi trường.',
    lessonsCount: 5, // Bài 28, Bài 29, Bài 30, Bài 31, Bài 32
  },
  {
    id: 'chuong-12',
    partId: 'phan-3',
    number: 12,
    title: 'CHƯƠNG 12. ĐỊA LÍ NGÀNH DỊCH VỤ',
    description: 'Cơ cấu dịch vụ, giao thông vận tải, bưu chính viễn thông, du lịch, thương mại và tài chính ngân hàng.',
    lessonsCount: 6, // Bài 33, Bài 34, Bài 35, Bài 36, Bài 37, Bài 38
  },
  {
    id: 'chuong-13',
    partId: 'phan-3',
    number: 13,
    title: 'CHƯƠNG 13. PHÁT TRIỂN BỀN VỮNG VÀ TĂNG TRƯỞNG XANH',
    description: 'Môi trường, an ninh tài nguyên thiên nhiên, kinh tế tuần hoàn, tăng trưởng xanh và mục tiêu Net Zero.',
    lessonsCount: 2, // Bài 39, Bài 40
  },
];

// Mapping for compatibility with components expecting Topic[]
export const TOPICS: Topic[] = [
  {
    id: 'phan-1',
    number: 1,
    title: 'Một số vấn đề chung (Bài 1)',
    subtitle: 'Định hướng nghề nghiệp',
    description: 'Môn Địa lí với định hướng nghề nghiệp cho học sinh.',
    iconName: 'Compass',
    lessonsCount: 1,
  },
  ...CURRICULUM_CHAPTERS.map((c) => ({
    id: c.id,
    number: c.number + 1,
    title: c.title,
    subtitle: `Thuộc ${c.partId === 'phan-2' ? 'Địa lí Tự nhiên' : 'Địa lí Kinh tế - Xã hội'}`,
    description: c.description,
    iconName: c.partId === 'phan-2' ? 'Globe2' : 'TrendingUp',
    lessonsCount: c.lessonsCount,
  })),
];
