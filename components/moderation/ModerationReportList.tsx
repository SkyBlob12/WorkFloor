import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@components/ui/Text';
import { radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import type { ModerationReport } from '@app-types/domain';

export interface ModerationReportListProps {
  reports: ModerationReport[];
}

const useStyles = makeStyles((palette) => ({
  box: { gap: spacing.sm, borderRadius: radius.md, backgroundColor: palette.dangerMuted, padding: spacing.sm },
  report: { gap: spacing.xxs },
}));

/** Signalements ouverts d'un avis : motif et détails, jamais leur auteur. */
export function ModerationReportList({ reports }: ModerationReportListProps) {
  const { t } = useTranslation(['account', 'reviews']);
  const styles = useStyles();
  return (
    <View style={styles.box}>
      <Text variant="label" tone="danger">
        {t('moderation.reports', { count: reports.length })}
      </Text>
      {reports.map((report) => (
        <View key={report.id} style={styles.report}>
          <Text variant="caption" tone="default" weight="semibold">
            {t(`reviews:reportReason.${report.reason}.label`)}
          </Text>
          {report.details ? <Text variant="caption">{report.details}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export default ModerationReportList;
