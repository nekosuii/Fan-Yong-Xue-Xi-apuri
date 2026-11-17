import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useStudy } from '../hooks/StudyProvider';
import { putCollection, removeCollection, putCategory, removeCategory } from '../database/collectionRepository';
import { assertCanCreate } from '../services/entitlements';
import { now, newId } from '../utils/date';
import { confirmAction, showError } from '../utils/feedback';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// 問題集の基本情報と、1階層だけの分類を管理します。
export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, mutate } = useStudy();
  const existing = data.collections.find(x => x.id === id);
  const isNew = id === 'new';
  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? '0');
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const categories = data.categories.filter(x => x.collectionId === id);
  const questions = data.questions.filter(x => x.collectionId === id);
  // 保存に成功したときだけ詳細画面へ移動します。
  async function save() {
    setBusy(true);
    try {
      const collectionId = existing?.id ?? newId();
      await mutate(d => {
        if (isNew) assertCanCreate('collection', d.collections.length);
        return putCollection(d, { id: collectionId, name: name.trim(), color, createdAt: existing?.createdAt ?? now(), updatedAt: now() });
      });
      if (isNew) router.replace({ pathname: '/collections/[id]', params: { id: collectionId } });
      else setNotice('変更を保存しました。');
    } catch (e) { showError(e); } finally { setBusy(false); }
  }
  // 分類の作成と名称変更を同じフォームで行います。
  async function saveCategory() {
    setBusy(true);
    try {
      await mutate(d => putCategory(d, { id: editingCategory ?? newId(), collectionId: id, name: categoryName.trim(), createdAt: d.categories.find(x => x.id === editingCategory)?.createdAt ?? now(), updatedAt: now() }));
      setEditingCategory(null); setCategoryName('');
    } catch (e) { showError(e); } finally { setBusy(false); }
  }
  // 問題集に含まれるデータも消えることを明記して確認します。
  async function deleteCollection() {
    if (!await confirmAction('問題集を削除しますか？', `「${existing?.name}」と中の${questions.length}問、すべての分類を削除します。この操作は取り消せません。必要なら先にCSVを書き出してください。`)) return;
    try { await mutate(d => removeCollection(d, id)); router.replace('/'); } catch (e) { showError(e); }
  }
  if (!isNew && !existing) return <View style={ui.screen}><Header title="問題集" /><Text style={[ui.body, { padding: 24 }]}>問題集が見つかりません。</Text></View>;
  return <View style={ui.screen}><Header title={isNew ? '新しい問題集' : existing!.name} />
    <KeyboardAwareScrollViewCompat bottomOffset={30} contentContainerStyle={[ui.content, { paddingBottom: 60 }]}>
      <View style={{ gap: 5, marginTop: 12 }}><Text style={ui.title}>{isNew ? '学びたいことは？' : '問題集を管理'}</Text><Text style={ui.muted}>{isNew ? '自由なテーマで、あなただけの一冊を。' : `${questions.length} 問の問題 · ${categories.length} 分類`}</Text></View>
      {notice && <Text style={{ color: c.primary, fontSize: 13 }}>{notice}</Text>}
      {!isNew && <View style={{ gap: 10 }}><Button title="この問題集で学習する" icon="play" disabled={!questions.length} onPress={() => router.push({ pathname: '/questions/practice', params: { collectionId: id } })} /><Button title="問題一覧・問題を追加" variant="secondary" icon="list-outline" onPress={() => router.push({ pathname: '/questions', params: { collectionId: id } })} /></View>}
      <Card><Text style={ui.label}>問題集の名前</Text><TextInput testID="collection-name" accessibilityLabel="問題集の名前" value={name} onChangeText={setName} placeholder="例：英語のボキャブラリー" placeholderTextColor={c.secondaryText} maxLength={100} style={ui.input} /><Text style={[ui.label, { marginTop: 23 }]}>カバーの色</Text><View style={[ui.row, { marginBottom: 24 }]}>{c.collection.map((backgroundColor, i) => <Pressable key={i} testID={`color-${i}`} accessibilityLabel={`カバーの色 ${i + 1}`} onPress={() => setColor(String(i))} style={{ width: 46, height: 46, borderRadius: 13, backgroundColor, alignItems: 'center', justifyContent: 'center', borderWidth: color === String(i) ? 2 : 0, borderColor: c.collectionInk[i] }}>{color === String(i) && <Ionicons name="checkmark" size={20} color={c.collectionInk[i]} />}</Pressable>)}</View><Button title={isNew ? '問題集を作成' : '変更を保存'} loading={busy} disabled={!name.trim()} onPress={() => void save()} /></Card>
      {!isNew && <><View style={{ gap: 14 }}><Text style={ui.sectionTitle}>分類</Text><Text style={ui.muted}>問題をまとめるための分類です。分類なしでも登録できます。</Text>{categories.map(category => <View key={category.id} style={[ui.card, ui.between, { padding: 16 }]}><Pressable style={{ flex: 1, gap: 4 }} accessibilityLabel={`${category.name}の問題を見る`} onPress={() => router.push({ pathname: '/questions', params: { collectionId: id, categoryId: category.id } })}><Text style={ui.body}>{category.name}</Text><Text style={ui.muted}>{questions.filter(x => x.categoryId === category.id).length} 問</Text></Pressable><Pressable testID={`edit-category-${category.id}`} accessibilityLabel="分類名を変更" hitSlop={10} onPress={() => { setEditingCategory(category.id); setCategoryName(category.name); }}><Ionicons name="pencil-outline" size={19} color={c.primary} /></Pressable><Pressable testID={`delete-category-${category.id}`} accessibilityLabel="分類を削除" hitSlop={10} onPress={async () => { if (await confirmAction('分類を削除しますか？', '問題は削除されず、「分類なし」に移ります。')) { try { await mutate(d => removeCategory(d, category.id)); if (editingCategory === category.id) { setEditingCategory(null); setCategoryName(''); } } catch (e) { showError(e); } } }}><Ionicons name="trash-outline" size={19} color={c.danger} /></Pressable></View>)}
        <TextInput testID="category-name" accessibilityLabel="分類名" placeholder="分類名を入力" placeholderTextColor={c.secondaryText} value={categoryName} onChangeText={setCategoryName} style={ui.input} maxLength={100} />
        <Button title={editingCategory ? '分類名を保存' : '分類を追加'} variant="secondary" icon={editingCategory ? 'checkmark' : 'add'} loading={busy} disabled={!categoryName.trim()} onPress={() => void saveCategory()} />
        {editingCategory && <Button title="編集をキャンセル" variant="secondary" onPress={() => { setEditingCategory(null); setCategoryName(''); }} />}
      </View><View style={{ marginTop: 8 }}><Button title="問題集を削除" variant="danger" icon="trash-outline" onPress={() => void deleteCollection()} /></View></>}
    </KeyboardAwareScrollViewCompat>
  </View>;
}
