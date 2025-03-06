// middlewares/withReferralMiddleware.ts
import { Env } from "@/lib/Env";
import { CustomMiddleware } from './chain';

function getSubdomain(url: string): string {
  if (!url) {
    return '';
  }
  const urlObject = new URL(url);
  const hostnameParts = urlObject.hostname.split('.');

  if (hostnameParts.length < 2) {
    return '';
  }

  return hostnameParts?.[0] ?? '';
}

export function withReferralMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const refererFromRequest = request.headers.get('referer') ?? '';
    const subdomain = getSubdomain(refererFromRequest);

    request.headers.set('referal-domain', refererFromRequest ?? '');
    request.cookies.set('referal-domain', refererFromRequest ?? '');
    response.cookies.set('referal-domain', refererFromRequest ?? '');
    response.headers.set('referal-domain', refererFromRequest ?? '');

    const referalDomain = request.cookies.get('referal-domain')?.value ?? '';
    if (!referalDomain) {
      if (!refererFromRequest.startsWith(Env.NEXTAUTH_URL)) {
        const subdomain = getSubdomain(refererFromRequest);
        request.headers.set('referal-domain', refererFromRequest ?? '');
        request.cookies.set('referal-domain', refererFromRequest ?? '');
        response.cookies.set('referal-domain', refererFromRequest ?? '');
        response.headers.set('referal-domain', refererFromRequest ?? '');
      }
    }

    return middleware(request, event, response);
  };
}