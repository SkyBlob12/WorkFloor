import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';

export interface SheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

const sheetStyle = { width: '100%', maxWidth: layout.sheetMaxWidth, alignSelf: 'center' } as const;

/**
 * Feuille modale (@gorhom/bottom-sheet) pilotée par `visible`.
 *
 * `dismiss()` ne doit être appelé que sur une feuille réellement ouverte : sur une feuille jamais
 * présentée (ou déjà fermée par glissement), la librairie reste bloquée à l'état « en fermeture »
 * et ignore ensuite tous les `present()`.
 */
export function Sheet({ visible, onDismiss, children }: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const presented = useRef(false);
  const palette = useThemeColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && !presented.current) {
      presented.current = true;
      ref.current?.present();
    } else if (!visible && presented.current) {
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [visible]);

  // Fermeture venue de la feuille (glissement, fond, fin d'animation) : déjà démontée côté librairie.
  const handleDismiss = useCallback(() => {
    presented.current = false;
    onDismiss();
  }, [onDismiss]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={handleDismiss}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: palette.surface }}
      handleIndicatorStyle={{ backgroundColor: palette.border }}
      style={sheetStyle}>
      <BottomSheetView style={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + spacing.md }}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export default Sheet;
