import { useStudy } from './StudyProvider';
// 未指定なら全問題、指定時は問題集内だけを返します。
export function useQuestions(collectionId?: string) {
  const { data, mutate } = useStudy();
  return { questions: collectionId ? data.questions.filter(x => x.collectionId === collectionId) : data.questions, mutate };
}
