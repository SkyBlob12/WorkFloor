import { StyleSheet } from 'react-native';

import { Link, type Href } from 'expo-router';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

export interface NavLinkProps {
  href: Href;
  label: string;
  active: boolean;
}

const useStyles = makeStyles((palette) => ({
  link: { height: size.controlSmall, justifyContent: 'center', borderRadius: radius.full, paddingHorizontal: spacing.md },
  active: { backgroundColor: palette.surfaceMuted },
}));

export function NavLink({ href, label, active }: NavLinkProps) {
  const styles = useStyles();
  return (
    <Link href={href} asChild>
      <PressableScale
        accessibilityRole="link"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        // Enfant d'un <Slot> (Link asChild) : expo-router refuse un tableau de styles.
        style={StyleSheet.flatten([styles.link, active && styles.active])}>
        <Text variant="label" tone={active ? 'default' : 'muted'}>
          {label}
        </Text>
      </PressableScale>
    </Link>
  );
}

export default NavLink;
