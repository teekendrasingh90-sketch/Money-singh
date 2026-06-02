/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: "www",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
