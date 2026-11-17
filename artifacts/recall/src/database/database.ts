import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';
import { appConfig } from '../constants/appConfig';
import type { StudyData } from '../types/question';
let connection: Promise<SQLite.SQLiteDatabase> | null = null;
// 初回にだけ接続と段階的な移行を行います。移行失敗時はバージョンを進めません。
async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(appConfig.databaseName);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const current = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((current?.user_version ?? 0) > migrations.length) throw new Error('新しいバージョンのデータです。アプリを更新してください。');
  for (let i = current?.user_version ?? 0; i < migrations.length; i++) {
    await db.withTransactionAsync(async () => { await db.execAsync(migrations[i]); await db.execAsync(`PRAGMA user_version = ${i + 1}`); });
  }
  return db;
}
// 接続を再利用し、画面ごとにデータベースを開き直さないようにします。
async function database(): Promise<SQLite.SQLiteDatabase> {
  if (!connection) connection = openDatabase().catch(error => { connection = null; throw error; });
  return connection;
}
// 保存されたデータを画面から独立した型へ復元します。
export async function readData(): Promise<StudyData> {
  const db = await database();
  const read = async (table: string) => (await db.getAllAsync<{ payload: string }>(`SELECT payload FROM ${table} ORDER BY rowid`)).map(x => JSON.parse(x.payload));
  return { collections: await read('collections'), categories: await read('categories'), questions: await read('questions') };
}
// 変更分のみを書き込みます。CSVなどの一括操作も、全件成功または全件取消のトランザクションになります。
export async function saveData(before: StudyData, after: StudyData): Promise<void> {
  const db = await database();
  await db.withTransactionAsync(async () => {
    for (const table of ['collections', 'categories', 'questions'] as const) {
      const previous = new Map(before[table].map(x => [x.id, JSON.stringify(x)]));
      const nextIds = new Set(after[table].map(x => x.id));
      for (const old of before[table]) if (!nextIds.has(old.id)) await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, old.id);
      for (const row of after[table]) {
        const payload = JSON.stringify(row);
        if (previous.get(row.id) === payload) continue;
        if (table === 'collections') await db.runAsync('INSERT OR REPLACE INTO collections (id,payload) VALUES (?,?)', row.id, payload);
        else if (table === 'categories') await db.runAsync('INSERT OR REPLACE INTO categories (id,collectionId,payload) VALUES (?,?,?)', row.id, 'collectionId' in row ? row.collectionId : '', payload);
        else await db.runAsync('INSERT OR REPLACE INTO questions (id,collectionId,categoryId,payload) VALUES (?,?,?,?)', row.id, 'collectionId' in row ? row.collectionId : '', 'categoryId' in row ? row.categoryId : null, payload);
      }
    }
  });
}
