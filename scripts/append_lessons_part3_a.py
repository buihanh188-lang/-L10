# -*- coding: utf-8 -*-
"""
Appends Lessons 19 to 24 (Dân số, Đô thị hóa, Nguồn lực, Cơ cấu kinh tế, Nông nghiệp)
Strict local scope constraint: Only Xã Vạn Linh, Khu vực Chi Lăng, Tỉnh Lạng Sơn.
"""

PART3_A_LESSONS = [
  # Bài 19
  {
    "num": 19,
    "id": "bai-19",
    "partId": "phan-3",
    "chapterId": "chuong-8",
    "topicId": "chuong-8",
    "title": "Bài 19. Quy mô và sự gia tăng dân số, cơ cấu dân số",
    "subtitle": "Quy mô dân số toàn cầu, gia tăng tự nhiên, gia tăng cơ học, cơ cấu sinh học và cơ cấu xã hội của dân số",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Quy mô dân số thế giới; tỉ suất sinh thô (S), tử thô (T), tỉ suất gia tăng dân số tự nhiên (Tg = S - T); gia tăng cơ học; cơ cấu sinh học (giới tính, độ tuổi, tháp dân số); cơ cấu xã hội (lao động, trình độ văn hóa).",
    "calcConcept": "Tính tỉ suất gia tăng tự nhiên (Tg = S - T, tính ra % hoặc ‰), tỉ số giới tính (Tgt = Nam / Nữ × 100), hoặc tỉ lệ các nhóm tuổi trong cơ cấu dân số",
    "calcUnit": "%",
    "objectives": [
      "Trình bày được tình hình phát triển quy mô dân số thế giới và xu hướng biến động hiện nay.",
      "Phân biệt được tỉ suất gia tăng tự nhiên (Tg = S - T), gia tăng cơ học và gia tăng thực tế của dân số.",
      "Phân tích được cơ cấu sinh học (giới tính, độ tuổi, 3 kiểu tháp dân số cơ bản) và cơ cấu xã hội (lao động theo nhóm ngành).",
      "Tính toán thành thạo tỉ suất gia tăng tự nhiên, tỉ số giới tính và liên hệ với đặc điểm dân số tại xã Vạn Linh, khu vực Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Quy mô và sự gia tăng dân số thế giới",
        "paragraphs": [
          "Quy mô dân số thế giới đã vượt mốc 8 tỉ người (năm 2022) và tiếp tục tăng nhưng tốc độ gia tăng có xu hướng chậm dần lại.",
          "Gia tăng tự nhiên: Là hiệu số giữa tỉ suất sinh thô (S) và tỉ suất tử thô (T), kí hiệu Tg = S - T (đơn vị tính là % hoặc ‰). Gia tăng tự nhiên là động lực chính quyết định biến động số dân toàn cầu.",
          "Gia tăng cơ học: Là hiệu số giữa số người nhập cư và xuất cư. Trên phạm vi toàn thế giới gia tăng cơ học bằng 0, nhưng có ý nghĩa lớn đối với từng quốc gia và địa phương.",
          "Gia tăng thực tế: Tổng của gia tăng tự nhiên và gia tăng cơ học."
        ],
        "highlight": "Công thức tính gia tăng tự nhiên: Tg (%) = (Tỉ suất sinh ‰ - Tỉ suất tử ‰) / 10. Tỉ số giới tính: Tgt = (Dân số nam / Dân số nữ) × 100."
      },
      {
        "title": "2. Cơ cấu sinh học của dân số",
        "paragraphs": [
          "a) Cơ cấu theo giới tính: Thể hiện tương quan giữa số nam và số nữ. Tỉ số giới tính Tgt = (Số nam / Số nữ) × 100; Tỉ lệ giới tính = (Số nam hoặc nữ / Tổng số dân) × 100%. Bị tác động bởi sinh học, chiến tranh, di cư và tâm lí xã hội.",
          "b) Cơ cấu theo tuổi: Chia làm 3 nhóm tuổi chính: Dưới tuổi lao động (0 - 14 tuổi), Trong độ tuổi lao động (15 - 64 tuổi), Trên độ tuổi lao động (từ 65 tuổi trở lên).",
          "Tháp dân số (tháp tuổi) thể hiện trực quan cơ cấu tuổi và giới tính: Tháp mở rộng (dân số trẻ), Tháp thu hẹp (dân số già), Tháp ổn định."
        ]
      },
      {
        "title": "3. Cơ cấu xã hội của dân số",
        "paragraphs": [
          "Cơ cấu dân số theo lao động: Phản ánh tỉ lệ lao động trong các khu vực kinh tế (Nông - lâm - thủy sản; Công nghiệp - xây dựng; Dịch vụ). Xu hướng chung toàn cầu là giảm tỉ lệ lao động nông nghiệp, tăng tỉ lệ lao động công nghiệp và dịch vụ.",
          "Cơ cấu theo trình độ học vấn: Đo lường chất lượng nguồn nhân lực quốc gia thông qua tỉ lệ biết chữ và số năm đi học bình quân."
        ]
      }
    ],
    "terms": [
      {"term": "Tỉ suất gia tăng tự nhiên (Tg)", "def": "Hiệu số giữa tỉ suất sinh thô và tỉ suất tử thô, biểu thị mức độ tăng dân số tự nhiên trong năm, đơn vị % hoặc ‰."},
      {"term": "Tỉ số giới tính (Sex ratio)", "def": "Số lượng nam giới tương ứng trên 100 nữ giới trong một quần thể dân cư."},
      {"term": "Tháp dân số (Population Pyramid)", "def": "Biểu đồ hình tháp thể hiện cơ cấu dân số theo độ tuổi và giới tính của một quốc gia hay vùng lãnh thổ tại một thời điểm."}
    ],
    "localExamples": [
      "Tại xã Vạn Linh (tỉnh Lạng Sơn), dân số chủ yếu là đồng bào các dân tộc Tày, Nùng, Kinh cùng chung sống đoàn kết; nhờ thực hiện tốt chính sách dân số và kế hoạch hóa gia đình, tỉ suất gia tăng tự nhiên đã giảm về mức hợp lí dưới 1,0%/năm.",
      "Địa bàn xã Chi Lăng và xã Vạn Linh đang trong thời kì cơ cấu 'dân số vàng' với tỉ lệ người trong độ tuổi lao động chiếm trên 65%, cung cấp lực lượng lao động trẻ, dồi dào cho các vùng thâm canh na và tiểu thủ công nghiệp Lạng Sơn."
    ],
    "takeaways": [
      "Gia tăng tự nhiên là động lực chính làm tăng dân số toàn cầu; công thức Tg = (S - T)/10 (%).",
      "Cơ cấu dân số theo tuổi và giới tính được biểu thị chuẩn xác qua tháp dân số.",
      "Cơ cấu dân số vàng tại Lạng Sơn là cơ hội lớn để bứt phá phát triển kinh tế nông sản hàng hóa."
    ]
  },

  # Bài 20
  {
    "num": 20,
    "id": "bai-20",
    "partId": "phan-3",
    "chapterId": "chuong-8",
    "topicId": "chuong-8",
    "title": "Bài 20. Phân bố dân cư và đô thị hóa",
    "subtitle": "Quy luật phân bố dân cư thế giới, các nhân tố ảnh hưởng và đặc điểm quá trình đô thị hóa",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Mật độ dân số; quy luật phân bố dân cư không đều trên Trái Đất; các nhân tố kinh tế - xã hội và tự nhiên chi phối; khái niệm, đặc điểm, các mặt tích cực và tiêu cực của đô thị hóa.",
    "calcConcept": "Tính mật độ dân số (người/km² = Dân số / Diện tích), tỉ lệ dân thành thị (%) hoặc tốc độ đô thị hóa qua các thời kì",
    "calcUnit": "người/km²",
    "objectives": [
      "Nêu được khái niệm mật độ dân số và phân tích được quy luật phân bố dân cư không đồng đều trên thế giới.",
      "Phân tích được tác động của các nhân tố tự nhiên (vị trí, địa hình, khí hậu, nước) và nhân tố kinh tế - xã hội (trình độ sản xuất, lịch sử khai thác) đến phân bố dân cư.",
      "Trình bày được khái niệm, 3 đặc điểm cơ bản của đô thị hóa và đánh giá được tác động hai mặt của đô thị hóa.",
      "Tính toán thành thạo mật độ dân số, tỉ lệ dân thành thị và liên hệ với mạng lưới phân bố dân cư tại xã Vạn Linh và xã Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Sự phân bố dân cư trên thế giới",
        "paragraphs": [
          "Dân cư trên Trái Đất phân bố rất không đều trong không gian:",
          "- Nơi dân cư tập trung đông đúc: Các vùng đồng bằng châu thổ màu mỡ, vùng duyên hải ven biển, các thung lũng có khí hậu ấm áp ẩm ướt, nơi có các đô thị và khu công nghiệp phát triển (Đông Á, Nam Á, Tây Âu, Đông Bắc Hoa Kỳ).",
          "- Nơi dân cư thưa thớt: Vùng cực lạnh giá, các hoang mạc khô hạn (Sahara, Trung Á), các vùng núi cao hiểm trở rừng rậm nhiệt đới (Amazon).",
          "Thước đo phân bố dân cư là Mật độ dân số = Dân số / Diện tích (người/km²)."
        ],
        "highlight": "Trình độ phát triển của phương thức sản xuất và tính chất của nền kinh tế là nhân tố quyết định trực tiếp đến sự phân bố dân cư."
      },
      {
        "title": "2. Các nhân tố ảnh hưởng đến phân bố dân cư",
        "paragraphs": [
          "a) Nhân tố kinh tế - xã hội (vai trò quyết định): Trình độ phát triển của lực lượng sản xuất; Tính chất của nền kinh tế; Lịch sử khai thác lãnh thổ; Các luồng chuyển cư di dân.",
          "b) Nhân tố tự nhiên (vai trò tạo điều kiện thuận lợi hoặc khó khăn): Vị trí địa lí; Địa hình và đất đai; Khí hậu và nguồn nước; Tài nguyên khoáng sản."
        ]
      },
      {
        "title": "3. Đô thị hóa và tác động của nó",
        "paragraphs": [
          "Đô thị hóa là quá trình kinh tế - xã hội mà biểu hiện là sự tăng nhanh về số lượng và quy mô của các điểm dân cư đô thị, sự tập trung dân cư trong các thành phố và sự phổ biến rộng rãi lối sống đô thị.",
          "Ba đặc điểm chính: Dân cư thành thị tăng nhanh; Dân cư tập trung vào các thành phố lớn và cực lớn; Lối sống đô thị phổ biến rộng rãi.",
          "Tác động tích cực: Thúc đẩy tăng trưởng kinh tế, chuyển dịch cơ cấu ngành, tạo việc làm, nâng cao chất lượng cuộc sống.",
          "Tác động tiêu cực (khi đô thị hóa tự phát, không gắn với công nghiệp hóa): Ùn tắc giao thông, ô nhiễm môi trường, thiếu nhà ở, thất nghiệp, tệ nạn xã hội."
        ]
      }
    ],
    "terms": [
      {"term": "Mật độ dân số", "def": "Số lượng dân cư sinh sống trung bình trên một đơn vị diện tích lãnh thổ (thường tính bằng người/km²)."},
      {"term": "Đô thị hóa (Urbanization)", "def": "Quá trình kinh tế - xã hội thể hiện qua sự gia tăng tỉ lệ dân thành thị, mở rộng quy mô các thành phố và lan tỏa lối sống đô thị."},
      {"term": "Tỉ lệ dân thành thị", "def": "Tỉ số phần trăm giữa số dân sinh sống ở khu vực đô thị so với tổng số dân của một quốc gia hay vùng lãnh thổ."}
    ],
    "localExamples": [
      "Tại tỉnh Lạng Sơn và các xã Chi Lăng, Vạn Linh, dân cư phân bố không đều: tập trung đông đúc tại trung tâm xã Chi Lăng và các thung lũng ven sông Thương; trong khi các khu vực vùng cao núi đá dân cư thưa thớt hơn.",
      "Ở xã Vạn Linh (tỉnh Lạng Sơn), các điểm dân cư phân bố tập trung theo các cụm làng bản truyền thống dưới chân núi đá vôi và dọc theo các trục đường liên xã bê tông hóa thuận lợi giao thương nông sản."
    ],
    "takeaways": [
      "Dân cư phân bố không đều; mật độ dân số = Dân số / Diện tích (người/km²).",
      "Nhân tố kinh tế - xã hội quyết định sự phân bố dân cư và quá trình đô thị hóa.",
      "Quá trình xây dựng Nông thôn mới nâng cao tại xã Vạn Linh gắn liền với hiện đại hóa nông thôn và lan tỏa lối sống văn minh."
    ]
  },

  # Bài 21
  {
    "num": 21,
    "id": "bai-21",
    "partId": "phan-3",
    "chapterId": "chuong-9",
    "topicId": "chuong-9",
    "title": "Bài 21. Các nguồn lực phát triển kinh tế",
    "subtitle": "Khái niệm nguồn lực, phân loại theo nguồn gốc và phạm vi, vai trò của từng nguồn lực đối với tăng trưởng kinh tế",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm nguồn lực; phân loại nguồn lực theo nguồn gốc (vị trí địa lí, tự nhiên, kinh tế - xã hội) và theo phạm vi lãnh thổ (trong nước, ngoài nước); vai trò chiến lược của từng nguồn lực.",
    "calcConcept": "Tính cơ cấu nguồn lực phát triển kinh tế (tỉ trọng vốn đầu tư trong nước và ngoài nước FDI) hoặc chỉ số hiệu quả sử dụng nguồn lực vốn đầu tư (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "%",
    "objectives": [
      "Trình bày được khái niệm nguồn lực phát triển kinh tế và các cách phân loại nguồn lực chủ yếu.",
      "Phân tích được vai trò của từng loại nguồn lực: vị trí địa lí (thuận lợi trao đổi), tự nhiên (cơ sở vật chất tiền đề), kinh tế - xã hội (nhân tố quyết định).",
      "Tính toán được cơ cấu các nguồn vốn đầu tư phát triển và hiệu quả sử dụng nguồn lực.",
      "Xác định được các nguồn lực thế mạnh nổi trội của khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm và phân loại nguồn lực phát triển kinh tế",
        "paragraphs": [
          "Nguồn lực phát triển kinh tế là tổng thể vị trí địa lí, các tài nguyên thiên nhiên, hệ thống tài sản quốc gia, nguồn nhân lực, đường lối chính sách, vốn và công nghệ... có thể được khai thác nhằm phục vụ cho sự phát triển kinh tế của một lãnh thổ nhất định.",
          "Phân loại theo nguồn gốc hình thành: Nguồn lực vị trí địa lí; Nguồn lực tự nhiên; Nguồn lực kinh tế - xã hội.",
          "Phân loại theo phạm vi lãnh thổ: Nguồn lực trong nước (nội lực); Nguồn lực ngoài nước (ngoại lực)."
        ],
        "highlight": "Nội lực giữ vai trò quyết định, ngoại lực giữ vai trò quan trọng; kết hợp tối ưu nội lực và ngoại lực là chìa khóa phát triển nhanh và bền vững."
      },
      {
        "title": "2. Vai trò của từng loại nguồn lực",
        "paragraphs": [
          "a) Nguồn lực vị trí địa lí: Tạo điều kiện thuận lợi hoặc khó khăn trong việc giao lưu hợp tác kinh tế, lựa chọn bạn hàng và mở rộng thị trường.",
          "b) Nguồn lực tự nhiên: Là tiền đề, cơ sở vật chất tự nhiên không thể thiếu cho các hoạt động sản xuất (đất đai, khoáng sản, nước, sinh vật, khí hậu).",
          "c) Nguồn lực kinh tế - xã hội: Giữ vai trò quyết định đối với sự phát triển kinh tế. Bao gồm nguồn lao động và chất lượng nguồn nhân lực; Vốn đầu tư và công nghệ; Đường lối, chính sách và thể chế kinh tế; Thị trường tiêu thụ."
        ]
      },
      {
        "title": "3. Kết hợp hài hòa các nguồn lực trong phát triển",
        "paragraphs": [
          "Muốn phát triển kinh tế nhanh và bền vững, mỗi địa phương phải đánh giá đúng tiềm năng, phát huy tối đa lợi thế so sánh của nguồn lực nội tại, đồng thời tranh thủ nguồn vốn đầu tư, công nghệ và thị trường từ bên ngoài."
        ]
      }
    ],
    "terms": [
      {"term": "Nguồn lực kinh tế", "def": "Toàn bộ các yếu tố vật chất và phi vật chất có thể huy động vào quá trình sản xuất nhằm tạo ra của cải cho xã hội."},
      {"term": "Nội lực (Internal resources)", "def": "Các nguồn lực sẵn có bên trong phạm vi quốc gia hay địa phương như đất đai, con người, vốn tích lũy nội bộ."},
      {"term": "Ngoại lực (External resources)", "def": "Các nguồn lực từ bên ngoài lãnh thổ như vốn đầu tư trực tiếp nước ngoài (FDI), công nghệ chuyển giao, kinh nghiệm quản lí quốc tế."}
    ],
    "localExamples": [
      "Nguồn lực thế mạnh của xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn): Vị trí nằm trên hành lang kinh tế Bắc - Nam kết nối Hà Nội - Lạng Sơn - Trung Quốc; tài nguyên đất feralit trên núi đá vôi màu mỡ; nguồn lao động cần cù, sáng tạo, giàu kinh nghiệm thuần hóa cây na trên vách đá.",
      "Khai thác ngoại lực: Nông dân Chi Lăng tiếp nhận chuyển giao tiến bộ khoa học kĩ thuật thụ phấn nhân tạo cho na, thu hút vốn từ các chương trình mục tiêu quốc gia để hoàn thiện hạ tầng tưới tiêu và đường giao thông."
    ],
    "takeaways": [
      "Nguồn lực tự nhiên là tiền đề cơ sở; nguồn lực kinh tế - xã hội giữ vai trò quyết định.",
      "Nội lực là nền tảng cốt lõi, ngoại lực tạo động lực thúc đẩy.",
      "Chi Lăng (Lạng Sơn) phát triển vững chắc nhờ khai thác đồng bộ lợi thế đất đá vôi và trí tuệ người nông dân bản địa."
    ]
  },

  # Bài 22
  {
    "num": 22,
    "id": "bai-22",
    "partId": "phan-3",
    "chapterId": "chuong-9",
    "topicId": "chuong-9",
    "title": "Bài 22. Cơ cấu kinh tế, tổng sản phẩm trong nước và tổng thu nhập quốc gia",
    "subtitle": "Khái niệm cơ cấu kinh tế, các bộ phận hợp thành, chỉ số GDP, GNI và GDP bình quân đầu người",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm cơ cấu kinh tế (theo ngành, theo thành phần, theo lãnh thổ); khái niệm tổng sản phẩm trong nước (GDP), tổng thu nhập quốc gia (GNI); GDP bình quân đầu người; công thức tính cơ cấu và tốc độ tăng trưởng.",
    "calcConcept": "Tính cơ cấu GDP theo ngành kinh tế (%), GDP bình quân đầu người (USD/người = GDP / Dân số), hoặc tốc độ tăng trưởng kinh tế qua các năm",
    "calcUnit": "%",
    "objectives": [
      "Trình bày được khái niệm cơ cấu kinh tế và phân tích được 3 bộ phận hợp thành cơ cấu kinh tế (ngành, thành phần, lãnh thổ).",
      "Phân biệt được bản chất kinh tế của hai chỉ tiêu then chốt: Tổng sản phẩm trong nước (GDP) và Tổng thu nhập quốc gia (GNI).",
      "Tính toán thành thạo cơ cấu GDP theo 3 khu vực kinh tế (%), tính GDP bình quân đầu người ($/người) và tốc độ tăng trưởng GDP.",
      "Nhận biết được xu hướng chuyển dịch cơ cấu kinh tế theo hướng tích cực tại tỉnh Lạng Sơn và khu vực Chi Lăng."
    ],
    "keySections": [
      {
        "title": "1. Cơ cấu kinh tế và các bộ phận hợp thành",
        "paragraphs": [
          "Cơ cấu kinh tế là tổng thể các ngành, các lĩnh vực, các bộ phận kinh tế có quan hệ hữu cơ tương đối ổn định hợp thành nền kinh tế quốc dân.",
          "a) Cơ cấu kinh tế theo ngành: Gồm 3 khu vực: Khu vực I (Nông nghiệp, lâm nghiệp, thủy sản); Khu vực II (Công nghiệp và xây dựng); Khu vực III (Dịch vụ). Xu hướng tiến bộ là giảm tỉ trọng khu vực I, tăng tỉ trọng khu vực II và khu vực III.",
          "b) Cơ cấu kinh tế theo thành phần kinh tế: Thể hiện quan hệ sở hữu tư liệu sản xuất (kinh tế nhà nước, kinh tế ngoài nhà nước, kinh tế có vốn đầu tư nước ngoài).",
          "c) Cơ cấu kinh tế theo lãnh thổ: Hình thành từ sự phân công lao động theo không gian (các vùng kinh tế, khu công nghiệp, vùng chuyên canh nông nghiệp)."
        ],
        "highlight": "Chỉ số GDP bình quân đầu người = Tổng GDP / Tổng số dân (USD/người). Tỉ trọng ngành i (%) = (Giá trị ngành i / Tổng GDP) × 100."
      },
      {
        "title": "2. Tổng sản phẩm trong nước (GDP) và Tổng thu nhập quốc gia (GNI)",
        "paragraphs": [
          "a) GDP (Gross Domestic Product): Là tổng giá trị thị trường của tất cả hàng hóa và dịch vụ cuối cùng được sản xuất ra trên phạm vi lãnh thổ một quốc gia trong một thời kì nhất định (thường là một năm), không phân biệt do người trong nước hay người nước ngoài tạo ra.",
          "b) GNI (Gross National Income): Là tổng thu nhập từ các sản phẩm và dịch vụ cuối cùng do công dân một quốc gia tạo ra trong một thời kì nhất định (bằng GDP cộng thu nhập từ sở hữu nhận được từ nước ngoài trừ thu nhập từ sở hữu chi trả cho nước ngoài).",
          "c) GDP và GNI bình quân đầu người: Thước đo quan trọng nhất phản ánh mức sống và trình độ phát triển kinh tế của người dân."
        ]
      },
      {
        "title": "3. Phương pháp tính toán cơ cấu và tăng trưởng kinh tế",
        "paragraphs": [
          "1. Cơ cấu GDP theo ngành (%): % Khu vực I = (Khu vực I / Tổng GDP) × 100%.",
          "2. Tốc độ tăng trưởng GDP (%): Tốc độ năm sau so với năm trước = [(GDP năm sau - GDP năm trước) / GDP năm trước] × 100%."
        ]
      }
    ],
    "terms": [
      {"term": "Tổng sản phẩm trong nước (GDP)", "def": "Tổng giá trị tính bằng tiền của tất cả sản phẩm và dịch vụ cuối cùng sản xuất ra trên lãnh thổ quốc gia trong một năm."},
      {"term": "Tổng thu nhập quốc gia (GNI)", "def": "Tổng thu nhập do các chủ thể kinh tế trong nước tạo ra cả ở trong nước và ngoài nước trong một năm."},
      {"term": "Chuyển dịch cơ cấu kinh tế", "def": "Quá trình thay đổi tỉ trọng giữa các ngành, các thành phần và các vùng kinh tế theo hướng hợp lí và hiện đại hơn."}
    ],
    "localExamples": [
      "Tại khu vực Chi Lăng (Lạng Sơn), cơ cấu kinh tế đang chuyển dịch tích cực: tỉ trọng ngành dịch vụ thương mại nông sản và công nghiệp chế biến vật liệu xây dựng tăng nhanh, tỉ trọng trồng trọt truyền thống giảm nhưng giá trị gia tăng trên 1 ha canh tác tăng cao nhờ cây na đặc sản.",
      "Thu nhập bình quân đầu người tại xã Vạn Linh (tỉnh Lạng Sơn) đã tăng trưởng vượt bậc, đạt chuẩn xã Nông thôn mới nâng cao nhờ thương hiệu Na Chi Lăng vươn tầm toàn quốc."
    ],
    "takeaways": [
      "Cơ cấu kinh tế gồm 3 bộ phận: ngành, thành phần và lãnh thổ.",
      "GDP tính theo lãnh thổ; GNI tính theo quyền sở hữu công dân.",
      "Chuyển dịch cơ cấu kinh tế theo hướng công nghiệp hóa, hiện đại hóa và nâng cao dịch vụ là quy luật tất yếu."
    ]
  },

  # Bài 23
  {
    "num": 23,
    "id": "bai-23",
    "partId": "phan-3",
    "chapterId": "chuong-10",
    "topicId": "chuong-10",
    "title": "Bài 23. Vai trò, đặc điểm, các nhân tố ảnh hưởng đến sự phát triển và phân bố nông nghiệp, lâm nghiệp, thủy sản",
    "subtitle": "Vai trò chiến lược của ngành nông - lâm - thủy sản, đặc điểm sản xuất phụ thuộc tự nhiên và các nhân tố chi phối",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Vai trò đảm bảo an ninh lương thực, cung cấp nguyên liệu, mặt hàng xuất khẩu; các đặc điểm cơ bản (đất là tư liệu sản xuất chủ yếu, đối tượng là sinh vật, mang tính mùa vụ, phụ thuộc tự nhiên); các nhân tố ảnh hưởng (đất, khí hậu, nước, sinh vật, kinh tế - xã hội).",
    "calcConcept": "Tính tỉ trọng giá trị sản xuất nông - lâm - thủy sản trong tổng sản phẩm hoặc tính tốc độ chuyển dịch cơ cấu nội bộ ngành (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "%",
    "objectives": [
      "Trình bày được vai trò chiến lược của ngành nông nghiệp, lâm nghiệp và thủy sản đối với an ninh lương thực và phát triển kinh tế.",
      "Phân tích được các đặc điểm đặc thù của sản xuất nông - lâm - thủy sản: đất là tư liệu sản xuất không thể thay thế, đối tượng sản xuất là cơ thể sống, mang tính mùa vụ và phân tán trong không gian.",
      "Đánh giá được tác động của các nhân tố tự nhiên và kinh tế - xã hội đến sự phát triển và phân bố ngành.",
      "Tính toán được tỉ trọng cơ cấu ngành và liên hệ với thực tiễn sản xuất nông nghiệp hàng hóa tại xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Vai trò của nông nghiệp, lâm nghiệp và thủy sản",
        "paragraphs": [
          "Cung cấp lương thực, thực phẩm thiết yếu nuôi sống toàn bộ xã hội loài người, đảm bảo an ninh lương thực quốc gia và thế giới.",
          "Cung cấp nguồn nguyên liệu phong phú cho ngành công nghiệp chế biến lương thực thực phẩm, dệt may, da giày, dược phẩm.",
          "Là nguồn hàng xuất khẩu có giá trị mang lại nguồn ngoại tệ lớn cho đất nước.",
          "Tạo việc làm và thu nhập cho hàng tỉ lao động nông thôn, giữ vai trò đặc biệt quan trọng trong việc bảo vệ môi trường sinh thái và bảo tồn văn hóa truyền thống."
        ],
        "highlight": "An ninh lương thực là nền tảng ổn định chính trị, kinh tế và độc lập tự chủ của mỗi quốc gia."
      },
      {
        "title": "2. Các đặc điểm của sản xuất nông nghiệp, lâm nghiệp, thủy sản",
        "paragraphs": [
          "a) Đất trồng và mặt nước là tư liệu sản xuất chủ yếu và không thể thay thế được.",
          "b) Đối tượng của sản xuất nông nghiệp là các cơ thể sống (cây trồng, vật nuôi). Chúng sinh trưởng và phát triển tuân theo các quy luật sinh học nhất định.",
          "c) Sản xuất nông nghiệp mang tính mùa vụ sâu sắc do chịu sự chi phối của chu kì thời tiết và khí hậu.",
          "d) Sản xuất nông nghiệp phân tán trong không gian rộng lớn, phụ thuộc chặt chẽ vào điều kiện tự nhiên."
        ]
      },
      {
        "title": "3. Các nhân tố ảnh hưởng đến sự phát triển và phân bố",
        "paragraphs": [
          "Nhân tố tự nhiên: Quỹ đất và độ phì xác định quy mô và loại cây trồng; Khí hậu và nguồn nước xác định cơ cấu mùa vụ và tính ổn định của sản xuất.",
          "Nhân tố kinh tế - xã hội: Dân cư và nguồn lao động; Tiến bộ khoa học - công nghệ (giống mới, nhà kính, tưới tiết kiệm); Thị trường tiêu thụ (điều tiết sản xuất); Chính sách phát triển nông nghiệp."
        ]
      }
    ],
    "terms": [
      {"term": "Tư liệu sản xuất chủ yếu", "def": "Yếu tố vật chất không thể thiếu để tiến hành sản xuất; trong nông nghiệp đó là đất đai và mặt nước nuôi trồng."},
      {"term": "Tính mùa vụ", "def": "Đặc điểm sản xuất chỉ diễn ra trong những khoảng thời gian nhất định trong năm do phụ thuộc vào chu kì sinh học và thời tiết."},
      {"term": "An ninh lương thực", "def": "Trạng thái mọi người dân luôn có đủ lương thực an toàn, giàu dinh dưỡng đáp ứng nhu cầu ăn uống lành mạnh."}
    ],
    "localExamples": [
      "Tại xã Vạn Linh (tỉnh Lạng Sơn), tính mùa vụ thể hiện rất rõ nét: vụ na Chi Lăng thu hoạch rộ trong khoảng tháng 7 - 9 âm lịch; thời gian còn lại người dân chăm sóc vườn, cắt tỉa cành, trồng xen canh rau màu và phát triển chăn nuôi gia cầm.",
      "Tiến bộ khoa học kĩ thuật đã giúp nông dân xã Vạn Linh thụ phấn nhân tạo cho hoa na, rải vụ thu hoạch na sớm và na muộn, giảm áp lực mùa vụ và nâng cao giá bán vượt trội."
    ],
    "takeaways": [
      "Đất là tư liệu sản xuất chủ yếu; đối tượng là sinh vật sống; sản xuất có tính mùa vụ.",
      "Khoa học công nghệ và thị trường là động lực hàng đầu giúp nông nghiệp vượt qua rào cản tự nhiên.",
      "Kinh nghiệm canh tác na gối vụ tại Chi Lăng (Lạng Sơn) là bài học thành công về ứng dụng kĩ thuật nông nghiệp."
    ]
  },

  # Bài 24
  {
    "num": 24,
    "id": "bai-24",
    "partId": "phan-3",
    "chapterId": "chuong-10",
    "topicId": "chuong-10",
    "title": "Bài 24. Địa lí ngành nông nghiệp",
    "subtitle": "Ngành trồng trọt: cây lương thực, cây công nghiệp, cây ăn quả và ngành chăn nuôi gia súc, gia cầm",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Cây lương thực (lúa gạo, lúa mì, ngô); cây công nghiệp (mía, củ cải đường, cà phê, cao su, chè); cây ăn quả; ngành chăn nuôi (bò, lợn, cừu, gia cầm); công thức tính năng suất và bình quân lương thực.",
    "calcConcept": "Tính năng suất cây trồng (tạ/ha = Sản lượng / Diện tích) hoặc sản lượng lương thực bình quân đầu người (kg/người = Sản lượng / Dân số)",
    "calcUnit": "tạ/ha",
    "objectives": [
      "Trình bày được vai trò và đặc điểm sinh thái, tình hình phân bố của các cây lương thực chủ yếu: lúa gạo, lúa mì, ngô.",
      "Phân biệt được vai trò, đặc điểm và phân bố của các nhóm cây công nghiệp (hàng năm, lâu năm) và cây ăn quả nhiệt đới, cận nhiệt.",
      "Trình bày vai trò, đặc điểm và phân bố của ngành chăn nuôi gia súc lớn (trâu, bò), gia súc nhỏ (lợn, cừu) và gia cầm.",
      "Tính toán thành thạo năng suất cây trồng, bình quân lương thực trên đầu người và liên hệ với vùng chuyên canh na Chi Lăng tại xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Ngành trồng trọt: Cây lương thực chính",
        "paragraphs": [
          "Cây lương thực là nguồn tinh bột nuôi sống nhân loại. Ba cây lương thực chủ lực chiếm hơn 80% sản lượng lương thực toàn cầu:",
          "- Lúa gạo: Cây ưa nhiệt ẩm, cần đất phù sa màu mỡ và nguồn nước dồi dào; phân bố chủ yếu ở khu vực nhiệt đới và cận nhiệt đới gió mùa châu Á (Trung Quốc, Ấn Độ, Việt Nam, Thái Lan).",
          "- Lúa mì: Cây ưa khí hậu ôn hòa, khô ráo hơn, đất màu mỡ (đất đen); phân bố ở vành đai ôn đới (Trung Quốc, Ấn Độ, Nga, Hoa Kỳ, Pháp).",
          "- Ngô: Cây có biên độ sinh thái rộng, chịu hạn tốt hơn; dùng làm lương thực cho người và thức ăn chăn nuôi gia súc; phân bố nhiều nhất ở châu Mĩ (Hoa Kỳ, Brazil, Trung Quốc)."
        ],
        "highlight": "Công thức tính năng suất cây trồng: Năng suất (tạ/ha) = Sản lượng (tạ) / Diện tích gieo trồng (ha). Bình quân lương thực (kg/người) = Sản lượng (kg) / Số dân (người)."
      },
      {
        "title": "2. Cây công nghiệp và cây ăn quả",
        "paragraphs": [
          "Cây công nghiệp: Cung cấp nguyên liệu cho công nghiệp chế biến và xuất khẩu. Cây lấy đường (mía ở nhiệt đới, củ cải đường ở ôn đới); Cây lấy dầu (đậu tương, cọ dầu, hướng dương); Cây lấy sợi (bông); Cây đồ uống (cà phê, chè, ca cao); Cây lấy mủ (cao su).",
          "Cây ăn quả: Phát triển mạnh mẽ gắn với nhu cầu nâng cao chất lượng cuộc sống và xuất khẩu. Cây ăn quả nhiệt đới (chuối, xoài, na, nhãn, dứa) và cận nhiệt/ôn đới (cam, táo, nho)."
        ]
      },
      {
        "title": "3. Ngành chăn nuôi",
        "paragraphs": [
          "Cung cấp thực phẩm giàu đạm (thịt, sữa, trứng), sức kéo và phân bón hữu cơ cho trồng trọt.",
          "Chăn nuôi phụ thuộc chặt chẽ vào cơ sở nguồn thức ăn (đồng cỏ tự nhiên hoặc hoa màu lương thực chế biến). Xu hướng chăn nuôi hiện đại là chuyển từ chăn thả tự nhiên sang chăn nuôi công nghiệp, trang trại tập trung ứng dụng công nghệ cao."
        ]
      }
    ],
    "terms": [
      {"term": "Năng suất cây trồng", "def": "Khối lượng sản phẩm thu hoạch được trên một đơn vị diện tích gieo trồng (thường tính bằng tạ/ha hoặc tấn/ha)."},
      {"term": "Bình quân lương thực đầu người", "def": "Số kilôgam lương thực quy đổi tính bình quân trên một đầu người dân trong một năm (kg/người/năm)."},
      {"term": "Vùng chuyên canh", "def": "Vùng lãnh thổ tập trung trồng một vài loại cây trồng hoặc nuôi một vài loại vật nuôi chủ đạo tạo ra khối lượng nông sản hàng hóa lớn."}
    ],
    "localExamples": [
      "Tại xã Chi Lăng và xã Vạn Linh (Lạng Sơn), vùng trồng na chuyên canh tập trung trên diện tích hơn 3.200 ha, trong đó xã Vạn Linh là một trong những trung tâm trọng điểm với năng suất na trung bình đạt từ 90 đến 105 tạ/ha, sản lượng hàng nghìn tấn mỗi vụ.",
      "Nông dân xã Vạn Linh đẩy mạnh mô hình trồng na theo tiêu chuẩn VietGAP, GlobalGAP, kết hợp nuôi lợn thịt an toàn sinh học và gà thả đồi trên nương để tận dụng phụ phẩm nông nghiệp."
    ],
    "takeaways": [
      "Lúa gạo, lúa mì, ngô là ba cây lương thực nuôi sống thế giới.",
      "Năng suất (tạ/ha) = Sản lượng / Diện tích; chỉ số phản ánh trình độ thâm canh nông nghiệp.",
      "Vùng na Chi Lăng (Lạng Sơn) là điển hình thành công của mô hình chuyên canh cây ăn quả đặc sản giá trị cao."
    ]
  }
]
print(f"Loaded {len(PART3_A_LESSONS)} lessons from Part 3-A.")
