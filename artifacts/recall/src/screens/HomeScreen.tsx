import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header } from '../components/Header';
import { Page } from '../components/Page';
import { EmptyState } from '../components/EmptyState';
import { useStudy } from '../hooks/StudyProvider';
import { useCollections } from '../hooks/useCollections';
import { appConfig } from '../constants/appConfig';
import { palette as c } from '../theme/colors';
import { ui } from '../theme/styles';
// ホームでは回数や連続日数ではなく、実際の問題数と現在の学習状態だけを表示します。
export default function HomeScreen() {
  const { data } = useStudy();
  const { collections } = useCollections();
  const review = data.questions.filter(q => q.status === 'review' || q.status === 'unsure').length;
  const learned = data.questions.filter(q => q.status === 'learned').length;
  return <View style={ui.screen}>
    <Header back={false} title={appConfig.name} right={<View style={ui.row}><Text style={styles.localLabel}>OFFLINE</Text><Pressable testID="settings" accessibilityLabel="設定" hitSlop={12} onPress={() => router.push('/settings')}><Ionicons name="settings-outline" size={22} color={c.text} /></Pressable></View>} />
    <Page>
      <View style={{ gap: 5, paddingTop: 13 }}><Text style={ui.title}>学びを、自分のものに。</Text><Text style={ui.muted}>あなたのペースで、ひとつずつ。</Text></View>
      <View style={styles.hero}>
        <View style={ui.between}><View style={styles.heroChip}><View style={styles.dot} /><Text style={styles.heroChipText}>YOUR LEARNING SPACE</Text></View><Ionicons name="leaf-outline" size={23} color={c.cream} /></View>
        <Text style={styles.heroTitle}>小さな学びが、{'\n'}確かな知識になる。</Text>
        <Text style={styles.heroSubtitle}>{review ? `見直したい問題が ${review} 問あります。` : '自分だけの問題集で、今日も一歩。'}</Text>
        <Pressable testID="start-practice" accessibilityRole="button" disabled={!data.questions.length} onPress={() => router.push({ pathname: '/questions/practice', params: review ? { status: 'reviewSet' } : {} })} style={({ pressed }) => [styles.heroButton, { opacity: !data.questions.length ? 0.45 : pressed ? 0.7 : 1 }]}>
          <Ionicons name="play" size={15} color={c.ink} /><Text style={styles.heroButtonText}>{review ? '復習をはじめる' : '学習をはじめる'}</Text><Ionicons name="arrow-forward" size={18} color={c.ink} />
        </Pressable>
      </View>
      <View style={styles.stats}>
        {[{ value: collections.length, label: '問題集' }, { value: data.questions.length, label: '登録問題' }, { value: learned, label: '定着した問題' }].map((item, i) => <View key={item.label} style={[styles.stat, i > 0 && styles.statBorder]}><Text style={styles.statNumber}>{item.value}<Text style={styles.statUnit}>{i === 0 ? ' 冊' : ' 問'}</Text></Text><Text style={styles.statLabel}>{item.label}</Text></View>)}
      </View>
      <View style={{ gap: 16 }}>
        <View style={ui.between}><Text style={ui.sectionTitle}>マイ問題集 <Text style={styles.count}>{collections.length}</Text></Text><Pressable testID="create-collection" accessibilityLabel="問題集を新規作成" hitSlop={10} onPress={() => router.push('/collections/new')} style={ui.row}><Ionicons name="add" size={20} color={c.primary} /><Text style={{ color: c.primary, fontSize: 13, fontWeight: '600' }}>新規作成</Text></Pressable></View>
        {collections.length === 0 && <EmptyState title="最初の問題集をつくろう" description="学びたいことを、自由にまとめられます。" />}
        {collections.map((item, index) => {
          const colorIndex = Number(item.color) % c.collection.length || 0;
          const count = data.questions.filter(q => q.collectionId === item.id && q.status === 'learned').length;
          return <Pressable testID={`collection-${item.id}`} accessibilityRole="button" key={item.id} onPress={() => router.push({ pathname: '/collections/[id]', params: { id: item.id } })} style={({ pressed }) => [styles.collection, { opacity: pressed ? 0.7 : 1 }]}>
            <View style={[styles.bookIcon, { backgroundColor: c.collection[colorIndex] }]}><Ionicons name={(['book-outline', 'hardware-chip-outline', 'bulb-outline', 'library-outline'] as const)[colorIndex]} size={25} color={c.collectionInk[colorIndex]} /></View>
            <View style={{ flex: 1, gap: 8 }}><Text style={styles.collectionName}>{item.name}</Text><Text style={styles.collectionMeta}>{item.questionCount} 問 <Text style={{ color: c.border }}>  |  </Text>{data.categories.filter(x => x.collectionId === item.id).length} 分類</Text>
              <View style={styles.progressTrack}><View style={[styles.progress, { width: `${item.questionCount ? count / item.questionCount * 100 : 0}%`, backgroundColor: c.collectionInk[colorIndex] }]} /></View>
            </View><Ionicons name="chevron-forward" size={17} color={c.secondaryText} />
          </Pressable>;
        })}
      </View>
      <Pressable testID="all-questions" onPress={() => router.push('/questions')} style={[ui.between, styles.allQuestions]}><View style={ui.row}><Ionicons name="albums-outline" size={21} color={c.primary} /><Text style={{ color: c.text, fontSize: 14, fontWeight: '500' }}>すべての問題を見る</Text></View><Ionicons name="arrow-forward" size={17} color={c.primary} /></Pressable>
      <View style={{ alignItems: 'center', gap: 5 }}><View style={[ui.row, { gap: 5 }]}><Ionicons name="lock-closed-outline" size={11} color={c.secondaryText} /><Text style={[ui.muted, { fontSize: 10 }]}>あなたの学びは、この端末の中だけに。</Text></View>{data.collections.some(x => x.id.startsWith('sample-')) && <Text style={[ui.muted, { fontSize: 9 }]}>はじめの3冊は、編集・削除できるサンプルです</Text>}</View>
    </Page>
  </View>;
}
const styles = StyleSheet.create({
  localLabel: { fontSize: 9, color: c.secondaryText, letterSpacing: 1.5, fontWeight: '600' },
  hero: { padding: 24, backgroundColor: c.primary, borderRadius: 22, gap: 15 },
  heroChip: { flexDirection: 'row', alignItems: 'center', gap: 6 }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.cream },
  heroChipText: { fontSize: 9, color: c.cream, letterSpacing: 1.7, fontWeight: '500' },
  heroTitle: { fontSize: 26, lineHeight: 40, fontWeight: '600', color: c.white, letterSpacing: 0.2, marginTop: 3 },
  heroSubtitle: { fontSize: 11, color: c.heroText, marginTop: -3, lineHeight: 20 },
  heroButton: { minHeight: 47, backgroundColor: c.cream, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 9, marginTop: 3 },
  heroButtonText: { color: c.ink, fontSize: 13, fontWeight: '600', flex: 1 },
  stats: { flexDirection: 'row', paddingVertical: 5 }, stat: { flex: 1, alignItems: 'center', gap: 5 },
  statBorder: { borderLeftWidth: 1, borderColor: c.border }, statNumber: { fontSize: 25, color: c.text, fontWeight: '600' },
  statUnit: { fontSize: 10, color: c.secondaryText, fontWeight: '400' }, statLabel: { fontSize: 10, color: c.secondaryText },
  count: { fontSize: 12, color: c.secondaryText, fontWeight: '400' },
  collection: { backgroundColor: c.card, borderRadius: 17, padding: 16, gap: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.border },
  bookIcon: { width: 54, height: 65, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  collectionName: { color: c.text, fontWeight: '600', fontSize: 15 }, collectionMeta: { fontSize: 10, color: c.secondaryText },
  progressTrack: { height: 3, backgroundColor: c.muted, borderRadius: 2, width: '100%' }, progress: { height: 3, borderRadius: 2 },
  allQuestions: { padding: 19, borderRadius: 15, backgroundColor: c.primarySoft },
});
