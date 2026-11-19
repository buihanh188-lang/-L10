import { MultipleChoiceQuestion, Question } from '../types';

/**
 * Utility to shuffle an array immutably
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles options for a multiple-choice question while preserving correctIndex
 */
export function shuffleQuestionOptions(q: Question): Question {
  if (q.type !== 'multiple_choice') {
    return { ...q };
  }

  const mc = q as MultipleChoiceQuestion;
  const correctText = mc.options[mc.correctIndex];
  
  // Pair options with their original text
  const paired = mc.options.map((text, idx) => ({ text, originalIdx: idx }));
  const shuffledPaired = shuffleArray(paired);

  const newOptions = shuffledPaired.map((p) => p.text) as [string, string, string, string];
  const newCorrectIndex = shuffledPaired.findIndex((p) => p.text === correctText);

  return {
    ...mc,
    options: newOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : mc.correctIndex,
  };
}

/**
 * Helper to determine standard numerical order of 4 question types:
 * 1: multiple_choice (Dạng 1)
 * 2: true_false_context (Dạng 2)
 * 3: short_answer (Dạng 3)
 * 4: matching (Dạng 4)
 */
export function getQuestionTypeOrder(type: string): number {
  switch (type) {
    case 'multiple_choice':
      return 1;
    case 'true_false_context':
      return 2;
    case 'short_answer':
      return 3;
    case 'matching':
      return 4;
    default:
      return 5;
  }
}

/**
 * Sorts questions strictly in curriculum standard order:
 * Dạng 1 -> Dạng 2 -> Dạng 3 -> Dạng 4 (Never mixed or reversed)
 */
export function sortQuestionsByStandardOrder(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    const orderA = getQuestionTypeOrder(a.type);
    const orderB = getQuestionTypeOrder(b.type);
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Prepares questions specifically for examination mode:
 * - Ensures balanced representation across all 4 types
 * - STAYS STRICTLY IN ORDER: Dạng 1 -> Dạng 2 -> Dạng 3 -> Dạng 4 (NEVER SHUFFLED ACROSS TYPES)
 */
export function prepareExamQuestions(
  sourceQuestions: Question[],
  desiredCount: number = 28
): Question[] {
  if (sourceQuestions.length === 0) return [];

  // Group by 4 types
  const mcList = sourceQuestions.filter((q) => q.type === 'multiple_choice');
  const tfList = sourceQuestions.filter((q) => q.type === 'true_false_context');
  const saList = sourceQuestions.filter((q) => q.type === 'short_answer');
  const matchList = sourceQuestions.filter((q) => q.type === 'matching');

  let selectedMC: Question[] = [];
  let selectedTF: Question[] = [];
  let selectedSA: Question[] = [];
  let selectedMatch: Question[] = [];

  if (desiredCount === 28 || desiredCount === 45) {
    // Chuẩn ma trận đề 45 phút BGD GDPT 2018: 28 câu
    // 18 câu Dạng 1, 4 câu Dạng 2 (16 ý), 4 câu Dạng 3, 2 câu Dạng 4
    selectedMC = shuffleArray(mcList).slice(0, 18);
    selectedTF = shuffleArray(tfList).slice(0, 4);
    selectedSA = shuffleArray(saList).slice(0, 4);
    selectedMatch = shuffleArray(matchList).slice(0, 2);
  } else if (desiredCount === 40) {
    // 40 câu trọn bộ: 10 câu mỗi dạng
    selectedMC = shuffleArray(mcList).slice(0, 10);
    selectedTF = shuffleArray(tfList).slice(0, 10);
    selectedSA = shuffleArray(saList).slice(0, 10);
    selectedMatch = shuffleArray(matchList).slice(0, 10);
  } else if (desiredCount === 20 || desiredCount === 30) {
    // 20 câu kiểm tra 30 phút: 12 MC, 4 TF, 2 SA, 2 Matching
    selectedMC = shuffleArray(mcList).slice(0, 12);
    selectedTF = shuffleArray(tfList).slice(0, 4);
    selectedSA = shuffleArray(saList).slice(0, 2);
    selectedMatch = shuffleArray(matchList).slice(0, 2);
  } else if (desiredCount === 15) {
    // 15 câu kiểm tra 20 phút: 8 MC, 3 TF, 2 SA, 2 Matching
    selectedMC = shuffleArray(mcList).slice(0, 8);
    selectedTF = shuffleArray(tfList).slice(0, 3);
    selectedSA = shuffleArray(saList).slice(0, 2);
    selectedMatch = shuffleArray(matchList).slice(0, 2);
  } else if (desiredCount === 10) {
    // 10 câu kiểm tra 15 phút: 6 MC, 2 TF, 1 SA, 1 Matching
    selectedMC = shuffleArray(mcList).slice(0, 6);
    selectedTF = shuffleArray(tfList).slice(0, 2);
    selectedSA = shuffleArray(saList).slice(0, 1);
    selectedMatch = shuffleArray(matchList).slice(0, 1);
  } else {
    // Generic fallback: pick proportionally
    const p1 = Math.max(1, Math.round(desiredCount * 0.5));
    const p2 = Math.max(1, Math.round(desiredCount * 0.2));
    const p3 = Math.max(1, Math.round(desiredCount * 0.15));
    const p4 = Math.max(1, desiredCount - p1 - p2 - p3);
    selectedMC = shuffleArray(mcList).slice(0, p1);
    selectedTF = shuffleArray(tfList).slice(0, p2);
    selectedSA = shuffleArray(saList).slice(0, p3);
    selectedMatch = shuffleArray(matchList).slice(0, p4);
  }

  // Shuffle multiple choice options within each question without breaking correct answers
  const randomizedMC = selectedMC.map((q) => shuffleQuestionOptions(q));

  // TUÂN THỦ NGHIÊM NGẶT THỨ TỰ: Dạng 1 -> Dạng 2 -> Dạng 3 -> Dạng 4 (KHÔNG TRỘN LỘN XỘN)
  return [
    ...randomizedMC,
    ...selectedTF,
    ...selectedSA,
    ...selectedMatch,
  ];
}

/**
 * Filters questions for custom practice mode
 * Guarantees that when 'all' formats are selected, all 4 formats are included in exact sequence.
 */
export function filterCustomPracticeQuestions(
  sourceQuestions: Question[],
  filter: {
    type?: string;
    cognitiveLevel?: string;
    count?: number;
  }
): Question[] {
  let filtered = [...sourceQuestions];

  if (filter.cognitiveLevel && filter.cognitiveLevel !== 'all') {
    filtered = filtered.filter((q) => q.cognitiveLevel === filter.cognitiveLevel);
  }

  if (filter.type && filter.type !== 'all') {
    const singleTypeFiltered = filtered.filter((q) => q.type === filter.type);
    const shuffled = shuffleArray(singleTypeFiltered);
    const targetCount = filter.count || 10;
    return shuffled.slice(0, targetCount);
  }

  // When type is 'all' (tổng hợp cả 4 dạng):
  // MUST have all 4 types in exact order 1 -> 2 -> 3 -> 4!
  const targetCount = filter.count || 10;
  return prepareExamQuestions(filtered, targetCount);
}
