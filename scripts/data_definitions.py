# -*- coding: utf-8 -*-
"""
Curriculum metadata and calculation generators for all 40 lessons.
SGK Địa lí 10 - Bộ sách Kết nối tri thức với cuộc sống.
Strict local scope constraint: Only Xã Vạn Linh, Khu vực Chi Lăng, Tỉnh Lạng Sơn.
"""

LESSONS_CONFIG = [
  {
    "num": 1,
    "id": "bai-1",
    "partId": "phan-1",
    "chapterId": None,
    "topicId": "phan-1",
    "title": "Bài 1. Môn Địa lí với định hướng nghề nghiệp",
    "subtitle": "Đặc điểm môn học, vai trò của tri thức địa lí và các nhóm ngành nghề định hướng tương lai",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái quát đặc điểm môn Địa lí cấp THPT, tích hợp tự nhiên, kinh tế, xã hội và công nghệ địa không gian; vai trò tri thức địa lí và định hướng nghề nghiệp.",
    "calcConcept": "Tính tỉ trọng lao động có chuyên môn địa lí/bản đồ/GIS trong tổng nguồn lực quy hoạch (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "%",
    "objectives": [
      "Khái quát được đặc điểm môn Địa lí cấp THPT: môn học tích hợp sâu sắc giữa khoa học tự nhiên, khoa học xã hội và công nghệ địa không gian.",
      "Phân tích được vai trò to lớn của tri thức địa lí trong đời sống hàng ngày, định hướng hành vi bảo vệ môi trường và sử dụng hợp lí tài nguyên.",
      "Xác định được các nhóm ngành nghề có liên quan trực tiếp đến tri thức địa lí: quản lí tài nguyên, bản đồ số, GIS, quy hoạch không gian, du lịch sinh thái.",
      "Có ý thức tự giác vận dụng kiến thức bài học vào định hướng nghề nghiệp phù hợp với năng lực bản thân và nhu cầu phát triển của tỉnh Lạng Sơn."
    ],
    "keySections": [
      {
        "title": "1. Đặc điểm và vị trí của môn Địa lí trong nhà trường",
        "paragraphs": [
          "Môn Địa lí ở trường THPT có vị trí đặc thù: là môn học giao thoa giữa khoa học tự nhiên và khoa học xã hội. Địa lí vừa nghiên cứu các quy luật tự nhiên của vỏ Trái Đất (địa hình, khí quyển, thủy quyển, sinh quyển), vừa nghiên cứu không gian tổ chức kinh tế - xã hội của loài người (dân cư, đô thị, nông nghiệp, công nghiệp, dịch vụ).",
          "Chương trình Địa lí 10 (bộ sách Kết nối tri thức với cuộc sống) chú trọng phát triển phẩm chất và năng lực cho học sinh: năng lực nhận thức thế giới theo quan điểm không gian, năng lực giải thích các mối quan hệ nhân quả trong tự nhiên và xã hội, năng lực sử dụng công cụ địa lí hiện đại.",
          "Học Địa lí giúp hình thành nhân sinh quan đúng đắn, tinh thần tôn trọng sự đa dạng văn hóa và ý thức trách nhiệm trước các vấn đề toàn cầu như biến đổi khí hậu, cạn kiệt tài nguyên."
        ],
        "highlight": "Địa lí là chiếc cầu nối giữa tự nhiên và xã hội, trang bị tư duy không gian tổng hợp và năng lực thích ứng linh hoạt với thời đại số."
      },
      {
        "title": "2. Vai trò của tri thức Địa lí đối với đời sống thực tiễn",
        "paragraphs": [
          "Thích ứng với điều kiện thời tiết, mùa vụ: Giúp con người nắm bắt quy luật khí hậu để bố trí cơ cấu cây trồng, mùa vụ thích hợp, chủ động phòng tránh các hiện tượng thời tiết cực đoan như lũ quét, sạt lở núi đá vôi, rét đậm rét hại và sương muối.",
          "Định hướng và di chuyển trong không gian: Cung cấp kĩ năng đọc bản đồ, la bàn, sử dụng thiết bị định vị GPS và ứng dụng bản đồ số trên điện thoại thông minh để tìm đường, đo khoảng cách và khảo sát địa bàn.",
          "Bảo vệ môi trường và phát triển bền vững: Nhận thức rõ giới hạn của tài nguyên thiên nhiên, từ đó hình thành lối sống văn minh, tiết kiệm nguồn nước ngọt, bảo vệ thảm thực vật rừng và tham gia giảm thiểu rác thải nhựa."
        ]
      },
      {
        "title": "3. Định hướng nghề nghiệp tương lai liên quan đến Địa lí",
        "paragraphs": [
          "Nhóm ngành tài nguyên và môi trường: Khí tượng thủy văn, địa chất khoáng sản, hải dương học, quản lí tài nguyên đất đai, bảo tồn thiên nhiên, trắc địa công trình.",
          "Nhóm ngành kinh tế, quy hoạch và quản lí: Quy hoạch đô thị và nông thôn, kinh tế phát triển, quản trị logistics, cán bộ địa chính xã/phường, trật tự xây dựng.",
          "Nhóm ngành công nghệ địa không gian: Kĩ thuật đo đạc bản đồ số, hệ thống thông tin địa lí (GIS), viễn thám vệ tinh (Remote Sensing), công nghệ định vị vệ tinh.",
          "Nhóm ngành du lịch và dịch vụ: Quản trị lữ hành, hướng dẫn viên du lịch, nghiên cứu văn hóa vùng miền, xuất nhập khẩu và xúc tiến thương mại quốc tế."
        ]
      }
    ],
    "terms": [
      {"term": "Tri thức Địa lí", "def": "Hệ thống hiểu biết về các quy luật tự nhiên, kinh tế - xã hội và mối quan hệ tương hỗ của các thành phần trong vỏ cảnh quan Trái Đất."},
      {"term": "Hệ thống Thông tin Địa lí (GIS)", "def": "Hệ thống máy tính thu thập, lưu trữ, kiểm tra, phân tích và hiển thị dữ liệu liên quan đến các vị trí trên bề mặt Trái Đất."},
      {"term": "Quy hoạch không gian", "def": "Phương pháp phân bố và tổ chức không gian hợp lí cho các hoạt động kinh tế, xã hội và bảo vệ môi trường trên một vùng lãnh thổ."}
    ],
    "localExamples": [
      "Tại xã Vạn Linh, tỉnh Lạng Sơn, cán bộ địa chính xã ứng dụng bản đồ số và máy định vị GPS để đo đạc diện tích vườn na, cấp giấy chứng nhận quyền sử dụng đất cho các hộ dân.",
      "Học sinh Trường THPT Hòa Bình có cơ hội phát triển nghề nghiệp trong các ngành: ứng dụng công nghệ viễn thám theo dõi mùa hoa quả Chi Lăng, kĩ thuật viên bản đồ địa chính, hoặc làm việc trong lĩnh vực thương mại cửa khẩu quốc tế tại tỉnh Lạng Sơn."
    ],
    "takeaways": [
      "Địa lí 10 là môn học tích hợp sâu sắc giữa tự nhiên, xã hội và công nghệ số.",
      "Tri thức địa lí mở ra nhiều hướng nghiệp thiết thực, gắn chặt với định hướng phát triển nông nghiệp hàng hóa và kinh tế cửa khẩu của tỉnh Lạng Sơn."
    ]
  },

  # 2. Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ
  {
    "num": 2,
    "id": "bai-2",
    "partId": "phan-2",
    "chapterId": "chuong-1",
    "topicId": "chuong-1",
    "title": "Bài 2. Một số phương pháp biểu hiện các đối tượng địa lí trên bản đồ",
    "subtitle": "Năm phương pháp thể hiện đối tượng địa lí: kí hiệu, đường chuyển động, chấm điểm, khoanh vùng, bản đồ - biểu đồ",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Năm phương pháp biểu hiện đối tượng địa lí trên bản đồ (kí hiệu, đường chuyển động, chấm điểm, khoanh vùng, bản đồ - biểu đồ) và kĩ năng tính khoảng cách thực địa từ tỉ lệ bản đồ.",
    "calcConcept": "Tính cự li thực tế ngoài thực địa dựa vào khoảng cách đo trên bản đồ và tỉ lệ bản đồ (D = d × M)",
    "calcUnit": "km",
    "objectives": [
      "Phân biệt được đặc điểm, đối tượng và khả năng biểu hiện của 5 phương pháp thể hiện đối tượng địa lí trên bản đồ.",
      "Biết cách đọc và phân tích ý nghĩa các loại kí hiệu, mũi tên chuyển động, điểm chấm, vùng khoanh và biểu đồ trên bản đồ giáo khoa.",
      "Rèn luyện kĩ năng tính khoảng cách thực địa từ tỉ lệ bản đồ và giải thích sự phân bố của các đối tượng địa lí.",
      "Vận dụng phương pháp đọc bản đồ vào khai thác bản đồ hành chính, bản đồ tự nhiên và bản đồ kinh tế tỉnh Lạng Sơn."
    ],
    "keySections": [
      {
        "title": "1. Khái quát về bản đồ và hệ thống phương pháp biểu hiện",
        "paragraphs": [
          "Bản đồ là hình ảnh thu nhỏ, khái quát hóa một phần hay toàn bộ bề mặt Trái Đất lên mặt phẳng theo những quy tắc toán học nhất định (phép chiếu, tỉ lệ) và hệ thống kí hiệu quy ước.",
          "Để phản ánh đầy đủ vị trí, số lượng, chất lượng, cấu trúc và động thái của vô số đối tượng địa lí trong không gian, bản đồ học sử dụng nhiều phương pháp biểu hiện chuyên biệt."
        ],
        "highlight": "Mỗi phương pháp biểu hiện được thiết kế phù hợp với một dạng đối tượng địa lí (điểm, tuyến, diện hoặc tổng hợp số liệu)."
      },
      {
        "title": "2. Đặc điểm 5 phương pháp biểu hiện cơ bản",
        "paragraphs": [
          "a) Phương pháp kí hiệu: Biểu hiện các đối tượng phân bố theo những điểm cụ thể (núi lửa, mỏ khoáng sản, nhà máy, sân bay, thị trấn). Có 3 dạng kí hiệu: hình học, chữ, tượng hình. Kí hiệu cho biết vị trí, số lượng, cấu trúc và quy mô đối tượng.",
          "b) Phương pháp đường chuyển động: Thể hiện sự di chuyển của các hiện tượng tự nhiên và kinh tế - xã hội (hướng gió, bão, dòng biển, luồng di dân, tuyến vận tải hàng hóa). Mũi tên chỉ rõ hướng đi, độ dày chỉ khối lượng, độ dài thể hiện phạm vi hoạt động.",
          "c) Phương pháp chấm điểm: Thể hiện các đối tượng phân bố phân tán bằng các điểm chấm có giá trị định lượng quy ước (phân bố dân cư nông thôn, điểm chăn nuôi gia súc). Mật độ điểm chấm phản ánh độ dày đặc hay thưa thớt của hiện tượng.",
          "d) Phương pháp khoanh vùng: Thể hiện các đối tượng phân bố theo diện tích rộng lớn nhưng không liên tục (vùng phân bố dân tộc, vùng trồng lúa, bãi chăn thả gia súc, vùng đất ngập mặn). Đường ranh giới khép kín hoặc màu sắc/nét gạch xác định phạm vi phân bố.",
          "e) Phương pháp bản đồ - biểu đồ: Đặt các biểu đồ (cột, tròn, thanh) vào các đơn vị lãnh thổ hành chính để thể hiện số lượng, cơ cấu, động thái của hiện tượng (sản lượng lương thực các tỉnh, giá trị xuất khẩu, cơ cấu kinh tế)."
        ]
      },
      {
        "title": "3. Phương pháp tính toán cự li thực tế từ tỉ lệ bản đồ",
        "paragraphs": [
          "Tỉ lệ bản đồ chỉ rõ mức độ thu nhỏ của khoảng cách trên bản đồ so với khoảng cách ngoài thực địa.",
          "Công thức: D (thực địa) = d (trên bản đồ) × M (mẫu số tỉ lệ).",
          "Ví dụ: Nếu đo được khoảng cách giữa Trường THPT Hòa Bình và trung tâm xã Chi Lăng (tỉnh Lạng Sơn) trên bản đồ tỉ lệ 1 : 100.000 là 8,5 cm, thì khoảng cách thực tế là 8,5 × 100.000 cm = 850.000 cm = 8,5 km."
        ],
        "highlight": "Chú ý đổi đúng đơn vị đo: 1 km = 1.000 m = 100.000 cm; 1 m = 100 cm = 1.000 mm."
      }
    ],
    "terms": [
      {"term": "Kí hiệu bản đồ", "def": "Hệ thống các biểu tượng quy ước dùng để biểu thị vị trí, đặc tính và số lượng của các đối tượng địa lí trên bản đồ."},
      {"term": "Đường chuyển động", "def": "Phương pháp dùng các mũi tên có hình dáng, màu sắc và kích thước khác nhau để biểu thị hướng đi, tốc độ và khối lượng di chuyển của đối tượng địa lí."},
      {"term": "Tỉ lệ bản đồ", "def": "Tỉ số giữa khoảng cách đo được trên bản đồ với khoảng cách tương ứng ngoài thực địa."}
    ],
    "localExamples": [
      "Trên bản đồ nông nghiệp tỉnh Lạng Sơn, vùng trồng na đặc sản tại xã Vạn Linh được biểu hiện bằng phương pháp khoanh vùng kết hợp màu nền xanh lá mạ.",
      "Tuyến Quốc lộ 1A và đường sắt Hà Nội - Lạng Sơn chạy qua xã Chi Lăng và địa bàn tỉnh Lạng Sơn được biểu hiện bằng phương pháp kí hiệu tuyến (đường kẻ màu phân cấp độ dày)."
    ],
    "takeaways": [
      "Mỗi phương pháp biểu hiện có ưu thế riêng và được kết hợp hài hòa trên một bản đồ chuyên đề.",
      "Muốn đọc bản đồ chính xác, bước đầu tiên phải đọc kĩ bảng chú giải và xác định tỉ lệ bản đồ.",
      "Nắm vững công thức D = d × M để chuyển đổi khoảng cách đo trên bản đồ thành khoảng cách thực địa."
    ]
  },

  # 3. Sử dụng bản đồ, GPS và bản đồ số
  {
    "num": 3,
    "id": "bai-3",
    "partId": "phan-2",
    "chapterId": "chuong-1",
    "topicId": "chuong-1",
    "title": "Bài 3. Sử dụng bản đồ trong học tập và đời sống, một số ứng dụng của GPS và bản đồ số trong đời sống",
    "subtitle": "Các bước khai thác bản đồ, nguyên lí hoạt động của GPS, điều hướng vệ tinh và ứng dụng bản đồ số thông minh",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Các bước khai thác bản đồ khoa học; nguyên lí định vị vệ tinh GPS; tính năng của bản đồ số và ứng dụng định vị, điều hướng trong đời sống.",
    "calcConcept": "Tính thời gian truyền xung tín hiệu vô tuyến từ vệ tinh GPS xuống máy thu mặt đất hoặc tính cự li di chuyển giữa các điểm tọa độ",
    "calcUnit": "giây",
    "objectives": [
      "Nêu được các bước sử dụng bản đồ khoa học trong học tập môn Địa lí và ứng dụng trong cuộc sống.",
      "Giải thích được nguyên lí định vị của hệ thống vệ tinh GPS (Global Positioning System) và các chức năng của bản đồ số.",
      "Biết cách sử dụng các ứng dụng bản đồ số trên điện thoại thông minh để tìm đường, đo khoảng cách và xác định tọa độ.",
      "Tính toán được thời gian truyền tín hiệu vô tuyến GPS và vận tốc di chuyển thực tế từ dữ liệu định vị."
    ],
    "keySections": [
      {
        "title": "1. Quy trình các bước sử dụng bản đồ hiệu quả",
        "paragraphs": [
          "Bước 1: Chọn bản đồ phù hợp với mục đích học tập hoặc công việc (bản đồ tự nhiên, dân cư, kinh tế, giao thông).",
          "Bước 2: Đọc tên bản đồ để nắm chủ đề, đọc bảng chú giải để hiểu ý nghĩa các kí hiệu quy ước.",
          "Bước 3: Xác định tỉ lệ bản đồ và phương hướng (hướng Bắc trên kinh tuyến hoặc hoa la bàn).",
          "Bước 4: Xác định vị trí các đối tượng cần tìm, phân tích mối liên hệ không gian giữa các đối tượng địa lí và rút ra nhận xét, giải thích nguyên nhân."
        ],
        "highlight": "Bản đồ là cuốn sách giáo khoa thứ hai của môn Địa lí. Đọc bản đồ phải đi từ tổng quan đến chi tiết, từ mô tả đến giải thích."
      },
      {
        "title": "2. Hệ thống Định vị Toàn cầu (GPS) và Bản đồ số",
        "paragraphs": [
          "a) Hệ thống GPS: Là hệ thống định vị vệ tinh của Hoa Kỳ, bao gồm tối thiểu 24 vệ tinh bay quanh Trái Đất ở độ cao khoảng 20.200 km. Thiết bị thu GPS trên mặt đất nhận tín hiệu từ ít nhất 4 vệ tinh cùng lúc để tính toán chính xác tọa độ (vĩ độ, kinh độ), độ cao và thời gian thực.",
          "b) Bản đồ số: Là tập hợp dữ liệu không gian được số hóa và quản lí trên máy tính, hiển thị trực quan trên màn hình. Bản đồ số có tính năng tương tác vượt trội: phóng to thu nhỏ, tìm kiếm địa điểm, xếp chồng nhiều lớp thông tin (lớp giao thông, lớp dịch vụ, lớp địa hình), tự động tính toán lộ trình tối ưu và cập nhật tình trạng giao thông theo thời gian thực."
        ]
      },
      {
        "title": "3. Ứng dụng thực tiễn của GPS và Bản đồ số trong đời sống",
        "paragraphs": [
          "Trong giao thông vận tải: Dẫn đường ô tô, xe máy, giám sát hành trình xe chở nông sản từ Chi Lăng đi các tỉnh, xe container qua cửa khẩu Lạng Sơn.",
          "Trong nông nghiệp thông minh: Quản lí diện tích vườn cây ăn quả bằng flycam gắn GPS, bón phân và phun thuốc chính xác theo tọa độ.",
          "Trong phòng chống thiên tai và cứu hộ cứu nạn: Xác định nhanh vị trí sạt lở núi đá vôi ở xã Chi Lăng, theo dõi hướng bão và điều động lực lượng ứng cứu.",
          "Trong du lịch và đời sống: Tra cứu điểm di tích Ải Chi Lăng, khách sạn, trạm y tế, chia sẻ vị trí cho người thân."
        ]
      }
    ],
    "terms": [
      {"term": "Hệ thống Định vị Toàn cầu (GPS)", "def": "Mạng lưới các vệ tinh nhân tạo quay quanh Trái Đất phát tín hiệu vô tuyến giúp thiết bị mặt đất xác định tọa độ vị trí 3 chiều và thời gian."},
      {"term": "Bản đồ số (Digital Map)", "def": "Bản đồ được tạo dựng và lưu trữ dưới dạng dữ liệu số hóa trên máy tính, cho phép tương tác, tìm kiếm và phân tích động."},
      {"term": "Điều hướng (Navigation)", "def": "Quá trình xác định vị trí hiện tại và chỉ dẫn đường đi tối ưu đến một điểm đích đã chọn."}
    ],
    "localExamples": [
      "Các thương lái thu mua na tại xã Vạn Linh, tỉnh Lạng Sơn sử dụng ứng dụng Google Maps để định vị các điểm thu gom, tối ưu hóa tuyến đường vận chuyển về Hà Nội và các tỉnh.",
      "Người dân và du khách đến tham quan Khu di tích lịch sử Ải Chi Lăng (tỉnh Lạng Sơn) dùng GPS trên điện thoại để tra cứu các điểm di tích: Núi Mặt Quỷ, Đền Quỷ Môn Quan, Ngựa Cương."
    ],
    "takeaways": [
      "Sử dụng bản đồ khoa học đòi hỏi quy trình 4 bước từ chọn bản đồ, đọc chú giải đến phân tích mối liên hệ.",
      "GPS cung cấp tọa độ chính xác nhờ giao thoa tín hiệu vô tuyến từ chùm vệ tinh không gian.",
      "Bản đồ số là công cụ đắc lực hỗ trợ thông minh cho sản xuất nông nghiệp, giao thông và đời sống tại Lạng Sơn."
    ]
  }
]
print("Loaded LESSONS_CONFIG initial entries.")
