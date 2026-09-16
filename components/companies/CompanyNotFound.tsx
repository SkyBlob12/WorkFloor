import { useTranslation } from 'react-i18next';

import { PageHead } from '@components/shell/PageHead';
import { Notice } from '@components/ui/Notice';
import { Screen } from '@components/ui/Screen';

export function CompanyNotFound() {
  const { t } = useTranslation('companies');
  return (
    <Screen width="reading">
      <PageHead title={t('detail.notFoundTitle')} headerTitle={t('detail.notFoundTitle')} />
      <Notice tone="warning" title={t('detail.notFoundTitle')}>
        {t('detail.notFoundMessage')}
      </Notice>
    </Screen>
  );
}

export default CompanyNotFound;
