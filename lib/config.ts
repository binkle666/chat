// 环境配置管理
export const config = {
  // 是否使用自定义服务器（本地开发时为 true，Vercel 部署时为 false）
  useCustomServer: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER === 'true',

  // Socket.IO 连接地址
  socketUrl: (() => {
    // 优先使用环境变量
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      console.log('🔧 使用环境变量 SOCKET_URL:', process.env.NEXT_PUBLIC_SOCKET_URL);
      return process.env.NEXT_PUBLIC_SOCKET_URL;
    }
    
    // 否则使用当前页面的 origin
    if (typeof window !== 'undefined') {
      console.log('🔧 使用浏览器 origin:', window.location.origin);
      return window.location.origin;
    }
    
    // 最后的后备选项
    console.log('🔧 使用默认 localhost');
    return 'http://localhost:3000';
  })(),

  // Socket.IO 路径
  socketPath: '/api/socket',

  // 是否为生产环境
  isProduction: process.env.NODE_ENV === 'production',

  // 是否为开发环境
  isDevelopment: process.env.NODE_ENV === 'development',
};

// 获取 Socket.IO 配置
export function getSocketConfig() {
  console.log('🔧 环境变量检查:', {
    NEXT_PUBLIC_USE_CUSTOM_SERVER: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NODE_ENV: process.env.NODE_ENV,
    useCustomServer: config.useCustomServer,
    socketUrl: config.socketUrl,
  });

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
        transports: ['polling'], // Vercel 只支持 polling
        autoConnect: true,
        forceNew: true,
        timeout: 45000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
        upgrade: false, // 禁用升级到 WebSocket
        closeOnBeforeunload: false,
      },
    };
  }
}
