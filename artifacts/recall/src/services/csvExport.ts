import Papa from 'papaparse';
import type { StudyData } from '../types/question';
export const csvFields = ['rowType', 'id', 'collectionId', 'collectionName', 'categoryId', 'categoryName', 'questionType', 'questionText', 'choices', 'correctAnswer', 'explanation', 'status', 'statusUpdatedAt', 'createdAt', 'updatedAt'];
// 改行やカンマ、引用符はライブラリで適切にエスケープします。BOMによりExcelの日本語文字化けを防ぎます。
export function exportCsv(data: StudyData): string {
  const rows: Record<string, string>[] = [];
  for (const collection of data.collections) rows.push({ rowType: 'collection', collectionId: collection.id, collectionName: collection.name });
  for (const category of data.categories) rows.push({ rowType: 'category', collectionId: category.collectionId, collectionName: data.collections.find(x => x.id === category.collectionId)?.name ?? '', categoryId: category.id, categoryName: category.name });
  for (const q of data.questions) rows.push({ ...q, rowType: 'question', collectionName: data.collections.find(x => x.id === q.collectionId)?.name ?? '', categoryId: q.categoryId ?? '', categoryName: data.categories.find(x => x.id === q.categoryId)?.name ?? '', choices: JSON.stringify(q.choices), statusUpdatedAt: q.statusUpdatedAt ?? '' });
  return '\uFEFF' + Papa.unparse({ fields: csvFields, data: rows.map(row => csvFields.map(field => row[field] ?? '')) }, { newline: '\r\n', quotes: true });
}
// インポート可能な最小構成の見本です。選択式は0始まりの正解番号を使います。
export function csvTemplate(): string {
  return exportCsv({
    collections: [{ id: 'my-collection', name: '自分の問題集', color: '0', createdAt: '', updatedAt: '' }],
    categories: [],
    questions: [{ id: '', collectionId: 'my-collection', categoryId: null, questionType: 'multipleChoice', questionText: '日本の首都は？', choices: ['東京', '大阪', '京都'], correctAnswer: '0', explanation: '日本の首都は東京です。', status: 'unset', statusUpdatedAt: null, createdAt: '', updatedAt: '' }],
  });
}
