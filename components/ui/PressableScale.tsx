import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Base de tout élément tappable : impose un `accessibilityLabel`.
 * Aucun effet visuel à l'appui (choix produit : pas de rebond ni de réduction).
 */
export function PressableScale({ style, children, ...props }: PressableScaleProps) {
  return (
    <Pressable {...props} style={style}>
      {children}
    </Pressable>
  );
}

export default PressableScale;
