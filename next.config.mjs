/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Zero images by design (§1). No next/image optimization pipeline needed.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
