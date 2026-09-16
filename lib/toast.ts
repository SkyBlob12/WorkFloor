import Toast from 'react-native-toast-message';

/** Types de toast rendus par components/ui/ToastHost. */
export type ToastKind = 'error' | 'success' | 'undo';

export interface UndoToastOptions {
  message: string;
  undoLabel: string;
  durationMs: number;
  onUndo: () => void;
}

export interface UndoToastProps {
  undoLabel: string;
  onUndo: () => void;
}

export function showErrorToast(message: string): void {
  Toast.show({ type: 'error', text1: message, position: 'bottom' });
}

export function showSuccessToast(message: string): void {
  Toast.show({ type: 'success', text1: message, position: 'bottom' });
}

export function showUndoToast({ message, undoLabel, durationMs, onUndo }: UndoToastOptions): void {
  const props: UndoToastProps = { undoLabel, onUndo };
  Toast.show({ type: 'undo', text1: message, position: 'bottom', visibilityTime: durationMs, props });
}

export function hideToast(): void {
  Toast.hide();
}
