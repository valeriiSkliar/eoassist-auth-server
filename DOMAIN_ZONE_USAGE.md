# Domain Zone Detection System

## Quick Start

The system automatically detects which domain zone (`.com`, `.ru`, `.store`) the application is running on.

### Server-side Usage

```typescript
import { getDomainInfo, getDomainZone } from "@/lib/get-domain-info";

// Get full domain information
const domainInfo = await getDomainInfo();
console.log(domainInfo.zone); // 'com' | 'ru' | 'store' | 'unknown'

// Get only the zone
const zone = await getDomainZone(); // 'com' | 'ru' | 'store' | 'unknown'

// Check specific zone
import { isDomainZone } from "@/lib/get-domain-info";
if (await isDomainZone("ru")) {
  // Logic for .ru zone
}
```

### Client-side Usage

```typescript
import { useDomainInfo } from "@/hooks/use-domain-info";

function MyComponent() {
  const domainInfo = useDomainInfo();

  return <div>Current zone: .{domainInfo.zone}</div>;
}
```

### API Routes

```typescript
import { getDomainInfo } from "@/lib/get-domain-info";

export async function GET() {
  const { zone } = await getDomainInfo();

  // Customize response based on zone
  if (zone === "ru") {
    return Response.json({ message: "Привет" });
  }
  return Response.json({ message: "Hello" });
}
```

## Data Structure

```typescript
interface DomainInfo {
  zone: "com" | "ru" | "store" | "unknown";
  fullDomain: string; // e.g., "app.eoassist.com"
  subdomain: string; // e.g., "app"
  baseDomain: string; // e.g., "eoassist.com"
}
```

## Detection Mechanisms

### 1. Header-based Detection

```typescript
// In middleware.ts
const domainInfo = getDomainZoneFromHeaders(request.headers, request.cookies);
```

The system analyzes:

- `Host` header from the incoming request
- `x-origin-server` header (for ru-proxy detection)
- `x-proxy-host` header (original host when proxied)
- Existing cookies from previous requests

### 2. Ru-Proxy Support

```typescript
const xOriginServer = req.headers.get("x-origin-server");
const xProxyHost = req.headers.get("x-proxy-host");

if (xOriginServer === "ru-proxy") {
  // Special handling for Russian proxy
  req.cookies.set("x-origin-server", xOriginServer);
  req.cookies.set("x-proxy-host", xProxyHost || "");
}
```

When accessed through ru-proxy, the system:

- Detects `x-origin-server: ru-proxy` header
- Preserves original host information in `x-proxy-host`
- Maintains correct domain zone detection despite proxy

## Context Propagation

### 1. Global Context

```typescript
// Set in middleware for immediate access
(globalThis as any).__DOMAIN_INFO = domainInfo;

// Access from anywhere in the application
const domainInfo = (globalThis as any).__DOMAIN_INFO;
```

### 2. Cookie Storage

```typescript
// Automatically set by middleware
setDomainInfoCookie(response, domainInfo);

// Cookie structure:
// Name: 'domain-info'
// Value: JSON.stringify(domainInfo)
// HttpOnly: false (accessible to client-side)
```

### 3. Headers Propagation

```typescript
// Middleware sets headers for downstream processing
response.headers.set("x-domain-zone", domainInfo.zone);
response.headers.set("x-full-domain", domainInfo.fullDomain);
```

## Processing Flow

### Public Pages

```typescript
if (isPublicPage) {
  const response = intlMiddleware(req);

  // Even public pages get domain info
  setDomainInfoCookie(response, domainInfo);

  // Preserve ru-proxy headers
  if (xOriginServer === "ru-proxy") {
    response.cookies.set("x-origin-server", xOriginServer);
    response.cookies.set("x-proxy-host", xProxyHost || "");
  }
}
```

### Protected Pages

```typescript
const authMiddleware = auth(async (request) => {
  // Domain detection happens first
  const domainInfo = getDomainZoneFromHeaders(request.headers, request.cookies);
  setDomainInfoCookie(response, domainInfo);

  // Set global context for NextAuth callbacks
  (globalThis as any).__DOMAIN_INFO = domainInfo;

  // Continue with authentication...
});
```

## Debugging & Troubleshooting

### Enable Debug Logging

```typescript
// Check middleware logs for domain detection
console.log("[MIDDLEWARE ROOT] Domain detection", {
  detectedZone: domainInfo.zone,
  fullDomain: domainInfo.fullDomain,
  isRuProxy: xOriginServer === "ru-proxy",
  originalHost: xProxyHost,
});
```

### Verify in Browser DevTools

```javascript
// Check cookies
document.cookie.split(";").find((c) => c.includes("domain-info"));

// Check global context (in development)
console.log(window.__DOMAIN_INFO);
```

### Common Issues

**Issue**: Domain zone shows as 'unknown'

- **Cause**: Headers missing or malformed
- **Solution**: Check `Host` header and proxy configuration

**Issue**: Incorrect zone detection with ru-proxy

- **Cause**: Missing `x-proxy-host` header
- **Solution**: Ensure proxy passes original host information

**Issue**: Domain info not available in API routes

- **Cause**: Middleware not processing API routes
- **Solution**: Use `getDomainInfo()` helper in API routes

## How It Works

1. **Early Detection**: Domain zone is detected in the main middleware before any routing
2. **Multiple Contexts**: Information is stored in cookies, global context, and headers
3. **Proxy Awareness**: Special handling for ru-proxy maintains correct domain detection
4. **Universal Access**: Available in both server and client contexts through various methods
5. **Persistence**: Cookie storage ensures domain info survives page refreshes and navigation
