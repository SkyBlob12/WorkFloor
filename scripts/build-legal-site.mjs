// Génère les pages publiques exigées par les stores (assistance, documents légaux, suppression de compte)
// à partir des traductions de l'app. Sortie : dist-legal/, publiée sur GitHub Pages (.github/workflows/legal-site.yml).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP } from '../constants/app.ts';
import { LEGAL_DOCS } from '../constants/legal.ts';
import { DEFAULT_LOCALE, LOCALES } from '../i18n/locales.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist-legal');
const tokens = JSON.parse(readFileSync(join(ROOT, 'constants/tokens.json'), 'utf8'));
const VALUES = { appName: APP.name, contactEmail: APP.contactEmail, abuseEmail: APP.abuseEmail };
const PLACEHOLDER = /\[(À COMPLÉTER|À VÉRIFIER|À VALIDER|TO COMPLETE|TO CHECK|TO BE VALIDATED)/g;

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const interpolate = (text, values = {}) =>
  text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (name in values ? String(values[name]) : match));

const richText = (text, values) =>
  escapeHtml(interpolate(text, { ...VALUES, ...values })).replace(
    /[\w.+-]+@[\w-]+\.[\w.]+\w/g,
    (email) => `<a href="mailto:${email}">${email}</a>`,
  );

const withoutNumber = (heading) => heading.replace(/^\d+\.\s*/, '');

const localeDir = (code) => (code === DEFAULT_LOCALE ? '' : `${code}/`);

function relativeHref(fromCode, toCode, file) {
  if (fromCode === toCode) return file === 'index.html' ? './' : file;
  const up = fromCode === DEFAULT_LOCALE ? '' : '../';
  const target = `${localeDir(toCode)}${file === 'index.html' ? '' : file}`;
  return `${up}${target}` || './';
}

function section({ id, heading, paragraphs }, values, { stripNumber = false } = {}) {
  const idAttr = id ? ` id="${escapeHtml(id)}"` : '';
  const title = stripNumber ? withoutNumber(heading) : heading;
  const body = paragraphs.map((paragraph) => `<p>${richText(paragraph, values)}</p>`).join('\n');
  return `<section${idAttr}>\n<h2>${richText(title, values)}</h2>\n${body}\n</section>`;
}

function paletteVars(palette) {
  const pick = ['background', 'surface', 'surfaceMuted', 'border', 'text', 'textMuted', 'primary'];
  return pick.map((name) => `--${name}: ${palette[name]};`).join(' ');
}

function typeRule(name) {
  const type = tokens.typography[name];
  const letterSpacing = type.letterSpacing ? ` letter-spacing: ${type.letterSpacing}px;` : '';
  return `font-size: ${type.fontSize}px; line-height: ${type.lineHeight}px; font-weight: ${type.fontWeight};${letterSpacing}`;
}

const { spacing, radius, layout, palette } = tokens;
const CSS = `
:root { color-scheme: light dark; ${paletteVars(palette.light)} }
@media (prefers-color-scheme: dark) { :root { ${paletteVars(palette.dark)} } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--background); color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif; ${typeRule('body')} }
.page { max-width: ${layout.readingMaxWidth + spacing.md * 2}px; margin: 0 auto; padding: ${spacing.lg}px ${spacing.md}px ${spacing.xxl}px; }
.top { display: flex; align-items: center; justify-content: space-between; gap: ${spacing.md}px; margin-bottom: ${spacing.lg}px; }
.brand { ${typeRule('title')} color: var(--text); text-decoration: none; }
.brand span { color: var(--primary); }
.langs { display: flex; gap: ${spacing.sm}px; }
.langs a { ${typeRule('label')} color: var(--text); background: var(--surfaceMuted); border-radius: ${radius.full}px;
  padding: ${spacing.xs}px ${spacing.md}px; text-decoration: none; }
main { background: var(--surface); border-radius: ${radius.lg}px; padding: ${spacing.lg}px; }
h1 { ${typeRule('display')} margin: 0 0 ${spacing.sm}px; overflow-wrap: anywhere; }
h2 { ${typeRule('heading')} margin: ${spacing.xl}px 0 ${spacing.sm}px; }
p { margin: 0 0 ${spacing.sm}px; overflow-wrap: anywhere; }
a { color: var(--primary); }
.caption, .lead { color: var(--textMuted); }
.caption { ${typeRule('caption')} }
ul.docs { list-style: none; padding: 0; margin: 0; display: grid; gap: ${spacing.sm}px; }
footer { margin-top: ${spacing.lg}px; ${typeRule('caption')} }
footer nav { display: flex; flex-wrap: wrap; gap: ${spacing.xs}px ${spacing.md}px; }
footer a { color: var(--textMuted); }
`;

function pageLinks(code, t) {
  return [
    ['index.html', t.site.supportTitle],
    ...LEGAL_DOCS.map((doc) => [`${doc}.html`, t[doc].title]),
    ['delete-account.html', interpolate(t.site.deleteAccountTitle, VALUES)],
  ].map(([file, label]) => `<a href="${relativeHref(code, code, file)}">${escapeHtml(label)}</a>`);
}

function layoutHtml({ code, t, file, title, body }) {
  const alternates = LOCALES.map(
    (locale) =>
      `<link rel="alternate" hreflang="${locale.code}" href="${APP.publicSiteUrl}/${localeDir(locale.code)}${file === 'index.html' ? '' : file}">`,
  ).join('\n');
  const languages = LOCALES.filter((locale) => locale.code !== code)
    .map(
      (locale) =>
        `<a href="${relativeHref(code, locale.code, file)}" hreflang="${locale.code}" lang="${locale.code}">${escapeHtml(locale.nativeName)}</a>`,
    )
    .join('');
  const { start, accent, end } = APP.wordmark;

  return `<!doctype html>
<html lang="${code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(`${title} · ${APP.name}`)}</title>
<meta name="description" content="${escapeHtml(t.site.tagline)}">
${APP.googleSiteVerification ? `<meta name="google-site-verification" content="${escapeHtml(APP.googleSiteVerification)}">\n` : ''}${alternates}
<style>${CSS}</style>
</head>
<body>
<div class="page">
<header class="top">
<a class="brand" href="${relativeHref(code, code, 'index.html')}">${escapeHtml(start)}<span>${escapeHtml(accent)}</span>${escapeHtml(end)}</a>
<nav class="langs">${languages}</nav>
</header>
<main>
<h1>${escapeHtml(title)}</h1>
${body}
</main>
<footer><nav>${pageLinks(code, t).join('\n')}</nav></footer>
</div>
</body>
</html>
`;
}

function buildLocale(code) {
  const t = JSON.parse(readFileSync(join(ROOT, `i18n/locales/${code}/legal.json`), 'utf8'));
  const updated = `<p class="caption">${richText(t.updatedLabel, { date: t.updatedAt })}</p>`;
  const pages = new Map();

  const support = [
    `<p class="lead">${richText(t.site.supportIntro)}</p>`,
    `<section>\n<h2>${richText(t.site.contactHeading)}</h2>\n<p>${richText(t.site.contactText)}</p>\n</section>`,
    `<section>\n<h2>${richText(t.site.passwordHeading)}</h2>\n<p>${richText(t.site.passwordText)}</p>\n</section>`,
    `<section>\n<h2>${richText(t.site.reportHeading)}</h2>\n<p>${richText(t.site.reportText)}</p>\n</section>`,
    `<section>\n<h2>${richText(t.site.documentsHeading)}</h2>\n<ul class="docs">${pageLinks(code, t)
      .slice(1)
      .map((link) => `<li>${link}</li>`)
      .join('')}</ul>\n</section>`,
  ].join('\n');
  pages.set('index.html', { title: t.site.supportTitle, body: support });

  for (const doc of LEGAL_DOCS) {
    const body = [updated, ...t[doc].sections.map((item) => section(item))].join('\n');
    pages.set(`${doc}.html`, { title: t[doc].title, body });
  }

  const privacySection = (id) => t.privacy.sections.find((item) => item.id === id);
  const deletion = [
    `<p class="lead">${richText(t.site.deleteAccountIntro)}</p>`,
    section(privacySection('delete-account'), {}, { stripNumber: true }),
    section(privacySection('retention'), {}, { stripNumber: true }),
    `<p><a href="${relativeHref(code, code, 'privacy.html')}">${escapeHtml(t.privacy.title)}</a></p>`,
    updated,
  ].join('\n');
  pages.set('delete-account.html', { title: interpolate(t.site.deleteAccountTitle, VALUES), body: deletion });

  mkdirSync(join(OUT, localeDir(code)), { recursive: true });
  let placeholders = 0;
  for (const [file, page] of pages) {
    const html = layoutHtml({ code, t, file, ...page });
    placeholders += html.match(PLACEHOLDER)?.length ?? 0;
    writeFileSync(join(OUT, localeDir(code), file), html);
  }
  return placeholders;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, '.nojekyll'), '');

const placeholders = LOCALES.reduce((total, locale) => total + buildLocale(locale.code), 0);

console.log(`Pages générées dans dist-legal/ (${LOCALES.map((locale) => locale.code).join(', ')}).`);
console.log(`  Assistance      ${APP.publicSiteUrl}/`);
console.log(`  Confidentialité ${APP.publicSiteUrl}/privacy.html`);
console.log(`  Suppression     ${APP.publicSiteUrl}/delete-account.html`);
if (placeholders > 0) console.warn(`Attention : ${placeholders} mention(s) [À COMPLÉTER] ou [À VALIDER] restent dans les pages.`);
