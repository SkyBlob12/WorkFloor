import { memo } from 'react';
import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { SECTOR_ICONS } from '@constants/companies';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { NafSection } from '@app-types/domain';

export interface SectorCardProps {
  section: NafSection;
  count: number;
  selected: boolean;
  onPress: (section: NafSection) => void;
}

const useStyles = makeStyles((palette) => ({
  card: {
    width: size.sectorCard,
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: palette.surface,
    padding: spacing.md,
  },
  selected: { borderColor: palette.primary },
  icon: {
    width: size.controlSmall,
    height: size.controlSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: palette.primaryMuted,
  },
  iconSelected: { backgroundColor: palette.primaryFill },
}));

function SectorCardComponent({ section, count, selected, onPress }: SectorCardProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const styles = useStyles();
  const label = t(`sectorShort.${section}`);
  return (
    <PressableScale
      onPress={() => onPress(section)}
      accessibilityRole="button"
      accessibilityLabel={t('home.filterSector', { label: t(`sector.${section}`) })}
      accessibilityState={{ selected }}
      style={[styles.card, selected && styles.selected]}>
      <View style={[styles.icon, selected && styles.iconSelected]}>
        <Feather name={SECTOR_ICONS[section]} size={iconSize.md} color={selected ? palette.onPrimary : palette.primary} />
      </View>
      <Text variant="label" numberOfLines={2}>
        {label}
      </Text>
      <Text variant="tiny">{t('home.companyCount', { count })}</Text>
    </PressableScale>
  );
}

export const SectorCard = memo(SectorCardComponent);
export default SectorCard;
