import type { Question } from '../types/question';
// 正解を選択肢の表示文と分離します。選択式の正解は0始まりの番号、○×はtrue/falseです。
export function answerLabel(question: Question): string {
  return question.questionType === 'trueFalse' ? (question.correctAnswer === 'true' ? '○ 正しい' : '× 誤り') : question.choices[Number(question.correctAnswer)] ?? '';
}
// 演習結果を履歴へ蓄積せず、その場の正誤だけを判定します。
export function isCorrect(question: Question, answer: string): boolean { return question.correctAnswer === answer; }
