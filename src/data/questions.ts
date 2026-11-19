import { Question } from '../types';
import { QUESTIONS_PART1 } from './questionsPart1';
import { QUESTIONS_PART2 } from './questionsPart2';
import { QUESTIONS_PART3 } from './questionsPart3';
import { SKILL_CALCULATION_QUESTIONS } from './skillCalculationQuestions';

// Complete question bank for all 40 lessons + specialized skills bank
export const INITIAL_QUESTIONS: Question[] = [
  ...QUESTIONS_PART1,
  ...QUESTIONS_PART2,
  ...QUESTIONS_PART3,
  ...SKILL_CALCULATION_QUESTIONS,
];

