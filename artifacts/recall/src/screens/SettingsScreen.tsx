import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { Page } from '../components/Page';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useStudy } from '../hooks/StudyProvider';
import { decodeCsv, prepareImport, applyImport, type CsvEncoding, type ImportPreview } from '../services/csvImport';
import { exportCsv, csvTemplate } from '../services/csvExport';
import { pickCsvBytes, shareCsv } from '../services/csvFiles';
import { confirmAction, showError } from '../utils/feedback';
import { appConfig } from '../constants/appConfig';
import { getEntitlement } from '../services/entitlements';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// CSVは検証→内容確認→保存の順で進め、意図しない変更を防ぎます。
export default function SettingsScreen() {
  const { data, mutate } = useStudy();
  const [encoding, setEncoding] = useState<CsvEncoding>('AUTO');
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // CSVの読み取りはプレビューまでです。ユーザーが確認するまでデータを書き込みません。
  async function importFile() {
    setBusy('import'); setNotice(null);
    try { const bytes = await pickCsvBytes(); if (bytes) setPreview(prepareImport(decodeCsv(bytes, encoding), data)); }
    catch (e) { showError(e); } finally { setBusy(null); }
  }
  // 全行を1回の保存にまとめ、途中の行だけが取り込まれる状態を作りません。
  async function commitImport() {
    if (!preview) return;
    setBusy('commit');
    try { await mutate(d => applyImport(d, preview)); setNotice(`${preview.questionCount}問・${preview.collectionCount}問題集・${preview.categoryCount}分類を取り込みました。`); setPreview(null); }
    catch (e) { showError(e); } finally { setBusy(null); }
  }
  // エクスポートとテンプレートで同じファイル共有処理を使います。
  async function download(template = false) {
    setBusy(template ? 'template' : 'export');
    try { await shareCsv(template ? csvTemplate() : exportCsv(data), template ? 'recall-template.csv' : `recall-backup-${new Date().toISOString().slice(0, 10)}.csv`); }
    catch (e) { showError(e); } finally { setBusy(null); }
  }
  // 削除の影響範囲を示し、バックアップの機会を残します。
  async function clearData() {
    if (!await confirmAction('すべてのデータを削除しますか？', `${data.collections.length}問題集、${data.categories.length}分類、${data.questions.length}問と学習ステータスを削除します。元に戻せません。必要なら先にCSVを書き出してください。`)) return;
    setBusy('clear');
    try { await mutate(() => ({ collections: [], categories: [], questions: [] })); setNotice('すべての学習データを削除しました。サンプルは自動復元されません。'); } catch (e) { showError(e); } finally { setBusy(null); }
  }
  return <View style={ui.screen}><Header title="設定" /><Page>
    <View style={{ paddingTop: 12, gap: 6 }}><Text style={ui.title}>あなたの学びを、大切に。</Text><Text style={ui.muted}>データも、使い方も、自分の手で。</Text></View>
    {notice && <View style={{ padding: 18, backgroundColor: c.primarySoft, borderRadius: 14 }}><Text style={ui.body}>{notice}</Text></View>}
    <View style={{ gap: 13 }}><Text style={ui.sectionTitle}>CSVインポート・エクスポート</Text><Card style={{ gap: 16 }}><View style={ui.row}><Ionicons name="swap-vertical-outline" size={25} color={c.primary} /><Text style={[ui.body, { flex: 1 }]}>問題をまとめて、持ち運ぶ。</Text></View><Text style={ui.muted}>カンマ・引用符・改行を含む文章に対応。取り込み前に全件を検証し、既存の問題は上書きしません。</Text><Text style={ui.label}>読み込み時の文字コード</Text><View style={[ui.row, { flexWrap: 'wrap', gap: 7 }]}>{([{ value: 'AUTO', label: '自動' }, { value: 'UTF8', label: 'UTF-8' }, { value: 'SJIS', label: 'Shift_JIS' }, { value: 'UTF16LE', label: 'UTF-16' }] as const).map(x => <Pressable disabled={!!busy} key={x.value} testID={`encoding-${x.value}`} onPress={() => setEncoding(x.value)} style={[ui.pill, encoding === x.value && ui.selected]}><Text style={[ui.pillText, encoding === x.value && ui.selectedText]}>{x.label}</Text></Pressable>)}</View><Button title="CSVをインポート" icon="download-outline" loading={busy === 'import'} disabled={!!busy} onPress={() => void importFile()} /><Button title="すべてのデータをCSVに書き出す" icon="share-outline" variant="secondary" loading={busy === 'export'} disabled={!!busy} onPress={() => void download()} /><Button title="CSVテンプレートを保存" icon="document-text-outline" variant="secondary" loading={busy === 'template'} disabled={!!busy} onPress={() => void download(true)} /><Text style={[ui.muted, { fontSize: 11 }]}>書き出しは日本語に対応したUTF-8（BOM付き）です。{'\n'}選択式の正解番号は0始まり。○×はtrue / false。{'\n'}choicesはJSON配列、statusはunset / review / unsure / learnedです。空の問題IDは自動作成します。</Text></Card></View>
    <View style={{ gap: 13 }}><Text style={ui.sectionTitle}>データ管理</Text><Card style={{ gap: 18 }}><View style={ui.between}><Text style={ui.body}>この端末のデータ</Text><Text style={ui.muted}>{data.questions.length} 問</Text></View><Text style={ui.muted}>{Platform.OS === 'web' ? 'ブラウザプレビューではブラウザ内に保存します。iPhone版では端末内のSQLiteを使います。' : 'データは端末内のSQLiteに保存されます。ネット接続やアカウントは必要ありません。'}{'\n'}端末紛失やアプリ削除に備え、定期的にCSVを書き出してください。</Text><View style={ui.divider} /><Button title="すべてのデータを削除" variant="danger" icon="trash-outline" loading={busy === 'clear'} disabled={!!busy} onPress={() => void clearData()} /></Card></View>
    <View style={{ gap: 13 }}><Text style={ui.sectionTitle}>アプリについて</Text><Card style={{ gap: 18 }}><View style={ui.between}><Text style={[ui.heading, { letterSpacing: -0.8 }]}>{appConfig.name}</Text><Text style={ui.muted}>v{appConfig.version}</Text></View><Text style={ui.muted}>{appConfig.tagline}{'\n'}特定の試験にしばられない、自分だけの学習ノート。</Text><View style={ui.divider} /><View style={ui.between}><Text style={ui.body}>利用状態</Text><Text style={{ color: c.primary, fontSize: 12, fontWeight: '600' }}>{getEntitlement() === 'development' ? '開発版 · 全機能利用可' : getEntitlement() === 'paid' ? '有料版' : '無料版'}</Text></View><Text style={[ui.muted, { fontSize: 11 }]}>課金は行われません。無料版・買い切り版の購入処理は今後の対応予定です。</Text></Card></View>
    <View style={[ui.row, { justifyContent: 'center', gap: 6 }]}><Ionicons name="shield-checkmark-outline" size={14} color={c.secondaryText} /><Text style={[ui.muted, { fontSize: 11 }]}>ログイン不要。クラウド送信なし。</Text></View>
  </Page>
    <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => { if (!busy) setPreview(null); }}><View style={{ flex: 1, backgroundColor: c.ink + '99', justifyContent: 'center', padding: 24 }}><ScrollView style={{ maxHeight: '85%', flexGrow: 0 }} contentContainerStyle={[ui.card, { gap: 20 }]}><Text style={ui.heading}>取り込み内容を確認</Text><Text style={ui.body}>新しい問題集：{preview?.collectionCount} 冊{'\n'}新しい分類：{preview?.categoryCount} 件{'\n'}追加する問題：{preview?.questionCount} 問</Text><Text style={ui.muted}>既存データの変更・削除は行いません。全件をまとめて保存します。</Text><Button title="この内容で取り込む" icon="checkmark" loading={busy === 'commit'} disabled={!!busy} onPress={() => void commitImport()} /><Button title="キャンセル" variant="secondary" disabled={!!busy} onPress={() => setPreview(null)} /></ScrollView></View></Modal>
  </View>;
}
