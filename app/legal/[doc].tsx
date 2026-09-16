import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LegalDocument } from '@components/legal/LegalDocument';
import { Notice } from '@components/ui/Notice';
import { Screen } from '@components/ui/Screen';
import { isLegalDoc, LEGAL_DOCS, type LegalDoc } from '@constants/legal';

/** Pré-rendu des 3 pages au build web : URLs stables à fournir à Apple et Google. */
export function generateStaticParams(): { doc: LegalDoc }[] {
  return LEGAL_DOCS.map((doc) => ({ doc }));
}

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const { t } = useTranslation('legal');

  if (!isLegalDoc(doc)) {
    return (
      <Screen width="reading">
        <Notice tone="warning">{t('notFound')}</Notice>
      </Screen>
    );
  }

  return <LegalDocument doc={doc} />;
}
