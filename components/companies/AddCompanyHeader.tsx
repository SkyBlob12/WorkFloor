import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AuthRequired } from '@components/auth/AuthRequired';
import { ContentColumn } from '@components/ui/ContentColumn';
import { SearchInput } from '@components/ui/SearchInput';
import { Text } from '@components/ui/Text';
import { SIRENE_MIN_QUERY_LENGTH } from '@constants/companies';
import { spacing } from '@constants/theme';
import { useAuthUser } from '@hooks/useAuthUser';
import { useLayout } from '@hooks/useLayout';
import { useThemeColors } from '@hooks/useThemeColors';

export interface AddCompanyHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  term: string;
  loading: boolean;
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md },
  headerWide: { paddingTop: spacing.xxl },
  intro: { gap: spacing.xs },
});

export function AddCompanyHeader({ query, onQueryChange, term, loading }: AddCompanyHeaderProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const { isWide } = useLayout();
  const user = useAuthUser();
  const tooShort = term.length > 0 && term.length < SIRENE_MIN_QUERY_LENGTH;
  return (
    <ContentColumn width="reading" style={[styles.header, isWide && styles.headerWide]}>
      <View style={styles.intro}>
        <Text variant="display" accessibilityRole="header">
          {t('add.title')}
        </Text>
        <Text variant="body" tone="muted">
          {t('add.intro')}
        </Text>
      </View>
      <SearchInput value={query} onChangeText={onQueryChange} placeholder={t('add.placeholder')} autoFocus />
      {tooShort ? <Text variant="caption">{t('add.minLength', { count: SIRENE_MIN_QUERY_LENGTH })}</Text> : null}
      {loading && !tooShort ? <ActivityIndicator color={palette.primary} /> : null}
      {user ? null : <AuthRequired title={t('add.authTitle')} message={t('add.authMessage')} />}
    </ContentColumn>
  );
}

export default AddCompanyHeader;
