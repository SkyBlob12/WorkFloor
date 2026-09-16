import { createContext, useContext } from 'react';
import type { HostInstance } from 'react-native';

/** Élément mesurable à l'écran (un `TextInput`). */
export type MeasurableField = Pick<HostInstance, 'measureInWindow'>;

/** Signale au défilement parent qu'un champ vient de prendre le focus. */
export type RevealField = (field: MeasurableField) => void;

export const KeyboardRevealContext = createContext<RevealField | null>(null);

/** Fonction fournie par `Screen` pour garder le champ actif centré au-dessus du clavier. */
export function useKeyboardReveal(): RevealField | null {
  return useContext(KeyboardRevealContext);
}
