import { palette as c } from '../src/theme/colors';
import { radius } from '../src/theme/radius';
// ひな型のエラー表示も同じパレットを参照し、色の二重管理を避けます。
const colors = {
  light: {
    text: c.text, tint: c.primary, background: c.background, foreground: c.text,
    card: c.card, cardForeground: c.text, primary: c.primary, primaryForeground: c.white,
    secondary: c.primarySoft, secondaryForeground: c.text, muted: c.muted, mutedForeground: c.secondaryText,
    accent: c.primarySoft, accentForeground: c.primary, destructive: c.danger, destructiveForeground: c.white,
    border: c.border, input: c.border,
  },
  radius: radius.medium,
};
export default colors;
