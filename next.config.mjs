/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  outputFileTracingExcludes: {
    '*': ['pages/components/**/*']
  }
};

export default nextConfig;