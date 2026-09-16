import { View } from 'react-native';

import { Link, usePathname, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { PressableScale } from '@components/ui/PressableScale';
import { APP } from '@constants/app';
import { layout, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useAuthUser } from '@hooks/useAuthUser';

import { NavLink } from './NavLink';
import { Wordmark } from './Wordmark';

interface TopBarLink {
  href: Href;
  label: string;
  active: boolean;
}

const useStyles = makeStyles((palette) => ({
  bar: { borderBottomWidth: 1, borderBottomColor: palette.border, backgroundColor: palette.surface },
  inner: {
    height: size.topBar,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
  links: { flex: 1, flexDirection: 'row', gap: spacing.xs },
}));

/** Navigation grand écran (web desktop, tablette) : remplace la barre d'onglets flottante. */
export function TopBar() {
  const { t } = useTranslation('common');
  const styles = useStyles();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthUser();

  const links: TopBarLink[] = [
    { href: '/', label: t('nav.companies'), active: pathname === '/' || pathname.startsWith('/company') },
    { href: '/add', label: t('nav.addCompany'), active: pathname.startsWith('/add') },
  ];
  if (user) links.push({ href: '/account', label: t('nav.myAccount'), active: pathname.startsWith('/account') });

  return (
    <View role="navigation" aria-label={t('nav.mainNavigation')} style={styles.bar}>
      <View style={styles.inner}>
        <Link href="/" asChild>
          <PressableScale accessibilityRole="link" accessibilityLabel={t('nav.homeLink', { name: APP.name })}>
            <Wordmark />
          </PressableScale>
        </Link>
        <View style={styles.links}>
          {links.map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} active={link.active} />
          ))}
        </View>
        {user ? null : <Button size="sm" label={t('nav.signIn')} onPress={() => router.push('/sign-in')} />}
      </View>
    </View>
  );
}

export default TopBar;
