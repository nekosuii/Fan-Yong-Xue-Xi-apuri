import { useStudy } from './StudyProvider';
// 問題数は実データから計算し、別のカウンターとのずれを防ぎます。
export function useCollections() {
  const { data, mutate } = useStudy();
  return { collections: data.collections.map(x => ({ ...x, questionCount: data.questions.filter(q => q.collectionId === x.id).length })), mutate };
}
