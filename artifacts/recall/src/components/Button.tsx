import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { palette as c } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
interface Props { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: keyof typeof Ionicons.glyphMap; disabled?: boolean; loading?: boolean; testID?: string; }
// 押下フィードバックと二重実行防止を全画面で統一します。
export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, testID }: Props) {
  const foreground = variant === 'primary' ? c.white : variant === 'danger' ? c.danger : c.primary;
  return <Pressable testID={testID ?? title} accessibilityRole="button" accessibilityLabel={title} disabled={disabled || loading}
    onPress={() => { void Haptics.selectionAsync().catch(() => {}); onPress(); }}
    style={({ pressed }) => ({ minHeight: spacing.buttonHeight, borderRadius: radius.medium, backgroundColor: variant === 'primary' ? c.primary : variant === 'danger' ? c.dangerSoft : c.primarySoft, paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, opacity: disabled || loading ? 0.45 : pressed ? 0.75 : 1 })}>
    {loading ? <ActivityIndicator color={foreground} /> : <>{icon && <Ionicons name={icon} size={19} color={foreground} />}<Text style={{ color: foreground, fontSize: 15, fontWeight: '600' }}>{title}</Text></>}
  </Pressable>;
}
