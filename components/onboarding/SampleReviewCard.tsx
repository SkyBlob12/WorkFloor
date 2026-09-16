import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { FloatingCard, type CardTilt } from './FloatingCard';

export interface SampleReviewCardProps {
  label: string;
  icon: IconName;
  rating: number;
  tilt: CardTilt;
  align: 'flex-start' | 'center' | 'flex-end';
}

const useStyles = makeStyles((palette) => ({
  icon: {
    width: size.controlSmall,
    height: size.controlSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: palette.primaryMuted,
  },
}));

const layout = StyleSheet.create({
  card: { maxWidth: size.sampleCard, flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  label: { flex: 1 },
});

/** Mini-carte d'avis décorative (collage de la dernière étape). */
export function SampleReviewCard({ label, icon, rating, tilt, align }: SampleReviewCardProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <FloatingCard tilt={tilt} style={[layout.card, { alignSelf: align }]}>
      <View style={styles.icon}>
        <Feather name={icon} size={iconSize.md} color={palette.primary} />
      </View>
      <Text variant="label" style={layout.label}>
        {label}
      </Text>
      <RatingBadge value={rating} />
    </FloatingCard>
  );
}

export default SampleReviewCard;
