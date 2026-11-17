import React, { type ReactNode } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ui } from '../theme/styles';
// 画面下のホームインジケーターまで考慮した共通スクロール領域です。
export function Page({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <ScrollView style={ui.screen} contentContainerStyle={[ui.content, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 16) + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}
