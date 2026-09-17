import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { getIntlTag } from '@/i18n/currentLocale';
import { SegmentedControl } from '@components/ui/SegmentedControl';
import { Text } from '@components/ui/Text';
import { REVIEW_SORTS } from '@constants/reviews';
import { spacing } from '@constants/theme';
import { formatRating } from '@utils/format';
import type { CityStat, ReviewSort } from '@app-types/domain';

import { CityChips } from './CityChips';

export interface ReviewsListHeaderProps {
  count: number;
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
  /** Villes au-delà du seuil d'anonymat, avec leur note. */
  cities: CityStat[];
  city: string | null;
  onCityChange: (city: string | null) => void;
}

const styles = StyleSheet.create({ header: { gap: spacing.sm, paddingTop: spacing.md } });

export function ReviewsListHeader({ count, sort, onSortChange, cities, city, onCityChange }: ReviewsListHeaderProps) {
  const { t } = useTranslation('companies');
  const selected = cities.find((stat) => stat.city === city) ?? null;
  const shown = selected ? selected.review_count : count;

  return (
    <View style={styles.header}>
      <Text variant="title">{t('detail.reviewCount', { count: shown })}</Text>
      {cities.length > 0 ? (
        <CityChips
          cities={cities.map((stat) => ({ value: stat.city, count: stat.review_count }))}
          selected={city}
          onSelect={(value) => onCityChange(value === city ? null : value)}
          accessibilityLabelFor={(value) => t('detail.filterCity', { city: value })}
        />
      ) : null}
      {selected ? (
        <Text variant="caption">
          {t('detail.cityRating', {
            city: selected.city,
            rating: formatRating(selected.avg_overall, getIntlTag()),
            count: selected.review_count,
          })}
        </Text>
      ) : null}
      {shown > 1 ? (
        <SegmentedControl<ReviewSort>
          label={t('detail.sortLabel')}
          value={sort}
          onChange={onSortChange}
          options={REVIEW_SORTS.map((value) => ({ value, label: t(`detail.sort.${value}`) }))}
        />
      ) : null}
    </View>
  );
}

export default ReviewsListHeader;
