const fs = require('fs');

const lessonsData = [
  // 1. Môn Địa lí với định hướng nghề nghiệp
  {
    num: 1,
    id: 'bai-1',
    partId: 'phan-1',
    chapterId: undefined,
    topicId: 'phan-1',
    title: 'Bài 1. Môn Địa lí với định hướng nghề nghiệp',
    subtitle: 'Đặc điểm môn học, vai trò của tri thức địa lí và các nhóm ngành nghề định hướng tương lai',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Khái quát được đặc điểm môn Địa lí cấp THPT: môn học tích hợp tri thức tự nhiên, kinh tế, xã hội và công nghệ địa không gian.',
      'Hiểu rõ vai trò của tri thức địa lí trong cuộc sống hàng ngày, giáo dục lòng yêu nước, ý thức bảo vệ tài nguyên môi trường.',
      'Xác định được các nhóm ngành nghề có liên quan trực tiếp đến tri thức địa lí: quy hoạch không gian, quản lí tài nguyên, bản đồ số, GIS, du lịch, nông nghiệp sinh thái.',
      'Có ý thức tự giác vận dụng kiến thức bài học vào định hướng nghề nghiệp phù hợp với năng lực bản thân và nhu cầu phát triển của tỉnh Lạng Sơn.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Đặc điểm và vị trí của môn Địa lí trong nhà trường',
        content: [
          'Môn Địa lí ở cấp THPT có tính chất đặc biệt: giao thoa giữa khoa học tự nhiên và khoa học xã hội. Địa lí vừa nghiên cứu cấu trúc, quy luật vận động của vỏ Trái Đất (tự nhiên), vừa nghiên cứu không gian tổ chức đời sống kinh tế - xã hội của loài người.',
          'Nội dung môn Địa lí 10 được thiết kế theo hướng phát triển phẩm chất và năng lực, giúp học sinh hình thành thế giới quan khoa học, tư duy không gian tổng hợp và khả năng phân tích mối quan hệ nhân quả trong không gian lãnh thổ.',
          'Môn Địa lí trang bị cho học sinh các công cụ và kĩ năng thực hành thiết yếu: khai thác bản đồ, biểu đồ số liệu, ứng dụng công nghệ viễn thám và hệ thống thông tin địa lí (GIS).',
        ],
        highlight: 'Địa lí là cầu nối giữa tự nhiên và xã hội, rèn luyện tư duy không gian tổng hợp và năng lực thích ứng với thế giới biến đổi.',
      },
      {
        sectionTitle: '2. Vai trò của tri thức Địa lí đối với đời sống',
        content: [
          'Thích ứng với điều kiện thời tiết, mùa vụ: Cung cấp hiểu biết để lựa chọn lịch thời vụ gieo trồng hợp lí, ứng phó với hiện tượng thời tiết cực đoan (lũ quét, sạt lở đá, rét đậm, sương muối).',
          'Định hướng không gian và di chuyển: Sử dụng thành thạo bản đồ, la bàn, ứng dụng định vị GPS và bản đồ số trong sinh hoạt, du lịch và giao thương hàng hóa.',
          'Sử dụng hợp lí tài nguyên và bảo vệ môi trường: Nâng cao ý thức tiết kiệm nguồn nước, bảo vệ rừng đầu nguồn, chống xói mòn đất dốc và xây dựng lối sống xanh.',
        ],
        diagramAscii: `+-----------------------------------------------------------+
|             VAI TRÒ CỦA TRI THỨC ĐỊA LÍ                   |
+-----------------------------------------------------------+
| -> Đời sống: Thích ứng thời tiết, phòng tránh thiên tai  |
| -> Định hướng: Sử dụng bản đồ, GPS, công nghệ định vị    |
| -> Kinh tế: Lựa chọn cây trồng, phân bố cơ sở sản xuất   |
| -> Môi trường: Sử dụng hợp lí tài nguyên & tăng trưởng xanh |
+-----------------------------------------------------------+`,
      },
      {
        sectionTitle: '3. Định hướng nghề nghiệp tương lai liên quan đến Địa lí',
        content: [
          'Nhóm ngành khoa học Trái Đất và môi trường: Khí tượng thủy văn, địa chất khoáng sản, hải dương học, quản lí tài nguyên đất, bảo tồn đa dạng sinh học.',
          'Nhóm ngành kinh tế - xã hội và quy hoạch: Quy hoạch đô thị và nông thôn, kinh tế phát triển, quản trị logistic, cán bộ địa chính xã/phường, trật tự xây dựng.',
          'Nhóm ngành công nghệ không gian: Kĩ thuật đo đạc bản đồ số, hệ thống thông tin địa lí (GIS), viễn thám vệ tinh (Remote Sensing), công nghệ định vị GPS.',
          'Nhóm ngành du lịch và dịch vụ: Hướng dẫn viên du lịch, quản trị lữ hành, nghiên cứu văn hóa vùng miền, xuất nhập khẩu và xúc tiến thương mại quốc tế.',
        ],
        tableData: {
          headers: ['Nhóm ngành nghề', 'Tri thức Địa lí ứng dụng', 'Vị trí việc làm tiêu biểu'],
          rows: [
            ['Tài nguyên & Môi trường', 'Địa lí tự nhiên, sinh quyển, thổ nhưỡng', 'Cán bộ đo đạc địa chính, quan trắc môi trường'],
            ['Công nghệ Không gian', 'Bản đồ học, viễn thám, dữ liệu GIS', 'Chuyên viên bản đồ số, lập trình GIS, quản trị đất đai'],
            ['Kinh tế & Quy hoạch', 'Địa lí dân cư, nông nghiệp, công nghiệp', 'Quy hoạch viên nông thôn mới, chuyên viên logistics'],
            ['Du lịch & Lữ hành', 'Địa lí kinh tế - xã hội, địa danh, văn hóa', 'Hướng dẫn viên du lịch, điều hành tour, quảng bá di sản'],
          ],
        },
      },
    ],
    keyTerms: [
      {
        term: 'Tri thức Địa lí',
        definition: 'Hệ thống hiểu biết về các quy luật tự nhiên, kinh tế - xã hội và mối quan hệ tương hỗ của các thành phần trong vỏ cảnh quan Trái Đất.',
      },
      {
        term: 'Hệ thống Thông tin Địa lí (GIS)',
        definition: 'Hệ thống máy tính thu thập, lưu trữ, kiểm tra, phân tích và hiển thị dữ liệu liên quan đến các vị trí trên bề mặt Trái Đất.',
      },
      {
        term: 'Quy hoạch không gian',
        definition: 'Phương pháp phân bố và tổ chức không gian hợp lí cho các hoạt động kinh tế, xã hội và bảo vệ môi trường trên một vùng lãnh thổ.',
      },
    ],
    realWorldExamples: [
      'Tại xã Vạn Linh (Chi Lăng, Lạng Sơn), cán bộ địa chính xã ứng dụng bản đồ số và máy định vị GPS để đo đạc diện tích vườn na, cấp giấy chứng nhận quyền sử dụng đất cho các hộ dân.',
      'Học sinh Trường THPT Hòa Bình có cơ hội phát triển nghề nghiệp trong các ngành: ứng dụng công nghệ viễn thám theo dõi mùa hoa quả Chi Lăng, kĩ thuật viên bản đồ địa chính, hoặc làm việc trong lĩnh vực thương mại cửa khẩu quốc tế tại tỉnh Lạng Sơn.',
    ],
    keyTakeaways: [
      'Địa lí 10 là môn học tích hợp sâu sắc giữa tự nhiên, xã hội và công nghệ số.',
      'Tri thức địa lí mở ra nhiều hướng nghiệp thiết thực, gắn chặt với định hướng phát triển nông nghiệp hàng hóa và kinh tế cửa khẩu của tỉnh Lạng Sơn.',
    ],
    visualData: {
      title: 'Cây nghề nghiệp ngành Địa lí ứng dụng',
      description: 'Sơ đồ định hướng việc làm từ nền tảng Địa lí tự nhiên, Địa lí kinh tế - xã hội và Công nghệ địa không gian.',
      type: 'diagram',
      tags: ['Định hướng nghề nghiệp', 'GIS', 'Quy hoạch', 'Địa lí 10'],
    },
  },

  // 2. Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ
  {
    num: 2,
    id: 'bai-2',
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
      'Vận dụng phương pháp đọc bản đồ vào khai thác bản đồ hành chính, bản đồ tự nhiên và bản đồ kinh tế tỉnh Lạng Sơn.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Khái quát về bản đồ và hệ thống phương pháp biểu hiện',
        content: [
          'Bản đồ là hình ảnh thu nhỏ, khái quát hóa một phần hay toàn bộ bề mặt Trái Đất lên mặt phẳng theo những quy tắc toán học nhất định (phép chiếu, tỉ lệ) và hệ thống kí hiệu quy ước.',
          'Để phản ánh đầy đủ vị trí, số lượng, chất lượng, cấu trúc và động thái của vô số đối tượng địa lí trong không gian, bản đồ học sử dụng nhiều phương pháp biểu hiện chuyên biệt.',
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
          'e) Phương pháp bản đồ - biểu đồ: Đặt các biểu đồ (cột, tròn, thanh) vào các đơn vị lãnh thổ hành chính để thể hiện số lượng, cơ cấu, động thái của hiện tượng (sản lượng lương thực các tỉnh, giá trị xuất khẩu, cơ cấu kinh tế).',
        ],
        tableData: {
          headers: ['Phương pháp', 'Đối tượng biểu hiện', 'Khả năng thể hiện', 'Ví dụ thực tế'],
          rows: [
            ['Kí hiệu', 'Đối tượng phân bố theo điểm', 'Tọa độ chính xác, quy mô, chất lượng', 'Mỏ than Na Dương, nhà máy xi măng Đồng Bành'],
            ['Đường chuyển động', 'Đối tượng có sự di chuyển', 'Hướng, tốc độ, khối lượng luân chuyển', 'Gió mùa Đông Bắc thổi qua Lạng Sơn, luồng xe Quốc lộ 1A'],
            ['Chấm điểm', 'Đối tượng phân tán lẻ tẻ', 'Số lượng và mật độ phân bố', 'Phân bố dân cư nông thôn các thôn bản xã Vạn Linh'],
            ['Khoanh vùng', 'Đối tượng phân bố theo vùng', 'Phạm vi không gian lãnh thổ', 'Vùng trồng na Chi Lăng, rừng hồi xứ Lạng'],
            ['Bản đồ - biểu đồ', 'Hiện tượng thống kê theo đơn vị lãnh thổ', 'Quy mô tổng số, cơ cấu thành phần (%)', 'Sản lượng cây ăn quả các huyện của tỉnh Lạng Sơn'],
          ],
        },
      },
      {
        sectionTitle: '3. Phương pháp tính toán cự li thực tế từ tỉ lệ bản đồ',
        content: [
          'Tỉ lệ bản đồ chỉ rõ mức độ thu nhỏ của khoảng cách trên bản đồ so với khoảng cách ngoài thực địa.',
          'Công thức: D (thực địa) = d (trên bản đồ) × M (mẫu số tỉ lệ).',
          'Ví dụ: Nếu đo được khoảng cách giữa Trường THPT Hòa Bình và trung tâm thị trấn Chi Lăng trên bản đồ tỉ lệ 1 : 100.000 là 8,5 cm, thì khoảng cách thực tế là 8,5 × 100.000 cm = 850.000 cm = 8,5 km.',
        ],
        highlight: 'Chú ý đổi đúng đơn vị đo: 1 km = 1.000 m = 100.000 cm; 1 m = 100 cm = 1.000 mm.',
      },
    ],
    keyTerms: [
      {
        term: 'Kí hiệu bản đồ',
        definition: 'Hệ thống các biểu tượng quy ước dùng để biểu thị vị trí, đặc tính và số lượng của các đối tượng địa lí trên bản đồ.',
      },
      {
        term: 'Đường chuyển động',
        definition: 'Phương pháp dùng các mũi tên có hình dáng, màu sắc và kích thước khác nhau để biểu thị hướng đi, tốc độ và khối lượng di chuyển của đối tượng địa lí.',
      },
      {
        term: 'Tỉ lệ bản đồ',
        definition: 'Tỉ số giữa khoảng cách đo được trên bản đồ với khoảng cách tương ứng ngoài thực địa.',
      },
    ],
    realWorldExamples: [
      'Trên bản đồ nông nghiệp khu vực Chi Lăng (Lạng Sơn), vùng trồng na đặc sản tại xã Vạn Linh được biểu hiện bằng phương pháp khoanh vùng kết hợp màu nền xanh lá mạ.',
      'Tuyến Quốc lộ 1A và đường sắt Hà Nội - Lạng Sơn chạy qua khu vực Chi Lăng được biểu hiện bằng phương pháp kí hiệu tuyến (đường kẻ màu phân cấp độ dày).',
    ],
    keyTakeaways: [
      'Mỗi phương pháp biểu hiện có ưu thế riêng và được kết hợp hài hòa trên một bản đồ chuyên đề.',
      'Muốn đọc bản đồ chính xác, bước đầu tiên phải đọc kĩ bảng chú giải và xác định tỉ lệ bản đồ.',
      'Nắm vững công thức D = d × M để chuyển đổi khoảng cách đo trên bản đồ thành khoảng cách thực địa.',
    ],
    visualData: {
      title: 'Hệ thống 5 phương pháp biểu hiện trên bản đồ chuyên đề',
      description: 'Mô phỏng trực quan kí hiệu điểm, mũi tên chuyển động, điểm chấm, ranh giới khoanh vùng và biểu đồ cột trên bản đồ.',
      type: 'map',
      tags: ['Phương pháp bản đồ', 'Kí hiệu', 'Tỉ lệ bản đồ', 'Địa lí 10'],
    },
  },

  // 3. Sử dụng bản đồ, GPS và bản đồ số
  {
    num: 3,
    id: 'bai-3',
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
      'Tính toán được thời gian truyền tín hiệu vô tuyến GPS và vận tốc di chuyển thực tế từ dữ liệu định vị.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Quy trình các bước sử dụng bản đồ hiệu quả',
        content: [
          'Bước 1: Chọn bản đồ phù hợp với mục đích học tập hoặc công việc (bản đồ tự nhiên, dân cư, kinh tế, giao thông).',
          'Bước 2: Đọc tên bản đồ để nắm chủ đề, đọc bảng chú giải để hiểu ý nghĩa các kí hiệu quy ước.',
          'Bước 3: Xác định tỉ lệ bản đồ và phương hướng (hướng Bắc trên kinh tuyến hoặc hoa la bàn).',
          'Bước 4: Xác định vị trí các đối tượng cần tìm, phân tích mối liên hệ không gian giữa các đối tượng địa lí và rút ra nhận xét, giải thích nguyên nhân.',
        ],
        highlight: 'Bản đồ là cuốn sách giáo khoa thứ hai của môn Địa lí. Đọc bản đồ phải đi từ tổng quan đến chi tiết, từ mô tả đến giải thích.',
      },
      {
        sectionTitle: '2. Hệ thống Định vị Toàn cầu (GPS) và Bản đồ số',
        content: [
          'a) Hệ thống GPS: Là hệ thống định vị vệ tinh của Hoa Kỳ, bao gồm tối thiểu 24 vệ tinh bay quanh Trái Đất ở độ cao khoảng 20.200 km. Thiết bị thu GPS trên mặt đất nhận tín hiệu từ ít nhất 4 vệ tinh cùng lúc để tính toán chính xác tọa độ (vĩ độ, kinh độ), độ cao và thời gian thực.',
          'b) Bản đồ số: Là tập hợp dữ liệu không gian được số hóa và quản lí trên máy tính, hiển thị trực quan trên màn hình. Bản đồ số có tính năng tương tác vượt trội: phóng to thu nhỏ, tìm kiếm địa điểm, xếp chồng nhiều lớp thông tin (lớp giao thông, lớp dịch vụ, lớp địa hình), tự động tính toán lộ trình tối ưu và cập nhật tình trạng giao thông theo thời gian thực.',
        ],
        diagramAscii: `+-----------------------------------------------------------+
|              NGUYÊN LÍ ĐỊNH VỊ GPS VỆ TINH                |
+-----------------------------------------------------------+
|  Vệ tinh 1 (S1)       Vệ tinh 2 (S2)       Vệ tinh 3 (S3) |
|       \\                     |                    /        |
|        \\                    |                   /         |
|         \\                   |                  /          |
|          +------------------v-----------------+           |
|          |  MÁY THU GPS MẶT ĐẤT (SmartPhone)  |           |
|          | -> Tọa độ: (Kinh độ, Vĩ độ)        |           |
|          | -> Độ cao địa hình (Z)             |           |
|          | -> Thời gian chính xác tuyệt đối   |           |
+----------+------------------------------------+-----------+`,
      },
      {
        sectionTitle: '3. Ứng dụng thực tiễn của GPS và Bản đồ số trong đời sống',
        content: [
          'Trong giao thông vận tải: Dẫn đường ô tô, xe máy, giám sát hành trình xe chở nông sản từ Chi Lăng đi các tỉnh, xe container qua cửa khẩu Lạng Sơn.',
          'Trong nông nghiệp thông minh: Quản lí diện tích vườn cây ăn quả bằng flycam gắn GPS, bón phân và phun thuốc chính xác theo tọa độ.',
          'Trong phòng chống thiên tai và cứu hộ cứu nạn: Xác định nhanh vị trí sạt lở núi đá vôi ở Chi Lăng, theo dõi hướng bão và điều động lực lượng ứng cứu.',
          'Trong du lịch và đời sống: Tra cứu điểm di tích Ải Chi Lăng, khách sạn, trạm y tế, chia sẻ vị trí cho người thân.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Hệ thống Định vị Toàn cầu (GPS)',
        definition: 'Mạng lưới các vệ tinh nhân tạo quay quanh Trái Đất phát tín hiệu vô tuyến giúp thiết bị mặt đất xác định tọa độ vị trí 3 chiều và thời gian.',
      },
      {
        term: 'Bản đồ số (Digital Map)',
        definition: 'Bản đồ được tạo dựng và lưu trữ dưới dạng dữ liệu số hóa trên máy tính, cho phép tương tác, tìm kiếm và phân tích động.',
      },
      {
        term: 'Điều hướng (Navigation)',
        definition: 'Quá trình xác định vị trí hiện tại và chỉ dẫn đường đi tối ưu đến một điểm đích đã chọn.',
      },
    ],
    realWorldExamples: [
      'Các thương lái thu mua na tại xã Vạn Linh (Chi Lăng, Lạng Sơn) sử dụng ứng dụng Google Maps để định vị các điểm thu gom, tối ưu hóa tuyến đường vận chuyển về Hà Nội và các tỉnh.',
      'Người dân và du khách đến tham quan Khu di tích lịch sử Ải Chi Lăng (Lạng Sơn) dùng GPS trên điện thoại để tra cứu các điểm di tích: Núi Mặt Quỷ, Đền Quỷ Môn Quan, Ngựa Cương.',
    ],
    keyTakeaways: [
      'Sử dụng bản đồ khoa học đòi hỏi quy trình 4 bước từ chọn bản đồ, đọc chú giải đến phân tích mối liên hệ.',
      'GPS cung cấp tọa độ chính xác nhờ giao thoa tín hiệu vô tuyến từ chùm vệ tinh không gian.',
      'Bản đồ số là công cụ đắc lực hỗ trợ thông minh cho sản xuất nông nghiệp, giao thông và đời sống tại Lạng Sơn.',
    ],
    visualData: {
      title: 'Mô phỏng mạng lưới vệ tinh GPS và giao diện bản đồ số',
      description: 'Sơ đồ chùm vệ tinh trên quỹ đạo không gian và thiết bị thu di động mặt đất định vị tọa độ địa lí.',
      type: 'diagram',
      tags: ['GPS', 'Bản đồ số', 'Dẫn đường', 'Địa lí 10'],
    },
  },

  // 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất
  {
    num: 4,
    id: 'bai-4',
    partId: 'phan-2',
    chapterId: 'chuong-2',
    topicId: 'chuong-2',
    title: 'Bài 4. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo vỏ Trái Đất',
    subtitle: 'Nguồn gốc hình thành hành tinh, cấu trúc phân lớp Trái Đất và các nhóm khoáng vật, đá cấu tạo vỏ Trái Đất',
    durationMinutes: 45,
    isPracticeLesson: false,
    objectives: [
      'Trình bày được nguồn gốc hình thành Trái Đất theo giả thuyết tinh vân mặt trời.',
      'Mô tả được cấu trúc phân lớp của Trái Đất gồm 3 lớp chính: Vỏ Trái Đất, Manti và Nhân (Lõi).',
      'Phân biệt được cấu tạo của vỏ lục địa và vỏ đại dương; nhận biết 3 nhóm đá chính cấu tạo nên vỏ Trái Đất: đá mácma, đá trầm tích và đá biến chất.',
      'Tính toán được tỉ trọng thể tích/khối lượng của các lớp cấu tạo Trái Đất và vận dụng kiến thức giải thích nguồn gốc đá vôi tại Chi Lăng (Lạng Sơn).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Nguồn gốc hình thành Trái Đất',
        content: [
          'Trái Đất được hình thành cách đây khoảng 4,6 tỉ năm từ một đám mây bụi khí tinh vân mặt trời nguyên thủy.',
          'Dưới tác dụng của lực hấp dẫn, vật chất ngưng tụ ở trung tâm tạo thành Mặt Trời, các hạt bụi và khí còn lại kết tụ thành các hành tinh trong Hệ Mặt Trời, trong đó có Trái Đất.',
          'Trong giai đoạn đầu, sự phân dị trọng lực khiến các vật chất nặng (sắt, niken) chìm xuống tạo thành nhân, các vật chất nhẹ hơn (silic, nhôm) nổi lên tạo thành vỏ và manti.',
        ],
        highlight: 'Trái Đất có cấu trúc đồng tâm gồm 3 lớp từ ngoài vào trong: Vỏ Trái Đất -> Manti -> Nhân.',
      },
      {
        sectionTitle: '2. Cấu trúc vỏ Trái Đất: Vỏ lục địa và Vỏ đại dương',
        content: [
          'Vỏ Trái Đất là lớp ngoài cùng mỏng nhất, dày từ 5 km (dưới đáy đại dương) đến 70 km (dưới các dãy núi cao trên lục địa). Ranh giới giữa vỏ và manti là mặt Mohorovicic (Moho).',
          'Vỏ lục địa: Dày trung bình 35 - 70 km, gồm 3 tầng: tầng trầm tích ở trên cùng, tầng granit ở giữa và tầng bazan ở dưới cùng.',
          'Vỏ đại dương: Mỏng hơn (khoảng 5 - 10 km), cấu tạo chủ yếu bởi tầng bazan và một lớp trầm tích đại dương mỏng ở trên, không có tầng đá granit liên tục.',
        ],
        tableData: {
          headers: ['Đặc điểm', 'Vỏ lục địa', 'Vỏ đại dương'],
          rows: [
            ['Độ dày trung bình', '35 - 70 km (dày nhất dưới dãy Hi-ma-lay-a)', '5 - 10 km'],
            ['Cấu tạo tầng đá', 'Trầm tích -> Granit (đá hoa cương) -> Bazan', 'Trầm tích biển mỏng -> Bazan (không có granit)'],
            ['Thành phần khoáng', 'Giàu Si và Al (lớp Sial)', 'Giàu Si và Mg (lớp Sima)'],
            ['Tỉ trọng vật chất', 'Nhẹ hơn (khoảng 2,7 g/cm³)', 'Nặng hơn (khoảng 3,0 g/cm³)'],
          ],
        },
      },
      {
        sectionTitle: '3. Vật liệu cấu tạo vỏ Trái Đất: Khoáng vật và 3 nhóm đá',
        content: [
          'Khoáng vật là các hợp chất hóa học tự nhiên có thành phần và cấu trúc tinh thể xác định (thạch anh, fenspat, canxit, mica).',
          'a) Đá mácma: Hình thành do sự nguội lạnh và đông kết của dung nham nóng chảy. Gồm đá mácma xâm nhập (granit - kết tinh chậm sâu dưới đất) và mácma phun trào (bazan, riolit - phun ra bề mặt).',
          'b) Đá trầm tích: Hình thành do sự lắng tụ, nén ép và gắn kết của các mảnh vụn hoặc kết tủa hóa học, tích tụ xác sinh vật trong các vùng trũng (đá vôi, sa thạch, sét, than đá). Đá trầm tích thường xếp thành từng lớp nằm ngang.',
          'c) Đá biến chất: Hình thành từ đá mácma hoặc đá trầm tích bị biến đổi sâu sắc do tác động của nhiệt độ cao và áp suất lớn trong lòng đất (đá hoa từ đá vôi, đá phiến từ sét, đá gơnai từ granit).',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Vỏ Trái Đất',
        definition: 'Lớp vật chất cứng ngoài cùng của Trái Đất, có độ dày từ khoảng 5 km (dưới đại dương) đến 70 km (dưới lục địa).',
      },
      {
        term: 'Mặt Moho (Mohorovicic)',
        definition: 'Bề mặt ranh giới phân cách giữa vỏ Trái Đất và lớp manti trên, nơi vận tốc truyền sóng địa chấn tăng vọt đột ngột.',
      },
      {
        term: 'Đá trầm tích',
        definition: 'Loại đá được hình thành trong các bồn trũng do sự lắng tụ, nén ép và gắn kết của các vật liệu vụn nát hoặc kết tủa hóa học, xác sinh vật.',
      },
    ],
    realWorldExamples: [
      'Tại khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn), đá cấu tạo chủ yếu là đá vôi trầm tích biển cổ tuổi Cổ sinh (Palêôzôi), giàu canxit (CaCO3), hình thành từ đáy biển nông hàng trăm triệu năm trước.',
      'Các dãy núi đá vôi dựng đứng tại Ải Chi Lăng và thung lũng Vạn Linh chứa nhiều hang động karst tự nhiên, là vật liệu đá trầm tích hữu cơ đặc trưng của vùng Đông Bắc.',
    ],
    keyTakeaways: [
      'Trái Đất cấu tạo 3 lớp: Vỏ, Manti, Nhân. Vỏ lục địa dày và có tầng granit, vỏ đại dương mỏng không có tầng granit.',
      'Ba nhóm đá cấu tạo vỏ Trái Đất gồm mácma, trầm tích và biến chất, liên tục chuyển hóa qua chu trình đá.',
      'Đá vôi Chi Lăng (Lạng Sơn) là đá trầm tích giàu giá trị cảnh quan và kinh tế sản xuất xi măng.',
    ],
    visualData: {
      title: 'Mặt cắt cấu tạo các lớp quyển của Trái Đất',
      description: 'Sơ đồ phân lớp Vỏ lục địa, Vỏ đại dương, Manti trên, Manti dưới, Nhân ngoài lỏng và Nhân trong rắn.',
      type: 'earth',
      tags: ['Cấu tạo Trái Đất', 'Vỏ Trái Đất', 'Khoáng vật', 'Địa lí 10'],
    },
  },

  // 5. Hệ quả địa lí các chuyển động của Trái Đất
  {
    num: 5,
    id: 'bai-5',
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
      'Giải thích được hiện tượng mùa đông lạnh sâu và chênh lệch độ dài ngày đêm vào mùa hè tại xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Hệ quả chuyển động tự quay quanh trục của Trái Đất',
        content: [
          'Trái Đất tự quay quanh trục nghiêng 66°33’ so với mặt phẳng quỹ đạo, theo hướng từ tây sang đông với chu kì 24 giờ (1 ngày đêm).',
          'a) Hiện tượng ngày đêm luân phiên: Do Trái Đất hình cầu nên Mặt Trời chỉ chiếu sáng một nửa (ban ngày), nửa khuất là ban đêm. Do Trái Đất tự quay nên mọi nơi lần lượt có ngày và đêm luân phiên nhau.',
          'b) Giờ trên Trái Đất: Chia bề mặt Trái Đất làm 24 múi giờ, mỗi múi rộng 15° kinh tuyến (ứng với 1 giờ). Múi số 0 lấy kinh tuyến gốc (0°) chạy qua đài thiên văn Greenwich làm chuẩn (giờ GMT hay UTC). Việt Nam nằm trọn trong múi giờ số 7 (kinh tuyến 105°Đ). Khi đi từ tây sang đông qua kinh tuyến 180° (đường đổi ngày quốc tế) lùi lại 1 ngày lịch, từ đông sang tây tăng thêm 1 ngày lịch.',
          'c) Lực Cô-ri-ô-lit: Lực làm lệch hướng chuyển động của các vật thể trên bề mặt Trái Đất. Ở bán cầu Bắc, vật thể chuyển động bị lệch về bên phải; ở bán cầu Nam bị lệch về bên trái theo hướng chuyển động.',
        ],
        highlight: 'Công thức tính giờ múi: T_B = T_A + (Múi B - Múi A). Công thức góc nhập xạ: h = 90° - |vĩ độ φ ± vĩ độ xích kinh α|.',
      },
      {
        sectionTitle: '2. Hệ quả chuyển động quay quanh Mặt Trời',
        content: [
          'Trái Đất quay quanh Mặt Trời theo quỹ đạo elip gần tròn với chu kì 365 ngày 6 giờ (1 năm). Trục Trái Đất nghiêng không đổi phương tạo nên các hệ quả quan trọng:',
          'a) Các mùa trong năm: Do trục Trái Đất nghiêng nên lần lượt bán cầu Bắc và bán cầu Nam ngả về phía Mặt Trời, nhận được lượng nhiệt và ánh sáng khác nhau sinh ra 4 mùa (Xuân, Hạ, Thu, Đông). Hai bán cầu có mùa đối lập nhau.',
          'b) Hiện tượng ngày đêm dài ngắn theo mùa và theo vĩ độ: Mùa nóng (mùa hạ) có ngày dài hơn đêm; mùa lạnh (mùa đông) có ngày ngắn hơn đêm. Ở Xích đạo ngày đêm luôn dài bằng nhau quanh năm (12h ngày, 12h đêm). Càng lên vĩ độ cao độ chênh lệch ngày đêm càng lớn; từ vòng cực lên cực có hiện tượng ngày hoặc đêm dài 24 giờ (ngày địa cực, đêm địa cực).',
        ],
        diagramAscii: `+-----------------------------------------------------------+
|   VỊ TRÍ 4 NGÀY ĐẶC BIỆT TRONG QUỸ ĐẠO QUANH MẶT TRỜI    |
+-----------------------------------------------------------+
|  21/3 (Xuân phân): Mặt Trời lên thiên đỉnh tại Xích đạo   |
|  22/6 (Hạ chí): Mặt Trời lên thiên đỉnh tại Chí tuyến Bắc  |
|  23/9 (Thu phân): Mặt Trời lên thiên đỉnh tại Xích đạo    |
|  22/12 (Đông chí): Mặt Trời lên thiên đỉnh tại Chí tuyến Nam|
+-----------------------------------------------------------+`,
      },
      {
        sectionTitle: '3. Phương pháp giải bài tập tính giờ và góc nhập xạ',
        content: [
          '1. Tính giờ múi: Múi giờ = Kinh độ / 15 (làm tròn số nguyên). Nếu ở bán cầu Đông: T_địa phương = GMT + Múi. Bán cầu Tây: T = GMT - Múi.',
          '2. Tính giờ địa phương theo kinh độ: Cứ chênh lệch 1° kinh độ tương ứng 4 phút thời gian (60 phút / 15° = 4 phút). Đi về phía đông cộng thêm, đi về phía tây trừ đi.',
          '3. Tính góc nhập xạ (độ cao Mặt Trời lúc 12h trưa): h = 90° - |φ - α| khi cùng bán cầu; h = 90° - (φ + α) khi khác bán cầu.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Giờ GMT (Giờ quốc tế)',
        definition: 'Giờ tại múi giờ số 0, lấy kinh tuyến gốc chạy qua Đài thiên văn Greenwich (Luân Đôn, Anh) làm kinh tuyến trung tâm.',
      },
      {
        term: 'Lực Cô-ri-ô-lit',
        definition: 'Lực quán tính sinh ra do chuyển động tự quay của Trái Đất, làm lệch hướng chuyển động của các khối khí, dòng biển và vật thể.',
      },
      {
        term: 'Mặt Trời lên thiên đỉnh',
        definition: 'Hiện tượng Mặt Trời chiếu thẳng góc vào bề mặt Trái Đất (góc nhập xạ bằng 90°) lúc 12 giờ trưa, chỉ xảy ra ở vùng nội chí tuyến.',
      },
    ],
    realWorldExamples: [
      'Tỉnh Lạng Sơn (trong đó có xã Vạn Linh, Chi Lăng) nằm ở khoảng 21°40’B đến 22°B thuộc múi giờ số 7. Mỗi năm tại đây có 2 lần Mặt Trời lên thiên đỉnh vào khoảng cuối tháng 5 và giữa tháng 7.',
      'Vào ngày Hạ chí (22/6), học sinh tại xã Vạn Linh (Chi Lăng) quan sát thấy ngày dài nhất trong năm (khoảng 13,5 giờ ban ngày), trời tối muộn đúng như câu ca dao "Đêm tháng năm chưa nằm đã sáng".',
    ],
    keyTakeaways: [
      'Trái Đất tự quay sinh ra luân phiên ngày đêm, giờ trên Trái Đất và lực Cô-ri-ô-lit.',
      'Trái Đất quay quanh Mặt Trời với trục nghiêng không đổi sinh ra 4 mùa và hiện tượng ngày đêm dài ngắn theo mùa, theo vĩ độ.',
      'Việt Nam nằm ở múi giờ thứ 7 (GMT+7); nắm vững công thức đổi kinh độ ra thời gian (1° = 4 phút).',
    ],
    visualData: {
      title: 'Mô hình chuyển động Trái Đất quanh Mặt Trời và các mùa',
      description: 'Sơ đồ góc chiếu Mặt Trời tại các vị trí Xuân phân, Hạ chí, Thu phân và Đông chí trên quỹ đạo elip.',
      type: 'earth',
      tags: ['Chuyển động Trái Đất', 'Tính giờ', 'Mùa', 'Địa lí 10'],
    },
  },
];

console.log('Total sample rich lessons loaded in builder:', lessonsData.length);
