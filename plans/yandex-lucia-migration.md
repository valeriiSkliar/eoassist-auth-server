# Lucia Migration Plan for Yandex Login

## Goals

- Replace the Yandex NextAuth provider with Lucia while keeping Google/Telegram on NextAuth.
- Ensure Lucia-specific routes bypass existing NextAuth middleware.
- Preserve current UX (popups, postMessage flow, ru-domain constraints).

## Phased Work

1. **Audit Current Yandex Flow**

   - Trace Yandex usage in `auth.config.ts`, middleware, login components, and popup messaging.
   - Document cookies/headers set for ru mirrors and any session expectations on the client.

   **Findings (2024-11-24)**

   - `auth.config.ts`
     - Imports `next-auth/providers/yandex` alongside Google.
     - Calculates `yandexRedirectProxyUrl` to force callbacks through RU mirrors (`Env.NEXTAUTH_URL_RU` or `.com → .ru` mapping) and injects it into the provider.
     - `redirect` callback sanitizes `originHost`, whitelists domains (`eoassist|nutroassist.(com|ru|store)`), and rewrites `baseUrl` with `ruProxyHost` when a proxy mapping is detected.
     - Helper utilities (`sanitizeHost`, `resolveProxyHost`, `shouldUseProxyHost`) rely on request-scoped globals set by middleware (`__NEXT_PRIVATE_PROXY_HOST`).
     - Yandex `profile` callback normalizes user payload (id/name/email/avatar) and tags `provider: 'yandex'` for downstream checks.
   - `middleware.ts`
     - Wraps NextAuth middleware plus intl routing; for every request sets `Authorization` cookie with generated API key.
     - Derives domain zone (`com|ru|store`) via `getDomainZoneFromHeaders`; stores in `domain-info` cookie and `__DOMAIN_INFO` global.
     - Mirrors RU proxy headers: if `x-origin-server === 'ru-proxy'`, copies `x-origin-server`/`x-proxy-host` into request/response cookies and globals used by NextAuth callbacks; appends `ruProxy` search params for downstream handlers.
     - Always emits `referal-domain` + optional `origin-host` cookies/headers based on query `originHost` or `Referer` header. These are consumed by popup messaging.
     - CORS allow-list includes both `.com` and `.ru` domains; ensures ru mirror requests are accepted.
   - Login UI (`app/[locale]/auth/login/…`)
     - `auth-components copy.tsx` gates providers by `domainInfo.zone`: only shows Yandex button when zone === `ru`.
     - `login-component-yandex.tsx` uses `usePostMessages()` context: sends `startLogin` → `signIn('yandex', { redirectTo: ${origin}/auth/callback/yandex })`; on success expects `session.user.provider === 'yandex'` and posts `login` message before closing popup.
     - Persists `ongoingAuth` flag in `sessionStorage` to reopen modal when a redirect returns.
   - Popup messaging (`components/provides/postMessage-provider.tsx`)
     - Maintains sanitized `originHost` from query/cookies/referrer/opener; refuses to target the auth domain (`auth.nutrioassist.com`).
     - Stores parent origin in `sessionStorage` (`eoassist-parent-origin`) and listens for `postMessage` events to refresh it; exposes `getResolvedOrigin()` consumed by login components.
     - On incoming messages sets/reset loading states (`show-spinner`, `login`, `error`, `close-window`).
   - Cookies/headers relevant to RU mirrors
     - `x-origin-server`, `x-proxy-host` (ru-proxy context) — set as both cookies and response headers; also cached in globals for NextAuth redirect logic.
     - `referal-domain`, `origin-host` — track the parent application domain for popup redirection.
     - `domain-info` — serialized zone/baseDomain data used by `useDomainInfo()` hook to show the correct provider list.
     - `Authorization` — per-request bearer token required by backend APIs.
   - Client session expectations
     - `SessionProvider` (wrapping PostMessagesProvider) relies on NextAuth session containing `provider` to distinguish Google vs Yandex on popup return.
     - UI assumes `session.user.provider === 'yandex'` to emit final `login` postMessage; Lucia implementation must continue populating this field or expose an equivalent signal.

2. **Introduce Lucia Dependencies & Config**

   - Add `lucia`, `arctic`, `@lucia-auth/adapter-prisma`, `prisma`, and `@prisma/client` to `package.json`.
   - Provision SQLite storage (e.g., `prisma/schema.prisma` with `sqlite` datasource) and generate Prisma client.
   - Create Lucia config (e.g., `lib/lucia.ts`) wired to the Prisma adapter and cookie settings.
   - Map environment variables or constants for SQLite file path and Yandex client/secret + callback URLs.
   - ✅ Packages installed, Prisma schema & client configured, `lib/prisma.ts`/`lib/lucia.ts` created, `DATABASE_URL` documented across env files.

2.5 **Middleware Globals Strategy**

- Document how Lucia handlers access globals set by middleware: `__DOMAIN_INFO`, `__NEXT_PRIVATE_PROXY_HOST`, `referal-domain` cookie.
- Provide helper to read these values on the server (shared util or direct access).
 - ✅ Added `lib/middleware-globals.ts` exposing `getMiddlewareContext`, `getProxyHost`, `getDomainInfo`, and `getReferalDomain` for reuse.

3. **Implement Yandex OAuth via Lucia**

   - Configure Yandex provider in Lucia (scopes, endpoints, ru-only validation).
   - Implement token exchange and user normalization compatible with existing session schema (id/email/avatar) and set `provider: 'yandex'` in user attributes.
   - Reuse RU proxy helpers (`resolveProxyHost`, `shouldUseProxyHost`) to compute final redirect targets when necessary.
   - Ensure Lucia produces a session/cookie accessible to the client, matching domain + security flags.
   - ✅ Added `lib/oauth/yandex.ts` with authorization URL generation, RU-only validation, token exchange, profile normalization, Prisma upsert, and Lucia session helper leveraging proxy utilities.

4. **Add Lucia Routes/Handlers**

   - Create endpoints (e.g., `/api/lucia/yandex/login`, `/api/lucia/yandex/callback`) or server actions.
   - Exclude Lucia paths from NextAuth middleware by updating `middleware.ts` matcher:
     ```ts
     matcher: [
       "/((?!api/lucia|api/auth|_next/static|_next/image|favicon.ico).*)",
     ];
     ```
   - Within Lucia handlers, import `sanitizeHost`, `resolveProxyHost`, `shouldUseProxyHost` from `auth.config.ts` and read globals (`__NEXT_PRIVATE_PROXY_HOST`, `__DOMAIN_INFO`) for ru-proxy support.
   - Handle errors/redirects mirroring current popup workflow (success, error, close-window messages).
   - ✅ Added `/api/lucia/yandex/login` & `/api/lucia/yandex/callback`, updated middleware matcher, and return postMessage-ready responses with Lucia session cookies.

5. **Update Frontend Integration**

   - Adjust Yandex login component to call Lucia endpoints instead of `signIn('yandex')`, reusing existing postMessage contract.
   - Ensure Lucia session/user payload exposes `provider: 'yandex'` so `session.user.provider === 'yandex'` checks continue to work (declare in `lib/lucia.ts`).
   - Keep Google/Telegram logic untouched; all UI remains identical.
   - Propagate redirect URL and originHost handling through the new endpoints.
   - ✅ `login-component-yandex.tsx` now calls `/api/lucia/yandex/login`, handles errors locally, and relies on Lucia callback for success messaging.

6. **Session Harmonization**

   - Cookie naming strategy:
     ```
     // NextAuth: next-auth.session-token
     // Lucia:    lucia_session
     ```
   - Left align session cookie flags; see Phase 6.5 for domain configuration.
   - Define unified session interface consumed by `SessionProvider`:
     ```ts
     interface UnifiedSession {
       user: {
         id: string;
         name: string | null;
         email: string | null;
         image: string | null;
       };
       provider: "google" | "yandex" | "telegram";
     }
     ```
   - Implement dual session lookup:

     ```ts
     async function getSession() {
       let session = await auth();
       if (session) return normalizeSession(session, "nextauth");

       const luciaSession = await lucia.validateSession(luciaSessionId);
       if (luciaSession) return normalizeSession(luciaSession, "lucia");

       return null;
     }
     ```

   - `normalizeSession` should map provider info into `UnifiedSession` regardless of source.

6.5 **Cookie Domain Alignment**

- Configure Lucia cookies to match existing domain strategy:
  ```ts
  cookie: {
    domain: process.env.NODE_ENV === 'production'
      ? `.${Env.SHORT_DOMAIN}`
      : undefined,
    secure: true,
    sameSite: 'lax'
  }
  ```
- Ensures Lucia and NextAuth cookies share scope across mirrors/subdomains.

7. **Testing Strategy**

   - Manual: ru mirror only, multiple popup attempts, sequential logins, logout/login sequences.
   - Automated: unit/integration tests for Lucia handlers, mocked Yandex callbacks, middleware bypass checks.
   - Regression: verify Google/Telegram flows remain unaffected.

8. **Cleanup & Cutover**
   - Remove Yandex provider from NextAuth config once Lucia flow is stable.
   - Prune unused callbacks/env vars, update documentation (.env.example, README).
   - Decide on active session migration strategy:
     - Option A: force re-authentication for existing Yandex users (simpler).
     - Option B: run one-time migration to port NextAuth sessions to Lucia (optional).
   - Monitor production rollout; keep rollback plan (feature flag) until confident.
