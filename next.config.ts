import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin-uploaded media (AdminMediaDropzone) lands in Supabase Storage's
    // `project-media` bucket and comes back as a full `*.supabase.co`
    // public URL -- next/image refuses any remote host that isn't
    // allow-listed here, so without this entry an image re-uploaded via
    // /admin would 500 the moment a case-study page swapped its <img> for
    // next/image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hiufwsnrzufooxkfyojr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
