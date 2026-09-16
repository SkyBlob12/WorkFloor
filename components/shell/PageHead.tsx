import { Platform } from 'react-native';

import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useTranslation } from 'react-i18next';

export interface PageHeadProps {
  /** Titre de la page (suffixé par le nom de l'app sauf `bare`). */
  title: string;
  description?: string;
  /** Titre du header natif, si l'écran en affiche un. */
  headerTitle?: string;
  bare?: boolean;
}

/** Métadonnées web (titre d'onglet, description SEO) et titre du header natif. */
export function PageHead({ title, description, headerTitle, bare = false }: PageHeadProps) {
  const { t } = useTranslation('common');
  return (
    <>
      {Platform.OS === 'web' ? (
        <Head>
          <title>{bare ? title : t('meta.pageTitle', { title })}</title>
          {description ? <meta name="description" content={description} /> : null}
        </Head>
      ) : null}
      {headerTitle !== undefined ? <Stack.Screen options={{ title: headerTitle }} /> : null}
    </>
  );
}

export default PageHead;
