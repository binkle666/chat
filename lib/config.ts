// 环境配置管理（已移除socket相关配置，改用HTTP聊天）
export const config = {
  // 是否为生产环境
  isProduction: process.env.NODE_ENV === 'production',

  // 是否为开发环境
  isDevelopment: process.env.NODE_ENV === 'development',

  // API基础URL
  apiUrl: typeof window !== 'undefined' ? window.location.origin : '',
};
