/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  distDir: 'dist',
  reactCompiler: true,
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Excluir el directorio components dentro de pages del build
  outputFileTracingExcludes: {
    '*': ['pages/components/**/*']
  }
};

export default nextConfig;
