import type { Lesson } from '../types/index.ts';

export const LESSONS: Lesson[] = [
  {
    id: 'bai-1',
    number: 1,
    partId: 'phan-1',
    chapterId: undefined,
    topicId: 'phan-1',
    title: 'Bài 1. Môn Địa lí với định hướng nghề nghiệp',
    subtitle: 'Đặc điểm môn học, vai trò của tri thức địa lí và các nhóm ngành nghề định hướng tương lai',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Khái quát được đặc điểm môn Địa lí cấp THPT: môn học tích hợp sâu sắc giữa khoa học tự nhiên, khoa học xã hội và công nghệ địa không gian.',
      'Phân tích được vai trò to lớn của tri thức địa lí trong đời sống hàng ngày, định hướng hành vi bảo vệ môi trường và sử dụng hợp lí tài nguyên.',
      'Xác định được các nhóm ngành nghề có liên quan trực tiếp đến tri thức địa lí: quản lí tài nguyên, bản đồ số, GIS, quy hoạch không gian, du lịch sinh thái.',
      'Có ý thức tự giác vận dụng kiến thức bài học vào định hướng nghề nghiệp phù hợp với năng lực bản thân và nhu cầu phát triển của tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Đặc điểm và vị trí của môn Địa lí trong nhà trường',
        content: [
          'Môn Địa lí ở trường THPT có vị trí đặc thù: là môn học giao thoa giữa khoa học tự nhiên và khoa học xã hội. Địa lí vừa nghiên cứu các quy luật tự nhiên của vỏ Trái Đất (địa hình, khí quyển, thủy quyển, sinh quyển), vừa nghiên cứu không gian tổ chức kinh tế - xã hội của loài người (dân cư, đô thị, nông nghiệp, công nghiệp, dịch vụ).',
          'Chương trình Địa lí 10 (bộ sách Kết nối tri thức với cuộc sống) chú trọng phát triển phẩm chất và năng lực cho học sinh: năng lực nhận thức thế giới theo quan điểm không gian, năng lực giải thích các mối quan hệ nhân quả trong tự nhiên và xã hội, năng lực sử dụng công cụ địa lí hiện đại.',
          'Học Địa lí giúp hình thành nhân sinh quan đúng đắn, tinh thần tôn trọng sự đa dạng văn hóa và ý thức trách nhiệm trước các vấn đề toàn cầu như biến đổi khí hậu, cạn kiệt tài nguyên.'
        ],
        highlight: 'Địa lí là chiếc cầu nối giữa tự nhiên và xã hội, trang bị tư duy không gian tổng hợp và năng lực thích ứng linh hoạt với thời đại số.',
      },
      {
        sectionTitle: '2. Vai trò của tri thức Địa lí đối với đời sống thực tiễn',
        content: [
          'Thích ứng với điều kiện thời tiết, mùa vụ: Giúp con người nắm bắt quy luật khí hậu để bố trí cơ cấu cây trồng, mùa vụ thích hợp, chủ động phòng tránh các hiện tượng thời tiết cực đoan như lũ quét, sạt lở núi đá vôi, rét đậm rét hại và sương muối.',
          'Định hướng và di chuyển trong không gian: Cung cấp kĩ năng đọc bản đồ, la bàn, sử dụng thiết bị định vị GPS và ứng dụng bản đồ số trên điện thoại thông minh để tìm đường, đo khoảng cách và khảo sát địa bàn.',
          'Bảo vệ môi trường và phát triển bền vững: Nhận thức rõ giới hạn của tài nguyên thiên nhiên, từ đó hình thành lối sống văn minh, tiết kiệm nguồn nước ngọt, bảo vệ thảm thực vật rừng và tham gia giảm thiểu rác thải nhựa.'
        ],
      },
      {
        sectionTitle: '3. Định hướng nghề nghiệp tương lai liên quan đến Địa lí',
        content: [
          'Nhóm ngành tài nguyên và môi trường: Khí tượng thủy văn, địa chất khoáng sản, hải dương học, quản lí tài nguyên đất đai, bảo tồn thiên nhiên, trắc địa công trình.',
          'Nhóm ngành kinh tế, quy hoạch và quản lí: Quy hoạch đô thị và nông thôn, kinh tế phát triển, quản trị logistics, cán bộ địa chính xã/phường, trật tự xây dựng.',
          'Nhóm ngành công nghệ địa không gian: Kĩ thuật đo đạc bản đồ số, hệ thống thông tin địa lí (GIS), viễn thám vệ tinh (Remote Sensing), công nghệ định vị vệ tinh.',
          'Nhóm ngành du lịch và dịch vụ: Quản trị lữ hành, hướng dẫn viên du lịch, nghiên cứu văn hóa vùng miền, xuất nhập khẩu và xúc tiến thương mại quốc tế.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tri thức Địa lí',
        definition: 'Hệ thống hiểu biết về các quy luật tự nhiên, kinh tế - xã hội và mối quan hệ tương hỗ của các thành phần trong vỏ cảnh quan Trái Đất.'
      },
      {
        term: 'Hệ thống Thông tin Địa lí (GIS)',
        definition: 'Hệ thống máy tính thu thập, lưu trữ, kiểm tra, phân tích và hiển thị dữ liệu liên quan đến các vị trí trên bề mặt Trái Đất.'
      },
      {
        term: 'Quy hoạch không gian',
        definition: 'Phương pháp phân bố và tổ chức không gian hợp lí cho các hoạt động kinh tế, xã hội và bảo vệ môi trường trên một vùng lãnh thổ.'
      }
    ],
    realWorldExamples: [
      'Tại xã Vạn Linh, tỉnh Lạng Sơn, cán bộ địa chính xã ứng dụng bản đồ số và máy định vị GPS để đo đạc diện tích vườn na, cấp giấy chứng nhận quyền sử dụng đất cho các hộ dân.',
      'Học sinh Trường THPT Hòa Bình có cơ hội phát triển nghề nghiệp trong các ngành: ứng dụng công nghệ viễn thám theo dõi mùa hoa quả Chi Lăng, kĩ thuật viên bản đồ địa chính, hoặc làm việc trong lĩnh vực thương mại cửa khẩu quốc tế tại tỉnh Lạng Sơn.'
    ],
    keyTakeaways: [
      'Địa lí 10 là môn học tích hợp sâu sắc giữa tự nhiên, xã hội và công nghệ số.',
      'Tri thức địa lí mở ra nhiều hướng nghiệp thiết thực, gắn chặt với định hướng phát triển nông nghiệp hàng hóa và kinh tế cửa khẩu của tỉnh Lạng Sơn.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 1. Môn Địa lí với định hướng nghề nghiệp',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 1. Môn Địa lí với định hướng nghề nghiệp',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 1']
    }
  },
  {
    id: 'bai-2',
    number: 2,
    partId: 'phan-2',
    chapterId: 'chuong-1',
    topicId: 'chuong-1',
    title: 'Bài 2. Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ',
    subtitle: 'Năm phương pháp thể hiện đối tượng địa lí: kí hiệu, đường chuyển động, chấm điểm, khoanh vùng, bản đồ - biểu đồ',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Phân biệt được đặc điểm, đối tượng và khả năng biểu hiện của 5 phương pháp thể hiện đối tượng địa lí trên bản đồ.',
      'Biết cách đọc và phân tích ý nghĩa các loại kí hiệu, mũi tên chuyển động, điểm chấm, vùng khoanh và biểu đồ trên bản đồ giáo khoa.',
      'Rèn luyện kĩ năng tính khoảng cách thực địa từ tỉ lệ bản đồ và giải thích sự phân bố của các đối tượng địa lí.',
      'Vận dụng phương pháp đọc bản đồ vào khai thác bản đồ hành chính, bản đồ tự nhiên và bản đồ kinh tế tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái quát về bản đồ và hệ thống phương pháp biểu hiện',
        content: [
          'Bản đồ là hình ảnh thu nhỏ, khái quát hóa một phần hay toàn bộ bề mặt Trái Đất lên mặt phẳng theo những quy tắc toán học nhất định (phép chiếu, tỉ lệ) và hệ thống kí hiệu quy ước.',
          'Để phản ánh đầy đủ vị trí, số lượng, chất lượng, cấu trúc và động thái của vô số đối tượng địa lí trong không gian, bản đồ học sử dụng nhiều phương pháp biểu hiện chuyên biệt.'
        ],
        highlight: 'Mỗi phương pháp biểu hiện được thiết kế phù hợp với một dạng đối tượng địa lí (điểm, tuyến, diện hoặc tổng hợp số liệu).',
      },
      {
        sectionTitle: '2. Đặc điểm 5 phương pháp biểu hiện cơ bản',
        content: [
          'a) Phương pháp kí hiệu: Biểu hiện các đối tượng phân bố theo những điểm cụ thể (núi lửa, mỏ khoáng sản, nhà máy, sân bay, thị trấn). Có 3 dạng kí hiệu: hình học, chữ, tượng hình. Kí hiệu cho biết vị trí, số lượng, cấu trúc và quy mô đối tượng.',
          'b) Phương pháp đường chuyển động: Thể hiện sự di chuyển của các hiện tượng tự nhiên và kinh tế - xã hội (hướng gió, bão, dòng biển, luồng di dân, tuyến vận tải hàng hóa). Mũi tên chỉ rõ hướng đi, độ dày chỉ khối lượng, độ dài thể hiện phạm vi hoạt động.',
          'c) Phương pháp chấm điểm: Thể hiện các đối tượng phân bố phân tán bằng các điểm chấm có giá trị định lượng quy ước (phân bố dân cư nông thôn, điểm chăn nuôi gia súc). Mật độ điểm chấm phản ánh độ dày đặc hay thưa thớt của hiện tượng.',
          'd) Phương pháp khoanh vùng: Thể hiện các đối tượng phân bố theo diện tích rộng lớn nhưng không liên tục (vùng phân bố dân tộc, vùng trồng lúa, bãi chăn thả gia súc, vùng đất ngập mặn). Đường ranh giới khép kín hoặc màu sắc/nét gạch xác định phạm vi phân bố.',
          'e) Phương pháp bản đồ - biểu đồ: Đặt các biểu đồ (cột, tròn, thanh) vào các đơn vị lãnh thổ hành chính để thể hiện số lượng, cơ cấu, động thái của hiện tượng (sản lượng lương thực các tỉnh, giá trị xuất khẩu, cơ cấu kinh tế).'
        ],
      },
      {
        sectionTitle: '3. Phương pháp tính toán cự li thực tế từ tỉ lệ bản đồ',
        content: [
          'Tỉ lệ bản đồ chỉ rõ mức độ thu nhỏ của khoảng cách trên bản đồ so với khoảng cách ngoài thực địa.',
          'Công thức: D (thực địa) = d (trên bản đồ) × M (mẫu số tỉ lệ).',
          'Ví dụ: Nếu đo được khoảng cách giữa Trường THPT Hòa Bình và trung tâm xã Chi Lăng (tỉnh Lạng Sơn) trên bản đồ tỉ lệ 1 : 100.000 là 8,5 cm, thì khoảng cách thực tế là 8,5 × 100.000 cm = 850.000 cm = 8,5 km.'
        ],
        highlight: 'Chú ý đổi đúng đơn vị đo: 1 km = 1.000 m = 100.000 cm; 1 m = 100 cm = 1.000 mm.',
      }
    ],
    keyTerms: [
      {
        term: 'Kí hiệu bản đồ',
        definition: 'Hệ thống các biểu tượng quy ước dùng để biểu thị vị trí, đặc tính và số lượng của các đối tượng địa lí trên bản đồ.'
      },
      {
        term: 'Đường chuyển động',
        definition: 'Phương pháp dùng các mũi tên có hình dáng, màu sắc và kích thước khác nhau để biểu thị hướng đi, tốc độ và khối lượng di chuyển của đối tượng địa lí.'
      },
      {
        term: 'Tỉ lệ bản đồ',
        definition: 'Tỉ số giữa khoảng cách đo được trên bản đồ với khoảng cách tương ứng ngoài thực địa.'
      }
    ],
    realWorldExamples: [
      'Trên bản đồ nông nghiệp tỉnh Lạng Sơn, vùng trồng na đặc sản tại xã Vạn Linh được biểu hiện bằng phương pháp khoanh vùng kết hợp màu nền xanh lá mạ.',
      'Tuyến Quốc lộ 1A và đường sắt Hà Nội - Lạng Sơn chạy qua xã Chi Lăng và địa bàn tỉnh Lạng Sơn được biểu hiện bằng phương pháp kí hiệu tuyến (đường kẻ màu phân cấp độ dày).'
    ],
    keyTakeaways: [
      'Mỗi phương pháp biểu hiện có ưu thế riêng và được kết hợp hài hòa trên một bản đồ chuyên đề.',
      'Muốn đọc bản đồ chính xác, bước đầu tiên phải đọc kĩ bảng chú giải và xác định tỉ lệ bản đồ.',
      'Nắm vững công thức D = d × M để chuyển đổi khoảng cách đo trên bản đồ thành khoảng cách thực địa.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 2. Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 2. Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 2']
    }
  },
  {
    id: 'bai-3',
    number: 3,
    partId: 'phan-2',
    chapterId: 'chuong-1',
    topicId: 'chuong-1',
    title: 'Bài 3. Sử dụng bản đồ trong học tập và đời sống, một số ứng dụng của GPS và bản đồ số trong đời sống',
    subtitle: 'Các bước khai thác bản đồ, nguyên lí hoạt động của GPS, điều hướng vệ tinh và ứng dụng bản đồ số thông minh',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Nêu được các bước sử dụng bản đồ khoa học trong học tập môn Địa lí và ứng dụng trong cuộc sống.',
      'Giải thích được nguyên lí định vị của hệ thống vệ tinh GPS (Global Positioning System) và các chức năng của bản đồ số.',
      'Biết cách sử dụng các ứng dụng bản đồ số trên điện thoại thông minh để tìm đường, đo khoảng cách và xác định tọa độ.',
      'Tính toán được thời gian truyền tín hiệu vô tuyến GPS và vận tốc di chuyển thực tế từ dữ liệu định vị.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Quy trình các bước sử dụng bản đồ hiệu quả',
        content: [
          'Bước 1: Chọn bản đồ phù hợp với mục đích học tập hoặc công việc (bản đồ tự nhiên, dân cư, kinh tế, giao thông).',
          'Bước 2: Đọc tên bản đồ để nắm chủ đề, đọc bảng chú giải để hiểu ý nghĩa các kí hiệu quy ước.',
          'Bước 3: Xác định tỉ lệ bản đồ và phương hướng (hướng Bắc trên kinh tuyến hoặc hoa la bàn).',
          'Bước 4: Xác định vị trí các đối tượng cần tìm, phân tích mối liên hệ không gian giữa các đối tượng địa lí và rút ra nhận xét, giải thích nguyên nhân.'
        ],
        highlight: 'Bản đồ là cuốn sách giáo khoa thứ hai của môn Địa lí. Đọc bản đồ phải đi từ tổng quan đến chi tiết, từ mô tả đến giải thích.',
      },
      {
        sectionTitle: '2. Hệ thống Định vị Toàn cầu (GPS) và Bản đồ số',
        content: [
          'a) Hệ thống GPS: Là hệ thống định vị vệ tinh của Hoa Kỳ, bao gồm tối thiểu 24 vệ tinh bay quanh Trái Đất ở độ cao khoảng 20.200 km. Thiết bị thu GPS trên mặt đất nhận tín hiệu từ ít nhất 4 vệ tinh cùng lúc để tính toán chính xác tọa độ (vĩ độ, kinh độ), độ cao và thời gian thực.',
          'b) Bản đồ số: Là tập hợp dữ liệu không gian được số hóa và quản lí trên máy tính, hiển thị trực quan trên màn hình. Bản đồ số có tính năng tương tác vượt trội: phóng to thu nhỏ, tìm kiếm địa điểm, xếp chồng nhiều lớp thông tin (lớp giao thông, lớp dịch vụ, lớp địa hình), tự động tính toán lộ trình tối ưu và cập nhật tình trạng giao thông theo thời gian thực.'
        ],
      },
      {
        sectionTitle: '3. Ứng dụng thực tiễn của GPS và Bản đồ số trong đời sống',
        content: [
          'Trong giao thông vận tải: Dẫn đường ô tô, xe máy, giám sát hành trình xe chở nông sản từ Chi Lăng đi các tỉnh, xe container qua cửa khẩu Lạng Sơn.',
          'Trong nông nghiệp thông minh: Quản lí diện tích vườn cây ăn quả bằng flycam gắn GPS, bón phân và phun thuốc chính xác theo tọa độ.',
          'Trong phòng chống thiên tai và cứu hộ cứu nạn: Xác định nhanh vị trí sạt lở núi đá vôi ở xã Chi Lăng, theo dõi hướng bão và điều động lực lượng ứng cứu.',
          'Trong du lịch và đời sống: Tra cứu điểm di tích Ải Chi Lăng, khách sạn, trạm y tế, chia sẻ vị trí cho người thân.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Hệ thống Định vị Toàn cầu (GPS)',
        definition: 'Mạng lưới các vệ tinh nhân tạo quay quanh Trái Đất phát tín hiệu vô tuyến giúp thiết bị mặt đất xác định tọa độ vị trí 3 chiều và thời gian.'
      },
      {
        term: 'Bản đồ số (Digital Map)',
        definition: 'Bản đồ được tạo dựng và lưu trữ dưới dạng dữ liệu số hóa trên máy tính, cho phép tương tác, tìm kiếm và phân tích động.'
      },
      {
        term: 'Điều hướng (Navigation)',
        definition: 'Quá trình xác định vị trí hiện tại và chỉ dẫn đường đi tối ưu đến một điểm đích đã chọn.'
      }
    ],
    realWorldExamples: [
      'Các thương lái thu mua na tại xã Vạn Linh, tỉnh Lạng Sơn sử dụng ứng dụng Google Maps để định vị các điểm thu gom, tối ưu hóa tuyến đường vận chuyển về Hà Nội và các tỉnh.',
      'Người dân và du khách đến tham quan Khu di tích lịch sử Ải Chi Lăng (tỉnh Lạng Sơn) dùng GPS trên điện thoại để tra cứu các điểm di tích: Núi Mặt Quỷ, Đền Quỷ Môn Quan, Ngựa Cương.'
    ],
    keyTakeaways: [
      'Sử dụng bản đồ khoa học đòi hỏi quy trình 4 bước từ chọn bản đồ, đọc chú giải đến phân tích mối liên hệ.',
      'GPS cung cấp tọa độ chính xác nhờ giao thoa tín hiệu vô tuyến từ chùm vệ tinh không gian.',
      'Bản đồ số là công cụ đắc lực hỗ trợ thông minh cho sản xuất nông nghiệp, giao thông và đời sống tại Lạng Sơn.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 3. Sử dụng bản đồ trong học tập và đời sống, một số ứng dụng của GPS và bản đồ số trong đời sống',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 3. Sử dụng bản đồ trong học tập và đời sống, một số ứng dụng của GPS và bản đồ số trong đời sống',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 3']
    }
  },
  {
    id: 'bai-4',
    number: 4,
    partId: 'phan-2',
    chapterId: 'chuong-2',
    topicId: 'chuong-2',
    title: 'Bài 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất',
    subtitle: 'Nguồn gốc hình thành hành tinh, cấu trúc 3 lớp Trái Đất và các nhóm khoáng vật, đá cấu tạo vỏ Trái Đất',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được nguồn gốc hình thành Trái Đất theo giả thuyết tinh vân mặt trời.',
      'Mô tả được cấu trúc phân lớp của Trái Đất gồm 3 lớp chính: Vỏ Trái Đất, Manti và Nhân (Lõi).',
      'Phân biệt được cấu tạo của vỏ lục địa và vỏ đại dương; nhận biết 3 nhóm đá chính cấu tạo nên vỏ Trái Đất: đá mácma, đá trầm tích và đá biến chất.',
      'Tính toán được tỉ trọng thể tích/khối lượng của các lớp cấu tạo Trái Đất và vận dụng kiến thức giải thích nguồn gốc đá vôi tại Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Nguồn gốc hình thành Trái Đất',
        content: [
          'Trái Đất được hình thành cách đây khoảng 4,6 tỉ năm từ một đám mây bụi khí tinh vân mặt trời nguyên thủy. Dưới tác dụng của lực hấp dẫn, vật chất ngưng tụ ở trung tâm tạo thành Mặt Trời, các hạt bụi và khí còn lại kết tụ thành các hành tinh trong Hệ Mặt Trời, trong đó có Trái Đất.',
          'Trong giai đoạn đầu, sự phân dị trọng lực khiến các vật chất nặng (sắt, niken) chìm xuống tạo thành nhân, các vật chất nhẹ hơn (silic, nhôm) nổi lên tạo thành vỏ và manti.'
        ],
        highlight: 'Trái Đất có cấu trúc đồng tâm gồm 3 lớp từ ngoài vào trong: Vỏ Trái Đất -> Manti -> Nhân.',
      },
      {
        sectionTitle: '2. Cấu trúc vỏ Trái Đất: Vỏ lục địa và Vỏ đại dương',
        content: [
          'Vỏ Trái Đất là lớp ngoài cùng mỏng nhất, dày từ 5 km (dưới đáy đại dương) đến 70 km (dưới các dãy núi cao trên lục địa). Ranh giới giữa vỏ và manti là mặt Mohorovicic (Moho).',
          'Vỏ lục địa: Dày trung bình 35 - 70 km, gồm 3 tầng: tầng trầm tích ở trên cùng, tầng granit ở giữa và tầng bazan ở dưới cùng.',
          'Vỏ đại dương: Mỏng hơn (khoảng 5 - 10 km), cấu tạo chủ yếu bởi tầng bazan và một lớp trầm tích đại dương mỏng ở trên, không có tầng đá granit liên tục.'
        ],
      },
      {
        sectionTitle: '3. Vật liệu cấu tạo vỏ Trái Đất: Khoáng vật và 3 nhóm đá',
        content: [
          'a) Đá mácma: Hình thành do sự nguội lạnh và đông kết của dung nham nóng chảy. Gồm đá mácma xâm nhập (granit) và mácma phun trào (bazan, riolit).',
          'b) Đá trầm tích: Hình thành do sự lắng tụ, nén ép và gắn kết của các mảnh vụn hoặc kết tủa hóa học, tích tụ xác sinh vật trong các bồn trũng (đá vôi, sa thạch, sét, than đá). Thường xếp thành từng lớp nằm ngang.',
          'c) Đá biến chất: Hình thành từ đá mácma hoặc đá trầm tích bị biến đổi sâu sắc do tác động của nhiệt độ cao và áp suất lớn trong lòng đất (đá hoa từ đá vôi, đá phiến từ sét, đá gơnai từ granit).'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Vỏ Trái Đất',
        definition: 'Lớp vật chất cứng ngoài cùng của Trái Đất, có độ dày từ khoảng 5 km (dưới đại dương) đến 70 km (dưới lục địa).'
      },
      {
        term: 'Mặt Moho (Mohorovicic)',
        definition: 'Bề mặt ranh giới phân cách giữa vỏ Trái Đất và lớp manti trên, nơi vận tốc truyền sóng địa chấn tăng vọt đột ngột.'
      },
      {
        term: 'Đá trầm tích',
        definition: 'Loại đá được hình thành trong các bồn trũng do sự lắng tụ, nén ép và gắn kết của các vật liệu vụn nát hoặc kết tủa hóa học, xác sinh vật.'
      }
    ],
    realWorldExamples: [
      'Tại khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn), đá cấu tạo chủ yếu là đá vôi trầm tích biển cổ tuổi Cổ sinh (Palêôzôi), giàu canxit (CaCO3), hình thành từ đáy biển nông hàng trăm triệu năm trước.',
      'Các dãy núi đá vôi dựng đứng tại Ải Chi Lăng và thung lũng Vạn Linh chứa nhiều hang động karst tự nhiên, là vật liệu đá trầm tích hữu cơ đặc trưng của vùng Đông Bắc.'
    ],
    keyTakeaways: [
      'Trái Đất cấu tạo 3 lớp: Vỏ, Manti, Nhân. Vỏ lục địa dày và có tầng granit, vỏ đại dương mỏng không có tầng granit.',
      'Ba nhóm đá cấu tạo vỏ Trái Đất gồm mácma, trầm tích và biến chất, liên tục chuyển hóa qua chu trình đá.',
      'Đá vôi Chi Lăng (Lạng Sơn) là đá trầm tích giàu giá trị cảnh quan và kinh tế sản xuất xi măng.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 4']
    }
  },
  {
    id: 'bai-5',
    number: 5,
    partId: 'phan-2',
    chapterId: 'chuong-2',
    topicId: 'chuong-2',
    title: 'Bài 5. Hệ quả địa lí các chuyển động của Trái Đất',
    subtitle: 'Chuyển động tự quay quanh trục và chuyển động quanh Mặt Trời: ngày đêm luân phiên, giờ trên Trái Đất, lực Cô-ri-ô-lit, các mùa và ngày đêm dài ngắn',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Phân tích được các hệ quả địa lí của chuyển động tự quay quanh trục của Trái Đất: sự luân phiên ngày đêm, giờ trên Trái Đất và lực Cô-ri-ô-lit.',
      'Phân tích được các hệ quả của chuyển động quanh Mặt Trời: chuyển động biểu kiến hàng năm của Mặt Trời, các mùa trong năm và hiện tượng ngày đêm dài ngắn theo mùa, theo vĩ độ.',
      'Thực hiện thành thạo các bài tập tính toán giờ múi (GMT), tính giờ địa phương theo kinh độ, chuyển ngày qua kinh tuyến 180° và tính góc nhập xạ buổi trưa.',
      'Giải thích được hiện tượng mùa đông lạnh sâu và chênh lệch độ dài ngày đêm vào mùa hè tại xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Hệ quả chuyển động tự quay quanh trục của Trái Đất',
        content: [
          'Trái Đất tự quay quanh trục nghiêng 66°33’ so với mặt phẳng quỹ đạo, theo hướng từ tây sang đông với chu kì 24 giờ (1 ngày đêm).',
          'a) Hiện tượng ngày đêm luân phiên: Do Trái Đất hình cầu nên Mặt Trời chỉ chiếu sáng một nửa (ban ngày), nửa khuất là ban đêm. Do Trái Đất tự quay nên mọi nơi lần lượt có ngày và đêm luân phiên nhau.',
          'b) Giờ trên Trái Đất: Chia bề mặt Trái Đất làm 24 múi giờ, mỗi múi rộng 15° kinh tuyến (ứng với 1 giờ). Múi số 0 lấy kinh tuyến gốc (0°) chạy qua đài thiên văn Greenwich làm chuẩn (giờ GMT hay UTC). Việt Nam nằm trọn trong múi giờ số 7 (kinh tuyến 105°Đ). Khi đi từ tây sang đông qua kinh tuyến 180° (đường đổi ngày quốc tế) lùi lại 1 ngày lịch, từ đông sang tây tăng thêm 1 ngày lịch.',
          'c) Lực Cô-ri-ô-lit: Lực làm lệch hướng chuyển động của các vật thể trên bề mặt Trái Đất. Ở bán cầu Bắc, vật thể chuyển động bị lệch về bên phải; ở bán cầu Nam bị lệch về bên trái theo hướng chuyển động.'
        ],
        highlight: 'Công thức tính giờ múi: T_B = T_A + (Múi B - Múi A). Công thức góc nhập xạ: h = 90° - |vĩ độ φ ± vĩ độ xích kinh α|.',
      },
      {
        sectionTitle: '2. Hệ quả chuyển động quay quanh Mặt Trời',
        content: [
          'Trái Đất quay quanh Mặt Trời theo quỹ đạo elip gần tròn với chu kì 365 ngày 6 giờ (1 năm). Trục Trái Đất nghiêng không đổi phương tạo nên các hệ quả quan trọng:',
          'a) Các mùa trong năm: Do trục Trái Đất nghiêng nên lần lượt bán cầu Bắc và bán cầu Nam ngả về phía Mặt Trời, nhận được lượng nhiệt và ánh sáng khác nhau sinh ra 4 mùa (Xuân, Hạ, Thu, Đông). Hai bán cầu có mùa đối lập nhau.',
          'b) Hiện tượng ngày đêm dài ngắn theo mùa và theo vĩ độ: Mùa nóng (mùa hạ) có ngày dài hơn đêm; mùa lạnh (mùa đông) có ngày ngắn hơn đêm. Ở Xích đạo ngày đêm luôn dài bằng nhau quanh năm (12h ngày, 12h đêm). Càng lên vĩ độ cao độ chênh lệch ngày đêm càng lớn; từ vòng cực lên cực có hiện tượng ngày hoặc đêm dài 24 giờ (ngày địa cực, đêm địa cực).'
        ],
      },
      {
        sectionTitle: '3. Phương pháp giải bài tập tính giờ và góc nhập xạ',
        content: [
          '1. Tính giờ múi: Múi giờ = Kinh độ / 15 (làm tròn số nguyên). Nếu ở bán cầu Đông: T_địa phương = GMT + Múi. Bán cầu Tây: T = GMT - Múi.',
          '2. Tính giờ địa phương theo kinh độ: Cứ chênh lệch 1° kinh độ tương ứng 4 phút thời gian (60 phút / 15° = 4 phút). Đi về phía đông cộng thêm, đi về phía tây trừ đi.',
          '3. Tính góc nhập xạ (độ cao Mặt Trời lúc 12h trưa): h = 90° - |φ - α| khi cùng bán cầu; h = 90° - (φ + α) khi khác bán cầu.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Giờ GMT (Giờ quốc tế)',
        definition: 'Giờ tại múi giờ số 0, lấy kinh tuyến gốc chạy qua Đài thiên văn Greenwich (Luân Đôn, Anh) làm kinh tuyến trung tâm.'
      },
      {
        term: 'Lực Cô-ri-ô-lit',
        definition: 'Lực quán tính sinh ra do chuyển động tự quay của Trái Đất, làm lệch hướng chuyển động của các khối khí, dòng biển và vật thể.'
      },
      {
        term: 'Mặt Trời lên thiên đỉnh',
        definition: 'Hiện tượng Mặt Trời chiếu thẳng góc vào bề mặt Trái Đất (góc nhập xạ bằng 90°) lúc 12 giờ trưa, chỉ xảy ra ở vùng nội chí tuyến.'
      }
    ],
    realWorldExamples: [
      'Tỉnh Lạng Sơn (trong đó có xã Vạn Linh và xã Chi Lăng) nằm ở khoảng 21°40’B đến 22°B thuộc múi giờ số 7. Mỗi năm tại đây có 2 lần Mặt Trời lên thiên đỉnh vào khoảng cuối tháng 5 và giữa tháng 7.',
      'Vào ngày Hạ chí (22/6), học sinh tại xã Vạn Linh (tỉnh Lạng Sơn) quan sát thấy ngày dài nhất trong năm (khoảng 13,5 giờ ban ngày), trời tối muộn đúng như câu ca dao \'Đêm tháng năm chưa nằm đã sáng\'.'
    ],
    keyTakeaways: [
      'Trái Đất tự quay sinh ra luân phiên ngày đêm, giờ trên Trái Đất và lực Cô-ri-ô-lit.',
      'Trái Đất quay quanh Mặt Trời với trục nghiêng không đổi sinh ra 4 mùa và hiện tượng ngày đêm dài ngắn theo mùa, theo vĩ độ.',
      'Việt Nam nằm ở múi giờ thứ 7 (GMT+7); nắm vững công thức đổi kinh độ ra thời gian (1° = 4 phút).'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 5. Hệ quả địa lí các chuyển động của Trái Đất',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 5. Hệ quả địa lí các chuyển động của Trái Đất',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 5']
    }
  },
  {
    id: 'bai-6',
    number: 6,
    partId: 'phan-2',
    chapterId: 'chuong-3',
    topicId: 'chuong-3',
    title: 'Bài 6. Thạch quyển, thuyết kiến tạo mảng',
    subtitle: 'Giới hạn thạch quyển, các mảng kiến tạo lớn và cơ chế dịch chuyển của các mảng',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Xác định được giới hạn của thạch quyển, phân biệt được thạch quyển với vỏ Trái Đất.',
      'Trình bày được nội dung cơ bản của thuyết kiến tạo mảng: 7 mảng kiến tạo lớn trôi dạt trên lớp manti quánh dẻo.',
      'Giải thích được nguyên nhân hình thành các dãy núi trẻ, vực sâu đại dương, động đất và núi lửa tại các ranh giới tiếp xúc mảng.',
      'Tính toán được tốc độ trôi dạt của các mảng kiến tạo và liên hệ với các đới đứt gãy địa chất tại tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm Thạch quyển',
        content: [
          'Thạch quyển là phần cứng ngoài cùng của Trái Đất, bao gồm vỏ Trái Đất và phần trên cùng của lớp manti (lớp manti trên rắn chắc), có độ dày khoảng 100 km.',
          'Phía dưới thạch quyển là tầng asthenosphere (quyển mềm hay quyển quánh dẻo) của manti, nơi vật chất ở trạng thái quánh dẻo và có các dòng đối lưu nhiệt dịch chuyển chậm chạp.'
        ],
        highlight: 'Thạch quyển = Vỏ Trái Đất + Phần trên cùng của manti (dày khoảng 100 km), nằm nổi trên quyển mềm quánh dẻo.',
      },
      {
        sectionTitle: '2. Thuyết kiến tạo mảng và các mảng kiến tạo lớn',
        content: [
          'Thuyết kiến tạo mảng cho rằng thạch quyển không phải là một khối liền mà bị chia cắt thành 7 mảng kiến tạo lớn (mảng Thái Bình Dương, Âu - Á, Ấn Độ - Ôxtrâylia, Bắc Mỹ, Nam Mỹ, châu Phi, Nam Cực) và nhiều mảng nhỏ.',
          'Các mảng kiến tạo không đứng yên mà liên tục dịch chuyển chậm chạp với tốc độ khoảng vài xentimet mỗi năm nhờ các dòng đối lưu vật chất trong manti.'
        ],
      },
      {
        sectionTitle: '3. Các kiểu tiếp xúc giữa các mảng kiến tạo',
        content: [
          'a) Tiếp xúc tách dãn (ranh giới phân kì): Hai mảng dịch chuyển xa nhau, mácma từ dưới trào lên tạo thành sống núi ngầm đại dương và đáy biển mới (ví dụ: sống núi ngầm giữa Đại Tây Dương).',
          'b) Tiếp xúc dồn ép / xô húc (ranh giới hội tụ): Hai mảng xô vào nhau. Nếu mảng đại dương va chạm mảng lục địa sẽ bị hút chìm xuống dưới, hình thành vực biển sâu và chuỗi cung đảo núi lửa; nếu hai mảng lục địa xô vào nhau sẽ uốn nếp nâng cao tạo các dãy núi trẻ hùng vĩ (như dãy Hi-ma-lay-a do mảng Ấn Độ xô húc mảng Âu - Á).',
          'c) Tiếp xúc trượt bằng (biến dạng): Hai mảng trượt ngang qua nhau, sinh ra các đứt gãy lớn kèm theo động đất nông nhưng dữ dội (như đứt gãy San Andreas ở Bắc Mỹ).'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Thạch quyển (Lithosphere)',
        definition: 'Lớp vỏ cứng ngoài cùng của Trái Đất, gồm vỏ Trái Đất và phần trên cùng của lớp manti, dày khoảng 100 km.'
      },
      {
        term: 'Kiến tạo mảng (Plate Tectonics)',
        definition: 'Học thuyết địa chất giải thích sự chuyển động của các mảng vỏ cứng trên lớp manti quánh dẻo, sinh ra động đất, núi lửa và tạo núi.'
      },
      {
        term: 'Hút chìm (Subduction)',
        definition: 'Hiện tượng một mảng kiến tạo đại dương nặng hơn chìm xuống phía dưới một mảng kiến tạo khác vào lớp manti.'
      }
    ],
    realWorldExamples: [
      'Lãnh thổ tỉnh Lạng Sơn (trong đó có khu vực Chi Lăng và xã Vạn Linh) nằm trọn trên mảng kiến tạo Âu - Á, chịu ảnh hưởng của các đới đứt gãy kiến tạo cổ phương tây bắc - đông nam (đới đứt gãy Cao Bằng - Lạng Sơn).',
      'Vận động kiến tạo Tân kiến tạo đã nâng cao các khối đá vôi cổ ở Chi Lăng, tạo nên địa hình núi đá dốc đứng và các bồn trũng karst kín màu mỡ ở xã Vạn Linh.'
    ],
    keyTakeaways: [
      'Thạch quyển gồm vỏ Trái Đất và phần trên manti dày khoảng 100 km.',
      'Bề mặt Trái Đất gồm 7 mảng lớn liên tục trôi dạt trên quyển mềm.',
      'Vùng tiếp xúc giữa các mảng kiến tạo là nơi tập trung nhiều động đất, núi lửa và các đai uốn nếp tạo núi lớn nhất hành tinh.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 6. Thạch quyển, thuyết kiến tạo mảng',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 6. Thạch quyển, thuyết kiến tạo mảng',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 6']
    }
  },
  {
    id: 'bai-7',
    number: 7,
    partId: 'phan-2',
    chapterId: 'chuong-3',
    topicId: 'chuong-3',
    title: 'Bài 7. Nội lực và ngoại lực',
    subtitle: 'Tác động nâng cao, hạ thấp, uốn nếp, đứt gãy của nội lực và quá trình phong hóa, bóc mòn, bồi tụ của ngoại lực',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Phân biệt được khái niệm, nguồn năng lượng sinh ra nội lực và ngoại lực.',
      'Trình bày được tác động của nội lực: vận động theo phương thẳng đứng, vận động uốn nếp và đứt gãy tạo nên các dạng địa hình lớn.',
      'Phân tích được 4 quá trình của ngoại lực: phong hóa (lí học, hóa học, sinh học), bóc mòn, vận chuyển và bồi tụ.',
      'Giải thích được quá trình hình thành địa hình karst đá vôi đặc sắc tại khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Tác động của Nội lực đối với địa hình bề mặt Trái Đất',
        content: [
          'Nội lực là lực phát sinh từ bên trong Trái Đất, nguồn năng lượng chủ yếu do sự phân rã của các chất phóng xạ, năng lượng chuyển dịch vật chất theo trọng lực và phản ứng hóa học nhiệt hạt nhân.',
          'a) Vận động theo phương thẳng đứng (vận động nâng lên và hạ xuống): Diễn ra trên diện tích rộng lớn, làm cho bộ phận này nâng lên thành lục địa, bộ phận khác hạ xuống thành biển, gây hiện tượng biển tiến và biển thoái.',
          'b) Vận động theo phương nằm ngang: Gây ra hiện tượng uốn nếp và đứt gãy. Khi các lớp đá có tính dẻo bị nén ép sẽ uốn cong thành các nếp uốn tạo nên các dãy núi uốn nếp; khi các lớp đá cứng bị nén ép hoặc tách dãn sẽ gãy vỡ tạo nên các khe nứt, đứt gãy địa chất (địa hào, địa lũy).'
        ],
        highlight: 'Xu hướng chung của nội lực là làm cho bề mặt Trái Đất trở nên gồ ghề, mấp mô, tạo nên các dạng địa hình vĩ mô.',
      },
      {
        sectionTitle: '2. Tác động của Ngoại lực đối với địa hình bề mặt Trái Đất',
        content: [
          'Ngoại lực là lực phát sinh từ bên ngoài, trên bề mặt Trái Đất, nguồn năng lượng chủ yếu là bức xạ Mặt Trời, gió, mưa, dòng chảy, sinh vật và con người.',
          'a) Quá trình phong hóa: Phá hủy và làm biến đổi đá. Phong hóa lí học (do nhiệt độ thay đổi, nước đóng băng nứt đá); Phong hóa hóa học (do nước và axit hòa tan khoáng vật, đặc biệt tạo địa hình karst đá vôi); Phong hóa sinh học (do rễ cây, vi sinh vật tiết axit phá hủy đá).',
          'b) Quá trình bóc mòn: Nước chảy, gió, sóng biển làm dời chuyển các sản phẩm phong hóa khỏi vị trí ban đầu (xâm thực, thổi mòn, mài mòn).',
          'c) Quá trình vận chuyển và bồi tụ: Vật liệu được dòng nước, gió đưa đi xa và lắng đọng tại các vùng trũng tạo nên các đồng bằng phù sa, bãi bồi, cồn cát.'
        ],
      },
      {
        sectionTitle: '3. Mối quan hệ tương hỗ giữa Nội lực và Ngoại lực',
        content: [
          'Nội lực và ngoại lực là hai lực đối lập nhau nhưng diễn ra đồng thời, liên tục tác động qua lại để định hình địa hình bề mặt Trái Đất.',
          'Nội lực có xu hướng nâng cao, tạo sự gồ ghề; ngoại lực có xu hướng san bằng, bạt cao lấp trũng. Địa hình hiện tại là kết quả tổng hòa của hai lực này qua hàng triệu năm.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Nội lực (Endogenic forces)',
        definition: 'Các lực sinh ra từ bên trong lòng Trái Đất, có xu hướng làm cho bề mặt Trái Đất gồ ghề hơn.'
      },
      {
        term: 'Ngoại lực (Exogenic forces)',
        definition: 'Các lực sinh ra từ bên ngoài bề mặt Trái Đất do bức xạ mặt trời, nước, gió, sinh vật, có xu hướng san bằng địa hình.'
      },
      {
        term: 'Hiện tượng Karst',
        definition: 'Hiện tượng phong hóa hóa học do nước hòa tan đá vôi chứa canxi cacbonat (CaCO3), tạo nên các hang động, tháp đá, thung lũng karst đặc sắc.'
      }
    ],
    realWorldExamples: [
      'Địa hình khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn) là minh chứng điển hình cho sự tương tác giữa nội lực nâng cao các tầng đá vôi cổ và ngoại lực phong hóa hóa học (karst) tạo nên các tháp đá vôi dựng đứng, hang động và thung lũng kín.',
      'Ở xã Vạn Linh, quá trình phong hóa đá vôi tạo ra lớp đất nâu đỏ giàu dinh dưỡng tích tụ dưới chân núi, rất thuận lợi để người dân phát triển cây na Chi Lăng đặc sản.'
    ],
    keyTakeaways: [
      'Nội lực nâng cao gồ ghề, ngoại lực san bằng bạt trũng.',
      'Bốn quá trình ngoại lực gồm: Phong hóa -> Bóc mòn -> Vận chuyển -> Bồi tụ.',
      'Địa hình núi đá vôi Chi Lăng là kết quả của phong hóa karst hóa học trên nền đá trầm tích vôi.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 7. Nội lực và ngoại lực',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 7. Nội lực và ngoại lực',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 7']
    }
  },
  {
    id: 'bai-8',
    number: 8,
    partId: 'phan-2',
    chapterId: 'chuong-3',
    topicId: 'chuong-3',
    title: 'Bài 8. Thực hành: Sự phân bố các vành đai động đất, núi lửa',
    subtitle: 'Vành đai lửa Thái Bình Dương, vành đai Địa Trung Hải và mối quan hệ giữa các ranh giới mảng kiến tạo với thiên tai',
    durationMinutes: 45,
    isPracticeLesson: true,
    objectives: [
      'Xác định được trên bản đồ 2 vành đai động đất và núi lửa lớn nhất thế giới: Vành đai lửa Thái Bình Dương và Vành đai Địa Trung Hải.',
      'Giải thích được nguyên nhân tại sao động đất và núi lửa lại phân bố tập trung trùng khớp với ranh giới tiếp xúc của các mảng kiến tạo.',
      'Tính toán được tỉ lệ phần trăm số trận động đất, tính tốc độ lan truyền sóng thần trên đại dương theo độ sâu nước biển.',
      'Nêu được các biện pháp phòng chống thiên tai dư chấn động đất và sạt lở đá ở vùng núi tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Sự phân bố các vành đai động đất và núi lửa trên Trái Đất',
        content: [
          'Động đất và núi lửa không phân bố ngẫu nhiên rải rác mà tập trung thành các vành đai hẹp kéo dài hàng chục nghìn kilomet.',
          'a) Vành đai lửa Thái Bình Dương: Dài hơn 40.000 km, chạy vòng quanh lòng chảo Thái Bình Dương (từ New Zealand, qua quần đảo Indonesia, Philippines, Nhật Bản, quần đảo Aleut, bờ tây Bắc Mỹ xuống bờ tây Nam Mỹ Andes). Chiếm hơn 75% số núi lửa hoạt động và khoảng 90% các trận động đất lớn trên toàn cầu.',
          'b) Vành đai động đất - núi lửa Địa Trung Hải: Chạy dài từ Đại Tây Dương, qua khu vực Địa Trung Hải, bán đảo Tiểu Á, vùng Kavkaz, dãy Himalaya xuống Đông Nam Á, nơi mảng châu Phi và mảng Ấn Độ xô húc mảng Âu - Á.'
        ],
        highlight: 'Vành đai lửa Thái Bình Dương là \'chảo lửa\' địa chất lớn nhất hành tinh, tập trung hầu hết động đất mạnh và sóng thần dữ dội.',
      },
      {
        sectionTitle: '2. Mối quan hệ giữa ranh giới mảng kiến tạo và các đới thiên tai',
        content: [
          'Tại các đới tiếp xúc hút chìm (ranh giới hội tụ), mảng đại dương chìm sâu xuống manti nóng chảy, sinh ra áp suất mácma cực lớn phun trào thành núi lửa và giải phóng năng lượng đàn hồi gây động đất mạnh.',
          'Khi động đất mạnh xảy ra dưới đáy biển làm đáy biển nâng lên hoặc sụt xuống đột ngột, sẽ truyền năng lượng khổng lồ vào cột nước sinh ra sóng thần (Tsunami) lan truyền với vận tốc hàng trăm km/h.'
        ],
      },
      {
        sectionTitle: '3. Kĩ năng tính toán và phòng ngừa rủi ro thiên tai',
        content: [
          'Công thức tính vận tốc sóng thần trên biển sâu: v = √(g × h), trong đó g = 9,8 m/s² là gia tốc trọng trường, h là độ sâu mực nước biển (m). Khi vào vùng nước nông ven bờ, vận tốc sóng giảm nhưng độ cao sóng tăng vọt lên hàng chục mét gây tàn phá khủng khiếp.',
          'Tại Việt Nam, tuy không nằm trực tiếp trên vành đai lửa Thái Bình Dương nhưng lãnh thổ vẫn chịu ảnh hưởng của các đới đứt gãy kiến tạo nội lục.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Vành đai lửa Thái Bình Dương',
        definition: 'Đới kiến tạo hình móng ngựa bao quanh Thái Bình Dương, nơi tập trung phần lớn các trận động đất và núi lửa đang hoạt động của Trái Đất.'
      },
      {
        term: 'Sóng thần (Tsunami)',
        definition: 'Chuỗi sóng biển khổng lồ di chuyển với tốc độ rất nhanh, được tạo ra chủ yếu bởi các trận động đất dưới đáy đại dương.'
      },
      {
        term: 'Dư chấn',
        definition: 'Các trận rung chuyển địa chấn nhỏ hơn xảy ra sau trận động đất chính trong cùng một khu vực đứt gãy.'
      }
    ],
    realWorldExamples: [
      'Tại tỉnh Lạng Sơn và khu vực Chi Lăng, nguy cơ động đất mạnh rất thấp do nằm sâu trong nội lục mảng Âu - Á; tuy nhiên vùng núi đá vôi Chi Lăng cần chú ý phòng ngừa nguy cơ sạt lở đá lăn từ các vách núi dốc sau mưa lớn kéo dài.',
      'Ở xã Vạn Linh, người dân xây dựng nhà kiên cố, neo giữ hệ thống ròng rọc tời chuyển na chắc chắn vào các mỏm đá để đảm bảo an toàn tuyệt đối trước các rung chấn địa chất.'
    ],
    keyTakeaways: [
      'Động đất và núi lửa phân bố trùng khít với các ranh giới tiếp xúc mảng kiến tạo.',
      'Vành đai Thái Bình Dương và Địa Trung Hải là hai vành đai địa chấn lớn nhất thế giới.',
      'Nắm vững kĩ năng tính tỉ lệ % và tốc độ truyền sóng địa chất giúp nhận thức đúng quy mô rủi ro thiên tai.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 8. Thực hành: Sự phân bố các vành đai động đất, núi lửa',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 8. Thực hành: Sự phân bố các vành đai động đất, núi lửa',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 8']
    }
  },
  {
    id: 'bai-9',
    number: 9,
    partId: 'phan-2',
    chapterId: 'chuong-4',
    topicId: 'chuong-4',
    title: 'Bài 9. Khí quyển, các yếu tố khí hậu',
    subtitle: 'Cấu trúc khí quyển, sự phân bố nhiệt độ không khí, khí áp, gió và cơ chế hình thành mưa',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được cấu trúc các tầng khí quyển, đặc biệt là vai trò tầng đối lưu đối với các hiện tượng thời tiết.',
      'Phân tích được quy luật phân bố nhiệt độ không khí theo vĩ độ địa lí, theo lục địa - đại dương và theo địa hình.',
      'Trình bày được sự phân bố các đai khí áp trên Trái Đất, cơ chế hoạt động của gió Mậu dịch, gió Tây ôn đới và gió mùa.',
      'Tính toán thành thạo biên độ nhiệt độ năm, nhiệt độ trung bình và giải thích được đặc điểm mùa đông lạnh nhất cả nước tại tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái quát về khí quyển và cấu trúc tầng đối lưu',
        content: [
          'Khí quyển là lớp không khí bao quanh Trái Đất, dày hàng nghìn kilomet, giữ vai trò lá chắn bảo vệ sự sống khỏi các tia bức xạ có hại từ vũ trụ và thiên thạch.',
          'Tầng đối lưu: Nằm sát mặt đất (dày từ 8 km ở cực đến 16 km ở Xích đạo), chứa 80% khối lượng không khí và hầu hết hơi nước. Không khí chuyển động theo chiều thẳng đứng (đối lưu), sinh ra mọi hiện tượng thời tiết như mây, mưa, sấm sét, gió bão. Trong tầng đối lưu, cứ lên cao 100 m nhiệt độ giảm trung bình 0,6°C.'
        ],
        highlight: 'Quy luật nhiệt độ tầng đối lưu: Cứ lên cao 100 m nhiệt độ giảm 0,6°C (sườn đón gió ẩm); khi gió vượt qua đỉnh núi xuống sườn khuất gió, không khí khô nóng tăng 1,0°C / 100 m (hiệu ứng Phơn).',
      },
      {
        sectionTitle: '2. Sự phân bố nhiệt độ không khí và các nhân tố ảnh hưởng',
        content: [
          'a) Phân bố theo vĩ độ: Càng từ Xích đạo về hai cực, góc nhập xạ càng nhỏ nên bức xạ nhận được càng ít, nhiệt độ trung bình năm giảm dần, biên độ nhiệt độ năm tăng dần.',
          'b) Phân bố theo lục địa và đại dương: Đất hấp thụ nhiệt nhanh và tỏa nhiệt nhanh hơn nước biển. Do đó, lục địa có mùa hè nóng hơn, mùa đông lạnh hơn đại dương; biên độ nhiệt độ năm ở sâu trong lục địa lớn hơn nhiều so với ven biển.',
          'c) Phân bố theo địa hình: Càng lên cao nhiệt độ càng giảm; sườn đón nắng và đón gió ẩm có nhiệt độ và lượng mưa khác biệt so với sườn khuất gió.'
        ],
      },
      {
        sectionTitle: '3. Khí áp, các loại gió và cơ chế mưa',
        content: [
          'Khí áp là sức nén của không khí lên bề mặt Trái Đất. Các đai áp cao và áp thấp phân bố xen kẽ đối xứng qua Xích đạo: Áp thấp Xích đạo -> Áp cao cận nhiệt -> Áp thấp ôn đới -> Áp cao cực.',
          'Gió là sự di chuyển của không khí từ nơi áp cao về nơi áp thấp. Ba loại gió chính: Gió Mậu dịch (thổi từ cận nhiệt về xích đạo, khô nóng); Gió Tây ôn đới (thổi từ cận nhiệt về ôn đới, ẩm ướt); Gió mùa (thổi theo mùa do sự chênh lệch nhiệt - ẩm giữa lục địa và đại dương).',
          'Mưa hình thành do không khí ẩm bốc lên cao ngưng tụ. Mưa nhiều ở vùng áp thấp, dải hội tụ nhiệt đới, nơi có gió mùa và sườn đón gió; mưa ít ở vùng áp cao, sâu trong lục địa và nơi có dòng biển lạnh.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tầng đối lưu (Troposphere)',
        definition: 'Tầng khí quyển sát mặt đất chứa 80% khối lượng khí quyển, nơi diễn ra mọi hiện tượng thời tiết mây, mưa, gió, bão.'
      },
      {
        term: 'Biên độ nhiệt độ năm',
        definition: 'Hiệu số giữa nhiệt độ trung bình của tháng nóng nhất và nhiệt độ trung bình của tháng lạnh nhất trong năm.'
      },
      {
        term: 'Gió mùa (Monsoon)',
        definition: 'Loại gió thổi theo mùa, hướng gió ở hai mùa ngược chiều nhau do sự chênh lệch nhiệt độ và khí áp giữa lục địa và đại dương.'
      }
    ],
    realWorldExamples: [
      'Tỉnh Lạng Sơn (trong đó có khu vực Chi Lăng và xã Vạn Linh) là cửa ngõ đầu tiên đón các đợt gió mùa Đông Bắc từ phương Bắc tràn về, địa hình cánh cung hút gió khiến Lạng Sơn có mùa đông lạnh nhất và đến sớm nhất cả nước, nhiệt độ có lúc giảm xuống dưới 5°C kèm sương muối.',
      'Vào mùa hè, thung lũng đá vôi kín ở xã Vạn Linh hấp thụ nhiệt mạnh vào ban ngày, nhưng ban đêm tỏa nhiệt nhanh tạo biên độ nhiệt ngày đêm khá lớn, rất phù hợp cho cây na Chi Lăng tích lũy đường thơm ngọt.'
    ],
    keyTakeaways: [
      'Trong tầng đối lưu, nhiệt độ giảm 0,6°C / 100 m khi lên cao sườn ẩm, tăng 1°C / 100 m khi xuống sườn khô.',
      'Từ Xích đạo về cực: nhiệt độ trung bình giảm, biên độ nhiệt độ năm tăng mạnh.',
      'Khí hậu Lạng Sơn mang tính chất nhiệt đới gió mùa có mùa đông lạnh sâu do địa hình cánh cung đón gió mùa Đông Bắc.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 9. Khí quyển, các yếu tố khí hậu',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 9. Khí quyển, các yếu tố khí hậu',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 9']
    }
  },
  {
    id: 'bai-10',
    number: 10,
    partId: 'phan-2',
    chapterId: 'chuong-4',
    topicId: 'chuong-4',
    title: 'Bài 10. Thực hành: Đọc bản đồ các đới và các kiểu khí hậu trên Trái Đất, phân tích biểu đồ một số kiểu khí hậu',
    subtitle: 'Khai thác bản đồ khí hậu thế giới, nhận diện 7 đới khí hậu và phân tích biểu đồ nhiệt độ - lượng mưa',
    durationMinutes: 45,
    isPracticeLesson: true,
    objectives: [
      'Xác định được phạm vi phân bố của 7 đới khí hậu chính trên bản đồ khí hậu thế giới.',
      'Nắm vững các bước phân tích biểu đồ khí hậu: đọc nhiệt độ tháng cao nhất, tháng thấp nhất, biên độ nhiệt, tổng lượng mưa và phân bố lượng mưa theo mùa.',
      'Phân biệt được đặc trưng nhiệt - ẩm của 4 kiểu khí hậu điển hình: nhiệt đới gió mùa, ôn đới hải dương, ôn đới lục địa và cận nhiệt Địa Trung Hải.',
      'Tính toán được tổng lượng mưa năm, tỉ lệ lượng mưa mùa mưa và phân tích số liệu khí hậu thực tế của trạm Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Các đới và các kiểu khí hậu trên Trái Đất',
        content: [
          'Mỗi bán cầu có 7 đới khí hậu phân bố đối xứng qua Xích đạo: Đới xích đạo -> Đới cận xích đạo -> Đới nhiệt đới -> Đới cận nhiệt đới -> Đới ôn đới -> Đới cận cực -> Đới cực.',
          'Trong các đới khí hậu lại phân hóa thành nhiều kiểu khí hậu do tác động của lục địa - đại dương, địa hình và hoàn lưu gió (ví dụ đới ôn đới có kiểu ôn đới hải dương, ôn đới lục địa; đới cận nhiệt có kiểu cận nhiệt Địa Trung Hải, cận nhiệt gió mùa).'
        ],
        highlight: 'Các đới khí hậu phân bố theo quy luật địa đới từ xích đạo về cực, các kiểu khí hậu trong đới phân hóa theo quy luật phi địa đới.',
      },
      {
        sectionTitle: '2. Quy trình phân tích biểu đồ nhiệt độ và lượng mưa',
        content: [
          'Bước 1: Phân tích đường biểu diễn nhiệt độ (°C): Xác định tháng có nhiệt độ cao nhất (nhiệt độ max), tháng có nhiệt độ thấp nhất (nhiệt độ min), tính biên độ nhiệt năm = Max - Min. Nhận xét nhiệt độ trung bình năm có nóng quanh năm hay có mùa đông lạnh.',
          'Bước 2: Phân tích biểu đồ cột lượng mưa (mm): Tính tổng lượng mưa cả năm (cộng lượng mưa 12 tháng). Xác định các tháng mưa nhiều (mùa mưa) và các tháng mưa ít (mùa khô).',
          'Bước 3: Tổng hợp và kết luận kiểu khí hậu tương ứng, giải thích nguyên nhân hình thành.'
        ],
      },
      {
        sectionTitle: '3. So sánh 4 kiểu khí hậu điển hình',
        content: [
          'Kiểu nhiệt đới gió mùa: Nhiệt độ trung bình năm cao (> 20°C), mùa hạ nóng mưa nhiều, mùa đông lạnh ít mưa hoặc khô ráo, lượng mưa lớn 1.500 - 2.000 mm/năm.',
          'Kiểu ôn đới hải dương: Mùa hè mát, mùa đông không quá lạnh (nhiệt độ tháng lạnh nhất > 0°C), mưa quanh năm, lượng mưa 800 - 1.000 mm.',
          'Kiểu ôn đới lục địa: Mùa hè nóng ngắn, mùa đông rất lạnh kéo dài có tuyết rơi (nhiệt độ < 0°C), mưa ít tập trung vào mùa hè, biên độ nhiệt năm rất lớn.',
          'Kiểu cận nhiệt Địa Trung Hải: Mùa hè nóng khô ít mưa, mùa đông ấm áp mưa nhiều (nghịch mùa).'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Biểu đồ khí hậu',
        definition: 'Dạng biểu đồ kết hợp giữa đường biểu diễn diễn biến nhiệt độ và các cột thể hiện lượng mưa từng tháng trong năm tại một trạm quan trắc.'
      },
      {
        term: 'Tổng lượng mưa năm',
        definition: 'Tổng số milimet nước mưa đo được tại một trạm khí tượng thủy văn trong suốt 12 tháng của năm.'
      },
      {
        term: 'Đới khí hậu',
        definition: 'Vùng lãnh thổ rộng lớn trên bề mặt Trái Đất trải dài theo các vĩ tuyến, có chế độ nhiệt và hoàn lưu khí quyển tương đối đồng nhất.'
      }
    ],
    realWorldExamples: [
      'Số liệu trạm khí tượng Lạng Sơn: Nhiệt độ trung bình năm đạt khoảng 21,5°C; tháng 1 lạnh nhất khoảng 13,0°C, tháng 7 nóng nhất khoảng 27,2°C (biên độ nhiệt năm 14,2°C). Tổng lượng mưa trung bình năm đạt khoảng 1.450 mm, mùa mưa tập trung từ tháng 5 đến tháng 9 chiếm hơn 80% tổng lượng mưa.',
      'Học sinh xã Vạn Linh (tỉnh Lạng Sơn) đối chiếu số liệu này để hiểu vì sao mùa mưa ở địa phương trùng với thời kì na Chi Lăng lớn nhanh và cho thu hoạch rộ vào tháng 8 âm lịch.'
    ],
    keyTakeaways: [
      'Quy trình đọc biểu đồ khí hậu gồm 3 bước: nhiệt độ -> lượng mưa -> kết luận kiểu khí hậu.',
      'Việt Nam và tỉnh Lạng Sơn thuộc kiểu khí hậu nhiệt đới gió mùa, có sự phân mùa rõ rệt giữa mùa mưa nóng và mùa khô lạnh.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 10. Thực hành: Đọc bản đồ các đới và các kiểu khí hậu trên Trái Đất, phân tích biểu đồ một số kiểu khí hậu',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 10. Thực hành: Đọc bản đồ các đới và các kiểu khí hậu trên Trái Đất, phân tích biểu đồ một số kiểu khí hậu',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 10']
    }
  },
  {
    id: 'bai-11',
    number: 11,
    partId: 'phan-2',
    chapterId: 'chuong-5',
    topicId: 'chuong-5',
    title: 'Bài 11. Thủy quyển, nước trên lục địa',
    subtitle: 'Vòng tuần hoàn của nước, các nguồn tiếp nước cho sông, chế độ dòng chảy và vai trò của nước ngọt',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Khái quát được thành phần của thủy quyển và phân tích 2 vòng tuần hoàn nước trên Trái Đất.',
      'Phân tích được các nguồn cung cấp nước cho sông và các nhân tố ảnh hưởng đến chế độ dòng chảy (khí hậu, địa hình, thảm thực vật, hồ đầm).',
      'Trình bày vai trò của nước ngầm, hồ đầm và sự cần thiết phải bảo vệ nguồn nước ngọt.',
      'Tính toán được lưu lượng nước, tổng lượng dòng chảy và liên hệ với mạng lưới sông suối tại Chi Lăng và xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm thủy quyển và vòng tuần hoàn của nước',
        content: [
          'Thủy quyển là lớp vỏ lỏng liên tục bao quanh Trái Đất, bao gồm nước mặn trong các biển, đại dương (chiếm 97,5%) và nước ngọt trên lục địa (chiếm 2,5%, phần lớn nằm ở dạng băng tuyết ở hai cực và đỉnh núi cao).',
          'Vòng tuần hoàn nhỏ: Nước biển bốc hơi -> ngưng tụ thành mây -> rơi thành mưa trên biển.',
          'Vòng tuần hoàn lớn: Nước biển bốc hơi -> gió đưa mây vào đất liền -> mưa rơi trên lục địa -> một phần ngấm xuống đất thành nước ngầm, một phần chảy tràn trên bề mặt thành sông suối đổ ra biển.'
        ],
        highlight: 'Vòng tuần hoàn lớn của nước gắn kết đại dương và lục địa, duy trì sự sống và tái tạo liên tục nguồn nước ngọt.',
      },
      {
        sectionTitle: '2. Nước trên lục địa: Sông ngòi và chế độ nước',
        content: [
          'Sông là dòng nước chảy thường xuyên tương đối ổn định trên bề mặt lục địa. Lưu vực sông là phần lãnh thổ cung cấp nước thường xuyên cho sông.',
          'Các nguồn tiếp nước: Nước mưa (chế độ nước phụ thuộc chặt chẽ vào chế độ mưa); Băng tuyết tan (mùa lũ vào mùa xuân - hè khi băng tan); Nước ngầm (nguồn điều hòa dòng chảy quan trọng trong mùa cạn).',
          'Các nhân tố ảnh hưởng đến chế độ nước sông: Khí hậu (quyết định lưu lượng và mùa lũ); Địa hình (độ dốc địa hình làm lũ lên nhanh rút nhanh); Thảm thực vật (rừng điều hòa dòng chảy, hạn chế lũ quét); Hồ đầm (điều tiết lưu lượng).'
        ],
      },
      {
        sectionTitle: '3. Nước ngầm, hồ đầm và bảo vệ tài nguyên nước ngọt',
        content: [
          'Nước ngầm nằm dưới bề mặt đất trong các tầng chứa nước, là nguồn cấp nước sinh hoạt và sản xuất quan trọng nhất cho con người.',
          'Nước ngọt chỉ chiếm tỉ lệ rất nhỏ và đang bị suy giảm nghiêm trọng do ô nhiễm và biến đổi khí hậu. Cần sử dụng tiết kiệm nước, bảo vệ rừng đầu nguồn và xử lí nước thải triệt để.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Thủy quyển (Hydrosphere)',
        definition: 'Toàn bộ lớp vỏ nước bao quanh Trái Đất, gồm đại dương, sông ngòi, hồ đầm, băng tuyết, nước ngầm và hơi nước trong khí quyển.'
      },
      {
        term: 'Lưu lượng dòng chảy (Q)',
        definition: 'Khối lượng nước chảy qua mặt cắt ngang lòng sông tại một điểm đo trong một giây, đơn vị m³/s.'
      },
      {
        term: 'Chế độ nước sông',
        definition: 'Sự thay đổi về mực nước và lưu lượng nước của sông trong suốt chu kì một năm, gồm mùa lũ và mùa cạn.'
      }
    ],
    realWorldExamples: [
      'Tại khu vực Chi Lăng (Lạng Sơn), sông Thương chảy qua thung lũng đá vôi, chế độ nước mùa lũ từ tháng 6 đến tháng 9 trùng với mùa mưa bão; mùa cạn từ tháng 10 đến tháng 5 năm sau.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), các thung lũng đá vôi karst có hệ thống suối ngầm và nước ngầm dồi dào, người dân khoan giếng và đắp đập ngăn suối để lấy nước tưới cho các vườn na trong mùa khô.'
    ],
    keyTakeaways: [
      'Nước ngọt trên Trái Đất rất hữu hạn (2,5%), chủ yếu nằm ở dạng băng tuyết và nước ngầm.',
      'Chế độ nước sông phụ thuộc vào khí hậu, địa hình, thảm thực vật và các nguồn tiếp nước.',
      'Bảo vệ rừng đầu nguồn tại Lạng Sơn có ý nghĩa sống còn trong việc giữ nước ngầm và hạn chế lũ quét cho Chi Lăng.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 11. Thủy quyển, nước trên lục địa',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 11. Thủy quyển, nước trên lục địa',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 11']
    }
  },
  {
    id: 'bai-12',
    number: 12,
    partId: 'phan-2',
    chapterId: 'chuong-5',
    topicId: 'chuong-5',
    title: 'Bài 12. Nước biển và đại dương',
    subtitle: 'Độ muối, nhiệt độ nước biển, các chuyển động của nước biển (sóng, thủy triều, hải lưu) và vai trò của đại dương',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được độ muối trung bình và nhiệt độ của nước biển; giải thích được sự thay đổi độ muối theo vĩ độ và nguồn nước sông đổ vào.',
      'Phân tích được nguyên nhân sinh ra sóng biển, sóng thần, hiện tượng thủy triều (triều cường, triều kém theo tuần trăng).',
      'Trình bày được hướng chuyển động của các dòng hải lưu nóng và lạnh trên đại dương thế giới và tác động của chúng đến khí hậu ven bờ.',
      'Tính toán được khối lượng muối biển kết tinh theo độ mặn và áp suất nước biển theo độ sâu.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Tính chất của nước biển và đại dương',
        content: [
          'a) Độ muối của nước biển: Độ muối trung bình của đại dương thế giới là 35‰ (trong 1.000 g nước biển có 35 g muối hòa tan, chủ yếu là muối ăn NaCl). Độ muối thay đổi tùy thuộc vào lượng bốc hơi, lượng mưa và lượng nước ngọt từ các con sông đổ ra.',
          'b) Nhiệt độ nước biển: Nhiệt độ trung bình của lớp nước mặt đại dương là 17,5°C. Nhiệt độ giảm dần từ Xích đạo về hai cực và giảm dần theo độ sâu (dưới độ sâu 1.000 m nhiệt độ nước biển rất thấp, chỉ khoảng 0 - 3°C).'
        ],
        highlight: 'Công thức tính lượng muối kết tinh: Khối lượng muối = Thể tích nước biển × Khối lượng riêng × (Độ muối / 1000).',
      },
      {
        sectionTitle: '2. Các chuyển động của nước biển: Sóng, Thủy triều, Dòng biển',
        content: [
          'a) Sóng biển: Là sự dao động tại chỗ của các phân tử nước biển, nguyên nhân chủ yếu do gió. Gió càng mạnh sóng càng to. Sóng thần sinh ra do động đất hoặc núi lửa ngầm dưới đáy biển.',
          'b) Thủy triều: Là hiện tượng dao động thường xuyên có chu kì của mực nước biển do lực hấp dẫn của Mặt Trăng và Mặt Trời kết hợp với lực li tâm của Trái Đất. Khi Mặt Trời, Mặt Trăng và Trái Đất thẳng hàng (ngày không trăng đầu tháng và ngày trăng tròn giữa tháng âm lịch) lực hút cộng hưởng lớn nhất sinh ra triều cường; khi vuông góc (ngày trăng khuyết mùng 7-8 và 22-23 âm lịch) sinh ra triều kém.',
          'c) Dòng biển (hải lưu): Là dòng chuyển động của khối nước biển theo một hướng xác định. Các dòng biển nóng làm tăng nhiệt độ và lượng mưa ven bờ; các dòng biển lạnh làm khí hậu ven bờ khô hạn, hình thành các hoang mạc ven biển.'
        ],
      },
      {
        sectionTitle: '3. Vai trò của biển và đại dương đối với con người',
        content: [
          'Điều hòa khí hậu toàn cầu, hấp thụ phần lớn khí CO2 và cung cấp hơn 50% lượng ôxy cho sinh quyển.',
          'Cung cấp nguồn tài nguyên hải sản phong phú, muối biển, khoáng sản đáy biển (dầu khí, sa khoáng, cát thủy tinh) và tiềm năng năng lượng sóng, thủy triều.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Độ muối (Salinity)',
        definition: 'Tổng lượng các chất khoáng hòa tan (tính bằng gam) có trong 1 kilôgam (hoặc 1 lít) nước biển, kí hiệu ‰.'
      },
      {
        term: 'Triều cường (Spring tide)',
        definition: 'Thời kì thủy triều dâng cao nhất và lùi sâu nhất trong tháng, xảy ra khi Mặt Trời, Mặt Trăng và Trái Đất nằm trên cùng một đường thẳng.'
      },
      {
        term: 'Dòng biển (Ocean Current)',
        definition: 'Dòng chuyển động có hướng của các khối nước khổng lồ trong đại dương do tác động của các hệ thống gió thường xuyên.'
      }
    ],
    realWorldExamples: [
      'Mặc dù tỉnh Lạng Sơn là tỉnh miền núi nội lục, nhưng các dòng hoàn lưu biển và gió mùa đông nam từ vịnh Bắc Bộ mang theo nguồn ẩm dồi dào, là nguồn gốc tạo nên các cơn mưa rào mùa hạ cho khu vực Chi Lăng và xã Vạn Linh.',
      'Sản phẩm muối biển từ các tỉnh duyên hải Bắc Bộ được vận chuyển qua tuyến đường huyết mạch Quốc lộ 1A lên Chi Lăng và xã Vạn Linh để phục vụ chế biến thực phẩm và chăn nuôi đại gia súc.'
    ],
    keyTakeaways: [
      'Độ muối trung bình nước biển là 35‰; nhiệt độ nước biển giảm dần theo vĩ độ và độ sâu.',
      'Ba chuyển động của nước biển gồm sóng (do gió), thủy triều (do lực hấp dẫn thiên thể) và dòng biển (do gió thường xuyên).',
      'Đại dương đóng vai trò quyết định trong việc điều hòa chu trình khí hậu và cung cấp tài nguyên sinh học.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 12. Nước biển và đại dương',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 12. Nước biển và đại dương',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 12']
    }
  },
  {
    id: 'bai-13',
    number: 13,
    partId: 'phan-2',
    chapterId: 'chuong-5',
    topicId: 'chuong-5',
    title: 'Bài 13. Thực hành: Phân tích chế độ nước của sông Hồng',
    subtitle: 'Xử lí số liệu lưu lượng nước sông Hồng tại trạm Sơn Tây, tính toán tỉ lệ mùa lũ và giải thích mối quan hệ với khí hậu',
    durationMinutes: 45,
    isPracticeLesson: true,
    objectives: [
      'Biết cách tính lưu lượng nước trung bình năm của sông từ bảng số liệu 12 tháng.',
      'Tính toán chính xác tỉ lệ phần trăm lượng nước mùa lũ (tháng 6 - 10) so với tổng lượng nước cả năm của sông Hồng tại trạm Sơn Tây.',
      'Vẽ biểu đồ đường hoặc biểu đồ cột thể hiện diễn biến lưu lượng nước sông Hồng trong năm.',
      'Giải thích được nguyên nhân sông Hồng có mùa lũ trùng với mùa mưa bão Bắc Bộ và liên hệ với chế độ sông suối tại Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái quát về hệ thống sông Hồng và trạm thủy văn Sơn Tây',
        content: [
          'Sông Hồng (sông Thao) là hệ thống sông lớn nhất miền Bắc Việt Nam, bắt nguồn từ vùng núi Vân Nam (Trung Quốc) đổ ra vịnh Bắc Bộ. Diện tích lưu vực hơn 169.000 km².',
          'Trạm thủy văn Sơn Tây là trạm quan trắc khống chế toàn bộ dòng chảy trước khi sông Hồng tỏa vào vùng đồng bằng châu thổ Bắc Bộ, phản ánh chuẩn xác đặc tính thủy văn của cả lưu vực.'
        ],
        highlight: 'Lưu vực sông Hồng có mạng lưới hình nan quạt, các phụ lưu sông Đà và sông Lô hợp lưu tại Việt Trì khiến nước lũ tập trung rất nhanh.',
      },
      {
        sectionTitle: '2. Xử lí số liệu và đặc điểm chế độ nước sông Hồng',
        content: [
          'Mùa lũ của sông Hồng kéo dài 5 tháng (từ tháng 6 đến tháng 10), chiếm từ 75% đến 80% tổng lượng nước cả năm. Tháng đỉnh lũ thường là tháng 8 trùng với thời kì mưa bão dồn dập nhất ở Bắc Bộ.',
          'Mùa cạn kéo dài 7 tháng (từ tháng 11 đến tháng 5 năm sau), chỉ chiếm từ 20% đến 25% tổng lượng nước cả năm. Tháng cạn nhất là tháng 3, khi dòng sông trơ đáy và thiếu nước ngọt phục vụ nông nghiệp.'
        ],
      },
      {
        sectionTitle: '3. Phương pháp tính toán các chỉ số thủy văn',
        content: [
          '1. Lưu lượng nước trung bình năm: Q_tb = (Tổng lưu lượng 12 tháng) / 12 (m³/s).',
          '2. Tổng lượng nước mùa lũ: Q_lũ = Q_tháng 6 + Q_tháng 7 + Q_tháng 8 + Q_tháng 9 + Q_tháng 10.',
          '3. Tỉ lệ % lượng nước mùa lũ: Tỉ lệ lũ = (Q_lũ / Q_cả năm) × 100%.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Trạm thủy văn',
        definition: 'Cơ sở quan trắc chuyên môn đo đạc mực nước, lưu lượng nước, lượng phù sa và nhiệt độ nước sông theo thời gian thực.'
      },
      {
        term: 'Mùa lũ sông Hồng',
        definition: 'Thời kì lưu lượng nước sông Hồng vượt mức trung bình, diễn ra từ tháng 6 đến tháng 10 hàng năm.'
      },
      {
        term: 'Đỉnh lũ',
        definition: 'Thời điểm mực nước hoặc lưu lượng dòng chảy của sông đạt giá trị cao nhất trong một trận lũ hoặc trong cả năm (thường vào tháng 8).'
      }
    ],
    realWorldExamples: [
      'Tại tỉnh Lạng Sơn, sông Thương bắt nguồn từ vùng núi Chi Lăng có chế độ nước tương đồng với sông Hồng: mùa lũ từ tháng 6 đến tháng 9 do ảnh hưởng của cùng hoàn lưu gió mùa Đông Nam mưa nhiều.',
      'Sông Kỳ Cùng là con sông đặc biệt của Lạng Sơn chảy ngược theo hướng đông nam - tây bắc sang Trung Quốc; việc nghiên cứu chế độ nước sông Hồng giúp học sinh THPT Hòa Bình hiểu rõ quy luật thủy văn lưu vực sông vùng núi Chi Lăng.'
    ],
    keyTakeaways: [
      'Mùa lũ sông Hồng kéo dài 5 tháng (tháng 6-10), chiếm khoảng 75 - 80% tổng lượng nước cả năm.',
      'Chế độ nước sông Hồng diễn biến ăn khớp hoàn toàn với mùa mưa bão của khí hậu miền Bắc.',
      'Nắm chắc kĩ năng tính tỉ lệ % mùa lũ và nhận xét biểu đồ lưu lượng nước.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 13. Thực hành: Phân tích chế độ nước của sông Hồng',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 13. Thực hành: Phân tích chế độ nước của sông Hồng',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 13']
    }
  },
  {
    id: 'bai-14',
    number: 14,
    partId: 'phan-2',
    chapterId: 'chuong-6',
    topicId: 'chuong-6',
    title: 'Bài 14. Đất trên Trái Đất',
    subtitle: 'Khái niệm đất, độ phì, các tầng đất và các nhân tố hình thành đất',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Nêu được khái niệm đất (thổ nhưỡng) và đặc tính quan trọng nhất của đất là độ phì.',
      'Mô tả được các tầng của phẫu diện đất điển hình từ bề mặt xuống đá mẹ.',
      'Phân tích được vai trò của 5 nhân tố tự nhiên hình thành đất (đá mẹ, khí hậu, sinh vật, địa hình, thời gian) và vai trò của con người.',
      'Tính toán được hàm lượng mùn trong đất và giải thích đặc điểm đất feralit trên đá vôi tại khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm đất và độ phì của đất',
        content: [
          'Đất (thổ nhưỡng) là lớp vật chất mỏng, tơi xốp bao phủ trên bề mặt các lục địa, được hình thành do sự biến đổi của đá dưới tác động của khí hậu, sinh vật và con người.',
          'Độ phì của đất là khả năng của đất cung cấp nước, chất dinh dưỡng, nhiệt độ và không khí cho cây trồng sinh trưởng và phát triển, mang lại năng suất mùa màng.'
        ],
        highlight: 'Độ phì là đặc tính cơ bản nhất phân biệt đất với các vật thể tự nhiên khác như đá, cát thuần túy.',
      },
      {
        sectionTitle: '2. Phẫu diện đất và các tầng đất chính',
        content: [
          'Phẫu diện đất là mặt cắt thẳng đứng qua các tầng đất từ bề mặt xuống đến lớp đá mẹ nguyên vẹn.',
          'Gồm các tầng: Tầng thảm mục và lá rụng trên cùng -> Tầng mùn (chứa nhiều chất hữu cơ màu thẫm) -> Tầng rửa trôi -> Tầng tích tụ (tích tụ sét, sắt, nhôm) -> Tầng đá mẹ bị phong hóa -> Đá gốc.'
        ],
      },
      {
        sectionTitle: '3. Các nhân tố hình thành đất',
        content: [
          'a) Đá mẹ: Cung cấp vật chất vô cơ cho đất, quyết định thành phần khoáng vật, cơ cấu cấp hạt và tính chất lí hóa ban đầu của đất.',
          'b) Khí hậu: Nhiệt và ẩm phá hủy đá (phong hóa) và chi phối quá trình tích lũy, phân giải chất hữu cơ trong đất.',
          'c) Sinh vật: Cung cấp chất hữu cơ cho đất (thực vật cung cấp xác rác, vi sinh vật phân giải thành mùn, động vật đào bới làm đất tơi xốp).',
          'd) Địa hình: Ảnh hưởng đến độ dày tầng đất và sự phân phối nhiệt - ẩm. Vùng dốc đất bị xói mòn mạnh tầng mỏng; vùng trũng bằng phẳng tầng đất dày tích tụ nhiều phù sa.',
          'e) Thời gian (tuổi của đất): Thời gian từ khi bắt đầu hình thành đất đến nay. Đất nhiệt đới hình thành lâu đời có tầng phong hóa rất dày.',
          'f) Con người: Hoạt động làm tăng độ phì (bón phân hữu cơ, cày bừa thâm canh) hoặc làm suy thoái đất (phá rừng, đốt nương làm rẫy, dùng quá nhiều hóa chất).'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Đất (Thổ nhưỡng)',
        definition: 'Lớp vật chất mỏng, tơi xốp trên bề mặt lục địa có khả năng tạo ra sinh khối thực vật nhờ độ phì.'
      },
      {
        term: 'Độ phì của đất',
        definition: 'Khả năng cung cấp nước, chất dinh dưỡng, không khí và nhiệt cho cây trồng sinh trưởng và phát triển.'
      },
      {
        term: 'Đất Feralit',
        definition: 'Nhóm đất chính của vùng nhiệt đới ẩm, giàu ôxít sắt và nhôm, có màu đỏ vàng đặc trưng.'
      }
    ],
    realWorldExamples: [
      'Tại xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn), loại đất chủ yếu là đất feralit phong hóa trên nền đá vôi (đất nâu đỏ và nâu vàng), có tầng đất mặt khá dày, giàu canxi và mùn hữu cơ, thoát nước tốt, là yếu tố thổ nhưỡng quyết định tạo nên chất lượng na Chi Lăng quả to, ngọt đậm.',
      'Bà con nông dân xã Vạn Linh tích cực bón phân chuồng ủ hoai mục và phân hữu cơ vi sinh, hạn chế phân hóa học để bảo vệ độ phì bền vững cho đất vườn na.'
    ],
    keyTakeaways: [
      'Độ phì là đặc tính bản chất của đất.',
      'Đất được hình thành do tác động đồng thời của 5 nhân tố tự nhiên và nhân tố con người.',
      'Đất feralit trên đá vôi ở Chi Lăng (Lạng Sơn) là tài nguyên thổ nhưỡng quý giá cho cây ăn quả đặc sản.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 14. Đất trên Trái Đất',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 14. Đất trên Trái Đất',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 14']
    }
  },
  {
    id: 'bai-15',
    number: 15,
    partId: 'phan-2',
    chapterId: 'chuong-6',
    topicId: 'chuong-6',
    title: 'Bài 15. Sinh quyển',
    subtitle: 'Khái niệm sinh quyển, giới hạn, đặc điểm và các nhân tố ảnh hưởng đến sự phát triển và phân bố sinh vật',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Nêu được khái niệm sinh quyển và xác định được giới hạn của sinh quyển trên Trái Đất.',
      'Phân tích được vai trò và cơ chế tác động của các nhân tố tự nhiên (khí hậu, nước, đất, địa hình, sinh vật khác) đến sự phát triển và phân bố của sinh vật.',
      'Đánh giá được tác động tích cực và tiêu cực của con người đối với sinh quyển.',
      'Tính toán được sinh khối thực vật và phân tích đặc điểm hệ sinh thái rừng trên núi đá vôi tại Chi Lăng và xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm và giới hạn của Sinh quyển',
        content: [
          'Sinh quyển là quyển của Trái Đất có sự sống tồn tại và phát triển, bao gồm toàn bộ các cơ thể sinh vật (thực vật, động vật, vi sinh vật) cùng môi trường sống của chúng.',
          'Giới hạn của sinh quyển: Rộng lớn, bao gồm phần dưới của khí quyển (tầng đối lưu đến độ cao khoảng 20 - 22 km nơi có tầng ôdôn), toàn bộ thủy quyển (xuống tận đáy các vực thẳm đại dương sâu 11.000 m) và phần trên của thạch quyển (sâu vài chục mét đến vài trăm mét trong các tầng đất đá phong hóa). Sinh vật tập trung dày đặc nhất ở nơi tiếp giáp giữa các quyển gần bề mặt đất.'
        ],
        highlight: 'Sinh vật phân bố tập trung dày đặc nhất ở nơi giao thoa giữa bề mặt đất, lớp không khí sát đất và tầng nước mặt đại dương.',
      },
      {
        sectionTitle: '2. Các nhân tố ảnh hưởng đến sự phát triển và phân bố sinh vật',
        content: [
          'a) Khí hậu: Là nhân tố chi phối mạnh mẽ nhất. Nhiệt độ và độ ẩm quyết định sự sinh trưởng, ranh giới phân bố của các loài; ánh sáng quyết định quá trình quang hợp của thực vật.',
          'b) Nước: Nước là thành phần cấu tạo tế bào và dung môi hòa tan chất dinh dưỡng; nơi nhiều nước sinh vật phát triển phong phú.',
          'c) Đất (thổ nhưỡng): Cung cấp chất khoáng và dinh dưỡng, các loại đất khác nhau phù hợp với các quần xã thực vật khác nhau.',
          'd) Địa hình: Độ cao và hướng sườn làm thay đổi nhiệt ẩm, sinh ra sự phân tầng thực vật theo đai cao.',
          'e) Mối quan hệ giữa các sinh vật: Cây ưa bóng sống dưới tán cây ưa sáng; động vật ăn cỏ gắn liền với đồng cỏ; động vật ăn thịt phân bố theo động vật ăn cỏ.',
          'f) Con người: Mở rộng vùng phân bố cây trồng vật nuôi hoặc thu hẹp diện tích rừng tự nhiên, làm tuyệt chủng nhiều loài sinh vật.'
        ],
      },
      {
        sectionTitle: '3. Đa dạng sinh học và bảo vệ sinh quyển',
        content: [
          'Sinh quyển cung cấp nguồn lương thực, thực phẩm, dược liệu, gỗ và điều hòa chu trình sinh hóa toàn cầu.',
          'Bảo vệ sinh quyển là bảo vệ nguồn gen quý, duy trì sự cân bằng sinh thái của Trái Đất.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Sinh quyển (Biosphere)',
        definition: 'Quyển của Trái Đất có sự sống tồn tại, bao gồm sinh vật và môi trường sống của chúng.'
      },
      {
        term: 'Quang hợp',
        definition: 'Quá trình thực vật sử dụng năng lượng ánh sáng mặt trời để tổng hợp chất hữu cơ từ CO2 và nước, giải phóng khí ôxy.'
      },
      {
        term: 'Đa dạng sinh học',
        definition: 'Sự phong phú về nguồn gen, giống loài sinh vật và các hệ sinh thái khác nhau trên Trái Đất.'
      }
    ],
    realWorldExamples: [
      'Tại khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn), hệ sinh thái rừng trên núi đá vôi (karst) rất độc đáo với các loài cây chịu hạn, bám rễ sâu vào kẽ đá như nghiến, lim, dây leo và các loài động vật hoang dã như khỉ, sơn dương.',
      'Xã Vạn Linh tích cực trồng cây gây rừng, bảo vệ rừng phòng hộ đầu nguồn để giữ ẩm và điều hòa tiểu khí hậu cho các vùng chuyên canh na Chi Lăng.'
    ],
    keyTakeaways: [
      'Sinh quyển có giới hạn rộng lớn, sinh vật tập trung dày nhất ở bề mặt đất và tầng nước mặt.',
      'Khí hậu là nhân tố quyết định sự phân bố sinh vật trên Trái Đất.',
      'Bảo tồn hệ sinh thái rừng trên núi đá vôi tại Lạng Sơn giúp gìn giữ nguồn gen và bảo vệ nguồn nước.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 15. Sinh quyển',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 15. Sinh quyển',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 15']
    }
  },
  {
    id: 'bai-16',
    number: 16,
    partId: 'phan-2',
    chapterId: 'chuong-6',
    topicId: 'chuong-6',
    title: 'Bài 16. Thực hành: Tìm hiểu sự phân bố đất và sinh vật trên Trái Đất',
    subtitle: 'Đọc bản đồ các nhóm đất chính và thảm thực vật chính trên Trái Đất, phân tích mối tương quan nhiệt - ẩm',
    durationMinutes: 45,
    isPracticeLesson: true,
    objectives: [
      'Xác định được trên bản đồ sự phân bố các thảm thực vật chính và các nhóm đất chính từ Xích đạo về cực.',
      'Phân tích được mối tương quan mật thiết giữa khí hậu, thảm thực vật và đất trong từng đới tự nhiên.',
      'Tính toán được tỉ lệ phần trăm diện tích các nhóm đất chính trên lục địa.',
      'Liên hệ và giải thích sự phân bố đất feralit và rừng nhiệt đới gió mùa tại tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Sự phân bố thảm thực vật chính trên Trái Đất',
        content: [
          'Từ Xích đạo về cực, các thảm thực vật phân bố tương ứng với các đới khí hậu: Rừng mưa xích đạo và nhiệt đới -> Xavan và cây bụi nhiệt đới -> Hoang mạc và bán hoang mạc -> Rừng cận nhiệt ẩm -> Rừng lá cứng cận nhiệt Địa Trung Hải -> Thảo nguyên ôn đới -> Rừng lá rộng và rừng hỗn giao ôn đới -> Rừng lá kim (taiga) -> Đài nguyên (tundra) -> Hoang mạc cực.'
        ],
        highlight: 'Thảm thực vật là tấm gương phản chiếu khí hậu; khí hậu thay đổi đến đâu thì thảm thực vật và đất thay đổi đến đó.',
      },
      {
        sectionTitle: '2. Sự phân bố các nhóm đất chính trên Trái Đất',
        content: [
          'Sự phân bố các nhóm đất trùng khớp với các đới khí hậu và thảm thực vật:',
          '- Đới nhiệt đới: Đất đỏ vàng feralit phát triển dưới rừng nhiệt đới; đất đỏ nâu xavan.',
          '- Đới cận nhiệt: Đất đỏ vàng cận nhiệt; đất nâu đỏ cận nhiệt Địa Trung Hải.',
          '- Đới ôn đới: Đất đen thảo nguyên ôn đới (loại đất phì nhiêu nhất); đất nâu xám rừng lá rộng; đất pốtdôn (podzol) rừng lá kim.',
          '- Đới cận cực và cực: Đất đài nguyên (đất gley hóa ngập nước mùa hè).'
        ],
      },
      {
        sectionTitle: '3. Mối tương quan thống nhất giữa Khí hậu - Thực vật - Đất',
        content: [
          'Nhiệt và ẩm của khí hậu quyết định sự sinh trưởng của thảm thực vật; xác bã thực vật rụng xuống đất được vi sinh vật phân giải tạo nên tầng mùn và quyết định loại đất hình thành.',
          'Đây là biểu hiện sinh động của quy luật địa đới trong tự nhiên.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Thảm thực vật',
        definition: 'Toàn bộ các quần xã thực vật phủ trên một vùng lãnh thổ nhất định.'
      },
      {
        term: 'Đất Pốtdôn (Podzol)',
        definition: 'Nhóm đất hình thành dưới rừng lá kim vùng ôn đới lạnh, có tầng rửa trôi màu xám nhạt như tro tàn.'
      },
      {
        term: 'Đất đen thảo nguyên (Chernozem)',
        definition: 'Loại đất giàu mùn và chất dinh dưỡng nhất thế giới, hình thành dưới thảm cỏ thảo nguyên ôn đới.'
      }
    ],
    realWorldExamples: [
      'Tại tỉnh Lạng Sơn và khu vực Chi Lăng, khí hậu nhiệt đới gió mùa có mùa đông lạnh kết hợp với địa hình đồi núi dốc đã hình thành nhóm đất feralit đỏ vàng trên đá phiến sét và đất feralit nâu đỏ trên đá vôi, nâng đỡ thảm rừng kín nhiệt đới gió mùa rụng lá vào mùa khô.',
      'Ở xã Vạn Linh, sự phân bố đất theo địa hình rất rõ nét: trên sườn núi cao là đất feralit mỏng nhiều đá lẫn; dưới chân núi thung lũng là đất feralit bồi tụ dày, màu mỡ phục vụ canh tác.'
    ],
    keyTakeaways: [
      'Đất và thực vật phân bố song hành tương ứng với các đới khí hậu trên Trái Đất.',
      'Nắm vững kĩ năng đọc bản đồ đất và thực vật, nhận biết mối quan hệ nhân - quả giữa nhiệt ẩm và sinh vật.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 16. Thực hành: Tìm hiểu sự phân bố đất và sinh vật trên Trái Đất',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 16. Thực hành: Tìm hiểu sự phân bố đất và sinh vật trên Trái Đất',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 16']
    }
  },
  {
    id: 'bai-17',
    number: 17,
    partId: 'phan-2',
    chapterId: 'chuong-7',
    topicId: 'chuong-7',
    title: 'Bài 17. Vỏ địa lí, quy luật thống nhất và hoàn chỉnh của vỏ địa lí',
    subtitle: 'Khái niệm vỏ địa lí, các thành phần và quy luật tác động qua lại thống nhất giữa các quyển',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Xác định được giới hạn và các thành phần cấu tạo nên vỏ địa lí (vỏ Trái Đất, khí quyển, thủy quyển, sinh quyển, thổ nhưỡng).',
      'Trình bày và giải thích được nội dung của quy luật thống nhất và hoàn chỉnh của vỏ địa lí.',
      'Nêu được ý nghĩa thực tiễn của quy luật: khi tác động vào một thành phần tự nhiên phải dự báo trước các biến đổi dây chuyền của các thành phần khác.',
      'Vận dụng quy luật giải thích hậu quả của việc phá rừng đầu nguồn đối với sông suối, xói mòn đất và nguy cơ sạt lở đá tại Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm và giới hạn của Vỏ địa lí',
        content: [
          'Vỏ địa lí (vỏ cảnh quan) là lớp vỏ của Trái Đất ở đó các quyển (thạch quyển, khí quyển, thủy quyển, sinh quyển và thổ nhưỡng quyển) cùng tiếp xúc, xâm nhập và tác động tương hỗ lẫn nhau.',
          'Giới hạn của vỏ địa lí: Giới hạn trên là giới hạn của tầng đối lưu (nơi có mây, mưa, khí hậu); giới hạn dưới là đáy của lớp vỏ phong hóa trong thạch quyển (sâu vài chục mét). Chiều dày tổng cộng khoảng 30 - 35 km. Vỏ địa lí hẹp hơn nhiều so với thạch quyển nhưng là nơi diễn ra mọi quá trình địa lí liên quan mật thiết đến con người.'
        ],
        highlight: 'Vỏ địa lí dày khoảng 30 - 35 km, là nơi giao thoa và tương tác sâu sắc giữa 5 quyển tự nhiên.',
      },
      {
        sectionTitle: '2. Quy luật thống nhất và hoàn chỉnh của vỏ địa lí',
        content: [
          'Nội dung quy luật: Là quy luật về mối quan hệ quy định lẫn nhau giữa các thành phần và giữa các bộ phận lãnh thổ của vỏ địa lí. Trong vỏ địa lí, mỗi thành phần không tồn tại biệt lập mà liên kết chặt chẽ với nhau. Khi một thành phần bị thay đổi sẽ kéo theo sự thay đổi của các thành phần còn lại và dẫn tới sự biến đổi của toàn bộ cảnh quan tự nhiên.',
          'Cơ chế: Các dòng vật chất và năng lượng không ngừng luân chuyển giữa các quyển (vòng tuần hoàn nước, chu trình cacbon, chu trình nitơ).'
        ],
      },
      {
        sectionTitle: '3. Ý nghĩa thực tiễn sâu sắc của quy luật',
        content: [
          'Trước khi tiến hành bất kì hoạt động can thiệp nào vào tự nhiên (xây đập thủy điện, khai thác mỏ đá vôi, mở đường giao thông, khai hoang rừng), con người phải nghiên cứu kĩ lưỡng và dự báo trước những hậu quả dây chuyền có thể xảy ra đối với môi trường sinh thái.',
          'Phát triển kinh tế phải đi đôi với bảo vệ cân bằng sinh thái, không vì lợi ích trước mắt mà phá vỡ trật tự thống nhất của tự nhiên.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Vỏ địa lí (Geographical Envelope)',
        definition: 'Lớp vỏ phức hợp của Trái Đất có chiều dày khoảng 30 - 35 km, nơi các quyển tiếp xúc, thâm nhập và tác động qua lại tạo nên môi trường sống của loài người.'
      },
      {
        term: 'Quy luật thống nhất và hoàn chỉnh',
        definition: 'Quy luật về mối quan hệ quy định lẫn nhau giữa các thành phần tự nhiên, trong đó sự thay đổi của một thành phần tất yếu kéo theo sự biến đổi của các thành phần khác.'
      },
      {
        term: 'Biến đổi dây chuyền',
        definition: 'Hiện tượng một tác động ban đầu vào một yếu tố môi trường kích hoạt hàng loạt phản ứng biến đổi tiếp theo ở các yếu tố khác trong hệ sinh thái.'
      }
    ],
    realWorldExamples: [
      'Bài học thực tiễn tại khu vực Chi Lăng (Lạng Sơn): Nếu rừng đầu nguồn trên các khối núi đá vôi bị chặt phá -> nước mưa rơi xuống không được giữ lại -> xói mòn trơ sỏi đá -> mạch nước ngầm cạn kiệt trong mùa khô -> thiếu nước tưới cho na Chi Lăng tại xã Vạn Linh -> mùa mưa sinh ra lũ quét và sạt lở đá lăn xuống khu dân cư.',
      'Nhận thức rõ quy luật này, Đảng bộ và nhân dân xã Vạn Linh luôn kết hợp trồng na với trồng rừng bảo vệ độ ẩm đất và mạch nước ngầm.'
    ],
    keyTakeaways: [
      'Vỏ địa lí là thể tổng hợp hoàn chỉnh của 5 quyển tự nhiên dày khoảng 30-35 km.',
      'Một thành phần thay đổi sẽ kéo theo sự thay đổi của toàn bộ hệ thống tự nhiên.',
      'Cần dự báo tác động môi trường trước mọi dự án kinh tế tại Lạng Sơn để bảo tồn cân bằng sinh thái.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 17. Vỏ địa lí, quy luật thống nhất và hoàn chỉnh của vỏ địa lí',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 17. Vỏ địa lí, quy luật thống nhất và hoàn chỉnh của vỏ địa lí',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 17']
    }
  },
  {
    id: 'bai-18',
    number: 18,
    partId: 'phan-2',
    chapterId: 'chuong-7',
    topicId: 'chuong-7',
    title: 'Bài 18. Quy luật địa đới và quy luật phi địa đới',
    subtitle: 'Quy luật phân bố tự nhiên theo vĩ độ (địa đới) và theo đai cao, lục địa - đại dương (phi địa đới)',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được khái niệm, nguyên nhân và các biểu hiện của quy luật địa đới trong tự nhiên.',
      'Trình bày được khái niệm, nguyên nhân và các biểu hiện của quy luật phi địa đới (gồm quy luật đai cao và quy luật địa ô).',
      'So sánh được sự khác biệt giữa quy luật địa đới và phi địa đới; nhận thức được sự phối hợp đồng thời của 2 quy luật trên bề mặt lãnh thổ.',
      'Tính toán được nhiệt độ theo vĩ độ và theo đai cao, giải thích sự phân tầng thực vật trên núi đá vôi ở Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Quy luật Địa đới',
        content: [
          'Khái niệm: Là sự thay đổi có quy luật của tất cả các thành phần địa lí và cảnh quan địa lí theo vĩ độ (từ Xích đạo về hai cực).',
          'Nguyên nhân: Do Trái Đất hình cầu và trục nghiêng không đổi phương, làm cho góc nhập xạ của tia sáng mặt trời giảm dần từ Xích đạo về hai cực, lượng bức xạ mặt trời phân bố theo đới.',
          'Biểu hiện: Sự phân bố theo đới của bức xạ mặt trời -> 7 đai khí áp và các đới gió -> 7 đới khí hậu -> các đới đất và các thảm thực vật chính trên Trái Đất.'
        ],
        highlight: 'Quy luật địa đới là quy luật phổ biến nhất, chi phối sự phân bố không gian vĩ mô của tự nhiên từ Xích đạo về cực.',
      },
      {
        sectionTitle: '2. Quy luật Phi địa đới',
        content: [
          'Khái niệm: Là quy luật phân bố không phụ thuộc vào tính chất phân bố theo địa đới của các thành phần địa lí và cảnh quan địa lí.',
          'Nguyên nhân: Do nguồn năng lượng nội lực bên trong Trái Đất tạo nên sự phân chia bề mặt thành lục địa, đại dương và địa hình núi cao.',
          'Biểu hiện:',
          '- Quy luật đai cao: Sự thay đổi có quy luật của các thành phần và cảnh quan địa lí theo độ cao địa hình (do càng lên cao nhiệt độ giảm 0,6°C/100m, độ ẩm thay đổi sinh ra các đai thực vật và đai đất theo độ cao).',
          '- Quy luật địa ô: Sự thay đổi có quy luật của các thành phần và cảnh quan địa lí theo kinh độ (từ duyên hải ven biển vào sâu trong nội địa do sự phân bố lục địa - đại dương làm lượng mưa giảm dần).'
        ],
      },
      {
        sectionTitle: '3. Mối quan hệ giữa quy luật địa đới và phi địa đới',
        content: [
          'Quy luật địa đới và quy luật phi địa đới diễn ra đồng thời và tác động tương hỗ lẫn nhau.',
          'Quy luật địa đới tạo nên nền tảng phân bố chung theo vĩ độ; quy luật phi địa đới làm biến tính, chi tiết hóa và tạo nên sự đa dạng phức tạp của cảnh quan thiên nhiên trên từng vùng lãnh thổ cụ thể.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Quy luật địa đới (Zonality)',
        definition: 'Sự thay đổi có quy luật của các thành phần địa lí và cảnh quan theo vĩ độ từ Xích đạo về hai cực do sự giảm dần góc nhập xạ.'
      },
      {
        term: 'Quy luật phi địa đới (Azonal)',
        definition: 'Sự phân bố của các thành phần tự nhiên không phụ thuộc vào vĩ độ mà do tác động của độ cao địa hình (đai cao) và khoảng cách xa biển (địa ô).'
      },
      {
        term: 'Quy luật đai cao',
        definition: 'Sự thay đổi của nhiệt ẩm, đất đai và sinh vật theo độ cao địa hình núi, tương tự như sự thay đổi từ vĩ độ thấp lên vĩ độ cao.'
      }
    ],
    realWorldExamples: [
      'Theo quy luật địa đới, tỉnh Lạng Sơn nằm trong đới khí hậu nhiệt đới gió mùa có mùa đông lạnh; nhưng theo quy luật phi địa đới (đai cao), các đỉnh núi cao trên 800 - 1.000 m ở Lạng Sơn lại xuất hiện đai cận nhiệt đới trên núi với các loài thực vật dẻ, re và có sương muối vào mùa đông.',
      'Tại các thung lũng karst kín ở xã Vạn Linh và xã Chi Lăng, hiện tượng nghịch nhiệt vào ban đêm mùa đông (không khí lạnh nặng chìm xuống đáy thung lũng) là biểu hiện vi khí hậu phi địa đới độc đáo.'
    ],
    keyTakeaways: [
      'Quy luật địa đới do bức xạ mặt trời (ngoại lực) chi phối theo chiều vĩ độ.',
      'Quy luật phi địa đới do nội lực tạo địa hình núi cao (đai cao) và lục địa - đại dương (địa ô) chi phối.',
      'Thiên nhiên Việt Nam và Lạng Sơn mang tính chất nhiệt đới ẩm gió mùa (địa đới) nhưng có sự phân hóa sâu sắc theo đai cao đồi núi (phi địa đới).'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 18. Quy luật địa đới và quy luật phi địa đới',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 18. Quy luật địa đới và quy luật phi địa đới',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 18']
    }
  },
  {
    id: 'bai-19',
    number: 19,
    partId: 'phan-3',
    chapterId: 'chuong-8',
    topicId: 'chuong-8',
    title: 'Bài 19. Quy mô và sự gia tăng dân số, cơ cấu dân số',
    subtitle: 'Quy mô dân số toàn cầu, gia tăng tự nhiên, gia tăng cơ học, cơ cấu sinh học và cơ cấu xã hội của dân số',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được tình hình phát triển quy mô dân số thế giới và xu hướng biến động hiện nay.',
      'Phân biệt được tỉ suất gia tăng tự nhiên (Tg = S - T), gia tăng cơ học và gia tăng thực tế của dân số.',
      'Phân tích được cơ cấu sinh học (giới tính, độ tuổi, 3 kiểu tháp dân số cơ bản) và cơ cấu xã hội (lao động theo nhóm ngành).',
      'Tính toán thành thạo tỉ suất gia tăng tự nhiên, tỉ số giới tính và liên hệ với đặc điểm dân số tại xã Vạn Linh, khu vực Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Quy mô và sự gia tăng dân số thế giới',
        content: [
          'Quy mô dân số thế giới đã vượt mốc 8 tỉ người (năm 2022) và tiếp tục tăng nhưng tốc độ gia tăng có xu hướng chậm dần lại.',
          'Gia tăng tự nhiên: Là hiệu số giữa tỉ suất sinh thô (S) và tỉ suất tử thô (T), kí hiệu Tg = S - T (đơn vị tính là % hoặc ‰). Gia tăng tự nhiên là động lực chính quyết định biến động số dân toàn cầu.',
          'Gia tăng cơ học: Là hiệu số giữa số người nhập cư và xuất cư. Trên phạm vi toàn thế giới gia tăng cơ học bằng 0, nhưng có ý nghĩa lớn đối với từng quốc gia và địa phương.',
          'Gia tăng thực tế: Tổng của gia tăng tự nhiên và gia tăng cơ học.'
        ],
        highlight: 'Công thức tính gia tăng tự nhiên: Tg (%) = (Tỉ suất sinh ‰ - Tỉ suất tử ‰) / 10. Tỉ số giới tính: Tgt = (Dân số nam / Dân số nữ) × 100.',
      },
      {
        sectionTitle: '2. Cơ cấu sinh học của dân số',
        content: [
          'a) Cơ cấu theo giới tính: Thể hiện tương quan giữa số nam và số nữ. Tỉ số giới tính Tgt = (Số nam / Số nữ) × 100; Tỉ lệ giới tính = (Số nam hoặc nữ / Tổng số dân) × 100%. Bị tác động bởi sinh học, chiến tranh, di cư và tâm lí xã hội.',
          'b) Cơ cấu theo tuổi: Chia làm 3 nhóm tuổi chính: Dưới tuổi lao động (0 - 14 tuổi), Trong độ tuổi lao động (15 - 64 tuổi), Trên độ tuổi lao động (từ 65 tuổi trở lên).',
          'Tháp dân số (tháp tuổi) thể hiện trực quan cơ cấu tuổi và giới tính: Tháp mở rộng (dân số trẻ), Tháp thu hẹp (dân số già), Tháp ổn định.'
        ],
      },
      {
        sectionTitle: '3. Cơ cấu xã hội của dân số',
        content: [
          'Cơ cấu dân số theo lao động: Phản ánh tỉ lệ lao động trong các khu vực kinh tế (Nông - lâm - thủy sản; Công nghiệp - xây dựng; Dịch vụ). Xu hướng chung toàn cầu là giảm tỉ lệ lao động nông nghiệp, tăng tỉ lệ lao động công nghiệp và dịch vụ.',
          'Cơ cấu theo trình độ học vấn: Đo lường chất lượng nguồn nhân lực quốc gia thông qua tỉ lệ biết chữ và số năm đi học bình quân.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tỉ suất gia tăng tự nhiên (Tg)',
        definition: 'Hiệu số giữa tỉ suất sinh thô và tỉ suất tử thô, biểu thị mức độ tăng dân số tự nhiên trong năm, đơn vị % hoặc ‰.'
      },
      {
        term: 'Tỉ số giới tính (Sex ratio)',
        definition: 'Số lượng nam giới tương ứng trên 100 nữ giới trong một quần thể dân cư.'
      },
      {
        term: 'Tháp dân số (Population Pyramid)',
        definition: 'Biểu đồ hình tháp thể hiện cơ cấu dân số theo độ tuổi và giới tính của một quốc gia hay vùng lãnh thổ tại một thời điểm.'
      }
    ],
    realWorldExamples: [
      'Tại xã Vạn Linh (tỉnh Lạng Sơn), dân số chủ yếu là đồng bào các dân tộc Tày, Nùng, Kinh cùng chung sống đoàn kết; nhờ thực hiện tốt chính sách dân số và kế hoạch hóa gia đình, tỉ suất gia tăng tự nhiên đã giảm về mức hợp lí dưới 1,0%/năm.',
      'Địa bàn xã Chi Lăng và xã Vạn Linh đang trong thời kì cơ cấu \'dân số vàng\' với tỉ lệ người trong độ tuổi lao động chiếm trên 65%, cung cấp lực lượng lao động trẻ, dồi dào cho các vùng thâm canh na và tiểu thủ công nghiệp Lạng Sơn.'
    ],
    keyTakeaways: [
      'Gia tăng tự nhiên là động lực chính làm tăng dân số toàn cầu; công thức Tg = (S - T)/10 (%).',
      'Cơ cấu dân số theo tuổi và giới tính được biểu thị chuẩn xác qua tháp dân số.',
      'Cơ cấu dân số vàng tại Lạng Sơn là cơ hội lớn để bứt phá phát triển kinh tế nông sản hàng hóa.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 19. Quy mô và sự gia tăng dân số, cơ cấu dân số',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 19. Quy mô và sự gia tăng dân số, cơ cấu dân số',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 19']
    }
  },
  {
    id: 'bai-20',
    number: 20,
    partId: 'phan-3',
    chapterId: 'chuong-8',
    topicId: 'chuong-8',
    title: 'Bài 20. Phân bố dân cư và đô thị hóa',
    subtitle: 'Quy luật phân bố dân cư thế giới, các nhân tố ảnh hưởng và đặc điểm quá trình đô thị hóa',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Nêu được khái niệm mật độ dân số và phân tích được quy luật phân bố dân cư không đồng đều trên thế giới.',
      'Phân tích được tác động của các nhân tố tự nhiên (vị trí, địa hình, khí hậu, nước) và nhân tố kinh tế - xã hội (trình độ sản xuất, lịch sử khai thác) đến phân bố dân cư.',
      'Trình bày được khái niệm, 3 đặc điểm cơ bản của đô thị hóa và đánh giá được tác động hai mặt của đô thị hóa.',
      'Tính toán thành thạo mật độ dân số, tỉ lệ dân thành thị và liên hệ với mạng lưới phân bố dân cư tại xã Vạn Linh và xã Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Sự phân bố dân cư trên thế giới',
        content: [
          'Dân cư trên Trái Đất phân bố rất không đều trong không gian:',
          '- Nơi dân cư tập trung đông đúc: Các vùng đồng bằng châu thổ màu mỡ, vùng duyên hải ven biển, các thung lũng có khí hậu ấm áp ẩm ướt, nơi có các đô thị và khu công nghiệp phát triển (Đông Á, Nam Á, Tây Âu, Đông Bắc Hoa Kỳ).',
          '- Nơi dân cư thưa thớt: Vùng cực lạnh giá, các hoang mạc khô hạn (Sahara, Trung Á), các vùng núi cao hiểm trở rừng rậm nhiệt đới (Amazon).',
          'Thước đo phân bố dân cư là Mật độ dân số = Dân số / Diện tích (người/km²).'
        ],
        highlight: 'Trình độ phát triển của phương thức sản xuất và tính chất của nền kinh tế là nhân tố quyết định trực tiếp đến sự phân bố dân cư.',
      },
      {
        sectionTitle: '2. Các nhân tố ảnh hưởng đến phân bố dân cư',
        content: [
          'a) Nhân tố kinh tế - xã hội (vai trò quyết định): Trình độ phát triển của lực lượng sản xuất; Tính chất của nền kinh tế; Lịch sử khai thác lãnh thổ; Các luồng chuyển cư di dân.',
          'b) Nhân tố tự nhiên (vai trò tạo điều kiện thuận lợi hoặc khó khăn): Vị trí địa lí; Địa hình và đất đai; Khí hậu và nguồn nước; Tài nguyên khoáng sản.'
        ],
      },
      {
        sectionTitle: '3. Đô thị hóa và tác động của nó',
        content: [
          'Đô thị hóa là quá trình kinh tế - xã hội mà biểu hiện là sự tăng nhanh về số lượng và quy mô của các điểm dân cư đô thị, sự tập trung dân cư trong các thành phố và sự phổ biến rộng rãi lối sống đô thị.',
          'Ba đặc điểm chính: Dân cư thành thị tăng nhanh; Dân cư tập trung vào các thành phố lớn và cực lớn; Lối sống đô thị phổ biến rộng rãi.',
          'Tác động tích cực: Thúc đẩy tăng trưởng kinh tế, chuyển dịch cơ cấu ngành, tạo việc làm, nâng cao chất lượng cuộc sống.',
          'Tác động tiêu cực (khi đô thị hóa tự phát, không gắn với công nghiệp hóa): Ùn tắc giao thông, ô nhiễm môi trường, thiếu nhà ở, thất nghiệp, tệ nạn xã hội.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Mật độ dân số',
        definition: 'Số lượng dân cư sinh sống trung bình trên một đơn vị diện tích lãnh thổ (thường tính bằng người/km²).'
      },
      {
        term: 'Đô thị hóa (Urbanization)',
        definition: 'Quá trình kinh tế - xã hội thể hiện qua sự gia tăng tỉ lệ dân thành thị, mở rộng quy mô các thành phố và lan tỏa lối sống đô thị.'
      },
      {
        term: 'Tỉ lệ dân thành thị',
        definition: 'Tỉ số phần trăm giữa số dân sinh sống ở khu vực đô thị so với tổng số dân của một quốc gia hay vùng lãnh thổ.'
      }
    ],
    realWorldExamples: [
      'Tại tỉnh Lạng Sơn và các xã Chi Lăng, Vạn Linh, dân cư phân bố không đều: tập trung đông đúc tại trung tâm xã Chi Lăng và các thung lũng ven sông Thương; trong khi các khu vực vùng cao núi đá dân cư thưa thớt hơn.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), các điểm dân cư phân bố tập trung theo các cụm làng bản truyền thống dưới chân núi đá vôi và dọc theo các trục đường liên xã bê tông hóa thuận lợi giao thương nông sản.'
    ],
    keyTakeaways: [
      'Dân cư phân bố không đều; mật độ dân số = Dân số / Diện tích (người/km²).',
      'Nhân tố kinh tế - xã hội quyết định sự phân bố dân cư và quá trình đô thị hóa.',
      'Quá trình xây dựng Nông thôn mới nâng cao tại xã Vạn Linh gắn liền với hiện đại hóa nông thôn và lan tỏa lối sống văn minh.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 20. Phân bố dân cư và đô thị hóa',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 20. Phân bố dân cư và đô thị hóa',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 20']
    }
  },
  {
    id: 'bai-21',
    number: 21,
    partId: 'phan-3',
    chapterId: 'chuong-9',
    topicId: 'chuong-9',
    title: 'Bài 21. Các nguồn lực phát triển kinh tế',
    subtitle: 'Khái niệm nguồn lực, phân loại theo nguồn gốc và phạm vi, vai trò của từng nguồn lực đối với tăng trưởng kinh tế',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được khái niệm nguồn lực phát triển kinh tế và các cách phân loại nguồn lực chủ yếu.',
      'Phân tích được vai trò của từng loại nguồn lực: vị trí địa lí (thuận lợi trao đổi), tự nhiên (cơ sở vật chất tiền đề), kinh tế - xã hội (nhân tố quyết định).',
      'Tính toán được cơ cấu các nguồn vốn đầu tư phát triển và hiệu quả sử dụng nguồn lực.',
      'Xác định được các nguồn lực thế mạnh nổi trội của khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm và phân loại nguồn lực phát triển kinh tế',
        content: [
          'Nguồn lực phát triển kinh tế là tổng thể vị trí địa lí, các tài nguyên thiên nhiên, hệ thống tài sản quốc gia, nguồn nhân lực, đường lối chính sách, vốn và công nghệ... có thể được khai thác nhằm phục vụ cho sự phát triển kinh tế của một lãnh thổ nhất định.',
          'Phân loại theo nguồn gốc hình thành: Nguồn lực vị trí địa lí; Nguồn lực tự nhiên; Nguồn lực kinh tế - xã hội.',
          'Phân loại theo phạm vi lãnh thổ: Nguồn lực trong nước (nội lực); Nguồn lực ngoài nước (ngoại lực).'
        ],
        highlight: 'Nội lực giữ vai trò quyết định, ngoại lực giữ vai trò quan trọng; kết hợp tối ưu nội lực và ngoại lực là chìa khóa phát triển nhanh và bền vững.',
      },
      {
        sectionTitle: '2. Vai trò của từng loại nguồn lực',
        content: [
          'a) Nguồn lực vị trí địa lí: Tạo điều kiện thuận lợi hoặc khó khăn trong việc giao lưu hợp tác kinh tế, lựa chọn bạn hàng và mở rộng thị trường.',
          'b) Nguồn lực tự nhiên: Là tiền đề, cơ sở vật chất tự nhiên không thể thiếu cho các hoạt động sản xuất (đất đai, khoáng sản, nước, sinh vật, khí hậu).',
          'c) Nguồn lực kinh tế - xã hội: Giữ vai trò quyết định đối với sự phát triển kinh tế. Bao gồm nguồn lao động và chất lượng nguồn nhân lực; Vốn đầu tư và công nghệ; Đường lối, chính sách và thể chế kinh tế; Thị trường tiêu thụ.'
        ],
      },
      {
        sectionTitle: '3. Kết hợp hài hòa các nguồn lực trong phát triển',
        content: [
          'Muốn phát triển kinh tế nhanh và bền vững, mỗi địa phương phải đánh giá đúng tiềm năng, phát huy tối đa lợi thế so sánh của nguồn lực nội tại, đồng thời tranh thủ nguồn vốn đầu tư, công nghệ và thị trường từ bên ngoài.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Nguồn lực kinh tế',
        definition: 'Toàn bộ các yếu tố vật chất và phi vật chất có thể huy động vào quá trình sản xuất nhằm tạo ra của cải cho xã hội.'
      },
      {
        term: 'Nội lực (Internal resources)',
        definition: 'Các nguồn lực sẵn có bên trong phạm vi quốc gia hay địa phương như đất đai, con người, vốn tích lũy nội bộ.'
      },
      {
        term: 'Ngoại lực (External resources)',
        definition: 'Các nguồn lực từ bên ngoài lãnh thổ như vốn đầu tư trực tiếp nước ngoài (FDI), công nghệ chuyển giao, kinh nghiệm quản lí quốc tế.'
      }
    ],
    realWorldExamples: [
      'Nguồn lực thế mạnh của xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn): Vị trí nằm trên hành lang kinh tế Bắc - Nam kết nối Hà Nội - Lạng Sơn - Trung Quốc; tài nguyên đất feralit trên núi đá vôi màu mỡ; nguồn lao động cần cù, sáng tạo, giàu kinh nghiệm thuần hóa cây na trên vách đá.',
      'Khai thác ngoại lực: Nông dân Chi Lăng tiếp nhận chuyển giao tiến bộ khoa học kĩ thuật thụ phấn nhân tạo cho na, thu hút vốn từ các chương trình mục tiêu quốc gia để hoàn thiện hạ tầng tưới tiêu và đường giao thông.'
    ],
    keyTakeaways: [
      'Nguồn lực tự nhiên là tiền đề cơ sở; nguồn lực kinh tế - xã hội giữ vai trò quyết định.',
      'Nội lực là nền tảng cốt lõi, ngoại lực tạo động lực thúc đẩy.',
      'Chi Lăng (Lạng Sơn) phát triển vững chắc nhờ khai thác đồng bộ lợi thế đất đá vôi và trí tuệ người nông dân bản địa.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 21. Các nguồn lực phát triển kinh tế',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 21. Các nguồn lực phát triển kinh tế',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 21']
    }
  },
  {
    id: 'bai-22',
    number: 22,
    partId: 'phan-3',
    chapterId: 'chuong-9',
    topicId: 'chuong-9',
    title: 'Bài 22. Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia',
    subtitle: 'Khái niệm cơ cấu kinh tế, các bộ phận hợp thành, chỉ số GDP, GNI và GDP bình quân đầu người',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được khái niệm cơ cấu kinh tế và phân tích được 3 bộ phận hợp thành cơ cấu kinh tế (ngành, thành phần, lãnh thổ).',
      'Phân biệt được bản chất kinh tế của hai chỉ tiêu then chốt: Tổng sản phẩm trong nước (GDP) và Tổng thu nhập quốc gia (GNI).',
      'Tính toán thành thạo cơ cấu GDP theo 3 khu vực kinh tế (%), tính GDP bình quân đầu người ($/người) và tốc độ tăng trưởng GDP.',
      'Nhận biết được xu hướng chuyển dịch cơ cấu kinh tế theo hướng tích cực tại tỉnh Lạng Sơn và khu vực Chi Lăng.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Cơ cấu kinh tế và các bộ phận hợp thành',
        content: [
          'Cơ cấu kinh tế là tổng thể các ngành, các lĩnh vực, các bộ phận kinh tế có quan hệ hữu cơ tương đối ổn định hợp thành nền kinh tế quốc dân.',
          'a) Cơ cấu kinh tế theo ngành: Gồm 3 khu vực: Khu vực I (Nông nghiệp, lâm nghiệp, thủy sản); Khu vực II (Công nghiệp và xây dựng); Khu vực III (Dịch vụ). Xu hướng tiến bộ là giảm tỉ trọng khu vực I, tăng tỉ trọng khu vực II và khu vực III.',
          'b) Cơ cấu kinh tế theo thành phần kinh tế: Thể hiện quan hệ sở hữu tư liệu sản xuất (kinh tế nhà nước, kinh tế ngoài nhà nước, kinh tế có vốn đầu tư nước ngoài).',
          'c) Cơ cấu kinh tế theo lãnh thổ: Hình thành từ sự phân công lao động theo không gian (các vùng kinh tế, khu công nghiệp, vùng chuyên canh nông nghiệp).'
        ],
        highlight: 'Chỉ số GDP bình quân đầu người = Tổng GDP / Tổng số dân (USD/người). Tỉ trọng ngành i (%) = (Giá trị ngành i / Tổng GDP) × 100.',
      },
      {
        sectionTitle: '2. Tổng sản phẩm trong nước (GDP) và Tổng thu nhập quốc gia (GNI)',
        content: [
          'a) GDP (Gross Domestic Product): Là tổng giá trị thị trường của tất cả hàng hóa và dịch vụ cuối cùng được sản xuất ra trên phạm vi lãnh thổ một quốc gia trong một thời kì nhất định (thường là một năm), không phân biệt do người trong nước hay người nước ngoài tạo ra.',
          'b) GNI (Gross National Income): Là tổng thu nhập từ các sản phẩm và dịch vụ cuối cùng do công dân một quốc gia tạo ra trong một thời kì nhất định (bằng GDP cộng thu nhập từ sở hữu nhận được từ nước ngoài trừ thu nhập từ sở hữu chi trả cho nước ngoài).',
          'c) GDP và GNI bình quân đầu người: Thước đo quan trọng nhất phản ánh mức sống và trình độ phát triển kinh tế của người dân.'
        ],
      },
      {
        sectionTitle: '3. Phương pháp tính toán cơ cấu và tăng trưởng kinh tế',
        content: [
          '1. Cơ cấu GDP theo ngành (%): % Khu vực I = (Khu vực I / Tổng GDP) × 100%.',
          '2. Tốc độ tăng trưởng GDP (%): Tốc độ năm sau so với năm trước = [(GDP năm sau - GDP năm trước) / GDP năm trước] × 100%.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tổng sản phẩm trong nước (GDP)',
        definition: 'Tổng giá trị tính bằng tiền của tất cả sản phẩm và dịch vụ cuối cùng sản xuất ra trên lãnh thổ quốc gia trong một năm.'
      },
      {
        term: 'Tổng thu nhập quốc gia (GNI)',
        definition: 'Tổng thu nhập do các chủ thể kinh tế trong nước tạo ra cả ở trong nước và ngoài nước trong một năm.'
      },
      {
        term: 'Chuyển dịch cơ cấu kinh tế',
        definition: 'Quá trình thay đổi tỉ trọng giữa các ngành, các thành phần và các vùng kinh tế theo hướng hợp lí và hiện đại hơn.'
      }
    ],
    realWorldExamples: [
      'Tại khu vực Chi Lăng (Lạng Sơn), cơ cấu kinh tế đang chuyển dịch tích cực: tỉ trọng ngành dịch vụ thương mại nông sản và công nghiệp chế biến vật liệu xây dựng tăng nhanh, tỉ trọng trồng trọt truyền thống giảm nhưng giá trị gia tăng trên 1 ha canh tác tăng cao nhờ cây na đặc sản.',
      'Thu nhập bình quân đầu người tại xã Vạn Linh (tỉnh Lạng Sơn) đã tăng trưởng vượt bậc, đạt chuẩn xã Nông thôn mới nâng cao nhờ thương hiệu Na Chi Lăng vươn tầm toàn quốc.'
    ],
    keyTakeaways: [
      'Cơ cấu kinh tế gồm 3 bộ phận: ngành, thành phần và lãnh thổ.',
      'GDP tính theo lãnh thổ; GNI tính theo quyền sở hữu công dân.',
      'Chuyển dịch cơ cấu kinh tế theo hướng công nghiệp hóa, hiện đại hóa và nâng cao dịch vụ là quy luật tất yếu.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 22. Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 22. Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 22']
    }
  },
  {
    id: 'bai-23',
    number: 23,
    partId: 'phan-3',
    chapterId: 'chuong-10',
    topicId: 'chuong-10',
    title: 'Bài 23. Vai trò, đặc điểm, các nhân tố ảnh hưởng đến sự phát triển và phân bố nông nghiệp, lâm nghiệp, thủy sản',
    subtitle: 'Vai trò chiến lược của ngành nông - lâm - thủy sản, đặc điểm sản xuất phụ thuộc tự nhiên và các nhân tố chi phối',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được vai trò chiến lược của ngành nông nghiệp, lâm nghiệp và thủy sản đối với an ninh lương thực và phát triển kinh tế.',
      'Phân tích được các đặc điểm đặc thù của sản xuất nông - lâm - thủy sản: đất là tư liệu sản xuất không thể thay thế, đối tượng sản xuất là cơ thể sống, mang tính mùa vụ và phân tán trong không gian.',
      'Đánh giá được tác động của các nhân tố tự nhiên và kinh tế - xã hội đến sự phát triển và phân bố ngành.',
      'Tính toán được tỉ trọng cơ cấu ngành và liên hệ với thực tiễn sản xuất nông nghiệp hàng hóa tại xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Vai trò của nông nghiệp, lâm nghiệp và thủy sản',
        content: [
          'Cung cấp lương thực, thực phẩm thiết yếu nuôi sống toàn bộ xã hội loài người, đảm bảo an ninh lương thực quốc gia và thế giới.',
          'Cung cấp nguồn nguyên liệu phong phú cho ngành công nghiệp chế biến lương thực thực phẩm, dệt may, da giày, dược phẩm.',
          'Là nguồn hàng xuất khẩu có giá trị mang lại nguồn ngoại tệ lớn cho đất nước.',
          'Tạo việc làm và thu nhập cho hàng tỉ lao động nông thôn, giữ vai trò đặc biệt quan trọng trong việc bảo vệ môi trường sinh thái và bảo tồn văn hóa truyền thống.'
        ],
        highlight: 'An ninh lương thực là nền tảng ổn định chính trị, kinh tế và độc lập tự chủ của mỗi quốc gia.',
      },
      {
        sectionTitle: '2. Các đặc điểm của sản xuất nông nghiệp, lâm nghiệp, thủy sản',
        content: [
          'a) Đất trồng và mặt nước là tư liệu sản xuất chủ yếu và không thể thay thế được.',
          'b) Đối tượng của sản xuất nông nghiệp là các cơ thể sống (cây trồng, vật nuôi). Chúng sinh trưởng và phát triển tuân theo các quy luật sinh học nhất định.',
          'c) Sản xuất nông nghiệp mang tính mùa vụ sâu sắc do chịu sự chi phối của chu kì thời tiết và khí hậu.',
          'd) Sản xuất nông nghiệp phân tán trong không gian rộng lớn, phụ thuộc chặt chẽ vào điều kiện tự nhiên.'
        ],
      },
      {
        sectionTitle: '3. Các nhân tố ảnh hưởng đến sự phát triển và phân bố',
        content: [
          'Nhân tố tự nhiên: Quỹ đất và độ phì xác định quy mô và loại cây trồng; Khí hậu và nguồn nước xác định cơ cấu mùa vụ và tính ổn định của sản xuất.',
          'Nhân tố kinh tế - xã hội: Dân cư và nguồn lao động; Tiến bộ khoa học - công nghệ (giống mới, nhà kính, tưới tiết kiệm); Thị trường tiêu thụ (điều tiết sản xuất); Chính sách phát triển nông nghiệp.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tư liệu sản xuất chủ yếu',
        definition: 'Yếu tố vật chất không thể thiếu để tiến hành sản xuất; trong nông nghiệp đó là đất đai và mặt nước nuôi trồng.'
      },
      {
        term: 'Tính mùa vụ',
        definition: 'Đặc điểm sản xuất chỉ diễn ra trong những khoảng thời gian nhất định trong năm do phụ thuộc vào chu kì sinh học và thời tiết.'
      },
      {
        term: 'An ninh lương thực',
        definition: 'Trạng thái mọi người dân luôn có đủ lương thực an toàn, giàu dinh dưỡng đáp ứng nhu cầu ăn uống lành mạnh.'
      }
    ],
    realWorldExamples: [
      'Tại xã Vạn Linh (tỉnh Lạng Sơn), tính mùa vụ thể hiện rất rõ nét: vụ na Chi Lăng thu hoạch rộ trong khoảng tháng 7 - 9 âm lịch; thời gian còn lại người dân chăm sóc vườn, cắt tỉa cành, trồng xen canh rau màu và phát triển chăn nuôi gia cầm.',
      'Tiến bộ khoa học kĩ thuật đã giúp nông dân xã Vạn Linh thụ phấn nhân tạo cho hoa na, rải vụ thu hoạch na sớm và na muộn, giảm áp lực mùa vụ và nâng cao giá bán vượt trội.'
    ],
    keyTakeaways: [
      'Đất là tư liệu sản xuất chủ yếu; đối tượng là sinh vật sống; sản xuất có tính mùa vụ.',
      'Khoa học công nghệ và thị trường là động lực hàng đầu giúp nông nghiệp vượt qua rào cản tự nhiên.',
      'Kinh nghiệm canh tác na gối vụ tại Chi Lăng (Lạng Sơn) là bài học thành công về ứng dụng kĩ thuật nông nghiệp.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 23. Vai trò, đặc điểm, các nhân tố ảnh hưởng đến sự phát triển và phân bố nông nghiệp, lâm nghiệp, thủy sản',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 23. Vai trò, đặc điểm, các nhân tố ảnh hưởng đến sự phát triển và phân bố nông nghiệp, lâm nghiệp, thủy sản',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 23']
    }
  },
  {
    id: 'bai-24',
    number: 24,
    partId: 'phan-3',
    chapterId: 'chuong-10',
    topicId: 'chuong-10',
    title: 'Bài 24. Địa lí ngành nông nghiệp',
    subtitle: 'Ngành trồng trọt: cây lương thực, cây công nghiệp, cây ăn quả và ngành chăn nuôi gia súc, gia cầm',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được vai trò và đặc điểm sinh thái, tình hình phân bố của các cây lương thực chủ yếu: lúa gạo, lúa mì, ngô.',
      'Phân biệt được vai trò, đặc điểm và phân bố của các nhóm cây công nghiệp (hàng năm, lâu năm) và cây ăn quả nhiệt đới, cận nhiệt.',
      'Trình bày vai trò, đặc điểm và phân bố của ngành chăn nuôi gia súc lớn (trâu, bò), gia súc nhỏ (lợn, cừu) và gia cầm.',
      'Tính toán thành thạo năng suất cây trồng, bình quân lương thực trên đầu người và liên hệ với vùng chuyên canh na Chi Lăng tại xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Ngành trồng trọt: Cây lương thực chính',
        content: [
          'Cây lương thực là nguồn tinh bột nuôi sống nhân loại. Ba cây lương thực chủ lực chiếm hơn 80% sản lượng lương thực toàn cầu:',
          '- Lúa gạo: Cây ưa nhiệt ẩm, cần đất phù sa màu mỡ và nguồn nước dồi dào; phân bố chủ yếu ở khu vực nhiệt đới và cận nhiệt đới gió mùa châu Á (Trung Quốc, Ấn Độ, Việt Nam, Thái Lan).',
          '- Lúa mì: Cây ưa khí hậu ôn hòa, khô ráo hơn, đất màu mỡ (đất đen); phân bố ở vành đai ôn đới (Trung Quốc, Ấn Độ, Nga, Hoa Kỳ, Pháp).',
          '- Ngô: Cây có biên độ sinh thái rộng, chịu hạn tốt hơn; dùng làm lương thực cho người và thức ăn chăn nuôi gia súc; phân bố nhiều nhất ở châu Mĩ (Hoa Kỳ, Brazil, Trung Quốc).'
        ],
        highlight: 'Công thức tính năng suất cây trồng: Năng suất (tạ/ha) = Sản lượng (tạ) / Diện tích gieo trồng (ha). Bình quân lương thực (kg/người) = Sản lượng (kg) / Số dân (người).',
      },
      {
        sectionTitle: '2. Cây công nghiệp và cây ăn quả',
        content: [
          'Cây công nghiệp: Cung cấp nguyên liệu cho công nghiệp chế biến và xuất khẩu. Cây lấy đường (mía ở nhiệt đới, củ cải đường ở ôn đới); Cây lấy dầu (đậu tương, cọ dầu, hướng dương); Cây lấy sợi (bông); Cây đồ uống (cà phê, chè, ca cao); Cây lấy mủ (cao su).',
          'Cây ăn quả: Phát triển mạnh mẽ gắn với nhu cầu nâng cao chất lượng cuộc sống và xuất khẩu. Cây ăn quả nhiệt đới (chuối, xoài, na, nhãn, dứa) và cận nhiệt/ôn đới (cam, táo, nho).'
        ],
      },
      {
        sectionTitle: '3. Ngành chăn nuôi',
        content: [
          'Cung cấp thực phẩm giàu đạm (thịt, sữa, trứng), sức kéo và phân bón hữu cơ cho trồng trọt.',
          'Chăn nuôi phụ thuộc chặt chẽ vào cơ sở nguồn thức ăn (đồng cỏ tự nhiên hoặc hoa màu lương thực chế biến). Xu hướng chăn nuôi hiện đại là chuyển từ chăn thả tự nhiên sang chăn nuôi công nghiệp, trang trại tập trung ứng dụng công nghệ cao.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Năng suất cây trồng',
        definition: 'Khối lượng sản phẩm thu hoạch được trên một đơn vị diện tích gieo trồng (thường tính bằng tạ/ha hoặc tấn/ha).'
      },
      {
        term: 'Bình quân lương thực đầu người',
        definition: 'Số kilôgam lương thực quy đổi tính bình quân trên một đầu người dân trong một năm (kg/người/năm).'
      },
      {
        term: 'Vùng chuyên canh',
        definition: 'Vùng lãnh thổ tập trung trồng một vài loại cây trồng hoặc nuôi một vài loại vật nuôi chủ đạo tạo ra khối lượng nông sản hàng hóa lớn.'
      }
    ],
    realWorldExamples: [
      'Tại xã Chi Lăng và xã Vạn Linh (Lạng Sơn), vùng trồng na chuyên canh tập trung trên diện tích hơn 3.200 ha, trong đó xã Vạn Linh là một trong những trung tâm trọng điểm với năng suất na trung bình đạt từ 90 đến 105 tạ/ha, sản lượng hàng nghìn tấn mỗi vụ.',
      'Nông dân xã Vạn Linh đẩy mạnh mô hình trồng na theo tiêu chuẩn VietGAP, GlobalGAP, kết hợp nuôi lợn thịt an toàn sinh học và gà thả đồi trên nương để tận dụng phụ phẩm nông nghiệp.'
    ],
    keyTakeaways: [
      'Lúa gạo, lúa mì, ngô là ba cây lương thực nuôi sống thế giới.',
      'Năng suất (tạ/ha) = Sản lượng / Diện tích; chỉ số phản ánh trình độ thâm canh nông nghiệp.',
      'Vùng na Chi Lăng (Lạng Sơn) là điển hình thành công của mô hình chuyên canh cây ăn quả đặc sản giá trị cao.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 24. Địa lí ngành nông nghiệp',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 24. Địa lí ngành nông nghiệp',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 24']
    }
  },
  {
    id: 'bai-25',
    number: 25,
    partId: 'phan-3',
    chapterId: 'chuong-10',
    topicId: 'chuong-10',
    title: 'Bài 25. Địa lí ngành lâm nghiệp và ngành thủy sản',
    subtitle: 'Vai trò, tình hình phát triển của ngành lâm nghiệp (trồng và khai thác rừng) và ngành thủy sản (khai thác và nuôi trồng)',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được vai trò kinh tế và bảo vệ môi trường sinh thái to lớn của ngành lâm nghiệp.',
      'Phân tích được tình hình phát triển rừng trồng và vấn đề khai thác rừng bền vững.',
      'Trình bày vai trò và xu hướng phát triển ngành thủy sản: tỉ trọng nuôi trồng thủy sản tăng nhanh so với đánh bắt tự nhiên.',
      'Tính toán thành thạo tỉ lệ che phủ rừng, cơ cấu sản lượng thủy sản và liên hệ với kinh tế lâm nghiệp tại xã Chi Lăng và xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Địa lí ngành lâm nghiệp',
        content: [
          'Vai trò: Cung cấp lâm sản, gỗ, củi, dược liệu; giữ đất, chống xói mòn sườn núi, điều hòa dòng chảy nguồn nước, phòng chống lũ quét, bảo tồn đa dạng sinh học và hấp thụ khí nhà kính CO2.',
          'Tình hình phát triển: Hoạt động lâm nghiệp gồm trồng rừng, chăm sóc và khoanh nuôi tái sinh rừng, bảo vệ rừng và khai thác hợp lí.',
          'Công thức tính tỉ lệ che phủ rừng: Tỉ lệ che phủ (%) = (Diện tích đất có rừng / Tổng diện tích tự nhiên) × 100.'
        ],
        highlight: 'Tỉ lệ che phủ rừng là chỉ số sinh thái quan trọng hàng đầu đánh giá chất lượng môi trường bền vững.',
      },
      {
        sectionTitle: '2. Địa lí ngành thủy sản',
        content: [
          'Vai trò: Cung cấp nguồn đạm dinh dưỡng động vật dồi dào cho con người, nguyên liệu cho công nghiệp chế biến, là mặt hàng xuất khẩu có giá trị cao.',
          'Cơ cấu: Khai thác thủy sản (đánh bắt biển và nội địa) và Nuôi trồng thủy sản (nước ngọt, nước lợ, nước mặn).',
          'Xu hướng: Tỉ trọng sản lượng nuôi trồng tăng liên tục vượt qua sản lượng khai thác do nguồn lợi thủy sản tự nhiên bị suy giảm và công nghệ nuôi trồng tiến bộ vượt bậc.'
        ],
      },
      {
        sectionTitle: '3. Phát triển bền vững ngành lâm nghiệp và thủy sản',
        content: [
          'Bảo vệ diện tích rừng tự nhiên, đẩy mạnh cấp chứng chỉ quản lí rừng bền vững (FSC).',
          'Chuyển dịch sang nuôi trồng thủy sản công nghệ cao, nuôi tôm cá hữu cơ, giảm thiểu đánh bắt hủy diệt để phục hồi nguồn lợi sinh thái.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tỉ lệ che phủ rừng',
        definition: 'Tỉ số phần trăm giữa diện tích đất có rừng (rừng tự nhiên và rừng trồng) so với tổng diện tích tự nhiên của một vùng lãnh thổ.'
      },
      {
        term: 'Nuôi trồng thủy sản',
        definition: 'Hoạt động nhân giống, chăm sóc và thu hoạch các loài động thực vật thủy sinh trong môi trường nước có kiểm soát.'
      },
      {
        term: 'Chứng chỉ rừng bền vững (FSC)',
        definition: 'Hệ thống chứng chỉ quốc tế xác nhận gỗ và lâm sản được khai thác từ những khu rừng được quản lí có trách nhiệm.'
      }
    ],
    realWorldExamples: [
      'Tại tỉnh Lạng Sơn và khu vực Chi Lăng, ngành lâm nghiệp giữ vai trò chủ lực bảo vệ môi trường sinh thái vùng núi; địa phương phát triển mạnh diện tích rừng trồng cây hồi (đặc sản xứ Lạng), thông lấy nhựa và keo lai.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), các hộ gia đình nhận khoán bảo vệ rừng phòng hộ trên núi đá vôi, kết hợp đào ao thả cá nước ngọt (cá trắm cỏ, cá rô phi) tại các vùng bồn trũng để cải thiện thu nhập.'
    ],
    keyTakeaways: [
      'Lâm nghiệp vừa mang giá trị kinh tế vừa giữ vai trò lá chắn sinh thái bảo vệ đất và nước.',
      'Tỉ lệ che phủ rừng (%) = (Diện tích rừng / Diện tích tự nhiên) × 100.',
      'Trồng rừng hồi và thông tại Lạng Sơn là mô hình lâm nghiệp kết hợp kinh tế và bảo vệ môi trường điển hình.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 25. Địa lí ngành lâm nghiệp và ngành thủy sản',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 25. Địa lí ngành lâm nghiệp và ngành thủy sản',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 25']
    }
  },
  {
    id: 'bai-26',
    number: 26,
    partId: 'phan-3',
    chapterId: 'chuong-10',
    topicId: 'chuong-10',
    title: 'Bài 26. Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại trên thế giới và định hướng phát triển nông nghiệp trong tương lai',
    subtitle: 'Các hình thức tổ chức lãnh thổ nông nghiệp, nông nghiệp công nghệ cao, nông nghiệp hữu cơ và nông nghiệp số',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được khái niệm và các hình thức tổ chức lãnh thổ nông nghiệp chủ yếu: trang trại, vùng nông nghiệp.',
      'Phân tích được các xu hướng phát triển nông nghiệp hiện đại: nông nghiệp công nghệ cao, nông nghiệp sinh thái, nông nghiệp tuần hoàn.',
      'Nêu được định hướng phát triển nông nghiệp trong tương lai gắn với chuyển đổi số và phát triển bền vững.',
      'Tính toán quy mô trang trại và đánh giá hiệu quả mô hình hợp tác xã nông nghiệp sản xuất na VietGAP tại xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Các hình thức tổ chức lãnh thổ nông nghiệp',
        content: [
          'Tổ chức lãnh thổ nông nghiệp là sự sắp xếp và phối hợp các ngành nông nghiệp trên một không gian lãnh thổ nhằm khai thác cao nhất các lợi thế so sánh.',
          '- Trang trại: Hình thức cơ sở sản xuất hàng hóa của một hộ gia đình hoặc cá nhân, có quy mô ruộng đất tương đối lớn, ứng dụng máy móc và hướng tới thị trường.',
          '- Vùng nông nghiệp: Hình thức tổ chức lãnh thổ nông nghiệp cấp cao nhất, có sự phân công chuyên môn hóa sản xuất nông sản dựa trên các điều kiện tự nhiên và kinh tế - xã hội đặc thù.'
        ],
        highlight: 'Quy mô diện tích bình quân trang trại = Tổng diện tích đất trang trại / Tổng số trang trại (ha/trang trại).',
      },
      {
        sectionTitle: '2. Nông nghiệp hiện đại trên thế giới',
        content: [
          'Nông nghiệp công nghệ cao: Ứng dụng công nghệ sinh học, tự động hóa, cảm biến IoT, nhà kính thông minh và tưới nước nhỏ giọt tự động.',
          'Nông nghiệp hữu cơ: Không sử dụng phân bón hóa học, thuốc trừ sâu hóa học, chất kích thích tăng trưởng nhằm bảo vệ sức khỏe và môi trường.',
          'Nông nghiệp tuần hoàn: Tận dụng phụ phẩm trồng trọt làm thức ăn chăn nuôi, chất thải chăn nuôi ủ thành phân bón hữu cơ, khép kín chu trình không phát thải rác.'
        ],
      },
      {
        sectionTitle: '3. Định hướng nông nghiệp tương lai và chuyển đổi số',
        content: [
          'Nông nghiệp thông minh thích ứng với biến đổi khí hậu (Smart Agriculture).',
          'Số hóa dữ liệu nông nghiệp: Cấp mã số vùng trồng, gắn tem truy xuất nguồn gốc QR code, giao dịch nông sản trên các sàn thương mại điện tử.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tổ chức lãnh thổ nông nghiệp',
        definition: 'Hệ thống liên kết không gian của các ngành và cơ sở nông nghiệp nhằm phát huy tối đa lợi thế sinh thái và kinh tế của vùng.'
      },
      {
        term: 'Nông nghiệp tuần hoàn',
        definition: 'Mô hình sản xuất nông nghiệp trong đó chất thải của quá trình này trở thành đầu vào của quá trình khác, giảm thiểu phát thải.'
      },
      {
        term: 'Mã số vùng trồng',
        definition: 'Mã định danh cấp cho một vùng trồng trọt nhất định nhằm phục vụ việc theo dõi, kiểm soát chất lượng và truy xuất nguồn gốc sản phẩm.'
      }
    ],
    realWorldExamples: [
      'Tại xã Vạn Linh (tỉnh Lạng Sơn), mô hình Hợp tác xã Nông nghiệp dịch vụ Vạn Linh đã tổ chức nông dân liên kết sản xuất na theo quy chuẩn VietGAP, dán tem truy xuất nguồn gốc điện tử, giúp nâng giá trị na Chi Lăng lên gấp 2-3 lần so với sản xuất manh mún trước đây.',
      'Người dân xã Vạn Linh sáng tạo lắp đặt hệ thống ròng rọc tời tự chế vận hành bằng động cơ xe máy để chuyển hàng chục tấn na từ các sườn núi đá vôi cheo leo xuống thung lũng an toàn, giải phóng sức lao động.'
    ],
    keyTakeaways: [
      'Trang trại và vùng nông nghiệp là các hình thức tổ chức lãnh thổ nông nghiệp tiêu biểu.',
      'Nông nghiệp hiện đại hướng tới công nghệ cao, nông nghiệp hữu cơ, tuần hoàn và ứng dụng chuyển đổi số.',
      'Hợp tác xã nông nghiệp kiểu mới tại xã Vạn Linh (tỉnh Lạng Sơn) là minh chứng sinh động cho việc hiện đại hóa tổ chức sản xuất.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 26. Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại trên thế giới và định hướng phát triển nông nghiệp trong tương lai',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 26. Tổ chức lãnh thổ nông nghiệp, một số vấn đề phát triển nông nghiệp hiện đại trên thế giới và định hướng phát triển nông nghiệp trong tương lai',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 26']
    }
  },
  {
    id: 'bai-27',
    number: 27,
    partId: 'phan-3',
    chapterId: 'chuong-10',
    topicId: 'chuong-10',
    title: 'Bài 27. Thực hành: Vẽ và nhận xét biểu đồ về sự phát triển của ngành nông nghiệp, lâm nghiệp, thủy sản',
    subtitle: 'Xử lí số liệu, tính toán tốc độ tăng trưởng, tính cơ cấu và vẽ nhận xét biểu đồ nông - lâm - thủy sản',
    durationMinutes: 45,
    isPracticeLesson: true,
    objectives: [
      'Biết cách tính toán tốc độ tăng trưởng của các đại lượng địa lí lấy năm gốc bằng 100%.',
      'Tính toán cơ cấu tỉ trọng phần trăm từ bảng số liệu giá trị tuyệt đối.',
      'Biết cách nhận diện và vẽ biểu đồ thích hợp nhất theo yêu cầu (đường, cột, miền, tròn).',
      'Nhận xét sự phát triển và chuyển dịch cơ cấu ngành nông - lâm - thủy sản từ bảng số liệu thực tế.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Phương pháp tính tốc độ tăng trưởng lấy năm gốc = 100%',
        content: [
          'Khi cần so sánh tốc độ tăng trưởng của các đối tượng có đơn vị đo khác nhau (ví dụ so sánh sản lượng lúa - triệu tấn với đàn bò - triệu con), ta phải quy đổi về chỉ số phát triển lấy năm đầu tiên (năm gốc) = 100%.',
          'Công thức: Tốc độ tăng trưởng năm n (%) = (Giá trị năm n / Giá trị năm gốc) × 100%.'
        ],
        highlight: 'Công thức tốc độ tăng trưởng: T = (X_n / X_gốc) × 100 (%). Năm gốc luôn luôn có giá trị 100%.',
      },
      {
        sectionTitle: '2. Phương pháp tính cơ cấu thành phần (%)',
        content: [
          'Chuyển đổi số liệu tuyệt đối sang số liệu tương đối: Tỉ trọng thành phần i (%) = (Giá trị thành phần i / Tổng số) × 100%.',
          'Tổng các thành phần trong cùng một năm luôn bằng đúng 100,0%.'
        ],
      },
      {
        sectionTitle: '3. Kĩ năng nhận xét và giải thích biểu đồ',
        content: [
          'Nêu xu hướng chung (tăng hay giảm, tăng đều hay không đều, mức độ tăng bao nhiêu lần hoặc bao nhiêu %).',
          'So sánh tốc độ giữa các đối tượng (đối tượng nào tăng nhanh nhất, đối tượng nào tăng chậm nhất).',
          'Giải thích nguyên nhân dựa trên các nhân tố chi phối như tiến bộ kĩ thuật, thị trường và chính sách đầu tư.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tốc độ tăng trưởng',
        definition: 'Chỉ số phản ánh mức độ gia tăng nhanh hay chậm của một hiện tượng kinh tế - xã hội qua các thời điểm so với năm gốc (năm gốc = 100%).'
      },
      {
        term: 'Năm gốc',
        definition: 'Năm được chọn làm mốc so sánh chuẩn trong chuỗi chu kì thời gian, có giá trị quy ước là 100%.'
      },
      {
        term: 'Chuyển dịch cơ cấu',
        definition: 'Sự thay đổi tỉ trọng giữa các bộ phận cấu thành trong tổng thể theo thời gian.'
      }
    ],
    realWorldExamples: [
      'Số liệu diện tích và sản lượng na Chi Lăng (Lạng Sơn) giai đoạn 2018 - 2024: Nếu lấy năm 2018 = 100%, đến năm 2024 sản lượng na của địa phương đạt mức tăng trưởng hơn 145%, khẳng định hiệu quả của vùng chuyên canh cây ăn quả đặc sản.',
      'Học sinh xã Vạn Linh (tỉnh Lạng Sơn) thực hành tính toán tỉ trọng giá trị sản xuất giữa trồng na và chăn nuôi gia súc của xã qua các năm để thấy rõ bước chuyển dịch cơ cấu nông thôn mới.'
    ],
    keyTakeaways: [
      'Công thức tốc độ tăng trưởng: (Giá trị năm n / Giá trị năm gốc) × 100 (%).',
      'Kĩ năng nhận xét số liệu là yêu cầu trọng tâm trong các bài thi và kiểm tra đánh giá Địa lí 10.',
      'Số liệu nông nghiệp Chi Lăng (Lạng Sơn) minh chứng cho sự tăng trưởng vượt bậc của kinh tế nông sản hàng hóa.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 27. Thực hành: Vẽ và nhận xét biểu đồ về sự phát triển của ngành nông nghiệp, lâm nghiệp, thủy sản',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 27. Thực hành: Vẽ và nhận xét biểu đồ về sự phát triển của ngành nông nghiệp, lâm nghiệp, thủy sản',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 27']
    }
  },
  {
    id: 'bai-28',
    number: 28,
    partId: 'phan-3',
    chapterId: 'chuong-11',
    topicId: 'chuong-11',
    title: 'Bài 28. Vai trò, đặc điểm, cơ cấu ngành công nghiệp, các nhân tố ảnh hưởng đến sự phát triển và phân bố công nghiệp',
    subtitle: 'Vai trò chủ đạo của công nghiệp, đặc điểm sản xuất 2 giai đoạn, cơ cấu phân ngành và các nhân tố chi phối',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Khẳng định được vai trò chủ đạo của ngành công nghiệp đối với toàn bộ nền kinh tế quốc dân.',
      'Phân tích được 3 đặc điểm đặc thù của sản xuất công nghiệp khác biệt hoàn toàn với nông nghiệp.',
      'Trình bày được cơ cấu ngành công nghiệp theo các nhóm ngành kinh tế chuẩn mực.',
      'Đánh giá được tác động của các nhân tố tự nhiên và kinh tế - xã hội đến phát triển công nghiệp; tính toán cơ cấu công nghiệp và liên hệ với các cơ sở sản xuất tại Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Vai trò của ngành công nghiệp',
        content: [
          'Là ngành sản xuất vật chất giữ vai trò chủ đạo trong nền kinh tế quốc dân: cung cấp tư liệu sản xuất (máy móc, thiết bị, nguyên vật liệu) cho tất cả các ngành kinh tế khác; cung cấp hàng tiêu dùng phong phú cho nhân dân.',
          'Thúc đẩy nhanh quá trình đô thị hóa, chuyển dịch cơ cấu kinh tế, tạo việc làm và nâng cao năng suất lao động xã hội.',
          'Tạo ra các sản phẩm xuất khẩu giá trị cao và củng cố an ninh quốc phòng cho đất nước.'
        ],
        highlight: 'Công nghiệp hóa là con đường tất yếu để chuyển một nước nông nghiệp lạc hậu thành một nước phát triển thịnh vượng.',
      },
      {
        sectionTitle: '2. Các đặc điểm của sản xuất công nghiệp',
        content: [
          'a) Sản xuất công nghiệp bao gồm 2 giai đoạn nối tiếp: Giai đoạn 1: Tác động vào đối tượng tự nhiên để khai thác nguyên liệu (khai thác than, dầu, đá vôi); Giai đoạn 2: Chế biến nguyên liệu thành tư liệu sản xuất và hàng tiêu dùng.',
          'b) Sản xuất công nghiệp có tính chất tập trung cao độ: Trên một diện tích mặt bằng nhất định có thể tập trung nhiều nhà máy, máy móc và công nhân để tạo ra khối lượng sản phẩm khổng lồ.',
          'c) Sản xuất công nghiệp đòi hỏi sự phân công lao động tỉ mỉ và mối quan hệ hợp tác hóa chặt chẽ giữa nhiều xí nghiệp.'
        ],
      },
      {
        sectionTitle: '3. Cơ cấu ngành và các nhân tố ảnh hưởng đến phân bố',
        content: [
          'Cơ cấu ngành công nghiệp gồm 4 nhóm chính: Công nghiệp khai khoáng; Công nghiệp chế biến, chế tạo; Sản xuất và phân phối điện, khí đốt, nước nóng, hơi nước; Cung cấp nước, hoạt động quản lí và xử lí rác thải.',
          'Các nhân tố ảnh hưởng: Vị trí địa lí; Tài nguyên khoáng sản, nước, đất; Dân cư và nguồn lao động; Cơ sở hạ tầng kĩ thuật (giao thông, điện lưới); Vốn đầu tư, công nghệ và thị trường tiêu thụ.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Công nghiệp hóa',
        definition: 'Quá trình chuyển đổi căn bản các hoạt động kinh tế - xã hội từ sử dụng sức lao động thủ công sang sử dụng sức lao động dựa trên công nghệ và máy móc tiên tiến.'
      },
      {
        term: 'Hợp tác hóa trong công nghiệp',
        definition: 'Sự phối hợp hoạt động sản xuất giữa các doanh nghiệp độc lập để cùng tạo ra sản phẩm hoàn chỉnh.'
      },
      {
        term: 'Công nghiệp chế biến, chế tạo',
        definition: 'Ngành biến đổi các nguyên liệu thô thành sản phẩm mới thông qua các quá trình cơ học, hóa học.'
      }
    ],
    realWorldExamples: [
      'Tại khu vực Chi Lăng (Lạng Sơn), ngành công nghiệp phát triển dựa trên lợi thế tài nguyên đá vôi phong phú với Nhà máy xi măng Đồng Bành, các mỏ khai thác đá xây dựng phục vụ các công trình giao thông lớn của tỉnh.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), các cơ sở tiểu thủ công nghiệp phát triển năng động: xưởng cơ khí chế tạo ròng rọc tời núi, xưởng chế biến gỗ bồ đề, keo và cơ sở sơ chế nông sản phục vụ mùa thu hoạch na.'
    ],
    keyTakeaways: [
      'Công nghiệp giữ vai trò chủ đạo trang bị kĩ thuật cho toàn bộ nền kinh tế.',
      'Sản xuất công nghiệp gồm 2 giai đoạn, có tính tập trung cao độ và hợp tác hóa sâu sắc.',
      'Phát triển công nghiệp vật liệu xây dựng và chế biến nông sản tại Chi Lăng (Lạng Sơn) gắn liền với lợi thế địa phương.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 28. Vai trò, đặc điểm, cơ cấu ngành công nghiệp, các nhân tố ảnh hưởng đến sự phát triển và phân bố công nghiệp',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 28. Vai trò, đặc điểm, cơ cấu ngành công nghiệp, các nhân tố ảnh hưởng đến sự phát triển và phân bố công nghiệp',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 28']
    }
  },
  {
    id: 'bai-29',
    number: 29,
    partId: 'phan-3',
    chapterId: 'chuong-11',
    topicId: 'chuong-11',
    title: 'Bài 29. Địa lí một số ngành công nghiệp',
    subtitle: 'Công nghiệp năng lượng (than, dầu khí, điện), luyện kim, cơ khí, điện tử - tin học, hóa chất và thực phẩm',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được vai trò, tình hình sản xuất và phân bố của ngành công nghiệp năng lượng: khai thác than, dầu khí và sản xuất điện.',
      'Phân tích được vai trò và đặc điểm phân bố của công nghiệp cơ khí, điện tử - tin học và công nghiệp chế biến thực phẩm.',
      'Tính toán thành thạo sản lượng điện bình quân đầu người, cơ cấu nguồn điện và sản lượng năng lượng.',
      'Liên hệ với nguồn nhiệt điện than Na Dương và tiềm năng năng lượng mặt trời tại tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Công nghiệp năng lượng: Than, Dầu mỏ, Điện lực',
        content: [
          'Công nghiệp năng lượng là ngành \'xương sống\' cơ sở của toàn bộ nền sản xuất hiện đại:',
          '- Khai thác than: Nhiên liệu cổ truyền cho nhiệt điện và luyện kim. Phân bố tập trung ở các nước có trữ lượng lớn (Trung Quốc, Ấn Độ, Hoa Kỳ, Australia, Nga; ở Việt Nam tập trung tại Quảng Ninh, Lạng Sơn).',
          '- Khai thác dầu mỏ và khí tự nhiên: Được coi là \'vàng đen\', vừa là nhiên liệu vừa là nguyên liệu quý cho công nghiệp hóa dầu. Phân bố ở Trung Đông, Nga, Hoa Kỳ, Bắc Hải.',
          '- Sản xuất điện: Gồm nhiệt điện (than, khí), thủy điện và các nguồn năng lượng tái tạo (điện gió, điện mặt trời). Xu hướng toàn cầu là đẩy mạnh chuyển dịch sang năng lượng tái tạo.'
        ],
        highlight: 'Công thức tính điện bình quân đầu người = Tổng sản lượng điện sản xuất (kWh) / Tổng số dân (người).',
      },
      {
        sectionTitle: '2. Công nghiệp Điện tử - Tin học và Cơ khí',
        content: [
          'Công nghiệp điện tử - tin học: Là ngành kinh tế mũi nhọn của thế giới hiện đại, không cần nhiều diện tích mặt bằng, không tiêu tốn nhiều kim loại nhưng đòi hỏi lao động có hàm lượng tri thức và chất xám cao.',
          'Công nghiệp cơ khí: Cung cấp công cụ, máy móc thiết bị cho mọi ngành kinh tế; phân bố gắn liền với nguồn thép và thị trường tiêu thụ.'
        ],
      },
      {
        sectionTitle: '3. Công nghiệp chế biến lương thực thực phẩm',
        content: [
          'Ngành chế biến nông sản, thực phẩm đáp ứng nhu cầu ăn uống hàng ngày của con người, tăng giá trị nông sản và kéo dài thời gian bảo quản hàng hóa; phân bố rất rộng rãi phụ thuộc vào vùng nguyên liệu nông nghiệp và thị trường người tiêu dùng.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Công nghiệp năng lượng',
        definition: 'Tập hợp các ngành khai thác nhiên liệu (than, dầu, khí) và sản xuất điện năng phục vụ đời sống và sản xuất.'
      },
      {
        term: 'Năng lượng tái tạo',
        definition: 'Năng lượng thu được từ các nguồn tự nhiên liên tục được tái tạo như bức xạ mặt trời, gió, thủy triều, địa nhiệt.'
      },
      {
        term: 'Công nghiệp điện tử - tin học',
        definition: 'Ngành sản xuất các linh kiện, máy vi tính, thiết bị viễn thông và phần mềm công nghệ cao.'
      }
    ],
    realWorldExamples: [
      'Tại tỉnh Lạng Sơn, nguồn năng lượng nhiệt điện than được cung cấp từ Nhà máy nhiệt điện Na Dương (công suất trên 110 MW) sử dụng than nâu mỏ Na Dương.',
      'Khu vực Chi Lăng và xã Vạn Linh có tiềm năng số giờ nắng cao trong năm, nhiều hộ gia đình và trang trại đã lắp đặt hệ thống điện mặt trời áp mái để tự chủ nguồn điện tưới tiêu vườn na và sinh hoạt.'
    ],
    keyTakeaways: [
      'Công nghiệp năng lượng là tiền đề thiết yếu cho sự phát triển của mọi ngành kinh tế.',
      'Điện bình quân đầu người là thước đo phản ánh mức độ hiện đại hóa của một quốc gia.',
      'Chuyển đổi từ năng lượng hóa thạch sang năng lượng tái tạo là xu thế sống còn toàn cầu.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 29. Địa lí một số ngành công nghiệp',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 29. Địa lí một số ngành công nghiệp',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 29']
    }
  },
  {
    id: 'bai-30',
    number: 30,
    partId: 'phan-3',
    chapterId: 'chuong-11',
    topicId: 'chuong-11',
    title: 'Bài 30. Tổ chức lãnh thổ công nghiệp',
    subtitle: 'Khái niệm, vai trò và 4 hình thức tổ chức lãnh thổ công nghiệp từ điểm công nghiệp đến vùng công nghiệp',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được khái niệm và vai trò quan trọng của tổ chức lãnh thổ công nghiệp.',
      'Phân biệt được đặc điểm và quy mô của 4 hình thức tổ chức lãnh thổ công nghiệp chủ yếu từ thấp đến cao: Điểm công nghiệp -> Cụm công nghiệp -> Khu công nghiệp -> Vùng công nghiệp.',
      'Tính toán được tỉ lệ lấp đầy mặt bằng khu công nghiệp (%).',
      'Liên hệ thực tế sự hình thành các cụm công nghiệp và cơ sở chế biến tại khu vực Chi Lăng, tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm và vai trò của tổ chức lãnh thổ công nghiệp',
        content: [
          'Tổ chức lãnh thổ công nghiệp là sự sắp xếp, phối hợp giữa các quá trình và các cơ sở sản xuất công nghiệp trên một lãnh thổ nhất định nhằm sử dụng hợp lí nhất các nguồn lực tự nhiên, kinh tế - xã hội, đem lại hiệu quả kinh tế - xã hội và bảo vệ môi trường.',
          'Vai trò: Tối ưu hóa việc sử dụng tài nguyên và lao động; Hình thành các mối liên kết sản xuất và liên kết vùng; Thúc đẩy công nghiệp hóa và thu hút nguồn vốn đầu tư trong và ngoài nước.'
        ],
        highlight: 'Tỉ lệ lấp đầy khu công nghiệp (%) = (Diện tích đất công nghiệp đã cho thuê / Tổng diện tích đất công nghiệp có thể cho thuê) × 100.',
      },
      {
        sectionTitle: '2. Bốn hình thức tổ chức lãnh thổ công nghiệp chủ yếu',
        content: [
          'a) Điểm công nghiệp: Hình thức đơn giản nhất, chỉ gồm 1 - 2 xí nghiệp đơn lẻ nằm gần nguồn nguyên liệu hoặc thị trường tiêu thụ; không có mối liên kết sản xuất giữa các xí nghiệp; đồng nhất với một điểm dân cư.',
          'b) Cụm công nghiệp: Hình thức trung gian, gồm nhiều xí nghiệp công nghiệp thuộc các ngành khác nhau trên một diện tích vừa và nhỏ, có kết cấu hạ tầng chung (đường giao thông, trạm điện, cấp thoát nước).',
          'c) Khu công nghiệp (khu chế xuất, khu công nghệ cao): Khu vực có ranh giới địa lí xác định, chuyên sản xuất công nghiệp và thực hiện các dịch vụ cho sản xuất công nghiệp; không có dân cư sinh sống; có ranh giới hàng rào và hệ thống xử lí nước thải tập trung; hưởng nhiều chính sách ưu đãi đầu tư.',
          'd) Vùng công nghiệp: Hình thức tổ chức lãnh thổ công nghiệp cấp cao nhất, bao gồm nhiều điểm, cụm và khu công nghiệp trên một không gian lãnh thổ rộng lớn, có mối quan hệ sản xuất chặt chẽ dựa trên các ngành chuyên môn hóa.'
        ],
      },
      {
        sectionTitle: '3. Xu hướng phát triển các khu công nghiệp sinh thái',
        content: [
          'Xây dựng khu công nghiệp sinh thái (Eco-industrial Park) trong đó các doanh nghiệp liên kết khép kín: chất thải của nhà máy này là nguyên liệu của nhà máy khác, tối ưu hóa năng lượng và không xả thải độc hại ra môi trường.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tổ chức lãnh thổ công nghiệp',
        definition: 'Sự phân bố hợp lí không gian của các xí nghiệp, cơ sở sản xuất công nghiệp nhằm đạt hiệu quả kinh tế cao nhất gắn với bảo vệ môi trường.'
      },
      {
        term: 'Khu công nghiệp (Industrial Park)',
        definition: 'Khu vực có ranh giới rõ ràng chuyên sản xuất hàng công nghiệp và dịch vụ công nghiệp, không có dân cư sinh sống, có hạ tầng kĩ thuật đồng bộ.'
      },
      {
        term: 'Khu công nghiệp sinh thái',
        definition: 'Mô hình khu công nghiệp áp dụng kinh tế tuần hoàn, các doanh nghiệp hợp tác sử dụng hiệu quả tài nguyên và giảm thiểu chất thải.'
      }
    ],
    realWorldExamples: [
      'Tại xã Chi Lăng (Lạng Sơn), Cụm công nghiệp Đồng Bành được quy hoạch đồng bộ dọc theo Quốc lộ 1A và đường sắt Hà Nội - Lạng Sơn, tập trung các nhà máy sản xuất xi măng, bao bì và chế biến vật liệu xây dựng.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), các xưởng thu gom phân loại nông sản và xưởng mộc gia dụng hình thành nên các điểm công nghiệp nông thôn giải quyết việc làm tại chỗ cho thanh niên địa phương.'
    ],
    keyTakeaways: [
      'Bốn hình thức tổ chức công nghiệp: Điểm công nghiệp -> Cụm công nghiệp -> Khu công nghiệp -> Vùng công nghiệp.',
      'Khu công nghiệp có ranh giới xác định, không có dân cư sinh sống và có hạ tầng kĩ thuật dùng chung.',
      'Quy hoạch Cụm công nghiệp tại xã Chi Lăng (Lạng Sơn) gắn với phát huy lợi thế hành lang giao thông huyết mạch.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 30. Tổ chức lãnh thổ công nghiệp',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 30. Tổ chức lãnh thổ công nghiệp',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 30']
    }
  },
  {
    id: 'bai-31',
    number: 31,
    partId: 'phan-3',
    chapterId: 'chuong-11',
    topicId: 'chuong-11',
    title: 'Bài 31. Tác động của công nghiệp đối với môi trường, phát triển năng lượng tái tạo, định hướng phát triển công nghiệp trong tương lai',
    subtitle: 'Ô nhiễm môi trường công nghiệp, chuyển dịch năng lượng xanh và mô hình kinh tế tuần hoàn trong sản xuất',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Phân tích được các tác động tiêu cực của sản xuất công nghiệp đối với môi trường khí quyển, thủy quyển và thạch quyển.',
      'Giải thích được sự cần thiết phải chuyển dịch năng lượng hóa thạch sang năng lượng tái tạo (năng lượng xanh).',
      'Nêu được định hướng phát triển công nghiệp trong tương lai: công nghiệp xanh, giảm thiểu phát thải các-bon và kinh tế tuần hoàn.',
      'Tính toán tỉ trọng năng lượng sạch và liên hệ với các giải pháp bảo vệ môi trường trong khai thác khoáng sản và chế biến tại Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Tác động của sản xuất công nghiệp đối với môi trường',
        content: [
          'Ô nhiễm khí quyển: Khí thải từ các nhà máy nhiệt điện, luyện kim, hóa chất thải ra lượng lớn khí nhà kính (CO2, CH4, N2O), khí SO2, NOx gây hiệu ứng nhà kính, biến đổi khí hậu toàn cầu, thủng tầng ôdôn và mưa axit.',
          'Ô nhiễm thủy quyển: Nước thải công nghiệp chưa qua xử lí chứa nhiều kim loại nặng và hóa chất độc hại xả thẳng ra sông, biển làm chết sinh vật thủy sinh và hủy hoại nguồn nước ngầm.',
          'Ô nhiễm môi trường đất: Chất thải rắn công nghiệp nguy hại không được thu gom chôn lấp đúng quy chuẩn làm thoái hóa đất.'
        ],
        highlight: 'Phát triển công nghiệp truyền thống dựa vào nhiên liệu hóa thạch là nguyên nhân hàng đầu gây khủng hoảng môi trường toàn cầu.',
      },
      {
        sectionTitle: '2. Phát triển năng lượng tái tạo và giảm phát thải',
        content: [
          'Năng lượng tái tạo gồm: Năng lượng mặt trời, năng lượng gió, năng lượng sinh khối, thủy điện nhỏ, địa nhiệt và năng lượng sóng biển.',
          'Ưu điểm vượt trội: Nguồn tài nguyên vô tận, sạch, không phát sinh khí thải CO2 trong quá trình vận hành, giúp các quốc gia tự chủ năng lượng và giảm phụ thuộc vào dầu mỏ.'
        ],
      },
      {
        sectionTitle: '3. Định hướng phát triển công nghiệp trong tương lai',
        content: [
          'Chuyển đổi mạnh mẽ sang mô hình công nghiệp các-bon thấp, hướng tới mục tiêu phát thải ròng bằng 0 (Net Zero) vào năm 2050 theo cam kết COP26.',
          'Áp dụng kinh tế tuần hoàn trong công nghiệp: Thiết kế sản phẩm dễ tái chế, tận dụng tối đa phế liệu làm nguyên liệu đầu vào.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Năng lượng xanh (Green Energy)',
        definition: 'Năng lượng được tạo ra từ các nguồn tài nguyên thiên nhiên tái tạo, không gây ô nhiễm môi trường.'
      },
      {
        term: 'Kinh tế tuần hoàn (Circular Economy)',
        definition: 'Mô hình kinh tế nhằm loại bỏ chất thải và sử dụng liên tục các nguồn tài nguyên thông qua tái sử dụng, sửa chữa, tái chế.'
      },
      {
        term: 'Phát thải ròng bằng 0 (Net Zero)',
        definition: 'Trạng thái lượng khí nhà kính phát thải vào khí quyển tương đương với lượng khí nhà kính được loại bỏ khỏi khí quyển.'
      }
    ],
    realWorldExamples: [
      'Tại xã Chi Lăng (Lạng Sơn), các nhà máy xi măng và xưởng sản xuất vật liệu xây dựng đã đầu tư hệ thống lọc bụi tĩnh điện và tận dụng nhiệt khí thải lò nung để phát điện, giảm tiêu hao than và bảo vệ bầu không khí khu dân cư.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), các trang trại nông sản tận dụng cành na tỉa sau thu hoạch và phụ phẩm nông nghiệp ủ làm phân bón hữu cơ vi sinh, không đốt rác bừa bãi tránh ô nhiễm khói bụi.'
    ],
    keyTakeaways: [
      'Công nghiệp hóa phải đi đôi với bảo vệ môi trường sinh thái.',
      'Phát triển năng lượng tái tạo là giải pháp chiến lược để đạt mục tiêu Net Zero 2050.',
      'Kinh tế tuần hoàn giúp biến chất thải thành tài nguyên mới.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 31. Tác động của công nghiệp đối với môi trường, phát triển năng lượng tái tạo, định hướng phát triển công nghiệp trong tương lai',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 31. Tác động của công nghiệp đối với môi trường, phát triển năng lượng tái tạo, định hướng phát triển công nghiệp trong tương lai',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 31']
    }
  },
  {
    id: 'bai-32',
    number: 32,
    partId: 'phan-3',
    chapterId: 'chuong-11',
    topicId: 'chuong-11',
    title: 'Bài 32. Thực hành: Tìm hiểu sự phát triển công nghiệp ở địa phương',
    subtitle: 'Thu thập tư liệu, xử lí số liệu và viết báo cáo về một cơ sở sản xuất công nghiệp hoặc tiểu thủ công nghiệp tại địa phương',
    durationMinutes: 45,
    isPracticeLesson: true,
    objectives: [
      'Nắm vững các bước tìm hiểu và thu thập thông tin về một ngành hoặc cơ sở công nghiệp tại địa phương.',
      'Biết cách xử lí bảng số liệu về giá trị sản xuất, số lượng lao động và sản lượng sản phẩm của cơ sở sản xuất.',
      'Viết được báo cáo ngắn gọn, khoa học về tình hình phát triển và giải pháp bảo vệ môi trường của cơ sở công nghiệp.',
      'Thực hiện bài tập tính toán tốc độ tăng trưởng sản phẩm công nghiệp và liên hệ trực tiếp với cơ sở sản xuất tại khu vực Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Mục đích và các bước tiến hành tìm hiểu công nghiệp địa phương',
        content: [
          'Mục đích: Giúp học sinh gắn liền lí thuyết sách giáo khoa với thực tiễn sản xuất tại quê hương; hiểu rõ vai trò của công nghiệp đối với chuyển dịch cơ cấu lao động địa phương.',
          'Bước 1: Xác định đối tượng tìm hiểu (ví dụ xưởng cơ khí, xưởng chế biến gỗ, nhà máy xi măng).',
          'Bước 2: Thu thập thông tin, tư liệu qua phỏng vấn, khảo sát trực tiếp, báo cáo thống kê của địa phương hoặc tìm kiếm trên cổng thông tin điện tử tỉnh Lạng Sơn và trang thông tin địa phương.',
          'Bước 3: Xử lí và tổng hợp số liệu (tính tỉ trọng, tính tốc độ tăng trưởng).',
          'Bước 4: Viết và trình bày báo cáo.'
        ],
        highlight: 'Báo cáo công nghiệp địa phương cần nêu rõ: Vị trí -> Nguyên liệu -> Sản phẩm -> Thị trường -> Tác động môi trường -> Đề xuất giải pháp.',
      },
      {
        sectionTitle: '2. Cấu trúc bài báo cáo khảo sát công nghiệp chuẩn',
        content: [
          '1. Giới thiệu chung: Tên cơ sở, địa điểm đặt xí nghiệp, năm thành lập, quy mô vốn và lao động.',
          '2. Điều kiện phát triển: Thuận lợi về vị trí, nguyên liệu địa phương, lao động tại chỗ và thị trường.',
          '3. Tình hình sản xuất: Sản phẩm chủ yếu, sản lượng và doanh thu qua các năm.',
          '4. Đánh giá tác động môi trường và định hướng phát triển bền vững trong tương lai.'
        ],
      },
      {
        sectionTitle: '3. Kĩ năng xử lí số liệu báo cáo',
        content: [
          'Tính tốc độ tăng trưởng giá trị sản xuất: Tốc độ (%) = (Giá trị năm sau / Giá trị năm trước) × 100%.',
          'Tính năng suất lao động: Năng suất (triệu đồng/lao động) = Tổng giá trị sản xuất / Tổng số lao động.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Khảo sát thực tế',
        definition: 'Phương pháp thu thập thông tin trực tiếp tại hiện trường thông qua quan sát, phỏng vấn và ghi chép số liệu.'
      },
      {
        term: 'Năng suất lao động',
        definition: 'Khối lượng sản phẩm hoặc giá trị sản xuất tính bình quân cho một lao động trong một đơn vị thời gian.'
      },
      {
        term: 'Tiểu thủ công nghiệp',
        definition: 'Các hoạt động sản xuất công nghiệp quy mô nhỏ, sử dụng công cụ thủ công kết hợp máy móc bán tự động tại nông thôn.'
      }
    ],
    realWorldExamples: [
      'Học sinh Trường THPT Hòa Bình lựa chọn khảo sát xưởng cơ khí chế tạo ròng rọc tời núi và máy sơ chế nông sản tại xã Vạn Linh (tỉnh Lạng Sơn): Tìm hiểu cách bà con ứng dụng sáng chế tời vận chuyển na từ vách núi dốc, tính toán năng suất lao động tăng gấp 10 lần so với gùi na bộ bằng tay.',
      'Tìm hiểu Nhà máy xi măng Đồng Bành tại xã Chi Lăng (Lạng Sơn): Khảo sát công suất thiết kế 1 triệu tấn/năm, nguồn nguyên liệu đá vôi tại chỗ và thị trường cung ứng cho toàn tỉnh.'
    ],
    keyTakeaways: [
      'Học đi đôi với hành; khảo sát thực tế giúp hiểu sâu sắc hơn về công nghiệp địa phương.',
      'Kĩ năng xử lí số liệu và viết báo cáo khoa học là năng lực cốt lõi của môn Địa lí 10.',
      'Các cơ sở tiểu thủ công nghiệp tại xã Vạn Linh (tỉnh Lạng Sơn) là động lực giải quyết việc làm và thúc đẩy hiện đại hóa nông thôn.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 32. Thực hành: Tìm hiểu sự phát triển công nghiệp ở địa phương',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 32. Thực hành: Tìm hiểu sự phát triển công nghiệp ở địa phương',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 32']
    }
  },
  {
    id: 'bai-33',
    number: 33,
    partId: 'phan-3',
    chapterId: 'chuong-12',
    topicId: 'chuong-12',
    title: 'Bài 33. Cơ cấu, vai trò, đặc điểm và các nhân tố ảnh hưởng đến sự phát triển, phân bố dịch vụ',
    subtitle: 'Khái niệm ngành dịch vụ, cơ cấu 3 nhóm dịch vụ, vai trò động lực và các nhân tố chi phối',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được khái niệm ngành dịch vụ và phân biệt được cơ cấu 3 nhóm dịch vụ chính (dịch vụ kinh doanh, dịch vụ tiêu dùng, dịch vụ công).',
      'Khẳng định được vai trò to lớn của dịch vụ trong việc thúc đẩy sản xuất, tạo việc làm và nâng cao chất lượng cuộc sống.',
      'Phân tích được tác động của các nhân tố kinh tế - xã hội đến sự phát triển và phân bố các ngành dịch vụ.',
      'Tính toán thành thạo tỉ trọng ngành dịch vụ trong GDP và liên hệ với sự phát triển dịch vụ thương mại, vận tải tại Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm và cơ cấu ngành dịch vụ',
        content: [
          'Dịch vụ là tập hợp các hoạt động kinh tế - xã hội không trực tiếp sản xuất ra của cải vật chất nhưng tạo ra các giá trị vô hình hoặc hữu hình phục vụ cho nhu cầu sản xuất và đời sống con người.',
          'Cơ cấu ngành dịch vụ gồm 3 nhóm chính:',
          '- Dịch vụ tiêu dùng: Phục vụ nhu cầu hàng ngày của cá nhân và gia đình (bán buôn, bán lẻ, du lịch, khách sạn, nhà hàng, may mặc, sửa chữa).',
          '- Dịch vụ kinh doanh: Phục vụ các hoạt động sản xuất kinh doanh (giao thông vận tải, bưu chính viễn thông, tài chính ngân hàng, bảo hiểm, bất động sản).',
          '- Dịch vụ công: Phục vụ lợi ích chung của toàn xã hội (quản lí hành chính nhà nước, giáo dục, y tế, an ninh quốc phòng).'
        ],
        highlight: 'Ở các nước phát triển, ngành dịch vụ chiếm tỉ trọng rất cao trong GDP (trên 70%) và thu hút phần lớn lực lượng lao động xã hội.',
      },
      {
        sectionTitle: '2. Vai trò của ngành dịch vụ',
        content: [
          'Thúc đẩy các ngành sản xuất vật chất (nông nghiệp, công nghiệp) phát triển nhờ cung ứng kịp thời nguyên liệu và tiêu thụ sản phẩm.',
          'Sử dụng hiệu quả nguồn lao động xã hội, tạo thêm nhiều việc làm mới.',
          'Khai thác và sử dụng hợp lí các tài nguyên thiên nhiên, di sản văn hóa lịch sử và các thành tựu khoa học kĩ thuật hiện đại.',
          'Mở rộng giao lưu, hợp tác kinh tế quốc tế và nâng cao chất lượng cuộc sống nhân dân.'
        ],
      },
      {
        sectionTitle: '3. Các nhân tố ảnh hưởng đến sự phát triển và phân bố dịch vụ',
        content: [
          'Trình độ phát triển kinh tế và năng suất lao động xã hội (quyết định quy mô và cơ cấu dịch vụ).',
          'Quy mô và cơ cấu dân số, phân bố dân cư (xác định nhu cầu và mạng lưới điểm dịch vụ).',
          'Mức sống và thu nhập của người dân (quyết định sức mua và chất lượng dịch vụ).',
          'Tài nguyên thiên nhiên và di sản văn hóa lịch sử (tiền đề phát triển du lịch).',
          'Cơ sở hạ tầng kĩ thuật (đặc biệt là giao thông và viễn thông là mạch máu kết nối dịch vụ).'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Ngành Dịch vụ (Service Sector)',
        definition: 'Khu vực kinh tế thứ ba bao gồm các hoạt động tạo ra sản phẩm vô hình phục vụ cho nhu cầu sản xuất và sinh hoạt của con người.'
      },
      {
        term: 'Dịch vụ tiêu dùng',
        definition: 'Các hoạt động dịch vụ đáp ứng trực tiếp nhu cầu sinh hoạt hàng ngày của cá nhân và hộ gia đình như bán lẻ, y tế, ẩm thực.'
      },
      {
        term: 'Dịch vụ kinh doanh',
        definition: 'Các hoạt động dịch vụ hỗ trợ cho quá trình vận hành của các doanh nghiệp như logistics, ngân hàng, viễn thông.'
      }
    ],
    realWorldExamples: [
      'Tại xã Chi Lăng và xã Vạn Linh (Lạng Sơn), ngành dịch vụ phát triển mạnh mẽ vào mùa thu hoạch na với sự xuất hiện của hàng trăm điểm cân thu mua na, dịch vụ bưu chính chuyển phát nhanh giao hàng tận nơi về Hà Nội và các tỉnh.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), các cửa hàng phân bón, vật tư nông nghiệp, dịch vụ vận tải xe tải nhỏ và hàng tạp hóa ngày càng mở rộng, phục vụ tiện lợi đời sống nhân dân.'
    ],
    keyTakeaways: [
      'Dịch vụ gồm dịch vụ tiêu dùng, dịch vụ kinh doanh và dịch vụ công.',
      'Tỉ trọng dịch vụ trong GDP là thước đo phản ánh mức độ văn minh và phát triển của một nền kinh tế.',
      'Dịch vụ thương mại nông sản tại Chi Lăng (Lạng Sơn) là cầu nối đưa đặc sản địa phương vươn xa.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 33. Cơ cấu, vai trò, đặc điểm và các nhân tố ảnh hưởng đến sự phát triển, phân bố dịch vụ',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 33. Cơ cấu, vai trò, đặc điểm và các nhân tố ảnh hưởng đến sự phát triển, phân bố dịch vụ',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 33']
    }
  },
  {
    id: 'bai-34',
    number: 34,
    partId: 'phan-3',
    chapterId: 'chuong-12',
    topicId: 'chuong-12',
    title: 'Bài 34. Địa lí ngành giao thông vận tải',
    subtitle: 'Vai trò, các tiêu chí đánh giá và đặc điểm của 5 loại hình giao thông vận tải chính',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Khẳng định được vai trò như mạch máu của nền kinh tế của ngành giao thông vận tải.',
      'Nắm vững và tính toán thành thạo 3 tiêu chí đánh giá hoạt động giao thông vận tải: Khối lượng vận chuyển, Khối lượng luân chuyển và Cự li vận chuyển trung bình.',
      'So sánh được ưu điểm và nhược điểm của 5 loại hình giao thông vận tải chủ yếu (đường ô tô, đường sắt, đường nước, đường hàng không, đường ống).',
      'Đánh giá được ý nghĩa chiến lược của Quốc lộ 1A, đường sắt và cao tốc Bắc Giang - Lạng Sơn chạy qua khu vực Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Vai trò và các tiêu chí đánh giá ngành giao thông vận tải',
        content: [
          'Vai trò: Là mạch máu kết nối các ngành kinh tế, các vùng lãnh thổ; đảm bảo nhu cầu đi lại của nhân dân; tạo điều kiện khai thác tài nguyên và phân bố lại dân cư; củng cố an ninh quốc phòng.',
          'Các tiêu chí đánh giá chất lượng và quy mô vận tải:',
          '- Khối lượng vận chuyển: Số tấn hàng hóa (hoặc số lượt hành khách) được chuyên chở, đơn vị: tấn (hoặc lượt người).',
          '- Khối lượng luân chuyển: Tích số giữa khối lượng vận chuyển và cự li vận chuyển thực tế, đơn vị: tấn.km (hoặc người.km).',
          '- Cự li vận chuyển trung bình: Quãng đường vận chuyển bình quân của một tấn hàng hóa (hoặc một hành khách), công thức: Cự li trung bình (km) = Khối lượng luân chuyển / Khối lượng vận chuyển.'
        ],
        highlight: 'Công thức cốt lõi: Cự li vận chuyển trung bình (km) = Khối lượng luân chuyển (tấn.km) / Khối lượng vận chuyển (tấn).',
      },
      {
        sectionTitle: '2. Ưu và nhược điểm của các loại hình giao thông vận tải',
        content: [
          'a) Đường ô tô (đường bộ): Cơ động, linh hoạt cao, thích nghi với mọi dạng địa hình, có thể chở hàng \'từ cửa đến cửa\' (door to door); nhưng cước phí tương đối cao, gây ô nhiễm không khí và tắc nghẽn giao thông.',
          'b) Đường sắt: Vận chuyển hàng nặng, cồng kềnh trên cự li dài với tốc độ ổn định, chi phí thấp, an toàn cao; nhưng tính cơ động kém (chỉ chạy trên đường ray cố định), vốn đầu tư xây dựng hạ tầng rất lớn.',
          'c) Đường biển: Vận tải hàng hóa quốc tế siêu trường, siêu trọng trên cự li rất dài với giá thành rẻ nhất; nhưng tốc độ chậm, phụ thuộc vào điều kiện thời tiết bão gió trên biển.',
          'd) Đường hàng không: Vận tốc cao nhất, cự li dài vượt trội, dịch vụ hiện đại; nhưng cước phí đắt nhất, tải trọng giới hạn.',
          'e) Đường ống: Vận chuyển chuyên dụng chất lỏng và khí (dầu mỏ, khí đốt) liên tục, an toàn, không chiếm diện tích mặt đất; nhưng chi phí đầu tư ban đầu cao và khó kiểm soát rò rỉ dưới lòng đất.'
        ],
      },
      {
        sectionTitle: '3. Xu hướng phát triển giao thông vận tải hiện đại',
        content: [
          'Phát triển giao thông xanh (xe điện, tàu cao tốc chạy điện), ứng dụng trí tuệ nhân tạo (AI) điều tiết giao thông và phát triển vận tải đa phương thức (kết hợp đường sắt - đường bộ - đường biển).'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Khối lượng vận chuyển',
        definition: 'Tổng khối lượng hàng hóa (hoặc số lượt hành khách) được phương tiện giao thông vận chuyển trong một thời gian, đơn vị tính là tấn hoặc lượt người.'
      },
      {
        term: 'Khối lượng luân chuyển',
        definition: 'Thước đo tổng hợp kết hợp khối lượng hàng hóa chuyên chở với quãng đường vận chuyển thực tế, đơn vị tính là tấn.km hoặc người.km.'
      },
      {
        term: 'Cự li vận chuyển trung bình',
        definition: 'Quãng đường di chuyển bình quân của 1 tấn hàng hóa hoặc 1 hành khách, tính bằng thương số giữa khối lượng luân chuyển và khối lượng vận chuyển.'
      }
    ],
    realWorldExamples: [
      'Khu vực Chi Lăng (Lạng Sơn) là yết hầu giao thông chiến lược cửa ngõ phía Bắc của Tổ quốc: Tuyến Quốc lộ 1A, đường sắt liên vận quốc tế Hà Nội - Đồng Đăng và tuyến cao tốc Bắc Giang - Lạng Sơn đều chạy song song qua thung lũng Chi Lăng.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), 100% đường trục xã và đường liên thôn bản đã được bê tông hóa kiên cố, xe tải trọng tải từ 2,5 đến 5 tấn có thể vào tận chân vườn na thu mua hàng hóa xuất khẩu sang Trung Quốc và đi các tỉnh.'
    ],
    keyTakeaways: [
      'Giao thông vận tải là huyết mạch kinh tế nối liền sản xuất và tiêu dùng.',
      'Cự li vận chuyển trung bình (km) = Khối lượng luân chuyển / Khối lượng vận chuyển.',
      'Ải Chi Lăng (Lạng Sơn) từ vị trí \'bẫy hiểm\' lịch sử nay trở thành hành lang giao thương đường bộ, đường cao tốc hiện đại.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 34. Địa lí ngành giao thông vận tải',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 34. Địa lí ngành giao thông vận tải',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 34']
    }
  },
  {
    id: 'bai-35',
    number: 35,
    partId: 'phan-3',
    chapterId: 'chuong-12',
    topicId: 'chuong-12',
    title: 'Bài 35. Địa lí ngành bưu chính viễn thông',
    subtitle: 'Vai trò thông tin liên lạc, sự bùng nổ của mạng Internet, điện thoại di động và dịch vụ số hóa',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Phân biệt được vai trò và đặc điểm của hai phân ngành: Bưu chính (vận chuyển thư từ, bưu phẩm) và Viễn thông (truyền tải dữ liệu điện tử).',
      'Trình bày được tình hình phát triển vượt bậc của mạng viễn thông toàn cầu: mạng Internet cáp quang, mạng di động 4G/5G và vệ tinh.',
      'Tính toán thành thạo mật độ thuê bao điện thoại trên 100 dân và tỉ lệ người dùng Internet.',
      'Đánh giá được ý nghĩa của công nghệ viễn thông đối với việc tiêu thụ nông sản và đời sống nhân dân xã Vạn Linh, khu vực Chi Lăng (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Vai trò của ngành bưu chính viễn thông',
        content: [
          'Bưu chính viễn thông là phương tiện truyền dẫn thông tin nhanh chóng, chính xác giữa các cá nhân, tổ chức trên toàn cầu mà không bị cản trở bởi khoảng cách địa lí.',
          'Đóng vai trò hạ tầng số quan trọng nhất của nền kinh tế tri thức và cuộc cách mạng công nghiệp 4.0; thúc đẩy thương mại điện tử, thanh toán không tiền mặt và chính phủ số.',
          'Góp phần nâng cao dân trí, giao lưu văn hóa và đảm bảo an ninh thông tin quốc gia.'
        ],
        highlight: 'Mật độ thuê bao điện thoại (thuê bao/100 dân) = (Tổng số thuê bao / Tổng số dân) × 100.',
      },
      {
        sectionTitle: '2. Đặc điểm và tình hình phát triển ngành bưu chính viễn thông',
        content: [
          'a) Ngành Bưu chính: Từ chuyển phát thư từ giấy truyền thống sang bưu chính logistics phục vụ thương mại điện tử (giao hàng thu tiền hộ COD). Mạng lưới bưu cục mở rộng đến từng xã.',
          'b) Ngành Viễn thông: Tốc độ phát triển cực nhanh. Mạng Internet kết nối toàn cầu; điện thoại thông minh phổ cập rộng rãi; công nghệ truyền dẫn chuyển từ cáp đồng sang cáp quang và sóng vi ba vệ tinh, mạng 5G tốc độ siêu cao.'
        ],
      },
      {
        sectionTitle: '3. Chuyển đổi số và kinh tế số',
        content: [
          'Viễn thông là bệ phóng cho các mô hình kinh tế số: dạy học trực tuyến, khám chữa bệnh từ xa (Telemedicine), dịch vụ công trực tuyến và thanh toán số qua quét mã QR.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Bưu chính (Postal service)',
        definition: 'Ngành dịch vụ thu gom, chia chọn, vận chuyển và phát các bưu phẩm, bưu kiện, hàng hóa đến tay người nhận.'
      },
      {
        term: 'Viễn thông (Telecommunication)',
        definition: 'Ngành truyền dẫn tín hiệu âm thanh, hình ảnh, văn bản và dữ liệu điện tử qua dây dẫn, sóng vô tuyến hoặc cáp quang.'
      },
      {
        term: 'Kinh tế số (Digital Economy)',
        definition: 'Nền kinh tế vận hành chủ yếu dựa trên công nghệ số, đặc biệt là các giao dịch điện tử tiến hành qua Internet.'
      }
    ],
    realWorldExamples: [
      'Tại xã Vạn Linh và xã Chi Lăng (Lạng Sơn), hạ tầng mạng viễn thông 4G đã phủ sóng 100% các thôn bản; bà con nông dân sử dụng smartphone để livestream giới thiệu vườn na Chi Lăng và chốt đơn bán hàng trực tuyến cho khách hàng khắp cả nước.',
      'Dịch vụ bưu chính công ích và các hãng chuyển phát nhanh (Viettel Post, VNPost) đã mở văn phòng tại trung tâm xã Vạn Linh để tiếp nhận đóng thùng xốp, vận chuyển na tươi giao nhanh trong ngày về Hà Nội.'
    ],
    keyTakeaways: [
      'Bưu chính viễn thông là cầu nối thông tin không gian không biên giới.',
      'Mật độ thuê bao/100 dân phản ánh trình độ tiếp cận công nghệ thông tin của xã hội.',
      'Chuyển đổi số nông thôn tại Chi Lăng (Lạng Sơn) giúp nông dân làm chủ sàn thương mại điện tử.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 35. Địa lí ngành bưu chính viễn thông',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 35. Địa lí ngành bưu chính viễn thông',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 35']
    }
  },
  {
    id: 'bai-36',
    number: 36,
    partId: 'phan-3',
    chapterId: 'chuong-12',
    topicId: 'chuong-12',
    title: 'Bài 36. Địa lí ngành du lịch',
    subtitle: 'Vai trò ngành công nghiệp không khói, các tài nguyên du lịch và các nhân tố ảnh hưởng đến sự phát triển',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được vai trò toàn diện của ngành du lịch - ngành \'công nghiệp không khói\' hàng đầu thế giới.',
      'Phân biệt được tài nguyên du lịch tự nhiên (địa hình karst, hang động, khí hậu) và tài nguyên du lịch nhân văn (di tích Ải Chi Lăng, lễ hội truyền thống xứ Lạng).',
      'Tính toán thành thạo doanh thu du lịch bình quân trên lượt khách và số ngày lưu trú trung bình.',
      'Đánh giá được tiềm năng phát triển du lịch sinh thái miệt vườn na Chi Lăng gắn với du lịch di tích lịch sử tại Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Vai trò của ngành du lịch',
        content: [
          'Du lịch là ngành kinh tế tổng hợp quan trọng: mang lại nguồn thu ngoại tệ lớn (xuất khẩu tại chỗ); kích thích các ngành giao thông, thương mại, khách sạn, nông sản đặc sản phát triển.',
          'Tạo nhiều việc làm cho cộng đồng địa phương, nâng cao đời sống tinh thần của nhân dân.',
          'Góp phần bảo tồn, tôn tạo các di sản văn hóa, danh lam thắng cảnh và tăng cường hiểu biết, hòa bình giữa các dân tộc.'
        ],
        highlight: 'Doanh thu du lịch bình quân = Tổng doanh thu du lịch / Tổng lượt khách du lịch (USD/lượt hoặc triệu đồng/lượt).',
      },
      {
        sectionTitle: '2. Tài nguyên du lịch: Tự nhiên và Nhân văn',
        content: [
          'a) Tài nguyên du lịch tự nhiên: Cảnh quan địa hình (núi cao, hang động karst, thác nước); Khí hậu (mát mẻ, trong lành); Nguồn nước (suối khoáng, hồ, biển); Sinh vật (vườn quốc gia, khu bảo tồn).',
          'b) Tài nguyên du lịch nhân văn: Di tích lịch sử - văn hóa, công trình kiến trúc cổ; Lễ hội truyền thống; Làng nghề thủ công; Ẩm thực dân tộc đặc sắc.'
        ],
      },
      {
        sectionTitle: '3. Các nhân tố ảnh hưởng và xu hướng du lịch bền vững',
        content: [
          'Nhân tố ảnh hưởng: Tài nguyên du lịch (yếu tố cốt lõi); Mức sống và thời gian rỗi của người dân; Cơ sở hạ tầng (đường sá, khách sạn); Sự an toàn và chính sách quảng bá.',
          'Xu hướng hiện nay: Du lịch sinh thái, du lịch nông nghiệp nông thôn (trải nghiệm thu hoạch trái cây), du lịch cộng đồng (homestay) gắn với bảo vệ môi trường.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Tài nguyên du lịch',
        definition: 'Cảnh quan thiên nhiên, di tích lịch sử - văn hóa và các giá trị nhân văn có thể phục vụ nhu cầu du lịch và mang lại hiệu quả kinh tế.'
      },
      {
        term: 'Du lịch sinh thái (Ecotourism)',
        definition: 'Hình thức du lịch dựa vào tự nhiên, có trách nhiệm bảo vệ môi trường và duy trì đời sống của người dân bản địa.'
      },
      {
        term: 'Doanh thu du lịch',
        definition: 'Tổng số tiền thu được từ việc cung cấp các dịch vụ lưu trú, ăn uống, vận chuyển, tham quan và bán hàng lưu niệm cho khách du lịch.'
      }
    ],
    realWorldExamples: [
      'Tại xã Chi Lăng (Lạng Sơn), tài nguyên du lịch vô cùng phong phú: Khu di tích lịch sử Quốc gia đặc biệt Ải Chi Lăng (Núi Mặt Quỷ, Đền Quỷ Môn Quan, Ngựa Cương) ghi dấu chiến công vang dội chống quân xâm lược phương Bắc.',
      'Địa phương đã tổ chức thành công \'Ngày hội Na Chi Lăng\' hàng năm, kết hợp trải nghiệm hái na tại các vườn đồi xã Vạn Linh, thưởng thức ẩm thực vịt quay, khau nhục xứ Lạng, thu hút hàng vạn lượt du khách mỗi mùa lễ hội.'
    ],
    keyTakeaways: [
      'Du lịch là ngành công nghiệp không khói mang lại giá trị gia tăng lớn.',
      'Tài nguyên du lịch gồm tự nhiên và nhân văn; tài nguyên là tiền đề, hạ tầng là điều kiện thúc đẩy.',
      'Phát triển du lịch lịch sử Ải Chi Lăng kết hợp du lịch nông nghiệp vườn na Vạn Linh là hướng đi bền vững của Lạng Sơn.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 36. Địa lí ngành du lịch',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 36. Địa lí ngành du lịch',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 36']
    }
  },
  {
    id: 'bai-37',
    number: 37,
    partId: 'phan-3',
    chapterId: 'chuong-12',
    topicId: 'chuong-12',
    title: 'Bài 37. Địa lí ngành thương mại và ngành tài chính ngân hàng',
    subtitle: 'Nội thương, ngoại thương, cán cân thương mại (xuất khẩu - nhập khẩu), thị trường tiền tệ và các trung tâm tài chính',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được vai trò của ngành thương mại và phân biệt được nội thương với ngoại thương.',
      'Nắm vững các khái niệm then chốt: kim ngạch xuất khẩu, kim ngạch nhập khẩu, cán cân thương mại, xuất siêu và nhập siêu.',
      'Hiểu rõ vai trò của ngành tài chính ngân hàng đối với lưu thông vốn và thanh toán trong nền kinh tế thị trường.',
      'Tính toán thành thạo cán cân thương mại, tỉ trọng xuất khẩu và liên hệ với hoạt động thương mại cửa khẩu quốc tế tại tỉnh Lạng Sơn.'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Địa lí ngành thương mại: Nội thương và Ngoại thương',
        content: [
          'Thương mại là khâu trung gian nối liền sản xuất với tiêu dùng thông qua hành vi mua bán hàng hóa và dịch vụ.',
          'a) Nội thương: Hoạt động buôn bán trao đổi hàng hóa diễn ra trong phạm vi biên giới quốc gia thông qua hệ thống chợ truyền thống, siêu thị, trung tâm thương mại và thương mại điện tử. Giúp lưu thông hàng hóa thông suốt giữa các vùng miền.',
          'b) Ngoại thương: Hoạt động buôn bán trao đổi hàng hóa và dịch vụ giữa các quốc gia với nhau qua biên giới (xuất khẩu và nhập khẩu). Là động lực thúc đẩy phân công lao động quốc tế, mở rộng thị trường và tăng nguồn thu ngoại tệ.'
        ],
        highlight: 'Công thức cán cân thương mại: Cán cân = Giá trị Xuất khẩu - Giá trị Nhập khẩu. Nếu Xuất > Nhập: Xuất siêu (dương); Nếu Xuất < Nhập: Nhập siêu (âm).',
      },
      {
        sectionTitle: '2. Cán cân thương mại và cơ cấu xuất nhập khẩu',
        content: [
          'Tổng kim ngạch xuất nhập khẩu = Giá trị Xuất khẩu + Giá trị Nhập khẩu.',
          'Tỉ trọng xuất khẩu (%) = (Giá trị Xuất khẩu / Tổng kim ngạch XNK) × 100%.',
          'Cơ cấu mặt hàng xuất khẩu phản ánh trình độ phát triển kinh tế: các nước phát triển xuất khẩu máy móc công nghệ cao; các nước đang phát triển từng bước chuyển từ xuất khẩu nông sản thô sang hàng công nghiệp chế biến.'
        ],
      },
      {
        sectionTitle: '3. Địa lí ngành tài chính ngân hàng',
        content: [
          'Là huyết mạch luân chuyển nguồn vốn trong nền kinh tế: huy động tiền tiết kiệm, cấp vốn tín dụng cho sản xuất kinh doanh, thực hiện dịch vụ thanh toán trong nước và quốc tế.',
          'Các trung tâm tài chính lớn nhất thế giới: New York, Luân Đôn, Tokyo, Singapore, Thượng Hải.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Cán cân thương mại',
        definition: 'Chênh lệch giữa giá trị xuất khẩu và giá trị nhập khẩu hàng hóa của một quốc gia trong một thời kì nhất định.'
      },
      {
        term: 'Xuất siêu (Trade Surplus)',
        definition: 'Trạng thái cán cân thương mại dương, khi giá trị hàng hóa xuất khẩu lớn hơn giá trị hàng hóa nhập khẩu.'
      },
      {
        term: 'Kim ngạch xuất nhập khẩu',
        definition: 'Tổng giá trị tính bằng tiền của tất cả hàng hóa xuất khẩu và nhập khẩu của một quốc gia trong một khoảng thời gian.'
      }
    ],
    realWorldExamples: [
      'Tỉnh Lạng Sơn có vị thế đặc biệt là \'cửa ngõ giao thương\' quốc tế lớn nhất miền Bắc với Trung Quốc qua các cửa khẩu Hữu Nghị, Tân Thanh, ga quốc tế Đồng Đăng; tổng kim ngạch xuất nhập khẩu qua địa bàn đạt hàng tỉ USD mỗi năm.',
      'Tại xã Vạn Linh (tỉnh Lạng Sơn), chợ phiên Vạn Linh (họp định kì theo ngày âm lịch) là nét đẹp văn hóa nội thương truyền thống, nơi bà con trao đổi nông sản, thổ cẩm; bên cạnh đó phòng giao dịch Ngân hàng Chính sách xã hội và Agribank cung ứng kịp thời vốn vay ưu đãi cho nông dân phát triển vườn na.'
    ],
    keyTakeaways: [
      'Thương mại là cầu nối giữa sản xuất và tiêu dùng.',
      'Cán cân thương mại = Xuất khẩu - Nhập khẩu; xuất siêu phản ánh sức cạnh tranh hàng hóa cao.',
      'Kinh tế cửa khẩu Lạng Sơn và chợ phiên Vạn Linh là hai biểu hiện sinh động của ngoại thương và nội thương.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 37. Địa lí ngành thương mại và ngành tài chính ngân hàng',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 37. Địa lí ngành thương mại và ngành tài chính ngân hàng',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 37']
    }
  },
  {
    id: 'bai-38',
    number: 38,
    partId: 'phan-3',
    chapterId: 'chuong-12',
    topicId: 'chuong-12',
    title: 'Bài 38. Thực hành: Viết báo cáo tìm hiểu về một ngành dịch vụ',
    subtitle: 'Kĩ năng khảo sát, thu thập tư liệu và viết báo cáo đánh giá thực trạng một hoạt động dịch vụ tại địa phương',
    durationMinutes: 45,
    isPracticeLesson: true,
    objectives: [
      'Biết cách lập đề cương và thu thập thông tin về một hoạt động dịch vụ cụ thể tại địa phương (thương mại, giao thông, bưu chính).',
      'Xử lí và tính toán được các chỉ tiêu thống kê cơ bản: doanh thu, lượng khách, tốc độ tăng trưởng dịch vụ qua các quý/năm.',
      'Viết và trình bày báo cáo tìm hiểu ngành dịch vụ rõ ràng, có phân tích ưu điểm, hạn chế và đề xuất giải pháp.',
      'Vận dụng viết báo cáo khảo sát chuỗi dịch vụ cung ứng và tiêu thụ nông sản na Chi Lăng tại xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Các bước viết báo cáo tìm hiểu một ngành dịch vụ',
        content: [
          'Bước 1: Chọn đề tài cụ thể (ví dụ: Hoạt động dịch vụ bưu chính chuyển phát tại xã Vạn Linh; Dịch vụ du lịch sinh thái miệt vườn na Chi Lăng; Dịch vụ vận tải hàng hóa nông sản).',
          'Bước 2: Xây dựng đề cương nghiên cứu: Đặt vấn đề -> Hiện trạng hoạt động -> Nhận xét đánh giá -> Giải pháp và kiến nghị.',
          'Bước 3: Thu thập số liệu và tài liệu thực tế từ các cơ sở dịch vụ hoặc phòng thống kê.',
          'Bước 4: Xử lí số liệu, vẽ biểu đồ minh họa và hoàn thiện văn bản báo cáo.'
        ],
        highlight: 'Một báo cáo dịch vụ thuyết phục cần có số liệu định lượng cụ thể, biểu đồ trực quan và giải pháp khả thi gắn liền với đời sống địa phương.',
      },
      {
        sectionTitle: '2. Cấu trúc bài báo cáo chuyên đề dịch vụ',
        content: [
          '1. Tên đề tài và lí do chọn đề tài.',
          '2. Tình hình phát triển: Số lượng cơ sở, lao động, doanh thu và sản lượng dịch vụ.',
          '3. Đánh giá chất lượng dịch vụ: Mức độ đáp ứng nhu cầu nhân dân, giá cả, thái độ phục vụ.',
          '4. Khó khăn, tồn tại và phương hướng nâng cao hiệu quả hoạt động trong thời gian tới.'
        ],
      },
      {
        sectionTitle: '3. Phương pháp tính toán các chỉ số dịch vụ',
        content: [
          'Tốc độ tăng trưởng doanh thu (%) = [(Doanh thu năm sau - Doanh thu năm trước) / Doanh thu năm trước] × 100%.',
          'Tỉ suất lợi nhuận dịch vụ (%) = (Lợi nhuận ròng / Doanh thu thuần) × 100%.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Báo cáo chuyên đề',
        definition: 'Văn bản khoa học trình bày có hệ thống kết quả nghiên cứu, khảo sát thực tế về một vấn đề cụ thể nhằm cung cấp thông tin và giải pháp.'
      },
      {
        term: 'Doanh thu dịch vụ',
        definition: 'Toàn bộ số tiền thu được từ việc cung ứng các dịch vụ cho khách hàng trong một kì kế toán nhất định.'
      },
      {
        term: 'Chuỗi cung ứng dịch vụ',
        definition: 'Mạng lưới các tổ chức, con người, hoạt động và thông tin tham gia vào việc chuyển giao dịch vụ từ nhà cung cấp đến khách hàng.'
      }
    ],
    realWorldExamples: [
      'Học sinh Trường THPT Hòa Bình thực hành viết báo cáo: \'Khảo sát chuỗi dịch vụ cung ứng vật tư và tiêu thụ nông sản na Chi Lăng tại xã Vạn Linh (Lạng Sơn)\': phân tích vai trò của dịch vụ vận tải xe tải nhỏ, dịch vụ đóng thùng xốp và bưu chính chuyển phát nhanh giúp na Chi Lăng giữ độ tươi ngon khi đến tay người tiêu dùng.',
      'Báo cáo đề xuất giải pháp: xây dựng thêm kho lạnh bảo quản na tập trung tại xã Vạn Linh để kéo dài thời gian tiêu thụ, tránh tình trạng bị ép giá khi vào vụ thu hoạch rộ.'
    ],
    keyTakeaways: [
      'Viết báo cáo rèn luyện kĩ năng thu thập thông tin, tư duy phản biện và kĩ năng xử lí số liệu.',
      'Số liệu định lượng chính xác là cơ sở khoa học để đưa ra các đề xuất phát triển dịch vụ thiết thực.',
      'Dịch vụ logistics và bảo quản nông sản tại xã Vạn Linh (tỉnh Lạng Sơn) là mắt xích then chốt nâng tầm giá trị nông nghiệp Lạng Sơn.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 38. Thực hành: Viết báo cáo tìm hiểu về một ngành dịch vụ',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 38. Thực hành: Viết báo cáo tìm hiểu về một ngành dịch vụ',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 38']
    }
  },
  {
    id: 'bai-39',
    number: 39,
    partId: 'phan-3',
    chapterId: 'chuong-13',
    topicId: 'chuong-13',
    title: 'Bài 39. Môi trường và tài nguyên thiên nhiên',
    subtitle: 'Khái niệm môi trường sống, phân loại tài nguyên thiên nhiên, nguy cơ cạn kiệt và an ninh môi trường',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Nêu được khái niệm môi trường, các thành phần của môi trường và các chức năng cơ bản của môi trường đối với con người.',
      'Phân biệt được 3 nhóm tài nguyên thiên nhiên theo thuộc tính phục hồi: tài nguyên có thể phục hồi (rừng, đất, nước), tài nguyên không thể phục hồi (khoáng sản), tài nguyên vô tận (năng lượng mặt trời, gió).',
      'Phân tích được nguyên nhân dẫn đến suy thoái môi trường và nguy cơ cạn kiệt tài nguyên thiên nhiên.',
      'Tính toán được thời gian cạn kiệt của mỏ khoáng sản và đề xuất các biện pháp bảo vệ tài nguyên đất, rừng, nước tại Chi Lăng và xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm môi trường và các chức năng của môi trường',
        content: [
          'Môi trường sống của con người là tổng thể các điều kiện tự nhiên và nhân tạo bao quanh, có ảnh hưởng trực tiếp đến đời sống, sự tồn tại và phát triển của con người và sinh vật.',
          'Gồm: Môi trường tự nhiên (đất, nước, không khí, sinh vật); Môi trường nhân tạo (nhà cửa, đường sá, cầu cống, nhà máy); Môi trường xã hội (các mối quan hệ kinh tế, pháp luật, đạo đức).',
          'Ba chức năng cơ bản của môi trường:',
          '- Là không gian sinh sống của con người và các loài sinh vật.',
          '- Là nơi cung cấp các nguồn tài nguyên thiên nhiên phục vụ cho sản xuất và đời sống.',
          '- Là nơi chứa đựng, đồng hóa và thanh lọc các chất thải do con người tạo ra.'
        ],
        highlight: 'Môi trường có giới hạn chịu tải; khi con người xả thải vượt quá khả năng tự làm sạch của tự nhiên sẽ gây ra ô nhiễm và khủng hoảng sinh thái.',
      },
      {
        sectionTitle: '2. Phân loại tài nguyên thiên nhiên theo khả năng phục hồi',
        content: [
          'Tài nguyên thiên nhiên là các thành phần của tự nhiên mà con người có thể sử dụng trực tiếp hoặc chế biến để tạo ra của cải vật chất.',
          '- Tài nguyên không thể phục hồi: Khoáng sản (than đá, dầu mỏ, quặng sắt, đá vôi). Được hình thành qua hàng triệu năm biến đổi địa chất, khi khai thác sẽ cạn kiệt vĩnh viễn.',
          '- Tài nguyên có thể phục hồi: Đất, nước ngọt, sinh vật (rừng, động thực vật). Có thể tự tái tạo nếu con người sử dụng hợp lí, không khai thác quá mức ngưỡng sinh thái.',
          '- Tài nguyên vô tận: Bức xạ mặt trời, gió, thủy triều, địa nhiệt. Không bao giờ cạn kiệt do con người sử dụng.'
        ],
      },
      {
        sectionTitle: '3. Sử dụng hợp lí tài nguyên và an ninh môi trường',
        content: [
          'Khai thác tiết kiệm tài nguyên khoáng sản, đẩy mạnh tái chế và tìm kiếm vật liệu thay thế.',
          'Công thức tính thời gian khai thác mỏ: Thời gian cạn kiệt (năm) = Trữ lượng khoáng sản xác minh / Sản lượng khai thác hàng năm.',
          'Bảo vệ an ninh nguồn nước, an ninh lương thực và phòng ngừa các thảm họa môi trường xuyên biên giới.'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Môi trường sống (Environment)',
        definition: 'Tổng thể các yếu tố vật chất tự nhiên và nhân tạo bao quanh con người, chi phối sự tồn tại và phát triển của xã hội.'
      },
      {
        term: 'Tài nguyên không thể phục hồi',
        definition: 'Nguồn tài nguyên tự nhiên bị tiêu hao dần theo quá trình khai thác và không có khả năng tự tái tạo lại trong đời sống con người (khoáng sản).'
      },
      {
        term: 'An ninh môi trường',
        definition: 'Trạng thái hệ thống môi trường được bảo đảm an toàn, không có nguy cơ đe dọa đến sự sống và sự phát triển của con người.'
      }
    ],
    realWorldExamples: [
      'Tại xã Chi Lăng (Lạng Sơn), tài nguyên đá vôi là khoáng sản không thể phục hồi; việc khai thác đá vôi làm xi măng và đá xây dựng phải đi đôi với bảo vệ cảnh quan di tích lịch sử và hoàn nguyên môi trường sinh thái.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), tài nguyên nước ngầm và đất feralit trên đá vôi là tài nguyên có thể phục hồi nhưng rất dễ bị tổn thương; nhân dân có ý thức bảo vệ thảm rừng trên núi đá để giữ mạch nước ngầm không bị khô cạn.'
    ],
    keyTakeaways: [
      'Môi trường có 3 chức năng: không gian sống, nguồn cung cấp tài nguyên, nơi chứa đựng chất thải.',
      'Tài nguyên khoáng sản không thể phục hồi cần khai thác tiết kiệm; tài nguyên đất, nước, rừng cần sử dụng trong ngưỡng tự tái tạo.',
      'Thời gian cạn kiệt mỏ (năm) = Trữ lượng / Sản lượng khai thác hàng năm.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 39. Môi trường và tài nguyên thiên nhiên',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 39. Môi trường và tài nguyên thiên nhiên',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 39']
    }
  },
  {
    id: 'bai-40',
    number: 40,
    partId: 'phan-3',
    chapterId: 'chuong-13',
    topicId: 'chuong-13',
    title: 'Bài 40. Phát triển bền vững và tăng trưởng xanh',
    subtitle: 'Khái niệm phát triển bền vững, ba trụ cột giao thoa, kinh tế tuần hoàn và Chiến lược quốc gia về Tăng trưởng xanh',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được khái niệm phát triển bền vững và phân tích được mối quan hệ biện chứng giữa 3 trụ cột: Kinh tế - Xã hội - Môi trường.',
      'Giải thích được vì sao loài người bắt buộc phải chuyển dịch từ mô hình phát triển truyền thống sang mô hình phát triển bền vững và tăng trưởng xanh.',
      'Nêu được mục tiêu của Chiến lược quốc gia về Tăng trưởng xanh và cam kết đưa mức phát thải ròng về 0 (Net Zero) vào năm 2050 của Việt Nam.',
      'Tính toán tỉ trọng năng lượng xanh và đề xuất các hành động cụ thể xây dựng lối sống xanh tại xã Vạn Linh (Lạng Sơn).'
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái niệm và sự cần thiết phải Phát triển bền vững',
        content: [
          'Khái niệm: Phát triển bền vững là sự phát triển nhằm thỏa mãn nhu cầu của thế hệ hiện tại mà không làm tổn hại đến khả năng đáp ứng nhu cầu đó của các thế hệ mai sau trên cơ sở kết hợp chặt chẽ, hài hòa giữa tăng trưởng kinh tế, giải quyết các vấn đề xã hội và bảo vệ môi trường.',
          'Sự cần thiết: Mô hình tăng trưởng kinh tế truyền thống theo chiều rộng đã dẫn đến các hệ lụy nghiêm trọng: cạn kiệt tài nguyên, ô nhiễm môi trường, biến đổi khí hậu toàn cầu và gia tăng bất bình đẳng xã hội. Để cứu lấy Trái Đất và đảm bảo tương lai nhân loại, phát triển bền vững là con đường sống còn duy nhất.'
        ],
        highlight: 'Ba trụ cột của Phát triển bền vững: Tăng trưởng kinh tế bền vững + Tiến bộ và công bằng xã hội + Bảo vệ môi trường sinh thái trong lành.',
      },
      {
        sectionTitle: '2. Ba trụ cột giao thoa của Phát triển bền vững',
        content: [
          '- Trụ cột Kinh tế: Tăng trưởng kinh tế ổn định, hiệu quả cao, chuyển dịch cơ cấu theo hướng kinh tế tri thức và kinh tế số.',
          '- Trụ cột Xã hội: Xóa đói giảm nghèo, đảm bảo công bằng xã hội, tạo việc làm thỏa đáng, nâng cao chất lượng giáo dục, y tế và bảo tồn bản sắc văn hóa dân tộc.',
          '- Trụ cột Môi trường: Sử dụng hợp lí và tiết kiệm tài nguyên thiên nhiên, bảo tồn đa dạng sinh học, kiểm soát ô nhiễm và phục hồi các hệ sinh thái bị suy thoái.'
        ],
      },
      {
        sectionTitle: '3. Tăng trưởng xanh và hành động của Việt Nam',
        content: [
          'Tăng trưởng xanh là phương thức quan trọng để thực hiện phát triển bền vững, tiến trình tăng trưởng kinh tế dựa trên việc sử dụng hiệu quả tài nguyên, giảm phát thải khí nhà kính, phục hồi môi trường và ứng phó với biến đổi khí hậu.',
          'Cam kết của Việt Nam: Tại Hội nghị thượng đỉnh về biến đổi khí hậu của Liên Hợp Quốc (COP26), Việt Nam đã cam kết mạnh mẽ đạt mức phát thải ròng bằng 0 (Net Zero) vào năm 2050.',
          'Hành động của học sinh: Thực hiện lối sống xanh (tiết kiệm điện nước, trồng cây xanh, đi bộ hoặc xe đạp, phân loại rác thải tại nguồn, nói không với túi nilon dùng một lần).'
        ],
      }
    ],
    keyTerms: [
      {
        term: 'Phát triển bền vững (Sustainable Development)',
        definition: 'Mô hình phát triển kết hợp hài hòa giữa tăng trưởng kinh tế, công bằng xã hội và bảo vệ môi trường cho hôm nay và mai sau.'
      },
      {
        term: 'Tăng trưởng xanh (Green Growth)',
        definition: 'Sự tăng trưởng kinh tế đảm bảo rằng các tài sản tự nhiên tiếp tục cung cấp các nguồn tài nguyên và dịch vụ môi trường cho sự thịnh vượng của con người.'
      },
      {
        term: 'Lối sống xanh (Green Lifestyle)',
        definition: 'Phong cách sống thân thiện với môi trường, hạn chế tối đa việc tạo ra rác thải và giảm dấu chân các-bon cá nhân.'
      }
    ],
    realWorldExamples: [
      'Tại xã Chi Lăng và xã Vạn Linh (Lạng Sơn), định hướng tăng trưởng xanh được hiện thực hóa qua việc xây dựng thương hiệu Na Chi Lăng hữu cơ, bảo vệ rừng phòng hộ trên núi đá vôi, phát triển du lịch sinh thái nông nghiệp và ứng dụng năng lượng mặt trời.',
      'Ở xã Vạn Linh (tỉnh Lạng Sơn), phong trào xây dựng xã Nông thôn mới nâng cao gắn liền với tiêu chí môi trường xanh - sạch - đẹp: các tuyến đường hoa liên thôn bản, mô hình thu gom bao bì thuốc bảo vệ thực vật đúng nơi quy định và tinh thần giữ gìn nếp sống văn minh, đoàn kết của đồng bào các dân tộc.'
    ],
    keyTakeaways: [
      'Phát triển bền vững dựa trên 3 trụ cột vững chắc: Kinh tế - Xã hội - Môi trường.',
      'Tăng trưởng xanh và Net Zero 2050 là mục tiêu hành động quốc gia của Việt Nam.',
      'Mỗi học sinh Trường THPT Hòa Bình chung tay xây dựng quê hương xã Vạn Linh và xã Chi Lăng (Lạng Sơn) ngày càng giàu đẹp và xanh tươi.'
    ],
    visualData: {
      title: 'Trực quan hóa Bài 40. Phát triển bền vững và tăng trưởng xanh',
      description: 'Sơ đồ và bản đồ chuyên đề bài học Bài 40. Phát triển bền vững và tăng trưởng xanh',
      type: 'diagram',
      tags: ['Địa lí 10', 'GDPT 2018', 'Bài 40']
    }
  },
];
