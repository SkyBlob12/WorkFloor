import { useCallback, useState } from 'react';
import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { FormSection } from '@components/ui/FormSection';
import { Text } from '@components/ui/Text';
import { TextField } from '@components/ui/TextField';
import { SIRENE_DEBOUNCE_MS, SITE_CITY_MIN_REVIEWS, SITE_SEARCH_MIN_LENGTH } from '@constants/companies';
import { iconSize, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useCompanySiteSearch } from '@hooks/useCompanySiteSearch';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import type { ReviewFormState } from '@hooks/useReviewForm';
import { useThemeColors } from '@hooks/useThemeColors';
import type { CompanySite } from '@app-types/domain';

import { SiteSearchResults } from './SiteSearchResults';

export interface ReviewSiteSectionProps {
  form: ReviewFormState;
  company: { name: string; siren: string };
}

const useStyles = makeStyles((palette) => ({
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.primaryMuted,
    padding: spacing.sm,
  },
  grow: { flex: 1 },
}));

/** Site de l'avis : recherche parmi les établissements SIRENE de l'entreprise. */
export function ReviewSiteSection({ form, company }: ReviewSiteSectionProps) {
  const { t } = useTranslation('reviews');
  const palette = useThemeColors();
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const term = useDebouncedValue(query.trim(), SIRENE_DEBOUNCE_MS);
  const search = useCompanySiteSearch(company, term);
  const { site, setSite } = form;

  const select = useCallback(
    (choice: CompanySite) => {
      setSite({ siret: choice.siret, city: choice.city, postalCode: choice.postalCode });
      setQuery('');
    },
    [setSite],
  );

  const place =
    site?.city && site.postalCode ? t('form.sitePlace', { city: site.city, postalCode: site.postalCode }) : (site?.city ?? site?.siret);

  return (
    <FormSection title={t('form.site')} description={t('form.siteHint', { count: SITE_CITY_MIN_REVIEWS })}>
      {site ? (
        <View style={styles.selected}>
          <Feather name="map-pin" size={iconSize.md} color={palette.primary} />
          <Text variant="label" style={styles.grow}>
            {place}
          </Text>
          <Button variant="secondary" size="sm" label={t('form.siteChange')} onPress={() => setSite(null)} />
        </View>
      ) : (
        <>
          <TextField
            label={t('form.siteSearch')}
            value={query}
            onChangeText={setQuery}
            placeholder={t('form.siteSearchPlaceholder')}
            hint={t('form.siteSearchHint')}
            autoCorrect={false}
            returnKeyType="search"
          />
          {term.length >= SITE_SEARCH_MIN_LENGTH ? (
            <SiteSearchResults sites={search.data} loading={search.isFetching} error={search.error} onSelect={select} />
          ) : null}
        </>
      )}
    </FormSection>
  );
}

export default ReviewSiteSection;
