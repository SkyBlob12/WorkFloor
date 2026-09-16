import { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@components/ui/Avatar';
import { Pill } from '@components/ui/Pill';
import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { effects, iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { formatSiren } from '@utils/format';
import { isNafSection } from '@utils/naf';
import type { SireneCompany } from '@app-types/domain';

export interface SireneRowProps {
  company: SireneCompany;
  busy: boolean;
  disabled: boolean;
  onPress: (company: SireneCompany) => void;
}

const useStyles = makeStyles((palette) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    padding: spacing.md,
  },
  blocked: { opacity: effects.dimmedOpacity },
  body: { flex: 1, gap: spacing.xxs },
  pill: { flexDirection: 'row', paddingTop: spacing.xxs },
  add: {
    width: size.controlSmall,
    height: size.controlSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.primaryMuted,
  },
}));

function SireneRowComponent({ company, busy, disabled, onPress }: SireneRowProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const styles = useStyles();
  const blocked = company.isSoleProprietor;
  const location = company.city ? `${company.city}${company.postalCode ? ` (${company.postalCode})` : ''}` : null;
  const details = [
    t('detail.siren', { siren: formatSiren(company.siren) }),
    location,
    isNafSection(company.sectionCode) ? t(`sector.${company.sectionCode}`) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PressableScale
      onPress={() => onPress(company)}
      disabled={blocked || disabled}
      accessibilityRole="button"
      accessibilityLabel={t('add.addLabel', { name: company.name })}
      accessibilityState={{ disabled: blocked || disabled, busy }}
      style={[styles.row, blocked && styles.blocked]}>
      <Avatar name={company.name} />
      <View style={styles.body}>
        <Text variant="heading" numberOfLines={2}>
          {company.name}
        </Text>
        <Text variant="caption">{details}</Text>
        {blocked ? (
          <Text variant="caption" tone="warning">
            {t('add.soleProprietor')}
          </Text>
        ) : company.isActive ? null : (
          <View style={styles.pill}>
            <Pill tone="warning" label={t('detail.closed')} />
          </View>
        )}
      </View>
      {busy ? (
        <ActivityIndicator color={palette.primary} />
      ) : blocked ? null : (
        <View style={styles.add}>
          <Feather name="plus" size={iconSize.md} color={palette.primary} />
        </View>
      )}
    </PressableScale>
  );
}

export const SireneRow = memo(SireneRowComponent);
export default SireneRow;
