import Papa from 'papaparse';
import Encoding from 'encoding-japanese';
import type { StudyData, Question, QuestionStatus, QuestionType } from '../types/question';
import { newId, now } from '../utils/date';
import { validateQuestion } from '../utils/validation';
import { assertCanCreate } from './entitlements';
export type CsvEncoding = 'AUTO' | 'UTF8' | 'SJIS' | 'UTF16LE';
type Row = Record<string, string>;
export interface ImportPreview { additions: StudyData; questionCount: number; collectionCount: number; categoryCount: number; }
// UTF-8/BOM/Shift_JIS/UTF-16を扱います。自動判定が曖昧な場合は設定画面で文字コードを指定できます。
export function decodeCsv(bytes: Uint8Array, from: CsvEncoding): string {
  const detected = from === 'AUTO' ? Encoding.detect(bytes) : from;
  if (!detected) throw new Error('文字コードを判定できませんでした。UTF-8またはShift_JISを指定してください。');
  return Encoding.convert(bytes, { to: 'UNICODE', from: detected, type: 'string' }).replace(/^\uFEFF/, '');
}
// CSVを全行検証してからプレビューを作ります。この段階では端末内データを変更しません。
export function prepareImport(text: string, existing: StudyData): ImportPreview {
  const parsed = Papa.parse<Row>(text.replace(/^\uFEFF/, ''), { header: true, skipEmptyLines: 'greedy', transformHeader: x => x.trim() });
  if (parsed.errors.length) throw new Error(`CSVを読み取れません。${parsed.errors.slice(0, 3).map(x => `行${(x.row ?? 0) + 2}: ${x.message}`).join('\n')}`);
  if (!parsed.data.length) throw new Error('CSVにデータがありません。');
  if (!parsed.meta.fields?.includes('questionText')) throw new Error('questionText列がありません。「CSVテンプレート」を参考にしてください。');
  const additions: StudyData = { collections: [], categories: [], questions: [] };
  const combined: StudyData = { collections: [...existing.collections], categories: [...existing.categories], questions: [...existing.questions] };
  const seenQuestionIds = new Set(existing.questions.map(x => x.id));
  const date = now();
  // 参照先の問題集は先に解決し、行の並び順によるエラーを避けます。
  function ensureCollection(row: Row): string {
    const id = row.collectionId?.trim();
    if (!id) throw new Error('collectionIdが空です。問題集のIDを指定してください。');
    const current = combined.collections.find(x => x.id === id);
    if (current) {
      if (row.collectionName && current.name !== row.collectionName) throw new Error(`問題集ID「${id}」は既存の「${current.name}」と名前が異なります。上書きは行いません。`);
    } else {
      if (!row.collectionName?.trim()) throw new Error(`新規問題集「${id}」のcollectionNameがありません。`);
      if (combined.collections.some(x => x.name === row.collectionName.trim())) throw new Error(`問題集「${row.collectionName}」は別IDで存在します。既存のcollectionIdを指定してください。`);
      assertCanCreate('collection', combined.collections.length);
      const collection = { id, name: row.collectionName.trim(), color: '0', createdAt: date, updatedAt: date };
      additions.collections.push(collection); combined.collections.push(collection);
    }
    return id;
  }
  // 分類IDが同じでも所属が異なれば拒否し、既存の分類を別の問題集へ動かしません。
  function ensureCategory(row: Row, collectionId: string): string | null {
    const id = row.categoryId?.trim();
    if (!id) return null;
    const current = combined.categories.find(x => x.id === id);
    if (current) {
      if (current.collectionId !== collectionId || (row.categoryName && current.name !== row.categoryName)) throw new Error(`分類ID「${id}」の所属または名前が既存データと異なります。`);
    } else {
      if (!row.categoryName?.trim()) throw new Error(`新規分類「${id}」のcategoryNameがありません。`);
      if (combined.categories.some(x => x.collectionId === collectionId && x.name === row.categoryName.trim())) throw new Error(`分類「${row.categoryName}」は別IDで存在します。既存のcategoryIdを指定してください。`);
      const category = { id, collectionId, name: row.categoryName.trim(), createdAt: date, updatedAt: date };
      additions.categories.push(category); combined.categories.push(category);
    }
    return id;
  }
  // エラーにはCSVの行番号を付け、修正箇所を特定できるようにします。
  function atRow(row: Row, index: number, work: () => void) {
    try { work(); } catch (e) { throw new Error(`CSV ${index + 2}行目：${e instanceof Error ? e.message : '不正なデータです。'}`); }
  }
  parsed.data.forEach((row, i) => atRow(row, i, () => {
    if (row.rowType && !['collection', 'category', 'question'].includes(row.rowType)) throw new Error('rowTypeはcollection / category / questionのいずれかです。');
    if (!row.rowType || row.rowType === 'collection') ensureCollection(row);
  }));
  parsed.data.forEach((row, i) => atRow(row, i, () => {
    if (row.rowType === 'category') {
      if (!row.categoryId?.trim()) throw new Error('分類の行にはcategoryIdが必要です。');
      ensureCategory(row, ensureCollection(row));
    }
  }));
  parsed.data.forEach((row, i) => atRow(row, i, () => {
    if (row.rowType && row.rowType !== 'question') return;
    const collectionId = ensureCollection(row);
    const categoryId = ensureCategory(row, collectionId);
    const id = row.id?.trim() || newId();
    if (seenQuestionIds.has(id)) throw new Error(`問題ID「${id}」が重複しています。既存データの上書きは行いません。新しいIDに変更してください。`);
    let choices: unknown;
    try { choices = row.choices ? JSON.parse(row.choices) : []; } catch { throw new Error('choicesはJSON配列で指定してください。例：["選択肢A","選択肢B"]'); }
    if (!Array.isArray(choices) || choices.some(x => typeof x !== 'string')) throw new Error('choicesは文字列の配列で指定してください。');
    const question: Question = {
      id, collectionId, categoryId, questionText: row.questionText ?? '',
      questionType: row.questionType as QuestionType, choices,
      correctAnswer: row.correctAnswer ?? '', explanation: row.explanation ?? '',
      status: (row.status || 'unset') as QuestionStatus, statusUpdatedAt: row.statusUpdatedAt || null,
      createdAt: row.createdAt || date, updatedAt: row.updatedAt || date,
    };
    const validation = validateQuestion(question, combined);
    if (validation) throw new Error(validation);
    assertCanCreate('question', combined.questions.length);
    additions.questions.push(question); combined.questions.push(question); seenQuestionIds.add(id);
  }));
  return { additions, questionCount: additions.questions.length, collectionCount: additions.collections.length, categoryCount: additions.categories.length };
}
// 確認待ちの間にデータが変わっても、最終保存直前に重複と参照関係を再確認します。
export function applyImport(data: StudyData, preview: ImportPreview): StudyData {
  for (const key of ['collections', 'categories', 'questions'] as const) {
    if (preview.additions[key].some(x => data[key].some(y => y.id === x.id))) throw new Error('確認中にデータが変更されました。CSVをもう一度選択してください。');
  }
  const next = { collections: [...data.collections, ...preview.additions.collections], categories: [...data.categories, ...preview.additions.categories], questions: [...data.questions, ...preview.additions.questions] };
  for (const q of preview.additions.questions) { const error = validateQuestion(q, next); if (error) throw new Error(error); }
  return next;
}
