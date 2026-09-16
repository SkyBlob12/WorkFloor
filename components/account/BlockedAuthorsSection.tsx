import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { FormSection } from '@components/ui/FormSection';
import { useBlockedAuthorsCount, useUnblockAllAuthors } from '@hooks/useBlockedAuthors';

const styles = StyleSheet.create({ row: { flexDirection: 'row' } });

export function BlockedAuthorsSection() {
  const { t } = useTranslation('account');
  const { data: count } = useBlockedAuthorsCount();
  const unblock = useUnblockAllAuthors();

  if (!count) return null;

  return (
    <FormSection title={t('blocked.title')} description={t('blocked.count', { count })}>
      <View style={styles.row}>
        <Button
          size="sm"
          variant="secondary"
          icon="eye"
          label={t('blocked.unblockAll')}
          loading={unblock.isPending}
          onPress={() => unblock.mutate()}
        />
      </View>
    </FormSection>
  );
}

export default BlockedAuthorsSection;
