import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Keyboard, Platform, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@constants/theme';
import { centeredScrollOffset, keyboardBottomInset, visibleBand } from '@utils/keyboardScroll';

import type { MeasurableField, RevealField } from './useKeyboardReveal';

export interface KeyboardAwareScroll {
  scrollRef: RefObject<ScrollView | null>;
  /** Marge basse à ajouter au contenu tant que le clavier est ouvert. */
  bottomInset: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  reveal: RevealField;
}

/** Garde le champ actif centré dans la zone visible au-dessus du clavier (iOS et Android). */
export function useKeyboardAwareScroll(): KeyboardAwareScroll {
  const { top: safeTop } = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const field = useRef<MeasurableField | null>(null);
  const keyboardTop = useRef<number | null>(null);
  // Nouvel objet à chaque apparition du clavier : recentre après l'application de la marge.
  const [keyboard, setKeyboard] = useState<{ inset: number } | null>(null);

  const scrollToField = useCallback(() => {
    const scroll = scrollRef.current;
    const target = field.current;
    const kbTop = keyboardTop.current;
    if (!scroll || !target || kbTop === null) return;
    scroll.getNativeScrollRef()?.measureInWindow((_x, viewY, _w, viewHeight) => {
      target.measureInWindow((_fx, fieldY, _fw, fieldHeight) => {
        const visible = visibleBand({ top: viewY, bottom: viewY + viewHeight }, kbTop, safeTop);
        const y = centeredScrollOffset({
          scrollY: scrollY.current,
          field: { top: fieldY, bottom: fieldY + fieldHeight },
          visible,
          margin: spacing.md,
        });
        scroll.scrollTo({ y, animated: true });
      });
    });
  }, [safeTop]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (event) => {
      const kbTop = event.endCoordinates.screenY;
      keyboardTop.current = kbTop;
      scrollRef.current?.getNativeScrollRef()?.measureInWindow((_x, viewY, _w, viewHeight) => {
        setKeyboard({ inset: keyboardBottomInset({ top: viewY, bottom: viewY + viewHeight }, kbTop, safeTop) });
      });
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      keyboardTop.current = null;
      setKeyboard(null);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [safeTop]);

  useEffect(() => {
    if (keyboard) scrollToField();
  }, [keyboard, scrollToField]);

  const reveal = useCallback<RevealField>(
    (target) => {
      field.current = target;
      // Clavier déjà ouvert (passage d'un champ à l'autre) : recentrer tout de suite.
      if (keyboardTop.current !== null) scrollToField();
    },
    [scrollToField],
  );

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  return { scrollRef, bottomInset: keyboard?.inset ?? 0, onScroll, reveal };
}
