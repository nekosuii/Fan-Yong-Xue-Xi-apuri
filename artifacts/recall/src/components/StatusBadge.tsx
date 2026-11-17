import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { QuestionStatus } from '../types/question';
import { statuses } from '../constants/status';
import { palette as c } from '../theme/colors';
// 状態の色とラベルは共通コンポーネントで揃えます。
export function StatusBadge({ status }: { status: QuestionStatus }) {
  const item = statuses.find(x => x.value === status)!;
  const color = status === 'review' ? c.danger : status === 'unsure' ? c.amber : status === 'learned' ? c.primary : c.secondaryText;
  const backgroundColor = status === 'review' ? c.dangerSoft : status === 'unsure' ? c.amberSoft : status === 'learned' ? c.primarySoft : c.muted;
  return <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, backgroundColor, paddingHorizontal: 8, paddingVertical: 5 }}><Ionicons name={item.icon} size={12} color={color} /><Text style={{ fontSize: 10, fontWeight: '600', color }}>{item.label}</Text></View>;
}
