/** @type {import('next').NextConfig} */
const isProd = process.env.NEXT_DEV !== "true";

// Helper to determine GitHub Pages basePath if deploying there
const getBasePath = () => {
  if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    // If building on GitHub Actions, automatically set the subdirectory path of the repo
    if (repoName) {
      return `/${repoName}`;
    }
  }
  return "";
};

const basePath = getBasePath();

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(isProd ? {
    output: "export",
    distDir: "www",
    basePath: basePath,
    assetPrefix: basePath ? `${basePath}/` : undefined,
  } : {}),
};

export default nextConfig;
