export interface LessonBilingualData {
  title: string;
  subtitle: string;
  objectives: string[];
  keyTerms: { term: string; definition: string }[];
  keyKnowledge: {
    sectionTitle: string;
    content: string[];
    highlight?: string;
  }[];
  realWorldExamples: string[];
  keyTakeaways: string[];
}

export const LESSONS_EN_PART1: Record<string, LessonBilingualData> = {
  'bai-1': {
    title: 'Lesson 1. Geography and Career Orientation',
    subtitle: 'Discipline characteristics, role of geographic knowledge, and future career pathways',
    objectives: [
      'Summarize the characteristics of high school Geography as a deeply integrated discipline spanning natural sciences, social sciences, and geospatial technology.',
      'Analyze the essential role of geographic knowledge in daily life, environmental conservation, and rational resource use.',
      'Identify career groups directly related to Geography: resource management, digital cartography, GIS, spatial planning, and ecotourism.',
      'Proactively apply lesson knowledge to career orientation aligned with personal strengths and the development needs of Lang Son province.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Characteristics and Position of Geography in School',
        content: [
          'High school Geography occupies a unique interdisciplinary position at the intersection of natural and social sciences. It investigates both the natural laws of Earth’s spheres (landforms, atmosphere, hydrosphere, biosphere) and the spatial organization of human socio-economic activities (population, cities, agriculture, industry, services).',
          'The Grade 10 Geography curriculum (Connecting Knowledge to Life) focuses on developing student competencies: spatial perception of the world, explanation of causal relationships in nature and society, and mastery of modern geographic tools.',
          'Studying Geography fosters a sound worldview, respect for cultural diversity, and civic responsibility toward global challenges such as climate change and resource depletion.',
        ],
        highlight: 'Geography serves as a bridge between nature and society, equipping learners with integrated spatial thinking and adaptability in the digital era.',
      },
      {
        sectionTitle: '2. Role of Geographic Knowledge in Practical Life',
        content: [
          'Adapting to weather and cropping seasons: Helps people grasp climate patterns to plan suitable crop structures and planting calendars, while proactively preventing extreme weather hazards such as flash floods, limestone landslides, severe cold spells, and frost.',
          'Spatial orientation and navigation: Provides skills in reading maps and compasses, operating GPS devices, and using smartphone digital map apps to find routes, measure distances, and survey terrain.',
          'Environmental protection and sustainable development: Builds clear awareness of finite natural resources, shaping eco-conscious habits, conserving freshwater, protecting forest vegetation, and reducing plastic waste.',
        ],
      },
      {
        sectionTitle: '3. Future Career Orientation Related to Geography',
        content: [
          'Natural resources and environment sector: Hydrometeorology, geology and minerals, oceanography, land resource management, nature conservation, and engineering geodesy.',
          'Economics, planning, and management sector: Urban and rural planning, development economics, logistics administration, commune/ward cadastral officer, and construction order management.',
          'Geospatial technology sector: Digital surveying and cartography, Geographic Information Systems (GIS), satellite remote sensing, and satellite positioning technology.',
          'Tourism and services sector: Travel management, tour guiding, regional cultural studies, and international trade and import-export promotion.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Geographic Knowledge',
        definition: 'A systematic understanding of natural and socio-economic laws and the mutual interactions among components within Earth’s landscape envelope.',
      },
      {
        term: 'Geographic Information System (GIS)',
        definition: 'A computer system that collects, stores, checks, analyzes, and displays data linked to locations on Earth’s surface.',
      },
      {
        term: 'Spatial Planning',
        definition: 'A method for rationally allocating and organizing space for economic, social, and environmental protection activities across a territory.',
      },
    ],
    realWorldExamples: [
      'In Van Linh commune, Lang Son province, commune cadastral officers apply digital maps and GPS positioning receivers to survey custard-apple orchard areas and issue land-use right certificates to households.',
      'Students at Hoa Binh High School have opportunities to pursue careers such as applying remote sensing to monitor Chi Lang fruit seasons, working as cadastral cartography technicians, or entering international border-gate trade in Lang Son province.',
    ],
    keyTakeaways: [
      'Grade 10 Geography deeply integrates natural sciences, social sciences, and digital technology.',
      'Geographic knowledge opens practical career pathways closely linked to commodity agriculture and border-gate economic development in Lang Son province.',
    ],
  },
  'bai-2': {
    title: 'Lesson 2. Methods of Representing Geographic Objects on Maps',
    subtitle: 'Five core cartographic representation methods: symbols, flow lines, dot density, area delimitation, and cartodiagrams',
    objectives: [
      'Distinguish the characteristics, target objects, and expressive capabilities of the 5 methods for representing geographic objects on maps.',
      'Read and interpret symbols, movement arrows, dots, shaded zones, and embedded charts on educational maps.',
      'Practice calculating real-world ground distances from map scales and explaining the spatial distribution of geographic objects.',
      'Apply map-reading methods to analyze administrative, physical, and economic maps of Lang Son province.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Overview of Maps and Representation Methods',
        content: [
          'A map is a reduced, generalized depiction of part or all of Earth’s surface onto a flat plane following strict mathematical rules (projection, scale) and conventional symbol systems.',
          'To accurately convey location, quantity, quality, structure, and dynamics of countless geographic objects in space, cartography employs specialized representation methods.',
        ],
        highlight: 'Each representation method is tailored to a specific form of geographic entity (point, line, area, or aggregated statistical data).',
      },
      {
        sectionTitle: '2. Characteristics of the 5 Basic Representation Methods',
        content: [
          'a) Symbol method: Represents objects distributed at specific point locations (volcanoes, mineral deposits, factories, airports, towns). Symbols take 3 forms: geometric, letter, and pictorial, conveying location, quantity, structure, and scale.',
          'b) Flow line method: Depicts the movement of natural and socio-economic phenomena (wind direction, storms, ocean currents, migration streams, freight routes). Arrows show direction, thickness shows volume, and length shows spatial reach.',
          'c) Dot density method: Represents dispersed phenomena using dots with assigned quantitative values (rural population distribution, livestock herds). Dot clustering reflects spatial density or sparsity.',
          'd) Area delimitation method: Shows objects distributed across broad yet discontinuous areas (ethnic territories, rice-growing zones, grazing pastures, mangrove belts). Closed boundary lines, colors, or hatching mark the extent.',
          'e) Cartodiagram (map-chart) method: Places charts (bars, pie charts, columns) inside administrative units to display totals, composition, and temporal dynamics (provincial grain output, export value, economic structure).',
        ],
      },
      {
        sectionTitle: '3. Calculating Real Ground Distance from Map Scale',
        content: [
          'Map scale indicates how much distances on the map are reduced compared with real-world ground distances.',
          'Formula: D (ground) = d (on map) × M (scale denominator).',
          'Example: If the distance between Hoa Binh High School and the center of Chi Lang commune (Lang Son province) measures 8.5 cm on a 1 : 100,000 map, the true ground distance is 8.5 × 100,000 cm = 850,000 cm = 8.5 km.',
        ],
        highlight: 'Pay attention to unit conversion: 1 km = 1,000 m = 100,000 cm; 1 m = 100 cm = 1,000 mm.',
      },
    ],
    keyTerms: [
      {
        term: 'Map Symbols',
        definition: 'A system of conventional signs used to indicate the location, characteristics, and magnitude of geographic objects on a map.',
      },
      {
        term: 'Flow Lines',
        definition: 'A method using arrows of varying shapes, colors, and widths to show the direction, speed, and volume of moving geographic phenomena.',
      },
      {
        term: 'Map Scale',
        definition: 'The ratio between a distance measured on a map and the corresponding actual distance on the ground.',
      },
    ],
    realWorldExamples: [
      'On the agricultural map of Lang Son province, the specialty custard-apple growing zone in Van Linh commune is depicted using the area delimitation method combined with a light-green fill.',
      'National Highway 1A and the Hanoi–Lang Son railway passing through Chi Lang commune and Lang Son province are depicted using linear symbols with graduated line widths.',
    ],
    keyTakeaways: [
      'Each representation method has distinct strengths and works harmoniously on thematic maps.',
      'To read a map accurately, start by examining the legend and identifying the map scale.',
      'Master the formula D = d × M to convert map distances into real ground distances.',
    ],
  },
  'bai-3': {
    title: 'Lesson 3. Using Maps in Study and Life; Applications of GPS and Digital Maps',
    subtitle: 'Steps to utilize maps, GPS operating principles, satellite navigation, and smart digital map applications',
    objectives: [
      'Outline scientific steps for using maps effectively in Geography study and everyday life.',
      'Explain the positioning principle of the Global Positioning System (GPS) and key functions of digital maps.',
      'Use smartphone digital map apps to find routes, measure distances, and pinpoint coordinates.',
      'Calculate GPS radio signal travel time and real travel speed from positioning data.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Effective Step-by-Step Map Utilization Procedure',
        content: [
          'Step 1: Choose a map suited to your study or work goal (physical, population, economic, or transport map).',
          'Step 2: Read the map title to grasp its topic and inspect the legend to understand conventional symbols.',
          'Step 3: Identify the map scale and orientation (North via meridians or compass rose).',
          'Step 4: Locate target features, analyze spatial relationships among geographic objects, draw conclusions, and explain underlying causes.',
        ],
        highlight: 'A map is the second textbook of Geography. Map reading must progress from overview to detail, and from description to explanation.',
      },
      {
        sectionTitle: '2. Global Positioning System (GPS) and Digital Maps',
        content: [
          'a) GPS system: A U.S. satellite navigation network comprising at least 24 satellites orbiting Earth at roughly 20,200 km altitude. Ground GPS receivers acquire signals from at least 4 satellites simultaneously to calculate exact coordinates (latitude, longitude), elevation, and real time.',
          'b) Digital maps: Spatial datasets digitized and managed on computers and rendered interactively on screens. Digital maps provide superior interactive capabilities: zooming, place search, multi-layer overlays (transport, services, terrain), automatic optimal routing, and live traffic updates.',
        ],
      },
      {
        sectionTitle: '3. Practical Applications of GPS and Digital Maps in Daily Life',
        content: [
          'In transportation: Navigating cars and motorcycles, tracking trucks hauling produce from Chi Lang to other provinces and container trucks crossing Lang Son border gates.',
          'In smart agriculture: Monitoring fruit orchard areas using GPS-equipped drones and applying fertilizer and spraying accurately by coordinates.',
          'In disaster prevention and rescue: Rapidly locating limestone rockfalls in Chi Lang commune, tracking storm tracks, and dispatching emergency teams.',
          'In tourism and daily life: Looking up Ai Chi Lang heritage sites, hotels, clinics, and sharing live locations with family.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Global Positioning System (GPS)',
        definition: 'A constellation of artificial satellites orbiting Earth that broadcasts radio signals enabling ground receivers to determine 3D position coordinates and time.',
      },
      {
        term: 'Digital Map',
        definition: 'A map created and stored as digital spatial data on computers, enabling interactive display, search, and dynamic analysis.',
      },
      {
        term: 'Navigation',
        definition: 'The process of determining current position and guiding optimal travel along a route to a chosen destination.',
      },
    ],
    realWorldExamples: [
      'Fruit traders buying custard apples in Van Linh commune, Lang Son province use Google Maps to locate collection hubs and optimize transport routes to Hanoi and other provinces.',
      'Residents and visitors touring the Ai Chi Lang Historical Site (Lang Son province) use smartphone GPS to find landmarks such as Demon Face Mountain, Quy Mon Quan Temple, and Ngua Cuong.',
    ],
    keyTakeaways: [
      'Scientific map use follows a 4-step workflow from selecting the map and reading its legend to analyzing spatial relationships.',
      'GPS provides precise coordinates via radio-signal intersection from orbiting satellites.',
      'Digital maps serve as smart support tools for agriculture, transport, and daily life in Lang Son.',
    ],
  },
  'bai-4': {
    title: 'Lesson 4. Formation of Earth, Earth’s Crust, and Crustal Materials',
    subtitle: 'Planetary origin, Earth’s 3-layer internal structure, and the mineral and rock groups composing the crust',
    objectives: [
      'Present the origin of Earth according to the solar nebula hypothesis.',
      'Describe Earth’s concentric structure consisting of 3 main layers: Crust, Mantle, and Core.',
      'Distinguish continental crust from oceanic crust; identify the 3 major rock groups forming the crust: igneous, sedimentary, and metamorphic rocks.',
      'Calculate volume/mass shares of Earth’s internal layers and apply knowledge to explain the origin of limestone in Chi Lang (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Origin of Earth’s Formation',
        content: [
          'Earth formed approximately 4.6 billion years ago from a primordial solar nebula of gas and dust. Under gravity, matter condensed at the center to ignite the Sun, while remaining dust and gas coalesced into planets of the Solar System, including Earth.',
          'During early differentiation, heavy elements (iron, nickel) sank toward the center to form the core, while lighter elements (silicon, aluminum) rose to form the crust and mantle.',
        ],
        highlight: 'Earth has a concentric 3-layer structure from outside inward: Crust -> Mantle -> Core.',
      },
      {
        sectionTitle: '2. Structure of Earth’s Crust: Continental vs. Oceanic Crust',
        content: [
          'Earth’s crust is the thinnest outermost solid layer, ranging from 5 km thick beneath ocean floors to 70 km beneath high continental mountain chains. The boundary separating the crust from the mantle is the Mohorovičić discontinuity (Moho).',
          'Continental crust: Averages 35–70 km thick and comprises 3 strata: an upper sedimentary layer, a middle granitic layer, and a lower basaltic layer.',
          'Oceanic crust: Thinner (around 5–10 km), composed mainly of a basaltic layer topped by thin marine sediments, lacking a continuous granitic layer.',
        ],
      },
      {
        sectionTitle: '3. Materials Composing Earth’s Crust: Minerals and 3 Rock Groups',
        content: [
          'a) Igneous rocks: Formed by the cooling and solidification of molten magma, including intrusive igneous rocks (granite) and extrusive rocks (basalt, rhyolite).',
          'b) Sedimentary rocks: Formed in depositional basins through settling, compaction, and cementation of rock fragments, chemical precipitates, or organic remains (limestone, sandstone, shale, coal), typically arranged in horizontal beds.',
          'c) Metamorphic rocks: Formed from pre-existing igneous or sedimentary rocks profoundly altered by intense heat and pressure deep underground (marble from limestone, slate from shale, gneiss from granite).',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Earth’s Crust',
        definition: 'The outermost rigid solid shell of Earth, ranging from about 5 km thick beneath oceans to 70 km beneath continents.',
      },
      {
        term: 'Moho Discontinuity (Mohorovičić)',
        definition: 'The boundary surface separating Earth’s crust from the upper mantle, where seismic wave velocities jump sharply.',
      },
      {
        term: 'Sedimentary Rock',
        definition: 'Rock formed in depositional basins through accumulation, compaction, and cementation of clastic debris, chemical precipitates, or organic remains.',
      },
    ],
    realWorldExamples: [
      'In the Chi Lang and Van Linh area (Lang Son), the bedrock consists predominantly of Paleozoic marine sedimentary limestone rich in calcite (CaCO3), deposited on shallow seafloors hundreds of millions of years ago.',
      'The sheer limestone peaks at Ai Chi Lang and Van Linh valley contain numerous natural karst caves—characteristic biogenic sedimentary rock formations of Northeastern Vietnam.',
    ],
    keyTakeaways: [
      'Earth consists of 3 layers: Crust, Mantle, and Core. Continental crust is thick with a granitic layer; oceanic crust is thin without a granitic layer.',
      'The three crustal rock groups—igneous, sedimentary, and metamorphic—continuously transform through the rock cycle.',
      'Chi Lang limestone (Lang Son) is a sedimentary rock with high scenic and economic value for cement manufacturing.',
    ],
  },
  'bai-5': {
    title: 'Lesson 5. Geographic Consequences of Earth’s Movements',
    subtitle: 'Axial rotation and solar revolution: day-night cycle, global time zones, Coriolis force, seasons, and varying day length',
    objectives: [
      'Analyze the geographic consequences of Earth’s axial rotation: alternation of day and night, standard time on Earth, and the Coriolis force.',
      'Analyze the consequences of Earth’s revolution around the Sun: apparent annual solar migration, four seasons, and seasonal/latitudinal differences in day-night length.',
      'Solve problems calculating zone time (GMT), local solar time by longitude, calendar date shifts across the 180° meridian, and solar noon angle.',
      'Explain deep winter cold and summer day-night length differences in Van Linh commune and the Chi Lang area (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Consequences of Earth’s Axial Rotation',
        content: [
          'Earth rotates west-to-east around an axis inclined at 66°33′ to its orbital plane over a 24-hour period (one solar day).',
          'a) Alternation of day and night: Because Earth is spherical, sunlight illuminates only half of the globe (day) while the opposite half stays in shadow (night). Rotation exposes every place to alternating day and night.',
          'b) Time on Earth: The globe is divided into 24 time zones, each spanning 15° of longitude (1 hour). Zone 0 is centered on the Prime Meridian (0°) through Greenwich Observatory (GMT/UTC). Vietnam lies wholly in Time Zone +7 (105°E central meridian). Crossing the 180° International Date Line eastward sets the calendar back 1 day; crossing westward adds 1 day.',
          'c) Coriolis force: An inertial deflecting force acting on moving objects across Earth’s surface—deflecting motion to the right in the Northern Hemisphere and to the left in the Southern Hemisphere.',
        ],
        highlight: 'Time zone formula: T_B = T_A + (Zone_B - Zone_A). Solar noon altitude formula: h = 90° - |latitude φ ± solar declination α|.',
      },
      {
        sectionTitle: '2. Consequences of Earth’s Revolution Around the Sun',
        content: [
          'Earth revolves around the Sun along a near-circular elliptical orbit in 365 days and 6 hours (1 year). Its unchanging axial tilt produces key consequences:',
          'a) Four seasons of the year: Because Earth’s axis stays tilted in the same direction, the Northern and Southern Hemispheres alternately lean toward the Sun, receiving varying heat and light and creating Spring, Summer, Autumn, and Winter—opposite in the two hemispheres.',
          'b) Day and night lengths by season and latitude: Summer brings longer days than nights; winter brings shorter days than nights. Along the Equator day and night always equal 12 hours year-round. Higher latitudes experience greater day-night disparity, with 24-hour polar day and polar night from the polar circles to the poles.',
        ],
      },
      {
        sectionTitle: '3. Problem-Solving Methods for Time and Solar Altitude',
        content: [
          '1. Zone time calculation: Time Zone = Longitude / 15 (rounded to nearest integer). In the Eastern Hemisphere: Local Zone Time = GMT + Zone; in the Western Hemisphere: T = GMT - Zone.',
          '2. Local solar time by longitude: Every 1° difference in longitude corresponds to 4 minutes of time (60 min / 15° = 4 min). Moving east adds time; moving west subtracts time.',
          '3. Solar noon altitude angle (12:00 noon): h = 90° - |φ - α| when latitude and declination are in the same hemisphere; h = 90° - (φ + α) when in opposite hemispheres.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'GMT (Greenwich Mean Time)',
        definition: 'Time in Time Zone 0, centered on the Prime Meridian passing through the Royal Observatory in Greenwich (London, UK).',
      },
      {
        term: 'Coriolis Force',
        definition: 'An apparent inertial force generated by Earth’s rotation that deflects moving air masses, ocean currents, and projectiles.',
      },
      {
        term: 'Solar Zenith (Overhead Sun)',
        definition: 'The phenomenon where sunlight strikes Earth’s surface vertically (90° altitude) at local noon, occurring only within the tropics.',
      },
    ],
    realWorldExamples: [
      'Lang Son province (including Van Linh and Chi Lang communes) lies between roughly 21°40′N and 22°N in Time Zone +7, experiencing the overhead Sun twice annually in late May and mid-July.',
      'On the Summer Solstice (June 22), students in Van Linh commune (Lang Son) observe the longest daylight of the year (~13.5 hours of daylight), with late dusk matching the Vietnamese folk saying about short Fifth-Month nights.',
    ],
    keyTakeaways: [
      'Earth’s axial rotation causes alternating day and night, global time zones, and the Coriolis force.',
      'Earth’s orbital revolution with constant axial tilt produces 4 seasons and latitudinal/seasonal day-night length variations.',
      'Vietnam operates in Time Zone +7 (GMT+7); remember the longitude-to-time conversion (1° = 4 minutes).',
    ],
  },
  'bai-6': {
    title: 'Lesson 6. The Lithosphere and Plate Tectonics Theory',
    subtitle: 'Boundaries of the lithosphere, major tectonic plates, and mechanisms of plate movement',
    objectives: [
      'Define the boundaries of the lithosphere and distinguish the lithosphere from Earth’s crust.',
      'Present the core tenets of plate tectonics theory: 7 major tectonic plates drifting over the plastic asthenosphere.',
      'Explain the formation of young mountain ranges, deep oceanic trenches, earthquakes, and volcanoes along plate boundaries.',
      'Calculate tectonic plate drift rates and relate concepts to geological fault zones in Lang Son province.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Concept of the Lithosphere',
        content: [
          'The lithosphere is Earth’s rigid outermost shell, consisting of Earth’s crust plus the uppermost rigid portion of the mantle, with a thickness of roughly 100 km.',
          'Beneath the lithosphere lies the asthenosphere (soft/plastic layer) of the upper mantle, where partially ductile material hosts slow thermal convection currents.',
        ],
        highlight: 'Lithosphere = Earth’s Crust + Uppermost solid mantle (~100 km thick), floating atop the plastic asthenosphere.',
      },
      {
        sectionTitle: '2. Plate Tectonics Theory and Major Tectonic Plates',
        content: [
          'Plate tectonics theory states that the lithosphere is not a single unbroken shell but is fractured into 7 major plates (Pacific, Eurasian, Indo-Australian, North American, South American, African, Antarctic) plus several minor plates.',
          'Tectonic plates are not stationary; driven by mantle convection currents, they drift slowly at rates of a few centimeters per year.',
        ],
      },
      {
        sectionTitle: '3. Types of Tectonic Plate Boundaries',
        content: [
          'a) Divergent boundaries (spreading): Two plates move apart while magma wells up to create mid-ocean ridges and new seafloor (e.g., Mid-Atlantic Ridge).',
          'b) Convergent boundaries (collision/subduction): Two plates collide. Where an oceanic plate meets a continental plate, the denser oceanic plate subducts, creating deep trenches and volcanic arcs; where two continental plates collide, crustal folding uplifts towering young mountains (e.g., Himalayas from India colliding with Eurasia).',
          'c) Transform boundaries (strike-slip): Two plates slide horizontally past one another, forming major faults with shallow yet intense earthquakes (e.g., San Andreas Fault in North America).',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Lithosphere',
        definition: 'Earth’s rigid outer shell combining the crust and uppermost mantle, approximately 100 km thick.',
      },
      {
        term: 'Plate Tectonics',
        definition: 'A geological theory explaining the motion of rigid lithospheric plates over the ductile asthenosphere, driving earthquakes, volcanism, and mountain building.',
      },
      {
        term: 'Subduction',
        definition: 'The process where a denser oceanic tectonic plate sinks beneath an adjacent plate into the mantle.',
      },
    ],
    realWorldExamples: [
      'Lang Son province (including Chi Lang and Van Linh) rests wholly on the Eurasian Plate, shaped by ancient NW–SE tectonic fault zones such as the Cao Bang–Lang Son fault.',
      'Neotectonic uplift raised ancient limestone blocks in Chi Lang, creating sheer rocky peaks and fertile closed karst basins in Van Linh commune.',
    ],
    keyTakeaways: [
      'The lithosphere comprises the crust and upper solid mantle (~100 km thick).',
      'Earth’s surface consists of 7 major plates continuously drifting atop the asthenosphere.',
      'Plate margins concentrate most of the planet’s earthquakes, volcanoes, and major folded mountain belts.',
    ],
  },
  'bai-7': {
    title: 'Lesson 7. Endogenic and Exogenic Forces',
    subtitle: 'Uplift, subsidence, folding, and faulting by endogenic forces vs. weathering, erosion, transport, and deposition by exogenic forces',
    objectives: [
      'Distinguish the definitions and energy sources of endogenic and exogenic forces.',
      'Describe endogenic impacts: vertical epeirogenic uplift/subsidence and horizontal folding and faulting shaping macro-relief.',
      'Analyze the 4 exogenic processes: weathering (physical, chemical, biological), erosion/denudation, transportation, and deposition.',
      'Explain the formation of distinctive limestone karst relief in Chi Lang and Van Linh (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Impact of Endogenic Forces on Earth’s Surface Relief',
        content: [
          'Endogenic forces originate inside Earth, powered primarily by radioactive decay, gravitational differentiation, and thermochemical reactions.',
          'a) Vertical movements (epeirogenic uplift and subsidence): Occur slowly over broad areas, lifting regions into continents or depressing basins beneath seas, causing marine transgressions and regressions.',
          'b) Horizontal movements: Cause folding and faulting. Ductile rock strata under compression bend into anticlines and synclines forming folded mountain chains; rigid rock strata fracture under compression or tension into faults, grabens, and horsts.',
        ],
        highlight: 'The general tendency of endogenic forces is to make Earth’s surface more rugged, creating major macro-scale landforms.',
      },
      {
        sectionTitle: '2. Impact of Exogenic Forces on Earth’s Surface Relief',
        content: [
          'Exogenic forces originate externally on Earth’s surface, powered chiefly by solar radiation, wind, rain, running water, organisms, and human activity.',
          'a) Weathering: Breaks down and alters rock in place. Physical weathering (temperature swings, frost wedging); chemical weathering (water and acids dissolving minerals, notably limestone karstification); biological weathering (plant roots and microbes).',
          'b) Erosion/denudation: Running water, wind, waves, and ice dislodge and remove weathered debris (fluvial erosion, deflation, marine abrasion).',
          'c) Transportation and deposition: Water and wind carry sediment away and deposit it in low basins, building alluvial plains, floodplains, and sand dunes.',
        ],
      },
      {
        sectionTitle: '3. Mutual Relationship Between Endogenic and Exogenic Forces',
        content: [
          'Endogenic and exogenic forces are opposing yet simultaneous, continuously interacting to sculpt Earth’s relief.',
          'Endogenic forces uplift and roughen terrain; exogenic forces wear down highs and fill lows. Present-day topography reflects millions of years of their combined interplay.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Endogenic Forces',
        definition: 'Internal forces originating within Earth that tend to uplift and increase the ruggedness of Earth’s surface.',
      },
      {
        term: 'Exogenic Forces',
        definition: 'External forces acting at Earth’s surface via solar energy, water, wind, and organisms that tend to level relief.',
      },
      {
        term: 'Karst Phenomenon',
        definition: 'Chemical weathering caused by slightly acidic water dissolving calcium carbonate (CaCO3) in limestone, forming caves, towers, and karst valleys.',
      },
    ],
    realWorldExamples: [
      'The terrain of Chi Lang and Van Linh (Lang Son) clearly illustrates endogenic uplift of ancient limestone beds followed by exogenic chemical karst weathering producing steep limestone towers, caves, and enclosed valleys.',
      'In Van Linh commune, limestone weathering produces nutrient-rich reddish-brown soils accumulating at hill bases, ideal for cultivating specialty Chi Lang custard apples.',
    ],
    keyTakeaways: [
      'Endogenic forces uplift rugged relief; exogenic forces erode peaks and fill basins.',
      'The four exogenic stages are Weathering -> Erosion -> Transportation -> Deposition.',
      'Chi Lang’s limestone terrain results from chemical karst weathering on sedimentary carbonate bedrock.',
    ],
  },
  'bai-8': {
    title: 'Lesson 8. Practice: Distribution of Earthquake and Volcanic Belts',
    subtitle: 'The Pacific Ring of Fire, Alpine-Mediterranean belt, and tectonic plate margins in relation to natural hazards',
    objectives: [
      'Locate the world’s 2 largest earthquake and volcanic belts on a map: the Pacific Ring of Fire and the Mediterranean–Himalayan belt.',
      'Explain why earthquakes and volcanoes cluster closely along tectonic plate boundaries.',
      'Calculate earthquake percentage shares and tsunami propagation speeds across ocean depths.',
      'Outline disaster preparedness measures against seismic aftershocks and rockfalls in mountainous Lang Son province.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Global Distribution of Earthquake and Volcanic Belts',
        content: [
          'Earthquakes and volcanoes are not randomly scattered; they cluster along narrow belts stretching tens of thousands of kilometers.',
          'a) Pacific Ring of Fire: Spanning over 40,000 km around the Pacific basin (from New Zealand through Indonesia, the Philippines, Japan, the Aleutians, western North America down to the Andes). It accounts for over 75% of active volcanoes and about 90% of major global earthquakes.',
          'b) Mediterranean–Himalayan seismic-volcanic belt: Extends from the Atlantic through the Mediterranean, Anatolia, the Caucasus, and the Himalayas into Southeast Asia, where the African and Indian plates collide with Eurasia.',
        ],
        highlight: 'The Pacific Ring of Fire is Earth’s most active geological crucible, concentrating major earthquakes, volcanism, and tsunamis.',
      },
      {
        sectionTitle: '2. Relationship Between Plate Boundaries and Hazard Zones',
        content: [
          'Along convergent subduction zones, oceanic crust sinks into the hot mantle, generating intense magma pressure that erupts as volcanoes and releasing elastic strain as powerful earthquakes.',
          'Sudden vertical displacement of the seafloor during undersea earthquakes transfers immense energy into the water column, triggering tsunamis traveling hundreds of kilometers per hour.',
        ],
      },
      {
        sectionTitle: '3. Calculation Skills and Disaster Risk Prevention',
        content: [
          'Deep-water tsunami wave speed formula: v = √(g × h), where g = 9.8 m/s² is gravitational acceleration and h is ocean depth (m). Near shallow coasts, speed decreases while wave height surges tens of meters with devastating impact.',
          'Although Vietnam lies outside the Pacific Ring of Fire, its territory remains exposed to intracontinental fault activity.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Pacific Ring of Fire',
        definition: 'A horseshoe-shaped tectonic belt encircling the Pacific Ocean where most of Earth’s earthquakes and active volcanoes occur.',
      },
      {
        term: 'Tsunami',
        definition: 'A series of massive, fast-moving ocean waves triggered primarily by sudden seafloor displacement from submarine earthquakes.',
      },
      {
        term: 'Aftershock',
        definition: 'Smaller seismic tremors occurring along the same fault zone following a major mainshock earthquake.',
      },
    ],
    realWorldExamples: [
      'In Lang Son province and the Chi Lang area, severe earthquake risk is low due to their interior position on the Eurasian Plate; however, Chi Lang’s steep limestone slopes require vigilance against rockfalls after prolonged heavy rains.',
      'In Van Linh commune, residents reinforce houses and anchor hillside pulley-winch systems firmly to solid bedrock outcrops to ensure safety during minor geological vibrations.',
    ],
    keyTakeaways: [
      'Earthquakes and volcanoes align directly with tectonic plate boundaries.',
      'The Pacific and Mediterranean–Himalayan belts represent Earth’s two greatest seismic zones.',
      'Quantitative calculation of seismic shares and tsunami speeds supports accurate disaster risk awareness.',
    ],
  },
  'bai-9': {
    title: 'Lesson 9. The Atmosphere and Climatic Elements',
    subtitle: 'Atmospheric structure, global air temperature distribution, air pressure, planetary winds, and precipitation mechanisms',
    objectives: [
      'Describe Earth’s atmospheric layers, highlighting the role of the troposphere in weather phenomena.',
      'Analyze rules of air temperature distribution by latitude, continent–ocean contrast, and terrain relief.',
      'Explain global pressure belts and the mechanisms of Trade winds, Westerlies, and Monsoons.',
      'Calculate annual temperature range and mean temperature, and explain why Lang Son experiences the coldest winters in Vietnam.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Overview of the Atmosphere and Tropospheric Structure',
        content: [
          'The atmosphere is the gaseous envelope surrounding Earth, extending thousands of kilometers outward and shielding life from harmful cosmic radiation and meteoroids.',
          'The troposphere: The lowest layer (8 km thick at the poles to 16 km at the Equator), holding 80% of atmospheric mass and nearly all water vapor. Vertical convective motion generates weather events such as clouds, rain, thunderstorms, and winds. Temperature drops by an average of 0.6°C per 100 m increase in altitude.',
        ],
        highlight: 'Tropospheric lapse rule: Temperature drops 0.6°C per 100 m ascent on moist windward slopes and rises 1.0°C per 100 m descent on dry leeward slopes (Föhn effect).',
      },
      {
        sectionTitle: '2. Distribution of Air Temperature and Governing Factors',
        content: [
          'a) By latitude: Moving from the Equator toward the poles, solar incidence angle declines, reducing insolation; thus mean annual temperature decreases while annual temperature range increases.',
          'b) By continents and oceans: Land absorbs and radiates heat faster than seawater. Consequently, continents have hotter summers, colder winters, and far larger annual temperature ranges inland than coastal regions.',
          'c) By relief/terrain: Temperature falls with elevation; sun-facing and windward slopes experience distinct temperatures and rainfall compared with leeward slopes.',
        ],
      },
      {
        sectionTitle: '3. Atmospheric Pressure, Winds, and Precipitation Mechanisms',
        content: [
          'Atmospheric pressure is the weight of air pressing onto Earth’s surface. High and low pressure belts alternate symmetrically across the Equator: Equatorial Low -> Subtropical High -> Subpolar Low -> Polar High.',
          'Wind is horizontal air movement from high to low pressure. Three major systems: Trade Winds (subtropics to Equator, generally dry), Westerlies (subtropics to mid-latitudes, moist), and Monsoons (seasonal winds driven by land–sea thermal contrasts).',
          'Precipitation occurs when moist air rises, cools, and condenses. Rainfall is heavy in low-pressure belts, ITCZ zones, monsoon coasts, and windward slopes; scarce in high-pressure belts, continental interiors, and along cold currents.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Troposphere',
        definition: 'The lowest atmospheric layer holding 80% of air mass where nearly all weather—clouds, rain, wind, storms—takes place.',
      },
      {
        term: 'Annual Temperature Range',
        definition: 'The difference between the mean temperature of the warmest month and the coldest month of the year.',
      },
      {
        term: 'Monsoon',
        definition: 'A seasonal wind whose prevailing direction reverses between winter and summer due to land–sea thermal and pressure contrasts.',
      },
    ],
    realWorldExamples: [
      'Lang Son province (including Chi Lang and Van Linh) sits at the northern gateway directly facing Northeast Winter Monsoons channeled through arc-shaped mountain ranges, giving it Vietnam’s earliest and coldest winters (sometimes below 5°C with frost).',
      'In summer, Van Linh’s enclosed limestone valleys warm rapidly by day and cool sharply at night, creating wide diurnal temperature swings ideal for sugar accumulation in Chi Lang custard apples.',
    ],
    keyTakeaways: [
      'In the troposphere, moist rising air cools at 0.6°C/100 m, while dry descending air warms at 1.0°C/100 m.',
      'From the Equator to the poles, mean annual temperature falls while annual temperature range widens.',
      'Lang Son’s climate is tropical monsoon with cold winters amplified by wind-funneling arc topography.',
    ],
  },
  'bai-10': {
    title: 'Lesson 10. Practice: Reading Global Climate Maps and Analyzing Climographs',
    subtitle: 'Interpreting world climate zone maps, identifying the 7 climate belts, and analyzing temperature–precipitation graphs',
    objectives: [
      'Identify the spatial extent of the 7 main climate belts on the world climate map.',
      'Master steps for reading a climograph: warmest month, coldest month, annual range, total annual rainfall, and seasonal precipitation regime.',
      'Distinguish thermal and moisture regimes across 4 classic climate types: tropical monsoon, temperate maritime, temperate continental, and Mediterranean.',
      'Calculate total annual precipitation and rainy-season shares, and analyze observed climate data from the Lang Son meteorological station.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Global Climate Belts and Climate Types',
        content: [
          'Each hemisphere contains 7 climate belts arranged symmetrically from the Equator: Equatorial -> Subequatorial -> Tropical -> Subtropical -> Temperate -> Subpolar -> Polar.',
          'Within each belt, continent–ocean contrast, topography, and atmospheric circulation subdivide climates into distinct types (e.g., temperate maritime vs. temperate continental; Mediterranean vs. subtropical monsoon).',
        ],
        highlight: 'Climate belts follow latitudinal zonality from Equator to poles, while internal climate types reflect azonal differentiation.',
      },
      {
        sectionTitle: '2. Procedure for Analyzing Temperature and Rainfall Climographs',
        content: [
          'Step 1: Analyze the temperature line (°C): Find maximum and minimum monthly temperatures, compute annual range (Max - Min), and note whether the year is warm year-round or features a cold winter.',
          'Step 2: Analyze the rainfall bars (mm): Sum all 12 months for annual total rainfall, and identify wet-season versus dry-season months.',
          'Step 3: Synthesize thermal and moisture regimes to classify the climate type and explain its formation.',
        ],
      },
      {
        sectionTitle: '3. Comparison of 4 Representative Climate Types',
        content: [
          'Tropical monsoon climate: High annual mean temperature (>20°C), hot rainy summer, cool/cold drier winter, high annual rainfall (1,500–2,000 mm).',
          'Temperate maritime climate: Mild summers and cool winters (coldest month >0°C), year-round rainfall averaging 800–1,000 mm.',
          'Temperate continental climate: Short warm summers and long freezing snowy winters (<0°C), modest summer-peak rain, very large annual temperature range.',
          'Mediterranean subtropical climate: Hot dry summers and mild rainy winters (inverse seasonal precipitation).',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Climograph',
        definition: 'A combined chart plotting monthly mean temperature as a line and monthly precipitation as vertical bars across 12 months at a weather station.',
      },
      {
        term: 'Total Annual Precipitation',
        definition: 'The sum of all rainfall (in millimeters) recorded at a meteorological station across all 12 months of the year.',
      },
      {
        term: 'Climate Belt',
        definition: 'A broad latitudinal zone across Earth’s surface exhibiting relatively uniform thermal regimes and atmospheric circulation.',
      },
    ],
    realWorldExamples: [
      'Lang Son meteorological station records a mean annual temperature of ~21.5°C, ranging from ~13.0°C in January to ~27.2°C in July (annual range 14.2°C), with ~1,450 mm annual rainfall concentrated (>80%) from May to September.',
      'Students in Van Linh commune (Lang Son) compare these measurements to see how local summer rains coincide with peak Chi Lang custard-apple fruit growth and harvest around the eighth lunar month.',
    ],
    keyTakeaways: [
      'Climograph interpretation follows 3 steps: temperature analysis -> rainfall analysis -> climate classification.',
      'Vietnam and Lang Son province feature a tropical monsoon climate clearly divided into a hot rainy season and a cool dry season.',
    ],
  },
  'bai-11': {
    title: 'Lesson 11. The Hydrosphere and Continental Waters',
    subtitle: 'The hydrological cycle, river feeding sources, river discharge regimes, and freshwater protection',
    objectives: [
      'Summarize the composition of the hydrosphere and analyze the small and large water cycles on Earth.',
      'Analyze river recharge sources and factors controlling river flow regimes (climate, relief, vegetation, lakes).',
      'Present the roles of groundwater and lakes and the urgency of protecting freshwater resources.',
      'Calculate river discharge and total runoff volume, and relate concepts to streams and rivers in Chi Lang and Van Linh (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Concept of the Hydrosphere and the Water Cycle',
        content: [
          'The hydrosphere is Earth’s discontinuous liquid shell comprising saltwater in seas and oceans (97.5%) and freshwater on continents (2.5%, largely locked in polar ice caps and mountain glaciers).',
          'Small water cycle: Ocean water evaporates -> condenses into clouds -> falls directly back as rain over the ocean.',
          'Large water cycle: Ocean water evaporates -> winds carry moisture inland -> precipitation falls on continents -> water infiltrates as groundwater or flows over land as rivers returning to the sea.',
        ],
        highlight: 'The large hydrological cycle links oceans and continents, sustaining life and continuously renewing freshwater supplies.',
      },
      {
        sectionTitle: '2. Continental Waters: Rivers and Streamflow Regimes',
        content: [
          'A river is a natural, relatively stable perennial water channel across land; a drainage basin is the catchment area supplying its water.',
          'Recharge sources: Rainfall (river regime closely mirrors precipitation seasons); snowmelt/glaciers (spring–summer floods upon melting); groundwater (vital baseflow regulator during dry seasons).',
          'Factors governing river regimes: Climate (determines discharge and flood season), topography (steep slopes drive rapid flood spikes), vegetation cover (forests regulate flow and curb flash floods), and lakes/swamps (buffer flow extremes).',
        ],
      },
      {
        sectionTitle: '3. Groundwater, Lakes, and Freshwater Conservation',
        content: [
          'Groundwater resides in subterranean aquifers and constitutes a vital domestic and agricultural water supply.',
          'Freshwater is scarce and increasingly threatened by pollution and climate change, requiring efficient consumption, headwater forest protection, and thorough wastewater treatment.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Hydrosphere',
        definition: 'Earth’s entire water envelope encompassing oceans, rivers, lakes, glaciers, groundwater, and atmospheric vapor.',
      },
      {
        term: 'Stream Discharge (Q)',
        definition: 'The volume of water passing a river cross-section at a gauging point per second, measured in m³/s.',
      },
      {
        term: 'River Regime',
        definition: 'The seasonal variation in a river’s water level and discharge across a one-year cycle, divided into flood and low-water seasons.',
      },
    ],
    realWorldExamples: [
      'In the Chi Lang area (Lang Son), the Thuong River flows through limestone valleys with a rainy-season flood period from June to September and low-water flow from October to May.',
      'In Van Linh commune (Lang Son), karst limestone valleys hold abundant underground streams and aquifers; farmers drill wells and build small weirs to irrigate custard-apple orchards in the dry season.',
    ],
    keyTakeaways: [
      'Freshwater represents just 2.5% of Earth’s water, mostly stored as ice and groundwater.',
      'River discharge regimes reflect climate, terrain slope, vegetation cover, and recharge sources.',
      'Protecting headwater forests in Lang Son is vital to sustain aquifers and reduce flash floods in Chi Lang.',
    ],
  },
  'bai-12': {
    title: 'Lesson 12. Seas and Oceans',
    subtitle: 'Seawater salinity and temperature, marine dynamics (waves, tides, ocean currents), and the role of the oceans',
    objectives: [
      'State mean ocean salinity and surface temperature; explain variations by latitude and freshwater river inflow.',
      'Analyze causes generating wind waves, tsunamis, and tidal cycles (spring tides and neap tides across lunar phases).',
      'Trace warm and cold ocean current pathways and their climatic effects on coastal margins.',
      'Calculate crystallized sea salt mass from salinity and hydrostatic seawater pressure with depth.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Properties of Seawater',
        content: [
          'a) Salinity: Average ocean salinity is 35‰ (35 grams of dissolved salts—mostly NaCl—per 1,000 g of seawater), varying with evaporation rates, rainfall, and river runoff.',
          'b) Seawater temperature: Mean ocean surface temperature is 17.5°C, decreasing from the Equator toward the poles and dropping with depth (below 1,000 m, temperatures stay cold at 0–3°C).',
        ],
        highlight: 'Salt yield formula: Salt Mass = Seawater Volume × Density × (Salinity / 1000).',
      },
      {
        sectionTitle: '2. Movements of Seawater: Waves, Tides, and Ocean Currents',
        content: [
          'a) Ocean waves: Oscillatory motion of surface water particles driven primarily by wind; stronger winds create larger waves, whereas tsunamis originate from submarine earthquakes or volcanic eruptions.',
          'b) Tides: Periodic rise and fall of sea levels caused by gravitational attraction of the Moon and Sun combined with Earth’s centrifugal force. Alignment at New Moon and Full Moon creates spring tides; perpendicular alignment at quarter moons produces neap tides.',
          'c) Ocean currents: Directional streams of vast ocean water masses. Warm currents raise coastal temperatures and rainfall; cold currents cool coasts and create arid coastal deserts.',
        ],
      },
      {
        sectionTitle: '3. Role of Seas and Oceans for Humanity',
        content: [
          'Regulates global climate, absorbs vast amounts of CO2, and generates over half of Earth’s atmospheric oxygen.',
          'Supplies rich marine fisheries, sea salt, seabed minerals (oil, gas, placer sands), and wave and tidal renewable energy.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Salinity',
        definition: 'The total mass of dissolved mineral salts (in grams) per kilogram or liter of seawater, expressed in parts per thousand (‰).',
      },
      {
        term: 'Spring Tide',
        definition: 'The monthly tidal maximum with the highest high tides and lowest low tides, occurring when Sun, Moon, and Earth align.',
      },
      {
        term: 'Ocean Current',
        definition: 'A continuous directional flow of massive ocean water volumes driven primarily by prevailing planetary wind belts.',
      },
    ],
    realWorldExamples: [
      'Although Lang Son is an inland mountainous province, maritime air circulation and Southeast Monsoons from the Gulf of Tonkin transport abundant moisture inland, fueling summer rains in Chi Lang and Van Linh.',
      'Marine salt harvested along Vietnam’s northern coast travels along National Highway 1A to Chi Lang and Van Linh for food processing and livestock nutrition.',
    ],
    keyTakeaways: [
      'Average ocean salinity is 35‰; sea temperature decreases with latitude and depth.',
      'Three ocean movements are waves (wind-driven), tides (lunar/solar gravity), and currents (wind-driven circulation).',
      'Oceans play a decisive role in global climate regulation and biological productivity.',
    ],
  },
  'bai-13': {
    title: 'Lesson 13. Practice: Analyzing the Flow Regime of the Red River',
    subtitle: 'Processing Red River discharge data at Son Tay station, computing flood-season shares, and linking flow to climate',
    objectives: [
      'Calculate mean annual river discharge from a 12-month hydrological data table.',
      'Compute the percentage share of flood-season discharge (June–October) relative to total annual runoff at Son Tay station.',
      'Construct line or bar charts illustrating seasonal discharge fluctuations of the Red River.',
      'Explain why Red River floods coincide with northern Vietnam’s rainy monsoon season and relate to river regimes in Lang Son.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Overview of the Red River System and Son Tay Hydrological Station',
        content: [
          'The Red River (Thao River) is northern Vietnam’s largest river basin (>169,000 km²), originating in Yunnan (China) and emptying into the Gulf of Tonkin.',
          'Son Tay hydrological station monitors combined flow before the river branches across the Red River Delta, accurately reflecting the hydrology of the entire basin.',
        ],
        highlight: 'The Red River features a fan-shaped tributary network where the Da and Lo rivers converge near Viet Tri, causing rapid flood concentration.',
      },
      {
        sectionTitle: '2. Data Processing and Red River Flow Characteristics',
        content: [
          'The flood season spans 5 months (June to October), accounting for 75% to 80% of annual discharge, peaking in August during intense northern storm rains.',
          'The low-water season spans 7 months (November to May), supplying only 20% to 25% of annual discharge and reaching its minimum in March.',
        ],
      },
      {
        sectionTitle: '3. Calculating Hydrological Indicators',
        content: [
          '1. Mean annual discharge: Q_mean = (Sum of 12 monthly discharges) / 12 (m³/s).',
          '2. Total flood-season discharge: Q_flood = Q_Jun + Q_Jul + Q_Aug + Q_Sep + Q_Oct.',
          '3. Flood-season share (%): Flood Share = (Q_flood / Q_annual) × 100%.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Hydrological Station',
        definition: 'A monitoring facility measuring river water levels, stream discharge, sediment load, and water temperature in real time.',
      },
      {
        term: 'Red River Flood Season',
        definition: 'The annual period from June to October when Red River discharge exceeds its mean annual flow.',
      },
      {
        term: 'Peak Flood',
        definition: 'The highest river stage or discharge recorded during a flood event or calendar year (typically in August).',
      },
    ],
    realWorldExamples: [
      'In Lang Son province, the Thuong River rising in Chi Lang displays a flow regime similar to the Red River, flooding from June to September under humid Southeast Monsoon rains.',
      'The Ky Cung River in Lang Son flows distinctively southeast-to-northwest into China; studying the Red River regime helps Hoa Binh High School students grasp highland watershed hydrology around Chi Lang.',
    ],
    keyTakeaways: [
      'The Red River flood season lasts 5 months (June–October) and carries 75–80% of annual water volume.',
      'Red River discharge tracks northern Vietnam’s rainy monsoon season closely.',
      'Master calculating flood-season percentage shares and interpreting hydrographs.',
    ],
  },
  'bai-14': {
    title: 'Lesson 14. Soils on Earth',
    subtitle: 'Concept of soil, soil fertility, soil horizons, and the natural and human factors of soil formation',
    objectives: [
      'Define soil (pedosphere) and recognize soil fertility as its essential defining property.',
      'Describe typical horizons in a vertical soil profile from the surface down to bedrock.',
      'Analyze the roles of the 5 natural soil-forming factors (parent rock, climate, organisms, relief, time) plus human influence.',
      'Calculate soil humus content and explain limestone-derived ferralsol properties in Chi Lang and Van Linh (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Concept of Soil and Soil Fertility',
        content: [
          'Soil is the thin, loose surface layer covering continents, formed from rock alteration under the action of climate, organisms, and human management.',
          'Soil fertility is the capacity of soil to supply water, nutrients, warmth, and aeration needed for plant growth and crop yields.',
        ],
        highlight: 'Fertility is the fundamental attribute distinguishing living soil from barren rock or pure sand.',
      },
      {
        sectionTitle: '2. Soil Profile and Major Soil Horizons',
        content: [
          'A soil profile is a vertical cross-section revealing distinct horizons from the surface down to unweathered parent bedrock.',
          'Key horizons include: Surface organic litter layer -> Humus-rich topsoil (dark organic matter) -> Eluvial leaching horizon -> Illuvial accumulation horizon (clay, iron, aluminum) -> Weathered parent material -> Solid bedrock.',
        ],
      },
      {
        sectionTitle: '3. Soil-Forming Factors',
        content: [
          'a) Parent rock: Supplies mineral matter and determines initial mineral composition, particle texture, and chemical traits.',
          'b) Climate: Heat and moisture drive rock weathering and regulate organic accumulation versus decomposition.',
          'c) Organisms: Supply organic residues (plants), decompose litter into humus (microbes), and aerate soil (burrowing fauna).',
          'd) Relief/topography: Controls soil depth and moisture distribution; steep slopes suffer erosion with thin soils, whereas valleys accumulate deep alluvial layers.',
          'e) Time (soil age): Duration of pedogenesis; ancient tropical soils often exhibit deep weathering profiles.',
          'f) Human activity: Can enhance fertility (organic manuring, sustainable tillage) or degrade soil (deforestation, slash-and-burn, chemical overuse).',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Soil (Pedosphere)',
        definition: 'The thin, unconsolidated surface layer on continents capable of supporting plant biomass through fertility.',
      },
      {
        term: 'Soil Fertility',
        definition: 'The ability of soil to provide water, mineral nutrients, air, and warmth to sustain plant growth.',
      },
      {
        term: 'Ferralsol (Feralit Soil)',
        definition: 'The major soil group of humid tropical regions, rich in iron and aluminum oxides with characteristic reddish-yellow hues.',
      },
    ],
    realWorldExamples: [
      'In Van Linh and Chi Lang (Lang Son), the dominant soil is ferralsol weathered over limestone (reddish-brown and yellowish-brown loam), featuring deep well-drained topsoil rich in calcium and humus—key to large, sweet Chi Lang custard apples.',
      'Farmers in Van Linh actively apply composted farmyard manure and bio-organic fertilizers while reducing synthetic chemicals to sustain orchard soil fertility.',
    ],
    keyTakeaways: [
      'Fertility is the defining property of soil.',
      'Soil forms through the combined interaction of 5 natural factors and human management.',
      'Limestone-derived ferralsol in Chi Lang (Lang Son) is a prized soil asset for specialty fruit cultivation.',
    ],
  },
  'bai-15': {
    title: 'Lesson 15. The Biosphere',
    subtitle: 'Concept and limits of the biosphere, ecological features, and factors influencing species distribution',
    objectives: [
      'Define the biosphere and delineate its vertical boundaries on Earth.',
      'Analyze the mechanisms by which natural factors (climate, water, soil, terrain, biotic interactions) govern organism growth and distribution.',
      'Evaluate positive and negative human impacts on the biosphere.',
      'Calculate plant biomass and analyze limestone-mountain forest ecosystems in Chi Lang and Van Linh (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Concept and Extent of the Biosphere',
        content: [
          'The biosphere is Earth’s living sphere encompassing all living organisms (plants, animals, microorganisms) together with their physical habitats.',
          'Extent of the biosphere: Spans the lower atmosphere (troposphere up to ~20–22 km near the ozone layer), the entire hydrosphere (down to 11,000 m ocean trenches), and the upper lithosphere (tens to hundreds of meters in weathered soil/rock). Life concentrates densest where Earth’s spheres meet near the surface.',
        ],
        highlight: 'Organisms cluster most densely at the interface of land surfaces, near-ground air, and sunlit upper ocean waters.',
      },
      {
        sectionTitle: '2. Factors Governing the Growth and Distribution of Organisms',
        content: [
          'a) Climate: The most decisive factor—temperature and moisture set species growth thresholds and distribution boundaries, while sunlight drives photosynthesis.',
          'b) Water: Forms living cells and dissolves mineral nutrients; water-rich habitats support lush biodiversity.',
          'c) Soil (pedosphere): Supplies minerals and nutrients, matching distinct plant communities to specific soil types.',
          'd) Terrain/relief: Elevation and slope aspect alter temperature and moisture, producing altitudinal vegetation belts.',
          'e) Biotic interactions: Shade-tolerant plants thrive under canopy trees; herbivores follow grasslands; carnivores track herbivores.',
          'f) Human beings: Expand ranges of domesticated crops and livestock or shrink natural forests and drive species toward extinction.',
        ],
      },
      {
        sectionTitle: '3. Biodiversity and Biosphere Conservation',
        content: [
          'The biosphere provides food, medicines, timber, and regulates global biogeochemical cycles.',
          'Protecting the biosphere preserves genetic resources and sustains Earth’s ecological equilibrium.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Biosphere',
        definition: 'The sphere of Earth inhabited by living organisms, encompassing all life forms and their environments.',
      },
      {
        term: 'Photosynthesis',
        definition: 'The biological process by which green plants convert solar energy, CO2, and water into organic matter and release oxygen.',
      },
      {
        term: 'Biodiversity',
        definition: 'The variety and richness of genetic traits, biological species, and ecosystems across Earth.',
      },
    ],
    realWorldExamples: [
      'In Chi Lang and Van Linh (Lang Son), karst limestone mountain forests support resilient drought-adapted trees anchoring roots in rock crevices such as ironwood (nghien), lim, lianas, and wildlife including macaques and serows.',
      'Van Linh commune actively reforests and safeguards headwater protection forests to retain moisture and stabilize microclimates for Chi Lang custard-apple orchards.',
    ],
    keyTakeaways: [
      'The biosphere spans broad vertical limits, with life densest at Earth’s surface and upper ocean layers.',
      'Climate is the primary factor governing global species distribution.',
      'Conserving karst forest ecosystems in Lang Son protects biodiversity and watershed stability.',
    ],
  },
  'bai-16': {
    title: 'Lesson 16. Practice: Global Distribution of Soils and Biomes',
    subtitle: 'Reading world soil and vegetation maps and analyzing thermal–moisture correlations across natural zones',
    objectives: [
      'Locate major global vegetation biomes and primary soil groups from the Equator to the poles.',
      'Analyze the close correlation among climate, natural vegetation, and soil types across biomes.',
      'Compute percentage shares of major continental soil groups.',
      'Relate and explain ferralsol and tropical monsoon forest distribution in Lang Son province.',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Global Distribution of Major Vegetation Biomes',
        content: [
          'From the Equator toward the poles, biomes align with climate belts: Equatorial/tropical rainforests -> tropical savannas and scrub -> deserts and semi-deserts -> humid subtropical forests -> Mediterranean sclerophyllous scrub -> temperate grasslands (steppes) -> temperate broadleaf/mixed forests -> boreal coniferous taiga -> tundra -> polar ice deserts.',
        ],
        highlight: 'Vegetation is a mirror of climate; wherever climate shifts, both vegetation and soil change in tandem.',
      },
      {
        sectionTitle: '2. Global Distribution of Major Soil Groups',
        content: [
          'Global soil distribution matches climate belts and vegetation zones closely:',
          '- Tropical zone: Red-yellow ferralsols beneath rainforests; reddish-brown savanna soils.',
          '- Subtropical zone: Subtropical red-yellow soils; Mediterranean brown-red soils.',
          '- Temperate zone: Temperate steppe chernozem (black soil, Earth’s most fertile); broadleaf brown-gray forest soils; boreal taiga podzols.',
          '- Subpolar and polar zones: Tundra gley soils waterlogged during summer thaw.',
        ],
      },
      {
        sectionTitle: '3. Unified Correlation Among Climate, Vegetation, and Soil',
        content: [
          'Thermal and moisture conditions govern plant productivity; leaf litter falls to the ground and decomposes via microbes to build humus and determine soil type.',
          'This unified pairing provides vivid evidence of latitudinal zonality across nature.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Vegetation Biome',
        definition: 'All plant communities covering a specific geographic region under shared climatic conditions.',
      },
      {
        term: 'Podzol Soil',
        definition: 'An acidic soil group formed under cold boreal coniferous forests, characterized by an ash-gray leached horizon.',
      },
      {
        term: 'Chernozem (Black Steppe Soil)',
        definition: 'The most humus- and nutrient-rich soil on Earth, developed beneath temperate grassland steppes.',
      },
    ],
    realWorldExamples: [
      'In Lang Son province and the Chi Lang area, tropical monsoon climates with cold winters and steep terrain produced red-yellow ferralsols over shale and reddish-brown ferralsols over limestone supporting seasonal tropical monsoon forests.',
      'In Van Linh commune, soil distribution varies clearly by terrain: shallow rocky ferralsols on steep mountain slopes versus deep fertile alluvial-colluvial ferralsols in valley bottoms for farming.',
    ],
    keyTakeaways: [
      'Soils and vegetation co-distribute closely in harmony with Earth’s climatic belts.',
      'Build proficiency in reading soil and biome maps and explaining causal heat–moisture–organism links.',
    ],
  },
  'bai-17': {
    title: 'Lesson 17. The Geographic Envelope and the Law of Wholeness',
    subtitle: 'Concept and boundaries of the geographic envelope and the law of interconnected system dynamics',
    objectives: [
      'Identify the boundaries and 5 constituent spheres of the geographic envelope (lithosphere, atmosphere, hydrosphere, biosphere, pedosphere).',
      'State and explain the Law of Wholeness and Completeness of the geographic envelope.',
      'Demonstrate the law’s practical lesson: before altering one natural component, predict chain-reaction shifts across all others.',
      'Apply the law to explain consequences of headwater deforestation on streams, soil erosion, and rockfalls in Chi Lang (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Concept and Limits of the Geographic Envelope',
        content: [
          'The geographic envelope (landscape shell) is the planetary zone where Earth’s spheres (lithosphere, atmosphere, hydrosphere, biosphere, pedosphere) meet, interpenetrate, and continuously interact.',
          'Boundaries of the geographic envelope: Extending from the top of the troposphere (zone of clouds, rain, and climate) down to the base of weathered rock in the upper lithosphere (tens of meters deep), totaling ~30–35 km thick—far thinner than the full lithosphere yet hosting all environmental processes vital to humanity.',
        ],
        highlight: 'Roughly 30–35 km thick, the geographic envelope is the dynamic contact zone of all 5 natural spheres.',
      },
      {
        sectionTitle: '2. The Law of Wholeness and Completeness',
        content: [
          'Content of the law: All components and territorial units of the geographic envelope are mutually interdependent. No component exists in isolation; altering one element triggers cascading adjustments in the rest, transforming the entire natural landscape.',
          'Mechanism: Continuous fluxes of matter and energy circulate among spheres (hydrological cycle, carbon cycle, nitrogen cycle).',
        ],
      },
      {
        sectionTitle: '3. Profound Practical Significance of the Law',
        content: [
          'Before undertaking major environmental interventions (dam building, limestone quarrying, road cutting, forest clearing), planners must thoroughly forecast chain-reaction ecological consequences.',
          'Economic development must go hand-in-hand with ecological balance rather than sacrificing long-term natural order for short-term gains.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Geographic Envelope',
        definition: 'Earth’s ~30–35 km thick complex outer shell where natural spheres contact, interpenetrate, and interact to shape human habitats.',
      },
      {
        term: 'Law of Wholeness and Completeness',
        definition: 'The law stating that natural components mutually regulate one another so change in one element inevitably alters the others.',
      },
      {
        term: 'Chain Reaction Change',
        definition: 'A cascading sequence where an initial disturbance to one environmental factor triggers successive changes throughout an ecosystem.',
      },
    ],
    realWorldExamples: [
      'Practical lesson in Chi Lang (Lang Son): Clearing headwater forests on limestone ridges prevents rainfall retention -> accelerates soil erosion down to bare rock -> depletes dry-season groundwater needed to irrigate custard apples in Van Linh -> triggers rainy-season flash floods and boulder landslides toward villages.',
      'Recognizing this law, Van Linh residents combine custard-apple cultivation with forest stewardship to safeguard soil moisture and aquifers.',
    ],
    keyTakeaways: [
      'The geographic envelope is an integrated ~30–35 km synthesis of 5 natural spheres.',
      'Changing any single component transforms the entire natural system.',
      'Environmental impact assessment is indispensable before economic projects in Lang Son to preserve ecological balance.',
    ],
  },
  'bai-18': {
    title: 'Lesson 18. Zonal and Azonal Geographic Laws',
    subtitle: 'Latitudinal zonality driven by solar geometry versus altitudinal belts and continentality (azonal laws)',
    objectives: [
      'Present the concept, causes, and manifestations of latitudinal zonality in nature.',
      'Present the concept, causes, and manifestations of azonal laws (altitudinal zonation and longitudinal continentality).',
      'Compare zonal vs. azonal laws and recognize how both act simultaneously across any landscape.',
      'Calculate temperature variations by latitude and elevation, and explain vertical vegetation belts on Chi Lang limestone mountains (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. The Law of Latitudinal Zonality',
        content: [
          'Concept: Systematic latitudinal variation of all geographic components and landscapes from the Equator toward both poles.',
          'Cause: Earth’s spherical curvature and constant axial tilt reduce solar incidence angles and insolation from low to high latitudes.',
          'Manifestations: Zonal distribution of solar radiation -> 7 pressure belts and planetary winds -> 7 climate belts -> zonal soil and vegetation biomes across Earth.',
        ],
        highlight: 'Latitudinal zonality is nature’s most pervasive macro-scale law, organizing planetary environments from Equator to poles.',
      },
      {
        sectionTitle: '2. The Law of Azonality',
        content: [
          'Concept: Geographic distribution patterns independent of latitudinal belt order.',
          'Cause: Internal endogenic energy divides Earth’s surface into continents, oceans, and high mountain chains.',
          'Manifestations:',
          '- Altitudinal zonation: Changes in temperature (-0.6°C/100 m), moisture, soils, and vegetation belts with rising mountain elevation.',
          '- Continentality (longitudinal zonation): Progressive shifts in climate, soils, and biomes moving inland from ocean coasts as maritime moisture declines.',
        ],
      },
      {
        sectionTitle: '3. Interaction Between Zonal and Azonal Laws',
        content: [
          'Zonal and azonal processes operate simultaneously and reinforce or modify one another.',
          'Latitudinal zonality establishes the broad climatic framework, while azonal relief and continentality add rich regional and local diversity.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Latitudinal Zonality',
        definition: 'Systematic change of natural components and landscapes by latitude from Equator to poles due to declining solar incidence angles.',
      },
      {
        term: 'Azonality',
        definition: 'Spatial distribution independent of latitude, driven by mountain elevation (altitudinal belts) and distance from seas (continentality).',
      },
      {
        term: 'Altitudinal Zonation Law',
        definition: 'Vertical succession of thermal–moisture regimes, soils, and vegetation up mountainsides mirroring latitudinal transitions.',
      },
    ],
    realWorldExamples: [
      'Zonally, Lang Son lies within the tropical monsoon climate with cold winters; azonally, peaks exceeding 800–1,000 m develop montane subtropical belts supporting chestnut and laurel trees plus winter frost.',
      'In enclosed karst valleys of Van Linh and Chi Lang, winter nighttime thermal inversions (cold dense air pooling on valley floors) illustrate microclimatic azonality.',
    ],
    keyTakeaways: [
      'Latitudinal zonality is driven by solar radiation (exogenic energy) across latitudes.',
      'Azonality stems from endogenic mountain relief (altitudinal belts) and land–sea layout (continentality).',
      'Vietnam and Lang Son exhibit humid tropical monsoon zonality modified distinctly by highland altitudinal belts.',
    ],
  },
  'bai-19': {
    title: 'Lesson 19. Population Size, Population Growth, and Population Structure',
    subtitle: 'Global population size, natural vs. mechanical growth, biological structure, and socio-economic labor composition',
    objectives: [
      'Describe global population scale and current demographic growth deceleration trends.',
      'Distinguish natural increase rate (Tg = Birth - Death), mechanical growth (migration), and total population growth.',
      'Analyze biological population structure (sex, age, 3 population pyramid shapes) and social structure (economic sector labor shares).',
      'Calculate natural increase rates and sex ratios accurately and relate findings to Van Linh and Chi Lang (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Global Population Size and Growth',
        content: [
          'World population surpassed 8 billion in 2022 and continues rising, though annual growth rates are gradually slowing.',
          'Natural population growth: Difference between crude birth rate (CBR) and crude death rate (CDR), Tg = S - T (% or ‰), serving as the primary driver of global population change.',
          'Mechanical growth: Net difference between immigration and emigration—zero globally, yet decisive for individual countries and cities.',
          'Actual total growth: Combined sum of natural growth plus net mechanical migration.',
        ],
        highlight: 'Natural increase formula: Tg (%) = (CBR ‰ - CDR ‰) / 10. Sex ratio formula: SR = (Male Population / Female Population) × 100.',
      },
      {
        sectionTitle: '2. Biological Structure of Population',
        content: [
          'a) Sex structure: Proportion of males to females. Sex ratio SR = (Males / Females) × 100; sex percentage = (Males or Females / Total Population) × 100%, shaped by biology, wars, migration, and social norms.',
          'b) Age structure: Divided into 3 major cohorts—youth dependents (0–14), working-age population (15–64), and elderly dependents (65+).',
          'Population pyramids visually depict age and sex cohorts: expansive pyramid (young growing population), constrictive pyramid (aging population), and stationary pyramid.',
        ],
      },
      {
        sectionTitle: '3. Social Structure of Population',
        content: [
          'Labor structure by economic sector: Distribution across Sector I (Agriculture–Forestry–Fishery), Sector II (Industry–Construction), and Sector III (Services), shifting globally from agriculture toward industry and services.',
          'Educational structure: Measures human capital quality through literacy rates and mean years of schooling.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Natural Increase Rate (Tg)',
        definition: 'The difference between crude birth rate and crude death rate, indicating natural annual population growth in % or ‰.',
      },
      {
        term: 'Sex Ratio',
        definition: 'The number of males per 100 females in a given population.',
      },
      {
        term: 'Population Pyramid',
        definition: 'A horizontal stacked bar chart displaying the age and sex distribution of a country or region at a given point in time.',
      },
    ],
    realWorldExamples: [
      'In Van Linh commune (Lang Son), Tay, Nung, and Kinh ethnic communities live in solidarity; effective population and family planning policies reduced natural increase below 1.0% per year.',
      'Chi Lang and Van Linh currently enjoy a "golden demographic window" with working-age residents exceeding 65%, providing abundant young labor for intensive custard-apple farming and local crafts.',
    ],
    keyTakeaways: [
      'Natural growth drives global demographic change; Tg = (CBR - CDR)/10 (%).',
      'Age and sex compositions are accurately visualized via population pyramids.',
      'Lang Son’s demographic dividend creates strong momentum for commodity agricultural development.',
    ],
  },
  'bai-20': {
    title: 'Lesson 20. Population Distribution and Urbanization',
    subtitle: 'Global settlement patterns, governing factors, and characteristics and impacts of urbanization',
    objectives: [
      'Define population density and explain why human settlement is unevenly distributed worldwide.',
      'Analyze how physical factors (location, terrain, climate, water) and socio-economic factors (production mode, history) shape settlement.',
      'Present the definition, 3 core features, and dual positive/negative impacts of urbanization.',
      'Calculate population density and urban population shares, and relate settlement networks in Van Linh and Chi Lang (Lang Son).',
    ],
    keyKnowledge: [
      {
        sectionTitle: '1. Global Population Distribution',
        content: [
          'Earth’s population is distributed very unevenly across space:',
          '- Densely populated zones: Fertile alluvial river deltas, coastal lowlands, mild humid valleys, and industrialized urban corridors (East Asia, South Asia, Western Europe, Northeastern USA).',
          '- Sparsely populated zones: Frigid polar wastes, arid deserts (Sahara, Central Asia), and rugged high mountains or dense tropical jungles (Amazon).',
          'Key indicator: Population Density = Total Population / Land Area (people/km²).',
        ],
        highlight: 'The level of productive forces and character of the economy serve as the decisive direct determinant of population distribution.',
      },
      {
        sectionTitle: '2. Factors Governing Population Distribution',
        content: [
          'a) Socio-economic factors (decisive role): Development level of productive forces, economic structure, history of land settlement, and migration flows.',
          'b) Natural factors (enabling or constraining role): Geographic location, relief and soils, climate and freshwater availability, and mineral wealth.',
        ],
      },
      {
        sectionTitle: '3. Urbanization and Its Impacts',
        content: [
          'Urbanization is a socio-economic process marked by rapid growth in urban settlement numbers and sizes, concentration of people in cities, and widespread diffusion of urban lifestyles.',
          'Three hallmark features: Rapid rise in urban population share, heavy concentration in large and megacities, and spread of urban living patterns.',
          'Positive impacts: Accelerates economic growth, sectoral transformation, job creation, and living standards.',
          'Negative impacts (when spontaneous and divorced from industrialization): Traffic congestion, pollution, housing shortages, unemployment, and social strain.',
        ],
      },
    ],
    keyTerms: [
      {
        term: 'Population Density',
        definition: 'The average number of inhabitants living per unit of territorial land area (commonly people/km²).',
      },
      {
        term: 'Urbanization',
        definition: 'A socio-economic process involving rising urban population shares, city expansion, and diffusion of urban lifestyles.',
      },
      {
        term: 'Urban Population Share',
        definition: 'The percentage ratio of residents living in urban areas relative to a country or region’s total population.',
      },
    ],
    realWorldExamples: [
      'Across Lang Son, Chi Lang, and Van Linh, settlements cluster densely around Chi Lang center and Thuong River valleys while remaining sparser on rugged karst ridges.',
      'In Van Linh commune (Lang Son), villages cluster along limestone foothill edges and concreted inter-commune roads facilitating agricultural trade.',
    ],
    keyTakeaways: [
      'Population is unevenly distributed; Density = Population / Area (people/km²).',
      'Socio-economic factors decisively govern settlement distribution and urbanization.',
      'Advanced New Rural construction in Van Linh links rural modernization with civilized community living.',
    ],
  },
};
