import type { QuestionStatus } from '../types/question';
export const statuses: { value: QuestionStatus; label: string; icon: 'ellipse-outline' | 'refresh-outline' | 'help-circle-outline' | 'checkmark-circle-outline' }[] = [
  { value: 'unset', label: '未設定', icon: 'ellipse-outline' },
  { value: 'review', label: '要復習', icon: 'refresh-outline' },
  { value: 'unsure', label: '不安あり', icon: 'help-circle-outline' },
  { value: 'learned', label: '定着', icon: 'checkmark-circle-outline' },
];
