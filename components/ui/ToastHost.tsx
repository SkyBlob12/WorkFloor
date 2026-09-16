import Toast, { type ToastConfig, type ToastConfigParams } from 'react-native-toast-message';

import { spacing } from '@constants/theme';
import { useTabBarInset } from '@hooks/useTabBarInset';
import { hideToast, type UndoToastProps } from '@lib/toast';

import { ToastCard } from './ToastCard';

const toastConfig: ToastConfig = {
  error: ({ text1 }) => <ToastCard tone="error" message={text1 ?? ''} />,
  success: ({ text1 }) => <ToastCard tone="success" message={text1 ?? ''} />,
  undo: ({ text1, props }: ToastConfigParams<UndoToastProps>) => (
    <ToastCard
      tone="neutral"
      message={text1 ?? ''}
      action={{
        label: props.undoLabel,
        onPress: () => {
          props.onUndo();
          hideToast();
        },
      }}
    />
  ),
};

/** Hôte des toasts, à monter une fois en fin d'arbre (au-dessus de la barre flottante en mobile). */
export function ToastHost() {
  const tabBarInset = useTabBarInset();
  return <Toast config={toastConfig} position="bottom" bottomOffset={Math.max(tabBarInset, spacing.lg) + spacing.sm} />;
}

export default ToastHost;
