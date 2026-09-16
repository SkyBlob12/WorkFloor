import type { ReactNode } from 'react';
import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { iconSize, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

import { Text } from './Text';

export type NoticeTone = 'info' | 'warning' | 'success' | 'danger';

export interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}

const useStyles = makeStyles((palette) => ({
  container: { flexDirection: 'row', gap: spacing.sm, borderRadius: radius.md, padding: spacing.md },
  info: { backgroundColor: palette.surfaceMuted },
  warning: { backgroundColor: palette.ratingMuted },
  success: { backgroundColor: palette.successMuted },
  danger: { backgroundColor: palette.dangerMuted },
  body: { flex: 1, gap: spacing.xs },
  action: { marginTop: spacing.xs, flexDirection: 'row' },
}));

const icons = { info: 'info', warning: 'alert-triangle', success: 'check-circle', danger: 'alert-circle' } as const;

export function Notice({ tone = 'info', title, children, action }: NoticeProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  const iconColor = { info: palette.textMuted, warning: palette.warning, success: palette.success, danger: palette.danger }[
    tone
  ];
  return (
    <View accessibilityRole={tone === 'danger' ? 'alert' : undefined} style={[styles.container, styles[tone]]}>
      <Feather name={icons[tone]} size={iconSize.md} color={iconColor} />
      <View style={styles.body}>
        {title ? <Text variant="label">{title}</Text> : null}
        {typeof children === 'string' ? (
          <Text variant="caption" tone="default">
            {children}
          </Text>
        ) : (
          children
        )}
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </View>
  );
}

export default Notice;
