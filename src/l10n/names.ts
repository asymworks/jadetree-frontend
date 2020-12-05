import { parseLocale } from '@jadetree/currency';

import languageNamesEn from 'cldr-localenames-modern/main/en/languages.json';
import scriptNamesEn from 'cldr-localenames-modern/main/en/scripts.json';
import territoryNamesEn from 'cldr-localenames-modern/main/en/territories.json';
import variantNamesEn from 'cldr-localenames-modern/main/en/variants.json';

export function languageName(key: string): string | unknown {
  return languageNamesEn.main.en.localeDisplayNames.languages[key];
}

export function scriptName(key: string | undefined): string | unknown {
  return key
    ? scriptNamesEn.main.en.localeDisplayNames.scripts[key]
    : '';
}

export function territoryName(key: string | undefined): string | unknown {
  return key
    ? territoryNamesEn.main.en.localeDisplayNames.territories[key]
    : '';
}

export function variantName(key: string | undefined): string | unknown {
  return key
    ? variantNamesEn.main.en.localeDisplayNames.variants[key]
    : '';
}

export function tagName(tag: string): string | unknown {
  const {
    language,
    script,
    territory,
    variant,
  } = parseLocale(tag);
  if (!territory && !variant && !script) {
    return languageName(language);
  }
  if (territory && !variant && !script) {
    return `${languageName(language)} (${territoryName(territory)})`;
  }
  if (!territory && variant && !script) {
    return `${languageName(language)} (${variantName(variant)})`;
  }
  if (!territory && !variant && script) {
    return `${languageName(language)} (${scriptName(script)})`;
  }
  if (territory && variant && !script) {
    return `${languageName(language)} (${territoryName(territory)} - ${variantName(variant)})`;
  }
  if (territory && !variant && script) {
    return `${languageName(language)} (${territoryName(territory)} - ${scriptName(script)})`;
  }
  if (!territory && variant && script) {
    return `${languageName(language)} (${variantName(variant)} - ${scriptName(script)})`;
  }
  return `${languageName(language)} (${territoryName(territory)} - ${scriptName(script)} - ${variantName(variant)})`;
}
