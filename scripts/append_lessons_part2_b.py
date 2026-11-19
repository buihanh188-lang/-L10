# -*- coding: utf-8 -*-
"""
Appends Lessons 11 to 18 (Thủy quyển, Thổ nhưỡng, Sinh quyển, Quy luật địa lí)
Strict local scope constraint: Only Xã Vạn Linh, Khu vực Chi Lăng, Tỉnh Lạng Sơn.
"""

PART2_B_LESSONS = [
  # Bài 11
  {
    "num": 11,
    "id": "bai-11",
    "partId": "phan-2",
    "chapterId": "chuong-5",
    "topicId": "chuong-5",
    "title": "Bài 11. Thủy quyển, nước trên lục địa",
    "subtitle": "Vòng tuần hoàn của nước, các nguồn tiếp nước cho sông, chế độ dòng chảy và vai trò của nước ngọt",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm thủy quyển; vòng tuần hoàn nhỏ và vòng tuần hoàn lớn của nước; các nguồn cấp nước cho sông (mưa, băng tuyết, nước ngầm); chế độ dòng chảy; hồ, đầm, nước ngầm; bảo vệ tài nguyên nước ngọt.",
    "calcConcept": "Tính lưu lượng dòng chảy trung bình (m³/s), tổng lượng dòng chảy năm (W = Q × t), hoặc tỉ lệ lượng nước mùa lũ so với cả năm (%)",
    "calcUnit": "m³/s",
    "objectives": [
      "Khái quát được thành phần của thủy quyển và phân tích 2 vòng tuần hoàn nước trên Trái Đất.",
      "Phân tích được các nguồn cung cấp nước cho sông và các nhân tố ảnh hưởng đến chế độ dòng chảy (khí hậu, địa hình, thảm thực vật, hồ đầm).",
      "Trình bày vai trò của nước ngầm, hồ đầm và sự cần thiết phải bảo vệ nguồn nước ngọt.",
      "Tính toán được lưu lượng nước, tổng lượng dòng chảy và liên hệ với mạng lưới sông suối tại Chi Lăng và xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm thủy quyển và vòng tuần hoàn của nước",
        "paragraphs": [
          "Thủy quyển là lớp vỏ lỏng liên tục bao quanh Trái Đất, bao gồm nước mặn trong các biển, đại dương (chiếm 97,5%) và nước ngọt trên lục địa (chiếm 2,5%, phần lớn nằm ở dạng băng tuyết ở hai cực và đỉnh núi cao).",
          "Vòng tuần hoàn nhỏ: Nước biển bốc hơi -> ngưng tụ thành mây -> rơi thành mưa trên biển.",
          "Vòng tuần hoàn lớn: Nước biển bốc hơi -> gió đưa mây vào đất liền -> mưa rơi trên lục địa -> một phần ngấm xuống đất thành nước ngầm, một phần chảy tràn trên bề mặt thành sông suối đổ ra biển."
        ],
        "highlight": "Vòng tuần hoàn lớn của nước gắn kết đại dương và lục địa, duy trì sự sống và tái tạo liên tục nguồn nước ngọt."
      },
      {
        "title": "2. Nước trên lục địa: Sông ngòi và chế độ nước",
        "paragraphs": [
          "Sông là dòng nước chảy thường xuyên tương đối ổn định trên bề mặt lục địa. Lưu vực sông là phần lãnh thổ cung cấp nước thường xuyên cho sông.",
          "Các nguồn tiếp nước: Nước mưa (chế độ nước phụ thuộc chặt chẽ vào chế độ mưa); Băng tuyết tan (mùa lũ vào mùa xuân - hè khi băng tan); Nước ngầm (nguồn điều hòa dòng chảy quan trọng trong mùa cạn).",
          "Các nhân tố ảnh hưởng đến chế độ nước sông: Khí hậu (quyết định lưu lượng và mùa lũ); Địa hình (độ dốc địa hình làm lũ lên nhanh rút nhanh); Thảm thực vật (rừng điều hòa dòng chảy, hạn chế lũ quét); Hồ đầm (điều tiết lưu lượng)."
        ]
      },
      {
        "title": "3. Nước ngầm, hồ đầm và bảo vệ tài nguyên nước ngọt",
        "paragraphs": [
          "Nước ngầm nằm dưới bề mặt đất trong các tầng chứa nước, là nguồn cấp nước sinh hoạt và sản xuất quan trọng nhất cho con người.",
          "Nước ngọt chỉ chiếm tỉ lệ rất nhỏ và đang bị suy giảm nghiêm trọng do ô nhiễm và biến đổi khí hậu. Cần sử dụng tiết kiệm nước, bảo vệ rừng đầu nguồn và xử lí nước thải triệt để."
        ]
      }
    ],
    "terms": [
      {"term": "Thủy quyển (Hydrosphere)", "def": "Toàn bộ lớp vỏ nước bao quanh Trái Đất, gồm đại dương, sông ngòi, hồ đầm, băng tuyết, nước ngầm và hơi nước trong khí quyển."},
      {"term": "Lưu lượng dòng chảy (Q)", "def": "Khối lượng nước chảy qua mặt cắt ngang lòng sông tại một điểm đo trong một giây, đơn vị m³/s."},
      {"term": "Chế độ nước sông", "def": "Sự thay đổi về mực nước và lưu lượng nước của sông trong suốt chu kì một năm, gồm mùa lũ và mùa cạn."}
    ],
    "localExamples": [
      "Tại khu vực Chi Lăng (Lạng Sơn), sông Thương chảy qua thung lũng đá vôi, chế độ nước mùa lũ từ tháng 6 đến tháng 9 trùng với mùa mưa bão; mùa cạn từ tháng 10 đến tháng 5 năm sau.",
      "Ở xã Vạn Linh (tỉnh Lạng Sơn), các thung lũng đá vôi karst có hệ thống suối ngầm và nước ngầm dồi dào, người dân khoan giếng và đắp đập ngăn suối để lấy nước tưới cho các vườn na trong mùa khô."
    ],
    "takeaways": [
      "Nước ngọt trên Trái Đất rất hữu hạn (2,5%), chủ yếu nằm ở dạng băng tuyết và nước ngầm.",
      "Chế độ nước sông phụ thuộc vào khí hậu, địa hình, thảm thực vật và các nguồn tiếp nước.",
      "Bảo vệ rừng đầu nguồn tại Lạng Sơn có ý nghĩa sống còn trong việc giữ nước ngầm và hạn chế lũ quét cho Chi Lăng."
    ]
  },

  # Bài 12
  {
    "num": 12,
    "id": "bai-12",
    "partId": "phan-2",
    "chapterId": "chuong-5",
    "topicId": "chuong-5",
    "title": "Bài 12. Nước biển và đại dương",
    "subtitle": "Độ muối, nhiệt độ nước biển, các chuyển động của nước biển (sóng, thủy triều, hải lưu) và vai trò của đại dương",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Tính chất lí hóa của nước biển (độ muối 35‰, nhiệt độ); 3 dạng chuyển động của nước biển: sóng biển, thủy triều (triều cường, triều kém), dòng biển (nóng, lạnh); vai trò đại dương đối với khí hậu.",
    "calcConcept": "Tính khối lượng muối thu được từ thể tích nước biển theo độ muối phần nghìn hoặc tính áp suất thủy tĩnh theo độ sâu (P = P0 + h/10)",
    "calcUnit": "kg",
    "objectives": [
      "Trình bày được độ muối trung bình và nhiệt độ của nước biển; giải thích được sự thay đổi độ muối theo vĩ độ và nguồn nước sông đổ vào.",
      "Phân tích được nguyên nhân sinh ra sóng biển, sóng thần, hiện tượng thủy triều (triều cường, triều kém theo tuần trăng).",
      "Trình bày được hướng chuyển động của các dòng hải lưu nóng và lạnh trên đại dương thế giới và tác động của chúng đến khí hậu ven bờ.",
      "Tính toán được khối lượng muối biển kết tinh theo độ mặn và áp suất nước biển theo độ sâu."
    ],
    "keySections": [
      {
        "title": "1. Tính chất của nước biển và đại dương",
        "paragraphs": [
          "a) Độ muối của nước biển: Độ muối trung bình của đại dương thế giới là 35‰ (trong 1.000 g nước biển có 35 g muối hòa tan, chủ yếu là muối ăn NaCl). Độ muối thay đổi tùy thuộc vào lượng bốc hơi, lượng mưa và lượng nước ngọt từ các con sông đổ ra.",
          "b) Nhiệt độ nước biển: Nhiệt độ trung bình của lớp nước mặt đại dương là 17,5°C. Nhiệt độ giảm dần từ Xích đạo về hai cực và giảm dần theo độ sâu (dưới độ sâu 1.000 m nhiệt độ nước biển rất thấp, chỉ khoảng 0 - 3°C)."
        ],
        "highlight": "Công thức tính lượng muối kết tinh: Khối lượng muối = Thể tích nước biển × Khối lượng riêng × (Độ muối / 1000)."
      },
      {
        "title": "2. Các chuyển động của nước biển: Sóng, Thủy triều, Dòng biển",
        "paragraphs": [
          "a) Sóng biển: Là sự dao động tại chỗ của các phân tử nước biển, nguyên nhân chủ yếu do gió. Gió càng mạnh sóng càng to. Sóng thần sinh ra do động đất hoặc núi lửa ngầm dưới đáy biển.",
          "b) Thủy triều: Là hiện tượng dao động thường xuyên có chu kì của mực nước biển do lực hấp dẫn của Mặt Trăng và Mặt Trời kết hợp với lực li tâm của Trái Đất. Khi Mặt Trời, Mặt Trăng và Trái Đất thẳng hàng (ngày không trăng đầu tháng và ngày trăng tròn giữa tháng âm lịch) lực hút cộng hưởng lớn nhất sinh ra triều cường; khi vuông góc (ngày trăng khuyết mùng 7-8 và 22-23 âm lịch) sinh ra triều kém.",
          "c) Dòng biển (hải lưu): Là dòng chuyển động của khối nước biển theo một hướng xác định. Các dòng biển nóng làm tăng nhiệt độ và lượng mưa ven bờ; các dòng biển lạnh làm khí hậu ven bờ khô hạn, hình thành các hoang mạc ven biển."
        ]
      },
      {
        "title": "3. Vai trò của biển và đại dương đối với con người",
        "paragraphs": [
          "Điều hòa khí hậu toàn cầu, hấp thụ phần lớn khí CO2 và cung cấp hơn 50% lượng ôxy cho sinh quyển.",
          "Cung cấp nguồn tài nguyên hải sản phong phú, muối biển, khoáng sản đáy biển (dầu khí, sa khoáng, cát thủy tinh) và tiềm năng năng lượng sóng, thủy triều."
        ]
      }
    ],
    "terms": [
      {"term": "Độ muối (Salinity)", "def": "Tổng lượng các chất khoáng hòa tan (tính bằng gam) có trong 1 kilôgam (hoặc 1 lít) nước biển, kí hiệu ‰."},
      {"term": "Triều cường (Spring tide)", "def": "Thời kì thủy triều dâng cao nhất và lùi sâu nhất trong tháng, xảy ra khi Mặt Trời, Mặt Trăng và Trái Đất nằm trên cùng một đường thẳng."},
      {"term": "Dòng biển (Ocean Current)", "def": "Dòng chuyển động có hướng của các khối nước khổng lồ trong đại dương do tác động của các hệ thống gió thường xuyên."}
    ],
    "localExamples": [
      "Mặc dù tỉnh Lạng Sơn là tỉnh miền núi nội lục, nhưng các dòng hoàn lưu biển và gió mùa đông nam từ vịnh Bắc Bộ mang theo nguồn ẩm dồi dào, là nguồn gốc tạo nên các cơn mưa rào mùa hạ cho khu vực Chi Lăng và xã Vạn Linh.",
      "Sản phẩm muối biển từ các tỉnh duyên hải Bắc Bộ được vận chuyển qua tuyến đường huyết mạch Quốc lộ 1A lên Chi Lăng và xã Vạn Linh để phục vụ chế biến thực phẩm và chăn nuôi đại gia súc."
    ],
    "takeaways": [
      "Độ muối trung bình nước biển là 35‰; nhiệt độ nước biển giảm dần theo vĩ độ và độ sâu.",
      "Ba chuyển động của nước biển gồm sóng (do gió), thủy triều (do lực hấp dẫn thiên thể) và dòng biển (do gió thường xuyên).",
      "Đại dương đóng vai trò quyết định trong việc điều hòa chu trình khí hậu và cung cấp tài nguyên sinh học."
    ]
  },

  # Bài 13
  {
    "num": 13,
    "id": "bai-13",
    "partId": "phan-2",
    "chapterId": "chuong-5",
    "topicId": "chuong-5",
    "title": "Bài 13. Thực hành: Phân tích chế độ nước của sông Hồng",
    "subtitle": "Xử lí số liệu lưu lượng nước sông Hồng tại trạm Sơn Tây, tính toán tỉ lệ mùa lũ và giải thích mối quan hệ với khí hậu",
    "durationMinutes": 45,
    "isPractice": True,
    "scope": "Bảng số liệu lưu lượng nước sông Hồng theo 12 tháng tại trạm thủy văn Sơn Tây; tính lưu lượng trung bình năm; tính tổng lượng nước mùa lũ (tháng 6-10) và mùa cạn (tháng 11-5); tính tỉ lệ phần trăm mùa lũ.",
    "calcConcept": "Tính tỉ lệ phần trăm lưu lượng nước mùa lũ (tháng 6 đến tháng 10) so với tổng lưu lượng cả năm của sông Hồng tại trạm Sơn Tây",
    "calcUnit": "%",
    "objectives": [
      "Biết cách tính lưu lượng nước trung bình năm của sông từ bảng số liệu 12 tháng.",
      "Tính toán chính xác tỉ lệ phần trăm lượng nước mùa lũ (tháng 6 - 10) so với tổng lượng nước cả năm của sông Hồng tại trạm Sơn Tây.",
      "Vẽ biểu đồ đường hoặc biểu đồ cột thể hiện diễn biến lưu lượng nước sông Hồng trong năm.",
      "Giải thích được nguyên nhân sông Hồng có mùa lũ trùng với mùa mưa bão Bắc Bộ và liên hệ với chế độ sông suối tại Lạng Sơn."
    ],
    "keySections": [
      {
        "title": "1. Khái quát về hệ thống sông Hồng và trạm thủy văn Sơn Tây",
        "paragraphs": [
          "Sông Hồng (sông Thao) là hệ thống sông lớn nhất miền Bắc Việt Nam, bắt nguồn từ vùng núi Vân Nam (Trung Quốc) đổ ra vịnh Bắc Bộ. Diện tích lưu vực hơn 169.000 km².",
          "Trạm thủy văn Sơn Tây là trạm quan trắc khống chế toàn bộ dòng chảy trước khi sông Hồng tỏa vào vùng đồng bằng châu thổ Bắc Bộ, phản ánh chuẩn xác đặc tính thủy văn của cả lưu vực."
        ],
        "highlight": "Lưu vực sông Hồng có mạng lưới hình nan quạt, các phụ lưu sông Đà và sông Lô hợp lưu tại Việt Trì khiến nước lũ tập trung rất nhanh."
      },
      {
        "title": "2. Xử lí số liệu và đặc điểm chế độ nước sông Hồng",
        "paragraphs": [
          "Mùa lũ của sông Hồng kéo dài 5 tháng (từ tháng 6 đến tháng 10), chiếm từ 75% đến 80% tổng lượng nước cả năm. Tháng đỉnh lũ thường là tháng 8 trùng với thời kì mưa bão dồn dập nhất ở Bắc Bộ.",
          "Mùa cạn kéo dài 7 tháng (từ tháng 11 đến tháng 5 năm sau), chỉ chiếm từ 20% đến 25% tổng lượng nước cả năm. Tháng cạn nhất là tháng 3, khi dòng sông trơ đáy và thiếu nước ngọt phục vụ nông nghiệp."
        ]
      },
      {
        "title": "3. Phương pháp tính toán các chỉ số thủy văn",
        "paragraphs": [
          "1. Lưu lượng nước trung bình năm: Q_tb = (Tổng lưu lượng 12 tháng) / 12 (m³/s).",
          "2. Tổng lượng nước mùa lũ: Q_lũ = Q_tháng 6 + Q_tháng 7 + Q_tháng 8 + Q_tháng 9 + Q_tháng 10.",
          "3. Tỉ lệ % lượng nước mùa lũ: Tỉ lệ lũ = (Q_lũ / Q_cả năm) × 100%."
        ]
      }
    ],
    "terms": [
      {"term": "Trạm thủy văn", "def": "Cơ sở quan trắc chuyên môn đo đạc mực nước, lưu lượng nước, lượng phù sa và nhiệt độ nước sông theo thời gian thực."},
      {"term": "Mùa lũ sông Hồng", "def": "Thời kì lưu lượng nước sông Hồng vượt mức trung bình, diễn ra từ tháng 6 đến tháng 10 hàng năm."},
      {"term": "Đỉnh lũ", "def": "Thời điểm mực nước hoặc lưu lượng dòng chảy của sông đạt giá trị cao nhất trong một trận lũ hoặc trong cả năm (thường vào tháng 8)."}
    ],
    "localExamples": [
      "Tại tỉnh Lạng Sơn, sông Thương bắt nguồn từ vùng núi Chi Lăng có chế độ nước tương đồng với sông Hồng: mùa lũ từ tháng 6 đến tháng 9 do ảnh hưởng của cùng hoàn lưu gió mùa Đông Nam mưa nhiều.",
      "Sông Kỳ Cùng là con sông đặc biệt của Lạng Sơn chảy ngược theo hướng đông nam - tây bắc sang Trung Quốc; việc nghiên cứu chế độ nước sông Hồng giúp học sinh THPT Hòa Bình hiểu rõ quy luật thủy văn lưu vực sông vùng núi Chi Lăng."
    ],
    "takeaways": [
      "Mùa lũ sông Hồng kéo dài 5 tháng (tháng 6-10), chiếm khoảng 75 - 80% tổng lượng nước cả năm.",
      "Chế độ nước sông Hồng diễn biến ăn khớp hoàn toàn với mùa mưa bão của khí hậu miền Bắc.",
      "Nắm chắc kĩ năng tính tỉ lệ % mùa lũ và nhận xét biểu đồ lưu lượng nước."
    ]
  },

  # Bài 14
  {
    "num": 14,
    "id": "bai-14",
    "partId": "phan-2",
    "chapterId": "chuong-6",
    "topicId": "chuong-6",
    "title": "Bài 14. Đất trên Trái Đất",
    "subtitle": "Khái niệm đất, độ phì, các tầng đất và các nhân tố hình thành đất",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm đất, độ phì; phẫu diện đất (tầng thảm mục, tầng mùn, tầng tích tụ, tầng đá mẹ); 5 nhân tố hình thành đất (đá mẹ, khí hậu, sinh vật, địa hình, thời gian) và vai trò của con người.",
    "calcConcept": "Tính hàm lượng chất hữu cơ / mùn trong đất (%), tốc độ hình thành tầng đất mỏng theo thời gian hoặc độ dày tầng đất phong hóa (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "%",
    "objectives": [
      "Nêu được khái niệm đất (thổ nhưỡng) và đặc tính quan trọng nhất của đất là độ phì.",
      "Mô tả được các tầng của phẫu diện đất điển hình từ bề mặt xuống đá mẹ.",
      "Phân tích được vai trò của 5 nhân tố tự nhiên hình thành đất (đá mẹ, khí hậu, sinh vật, địa hình, thời gian) và vai trò của con người.",
      "Tính toán được hàm lượng mùn trong đất và giải thích đặc điểm đất feralit trên đá vôi tại khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm đất và độ phì của đất",
        "paragraphs": [
          "Đất (thổ nhưỡng) là lớp vật chất mỏng, tơi xốp bao phủ trên bề mặt các lục địa, được hình thành do sự biến đổi của đá dưới tác động của khí hậu, sinh vật và con người.",
          "Độ phì của đất là khả năng của đất cung cấp nước, chất dinh dưỡng, nhiệt độ và không khí cho cây trồng sinh trưởng và phát triển, mang lại năng suất mùa màng."
        ],
        "highlight": "Độ phì là đặc tính cơ bản nhất phân biệt đất với các vật thể tự nhiên khác như đá, cát thuần túy."
      },
      {
        "title": "2. Phẫu diện đất và các tầng đất chính",
        "paragraphs": [
          "Phẫu diện đất là mặt cắt thẳng đứng qua các tầng đất từ bề mặt xuống đến lớp đá mẹ nguyên vẹn.",
          "Gồm các tầng: Tầng thảm mục và lá rụng trên cùng -> Tầng mùn (chứa nhiều chất hữu cơ màu thẫm) -> Tầng rửa trôi -> Tầng tích tụ (tích tụ sét, sắt, nhôm) -> Tầng đá mẹ bị phong hóa -> Đá gốc."
        ]
      },
      {
        "title": "3. Các nhân tố hình thành đất",
        "paragraphs": [
          "a) Đá mẹ: Cung cấp vật chất vô cơ cho đất, quyết định thành phần khoáng vật, cơ cấu cấp hạt và tính chất lí hóa ban đầu của đất.",
          "b) Khí hậu: Nhiệt và ẩm phá hủy đá (phong hóa) và chi phối quá trình tích lũy, phân giải chất hữu cơ trong đất.",
          "c) Sinh vật: Cung cấp chất hữu cơ cho đất (thực vật cung cấp xác rác, vi sinh vật phân giải thành mùn, động vật đào bới làm đất tơi xốp).",
          "d) Địa hình: Ảnh hưởng đến độ dày tầng đất và sự phân phối nhiệt - ẩm. Vùng dốc đất bị xói mòn mạnh tầng mỏng; vùng trũng bằng phẳng tầng đất dày tích tụ nhiều phù sa.",
          "e) Thời gian (tuổi của đất): Thời gian từ khi bắt đầu hình thành đất đến nay. Đất nhiệt đới hình thành lâu đời có tầng phong hóa rất dày.",
          "f) Con người: Hoạt động làm tăng độ phì (bón phân hữu cơ, cày bừa thâm canh) hoặc làm suy thoái đất (phá rừng, đốt nương làm rẫy, dùng quá nhiều hóa chất)."
        ]
      }
    ],
    "terms": [
      {"term": "Đất (Thổ nhưỡng)", "def": "Lớp vật chất mỏng, tơi xốp trên bề mặt lục địa có khả năng tạo ra sinh khối thực vật nhờ độ phì."},
      {"term": "Độ phì của đất", "def": "Khả năng cung cấp nước, chất dinh dưỡng, không khí và nhiệt cho cây trồng sinh trưởng và phát triển."},
      {"term": "Đất Feralit", "def": "Nhóm đất chính của vùng nhiệt đới ẩm, giàu ôxít sắt và nhôm, có màu đỏ vàng đặc trưng."}
    ],
    "localExamples": [
      "Tại xã Vạn Linh và khu vực Chi Lăng (Lạng Sơn), loại đất chủ yếu là đất feralit phong hóa trên nền đá vôi (đất nâu đỏ và nâu vàng), có tầng đất mặt khá dày, giàu canxi và mùn hữu cơ, thoát nước tốt, là yếu tố thổ nhưỡng quyết định tạo nên chất lượng na Chi Lăng quả to, ngọt đậm.",
      "Bà con nông dân xã Vạn Linh tích cực bón phân chuồng ủ hoai mục và phân hữu cơ vi sinh, hạn chế phân hóa học để bảo vệ độ phì bền vững cho đất vườn na."
    ],
    "takeaways": [
      "Độ phì là đặc tính bản chất của đất.",
      "Đất được hình thành do tác động đồng thời của 5 nhân tố tự nhiên và nhân tố con người.",
      "Đất feralit trên đá vôi ở Chi Lăng (Lạng Sơn) là tài nguyên thổ nhưỡng quý giá cho cây ăn quả đặc sản."
    ]
  },

  # Bài 15
  {
    "num": 15,
    "id": "bai-15",
    "partId": "phan-2",
    "chapterId": "chuong-6",
    "topicId": "chuong-6",
    "title": "Bài 15. Sinh quyển",
    "subtitle": "Khái niệm sinh quyển, giới hạn, đặc điểm và các nhân tố ảnh hưởng đến sự phát triển và phân bố sinh vật",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm sinh quyển; giới hạn sinh quyển (nơi có sự sống từ tầng đối lưu xuống đáy đại dương và trong thạch quyển); các nhân tố ảnh hưởng: khí hậu (nhiệt, ẩm, ánh sáng), nước, đất, địa hình, sinh vật và con người.",
    "calcConcept": "Tính sinh khối thảm thực vật (tấn/ha), tỉ lệ độ che phủ sinh quyển theo đới vĩ độ hoặc tỉ lệ suy giảm diện tích rừng (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "tấn/ha",
    "objectives": [
      "Nêu được khái niệm sinh quyển và xác định được giới hạn của sinh quyển trên Trái Đất.",
      "Phân tích được vai trò và cơ chế tác động của các nhân tố tự nhiên (khí hậu, nước, đất, địa hình, sinh vật khác) đến sự phát triển và phân bố của sinh vật.",
      "Đánh giá được tác động tích cực và tiêu cực của con người đối với sinh quyển.",
      "Tính toán được sinh khối thực vật và phân tích đặc điểm hệ sinh thái rừng trên núi đá vôi tại Chi Lăng và xã Vạn Linh (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm và giới hạn của Sinh quyển",
        "paragraphs": [
          "Sinh quyển là quyển của Trái Đất có sự sống tồn tại và phát triển, bao gồm toàn bộ các cơ thể sinh vật (thực vật, động vật, vi sinh vật) cùng môi trường sống của chúng.",
          "Giới hạn của sinh quyển: Rộng lớn, bao gồm phần dưới của khí quyển (tầng đối lưu đến độ cao khoảng 20 - 22 km nơi có tầng ôdôn), toàn bộ thủy quyển (xuống tận đáy các vực thẳm đại dương sâu 11.000 m) và phần trên của thạch quyển (sâu vài chục mét đến vài trăm mét trong các tầng đất đá phong hóa). Sinh vật tập trung dày đặc nhất ở nơi tiếp giáp giữa các quyển gần bề mặt đất."
        ],
        "highlight": "Sinh vật phân bố tập trung dày đặc nhất ở nơi giao thoa giữa bề mặt đất, lớp không khí sát đất và tầng nước mặt đại dương."
      },
      {
        "title": "2. Các nhân tố ảnh hưởng đến sự phát triển và phân bố sinh vật",
        "paragraphs": [
          "a) Khí hậu: Là nhân tố chi phối mạnh mẽ nhất. Nhiệt độ và độ ẩm quyết định sự sinh trưởng, ranh giới phân bố của các loài; ánh sáng quyết định quá trình quang hợp của thực vật.",
          "b) Nước: Nước là thành phần cấu tạo tế bào và dung môi hòa tan chất dinh dưỡng; nơi nhiều nước sinh vật phát triển phong phú.",
          "c) Đất (thổ nhưỡng): Cung cấp chất khoáng và dinh dưỡng, các loại đất khác nhau phù hợp với các quần xã thực vật khác nhau.",
          "d) Địa hình: Độ cao và hướng sườn làm thay đổi nhiệt ẩm, sinh ra sự phân tầng thực vật theo đai cao.",
          "e) Mối quan hệ giữa các sinh vật: Cây ưa bóng sống dưới tán cây ưa sáng; động vật ăn cỏ gắn liền với đồng cỏ; động vật ăn thịt phân bố theo động vật ăn cỏ.",
          "f) Con người: Mở rộng vùng phân bố cây trồng vật nuôi hoặc thu hẹp diện tích rừng tự nhiên, làm tuyệt chủng nhiều loài sinh vật."
        ]
      },
      {
        "title": "3. Đa dạng sinh học và bảo vệ sinh quyển",
        "paragraphs": [
          "Sinh quyển cung cấp nguồn lương thực, thực phẩm, dược liệu, gỗ và điều hòa chu trình sinh hóa toàn cầu.",
          "Bảo vệ sinh quyển là bảo vệ nguồn gen quý, duy trì sự cân bằng sinh thái của Trái Đất."
        ]
      }
    ],
    "terms": [
      {"term": "Sinh quyển (Biosphere)", "def": "Quyển của Trái Đất có sự sống tồn tại, bao gồm sinh vật và môi trường sống của chúng."},
      {"term": "Quang hợp", "def": "Quá trình thực vật sử dụng năng lượng ánh sáng mặt trời để tổng hợp chất hữu cơ từ CO2 và nước, giải phóng khí ôxy."},
      {"term": "Đa dạng sinh học", "def": "Sự phong phú về nguồn gen, giống loài sinh vật và các hệ sinh thái khác nhau trên Trái Đất."}
    ],
    "localExamples": [
      "Tại khu vực Chi Lăng và xã Vạn Linh (Lạng Sơn), hệ sinh thái rừng trên núi đá vôi (karst) rất độc đáo với các loài cây chịu hạn, bám rễ sâu vào kẽ đá như nghiến, lim, dây leo và các loài động vật hoang dã như khỉ, sơn dương.",
      "Xã Vạn Linh tích cực trồng cây gây rừng, bảo vệ rừng phòng hộ đầu nguồn để giữ ẩm và điều hòa tiểu khí hậu cho các vùng chuyên canh na Chi Lăng."
    ],
    "takeaways": [
      "Sinh quyển có giới hạn rộng lớn, sinh vật tập trung dày nhất ở bề mặt đất và tầng nước mặt.",
      "Khí hậu là nhân tố quyết định sự phân bố sinh vật trên Trái Đất.",
      "Bảo tồn hệ sinh thái rừng trên núi đá vôi tại Lạng Sơn giúp gìn giữ nguồn gen và bảo vệ nguồn nước."
    ]
  },

  # Bài 16
  {
    "num": 16,
    "id": "bai-16",
    "partId": "phan-2",
    "chapterId": "chuong-6",
    "topicId": "chuong-6",
    "title": "Bài 16. Thực hành: Tìm hiểu sự phân bố đất và sinh vật trên Trái Đất",
    "subtitle": "Đọc bản đồ các nhóm đất chính và thảm thực vật chính trên Trái Đất, phân tích mối tương quan nhiệt - ẩm",
    "durationMinutes": 45,
    "isPractice": True,
    "scope": "Bản đồ phân bố các nhóm đất chính và thảm thực vật chính trên thế giới; quy luật địa đới thể hiện qua sự thay đổi từ xích đạo về cực của đất và thảm thực vật; tính toán tỉ lệ diện tích các nhóm đất.",
    "calcConcept": "Tính tỉ lệ phần trăm diện tích của nhóm đất feralit/đất đen/đất pốtdôn so với tổng diện tích đất lục địa (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "%",
    "objectives": [
      "Xác định được trên bản đồ sự phân bố các thảm thực vật chính và các nhóm đất chính từ Xích đạo về cực.",
      "Phân tích được mối tương quan mật thiết giữa khí hậu, thảm thực vật và đất trong từng đới tự nhiên.",
      "Tính toán được tỉ lệ phần trăm diện tích các nhóm đất chính trên lục địa.",
      "Liên hệ và giải thích sự phân bố đất feralit và rừng nhiệt đới gió mùa tại tỉnh Lạng Sơn."
    ],
    "keySections": [
      {
        "title": "1. Sự phân bố thảm thực vật chính trên Trái Đất",
        "paragraphs": [
          "Từ Xích đạo về cực, các thảm thực vật phân bố tương ứng với các đới khí hậu: Rừng mưa xích đạo và nhiệt đới -> Xavan và cây bụi nhiệt đới -> Hoang mạc và bán hoang mạc -> Rừng cận nhiệt ẩm -> Rừng lá cứng cận nhiệt Địa Trung Hải -> Thảo nguyên ôn đới -> Rừng lá rộng và rừng hỗn giao ôn đới -> Rừng lá kim (taiga) -> Đài nguyên (tundra) -> Hoang mạc cực."
        ],
        "highlight": "Thảm thực vật là tấm gương phản chiếu khí hậu; khí hậu thay đổi đến đâu thì thảm thực vật và đất thay đổi đến đó."
      },
      {
        "title": "2. Sự phân bố các nhóm đất chính trên Trái Đất",
        "paragraphs": [
          "Sự phân bố các nhóm đất trùng khớp với các đới khí hậu và thảm thực vật:",
          "- Đới nhiệt đới: Đất đỏ vàng feralit phát triển dưới rừng nhiệt đới; đất đỏ nâu xavan.",
          "- Đới cận nhiệt: Đất đỏ vàng cận nhiệt; đất nâu đỏ cận nhiệt Địa Trung Hải.",
          "- Đới ôn đới: Đất đen thảo nguyên ôn đới (loại đất phì nhiêu nhất); đất nâu xám rừng lá rộng; đất pốtdôn (podzol) rừng lá kim.",
          "- Đới cận cực và cực: Đất đài nguyên (đất gley hóa ngập nước mùa hè)."
        ]
      },
      {
        "title": "3. Mối tương quan thống nhất giữa Khí hậu - Thực vật - Đất",
        "paragraphs": [
          "Nhiệt và ẩm của khí hậu quyết định sự sinh trưởng của thảm thực vật; xác bã thực vật rụng xuống đất được vi sinh vật phân giải tạo nên tầng mùn và quyết định loại đất hình thành.",
          "Đây là biểu hiện sinh động của quy luật địa đới trong tự nhiên."
        ]
      }
    ],
    "terms": [
      {"term": "Thảm thực vật", "def": "Toàn bộ các quần xã thực vật phủ trên một vùng lãnh thổ nhất định."},
      {"term": "Đất Pốtdôn (Podzol)", "def": "Nhóm đất hình thành dưới rừng lá kim vùng ôn đới lạnh, có tầng rửa trôi màu xám nhạt như tro tàn."},
      {"term": "Đất đen thảo nguyên (Chernozem)", "def": "Loại đất giàu mùn và chất dinh dưỡng nhất thế giới, hình thành dưới thảm cỏ thảo nguyên ôn đới."}
    ],
    "localExamples": [
      "Tại tỉnh Lạng Sơn và khu vực Chi Lăng, khí hậu nhiệt đới gió mùa có mùa đông lạnh kết hợp với địa hình đồi núi dốc đã hình thành nhóm đất feralit đỏ vàng trên đá phiến sét và đất feralit nâu đỏ trên đá vôi, nâng đỡ thảm rừng kín nhiệt đới gió mùa rụng lá vào mùa khô.",
      "Ở xã Vạn Linh, sự phân bố đất theo địa hình rất rõ nét: trên sườn núi cao là đất feralit mỏng nhiều đá lẫn; dưới chân núi thung lũng là đất feralit bồi tụ dày, màu mỡ phục vụ canh tác."
    ],
    "takeaways": [
      "Đất và thực vật phân bố song hành tương ứng với các đới khí hậu trên Trái Đất.",
      "Nắm vững kĩ năng đọc bản đồ đất và thực vật, nhận biết mối quan hệ nhân - quả giữa nhiệt ẩm và sinh vật."
    ]
  },

  # Bài 17
  {
    "num": 17,
    "id": "bai-17",
    "partId": "phan-2",
    "chapterId": "chuong-7",
    "topicId": "chuong-7",
    "title": "Bài 17. Vỏ địa lí, quy luật thống nhất và hoàn chỉnh của vỏ địa lí",
    "subtitle": "Khái niệm vỏ địa lí, các thành phần và quy luật tác động qua lại thống nhất giữa các quyển",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Khái niệm vỏ địa lí (vỏ cảnh quan); giới hạn trên và dưới (khoảng 30-35 km); các thành phần xâm nhập vào nhau; nội dung quy luật thống nhất và hoàn chỉnh; ý nghĩa thực tiễn dự báo môi trường.",
    "calcConcept": "Tính hệ số cân bằng nhiệt ẩm (K = P / E) hoặc tính tốc độ bào mòn xói mòn sườn dốc khi lớp phủ rừng bị suy giảm (Số liệu giả định phục vụ ôn luyện)",
    "calcUnit": "lần",
    "objectives": [
      "Xác định được giới hạn và các thành phần cấu tạo nên vỏ địa lí (vỏ Trái Đất, khí quyển, thủy quyển, sinh quyển, thổ nhưỡng).",
      "Trình bày và giải thích được nội dung của quy luật thống nhất và hoàn chỉnh của vỏ địa lí.",
      "Nêu được ý nghĩa thực tiễn của quy luật: khi tác động vào một thành phần tự nhiên phải dự báo trước các biến đổi dây chuyền của các thành phần khác.",
      "Vận dụng quy luật giải thích hậu quả của việc phá rừng đầu nguồn đối với sông suối, xói mòn đất và nguy cơ sạt lở đá tại Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Khái niệm và giới hạn của Vỏ địa lí",
        "paragraphs": [
          "Vỏ địa lí (vỏ cảnh quan) là lớp vỏ của Trái Đất ở đó các quyển (thạch quyển, khí quyển, thủy quyển, sinh quyển và thổ nhưỡng quyển) cùng tiếp xúc, xâm nhập và tác động tương hỗ lẫn nhau.",
          "Giới hạn của vỏ địa lí: Giới hạn trên là giới hạn của tầng đối lưu (nơi có mây, mưa, khí hậu); giới hạn dưới là đáy của lớp vỏ phong hóa trong thạch quyển (sâu vài chục mét). Chiều dày tổng cộng khoảng 30 - 35 km. Vỏ địa lí hẹp hơn nhiều so với thạch quyển nhưng là nơi diễn ra mọi quá trình địa lí liên quan mật thiết đến con người."
        ],
        "highlight": "Vỏ địa lí dày khoảng 30 - 35 km, là nơi giao thoa và tương tác sâu sắc giữa 5 quyển tự nhiên."
      },
      {
        "title": "2. Quy luật thống nhất và hoàn chỉnh của vỏ địa lí",
        "paragraphs": [
          "Nội dung quy luật: Là quy luật về mối quan hệ quy định lẫn nhau giữa các thành phần và giữa các bộ phận lãnh thổ của vỏ địa lí. Trong vỏ địa lí, mỗi thành phần không tồn tại biệt lập mà liên kết chặt chẽ với nhau. Khi một thành phần bị thay đổi sẽ kéo theo sự thay đổi của các thành phần còn lại và dẫn tới sự biến đổi của toàn bộ cảnh quan tự nhiên.",
          "Cơ chế: Các dòng vật chất và năng lượng không ngừng luân chuyển giữa các quyển (vòng tuần hoàn nước, chu trình cacbon, chu trình nitơ)."
        ]
      },
      {
        "title": "3. Ý nghĩa thực tiễn sâu sắc của quy luật",
        "paragraphs": [
          "Trước khi tiến hành bất kì hoạt động can thiệp nào vào tự nhiên (xây đập thủy điện, khai thác mỏ đá vôi, mở đường giao thông, khai hoang rừng), con người phải nghiên cứu kĩ lưỡng và dự báo trước những hậu quả dây chuyền có thể xảy ra đối với môi trường sinh thái.",
          "Phát triển kinh tế phải đi đôi với bảo vệ cân bằng sinh thái, không vì lợi ích trước mắt mà phá vỡ trật tự thống nhất của tự nhiên."
        ]
      }
    ],
    "terms": [
      {"term": "Vỏ địa lí (Geographical Envelope)", "def": "Lớp vỏ phức hợp của Trái Đất có chiều dày khoảng 30 - 35 km, nơi các quyển tiếp xúc, thâm nhập và tác động qua lại tạo nên môi trường sống của loài người."},
      {"term": "Quy luật thống nhất và hoàn chỉnh", "def": "Quy luật về mối quan hệ quy định lẫn nhau giữa các thành phần tự nhiên, trong đó sự thay đổi của một thành phần tất yếu kéo theo sự biến đổi của các thành phần khác."},
      {"term": "Biến đổi dây chuyền", "def": "Hiện tượng một tác động ban đầu vào một yếu tố môi trường kích hoạt hàng loạt phản ứng biến đổi tiếp theo ở các yếu tố khác trong hệ sinh thái."}
    ],
    "localExamples": [
      "Bài học thực tiễn tại khu vực Chi Lăng (Lạng Sơn): Nếu rừng đầu nguồn trên các khối núi đá vôi bị chặt phá -> nước mưa rơi xuống không được giữ lại -> xói mòn trơ sỏi đá -> mạch nước ngầm cạn kiệt trong mùa khô -> thiếu nước tưới cho na Chi Lăng tại xã Vạn Linh -> mùa mưa sinh ra lũ quét và sạt lở đá lăn xuống khu dân cư.",
      "Nhận thức rõ quy luật này, Đảng bộ và nhân dân xã Vạn Linh luôn kết hợp trồng na với trồng rừng bảo vệ độ ẩm đất và mạch nước ngầm."
    ],
    "takeaways": [
      "Vỏ địa lí là thể tổng hợp hoàn chỉnh của 5 quyển tự nhiên dày khoảng 30-35 km.",
      "Một thành phần thay đổi sẽ kéo theo sự thay đổi của toàn bộ hệ thống tự nhiên.",
      "Cần dự báo tác động môi trường trước mọi dự án kinh tế tại Lạng Sơn để bảo tồn cân bằng sinh thái."
    ]
  },

  # Bài 18
  {
    "num": 18,
    "id": "bai-18",
    "partId": "phan-2",
    "chapterId": "chuong-7",
    "topicId": "chuong-7",
    "title": "Bài 18. Quy luật địa đới và quy luật phi địa đới",
    "subtitle": "Quy luật phân bố tự nhiên theo vĩ độ (địa đới) và theo đai cao, lục địa - đại dương (phi địa đới)",
    "durationMinutes": 45,
    "isPractice": False,
    "scope": "Nguyên nhân, biểu hiện của quy luật địa đới (các đới bức xạ, khí áp, gió, khí hậu, đất, sinh vật từ xích đạo về cực); nguyên nhân, biểu hiện của quy luật phi địa đới (quy luật đai cao và quy luật địa ô).",
    "calcConcept": "Tính sự thay đổi nhiệt độ theo vĩ độ địa lí (địa đới) hoặc tính nhiệt độ và xác định ranh giới đai cao tự nhiên theo độ cao địa hình (phi địa đới)",
    "calcUnit": "°C",
    "objectives": [
      "Trình bày được khái niệm, nguyên nhân và các biểu hiện của quy luật địa đới trong tự nhiên.",
      "Trình bày được khái niệm, nguyên nhân và các biểu hiện của quy luật phi địa đới (gồm quy luật đai cao và quy luật địa ô).",
      "So sánh được sự khác biệt giữa quy luật địa đới và phi địa đới; nhận thức được sự phối hợp đồng thời của 2 quy luật trên bề mặt lãnh thổ.",
      "Tính toán được nhiệt độ theo vĩ độ và theo đai cao, giải thích sự phân tầng thực vật trên núi đá vôi ở Chi Lăng (Lạng Sơn)."
    ],
    "keySections": [
      {
        "title": "1. Quy luật Địa đới",
        "paragraphs": [
          "Khái niệm: Là sự thay đổi có quy luật của tất cả các thành phần địa lí và cảnh quan địa lí theo vĩ độ (từ Xích đạo về hai cực).",
          "Nguyên nhân: Do Trái Đất hình cầu và trục nghiêng không đổi phương, làm cho góc nhập xạ của tia sáng mặt trời giảm dần từ Xích đạo về hai cực, lượng bức xạ mặt trời phân bố theo đới.",
          "Biểu hiện: Sự phân bố theo đới của bức xạ mặt trời -> 7 đai khí áp và các đới gió -> 7 đới khí hậu -> các đới đất và các thảm thực vật chính trên Trái Đất."
        ],
        "highlight": "Quy luật địa đới là quy luật phổ biến nhất, chi phối sự phân bố không gian vĩ mô của tự nhiên từ Xích đạo về cực."
      },
      {
        "title": "2. Quy luật Phi địa đới",
        "paragraphs": [
          "Khái niệm: Là quy luật phân bố không phụ thuộc vào tính chất phân bố theo địa đới của các thành phần địa lí và cảnh quan địa lí.",
          "Nguyên nhân: Do nguồn năng lượng nội lực bên trong Trái Đất tạo nên sự phân chia bề mặt thành lục địa, đại dương và địa hình núi cao.",
          "Biểu hiện:",
          "- Quy luật đai cao: Sự thay đổi có quy luật của các thành phần và cảnh quan địa lí theo độ cao địa hình (do càng lên cao nhiệt độ giảm 0,6°C/100m, độ ẩm thay đổi sinh ra các đai thực vật và đai đất theo độ cao).",
          "- Quy luật địa ô: Sự thay đổi có quy luật của các thành phần và cảnh quan địa lí theo kinh độ (từ duyên hải ven biển vào sâu trong nội địa do sự phân bố lục địa - đại dương làm lượng mưa giảm dần)."
        ]
      },
      {
        "title": "3. Mối quan hệ giữa quy luật địa đới và phi địa đới",
        "paragraphs": [
          "Quy luật địa đới và quy luật phi địa đới diễn ra đồng thời và tác động tương hỗ lẫn nhau.",
          "Quy luật địa đới tạo nên nền tảng phân bố chung theo vĩ độ; quy luật phi địa đới làm biến tính, chi tiết hóa và tạo nên sự đa dạng phức tạp của cảnh quan thiên nhiên trên từng vùng lãnh thổ cụ thể."
        ]
      }
    ],
    "terms": [
      {"term": "Quy luật địa đới (Zonality)", "def": "Sự thay đổi có quy luật của các thành phần địa lí và cảnh quan theo vĩ độ từ Xích đạo về hai cực do sự giảm dần góc nhập xạ."},
      {"term": "Quy luật phi địa đới (Azonal)", "def": "Sự phân bố của các thành phần tự nhiên không phụ thuộc vào vĩ độ mà do tác động của độ cao địa hình (đai cao) và khoảng cách xa biển (địa ô)."},
      {"term": "Quy luật đai cao", "def": "Sự thay đổi của nhiệt ẩm, đất đai và sinh vật theo độ cao địa hình núi, tương tự như sự thay đổi từ vĩ độ thấp lên vĩ độ cao."}
    ],
    "localExamples": [
      "Theo quy luật địa đới, tỉnh Lạng Sơn nằm trong đới khí hậu nhiệt đới gió mùa có mùa đông lạnh; nhưng theo quy luật phi địa đới (đai cao), các đỉnh núi cao trên 800 - 1.000 m ở Lạng Sơn lại xuất hiện đai cận nhiệt đới trên núi với các loài thực vật dẻ, re và có sương muối vào mùa đông.",
      "Tại các thung lũng karst kín ở xã Vạn Linh và xã Chi Lăng, hiện tượng nghịch nhiệt vào ban đêm mùa đông (không khí lạnh nặng chìm xuống đáy thung lũng) là biểu hiện vi khí hậu phi địa đới độc đáo."
    ],
    "takeaways": [
      "Quy luật địa đới do bức xạ mặt trời (ngoại lực) chi phối theo chiều vĩ độ.",
      "Quy luật phi địa đới do nội lực tạo địa hình núi cao (đai cao) và lục địa - đại dương (địa ô) chi phối.",
      "Thiên nhiên Việt Nam và Lạng Sơn mang tính chất nhiệt đới ẩm gió mùa (địa đới) nhưng có sự phân hóa sâu sắc theo đai cao đồi núi (phi địa đới)."
    ]
  }
]
print(f"Loaded {len(PART2_B_LESSONS)} lessons from Part 2-B (Lessons 11-18).")
