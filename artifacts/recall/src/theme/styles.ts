import { StyleSheet } from 'react-native';
import { palette as c } from './colors';
import { spacing as s } from './spacing';
import { radius } from './radius';
import { typography as t } from './typography';
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  content: { paddingHorizontal: s.page, paddingBottom: s.xxl, gap: s.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: s.md },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s.md },
  title: { fontSize: t.heading, fontWeight: '700', color: c.text, letterSpacing: -0.8 },
  heading: { fontSize: t.title, fontWeight: '600', color: c.text },
  body: { fontSize: t.body, lineHeight: 25, color: c.text },
  muted: { fontSize: t.small, color: c.secondaryText, lineHeight: 21 },
  label: { fontSize: t.small, fontWeight: '600', color: c.secondaryText, marginBottom: s.sm },
  card: { backgroundColor: c.card, borderRadius: radius.card, padding: s.xl, borderWidth: 1, borderColor: c.border },
  input: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.medium, paddingHorizontal: s.lg, paddingVertical: 15, color: c.text, fontSize: t.body, minHeight: s.buttonHeight },
  divider: { height: 1, backgroundColor: c.border },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  pill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  pillText: { fontSize: t.small, color: c.secondaryText, fontWeight: '500' },
  selected: { backgroundColor: c.primary, borderColor: c.primary },
  selectedText: { color: c.white },
  error: { fontSize: t.small, color: c.danger, lineHeight: 22 },
});
