import type { ReactNode } from 'react';
import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { Text } from './Text';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: IconName;
  action?: ReactNode;
}

const useStyles = makeStyles((palette) => ({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  icon: {
    marginBottom: spacing.xs,
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.primaryMuted,
  },
  action: { marginTop: spacing.sm, flexDirection: 'row' },
}));

export function EmptyState({ title, message, icon = 'inbox', action }: EmptyStateProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Feather name={icon} size={iconSize.lg} color={palette.primary} />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="caption" align="center">
          {message}
        </Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

export default EmptyState;
