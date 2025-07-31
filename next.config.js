/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['socket.io']
  },
  
  // 公开环境变量 - 修复默认值
  env: {
    // 在 Vercel 环境下应该是 false，本地开发时是 true
    NEXT_PUBLIC_USE_CUSTOM_SERVER: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER || (process.env.VERCEL ? 'false' : 'true'),
    // 在生产环境中不设置默认的 localhost 地址
    ...(process.env.NEXT_PUBLIC_SOCKET_URL && {
      NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL
    }),
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