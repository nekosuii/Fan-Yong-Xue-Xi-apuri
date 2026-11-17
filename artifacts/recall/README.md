# Recall — 開発・変更ガイド

自分の問題を登録して学ぶ、iPhone向けのReact Native / Expo / TypeScriptアプリです。
ネット接続、アカウント、クラウドAPI、バックエンドサーバーは学習機能に必要ありません。

## 実装した機能

- 問題集：一覧、作成、名称・カバー色の変更、確認付き削除、登録問題数の表示
- 分類：作成、名称変更、削除、分類による絞り込み。入れ子・タグはありません
- 問題：○×と単一正解の選択式（2〜8択）。登録、編集、削除、所属問題集・分類の変更
- 検索：問題文と解説。ステータス・分類と組み合わせて絞り込み可能
- 演習：回答、正誤判定、正解・解説の表示、次の問題、完了、同じ問題で再学習
- ステータス：未設定／要復習／不安あり／定着。演習・編集で手動変更し、日時を保存
- 復習：要復習・不安ありの問題をホームから開始
- 保存：iPhone上のSQLite。差分更新・トランザクション・段階的なスキーマ移行
- CSV：ファイル選択、文字コード指定、全行検証、確認プレビュー、追加保存、共有シートへの書き出し、テンプレート
- 全データ削除：影響範囲と取り消せないことを説明して確認
- エラー、空状態、読み込み中、保存中の表示

初回は操作を試せる3問題集・9問の編集可能なサンプルを端末内に作成します。
画面にサンプルである旨を表示します。全削除したサンプルが自動で復活することはありません。

## 保存の仕組み

ネイティブ版は `src/database/database.ts` を使います。
`collections`、`categories`、`questions` の3テーブルをSQLiteに作成します。
問題集・分類IDを検索用カラムとして持ち、拡張可能なJSON本文も保存します。
変更した行のみをSQLパラメーターで書き込みます。
複数の変更は1つのトランザクションで実行し、失敗時にはロールバックします。
共有状態は保存完了後に更新するため、画面だけが保存済みになることはありません。

`PRAGMA user_version` でスキーマを管理します。
スキーマ変更時には `migrations.ts` の配列の末尾に移行SQLを追加してください。
公開済みの移行SQLは変更しないでください。

ブラウザプレビューのみ `database.web.ts` のAsyncStorageを使います。
プレビューのデータとiPhone上のSQLiteは別々です。
初回サンプル作成済みフラグもAsyncStorageに保存します。

クラウドへの自動バックアップ・同期はありません。
端末紛失・アプリ削除に備えてCSVを別の場所に保存してください。

## ファイル一覧と役割

すべてのパスはこのフォルダーを基準にしています。

| ファイル | 役割 |
| --- | --- |
| `app/_layout.tsx` | 起動、フォント・スプラッシュ、共通プロバイダー、スタックナビゲーション |
| `app/index.tsx` | ホームへのルート |
| `app/home.tsx` | ホームへの別ルート |
| `app/settings.tsx` | 設定へのルート |
| `app/collections/index.tsx` | 問題集一覧へのルート |
| `app/collections/[id].tsx` | 問題集の管理・新規作成へのルート |
| `app/questions/index.tsx` | 問題一覧へのルート |
| `app/questions/[id].tsx` | 問題の登録・編集へのルート |
| `app/questions/practice.tsx` | 演習へのルート |
| `src/screens/HomeScreen.tsx` | 問題集一覧、件数、復習の入り口 |
| `src/screens/CollectionScreen.tsx` | 問題集・分類の管理 |
| `src/screens/QuestionListScreen.tsx` | 問題一覧、検索、絞り込み |
| `src/screens/QuestionEditScreen.tsx` | 問題フォーム、検証、削除 |
| `src/screens/PracticeScreen.tsx` | 回答・解説・手動ステータス変更 |
| `src/screens/SettingsScreen.tsx` | CSV、データ削除、アプリ・利用権限情報 |
| `src/components/Button.tsx` | ボタン、保存中・無効状態、触覚フィードバック |
| `src/components/Card.tsx` | 共通カード |
| `src/components/QuestionCard.tsx` | 問題一覧の行 |
| `src/components/StatusBadge.tsx` | ステータスの見た目 |
| `src/components/Header.tsx` | Safe Area対応ヘッダー・戻る操作 |
| `src/components/EmptyState.tsx` | データや検索結果がない状態 |
| `src/components/Page.tsx` | 共通スクロール領域・画面下余白 |
| `src/database/database.ts` | iPhoneのSQLite接続、読み出し、差分書き込み |
| `src/database/database.web.ts` | ブラウザプレビューだけの保存アダプター |
| `src/database/migrations.ts` | 段階的なDBスキーマ更新 |
| `src/database/collectionRepository.ts` | 問題集・分類のデータ更新ルール |
| `src/database/questionRepository.ts` | 問題とステータスのデータ更新ルール |
| `src/services/csvImport.ts` | 文字コード変換、CSV全行検証、取り込み内容作成 |
| `src/services/csvExport.ts` | CSV生成、テンプレート |
| `src/services/csvFiles.ts` | ファイル選択・共有・ブラウザでのダウンロード |
| `src/services/questionService.ts` | 正誤判定・正解の表示文 |
| `src/services/entitlements.ts` | 将来の購入状態・無料枠を独立管理 |
| `src/services/sampleData.ts` | 初回だけ追加するサンプル問題 |
| `src/hooks/StudyProvider.tsx` | 共有状態、初期読み込み、書き込みの直列化 |
| `src/hooks/useQuestions.ts` | 問題の読み出し用フック |
| `src/hooks/useCollections.ts` | 問題集と問題数のフック |
| `src/constants/appConfig.ts` | 静的アプリ設定の参照 |
| `src/constants/status.ts` | ステータス値・日本語ラベル |
| `src/theme/colors.ts` | 全画面のパレット |
| `src/theme/typography.ts` | 基本文字サイズ |
| `src/theme/spacing.ts` | 基本余白・ボタン高さ |
| `src/theme/radius.ts` | 基本角丸 |
| `src/theme/styles.ts` | 共通の入力・文字・レイアウトスタイル |
| `src/types/question.ts` | 問題形式、学習状態、保存データ全体の型 |
| `src/types/collection.ts` | 問題集・分類の型 |
| `src/utils/date.ts` | ISO日時、表示日時、ローカルID |
| `src/utils/validation.ts` | 画面とCSVで共有する問題検証 |
| `src/utils/feedback.ts` | 削除確認・エラーメッセージ |
| `assets/images/icon.png` | アプリアイコン・スプラッシュ画像 |
| `app.json` | アプリ名・バージョン・アイコン・ネイティブ設定 |
| `package.json` | 依存関係、起動・型チェックのコマンド |
| `CSV_FORMAT.md` | CSV列・取り込みルールの説明 |

既存のExpoひな型の `components/ErrorBoundary.tsx`、
`components/ErrorFallback.tsx`、`components/KeyboardAwareScrollViewCompat.tsx`、
フォント・ビルド・プレビュー用ファイルは引き続き利用しています。
独自の下部タブは設けず、ホームから問題集・設定へ進むスタック構成です。

## 今後変更する場合

- **アプリ名**：`app.json` の `expo.name` を変更。画面は自動で同じ名前を参照します
- **色**：`src/theme/colors.ts`
- **基本の文字・余白・角丸**：`src/theme/typography.ts`、`spacing.ts`、`radius.ts`
- **共通スタイル**：`src/theme/styles.ts` と `src/components/`
- **画面固有の配置**：`src/screens/` の対象ファイル
- **ホームの固有デザイン**：`HomeScreen.tsx` のStyleSheet（色はパレットを参照）
- **問題入力の検証**：`src/utils/validation.ts`
- **無料枠**：`src/services/entitlements.ts` の設定値
- **CSV形式**：`csvImport.ts` と `csvExport.ts` を同時に更新

## 主な使用ライブラリ

- React Native、Expo SDK 58、TypeScript
- Expo Router：画面遷移
- expo-sqlite：端末内DB
- @react-native-async-storage/async-storage：初回フラグ・ブラウザ保存
- expo-document-picker：CSVファイル選択
- expo-file-system：ローカルファイルの読み書き
- expo-sharing：CSV共有シート
- Papa Parse：引用符・カンマ・改行対応のCSV処理
- encoding-japanese：日本語の文字コード変換
- @expo/vector-icons：アイコン
- expo-haptics：回答やボタンの触覚フィードバック
- react-native-safe-area-context：画面の安全な余白
- react-native-keyboard-controller：フォームのキーボード対応
- expo-font / @expo-google-fonts/inter / expo-splash-screen：同梱フォント・起動表示

## 今回実装していないもの

- 実課金、購入復元、無料版の制限適用（開発版は全機能利用可）
- App Storeへの公開、署名、審査、販売手続き
- クラウド同期、ログイン、自動クラウドバックアップ
- 回答回数、正答率、連続正解・連続学習・ランキング・高度な分析
- 複数正解の選択式、画像・音声問題、タグ、入れ子分類

実機でのCSV共有・ファイル選択、再起動後の保存、機内モード動作は、
iPhone上での確認を行うまでは検証済みとは扱いません。

## 今回の確認結果

- `pnpm install --frozen-lockfile`：成功
- アプリのTypeScript型チェック：成功
- iOS向けJavaScript/Hermesバンドルの書き出し：成功
- Android向けJavaScript/Hermesバンドルの書き出し：成功
- Expo開発サーバー：起動、バンドルの生成を確認
- ブラウザの初回画面取得：白画面の段階で撮影され、画面の表示完了は未確認
- iPhone実機、ネイティブバイナリのビルド、App Store公開：未確認・未実施

JavaScriptの書き出し成功は、実機動作や署名済みネイティブビルドの成功を意味しません。
