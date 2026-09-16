import type { ReactNode } from 'react';
import { View } from 'react-native';

import { radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

import { Text } from './Text';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const useStyles = makeStyles((palette) => ({
  section: { gap: spacing.md, borderRadius: radius.lg, backgroundColor: palette.surface, padding: spacing.md },
  header: { gap: spacing.xxs },
}));

/** Bloc présenté en carte : une question ou un thème par carte. */
export function FormSection({ title, description, children }: FormSectionProps) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="heading">{title}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export default FormSection;
