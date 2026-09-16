import i18n from 'i18next';

import { LOCALES, type AppLocale } from '@/i18n/locales';
import { NAMESPACES, resources } from '@/i18n/resources';
import { SERVICE_ERROR_CODES } from '@constants/serviceErrors';

const REFERENCE: AppLocale = 'fr';
const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other'];
const localeCodes = LOCALES.map((locale) => locale.code);
const otherLocales = localeCodes.filter((code) => code !== REFERENCE);

function flatten(value: unknown, prefix = '', out = new Map<string, string>()): Map<string, string> {
  if (typeof value === 'string') {
    out.set(prefix, value);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

function pluralBase(key: string): string | null {
  const suffix = PLURAL_SUFFIXES.find((candidate) => key.endsWith(candidate));
  return suffix ? key.slice(0, -suffix.length) : null;
}

const variablesOf = (text: string) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((match) => match[1]).sort();
const tagsOf = (text: string) => [...text.matchAll(/<(\w+)>/g)].map((match) => match[1]).sort();

describe.each(NAMESPACES)('namespace %s', (namespace) => {
  const reference = flatten(resources[REFERENCE][namespace]);

  it.each(otherLocales)('%s a exactement les clés du français', (code) => {
    const keys = [...flatten(resources[code][namespace]).keys()].sort();
    expect(keys).toEqual([...reference.keys()].sort());
  });

  it.each(localeCodes)('%s ne contient aucune traduction vide', (code) => {
    const empty = [...flatten(resources[code][namespace])].filter(([, text]) => text.trim() === '').map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it.each(otherLocales)('%s utilise les mêmes variables et balises que le français', (code) => {
    const translated = flatten(resources[code][namespace]);
    const mismatches = [...reference]
      .filter(([key, text]) => {
        const other = translated.get(key) ?? '';
        return (
          variablesOf(text).join() !== variablesOf(other).join() || tagsOf(text).join() !== tagsOf(other).join()
        );
      })
      .map(([key]) => key);
    expect(mismatches).toEqual([]);
  });

  it.each(localeCodes)('%s définit _one et _other pour chaque pluriel', (code) => {
    const keys = new Set(flatten(resources[code][namespace]).keys());
    const bases = new Set([...keys].map(pluralBase).filter((base): base is string => base !== null));
    const missing = [...bases].filter((base) => !keys.has(`${base}_one`) || !keys.has(`${base}_other`));
    expect(missing).toEqual([]);
  });
});

describe('codes d’erreur de service', () => {
  it.each(localeCodes)('%s traduit chaque code', (code) => {
    const translations: Record<string, string> = resources[code].common.serviceError;
    const missing = SERVICE_ERROR_CODES.filter((errorCode) => !translations[errorCode]);
    expect(missing).toEqual([]);
  });
});

describe('interpolation des documents légaux', () => {
  it('interpole les variables dans les sections renvoyées en objet', () => {
    const sections = i18n.t('legal:terms.sections', {
      returnObjects: true,
      appName: 'TestApp',
      abuseEmail: 'abuse@test.fr',
      contactEmail: 'contact@test.fr',
    });
    const text = JSON.stringify(sections);
    expect(text).toContain('TestApp');
    expect(text).toContain('abuse@test.fr');
    expect(text).not.toContain('{{');
  });
});
