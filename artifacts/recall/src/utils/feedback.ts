import { Alert, Platform } from 'react-native';
// 破壊的な操作は、iPhoneでもブラウザプレビューでも必ず明示的に確認します。
export function confirmAction(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise(resolve => Alert.alert(title, message, [
    { text: 'キャンセル', style: 'cancel', onPress: () => resolve(false) },
    { text: '続ける', onPress: () => resolve(true) },
  ], { cancelable: true, onDismiss: () => resolve(false) }));
}
// 非同期処理の失敗を隠さず、ユーザーが確認できる言葉で表示します。
export function showError(error: unknown): void {
  Alert.alert('処理できませんでした', error instanceof Error ? error.message : 'もう一度お試しください。');
}
