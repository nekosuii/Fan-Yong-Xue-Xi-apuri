import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useStudy } from '../hooks/StudyProvider';
import { putQuestion, removeQuestion } from '../database/questionRepository';
import type { QuestionType, QuestionStatus } from '../types/question';
import { statuses } from '../constants/status';
import { assertCanCreate } from '../services/entitlements';
import { confirmAction, showError } from '../utils/feedback';
import { now, newId, displayDate } from '../utils/date';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// 登録と編集で同じ入力・検証処理を使います。問題を別の問題集へ移すこともできます。
export default function QuestionEditScreen() {
  const { id, collectionId: initialCollectionId } = useLocalSearchParams<{ id: string; collectionId?: string }>();
  const { data, mutate } = useStudy();
  const original = data.questions.find(x => x.id === id);
  const [text, setText] = useState(original?.questionText ?? '');
  const [type, setType] = useState<QuestionType>(original?.questionType ?? 'trueFalse');
  const [choices, setChoices] = useState<string[]>(original?.choices.length ? original.choices : ['', '', '', '']);
  const [correct, setCorrect] = useState(original?.correctAnswer ?? 'true');
  const [explanation, setExplanation] = useState(original?.explanation ?? '');
  const [collectionId, setCollectionId] = useState(original?.collectionId ?? initialCollectionId ?? data.collections[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(original?.categoryId ?? null);
  const [status, setStatus] = useState<QuestionStatus>(original?.status ?? 'unset');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categories = data.categories.filter(x => x.collectionId === collectionId);
  // フォームの未保存変更は自動保存せず、明示的な保存操作でだけ永続化します。
  async function save() {
    setBusy(true); setError(null);
    try {
      await mutate(d => {
        if (!original) assertCanCreate('question', d.questions.length);
        return putQuestion(d, { id: original?.id ?? newId(), collectionId, categoryId, questionType: type, questionText: text.trim(), choices: type === 'trueFalse' ? [] : choices.map(x => x.trim()), correctAnswer: correct, explanation: explanation.trim(), status, statusUpdatedAt: status !== (original?.status ?? 'unset') ? now() : original?.statusUpdatedAt ?? null, createdAt: original?.createdAt ?? now(), updatedAt: now() });
      });
      router.canGoBack() ? router.back() : router.replace('/questions');
    } catch (e) { setError(e instanceof Error ? e.message : '保存できませんでした。'); } finally { setBusy(false); }
  }
  // 削除は確認後に実行し、失敗した場合は編集画面を残します。
  async function deleteQuestion() {
    if (!await confirmAction('問題を削除しますか？', 'この問題と学習ステータスを削除します。取り消すことはできません。')) return;
    try { await mutate(d => removeQuestion(d, id)); router.back(); } catch (e) { showError(e); }
  }
  if (id !== 'new' && !original) return <View style={ui.screen}><Header title="問題" /><Text style={[ui.body, { padding: 24 }]}>問題が見つかりません。</Text></View>;
  return <View style={ui.screen}><Header title={original ? '問題を編集' : '問題をつくる'} />
    <KeyboardAwareScrollViewCompat bottomOffset={32} contentContainerStyle={[ui.content, { paddingTop: 16, paddingBottom: 64 }]}>
      <Text style={ui.muted}>覚えたいことを、ひとつの問いに。</Text>
      <View><Text style={ui.label}>問題集 · 必須</Text><View style={[ui.row, { flexWrap: 'wrap', gap: 7 }]}>{data.collections.map(x => <Pressable key={x.id} testID={`select-collection-${x.id}`} onPress={() => { setCollectionId(x.id); setCategoryId(null); }} style={[ui.pill, collectionId === x.id && ui.selected]}><Text style={[ui.pillText, collectionId === x.id && ui.selectedText]}>{x.name}</Text></Pressable>)}</View>{!data.collections.length && <Button title="先に問題集を作成" variant="secondary" onPress={() => router.push('/collections/new')} />}</View>
      <View><Text style={ui.label}>分類 · 任意</Text><View style={[ui.row, { flexWrap: 'wrap', gap: 7 }]}>{[{ id: null, name: '分類なし' }, ...categories].map(x => <Pressable key={x.id ?? 'none'} onPress={() => setCategoryId(x.id)} style={[ui.pill, categoryId === x.id && ui.selected]}><Text style={[ui.pillText, categoryId === x.id && ui.selectedText]}>{x.name}</Text></Pressable>)}</View></View>
      <View><Text style={ui.label}>問題形式</Text><View style={ui.row}>{([{ value: 'trueFalse', label: '○×問題' }, { value: 'multipleChoice', label: '選択問題' }] as const).map(x => <Pressable testID={`type-${x.value}`} key={x.value} onPress={() => { setType(x.value); setCorrect(x.value === 'trueFalse' ? 'true' : '0'); }} style={[ui.pill, { flex: 1, alignItems: 'center' }, type === x.value && ui.selected]}><Text style={[ui.pillText, type === x.value && ui.selectedText]}>{x.label}</Text></Pressable>)}</View></View>
      <View><Text style={ui.label}>問題文 · 必須</Text><TextInput testID="question-text" accessibilityLabel="問題文" value={text} onChangeText={setText} multiline placeholder="ここに問題文を入力" placeholderTextColor={c.secondaryText} style={[ui.input, { minHeight: 130, textAlignVertical: 'top', lineHeight: 25 }]} /></View>
      <View style={{ gap: 10 }}><Text style={ui.label}>{type === 'trueFalse' ? '正解を選択' : '選択肢 · 左の丸をタップして正解を指定'}</Text>
        {type === 'trueFalse' ? <View style={ui.row}>{[{ value: 'true', label: '○ 正しい' }, { value: 'false', label: '× 誤り' }].map(x => <Pressable key={x.value} testID={`correct-${x.value}`} onPress={() => setCorrect(x.value)} style={[ui.pill, { flex: 1, alignItems: 'center', padding: 18 }, correct === x.value && ui.selected]}><Text style={[ui.body, correct === x.value && ui.selectedText]}>{x.label}</Text></Pressable>)}</View> : <>{choices.map((choice, i) => <View key={i} style={[ui.row, { gap: 8 }]}><Pressable testID={`correct-choice-${i}`} accessibilityLabel={`選択肢${i + 1}を正解にする`} hitSlop={8} onPress={() => setCorrect(String(i))}><Ionicons name={correct === String(i) ? 'radio-button-on' : 'radio-button-off'} size={24} color={correct === String(i) ? c.primary : c.secondaryText} /></Pressable><TextInput accessibilityLabel={`選択肢${i + 1}`} testID={`choice-${i}`} value={choice} onChangeText={value => setChoices(previous => previous.map((x, n) => n === i ? value : x))} placeholder={`選択肢 ${i + 1}`} placeholderTextColor={c.secondaryText} style={[ui.input, { flex: 1 }]} />{choices.length > 2 && <Pressable accessibilityLabel={`選択肢${i + 1}を削除`} onPress={() => { setChoices(previous => previous.filter((_, n) => n !== i)); setCorrect(Number(correct) === i ? '' : Number(correct) > i ? String(Number(correct) - 1) : correct); }}><Ionicons name="remove-circle-outline" size={21} color={c.danger} /></Pressable>}</View>)}{choices.length < 8 && <Button title="選択肢を追加" variant="secondary" icon="add" onPress={() => setChoices(previous => [...previous, ''])} />}</>}
      </View>
      <View><Text style={ui.label}>解説 · 任意</Text><TextInput testID="explanation" accessibilityLabel="解説" value={explanation} onChangeText={setExplanation} multiline placeholder="正解の理由や、覚えておきたいこと" placeholderTextColor={c.secondaryText} style={[ui.input, { minHeight: 130, textAlignVertical: 'top', lineHeight: 25 }]} /></View>
      <View><Text style={ui.label}>学習ステータス</Text><View style={[ui.row, { flexWrap: 'wrap', gap: 7 }]}>{statuses.map(x => <Pressable testID={`edit-status-${x.value}`} key={x.value} onPress={() => setStatus(x.value)} style={[ui.pill, status === x.value && ui.selected]}><Text style={[ui.pillText, status === x.value && ui.selectedText]}>{x.label}</Text></Pressable>)}</View></View>
      {error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
      <Button title={original ? '変更を保存' : '問題を登録'} loading={busy} icon="checkmark" onPress={() => void save()} />
      {original && <><Text style={[ui.muted, { fontSize: 11 }]}>登録：{displayDate(original.createdAt)}{'\n'}最終編集：{displayDate(original.updatedAt)}{'\n'}ステータス更新：{displayDate(original.statusUpdatedAt)}</Text><Button title="この問題を削除" variant="danger" icon="trash-outline" onPress={() => void deleteQuestion()} /></>}
    </KeyboardAwareScrollViewCompat>
  </View>;
}
