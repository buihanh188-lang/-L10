import { ShortAnswerQuestion } from '../types';

export const ENGLISH_UNITS_MAP: Record<string, string> = {
  'người/km²': 'people/km²',
  'tạ/ha': 'quintals/ha',
  'tấn/ha': 'tons/ha',
  'USD/người': 'USD/capita',
  '%': '%',
  '°C': '°C',
  'mm': 'mm',
  'giờ': 'hours',
  'giây': 'seconds',
  'km': 'km',
  'độ': 'degrees (°)',
  'cm/năm': 'cm/year',
  'mm/năm': 'mm/year',
  'triệu m³': 'million m³',
  'kg': 'kg',
  'lần': 'times',
  'ha/trang trại': 'ha/farm',
  'kWh/người': 'kWh/capita',
  'thuê bao/100 dân': 'subscriptions/100 people',
  'triệu đồng/lượt': 'million VND/visitor',
  'triệu USD': 'million USD',
  'năm': 'years',
  'tỉ USD': 'billion USD',
  'triệu tấn': 'million tons',
  'tấn': 'tons',
  'triệu người': 'million people',
  'mét': 'm',
  'phút': 'minutes',
  'tỉ người': 'billion people',
  'quốc gia': 'country',
};

interface SATemplateRule {
  qPattern: string; // Vietnamese template with {N} placeholders
  qEn: string;      // English template with {1}, {2}, ... positional placeholders
  fPattern?: string;
  fEn?: string;
  gEn: string;
  stepsPatterns: Array<{ vi: string; en: string }>;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compilePattern(templateWithN: string): RegExp {
  const parts = templateWithN.split('{N}');
  const regexStr = parts.map(escapeRegex).join('([0-9]+(?:[.,][0-9]+)*)');
  return new RegExp('^' + regexStr + '$');
}

function applyTemplate(pattern: string, targetEn: string, source: string): string | null {
  const re = compilePattern(pattern);
  const m = source.match(re);
  if (!m) return null;
  let out = targetEn;
  for (let i = 1; i < m.length; i++) {
    out = out.replace(new RegExp(`\\{${i}\\}`, 'g'), m[i]);
  }
  return out;
}

/**
 * Auto-build positional placeholders {1}, {2}, ... sequentially from a clean EN template containing {N}
 */
function sequentialize(enWithN: string): string {
  let idx = 0;
  return enWithN.replace(/\{N\}/g, () => `{${++idx}}`);
}

interface RawSARule {
  qVi: string;
  qEn: string;
  fVi: string;
  fEn: string;
  gEn: string;
  steps: Array<{ vi: string; en: string }>;
}

const RAW_SA_RULES: RawSARule[] = [
  // #1 [bai-1]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Trong một viện quy hoạch không gian vùng Đông Bắc, tổng số nhân sự là {N} người, trong đó số chuyên viên có trình độ chuyên môn về Địa lí, Bản đồ và GIS là {N} người. Hãy tính tỉ trọng nhân lực chuyên môn Địa lí - GIS trong tổng số nhân lực của viện quy hoạch trên (tính theo đơn vị %)? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) At a spatial planning institute in the Northeast region, total staff is {3} people, of whom {4} specialists hold qualifications in Geography, Cartography, and GIS. Calculate the percentage share of Geography–GIS specialists in the institute’s total workforce (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ trọng (%) = (Số nhân sự chuyên môn / Tổng số nhân sự) × {N} = ({N} / {N}) × {N}',
    fEn: 'Share (%) = (Specialist Staff / Total Staff) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide the number of specialized staff by total staff, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Xác định số liệu: Nhân sự Địa lí - GIS = {N} người; Tổng nhân sự = {N} người.', en: 'Step {1}: Identify data: Geography–GIS staff = {2} people; Total staff = {3} people.' },
      { vi: 'Bước {N}: Áp dụng công thức: ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Apply formula: ({2} / {3}) × {4} = {5}%.' },
      { vi: 'Bước {N}: Làm tròn đến {N} chữ số thập phân: {N}%.', en: 'Step {1}: Round to {2} decimal place: {3}%.' },
    ],
  },
  // #2 [bai-2]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Trên một bản đồ địa hình có tỉ lệ {N} : {N}, người ta đo được khoảng cách giữa điểm di tích Ải Chi Lăng và khu dân cư xã Vạn Linh là {N} cm. Hãy tính khoảng cách thực tế ngoài thực địa giữa hai điểm trên theo đơn vị kilômét (km)? (Làm tròn đến {N} chữ số thập phân nếu có số lẻ).',
    qEn: '[Geographic Problem {1}.{2}] On a topographic map at a scale of {3} : {4}, the measured map distance between Ai Chi Lang historic site and the residential area of Van Linh commune is {5} cm. Calculate the actual ground distance between the two points in kilometers (km) (round to {6} decimal place if fractional).',
    fVi: 'D (thực tế km) = [d (cm) × M] / {N} = [{N} × {N}] / {N}',
    fEn: 'D (actual km) = [d (cm) × M] / {1} = [{2} × {3}] / {4}',
    gEn: 'Multiply map distance by the scale denominator, then convert centimeters to kilometers (divide by 100,000).',
    steps: [
      { vi: 'Bước {N}: Khoảng cách trên bản đồ d = {N} cm; mẫu số tỉ lệ M = {N}.', en: 'Step {1}: Map distance d = {2} cm; scale denominator M = {3}.' },
      { vi: 'Bước {N}: Khoảng cách thực tế = {N} × {N} = {N} cm.', en: 'Step {1}: Actual distance = {2} × {3} = {4} cm.' },
      { vi: 'Bước {N}: Đổi đơn vị sang kilômét (chia cho {N}): {N} km.', en: 'Step {1}: Convert to kilometers (divide by {2}): {3} km.' },
    ],
  },
  // #3 [bai-3]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Một vệ tinh định vị GPS đang ở khoảng cách {N} km so với thiết bị máy thu mặt đất tại xã Vạn Linh (tỉnh Lạng Sơn). Biết vận tốc truyền sóng vô tuyến trong không gian là {N} km/s. Hãy tính thời gian tín hiệu vô tuyến truyền từ vệ tinh đến máy thu GPS (tính bằng giây, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A GPS navigation satellite is orbiting at a distance of {3} km from a ground receiver in Van Linh commune (Lang Son province). Given that radio waves propagate through space at {4} km/s, calculate the signal travel time from the satellite to the GPS receiver in seconds (round to {5} decimal places).',
    fVi: 'Thời gian t (giây) = Khoảng cách S / Vận tốc sóng c = {N} / {N}',
    fEn: 'Time t (s) = Distance S / Wave speed c = {1} / {2}',
    gEn: 'Divide the distance by the speed of light (300,000 km/s).',
    steps: [
      { vi: 'Bước {N}: Xác định quãng đường S = {N} km, vận tốc sóng c = {N} km/s.', en: 'Step {1}: Identify distance S = {2} km and wave speed c = {3} km/s.' },
      { vi: 'Bước {N}: Thực hiện phép tính: t = {N} / {N} = {N} giây.', en: 'Step {1}: Calculate: t = {2} / {3} = {4} seconds.' },
      { vi: 'Bước {N}: Làm tròn đến {N} chữ số thập phân: {N} giây.', en: 'Step {1}: Round to {2} decimal places: {3} seconds.' },
    ],
  },
  // #4 [bai-4]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Cho biết tổng thể tích của Trái Đất là {N},{N} tỉ km³. Một khối vật liệu cấu tạo vỏ Trái Đất có thể tích đo được là {N} tỉ km³. Hãy tính tỉ trọng phần trăm thể tích của khối vật liệu này so với tổng thể tích Trái Đất (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: "[Geographic Problem {1}.{2}] (Practice dataset) Earth's total volume is {3}.{4} billion km³. A crustal rock unit has a measured volume of {5} billion km³. Calculate this rock unit's percentage share of Earth's total volume (unit: %, round to {6} decimal places).",
    fVi: 'Tỉ trọng (%) = (Thể tích khối vật liệu / Tổng thể tích Trái Đất) × {N} = ({N} / {N},{N}) × {N}',
    fEn: "Share (%) = (Rock Unit Volume / Total Earth Volume) × {1} = ({2} / {3}.{4}) × {5}",
    gEn: "Divide the crustal rock volume by Earth's total volume, then multiply by 100.",
    steps: [
      { vi: 'Bước {N}: Thể tích khối vật liệu = {N} tỉ km³; Tổng thể tích Trái Đất = {N},{N} tỉ km³.', en: "Step {1}: Rock unit volume = {2} billion km³; Total Earth volume = {3}.{4} billion km³." },
      { vi: 'Bước {N}: Phép tính: ({N} / {N},{N}) × {N} = {N}%.', en: 'Step {1}: Compute: ({2} / {3}.{4}) × {5} = {6}%.' },
      { vi: 'Bước {N}: Làm tròn đến {N} chữ số thập phân: {N}%.', en: 'Step {1}: Round to {2} decimal places: {3}%.' },
    ],
  },
  // #5 [bai-5] GMT -> Lang Son time
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Khi đồng hồ tại đài thiên văn Greenwich (Luân Đôn, múi giờ số {N}) chỉ {N} giờ ngày {N}/{N}, thì tại tỉnh Lạng Sơn (Việt Nam, thuộc múi giờ số {N}) lúc đó là mấy giờ? (Nhập kết quả bằng số nguyên theo hệ {N} giờ).',
    qEn: '[Geographic Problem {1}.{2}] When the clock at the Royal Observatory Greenwich (London, Time Zone {3}) reads {4}:00 on {5}/{6}, what hour is it in Lang Son province (Vietnam, Time Zone {7})? (Enter a whole integer using the {8}-hour clock).',
    fVi: 'Giờ Lạng Sơn = Giờ GMT + {N} múi = {N} + {N}',
    fEn: 'Lang Son Time = GMT + {1} zones = {2} + {3}',
    gEn: 'Add 7 hours to GMT time.',
    steps: [
      { vi: 'Bước {N}: Xác định múi giờ: Luân Đôn múi {N}, Lạng Sơn (Việt Nam) múi {N}.', en: 'Step {1}: Identify time zones: London is UTC+{2}, Lang Son (Vietnam) is UTC+{3}.' },
      { vi: 'Bước {N}: Chênh lệch thời gian: Múi {N} nhanh hơn Múi {N} là {N} giờ.', en: 'Step {1}: Time difference: Zone {2} is {4} hours ahead of Zone {3}.' },
      { vi: 'Bước {N}: Tính giờ: {N} + {N} = {N} giờ cùng ngày.', en: 'Step {1}: Calculate local hour: {2} + {3} = {4}:00 on the same day.' },
    ],
  },
  // #6 [bai-5] Longitude difference -> hours
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Hai địa điểm A và B trên cùng một bán cầu cách nhau {N}° kinh tuyến. Biết Trái Đất tự quay {N}° kinh tuyến mất {N} phút. Hãy tính độ chênh lệch thời gian địa phương giữa hai điểm A và B theo đơn vị giờ? (Làm tròn {N} chữ số thập phân nếu có số lẻ).',
    qEn: '[Geographic Problem {1}.{2}] Two locations A and B in the same hemisphere are separated by {3}° of longitude. Knowing Earth rotates {4}° of longitude every {5} minutes, calculate the local solar time difference between A and B in hours (round to {6} decimal place if fractional).',
    fVi: 'Chênh lệch thời gian = (Chênh lệch kinh độ × {N} phút) / {N} = ({N} × {N}) / {N}',
    fEn: 'Time Difference = (Longitude Difference × {1} min) / {2} = ({3} × {4}) / {5}',
    gEn: 'Multiply longitude difference by 4 minutes per degree, then divide by 60 to convert to hours.',
    steps: [
      { vi: 'Bước {N}: Chênh lệch kinh độ = {N}°.', en: 'Step {1}: Longitude difference = {2}°.' },
      { vi: 'Bước {N}: Đổi sang phút: {N} × {N} = {N} phút.', en: 'Step {1}: Convert to minutes: {2} × {3} = {4} minutes.' },
      { vi: 'Bước {N}: Đổi sang giờ: {N} / {N} = {N} giờ.', en: 'Step {1}: Convert to hours: {2} / {3} = {4} hours.' },
    ],
  },
  // #7 [bai-5] Solstice Ha Chi
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại khu vực Chi Lăng (tỉnh Lạng Sơn) có vĩ độ xấp xỉ {N}°B. Hãy tính góc nhập xạ (độ cao của Mặt Trời lúc {N} giờ trưa) tại đây vào ngày Hạ chí ({N}/{N}) (khi Mặt Trời lên thiên đỉnh tại vĩ độ {N}°B)? (Tính bằng độ °, làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Chi Lang (Lang Son province) lies at approximately {3}°N latitude. Calculate the noon solar incidence angle (solar altitude at {4}:00 PM/noon) here on the Summer Solstice ({5}/{6}), when the Sun is directly overhead at {7}°N (unit: degrees °, round to {8} decimal place).',
    fVi: 'h = {N}° - |φ - α| = {N}° - |{N}° - ({N}°)|',
    fEn: 'h = {1}° - |φ - α| = {2}° - |{3}° - ({4}°)|',
    gEn: 'Apply the formula h = 90° - |local latitude - subsolar latitude|.',
    steps: [
      { vi: 'Bước {N}: Vĩ độ Chi Lăng φ = {N}°B; Vĩ độ Mặt Trời lên thiên đỉnh α = {N}°.', en: 'Step {1}: Chi Lang latitude φ = {2}°N; Subsolar latitude α = {3}°.' },
      { vi: 'Bước {N}: Tính hiệu khoảng cách vĩ độ: |{N} - ({N})| = {N}°.', en: 'Step {1}: Latitudinal distance: |{2} - ({3})| = {4}°.' },
      { vi: 'Bước {N}: Góc nhập xạ h = {N}° - {N}° = {N}°.', en: 'Step {1}: Solar incidence angle h = {2}° - {3}° = {4}°.' },
    ],
  },
  // #8 [bai-5] Equinox Xuan Phan
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại khu vực Chi Lăng (tỉnh Lạng Sơn) có vĩ độ xấp xỉ {N}°B. Hãy tính góc nhập xạ (độ cao của Mặt Trời lúc {N} giờ trưa) tại đây vào ngày Xuân phân ({N}/{N}) (khi Mặt Trời lên thiên đỉnh tại vĩ độ {N}°Xích đạo)? (Tính bằng độ °, làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Chi Lang (Lang Son province) lies at approximately {3}°N latitude. Calculate the solar incidence angle at {4}:00 noon here on the Vernal Equinox ({5}/{6}), when the Sun is directly overhead at {7}° Equator (unit: degrees °, round to {8} decimal place).',
    fVi: 'h = {N}° - |φ - α| = {N}° - |{N}° - ({N}°)|',
    fEn: 'h = {1}° - |φ - α| = {2}° - |{3}° - ({4}°)|',
    gEn: 'Apply the formula h = 90° - |local latitude - subsolar latitude|.',
    steps: [
      { vi: 'Bước {N}: Vĩ độ Chi Lăng φ = {N}°B; Vĩ độ Mặt Trời lên thiên đỉnh α = {N}°.', en: 'Step {1}: Chi Lang latitude φ = {2}°N; Subsolar latitude α = {3}°.' },
      { vi: 'Bước {N}: Tính hiệu khoảng cách vĩ độ: |{N} - ({N})| = {N}°.', en: 'Step {1}: Latitudinal distance: |{2} - ({3})| = {4}°.' },
      { vi: 'Bước {N}: Góc nhập xạ h = {N}° - {N}° = {N}°.', en: 'Step {1}: Solar incidence angle h = {2}° - {3}° = {4}°.' },
    ],
  },
  // #9 [bai-5] Winter Solstice Dong Chi
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại khu vực Chi Lăng (tỉnh Lạng Sơn) có vĩ độ xấp xỉ {N}°B. Hãy tính góc nhập xạ (độ cao của Mặt Trời lúc {N} giờ trưa) tại đây vào ngày Đông chí ({N}/{N}) (khi Mặt Trời lên thiên đỉnh tại vĩ độ {N}°N)? (Tính bằng độ °, làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Chi Lang (Lang Son province) lies at approximately {3}°N latitude. Calculate the solar incidence angle at {4}:00 noon here on the Winter Solstice ({5}/{6}), when the Sun is directly overhead at {7}°S (unit: degrees °, round to {8} decimal place).',
    fVi: 'h = {N}° - |φ - α| = {N}° - |{N}° - (-{N}°)|',
    fEn: 'h = {1}° - |φ - α| = {2}° - |{3}° - (-{4}°)|',
    gEn: 'Apply the formula h = 90° - |local latitude - subsolar latitude|.',
    steps: [
      { vi: 'Bước {N}: Vĩ độ Chi Lăng φ = {N}°B; Vĩ độ Mặt Trời lên thiên đỉnh α = -{N}°.', en: 'Step {1}: Chi Lang latitude φ = {2}°N; Subsolar latitude α = -{3}°.' },
      { vi: 'Bước {N}: Tính hiệu khoảng cách vĩ độ: |{N} - (-{N})| = {N}°.', en: 'Step {1}: Latitudinal distance: |{2} - (-{3})| = {4}°.' },
      { vi: 'Bước {N}: Góc nhập xạ h = {N}° - {N}° = {N}°.', en: 'Step {1}: Solar incidence angle h = {2}° - {3}° = {4}°.' },
    ],
  },
  // #10 [bai-5] General declination
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại khu vực Chi Lăng (tỉnh Lạng Sơn) có vĩ độ xấp xỉ {N}°B. Hãy tính góc nhập xạ (độ cao của Mặt Trời lúc {N} giờ trưa) tại đây vào ngày Mặt Trời có vĩ độ xích kinh {N}°B (khi Mặt Trời lên thiên đỉnh tại vĩ độ {N}°B)? (Tính bằng độ °, làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Chi Lang (Lang Son province) lies at approximately {3}°N latitude. Calculate the solar incidence angle at {4}:00 noon here on a day when the Sun has a solar declination of {5}°N (zenith over {6}°N) (unit: degrees °, round to {7} decimal place).',
    fVi: 'h = {N}° - |φ - α| = {N}° - |{N}° - ({N}°)|',
    fEn: 'h = {1}° - |φ - α| = {2}° - |{3}° - ({4}°)|',
    gEn: 'Apply the formula h = 90° - |local latitude - subsolar latitude|.',
    steps: [
      { vi: 'Bước {N}: Vĩ độ Chi Lăng φ = {N}°B; Vĩ độ Mặt Trời lên thiên đỉnh α = {N}°.', en: 'Step {1}: Chi Lang latitude φ = {2}°N; Subsolar latitude α = {3}°.' },
      { vi: 'Bước {N}: Tính hiệu khoảng cách vĩ độ: |{N} - ({N})| = {N}°.', en: 'Step {1}: Latitudinal distance: |{2} - ({3})| = {4}°.' },
      { vi: 'Bước {N}: Góc nhập xạ h = {N}° - {N}° = {N}°.', en: 'Step {1}: Solar incidence angle h = {2}° - {3}° = {4}°.' },
    ],
  },
  // #11 [bai-6]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Qua nghiên cứu cổ địa từ, các nhà địa chất xác định một mảng kiến tạo đã dịch chuyển được quãng đường {N} km trong khoảng thời gian {N} triệu năm. Hãy tính tốc độ dịch chuyển trung bình hàng năm của mảng kiến tạo trên theo đơn vị centimét/năm (cm/năm)? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Through paleomagnetic analysis, geologists determined that a tectonic plate drifted a distance of {3} km over {4} million years. Calculate the plate’s average annual drift speed in centimeters per year (cm/year) (round to {5} decimal places).',
    fVi: 'Tốc độ v (cm/năm) = [Quãng đường (km) × {N}] / [Thời gian (triệu năm) × {N}.{N}]',
    fEn: 'Speed v (cm/yr) = [Distance (km) × {1}] / [Time (million yrs) × {2}.{3}]',
    gEn: 'Convert distance from km to cm and time to years, then divide.',
    steps: [
      { vi: 'Bước {N}: Quãng đường = {N} km = {N},{N} cm.', en: 'Step {1}: Distance = {2} km = {3},{4} cm.' },
      { vi: 'Bước {N}: Thời gian = {N} triệu năm = {N} năm.', en: 'Step {1}: Time = {2} million years = {3} years.' },
      { vi: 'Bước {N}: Tốc độ v = {N} / {N} = {N} cm/năm.', en: 'Step {1}: Speed v = {2} / {3} = {4} cm/year.' },
    ],
  },
  // #12 [bai-7]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Dưới tác động bóc mòn của ngoại lực, một sườn núi đá vôi ở vùng núi Chi Lăng bị hạ thấp độ cao {N} mét trong thời gian {N} năm. Hãy tính tốc độ bóc mòn hạ thấp sườn núi trung bình theo đơn vị milimét/năm (mm/năm)? (Làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Under exogenic denudation, a limestone slope in the Chi Lang mountains lowered in elevation by {3} meters over {4} years. Calculate the average annual denudation rate in millimeters per year (mm/year) (round to {5} decimal places).',
    fVi: 'Tốc độ (mm/năm) = Độ cao hạ thấp (mm) / Thời gian (năm) = ({N} × {N}) / ({N} × {N})',
    fEn: 'Rate (mm/yr) = Lowering (mm) / Time (years) = ({1} × {2}) / ({3} × {4})',
    gEn: 'Convert meters to millimeters (× 1,000), then divide by the number of years.',
    steps: [
      { vi: 'Bước {N}: Độ cao hạ thấp = {N} m = {N} mm.', en: 'Step {1}: Elevation lowered = {2} m = {3} mm.' },
      { vi: 'Bước {N}: Thời gian = {N} năm.', en: 'Step {1}: Duration = {2} years.' },
      { vi: 'Bước {N}: Tốc độ = {N} / {N} = {N} mm/năm.', en: 'Step {1}: Denudation rate = {2} / {3} = {4} mm/year.' },
    ],
  },
  // #13 [bai-8]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Trong một năm quan trắc địa chấn toàn cầu, ghi nhận có {N} trận động đất có độ lớn từ {N} độ Richter trở lên, trong đó có {N} trận xảy ra dọc theo Vành đai lửa Thái Bình Dương. Hãy tính tỉ lệ phần trăm số trận động đất xảy ra tại Vành đai lửa Thái Bình Dương trong năm đó (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) During a year of global seismic monitoring, {3} earthquakes of magnitude {4} or higher on the Richter scale were recorded, of which {5} occurred along the Pacific Ring of Fire. Calculate the percentage of earthquakes occurring along the Pacific Ring of Fire (unit: %, round to {6} decimal place).',
    fVi: 'Tỉ lệ (%) = (Số trận động đất Thái Bình Dương / Tổng số trận động đất toàn cầu) × {N} = ({N} / {N}) × {N}',
    fEn: 'Share (%) = (Pacific Ring Earthquakes / Global Total) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide Pacific Ring earthquakes by total global earthquakes, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Số trận động đất Thái Bình Dương = {N}; Tổng số toàn cầu = {N}.', en: 'Step {1}: Pacific Ring earthquakes = {2}; Global total = {3}.' },
      { vi: 'Bước {N}: Phép tính: ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Compute: ({2} / {3}) × {4} = {5}%.' },
      { vi: 'Bước {N}: Làm tròn đến {N} chữ số thập phân: {N}%.', en: 'Step {1}: Round to {2} decimal place: {3}%.' },
    ],
  },
  // #14 [bai-9] Annual temp range
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại trạm khí tượng Lạng Sơn, nhiệt độ trung bình tháng {N} (nóng nhất) đo được là {N}°C và nhiệt độ trung bình tháng {N} (lạnh nhất) đo được là {N}°C. Hãy tính biên độ nhiệt độ năm tại trạm khí tượng Lạng Sơn theo đơn vị °C? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] At the Lang Son meteorological station, the warmest monthly mean temperature in month {3} is {4}°C and the coldest monthly mean temperature in month {5} is {6}°C. Calculate the annual temperature range at Lang Son station in °C (round to {7} decimal place).',
    fVi: 'Biên độ nhiệt năm (°C) = T_max - T_min = {N} - {N}',
    fEn: 'Annual Temperature Range (°C) = T_max - T_min = {1} - {2}',
    gEn: 'Subtract the lowest monthly mean temperature from the highest monthly mean temperature.',
    steps: [
      { vi: 'Bước {N}: Nhiệt độ tháng cao nhất T_max = {N}°C.', en: 'Step {1}: Warmest month T_max = {2}°C.' },
      { vi: 'Bước {N}: Nhiệt độ tháng thấp nhất T_min = {N}°C.', en: 'Step {1}: Coldest month T_min = {2}°C.' },
      { vi: 'Bước {N}: Biên độ nhiệt = {N} - {N} = {N}°C.', en: 'Step {1}: Temperature range = {2} - {3} = {4}°C.' },
    ],
  },
  // #15 [bai-9] Lapse rate
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại chân một ngọn núi đá vôi ở khu vực Chi Lăng có nhiệt độ không khí là {N}°C. Biết rằng trong tầng đối lưu, cứ lên cao {N} m thì nhiệt độ không khí giảm {N}°C. Hãy tính nhiệt độ không khí tại đỉnh núi có độ cao chênh lệch {N} mét so với chân núi theo đơn vị °C? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] At the foot of a limestone peak in Chi Lang, air temperature measures {3}°C. Knowing that in the troposphere air temperature drops {5}°C for every {4} m of altitude gain, calculate the air temperature at the mountain summit {6} meters higher in °C (round to {7} decimal place).',
    fVi: 'T_đỉnh = T_chân - [(Độ cao chênh lệch / {N}) × {N}] = {N} - [({N} / {N}) × {N}]',
    fEn: 'T_summit = T_base - [(Elevation Gain / {1}) × {2}] = {3} - [({4} / {5}) × {6}]',
    gEn: 'Divide elevation gain by 100, multiply by 0.6°C to find the temperature drop, then subtract from base temperature.',
    steps: [
      { vi: 'Bước {N}: Tính độ giảm nhiệt: ({N} / {N}) × {N} = {N}°C.', en: 'Step {1}: Compute temperature drop: ({2} / {3}) × {4} = {5}°C.' },
      { vi: 'Bước {N}: Tính nhiệt độ tại đỉnh: {N} - {N} = {N}°C.', en: 'Step {1}: Summit temperature: {2} - {3} = {4}°C.' },
    ],
  },
  // #16 [bai-10]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Qua phân tích số liệu biểu đồ khí hậu tại một trạm quan trắc ở tỉnh Lạng Sơn, ghi nhận lượng mưa các tháng mùa khô đạt {N} mm và lượng mưa các tháng mùa mưa đạt {N} mm. Hãy tính tỉ lệ phần trăm lượng mưa của mùa mưa so với tổng lượng mưa cả năm tại trạm quan trắc trên (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] Analyzing climograph data from an observation station in Lang Son province shows dry-season rainfall totals {3} mm and rainy-season rainfall totals {4} mm. Calculate the percentage share of rainy-season precipitation in total annual rainfall (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ lệ mùa mưa (%) = [Lượng mưa mùa mưa / (Lượng mưa mùa mưa + Lượng mưa mùa khô)] × {N} = [{N} / {N}] × {N}',
    fEn: 'Rainy Season Share (%) = [Rainy Season / (Rainy + Dry)] × {1} = [{2} / {3}] × {4}',
    gEn: 'Add dry and rainy season precipitation for annual total, then divide rainy-season rainfall by annual total × 100.',
    steps: [
      { vi: 'Bước {N}: Tính tổng lượng mưa cả năm = {N} + {N} = {N} mm.', en: 'Step {1}: Annual rainfall total = {2} + {3} = {4} mm.' },
      { vi: 'Bước {N}: Phép tính tỉ lệ: ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Compute share: ({2} / {3}) × {4} = {5}%.' },
      { vi: 'Bước {N}: Làm tròn đến {N} chữ số thập phân: {N}%.', en: 'Step {1}: Round to {2} decimal place: {3}%.' },
    ],
  },
  // #17 [bai-11]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Một dòng sông chảy qua khu vực Chi Lăng có lưu lượng nước trung bình trong một tháng mùa lũ ({N} ngày) là {N} m³/s. Hãy tính tổng lượng nước dòng sông này đã vận chuyển trong {N} ngày đó theo đơn vị triệu mét khối (triệu m³)? Biết {N} ngày = {N} giây. (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A river flowing through Chi Lang has an average flood-season discharge over {3} days of {4} m³/s. Calculate the total volume of water transported during those {5} days in million cubic meters (million m³), given {6} day = {7} seconds (round to {8} decimal place).',
    fVi: 'Tổng lượng nước = Q × Thời gian = {N} × ({N} × {N}) m³ / {N}.{N}',
    fEn: 'Total Volume = Q × Time = {1} × ({2} × {3}) m³ / {4}.{5}',
    gEn: 'Multiply discharge Q by the total seconds in 30 days, then divide by 1,000,000.',
    steps: [
      { vi: 'Bước {N}: Tính số giây trong {N} ngày = {N} × {N} = {N}.{N} giây.', en: 'Step {1}: Total seconds in {2} days = {3} × {4} = {5}.{6} s.' },
      { vi: 'Bước {N}: Tính tổng lượng nước = {N} × {N}.{N} = {N},{N} m³.', en: 'Step {1}: Total volume = {2} × {3}.{4} = {5},{6} m³.' },
      { vi: 'Bước {N}: Đổi sang triệu m³: {N} triệu m³.', en: 'Step {1}: Convert to million m³: {2} million m³.' },
    ],
  },
  // #18 [bai-12]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Độ muối trung bình của nước biển đại dương là {N}‰ (nghĩa là trong {N} gam hay khoảng {N} lít nước biển chứa {N} gam muối). Giả sử người ta đưa {N} m³ nước biển (tương đương {N} lít) vào ruộng muối để kết tinh hoàn toàn. Hãy tính khối lượng muối ăn thu được theo đơn vị kilôgam (kg)? (Làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Average ocean salinity is {3}‰ (meaning {4} g or roughly {5} liter of seawater contains {6} g of salt). Suppose {7} m³ of seawater (equal to {8} liters) evaporates completely in salt pans. Calculate the mass of crystallized sea salt harvested in kilograms (kg) (round to {9} decimal place).',
    fVi: 'Khối lượng muối (kg) = Thể tích (lít) × {N} kg/lít = ({N} × {N}) × {N}',
    fEn: 'Salt Mass (kg) = Volume (liters) × {1} kg/L = ({2} × {3}) × {4}',
    gEn: 'Multiply total seawater liters by 0.035 kg/L to find salt mass in kg.',
    steps: [
      { vi: 'Bước {N}: Đổi thể tích: {N} m³ = {N} lít.', en: 'Step {1}: Convert volume: {2} m³ = {3} liters.' },
      { vi: 'Bước {N}: Cứ {N} lít nước biển chứa {N} g = {N} kg muối.', en: 'Step {1}: Each {2} liter of seawater holds {3} g = {4} kg of salt.' },
      { vi: 'Bước {N}: Khối lượng muối thu được = {N} × {N} = {N} kg.', en: 'Step {1}: Harvested salt mass = {2} × {3} = {4} kg.' },
    ],
  },
  // #19 [bai-13]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại trạm thủy văn Sơn Tây trên sông Hồng, lưu lượng dòng chảy trung bình {N} tháng mùa lũ (tháng {N}-{N}) đạt {N} m³/s và lưu lượng trung bình {N} tháng mùa cạn đạt {N} m³/s. Hãy tính tỉ lệ phần trăm tổng lượng nước mùa lũ so với tổng lượng nước cả năm của sông Hồng tại trạm Sơn Tây (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] At Son Tay hydrological station on the Red River, average discharge during the {3}-month flood season (months {4}–{5}) reaches {6} m³/s, while average discharge during the {7}-month dry season is {8} m³/s. Calculate the percentage of total annual discharge occurring in the flood season (unit: %, round to {9} decimal place).',
    fVi: 'Tỉ lệ mùa lũ (%) = [(Q_lũ × {N}) / (Q_lũ × {N} + Q_cạn × {N})] × {N} = [({N} × {N}) / ({N})] × {N}',
    fEn: 'Flood Season Share (%) = [(Q_flood × {1}) / (Q_flood × {2} + Q_dry × {3})] × {4} = [({5} × {6}) / ({7})] × {8}',
    gEn: 'Multiply flood discharge by 5 months, compute annual weighted discharge (5 flood + 7 dry months), and divide for %. ',
    steps: [
      { vi: 'Bước {N}: Tính quy đổi lượng nước mùa lũ = {N} × {N} = {N} đơn vị.', en: 'Step {1}: Weighted flood-season discharge = {2} × {3} = {4} units.' },
      { vi: 'Bước {N}: Tính quy đổi lượng nước cả năm = {N} + ({N} × {N}) = {N} đơn vị.', en: 'Step {1}: Weighted annual discharge = {2} + ({3} × {4}) = {5} units.' },
      { vi: 'Bước {N}: Tỉ lệ phần trăm mùa lũ = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Flood-season share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #20 [bai-14]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Phân tích một mẫu đất feralit nâu đỏ trên đá vôi thu thập tại vườn na xã Vạn Linh (tỉnh Lạng Sơn) có khối lượng {N} gam. Sau khi xử lí loại bỏ khoáng vô cơ, xác định được khối lượng chất mùn hữu cơ là {N} gam. Hãy tính tỉ lệ phần trăm hàm lượng mùn trong mẫu đất trên (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A reddish-brown limestone ferrallitic soil sample collected from a custard-apple orchard in Van Linh commune (Lang Son province) weighs {3} grams. After separating mineral fractions, organic humus mass measures {4} grams. Calculate the percentage humus content in this soil sample (unit: %, round to {5} decimal place).',
    fVi: 'Hàm lượng mùn (%) = (Khối lượng mùn / Tổng khối lượng mẫu đất) × {N} = ({N} / {N}) × {N}',
    fEn: 'Humus Content (%) = (Humus Mass / Total Soil Sample Mass) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide organic humus mass by total soil sample mass, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Khối lượng mùn = {N} g; Khối lượng mẫu đất = {N} g.', en: 'Step {1}: Humus mass = {2} g; Total soil sample = {3} g.' },
      { vi: 'Bước {N}: Tỉ lệ = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #21 [bai-15]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Một khu rừng tái sinh trên núi đá vôi ở khu vực Chi Lăng (Lạng Sơn) có diện tích {N} hecta, tổng sinh khối thực vật tươi đo được là {N} tấn. Hãy tính sinh khối thực vật trung bình trên một hecta rừng theo đơn vị tấn/ha? (Làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A regenerating karst limestone forest in Chi Lang (Lang Son) covers {3} hectares with a measured fresh plant biomass of {4} tons. Calculate average plant biomass density per hectare in tons/ha (round to {5} decimal place).',
    fVi: 'Sinh khối bình quân (tấn/ha) = Tổng sinh khối / Diện tích = {N} / {N}',
    fEn: 'Mean Biomass (tons/ha) = Total Biomass / Forest Area = {1} / {2}',
    gEn: 'Divide total forest plant biomass by forest area in hectares.',
    steps: [
      { vi: 'Bước {N}: Tổng sinh khối = {N} tấn; Diện tích = {N} ha.', en: 'Step {1}: Total biomass = {2} tons; Forest area = {3} ha.' },
      { vi: 'Bước {N}: Sinh khối bình quân = {N} / {N} = {N} tấn/ha.', en: 'Step {1}: Mean biomass = {2} / {3} = {4} tons/ha.' },
    ],
  },
  // #22 [bai-16]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Trong tổng diện tích đất tự nhiên khảo sát là {N} ha của một tiểu vùng đồi núi đá Lạng Sơn, diện tích nhóm đất feralit chiếm {N} ha. Hãy tính tỉ trọng phần trăm diện tích đất feralit so với tổng diện tích đất của tiểu vùng trên (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Within a surveyed natural land area of {3} ha in a limestone hill subregion of Lang Son, ferrallitic soils cover {4} ha. Calculate the percentage share of ferrallitic soil in the subregion’s total land area (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ trọng (%) = (Diện tích đất feralit / Tổng diện tích) × {N} = ({N} / {N}) × {N}',
    fEn: 'Share (%) = (Ferrallitic Area / Total Area) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide ferrallitic soil area by total surveyed area, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Diện tích feralit = {N} ha; Tổng diện tích = {N} ha.', en: 'Step {1}: Ferrallitic soil = {2} ha; Total area = {3} ha.' },
      { vi: 'Bước {N}: Tỉ trọng = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #23 [bai-17]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tại một trạm quan trắc cảnh quan ở tỉnh Lạng Sơn, ghi nhận lượng mưa trung bình năm (P) đạt {N} mm và lượng bốc hơi tiềm năng hàng năm (E) là {N} mm. Hãy tính hệ số cân bằng nhiệt ẩm K = P / E của vỏ địa lí tại trạm quan trắc trên? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] At a landscape monitoring station in Lang Son province, mean annual precipitation (P) is {3} mm and annual potential evaporation (E) is {4} mm. Calculate the moisture-balance index K = P / E at this station (round to {5} decimal places).',
    fVi: 'Hệ số ẩm K = P / E = {N} / {N}',
    fEn: 'Moisture Index K = P / E = {1} / {2}',
    gEn: 'Divide annual precipitation P by annual potential evaporation E.',
    steps: [
      { vi: 'Bước {N}: Lượng mưa P = {N} mm; Lượng bốc hơi E = {N} mm.', en: 'Step {1}: Precipitation P = {2} mm; Evaporation E = {3} mm.' },
      { vi: 'Bước {N}: Hệ số K = {N} / {N} = {N}.', en: 'Step {1}: Index K = {2} / {3} = {4}.' },
    ],
  },
  // #24 [bai-18]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Theo quy luật đai cao (phi địa đới), tại chân một khối núi cao ở Lạng Sơn có nhiệt độ là {N}°C. Cứ lên cao {N} m nhiệt độ giảm {N}°C. Hãy tính nhiệt độ không khí tại một đỉnh núi cao {N} mét theo đơn vị °C? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Following the altitudinal zonation law (azonal), air temperature at the base of a mountain massif in Lang Son is {3}°C. Air temperature drops {5}°C per {4} m ascent. Calculate the air temperature at the summit at {6} m elevation in °C (round to {7} decimal place).',
    fVi: 'T_đỉnh = T_chân - (Độ cao / {N}) × {N} = {N} - ({N} / {N}) × {N}',
    fEn: 'T_summit = T_base - (Elevation / {1}) × {2} = {3} - ({4} / {5}) × {6}',
    gEn: 'Divide elevation by 100, multiply by 0.6°C, and subtract from base temperature.',
    steps: [
      { vi: 'Bước {N}: Độ giảm nhiệt = ({N} / {N}) × {N} = {N}°C.', en: 'Step {1}: Temperature drop = ({2} / {3}) × {4} = {5}°C.' },
      { vi: 'Bước {N}: Nhiệt độ đỉnh = {N} - {N} = {N}°C.', en: 'Step {1}: Summit temperature = {2} - {3} = {4}°C.' },
    ],
  },
  // #25 [bai-19]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Trong một năm, một đơn vị dân cư thuộc khu vực Chi Lăng có tỉ suất sinh thô là {N}‰ và tỉ suất tử thô là {N}‰. Hãy tính tỉ suất gia tăng dân số tự nhiên của đơn vị dân cư trên theo đơn vị phần trăm (%)? (Làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) In one year, a community in Chi Lang recorded a crude birth rate of {3}‰ and a crude death rate of {4}‰. Calculate the natural population growth rate in percent (%) (round to {5} decimal places).',
    fVi: 'Tg (%) = (Tỉ suất sinh ‰ - Tỉ suất tử ‰) / {N} = ({N} - {N}) / {N}',
    fEn: 'Natural Growth (%) = (CBR ‰ - CDR ‰) / {1} = ({2} - {3}) / {4}',
    gEn: 'Subtract crude death rate from crude birth rate (per mille), then divide by 10 to convert to percent (%).',
    steps: [
      { vi: 'Bước {N}: Tính gia tăng tự nhiên theo phần nghìn: {N} - {N} = {N}‰.', en: 'Step {1}: Natural increase in per mille: {2} - {3} = {4}‰.' },
      { vi: 'Bước {N}: Đổi sang đơn vị phần trăm (%): {N} / {N} = {N}%.', en: 'Step {1}: Convert to percent (%): {2} / {3} = {4}%.' },
    ],
  },
  // #26 [bai-20]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Xã Vạn Linh (tỉnh Lạng Sơn) có tổng số dân là {N} người và diện tích tự nhiên là {N} km². Hãy tính mật độ dân số của xã Vạn Linh theo đơn vị người/km²? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Van Linh commune (Lang Son province) has a total population of {3} inhabitants and a natural land area of {4} km². Calculate the population density of Van Linh commune in people/km² (round to {5} decimal place).',
    fVi: 'Mật độ dân số (người/km²) = Số dân / Diện tích = {N} / {N}',
    fEn: 'Population Density (people/km²) = Population / Land Area = {1} / {2}',
    gEn: 'Divide total population by total natural land area.',
    steps: [
      { vi: 'Bước {N}: Số dân = {N} người; Diện tích = {N} km².', en: 'Step {1}: Population = {2} people; Area = {3} km².' },
      { vi: 'Bước {N}: Mật độ = {N} / {N} = {N} người/km².', en: 'Step {1}: Density = {2} / {3} = {4} people/km².' },
    ],
  },
  // #27 [bai-21]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Tổng vốn đầu tư phát triển kinh tế của một địa bàn miền núi tại tỉnh Lạng Sơn là {N} tỉ đồng, trong đó vốn đầu tư trực tiếp nước ngoài (FDI) là {N} tỉ đồng, còn lại là vốn trong nước. Hãy tính tỉ trọng vốn đầu tư FDI trong tổng vốn đầu tư phát triển của địa bàn (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Total economic development investment in a mountainous locality of Lang Son province is {3} billion VND, including {4} billion VND in foreign direct investment (FDI) and the remainder from domestic capital. Calculate FDI’s percentage share in total investment (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ trọng FDI (%) = (Vốn FDI / Tổng vốn) × {N} = ({N} / {N}) × {N}',
    fEn: 'FDI Share (%) = (FDI Capital / Total Investment) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide FDI capital by total investment, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Vốn FDI = {N} tỉ đồng; Tổng vốn = {N} tỉ đồng.', en: 'Step {1}: FDI capital = {2} billion VND; Total = {3} billion VND.' },
      { vi: 'Bước {N}: Tỉ trọng FDI = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: FDI share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #28 [bai-22]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Một khu vực kinh tế thuộc tỉnh Lạng Sơn có tổng sản phẩm trên địa bàn (GRDP) đạt {N} triệu USD và dân số trung bình là {N} nghìn người. Hãy tính GRDP bình quân đầu người của khu vực này theo đơn vị USD/người? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) An economic subregion in Lang Son province recorded a Gross Regional Domestic Product (GRDP) of {3} million USD with an average population of {4} thousand people. Calculate GRDP per capita in USD/capita (round to {5} decimal place).',
    fVi: 'GRDP bình quân (USD/người) = (Tổng GRDP quy đổi ra USD) / (Dân số quy đổi ra người) = ({N} × {N}.{N}) / ({N} × {N})',
    fEn: 'GRDP per Capita (USD/capita) = (Total GRDP in USD) / (Total Population) = ({1} × {2}.{3}) / ({4} × {5})',
    gEn: 'Convert GRDP to USD and population to individuals, then divide.',
    steps: [
      { vi: 'Bước {N}: Tổng GRDP = {N},{N} USD; Dân số = {N} người.', en: 'Step {1}: Total GRDP = {2},{3} USD; Population = {4} people.' },
      { vi: 'Bước {N}: Bình quân = {N} / {N} = {N} USD/người.', en: 'Step {1}: GRDP per capita = {2} / {3} = {4} USD/capita.' },
    ],
  },
  // #29 [bai-23]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Tổng giá trị sản xuất toàn xã hội của một xã vùng núi Chi Lăng đạt {N} tỉ đồng, trong đó giá trị sản xuất ngành nông - lâm - thủy sản đóng góp {N} tỉ đồng. Hãy tính tỉ trọng của ngành nông - lâm - thủy sản trong tổng giá trị sản xuất của xã (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Total social production value of a mountainous commune in Chi Lang reached {3} billion VND, of which agriculture, forestry, and fishery contributed {4} billion VND. Calculate the percentage share of agriculture–forestry–fishery in total output (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ trọng (%) = (Giá trị nông lâm thủy sản / Tổng giá trị) × {N} = ({N} / {N}) × {N}',
    fEn: 'Share (%) = (Agri-Forestry-Fishery Output / Total Output) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide agriculture–forestry–fishery value by total production value, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Giá trị nông lâm thủy sản = {N} tỉ đồng; Tổng giá trị = {N} tỉ đồng.', en: 'Step {1}: Agri-forestry-fishery = {2} billion VND; Total = {3} billion VND.' },
      { vi: 'Bước {N}: Tỉ trọng = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #30 [bai-24]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Vùng chuyên canh na Chi Lăng tại xã Vạn Linh gieo trồng trên diện tích {N} hecta, tổng sản lượng na thu hoạch được trong vụ là {N} tấn (tương đương {N} tạ). Hãy tính năng suất na bình quân của vùng chuyên canh theo đơn vị tạ/ha? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] The Chi Lang custard-apple specialty zone in Van Linh commune cultivates {3} hectares, harvesting a seasonal output of {4} metric tons (equal to {5} quintals). Calculate average custard-apple yield in quintals/ha (round to {6} decimal place).',
    fVi: 'Năng suất (tạ/ha) = Sản lượng (tạ) / Diện tích (ha) = ({N} × {N}) / {N}',
    fEn: 'Yield (quintals/ha) = Production (quintals) / Area (ha) = ({1} × {2}) / {3}',
    gEn: 'Convert tons to quintals (× 10), then divide by cultivated area in hectares.',
    steps: [
      { vi: 'Bước {N}: Đổi sản lượng sang tạ: {N} tấn = {N} tạ.', en: 'Step {1}: Convert production to quintals: {2} tons = {3} quintals.' },
      { vi: 'Bước {N}: Diện tích gieo trồng = {N} ha.', en: 'Step {1}: Cultivated area = {2} ha.' },
      { vi: 'Bước {N}: Năng suất = {N} / {N} = {N} tạ/ha.', en: 'Step {1}: Yield = {2} / {3} = {4} quintals/ha.' },
    ],
  },
  // #31 [bai-25]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Xã Vạn Linh (tỉnh Lạng Sơn) có diện tích đất có rừng (gồm rừng phòng hộ núi đá vôi và rừng hồi, thông trồng) là {N} ha trên tổng diện tích tự nhiên toàn xã là {N} ha. Hãy tính tỉ lệ che phủ rừng của xã Vạn Linh theo đơn vị phần trăm (%)? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Van Linh commune (Lang Son province) has {3} ha of forested land (limestone protection forests and planted star-anise/pine forests) out of {4} ha total natural land area. Calculate the forest cover percentage of Van Linh commune (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ lệ che phủ rừng (%) = (Diện tích đất có rừng / Tổng diện tích tự nhiên) × {N} = ({N} / {N}) × {N}',
    fEn: 'Forest Cover (%) = (Forested Area / Total Natural Area) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide forested land area by total natural land area, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Diện tích có rừng = {N} ha; Diện tích tự nhiên = {N} ha.', en: 'Step {1}: Forested area = {2} ha; Total area = {3} ha.' },
      { vi: 'Bước {N}: Tỉ lệ che phủ = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Forest cover = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #32 [bai-26]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Trong một hợp tác xã nông nghiệp kiểu mới ở khu vực Chi Lăng có {N} trang trại gia đình chuyên canh trồng na và cây ăn quả với tổng diện tích đất canh tác là {N} hecta. Hãy tính quy mô diện tích bình quân của một trang trại theo đơn vị ha/trang trại? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A modern agricultural cooperative in Chi Lang comprises {3} family farms specializing in custard apples and fruit trees across a combined cultivated area of {4} hectares. Calculate average farm size in ha/farm (round to {5} decimal places).',
    fVi: 'Quy mô bình quân (ha/trang trại) = Tổng diện tích đất / Số lượng trang trại = {N} / {N}',
    fEn: 'Mean Farm Size (ha/farm) = Total Cultivated Area / Number of Farms = {1} / {2}',
    gEn: 'Divide total cultivated land area by the number of farms.',
    steps: [
      { vi: 'Bước {N}: Tổng diện tích = {N} ha; Số trang trại = {N}.', en: 'Step {1}: Total area = {2} ha; Number of farms = {3}.' },
      { vi: 'Bước {N}: Quy mô bình quân = {N} / {N} = {N} ha/trang trại.', en: 'Step {1}: Mean farm size = {2} / {3} = {4} ha/farm.' },
    ],
  },
  // #33 [bai-27]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Sản lượng na Chi Lăng (Lạng Sơn) năm {N} đạt {N} tấn và đến năm {N} đạt {N} tấn. Nếu lấy năm {N} làm năm gốc bằng {N}%, hãy tính tốc độ tăng trưởng sản lượng na Chi Lăng năm {N} theo đơn vị phần trăm (%)? (Làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Chi Lang custard-apple output (Lang Son) reached {4} metric tons in {3} and {6} metric tons in {5}. Taking {7} as the base year ({8}%), calculate the production growth rate index for {9} in percent (%) (round to {10} decimal place).',
    fVi: 'Tốc độ tăng trưởng (%) = (Sản lượng năm {N} / Sản lượng năm {N}) × {N} = ({N} / {N}) × {N}',
    fEn: 'Growth Index (%) = (Output {1} / Base Output {2}) × {3} = ({4} / {5}) × {6}',
    gEn: 'Divide target year output by base year output, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Sản lượng năm {N} = {N} tấn; Sản lượng năm gốc {N} = {N} tấn.', en: 'Step {1}: Target year {2} output = {3} tons; Base year {4} output = {5} tons.' },
      { vi: 'Bước {N}: Tốc độ = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Growth index = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #34 [bai-28]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Tổng giá trị sản xuất công nghiệp tại địa bàn xã Chi Lăng đạt {N} tỉ đồng, trong đó công nghiệp chế biến, chế tạo đạt {N} tỉ đồng. Hãy tính tỉ trọng của ngành công nghiệp chế biến, chế tạo trong tổng giá trị sản xuất công nghiệp của địa bàn (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Total industrial production value in Chi Lang commune reached {3} billion VND, of which processing and manufacturing accounted for {4} billion VND. Calculate the percentage share of processing and manufacturing in total industrial output (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ trọng (%) = (Giá trị chế biến chế tạo / Tổng giá trị công nghiệp) × {N} = ({N} / {N}) × {N}',
    fEn: 'Share (%) = (Manufacturing Value / Total Industrial Value) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide manufacturing output value by total industrial value, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Giá trị chế biến = {N} tỉ; Tổng giá trị công nghiệp = {N} tỉ.', en: 'Step {1}: Manufacturing = {2} billion; Total industry = {3} billion.' },
      { vi: 'Bước {N}: Tỉ trọng = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #35 [bai-29]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Một tiểu vùng tại Lạng Sơn có tổng sản lượng điện tiêu thụ trong năm là {N} triệu kWh và dân số là {N} nghìn người. Hãy tính sản lượng điện bình quân đầu người theo đơn vị kWh/người? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A subregion in Lang Son consumed {3} million kWh of electricity over a year with a population of {4} thousand people. Calculate annual electricity consumption per capita in kWh/capita (round to {5} decimal place).',
    fVi: 'Điện bình quân (kWh/người) = (Sản lượng điện kWh) / Số dân = ({N} × {N}.{N}) / ({N} × {N})',
    fEn: 'Electricity per Capita (kWh/capita) = Total kWh / Population = ({1} × {2}.{3}) / ({4} × {5})',
    gEn: 'Convert electricity output to kWh and population to individuals, then divide.',
    steps: [
      { vi: 'Bước {N}: Đổi đơn vị: Điện = {N},{N} kWh; Dân số = {N} người.', en: 'Step {1}: Convert units: Electricity = {2},{3} kWh; Population = {4} people.' },
      { vi: 'Bước {N}: Bình quân = {N} / {N} = {N} kWh/người.', en: 'Step {1}: Per capita = {2} / {3} = {4} kWh/capita.' },
    ],
  },
  // #36 [bai-30]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Cụm công nghiệp Đồng Bành (xã Chi Lăng, Lạng Sơn) có tổng diện tích đất công nghiệp có thể cho thuê là {N} ha, trong đó diện tích đã có các doanh nghiệp thuê xây dựng nhà xưởng là {N} ha. Hãy tính tỉ lệ lấp đầy mặt bằng của cụm công nghiệp này theo đơn vị phần trăm (%)? (Làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Dong Banh Industrial Cluster (Chi Lang commune, Lang Son) has {3} ha of leasable industrial land, of which {4} ha have been leased by enterprises for factory construction. Calculate the industrial cluster occupancy rate in percent (%) (round to {5} decimal place).',
    fVi: 'Tỉ lệ lấp đầy (%) = (Diện tích đã cho thuê / Tổng diện tích có thể cho thuê) × {N} = ({N} / {N}) × {N}',
    fEn: 'Occupancy Rate (%) = (Leased Land / Total Leasable Land) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide leased land area by total leasable industrial area, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Diện tích đã cho thuê = {N} ha; Tổng diện tích = {N} ha.', en: 'Step {1}: Leased area = {2} ha; Total leasable = {3} ha.' },
      { vi: 'Bước {N}: Tỉ lệ lấp đầy = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Occupancy = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #37 [bai-31]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Một tổ hợp trang trại sản xuất nông nghiệp công nghệ cao tại xã Vạn Linh (tỉnh Lạng Sơn) tiêu thụ tổng cộng {N} MWh điện năng trong năm, trong đó có {N} MWh là điện năng từ hệ thống điện mặt trời áp mái. Hãy tính tỉ trọng năng lượng sạch tái tạo trong tổng mức tiêu thụ năng lượng của tổ hợp trang trại trên (tính bằng %, làm tròn đến {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A high-tech agricultural farm complex in Van Linh commune (Lang Son province) consumed {3} MWh of electricity annually, of which {4} MWh came from rooftop solar panels. Calculate the share of clean renewable energy in total power consumption (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ trọng (%) = (Năng lượng tái tạo / Tổng năng lượng tiêu thụ) × {N} = ({N} / {N}) × {N}',
    fEn: 'Renewable Share (%) = (Renewable Energy / Total Consumption) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide renewable energy consumption by total energy consumption, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Điện mặt trời = {N} MWh; Tổng điện năng = {N} MWh.', en: 'Step {1}: Solar power = {2} MWh; Total electricity = {3} MWh.' },
      { vi: 'Bước {N}: Tỉ trọng = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #38 [bai-32]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Giá trị sản xuất công nghiệp và tiểu thủ công nghiệp tại xã Chi Lăng (Lạng Sơn) năm {N} đạt {N} tỉ đồng và đến năm {N} đạt {N} tỉ đồng. Hãy tính mức tăng trưởng (tính bằng %) của giá trị sản xuất công nghiệp xã Chi Lăng năm {N} so với năm {N}? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Industrial and handicraft output value in Chi Lang commune (Lang Son) reached {4} billion VND in {3} and {6} billion VND in {5}. Calculate the percentage growth in industrial production value between {7} and {8} (unit: %, round to {9} decimal place).',
    fVi: 'Mức tăng trưởng (%) = [(Giá trị năm {N} - Giá trị năm {N}) / Giá trị năm {N}] × {N} = [({N} - {N}) / {N}] × {N}',
    fEn: 'Growth Rate (%) = [(Value {1} - Value {2}) / Value {3}] × {4} = [({5} - {6}) / {7}] × {8}',
    gEn: 'Subtract the earlier year value from the later year value, divide by the earlier year value, and multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Chênh lệch giá trị tăng thêm = {N} - {N} = {N} tỉ đồng.', en: 'Step {1}: Absolute increase = {2} - {3} = {4} billion VND.' },
      { vi: 'Bước {N}: Mức tăng trưởng = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Growth rate = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #39 [bai-33]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Tổng số lao động đang làm việc trong các ngành kinh tế trên địa bàn xã Chi Lăng (Lạng Sơn) là {N} người, trong đó số lao động làm việc trong khu vực dịch vụ là {N} người. Hãy tính tỉ lệ lao động ngành dịch vụ so với tổng số lao động của địa bàn theo đơn vị phần trăm (%)? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Total workforce employed across all economic sectors in Chi Lang commune (Lang Son) is {3} workers, including {4} employed in the service sector. Calculate the percentage of service-sector workers in the total workforce (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ lệ lao động dịch vụ (%) = (Lao động dịch vụ / Tổng số lao động) × {N} = ({N} / {N}) × {N}',
    fEn: 'Service Workforce (%) = (Service Workers / Total Workforce) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide service-sector workers by total workforce, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Lao động dịch vụ = {N} người; Tổng lao động = {N} người.', en: 'Step {1}: Service workers = {2}; Total workforce = {3}.' },
      { vi: 'Bước {N}: Tỉ lệ = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Share = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #40 [bai-34]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Một đoàn xe tải vận chuyển nông sản na Chi Lăng từ xã Vạn Linh (Lạng Sơn) đi phân phối cho các siêu thị đã thực hiện khối lượng vận chuyển là {N} tấn hàng hóa và đạt khối lượng luân chuyển là {N} tấn.km. Hãy tính cự li vận chuyển trung bình của đoàn xe theo đơn vị kilômét (km)?',
    qEn: '[Geographic Problem {1}.{2}] A truck convoy transporting Chi Lang custard apples from Van Linh commune (Lang Son) to supermarkets carried a freight volume of {3} tons with a freight turnover of {4} ton-km. Calculate the convoy’s average haul distance in kilometers (km).',
    fVi: 'Cự li trung bình (km) = Khối lượng luân chuyển (tấn.km) / Khối lượng vận chuyển (tấn) = {N} / {N}',
    fEn: 'Average Haul Distance (km) = Freight Turnover (ton-km) / Freight Volume (tons) = {1} / {2}',
    gEn: 'Divide freight turnover (ton-km) by freight volume (tons).',
    steps: [
      { vi: 'Bước {N}: Khối lượng luân chuyển = {N} tấn.km; Khối lượng vận chuyển = {N} tấn.', en: 'Step {1}: Freight turnover = {2} ton-km; Freight volume = {3} tons.' },
      { vi: 'Bước {N}: Cự li trung bình = {N} / {N} = {N} km.', en: 'Step {1}: Average distance = {2} / {3} = {4} km.' },
    ],
  },
  // #41 [bai-35]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Tại xã Vạn Linh (tỉnh Lạng Sơn), tổng số dân là {N} người và số lượng thuê bao điện thoại thông minh đang hoạt động là {N} thuê bao. Hãy tính mật độ thuê bao điện thoại trên {N} dân của xã Vạn Linh theo đơn vị thuê bao/{N} dân? (Làm tròn {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) In Van Linh commune (Lang Son province), total population is {3} residents with {4} active smartphone subscriptions. Calculate smartphone subscription density per {5} residents (unit: subscriptions/{6} people, round to {7} decimal place).',
    fVi: 'Mật độ thuê bao = (Số thuê bao / Tổng số dân) × {N} = ({N} / {N}) × {N}',
    fEn: 'Subscription Density = (Subscriptions / Population) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide total subscriptions by population, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Số thuê bao = {N}; Số dân = {N}.', en: 'Step {1}: Subscriptions = {2}; Population = {3}.' },
      { vi: 'Bước {N}: Mật độ = ({N} / {N}) × {N} = {N} thuê bao/{N} dân.', en: 'Step {1}: Density = ({2} / {3}) × {4} = {5} subscriptions/{6} people.' },
    ],
  },
  // #42 [bai-36]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Trong mùa Lễ hội Na Chi Lăng và tham quan di tích lịch sử Ải Chi Lăng (Lạng Sơn), địa bàn xã Chi Lăng đón {N} lượt du khách với tổng doanh thu dịch vụ du lịch đạt {N} tỉ đồng (tương đương {N} triệu đồng). Hãy tính mức chi tiêu doanh thu du lịch bình quân của một lượt khách theo đơn vị triệu đồng/lượt khách? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] During the Chi Lang Custard-Apple Festival and historic Ai Chi Lang heritage tours (Lang Son), Chi Lang commune welcomed {3} tourist visits generating {4} billion VND in tourism revenue (equivalent to {5} million VND). Calculate average tourism expenditure per visitor in million VND/visitor (round to {6} decimal places).',
    fVi: 'Doanh thu bình quân (triệu đồng/lượt) = Tổng doanh thu (triệu đồng) / Số lượt khách = ({N} × {N}) / {N}',
    fEn: 'Mean Revenue (million VND/visitor) = Total Revenue (million VND) / Visitors = ({1} × {2}) / {3}',
    gEn: 'Convert total revenue to million VND, then divide by total visitor count.',
    steps: [
      { vi: 'Bước {N}: Đổi doanh thu: {N} tỉ đồng = {N} triệu đồng.', en: 'Step {1}: Convert revenue: {2} billion VND = {3} million VND.' },
      { vi: 'Bước {N}: Số lượt khách = {N} lượt.', en: 'Step {1}: Visitors = {2} visits.' },
      { vi: 'Bước {N}: Doanh thu bình quân = {N} / {N} = {N} triệu đồng/lượt.', en: 'Step {1}: Mean revenue = {2} / {3} = {4} million VND/visitor.' },
    ],
  },
  // #43 [bai-37]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Tổng giá trị xuất khẩu hàng hóa qua các cửa khẩu quốc tế tỉnh Lạng Sơn trong một thời kì đạt {N} triệu USD và tổng giá trị nhập khẩu đạt {N} triệu USD. Hãy tính cán cân thương mại qua địa bàn tỉnh Lạng Sơn theo đơn vị triệu USD? (Nhập kết quả số dương nếu xuất siêu, số âm nếu nhập siêu).',
    qEn: '[Geographic Problem {1}.{2}] Total merchandise export value through international border gates in Lang Son province over a period reached {3} million USD, while total imports reached {4} million USD. Calculate Lang Son’s merchandise trade balance in million USD (enter positive for surplus, negative for deficit).',
    fVi: 'Cán cân thương mại = Giá trị Xuất khẩu - Giá trị Nhập khẩu = {N} - {N}',
    fEn: 'Trade Balance = Export Value - Import Value = {1} - {2}',
    gEn: 'Subtract total import value from total export value.',
    steps: [
      { vi: 'Bước {N}: Xuất khẩu = {N} triệu USD; Nhập khẩu = {N} triệu USD.', en: 'Step {1}: Exports = {2} million USD; Imports = {3} million USD.' },
      { vi: 'Bước {N}: Cán cân = {N} - {N} = {N} triệu USD (Xuất siêu).', en: 'Step {1}: Balance = {2} - {3} = {4} million USD (Trade surplus).' },
    ],
  },
  // #44 [bai-38]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] Doanh thu dịch vụ vận tải và phân phối nông sản tại một hợp tác xã ở xã Vạn Linh (tỉnh Lạng Sơn) Quý I đạt {N} tỉ đồng và Quý II đạt {N} tỉ đồng. Hãy tính tốc độ tăng trưởng doanh thu Quý II so với Quý I của hợp tác xã theo đơn vị phần trăm (%)? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] Agricultural transport and distribution service revenue at a cooperative in Van Linh commune (Lang Son) reached {3} billion VND in Q1 and {4} billion VND in Q2. Calculate Q2 revenue growth rate compared to Q1 in percent (%) (round to {5} decimal place).',
    fVi: 'Tốc độ tăng trưởng (%) = [(Doanh thu Quý II - Doanh thu Quý I) / Doanh thu Quý I] × {N} = [({N} - {N}) / {N}] × {N}',
    fEn: 'Growth Rate (%) = [(Q2 Revenue - Q1 Revenue) / Q1 Revenue] × {1} = [({2} - {3}) / {4}] × {5}',
    gEn: 'Subtract Q1 revenue from Q2 revenue, divide by Q1 revenue, and multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Doanh thu tăng thêm = {N} - {N} = {N} tỉ đồng.', en: 'Step {1}: Revenue increase = {2} - {3} = {4} billion VND.' },
      { vi: 'Bước {N}: Tốc độ tăng trưởng = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Growth rate = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
  // #45 [bai-39]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Một mỏ đá vôi làm xi măng tại xã Chi Lăng (Lạng Sơn) có trữ lượng xác minh còn lại là {N} triệu tấn ({N},{N} tấn), công suất khai thác hàng năm là {N},{N} tấn/năm. Nếu duy trì công suất khai thác này thì mỏ đá vôi trên sẽ cạn kiệt sau bao nhiêu năm? (Làm tròn đến {N} chữ số thập phân).',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) A cement-grade limestone quarry in Chi Lang commune (Lang Son) holds remaining proven reserves of {3} million metric tons ({4},{5} tons), with an annual extraction output of {6},{7} tons/year. At this extraction rate, in how many years will the quarry be depleted? (Round to {8} decimal place).',
    fVi: 'Thời gian cạn kiệt (năm) = Trữ lượng mỏ / Công suất khai thác hàng năm = {N},{N} / {N},{N}',
    fEn: 'Depletion Time (years) = Reserves / Annual Output = {1},{2} / {3},{4}',
    gEn: 'Divide remaining proven reserves by annual extraction output.',
    steps: [
      { vi: 'Bước {N}: Trữ lượng = {N},{N} tấn; Khai thác hàng năm = {N},{N} tấn/năm.', en: 'Step {1}: Reserves = {2},{3} tons; Annual extraction = {4},{5} tons/year.' },
      { vi: 'Bước {N}: Thời gian = {N} / {N} = {N} năm.', en: 'Step {1}: Depletion time = {2} / {3} = {4} years.' },
    ],
  },
  // #46 [bai-40]
  {
    qVi: '[Bài toán Địa lí {N}. {N}] (Số liệu giả định phục vụ ôn luyện) Theo đề án Tăng trưởng xanh của một cụm sản xuất tại Lạng Sơn, nếu không can thiệp (kịch bản phát triển thông thường) lượng phát thải khí nhà kính là {N} nghìn tấn CO₂. Nhờ ứng dụng năng lượng mặt trời và kinh tế tuần hoàn, cụm sản xuất đã cắt giảm được {N} nghìn tấn CO₂. Hãy tính tỉ lệ phần trăm phát thải đã cắt giảm so với kịch bản thông thường (tính bằng %, làm tròn {N} chữ số thập phân)?',
    qEn: '[Geographic Problem {1}.{2}] (Practice dataset) Under a Green Growth plan for a manufacturing cluster in Lang Son, baseline business-as-usual greenhouse gas emissions total {3} thousand tons of CO₂. Using solar power and circular production, the cluster reduced emissions by {4} thousand tons of CO₂. Calculate the percentage emission reduction compared to the baseline (unit: %, round to {5} decimal place).',
    fVi: 'Tỉ lệ giảm phát thải (%) = (Lượng CO₂ cắt giảm / Tổng lượng CO₂ kịch bản thông thường) × {N} = ({N} / {N}) × {N}',
    fEn: 'Emission Reduction (%) = (CO₂ Reduced / Baseline Emissions) × {1} = ({2} / {3}) × {4}',
    gEn: 'Divide CO₂ emissions reduced by baseline emissions, then multiply by 100.',
    steps: [
      { vi: 'Bước {N}: Lượng CO₂ cắt giảm = {N} nghìn tấn; Kịch bản thông thường = {N} nghìn tấn.', en: 'Step {1}: CO₂ reduced = {2} thousand tons; Baseline = {3} thousand tons.' },
      { vi: 'Bước {N}: Tỉ lệ giảm = ({N} / {N}) × {N} = {N}%.', en: 'Step {1}: Reduction rate = ({2} / {3}) × {4} = {5}%.' },
    ],
  },
];

export function localizeShortAnswerCurriculum(q: ShortAnswerQuestion): ShortAnswerQuestion {
  const englishUnit = ENGLISH_UNITS_MAP[q.unit] || q.unit;
  for (const rule of RAW_SA_RULES) {
    const qEn = applyTemplate(rule.qVi, rule.qEn, q.question);
    if (qEn !== null) {
      const fEn = q.formula ? applyTemplate(rule.fVi, rule.fEn, q.formula) || q.formula : q.formula;
      const stepsEn = (q.calculationSteps || []).map((st) => {
        for (const sp of rule.steps) {
          const matched = applyTemplate(sp.vi, sp.en, st);
          if (matched !== null) return matched;
        }
        return st;
      });
      const explanationEn =
        fEn && stepsEn.length > 0
          ? `Apply formula: ${fEn}. Calculation steps: ${stepsEn.join(' ')}`
          : fEn
          ? `Apply formula: ${fEn}.`
          : q.explanation;

      const rr = q.roundingRule
        ? q.roundingRule
            .replace(/Làm tròn số thập phân theo quy định của đề bài\.?/g, 'Round decimals as specified in the problem statement.')
            .replace(/Làm tròn đến hàng đơn vị/g, 'Round to the nearest integer')
            .replace(/Làm tròn đến (\d+) chữ số thập phân/g, 'Round to $1 decimal place(s)')
        : 'Round decimals as specified in the problem statement.';

      return {
        ...q,
        question: qEn,
        formula: fEn,
        calculationSteps: stepsEn,
        guide: rule.gEn,
        unit: englishUnit,
        roundingRule: rr,
        explanation: explanationEn,
        acceptedAnswers: Array.from(
          new Set([
            ...q.acceptedAnswers,
            `${q.standardAnswer} ${englishUnit}`,
          ])
        ),
      };
    }
  }
  return {
    ...q,
    unit: englishUnit,
  };
}
