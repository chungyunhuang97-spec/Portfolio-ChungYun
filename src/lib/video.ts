/** Extracts the 11-char video id from any common YouTube URL shape. */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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
