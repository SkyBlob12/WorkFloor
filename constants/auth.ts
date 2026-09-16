import { Platform } from 'react-native';

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_USER_AGE = 16;

/** Fournisseurs OAuth gérés par l'app, dans l'ordre d'affichage (Apple en premier : exigence App Store). */
export const AUTH_PROVIDERS = ['apple', 'google'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/** Fournisseurs proposés sur la plateforme courante : Apple est réservé à iOS (feuille native), Android et web n'ont que Google. */
export const VISIBLE_AUTH_PROVIDERS: readonly AuthProvider[] =
  Platform.OS === 'ios' ? AUTH_PROVIDERS : AUTH_PROVIDERS.filter((provider) => provider !== 'apple');

/** Modes du formulaire email (la réinitialisation est un écran à part). */
export const EMAIL_AUTH_MODES = ['signin', 'signup'] as const;

/** Route de retour après connexion Google / Apple (deep link natif et URL web). */
export const OAUTH_CALLBACK_PATH = 'auth-callback';

/** Route ouverte par le lien « mot de passe oublié » (deep link natif et URL web). */
export const RESET_PASSWORD_PATH = 'reset-password';
