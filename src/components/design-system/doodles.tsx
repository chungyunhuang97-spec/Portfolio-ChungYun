import type { SVGProps } from "react";

/**
 * Hand-authored doodle marks for the homepage hero's "scribble collage"
 * background (Figma poster references had no exportable vector layers --
 * both nodes came back as flattened moodboard PNGs -- so these are drawn
 * from scratch to match the reference's hand-drawn aesthetic rather than
 * traced from it). Each accepts standard SVG props so callers can size,
 * color (via `currentColor`), and position them freely.
 *
 * Two families, matching the reference's split between bold flat shapes
 * and thin scribbled line-art:
 * - Filled: DoodleSplat, DoodleStar, DoodleFlower
 * - Stroked: DoodleSpiral, DoodleScribble, DoodleGrid, DoodleArrow
 */

export function DoodleSplat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" {...props}>
      <path d="M 100.0 10.2 L 108.5 71.1 L 151.7 19.5 L 121.9 81.0 L 185.2 61.1 L 132.8 95.3 L 184.2 112.1 L 131.9 114.6 L 164.0 155.5 L 118.4 128.7 L 124.0 181.8 L 100.0 129.3 L 74.2 187.9 L 78.6 133.3 L 34.8 156.5 L 71.7 112.9 L 5.7 113.6 L 59.2 94.1 L 14.1 60.8 L 74.6 78.0 L 45.1 14.6 L 91.9 72.5 Z" />
    </svg>
  );
}

export function DoodleStar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
    </svg>
  );
}

export function DoodleFlower(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <circle cx="50" cy="26" r="18" />
      <circle cx="50" cy="74" r="18" />
      <circle cx="26" cy="50" r="18" />
      <circle cx="74" cy="50" r="18" />
      <circle cx="50" cy="50" r="12" fill="var(--doodle-flower-center, currentColor)" />
    </svg>
  );
}

export function DoodleSpiral(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 53.4 50.0 L 54.5 51.3 L 54.1 52.5 L 54.1 54.3 L 53.0 55.8 L 51.2 55.7 L 49.6 56.2 L 47.1 58.3 L 45.5 56.5 L 43.5 55.4 L 40.1 54.4 L 39.9 51.5 L 38.5 48.5 L 39.6 45.6 L 40.4 42.4 L 43.1 40.6 L 45.3 37.4 L 48.8 35.5 L 52.7 36.0 L 56.8 36.3 L 60.5 38.3 L 62.5 42.0 L 66.4 45.1 L 67.2 49.6 L 66.6 54.3 L 64.8 58.5 L 63.7 64.0 L 59.3 66.9 L 54.7 69.9 L 49.1 71.3 L 43.4 70.5 L 37.5 68.8 L 33.4 64.3 L 28.8 60.0 L 27.2 53.9 L 25.3 47.4 L 26.5 40.7 L 30.9 35.5 L 35.1 30.4 L 40.6 26.4 L 47.1 22.4 L 54.5 23.3 L 62.0 24.6 L 68.2 28.9 L 74.1 34.0 L 77.8 41.0 L 79.7 48.8 L 80.0 57.0 L 77.5 65.1 L 73.4 72.9 L 66.4 78.4 L 58.4 82.9 L 49.3 84.3 L 39.8 83.7 L 31.2 79.6 L 24.5 73.0 L 17.2 66.3 L 13.2 57.0 L 12.3 46.8 L 14.8 36.9 L 18.8 27.4" />
    </svg>
  );
}

export function DoodleScribble(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 150 80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 6.0 39.9 L 7.5 52.7 L 9.1 63.5 L 10.6 67.1 L 12.1 67.4 L 13.7 64.3 L 15.2 58.3 L 16.7 55.1 L 18.3 52.8 L 19.8 51.7 L 21.3 47.7 L 22.9 44.5 L 24.4 37.0 L 25.9 29.7 L 27.5 19.1 L 29.0 8.8 L 30.5 7.6 L 32.1 9.2 L 33.6 15.2 L 35.1 25.3 L 36.7 34.8 L 38.2 43.3 L 39.7 50.5 L 41.3 51.8 L 42.8 53.2 L 44.3 54.4 L 45.9 56.2 L 47.4 61.1 L 48.9 64.5 L 50.5 66.9 L 52.0 63.2 L 53.5 56.0 L 55.1 44.3 L 56.6 31.9 L 58.1 20.0 L 59.7 12.0 L 61.2 11.9 L 62.7 14.3 L 64.3 19.1 L 65.8 24.5 L 67.3 27.8 L 68.9 30.4 L 70.4 32.5 L 71.9 34.5 L 73.5 41.5 L 75.0 48.0 L 76.5 58.7 L 78.1 66.2 L 79.6 73.9 L 81.1 74.3 L 82.7 67.0 L 84.2 58.2 L 85.7 48.9 L 87.3 36.8 L 88.8 30.5 L 90.3 24.6 L 91.9 22.3 L 93.4 23.8 L 94.9 23.7 L 96.5 20.3 L 98.0 17.0 L 99.5 15.8 L 101.1 18.6 L 102.6 23.2 L 104.1 30.8 L 105.7 43.5 L 107.2 55.4 L 108.7 64.7 L 110.3 71.6 L 111.8 69.0 L 113.3 65.4 L 114.9 58.3 L 116.4 51.2 L 117.9 48.2 L 119.5 43.6 L 121.0 42.9 L 122.5 38.0 L 124.1 33.3 L 125.6 24.9 L 127.1 16.4 L 128.7 11.4 L 130.2 7.9 L 131.7 8.8 L 133.3 18.2 L 134.8 27.4 L 136.3 39.9 L 137.9 51.2 L 139.4 56.8 L 140.9 57.6 L 142.5 60.2 L 144.0 57.1" />
    </svg>
  );
}

export function DoodleGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" {...props}>
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <line key={`h${v}`} x1={0} y1={v} x2={100} y2={v} />
      ))}
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <line key={`v${v}`} x1={v} y1={0} x2={v} y2={100} />
      ))}
    </svg>
  );
}

export function DoodleArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M 85 15 C 60 15 20 35 15 80" />
      <path d="M 15 80 L 30 68" />
      <path d="M 15 80 L 27 90" />
    </svg>
  );
}

export function DoodleEye(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 30c14-22 82-22 96 0-14 22-82 22-96 0Z" />
      <circle cx="50" cy="30" r="11" fill="currentColor" stroke="none" />
    </svg>
  );
}
