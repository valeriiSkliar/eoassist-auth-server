# Domain Zone Detection System

## Quick Start

The system automatically detects which domain zone (`.com`, `.ru`, `.store`) the application is running on.

### Server-side Usage

```typescript
import { getDomainInfo, getDomainZone } from '@/lib/get-domain-info';

// Get full domain information
const domainInfo = await getDomainInfo();
console.log(domainInfo.zone); // 'com' | 'ru' | 'store' | 'unknown'

// Get only the zone
const zone = await getDomainZone(); // 'com' | 'ru' | 'store' | 'unknown'

// Check specific zone
import { isDomainZone } from '@/lib/get-domain-info';
if (await isDomainZone('ru')) {
  // Logic for .ru zone
}
```

### Client-side Usage

```typescript
import { useDomainInfo } from '@/hooks/use-domain-info';

function MyComponent() {
  const domainInfo = useDomainInfo();
  
  return (
    <div>
      Current zone: .{domainInfo.zone}
    </div>
  );
}
```

### API Routes

```typescript
import { getDomainInfo } from '@/lib/get-domain-info';

export async function GET() {
  const { zone } = await getDomainInfo();
  
  // Customize response based on zone
  if (zone === 'ru') {
    return Response.json({ message: 'Привет' });
  }
  return Response.json({ message: 'Hello' });
}
```

## Data Structure

```typescript
interface DomainInfo {
  zone: 'com' | 'ru' | 'store' | 'unknown';
  fullDomain: string;     // e.g., "app.eoassist.com"
  subdomain: string;      // e.g., "app"
  baseDomain: string;     // e.g., "eoassist.com"
}
```

## How It Works

1. Middleware detects the domain zone from request headers
2. Information is stored in cookies and global context
3. Available everywhere in the application via helpers and hooks
4. Works correctly with ru-proxy and all domain mirrors