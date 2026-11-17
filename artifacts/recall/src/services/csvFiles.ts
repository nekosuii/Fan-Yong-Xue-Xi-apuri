import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// ファイル選択をユーザー操作からだけ開始します。外部サーバーへは送信しません。
export async function pickCsvBytes(): Promise<Uint8Array | null> {
  const picked = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'text/plain', 'application/vnd.ms-excel', 'application/octet-stream'], copyToCacheDirectory: true });
  if (picked.canceled) return null;
  const asset = picked.assets[0];
  if (Platform.OS === 'web' && asset.file) return new Uint8Array(await asset.file.arrayBuffer());
  return new File(asset.uri).bytes();
}
// iPhoneでは共有シート、ブラウザプレビューではダウンロードを使います。
export async function shareCsv(text: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  if (!await Sharing.isAvailableAsync()) throw new Error('この端末ではファイル共有を利用できません。');
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true }); file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text', dialogTitle: 'CSVを保存・共有' });
}
