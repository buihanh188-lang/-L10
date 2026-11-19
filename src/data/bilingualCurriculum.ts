import { CurriculumChapter, CurriculumPart, Lesson, Topic } from '../types';
import { LESSONS_EN, LessonBilingualData } from './bilingualLessonsEn';

/**
 * BILINGUAL CURRICULUM DATA (ENGLISH VERSION)
 * Grade 10 Geography - Connecting Knowledge to Life (General Education Program 2018)
 * Strictly aligned 1-to-1 with src/data/curriculum.ts and src/data/lessons.ts (13 Chapters, 40 Lessons)
 */

export const CURRICULUM_PARTS_EN: Record<string, Partial<CurriculumPart>> = {
  'phan-1': {
    title: 'PART 1. GENERAL ISSUES',
    description: 'Career orientation, position, and core role of Geography in the digital era.',
  },
  'phan-2': {
    title: 'PART 2. PHYSICAL GEOGRAPHY',
    description: 'Earth’s structural spheres, natural laws, and interactions across lithosphere, atmosphere, hydrosphere, and biosphere.',
  },
  'phan-3': {
    title: 'PART 3. SOCIO-ECONOMIC GEOGRAPHY',
    description: 'Global population, development resources, agriculture, industry, services, and green growth.',
  },
};

export const CURRICULUM_CHAPTERS_EN: Record<string, Partial<CurriculumChapter>> = {
  'chuong-1': {
    title: 'CHAPTER 1. USING MAPS',
    description: 'Methods for representing geographic objects on maps, GPS applications, and digital maps in daily life.',
  },
  'chuong-2': {
    title: 'CHAPTER 2. THE EARTH',
    description: 'Formation of Earth, crustal materials, and geographic consequences of rotation and solar revolution.',
  },
  'chuong-3': {
    title: 'CHAPTER 3. THE LITHOSPHERE',
    description: 'The lithosphere, plate tectonics theory, endogenic and exogenic processes, and earthquake–volcanic belts.',
  },
  'chuong-4': {
    title: 'CHAPTER 4. THE ATMOSPHERE',
    description: 'Atmospheric structure, air temperature distribution, air pressure, planetary winds, and climate types.',
  },
  'chuong-5': {
    title: 'CHAPTER 5. THE HYDROSPHERE',
    description: 'The hydrosphere, continental waters, seas and oceans, and river streamflow regime analysis.',
  },
  'chuong-6': {
    title: 'CHAPTER 6. THE BIOSPHERE',
    description: 'Soils on Earth, soil-forming factors, the biosphere, and global vegetation distribution laws.',
  },
  'chuong-7': {
    title: 'CHAPTER 7. LAWS OF THE GEOGRAPHIC ENVELOPE',
    description: 'The geographic envelope, law of wholeness and completeness, latitudinal zonality, and azonal laws.',
  },
  'chuong-8': {
    title: 'CHAPTER 8. POPULATION GEOGRAPHY',
    description: 'Population size, natural increase, age–sex structures, population distribution, and urbanization.',
  },
  'chuong-9': {
    title: 'CHAPTER 9. DEVELOPMENT RESOURCES AND ECONOMIC INDICATORS',
    description: 'Economic development resources, economic structure, GDP, and Gross National Income (GNI).',
  },
  'chuong-10': {
    title: 'CHAPTER 10. AGRICULTURE, FORESTRY, AND FISHERY',
    description: 'Role, characteristics, spatial organization of agro-forestry-fishery, and modern farming trends.',
  },
  'chuong-11': {
    title: 'CHAPTER 11. INDUSTRIAL GEOGRAPHY',
    description: 'Role and structure of industry, key sectors, industrial spatial organization, and environmental protection.',
  },
  'chuong-12': {
    title: 'CHAPTER 12. SERVICE SECTOR GEOGRAPHY',
    description: 'Service structure, transportation, postal & telecom, tourism, commerce, and banking & finance.',
  },
  'chuong-13': {
    title: 'CHAPTER 13. SUSTAINABLE DEVELOPMENT AND GREEN GROWTH',
    description: 'The environment, natural resource security, circular economy, green growth, and Net Zero goals.',
  },
};

export type { LessonBilingualData };
export { LESSONS_EN };

export const getLocalizedLesson = (lesson: Lesson, lang: 'vi' | 'en'): Lesson => {
  if (lang === 'vi') return lesson;

  const enData = LESSONS_EN[lesson.id];
  if (!enData) return lesson;

  return {
    ...lesson,
    title: enData.title,
    subtitle: enData.subtitle,
    objectives: enData.objectives,
    keyTerms: enData.keyTerms,
    keyKnowledge: enData.keyKnowledge.map((k) => ({
      sectionTitle: k.sectionTitle,
      content: k.content,
      highlight: k.highlight,
    })),
    realWorldExamples: enData.realWorldExamples,
    keyTakeaways: enData.keyTakeaways,
    visualData: lesson.visualData
      ? {
          ...lesson.visualData,
          title: `Visualization: ${enData.title}`,
          description: `Thematic diagram and map for ${enData.title}`,
          tags: ['Geography 10', '2018 Curriculum', `Lesson ${lesson.number}`],
        }
      : lesson.visualData,
  };
};

export const getLocalizedChapter = <T extends { id: string; number: number; title: string; description?: string }>(
  chapter: T,
  lang: 'vi' | 'en'
): T => {
  if (lang === 'vi') return chapter;
  const en = CURRICULUM_CHAPTERS_EN[chapter.id];
  if (en) {
    return {
      ...chapter,
      title: en.title || chapter.title,
      description: en.description || chapter.description,
    };
  }
  return chapter;
};

export const getLocalizedPart = (part: CurriculumPart, lang: 'vi' | 'en'): CurriculumPart => {
  if (lang === 'vi') return part;
  const en = CURRICULUM_PARTS_EN[part.id];
  if (en) {
    return {
      ...part,
      title: en.title || part.title,
      description: en.description || part.description,
    };
  }
  return part;
};

export const getLocalizedTopic = (topic: Topic, lang: 'vi' | 'en'): Topic => {
  if (lang === 'vi') return topic;
  if (topic.id === 'phan-1') {
    return {
      ...topic,
      title: 'General Issues (Lesson 1)',
      subtitle: 'Career Orientation',
      description: 'Geography and career orientation pathways for high school students.',
    };
  }
  const chEn = CURRICULUM_CHAPTERS_EN[topic.id];
  if (chEn) {
    const chNum = parseInt(topic.id.replace('chuong-', ''), 10);
    const isPhysical = !isNaN(chNum) && chNum <= 7;
    return {
      ...topic,
      title: chEn.title || topic.title,
      subtitle: isPhysical ? 'Part 2: Physical Geography' : 'Part 3: Socio-Economic Geography',
      description: chEn.description || topic.description,
    };
  }
  return topic;
};
