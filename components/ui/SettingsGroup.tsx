import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';

import { radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

import { Divider } from './Divider';
import { Text } from './Text';

export interface SettingsGroupProps {
  title?: string;
  children: ReactNode;
}

const useStyles = makeStyles((palette) => ({
  group: { gap: spacing.sm },
  title: { paddingHorizontal: spacing.md },
  card: { borderRadius: radius.lg, backgroundColor: palette.surface, paddingHorizontal: spacing.md },
  divider: { marginLeft: size.settingsIcon + spacing.sm },
}));

/** Liste de réglages posée dans une carte, lignes séparées par un filet (les enfants `null` sont ignorés). */
export function SettingsGroup({ title, children }: SettingsGroupProps) {
  const styles = useStyles();
  const items = Children.toArray(children);
  if (items.length === 0) return null;
  return (
    <View style={styles.group}>
      {title ? (
        <Text variant="caption" weight="semibold" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      ) : null}
      <View style={styles.card}>
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 ? <Divider style={styles.divider} /> : null}
            {item}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export default SettingsGroup;
