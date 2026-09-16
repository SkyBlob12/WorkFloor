import type { Session, User } from '@supabase/supabase-js';

import { useAuthStore } from '@stores/authStore';

export function useAuthUser(): User | null {
  return useAuthStore((state) => state.session?.user ?? null);
}

export function useAuthSession(): Session | null {
  return useAuthStore((state) => state.session);
}

export function useAuthInitializing(): boolean {
  return useAuthStore((state) => state.initializing);
}
