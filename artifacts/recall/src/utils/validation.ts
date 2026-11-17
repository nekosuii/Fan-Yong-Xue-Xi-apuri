import type { Question, StudyData } from '../types/question';
// 画面とCSVで同じルールを使い、取り込み経路による不正データの混入を防ぎます。
export function validateQuestion(q: Question, data: StudyData): string | null {
  if (!q.id.trim()) return '問題IDがありません。';
  if (!q.questionText.trim()) return '問題文を入力してください。';
  if (!data.collections.some(x => x.id === q.collectionId)) return '所属する問題集を選んでください。';
  if (q.categoryId && !data.categories.some(x => x.id === q.categoryId && x.collectionId === q.collectionId)) return '分類と問題集の組み合わせが正しくありません。';
  if (!['unset', 'review', 'unsure', 'learned'].includes(q.status)) return '学習ステータスが不正です。';
  if (q.questionType === 'trueFalse') {
    if (!['true', 'false'].includes(q.correctAnswer)) return '○または×の正解を選んでください。';
  } else if (q.questionType === 'multipleChoice') {
    if (q.choices.length < 2 || q.choices.length > 8 || q.choices.some(x => !x.trim())) return '選択肢を2〜8個、空欄なしで入力してください。';
    if (new Set(q.choices.map(x => x.trim())).size !== q.choices.length) return '選択肢の内容が重複しています。';
    if (!/^\d+$/.test(q.correctAnswer) || !q.choices[Number(q.correctAnswer)]) return '正解の選択肢を選んでください。';
  } else return '問題形式が不正です。';
  for (const date of [q.createdAt, q.updatedAt, q.statusUpdatedAt].filter(Boolean)) {
    if (!Number.isFinite(Date.parse(date!))) return '日時の形式が正しくありません。';
  }
  return null;
}
