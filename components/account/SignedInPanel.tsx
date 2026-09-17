import { StyleSheet, View } from 'react-native';

import type { User } from '@supabase/supabase-js';

import { spacing } from '@constants/theme';

import { MyReviewsSection } from './MyReviewsSection';
import { ProfileCard } from './ProfileCard';

export interface SignedInPanelProps {
  user: User;
}

const styles = StyleSheet.create({ stack: { gap: spacing.md } });

export function SignedInPanel({ user }: SignedInPanelProps) {
  return (
    <View style={styles.stack}>
      <ProfileCard user={user} />
      <MyReviewsSection />
    </View>
  );
}

export default SignedInPanel;
