// 将来の変更は末尾へ追加します。既存の移行を変更せず、ユーザーのデータを保持します。
export const migrations = [
  `CREATE TABLE IF NOT EXISTS collections (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY NOT NULL, collectionId TEXT NOT NULL, payload TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS questions (id TEXT PRIMARY KEY NOT NULL, collectionId TEXT NOT NULL, categoryId TEXT, payload TEXT NOT NULL);
   CREATE INDEX IF NOT EXISTS questions_collection ON questions(collectionId);
   CREATE INDEX IF NOT EXISTS questions_category ON questions(categoryId);
   CREATE INDEX IF NOT EXISTS categories_collection ON categories(collectionId);`,
];
