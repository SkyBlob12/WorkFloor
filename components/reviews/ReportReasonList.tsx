import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { REPORT_REASONS } from '@constants/reviews';
import { iconSize, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { ReportReason } from '@app-types/domain';

export interface ReportReasonListProps {
  value: ReportReason | null;
  onChange: (reason: ReportReason) => void;
}

const useStyles = makeStyles((palette) => ({
  list: { overflow: 'hidden', borderRadius: radius.lg, backgroundColor: palette.surface },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  separated: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  body: { flex: 1, gap: spacing.xxs },
}));

export function ReportReasonList({ value, onChange }: ReportReasonListProps) {
  const { t } = useTranslation('reviews');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t('report.reasonsLabel')} style={styles.list}>
      {REPORT_REASONS.map((reason, index) => {
        const selected = value === reason;
        return (
          <PressableScale
            key={reason}
            onPress={() => onChange(reason)}
            accessibilityRole="radio"
            accessibilityLabel={t(`reportReason.${reason}.label`)}
            accessibilityState={{ checked: selected }}
            style={[styles.row, index > 0 && styles.separated]}>
            <Feather name={selected ? 'check-circle' : 'circle'} size={iconSize.md} color={selected ? palette.primary : palette.textMuted} />
            <View style={styles.body}>
              <Text variant="label">{t(`reportReason.${reason}.label`)}</Text>
              <Text variant="caption">{t(`reportReason.${reason}.hint`)}</Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default ReportReasonList;
