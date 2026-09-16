export const MIN_PASSWORD_LENGTH = 8;
export const MIN_USER_AGE = 16;

/** Fournisseurs OAuth proposés, dans l'ordre d'affichage (Apple en premier : exigence App Store). */
export const AUTH_PROVIDERS = ['apple', 'google'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/** Modes du formulaire email (la réinitialisation est un écran à part). */
export const EMAIL_AUTH_MODES = ['signin', 'signup'] as const;

/** Route de retour après connexion Google / Apple (deep link natif et URL web). */
export const OAUTH_CALLBACK_PATH = 'auth-callback';
