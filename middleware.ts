import { auth } from "auth";
import { NextResponse } from "next/server";
import { generateApiKey } from "./lib/generate-api-key";

export function getSubdomain(url: string): string  {
  if (!url) {
    return '';
  }
  const urlObject = new URL(url);
  const hostnameParts = urlObject.hostname.split('.');

  // Check for at least two parts (subdomain and domain)
  if (hostnameParts.length < 2) {
    return '';
  }

  // The subdomain is the part before the top-level domain
  return hostnameParts?.[0] ?? '';
}


export default auth(async (req) => {
  req.cookies.set('Authorization', `Bearer ${generateApiKey()}`);
  const response = NextResponse.next()
  const regex = /(?<=\/\/)[^\.]+(?=\.)/;

  const referer = req.headers.get('referer');
  if (referer) {
  const shortDomain = getSubdomain(referer ?? '');

    response.headers.set('partnerDomain', shortDomain);
    response.cookies.set('partnerDomain', shortDomain);
  }

  return response;

})
export const config = {
  matcher: ['/', '/auth/new-user'],
}
