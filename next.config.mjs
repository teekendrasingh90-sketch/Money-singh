/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(process.env.NEXT_DEV !== "true" ? {
    output: "export",
    distDir: "www",
  } : {}),
};

export default nextConfig;
