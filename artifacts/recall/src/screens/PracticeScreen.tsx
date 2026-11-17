import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Header } from '../components/Header';
import { Page } from '../components/Page';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useStudy } from '../hooks/StudyProvider';
import { updateQuestionStatus } from '../database/questionRepository';
import { answerLabel, isCorrect } from '../services/questionService';
import { statuses } from '../constants/status';
import { StatusBadge } from '../components/StatusBadge';
import { displayDate } from '../utils/date';
import { showError } from '../utils/feedback';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// セッション開始時に対象を固定します。途中でステータスを変えても問題が飛ばされません。
export default function PracticeScreen() {
  const params = useLocalSearchParams<{ collectionId?: string; categoryId?: string; status?: string; search?: string }>();
  const { data, mutate } = useStudy();
  const ids = useRef(data.questions.filter(q =>
    (!params.collectionId || q.collectionId === params.collectionId) &&
    (!params.categoryId || params.categoryId === 'all' || (params.categoryId === 'none' ? !q.categoryId : q.categoryId === params.categoryId)) &&
    (!params.status || params.status === 'all' || (params.status === 'reviewSet' ? ['review', 'unsure'].includes(q.status) : q.status === params.status)) &&
    (!params.search || `${q.questionText} ${q.explanation}`.toLocaleLowerCase().includes(params.search.toLocaleLowerCase()))
  ).map(x => x.id)).current;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const question = data.questions.find(x => x.id === ids[index]);
  const correct = question && answer !== null ? isCorrect(question, answer) : false;
  // 回答はその場の表示だけに使い、回数・正答率などの履歴は保存しません。
  function choose(value: string) {
    if (answer !== null || !question) return;
    setAnswer(value);
    void Haptics.notificationAsync(isCorrect(question, value) ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }
  // 学習状態は自動で決めず、ユーザーが選んだ値を保存します。
  async function setStatus(status: typeof statuses[number]['value']) {
    if (!question) return;
    setBusy(true);
    try { await mutate(d => updateQuestionStatus(d, question.id, status)); } catch (e) { showError(e); } finally { setBusy(false); }
  }
  if (index >= ids.length && ids.length) return <View style={ui.screen}><Header title="学習を完了" /><Page><View style={{ alignItems: 'center', gap: 20, paddingVertical: 65 }}><View style={{ backgroundColor: c.primarySoft, width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark" size={40} color={c.primary} /></View><Text style={ui.title}>おつかれさまでした。</Text><Text style={[ui.muted, { textAlign: 'center' }]}>今回の問題をすべて確認しました。{'\n'}変えたステータスは、この端末に保存されています。</Text></View><Button title="もう一度学習する" variant="secondary" icon="refresh" onPress={() => { setIndex(0); setAnswer(null); }} /><Button title="ホームに戻る" onPress={() => router.replace('/')} /></Page></View>;
  if (!question) return <View style={ui.screen}><Header title="問題演習" /><Page><EmptyState title="対象の問題がありません" description="問題を登録するか、絞り込み条件を変えてください。" /><Button title="ホームに戻る" onPress={() => router.replace('/')} /></Page></View>;
  const options = question.questionType === 'trueFalse' ? [{ value: 'true', label: '○  正しい' }, { value: 'false', label: '×  誤り' }] : question.choices.map((label, i) => ({ value: String(i), label }));
  return <View style={ui.screen}><Header title="問題演習" right={<Text style={ui.muted}>{index + 1} / {ids.length}</Text>} />
    <Page>
      <View style={{ height: 4, backgroundColor: c.border, borderRadius: 2, marginTop: 10 }}><View style={{ height: 4, borderRadius: 2, backgroundColor: c.primary, width: `${(index + 1) / ids.length * 100}%` }} /></View>
      <View style={ui.between}><Text style={ui.muted}>{data.collections.find(x => x.id === question.collectionId)?.name}</Text><StatusBadge status={question.status} /></View>
      <Card style={{ paddingVertical: 28, gap: 18 }}><Text style={[ui.label, { letterSpacing: 1.5, fontSize: 10 }]}>QUESTION {String(index + 1).padStart(2, '0')}  /  {question.questionType === 'trueFalse' ? '○×問題' : '選択問題'}</Text><Text style={{ color: c.text, fontSize: 22, lineHeight: 37, fontWeight: '600' }}>{question.questionText}</Text></Card>
      <View style={{ gap: 12 }}>{options.map((option, n) => {
        const isAnswer = answer !== null && option.value === question.correctAnswer;
        const isWrong = answer === option.value && !correct;
        return <Pressable key={option.value} testID={`answer-${option.value}`} disabled={answer !== null} accessibilityRole="button" onPress={() => choose(option.value)} style={({ pressed }) => ({ backgroundColor: isAnswer ? c.primarySoft : isWrong ? c.dangerSoft : c.card, borderColor: isAnswer ? c.primary : isWrong ? c.danger : c.border, borderWidth: 1.5, borderRadius: 15, padding: 19, minHeight: 63, flexDirection: 'row', alignItems: 'center', gap: 13, opacity: pressed ? 0.65 : 1 })}><Text style={{ color: c.secondaryText, fontSize: 12, fontWeight: '600' }}>{String.fromCharCode(65 + n)}</Text><Text style={[ui.body, { flex: 1 }]}>{option.label}</Text>{isAnswer && <Ionicons name="checkmark-circle" size={22} color={c.primary} />}{isWrong && <Ionicons name="close-circle" size={22} color={c.danger} />}</Pressable>;
      })}</View>
      {answer !== null ? <><View style={{ backgroundColor: correct ? c.primarySoft : c.dangerSoft, padding: 20, borderRadius: 16, gap: 10 }}><View style={ui.row}><Ionicons name={correct ? 'checkmark-circle' : 'close-circle'} size={23} color={correct ? c.primary : c.danger} /><Text style={{ color: correct ? c.primary : c.danger, fontSize: 18, fontWeight: '700' }}>{correct ? '正解です' : '不正解です'}</Text></View><Text style={ui.body}>正解：{answerLabel(question)}</Text></View><View style={{ gap: 9 }}><Text style={ui.sectionTitle}>解説</Text><Text style={ui.body}>{question.explanation || 'この問題にはまだ解説がありません。'}</Text></View><View style={ui.divider} /><View style={{ gap: 13 }}><Text style={ui.sectionTitle}>今の理解度は？</Text><Text style={ui.muted}>ステータスは自分で選べます。</Text><View style={[ui.row, { flexWrap: 'wrap', gap: 8 }]}>{statuses.map(x => <Pressable disabled={busy} key={x.value} testID={`set-status-${x.value}`} onPress={() => void setStatus(x.value)} style={[ui.pill, x.value === question.status && ui.selected]}><Text style={[ui.pillText, x.value === question.status && ui.selectedText]}>{x.label}</Text></Pressable>)}</View><Text style={[ui.muted, { fontSize: 10 }]}>最終変更：{displayDate(question.statusUpdatedAt)}</Text></View><Button title={index + 1 === ids.length ? '学習を完了する' : '次の問題へ'} icon="arrow-forward" disabled={busy} onPress={() => { setIndex(n => n + 1); setAnswer(null); }} /></> : <Text style={[ui.muted, { textAlign: 'center', fontSize: 12 }]}>回答を選ぶと、正解と解説を確認できます</Text>}
    </Page>
  </View>;
}
