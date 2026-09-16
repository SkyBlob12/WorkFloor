import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { FloatingCard } from '@components/onboarding/FloatingCard';
import { StageMarks } from '@components/onboarding/StageMarks';
import { Sticker } from '@components/onboarding/Sticker';
import { RatingBar } from '@components/ui/RatingBar';
import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing, tilt } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

export interface HomeHeroSceneProps {
  wide?: boolean;
}

// Valeurs d'illustration, jamais présentées comme de vraies données.
const SAMPLE = {
  overall: 4.2,
  recommend: 87,
  criteria: { culture: 4.5, salary: 3.6, management: 4.1 },
} as const;
const CRITERIA = ['culture', 'salary', 'management'] as const;

const useStyles = makeStyles((palette) => ({
  icon: {
    width: size.controlSmall,
    height: size.controlSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: palette.primaryMuted,
  },
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: size.sticker,
    borderRadius: radius.full,
    backgroundColor: palette.successMuted,
    paddingHorizontal: spacing.md,
    transform: [{ rotate: tilt.left }],
  },
}));

const layout = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  compact: { minHeight: size.homeStage },
  wide: { minHeight: size.homeStageWide },
  collage: { width: '100%', maxWidth: size.stageCard },
  card: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
  pillPosition: { bottom: -spacing.md, left: -spacing.xs },
});

/** Collage décoratif de l'accueil : une carte d'avis anonyme posée, ses notes et une pastille. */
export function HomeHeroScene({ wide = false }: HomeHeroSceneProps) {
  const { t } = useTranslation(['companies', 'reviews']);
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View
      style={[layout.stage, wide ? layout.wide : layout.compact]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <StageMarks />
      <View style={layout.collage}>
        <FloatingCard tilt="slightRight" style={layout.card}>
          <Sticker label={t('home.hero.sticker')} />
          <View style={layout.header}>
            <View style={styles.icon}>
              <Feather name="eye-off" size={iconSize.md} color={palette.primary} />
            </View>
            <View style={layout.grow}>
              <Text variant="label" numberOfLines={1}>
                {t('home.hero.cardTitle')}
              </Text>
              <Text variant="tiny" numberOfLines={1}>
                {t('home.hero.cardRole')}
              </Text>
            </View>
            <RatingBadge value={SAMPLE.overall} />
          </View>
          {CRITERIA.map((criterion) => (
            <RatingBar key={criterion} label={t(`reviews:criterion.${criterion}`)} value={SAMPLE.criteria[criterion]} />
          ))}
        </FloatingCard>
        <View style={[styles.pill, layout.pillPosition]}>
          <Feather name="thumbs-up" size={iconSize.xs} color={palette.success} />
          <Text variant="caption" tone="success" weight="bold">
            {t('home.recommendShort', { value: SAMPLE.recommend })}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default HomeHeroScene;
