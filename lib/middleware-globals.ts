import { cookies, headers } from "next/headers";
import { DomainInfo } from "./domain-zone";

const GLOBAL_PROXY_HOST_KEY = "__NEXT_PRIVATE_PROXY_HOST";
const GLOBAL_DOMAIN_INFO_KEY = "__DOMAIN_INFO";
const REFERAL_COOKIE_KEY = "referal-domain";

const isServer = typeof window === "undefined";

type Maybe<T> = T | null | undefined;

function readGlobal<T = unknown>(key: string): T | null {
  if (!isServer) {
    return null;
  }

  return (globalThis as Record<string, unknown>)[key] as T | null;
}

export function getProxyHost(): string | null {
  const globalProxy = readGlobal<string>(GLOBAL_PROXY_HOST_KEY);
  if (globalProxy) {
    return globalProxy;
  }

  const cookieStore = cookies();
  const cookieProxy = cookieStore.get("x-proxy-host")?.value;
  if (cookieProxy) {
    return cookieProxy;
  }

  const headerProxy = headers().get("x-proxy-host");
  return headerProxy;
}

export function getDomainInfo(): DomainInfo | null {
  const globalDomainInfo = readGlobal<DomainInfo>(GLOBAL_DOMAIN_INFO_KEY);
  if (globalDomainInfo) {
    return globalDomainInfo;
  }

  const headerValue = headers().get("x-domain-info");
  if (headerValue) {
    try {
      return JSON.parse(headerValue) as DomainInfo;
    } catch {
      return null;
    }
  }

  const cookieValue = cookies().get("domain-info")?.value;
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue) as DomainInfo;
    } catch {
      return null;
    }
  }

  return null;
}

export function getReferalDomain(): string | null {
  const cookieStore = cookies();
  const cookieRef = cookieStore.get(REFERAL_COOKIE_KEY)?.value;
  if (cookieRef) {
    return cookieRef;
  }

  const headerRef = headers().get("referal-domain");
  if (headerRef) {
    return headerRef;
  }

  return null;
}

export function getMiddlewareContext() {
  return {
    domainInfo: getDomainInfo(),
    proxyHost: getProxyHost(),
    referalDomain: getReferalDomain(),
  };
}

export type MiddlewareContext = ReturnType<typeof getMiddlewareContext>;
