/** Extracts the 11-char video id from any common YouTube URL shape. */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i
  );
  return match ? match[1] : null;
}

/**
 * `maxresdefault` (1280x720) only exists for videos the uploader provided
 * an HD thumbnail for -- YouTube 404s it otherwise. `hqdefault` (480x360)
 * is generated for every public video, so it's the safe fallback quality.
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "max" | "hq" = "max"
): string {
  const file = quality === "max" ? "maxresdefault" : "hqdefault";
  return `https://img.youtube.com/vi/${videoId}/${file}.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

/** Resolves a video work's thumbnail: the stored URL, or an auto YouTube one. */
export function resolveThumbnailUrl(
  thumbnailUrl: string | null,
  videoUrl: string | null
): string | null {
  if (thumbnailUrl) return thumbnailUrl;
  if (!videoUrl) return null;
  const videoId = extractYouTubeId(videoUrl);
  return videoId ? getYouTubeThumbnailUrl(videoId) : null;
}

/**
 * The lower-quality thumbnail to fall back to when `resolveThumbnailUrl`'s
 * guess was an auto `maxresdefault` one that might 404 -- null when the
 * thumbnail is a manually-set upload (nothing to fall back from) or there's
 * no YouTube video to derive one from.
 */
export function resolveFallbackThumbnailUrl(
  thumbnailUrl: string | null,
  videoUrl: string | null
): string | null {
  if (thumbnailUrl || !videoUrl) return null;
  const videoId = extractYouTubeId(videoUrl);
  return videoId ? getYouTubeThumbnailUrl(videoId, "hq") : null;
}

/**
 * Instagram serves an iframe-embeddable version of any public post/reel at
 * the same URL with `/embed` appended -- no API key needed for the basic
 * (uncaptioned) widget. Extracts the post type + shortcode from any common
 * Instagram URL shape (with or without a leading username segment).
 */
export function getInstagramEmbedUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels)\/([\w-]+)/i);
  if (!match) return null;
  const type = match[1].toLowerCase() === "reels" ? "reel" : match[1].toLowerCase();
  return `https://www.instagram.com/${type}/${match[2]}/embed`;
}

/**
 * Resolves any work/reel-link URL to an embeddable iframe src, trying
 * YouTube first and then Instagram -- null when the URL matches neither,
 * in which case the caller should fall back to an outbound link.
 */
export function resolveEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const videoId = extractYouTubeId(url);
  if (videoId) return getYouTubeEmbedUrl(videoId);
  return getInstagramEmbedUrl(url);
}
