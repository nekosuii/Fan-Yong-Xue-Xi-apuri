import React, { type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// 独自ヘッダーなのでSafe Areaをここでだけ確保します。子画面で重ねて追加しないでください。
export function Header({ title, back = true, right, titleSize = 17 }: { title: string; back?: boolean; right?: ReactNode; titleSize?: number }) {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: Platform.OS === 'web' ? 12 : insets.top, backgroundColor: c.background }}>
    <View style={[ui.between, { minHeight: 48, paddingHorizontal: 20 }]}>
      <View style={[ui.row, { flex: 1 }]}>{back && <Pressable testID="back" accessibilityLabel="戻る" hitSlop={12} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}><Ionicons name="chevron-back" size={25} color={c.primary} /></Pressable>}<Text numberOfLines={1} style={{ color: c.text, fontSize: titleSize, fontWeight: '600', flexShrink: 1 }}>{title}</Text></View>{right}
    </View>
  </View>;
}
