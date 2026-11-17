import type { Category, Collection } from './collection';
export type QuestionStatus = 'unset' | 'review' | 'unsure' | 'learned';
export type QuestionType = 'trueFalse' | 'multipleChoice';
export interface Question {
  id: string;
  collectionId: string;
  categoryId: string | null;
  questionType: QuestionType;
  questionText: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  status: QuestionStatus;
  statusUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface StudyData {
  collections: Collection[];
  categories: Category[];
  questions: Question[];
}
