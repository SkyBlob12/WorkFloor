import { ActivityIndicator, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Divider } from '@components/ui/Divider';
import { FormSection } from '@components/ui/FormSection';
import { Text } from '@components/ui/Text';
import { useMyReviews } from '@hooks/useMyReview';
import { useThemeColors } from '@hooks/useThemeColors';

import { MyReviewRow } from './MyReviewRow';

export function MyReviewsSection() {
  const { t } = useTranslation('account');
  const palette = useThemeColors();
  const { data, isLoading } = useMyReviews();
  return (
    <FormSection title={t('myReviews.title')}>
      {isLoading ? <ActivityIndicator color={palette.primary} /> : null}
      {data && data.length === 0 ? <Text variant="caption">{t('myReviews.empty')}</Text> : null}
      {data && data.length > 0 ? (
        <View>
          {data.map((review, index) => (
            <View key={review.id}>
              {index > 0 ? <Divider /> : null}
              <MyReviewRow review={review} />
            </View>
          ))}
        </View>
      ) : null}
    </FormSection>
  );
}

export default MyReviewsSection;
