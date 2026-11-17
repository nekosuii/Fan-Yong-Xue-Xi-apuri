import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { ui } from '../theme/styles';
// カードの基本装飾を共通化し、変更が全画面へ反映されるようにします。
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) { return <View style={[ui.card, style]}>{children}</View>; }
