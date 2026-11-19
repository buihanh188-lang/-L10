# -*- coding: utf-8 -*-
"""
Appends Lessons 31 to 40 (Công nghiệp môi trường, Dịch vụ, Môi trường, Phát triển bền vững)
Strict local scope constraint: Only Xã Vạn Linh, Khu vực Chi Lăng, Tỉnh Lạng Sơn.
"""

PART3_B_LESSONS = [
  # Bài 31
  {
    "num": 31,
    "id": "bai-31",
    "partId": "phan-3",
    "chapterId": "chuong-11",
    "topicId": "chuong-11",
    "title": "Bài 31. Tác động của công nghiệp đối với môi trường, phát triển năng lượng tái tạo, định hướng phát triển công nghiệp trong tương lai",
    "subtitle": "Ô nhiễm môi trường công nghiệp, chuyển dịch năng lượng xanh và mô hình kinh tế tuần hoàn trong sản xuất",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Tác động tiêu cực của chất thải công nghiệp (khí thải CO2, SO2; nước thải độc hại; chất thải rắn); sự cần thiết phát triển năng lượng tái tạo (điện mặt trời, điện gió, sinh khối); định hướng công nghiệp xanh, phát thải ròng bằng 0 (Net Zero).",
    "calcConcept": "Tính tỉ trọng năng lượng tái tạo trong tổng cơ cấu năng lượng sơ cấp (%) hoặc tính lượng phát thải CO2 giảm được nhờ sử dụng năng lượng sạch (tấn CO2)",
    "calcUnit": "%",
    "objectives": [
      "Phân tích được các tác động tiêu cực của sản xuất công nghiệp đối với môi trường khí quyển, thủy quyển và thạch quyển.",
      "Giải thích được sự cần thiết phải chuyển dịch năng lượng hóa thạch sang năng lượng tái tạo (năng lượng xanh).",
      "Nêu được định hướng phát triển công nghiệp trong tương lai: công nghiệp xanh, giảm thiểu phát thải các-bon và kinh tế tuần hoàn.",
      "Tính toán tỉ trọng năng lượng sạch và liên hệ với các giải pháp bảo vệ môi trường trong khai thác khoáng sản và chế biến tại Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Tác động của sản xuất công nghiệp đối với môi trường",
        "paragraphs": [
          "Ô nhiễm khí quyển: Khí thải từ các nhà máy nhiệt điện, luyện kim, hóa chất thải ra lượng lớn khí nhà kính (CO2, CH4, N2O), khí SO2, NOx gây hiệu ứng nhà kính, biến đổi khí hậu toàn cầu, thủng tầng ôdôn và mưa axit.",
          "Ô nhiễm thủy quyển: Nước thải công nghiệp chưa qua xử lí chứa nhiều kim loại nặng và hóa chất độc hại xả thẳng ra sông, biển làm chết sinh vật thủy sinh và hủy hoại nguồn nước ngầm.",
          "Ô nhiễm môi trường đất: Chất thải rắn công nghiệp nguy hại không được thu gom chôn lấp đúng quy chuẩn làm thoái hóa đất."
        ],
        "highlight": "Phát triển công nghiệp truyền thống dựa vào nhiên liệu hóa thạch là nguyên nhân hàng đầu gây khủng hoảng môi trường toàn cầu."
      },
      {
        "title": "2. Phát triển năng lượng tái tạo và giảm phát thải",
        "paragraphs": [
          "Năng lượng tái tạo gồm: Năng lượng mặt trời, năng lượng gió, năng lượng sinh khối, thủy điện nhỏ, địa nhiệt và năng lượng sóng biển.",
          "Ưu điểm vượt trội: Nguồn tài nguyên vô tận, sạch, không phát sinh khí thải CO2 trong quá trình vận hành, giúp các quốc gia tự chủ năng lượng và giảm phụ thuộc vào dầu mỏ."
        ]
      },
      {
        "title": "3. Định hướng phát triển công nghiệp trong tương lai",
        "paragraphs": [
          "Chuyển đổi mạnh mẽ sang mô hình công nghiệp các-bon thấp, hướng tới mục tiêu phát thải ròng bằng 0 (Net Zero) vào năm 2050 theo cam kết COP26.",
          "Áp dụng kinh tế tuần hoàn trong công nghiệp: Thiết kế sản phẩm dễ tái chế, tận dụng tối đa phế liệu làm nguyên liệu đầu vào."
        ]
      }
    ],
    "terms": [
      {"term": "Năng lượng xanh (Green Energy)", "def": "Năng lượng được tạo ra từ các nguồn tài nguyên thiên nhiên tái tạo, không gây ô nhiễm môi trường."},
      {"term": "Kinh tế tuần hoàn (Circular Economy)", "def": "Mô hình kinh tế nhằm loại bỏ chất thải và sử dụng liên tục các nguồn tài nguyên thông qua tái sử dụng, sửa chữa, tái chế."},
      {"term": "Phát thải ròng bằng 0 (Net Zero)", "def": "Trạng thái lượng khí nhà kính phát thải vào khí quyển tương đương với lượng khí nhà kính được loại bỏ khỏi khí quyển."}
    ],
    "localExamples": [
      "Tại xã Chi Lăng (Lạng Sơn), các nhà máy xi măng và xưởng sản xuất vật liệu xây dựng đã đầu tư hệ thống lọc bụi tĩnh điện và tận dụng nhiệt khí thải lò nung để phát điện, giảm tiêu hao than và bảo vệ bầu không khí khu dân cư.",
      "Ở xã Vạn Linh (tỉnh Lạng Sơn), các trang trại nông sản tận dụng cành na tỉa sau thu hoạch và phụ phẩm nông nghiệp ủ làm phân bón hữu cơ vi sinh, không đốt rác bừa bãi tránh ô nhiễm khói bụi."
    ],
    "takeaways": [
      "Công nghiệp hóa phải đi đôi với bảo vệ môi trường sinh thái.",
      "Phát triển năng lượng tái tạo là giải pháp chiến lược để đạt mục tiêu Net Zero 2050.",
      "Kinh tế tuần hoàn giúp biến chất thải thành tài nguyên mới."
    ]
  },

  # Bài 32
  {
    "num": 32,
    "id": "bai-32",
    "partId": "phan-3",
    "chapterId": "chuong-11",
    "topicId": "chuong-11",
    "title": "Bài 32. Thực hành: Tìm hiểu sự phát triển công nghiệp ở địa phương",
    "subtitle": "Thu thập tư liệu, xử lí số liệu và viết báo cáo về một cơ sở sản xuất công nghiệp hoặc tiểu thủ công nghiệp tại địa phương",
    "durationMinutes": 45,
    "isPractice": True,
    "scope": "Kĩ năng khảo sát thực tế cơ sở sản xuất công nghiệp địa phương; lập dàn ý báo cáo (tên cơ sở, vị trí, nguồn nguyên liệu, sản phẩm, thị trường tiêu thụ, tác động môi trường); tính toán tốc độ tăng trưởng giá trị sản xuất.",
    "calcConcept": "Tính tốc độ tăng trưởng giá trị sản xuất hoặc sản lượng của một cơ sở sản xuất công nghiệp địa phương qua 2 mốc thời gian (%)",
    "calcUnit": "%",
    "objectives": [
      "Nắm vững các bước tìm hiểu và thu thập thông tin về một ngành hoặc cơ sở công nghiệp tại địa phương.",
      "Biết cách xử lí bảng số liệu về giá trị sản xuất, số lượng lao động và sản lượng sản phẩm của cơ sở sản xuất.",
      "Viết được báo cáo ngắn gọn, khoa học về tình hình phát triển và giải pháp bảo vệ môi trường của cơ sở công nghiệp.",
      "Thực hiện bài tập tính toán tốc độ tăng trưởng sản phẩm công nghiệp và liên hệ trực tiếp với cơ sở sản xuất tại khu vực Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Mục đích và các bước tiến hành tìm hiểu công nghiệp địa phương",
        "paragraphs": [
          "Mục đích: Giúp học sinh gắn liền lí thuyết sách giáo khoa với thực tiễn sản xuất tại quê hương; hiểu rõ vai trò của công nghiệp đối với chuyển dịch cơ cấu lao động địa phương.",
          "Bước 1: Xác định đối tượng tìm hiểu (ví dụ xưởng cơ khí, xưởng chế biến gỗ, nhà máy xi măng).",
          "Bước 2: Thu thập thông tin, tư liệu qua phỏng vấn, khảo sát trực tiếp, báo cáo thống kê của địa phương hoặc tìm kiếm trên cổng thông tin điện tử tỉnh Lạng Sơn và trang thông tin địa phương.",
          "Bước 3: Xử lí và tổng hợp số liệu (tính tỉ trọng, tính tốc độ tăng trưởng).",
          "Bước 4: Viết và trình bày báo cáo."
        ],
        "highlight": "Báo cáo công nghiệp địa phương cần nêu rõ: Vị trí -> Nguyên liệu -> Sản phẩm -> Thị trường -> Tác động môi trường -> Đề xuất giải pháp."
      },
      {
        "title": "2. Cấu trúc bài báo cáo khảo sát công nghiệp chuẩn",
        "paragraphs": [
          "1. Giới thiệu chung: Tên cơ sở, địa điểm đặt xí nghiệp, năm thành lập, quy mô vốn và lao động.",
          "2. Điều kiện phát triển: Thuận lợi về vị trí, nguyên liệu địa phương, lao động tại chỗ và thị trường.",
          "3. Tình hình sản xuất: Sản phẩm chủ yếu, sản lượng và doanh thu qua các năm.",
          "4. Đánh giá tác động môi trường và định hướng phát triển bền vững trong tương lai."
        ]
      },
      {
        "title": "3. Kĩ năng xử lí số liệu báo cáo",
        "paragraphs": [
          "Tính tốc độ tăng trưởng giá trị sản xuất: Tốc độ (%) = (Giá trị năm sau / Giá trị năm trước) × 100%.",
          "Tính năng suất lao động: Năng suất (triệu đồng/lao động) = Tổng giá trị sản xuất / Tổng số lao động."
        ]
      }
    ],
    "terms": [
      {"term": "Khảo sát thực tế", "def": "Phương pháp thu thập thông tin trực tiếp tại hiện trường thông qua quan sát, phỏng vấn và ghi chép số liệu."},
      {"term": "Năng suất lao động", "def": "Khối lượng sản phẩm hoặc giá trị sản xuất tính bình quân cho một lao động trong một đơn vị thời gian."},
      {"term": "Tiểu thủ công nghiệp", "def": "Các hoạt động sản xuất công nghiệp quy mô nhỏ, sử dụng công cụ thủ công kết hợp máy móc bán tự động tại nông thôn."}
    ],
    "localExamples": [
      "Học sinh Trường THPT Hòa Bình lựa chọn khảo sát xưởng cơ khí chế tạo ròng rọc tời núi và máy sơ chế nông sản tại xã Vạn Linh (tỉnh Lạng Sơn): Tìm hiểu cách bà con ứng dụng sáng chế tời vận chuyển na từ vách núi dốc, tính toán năng suất lao động tăng gấp 10 lần so với gùi na bộ bằng tay.",
      "Tìm hiểu Nhà máy xi măng Đồng Bành tại xã Chi Lăng (Lạng Sơn): Khảo sát công suất thiết kế 1 triệu tấn/năm, nguồn nguyên liệu đá vôi tại chỗ và thị trường cung ứng cho toàn tỉnh."
    ],
    "takeaways": [
      "Học đi đôi với hành; khảo sát thực tế giúp hiểu sâu sắc hơn về công nghiệp địa phương.",
      "Kĩ năng xử lí số liệu và viết báo cáo khoa học là năng lực cốt lõi của môn Địa lí 10.",
      "Các cơ sở tiểu thủ công nghiệp tại xã Vạn Linh (tỉnh Lạng Sơn) là động lực giải quyết việc làm và thúc đẩy hiện đại hóa nông thôn."
    ]
  },

  # Bài 33
  {
    "num": 33,
    "id": "bai-33",
    "partId": "phan-3",
    "chapterId": "chuong-12",
    "topicId": "chuong-12",
    "title": "Bài 33. Cơ cấu, vai trò, đặc điểm và các nhân tố ảnh hưởng đến sự phát triển, phân bố dịch vụ",
    "subtitle": "Khái niệm ngành dịch vụ, cơ cấu 3 nhóm dịch vụ, vai trò động lực và các nhân tố chi phối",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm dịch vụ; cơ cấu ngành dịch vụ (dịch vụ kinh doanh, dịch vụ tiêu dùng, dịch vụ công); vai trò của dịch vụ đối với kinh tế và xã hội; các đặc điểm; các nhân tố ảnh hưởng (trình độ phát triển kinh tế, dân cư, phân bố dân cư, tài nguyên di sản).",
    "calcConcept": "Tính tỉ trọng ngành dịch vụ trong cơ cấu GDP (%) hoặc tỉ lệ lao động làm việc trong khu vực dịch vụ (%)",
    "calcUnit": "%",
    "objectives": [
      "Trình bày được khái niệm ngành dịch vụ và phân biệt được cơ cấu 3 nhóm dịch vụ chính (dịch vụ kinh doanh, dịch vụ tiêu dùng, dịch vụ công).",
      "Khẳng định được vai trò to lớn của dịch vụ trong việc thúc đẩy sản xuất, tạo việc làm và nâng cao chất lượng cuộc sống.",
      "Phân tích được tác động của các nhân tố kinh tế - xã hội đến sự phát triển và phân bố các ngành dịch vụ.",
      "Tính toán thành thạo tỉ trọng ngành dịch vụ trong GDP và liên hệ với sự phát triển dịch vụ thương mại, vận tải tại Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm và cơ cấu ngành dịch vụ",
        "paragraphs": [
          "Dịch vụ là tập hợp các hoạt động kinh tế - xã hội không trực tiếp sản xuất ra của cải vật chất nhưng tạo ra các giá trị vô hình hoặc hữu hình phục vụ cho nhu cầu sản xuất và đời sống con người.",
          "Cơ cấu ngành dịch vụ gồm 3 nhóm chính:",
          "- Dịch vụ tiêu dùng: Phục vụ nhu cầu hàng ngày của cá nhân và gia đình (bán buôn, bán lẻ, du lịch, khách sạn, nhà hàng, may mặc, sửa chữa).",
          "- Dịch vụ kinh doanh: Phục vụ các hoạt động sản xuất kinh doanh (giao thông vận tải, bưu chính viễn thông, tài chính ngân hàng, bảo hiểm, bất động sản).",
          "- Dịch vụ công: Phục vụ lợi ích chung của toàn xã hội (quản lí hành chính nhà nước, giáo dục, y tế, an ninh quốc phòng)."
        ],
        "highlight": "Ở các nước phát triển, ngành dịch vụ chiếm tỉ trọng rất cao trong GDP (trên 70%) và thu hút phần lớn lực lượng lao động xã hội."
      },
      {
        "title": "2. Vai trò của ngành dịch vụ",
        "paragraphs": [
          "Thúc đẩy các ngành sản xuất vật chất (nông nghiệp, công nghiệp) phát triển nhờ cung ứng kịp thời nguyên liệu và tiêu thụ sản phẩm.",
          "Sử dụng hiệu quả nguồn lao động xã hội, tạo thêm nhiều việc làm mới.",
          "Khai thác và sử dụng hợp lí các tài nguyên thiên nhiên, di sản văn hóa lịch sử và các thành tựu khoa học kĩ thuật hiện đại.",
          "Mở rộng giao lưu, hợp tác kinh tế quốc tế và nâng cao chất lượng cuộc sống nhân dân."
        ]
      },
      {
        "title": "3. Các nhân tố ảnh hưởng đến sự phát triển và phân bố dịch vụ",
        "paragraphs": [
          "Trình độ phát triển kinh tế và năng suất lao động xã hội (quyết định quy mô và cơ cấu dịch vụ).",
          "Quy mô và cơ cấu dân số, phân bố dân cư (xác định nhu cầu và mạng lưới điểm dịch vụ).",
          "Mức sống và thu nhập của người dân (quyết định sức mua và chất lượng dịch vụ).",
          "Tài nguyên thiên nhiên và di sản văn hóa lịch sử (tiền đề phát triển du lịch).",
          "Cơ sở hạ tầng kĩ thuật (đặc biệt là giao thông và viễn thông là mạch máu kết nối dịch vụ)."
        ]
      }
    ],
    "terms": [
      {"term": "Ngành Dịch vụ (Service Sector)", "def": "Khu vực kinh tế thứ ba bao gồm các hoạt động tạo ra sản phẩm vô hình phục vụ cho nhu cầu sản xuất và sinh hoạt của con người."},
      {"term": "Dịch vụ tiêu dùng", "def": "Các hoạt động dịch vụ đáp ứng trực tiếp nhu cầu sinh hoạt hàng ngày của cá nhân và hộ gia đình như bán lẻ, y tế, ẩm thực."},
      {"term": "Dịch vụ kinh doanh", "def": "Các hoạt động dịch vụ hỗ trợ cho quá trình vận hành của các doanh nghiệp như logistics, ngân hàng, viễn thông."}
    ],
    "localExamples": [
      "Tại xã Chi Lăng và xã Vạn Linh (Lạng Sơn), ngành dịch vụ phát triển mạnh mẽ vào mùa thu hoạch na với sự xuất hiện của hàng trăm điểm cân thu mua na, dịch vụ bưu chính chuyển phát nhanh giao hàng tận nơi về Hà Nội và các tỉnh.",
      "Ở xã Vạn Linh (tỉnh Lạng Sơn), các cửa hàng phân bón, vật tư nông nghiệp, dịch vụ vận tải xe tải nhỏ và hàng tạp hóa ngày càng mở rộng, phục vụ tiện lợi đời sống nhân dân."
    ],
    "takeaways": [
      "Dịch vụ gồm dịch vụ tiêu dùng, dịch vụ kinh doanh và dịch vụ công.",
      "Tỉ trọng dịch vụ trong GDP là thước đo phản ánh mức độ văn minh và phát triển của một nền kinh tế.",
      "Dịch vụ thương mại nông sản tại Chi Lăng (Lạng Sơn) là cầu nối đưa đặc sản địa phương vươn xa."
    ]
  },

  # Bài 34
  {
    "num": 34,
    "id": "bai-34",
    "partId": "phan-3",
    "chapterId": "chuong-12",
    "topicId": "chuong-12",
    "title": "Bài 34. Địa lí ngành giao thông vận tải",
    "subtitle": "Vai trò, các tiêu chí đánh giá và đặc điểm của 5 loại hình giao thông vận tải chính",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Vai trò mạch máu kinh tế của giao thông; các tiêu chí đánh giá (khối lượng vận chuyển - tấn, khối lượng luân chuyển - tấn.km, cự li vận chuyển trung bình - km); ưu nhược điểm và phân bố của đường ô tô, đường sắt, đường sông hồ, đường biển, đường hàng không, đường ống.",
    "calcConcept": "Tính cự li vận chuyển trung bình (km = Khối lượng luân chuyển / Khối lượng vận chuyển) hoặc tính khối lượng luân chuyển hàng hóa (tấn.km)",
    "calcUnit": "km",
    "objectives": [
      "Khẳng định được vai trò như mạch máu của nền kinh tế của ngành giao thông vận tải.",
      "Nắm vững và tính toán thành thạo 3 tiêu chí đánh giá hoạt động giao thông vận tải: Khối lượng vận chuyển, Khối lượng luân chuyển và Cự li vận chuyển trung bình.",
      "So sánh được ưu điểm và nhược điểm của 5 loại hình giao thông vận tải chủ yếu (đường ô tô, đường sắt, đường nước, đường hàng không, đường ống).",
      "Đánh giá được ý nghĩa chiến lược của Quốc lộ 1A, đường sắt và cao tốc Bắc Giang - Lạng Sơn chạy qua khu vực Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Vai trò và các tiêu chí đánh giá ngành giao thông vận tải",
        "paragraphs": [
          "Vai trò: Là mạch máu kết nối các ngành kinh tế, các vùng lãnh thổ; đảm bảo nhu cầu đi lại của nhân dân; tạo điều kiện khai thác tài nguyên và phân bố lại dân cư; củng cố an ninh quốc phòng.",
          "Các tiêu chí đánh giá chất lượng và quy mô vận tải:",
          "- Khối lượng vận chuyển: Số tấn hàng hóa (hoặc số lượt hành khách) được chuyên chở, đơn vị: tấn (hoặc lượt người).",
          "- Khối lượng luân chuyển: Tích số giữa khối lượng vận chuyển và cự li vận chuyển thực tế, đơn vị: tấn.km (hoặc người.km).",
          "- Cự li vận chuyển trung bình: Quãng đường vận chuyển bình quân của một tấn hàng hóa (hoặc một hành khách), công thức: Cự li trung bình (km) = Khối lượng luân chuyển / Khối lượng vận chuyển."
        ],
        "highlight": "Công thức cốt lõi: Cự li vận chuyển trung bình (km) = Khối lượng luân chuyển (tấn.km) / Khối lượng vận chuyển (tấn)."
      },
      {
        "title": "2. Ưu và nhược điểm của các loại hình giao thông vận tải",
        "paragraphs": [
          "a) Đường ô tô (đường bộ): Cơ động, linh hoạt cao, thích nghi với mọi dạng địa hình, có thể chở hàng 'từ cửa đến cửa' (door to door); nhưng cước phí tương đối cao, gây ô nhiễm không khí và tắc nghẽn giao thông.",
          "b) Đường sắt: Vận chuyển hàng nặng, cồng kềnh trên cự li dài với tốc độ ổn định, chi phí thấp, an toàn cao; nhưng tính cơ động kém (chỉ chạy trên đường ray cố định), vốn đầu tư xây dựng hạ tầng rất lớn.",
          "c) Đường biển: Vận tải hàng hóa quốc tế siêu trường, siêu trọng trên cự li rất dài với giá thành rẻ nhất; nhưng tốc độ chậm, phụ thuộc vào điều kiện thời tiết bão gió trên biển.",
          "d) Đường hàng không: Vận tốc cao nhất, cự li dài vượt trội, dịch vụ hiện đại; nhưng cước phí đắt nhất, tải trọng giới hạn.",
          "e) Đường ống: Vận chuyển chuyên dụng chất lỏng và khí (dầu mỏ, khí đốt) liên tục, an toàn, không chiếm diện tích mặt đất; nhưng chi phí đầu tư ban đầu cao và khó kiểm soát rò rỉ dưới lòng đất."
        ]
      },
      {
        "title": "3. Xu hướng phát triển giao thông vận tải hiện đại",
        "paragraphs": [
          "Phát triển giao thông xanh (xe điện, tàu cao tốc chạy điện), ứng dụng trí tuệ nhân tạo (AI) điều tiết giao thông và phát triển vận tải đa phương thức (kết hợp đường sắt - đường bộ - đường biển)."
        ]
      }
    ],
    "terms": [
      {"term": "Khối lượng vận chuyển", "def": "Tổng khối lượng hàng hóa (hoặc số lượt hành khách) được phương tiện giao thông vận chuyển trong một thời gian, đơn vị tính là tấn hoặc lượt người."},
      {"term": "Khối lượng luân chuyển", "def": "Thước đo tổng hợp kết hợp khối lượng hàng hóa chuyên chở với quãng đường vận chuyển thực tế, đơn vị tính là tấn.km hoặc người.km."},
      {"term": "Cự li vận chuyển trung bình", "def": "Quãng đường di chuyển bình quân của 1 tấn hàng hóa hoặc 1 hành khách, tính bằng thương số giữa khối lượng luân chuyển và khối lượng vận chuyển."}
    ],
    "localExamples": [
      "Khu vực Chi Lăng (Lạng Sơn) là yết hầu giao thông chiến lược cửa ngõ phía Bắc của Tổ quốc: Tuyến Quốc lộ 1A, đường sắt liên vận quốc tế Hà Nội - Đồng Đăng và tuyến cao tốc Bắc Giang - Lạng Sơn đều chạy song song qua thung lũng Chi Lăng.",
      "Ở xã Vạn Linh (tỉnh Lạng Sơn), 100% đường trục xã và đường liên thôn bản đã được bê tông hóa kiên cố, xe tải trọng tải từ 2,5 đến 5 tấn có thể vào tận chân vườn na thu mua hàng hóa xuất khẩu sang Trung Quốc và đi các tỉnh."
    ],
    "takeaways": [
      "Giao thông vận tải là huyết mạch kinh tế nối liền sản xuất và tiêu dùng.",
      "Cự li vận chuyển trung bình (km) = Khối lượng luân chuyển / Khối lượng vận chuyển.",
      "Ải Chi Lăng (Lạng Sơn) từ vị trí 'bẫy hiểm' lịch sử nay trở thành hành lang giao thương đường bộ, đường cao tốc hiện đại."
    ]
  },

  # Bài 35
  {
    "num": 35,
    "id": "bai-35",
    "partId": "phan-3",
    "chapterId": "chuong-12",
    "topicId": "chuong-12",
    "title": "Bài 35. Địa lí ngành bưu chính viễn thông",
    "subtitle": "Vai trò thông tin liên lạc, sự bùng nổ của mạng Internet, điện thoại di động và dịch vụ số hóa",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm bưu chính và viễn thông; vai trò truyền tải thông tin, điều hành kinh tế số; các chỉ tiêu đánh giá (mật độ điện thoại/100 dân, tỉ lệ người dùng Internet); tác động của chuyển đổi số và trí tuệ nhân tạo.",
    "calcConcept": "Tính mật độ thuê bao điện thoại di động (thuê bao / 100 dân = Số thuê bao / Dân số × 100) hoặc tỉ lệ dân số sử dụng Internet (%)",
    "calcUnit": "thuê bao/100 dân",
    "objectives": [
      "Phân biệt được vai trò và đặc điểm của hai phân ngành: Bưu chính (vận chuyển thư từ, bưu phẩm) và Viễn thông (truyền tải dữ liệu điện tử).",
      "Trình bày được tình hình phát triển vượt bậc của mạng viễn thông toàn cầu: mạng Internet cáp quang, mạng di động 4G/5G và vệ tinh.",
      "Tính toán thành thạo mật độ thuê bao điện thoại trên 100 dân và tỉ lệ người dùng Internet.",
      "Đánh giá được ý nghĩa của công nghệ viễn thông đối với việc tiêu thụ nông sản và đời sống nhân dân xã Vạn Linh, khu vực Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Vai trò của ngành bưu chính viễn thông",
        "paragraphs": [
          "Bưu chính viễn thông là phương tiện truyền dẫn thông tin nhanh chóng, chính xác giữa các cá nhân, tổ chức trên toàn cầu mà không bị cản trở bởi khoảng cách địa lí.",
          "Đóng vai trò hạ tầng số quan trọng nhất của nền kinh tế tri thức và cuộc cách mạng công nghiệp 4.0; thúc đẩy thương mại điện tử, thanh toán không tiền mặt và chính phủ số.",
          "Góp phần nâng cao dân trí, giao lưu văn hóa và đảm bảo an ninh thông tin quốc gia."
        ],
        "highlight": "Mật độ thuê bao điện thoại (thuê bao/100 dân) = (Tổng số thuê bao / Tổng số dân) × 100."
      },
      {
        "title": "2. Đặc điểm và tình hình phát triển ngành bưu chính viễn thông",
        "paragraphs": [
          "a) Ngành Bưu chính: Từ chuyển phát thư từ giấy truyền thống sang bưu chính logistics phục vụ thương mại điện tử (giao hàng thu tiền hộ COD). Mạng lưới bưu cục mở rộng đến từng xã.",
          "b) Ngành Viễn thông: Tốc độ phát triển cực nhanh. Mạng Internet kết nối toàn cầu; điện thoại thông minh phổ cập rộng rãi; công nghệ truyền dẫn chuyển từ cáp đồng sang cáp quang và sóng vi ba vệ tinh, mạng 5G tốc độ siêu cao."
        ]
      },
      {
        "title": "3. Chuyển đổi số và kinh tế số",
        "paragraphs": [
          "Viễn thông là bệ phóng cho các mô hình kinh tế số: dạy học trực tuyến, khám chữa bệnh từ xa (Telemedicine), dịch vụ công trực tuyến và thanh toán số qua quét mã QR."
        ]
      }
    ],
    "terms": [
      {"term": "Bưu chính (Postal service)", "def": "Ngành dịch vụ thu gom, chia chọn, vận chuyển và phát các bưu phẩm, bưu kiện, hàng hóa đến tay người nhận."},
      {"term": "Viễn thông (Telecommunication)", "def": "Ngành truyền dẫn tín hiệu âm thanh, hình ảnh, văn bản và dữ liệu điện tử qua dây dẫn, sóng vô tuyến hoặc cáp quang."},
      {"term": "Kinh tế số (Digital Economy)", "def": "Nền kinh tế vận hành chủ yếu dựa trên công nghệ số, đặc biệt là các giao dịch điện tử tiến hành qua Internet."}
    ],
    "localExamples": [
      "Tại xã Vạn Linh và xã Chi Lăng (Lạng Sơn), hạ tầng mạng viễn thông 4G đã phủ sóng 100% các thôn bản; bà con nông dân sử dụng smartphone để livestream giới thiệu vườn na Chi Lăng và chốt đơn bán hàng trực tuyến cho khách hàng khắp cả nước.",
      "Dịch vụ bưu chính công ích và các hãng chuyển phát nhanh (Viettel Post, VNPost) đã mở văn phòng tại trung tâm xã Vạn Linh để tiếp nhận đóng thùng xốp, vận chuyển na tươi giao nhanh trong ngày về Hà Nội."
    ],
    "takeaways": [
      "Bưu chính viễn thông là cầu nối thông tin không gian không biên giới.",
      "Mật độ thuê bao/100 dân phản ánh trình độ tiếp cận công nghệ thông tin của xã hội.",
      "Chuyển đổi số nông thôn tại Chi Lăng (Lạng Sơn) giúp nông dân làm chủ sàn thương mại điện tử."
    ]
  },

  # Bài 36
  {
    "num": 36,
    "id": "bai-36",
    "partId": "phan-3",
    "chapterId": "chuong-12",
    "topicId": "chuong-12",
    "title": "Bài 36. Địa lí ngành du lịch",
    "subtitle": "Vai trò ngành công nghiệp không khói, các tài nguyên du lịch và các nhân tố ảnh hưởng đến sự phát triển",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm du lịch; vai trò kinh tế (thu ngoại tệ, kích cầu tiêu dùng), xã hội, môi trường; tài nguyên du lịch tự nhiên (cảnh quan, khí hậu, biển, hang động) và nhân văn (di tích lịch sử, lễ hội, làng nghề); các nhân tố chi phối.",
    "calcConcept": "Tính doanh thu du lịch bình quân trên một lượt khách (USD/lượt = Doanh thu / Số lượt khách) hoặc thời gian lưu trú trung bình của du khách (ngày/khách)",
    "calcUnit": "USD/lượt",
    "objectives": [
      "Trình bày được vai trò toàn diện của ngành du lịch - ngành 'công nghiệp không khói' hàng đầu thế giới.",
      "Phân biệt được tài nguyên du lịch tự nhiên (địa hình karst, hang động, khí hậu) và tài nguyên du lịch nhân văn (di tích Ải Chi Lăng, lễ hội truyền thống xứ Lạng).",
      "Tính toán thành thạo doanh thu du lịch bình quân trên lượt khách và số ngày lưu trú trung bình.",
      "Đánh giá được tiềm năng phát triển du lịch sinh thái miệt vườn na Chi Lăng gắn với du lịch di tích lịch sử tại Lạng Sơn."
    ],
    "keySections": [
      {
        "title": "1. Vai trò của ngành du lịch",
        "paragraphs": [
          "Du lịch là ngành kinh tế tổng hợp quan trọng: mang lại nguồn thu ngoại tệ lớn (xuất khẩu tại chỗ); kích thích các ngành giao thông, thương mại, khách sạn, nông sản đặc sản phát triển.",
          "Tạo nhiều việc làm cho cộng đồng địa phương, nâng cao đời sống tinh thần của nhân dân.",
          "Góp phần bảo tồn, tôn tạo các di sản văn hóa, danh lam thắng cảnh và tăng cường hiểu biết, hòa bình giữa các dân tộc."
        ],
        "highlight": "Doanh thu du lịch bình quân = Tổng doanh thu du lịch / Tổng lượt khách du lịch (USD/lượt hoặc triệu đồng/lượt)."
      },
      {
        "title": "2. Tài nguyên du lịch: Tự nhiên và Nhân văn",
        "paragraphs": [
          "a) Tài nguyên du lịch tự nhiên: Cảnh quan địa hình (núi cao, hang động karst, thác nước); Khí hậu (mát mẻ, trong lành); Nguồn nước (suối khoáng, hồ, biển); Sinh vật (vườn quốc gia, khu bảo tồn).",
          "b) Tài nguyên du lịch nhân văn: Di tích lịch sử - văn hóa, công trình kiến trúc cổ; Lễ hội truyền thống; Làng nghề thủ công; Ẩm thực dân tộc đặc sắc."
        ]
      },
      {
        "title": "3. Các nhân tố ảnh hưởng và xu hướng du lịch bền vững",
        "paragraphs": [
          "Nhân tố ảnh hưởng: Tài nguyên du lịch (yếu tố cốt lõi); Mức sống và thời gian rỗi của người dân; Cơ sở hạ tầng (đường sá, khách sạn); Sự an toàn và chính sách quảng bá.",
          "Xu hướng hiện nay: Du lịch sinh thái, du lịch nông nghiệp nông thôn (trải nghiệm thu hoạch trái cây), du lịch cộng đồng (homestay) gắn với bảo vệ môi trường."
        ]
      }
    ],
    "terms": [
      {"term": "Tài nguyên du lịch", "def": "Cảnh quan thiên nhiên, di tích lịch sử - văn hóa và các giá trị nhân văn có thể phục vụ nhu cầu du lịch và mang lại hiệu quả kinh tế."},
      {"term": "Du lịch sinh thái (Ecotourism)", "def": "Hình thức du lịch dựa vào tự nhiên, có trách nhiệm bảo vệ môi trường và duy trì đời sống của người dân bản địa."},
      {"term": "Doanh thu du lịch", "def": "Tổng số tiền thu được từ việc cung cấp các dịch vụ lưu trú, ăn uống, vận chuyển, tham quan và bán hàng lưu niệm cho khách du lịch."}
    ],
    "localExamples": [
      "Tại xã Chi Lăng (Lạng Sơn), tài nguyên du lịch vô cùng phong phú: Khu di tích lịch sử Quốc gia đặc biệt Ải Chi Lăng (Núi Mặt Quỷ, Đền Quỷ Môn Quan, Ngựa Cương) ghi dấu chiến công vang dội chống quân xâm lược phương Bắc.",
      "Địa phương đã tổ chức thành công 'Ngày hội Na Chi Lăng' hàng năm, kết hợp trải nghiệm hái na tại các vườn đồi xã Vạn Linh, thưởng thức ẩm thực vịt quay, khau nhục xứ Lạng, thu hút hàng vạn lượt du khách mỗi mùa lễ hội."
    ],
    "takeaways": [
      "Du lịch là ngành công nghiệp không khói mang lại giá trị gia tăng lớn.",
      "Tài nguyên du lịch gồm tự nhiên và nhân văn; tài nguyên là tiền đề, hạ tầng là điều kiện thúc đẩy.",
      "Phát triển du lịch lịch sử Ải Chi Lăng kết hợp du lịch nông nghiệp vườn na Vạn Linh là hướng đi bền vững của Lạng Sơn."
    ]
  },

  # Bài 37
  {
    "num": 37,
    "id": "bai-37",
    "partId": "phan-3",
    "chapterId": "chuong-12",
    "topicId": "chuong-12",
    "title": "Bài 37. Địa lí ngành thương mại và ngành tài chính ngân hàng",
    "subtitle": "Nội thương, ngoại thương, cán cân thương mại (xuất khẩu - nhập khẩu), thị trường tiền tệ và các trung tâm tài chính",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm thương mại; nội thương (trao đổi trong nước, chợ, siêu thị); ngoại thương (xuất khẩu, nhập khẩu); cán cân thương mại (xuất siêu, nhập siêu); ngành tài chính ngân hàng (dịch vụ tiền tệ, tín dụng, thanh toán quốc tế).",
    "calcConcept": "Tính cán cân thương mại (Cán cân = Xuất khẩu - Nhập khẩu) hoặc tính tỉ trọng xuất khẩu trong tổng kim ngạch xuất nhập khẩu (%)",
    "calcUnit": "triệu USD",
    "objectives": [
      "Trình bày được vai trò của ngành thương mại và phân biệt được nội thương với ngoại thương.",
      "Nắm vững các khái niệm then chốt: kim ngạch xuất khẩu, kim ngạch nhập khẩu, cán cân thương mại, xuất siêu và nhập siêu.",
      "Hiểu rõ vai trò của ngành tài chính ngân hàng đối với lưu thông vốn và thanh toán trong nền kinh tế thị trường.",
      "Tính toán thành thạo cán cân thương mại, tỉ trọng xuất khẩu và liên hệ với hoạt động thương mại cửa khẩu quốc tế tại tỉnh Lạng Sơn."
    ],
    "keySections": [
      {
        "title": "1. Địa lí ngành thương mại: Nội thương và Ngoại thương",
        "paragraphs": [
          "Thương mại là khâu trung gian nối liền sản xuất với tiêu dùng thông qua hành vi mua bán hàng hóa và dịch vụ.",
          "a) Nội thương: Hoạt động buôn bán trao đổi hàng hóa diễn ra trong phạm vi biên giới quốc gia thông qua hệ thống chợ truyền thống, siêu thị, trung tâm thương mại và thương mại điện tử. Giúp lưu thông hàng hóa thông suốt giữa các vùng miền.",
          "b) Ngoại thương: Hoạt động buôn bán trao đổi hàng hóa và dịch vụ giữa các quốc gia với nhau qua biên giới (xuất khẩu và nhập khẩu). Là động lực thúc đẩy phân công lao động quốc tế, mở rộng thị trường và tăng nguồn thu ngoại tệ."
        ],
        "highlight": "Công thức cán cân thương mại: Cán cân = Giá trị Xuất khẩu - Giá trị Nhập khẩu. Nếu Xuất > Nhập: Xuất siêu (dương); Nếu Xuất < Nhập: Nhập siêu (âm)."
      },
      {
        "title": "2. Cán cân thương mại và cơ cấu xuất nhập khẩu",
        "paragraphs": [
          "Tổng kim ngạch xuất nhập khẩu = Giá trị Xuất khẩu + Giá trị Nhập khẩu.",
          "Tỉ trọng xuất khẩu (%) = (Giá trị Xuất khẩu / Tổng kim ngạch XNK) × 100%.",
          "Cơ cấu mặt hàng xuất khẩu phản ánh trình độ phát triển kinh tế: các nước phát triển xuất khẩu máy móc công nghệ cao; các nước đang phát triển từng bước chuyển từ xuất khẩu nông sản thô sang hàng công nghiệp chế biến."
        ]
      },
      {
        "title": "3. Địa lí ngành tài chính ngân hàng",
        "paragraphs": [
          "Là huyết mạch luân chuyển nguồn vốn trong nền kinh tế: huy động tiền tiết kiệm, cấp vốn tín dụng cho sản xuất kinh doanh, thực hiện dịch vụ thanh toán trong nước và quốc tế.",
          "Các trung tâm tài chính lớn nhất thế giới: New York, Luân Đôn, Tokyo, Singapore, Thượng Hải."
        ]
      }
    ],
    "terms": [
      {"term": "Cán cân thương mại", "def": "Chênh lệch giữa giá trị xuất khẩu và giá trị nhập khẩu hàng hóa của một quốc gia trong một thời kì nhất định."},
      {"term": "Xuất siêu (Trade Surplus)", "def": "Trạng thái cán cân thương mại dương, khi giá trị hàng hóa xuất khẩu lớn hơn giá trị hàng hóa nhập khẩu."},
      {"term": "Kim ngạch xuất nhập khẩu", "def": "Tổng giá trị tính bằng tiền của tất cả hàng hóa xuất khẩu và nhập khẩu của một quốc gia trong một khoảng thời gian."}
    ],
    "localExamples": [
      "Tỉnh Lạng Sơn có vị thế đặc biệt là 'cửa ngõ giao thương' quốc tế lớn nhất miền Bắc với Trung Quốc qua các cửa khẩu Hữu Nghị, Tân Thanh, ga quốc tế Đồng Đăng; tổng kim ngạch xuất nhập khẩu qua địa bàn đạt hàng tỉ USD mỗi năm.",
      "Tại xã Vạn Linh (tỉnh Lạng Sơn), chợ phiên Vạn Linh (họp định kì theo ngày âm lịch) là nét đẹp văn hóa nội thương truyền thống, nơi bà con trao đổi nông sản, thổ cẩm; bên cạnh đó phòng giao dịch Ngân hàng Chính sách xã hội và Agribank cung ứng kịp thời vốn vay ưu đãi cho nông dân phát triển vườn na."
    ],
    "takeaways": [
      "Thương mại là cầu nối giữa sản xuất và tiêu dùng.",
      "Cán cân thương mại = Xuất khẩu - Nhập khẩu; xuất siêu phản ánh sức cạnh tranh hàng hóa cao.",
      "Kinh tế cửa khẩu Lạng Sơn và chợ phiên Vạn Linh là hai biểu hiện sinh động của ngoại thương và nội thương."
    ]
  },

  # Bài 38
  {
    "num": 38,
    "id": "bai-38",
    "partId": "phan-3",
    "chapterId": "chuong-12",
    "topicId": "chuong-12",
    "title": "Bài 38. Thực hành: Viết báo cáo tìm hiểu về một ngành dịch vụ",
    "subtitle": "Kĩ năng khảo sát, thu thập tư liệu và viết báo cáo đánh giá thực trạng một hoạt động dịch vụ tại địa phương",
    "durationMinutes": 45,
    "isPractice": True,
    "scope": "Phương pháp điều tra xã hội học; thu thập số liệu bán lẻ hàng hóa, dịch vụ du lịch, vận tải hành khách hoặc bưu chính viễn thông tại địa phương; cấu trúc bài báo cáo chuyên đề dịch vụ.",
    "calcConcept": "Tính tốc độ tăng trưởng doanh thu dịch vụ tiêu dùng hoặc tính tỉ suất lợi nhuận của một cơ sở dịch vụ (%) (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "%",
    "objectives": [
      "Biết cách lập đề cương và thu thập thông tin về một hoạt động dịch vụ cụ thể tại địa phương (thương mại, giao thông, bưu chính).",
      "Xử lí và tính toán được các chỉ tiêu thống kê cơ bản: doanh thu, lượng khách, tốc độ tăng trưởng dịch vụ qua các quý/năm.",
      "Viết và trình bày báo cáo tìm hiểu ngành dịch vụ rõ ràng, có phân tích ưu điểm, hạn chế và đề xuất giải pháp.",
      "Vận dụng viết báo cáo khảo sát chuỗi dịch vụ cung ứng và tiêu thụ nông sản na Chi Lăng tại xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Các bước viết báo cáo tìm hiểu một ngành dịch vụ",
        "paragraphs": [
          "Bước 1: Chọn đề tài cụ thể (ví dụ: Hoạt động dịch vụ bưu chính chuyển phát tại xã Vạn Linh; Dịch vụ du lịch sinh thái miệt vườn na Chi Lăng; Dịch vụ vận tải hàng hóa nông sản).",
          "Bước 2: Xây dựng đề cương nghiên cứu: Đặt vấn đề -> Hiện trạng hoạt động -> Nhận xét đánh giá -> Giải pháp và kiến nghị.",
          "Bước 3: Thu thập số liệu và tài liệu thực tế từ các cơ sở dịch vụ hoặc phòng thống kê.",
          "Bước 4: Xử lí số liệu, vẽ biểu đồ minh họa và hoàn thiện văn bản báo cáo."
        ],
        "highlight": "Một báo cáo dịch vụ thuyết phục cần có số liệu định lượng cụ thể, biểu đồ trực quan và giải pháp khả thi gắn liền với đời sống địa phương."
      },
      {
        "title": "2. Cấu trúc bài báo cáo chuyên đề dịch vụ",
        "paragraphs": [
          "1. Tên đề tài và lí do chọn đề tài.",
          "2. Tình hình phát triển: Số lượng cơ sở, lao động, doanh thu và sản lượng dịch vụ.",
          "3. Đánh giá chất lượng dịch vụ: Mức độ đáp ứng nhu cầu nhân dân, giá cả, thái độ phục vụ.",
          "4. Khó khăn, tồn tại và phương hướng nâng cao hiệu quả hoạt động trong thời gian tới."
        ]
      },
      {
        "title": "3. Phương pháp tính toán các chỉ số dịch vụ",
        "paragraphs": [
          "Tốc độ tăng trưởng doanh thu (%) = [(Doanh thu năm sau - Doanh thu năm trước) / Doanh thu năm trước] × 100%.",
          "Tỉ suất lợi nhuận dịch vụ (%) = (Lợi nhuận ròng / Doanh thu thuần) × 100%."
        ]
      }
    ],
    "terms": [
      {"term": "Báo cáo chuyên đề", "def": "Văn bản khoa học trình bày có hệ thống kết quả nghiên cứu, khảo sát thực tế về một vấn đề cụ thể nhằm cung cấp thông tin và giải pháp."},
      {"term": "Doanh thu dịch vụ", "def": "Toàn bộ số tiền thu được từ việc cung ứng các dịch vụ cho khách hàng trong một kì kế toán nhất định."},
      {"term": "Chuỗi cung ứng dịch vụ", "def": "Mạng lưới các tổ chức, con người, hoạt động và thông tin tham gia vào việc chuyển giao dịch vụ từ nhà cung cấp đến khách hàng."}
    ],
    "localExamples": [
      "Học sinh Trường THPT Hòa Bình thực hành viết báo cáo: 'Khảo sát chuỗi dịch vụ cung ứng vật tư và tiêu thụ nông sản na Chi Lăng tại xã Vạn Linh (Lạng Sơn)': phân tích vai trò của dịch vụ vận tải xe tải nhỏ, dịch vụ đóng thùng xốp và bưu chính chuyển phát nhanh giúp na Chi Lăng giữ độ tươi ngon khi đến tay người tiêu dùng.",
      "Báo cáo đề xuất giải pháp: xây dựng thêm kho lạnh bảo quản na tập trung tại xã Vạn Linh để kéo dài thời gian tiêu thụ, tránh tình trạng bị ép giá khi vào vụ thu hoạch rộ."
    ],
    "takeaways": [
      "Viết báo cáo rèn luyện kĩ năng thu thập thông tin, tư duy phản biện và kĩ năng xử lí số liệu.",
      "Số liệu định lượng chính xác là cơ sở khoa học để đưa ra các đề xuất phát triển dịch vụ thiết thực.",
      "Dịch vụ logistics và bảo quản nông sản tại xã Vạn Linh (tỉnh Lạng Sơn) là mắt xích then chốt nâng tầm giá trị nông nghiệp Lạng Sơn."
    ]
  },

  # Bài 39
  {
    "num": 39,
    "id": "bai-39",
    "partId": "phan-3",
    "chapterId": "chuong-13",
    "topicId": "chuong-13",
    "title": "Bài 39. Môi trường và tài nguyên thiên nhiên",
    "subtitle": "Khái niệm môi trường sống, phân loại tài nguyên thiên nhiên, nguy cơ cạn kiệt và an ninh môi trường",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm môi trường (tự nhiên, nhân tạo, xã hội); chức năng của môi trường; phân loại tài nguyên thiên nhiên theo khả năng phục hồi (phục hồi, không phục hồi, vô tận); khủng hoảng cạn kiệt tài nguyên; an ninh môi trường.",
    "calcConcept": "Tính thời gian cạn kiệt mỏ khoáng sản (Số năm = Trữ lượng mỏ / Sản lượng khai thác hàng năm) hoặc tính chỉ số an ninh nguồn nước ngọt bình quân đầu người (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "năm",
    "objectives": [
      "Nêu được khái niệm môi trường, các thành phần của môi trường và các chức năng cơ bản của môi trường đối với con người.",
      "Phân biệt được 3 nhóm tài nguyên thiên nhiên theo thuộc tính phục hồi: tài nguyên có thể phục hồi (rừng, đất, nước), tài nguyên không thể phục hồi (khoáng sản), tài nguyên vô tận (năng lượng mặt trời, gió).",
      "Phân tích được nguyên nhân dẫn đến suy thoái môi trường và nguy cơ cạn kiệt tài nguyên thiên nhiên.",
      "Tính toán được thời gian cạn kiệt của mỏ khoáng sản và đề xuất các biện pháp bảo vệ tài nguyên đất, rừng, nước tại Chi Lăng và xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm môi trường và các chức năng của môi trường",
        "paragraphs": [
          "Môi trường sống của con người là tổng thể các điều kiện tự nhiên và nhân tạo bao quanh, có ảnh hưởng trực tiếp đến đời sống, sự tồn tại và phát triển của con người và sinh vật.",
          "Gồm: Môi trường tự nhiên (đất, nước, không khí, sinh vật); Môi trường nhân tạo (nhà cửa, đường sá, cầu cống, nhà máy); Môi trường xã hội (các mối quan hệ kinh tế, pháp luật, đạo đức).",
          "Ba chức năng cơ bản của môi trường:",
          "- Là không gian sinh sống của con người và các loài sinh vật.",
          "- Là nơi cung cấp các nguồn tài nguyên thiên nhiên phục vụ cho sản xuất và đời sống.",
          "- Là nơi chứa đựng, đồng hóa và thanh lọc các chất thải do con người tạo ra."
        ],
        "highlight": "Môi trường có giới hạn chịu tải; khi con người xả thải vượt quá khả năng tự làm sạch của tự nhiên sẽ gây ra ô nhiễm và khủng hoảng sinh thái."
      },
      {
        "title": "2. Phân loại tài nguyên thiên nhiên theo khả năng phục hồi",
        "paragraphs": [
          "Tài nguyên thiên nhiên là các thành phần của tự nhiên mà con người có thể sử dụng trực tiếp hoặc chế biến để tạo ra của cải vật chất.",
          "- Tài nguyên không thể phục hồi: Khoáng sản (than đá, dầu mỏ, quặng sắt, đá vôi). Được hình thành qua hàng triệu năm biến đổi địa chất, khi khai thác sẽ cạn kiệt vĩnh viễn.",
          "- Tài nguyên có thể phục hồi: Đất, nước ngọt, sinh vật (rừng, động thực vật). Có thể tự tái tạo nếu con người sử dụng hợp lí, không khai thác quá mức ngưỡng sinh thái.",
          "- Tài nguyên vô tận: Bức xạ mặt trời, gió, thủy triều, địa nhiệt. Không bao giờ cạn kiệt do con người sử dụng."
        ]
      },
      {
        "title": "3. Sử dụng hợp lí tài nguyên và an ninh môi trường",
        "paragraphs": [
          "Khai thác tiết kiệm tài nguyên khoáng sản, đẩy mạnh tái chế và tìm kiếm vật liệu thay thế.",
          "Công thức tính thời gian khai thác mỏ: Thời gian cạn kiệt (năm) = Trữ lượng khoáng sản xác minh / Sản lượng khai thác hàng năm.",
          "Bảo vệ an ninh nguồn nước, an ninh lương thực và phòng ngừa các thảm họa môi trường xuyên biên giới."
        ]
      }
    ],
    "terms": [
      {"term": "Môi trường sống (Environment)", "def": "Tổng thể các yếu tố vật chất tự nhiên và nhân tạo bao quanh con người, chi phối sự tồn tại và phát triển của xã hội."},
      {"term": "Tài nguyên không thể phục hồi", "def": "Nguồn tài nguyên tự nhiên bị tiêu hao dần theo quá trình khai thác và không có khả năng tự tái tạo lại trong đời sống con người (khoáng sản)."},
      {"term": "An ninh môi trường", "def": "Trạng thái hệ thống môi trường được bảo đảm an toàn, không có nguy cơ đe dọa đến sự sống và sự phát triển của con người."}
    ],
    "localExamples": [
      "Tại xã Chi Lăng (Lạng Sơn), tài nguyên đá vôi là khoáng sản không thể phục hồi; việc khai thác đá vôi làm xi măng và đá xây dựng phải đi đôi với bảo vệ cảnh quan di tích lịch sử và hoàn nguyên môi trường sinh thái.",
      "Ở xã Vạn Linh (tỉnh Lạng Sơn), tài nguyên nước ngầm và đất feralit trên đá vôi là tài nguyên có thể phục hồi nhưng rất dễ bị tổn thương; nhân dân có ý thức bảo vệ thảm rừng trên núi đá để giữ mạch nước ngầm không bị khô cạn."
    ],
    "takeaways": [
      "Môi trường có 3 chức năng: không gian sống, nguồn cung cấp tài nguyên, nơi chứa đựng chất thải.",
      "Tài nguyên khoáng sản không thể phục hồi cần khai thác tiết kiệm; tài nguyên đất, nước, rừng cần sử dụng trong ngưỡng tự tái tạo.",
      "Thời gian cạn kiệt mỏ (năm) = Trữ lượng / Sản lượng khai thác hàng năm."
    ]
  },

  # Bài 40
  {
    "num": 40,
    "id": "bai-40",
    "partId": "phan-3",
    "chapterId": "chuong-13",
    "topicId": "chuong-13",
    "title": "Bài 40. Phát triển bền vững và tăng trưởng xanh",
    "subtitle": "Khái niệm phát triển bền vững, ba trụ cột giao thoa, kinh tế tuần hoàn và Chiến lược quốc gia về Tăng trưởng xanh",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm phát triển bền vững (kinh tế, xã hội, môi trường); sự cần thiết phải phát triển bền vững; khái niệm và mục tiêu của tăng trưởng xanh; cam kết Net Zero 2050 của Việt Nam.",
    "calcConcept": "Tính tỉ trọng năng lượng sạch/tái tạo trong tổng năng lượng tiêu thụ (%) hoặc chỉ số giảm phát thải khí nhà kính so với kịch bản phát triển thông thường (BAU)",
    "calcUnit": "%",
    "objectives": [
      "Trình bày được khái niệm phát triển bền vững và phân tích được mối quan hệ biện chứng giữa 3 trụ cột: Kinh tế - Xã hội - Môi trường.",
      "Giải thích được vì sao loài người bắt buộc phải chuyển dịch từ mô hình phát triển truyền thống sang mô hình phát triển bền vững và tăng trưởng xanh.",
      "Nêu được mục tiêu của Chiến lược quốc gia về Tăng trưởng xanh và cam kết đưa mức phát thải ròng về 0 (Net Zero) vào năm 2050 của Việt Nam.",
      "Tính toán tỉ trọng năng lượng xanh và đề xuất các hành động cụ thể xây dựng lối sống xanh tại xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm và sự cần thiết phải Phát triển bền vững",
        "paragraphs": [
          "Khái niệm: Phát triển bền vững là sự phát triển nhằm thỏa mãn nhu cầu của thế hệ hiện tại mà không làm tổn hại đến khả năng đáp ứng nhu cầu đó của các thế hệ mai sau trên cơ sở kết hợp chặt chẽ, hài hòa giữa tăng trưởng kinh tế, giải quyết các vấn đề xã hội và bảo vệ môi trường.",
          "Sự cần thiết: Mô hình tăng trưởng kinh tế truyền thống theo chiều rộng đã dẫn đến các hệ lụy nghiêm trọng: cạn kiệt tài nguyên, ô nhiễm môi trường, biến đổi khí hậu toàn cầu và gia tăng bất bình đẳng xã hội. Để cứu lấy Trái Đất và đảm bảo tương lai nhân loại, phát triển bền vững là con đường sống còn duy nhất."
        ],
        "highlight": "Ba trụ cột của Phát triển bền vững: Tăng trưởng kinh tế bền vững + Tiến bộ và công bằng xã hội + Bảo vệ môi trường sinh thái trong lành."
      },
      {
        "title": "2. Ba trụ cột giao thoa của Phát triển bền vững",
        "paragraphs": [
          "- Trụ cột Kinh tế: Tăng trưởng kinh tế ổn định, hiệu quả cao, chuyển dịch cơ cấu theo hướng kinh tế tri thức và kinh tế số.",
          "- Trụ cột Xã hội: Xóa đói giảm nghèo, đảm bảo công bằng xã hội, tạo việc làm thỏa đáng, nâng cao chất lượng giáo dục, y tế và bảo tồn bản sắc văn hóa dân tộc.",
          "- Trụ cột Môi trường: Sử dụng hợp lí và tiết kiệm tài nguyên thiên nhiên, bảo tồn đa dạng sinh học, kiểm soát ô nhiễm và phục hồi các hệ sinh thái bị suy thoái."
        ]
      },
      {
        "title": "3. Tăng trưởng xanh và hành động của Việt Nam",
        "paragraphs": [
          "Tăng trưởng xanh là phương thức quan trọng để thực hiện phát triển bền vững, tiến trình tăng trưởng kinh tế dựa trên việc sử dụng hiệu quả tài nguyên, giảm phát thải khí nhà kính, phục hồi môi trường và ứng phó với biến đổi khí hậu.",
          "Cam kết của Việt Nam: Tại Hội nghị thượng đỉnh về biến đổi khí hậu của Liên Hợp Quốc (COP26), Việt Nam đã cam kết mạnh mẽ đạt mức phát thải ròng bằng 0 (Net Zero) vào năm 2050.",
          "Hành động của học sinh: Thực hiện lối sống xanh (tiết kiệm điện nước, trồng cây xanh, đi bộ hoặc xe đạp, phân loại rác thải tại nguồn, nói không với túi nilon dùng một lần)."
        ]
      }
    ],
    "terms": [
      {"term": "Phát triển bền vững (Sustainable Development)", "def": "Mô hình phát triển kết hợp hài hòa giữa tăng trưởng kinh tế, công bằng xã hội và bảo vệ môi trường cho hôm nay và mai sau."},
      {"term": "Tăng trưởng xanh (Green Growth)", "def": "Sự tăng trưởng kinh tế đảm bảo rằng các tài sản tự nhiên tiếp tục cung cấp các nguồn tài nguyên và dịch vụ môi trường cho sự thịnh vượng của con người."},
      {"term": "Lối sống xanh (Green Lifestyle)", "def": "Phong cách sống thân thiện với môi trường, hạn chế tối đa việc tạo ra rác thải và giảm dấu chân các-bon cá nhân."}
    ],
    "localExamples": [
      "Tại xã Chi Lăng và xã Vạn Linh (Lạng Sơn), định hướng tăng trưởng xanh được hiện thực hóa qua việc xây dựng thương hiệu Na Chi Lăng hữu cơ, bảo vệ rừng phòng hộ trên núi đá vôi, phát triển du lịch sinh thái nông nghiệp và ứng dụng năng lượng mặt trời.",
      "Ở xã Vạn Linh (tỉnh Lạng Sơn), phong trào xây dựng xã Nông thôn mới nâng cao gắn liền với tiêu chí môi trường xanh - sạch - đẹp: các tuyến đường hoa liên thôn bản, mô hình thu gom bao bì thuốc bảo vệ thực vật đúng nơi quy định và tinh thần giữ gìn nếp sống văn minh, đoàn kết của đồng bào các dân tộc."
    ],
    "takeaways": [
      "Phát triển bền vững dựa trên 3 trụ cột vững chắc: Kinh tế - Xã hội - Môi trường.",
      "Tăng trưởng xanh và Net Zero 2050 là mục tiêu hành động quốc gia của Việt Nam.",
      "Mỗi học sinh Trường THPT Hòa Bình chung tay xây dựng quê hương xã Vạn Linh và xã Chi Lăng (Lạng Sơn) ngày càng giàu đẹp và xanh tươi."
    ]
  }
]
print(f"Loaded {len(PART3_B_LESSONS)} lessons from Part 3-B (Lessons 25-40).")
