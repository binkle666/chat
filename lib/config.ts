// 环境配置管理
export const config = {
  // 是否使用自定义服务器（本地开发时为 true，Vercel 部署时为 false）
  useCustomServer: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER === 'true',

  // Socket.IO 连接地址
  socketUrl:
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'),

  // Socket.IO 路径
  socketPath: '/api/socket',

  // 是否为生产环境
  isProduction: process.env.NODE_ENV === 'production',

  // 是否为开发环境
  isDevelopment: process.env.NODE_ENV === 'development',
};

// 获取 Socket.IO 配置
export function getSocketConfig() {
  if (config.useCustomServer) {
    // 本地开发环境：使用自定义服务器
    return {
      url: config.socketUrl,
      options: {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        forceNew: true,
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      },
    };
  } else {
    // 生产环境（Vercel）：使用 API 路由
    return {
      url: config.socketUrl,
      options: {
        path: config.socketPath,
        transports: ['polling', 'websocket'], // polling 优先
        autoConnect: true,
        forceNew: true,
        timeout: 30000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
        upgrade: true,
        closeOnBeforeunload: false,
      },
    };
  }
}
