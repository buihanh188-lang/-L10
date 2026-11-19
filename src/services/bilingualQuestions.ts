import { Question } from '../types';
import {
  LESSONS_EN,
  lookupLessonEnglish,
  lookupLessonEnglishEmbedded,
} from '../data/bilingualLessonsEn';
import { DISCOVERY_QUESTIONS_EN } from '../data/bilingualDiscoveryEn';
import {
  ENGLISH_UNITS_MAP,
  localizeShortAnswerCurriculum,
} from '../data/bilingualShortAnswersEn';

/**
 * BILINGUAL QUESTION & ASSESSMENT LOCALIZATION SERVICE
 * 100% deterministic template + lesson-dictionary translation into academic English
 * with ZERO partial regex word-swapping, strictly preserving:
 * - correct answers (correctIndex, isCorrect, standardAnswer, pairs, acceptedAnswers)
 * - numerical datasets, units, formulas, and cognitive levels
 * - original Vietnamese content untouched when lang === 'vi'
 */

// Exact English translations for all 32 fixed non-lesson MC options & distractors
const MC_NON_LESSON_OPTIONS_EN: Record<string, string> = {
  'Quy trình khai thác tài nguyên thiên nhiên nhằm tối đa hóa lợi nhuận mà không xét đến giới hạn sinh thái.':
    'A process of extracting natural resources solely to maximize profit without considering ecological limits.',
  'Hiện tượng tự nhiên chỉ xuất hiện cục bộ ở vùng cực, hoàn toàn không có tính phổ biến trong vỏ Trái Đất.':
    'A natural phenomenon occurring solely in polar regions without broad prevalence across Earth’s crust.',
  'Sự biến đổi ngẫu nhiên của các thành phần địa lí không tuân theo các quy luật tự nhiên và quy luật kinh tế.':
    'Random fluctuations of geographic components operating independently of natural and economic laws.',
  'Trạng thái tĩnh tại bất biến của vỏ Trái Đất, không chịu tác động của nội lực hay ngoại lực.':
    'An unchanging, static state of Earth’s crust unaffected by endogenic or exogenic forces.',
  'Quá trình phát triển kinh tế tự phát không cần quy hoạch không gian và đánh giá tác động môi trường.':
    'Spontaneous economic growth proceeding without spatial planning or environmental impact assessment.',
  'Sự phân bố đồng nhất không có sự phân hóa theo vĩ độ hay độ cao địa hình của các hiện tượng địa lí.':
    'Uniform distribution of geographic phenomena showing no differentiation by latitude or elevation.',
  'Chỉ có ý nghĩa lí luận thuần túy trong nghiên cứu hàn lâm, không có khả năng ứng dụng thực tế.':
    'Purely theoretical interest in academic research with no practical real-world application.',
  'Là giải pháp kỹ thuật tạm thời, không có mối liên hệ với chiến lược phát triển kinh tế bền vững.':
    'A temporary technical measure unrelated to sustainable economic development strategies.',
  'Tạo ra sự biến đổi cục bộ làm triệt tiêu hoàn toàn mối quan hệ tương hỗ giữa tự nhiên và xã hội.':
    'Produces localized changes that completely eliminate mutual interactions between nature and society.',
  'Các thành phần địa lí tồn tại biệt lập, không có sự trao đổi vật chất và năng lượng với môi trường xung quanh.':
    'Geographic components exist in isolation, exchanging neither matter nor energy with their surroundings.',
  'Con người có thể làm thay đổi hoàn toàn các quy luật tự nhiên mà không cần thích ứng với hoàn cảnh cụ thể.':
    'Humanity can wholly rewrite natural laws without adapting to specific environmental conditions.',
  'Quá trình địa lí chỉ diễn ra theo một chiều cố định, không có các chu trình tuần hoàn vật chất tự nhiên.':
    'Geographic processes proceed strictly one-way without natural cycles of matter and energy.',
  'Sự tác động ngẫu nhiên của các yếu tố bên ngoài hệ Mặt Trời mà không do nội lực hay ngoại lực Trái Đất.':
    'Random influence from extrasolar factors unrelated to Earth’s internal endogenic or surface exogenic forces.',
  'Sự tuyệt đối hóa vai trò của điều kiện địa hình đơn lẻ, bỏ qua vai trò của khí hậu và hoạt động con người.':
    'Overstating the role of isolated relief conditions while ignoring climate and human activity.',
  'Sự suy giảm đồng thời của mọi nguồn tài nguyên thiên nhiên trên toàn bộ bề mặt Trái Đất cùng lúc.':
    'Simultaneous uniform depletion of every natural resource across Earth’s entire surface.',
  'Khuyến khích khai thác cạn kiệt tài nguyên trước mắt để thúc đẩy tăng trưởng kinh tế ngắn hạn.':
    'Encourages exhaustive immediate resource extraction to boost short-term economic gains.',
  'Phủ nhận sự cần thiết của việc hợp tác khu vực và quốc tế trong quản lí môi trường và ứng phó thiên tai.':
    'Denies the necessity of regional and international cooperation in environmental management and disaster response.',
  'Hạn chế ứng dụng công nghệ viễn thám, GIS và chuyển đổi số trong công tác điều tra cơ bản tài nguyên.':
    'Restricts remote sensing, GIS, and digital transformation in baseline natural resource surveys.',
  'Ghi nhớ máy móc các số liệu thống kê đơn lẻ mà không cần hiểu mối quan hệ nhân quả không gian.':
    'Rote memorization of isolated figures without understanding spatial cause-and-effect relationships.',
  'Chỉ cần nắm vững kiến thức lí thuyết mà không cần liên hệ thực tế địa phương và định hướng nghề nghiệp.':
    'Mastering abstract theory alone without connecting to local reality or career orientation.',
  'Tuyệt đối hóa vai trò của tự nhiên và xem nhẹ năng lực thích ứng sáng tạo của xã hội loài người.':
    'Treating nature as absolute determinism while dismissing humanity’s creative adaptive capacity.',
  'Ưu tiên phát triển công nghiệp nặng và khai khoáng mà không cần đánh giá tác động môi trường.':
    'Prioritizing heavy industry and mining expansion without conducting environmental impact assessments.',
  'Xem tự nhiên là đối tượng cần phải chinh phục hoàn toàn bằng mọi biện pháp kỹ thuật nhân tạo.':
    'Viewing nature purely as an object to conquer unconditionally through artificial engineering.',
  'Cô lập các vùng lãnh thổ để tự cung tự cấp, không tham gia vào chuỗi liên kết kinh tế vùng và quốc gia.':
    'Isolating regions in closed self-sufficiency outside regional and national economic linkages.',
  'Tôn trọng các quy luật khách quan, kết hợp hài hòa giữa phát triển kinh tế với bảo vệ môi trường sinh thái.':
    'Respecting objective natural laws and harmonizing economic growth with ecological conservation.',
  'Chủ động tìm hiểu quy luật tự nhiên - kinh tế, có ý thức bảo vệ môi trường và định hướng nghề nghiệp phù hợp.':
    'Proactively studying natural–economic laws, practicing environmental stewardship, and choosing fitting career paths.',
  'Tham gia vào các hoạt động khai thác tài nguyên tự phát khi chưa được cơ quan có thẩm quyền cấp phép.':
    'Engaging in unregulated resource extraction without authorization from competent agencies.',
  'Không cần quan tâm đến các cảnh báo thiên tai, thời tiết cực đoan và quy hoạch sử dụng đất tại địa phương.':
    'Disregarding natural hazard warnings, extreme weather alerts, and local land-use plans.',
  'Từ chối học tập và ứng dụng các công cụ địa lí số như bản đồ trực tuyến, ảnh viễn thám và thiết bị định vị.':
    'Refusing to learn or apply digital geographic tools such as online maps, satellite imagery, and GPS.',
  'Tỉnh Lạng Sơn hoàn toàn không có điều kiện phát triển nông nghiệp hàng hóa và kinh tế cửa khẩu biên giới.':
    'Lang Son province completely lacks conditions for commercial agriculture and cross-border gate trade.',
  'Địa bàn xã Chi Lăng chỉ tập trung khai thác quặng bô-xít quy mô lớn và không chú trọng phát triển cây ăn quả đặc sản.':
    'Chi Lang commune focuses exclusively on large-scale bauxite mining rather than specialty orchard fruit cultivation.',
  'Mạng lưới giao thông và cửa khẩu quốc tế tại Lạng Sơn không có mối liên hệ với phân bố không gian kinh tế vùng.':
    'Lang Son’s transport network and international border gates bear no relation to regional spatial economic patterns.',
};

// Specialized English versions of the 15 Skill Calculation Questions
const SKILL_CALC_QUESTIONS_EN: Record<string, Partial<Question>> = {
  'q-calc-01': {
    question: `Given the statistical data table:
GDP STRUCTURE BY ECONOMIC SECTOR OF SELECTED COUNTRIES IN 2022
(Unit: Billion USD)
┌──────────────┬──────────────────────┬────────────────────────┬──────────┬──────────┐
│   Country    │ Agriculture-Forestry │  Industry-Construction │ Services │ Total GDP│
├──────────────┼──────────────────────┼────────────────────────┼──────────┼──────────┤
│ Country X    │         35.0         │         125.0          │  240.0   │  400.0   │
│ Country Y    │          4.0         │          76.0          │  120.0   │  200.0   │
└──────────────┴──────────────────────┴────────────────────────┴──────────┴──────────┘
Based on the table above, what was the percentage share of the service sector in the total GDP of Country X in 2022?`,
    options: ['60.0%', '31.3%', '8.8%', '55.0%'],
    explanation: 'Calculation formula: Share of Service Sector = (Service Sector Value / Total GDP) × 100% = (240.0 / 400.0) × 100% = 60.0%.',
    referenceData: 'Country X: Services = 240.0 billion USD; Total GDP = 400.0 billion USD.',
  },
  'q-calc-02': {
    question: `Given the statistical data table:
AREA AND POPULATION OF SELECTED LOCALITIES IN 2023
┌──────────────┬──────────────────┬──────────────────────┐
│   Locality   │    Area (km²)    │ Population (thousand)│
├──────────────┼──────────────────┼──────────────────────┤
│ Locality A   │      2,500       │        1,250         │
│ Locality B   │      4,000       │          600         │
└──────────────┴──────────────────┴──────────────────────┘
Based on the data table, what was the population density of Locality A in 2023?`,
    options: ['2 people/km²', '500 people/km²', '150 people/km²', '200 people/km²'],
    explanation: 'Convert population of Locality A: 1,250 thousand = 1,250,000 people. Population density = Population / Area = 1,250,000 people / 2,500 km² = 500 people/km².',
    referenceData: 'Locality A: Area = 2,500 km²; Population = 1,250 thousand people.',
  },
  'q-calc-03': {
    question: `Given the statistical data table:
GRAIN FOOD PRODUCTION OF A NATION FROM 2015 TO 2023
(Unit: Million metric tons)
┌────────────┬─────────┬─────────┬─────────┬─────────┐
│    Year    │  2015   │  2018   │  2020   │  2023   │
├────────────┼─────────┼─────────┼─────────┼─────────┤
│ Production │  40.0   │  44.0   │  47.2   │  52.0   │
└────────────┴─────────┴─────────┴─────────┴─────────┘
Taking 2015 as the base year (2015 = 100%), what was the growth rate of grain production of this nation in 2023?`,
    options: ['130.0%', '118.0%', '30.0%', '125.0%'],
    explanation: 'Growth rate formula with base year 2015 = 100%: Growth Rate (2023) = (Production 2023 / Production 2015) × 100% = (52.0 / 40.0) × 100% = 130.0%.',
    referenceData: 'Base year 2015: 40.0 million tons; Year 2023: 52.0 million tons.',
  },
  'q-calc-04': {
    question: `Given the statistical data table:
MONTHLY MEAN TEMPERATURE AT A METEOROLOGICAL STATION (Unit: °C)
┌──────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│  Month   │  1   │  2   │  3   │  4   │  5   │  6   │  7   │  8   │  9   │  10  │  11  │  12  │
├──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ Temp (°C)│ 16.4 │ 17.2 │ 20.0 │ 24.1 │ 27.5 │ 28.9 │ 29.2 │ 28.6 │ 27.1 │ 24.8 │ 21.3 │ 17.8 │
└──────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
Based on the table above, what is the annual temperature range of this meteorological station?`,
    options: ['12.8°C', '29.2°C', '16.4°C', '14.2°C'],
    explanation: 'The highest mean monthly temperature is in July (29.2°C), lowest in January (16.4°C). Annual temperature range = Tmax - Tmin = 29.2°C - 16.4°C = 12.8°C.',
    referenceData: 'Tmax = 29.2°C (July); Tmin = 16.4°C (January).',
  },
  'q-calc-05': {
    question: `Given the statistical data table:
MERCHANDISE EXPORT AND IMPORT VALUES OF VIETNAM IN 2022
(Unit: Billion USD)
┌────────────┬──────────┐
│ Indicator  │ Year 2022│
├────────────┼──────────┤
│ Exports    │  371.3   │
│ Imports    │  358.9   │
└────────────┴──────────┘
Based on the data table above, what was the merchandise trade balance of Vietnam in 2022?`,
    options: [
      'Trade surplus of 12.4 billion USD',
      'Trade deficit of 12.4 billion USD',
      'Trade surplus of 730.2 billion USD',
      'Trade deficit of 358.9 billion USD',
    ],
    explanation: 'Trade Balance = Export Value - Import Value = 371.3 - 358.9 = +12.4 billion USD. Since the value is positive (> 0), Vietnam achieved a trade surplus of 12.4 billion USD.',
    referenceData: 'Exports: 371.3 billion USD; Imports: 358.9 billion USD.',
  },
  'q-calc-06': {
    question: `Given the statistical data table:
PASSENGER TRAFFIC VOLUME BY TRANSPORTATION MODE
(Unit: Million passenger trips)
┌────────────────┬──────────┬──────────┐
│ Transport Mode │ Year 2018│ Year 2023│
├────────────────┼──────────┼──────────┤
│ Road transport │ 3,200.0  │ 4,480.0  │
│ Air transport  │    50.0  │    85.0  │
└────────────────┴──────────┴──────────┘
Which of the following statements is correct regarding passenger traffic dynamics in 2023 compared to 2018?`,
    options: [
      'Road transport had a larger absolute increase, whereas air transport had a faster growth rate',
      'Air transport had a larger absolute increase in passengers than road transport',
      'Road transport experienced a faster growth rate than air transport',
      'Both transport modes experienced a decrease in passenger traffic volume over the period',
    ],
    explanation: 'Absolute increase: Road transport increased by 4,480.0 - 3,200.0 = 1,280.0 million passengers; Air transport increased by 85.0 - 50.0 = 35.0 million passengers (Road had a larger absolute increase). Growth rate: Road = 4,480 / 3,200 = 140.0%; Air = 85 / 50 = 170.0% (Air grew faster).',
    referenceData: 'Road: +1,280.0 million (140.0%); Air: +35.0 million (170.0%).',
  },
  'q-calc-07': {
    question: `Given the statistical data table:
FOREST AREA OF A NATION FROM 2010 TO 2022
(Unit: Million hectares)
┌───────────────────┬──────┬──────┬──────┬──────┬──────┐
│       Year        │ 2010 │ 2015 │ 2018 │ 2020 │ 2022 │
├───────────────────┼──────┼──────┼──────┼──────┼──────┤
│ Natural forest    │ 10.3 │ 10.2 │ 10.3 │ 10.3 │ 10.1 │
│ Planted forest    │  3.1 │  3.9 │  4.2 │  4.4 │  4.7 │
│ Total forest area │ 13.4 │ 14.1 │ 14.5 │ 14.7 │ 14.8 │
└───────────────────┴──────┴──────┴──────┴──────┴──────┘
According to the table above, which of the following statements accurately reflects forest area trends from 2010 to 2022?`,
    options: [
      'Total forest area expanded continuously, primarily driven by rapid growth in planted forests',
      'Natural forest area expanded rapidly and continuously across all recorded periods',
      'Planted forest area declined steadily over successive intervals',
      'Total forest area contracted due to severe natural deforestation',
    ],
    explanation: 'Total forest area increased continuously from 13.4 million ha to 14.8 million ha. Planted forests increased significantly from 3.1 to 4.7 million ha (+1.6 million ha), while natural forests fluctuated slightly from 10.3 to 10.1 million ha.',
    referenceData: 'Total forest expanded continuously from 13.4 (2010) to 14.8 million ha (2022).',
  },
  'q-calc-08': {
    question: `Given the statistical data table:
PERCENTAGE STRUCTURE OF EXPORT AND IMPORT VALUES OF VIETNAM IN 2015 AND 2022
(Unit: %)
┌──────┬─────────┬─────────┬─────────┐
│ Year │ Exports │ Imports │  Total  │
├──────┼─────────┼─────────┼─────────┤
│ 2015 │  49.8   │  50.2   │  100.0  │
│ 2022 │  50.9   │  49.1   │  100.0  │
└──────┴─────────┴─────────┴─────────┘
To represent the structural change of export and import values in Vietnam across the 2 years 2015 and 2022, which chart type is most appropriate?`,
    options: ['Pie chart', 'Line chart', 'Area chart', 'Combination chart'],
    explanation: 'The data indicates percentage share (%) of a whole across 2 years (<= 3 years). Therefore, a pie chart is the most appropriate visual representation.',
    referenceData: 'Percentage share data (%) in 2 distinct years (2015 and 2022).',
  },
  'q-calc-09': {
    contextTitle: 'GDP Sectoral Structure: Developed vs. Developing Countries',
    contextText: 'Statistical data on GDP percentage structure by economic sectors for Developed Nations (Country A) and Developing Nations (Country B) in a recent year (Unit: %):',
    contextDataGrid: {
      headers: ['Country Group', 'Agriculture–Forestry–Fishery (%)', 'Industry–Construction (%)', 'Services (%)', 'Total (%)'],
      rows: [
        ['Developed (Country A)', 1.5, 24.5, 74.0, 100.0],
        ['Developing (Country B)', 22.0, 38.0, 40.0, 100.0],
      ],
    },
    contextSource: 'International Statistical Yearbook (Examination dataset)',
    statements: [
      {
        id: 'a',
        text: 'In the developed country (Country A), the service sector accounts for the dominant share of GDP (reaching 74.0%).',
        isCorrect: true,
        explanation: 'According to the table, services in Country A account for 74.0%, dominating the national economy.',
      },
      {
        id: 'b',
        text: 'The percentage share of agriculture in the developing country (Country B) is over 14 times higher than that in the developed country.',
        isCorrect: true,
        explanation: 'Ratio: 22.0% / 1.5% ≈ 14.67 times, which is indeed more than 14 times higher.',
      },
      {
        id: 'c',
        text: 'In the developing country (Country B), agriculture represents the largest single sector in the GDP structure.',
        isCorrect: false,
        explanation: 'In Country B, services (40.0%) and industry (38.0%) both hold larger shares than agriculture (22.0%).',
      },
      {
        id: 'd',
        text: 'The disparity in service sector shares between the two country groups highlights economic development levels and modern sectoral transition.',
        isCorrect: true,
        explanation: 'Advanced developed economies typically have service sector shares exceeding 70%, reflecting post-industrial economic modernization.',
      },
    ],
  },
  'q-calc-10': {
    contextTitle: 'Freight Transport Volume and Turnover by Transportation Mode',
    contextText: 'Statistical table of freight transport performance across key transport modes in a key economic region:',
    contextDataGrid: {
      headers: ['Transport Mode', 'Freight Volume (million tons)', 'Freight Turnover (billion ton.km)'],
      rows: [
        ['Rail transport', 4.5, 3.6],
        ['Road transport', 120.0, 7.2],
        ['Maritime transport', 60.0, 180.0],
        ['Air transport', 0.2, 0.8],
      ],
    },
    contextSource: 'Department of Transport Statistics',
    statements: [
      {
        id: 'a',
        text: 'Road transport recorded the highest volume of freight carried among all transport modes (reaching 120.0 million tons).',
        isCorrect: true,
        explanation: 'Road transport volume is 120.0 million tons, the highest among all 4 surveyed modes.',
      },
      {
        id: 'b',
        text: 'Maritime transport recorded the highest freight turnover (reaching 180.0 billion ton.km), dominating long-distance shipping.',
        isCorrect: true,
        explanation: 'Maritime freight turnover reached 180.0 billion ton.km due to massive carrying capacities over transoceanic distances.',
      },
      {
        id: 'c',
        text: 'The average haul distance for road transport is greater than that of maritime transport.',
        isCorrect: false,
        explanation: 'Average haul distance = Turnover / Volume. Road: (7.2 × 1000) / 120 = 60 km. Maritime: (180 × 1000) / 60 = 3,000 km. Maritime is 50 times longer.',
      },
      {
        id: 'd',
        text: 'Air transport handled the smallest freight volume but carries high-value and time-sensitive cargo.',
        isCorrect: true,
        explanation: 'Air transport handled only 0.2 million tons due to high tariff rates, specializing in high-tech and urgent freight.',
      },
    ],
  },
  'q-calc-11': {
    question: 'In 2023, Lang Son province had a natural area of 8,310 km² and an average population of 802,000 people. Calculate the population density of Lang Son province in 2023 (round your answer to the nearest integer, unit: people/km²).',
    formula: 'Population Density = Total Population / Total Area',
    calculationSteps: [
      'Identify total population: 802,000 people',
      'Identify total area: 8,310 km²',
      'Compute quotient: 802,000 / 8,310 ≈ 96.51 people/km²',
      'Round to the nearest integer: 97 people/km²',
    ],
    roundingRule: 'Round to the nearest whole integer',
    unit: 'people/km²',
    guide: 'Divide total population by land area, then round to the nearest whole number.',
    explanation: 'Population density = 802,000 / 8,310 = 96.51 people/km². Rounded to the nearest integer: 97 people/km².',
  },
  'q-calc-12': {
    question: 'In 2022, a locality cultivated rice over an area of 120,000 hectares, harvesting a total paddy production of 726,000 metric tons. Calculate the average rice yield of this locality in 2022 (unit: quintals/ha, round to 1 decimal place).',
    formula: 'Rice Yield = Production (quintals) / Cultivated Area (ha)',
    calculationSteps: [
      'Convert production from metric tons to quintals: 726,000 tons = 7,260,000 quintals (1 ton = 10 quintals)',
      'Cultivated area: 120,000 ha',
      'Compute quotient: 7,260,000 / 120,000 = 60.5 quintals/ha',
    ],
    roundingRule: 'Round to 1 decimal place',
    unit: 'quintals/ha',
    guide: 'Convert tons to quintals (multiply by 10) then divide by cultivated area in hectares.',
    explanation: 'Convert 726,000 tons = 7,260,000 quintals. Rice yield = 7,260,000 / 120,000 = 60.5 quintals/ha.',
  },
  'q-calc-13': {
    question: 'In 2023, a country generated a total GDP of 430 billion USD with an average population of 100 million people. Calculate the GDP per capita of this country in 2023 (unit: USD/capita, enter answer as an integer).',
    formula: 'GDP per capita = Total GDP / Total Population',
    calculationSteps: [
      'Convert 430 billion USD = 430,000,000,000 USD',
      'Population: 100,000,000 people',
      'Compute quotient: 430,000,000,000 / 100,000,000 = 4,300 USD/capita',
    ],
    roundingRule: 'Whole integer',
    unit: 'USD/capita',
    guide: 'Divide total GDP value by total population using consistent units.',
    explanation: 'GDP per capita = 430 billion USD / 100 million people = 430,000 million USD / 100 million people = 4,300 USD/capita.',
  },
  'q-calc-14': {
    title: 'Match the socio-economic indicator in Column A with its corresponding geographic calculation formula in Column B',
    columnATitle: 'Geographic Indicator (Column A)',
    columnBTitle: 'Calculation Formula (Column B)',
    pairs: [
      {
        id: 'p1',
        left: 'Population density',
        right: 'Total Population divided by Land Area (people/km²)',
        reason: 'Population density reflects the average number of inhabitants per unit of land area.',
      },
      {
        id: 'p2',
        left: 'Percentage share of a component (%)',
        right: '(Component Value divided by Total Whole) multiplied by 100%',
        reason: 'Percentage share determines the proportional contribution of a part within a whole.',
      },
      {
        id: 'p3',
        left: 'Growth rate relative to base year (%)',
        right: '(Year i Value divided by Base Year Value) multiplied by 100%',
        reason: 'Growth rate benchmarks index progression over time against a standardized 100% baseline.',
      },
      {
        id: 'p4',
        left: 'Trade balance (Net exports)',
        right: 'Total Export Value minus Total Import Value',
        reason: 'Trade balance measures the net difference between export receipts and import expenditures.',
      },
    ],
    explanation: 'Standard geographic formulas in Grade 10 Geography: Density = Population/Area; Share = (Part/Total)×100%; Growth = (Current/Base)×100%; Balance = Exports - Imports.',
  },
  'q-calc-15': {
    title: 'Match the data representation requirement in Column A with the most appropriate chart type in Column B',
    columnATitle: 'Data Representation Requirement (Column A)',
    columnBTitle: 'Most Appropriate Chart Type (Column B)',
    pairs: [
      {
        id: 'p1',
        left: 'Show size and percentage structure across 1 to 3 distinct years',
        right: 'Pie chart',
        reason: 'Pie charts are optimal for displaying proportional component shares within 1 to 3 time points.',
      },
      {
        id: 'p2',
        left: 'Display growth rates and dynamics of multiple entities over several years',
        right: 'Line chart',
        reason: 'Line charts best illustrate temporal trends, rhythms, and continuous trajectory over time series.',
      },
      {
        id: 'p3',
        left: 'Show structural shift in economic composition over a timeline of 4+ years',
        right: 'Area chart',
        reason: 'Area charts depict evolving percentage composition over longitudinal time intervals.',
      },
      {
        id: 'p4',
        left: 'Compare absolute scale, magnitude or volume among geographic entities',
        right: 'Bar / Column chart',
        reason: 'Bar and column charts provide direct visual comparison of absolute quantities across regions.',
      },
    ],
    explanation: 'Chart selection rules in Grade 10: Structure in 1–3 years -> Pie chart; Structure in 4+ years -> Area chart; Growth rate -> Line chart; Absolute scale comparison -> Column chart.',
  },
};

function resolveLessonPhrase(vi: string, embedded = false): string {
  if (embedded) {
    const emb = lookupLessonEnglishEmbedded(vi) || lookupLessonEnglish(vi);
    if (emb) return emb;
  } else {
    const exact = lookupLessonEnglish(vi);
    if (exact) return exact;
  }
  const m = vi.trim().match(/^Bài\s*(\d+)\b/i);
  if (m) {
    const enLesson = LESSONS_EN[`bai-${m[1]}`];
    if (enLesson?.title) return enLesson.title;
  }
  return vi;
}

/**
 * Localizes any Question into English or Vietnamese cleanly.
 */
export function localizeQuestion(q: Question, lang: 'vi' | 'en'): Question {
  if (lang === 'vi') return q;

  // 1. Check Specialized Skill Calculation questions (15 items)
  if (SKILL_CALC_QUESTIONS_EN[q.id]) {
    const override = SKILL_CALC_QUESTIONS_EN[q.id] as any;
    const merged: any = { ...q, ...override };
    if (q.type === 'short_answer' && override.unit) {
      merged.acceptedAnswers = Array.from(
        new Set([...(q.acceptedAnswers || []), `${q.standardAnswer} ${override.unit}`])
      );
    }
    return merged as Question;
  }

  // 2. Check Geography Discovery Questions ("Did You Know?" - 42 items)
  if (DISCOVERY_QUESTIONS_EN[q.id]) {
    const override = DISCOVERY_QUESTIONS_EN[q.id] as any;
    const merged: any = { ...q, ...override };
    if (q.type === 'short_answer') {
      const englishUnit = ENGLISH_UNITS_MAP[q.unit] || q.unit;
      merged.unit = override.unit || englishUnit;
      merged.acceptedAnswers = Array.from(
        new Set([
          ...(q.acceptedAnswers || []),
          ...(override.acceptedAnswers || []),
          `${q.standardAnswer} ${merged.unit}`,
        ])
      );
    }
    return merged as Question;
  }

  // 3. Curriculum Questions by Type
  if (q.type === 'multiple_choice') {
    return {
      ...q,
      question: translateMcQuestion(q.question),
      options: q.options.map((opt) => translateMcOption(opt)) as [string, string, string, string],
      explanation: translateMcExplanation(q.explanation),
    };
  }

  if (q.type === 'true_false_context') {
    return {
      ...q,
      contextTitle: translateTfContextTitle(q.contextTitle),
      contextText: translateTfContextText(q.contextText),
      contextSource:
        q.contextSource ===
        'Trích SGK Địa lí 10 Kết nối tri thức & Tư liệu chuyên môn Tổ Sử – Địa – GDKTPL, THPT Hòa Bình (Lạng Sơn)'
          ? 'Excerpt from Grade 10 Geography Textbook (Connecting Knowledge to Life) & History–Geography–Law Department Materials, Hoa Binh High School (Lang Son)'
          : q.contextSource,
      statements: q.statements.map((st) => ({
        ...st,
        text: translateTfStatementText(st.text),
        explanation: translateTfStatementExplanation(st.explanation),
      })) as any,
    };
  }

  if (q.type === 'short_answer') {
    const localized = localizeShortAnswerCurriculum(q);
    if (localized) return localized;
    const englishUnit = ENGLISH_UNITS_MAP[q.unit] || q.unit;
    return {
      ...q,
      unit: englishUnit,
      acceptedAnswers: Array.from(
        new Set([...(q.acceptedAnswers || []), `${q.standardAnswer} ${englishUnit}`])
      ),
    };
  }

  if (q.type === 'matching') {
    return {
      ...q,
      title: translateMatchingTitle(q.title),
      columnATitle: q.columnATitle ? 'Column A (Concepts / Phenomena)' : q.columnATitle,
      columnBTitle: q.columnBTitle ? 'Column B (Scientific Nature & Real-World Meaning)' : q.columnBTitle,
      pairs: q.pairs.map((p) => ({
        ...p,
        left: translateMatchingLeft(p.left),
        right: resolveLessonPhrase(p.right),
        reason: p.reason ? translateMatchingReason(p.reason) : p.reason,
      })),
      explanation: translateMatchingExplanation(q.explanation),
    };
  }

  return q;
}

// ============================================================================
// DETERMINISTIC CURRICULUM TEMPLATES (ZERO PARTIAL WORD-SWAPPING)
// ============================================================================

function translateMcQuestion(text: string): string {
  const prefixMatch = text.match(/^\[Bài\s*(\d+)\s*-\s*Câu\s*(\d+)\]\s*(.+)$/);
  const tag = prefixMatch ? `[Lesson ${prefixMatch[1]} - Question ${prefixMatch[2]}] ` : '';
  const body = prefixMatch ? prefixMatch[3] : text;

  let m: RegExpMatchArray | null;

  if ((m = body.match(/^Theo SGK Địa lí 10 \(bộ sách Kết nối tri thức\), khái niệm "([^"]+)" được hiểu là gì\?$/))) {
    return `${tag}According to Grade 10 Geography (Connecting Knowledge to Life textbook), how is the concept "${resolveLessonPhrase(m[1])}" defined?`;
  }
  if ((m = body.match(/^Trong nội dung "([^"]+)", phạm trù "([^"]+)" phản ánh đặc trưng nào sau đây\?$/))) {
    return `${tag}In "${resolveLessonPhrase(m[1])}", which defining characteristic applies to "${resolveLessonPhrase(m[2])}"?`;
  }
  if ((m = body.match(/^Đối tượng "([^"]+)" trong chương trình Địa lí 10 có vai trò bản chất nào sau đây\?$/))) {
    return `${tag}What is the fundamental essence or role of "${resolveLessonPhrase(m[1])}" in the Grade 10 Geography curriculum?`;
  }
  if ((m = body.match(/^Khi tìm hiểu về "([^"]+)", nhận định nào sau đây phản ánh đúng kiến thức bài học\?$/))) {
    return `${tag}When studying "${resolveLessonPhrase(m[1])}", which statement accurately reflects the lesson content?`;
  }
  if ((m = body.match(/^Trong nội dung "([^"]+)", nguyên nhân hoặc nhân tố chủ yếu chi phối là gì\?$/))) {
    return `${tag}In "${resolveLessonPhrase(m[1])}", which statement describes the primary governing cause or factor?`;
  }
  if ((m = body.match(/^Nội dung "([^"]+)" khẳng định ý nghĩa thực tiễn nào sau đây đối với sản xuất và đời sống\?$/))) {
    return `${tag}What practical significance for production and daily life is affirmed in "${resolveLessonPhrase(m[1])}"?`;
  }
  if ((m = body.match(/^Một trong những yêu cầu cần đạt quan trọng nhất của bài học "([^"]+)" là gì\?$/))) {
    return `${tag}Which of the following is one of the key learning objectives of "${resolveLessonPhrase(m[1])}"?`;
  }
  if ((m = body.match(/^Khi phân tích mối liên hệ không gian trong bài "([^"]+)", quan điểm địa lí hiện đại nhấn mạnh điều gì\?$/))) {
    return `${tag}When analyzing spatial relationships in "${resolveLessonPhrase(m[1])}", what does modern geographic perspective emphasize?`;
  }
  if ((m = body.match(/^Học sinh có thể vận dụng kiến thức của bài "([^"]+)" vào hành động thiết thực nào sau đây\?$/))) {
    return `${tag}How can students practically apply knowledge from "${resolveLessonPhrase(m[1])}" in real life?`;
  }
  if ((m = body.match(/^Liên hệ thực tiễn tại xã Chi Lăng và xã Vạn Linh \(tỉnh Lạng Sơn\), bài học "([^"]+)" được thể hiện sinh động qua ví dụ nào\?$/))) {
    return `${tag}Relating to local practice in Chi Lang and Van Linh communes (Lang Son province), which real-world example illustrates "${resolveLessonPhrase(m[1])}"?`;
  }

  return text;
}

function translateMcOption(opt: string): string {
  if (MC_NON_LESSON_OPTIONS_EN[opt]) {
    return MC_NON_LESSON_OPTIONS_EN[opt];
  }
  const fromLesson = lookupLessonEnglish(opt);
  if (fromLesson) return fromLesson;
  return opt;
}

function translateMcExplanation(exp: string): string {
  if (!exp) return exp;
  let m: RegExpMatchArray | null;

  if ((m = exp.match(/^Theo SGK Địa lí 10,\s+(.+?)\s+là\s+(.+)$/))) {
    return `According to the Grade 10 Geography textbook, ${resolveLessonPhrase(m[1])} is ${resolveLessonPhrase(m[2], true)}`;
  }
  if ((m = exp.match(/^Khái niệm\s+(.+?)\s+được định nghĩa chính xác theo chuẩn SGK là:\s*(.+)$/))) {
    return `According to curriculum standards, ${resolveLessonPhrase(m[1])} is accurately defined as: ${resolveLessonPhrase(m[2])}`;
  }
  if ((m = exp.match(/^Theo chuẩn kiến thức SGK:\s*(.+?)\s+có bản chất là\s+(.+)$/))) {
    return `According to the textbook standard, ${resolveLessonPhrase(m[1])} is fundamentally ${resolveLessonPhrase(m[2], true)}`;
  }
  if ((m = exp.match(/^Theo mục\s+(.+?)\s+của bài học:\s*(.+)$/))) {
    return `According to section "${resolveLessonPhrase(m[1])}" of the lesson: ${resolveLessonPhrase(m[2])}`;
  }
  if ((m = exp.match(/^Mục\s+(.+?)\s+chỉ rõ nguyên nhân và nhân tố chi phối:\s*(.+)$/))) {
    return `Section "${resolveLessonPhrase(m[1])}" specifies the governing cause and factors: ${resolveLessonPhrase(m[2])}`;
  }
  if ((m = exp.match(/^Mục\s+(.+?)\s+khẳng định:\s*(.+)$/))) {
    return `Section "${resolveLessonPhrase(m[1])}" affirms: ${resolveLessonPhrase(m[2])}`;
  }
  if ((m = exp.match(/^Yêu cầu cần đạt chuẩn GDPT 2018 của bài học là:\s*(.+)$/))) {
    return `According to the 2018 General Education Curriculum, a core learning objective of this lesson is: ${resolveLessonPhrase(m[1])}`;
  }
  if (exp.startsWith('Quan điểm địa lí hiện đại trong SGK Kết nối tri thức')) {
    return 'Modern geographic perspective in the Connecting Knowledge to Life curriculum consistently emphasizes sustainable development and harmonious adaptation with nature.';
  }
  if (exp.startsWith('Vận dụng kiến thức bài học giúp hình thành')) {
    return 'Applying lesson knowledge develops practical problem-solving competencies and civic responsibility toward the community and environment.';
  }
  if ((m = exp.match(/^Thực tiễn tại địa phương ghi nhận:\s*(.+)$/))) {
    return `Local practical evidence shows: ${resolveLessonPhrase(m[1])}`;
  }

  return resolveLessonPhrase(exp);
}

function translateTfContextTitle(title: string): string {
  const m = title.match(/^Ngữ liệu chuyên đề Bài\s*(\d+)\s*\(Phiếu học tập số\s*(\d+)\):\s*(.+)$/);
  if (m) {
    return `Thematic Source Material – Lesson ${m[1]} (Worksheet No. ${m[2]}): ${resolveLessonPhrase(m[3])}`;
  }
  return title;
}

function translateTfContextText(text: string): string {
  const m = text.match(
    /^Đoạn trích tư liệu chuyên đề dạy học môn Địa lí 10 \(SGK Kết nối tri thức với cuộc sống\):\s*"([\s\S]+?)"\s*Liên hệ thực tiễn địa bàn xã Chi Lăng và xã Vạn Linh \(tỉnh Lạng Sơn\):\s*"([\s\S]+?)"$/
  );
  if (m) {
    const enExcerpt = resolveLessonPhrase(m[1]);
    const enExample = resolveLessonPhrase(m[2]);
    return `Textbook Excerpt (Grade 10 Geography – Connecting Knowledge to Life): "${enExcerpt}" Local Real-World Connection in Chi Lang and Van Linh (Lang Son province): "${enExample}"`;
  }
  return text;
}

function translateTfStatementText(text: string): string {
  const m = text.match(
    /^Đoạn tư liệu phản ánh chính xác các luận điểm khoa học về nội dung "([^"]+)" theo chương trình GDPT 2018\.$/
  );
  if (m) {
    return `The source excerpt accurately presents the scientific points regarding "${resolveLessonPhrase(m[1])}" under the 2018 National Curriculum.`;
  }
  if (text === 'Theo tư liệu trên, các quá trình địa lí diễn ra hoàn toàn biệt lập và không chịu tác động của bất kì quy luật tự nhiên nào.') {
    return 'According to the excerpt above, geographic processes operate in complete isolation and are unaffected by any natural laws.';
  }
  if (text === 'Dữ liệu thực tiễn tại xã Chi Lăng, xã Vạn Linh và tỉnh Lạng Sơn là minh chứng thực tế rõ nét cho sự vận dụng tri thức bài học vào đời sống.') {
    return 'Real-world data from Chi Lang, Van Linh, and Lang Son province vividly demonstrate the practical application of lesson knowledge in daily life.';
  }
  if (text === 'Kiến thức trong đoạn tư liệu chỉ mang tính kinh nghiệm dân gian, không thể áp dụng vào quy hoạch không gian và phát triển bền vững.') {
    return 'The knowledge in this excerpt reflects only folk intuition and cannot be applied to spatial planning or sustainable development.';
  }
  return text;
}

function translateTfStatementExplanation(exp: string): string {
  if (exp === 'Đúng. Nội dung tư liệu trích dẫn nguyên văn chuẩn mực kiến thức SGK Địa lí 10 Kết nối tri thức.') {
    return 'True. The excerpt cites verified core knowledge directly from the Grade 10 Geography (Connecting Knowledge to Life) textbook.';
  }
  if (exp === 'Sai. Mọi hiện tượng và thành phần địa lí luôn nằm trong mối liên hệ tương hỗ, chịu sự chi phối chặt chẽ của các quy luật tự nhiên và kinh tế - xã hội.') {
    return 'False. All geographic phenomena and components are interconnected and governed strictly by natural and socio-economic laws.';
  }
  if (exp === 'Đúng. Tư liệu liên hệ cụ thể với thực tế sản xuất và điều kiện tự nhiên tại xã Chi Lăng và xã Vạn Linh (tỉnh Lạng Sơn).') {
    return 'True. The passage explicitly connects lesson principles to real production and natural conditions in Chi Lang and Van Linh (Lang Son province).';
  }
  if (exp === 'Sai. Tri thức địa lí trong SGK mang tính khoa học và hệ thống cao, là cơ sở khoa học để xây dựng chiến lược phát triển kinh tế và bảo vệ môi trường.') {
    return 'False. Textbook geographic knowledge is rigorous and systematic, forming a scientific foundation for economic planning and environmental conservation.';
  }
  return exp;
}

function translateMatchingTitle(title: string): string {
  const m = title.match(/^\[Bài\s*(\d+)\s*-\s*Phiếu ghép nối\s*(\d+)\]\s*(.+)$/);
  if (m) {
    return `[Lesson ${m[1]} - Matching Task ${m[2]}] Match each concept or phenomenon in Column A with its scientific meaning in Column B`;
  }
  return title;
}

function translateMatchingLeft(left: string): string {
  const m = left.match(/^Thực tiễn xã Chi Lăng, Vạn Linh \(Bài\s*(\d+)\)$/);
  if (m) {
    return `Local Practice in Chi Lang & Van Linh (Lesson ${m[1]})`;
  }
  return resolveLessonPhrase(left);
}

function translateMatchingReason(reason: string): string {
  if (reason === 'Minh chứng sinh động cho bài học tại địa phương Lạng Sơn.') {
    return 'Vivid real-world illustration of lesson concepts in Lang Son province.';
  }
  let m: RegExpMatchArray | null;
  if ((m = reason.match(/^Thể hiện đặc trưng cơ bản của (.+)\.$/))) {
    return `Illustrates the fundamental characteristics of ${resolveLessonPhrase(m[1])}.`;
  }
  if ((m = reason.match(/^(.+?)\s+là\s+(.+)$/))) {
    return `${resolveLessonPhrase(m[1])} is ${resolveLessonPhrase(m[2], true)}`;
  }
  return resolveLessonPhrase(reason);
}

function translateMatchingExplanation(exp: string): string {
  const m = exp.match(
    /^Khóa ghép nối chuẩn kiến thức SGK Địa lí 10 bài\s*(\d+):\s*Cặp \(1\) gắn\s+(.+?)\s+với định nghĩa chuẩn;\s*Cặp \(2\) gắn\s+(.+?)\s+với bản chất quy luật;\s*Cặp \(3\) gắn\s+(.+?)\s+với ý nghĩa khoa học;\s*Cặp \(4\) gắn thực tiễn xã Chi Lăng và Vạn Linh \(Lạng Sơn\) với tri thức bài học\.$/
  );
  if (m) {
    return `Answer key matching Grade 10 Geography Lesson ${m[1]}: Pair (1) links ${resolveLessonPhrase(m[2])} to its standard definition; Pair (2) links ${resolveLessonPhrase(m[3])} to its core scientific nature; Pair (3) links ${resolveLessonPhrase(m[4])} to its geographic significance; Pair (4) connects real-world practice in Chi Lang & Van Linh (Lang Son) to lesson knowledge.`;
  }
  return exp;
}

// ============================================================================
// EXAM TITLE & FEEDBACK LOCALIZATION HELPERS FOR UI / HISTORICAL RECORDS
// ============================================================================

const KNOWN_EXAM_TITLES_EN: Record<string, string> = {
  'Đề kiểm tra giữa kì I - Địa lí 10 (Chuẩn cấu trúc Bộ GD&ĐT)':
    'Midterm Semester 1 Exam – Geography 10 (MOET Standard Matrix)',
  'Đề thi cuối kì I - Tổng hợp Phần 1 & Địa lí Tự nhiên':
    'Final Semester 1 Exam – Comprehensive Part 1 & Physical Geography',
  'Bài kiểm tra nhanh 15 phút - Địa lí Dân cư & Đô thị hóa':
    '15-Minute Speed Test – Population Geography & Urbanization',
  'Đề kiểm tra 15 phút số 1 – Chương 1 & 2 (Sử dụng bản đồ & Trái Đất)':
    '15-Minute Speed Test No. 1 – Chapters 1 & 2 (Map Use & The Earth)',
  'Đề kiểm tra 15 phút số 2 – Chương 3 & 4 (Thạch quyển & Khí quyển)':
    '15-Minute Speed Test No. 2 – Chapters 3 & 4 (Lithosphere & Atmosphere)',
  'Đề kiểm tra giữa kì I – Địa lí 10 (Chuẩn cấu trúc 4 dạng mới)':
    'Midterm Semester 1 Exam – Geography 10 (New 4-Format Matrix)',
  'Đề thi cuối học kì I – Tổng hợp Địa lí Tự nhiên (Phần 1 & 2)':
    'Final Semester 1 Exam – Physical Geography Synthesis (Parts 1 & 2)',
  'Đề thi cuối học kì II – Tổng hợp Địa lí Kinh tế – Xã hội (Phần 3)':
    'Final Semester 2 Exam – Socio-Economic Geography (Part 3)',
  'Đề kiểm tra định kì 45 phút: Địa lí Tự nhiên và Dân cư (Học kì I)':
    '45-Minute Periodic Exam: Physical & Population Geography (Semester I)',
  'Khảo sát chuyên đề 20 phút: Kĩ năng tính toán và phân tích bảng số liệu Địa lí 10':
    '20-Minute Thematic Survey: Grade 10 Quantitative & Statistical Table Skills',
  'Đề kiểm tra định kì 45 phút: Địa lí Kinh tế và Phát triển bền vững (Học kì II)':
    '45-Minute Periodic Exam: Economic Geography & Sustainable Development (Semester II)',
  'Đề kiểm tra 15 phút Địa lí 10': '15-Minute Geography 10 Quiz',
  'Đề kiểm tra Giữa học kì I – Môn Địa lí 10': 'Midterm Semester 1 Exam – Geography 10',
  'Đề kiểm tra Cuối học kì I – Môn Địa lí 10': 'Final Semester 1 Exam – Geography 10',
  'Đề kiểm tra Giữa học kì II – Môn Địa lí 10': 'Midterm Semester 2 Exam – Geography 10',
  'Đề kiểm tra Cuối học kì II – Môn Địa lí 10': 'Final Semester 2 Exam – Geography 10',
  'Bài kiểm tra 15 phút thường xuyên (10 câu)': '15-Minute Frequent Quiz (10 Questions)',
  'Bài khảo sát định kì chủ đề (15 câu / 20 phút)': 'Periodic Topic Survey (15 Questions / 20 Minutes)',
  'Bài khảo sát định kì chủ đề 20 phút (15 câu)': '20-Minute Periodic Topic Survey (15 Questions)',
  'Đề kiểm tra chuyên đề 30 phút (20 câu)': '30-Minute Thematic Exam (20 Questions)',
  'Đề kiểm tra giữa học kì 30 phút (20 câu)': '30-Minute Midterm Exam (20 Questions)',
  'Đề kiểm tra định kì 45 phút – Chuẩn cấu trúc GDPT 2018 (28 câu)':
    '45-Minute Periodic Exam – 2018 Curriculum Standard (28 Questions)',
  'Giữa học kì I': 'Midterm Semester 1 Exam',
  'Cuối học kì I': 'Final Semester 1 Exam',
  'Giữa học kì II': 'Midterm Semester 2 Exam',
  'Cuối học kì II': 'Final Semester 2 Exam',
};

const KNOWN_EXAM_TITLES_VI_REVERSE: Record<string, string> = {
  ...Object.fromEntries(Object.entries(KNOWN_EXAM_TITLES_EN).map(([vi, en]) => [en, vi])),
  'Grade 10 Geography – Midterm Exam 1 (Semester I)': 'Đề kiểm tra Giữa học kì I – Môn Địa lí 10',
  'Grade 10 Geography – Midterm Exam 2 (Semester II)': 'Đề kiểm tra Giữa học kì II – Môn Địa lí 10',
  'Grade 10 Geography – Final Semester 1 Exam': 'Đề kiểm tra Cuối học kì I – Môn Địa lí 10',
  'Grade 10 Geography – Final Semester 2 Exam': 'Đề kiểm tra Cuối học kì II – Môn Địa lí 10',
  'Comprehensive Mixed Practice – Geography 10': 'Luyện tập Tổng hợp kiến thức Địa lí 10',
  'Challenge Mode: Did You Know? – Geography Discovery': 'Chủ đề Thử thách: Em có biết? – Địa lí Khám phá',
};

export function localizeExamTitle(title: string, lang: 'vi' | 'en'): string {
  if (!title) return title;
  if (lang === 'vi') {
    if (KNOWN_EXAM_TITLES_VI_REVERSE[title]) return KNOWN_EXAM_TITLES_VI_REVERSE[title];
    const mComp = title.match(/^Comprehensive Practice \((\d+) questions - All 4 Formats\)$/);
    if (mComp) return `Luyện tập tổng hợp ${mComp[1]} câu (Đủ 4 dạng chuẩn Bộ GD&ĐT)`;
    return title;
  }

  if (KNOWN_EXAM_TITLES_EN[title]) return KNOWN_EXAM_TITLES_EN[title];

  let m: RegExpMatchArray | null;
  if ((m = title.match(/^Luyện tập:\s*(Bài\s*\d+.*)$/))) {
    return `Practice: ${resolveLessonPhrase(m[1])}`;
  }
  if ((m = title.match(/^Kiểm tra đánh giá:\s*(Bài\s*\d+.*)$/))) {
    return `Assessment Quiz: ${resolveLessonPhrase(m[1])}`;
  }
  if ((m = title.match(/^Kiểm tra đánh giá:\s*(.+)$/))) {
    return `Assessment Quiz: ${resolveLessonPhrase(m[1], true)}`;
  }
  if ((m = title.match(/^Luyện tập trọn bộ 40 câu \(Đủ 4 dạng\):\s*(Bài\s*\d+.*)$/))) {
    return `Full 40 Questions Practice (All 4 Formats): ${resolveLessonPhrase(m[1])}`;
  }
  if ((m = title.match(/^Luyện tập tự chọn \((\d+) câu\):\s*(Bài\s*\d+.*)$/))) {
    return `Custom Practice (${m[1]} questions): ${resolveLessonPhrase(m[2])}`;
  }
  if ((m = title.match(/^Kiểm tra (\d+) phút[^:]*:\s*(Bài\s*\d+.*)$/))) {
    return `${m[1]}-Minute Examination: ${resolveLessonPhrase(m[2])}`;
  }
  if ((m = title.match(/^Kiểm tra (\d+) phút[^:]*:\s*(.+)$/))) {
    return `${m[1]}-Minute Examination: ${resolveLessonPhrase(m[2], true)}`;
  }
  if ((m = title.match(/^Luyện tập tổng hợp (\d+) câu \(Đủ 4 dạng chuẩn Bộ GD&ĐT\)$/))) {
    return `Comprehensive Practice (${m[1]} questions - All 4 Formats)`;
  }
  if ((m = title.match(/^Luyện tập:\s*(.+)$/))) {
    return `Practice: ${resolveLessonPhrase(m[1], true)}`;
  }
  if ((m = title.match(/^Ôn tập chuyên sâu:\s*(.+)$/))) {
    const inner = m[1]
      .replace('Trắc nghiệm 4 lựa chọn', 'Multiple Choice (4 Options)')
      .replace('Trắc nghiệm Đúng/Sai', 'True / False Context')
      .replace('Trả lời ngắn tính toán', 'Short-Answer Calculation')
      .replace('Ghép nối 2 cột', 'Two-Column Matching');
    return `Focused Format Practice: ${inner}`;
  }
  if ((m = title.match(/^Luyện tập chuyên sâu:\s*(.+)\s*\((\d+) câu\)$/))) {
    return `Specialized Practice: ${m[1]} (${m[2]} questions)`;
  }
  if (title === 'Luyện tập Tổng hợp kiến thức Địa lí 10') {
    return 'Comprehensive Mixed Practice – Geography 10';
  }
  if (title === 'Chủ đề Thử thách: Em có biết? – Địa lí Khám phá') {
    return 'Challenge Mode: Did You Know? – Geography Discovery';
  }
  if ((m = title.match(/^Đề thi chuẩn:\s*(.+)$/))) {
    return `Standardized Exam: ${KNOWN_EXAM_TITLES_EN[m[1]] || m[1]}`;
  }
  if ((m = title.match(/^Kiểm tra cuối kì chuẩn hóa\s*\(([^)]+)\)$/))) {
    return `Standardized Semester Exam (${m[1]})`;
  }

  return title;
}

export function localizeRecommendationText(text: string, lang: 'vi' | 'en'): string {
  if (!text) return text;
  if (lang === 'vi') {
    if (text.includes('Prioritize reviewing topics with lower accuracy')) {
      return 'Cần ưu tiên ôn lại các bài thuộc chủ đề còn yếu, đặc biệt là kĩ năng xử lí số liệu và đọc hiểu tư liệu địa lí.';
    }
    if (text.includes('Keep up the exceptional performance') || text.includes('Keep building on this momentum')) {
      return 'Hãy tiếp tục phát huy kết quả rèn luyện!';
    }
    return text;
  }
  if (text.includes('Nắm vững kiến thức nền tảng và kĩ năng xử lí số liệu')) {
    return 'Outstanding mastery of core concepts and quantitative data skills! Keep challenging yourself with advanced Problem-Solving & Map Interpretation items.';
  }
  if (text.includes('Hoàn thành khá tốt các dạng bài')) {
    return 'Solid performance across all question formats. Review True/False context analysis items and rounding precision for calculation exercises.';
  }
  if (text.includes('Cần ôn tập lại khái niệm cốt lõi')) {
    return 'Review core concepts in the textbook summary and practice more 4-option multiple choice and column matching sets.';
  }
  if (text.includes('Kết quả chưa đạt yêu cầu')) {
    return 'Score needs reinforcement. Re-read the Lesson Library summaries (40 lessons) and focus on practicing individual lesson units before retaking.';
  }
  if (text.includes('Cần ưu tiên ôn lại các bài thuộc chủ đề còn yếu')) {
    return 'Prioritize reviewing topics with lower accuracy, especially quantitative data skills and geographic document analysis.';
  }
  if (text.includes('Hãy tiếp tục phát huy kết quả rèn luyện') || text.includes('Tiếp tục phát huy kết quả học tập tốt môn Địa lí 10')) {
    return 'Keep up your excellent Grade 10 Geography study performance!';
  }
  if (text.includes('Rèn luyện thêm bài tập tính toán tỉ trọng và tốc độ tăng trưởng')) {
    return 'Practice additional calculation exercises on structural share (%) and growth rate (%).';
  }
  if (text.includes('Củng cố thêm kiến thức bản đồ và định vị GPS')) {
    return 'Reinforce map representation methods and GPS navigation concepts.';
  }
  return text;
}

export function localizeStoredAnswerText(text: string | undefined, lang: 'vi' | 'en'): string {
  if (!text) return '';
  if (lang === 'vi') {
    return text
      .replace(/^No answer entered\/selected$/i, 'Học sinh chưa chọn/nhập đáp án')
      .replace(/^Unanswered$/i, 'Chưa trả lời')
      .replace(/^Not selected$/i, 'Chưa chọn đáp án')
      .replace(/^No numeric entry$/i, 'Chưa nhập kết quả')
      .replace(/\bStatement ([A-D]):/g, 'Ý $1:')
      .replace(/:\s*True\b/g, ': Đúng')
      .replace(/:\s*False\b/g, ': Sai')
      .replace(/:\s*Not selected\b/g, ': Chưa chọn')
      .replace(/➔\s*Unmatched\b/g, '➔ Chưa nối')
      .replace(/\(Formula:/g, '(Công thức:');
  }
  return text
    .replace(/^Học sinh chưa chọn\/nhập đáp án$/i, 'No answer entered/selected')
    .replace(/^Chưa trả lời$/i, 'Unanswered')
    .replace(/^Chưa chọn đáp án$/i, 'Not selected')
    .replace(/^Chưa chọn$/i, 'Not selected')
    .replace(/^Chưa nhập kết quả$/i, 'No numeric entry')
    .replace(/^Đáp án đúng:\s*/i, 'Correct Answer: ')
    .replace(/Chưa chính xác \(đáp án chuẩn:\s*/gi, 'Incorrect (standard answer: ')
    .replace(/Chưa nối đúng/g, 'Incorrectly matched')
    .replace(/\bÝ ([A-D]):/g, 'Statement $1:')
    .replace(/:\s*Đúng\b/g, ': True')
    .replace(/:\s*Sai\b/g, ': False')
    .replace(/:\s*Chưa chọn\b/g, ': Not selected')
    .replace(/➔\s*Chưa nối\b/g, '➔ Unmatched')
    .replace(/\(Công thức:/g, '(Formula:');
}

export function localizeTeacherHistoryReason(reason: string, lang: 'vi' | 'en'): string {
  if (!reason || lang === 'vi') return reason;
  let m: RegExpMatchArray | null;
  if ((m = reason.match(/^Giáo viên chính thức giao đề kiểm tra cho lớp\s+(.+)$/i))) {
    return `Teacher officially assigned exam for class ${m[1]}`;
  }
  if ((m = reason.match(/^Giáo viên Bùi Thị Hồng Hạnh giao (.+) cho lớp\s+(.+)$/i))) {
    return `Teacher Bui Thi Hong Hanh assigned assessment to class ${m[2]}`;
  }
  if (reason === 'Giáo viên tạm thu hồi đề kiểm tra') {
    return 'Teacher temporarily revoked exam access';
  }
  if (reason === 'Mở lại đề kiểm tra cho học sinh làm bài') {
    return 'Reopened exam for students to take the test';
  }
  if (reason === 'Giáo viên chủ động thu hồi đề kiểm tra') {
    return 'Teacher proactively revoked exam access';
  }
  if (reason === 'Mở lại quyền làm bài cho học sinh') {
    return 'Reopened student exam access';
  }
  if (reason.includes('Khởi tạo và giao đề kiểm tra') || reason.includes('Khởi tạo đề kiểm tra mẫu của giáo viên')) {
    return 'Exam initialized and officially assigned by Teacher Bui Thi Hong Hanh.';
  }
  if (reason.includes('Gia hạn thêm thời gian làm bài')) {
    return 'Updated exam availability window for students.';
  }
  return reason;
}

export function localizeSknnEfficacyRow(
  row: { metric: string; preWebApp: string; postWebApp: string; growth: string; significance: string },
  lang: 'vi' | 'en'
) {
  if (lang === 'vi') return row;
  const metricMap: Record<string, string> = {
    'Điểm số kiểm tra trung bình môn Địa lí 10': 'Average Grade 10 Geography Assessment Score',
    'Tỉ lệ học sinh đạt loại Giỏi (Điểm >= 8.0)': 'High-Achieving / Excellent Rate (Score >= 8.0)',
    'Tỉ lệ học sinh yếu kém (Điểm < 5.0)': 'Low-Performing Rate (Score < 5.0)',
    'Mức độ thành thạo Dạng 3 (Trả lời ngắn tính toán)': 'Format 3 Mastery (Short-Answer Quantitative)',
    'Mức độ làm chủ Dạng 2 (Đúng/Sai khai thác ngữ liệu)': 'Format 2 Mastery (Contextual True/False)',
    'Tỉ lệ tự giác luyện tập thường xuyên ngoài giờ': 'Regular Self-Directed Out-of-Class Practice Rate',
  };
  const significanceMap: Record<string, string> = {
    'Nâng cao rõ rệt năng lực nhận thức địa lí': 'Significantly improves geographical cognition and understanding',
    'Tăng gấp đôi số học sinh đạt chuẩn xuất sắc': 'More than doubles the share of high-achieving students',
    'Xóa bỏ hiệu quả các lỗ hổng kiến thức cơ bản': 'Effectively eliminates foundational knowledge gaps',
    'Học sinh làm chủ hoàn toàn các công thức địa lí': 'Students fully master quantitative geography formulas',
    'Phát triển tư duy phân tích tư liệu và lược đồ': 'Strengthens document, chart, and map interpretation skills',
    'Tạo hứng thú và thói quen tự học số hóa bền vững': 'Builds sustained digital self-study engagement and habits',
  };
  const cleanUnit = (s: string) =>
    String(s || '')
      .replace(/điểm/gi, 'pts')
      .replace(/đúng/gi, 'correct');

  return {
    metric: metricMap[row.metric] || row.metric,
    preWebApp: cleanUnit(row.preWebApp),
    postWebApp: cleanUnit(row.postWebApp),
    growth: cleanUnit(row.growth),
    significance: significanceMap[row.significance] || row.significance,
  };
}
