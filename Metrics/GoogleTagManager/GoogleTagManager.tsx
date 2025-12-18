import { GoogleTagManager as NextGTM } from "@next/third-parties/google";

interface GoogleTagManagerProps {
  gtmId: string;
}

/**
 * Google Tag Manager component wrapper
 * Uses Next.js @next/third-parties for optimized GTM integration
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-tag-manager
 */
export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  if (!gtmId) {
    console.warn("[GoogleTagManager] GTM ID is not provided");
    return null;
  }

  return <NextGTM gtmId={gtmId} />;
}
