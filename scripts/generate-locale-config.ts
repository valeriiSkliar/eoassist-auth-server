// scripts/generate-locale-config.ts

import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'all_locales');
const outputFile = path.join(process.cwd(), 'utils/generated/locale-config.json');

function getAvailableLocales(): string[] {
  return fs
    .readdirSync(localesDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace('.json', ''));
}

function generateLocaleConfig() {
  const locales = getAvailableLocales();
  const config = {
    locales,
    defaultLocale: process.env.DEFAULT_LOCALE || 'en',
    localePrefix: 'always',
  };

  fs.writeFileSync(outputFile, JSON.stringify(config, null, 2));
  console.log(`Locale config generated at ${outputFile}`);
}

generateLocaleConfig();
