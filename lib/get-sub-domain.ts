import { loger } from "./console-loger";

export function getSubdomain(url: string): string | null {
  loger.info('getSubdomain', url);
  if (
    url === 'https://eoassist.com/' ||
    url === 'https://nutroassist.com/' ||
    url === 'eoassist.com' ||
    url === 'nutroassist.com' ||
    url === 'eoassist' ||
    url === 'nutroassist' ||
    url === 'localhost' ||
    url === 'localhost:3000' ||
    url === 'localhost:4000' ||
    url === 'localhost:3001' || 
    url.startsWith('localhost:3000') || 
    url.startsWith('eoassist') ||
    url.startsWith('nutroassist')
  )
    return '';
  if (!url) return '';
  const cleanUrl = url?.replace(/(^\w+:\/\/)/, '');

  const parts = cleanUrl?.split('.');
  if (parts.length < 2) return '';

  if (parts.length > 2) return parts[0] || '';

  const knownTlds = [
    'com',
    'net',
    'org',
    'io',
    'co.uk',
    'ca',
    'de',
    'fr',
    'jp',
  ];

  const firstPart = parts?.[1];
  if (firstPart) {
    if (knownTlds.includes(firstPart)) return '';
  }
  if ((parts[0] === 'eoassist' || parts[0] === 'nutroassist' || parts[0] === 'localhost')) return '';

  return parts[0] || '';
}
