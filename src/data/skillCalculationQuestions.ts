import { Question } from '../types';

/**
 * Ngân hàng câu hỏi Chuyên đề 20 phút: Kĩ năng tính toán và phân tích bảng số liệu Địa lí 10
 * Chuẩn chương trình GDPT 2018 - SGK Địa lí 10 Kết nối tri thức với cuộc sống
 * Bao gồm đầy đủ các kĩ năng:
 * - Tính tỉ trọng cơ cấu (%)
 * - Tính tốc độ tăng trưởng (%)
 * - Tính chênh lệch, so sánh đối tượng
 * - Tính mật độ dân số, bình quân đầu người, năng suất
 * - Tính biên độ nhiệt, cán cân xuất nhập khẩu
 * - Phân tích bảng số liệu, nhận biết xu hướng biến động
 * - Lựa chọn dạng biểu đồ thích hợp nhất
 */
export const SKILL_CALCULATION_QUESTIONS: Question[] = [
  // --- PHẦN I: TRẮC NGHIỆM 4 LỰA CHỌN (8 CÂU) ---
  {
    id: 'q-calc-01',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-9',
    partId: 'phan-3',
    lessonId: 'bai-33',
    type: 'multiple_choice',
    cognitiveLevel: 'van_dung',
    question: `Cho bảng số liệu:
CƠ CẤU GDP THEO NGÀNH KINH TẾ CỦA MỘT SỐ NƯỚC NĂM 2022
(Đơn vị: Tỉ USD)
┌──────────────┬──────────────────────┬────────────────────────┬──────────┬──────────┐
│   Quốc gia   │ Nông - lâm - thủy sản │ Công nghiệp - xây dựng │ Dịch vụ  │ Tổng GDP │
├──────────────┼──────────────────────┼────────────────────────┼──────────┼──────────┤
│ Nước X       │         35,0         │         125,0          │  240,0   │  400,0   │
│ Nước Y       │          4,0         │          76,0          │  120,0   │  200,0   │
└──────────────┴──────────────────────┴────────────────────────┴──────────┴──────────┘
Theo bảng số liệu trên, tỉ trọng ngành dịch vụ trong tổng GDP của Nước X năm 2022 là bao nhiêu?`,
    options: [
      '60,0%',
      '31,3%',
      '8,8%',
      '55,0%',
    ],
    correctIndex: 0,
    explanation: 'Công thức tính tỉ trọng: Tỉ trọng ngành Dịch vụ = (Giá trị ngành Dịch vụ / Tổng GDP) × 100% = (240,0 / 400,0) × 100% = 60,0%.',
    referenceData: 'Nước X: Dịch vụ = 240,0 tỉ USD; Tổng GDP = 400,0 tỉ USD.',
  },
  {
    id: 'q-calc-02',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-7',
    partId: 'phan-3',
    lessonId: 'bai-20',
    type: 'multiple_choice',
    cognitiveLevel: 'van_dung',
    question: `Cho bảng số liệu:
DIỆN TÍCH VÀ DÂN SỐ MỘT SỐ ĐỊA PHƯƠNG NĂM 2023
┌──────────────┬──────────────────┬──────────────────────┐
│  Địa phương  │ Diện tích (km²)  │ Dân số (nghìn người) │
├──────────────┼──────────────────┼──────────────────────┤
│ Địa phương A │      2 500       │        1 250         │
│ Địa phương B │      4 000       │          600         │
└──────────────┴──────────────────┴──────────────────────┘
Căn cứ vào bảng số liệu, mật độ dân số của Địa phương A năm 2023 là bao nhiêu?`,
    options: [
      '2 người/km²',
      '500 người/km²',
      '150 người/km²',
      '200 người/km²',
    ],
    correctIndex: 1,
    explanation: 'Đổi dân số Địa phương A: 1 250 nghìn người = 1 250 000 người. Mật độ dân số = Dân số / Diện tích = 1 250 000 người / 2 500 km² = 500 người/km².',
    referenceData: 'Địa phương A: Diện tích = 2 500 km²; Dân số = 1 250 nghìn người.',
  },
  {
    id: 'q-calc-03',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-8',
    partId: 'phan-3',
    lessonId: 'bai-24',
    type: 'multiple_choice',
    cognitiveLevel: 'van_dung',
    question: `Cho bảng số liệu:
SẢN LƯỢNG LƯƠNG THỰC CỦA MỘT QUỐC GIA GIAI ĐOẠN 2015 – 2023
(Đơn vị: Triệu tấn)
┌───────────┬─────────┬─────────┬─────────┬─────────┐
│    Năm    │  2015   │  2018   │  2020   │  2023   │
├───────────┼─────────┼─────────┼─────────┼─────────┤
│ Sản lượng │  40,0   │  44,0   │  47,2   │  52,0   │
└───────────┴─────────┴─────────┴─────────┴─────────┘
Lấy năm 2015 = 100%, tốc độ tăng trưởng sản lượng lương thực của quốc gia này năm 2023 đạt:`,
    options: [
      '130,0%',
      '118,0%',
      '30,0%',
      '125,0%',
    ],
    correctIndex: 0,
    explanation: 'Công thức tính tốc độ tăng trưởng lấy năm gốc 2015 = 100%: T (2023) = (Sản lượng 2023 / Sản lượng 2015) × 100% = (52,0 / 40,0) × 100% = 130,0%.',
    referenceData: 'Năm gốc 2015: 40,0 triệu tấn; Năm 2023: 52,0 triệu tấn.',
  },
  {
    id: 'q-calc-04',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-3',
    partId: 'phan-2',
    lessonId: 'bai-9',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    question: `Cho bảng số liệu:
NHIỆT ĐỘ TRUNG BÌNH CÁC THÁNG TẠI MỘT TRẠM KHÍ TƯỢNG (Đơn vị: °C)
┌──────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│  Tháng   │  1   │  2   │  3   │  4   │  5   │  6   │  7   │  8   │  9   │  10  │  11  │  12  │
├──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ Nhiệt độ │ 16,4 │ 17,2 │ 20,0 │ 24,1 │ 27,5 │ 28,9 │ 29,2 │ 28,6 │ 27,1 │ 24,8 │ 21,3 │ 17,8 │
└──────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
Căn cứ vào bảng số liệu trên, biên độ nhiệt độ trung bình năm của trạm khí tượng này là:`,
    options: [
      '12,8°C',
      '29,2°C',
      '16,4°C',
      '14,2°C',
    ],
    correctIndex: 0,
    explanation: 'Tháng có nhiệt độ cao nhất là tháng 7 (29,2°C), tháng có nhiệt độ thấp nhất là tháng 1 (16,4°C). Biên độ nhiệt độ năm = Tmax - Tmin = 29,2°C - 16,4°C = 12,8°C.',
    referenceData: 'Tmax = 29,2°C (tháng 7); Tmin = 16,4°C (tháng 1).',
  },
  {
    id: 'q-calc-05',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-9',
    partId: 'phan-3',
    lessonId: 'bai-36',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    question: `Cho bảng số liệu:
GIÁ TRỊ XUẤT KHẨU, NHẬP KHẨU HÀNG HÓA CỦA NƯỚC TA NĂM 2022
(Đơn vị: Tỉ USD)
┌───────────┬──────────┐
│ Chỉ tiêu  │ Năm 2022 │
├───────────┼──────────┤
│ Xuất khẩu │  371,3   │
│ Nhập khẩu │  358,9   │
└───────────┴──────────┘
Căn cứ vào bảng số liệu trên, cán cân thương mại hàng hóa của nước ta năm 2022 là:`,
    options: [
      'Xuất siêu 12,4 tỉ USD',
      'Nhập siêu 12,4 tỉ USD',
      'Xuất siêu 730,2 tỉ USD',
      'Nhập siêu 358,9 tỉ USD',
    ],
    correctIndex: 0,
    explanation: 'Cán cân thương mại = Giá trị xuất khẩu - Giá trị nhập khẩu = 371,3 - 358,9 = +12,4 tỉ USD. Vì kết quả mang giá trị dương (> 0) nên nước ta xuất siêu 12,4 tỉ USD.',
    referenceData: 'Xuất khẩu: 371,3 tỉ USD; Nhập khẩu: 358,9 tỉ USD.',
  },
  {
    id: 'q-calc-06',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-9',
    partId: 'phan-3',
    lessonId: 'bai-34',
    type: 'multiple_choice',
    cognitiveLevel: 'van_dung',
    question: `Cho bảng số liệu:
SỐ LƯỢT HÀNH KHÁCH VẬN CHUYỂN PHÂN THEO NGÀNH VẬN TẢI
(Đơn vị: Triệu lượt người)
┌────────────────┬──────────┬──────────┐
│ Ngành vận tải  │ Năm 2018 │ Năm 2023 │
├────────────────┼──────────┼──────────┤
│ Đường bộ       │ 3 200,0  │ 4 480,0  │
│ Hàng không     │    50,0  │    85,0  │
└────────────────┴──────────┴──────────┘
Nhận xét nào sau đây đúng về sự biến động số lượt hành khách vận chuyển năm 2023 so với năm 2018?`,
    options: [
      'Đường bộ có số lượng hành khách tăng nhiều hơn, hàng không có tốc độ tăng nhanh hơn',
      'Hàng không có số lượng hành khách tăng nhiều hơn đường bộ',
      'Đường bộ có tốc độ tăng trưởng nhanh hơn ngành hàng không',
      'Cả hai ngành đều có số lượng hành khách giảm sút qua các năm',
    ],
    correctIndex: 0,
    explanation: 'Số lượng tăng thêm tuyệt đối: Đường bộ tăng 4 480,0 - 3 200,0 = 1 280,0 triệu lượt; Hàng không tăng 85,0 - 50,0 = 35,0 triệu lượt (Đường bộ tăng nhiều hơn). Tốc độ tăng trưởng: Đường bộ = 4 480 / 3 200 = 140,0%; Hàng không = 85 / 50 = 170,0% (Hàng không tăng nhanh hơn).',
    referenceData: 'Đường bộ: +1 280 triệu lượt (140,0%); Hàng không: +35 triệu lượt (170,0%).',
  },
  {
    id: 'q-calc-07',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-4',
    partId: 'phan-2',
    lessonId: 'bai-12',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    question: `Cho bảng số liệu:
DIỆN TÍCH RỪNG CỦA MỘT QUỐC GIA GIAI ĐOẠN 2010 – 2022
(Đơn vị: Triệu hecta)
┌─────────────────────┬──────┬──────┬──────┬──────┬──────┐
│        Năm          │ 2010 │ 2015 │ 2018 │ 2020 │ 2022 │
├─────────────────────┼──────┼──────┼──────┼──────┼──────┤
│ Rừng tự nhiên       │ 10,3 │ 10,2 │ 10,3 │ 10,3 │ 10,1 │
│ Rừng trồng          │  3,1 │  3,9 │  4,2 │  4,4 │  4,7 │
│ Tổng diện tích rừng │ 13,4 │ 14,1 │ 14,5 │ 14,7 │ 14,8 │
└─────────────────────┴──────┴──────┴──────┴──────┴──────┘
Theo bảng số liệu trên, nhận xét nào sau đây phản ánh đúng xu hướng biến động diện tích rừng giai đoạn 2010 – 2022?`,
    options: [
      'Tổng diện tích rừng tăng liên tục, chủ yếu do diện tích rừng trồng tăng nhanh',
      'Diện tích rừng tự nhiên tăng nhanh và liên tục qua tất cả các năm',
      'Diện tích rừng trồng giảm dần qua các giai đoạn',
      'Tổng diện tích rừng giảm do rừng tự nhiên bị suy giảm mạnh',
    ],
    correctIndex: 0,
    explanation: 'Tổng diện tích rừng tăng liên tục từ 13,4 triệu ha lên 14,8 triệu ha. Trong đó, rừng trồng tăng mạnh từ 3,1 triệu ha lên 4,7 triệu ha (+1,6 triệu ha), còn rừng tự nhiên biến động nhẹ từ 10,3 ha giảm còn 10,1 triệu ha.',
    referenceData: 'Tổng diện tích tăng liên tục từ 13,4 triệu ha (2010) lên 14,8 triệu ha (2022).',
  },
  {
    id: 'q-calc-08',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-9',
    partId: 'phan-3',
    lessonId: 'bai-36',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    question: `Cho bảng số liệu:
CƠ CẤU GIÁ TRỊ XUẤT KHẨU VÀ NHẬP KHẨU CỦA NƯỚC TA NĂM 2015 VÀ NĂM 2022
(Đơn vị: %)
┌──────┬───────────┬───────────┬─────────┐
│ Năm  │ Xuất khẩu │ Nhập khẩu │ Tổng số │
├──────┼───────────┼───────────┼─────────┤
│ 2015 │   49,8    │   50,2    │  100,0  │
│ 2022 │   50,9    │   49,1    │  100,0  │
└──────┴───────────┴───────────┴─────────┘
Để thể hiện sự thay đổi cơ cấu giá trị xuất nhập khẩu của nước ta trong 2 năm 2015 và 2022 theo bảng số liệu trên, dạng biểu đồ nào sau đây thích hợp nhất?`,
    options: [
      'Biểu đồ tròn',
      'Biểu đồ đường',
      'Biểu đồ miền',
      'Biểu đồ kết hợp',
    ],
    correctIndex: 0,
    explanation: 'Bảng số liệu có đơn vị %, thể hiện cơ cấu của một tổng thể trong 2 năm (số năm ít, từ 1 đến 3 năm). Do đó, biểu đồ tròn là dạng biểu đồ thích hợp nhất.',
    referenceData: 'Dữ liệu tỉ trọng (%) trong 2 năm độc lập 2015 và 2022.',
  },

  // --- PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI CÓ NGỮ LIỆU BẢNG SỐ LIỆU (2 CÂU) ---
  {
    id: 'q-calc-09',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-9',
    partId: 'phan-3',
    lessonId: 'bai-33',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    contextTitle: 'Bảng số liệu cơ cấu GDP theo ngành kinh tế của nhóm nước phát triển và đang phát triển',
    contextText: 'Dưới đây là bảng số liệu thống kê cơ cấu GDP phân theo ngành kinh tế của Nhóm nước phát triển (Nước A) và Nhóm nước đang phát triển (Nước B) năm gần đây (Đơn vị: %):',
    contextDataGrid: {
      headers: ['Nhóm nước', 'Nông - lâm - thủy sản (%)', 'Công nghiệp - xây dựng (%)', 'Dịch vụ (%)', 'Tổng số (%)'],
      rows: [
        ['Phát triển (Nước A)', 1.5, 24.5, 74.0, 100.0],
        ['Đang phát triển (Nước B)', 22.0, 38.0, 40.0, 100.0],
      ],
    },
    contextSource: 'Niên giám Thống kê Quốc tế (Dữ liệu phục vụ kiểm tra)',
    statements: [
      {
        id: 'a',
        text: 'Ở nhóm nước phát triển (Nước A), ngành dịch vụ chiếm tỉ trọng áp đảo trong cơ cấu GDP (đạt 74,0%).',
        isCorrect: true,
        explanation: 'Nhìn vào bảng số liệu, ngành dịch vụ của Nước A đạt 74,0%, chiếm tỉ trọng lớn nhất và chi phối toàn bộ nền kinh tế.',
      },
      {
        id: 'b',
        text: 'Tỉ trọng ngành nông - lâm - thủy sản ở nhóm nước đang phát triển (Nước B) cao gấp hơn 14 lần so với nhóm nước phát triển.',
        isCorrect: true,
        explanation: 'Tỉ số: 22,0% / 1,5% ≈ 14,67 lần. Như vậy tỉ trọng nông nghiệp của Nước B cao gấp hơn 14 lần Nước A.',
      },
      {
        id: 'c',
        text: 'Ở nhóm nước đang phát triển (Nước B), ngành nông - lâm - thủy sản chiếm tỉ trọng lớn nhất trong cơ cấu GDP.',
        isCorrect: false,
        explanation: 'Ở Nước B, ngành dịch vụ chiếm 40,0% và công nghiệp chiếm 38,0%, đều cao hơn ngành nông - lâm - thủy sản (22,0%).',
      },
      {
        id: 'd',
        text: 'Sự chênh lệch về tỉ trọng khu vực dịch vụ giữa hai nhóm nước phản ánh rõ nét trình độ phát triển kinh tế và xu hướng chuyển dịch hiện đại hóa.',
        isCorrect: true,
        explanation: 'Các nước có trình độ phát triển cao thường có tỉ trọng khu vực dịch vụ rất cao (trên 70%), trong khi nhóm đang phát triển vẫn đang trong quá trình công nghiệp hóa.',
      },
    ],
  },
  {
    id: 'q-calc-10',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-9',
    partId: 'phan-3',
    lessonId: 'bai-34',
    type: 'true_false_context',
    cognitiveLevel: 'van_dung',
    contextTitle: 'Bảng số liệu hoạt động vận tải hàng hóa theo các ngành vận tải',
    contextText: 'Bảng số liệu thống kê tình hình vận tải hàng hóa năm gần đây của một vùng kinh tế trọng điểm:',
    contextDataGrid: {
      headers: ['Ngành vận tải', 'Khối lượng vận chuyển (triệu tấn)', 'Khối lượng luân chuyển (tỉ tấn.km)'],
      rows: [
        ['Đường sắt', 4.5, 3.6],
        ['Đường bộ', 120.0, 7.2],
        ['Đường biển', 60.0, 180.0],
        ['Đường hàng không', 0.2, 0.8],
      ],
    },
    contextSource: 'Cục Thống kê Giao thông Vận tải',
    statements: [
      {
        id: 'a',
        text: 'Đường bộ có khối lượng vận chuyển hàng hóa lớn nhất trong các ngành vận tải (đạt 120,0 triệu tấn).',
        isCorrect: true,
        explanation: 'Khối lượng vận chuyển của đường bộ là 120,0 triệu tấn, cao nhất trong cả 4 ngành được thống kê.',
      },
      {
        id: 'b',
        text: 'Đường biển có khối lượng luân chuyển hàng hóa lớn nhất (đạt 180,0 tỉ tấn.km), chiếm ưu thế vượt trội ở cự li dài.',
        isCorrect: true,
        explanation: 'Khối lượng luân chuyển của đường biển đạt 180,0 tỉ tấn.km, cao gấp nhiều lần các ngành khác nhờ vận chuyển đường dài và khối lượng lớn.',
      },
      {
        id: 'c',
        text: 'Cự li vận chuyển trung bình của ngành đường bộ lớn hơn cự li vận chuyển trung bình của ngành đường biển.',
        isCorrect: false,
        explanation: 'Cự li vận chuyển TB = Luân chuyển / Vận chuyển. Đường bộ: (7,2 × 1000) / 120 = 60 km. Đường biển: (180 × 1000) / 60 = 3 000 km. Cự li đường biển lớn hơn đường bộ gấp 50 lần.',
      },
      {
        id: 'd',
        text: 'Đường hàng không có khối lượng vận chuyển nhỏ nhất nhưng chuyên chở hàng hóa có giá trị kinh tế cao và cần tốc độ nhanh.',
        isCorrect: true,
        explanation: 'Đường hàng không chỉ vận chuyển 0,2 triệu tấn do chi phí cước cao, chủ yếu phục vụ thư tín bưu phẩm và hàng hóa công nghệ cao, cấp bách.',
      },
    ],
  },

  // --- PHẦN III: TRẢ LỜI NGẮN - TÍNH TOÁN ĐỊA LÍ BẰNG SỐ (3 CÂU) ---
  {
    id: 'q-calc-11',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-7',
    partId: 'phan-3',
    lessonId: 'bai-20',
    type: 'short_answer',
    cognitiveLevel: 'van_dung',
    question: 'Năm 2023, tỉnh Lạng Sơn có diện tích tự nhiên là 8 310 km² và dân số trung bình là 802 000 người. Hãy tính mật độ dân số của tỉnh Lạng Sơn năm 2023 (làm tròn kết quả đến hàng đơn vị, đơn vị tính: người/km²).',
    formula: 'Mật độ dân số = Dân số / Diện tích',
    calculationSteps: [
      'Xác định dân số: 802 000 người',
      'Xác định diện tích: 8 310 km²',
      'Thực hiện phép chia: 802 000 / 8 310 ≈ 96,51 người/km²',
      'Làm tròn đến hàng đơn vị: 97 người/km²',
    ],
    numericValue: 97,
    tolerance: 0.5,
    roundingRule: 'Làm tròn đến hàng đơn vị',
    unit: 'người/km²',
    guide: 'Lấy tổng số dân chia cho diện tích tự nhiên, làm tròn kết quả đến số nguyên hàng đơn vị.',
    acceptedAnswers: ['97', '97 người/km²', '96.5', '96,5'],
    standardAnswer: '97',
    explanation: 'Mật độ dân số = 802 000 / 8 310 = 96,51 người/km². Làm tròn đến hàng đơn vị theo quy định được 97 người/km².',
  },
  {
    id: 'q-calc-12',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-8',
    partId: 'phan-3',
    lessonId: 'bai-24',
    type: 'short_answer',
    cognitiveLevel: 'van_dung',
    question: 'Năm 2022, một địa phương gieo cấy lúa trên diện tích 120 000 hecta, thu được tổng sản lượng thóc là 726 000 tấn. Hãy tính năng suất lúa trung bình của địa phương đó năm 2022 (đơn vị tính: tạ/ha, làm tròn kết quả đến 1 chữ số thập phân).',
    formula: 'Năng suất lúa = Sản lượng (tạ) / Diện tích (ha)',
    calculationSteps: [
      'Đổi đơn vị sản lượng từ tấn sang tạ: 726 000 tấn = 7 260 000 tạ (vì 1 tấn = 10 tạ)',
      'Diện tích gieo trồng: 120 000 ha',
      'Thực hiện phép chia: 7 260 000 / 120 000 = 60,5 tạ/ha',
    ],
    numericValue: 60.5,
    tolerance: 0.1,
    roundingRule: 'Lấy 1 chữ số sau dấu thập phân',
    unit: 'tạ/ha',
    guide: 'Đổi sản lượng từ tấn ra tạ (nhân 10) rồi chia cho diện tích (ha).',
    acceptedAnswers: ['60.5', '60,5', '60.5 tạ/ha', '60,5 tạ/ha'],
    standardAnswer: '60.5',
    explanation: 'Đổi 726 000 tấn = 7 260 000 tạ. Năng suất = 7 260 000 tạ / 120 000 ha = 60,5 tạ/ha.',
  },
  {
    id: 'q-calc-13',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-7',
    partId: 'phan-3',
    lessonId: 'bai-21',
    type: 'short_answer',
    cognitiveLevel: 'van_dung',
    question: 'Năm 2023, một quốc gia có tổng GDP đạt 430 tỉ USD và dân số trung bình là 100 triệu người. Hãy tính thu nhập GDP bình quân đầu người của quốc gia đó năm 2023 (đơn vị tính: USD/người, ghi kết quả là số nguyên).',
    formula: 'GDP bình quân đầu người = Tổng GDP / Tổng số dân',
    calculationSteps: [
      'Đổi 430 tỉ USD = 430 000 000 000 USD',
      'Dân số: 100 000 000 người',
      'Thực hiện phép tính: 430 000 000 000 / 100 000 000 = 4 300 USD/người',
    ],
    numericValue: 4300,
    tolerance: 1,
    roundingRule: 'Số nguyên',
    unit: 'USD/người',
    guide: 'Lấy tổng GDP chia cho số dân (lưu ý đổi đồng nhất đơn vị tính).',
    acceptedAnswers: ['4300', '4.300', '4,300', '4300 USD/người'],
    standardAnswer: '4300',
    explanation: 'GDP bình quân đầu người = 430 tỉ USD / 100 triệu người = 430 000 triệu USD / 100 triệu người = 4 300 USD/người.',
  },

  // --- PHẦN IV: CÂU HỎI GHÉP NỐI HAI CỘT (2 CÂU) ---
  {
    id: 'q-calc-14',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-1',
    partId: 'phan-1',
    lessonId: 'bai-1',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    title: 'Ghép chỉ tiêu kinh tế - xã hội ở Cột A với công thức tính toán địa lí tương ứng ở Cột B',
    columnATitle: 'Chỉ tiêu địa lí (Cột A)',
    columnBTitle: 'Công thức tính toán (Cột B)',
    pairs: [
      {
        id: 'p1',
        left: 'Mật độ dân số',
        right: 'Dân số chia cho Diện tích (người/km²)',
        reason: 'Mật độ dân số phản ánh số người sinh sống trên một đơn vị diện tích diện tích đất đai.',
      },
      {
        id: 'p2',
        left: 'Tỉ trọng của một thành phần (%)',
        right: '(Giá trị thành phần chia cho Tổng giá trị) nhân 100%',
        reason: 'Tỉ trọng xác định phần trăm đóng góp của một yếu tố cấu thành trong cơ cấu tổng thể.',
      },
      {
        id: 'p3',
        left: 'Tốc độ tăng trưởng năm i so với năm gốc (%)',
        right: '(Giá trị năm i chia cho Giá trị năm gốc) nhân 100%',
        reason: 'Tốc độ tăng trưởng lấy năm gốc làm chuẩn 100% để đo lường mức độ gia tăng qua các mốc thời gian.',
      },
      {
        id: 'p4',
        left: 'Cán cân xuất nhập khẩu',
        right: 'Giá trị xuất khẩu trừ đi Giá trị nhập khẩu',
        reason: 'Cán cân thương mại bằng hiệu số giữa kim ngạch xuất khẩu và kim ngạch nhập khẩu.',
      },
    ],
    explanation: 'Các công thức tính toán cơ bản môn Địa lí 10: Mật độ dân số = Dân số / Diện tích; Tỉ trọng = (Bộ phận / Tổng thể) × 100%; Tốc độ tăng trưởng = (Năm sau / Năm gốc) × 100%; Cán cân = Xuất khẩu - Nhập khẩu.',
  },
  {
    id: 'q-calc-15',
    topicId: 'chuyen-de-ki-nang',
    chapterId: 'chuong-1',
    partId: 'phan-1',
    lessonId: 'bai-3',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    title: 'Ghép mục đích thể hiện bảng số liệu ở Cột A với dạng biểu đồ thích hợp nhất ở Cột B',
    columnATitle: 'Yêu cầu thể hiện số liệu (Cột A)',
    columnBTitle: 'Dạng biểu đồ thích hợp nhất (Cột B)',
    pairs: [
      {
        id: 'p1',
        left: 'Thể hiện quy mô và cơ cấu đối tượng trong 1 đến 3 năm',
        right: 'Biểu đồ tròn',
        reason: 'Biểu đồ tròn tối ưu nhất khi thể hiện tỉ trọng cơ cấu của tổng thể trong khoảng từ 1 đến 3 mốc thời gian.',
      },
      {
        id: 'p2',
        left: 'Thể hiện tốc độ tăng trưởng của nhiều đối tượng qua nhiều năm',
        right: 'Biểu đồ đường',
        reason: 'Biểu đồ đường biểu diễn trực quan nhất xu hướng và nhịp độ gia tăng liên tục qua chuỗi năm dài.',
      },
      {
        id: 'p3',
        left: 'Thể hiện sự chuyển dịch cơ cấu kinh tế từ 4 năm trở lên',
        right: 'Biểu đồ miền',
        reason: 'Biểu đồ miền phù hợp nhất khi thể hiện sự thay đổi cơ cấu theo thời gian kéo dài từ 4 năm trở lên.',
      },
      {
        id: 'p4',
        left: 'Thể hiện so sánh quy mô hoặc số lượng giữa các đối tượng địa lí',
        right: 'Biểu đồ cột',
        reason: 'Biểu đồ cột trực quan hóa chênh lệch quy mô tuyệt đối giữa các vùng, quốc gia hoặc đối tượng địa lí.',
      },
    ],
    explanation: 'Nguyên tắc chọn biểu đồ Địa lí 10: Cơ cấu 1-3 năm chọn biểu đồ Tròn; Cơ cấu từ 4 năm trở lên chọn biểu đồ Miền; Tốc độ tăng trưởng chọn biểu đồ Đường; So sánh quy mô hoặc tình hình phát triển chọn biểu đồ Cột.',
  },
];
