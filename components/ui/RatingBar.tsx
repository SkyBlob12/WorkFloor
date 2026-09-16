import { View } from 'react-native';

import { getIntlTag } from '@/i18n/currentLocale';
import { radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { formatRating } from '@utils/format';

import { Text } from './Text';

export interface RatingBarProps {
  label: string;
  value: number | null;
  /** Critère prioritaire pour l'utilisateur (choisi à l'onboarding). */
  highlighted?: boolean;
}

const MAX_RATING = 5;

const useStyles = makeStyles((palette) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { flex: 1 },
  track: { flex: 1, height: spacing.sm, overflow: 'hidden', borderRadius: radius.full, backgroundColor: palette.surfaceMuted },
  fill: { height: '100%', borderRadius: radius.full, backgroundColor: palette.rating },
  value: { width: size.ratingValue },
}));

export function RatingBar({ label, value, highlighted = false }: RatingBarProps) {
  const styles = useStyles();
  const percent = value == null ? 0 : (value / MAX_RATING) * 100;
  return (
    <View style={styles.row}>
      <Text variant="caption" tone="default" weight={highlighted ? 'bold' : undefined} style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <Text variant="caption" tone="default" weight="semibold" align="right" style={styles.value}>
        {formatRating(value, getIntlTag())}
      </Text>
    </View>
  );
}

export default RatingBar;
