import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Question } from '../types/question';
import { StatusBadge } from './StatusBadge';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// 一覧の問題表示を統一し、タップで編集画面へつなぎます。
export function QuestionCard({ question, subtitle, onPress }: { question: Question; subtitle: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" testID={`question-${question.id}`} onPress={onPress} style={({ pressed }) => [ui.card, { gap: 13, padding: 19, opacity: pressed ? 0.7 : 1 }]}>
    <View style={ui.between}><Text style={[ui.muted, { fontSize: 10 }]}>{subtitle} · {question.questionType === 'trueFalse' ? '○×問題' : '選択問題'}</Text><StatusBadge status={question.status} /></View>
    <View style={ui.between}><Text numberOfLines={3} style={[ui.body, { flex: 1, fontWeight: '500' }]}>{question.questionText}</Text><Ionicons name="chevron-forward" size={16} color={c.secondaryText} /></View>
  </Pressable>;
}
