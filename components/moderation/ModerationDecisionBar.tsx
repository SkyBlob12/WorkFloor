import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { MODERATION_DECISIONS } from '@constants/reviews';
import { spacing } from '@constants/theme';
import type { ModerationDecision } from '@app-types/domain';
import type { IconName } from '@app-types/icons';

export interface ModerationDecisionBarProps {
  onDecide: (decision: ModerationDecision) => void;
}

const DECISION_ICONS: Record<ModerationDecision, IconName> = { keep: 'check', hide: 'eye-off', remove: 'trash-2' };

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: { flexGrow: 1 },
});

export function ModerationDecisionBar({ onDecide }: ModerationDecisionBarProps) {
  const { t } = useTranslation('account');
  return (
    <View style={styles.bar}>
      {MODERATION_DECISIONS.map((decision) => (
        <Button
          key={decision}
          size="sm"
          variant={decision === 'remove' ? 'danger' : 'secondary'}
          icon={DECISION_ICONS[decision]}
          label={t(`moderation.decision.${decision}`)}
          accessibilityHint={t(`moderation.decisionHint.${decision}`)}
          onPress={() => onDecide(decision)}
          style={styles.button}
        />
      ))}
    </View>
  );
}

export default ModerationDecisionBar;
