import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@components/ui/Avatar';
import { Pill } from '@components/ui/Pill';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';
import { departmentFromPostalCode, formatSiren } from '@utils/format';
import { isEmployeeRange, nafSectionFromCode } from '@utils/naf';
import type { Company } from '@app-types/domain';

export interface CompanyHeaderProps {
  company: Company;
}

const styles = StyleSheet.create({
  header: { gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  names: { flex: 1, gap: spacing.xxs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});

export function CompanyHeader({ company }: CompanyHeaderProps) {
  const { t } = useTranslation('companies');
  const { isWide } = useLayout();
  const section = nafSectionFromCode(company.naf_code);
  const department = departmentFromPostalCode(company.postal_code);
  const location =
    company.city && department ? t('detail.location', { city: company.city, department }) : company.city;
  const meta = [section ? t(`sector.${section}`) : null, location].filter(Boolean).join(' · ');

  return (
    <View style={styles.header}>
      <View style={styles.identity}>
        <Avatar name={company.name} size="lg" />
        <View style={styles.names}>
          <Text variant={isWide ? 'display' : 'title'} accessibilityRole="header">
            {company.name}
          </Text>
          {meta ? <Text variant="caption">{meta}</Text> : null}
        </View>
      </View>
      <View style={styles.pills}>
        {company.verified ? <Pill tone="primary" icon="check" label={t('detail.verified')} /> : null}
        {isEmployeeRange(company.employee_range) ? (
          <Pill icon="users" label={t(`employeeRange.${company.employee_range}`)} />
        ) : null}
        {company.siren ? <Pill label={t('detail.siren', { siren: formatSiren(company.siren) })} /> : null}
        {company.is_active ? null : <Pill tone="warning" label={t('detail.closed')} />}
      </View>
    </View>
  );
}

export default CompanyHeader;
