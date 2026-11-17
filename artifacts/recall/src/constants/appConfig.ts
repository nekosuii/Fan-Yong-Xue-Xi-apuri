import manifest from '../../app.json';
// 名前はapp.jsonのexpo.nameを1か所変更するだけで、端末表示・画面内の両方へ反映します。
export const appConfig = {
  name: manifest.expo.name,
  version: manifest.expo.version,
  tagline: '学びを、自分のものに。',
  databaseName: 'recall.db',
};
