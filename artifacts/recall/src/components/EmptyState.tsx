import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ui } from '../theme/styles';
import { palette as c } from '../theme/colors';
// データがない状態と、検索結果がない状態を説明文で区別できるようにします。
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <View style={{ alignItems: 'center', paddingVertical: 42, gap: 12 }}><Ionicons name="reader-outline" size={34} color={c.secondaryText} /><Text style={ui.sectionTitle}>{title}</Text><Text style={[ui.muted, { textAlign: 'center' }]}>{description}</Text></View>;
}
