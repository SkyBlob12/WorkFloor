import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { LinkText } from '@components/ui/LinkText';
import { LEGAL_DOCS } from '@constants/legal';
import { spacing } from '@constants/theme';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  item: { paddingHorizontal: spacing.xs },
});

export function LegalLinks() {
  const { t } = useTranslation('legal');
  return (
    <View style={styles.row}>
      {LEGAL_DOCS.map((doc) => (
        <View key={doc} style={styles.item}>
          <LinkText href={`/legal/${doc}`}>{t(`${doc}.title`)}</LinkText>
        </View>
      ))}
    </View>
  );
}

export default LegalLinks;
