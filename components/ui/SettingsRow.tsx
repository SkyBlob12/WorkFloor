import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SettingsRowProps {
  icon: IconName;
  label: string;
  description?: string;
  /** Valeur courte affichée à droite (langue, action secondaire). */
  value?: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
  /** Contrôle affiché sous le libellé (sélecteur segmenté…). */
  children?: ReactNode;
  onPress?: () => void;
  accessibilityRole?: 'button' | 'link';
  /** Libellé lu par le lecteur d'écran quand le libellé visible ne suffit pas. */
  accessibilityLabel?: string;
}

const useStyles = makeStyles((palette) => ({
  row: { gap: spacing.sm, paddingVertical: spacing.sm + spacing.xxs, minHeight: size.control },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: {
    width: size.settingsIcon,
    height: size.settingsIcon,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceMuted,
  },
  dangerIcon: { backgroundColor: palette.dangerMuted },
  body: { flex: 1, gap: spacing.xxs },
}));

/** Ligne de réglage : pastille d'icône, libellé, description, valeur ou chevron quand elle est tappable. */
export function SettingsRow({ icon, label, description, value, tone = 'default', loading, children, onPress, accessibilityRole = 'button', accessibilityLabel }: SettingsRowProps) {
  const styles = useStyles();
  const palette = useThemeColors();
  const danger = tone === 'danger';
  const line = (
    <View style={styles.line}>
      <View style={[styles.icon, danger && styles.dangerIcon]}>
        <Feather name={icon} size={iconSize.md} color={danger ? palette.danger : palette.text} />
      </View>
      <View style={styles.body}>
        <Text variant="label" tone={danger ? 'danger' : 'default'}>
          {label}
        </Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
      {value ? (
        <Text variant="caption" tone={onPress ? 'primary' : 'muted'} weight="medium" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {loading ? <ActivityIndicator color={palette.textMuted} /> : null}
      {onPress && !value && !loading ? <Feather name="chevron-right" size={iconSize.md} color={palette.textMuted} /> : null}
    </View>
  );

  if (!onPress) {
    return (
      <View style={styles.row}>
        {line}
        {children}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      disabled={loading}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ busy: loading }}
      style={styles.row}>
      {line}
    </PressableScale>
  );
}

export default SettingsRow;
