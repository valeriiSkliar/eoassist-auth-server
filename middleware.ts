import { auth } from "auth";
import { NextResponse } from "next/server";
import { Env } from "./lib/Env";
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


export default auth(async (request) => {

  request.cookies.set('Authorization', `Bearer ${generateApiKey()}`);
  const response = NextResponse.next()
  const refererFromRequest = request.headers.get('referer') ?? '';
  if (refererFromRequest !== Env.NEXTAUTH_URL) {
    const subdomain = getSubdomain(refererFromRequest);
    request.headers.set('referal-domain', refererFromRequest ?? '');
    request.cookies.set('referal-domain', refererFromRequest ?? '');
    response.cookies.set('referal-domain', refererFromRequest ?? '');
    response.headers.set('referal-domain', refererFromRequest ?? '');
  }
  const regex = /(?<=\/\/)[^\.]+(?=\.)/;


  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: response.headers,
      status: 204,
    });
  }

  return response;

})
export const config = {
  matcher: ['/', '/auth/new-user'],
}
