"use client";

import { useState } from "react";

/**
 * An <img> that swaps to a lower-quality fallback on error instead of
 * rendering a broken image -- for auto-derived YouTube thumbnails, where
 * `maxresdefault` 404s on any video the uploader didn't provide an HD
 * thumbnail for (see resolveFallbackThumbnailUrl).
 */
export function ThumbnailImage({
  src,
  fallbackSrc,
  alt,
  className,
}: {
  src: string;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [usedFallback, setUsedFallback] = useState(false);

  function handleError() {
    if (!usedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
      setUsedFallback(true);
      setCurrentSrc(fallbackSrc);
    }
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- real YouTube thumbnail, not a next/image-allowlisted host
    <img src={currentSrc} alt={alt} className={className} onError={handleError} />
  );
}
