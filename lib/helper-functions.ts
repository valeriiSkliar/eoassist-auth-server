export function getSubdomain(url: string): string  {
    // loger.info('url',url);
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