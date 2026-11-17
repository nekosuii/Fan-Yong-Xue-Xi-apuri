import type { Category, Collection } from '../types/collection';
import type { StudyData } from '../types/question';
// 問題集の名前の重複を防ぎつつ、新規作成・更新を共通処理にします。
export function putCollection(data: StudyData, collection: Collection): StudyData {
  if (!collection.name.trim()) throw new Error('問題集名を入力してください。');
  if (data.collections.some(x => x.id !== collection.id && x.name === collection.name)) throw new Error('同じ名前の問題集があります。');
  return { ...data, collections: data.collections.some(x => x.id === collection.id) ? data.collections.map(x => x.id === collection.id ? collection : x) : [...data.collections, collection] };
}
// 問題集を削除すると所属する分類と問題も削除します。実行前の確認は画面側で行います。
export function removeCollection(data: StudyData, id: string): StudyData {
  return { collections: data.collections.filter(x => x.id !== id), categories: data.categories.filter(x => x.collectionId !== id), questions: data.questions.filter(x => x.collectionId !== id) };
}
// 分類は必ず問題集に所属させます。さらに分類を入れ子にする機能は持たせません。
export function putCategory(data: StudyData, category: Category): StudyData {
  if (!category.name.trim()) throw new Error('分類名を入力してください。');
  if (!data.collections.some(x => x.id === category.collectionId)) throw new Error('問題集が見つかりません。');
  if (data.categories.some(x => x.id !== category.id && x.collectionId === category.collectionId && x.name === category.name)) throw new Error('同じ名前の分類があります。');
  return { ...data, categories: data.categories.some(x => x.id === category.id) ? data.categories.map(x => x.id === category.id ? category : x) : [...data.categories, category] };
}
// 分類だけを削除した場合は問題を残し、「分類なし」へ移します。
export function removeCategory(data: StudyData, id: string): StudyData {
  return { ...data, categories: data.categories.filter(x => x.id !== id), questions: data.questions.map(x => x.categoryId === id ? { ...x, categoryId: null, updatedAt: new Date().toISOString() } : x) };
}
