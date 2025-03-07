import { NextPage } from "next";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { Env } from "./lib/Env";
import { generateApiKey } from "./lib/generate-api-key";
import { AppConfig } from "./utils/AppConfig";

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
let publicPages = ['/','sites/*','about',]



// const baseMiddleware: CustomMiddleware = async (request, event, response) => {
//   request.cookies.set('Authorization', `Bearer ${generateApiKey()}`);
//   return response;
// };

// export default chain([
//   withCorsMiddleware,
//   withReferralMiddleware,
//   withAuthMiddleware,
//   withI18nMiddleware,
//   baseMiddleware
// ]);

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

 const  authMiddleware = auth(
  async (request) => {
    request.cookies.set('Authorization', `Bearer ${generateApiKey()}`);
    const response = NextResponse.next()
    // const response = intlMiddleware(request)
    const refererFromRequest = request.headers.get('referer') ?? '';
    // loger.info('locale', request.cookies.getAll())

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
  }
)

export default function middleware( req: NextRequest, event: NextPage) {
  const publicPathnameRegex = RegExp(
    `^(/(${AppConfig.locales.join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    // @ts-ignore
    return (authMiddleware)(req, event);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}