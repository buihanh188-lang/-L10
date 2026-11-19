import { LESSONS } from './lessons';
import { LESSONS_EN_PART1, LessonBilingualData } from './bilingualLessonsEnPart1';
import { LESSONS_EN_PART2 } from './bilingualLessonsEnPart2';

export type { LessonBilingualData };

export const LESSONS_EN: Record<string, LessonBilingualData> = {
  ...LESSONS_EN_PART1,
  ...LESSONS_EN_PART2,
};

// Exact Vietnamese -> English lookup map built automatically from LESSONS <-> LESSONS_EN
export const VI_TO_EN_LESSON_TEXT = new Map<string, string>();
export const VI_LOWER_TO_EN_LESSON_TEXT = new Map<string, string>();

interface TruncatedEntry {
  vi: string;
  en: string;
}
const VI_TO_EN_ENTRIES: TruncatedEntry[] = [];

function registerPair(vi: string | undefined, en: string | undefined): void {
  if (!vi || !en) return;
  const v = vi.trim();
  const e = en.trim();
  if (!v || !e) return;
  if (!VI_TO_EN_LESSON_TEXT.has(v)) {
    VI_TO_EN_LESSON_TEXT.set(v, e);
    VI_TO_EN_ENTRIES.push({ vi: v, en: e });
  }
  const vl = v.toLowerCase();
  if (!VI_LOWER_TO_EN_LESSON_TEXT.has(vl)) {
    VI_LOWER_TO_EN_LESSON_TEXT.set(vl, e);
  }
}

for (const viLesson of LESSONS) {
  const enLesson = LESSONS_EN[viLesson.id];
  if (!enLesson) continue;

  registerPair(viLesson.title, enLesson.title);
  registerPair(viLesson.subtitle, enLesson.subtitle);

  viLesson.objectives.forEach((obj, idx) => registerPair(obj, enLesson.objectives[idx]));

  viLesson.keyTerms.forEach((kt, idx) => {
    const enKt = enLesson.keyTerms[idx];
    if (!enKt) return;
    registerPair(kt.term, enKt.term);
    registerPair(kt.definition, enKt.definition);
  });

  viLesson.keyKnowledge.forEach((sec, idx) => {
    const enSec = enLesson.keyKnowledge[idx];
    if (!enSec) return;
    registerPair(sec.sectionTitle, enSec.sectionTitle);
    sec.content.forEach((c, cIdx) => registerPair(c, enSec.content[cIdx]));
    if (sec.highlight && enSec.highlight) {
      registerPair(sec.highlight, enSec.highlight);
    }
    // Also register multi-sentence context excerpts used in True/False questions (slice(0, 2) or full join)
    if (sec.content.length >= 2) {
      registerPair(
        sec.content.slice(0, 2).join(' '),
        enSec.content.slice(0, 2).join(' ')
      );
    }
    if (sec.content.length >= 3) {
      registerPair(
        sec.content.slice(0, 3).join(' '),
        enSec.content.slice(0, 3).join(' ')
      );
    }
    registerPair(sec.content.join(' '), enSec.content.join(' '));
  });

  (viLesson.realWorldExamples || []).forEach((ex, idx) =>
    registerPair(ex, enLesson.realWorldExamples[idx])
  );
  (viLesson.keyTakeaways || []).forEach((tk, idx) =>
    registerPair(tk, enLesson.keyTakeaways[idx])
  );

  if (viLesson.visualData) {
    registerPair(viLesson.visualData.title, `Visualization: ${enLesson.title}`);
    registerPair(
      viLesson.visualData.description,
      `Thematic diagram and map for ${enLesson.title}`
    );
  }
}

function smartTruncateEn(en: string, maxLen = 152): string {
  if (en.length <= maxLen) return en;
  const cut = en.slice(0, maxLen - 3);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd() + '...';
}

/**
 * Resolves any exact Vietnamese lesson string, lowercased definition,
 * or 150-char "..." truncated option/pair back to its clean English counterpart.
 */
export function lookupLessonEnglish(viText: string): string | null {
  if (!viText) return null;
  const trimmed = viText.trim();

  const exact = VI_TO_EN_LESSON_TEXT.get(trimmed);
  if (exact) return exact;

  const lower = VI_LOWER_TO_EN_LESSON_TEXT.get(trimmed.toLowerCase());
  if (lower) return lower;

  // Handle options / column B strings truncated with "..." (typically ~150 chars)
  if (trimmed.endsWith('...')) {
    const prefix = trimmed.slice(0, -3).trimEnd();
    const prefixLower = prefix.toLowerCase();
    for (const entry of VI_TO_EN_ENTRIES) {
      if (entry.vi.startsWith(prefix) || entry.vi.toLowerCase().startsWith(prefixLower)) {
        return smartTruncateEn(entry.en, 152);
      }
    }
  }

  // Fallback for explanations that lowercase first letter of full sentence or end without period
  const trimmedNoDot = trimmed.replace(/\.$/, '');
  for (const entry of VI_TO_EN_ENTRIES) {
    if (entry.vi.toLowerCase().replace(/\.$/, '') === trimmedNoDot.toLowerCase()) {
      return entry.en;
    }
  }

  return null;
}

/**
 * Resolves a definition phrase that had its first character lowercased in Vietnamese explanations,
 * formatting it smoothly for embedding after "is" / "is defined as".
 */
export function lookupLessonEnglishEmbedded(viText: string): string | null {
  const res = lookupLessonEnglish(viText);
  if (!res) return null;
  // Keep proper acronyms uppercase (GPS, GIS, FSC, etc.), otherwise lowercase leading capital unless "Earth" / "Lang Son"
  if (/^(GPS|GIS|FSC|GDP|GNI|COP26|Vietnam|Lang Son|Chi Lang|Van Linh|Red River|Son Tay|Pacific|Earth|Na Duong|Ai Chi Lang|Dong Banh)/i.test(res)) {
    return res;
  }
  return res.charAt(0).toLowerCase() + res.slice(1);
}
