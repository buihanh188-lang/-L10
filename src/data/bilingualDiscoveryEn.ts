import { Question } from '../types';

/**
 * Complete English translations for all 42 Discovery Questions ("Did You Know? – Geography Discovery")
 * Preserves exact IDs, correctIndex, isCorrect, numericValue, tolerance, standardAnswer, and pairs.
 */
export const DISCOVERY_QUESTIONS_EN: Record<string, Partial<Question> & { curiosityHook?: string; funFact?: string }> = {
  // ============================================================================
  // FORMAT 1: DISCOVERY MULTIPLE CHOICE (disc-mc-01 .. disc-mc-16)
  // ============================================================================
  'disc-mc-01': {
    curiosityHook: "Did you know why we don't feel dizzy even though Earth is spinning?",
    question:
      'Did you know: Earth rotates on its axis at the equator at roughly 1,670 km/h (faster than a commercial jet airliner). Why do we standing on the ground feel completely stationary instead of dizzy?',
    options: [
      'Because the atmosphere, the ground, and every object move smoothly at the exact same speed as Earth',
      "Because the Sun's gravitational pull holds human bodies completely motionless",
      'Because Earth only rotates at night while people are asleep',
      "Because Earth's magnetic field cancels out all sensation of motion",
    ],
    explanation:
      'Just like sitting inside an airplane cruising steadily at 900 km/h, you do not feel like you are hurtling forward because the air and everything inside the cabin move at the exact same speed as you. The atmosphere and ground spin together with Earth!',
    funFact:
      'If Earth abruptly stopped spinning in 1 second, inertia would hurl everything at the equator eastward at 1,670 km/h!',
  },
  'disc-mc-02': {
    curiosityHook: 'Why do airplanes fly curved arcs instead of straight lines on flat maps?',
    question:
      'Did you know: When flying from Hanoi (Vietnam) to San Francisco (USA), pilots do not fly in a flat horizontal line straight across the Pacific Ocean on a map, but instead curve far north near Japan and Alaska. Why?',
    options: [
      'Because on a spherical Earth, a Great Circle arc is actually the shortest route and saves the most fuel',
      'Because airplanes need to fly over snowy regions to cool their jet engines',
      'Because the Pacific Ocean has too many Bermuda Triangles that planes must avoid',
      'Because international aviation law prohibits aircraft from crossing the equator directly',
    ],
    explanation:
      'Flat Mercator maps distort spherical geometry. On the curved surface of Earth, a Great Circle route arching toward higher latitudes is genuinely the shortest and fastest path!',
    funFact:
      'By flying Great Circle arcs near Alaska, each trans-Pacific flight can save over 1,000 km in distance and dozens of tons of jet fuel.',
  },
  'disc-mc-03': {
    curiosityHook: 'The secret of floating effortlessly without ever sinking!',
    question:
      'In the Dead Sea (between Israel and Jordan), bathers can comfortably lie on their backs and read a newspaper on top of the water without sinking. What causes this remarkable phenomenon?',
    options: [
      'Extremely high water salinity (nearly 34%), making seawater far denser than the human body',
      'Underground warm air vents beneath the seabed continuously push swimmers upward',
      'Natural crude oil suspended in Dead Sea water creates mechanical lift',
      "Earth's magnetic field inside the Dead Sea depression lifts swimmers above the surface",
    ],
    explanation:
      'Normal ocean water has a salinity of about 3.5%, whereas the Dead Sea reaches nearly 34% (almost 10 times saltier!). Its extreme density creates a strong buoyant force (Archimedes principle) that effortlessly floats the human body.',
    funFact:
      'The Dead Sea is actually a salt lake lying 430 meters below sea level—the lowest exposed land point on Earth!',
  },
  'disc-mc-04': {
    curiosityHook: 'Can you guess which country spans the most continuous time zones?',
    question:
      'Take a guess: Which country has a continuous landmass stretching across 11 different time zones, so while people on its western border are having breakfast, residents on its eastern coast are going to sleep at night?',
    options: [
      'The Russian Federation',
      'The United States of America',
      "The People's Republic of China",
      'The Federative Republic of Brazil',
    ],
    explanation:
      'Russia is the largest country in the world by area (over 17 million km²), extending from the Baltic Sea in Europe across Eurasia to the Bering Strait near North America, spanning 11 continuous time zones (from UTC+2 to UTC+12)!',
    funFact:
      'Although China is nearly as wide east-to-west as the United States, the entire country uses a single official Beijing Standard Time (UTC+8). As a result, in far-western Xinjiang, the summer sun does not set until around 11:00 PM!',
  },
  'disc-mc-05': {
    curiosityHook: 'Why do spaceports prefer launching rockets near the Equator?',
    question:
      'Did you know: Major space launch centers such as Cape Canaveral (USA) and Kourou (European Space Agency in French Guiana) are built at low latitudes as close to the equator as possible. What remarkable geographic advantage does this provide?',
    options: [
      "Utilizing Earth's maximum rotational velocity for a free natural boost into orbit",
      'Because equatorial regions have zero gravitational pull acting on rockets',
      'Because warm equatorial weather keeps rocket fuel from freezing',
      'So rockets remain unobstructed by clouds for observatory telescopes',
    ],
    explanation:
      "At the equator, Earth's rotational radius is greatest, giving the surface its peak tangential velocity (~1,670 km/h). Launching rockets eastward from near the equator adds this massive rotational speed for free, saving millions of dollars in fuel!",
    funFact:
      "Europe's Kourou Spaceport at 5°N latitude allows Ariane rockets to carry roughly 15–20% heavier payloads with the same fuel compared to launching from high European latitudes.",
  },
  'disc-mc-06': {
    curiosityHook: 'What is the tallest mountain on Earth if measured from its ocean-floor base?',
    question:
      'Measured above sea level, Mount Everest (8,848 m) is the highest peak. However, if measured from its very base on the ocean floor to its summit, which mountain is the tallest on Earth (exceeding 10,200 m)?',
    options: [
      'Mauna Kea volcano in the Hawaiian Islands (Pacific Ocean)',
      'Mount Fuji in Japan',
      'Mount Kilimanjaro in Africa',
      'Mont Blanc in the European Alps',
    ],
    explanation:
      'Mauna Kea on the island of Hawaii rises from a base nearly 6,000 m deep on the Pacific Ocean floor to a summit 4,207 m above sea level. Its total height from base to peak exceeds 10,200 m, surpassing Mount Everest!',
    funFact:
      "Because Earth bulges slightly at the equator, Mount Chimborazo in Ecuador—not Everest—has the peak farthest from Earth's center and closest to the stars!",
  },
  'disc-mc-07': {
    curiosityHook: 'Why are deserts scorching hot by day yet freezing cold at night?',
    question:
      'In deserts like the Sahara, daytime temperatures can soar near 50°C yet plunge down to 0°C or even frost at night. What causes this extreme daily temperature swing?',
    options: [
      'Extremely dry air with virtually no water vapor or clouds to trap heat at night, allowing heat to radiate straight into space',
      'Cold winds from the North Pole sweep directly across the desert every night',
      'Desert sand naturally generates cold air once sunlight disappears',
      'Underground desert soil absorbs all surface heat immediately after sunset',
    ],
    explanation:
      'Water vapor and clouds act like a giant insulating blanket trapping heat near the ground (the natural greenhouse effect). Without moisture or clouds, desert sand heats rapidly by day and radiates all its heat back into space at night.',
    funFact:
      'The diurnal temperature range in the Sahara Desert can reach 35–40°C within a single day, among the harshest extremes on Earth!',
  },
  'disc-mc-08': {
    curiosityHook: 'Why do penguins never cross paths with polar bears in the wild?',
    question:
      'Did you know: In the wild, polar bears and penguins never meet each other naturally. What simple geographic fact explains this?',
    options: [
      'Penguins live naturally only in the Southern Hemisphere (Antarctica), whereas polar bears live only in the Northern Hemisphere (the Arctic)',
      'Polar bears and penguins share the Arctic, but penguins only emerge in winter',
      'Penguins fear polar bears and flew away to migrate to Africa',
      'Penguins inhabit only the tropical rainforests of South America',
    ],
    explanation:
      'All 18 species of penguins reside naturally in the Southern Hemisphere (primarily around Antarctica and adjacent cold seas). Conversely, polar bears live exclusively on sea ice around the Arctic Ocean in the Northern Hemisphere!',
    funFact:
      'In ancient Greek, "Arktos" (Arctic) means "land of the bears," while "Antarctica" literally means "opposite the land of the bears"!',
  },
  'disc-mc-09': {
    curiosityHook: 'An ocean current warming an entire continent like a giant radiator!',
    question:
      'London (UK) and Paris (France) lie at high latitudes (50–51°N, similar to frigid Siberia in Russia), yet Western European winters are rarely severe and seaports stay ice-free year-round. What natural "heater" warms Western Europe?',
    options: [
      'The warm Gulf Stream ocean current carrying tropical heat northward',
      'Continuous underwater volcanic eruptions across the North Sea floor',
      'Northeasterly monsoons blowing warm air straight from the Sahara Desert',
      'Waste heat released by densely populated industrial cities warming the air',
    ],
    explanation:
      'The warm Gulf Stream flows from the Gulf of Mexico across the North Atlantic carrying massive volumes of warm tropical water. Combined with prevailing Westerlies, it acts like a giant central heating system for Western and Northern Europe!',
    funFact:
      'The thermal energy transported to Western Europe by the Gulf Stream equals the electrical output of roughly 1 million nuclear power plants combined!',
  },
  'disc-mc-10': {
    curiosityHook: 'How did one stuck ship paralyze global trade?',
    question:
      'In March 2021, the ultra-large container vessel Ever Given ran aground and blocked a famous canal, halting nearly 12% of global maritime trade and costing billions of dollars daily. Which strategic waterway was it?',
    options: [
      'The Suez Canal (Egypt)',
      'The Panama Canal (Central America)',
      'The Kiel Canal (Germany)',
      'The Corinth Canal (Greece)',
    ],
    explanation:
      'The 193-km Suez Canal cuts across the Isthmus of Suez in Egypt, connecting the Mediterranean Sea to the Red Sea. It lets ships traveling between Europe and Asia avoid detouring around the Cape of Good Hope in southern Africa, saving nearly 9,000 km!',
    funFact:
      'During the 6-day Ever Given blockade, hundreds of vessels queued outside the canal, severely disrupting global supply chains from electronics to crude oil.',
  },
  'disc-mc-11': {
    curiosityHook: 'White Nights: When the Sun keeps shining brightly at midnight!',
    question:
      'During summer in cities like Saint Petersburg (Russia) and Oslo (Norway), residents can read books outdoors at midnight without streetlights because the sky remains bright. What causes this "White Nights" phenomenon?',
    options: [
      "Earth's axial tilt leans the Arctic and sub-Arctic regions continuously toward the Sun during summer",
      'Moonlight near the poles shines 10 times brighter than at the equator',
      'Polar snowfields reflect artificial city lighting upward into the clouds',
      'A thinning polar ozone layer scatters sunlight far more intensely',
    ],
    explanation:
      "During Northern Hemisphere summer, the North Pole tilts toward the Sun, giving high-latitude regions near the Arctic Circle 24 hours of daylight (or twilight where the Sun barely dips below the horizon before rising again), creating poetic white nights.",
    funFact:
      'At Nordkapp (North Cape, Norway), the Sun never sets for a single minute from May 12 to August 1—nearly 3 straight months of continuous daylight!',
  },
  'disc-mc-12': {
    curiosityHook: 'Which country holds the most natural lakes on Earth?',
    question:
      'Take a guess: Which country possesses more natural freshwater lakes than the rest of the world combined (estimated at over 2 million lakes, more than half of all natural lakes on Earth)?',
    options: [
      'Canada (North America)',
      'The United States of America',
      'The Republic of Finland',
      'The Russian Federation',
    ],
    explanation:
      'Canada is truly the "kingdom of lakes," home to over 2 million lakes (including ~31,700 larger than 3 km²). Most were carved into bedrock by massive retreating ice sheets during the last Ice Age.',
    funFact:
      'Although Finland is famously called the "Land of a Thousand Lakes" (~188,000 lakes), its total count is dwarfed by Canada’s 2 million-plus lakes!',
  },
  'disc-mc-13': {
    curiosityHook: 'Why is farmland around volcanoes among the most fertile on Earth?',
    question:
      'Volcanic eruptions are violent natural hazards, yet farmers pack densely around volcanoes on Java Island (Indonesia) and Mount Vesuvius (Italy). What invaluable agricultural benefit do volcanoes provide?',
    options: [
      'Weathered volcanic ash and lava produce rich basaltic soils abundant in potassium, phosphorus, and calcium',
      'Underground volcanic heat makes fruit crops ripen twice as fast',
      'Toxic sulfur gas from craters eliminates 100% of crop pests',
      'Groundwater around volcanoes contains zero dissolved mineral salts',
    ],
    explanation:
      'Volcanic ash and lava are loaded with essential trace elements and mineral nutrients. Over millennia of weathering, they form extraordinarily fertile basaltic and volcanic alluvial soils supporting abundant harvests.',
    funFact:
      'Java covers just 7% of Indonesia’s land area yet supports nearly 60% of its entire population, largely thanks to volcanic soils sustaining intensive high-yield rice agriculture.',
  },
  'disc-mc-14': {
    curiosityHook: 'The invisible armor shielding Earth from cosmic radiation!',
    question:
      "Swirling molten iron and nickel inside Earth's outer core generate an invisible protective shield that deflects destructive solar-wind radiation away from surface life. What is this vital shield?",
    options: [
      "Earth's magnetic field (Geomagnetism)",
      'The atmospheric troposphere',
      'Surface gravitational pull',
      "The Moon's radiation belt",
    ],
    explanation:
      "A natural geodynamo created by convecting liquid metal in Earth's outer core produces our planetary magnetic field. It deflects dangerous charged solar-wind particles, safeguarding our atmosphere and biosphere.",
    funFact:
      'Ancient Mars once held oceans and a thick atmosphere, but after its core cooled and lost its magnetic field, solar wind stripped away nearly its entire atmosphere into space!',
  },
  'disc-mc-15': {
    curiosityHook: 'The international river flowing through the most splendid capital cities!',
    question:
      'Did you know: Which European river flows through 10 countries and passes directly through 4 national capitals (Vienna in Austria, Bratislava in Slovakia, Budapest in Hungary, and Belgrade in Serbia)?',
    options: [
      'The Danube River',
      'The Rhine River',
      'The Seine River',
      'The Volga River',
    ],
    explanation:
      'Stretching 2,850 km from Germany’s Black Forest to the Black Sea, the Danube is Europe’s premier international river of strategic importance for inland shipping, history, and culture.',
    funFact:
      'Johann Strauss II’s timeless waltz "The Blue Danube" remains one of the most beloved classical compositions of all time.',
  },
  'disc-mc-16': {
    curiosityHook: 'Was the Sahara Desert once covered with lush greenery and giant lakes?',
    question:
      'Archaeologists discovered thousands of ancient rock paintings deep inside the arid Sahara Desert depicting people hunting, swimming, and herds of giraffes and hippos. What fascinating geographic fact does this prove?',
    options: [
      'Roughly 6,000 to 10,000 years ago, the Sahara was a lush green savanna ("Green Sahara") with a humid climate and abundant lakes and rivers',
      'Ancient artists merely imagined those animals while the Sahara was always arid',
      'Ancient African wildlife could survive for years without drinking water',
      'Ancient Egyptians dug canals flooding the entire desert with seawater',
    ],
    explanation:
      'Due to natural orbital and axial-tilt cycles (Milankovitch cycles), African monsoons penetrated deep inland 6,000–11,000 years ago, turning the Sahara into verdant grasslands dotted with Lake Mega-Chad!',
    funFact:
      'Scientists calculate that in roughly 15,000 years, Earth’s orbital shifts will return the Sahara to another humid, green cycle!',
  },

  // ============================================================================
  // FORMAT 2: DISCOVERY TRUE/FALSE CONTEXT (disc-tf-01 .. disc-tf-08)
  // ============================================================================
  'disc-tf-01': {
    curiosityHook: 'Earth’s deepest abyss: The mysterious Mariana Trench!',
    contextTitle: 'Discovery Source: Mariana Trench – Visited by fewer people than the Moon',
    contextText:
      'The Mariana Trench in the western Pacific Ocean is the deepest oceanic trench on Earth. Its deepest point, the Challenger Deep, plunges nearly 11,000 meters (~10,994 m). At this depth, sunlight never penetrates, water temperatures hover between 1°C and 4°C, and water pressure exceeds 1,000 atmospheres—equivalent to a jet airliner pressing down on your thumb. Despite such extreme conditions, explorers have found bioluminescent creatures and microbes thriving around hydrothermal vents.',
    statements: [
      {
        id: 'a',
        text: 'If Mount Everest (8,848 m) were placed at the bottom of the Challenger Deep, its peak would still sit more than 2,000 m underwater.',
        isCorrect: true,
        explanation: 'The Mariana Trench (~11,000 m deep) exceeds Mount Everest’s height (8,848 m) by over 2,100 meters!',
      },
      {
        id: 'b',
        text: 'Crushing pressure and eternal darkness at the bottom of the Mariana Trench make it completely impossible for any living organism to survive.',
        isCorrect: false,
        explanation: 'Deep-sea submersibles have documented soft-bodied snailfish, sea cucumbers, and bioluminescent species remarkably adapted to ultra-high pressure.',
      },
      {
        id: 'c',
        text: 'More astronauts have walked on the Moon than humans have descended to the deepest point of the Mariana Trench.',
        isCorrect: true,
        explanation: 'Only a handful of explorers (such as Don Walsh, Jacques Piccard, and James Cameron) have reached the Challenger Deep, fewer than the 12 Moon-walking astronauts.',
      },
      {
        id: 'd',
        text: 'The Mariana Trench formed where two lithospheric tectonic plates collide and one subducts beneath the other.',
        isCorrect: true,
        explanation: 'The trench marks a convergent subduction boundary where the Pacific Plate dives beneath the smaller Mariana Plate.',
      },
    ] as any,
    funFact:
      'Scientists even spotted plastic trash (a plastic bag) nearly 11,000 m deep inside the Mariana Trench—a stark warning about marine plastic pollution!',
  },
  'disc-tf-02': {
    curiosityHook: 'The secret of the International Date Line: Sailing across time!',
    contextTitle: 'Geographic Source: The International Date Line (180° Meridian)',
    contextText:
      'The International Date Line (IDL) runs roughly along the 180° meridian in the middle of the Pacific Ocean, marking the boundary between two consecutive calendar days. Standing astride it, your left foot could be in Sunday while your right foot stands in Monday! To avoid splitting small island nations across two calendar days simultaneously, the IDL zigzags around island groups such as Kiribati, Fiji, and Russia’s Chukchi Peninsula.',
    statements: [
      {
        id: 'a',
        text: 'When a ship sails eastward across the International Date Line (from west to east), passengers must set their calendar back one day.',
        isCorrect: true,
        explanation: 'Crossing the 180° meridian from the eastern time zones into western zones moves back one calendar day.',
      },
      {
        id: 'b',
        text: 'The International Date Line is a perfectly straight meridian connecting the North Pole directly to the South Pole.',
        isCorrect: false,
        explanation: 'The Date Line bends and zigzags deliberately so it does not cut through populated nations or archipelagos.',
      },
      {
        id: 'c',
        text: 'The Pacific island nation of Kiribati adjusted its national time zone so it became the first country on Earth to welcome each New Year’s sunrise.',
        isCorrect: true,
        explanation: 'Caroline Island in Kiribati (renamed Millennium Island) sits in UTC+14, greeting each new day before anywhere else on Earth.',
      },
      {
        id: 'd',
        text: 'Flying just 70 km between Samoa and nearby American Samoa allows you to celebrate your birthday twice across two consecutive days.',
        isCorrect: true,
        explanation: 'Those neighboring islands sit on opposite sides of the International Date Line, differing by 24 to 25 hours!',
      },
    ] as any,
    funFact:
      'In Jules Verne’s classic novel "Around the World in 80 Days", Phileas Fogg thought he had lost his bet by arriving a day late, only to realize that traveling eastward around the globe had gained him an entire extra day!',
  },
  'disc-tf-03': {
    curiosityHook: 'The Amazon Rainforest and its magical "Flying Rivers" in the sky!',
    contextTitle: 'Biosphere Source: The Amazon Rainforest and "Flying Rivers"',
    contextText:
      'South America’s Amazon Rainforest is the largest tropical rainforest on Earth, covering over 5.5 million km² across 9 countries. Beyond unmatched biodiversity, the Amazon generates its own rainfall—and waters much of South America—via "Flying Rivers." Every day, billions of towering Amazonian trees draw soil moisture and transpire up to 20 billion tons of water vapor into the atmosphere, surpassing the daily liquid discharge of the Amazon River itself!',
    statements: [
      {
        id: 'a',
        text: 'The Amazon’s "Flying Rivers" are actually vast invisible aerial streams of moisture released through forest evapotranspiration.',
        isCorrect: true,
        explanation: 'Trees transpire immense volumes of water vapor that travel across the sky as atmospheric rivers supplying continental rainfall.',
      },
      {
        id: 'b',
        text: 'The Amazon is Earth’s longest river, though its water discharge is much smaller than Africa’s Nile River.',
        isCorrect: false,
        explanation: 'The Amazon carries by far the largest water discharge of any river on Earth, accounting for roughly 20% of all river freshwater entering the oceans.',
      },
      {
        id: 'c',
        text: 'Mineral-rich dust blown by winds from the Sahara Desert across the Atlantic Ocean naturally fertilizes the Amazon Rainforest.',
        isCorrect: true,
        explanation: 'Around 28 million tons of phosphorus-rich dust from the Bodélé Depression in the Sahara travel over 5,000 km annually to nourish Amazonian soils!',
      },
      {
        id: 'd',
        text: 'The Amazon Rainforest supplies 100% of all oxygen breathed by humans and animals worldwide.',
        isCorrect: false,
        explanation: 'While Amazon trees photosynthesize vast amounts of oxygen, forest organisms also consume most of it through respiration and decomposition.',
      },
    ] as any,
    funFact:
      'About 4,000 m underground beneath the Amazon basin, scientists discovered a 6,000-km subterranean aquifer flow named the Hamza River running parallel beneath the surface Amazon!',
  },
  'disc-tf-04': {
    curiosityHook: 'Lake Baikal – Humanity’s oldest and deepest freshwater reservoir!',
    contextTitle: 'Physical Geography Source: Lake Baikal – "The Blue Pearl of Siberia"',
    contextText:
      'Located in southern Siberia (Russia), Lake Baikal is the world’s deepest (1,642 m) and geologically oldest freshwater lake (~25–30 million years old). It holds an astonishing 23,600 km³ of water—over 20% of Earth’s unfrozen surface freshwater. In spring, Baikal’s crystal-clear water lets viewers spot rocks and aquatic life 40 meters beneath the surface, and it is home to the Nerpa, the world’s only exclusively freshwater seal.',
    statements: [
      {
        id: 'a',
        text: 'Lake Baikal holds more fresh water than all five North American Great Lakes combined.',
        isCorrect: true,
        explanation: 'Baikal’s ~23,600 km³ volume surpasses the combined freshwater volume of all five Great Lakes.',
      },
      {
        id: 'b',
        text: 'During frigid Siberian winters, Lake Baikal freezes thick enough to safely support cars and heavy transport trucks driving across its surface.',
        isCorrect: true,
        explanation: 'Winter ice on Lake Baikal reaches 1 to 2 meters thick, capable of carrying heavy trucks and convoys.',
      },
      {
        id: 'c',
        text: 'Lake Baikal is an artificial reservoir built for a 20th-century hydroelectric dam.',
        isCorrect: false,
        explanation: 'Lake Baikal is a natural rift-valley lake formed over 25 million years ago by continental lithospheric rifting.',
      },
      {
        id: 'd',
        text: 'Over 300 rivers and streams flow into Lake Baikal, yet only a single river—the Angara—drains water out of it.',
        isCorrect: true,
        explanation: 'Baikal is fed by 336 inflowing rivers/streams and drained solely by the Angara River (a tributary of the Yenisei).',
      },
    ] as any,
    funFact:
      'If the rest of the world ran dry, Lake Baikal alone could supply drinking water to the entire human population for nearly 50 years!',
  },
  'disc-tf-05': {
    curiosityHook: 'Greenland: An icy giant named "Green Land"!',
    contextTitle: 'Historical Geography Source: The Naming Paradox of Greenland and Iceland',
    contextText:
      'Greenland is the world’s largest island at over 2.1 million km², with roughly 80% of its terrain buried beneath an ice sheet 2–3 km thick—yet it bears the name "Greenland." Meanwhile, neighboring Iceland enjoys verdant valleys, geothermal hot springs, and a milder climate warmed by the Gulf Stream. Norse sagas tell that exiled explorer Erik the Red deliberately named the frozen landmass "Greenland" as a clever marketing ploy to entice Scandinavian settlers.',
    statements: [
      {
        id: 'a',
        text: 'Greenland has the largest land area of any island on Earth (excluding continents).',
        isCorrect: true,
        explanation: 'At over 2.16 million km², Greenland is the planet’s largest island.',
      },
      {
        id: 'b',
        text: 'Greenland got its name because lush tropical rainforests carpet the entire island year-round.',
        isCorrect: false,
        explanation: 'Over 80% of Greenland lies under permanent ice; the name originated as a Viking settlement lure.',
      },
      {
        id: 'c',
        text: 'If Greenland’s entire ice sheet melted completely, global sea levels would rise by roughly 7 meters.',
        isCorrect: true,
        explanation: 'Greenland’s ice sheet locks up enough fresh water to raise global oceans by over 7 meters upon complete melting.',
      },
      {
        id: 'd',
        text: 'Physically, Greenland belongs to North America, whereas politically and historically it is an autonomous territory of the Kingdom of Denmark in Europe.',
        isCorrect: true,
        explanation: 'Greenland sits on the North American tectonic plate while remaining a self-governing part of the Kingdom of Denmark.',
      },
    ] as any,
    funFact:
      'Greenland’s entire population is only about 56,000 people, and zero inter-town highways exist—all travel between communities relies on boats, helicopters, planes, or dog sleds!',
  },
  'disc-tf-06': {
    curiosityHook: 'Death Valley and the mystery of rocks that sail across the desert!',
    contextTitle: 'Natural Mystery Source: Death Valley (California) and Sailing Stones',
    contextText:
      'Death Valley in California (USA) holds the highest officially recorded air temperature on Earth (56.7°C in 1913) and is North America’s lowest point (-86 m below sea level). On its dry Racetrack Playa lakebed, boulders weighing tens of kilograms mysteriously slide across parched mud, leaving tracks hundreds of meters long without human or animal footprints. In 2014, GPS trackers solved the mystery: rare winter rain freezes into wafer-thin ice sheets that break apart in strong winds and shove the boulders over slick wet mud!',
    statements: [
      {
        id: 'a',
        text: 'Death Valley is among the hottest and most arid locations on Earth’s surface.',
        isCorrect: true,
        explanation: 'It recorded a world-record 56.7°C air temperature and averages under 50 mm of rainfall per year.',
      },
      {
        id: 'b',
        text: 'Death Valley’s sailing stones move because hidden magnetic fields pull boulders toward the North Pole.',
        isCorrect: false,
        explanation: 'The rocks slide due to thin melting ice panels driven across slick mud by brisk winter winds.',
      },
      {
        id: 'c',
        text: 'Death Valley sits below sea level as a tectonic graben formed by geological faulting and subsidence.',
        isCorrect: true,
        explanation: 'Badwater Basin in Death Valley lies 86 meters below mean sea level.',
      },
      {
        id: 'd',
        text: 'Despite its forbidding name, small fish and specially adapted desert plants still survive inside Death Valley.',
        isCorrect: true,
        explanation: 'Remarkable desert pupfish thrive in warm salty pools scattered across Death Valley.',
      },
    ] as any,
    funFact:
      'Summer ground temperatures in Death Valley have reached 93.9°C—hot enough to fry an egg directly on the desert stone!',
  },
  'disc-tf-07': {
    curiosityHook: 'Earth’s longest mountain chain hides completely beneath the ocean!',
    contextTitle: 'Geological Source: The Mid-Ocean Ridge System',
    contextText:
      'Asked to name the world’s longest mountain range, most people picture South America’s Andes (~7,000 km). Yet Earth’s true longest mountain chain lies mostly beneath the sea: the Mid-Ocean Ridge system stretches over 65,000 km around the globe like seams on a baseball! Here, oceanic tectonic plates diverge, allowing mantle magma to well up continuously, cool, and forge brand-new oceanic crust.',
    statements: [
      {
        id: 'a',
        text: 'The Mid-Ocean Ridge system is many times longer than the Andes mountain range on land.',
        isCorrect: true,
        explanation: 'The underwater ridge spans ~65,000 km, compared to roughly 7,000 km for the Andes.',
      },
      {
        id: 'b',
        text: 'Mid-ocean ridges are zones where upwelling magma creates new oceanic crust.',
        isCorrect: true,
        explanation: 'At divergent seafloor spreading centers, rising lava cools into fresh basaltic oceanic crust.',
      },
      {
        id: 'c',
        text: 'Nowhere along this entire underwater ridge system does any peak emerge above sea level.',
        isCorrect: false,
        explanation: 'The island nation of Iceland is literally an emergent volcanic segment of the Mid-Atlantic Ridge!',
      },
      {
        id: 'd',
        text: 'Hydrothermal vents ("black smokers") along mid-ocean ridges support unique deep-sea ecosystems that thrive without sunlight.',
        isCorrect: true,
        explanation: 'Chemosynthetic bacteria convert vent minerals into chemical energy, sustaining giant tube worms and blind vent crabs.',
      },
    ] as any,
    funFact:
      'At Iceland’s Thingvellir valley, divers in the Silfra fissure can literally reach out and touch two continental plates at once: North America with one hand and Eurasia with the other!',
  },
  'disc-tf-08': {
    curiosityHook: 'Antarctica: Highest average elevation, fiercest winds, and 70% of Earth’s fresh water!',
    contextTitle: 'Geographic Source: Antarctica – Earth’s Southernmost Continent',
    contextText:
      'Antarctica is the coldest, windiest, and highest-elevation continent on average (~2,300 m above sea level due to an ice sheet averaging nearly 2,000 m thick). The Antarctic Ice Sheet stores 90% of the world’s ice and roughly 70% of all freshwater on Earth. Claimed by no sovereign nation, Antarctica is preserved as a continent of peace, science, and environmental protection under the 1959 Antarctic Treaty.',
    statements: [
      {
        id: 'a',
        text: 'Antarctica holds the majority of humanity’s total freshwater reserves.',
        isCorrect: true,
        explanation: 'Approximately 70% of Earth’s fresh water is locked frozen inside the Antarctic Ice Sheet.',
      },
      {
        id: 'b',
        text: 'Antarctica has densely populated cities and high-speed railways linking its capitals.',
        isCorrect: false,
        explanation: 'Antarctica has no permanent indigenous residents—only rotating teams of scientists at seasonal and year-round research stations.',
      },
      {
        id: 'c',
        text: 'Because of its thick ice cap, Antarctica has the highest mean elevation of any continent.',
        isCorrect: true,
        explanation: 'Antarctica’s ~2,300 m average elevation exceeds every other continent.',
      },
      {
        id: 'd',
        text: 'Liquid subglacial lakes lie buried thousands of meters beneath Antarctica’s ice.',
        isCorrect: true,
        explanation: 'Lake Vostok sits nearly 4,000 m beneath the East Antarctic ice sheet, sealed off from the surface for millions of years.',
      },
    ] as any,
    funFact:
      'Katabatic winds in Antarctica can blast past 320 km/h—stronger than a Category 5 hurricane—capable of tearing away heavy expedition tents!',
  },

  // ============================================================================
  // FORMAT 3: DISCOVERY SHORT ANSWER (disc-sa-01 .. disc-sa-10)
  // ============================================================================
  'disc-sa-01': {
    curiosityHook: 'Guess how many minutes Earth takes to rotate exactly 1 degree!',
    question:
      'Earth is a sphere divided into 360 degrees of longitude and takes roughly 24 hours (1,440 minutes) to complete one axial rotation. Calculate how many minutes Earth needs to spin through 1 degree of longitude.',
    unit: 'min',
    guide: 'Divide 1,440 minutes by 360 degrees.',
    formula: 'Time = 1,440 minutes / 360 degrees',
    acceptedAnswers: ['4', '4 phút', '4 min', '4 minutes', 'four'],
    explanation:
      'Every hour (60 minutes), Earth turns through 15° of longitude (360° / 24 h). Therefore, rotating 1° takes exactly 60 minutes / 15 = 4 minutes!',
    funFact:
      'This 4-minute-per-degree rule allowed early navigators at sea to determine longitude by comparing mechanical chronometers with solar noon!',
  },
  'disc-sa-02': {
    curiosityHook: 'How tall is the "Roof of the World" in meters?',
    question:
      'Mount Everest (known in Tibetan as Chomolungma—"Goddess Mother of the World") is Earth’s highest summit above sea level. What is its officially recognized elevation in meters?',
    unit: 'm',
    guide: 'Official joint elevation published by Nepal and China.',
    acceptedAnswers: ['8848', '8849', '8848.86', '8848,86', '8850'],
    explanation:
      'The latest official satellite and GPS survey announced jointly by Nepal and China in 2020 places Mount Everest at 8,848.86 meters.',
    funFact:
      'Because the Indian Plate continues colliding into Eurasia, the Himalayas and Mount Everest still rise by roughly 4 mm each year!',
  },
  'disc-sa-03': {
    curiosityHook: 'What percentage of Earth’s surface is covered by oceans?',
    question:
      'Viewed from space, Earth shines as a "Blue Marble" because water blankets most of its surface. Roughly what percentage (%) of Earth’s total surface area is covered by oceans and seas?',
    unit: '%',
    guide: 'Enter the rounded percentage (around 70% to 71%).',
    acceptedAnswers: ['71', '70.8', '70,8', '70', '71%'],
    explanation:
      'Oceans and seas cover approximately 70.8% (commonly rounded to 71%) of Earth’s 510 million km² surface (~361 million km²), leaving just ~29% as land.',
    funFact:
      'Although oceans cover 71% of our planet, humans have mapped just over 20% of the deep ocean floor in fine detail—less than the surface of Mars!',
  },
  'disc-sa-04': {
    curiosityHook: 'What is the coldest natural air temperature ever recorded on Earth?',
    question:
      'At Vostok Research Station in interior Antarctica, scientists measured Earth’s lowest natural temperature ever recorded at minus 89.2 degrees Celsius (-89.2°C). Enter this negative temperature figure (rounded to an integer or one decimal place).',
    unit: '°C',
    guide: 'Enter the negative temperature (e.g., -89.2 or -89).',
    acceptedAnswers: ['-89.2', '-89,2', '-89', '89.2', '89'],
    explanation:
      'On July 21, 1983, thermometers at the Soviet Vostok Station in Antarctica hit a record -89.2°C—cold enough for breath vapor to freeze instantly and fuel to thicken like jelly.',
    funFact:
      'Despite being covered in ice averaging 2 km thick, Antarctica is technically classified as Earth’s largest desert because frigid air holds almost no moisture for snow or rain.',
  },
  'disc-sa-05': {
    curiosityHook: 'A historic population milestone for humanity!',
    question:
      'On November 15, 2022, the United Nations officially announced that world population reached how many billion people?',
    unit: 'billion people',
    guide: 'Enter the whole number representing billions.',
    acceptedAnswers: ['8', '8 billion', '8 tỉ', '8 ty'],
    explanation:
      'The United Nations designated November 15, 2022 as the "Day of 8 Billion," marking a historic milestone in global population growth.',
    funFact:
      'World population took only about 12 years to grow from 7 billion to 8 billion—whereas humanity needed hundreds of thousands of years until 1804 to reach its very first billion!',
  },
  'disc-sa-06': {
    curiosityHook: 'The axial tilt that creates all four seasons!',
    question:
      'Did you know: Earth’s axis is not vertical; it maintains a constant 66°33′ angle to the orbital plane, meaning it tilts by roughly how many degrees from the vertical perpendicular (~23.5 degrees) to produce spring, summer, autumn, and winter?',
    unit: 'degrees (°)',
    guide: 'Enter the tilt angle (e.g., 23.5).',
    acceptedAnswers: ['23.5', '23,5', '23°30', '23.45'],
    explanation:
      'Earth’s axial obliquity relative to the perpendicular of the ecliptic plane is 23°27′ (~23.5°). Because its tilt stays fixed in orientation as Earth orbits the Sun, both hemispheres alternate leaning toward sunlight across the seasons.',
    funFact:
      'If Earth’s axis stood upright at 0°, seasons would vanish completely: the equator would stay perpetually hot while mid-latitudes froze into unchanging monotony!',
  },
  'disc-sa-07': {
    curiosityHook: 'The smallest independent country on the planet!',
    question:
      'Take a guess: What is the name of the world’s smallest sovereign country (covering just 0.44 km² with fewer than 1,000 residents), completely enclaved inside the city of Rome, Italy?',
    unit: 'country',
    guide: 'Enter the country name (Vatican).',
    acceptedAnswers: ['vatican', 'vatican city', 'thanh vatican', 'toa thanh vatican', 'the vatican'],
    explanation:
      'Vatican City is the smallest independent state in both area and population worldwide, enclosed inside Rome yet maintaining its own postal system, flag, radio station, and Swiss Guard.',
    funFact:
      'Vatican City’s entire border perimeter measures only about 3.2 km—you can comfortably walk all the way around the entire country in under 45 minutes!',
  },
  'disc-sa-08': {
    curiosityHook: 'What percentage of humanity lives in the Northern Hemisphere?',
    question:
      'Because most major continental landmasses (Asia, Europe, North America, and most of Africa) lie north of the equator, roughly what percentage (%) of global population lives in the Northern Hemisphere (near 90%)? Enter the rounded whole percentage.',
    unit: '%',
    guide: 'Enter a rounded whole percentage (e.g., 90 or 88).',
    acceptedAnswers: ['90', '90%', '88', '89', '87'],
    explanation:
      'Roughly 87% to 90% of the human population resides in the Northern Hemisphere, whereas oceans cover over 80% of the Southern Hemisphere.',
    funFact:
      'Only around 10–12% of Earth’s inhabitants live in the Southern Hemisphere (mainly across South America, southern Africa, Australia, and New Zealand).',
  },
  'disc-sa-09': {
    curiosityHook: 'How long is the Suez Canal linking two continents?',
    question:
      'Roughly how many kilometers long is the Suez Canal cutting across Egypt to link the Mediterranean Sea and the Red Sea (~193 km)? Enter the rounded whole number.',
    unit: 'km',
    guide: 'Enter the length in km (~193 km).',
    acceptedAnswers: ['193', '193.3', '193 km', '190', '194'],
    explanation:
      'The Suez Canal measures 193.3 km in official length and requires no ship locks because water levels in the Mediterranean and Red Seas are nearly equal!',
    funFact:
      'Excavating the Suez Canal took 10 arduous years (1859–1869) with over 1.5 million workers, ranking among the grandest engineering feats of the 19th century.',
  },
  'disc-sa-10': {
    curiosityHook: 'What share of unfrozen surface fresh water sits inside Lake Baikal?',
    question:
      'Ancient Lake Baikal in Siberia (Russia) holds roughly what percentage (%) of Earth’s total unfrozen surface freshwater supply? Enter the integer percentage (20%).',
    unit: '%',
    guide: 'Enter the percentage figure (20%).',
    acceptedAnswers: ['20', '20%', '22', '23'],
    explanation:
      'Lake Baikal stores roughly 20–22% of all liquid surface freshwater on Earth thanks to its record 1,642 m depth and immense rift basin.',
    funFact:
      'More than 80% of all plant and animal species living inside Lake Baikal are endemic—found nowhere else on Earth!',
  },

  // ============================================================================
  // FORMAT 4: DISCOVERY MATCHING (disc-ma-01 .. disc-ma-08)
  // ============================================================================
  'disc-ma-01': {
    curiosityHook: 'Decode amazing phenomena across the sky and oceans!',
    title: 'Match each remarkable natural phenomenon in Column A with its true scientific cause in Column B',
    columnATitle: 'Remarkable Natural Phenomenon',
    columnBTitle: 'Scientific Cause',
    pairs: [
      {
        id: 'p1',
        left: 'Glowing auroras shimmering near the polar skies',
        right: "Charged solar-wind particles interacting with Earth's magnetic field and upper atmosphere",
        reason: 'Solar storm particles collide with nitrogen and oxygen atoms high in the polar atmosphere, exciting them to emit brilliant curtains of light.',
      },
      {
        id: 'p2',
        left: 'Daily oceanic tides rising and ebbing along coastlines',
        right: "Gravitational pull of the Moon and Sun acting on Earth's ocean waters",
        reason: 'Because the Moon orbits close to Earth, its gravity pulls ocean water into tidal bulges, driving predictable high and low tidal cycles.',
      },
      {
        id: 'p3',
        left: 'Crimson-red skies at sunrise and sunset',
        right: 'Long-wavelength red light scatters far less when passing through thick atmosphere',
        reason: 'When the Sun sits low near the horizon, sunlight travels through a much thicker atmospheric path that scatters away blue wavelengths, leaving red hues.',
      },
      {
        id: 'p4',
        left: 'Desert dust blowing across an ocean to nourish the Amazon',
        right: 'Trade Winds carrying phosphorus-rich Saharan dust over the Atlantic',
        reason: 'Easterly Trade Winds loft millions of tons of mineral dust from dried Saharan lakebeds across 5,000 km of ocean to fertilize Amazon soils.',
      },
    ],
    explanation:
      'Seemingly mystical natural spectacles all obey grand physical laws and planetary interactions connecting Earth, the Sun, and space.',
    funFact:
      'Powerful auroras hundreds of times brighter than Earth’s also light up the poles of Jupiter and Saturn thanks to their colossal magnetic fields!',
  },
  'disc-ma-02': {
    curiosityHook: 'Who holds the ultimate geographic world records on Earth?',
    title: 'Match each famous landmark with its rightful "Earth World Record" title',
    columnATitle: 'Famous Geographic Landmark',
    columnBTitle: 'World Geographic Record',
    pairs: [
      {
        id: 'p1',
        left: 'Atacama Desert (Chile)',
        right: 'Driest desert on Earth (some spots go centuries without rain)',
        reason: 'Trapped between the towering Andes blocking eastern moisture and the cold Humboldt Current chilling western coastal air, rain clouds rarely form.',
      },
      {
        id: 'p2',
        left: 'Greenland (North America / Denmark)',
        right: 'Largest island on the planet (excluding continents)',
        reason: 'Spanning over 2.16 million km², Greenland is Earth’s biggest island, blanketed by a continental-scale ice cap.',
      },
      {
        id: 'p3',
        left: 'Angel Falls (Venezuela)',
        right: 'World’s tallest uninterrupted waterfall (nearly 979 meters)',
        reason: 'Water plunges straight off the sheer sandstone cliff of Auyán-tepui for 979 m, turning into fine mist before touching the valley floor.',
      },
      {
        id: 'p4',
        left: 'Lake Baikal (Russia)',
        right: 'Deepest and oldest freshwater lake on Earth',
        reason: 'Formed by tectonic rifting 25 million years ago, plunging 1,642 m deep and holding ~20% of Earth’s unfrozen surface fresh water.',
      },
    ],
    explanation:
      'Every natural wonder testifies to the colossal sculpting forces of geology, hydrology, and climate over millions of years.',
    funFact:
      'Because the Atacama Desert is virtually sterile and eerily Mars-like, NASA uses it as a real-world proving ground to test Mars rovers!',
  },
  'disc-ma-03': {
    curiosityHook: 'Strategic maritime chokepoints shaping the entire global economy!',
    title: 'Match each strategic canal or strait with the two seas or oceans it connects',
    columnATitle: 'Strategic Canal / Strait',
    columnBTitle: 'Connected Seas / Oceans',
    pairs: [
      {
        id: 'p1',
        left: 'Suez Canal',
        right: 'Links the Mediterranean Sea and Red Sea (shortcut toward the Indian Ocean)',
        reason: 'Cuts across Egypt’s Isthmus of Suez, joining European Mediterranean shipping lanes directly with the Red Sea and Asian markets.',
      },
      {
        id: 'p2',
        left: 'Panama Canal',
        right: 'Links the Atlantic Ocean and Pacific Ocean across Central America',
        reason: 'Crosses the narrow Isthmus of Panama, saving vessels over 13,000 km compared to rounding stormy Cape Horn.',
      },
      {
        id: 'p3',
        left: 'Strait of Malacca',
        right: 'Links the Indian Ocean and the East Sea / South China Sea (busiest sea lane)',
        reason: 'Situated between the Malay Peninsula and Sumatra (Indonesia), forming the vital sea gateway connecting the Indian and Pacific basins.',
      },
      {
        id: 'p4',
        left: 'Bering Strait',
        right: 'Links the Pacific Ocean and Arctic Ocean (separating Asia and North America)',
        reason: 'Narrow marine passage between Russia’s Cape Dezhnev and Alaska’s Cape Prince of Wales connecting the Pacific and Arctic oceans.',
      },
    ],
    explanation:
      'Strategic straits and interoceanic canals act as lifelines of global maritime trade, shaving thousands of kilometers off cargo voyages.',
    funFact:
      'Instead of being sea-level, the Panama Canal uses giant hydraulic locks to lift ships 26 meters above sea level across Lake Gatun and lower them on the far coast!',
  },
  'disc-ma-04': {
    curiosityHook: 'Inventions that let humanity master Earth’s spatial dimensions!',
    title: 'Match each geographic tool or technology with its remarkable real-world application',
    columnATitle: 'Geographic Tool / Technology',
    columnBTitle: 'Real-World Application',
    pairs: [
      {
        id: 'p1',
        left: 'Global Positioning System (GPS)',
        right: 'Real-time vehicle navigation and live location pinpointing on smartphones',
        reason: 'Uses signals from over 30 orbiting satellites to compute precise 3D coordinates down to the meter for handheld devices.',
      },
      {
        id: 'p2',
        left: 'Satellite Remote Sensing Imagery',
        right: 'Tracking hurricanes, wildfires, and polar ice-cap retreat from space',
        reason: 'Optical and infrared orbital sensors monitor Earth continuously, supporting early storm warnings, drought tracking, and climate science.',
      },
      {
        id: 'p3',
        left: 'Physical Scale Globe',
        right: 'Faithfully models Earth’s spherical geometry with zero map projection distortion',
        reason: 'A 3D globe is the only tool preserving true area, shape, and distance ratios simultaneously across every continent.',
      },
      {
        id: 'p4',
        left: 'Traditional Magnetic Compass',
        right: "Indicates North–South orientation using Earth's natural core magnetism",
        reason: "A freely pivoted magnetized needle aligns with geomagnetic field lines generated inside Earth's liquid outer core.",
      },
    ],
    explanation:
      'Combining classic geographic tools with space-age technology enables instantaneous meter-level positioning anywhere on the planet.',
    funFact:
      'To keep smartphone GPS accurate, engineers even apply Einstein’s Relativity equations to correct tiny time shifts on high-speed orbital atomic clocks!',
  },
  'disc-ma-05': {
    curiosityHook: 'Unraveling the weirdest weather phenomena ever witnessed!',
    title: 'Match each bizarre weather phenomenon with its scientific explanation',
    columnATitle: 'Bizarre Weather Phenomenon',
    columnBTitle: 'Scientific Explanation',
    pairs: [
      {
        id: 'p1',
        left: 'Raining fish or frogs falling from the sky',
        right: 'Waterspouts and tornadoes suck pond water and small animals skyward before dropping them miles away',
        reason: 'Strong rotating updrafts over lakes lift water and small aquatic creatures into storm clouds, carrying them kilometers inland.',
      },
      {
        id: 'p2',
        left: 'Double rainbow arching across the sky',
        right: 'Sunlight reflects twice inside falling raindrops',
        reason: 'The primary rainbow involves one internal reflection, whereas a faint outer secondary bow reflects twice—reversing its color order.',
      },
      {
        id: 'p3',
        left: 'Floating "ghost ships" hovering above the sea (Fata Morgana)',
        right: 'Light rays bend sharply across air layers with steep temperature and density contrasts',
        reason: 'Cold dense air trapped beneath warm air bends horizon light downward like a giant lens, making distant ships appear suspended in midair.',
      },
      {
        id: 'p4',
        left: 'Catatumbo lightning flashing up to 160 nights/year in Venezuela',
        right: 'Mountain-ringed lake basin traps warm methane-rich moist air meeting cool descending winds',
        reason: 'Cool mountain breezes collide continuously with humid warm air over Lake Maracaibo, charging relentless nighttime electrical storms.',
      },
    ],
    explanation:
      'Weather phenomena that once sounded like ancient myths actually stem from dramatic interactions among atmosphere, terrain, and optics.',
    funFact:
      'Catatumbo lightning strikes up to 280 times per hour—glowing so brightly that colonial sailors used it as a natural lighthouse!',
  },
  'disc-ma-06': {
    curiosityHook: 'Engineering marvels spanning seas to unite separated lands!',
    title: 'Match each monumental sea-crossing structure with the regions or countries it connects',
    columnATitle: 'Monumental Sea Crossing',
    columnBTitle: 'Connected Lands / Regions',
    pairs: [
      {
        id: 'p1',
        left: 'Channel Tunnel (Eurotunnel)',
        right: 'Connects Great Britain with mainland Europe (France) beneath the seabed',
        reason: 'A 50.45-km undersea rail tunnel boring beneath the English Channel to link the UK and French rail networks.',
      },
      {
        id: 'p2',
        left: 'Bosphorus Bridge (Istanbul)',
        right: 'Connects two continents—Europe and Asia—within a single metropolis',
        reason: 'Spans the Bosphorus Strait in Istanbul (Turkey), directly uniting the European and Asian halves of the city.',
      },
      {
        id: 'p3',
        left: 'Hong Kong–Zhuhai–Macau Bridge',
        right: 'World’s longest sea crossing linking three Pearl River Delta cities',
        reason: 'A 55-km bridge-and-tunnel system spanning the Pearl River Estuary to connect Hong Kong, Zhuhai, and Macau.',
      },
      {
        id: 'p4',
        left: 'Golden Gate Bridge',
        right: 'Spans the strait joining San Francisco Bay to the Pacific Ocean',
        reason: 'Iconic vermilion suspension bridge stretching across the 1.6-km Golden Gate strait on the US West Coast.',
      },
    ],
    explanation:
      'Modern civil engineering conquers deep marine barriers, transforming treacherous straits into bustling corridors of commerce.',
    funFact:
      'Roughly 37.9 km of the Channel Tunnel runs continuously under the sea—the longest undersea rail section anywhere on Earth!',
  },
  'disc-ma-07': {
    curiosityHook: 'Capital cities shaped by extraordinary geographic stories!',
    title: 'Match each unique capital city with its standout geographic characteristic',
    columnATitle: 'Unique Capital City',
    columnBTitle: 'Standout Geographic Feature',
    pairs: [
      {
        id: 'p1',
        left: 'La Paz (Bolivia)',
        right: 'Highest administrative capital in the world (~3,640 meters elevation)',
        reason: 'Nestled in a high Andean canyon beside the Altiplano plateau at an average altitude exceeding 3,640 m above sea level.',
      },
      {
        id: 'p2',
        left: 'Reykjavik (Iceland)',
        right: 'Northernmost capital of any sovereign nation (64°N latitude)',
        reason: 'Located at 64°08′N just south of the Arctic Circle—farther north than any other sovereign state capital.',
      },
      {
        id: 'p3',
        left: 'Brasília (Brazil)',
        right: 'Purpose-built capital shaped like an airplane when viewed from above',
        reason: 'Constructed from scratch in 1956 across Brazil’s interior highlands with an iconic Master Plan resembling a swept-wing aircraft.',
      },
      {
        id: 'p4',
        left: 'Canberra (Australia)',
        right: 'Planned inland capital chosen as a compromise between rival Sydney and Melbourne',
        reason: 'Built midway between Sydney and Melbourne to end fierce rivalry over which metropolis should become Australia’s capital.',
      },
    ],
    explanation:
      'Where nations site and design their capitals reveals deep truths about terrain, geopolitics, and national development strategy.',
    funFact:
      'High in thin-aired La Paz, water boils at only 88°C instead of 100°C—and visiting football teams often keep oxygen tanks handy on the sidelines!',
  },
  'disc-ma-08': {
    curiosityHook: 'The geographic homelands behind everyday foods and drinks!',
    title: 'Match each familiar crop or beverage with its native geographic hearth',
    columnATitle: 'Familiar Crop / Beverage',
    columnBTitle: 'Native Geographic Origin',
    pairs: [
      {
        id: 'p1',
        left: 'Coffee plant',
        right: 'Originated in the highland forests of Ethiopia (East Africa)',
        reason: 'Wild Coffea arabica grew naturally in Ethiopia’s Kaffa highlands before Arab traders cultivated and spread coffee globally.',
      },
      {
        id: 'p2',
        left: 'Cacao tree (source of Chocolate)',
        right: 'Native to the tropical rainforests of the Amazon Basin and Mesoamerica',
        reason: 'Originating in the Amazon Basin, cacao was domesticated by Olmec and Maya civilizations into a prized ceremonial drink millennia ago.',
      },
      {
        id: 'p3',
        left: 'Maize (corn) and Potatoes',
        right: 'Domesticated by ancient Inca and Maya civilizations in the Americas',
        reason: 'Maize evolved from wild Mexican teosinte grass, while Andean farmers domesticated potatoes over 8,000 years ago.',
      },
      {
        id: 'p4',
        left: 'Tea plant (Camellia sinensis)',
        right: 'Originated in misty subtropical uplands of Southwest China and northern Southeast Asia',
        reason: 'Warm humid mountain slopes with dense mist in Southwest China and northern Southeast Asia nurtured the earliest wild tea trees.',
      },
    ],
    explanation:
      'The post-15th-century Columbian Exchange carried crops between the Americas and Afro-Eurasia, reshaping global cuisine forever.',
    funFact:
      'Before 1492, Italians had never tasted tomatoes, Irish farmers had never seen potatoes, and Asian kitchens had never used chili peppers!',
  },
};
