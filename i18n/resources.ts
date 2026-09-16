import enAccount from './locales/en/account.json';
import enCommon from './locales/en/common.json';
import enCompanies from './locales/en/companies.json';
import enLegal from './locales/en/legal.json';
import enOnboarding from './locales/en/onboarding.json';
import enReviews from './locales/en/reviews.json';
import frAccount from './locales/fr/account.json';
import frCommon from './locales/fr/common.json';
import frCompanies from './locales/fr/companies.json';
import frLegal from './locales/fr/legal.json';
import frOnboarding from './locales/fr/onboarding.json';
import frReviews from './locales/fr/reviews.json';

export const defaultNS = 'common';

export const NAMESPACES = ['common', 'companies', 'reviews', 'account', 'legal', 'onboarding'] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const resources = {
  fr: {
    common: frCommon,
    companies: frCompanies,
    reviews: frReviews,
    account: frAccount,
    legal: frLegal,
    onboarding: frOnboarding,
  },
  en: {
    common: enCommon,
    companies: enCompanies,
    reviews: enReviews,
    account: enAccount,
    legal: enLegal,
    onboarding: enOnboarding,
  },
};
