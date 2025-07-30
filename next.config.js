/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['socket.io']
  },
  
  // 公开环境变量
  env: {
    NEXT_PUBLIC_USE_CUSTOM_SERVER: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER || 'true',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  },

  // Vercel 部署优化
  ...(process.env.VERCEL && {
    experimental: {
      serverComponentsExternalPackages: ['socket.io'],
      runtime: 'nodejs',
    }
  })
}

module.exports = nextConfig 