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

const subjectColors = ['#0ea7b2', '#754b96', '#e52b78'];
const subjectIcons = ['book-outline', 'layers-outline', 'folder-outline'] as const;

export default function HomeScreen() {
  const { data } = useStudy();
  const { collections } = useCollections();

  // 目標値はホーム画面の初期設定値です。学習履歴の集計機能を追加した際に自動連動できます。
  const dailyGoal = 30;
  const dailyCompleted = 10;
  const progress = Math.min(dailyCompleted / dailyGoal, 1);

  return <View style={ui.screen}>
    <Header back={false} title={appConfig.name} titleSize={11} right={
      <Pressable testID="settings" accessibilityLabel="設定" hitSlop={12} onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={22} color={c.text} />
      </Pressable>
    } />
    <Page>
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>本日の目標</Text>
          <Text style={styles.goalCount}><Text style={styles.goalDone}>{dailyCompleted}</Text> / {dailyGoal} 問</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>問題集</Text>
        {collections.length === 0 && <EmptyState title="最初の問題集をつくろう" description="学びたいことを、自由にまとめられます。" />}
        {collections.map((item, index) => {
          const color = subjectColors[index % subjectColors.length];
          const icon = subjectIcons[index % subjectIcons.length];
          const questions = data.questions.filter(q => q.collectionId === item.id);
          const trueFalseCount = questions.filter(q => q.questionType === 'trueFalse').length;
          const multipleChoiceCount = questions.filter(q => q.questionType === 'multipleChoice').length;
          const kinds = [
            trueFalseCount > 0 ? '○×' : '',
            multipleChoiceCount > 0 ? '選択式' : '',
          ].filter(Boolean).join('・');
          const meta = questions.length === 0
            ? '問題未登録'
            : `${kinds}｜${questions.length}問登録`;

          return <Pressable
            testID={`collection-${item.id}`}
            accessibilityRole="button"
            key={item.id}
            onPress={() => router.push({ pathname: '/collections/[id]', params: { id: item.id } })}
            style={({ pressed }) => [styles.collectionCard, { opacity: pressed ? 0.72 : 1 }]}
          >
            <View style={[styles.subjectIcon, { backgroundColor: color }]}>
              <Ionicons name={icon} size={23} color={c.white} />
            </View>
            <View style={styles.collectionText}>
              <Text style={styles.collectionName}>{item.name}</Text>
              <Text style={styles.collectionMeta}>{meta}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.secondaryText} />
          </Pressable>;
        })}
      </View>

      <Pressable
        testID="create-collection"
        accessibilityRole="button"
        accessibilityLabel="新しい問題集を作成"
        onPress={() => router.push('/collections/new')}
        style={({ pressed }) => [styles.createCard, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.createIcon}>
          <Ionicons name="add" size={22} color={c.primary} />
        </View>
        <Text style={styles.createText}>新しい問題集を作成</Text>
      </Pressable>
    </Page>
  </View>;
}

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 16,
    gap: 13,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: { color: c.text, fontSize: 14, fontWeight: '600' },
  goalCount: { color: c.secondaryText, fontSize: 12, fontWeight: '500' },
  goalDone: { color: c.primary, fontSize: 15, fontWeight: '700' },
  progressTrack: {
    height: 11,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: c.muted,
  },
  progressFill: {
    height: 11,
    borderRadius: 8,
    backgroundColor: c.primary,
  },
  section: { gap: 12 },
  sectionTitle: { color: c.text, fontSize: 14, fontWeight: '600', marginBottom: 1 },
  collectionCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 15,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  subjectIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionText: { flex: 1, gap: 5 },
  collectionName: { color: c.text, fontSize: 16, fontWeight: '600' },
  collectionMeta: { color: c.secondaryText, fontSize: 11 },
  createCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    minHeight: 62,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  createIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: { color: c.primary, fontSize: 13, fontWeight: '600' },
});
