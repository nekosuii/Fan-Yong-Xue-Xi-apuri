import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { QuestionCard } from '../components/QuestionCard';
import { EmptyState } from '../components/EmptyState';
import { useStudy } from '../hooks/StudyProvider';
import { statuses } from '../constants/status';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// ステータス・分類・検索は組み合わせて使えます。絞り込んだ集合からそのまま演習できます。
export default function QuestionListScreen() {
  const params = useLocalSearchParams<{ collectionId?: string; categoryId?: string }>();
  const { data } = useStudy();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState(params.categoryId ?? 'all');
  const insets = useSafeAreaInsets();
  const collection = data.collections.find(x => x.id === params.collectionId);
  const categories = data.categories.filter(x => !params.collectionId || x.collectionId === params.collectionId);
  const questions = useMemo(() => data.questions.filter(q => (!params.collectionId || q.collectionId === params.collectionId) && (category === 'all' || (category === 'none' ? !q.categoryId : q.categoryId === category)) && (status === 'all' || q.status === status) && `${q.questionText} ${q.explanation}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [data.questions, params.collectionId, category, status, search]);
  // フィルター条件を渡すので、大量のIDをURLへ詰め込む必要がありません。
  function practice() { router.push({ pathname: '/questions/practice', params: { collectionId: params.collectionId ?? '', categoryId: category, status, search } }); }
  return <View style={ui.screen}><Header title={collection?.name ?? 'すべての問題'} right={<Pressable testID="add-question" accessibilityLabel="問題を追加" hitSlop={12} onPress={() => router.push({ pathname: '/questions/[id]', params: { id: 'new', collectionId: params.collectionId ?? '' } })}><Ionicons name="add" size={27} color={c.primary} /></Pressable>} />
    <View style={{ paddingHorizontal: 24, gap: 17, marginTop: 12, marginBottom: 16 }}>
      <View style={ui.between}><Text style={ui.title}>問題一覧</Text><Text style={ui.muted}>{questions.length} 問</Text></View>
      <View style={[ui.row, ui.input, { paddingVertical: 0 }]}><Ionicons name="search-outline" size={19} color={c.secondaryText} /><TextInput testID="search-questions" accessibilityLabel="問題を検索" placeholder="問題文・解説を検索" placeholderTextColor={c.secondaryText} value={search} onChangeText={setSearch} style={{ flex: 1, minHeight: 50, color: c.text, fontSize: 14 }} />{!!search && <Pressable accessibilityLabel="検索をクリア" onPress={() => setSearch('')}><Ionicons name="close-circle" size={17} color={c.secondaryText} /></Pressable>}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
        {[{ value: 'all', label: 'すべて' }, ...statuses].map(x => <Pressable accessibilityRole="button" testID={`filter-${x.value}`} key={x.value} onPress={() => setStatus(x.value)} style={[ui.pill, x.value === status && ui.selected]}><Text style={[ui.pillText, x.value === status && ui.selectedText]}>{x.label}</Text></Pressable>)}
      </ScrollView>
      {!!categories.length && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}><Pressable onPress={() => setCategory('all')}><Text style={{ color: category === 'all' ? c.primary : c.secondaryText, fontSize: 12 }}>全分類</Text></Pressable><Pressable onPress={() => setCategory('none')}><Text style={{ color: category === 'none' ? c.primary : c.secondaryText, fontSize: 12 }}>分類なし</Text></Pressable>{categories.map(x => <Pressable key={x.id} testID={`category-filter-${x.id}`} onPress={() => setCategory(x.id)}><Text style={{ color: category === x.id ? c.primary : c.secondaryText, fontSize: 12 }}>{x.name}</Text></Pressable>)}</ScrollView>}
    </View>
    <FlatList data={questions} keyExtractor={x => x.id} scrollEnabled={questions.length > 0} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }} renderItem={({ item }) => <QuestionCard question={item} subtitle={data.categories.find(x => x.id === item.categoryId)?.name ?? data.collections.find(x => x.id === item.collectionId)?.name ?? '分類なし'} onPress={() => router.push({ pathname: '/questions/[id]', params: { id: item.id } })} />} ListEmptyComponent={<EmptyState title="問題が見つかりません" description="条件を変えるか、右上の＋から問題を追加してください。" />} />
    <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 34), borderTopWidth: 1, borderColor: c.border }}><Button title={`${questions.length} 問を学習する`} icon="play" disabled={!questions.length} onPress={practice} /></View>
  </View>;
}
