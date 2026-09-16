import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { PageHead } from '@components/shell/PageHead';
import { Screen } from '@components/ui/Screen';
import { Text } from '@components/ui/Text';
import { APP } from '@constants/app';
import type { LegalDoc } from '@constants/legal';
import { spacing } from '@constants/theme';

export interface LegalDocumentProps {
  doc: LegalDoc;
}

interface LegalSection {
  heading: string;
  paragraphs: string[];
}

const LEGAL_VALUES = { appName: APP.name, contactEmail: APP.contactEmail, abuseEmail: APP.abuseEmail };

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  section: { marginTop: spacing.xl, gap: spacing.sm },
});

export function LegalDocument({ doc }: LegalDocumentProps) {
  const { t } = useTranslation('legal');
  const title = t(`${doc}.title`);
  const sections: LegalSection[] = t(`${doc}.sections`, { ...LEGAL_VALUES, returnObjects: true });

  return (
    <Screen width="reading">
      <PageHead title={title} headerTitle={title} />
      <View style={styles.header}>
        <Text variant="display" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption">{t('updatedLabel', { date: t('updatedAt') })}</Text>
      </View>
      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text variant="heading">{section.heading}</Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} variant="body">
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </Screen>
  );
}

export default LegalDocument;
