import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StudyData } from '../types/question';
import { readData, saveData } from '../database/database';
import { createSampleData } from '../services/sampleData';
import { ui } from '../theme/styles';
import { palette } from '../theme/colors';
import { Button } from '../components/Button';
interface StudyContextValue { data: StudyData; mutate: (change: (data: StudyData) => StudyData) => Promise<void>; }
const StudyContext = createContext<StudyContextValue | null>(null);
const empty: StudyData = { collections: [], categories: [], questions: [] };
// すべての更新を直列化します。連打やCSV取り込み中の操作で、古いデータが上書きされるのを防ぎます。
export function StudyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StudyData>(empty);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<StudyData>(empty);
  const queue = useRef<Promise<void>>(Promise.resolve());
  // サンプルは初回にだけ追加します。保存に失敗した場合はエラー画面と再試行を表示します。
  async function initialize() {
    setError(null);
    try {
      let loaded = await readData();
      const initialized = await AsyncStorage.getItem('recall-initialized-v1');
      if (!initialized && !loaded.collections.length && !loaded.questions.length) {
        const sample = createSampleData();
        await saveData(loaded, sample);
        loaded = sample;
      }
      await AsyncStorage.setItem('recall-initialized-v1', 'true');
      current.current = loaded; setData(loaded); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'データを読み込めませんでした。'); }
  }
  useEffect(() => { void initialize(); }, []);
  // 先に永続化し、成功後だけ画面を更新します。保存失敗時には元の表示・データを維持します。
  function mutate(change: (data: StudyData) => StudyData): Promise<void> {
    const work = queue.current.then(async () => {
      const before = current.current;
      const after = change(before);
      await saveData(before, after);
      current.current = after; setData(after);
    });
    queue.current = work.catch(() => {});
    return work;
  }
  if (!ready) return <View style={[ui.screen, { justifyContent: 'center', padding: 24, gap: 20, paddingTop: Platform.OS === 'web' ? 67 : 24 }]}>
    {error ? <><Text style={ui.error}>{error}</Text><Button title="再読み込み" onPress={() => void initialize()} /></> : <ActivityIndicator size="large" color={palette.primary} />}
  </View>;
  return <StudyContext.Provider value={{ data, mutate }}>{children}</StudyContext.Provider>;
}
// 各画面はSQLiteを直接扱わず、この共有状態を通じて読み書きします。
export function useStudy(): StudyContextValue {
  const value = useContext(StudyContext);
  if (!value) throw new Error('StudyProvider が見つかりません。');
  return value;
}
