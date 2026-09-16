import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { isSupabaseConfigured } from '@lib/env';
import { supabase } from '@lib/supabase';

interface AuthState {
  session: Session | null;
  initializing: boolean;
}

export const useAuthStore = create<AuthState>()(() => ({
  session: null,
  initializing: isSupabaseConfigured,
}));

/** Branche la session Supabase sur le store. Renvoie la fonction de désabonnement. */
export function subscribeToAuth(onSessionChange?: (session: Session | null) => void): () => void {
  if (!isSupabaseConfigured) return () => undefined;

  supabase.auth.getSession().then(
    ({ data }) => useAuthStore.setState({ session: data.session, initializing: false }),
    () => useAuthStore.setState({ initializing: false }),
  );

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, initializing: false });
    onSessionChange?.(session);
  });
  return () => data.subscription.unsubscribe();
}
