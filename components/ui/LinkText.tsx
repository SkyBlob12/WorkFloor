import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { Link, type Href } from 'expo-router';

import { Text, type TextVariant } from './Text';

export interface LinkTextProps {
  href: Href;
  variant?: TextVariant;
  children?: ReactNode;
}

const styles = StyleSheet.create({ link: { textDecorationLine: 'underline' } });

/** Lien inline, utilisable comme composant de <Trans>. */
export function LinkText({ href, variant = 'caption', children }: LinkTextProps) {
  return (
    <Link href={href} asChild>
      <Text variant={variant} tone="primary" accessibilityRole="link" style={styles.link}>
        {children}
      </Text>
    </Link>
  );
}

export default LinkText;
