import { View } from 'react-native';

import { radius, size } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { initialsOf } from '@utils/format';
import { tintFor } from '@utils/tint';

import { Text } from './Text';

export interface AvatarProps {
  name: string;
  size?: 'md' | 'lg';
  /** Liseré de la couleur de la carte, quand l'avatar chevauche une couverture. */
  ringed?: boolean;
}

const useStyles = makeStyles((palette) => ({
  base: { alignItems: 'center', justifyContent: 'center' },
  md: { width: size.avatar, height: size.avatar, borderRadius: radius.md },
  lg: { width: size.avatarLarge, height: size.avatarLarge, borderRadius: radius.lg },
  ring: { borderWidth: size.avatarRing, borderColor: palette.surface },
}));

/** Monogramme d'entreprise teinté selon le nom : repère visuel stable, sans dépendre d'un logo. */
export function Avatar({ name, size: avatarSize = 'md', ringed = false }: AvatarProps) {
  const styles = useStyles();
  const palette = useThemeColors();
  const tint = tintFor(name);
  return (
    <View
      style={[styles.base, styles[avatarSize], ringed && styles.ring, { backgroundColor: palette[tint.background] }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <Text variant={avatarSize === 'lg' ? 'title' : 'label'} style={{ color: palette[tint.foreground] }}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

export default Avatar;
