import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { NAF_SECTIONS, SECTOR_ICONS } from '@constants/companies';
import { effects, iconSize, motion, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { tintAt } from '@utils/tint';
import type { NafSection } from '@app-types/domain';

export interface SectorCardProps {
  section: NafSection;
  count: number;
  selected: boolean;
  onPress: (section: NafSection) => void;
  /** Photo du secteur (table `sector_photos`). Absente ou en échec : pictogramme sur fond teinté. */
  photoUrl?: string;
}

const useStyles = makeStyles((palette) => ({
  card: {
    width: size.sectorCard,
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: palette.surface,
  },
  selected: { borderColor: palette.primary },
  cover: { height: size.sectorCover, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceMuted },
  coverSelected: { backgroundColor: palette.primaryFill },
}));

const layout = StyleSheet.create({
  fill: StyleSheet.absoluteFill,
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: effects.photoScrim,
  },
  body: { gap: spacing.xxs, padding: spacing.sm },
});

/** Carte de secteur illustrée : photo (ou pictogramme teinté), puis le libellé et le nombre de fiches. */
function SectorCardComponent({ section, count, selected, onPress, photoUrl }: SectorCardProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const styles = useStyles();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const tint = tintAt(NAF_SECTIONS.indexOf(section));
  const showPhoto = Boolean(photoUrl) && failedUrl !== photoUrl;

  return (
    <PressableScale
      onPress={() => onPress(section)}
      accessibilityRole="button"
      accessibilityLabel={t('home.filterSector', { label: t(`sector.${section}`) })}
      accessibilityState={{ selected }}
      style={[styles.card, selected && styles.selected]}>
      {showPhoto ? (
        <View style={styles.cover}>
          <Image
            source={{ uri: photoUrl }}
            contentFit="cover"
            transition={motion.imageFade}
            onError={() => setFailedUrl(photoUrl ?? null)}
            style={layout.fill}
            accessible={false}
          />
          {selected ? (
            <View style={layout.scrim}>
              <Feather name="check-circle" size={iconSize.xxl} color={palette.white} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={[styles.cover, { backgroundColor: palette[tint.background] }, selected && styles.coverSelected]}>
          <Feather name={SECTOR_ICONS[section]} size={iconSize.xxl} color={selected ? palette.onPrimary : palette[tint.foreground]} />
        </View>
      )}
      <View style={layout.body}>
        <Text variant="label" numberOfLines={2}>
          {t(`sectorShort.${section}`)}
        </Text>
        <Text variant="tiny">{t('home.companyCount', { count })}</Text>
      </View>
    </PressableScale>
  );
}

export const SectorCard = memo(SectorCardComponent);
export default SectorCard;
