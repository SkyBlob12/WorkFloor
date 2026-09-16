import { View } from 'react-native';

import { radius, size } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { initialsOf } from '@utils/format';

import { Text } from './Text';

export interface AvatarProps {
  name: string;
  size?: 'md' | 'lg';
}

const useStyles = makeStyles((palette) => ({
  base: { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primaryMuted },
  md: { width: size.avatar, height: size.avatar, borderRadius: radius.md },
  lg: { width: size.avatarLarge, height: size.avatarLarge, borderRadius: radius.lg },
}));

/** Monogramme d'entreprise : repère visuel dans les listes, sans dépendre d'un logo. */
export function Avatar({ name, size: avatarSize = 'md' }: AvatarProps) {
  const styles = useStyles();
  return (
    <View
      style={[styles.base, styles[avatarSize]]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <Text variant={avatarSize === 'lg' ? 'title' : 'label'} tone="primary">
        {initialsOf(name)}
      </Text>
    </View>
  );
}

export default Avatar;
