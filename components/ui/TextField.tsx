import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTranslation } from 'react-i18next';

import { radius, size, spacing, typography } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  showCounter?: boolean;
}

const useStyles = makeStyles((palette) => ({
  field: { gap: spacing.xs },
  input: {
    ...typography.body,
    color: palette.text,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  single: { height: size.control },
  multi: { minHeight: size.textarea, paddingVertical: spacing.sm },
  focused: { borderColor: palette.primary },
  invalid: { borderColor: palette.danger },
  footer: { flexDirection: 'row', gap: spacing.md },
  message: { flex: 1 },
}));

export function TextField({
  label,
  value,
  onChangeText,
  error,
  hint,
  multiline,
  maxLength,
  showCounter = multiline,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  const counter = showCounter && maxLength ? t('form.counter', { current: value.length, max: maxLength }) : null;

  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        maxLength={maxLength}
        placeholderTextColor={palette.textMuted}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, multiline ? styles.multi : styles.single, focused && styles.focused, error ? styles.invalid : null]}
        {...props}
      />
      {error || hint || counter ? (
        <View style={styles.footer}>
          <View style={styles.message}>
            {error ? (
              <Text variant="caption" tone="danger">
                {error}
              </Text>
            ) : hint ? (
              <Text variant="caption">{hint}</Text>
            ) : null}
          </View>
          {counter ? <Text variant="caption">{counter}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

export default TextField;
