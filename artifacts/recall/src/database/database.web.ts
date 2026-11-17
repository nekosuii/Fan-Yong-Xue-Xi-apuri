import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StudyData } from '../types/question';
const key = 'recall-browser-preview-v1';
// ブラウザプレビュー専用の保存先です。iPhoneでは同名の database.ts のSQLiteが使われます。
export async function readData(): Promise<StudyData> {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : { collections: [], categories: [], questions: [] };
}
// プレビューでも保存失敗を呼び出し側へ返し、保存されたように見せないようにします。
export async function saveData(_before: StudyData, after: StudyData): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(after));
}
