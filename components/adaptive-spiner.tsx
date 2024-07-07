'use client'

import { usePostMessages } from "./provides/postMessage-provider";

export function AdaptiveSpiner() {
  const { isLoading } = usePostMessages();
  if (!isLoading) {
    return null;
  }
  return (
    <div className="flex items-center justify-center w-full h-screen fixed left-0 right-0 top-0 bottom-0 z-50 bg-black bg-opacity-50">
      <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
