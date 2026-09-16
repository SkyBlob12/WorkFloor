import { ActivityIndicator, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

const useStyles = makeStyles((palette) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    paddingVertical: spacing.xxl,
  },
}));

export function LoadingState() {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <ActivityIndicator color={palette.primary} accessibilityLabel={t('loading')} />
    </View>
  );
}

export default LoadingState;
