import type { Question, QuestionStatus, StudyData } from '../types/question';
import { validateQuestion } from '../utils/validation';
import { now } from '../utils/date';
// 入力値は保存直前にも検証し、画面以外からの呼び出しにも同じ制約を適用します。
export function putQuestion(data: StudyData, question: Question): StudyData {
  const error = validateQuestion(question, data);
  if (error) throw new Error(error);
  return { ...data, questions: data.questions.some(x => x.id === question.id) ? data.questions.map(x => x.id === question.id ? question : x) : [...data.questions, question] };
}
// 指定した問題だけを削除します。
export function removeQuestion(data: StudyData, id: string): StudyData { return { ...data, questions: data.questions.filter(x => x.id !== id) }; }
// 正誤判定から独立して、ユーザーが選んだ現在の状態と変更日時のみ記録します。
export function updateQuestionStatus(data: StudyData, id: string, status: QuestionStatus): StudyData {
  return { ...data, questions: data.questions.map(x => x.id === id ? { ...x, status, statusUpdatedAt: now(), updatedAt: now() } : x) };
}
