import {
  CognitiveLevel,
  MatchingQuestion,
  MultipleChoiceQuestion,
  Question,
  ShortAnswerQuestion,
  TrueFalseContextQuestion,
} from '../types';

/**
 * NGÂN HÀNG CÂU HỎI KHỞI ĐỘNG RIÊNG BIỆT: "EM CÓ BIẾT? – KHÁM PHÁ ĐỊA LÍ"
 * Mục đích: Khơi gợi trí tò mò, khám phá những điều kì thú về Trái Đất, tự nhiên,
 * dân cư, văn hóa, kỉ lục thế giới và các câu chuyện địa lí thú vị trong đời sống.
 * Không yêu cầu học sinh phải học thuộc kiến thức SGK trước.
 */

// ============================================================================
// DẠNG 1: TRẮC NGHIỆM KHÁM PHÁ (4 LỰA CHỌN, 1 ĐÁP ÁN ĐÚNG)
// ============================================================================
export const DISCOVERY_MULTIPLE_CHOICE: MultipleChoiceQuestion[] = [
  {
    id: 'disc-mc-01',
    topicId: 'trai-dat-ki-thu',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Em có biết vì sao Trái Đất quay mà chúng ta không cảm thấy chóng mặt?',
    illustrationEmoji: '🌍',
    question:
      'Em có biết: Vận tốc tự quay quanh trục của Trái Đất ở khu vực xích đạo lên tới khoảng 1.670 km/h (nhanh hơn cả máy bay phản lực thương mại). Vì sao chúng ta đứng trên mặt đất lại hoàn toàn không cảm nhận được chuyển động chóng mặt này?',
    options: [
      'Vì bầu khí quyển, mặt đất và mọi vật thể cùng chuyển động đồng tốc đều đặn với Trái Đất',
      'Vì lực hút của Mặt Trời giữ cho cơ thể con người bất động tuyệt đối',
      'Vì Trái Đất chỉ tự quay vào ban đêm khi con người đang ngủ',
      'Vì từ trường của Trái Đất đã triệt tiêu hoàn toàn cảm giác chuyển động',
    ],
    correctIndex: 0,
    explanation:
      'Giống như khi ngồi trên một chiếc máy bay đang bay đều đặn với tốc độ 900 km/h, bạn không cảm thấy mình đang lao đi nhanh vì không khí và mọi thứ bên trong khoang đều bay cùng vận tốc với bạn. Bầu khí quyển và mặt đất cùng quay đồng tốc với Trái Đất!',
    funFact:
      'Nếu Trái Đất bất ngờ phanh dừng lại trong 1 giây, do quán tính, mọi vật thể ở xích đạo sẽ bị văng về phía đông với vận tốc 1.670 km/h!',
  },
  {
    id: 'disc-mc-02',
    topicId: 'kham-pha-hang-khong',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Vì sao máy bay không bay đường thẳng trên bản đồ phẳng?',
    illustrationEmoji: '✈️',
    question:
      'Em có biết: Khi bay từ Hà Nội (Việt Nam) sang San Francisco (Hoa Kỳ), các phi công không lái máy bay theo một đường thẳng tắp ngang qua Thái Bình Dương trên bản đồ, mà thường bay vòng cong lên phía bắc gần Nhật Bản và Alaska. Vì sao lại thế?',
    options: [
      'Vì trên mặt cầu Trái Đất, cung vòng cung lớn (Great Circle) mới là quãng đường ngắn nhất, tiết kiệm nhiên liệu nhất',
      'Vì máy bay cần bay qua vùng có tuyết rơi để làm mát động cơ phản lực',
      'Vì Thái Bình Dương có quá nhiều tam giác quỷ Bermuda máy bay phải tránh',
      'Vì luật hàng không quốc tế cấm máy bay bay thẳng qua đường xích đạo',
    ],
    correctIndex: 0,
    explanation:
      'Bản đồ phẳng Mercator làm biến dạng hình học mặt cầu. Trên bề mặt quả cầu hình phỏng cầu của Trái Đất, đường bay hình cung vòng lớn (Great Circle Route) cong lên hướng cực thực chất là con đường ngắn nhất và nhanh nhất!',
    funFact:
      'Nhờ bay theo đường vòng cung lớn qua vĩ độ cao gần Alaska, mỗi chuyến bay xuyên Thái Bình Dương có thể tiết kiệm được hơn 1.000 km hành trình và hàng chục tấn nhiên liệu.',
  },
  {
    id: 'disc-mc-03',
    topicId: 'bien-va-dai-duong',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Bí mật người nổi bồng bềnh không bao giờ chìm!',
    illustrationEmoji: '🌊',
    question:
      'Tại Biển Chết (nằm giữa Israel và Jordan), người tắm biển có thể thong thả nằm ngửa trên mặt nước để đọc sách báo mà không hề sợ chìm. Hiện tượng kì thú này xuất phát từ nguyên nhân nào?',
    options: [
      'Độ mặn của nước cực cao (gần 34%), khiến tỉ trọng nước biển lớn hơn tỉ trọng cơ thể người rất nhiều',
      'Dưới đáy Biển Chết có các luồng khí nóng ngầm liên tục đẩy người lên trên',
      'Nước ở Biển Chết có chứa lượng dầu mỏ tự nhiên tạo lực nâng cơ học',
      'Từ trường Trái Đất tại vùng trũng Biển Chết tác động nâng cơ thể người lên',
    ],
    correctIndex: 0,
    explanation:
      'Nước biển thông thường có độ mặn khoảng 3,5%, trong khi Biển Chết có độ mặn tới gần 34% (gấp gần 10 lần!). Tỉ trọng nước quá đậm đặc khiến lực đẩy Archimedes nâng bổng cơ thể người nổi bồng bềnh dễ dàng.',
    funFact:
      'Biển Chết thực chất là một hồ nước mặn nằm ở độ cao âm 430 mét dưới mực nước biển, là điểm trũng thấp nhất trên bề mặt đất liền của toàn bộ Trái Đất!',
  },
  {
    id: 'disc-mc-04',
    topicId: 'mui-gio-the-gioi',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Em thử đoán xem quốc gia nào có nhiều múi giờ liên tục nhất?',
    illustrationEmoji: '⏰',
    question:
      'Em thử đoán xem: Quốc gia nào có lãnh thổ đất liền trải dài liên tục qua tới 11 múi giờ khác nhau, khiến cho khi người dân ở bờ tây chuẩn bị ăn sáng thì người dân ở bờ đông đã đi ngủ tối?',
    options: [
      'Liên bang Nga',
      'Hợp chúng quốc Hoa Kỳ',
      'Cộng hòa Nhân dân Trung Hoa',
      'Cộng hòa Liên bang Brazil',
    ],
    correctIndex: 0,
    explanation:
      'Liên bang Nga là quốc gia có diện tích lớn nhất thế giới (trên 17 triệu km²), trải dài từ biển Baltic ở châu Âu sang tận eo biển Bering giáp Bắc Mỹ, đi qua 11 múi giờ liên tục (từ UTC+2 đến UTC+12)!',
    funFact:
      'Trung Quốc có diện tích bề ngang gần ngang ngửa nước Mỹ nhưng cả nước chỉ sử dụng đúng 1 múi giờ chuẩn Bắc Kinh (UTC+8). Do đó ở vùng viễn tây Tân Cương, vào mùa hè đến tận 23 giờ đêm trời mới lặn!',
  },
  {
    id: 'disc-mc-05',
    topicId: 'vu-tru-va-trai-dat',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Vì sao các trạm phóng tên lửa vũ trụ luôn muốn đặt gần Xích đạo?',
    illustrationEmoji: '🚀',
    question:
      'Em có biết: Các trung tâm vũ trụ hàng đầu như Mũi Canaveral (Mỹ) hay Kourou (Cơ quan Vũ trụ Châu Âu ở Guiana) đều được ưu tiên đặt ở vĩ độ thấp càng gần đường xích đạo càng tốt. Điều này mang lại lợi thế địa lí kì diệu nào?',
    options: [
      'Tận dụng vận tốc tự quay tối đa của Trái Đất để tạo lực đẩy tự nhiên miễn phí giúp tên lửa phóng vào quỹ đạo',
      'Vì vùng xích đạo không có lực hấp dẫn của Trái Đất tác động lên tên lửa',
      'Vì nhiệt độ xích đạo ấm áp giúp nhiên liệu tên lửa không bị đóng băng',
      'Để tên lửa khi phóng lên không bị mây che khuất tầm nhìn của đài thiên văn',
    ],
    correctIndex: 0,
    explanation:
      'Ở xích đạo, bán kính tự quay lớn nhất nên vận tốc tiếp tuyến đạt cực đại (~1.670 km/h). Khi phóng tên lửa về hướng đông từ xích đạo, tên lửa được "tặng thêm" vận tốc tự quay khổng lồ này, tiết kiệm hàng triệu đô la nhiên liệu!',
    funFact:
      'Trung tâm Vũ trụ Kourou của châu Âu nằm ở vĩ độ 5° Bắc sát xích đạo giúp tên lửa Ariane tiết kiệm được khoảng 15-20% tải trọng nhiên liệu so với việc phóng từ các nước châu Âu ở vĩ độ cao.',
  },
  {
    id: 'disc-mc-06',
    topicId: 'dia-hinh-ki-vi',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Đỉnh núi cao nhất Trái Đất nếu đo từ chân núi dưới biển?',
    illustrationEmoji: '🏔️',
    question:
      'Nếu đo từ mực nước biển, đỉnh Everest (8.848m) là cao nhất. Nhưng nếu tính từ tận chân núi dưới đáy biển lên đến đỉnh thì ngọn núi nào mới là ngọn núi cao nhất Trái Đất (vượt trên 10.200m)?',
    options: [
      'Núi lửa Mauna Kea ở quần đảo Hawaii (Thái Bình Dương)',
      'Núi Phú Sĩ ở đất nước Nhật Bản',
      'Đỉnh Kilimanjaro ở lục địa châu Phi',
      'Đỉnh Mont Blanc ở dãy Alps châu Âu',
    ],
    correctIndex: 0,
    explanation:
      'Núi lửa Mauna Kea tại đảo Hawaii có chân núi nằm sâu dưới đáy Thái Bình Dương gần 6.000m và đỉnh nhô cao 4.207m trên mực nước biển. Tổng chiều cao từ chân đến đỉnh là hơn 10.200m, vượt xa độ cao của đỉnh Everest!',
    funFact:
      'Do Trái Đất phình to ở xích đạo, đỉnh núi Chimborazo ở Ecuador mới là điểm trên bề mặt đất liền cách xa tâm Trái Đất nhất (gần các vì sao nhất), chứ không phải đỉnh Everest!',
  },
  {
    id: 'disc-mc-07',
    topicId: 'khi-hau-sa-mac',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Vì sao sa mạc ban ngày nóng rát nhưng ban đêm lại lạnh buốt?',
    illustrationEmoji: '🏜️',
    question:
      'Ở các hoang mạc như Sahara, ban ngày nhiệt độ có thể lên tới gần 50°C nhưng ban đêm nhiệt độ lại giảm thê thảm xuống 0°C, thậm chí có sương giá. Hiện tượng chênh lệch nhiệt độ cực đoan này là do đâu?',
    options: [
      'Không khí cực kì khô khan, hầu như không có hơi nước và mây để giữ nhiệt vào ban đêm, nhiệt thoát thẳng vào vũ trụ',
      'Ban đêm gió lạnh từ Bắc Cực thổi thẳng xuống quét qua sa mạc',
      'Cát sa mạc có tính chất tự phát sinh ra khí lạnh khi không có ánh nắng',
      'Do lòng đất sa mạc vào ban đêm hấp thụ toàn bộ nhiệt lượng bề mặt',
    ],
    correctIndex: 0,
    explanation:
      'Hơi nước và mây trong khí quyển đóng vai trò như chiếc chăn giữ ấm khổng lồ cho mặt đất (hiệu ứng nhà kính tự nhiên). Ở sa mạc không có hơi nước và mây, ban ngày cát hấp thụ nhiệt nhanh, ban đêm nhiệt bức xạ thẳng vào không gian không gì ngăn lại khiến trời lạnh buốt.',
    funFact:
      'Biên độ nhiệt ngày đêm ở hoang mạc Sahara có thể lên tới 35 - 40°C trong cùng một ngày, khắc nghiệt bậc nhất trên hành tinh!',
  },
  {
    id: 'disc-mc-08',
    topicId: 'dong-vat-va-dia-li',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Vì sao không bao giờ thấy chim cánh cụt gặp gấu Bắc Cực?',
    illustrationEmoji: '🐧',
    question:
      'Em có biết: Trong tự nhiên hoang dã, gấu trắng Bắc Cực và chim cánh cụt không bao giờ chạm mặt nhau. Điều kì thú nào tạo nên sự thật địa lí này?',
    options: [
      'Chim cánh cụt chỉ sống tự nhiên ở Nam Bán cầu (Nam Cực), còn gấu trắng chỉ sống ở Bắc Bán cầu (Bắc Cực)',
      'Gấu trắng và chim cánh cụt sống cùng ở Bắc Cực nhưng chim cánh cụt chỉ ra ngoài vào mùa đông',
      'Chim cánh cụt sợ gấu trắng nên đã biết bay di cư sang châu Phi lánh nạn',
      'Chim cánh cụt chỉ sống ở các cánh rừng nhiệt đới của Nam Mỹ',
    ],
    correctIndex: 0,
    explanation:
      'Tất cả 18 loài chim cánh cụt trên thế giới đều cư trú tự nhiên ở Nam Bán cầu (chủ yếu quanh châu Nam Cực và vùng biển lạnh lân cận). Ngược lại, gấu trắng Bắc Cực chỉ sinh sống trên các tảng băng trôi quanh Bắc Băng Dương ở Bắc Bán cầu!',
    funFact:
      'Từ "Bắc Cực" trong tiếng Hy Lạp cổ là "Arktos" có nghĩa là "vùng đất của loài gấu", còn "Antarctica" (Nam Cực) có nghĩa là "vùng đất đối diện với nơi có gấu"!',
  },
  {
    id: 'disc-mc-09',
    topicId: 'hai-luu-bien',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Dòng hải lưu sưởi ấm cả châu lục như chiếc lò sưởi khổng lồ!',
    illustrationEmoji: '🔥',
    question:
      'Thủ đô London (Anh) và Paris (Pháp) nằm ở vĩ độ rất cao (50-51° Bắc, tương đương với vùng Siberia lạnh giá của Nga), nhưng mùa đông ở Tây Âu hiếm khi quá giá buốt và hải cảng quanh năm không đóng băng. Chiếc "lò sưởi" thiên nhiên vĩ đại nào đã sưởi ấm cho Tây Âu?',
    options: [
      'Dòng hải lưu nóng Gulf Stream (dòng hải lưu Vịnh Mexico) mang nước ấm từ nhiệt đới lên',
      'Hệ thống núi lửa ngầm dưới đáy biển Bắc hoạt động liên tục',
      'Gió mùa đông bắc mang nhiệt lượng từ sa mạc Sahara thổi sang',
      'Nhiệt lượng do các thành phố công nghiệp đông dân tỏa ra làm ấm bầu khí quyển',
    ],
    correctIndex: 0,
    explanation:
      'Dòng hải lưu nóng Gulf Stream chảy từ vịnh Mexico qua Đại Tây Dương mang theo khối lượng nước ấm khổng lồ. Dòng biển này kết hợp cùng gió Tây ôn đới hoạt động như một hệ thống sưởi ấm trung tâm khổng lồ cho toàn bộ Tây và Bắc Âu!',
    funFact:
      'Lượng nhiệt mà dòng Gulf Stream vận chuyển đến Tây Âu tương đương với sản lượng điện của khoảng 1 triệu nhà máy điện hạt nhân cộng lại!',
  },
  {
    id: 'disc-mc-10',
    topicId: 'dia-li-kinh-te',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Vì sao một con tàu mắc kẹt lại làm tê liệt kinh tế cả thế giới?',
    illustrationEmoji: '🚢',
    question:
      'Tháng 3 năm 2021, con tàu container siêu trọng Ever Given bị mắc cạn đã chắn ngang một kênh đào nổi tiếng, làm tắc nghẽn gần 12% thương mại hàng hải toàn cầu và gây thiệt hại hàng tỉ USD mỗi ngày. Đó là kênh đào chiến lược nào?',
    options: [
      'Kênh đào Suez (Ai Cập)',
      'Kênh đào Panama (Trung Mỹ)',
      'Kênh đào Kiel (Đức)',
      'Kênh đào Corinth (Hy Lạp)',
    ],
    correctIndex: 0,
    explanation:
      'Kênh đào Suez dài 193 km xuyên qua eo đất Suez ở Ai Cập, nối liền Địa Trung Hải với Biển Đỏ. Kênh đào này giúp tàu bè đi từ châu Âu sang châu Á không phải đi vòng qua Mũi Hảo Vọng ở cực nam châu Phi, rút ngắn gần 9.000 km hành trình!',
    funFact:
      'Khi kênh Suez bị phong tỏa 6 ngày do tàu Ever Given, hàng trăm con tàu phải neo đậu xếp hàng dài trên biển, chuỗi cung ứng hàng hóa toàn cầu từ đồ điện tử đến dầu mỏ bị gián đoạn trầm trọng.',
  },
  {
    id: 'disc-mc-11',
    topicId: 'dem-trang-ki-thu',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Hiện tượng đêm trắng: Nửa đêm Mặt Trời vẫn chiếu sáng rực rỡ!',
    illustrationEmoji: '☀️',
    question:
      'Tại các thành phố như Saint Petersburg (Nga) hay Oslo (Na Uy) vào mùa hè, người dân có thể đọc sách ngoài trời vào lúc nửa đêm mà không cần bật đèn vì trời vẫn sáng trưng. Hiện tượng "Đêm trắng" kì diệu này sinh ra do đâu?',
    options: [
      'Trục Trái Đất nghiêng khiến vùng cực và cận cực Bắc ngả trọn vẹn về phía Mặt Trời trong mùa hè',
      'Mặt Trăng ở vùng cực sáng gấp 10 lần Mặt Trăng ở vùng xích đạo',
      'Tuyết trắng ở hai cực phản chiếu ánh sáng nhân tạo của các đô thị',
      'Tầng ozon ở vùng cực bị thủng làm ánh sáng khuếch tán mạnh hơn',
    ],
    correctIndex: 0,
    explanation:
      'Vào mùa hè Bắc Bán cầu, cực Bắc chúc về phía Mặt Trời khiến các vùng nằm từ vĩ độ cao (gần vòng cực) có ngày dài suốt 24 giờ (hoặc Mặt Trời chỉ lặn xuống dưới đường chân trời một góc rất nhỏ rồi lại mọc lên ngay), tạo nên những đêm trắng thơ mộng.',
    funFact:
      'Tại mũi Nordkapp (cực bắc Na Uy), Mặt Trời không hề lặn một phút nào từ ngày 12 tháng 5 đến tận ngày 1 tháng 8 liên tục trong gần 3 tháng!',
  },
  {
    id: 'disc-mc-12',
    topicId: 'song-ho-the-gioi',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Quốc gia nào sở hữu nhiều hồ nước tự nhiên nhất thế giới?',
    illustrationEmoji: '🛶',
    question:
      'Em thử đoán xem: Quốc gia nào trên hành tinh sở hữu số lượng hồ nước ngọt tự nhiên nhiều nhất thế giới (ước tính hơn 2 triệu hồ, chiếm hơn một nửa tổng số hồ tự nhiên của toàn Trái Đất)?',
    options: [
      'Canada (Bắc Mỹ)',
      'Hợp chúng quốc Hoa Kỳ',
      'Cộng hòa Phần Lan',
      'Liên bang Nga',
    ],
    correctIndex: 0,
    explanation:
      'Canada là "vương quốc của các hồ nước" với hơn 2 triệu hồ lớn nhỏ (trong đó có khoảng 31.700 hồ có diện tích trên 3 km²). Các hồ này phần lớn hình thành do các khối băng hà khổng lồ thời kì Băng hà đục khoét bề mặt đất đá khi rút lui.',
    funFact:
      'Dù Phần Lan thường được gọi là "Xứ sở nghìn hồ" (khoảng 188.000 hồ), tổng số hồ của Phần Lan vẫn còn ít hơn rất nhiều so với con số hơn 2 triệu hồ của Canada!',
  },
  {
    id: 'disc-mc-13',
    topicId: 'nui-lua-va-su-song',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Vì sao đất quanh chân núi lửa lại màu mỡ bậc nhất Trái Đất?',
    illustrationEmoji: '🌋',
    question:
      'Núi lửa phun trào là thảm họa thiên nhiên dữ dội, nhưng tại đảo Java (Indonesia) hay chân núi lửa Vesuvius (Ý), nông dân vẫn tập trung canh tác cực kì đông đúc. Lợi ích nông nghiệp vô giá nào mà núi lửa mang lại?',
    options: [
      'Tro bụi và nham thạch núi lửa khi phong hóa tạo ra lớp đất bazan cực kì giàu khoáng chất kali, phốt pho và canxi nuôi cây trồng',
      'Nhiệt độ ấm nóng từ lòng đất núi lửa giúp cây trái chín nhanh gấp đôi',
      'Khí độc lưu huỳnh từ miệng núi lửa giúp tiêu diệt 100% sâu bọ phá hoại',
      'Nước ngầm quanh núi lửa hoàn toàn không có muối khoáng',
    ],
    correctIndex: 0,
    explanation:
      'Tro bụi dung nham núi lửa giàu các nguyên tố vi lượng và khoáng chất thiết yếu. Qua hàng ngàn năm phong hóa, chúng tạo nên các tầng đất đỏ bazan và đất phù sa núi lửa phì nhiêu màu mỡ bậc nhất hành tinh, cho năng suất mùa màng bội thu.',
    funFact:
      'Đảo Java chỉ chiếm 7% diện tích Indonesia nhưng là nơi sinh sống của gần 60% dân số cả nước, một phần lớn nhờ đất đai núi lửa màu mỡ nuôi dưỡng được nền nông nghiệp lúa nước thâm canh năng suất cao.',
  },
  {
    id: 'disc-mc-14',
    topicId: 'dia-tu-truong',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Chiếc áo giáp vô hình bảo vệ Trái Đất khỏi bức xạ vũ trụ!',
    illustrationEmoji: '🛡️',
    question:
      'Lõi ngoài của Trái Đất được cấu tạo từ sắt và niken nóng chảy liên tục cuộn xoáy sinh ra một "lá chắn vô hình" bảo vệ sự sống trên mặt đất khỏi các hạt bức xạ hủy diệt từ gió Mặt Trời. Chiếc lá chắn kì diệu đó là gì?',
    options: [
      'Từ trường Trái Đất (Địa từ trường)',
      'Tầng khí quyển đối lưu',
      'Lực hấp dẫn mặt đất',
      'Vành đai bức xạ Mặt Trăng',
    ],
    correctIndex: 0,
    explanation:
      'Hiệu ứng máy phát điện tự nhiên (Geodynamo) từ dòng kim loại lỏng nóng chảy trong lõi Trái Đất sinh ra từ trường khổng lồ. Từ trường làm lệch hướng các hạt mang điện nguy hiểm từ gió Mặt Trời, bảo vệ bầu khí quyển và muôn loài sinh vật.',
    funFact:
      'Sao Hỏa thời cổ đại cũng từng có đại dương và bầu khí quyển dày, nhưng do lõi hành tinh nguội đi làm mất từ trường, gió Mặt Trời đã thổi bay gần như toàn bộ bầu khí quyển của sao Hỏa vào vũ trụ!',
  },
  {
    id: 'disc-mc-15',
    topicId: 'song-ngoi-quoc-te',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Con sông quốc tế chảy qua nhiều thủ đô hoa lệ nhất!',
    illustrationEmoji: '🏰',
    question:
      'Em có biết: Con sông nào chảy qua lãnh thổ của 10 quốc gia châu Âu và đi qua 4 thủ đô nổi tiếng (Vienna của Áo, Bratislava của Slovakia, Budapest của Hungary và Belgrade của Serbia)?',
    options: [
      'Sông Danube (sông Đa-nuýp)',
      'Sông Rhine (sông Rai-nơ)',
      'Sông Seine (sông Xen)',
      'Sông Volga (sông Vôn-ga)',
    ],
    correctIndex: 0,
    explanation:
      'Sông Danube dài 2.850 km bắt nguồn từ Rừng Đen (Đức) và đổ ra Biển Đen. Đây là dòng sông quốc tế có tầm quan trọng chiến lược bậc nhất châu Âu cả về giao thông thủy, lịch sử và văn hóa.',
    funFact:
      'Bản nhạc valse bất hủ "Dòng sông Danube xanh" của nhà soạn nhạc Johann Strauss II là một trong những giai điệu cổ điển được yêu thích nhất mọi thời đại.',
  },
  {
    id: 'disc-mc-16',
    topicId: 'sahara-xanh-mat',
    lessonId: 'kham-pha',
    type: 'multiple_choice',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Sa mạc Sahara từng là rừng xanh và hồ nước khổng lồ?',
    illustrationEmoji: '🦒',
    question:
      'Các nhà khảo cổ học đã phát hiện hàng ngàn bức tranh khắc đá cổ xưa ở giữa lòng hoang mạc Sahara khô cằn vẽ cảnh người săn bắn, bơi lội và những đàn hươu cao cổ, hà mã tung tăng. Điều này chứng minh sự thật địa lí kì thú nào?',
    options: [
      'Khoảng 6.000 đến 10.000 năm trước, Sahara từng là một vùng thảo nguyên xanh mướt (Kì Sahara Xanh) với khí hậu ẩm ướt và sông hồ phong phú',
      'Người cổ đại ngày xưa đã tưởng tượng ra động vật chứ Sahara từ xưa đến nay luôn khô hạn',
      'Động vật châu Phi ngày xưa có khả năng sống nhiều năm không cần uống nước',
      'Người Ai Cập cổ đại đã đào kênh dẫn toàn bộ nước biển vào sa mạc',
    ],
    correctIndex: 0,
    explanation:
      'Do chu kì biến đổi quỹ đạo và trục nghiêng tự nhiên của Trái Đất (chu kì Milankovitch), gió mùa châu Phi từng tiến sâu vào lục địa cách đây 6.000 - 11.000 năm, biến Sahara thành một đồng cỏ xanh tươi rực rỡ với hồ nước khổng lồ Mega-Chad!',
    funFact:
      'Các nhà khoa học tính toán rằng khoảng 15.000 năm nữa, Sahara sẽ lại bước vào chu kì ẩm ướt và có thể xanh tươi trở lại!',
  },
];

// ============================================================================
// DẠNG 2: ĐÚNG - SAI TƯ LIỆU KÌ THÚ (CÓ NGỮ LIỆU ĐOẠN TRÍCH, 4 Ý a, b, c, d)
// ============================================================================
export const DISCOVERY_TRUE_FALSE: TrueFalseContextQuestion[] = [
  {
    id: 'disc-tf-01',
    topicId: 'kham-pha-dai-duong',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Vực thẳm sâu nhất hành tinh: Rãnh Mariana huyền bí!',
    illustrationEmoji: '🌊',
    contextTitle: 'Tư liệu khám phá: Đáy sâu Mariana - Nơi con người ít đặt chân tới hơn cả Mặt Trăng',
    contextText:
      'Rãnh Mariana nằm ở phía tây Thái Bình Dương là rãnh đại dương sâu nhất được biết đến trên Trái Đất. Điểm sâu nhất của nó có tên là "Vực thẳm Challenger" với độ sâu gần 11.000 mét (khoảng 10.994m). Ở độ sâu này, ánh sáng Mặt Trời hoàn toàn không thể chạm tới, nhiệt độ nước chỉ từ 1 đến 4°C và áp suất nước lên tới hơn 1.000 atmosphere (tương đương với sức nặng của một chiếc máy bay phản lực đè lên ngón tay cái của bạn). Dù khắc nghiệt như vậy, các nhà thám hiểm vẫn tìm thấy những sinh vật đặc biệt phát quang sinh học và vi khuẩn sống dựa vào miệng phun thủy nhiệt.',
    statements: [
      {
        id: 'a',
        text: 'Nếu đặt đỉnh núi Everest (cao 8.848m) xuống đáy vực thẳm Challenger, đỉnh núi vẫn còn chìm dưới mặt nước biển hơn 2.000m.',
        isCorrect: true,
        explanation: 'Độ sâu rãnh Mariana (~11.000m) lớn hơn chiều cao đỉnh Everest (8.848m) hơn 2.100 mét!',
      },
      {
        id: 'b',
        text: 'Áp suất khổng lồ và bóng tối vĩnh cửu ở đáy rãnh Mariana khiến không một sinh vật sống nào có thể tồn tại được.',
        isCorrect: false,
        explanation: 'Các tàu thám hiểm lặn sâu vẫn ghi nhận nhiều loài cá giáp mềm, hải sâm và sinh vật phát quang thích nghi kì diệu với áp suất siêu cao.',
      },
      {
        id: 'c',
        text: 'Số lượng phi hành gia từng bay lên Mặt Trăng còn nhiều hơn số người từng lặn xuống điểm sâu nhất của rãnh Mariana.',
        isCorrect: true,
        explanation: 'Đến nay mới chỉ có một số ít nhà thám hiểm (như Don Walsh, Jacques Piccard, James Cameron) lặn xuống đáy Challenger, ít hơn 12 phi hành gia từng đặt chân lên Mặt Trăng.',
      },
      {
        id: 'd',
        text: 'Rãnh Mariana được hình thành do hai mảng kiến tạo của thạch quyển hút chìm va chạm vào nhau.',
        isCorrect: true,
        explanation: 'Rãnh Mariana là ranh giới hội tụ nơi mảng Thái Bình Dương chìm sâu xuống bên dưới mảng Mariana nhỏ hơn.',
      },
    ],
    funFact:
      'Các nhà khoa học phát hiện rác thải nhựa (túi nylon) ở độ sâu gần 11.000m của rãnh Mariana, lời cảnh tỉnh mạnh mẽ về ô nhiễm môi trường biển!',
  },
  {
    id: 'disc-tf-02',
    topicId: 'kham-pha-dia-cau',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Bí mật đường đổi ngày quốc tế: Đi thuyền xuyên không gian và thời gian!',
    illustrationEmoji: '🧭',
    contextTitle: 'Tư liệu địa lí: Đường chuyển ngày quốc tế (Kinh tuyến 180°)',
    contextText:
      'Đường chuyển ngày quốc tế (International Date Line - IDL) chạy xấp xỉ dọc theo kinh tuyến 180° ở giữa Thái Bình Dương. Đây là đường phân định ranh giới giữa hai ngày lịch liên tiếp nhau trên Trái Đất. Khi bạn đứng trên đường này, chân trái của bạn có thể đang ở ngày Chủ Nhật, trong khi chân phải của bạn đã bước sang ngày Thứ Hai! Để tránh tình trạng một quốc gia nhỏ bị chia cắt làm hai ngày lịch khác nhau, đường đổi ngày không phải là một đường thẳng tắp mà bị bẻ ngoằn ngoèo vòng qua các quốc đảo như Kiribati, Fiji và bán đảo Chukchi của Nga.',
    statements: [
      {
        id: 'a',
        text: 'Khi một chiếc tàu thủy đi từ Tây sang Đông vượt qua đường đổi ngày quốc tế, người trên tàu phải lùi lại 1 ngày lịch.',
        isCorrect: true,
        explanation: 'Đi từ Tây sang Đông qua kinh tuyến 180° (từ khu vực múi giờ sớm sang múi giờ muộn) sẽ lùi lại 1 ngày lịch.',
      },
      {
        id: 'b',
        text: 'Đường chuyển ngày quốc tế là một đường kinh tuyến thẳng tắp tuyệt đối nối thẳng từ cực Bắc xuống cực Nam.',
        isCorrect: false,
        explanation: 'Đường đổi ngày bị bẻ cong ngoằn ngoèo để không cắt ngang lãnh thổ của một quốc gia hay quần đảo nào.',
      },
      {
        id: 'c',
        text: 'Quốc đảo Kiribati ở Thái Bình Dương đã điều chỉnh múi giờ lãnh thổ để trở thành nơi đầu tiên trên Trái Đất đón chào bình minh của năm mới.',
        isCorrect: true,
        explanation: 'Đảo Caroline (thuộc Kiribati) đổi tên thành Đảo Thiên Niên Kỷ, nằm ở múi giờ UTC+14, là nơi đón bình minh ngày mới sớm nhất hành tinh.',
      },
      {
        id: 'd',
        text: 'Nếu bạn bay từ Samoa sang đảo American Samoa gần đó (chỉ cách nhau 70km), bạn có thể tổ chức sinh nhật của mình tới 2 lần trong 2 ngày liên tiếp.',
        isCorrect: true,
        explanation: 'Hai đảo này nằm ở hai bên của đường đổi ngày quốc tế và chênh nhau tới 24 hoặc 25 tiếng đồng hồ!',
      },
    ],
    funFact:
      'Trong tiểu thuyết "80 ngày vòng quanh thế giới" của Jules Verne, nhân vật Phileas Fogg tưởng mình đã thua cuộc vì muộn 1 ngày, nhưng do ông đi vòng quanh Trái Đất từ Tây sang Đông nên thực tế ông đã "lời" được đúng 1 ngày!',
  },
  {
    id: 'disc-tf-03',
    topicId: 'kham-pha-rung-xanh',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Rừng Amazon và những dòng sông bay kì diệu trên bầu trời!',
    illustrationEmoji: '🌳',
    contextTitle: 'Tư liệu sinh quyển: Rừng mưa nhiệt đới Amazon và hiện tượng "Sông bay"',
    contextText:
      'Rừng mưa Amazon ở Nam Mỹ là khu rừng nhiệt đới lớn nhất hành tinh, bao phủ diện tích hơn 5,5 triệu km² trên lãnh thổ của 9 quốc gia. Không chỉ sở hữu hệ đa dạng sinh học vô song với hàng triệu loài sinh vật, rừng Amazon còn có khả năng tự tạo ra mưa cho chính nó và cả lục địa Nam Mỹ thông qua hiện tượng "Những dòng sông bay" (Flying Rivers). Mỗi ngày, hàng tỉ cây xanh khổng lồ ở Amazon hút nước từ lòng đất và bốc thoát hơi nước vào bầu khí quyển lên tới 20 tỉ tấn nước - lượng nước ngọt này còn lớn hơn cả tổng lưu lượng nước sông Amazon đổ ra Đại Tây Dương mỗi ngày!',
    statements: [
      {
        id: 'a',
        text: 'Hiện tượng "Dòng sông bay" ở Amazon thực chất là các luồng hơi ẩm khổng lồ do rừng bốc thoát hơi nước di chuyển trên khí quyển.',
        isCorrect: true,
        explanation: 'Cây rừng Amazon thoát hơi nước tạo thành các "dòng sông hơi nước vô hình" khổng lồ trên bầu trời, tạo mưa cho cả lục địa.',
      },
      {
        id: 'b',
        text: 'Sông Amazon là con sông dài nhất nhưng lưu lượng nước của nó nhỏ hơn nhiều so với sông Nile ở châu Phi.',
        isCorrect: false,
        explanation: 'Sông Amazon có lưu lượng nước lớn nhất thế giới, chiếm khoảng 20% tổng lượng nước ngọt mà các con sông trên Trái Đất đổ ra biển.',
      },
      {
        id: 'c',
        text: 'Hạt cát và bụi giàu dinh dưỡng từ sa mạc Sahara ở châu Phi bay theo gió vượt Đại Tây Dương sang bón phân tự nhiên cho rừng Amazon.',
        isCorrect: true,
        explanation: 'Hằng năm có khoảng 28 triệu tấn bụi giàu phốt-pho từ vùng trũng Bodélé ở Sahara vượt 5.000km qua đại dương để nuôi dưỡng đất rừng Amazon!',
      },
      {
        id: 'd',
        text: 'Rừng Amazon cung cấp toàn bộ 100% lượng khí oxy mà con người và động vật trên toàn Trái Đất đang hít thở.',
        isCorrect: false,
        explanation: 'Dù tạo ra nhiều oxy qua quang hợp, cây và sinh vật trong rừng Amazon cũng tiêu thụ phần lớn lượng oxy đó qua hô hấp và phân hủy sinh học.',
      },
    ],
    funFact:
      'Dưới lòng đất rừng Amazon, ở độ sâu 4.000m, các nhà khoa học phát hiện một dòng chảy nước ngầm ngầm dài hơn 6.000km có tên là sông Hamza, chảy ngầm song song với sông Amazon!',
  },
  {
    id: 'disc-tf-04',
    topicId: 'kham-pha-ho-nuoc',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Hồ Baikal - Túi nước ngọt cổ xưa và sâu nhất nhân loại!',
    illustrationEmoji: '💎',
    contextTitle: 'Tư liệu tự nhiên: Hồ Baikal - "Viên ngọc xanh của Siberia"',
    contextText:
      'Nằm ở miền nam Siberia (Nga), hồ Baikal là hồ nước ngọt sâu nhất (1.642m) và có tuổi đời địa chất cổ xưa nhất thế giới (khoảng 25 - 30 triệu năm tuổi). Hồ chứa một lượng nước ngọt khổng lồ lên tới 23.600 km³, chiếm hơn 20% tổng trữ lượng nước ngọt bề mặt không đóng băng của toàn bộ hành tinh. Nước hồ Baikal trong vắt đến mức vào mùa xuân, người ta có thể nhìn thấy rõ các tảng đá và sinh vật ở độ sâu 40 mét dưới làn nước. Nơi đây là ngôi nhà của loài hải cẩu Nerpa - loài hải cẩu nước ngọt duy nhất trên thế giới.',
    statements: [
      {
        id: 'a',
        text: 'Lượng nước ngọt của hồ Baikal lớn hơn tổng lượng nước của cả 5 hồ lớn (Ngũ Đại Hồ) ở Bắc Mỹ gộp lại.',
        isCorrect: true,
        explanation: 'Trữ lượng nước ngọt của hồ Baikal (~23.600 km³) lớn hơn tổng trữ lượng của cả 5 Ngũ Đại Hồ Bắc Mỹ cộng lại.',
      },
      {
        id: 'b',
        text: 'Vào mùa đông lạnh giá ở Siberia, mặt hồ Baikal đóng một lớp băng dày có thể cho ô tô và xe tải chạy an toàn trên bề mặt.',
        isCorrect: true,
        explanation: 'Băng trên hồ Baikal mùa đông có thể dày từ 1m đến 2m, đủ sức chịu tải cho cả các đoàn xe vận tải qua lại.',
      },
      {
        id: 'c',
        text: 'Hồ Baikal là một hồ nước nhân tạo do con người đào đắp để xây dựng đập thủy điện vào thế kỉ 20.',
        isCorrect: false,
        explanation: 'Hồ Baikal là một hồ tự nhiên hình thành do đứt gãy kiến tạo rạn nứt thạch quyển từ hơn 25 triệu năm trước.',
      },
      {
        id: 'd',
        text: 'Có tới hơn 300 con sông suối đổ nước vào hồ Baikal nhưng chỉ có duy nhất một con sông thoát nước ra khỏi hồ là sông Angara.',
        isCorrect: true,
        explanation: 'Hồ nhận nước từ 336 sông suối nhưng chỉ thoát nước ra duy nhất bằng sông Angara (nhánh của sông Yenisei).',
      },
    ],
    funFact:
      'Nếu cả thế giới cạn kiệt nước ngọt, lượng nước trong hồ Baikal một mình nó có thể cung cấp đủ nước uống cho toàn bộ dân số nhân loại trong gần 50 năm!',
  },
  {
    id: 'disc-tf-05',
    topicId: 'dao-bang-greenland',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Đảo Greenland: Hòn đảo phủ băng nhưng mang tên "Vùng đất xanh"!',
    illustrationEmoji: '🧊',
    contextTitle: 'Tư liệu lịch sử - địa lí: Nghịch lí tên gọi đảo Greenland và Iceland',
    contextText:
      'Greenland là hòn đảo lớn nhất hành tinh với diện tích hơn 2,1 triệu km². Khoảng 80% bề mặt của Greenland bị chôn vùi dưới một lớp khiên băng khổng lồ dày tới 2 - 3 km. Thế nhưng hòn đảo này lại được đặt tên là "Greenland" (Vùng đất màu xanh lá). Ngược lại, quốc đảo láng giềng Iceland (Vùng đất băng giá) lại có phong cảnh xanh tươi, suối nước nóng phun trào và khí hậu ôn hòa hơn rất nhiều nhờ dòng hải lưu nóng Gulf Stream. Theo truyền thuyết của người Viking, nhà thám hiểm Erik the Red bị lưu đày đã cố tình đặt tên hòn đảo phủ đầy băng là "Greenland" như một chiêu tiếp thị tài tình nhằm thu hút những người di cư từ Scandinavia đến đây lập nghiệp.',
    statements: [
      {
        id: 'a',
        text: 'Greenland là hòn đảo có diện tích tự nhiên lớn nhất thế giới (không tính các lục địa).',
        isCorrect: true,
        explanation: 'Với diện tích hơn 2,16 triệu km², Greenland là hòn đảo lớn nhất hành tinh.',
      },
      {
        id: 'b',
        text: 'Tên gọi "Greenland" được đặt vì toàn bộ hòn đảo này quanh năm phủ đầy rừng rậm nhiệt đới xanh tốt.',
        isCorrect: false,
        explanation: 'Hơn 80% diện tích Greenland phủ băng vĩnh cửu; tên gọi bắt nguồn từ chiến lược thu hút người di cư của người Viking.',
      },
      {
        id: 'c',
        text: 'Nếu toàn bộ khiên băng khổng lồ ở Greenland tan chảy hết, mực nước biển toàn cầu ước tính sẽ dâng cao thêm khoảng 7 mét.',
        isCorrect: true,
        explanation: 'Lớp băng Greenland chứa khối lượng nước ngọt khổng lồ, đủ sức làm nước biển thế giới dâng thêm hơn 7 mét nếu tan hoàn toàn.',
      },
      {
        id: 'd',
        text: 'Về mặt địa lí tự nhiên, Greenland thuộc về lục địa Bắc Mỹ, nhưng về mặt chính trị và lịch sử thì gắn bó mật thiết với châu Âu (Vương quốc Đan Mạch).',
        isCorrect: true,
        explanation: 'Greenland nằm trên mảng kiến tạo Bắc Mỹ nhưng là lãnh thổ tự trị thuộc Vương quốc Đan Mạch.',
      },
    ],
    funFact:
      'Dân số toàn bộ hòn đảo khổng lồ Greenland chỉ khoảng 56.000 người, không có bất kì con đường bộ nào nối liền giữa các thị trấn; mọi việc đi lại đều bằng thuyền, máy bay trực thăng hoặc xe trượt tuyết chó kéo!',
  },
  {
    id: 'disc-tf-06',
    topicId: 'thung-lung-chet',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Thung lũng Chết và bí ẩn những hòn đá tự biết "đi dạo"!',
    illustrationEmoji: '🪨',
    contextTitle: 'Tư liệu tự nhiên: Thung lũng Chết (Death Valley, California) và hiện tượng Đá tự trượt',
    contextText:
      'Thung lũng Chết ở bang California (Mỹ) là nơi giữ kỉ lục về nhiệt độ không khí cao nhất từng được ghi nhận chính thức trên Trái Đất (56,7°C vào năm 1913). Không chỉ là "lò lửa" nóng rát và điểm trũng thấp nhất Bắc Mỹ (âm 86m dưới mực nước biển), nơi đây còn nổi tiếng thế giới với bí ẩn hồ cạn Racetrack Playa: những tảng đá nặng hàng chục kilôgam tự di chuyển trên mặt bùn khô khốc và để lại vệt đường ray dài hàng trăm mét phía sau mà không hề có dấu chân người hay động vật can thiệp. Mãi đến năm 2014, các nhà khoa học mới gắn định vị GPS và giải mã được hiện tượng kì thú này: vào mùa đông hiếm hoi, nước đóng một lớp băng siêu mỏng như kính trên mặt đất, khi gió thổi mạnh, lớp băng vỡ trôi đẩy tảng đá trượt nhẹ trên bùn nhão!',
    statements: [
      {
        id: 'a',
        text: 'Thung lũng Chết là một trong những nơi khô nóng khắc nghiệt nhất trên bề mặt Trái Đất.',
        isCorrect: true,
        explanation: 'Nơi đây từng ghi nhận nhiệt độ không khí kỉ lục 56,7°C và lượng mưa trung bình năm dưới 50 mm.',
      },
      {
        id: 'b',
        text: 'Hiện tượng đá tự di chuyển ở Thung lũng Chết là do từ trường bí ẩn hút các tảng đá chạy về hướng cực Bắc.',
        isCorrect: false,
        explanation: 'Đá chuyển động do tác động kết hợp của lớp băng mỏng tan chảy trơn trượt trên bùn và sức đẩy của gió mạnh mùa đông.',
      },
      {
        id: 'c',
        text: 'Thung lũng Chết nằm ở độ cao âm dưới mực nước biển do đứt gãy sụt lún địa chất tạo thành.',
        isCorrect: true,
        explanation: 'Lòng chảo Badwater Basin ở Thung lũng Chết sâu âm 86m dưới mực nước biển.',
      },
      {
        id: 'd',
        text: 'Dù có tên là "Thung lũng Chết", nơi đây vẫn có những loài cá nhỏ và thực vật thích nghi đặc biệt sinh sống.',
        isCorrect: true,
        explanation: 'Loài cá Pupfish (cá sóc sa mạc) sống sót kì diệu trong các vũng nước mặn ấm nóng ở Thung lũng Chết.',
      },
    ],
    funFact:
      'Nhiệt độ mặt đất vào mùa hè ở Thung lũng Chết có thể đạt tới 93,9°C - nóng đến mức bạn có thể rán chín một quả trứng gà ngay trên nền đá!',
  },
  {
    id: 'disc-tf-07',
    topicId: 'song-ngam-duoi-bien',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Dãy núi dài nhất Trái Đất chìm dưới đáy đại dương!',
    illustrationEmoji: '⛰️',
    contextTitle: 'Tư liệu địa chất: Sống núi giữa đại dương (Mid-Ocean Ridge)',
    contextText:
      'Khi được hỏi về dãy núi dài nhất thế giới, nhiều người thường nghĩ ngay đến dãy Andes ở Nam Mỹ (dài khoảng 7.000km). Tuy nhiên, dãy núi dài nhất hành tinh trên thực tế lại nằm hoàn toàn dưới lòng các đại dương: đó là hệ thống "Sống núi giữa đại dương" với tổng chiều dài lên tới hơn 65.000 km, chạy vòng quanh Trái Đất tựa như đường chỉ khâu trên quả bóng chày! Đây là ranh giới phân kì khổng lồ nơi các mảng kiến tạo đáy biển tách rời nhau ra, cho phép magma từ lớp manti liên tục trào lên nguội đi tạo thành vỏ đại dương mới.',
    statements: [
      {
        id: 'a',
        text: 'Hệ thống sống núi giữa đại dương dài gấp nhiều lần dãy núi Andes trên đất liền.',
        isCorrect: true,
        explanation: 'Hệ thống sống núi ngầm dài tới 65.000km, trong khi dãy Andes dài 7.000km.',
      },
      {
        id: 'b',
        text: 'Sống núi giữa đại dương là nơi sinh ra vỏ Trái Đất mới từ các dòng magma phun trào.',
        isCorrect: true,
        explanation: 'Đây là ranh giới tách giãn (phân kì), dung nham nguội đi tạo thành đáy biển mới.',
      },
      {
        id: 'c',
        text: 'Toàn bộ dãy núi ngầm này vĩnh viễn không có một ngọn núi nào nhô lên khỏi mặt nước biển.',
        isCorrect: false,
        explanation: 'Đảo quốc Iceland chính là một phần nhô lên khỏi mặt nước biển của sống núi ngầm giữa Đại Tây Dương!',
      },
      {
        id: 'd',
        text: 'Tại các sống núi ngầm có các miệng phun thủy nhiệt (ống khói đen) nuôi dưỡng hệ sinh thái sinh vật kì thú không cần ánh sáng Mặt Trời.',
        isCorrect: true,
        explanation: 'Các vi khuẩn hóa tổng hợp lấy năng lượng từ khoáng chất miệng phun nước nóng nuôi dưỡng giun ống khổng lồ và cua mù đáy biển.',
      },
    ],
    funFact:
      'Tại thung lũng Thingvellir ở Iceland, bạn có thể lặn xuống khe nứt Silfra và chạm hai tay vào hai mảng lục địa cùng lúc: một tay chạm mảng Bắc Mỹ, tay kia chạm mảng Á - Âu!',
  },
  {
    id: 'disc-tf-08',
    topicId: 'luc-dia-nam-cuc',
    lessonId: 'kham-pha',
    type: 'true_false_context',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Châu Nam Cực: Lục địa cao nhất, gió mạnh nhất và chứa 70% nước ngọt!',
    illustrationEmoji: '❄️',
    contextTitle: 'Tư liệu địa lí: Châu Nam Cực - Vùng đất tận cùng của Trái Đất',
    contextText:
      'Châu Nam Cực là lục địa lạnh nhất, gió mạnh nhất và có độ cao trung bình lớn nhất trên thế giới (khoảng 2.300m so với mực nước biển, do lớp băng khổng lồ dày trung bình gần 2.000m bao phủ). Khiên băng Nam Cực nắm giữ tới 90% lượng băng tuyết của toàn bộ Trái Đất và chứa khoảng 70% tổng trữ lượng nước ngọt của nhân loại. Không thuộc chủ quyền của bất kì quốc gia nào, Nam Cực là lục địa hòa bình được bảo vệ bởi Hiệp ước Nam Cực năm 1959, chỉ dành riêng cho nghiên cứu khoa học và bảo vệ môi trường.',
    statements: [
      {
        id: 'a',
        text: 'Châu Nam Cực chứa phần lớn lượng nước ngọt của toàn bộ nhân loại.',
        isCorrect: true,
        explanation: 'Khoảng 70% nước ngọt trên Trái Đất đang bị đóng băng tại khiên băng Nam Cực.',
      },
      {
        id: 'b',
        text: 'Châu Nam Cực có nhiều thành phố đông dân và hệ thống đường sắt kết nối các thủ đô.',
        isCorrect: false,
        explanation: 'Nam Cực không có cư dân bản địa sinh sống thường trú, chỉ có các nhà khoa học tại các trạm nghiên cứu theo mùa.',
      },
      {
        id: 'c',
        text: 'Lục địa Nam Cực có độ cao trung bình cao nhất trong tất cả các châu lục nhờ lớp băng dày.',
        isCorrect: true,
        explanation: 'Độ cao trung bình của Nam Cực là 2.300m, cao hơn bất kì châu lục nào khác.',
      },
      {
        id: 'd',
        text: 'Tại Nam Cực có những hồ nước ngầm dạng lỏng nằm sâu hàng ngàn mét bên dưới lớp băng tuyết.',
        isCorrect: true,
        explanation: 'Hồ Vostok là hồ ngầm khổng lồ nằm sâu gần 4.000m dưới mặt băng Nam Cực, bị cô lập với thế giới bên ngoài hàng triệu năm.',
      },
    ],
    funFact:
      'Gió ở Nam Cực có thể đạt tốc độ hơn 320 km/h (mạnh hơn cả bão cấp cuồng phong cấp 17), có thể cuốn bay cả những chiếc lều thám hiểm chuyên dụng!',
  },
];

// ============================================================================
// DẠNG 3: TRẢ LỜI NGẮN / THỬ TÀI ĐOÁN SỐ ĐỊA LÍ THÚ VỊ (TỰ ĐỘNG CHẤM DUNG SAI)
// ============================================================================
export const DISCOVERY_SHORT_ANSWER: ShortAnswerQuestion[] = [
  {
    id: 'disc-sa-01',
    topicId: 'ki-luc-trai-dat',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Em thử đoán xem: Trái Đất mất bao nhiêu phút để tự quay được đúng 1 độ?',
    illustrationEmoji: '⏱️',
    question:
      'Trái Đất là một khối hình cầu có 360 độ kinh tuyến và mất khoảng 24 giờ (1.440 phút) để hoàn thành một vòng tự quay quanh trục. Em hãy tính xem: Trái Đất mất khoảng bao nhiêu phút để tự quay được 1 độ kinh tuyến?',
    unit: 'phút',
    guide: 'Lấy 1.440 phút chia cho 360 độ.',
    formula: 'Thời gian = 1440 phút / 360 độ',
    numericValue: 4,
    tolerance: 0.1,
    acceptedAnswers: ['4', '4 phút', '4 min', 'bốn phút'],
    standardAnswer: '4',
    explanation:
      'Mỗi giờ (60 phút) Trái Đất tự quay được 15 độ kinh tuyến (360° / 24h). Do đó, để quay được 1 độ kinh tuyến, Trái Đất cần đúng: 60 phút / 15 = 4 phút!',
    funFact:
      'Quy tắc 4 phút/độ này là cơ sở để các nhà hàng hải cổ đại ngày xưa xác định vị trí kinh độ của tàu bè trên biển bằng cách so sánh đồng hồ cơ học với Mặt Trời!',
  },
  {
    id: 'disc-sa-02',
    topicId: 'ki-luc-dia-li',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Nóc nhà của thế giới cao bao nhiêu mét?',
    illustrationEmoji: '🏔️',
    question:
      'Đỉnh Everest (được người Tây Tạng gọi là Chomolungma - Thánh mẫu của vũ trụ) là đỉnh núi cao nhất hành tinh so với mực nước biển. Em hãy cho biết độ cao chuẩn mực của đỉnh núi này là bao nhiêu mét?',
    unit: 'mét',
    guide: 'Độ cao đỉnh Everest theo đo đạc chính thức của Nepal và Trung Quốc.',
    numericValue: 8848.86,
    tolerance: 2,
    acceptedAnswers: ['8848', '8849', '8848.86', '8848,86', '8850'],
    standardAnswer: '8848.86',
    explanation:
      'Độ cao chính thức mới nhất được hai chính phủ Nepal và Trung Quốc công bố năm 2020 sau đợt đo đạc vệ tinh chính xác là 8.848,86 mét.',
    funFact:
      'Do mảng kiến tạo Ấn Độ tiếp tục va chạm và đội mảng Á - Âu lên, dãy Himalaya và đỉnh Everest vẫn đang tiếp tục cao thêm khoảng 4 mm mỗi năm!',
  },
  {
    id: 'disc-sa-03',
    topicId: 'dai-duong-xanh',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Bao nhiêu phần trăm Trái Đất được đại dương bao phủ?',
    illustrationEmoji: '🌐',
    question:
      'Nhìn từ không gian, Trái Đất là một "Hành tinh Xanh" tuyệt đẹp vì phần lớn bề mặt được bao phủ bởi nước. Em hãy cho biết các đại dương và biển chiếm khoảng bao nhiêu phần trăm (%) diện tích bề mặt Trái Đất?',
    unit: '%',
    guide: 'Nhập tỉ lệ phần trăm làm tròn (khoảng 70% đến 71%).',
    numericValue: 71,
    tolerance: 1.5,
    acceptedAnswers: ['71', '70.8', '70,8', '70', '71%'],
    standardAnswer: '71',
    explanation:
      'Đại dương và biển bao phủ xấp xỉ 70,8% (thường làm tròn là 71%) tổng diện tích bề mặt Trái Đất (~361 triệu km² trong tổng số 510 triệu km²). Đất liền chỉ chiếm khoảng 29%.',
    funFact:
      'Dù đại dương chiếm tới 71% diện tích bề mặt, con người mới chỉ khám phá và vẽ bản đồ chi tiết được khoảng hơn 20% đáy biển đại dương, ít hơn cả bản đồ bề mặt sao Hỏa!',
  },
  {
    id: 'disc-sa-04',
    topicId: 'nhiet-do-ki-luc',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Nhiệt độ tự nhiên lạnh nhất từng được đo trên Trái Đất?',
    illustrationEmoji: '❄️',
    question:
      'Tại trạm nghiên cứu Vostok ở vùng nội địa băng giá của Nam Cực, con người đã đo được kỉ lục nhiệt độ tự nhiên thấp nhất trong lịch sử hành tinh là âm bao nhiêu độ C (-89.2°C)? Em hãy nhập con số nhiệt độ âm này (làm tròn số nguyên hoặc một chữ số thập phân).',
    unit: '°C',
    guide: 'Nhập số nhiệt độ âm (ví dụ: -89.2 hoặc -89).',
    numericValue: -89.2,
    tolerance: 1,
    acceptedAnswers: ['-89.2', '-89,2', '-89', '89.2', '89'],
    standardAnswer: '-89.2',
    explanation:
      'Ngày 21/7/1983, tại trạm nghiên cứu Vostok của Liên Xô ở Nam Cực, nhiệt kế đã ghi nhận mức nhiệt kỉ lục: -89,2°C. Ở nhiệt độ này, hơi thở con người đóng băng tức thì và xăng dầu biến thành chất sệt như thạch.',
    funFact:
      'Dù Nam Cực lạnh thấu xương và phủ kín băng tuyết dày trung bình 2 km, nơi đây lại được các nhà địa lí xếp vào nhóm "hoang mạc" lớn nhất thế giới vì lượng mưa và tuyết rơi cực kì ít ỏi do không khí quá lạnh.',
  },
  {
    id: 'disc-sa-05',
    topicId: 'dan-so-the-gioi',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Cột mốc dân số hành tinh của chúng ta!',
    illustrationEmoji: '👥',
    question:
      'Vào ngày 15 tháng 11 năm 2022, Liên Hợp Quốc đã chính thức tuyên bố dân số Trái Đất đã chính thức chạm mốc bao nhiêu tỉ người?',
    unit: 'tỉ người',
    guide: 'Nhập con số nguyên biểu thị số tỉ người.',
    numericValue: 8,
    tolerance: 0.1,
    acceptedAnswers: ['8', '8 tỉ', '8 ty', 'tam'],
    standardAnswer: '8',
    explanation:
      'Liên Hợp Quốc ghi nhận ngày 15/11/2022 là "Ngày 8 tỉ người", đánh dấu một cột mốc lịch sử trong quá trình phát triển dân số nhân loại.',
    funFact:
      'Chỉ mất khoảng 12 năm để dân số thế giới tăng từ 7 tỉ lên 8 tỉ người, trong khi nhân loại phải mất hàng trăm ngàn năm kể từ khi xuất hiện đến năm 1804 mới chạm mốc 1 tỉ người đầu tiên!',
  },
  {
    id: 'disc-sa-06',
    topicId: 'goc-nghieng-trai-dat',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Góc nghiêng tạo ra 4 mùa xuân, hạ, thu, đông!',
    illustrationEmoji: '📐',
    question:
      'Em có biết: Trục Trái Đất không đứng thẳng mà luôn nghiêng so với mặt phẳng quỹ đạo một góc không đổi là 66°33\', tức là nghiêng so với phương thẳng đứng một góc bao nhiêu độ (khoảng 23,5 độ)? Góc nghiêng này chính là nguyên nhân sinh ra bốn mùa xuân - hạ - thu - đông!',
    unit: 'độ',
    guide: 'Nhập số góc nghiêng (ví dụ: 23.5).',
    numericValue: 23.5,
    tolerance: 0.2,
    acceptedAnswers: ['23.5', '23,5', '23°30', '23.45'],
    standardAnswer: '23.5',
    explanation:
      'Góc nghiêng của trục Trái Đất so với pháp tuyến mặt phẳng hoàng đạo là 23°27\' (xấp xỉ 23,5°). Vì trục luôn giữ nguyên góc nghiêng và hướng khi chuyển động quanh Mặt Trời nên hai bán cầu luân phiên chúc về phía Mặt Trời sinh ra các mùa.',
    funFact:
      'Nếu trục Trái Đất đứng thẳng 0 độ (vuông góc với quỹ đạo), Trái Đất sẽ hoàn toàn không có bốn mùa: xích đạo sẽ luôn nóng bất tận và hai cực sẽ vĩnh viễn chìm trong mùa đông giá lạnh!',
  },
  {
    id: 'disc-sa-07',
    topicId: 'quoc-gia-nho-nhat',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Quốc gia có diện tích nhỏ nhất hành tinh!',
    illustrationEmoji: '🇻🇦',
    question:
      'Em thử đoán xem: Quốc gia độc lập có diện tích nhỏ nhất thế giới (chỉ vỏn vẹn khoảng 0,44 km² và dân số dưới 1.000 người), nằm trọn vẹn bên trong lòng thủ đô Rome của nước Ý, có tên là gì?',
    unit: 'quốc gia',
    guide: 'Nhập tên quốc gia (Vatican).',
    numericValue: 0.44,
    tolerance: 0.1,
    acceptedAnswers: ['vatican', 'thanh vatican', 'toa thanh vatican', 'toa thanh', 'nha nuoc vatican'],
    standardAnswer: 'Vatican',
    explanation:
      'Thành Vatican là quốc gia có diện tích và dân số nhỏ nhất thế giới, được bao bọc hoàn toàn bởi thành phố Rome. Dù tí hon, Vatican có lực lượng bưu chính, cờ, đài phát thanh và đội cảnh vệ Thụy Sĩ riêng biệt!',
    funFact:
      'Toàn bộ chu vi đường biên giới bao quanh quốc gia Vatican chỉ dài vẻn vẹn khoảng 3,2 km; bạn có thể đi bộ thong thả một vòng quanh toàn bộ đất nước này trong chưa đầy 45 phút!',
  },
  {
    id: 'disc-sa-08',
    topicId: 'dan-so-bac-ban-cau',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Bao nhiêu phần trăm loài người sống ở Bắc Bán cầu?',
    illustrationEmoji: '🌏',
    question:
      'Em có biết: Do phần lớn các khối lục địa rộng lớn (châu Á, châu Âu, Bắc Mỹ, phần lớn châu Phi) đều nằm ở phía bắc xích đạo, nên có khoảng bao nhiêu phần trăm (%) dân số thế giới đang sinh sống ở Bắc Bán cầu (gần 90%)? Em hãy nhập tỉ lệ phần trăm làm tròn số nguyên.',
    unit: '%',
    guide: 'Nhập con số tỉ lệ phần trăm làm tròn (ví dụ: 90 hoặc 88).',
    numericValue: 90,
    tolerance: 3,
    acceptedAnswers: ['90', '90%', '88', '89', '87'],
    standardAnswer: '90',
    explanation:
      'Khoảng 87 - 90% dân số nhân loại cư trú ở Bắc Bán cầu. Nam Bán cầu chủ yếu là các đại dương mênh mông chiếm tới hơn 80% diện tích bề mặt nửa cầu nam!',
    funFact:
      'Chỉ có khoảng 10 - 12% dân số thế giới sống ở Nam Bán cầu (chủ yếu tại Nam Mỹ, phần nam châu Phi, Australia và New Zealand).',
  },
  {
    id: 'disc-sa-09',
    topicId: 'chieu-dai-kenh-suez',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Chiều dài của kênh đào Suez nối hai bờ lục địa?',
    illustrationEmoji: '⚓',
    question:
      'Kênh đào Suez dài khoảng bao nhiêu kilomet (khoảng 193 km) xuyên qua eo đất Ai Cập nối Địa Trung Hải với Biển Đỏ? Em hãy nhập con số chiều dài này (làm tròn số nguyên hàng đơn vị).',
    unit: 'km',
    guide: 'Nhập số chiều dài (khoảng 193 km).',
    numericValue: 193,
    tolerance: 5,
    acceptedAnswers: ['193', '193.3', '193 km', '190', '194'],
    standardAnswer: '193',
    explanation:
      'Kênh đào Suez có chiều dài chính thức là 193,3 km. Kênh không cần âu thuyền nâng hạ vì mực nước giữa Địa Trung Hải và Biển Đỏ gần như ngang bằng nhau!',
    funFact:
      'Kênh Suez được đào ròng rã suốt 10 năm (1859 - 1869) với hơn 1,5 triệu nhân công tham gia, là một trong những công trình xây dựng vĩ đại nhất thế kỉ 19.',
  },
  {
    id: 'disc-sa-10',
    topicId: 'nuoc-ngot-baikal',
    lessonId: 'kham-pha',
    type: 'short_answer',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Bao nhiêu phần trăm nước ngọt không đóng băng ở hồ Baikal?',
    illustrationEmoji: '💧',
    question:
      'Hồ Baikal cổ xưa của vùng Siberia (Nga) chứa khoảng bao nhiêu phần trăm (%) tổng trữ lượng nước ngọt mặt đất không đóng băng của toàn Trái Đất? Em hãy nhập con số phần trăm nguyên (20%).',
    unit: '%',
    guide: 'Nhập con số tỉ lệ phần trăm (20%).',
    numericValue: 20,
    tolerance: 2,
    acceptedAnswers: ['20', '20%', '22', '23'],
    standardAnswer: '20',
    explanation:
      'Hồ Baikal chiếm khoảng 20 - 22% tổng lượng nước ngọt bề mặt không đóng băng của thế giới nhờ độ sâu kỉ lục 1.642m và đáy hồ rộng lớn.',
    funFact:
      'Có tới hơn 80% loài động thực vật sinh sống trong hồ Baikal là loài đặc hữu, không thể tìm thấy ở bất kì nơi nào khác trên Trái Đất!',
  },
];

// ============================================================================
// DẠNG 4: NỐI CỘT GHÉP ĐÔI HIỆN TƯỢNG VÀ BÍ MẬT ĐỊA LÍ KÌ THÚ
// ============================================================================
export const DISCOVERY_MATCHING: MatchingQuestion[] = [
  {
    id: 'disc-ma-01',
    topicId: 'hien-tuong-va-nguyen-nhan',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Giải mã những hiện tượng kì thú trên bầu trời & đại dương!',
    illustrationEmoji: '✨',
    title: 'Nối các hiện tượng tự nhiên kì thú với nguyên nhân thực tế sinh ra chúng',
    columnATitle: 'Hiện tượng tự nhiên kì thú',
    columnBTitle: 'Nguyên nhân thực tế',
    pairs: [
      {
        id: 'p1',
        left: 'Cực quang rực rỡ phát sáng ở vùng cực',
        right: 'Hạt mang điện từ gió Mặt Trời tương tác với từ trường khí quyển Trái Đất',
        reason: 'Khi các hạt bão từ Mặt Trời va chạm với phân tử khí nitơ và oxy ở tầng cao khí quyển gần hai cực từ sẽ kích thích chúng phát ra các dải ánh sáng kì ảo tuyệt đẹp.',
      },
      {
        id: 'p2',
        left: 'Thủy triều nước dâng lên - rút xuống mỗi ngày',
        right: 'Lực hấp dẫn của Mặt Trăng và Mặt Trời tác động lên lớp nước đại dương',
        reason: 'Mặt Trăng ở gần Trái Đất nên lực hút trọng trường của nó kéo lớp nước biển phình lên về phía đối diện, tạo nên chu kì triều dâng và triều rút đều đặn.',
      },
      {
        id: 'p3',
        left: 'Hoàng hôn và bình minh có bầu trời màu đỏ rực',
        right: 'Ánh sáng đỏ có bước sóng dài ít bị tán xạ khi đi qua tầng khí quyển dày',
        reason: 'Lúc Mặt Trời ở thấp sát đường chân trời, tia sáng phải xuyên qua quãng đường khí quyển dày nhất. Ánh sáng xanh bị tán xạ hết, chỉ còn tia đỏ bước sóng dài chiếu tới mắt ta.',
      },
      {
        id: 'p4',
        left: 'Cát sa mạc thổi sang nuôi rừng Amazon',
        right: 'Gió Tín phong vượt Đại Tây Dương mang theo bụi giàu phốt-pho',
        reason: 'Gió mậu dịch thổi từ Đông sang Tây mang hàng triệu tấn bụi khoáng từ lòng hồ cạn Sahara vượt 5.000km đại dương sang bón phân tự nhiên cho đất rừng Amazon.',
      },
    ],
    explanation:
      'Các hiện tượng tự nhiên tưởng như huyền bí đều bắt nguồn từ những định luật vật lí và tương tác địa lí kì vĩ giữa Trái Đất, Mặt Trời và vũ trụ.',
    funFact:
      'Ở sao Mộc và sao Thổ, các nhà khoa học cũng quan sát thấy cực quang khổng lồ mạnh gấp hàng trăm lần cực quang ở Trái Đất nhờ từ trường siêu mạnh của các hành tinh khí này!',
  },
  {
    id: 'disc-ma-02',
    topicId: 'ki-luc-dia-li-the-gioi',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Ai là quán quân của các danh hiệu địa lí trên Trái Đất?',
    illustrationEmoji: '🏆',
    title: 'Nối các địa danh nổi tiếng với danh hiệu "Kỉ lục Trái Đất" xứng đáng',
    columnATitle: 'Địa danh nổi tiếng',
    columnBTitle: 'Kỉ lục địa lí thế giới',
    pairs: [
      {
        id: 'p1',
        left: 'Sa mạc Atacama (Chile)',
        right: 'Hoang mạc khô cằn nhất thế giới (có nơi hàng thế kỉ không có mưa)',
        reason: 'Nằm kẹp giữa dãy núi Andes cao chắn gió ẩm phía đông và dòng biển lạnh Humboldt phía tây khiến hơi nước tuyệt đối không thể ngưng tụ thành mưa.',
      },
      {
        id: 'p2',
        left: 'Đảo Greenland (Bắc Mỹ/Đan Mạch)',
        right: 'Hòn đảo có diện tích lớn nhất hành tinh (không tính lục địa)',
        reason: 'Với diện tích hơn 2,16 triệu km², Greenland là hòn đảo lớn nhất thế giới, được bao phủ bởi khiên băng khổng lồ và không được xếp vào nhóm lục địa.',
      },
      {
        id: 'p3',
        left: 'Thác Angel (Venezuela)',
        right: 'Thác nước rơi tự do cao nhất thế giới (độ cao gần 979 mét)',
        reason: 'Dòng nước rơi thẳng đứng từ vách núi đá sa thạch Auyán-tepui với độ cao kỉ lục 979m, nước biến thành bụi sương mù trước khi chạm tới mặt đất bên dưới.',
      },
      {
        id: 'p4',
        left: 'Hồ Baikal (Nga)',
        right: 'Hồ nước ngọt sâu nhất và cổ xưa nhất trên Trái Đất',
        reason: 'Hình thành do đứt gãy rạn nứt kiến tạo từ 25 triệu năm trước, độ sâu đạt 1.642m và chứa tới 20% lượng nước ngọt bề mặt không đóng băng của thế giới.',
      },
    ],
    explanation:
      'Mỗi kì quan địa lí đều là minh chứng sống động cho sức mạnh điêu khắc vĩ đại của tự nhiên qua hàng triệu năm kiến tạo.',
    funFact:
      'Do sa mạc Atacama khô cằn đến mức hầu như không có sinh vật nào sống sót và cảnh quan giống hệt sao Hỏa, NASA đã dùng nơi đây làm bãi thử nghiệm cho các robot thám hiểm sao Hỏa (Mars Rover)!',
  },
  {
    id: 'disc-ma-03',
    topicId: 'hai-trinh-chien-luoc',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Những nút thắt hàng hải làm thay đổi cả nền kinh tế thế giới!',
    illustrationEmoji: '🗺️',
    title: 'Nối các eo biển / kênh đào chiến lược với 2 vùng biển/đại dương được kết nối',
    columnATitle: 'Kênh đào / Eo biển chiến lược',
    columnBTitle: 'Vùng biển kết nối',
    pairs: [
      {
        id: 'p1',
        left: 'Kênh đào Suez',
        right: 'Nối biển Địa Trung Hải với Biển Đỏ (rút ngắn đường sang Ấn Độ Dương)',
        reason: 'Cắt ngang qua eo đất Suez ở Ai Cập, nối thông biển Địa Trung Hải (châu Âu) với Biển Đỏ để đi thẳng ra Ấn Độ Dương (châu Á) mà không phải vòng qua châu Phi.',
      },
      {
        id: 'p2',
        left: 'Kênh đào Panama',
        right: 'Nối Đại Tây Dương với Thái Bình Dương qua eo đất Trung Mỹ',
        reason: 'Cắt xuyên qua eo đất Panama hẹp ở Trung Mỹ, giúp tàu thuyền rút ngắn hơn 13.000 km hành trình thay vì phải đi vòng qua Mũi Horn bão táp ở Nam Cực.',
      },
      {
        id: 'p3',
        left: 'Eo biển Malacca',
        right: 'Nối Ấn Độ Dương với Biển Đông (tuyến đường biển nhộn nhịp bậc nhất)',
        reason: 'Nằm giữa bán đảo Mã Lai và đảo Sumatra của Indonesia, là yết hầu hàng hải kết nối Ấn Độ Dương với Biển Đông và Thái Bình Dương.',
      },
      {
        id: 'p4',
        left: 'Eo biển Bering',
        right: 'Nối Thái Bình Dương với Bắc Băng Dương (ngăn cách châu Á và Bắc Mỹ)',
        reason: 'Eo biển hẹp nằm giữa mũi Dezhnev của Nga và mũi Prince of Wales của Alaska, là cửa ngõ tự nhiên nối Thái Bình Dương với Bắc Băng Dương.',
      },
    ],
    explanation:
      'Các tuyến kênh đào và eo biển đóng vai trò yết hầu sống còn đối với thương mại hàng hải quốc tế, giúp tiết kiệm hàng ngàn kilômét đường biển cho các đội tàu buôn.',
    funFact:
      'Kênh đào Panama không dùng mặt nước bằng phẳng thông thường mà sử dụng hệ thống âu thuyền (lock) bơm nước nâng tàu thuyền lên cao 26 mét vượt qua hồ nhân tạo Gatun rồi hạ dần xuống đại dương ở phía bên kia!',
  },
  {
    id: 'disc-ma-04',
    topicId: 'cong-cu-dia-li',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Những phát minh giúp con người làm chủ không gian Trái Đất!',
    illustrationEmoji: '🛰️',
    title: 'Nối các phát minh, công cụ địa lí với ứng dụng kì diệu trong đời sống',
    columnATitle: 'Công cụ / Công nghệ địa lí',
    columnBTitle: 'Ứng dụng kì diệu',
    pairs: [
      {
        id: 'p1',
        left: 'Hệ thống định vị vệ tinh (GPS)',
        right: 'Dẫn đường ô tô, tìm vị trí trên bản đồ điện thoại thông minh theo thời gian thực',
        reason: 'Sử dụng chùm hơn 30 vệ tinh nhân tạo trên quỹ đạo để tính toán tọa độ ba chiều chính xác đến từng mét cho thiết bị di động của con người.',
      },
      {
        id: 'p2',
        left: 'Ảnh viễn thám chụp từ vệ tinh',
        right: 'Theo dõi đường đi của bão, cháy rừng và sự thu hẹp của các chỏm băng',
        reason: 'Cảm biến quang học và hồng ngoại từ vũ trụ chụp toàn cảnh mặt đất liên tục giúp dự báo thiên tai bão lũ, hạn hán và giám sát biến đổi khí hậu.',
      },
      {
        id: 'p3',
        left: 'Quả địa cầu mô hình thu nhỏ',
        right: 'Mô phỏng chân thực hình dạng mặt cầu không bị méo mó của Trái Đất',
        reason: 'Quả địa cầu là công cụ 3D duy nhất bảo toàn trọn vẹn tỉ lệ diện tích, hình dạng và khoảng cách giữa các lục địa mà không bị biến dạng như bản đồ phẳng.',
      },
      {
        id: 'p4',
        left: 'La bàn từ tính cổ truyền',
        right: 'Chỉ hướng Bắc - Nam dựa vào từ trường tự nhiên của lõi Trái Đất',
        reason: 'Kim nam châm tự do luôn bắt theo các đường sức từ của địa từ trường sinh ra từ lõi Trái Đất, chỉ chính xác hướng trục từ Bắc - Nam.',
      },
    ],
    explanation:
      'Nhờ sự kết hợp giữa tri thức địa lí truyền thống và công nghệ vũ trụ hiện đại, con người ngày nay có thể định vị chính xác vị trí của mình đến từng mét chỉ trong tích tắc.',
    funFact:
      'Để hệ thống GPS dẫn đường cho điện thoại của bạn hoạt động chính xác, các kĩ sư phải áp dụng cả Thuyết Tương đối của Einstein để điều chỉnh thời gian của đồng hồ nguyên tử trên vệ tinh đang bay nhanh trên quỹ đạo!',
  },
  {
    id: 'disc-ma-05',
    topicId: 'thoi-tiet-ki-la',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Giải mã những hiện tượng thời tiết kì lạ bậc nhất!',
    illustrationEmoji: '⚡',
    title: 'Nối hiện tượng thời tiết kì lạ với cách giải thích khoa học',
    columnATitle: 'Hiện tượng thời tiết kì lạ',
    columnBTitle: 'Giải thích khoa học',
    pairs: [
      {
        id: 'p1',
        left: 'Cơn mưa cá / mưa ếch từ trên trời rơi xuống',
        right: 'Lốc xoáy vòi rồng hút nước và sinh vật từ đầm lầy lên cao rồi trút xuống nơi khác',
        reason: 'Vòi rồng xoáy qua mặt nước hồ hoặc đầm lầy có lực hút cực mạnh cuốn theo sinh vật lên tầng mây rồi gió đưa đi xa hàng chục kilômét trước khi rơi xuống.',
      },
      {
        id: 'p2',
        left: 'Cầu vồng đôi xuất hiện trên bầu trời',
        right: 'Tia sáng Mặt Trời bị phản xạ hai lần bên trong các giọt nước mưa',
        reason: 'Vòng cầu vồng chính phản xạ 1 lần trong giọt nước, còn vòng cầu vồng phụ phản xạ 2 lần nên mờ hơn và có thứ tự dải màu bị đảo ngược lại.',
      },
      {
        id: 'p3',
        left: 'Ảo ảnh tàu ma bay lơ lửng trên biển (Fata Morgana)',
        right: 'Sự bẻ cong ánh sáng qua các lớp không khí có nhiệt độ và mật độ chênh lệch mạnh',
        reason: 'Lớp không khí lạnh sát mặt biển nằm dưới lớp không khí ấm bên trên hoạt động như một thấu kính khúc xạ bẻ cong tia sáng làm hình ảnh nhô bổng lên nền trời.',
      },
      {
        id: 'p4',
        left: 'Sét Catatumbo đánh liên tục 160 đêm/năm ở Venezuela',
        right: 'Địa hình lòng chảo hồ giữ khí mê-tan kết hợp với gió núi thổi hội tụ tạo điện trường',
        reason: 'Hồ Maracaibo được bao bọc bởi các dãy núi cao, gió mát từ núi đụng phải không khí ẩm nóng trên hồ liên tục tích điện tạo ra các cơn dông sét triền miên.',
      },
    ],
    explanation:
      'Những hiện tượng tưởng chừng hoang đường trong thần thoại thực chất đều là sự kết hợp kì thú giữa khí quyển, địa hình và quang học tự nhiên.',
    funFact:
      'Hiện tượng sét Catatumbo ở hồ Maracaibo đánh tới 280 lần mỗi giờ, sáng đến mức các thủy thủ cổ xưa từng dùng nó như một ngọn hải đăng tự nhiên để dẫn đường!',
  },
  {
    id: 'disc-ma-06',
    topicId: 'cong-trinh-vuot-bien',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'nhan_biet',
    curiosityHook: 'Những công trình vượt biển nối liền các vùng đất!',
    illustrationEmoji: '🌉',
    title: 'Nối công trình vượt biển kì vĩ với vùng đất / quốc gia được kết nối',
    columnATitle: 'Công trình vượt biển kì vĩ',
    columnBTitle: 'Vùng đất được kết nối',
    pairs: [
      {
        id: 'p1',
        left: 'Đường hầm Eo biển Manche (Channel Tunnel)',
        right: 'Nối liền nước Anh với lục địa châu Âu (Pháp) dưới đáy biển sâu',
        reason: 'Tuyến đường hầm đường sắt ngầm dài 50,45 km chạy bên dưới đáy biển eo biển Manche, kết nối hệ thống giao thông giữa đảo Anh và Pháp.',
      },
      {
        id: 'p2',
        left: 'Cầu vượt biển Bosphorus (Istanbul)',
        right: 'Nối liền hai lục địa châu Âu và châu Á trên cùng một thành phố',
        reason: 'Bắc qua eo biển Bosphorus ở thành phố Istanbul (Thổ Nhĩ Kỳ), nối liền bờ lục địa châu Âu với bờ lục địa châu Á.',
      },
      {
        id: 'p3',
        left: 'Cầu Hồng Kông - Chu Hải - Ma Cao',
        right: 'Cầu vượt biển dài nhất thế giới nối 3 đô thị lớn vùng cửa sông Châu Giang',
        reason: 'Hệ thống cầu và hầm ngầm vượt biển dài 55 km bắc qua cửa sông Châu Giang, liên kết đặc khu Hồng Kông, thành phố Chu Hải và Ma Cao.',
      },
      {
        id: 'p4',
        left: 'Cầu Cổng Vàng (Golden Gate Bridge)',
        right: 'Bắc qua eo biển nối vịnh San Francisco với Thái Bình Dương',
        reason: 'Cây cầu treo biểu tượng màu đỏ cam nổi tiếng bắc qua eo biển Golden Gate rộng hơn 1,6 km tại bờ tây nước Mỹ.',
      },
    ],
    explanation:
      'Kĩ thuật xây dựng hiện đại đã giúp con người chinh phục các rào cản biển sâu, biến những eo biển chia cắt thành nhịp cầu giao thương sầm uất.',
    funFact:
      'Đường hầm eo biển Manche dài 50,45 km, trong đó có đoạn chạy ngầm dưới đáy biển dài tới 37,9 km - kỉ lục đường hầm dưới đáy biển dài nhất hành tinh!',
  },
  {
    id: 'disc-ma-07',
    topicId: 'thu-do-dac-biet',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Những thủ đô mang câu chuyện địa lí độc nhất vô nhị!',
    illustrationEmoji: '🏛️',
    title: 'Nối tên thủ đô độc đáo với đặc trưng địa lí nổi bật của thành phố đó',
    columnATitle: 'Thủ đô độc đáo',
    columnBTitle: 'Đặc trưng địa lí nổi bật',
    pairs: [
      {
        id: 'p1',
        left: 'La Paz (Bolivia)',
        right: 'Thủ đô hành chính cao nhất thế giới (nằm ở độ cao trên 3.640 mét)',
        reason: 'Tọa lạc trong một thung lũng sâu trên cao nguyên Altiplano thuộc dãy núi Andes ở độ cao trung bình 3.640m so với mực nước biển.',
      },
      {
        id: 'p2',
        left: 'Reykjavik (Iceland)',
        right: 'Thủ đô của quốc gia có chủ quyền nằm gần cực Bắc nhất hành tinh (vĩ độ 64°B)',
        reason: 'Nằm ở vĩ độ 64°08\' Bắc ngay sát Vòng Cực Bắc, là thủ đô của một quốc gia có chủ quyền nằm xa nhất về phía bắc thế giới.',
      },
      {
        id: 'p3',
        left: 'Brasilia (Brazil)',
        right: 'Thủ đô quy hoạch nhân tạo nhìn từ trên cao có hình dáng một chiếc máy bay',
        reason: 'Được xây dựng mới hoàn toàn vào năm 1956 giữa vùng cao nguyên nội địa Brazil, bản vẽ quy hoạch nhìn từ không gian có hình cánh máy bay cất cánh.',
      },
      {
        id: 'p4',
        left: 'Canberra (Australia)',
        right: 'Thủ đô xây mới nằm giữa để hóa giải tranh chấp quyền lực giữa Sydney và Melbourne',
        reason: 'Để giải quyết sự cạnh tranh gay gắt giữa hai thành phố lớn nhất là Sydney và Melbourne, chính phủ Australia đã quyết định xây dựng thủ đô Canberra nằm ở khoảng giữa hai nơi này.',
      },
    ],
    explanation:
      'Vị trí và quy hoạch của các thủ đô trên thế giới luôn phản ánh sâu sắc điều kiện tự nhiên, địa chính trị và chiến lược phát triển của mỗi quốc gia.',
    funFact:
      'Ở thủ đô La Paz trên cao nguyên Andes, không khí loãng đến mức nước sôi ở nhiệt độ chỉ 88°C thay vì 100°C và các đội bóng đá nước ngoài đến thi đấu thường phải thở bình oxy!',
  },
  {
    id: 'disc-ma-08',
    topicId: 'nguon-goc-nong-san',
    lessonId: 'kham-pha',
    type: 'matching',
    cognitiveLevel: 'thong_hieu',
    curiosityHook: 'Cội nguồn địa lí của những món ăn thức uống quen thuộc!',
    illustrationEmoji: '☕',
    title: 'Nối các loại nông sản, đồ uống quen thuộc với vùng đất khởi nguồn địa lí của chúng',
    columnATitle: 'Nông sản / Đồ uống quen thuộc',
    columnBTitle: 'Cội nguồn địa lí nguyên thủy',
    pairs: [
      {
        id: 'p1',
        left: 'Cây cà phê',
        right: 'Khởi nguồn từ những cánh rừng cao nguyên ở Ethiopia (Đông Phi)',
        reason: 'Cây cà phê Arabica nguyên thủy mọc hoang dã tại vùng rừng rậm cao nguyên Kaffa của Ethiopia trước khi được người Ả Rập nhân giống và truyền bá khắp thế giới.',
      },
      {
        id: 'p2',
        left: 'Cây ca cao (nguyên liệu làm Chocolate)',
        right: 'Cây bản địa của lưu vực rừng mưa nhiệt đới Amazon và Trung Mỹ',
        reason: 'Ca cao là loài cây bản địa của rừng Amazon, được các nền văn minh Olmec và Maya thuần dưỡng để làm món đồ uống quý tộc từ hàng ngàn năm trước.',
      },
      {
        id: 'p3',
        left: 'Cây ngô (bắp) và khoai tây',
        right: 'Thuần dưỡng bởi các nền văn minh cổ đại Inca và Maya ở châu Mỹ',
        reason: 'Cây ngô bắt nguồn từ loài cỏ Teosinte ở Mexico, còn khoai tây được cư dân bản địa dãy Andes thuần dưỡng từ hơn 8.000 năm trước.',
      },
      {
        id: 'p4',
        left: 'Cây chè (trà)',
        right: 'Bắt nguồn từ vùng đồi núi cận nhiệt đới Tây Nam Trung Quốc và Đông Nam Á',
        reason: 'Khí hậu nhiệt ẩm và sương mù dày đặc vùng núi Tây Nam Trung Quốc và miền bắc Đông Nam Á là nơi sản sinh ra những cây chè hoang dã cổ thụ đầu tiên.',
      },
    ],
    explanation:
      'Cuộc đại trao đổi sinh học Columbian sau thế kỉ 15 đã đưa các giống cây trồng từ châu Mỹ lan tỏa khắp thế giới và ngược lại, định hình nên bữa ăn toàn cầu ngày nay.',
    funFact:
      'Trước khi Christopher Columbus đến châu Mỹ vào năm 1492, người Ý hoàn toàn chưa từng biết đến quả cà chua, người Ireland chưa từng có khoai tây, và châu Á chưa hề có quả ớt cay!',
  },
];

/**
 * Lấy danh sách 10 câu hỏi ngẫu nhiên cho hoạt động "EM CÓ BIẾT? – KHÁM PHÁ ĐỊA LÍ"
 * BẮT BUỘC ĐỦ CẢ 4 DẠNG THEO ĐÚNG THỨ TỰ:
 * - 4 câu Dạng 1: Trắc nghiệm khám phá (Multiple Choice)
 * - 2 câu Dạng 2: Đúng - Sai tư liệu kì thú (True/False Context)
 * - 2 câu Dạng 3: Trả lời ngắn / Thử tài đoán số (Short Answer)
 * - 2 câu Dạng 4: Nối cột ghép đôi (Matching)
 * Tổng cộng: Đúng 10 câu. Tuyệt đối không trùng lặp câu hỏi trong cùng một lượt.
 */
export function getWarmupDiscoveryQuestions(): Question[] {
  // Trộn mảng ngẫu nhiên (Fisher-Yates)
  const shuffle = <T>(arr: T[]): T[] => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const selectedMC = shuffle(DISCOVERY_MULTIPLE_CHOICE).slice(0, 4);
  const selectedTF = shuffle(DISCOVERY_TRUE_FALSE).slice(0, 2);
  const selectedSA = shuffle(DISCOVERY_SHORT_ANSWER).slice(0, 2);
  const selectedMatch = shuffle(DISCOVERY_MATCHING).slice(0, 2);

  // ĐẢM BẢO TUÂN THỦ NGHIÊM NGẶT THỨ TỰ: Dạng 1 -> Dạng 2 -> Dạng 3 -> Dạng 4
  return [
    ...selectedMC,
    ...selectedTF,
    ...selectedSA,
    ...selectedMatch,
  ];
}
