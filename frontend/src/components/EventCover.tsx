import type { ReactNode } from "react";

// Recommended upload sizes. The boxes below use the same shapes,
// so images at these sizes show in full without cropping.
export const COVER_SIZE_HINT = "Recommended: 1920 × 1080 px (16:9), JPG or WebP under 500 KB.";
export const MOBILE_COVER_SIZE_HINT =
  "Recommended: 1080 × 1350 px (4:5). Shown on phones; uses the cover image if empty.";

type Props = {
  imageUrl: string;
  mobileImageUrl?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: ReactNode; // overlays such as badges
};

// Phones (under 768px) get the 4:5 mobile image when set; everything else gets the 16:9 cover.
// object-contain on a dark background means an off-size image is letterboxed, never cut off.
export function EventCover({ imageUrl, mobileImageUrl, alt, className = "", imgClassName = "", children }: Props) {
  const shape = mobileImageUrl ? "aspect-[4/5] md:aspect-video" : "aspect-video";
  return (
    <div className={`relative overflow-hidden bg-gray-950 ${shape} ${className}`}>
      <picture>
        {mobileImageUrl && <source media="(max-width: 767px)" srcSet={mobileImageUrl} />}
        <img src={imageUrl} alt={alt} className={`w-full h-full object-contain ${imgClassName}`} />
      </picture>
      {children}
    </div>
  );
}
