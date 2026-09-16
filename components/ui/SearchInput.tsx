import { useState } from 'react';
import { TextInput, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { iconSize, radius, size, spacing, typography } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

import { IconButton } from './IconButton';

export interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}

const useStyles = makeStyles((palette) => ({
  container: {
    height: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  focused: { borderColor: palette.primary },
  input: { ...typography.body, flex: 1, height: '100%', color: palette.text },
}));

export function SearchInput({ value, onChangeText, placeholder, autoFocus }: SearchInputProps) {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Feather name="search" size={iconSize.lg} color={focused ? palette.primary : palette.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
      />
      {value ? (
        <IconButton icon="x" color="textMuted" accessibilityLabel={t('action.clearSearch')} onPress={() => onChangeText('')} />
      ) : null}
    </View>
  );
}

export default SearchInput;
