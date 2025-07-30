import { io, Socket } from 'socket.io-client';
import { getSocketConfig, config } from './config';

let socket: Socket | null = null;

export interface Message {
  id: string;
  userId: number;
  username: string;
  displayName: string;
  content: string;
  timestamp: Date;
}

export interface ChatUser {
  id: number;
  username: string;
  displayName: string;
  socketId: string;
}

// 初始化 Socket.IO 服务器（Vercel 需要）
async function initializeSocketServer(): Promise<void> {
  if (config.useCustomServer) {
    // 自定义服务器模式不需要初始化
    return;
  }

  try {
    const response = await fetch('/api/socket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('🔧 Socket.IO 服务器初始化结果:', result);
  } catch (error) {
    console.error('❌ 初始化 Socket.IO 服务器失败:', error);
    // 即使初始化失败也继续尝试连接
  }
}

export async function getSocket(): Promise<Socket> {
  if (!socket || socket.disconnected) {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    // 在 Vercel 环境下先初始化服务器
    await initializeSocketServer();

    // 使用统一的配置函数
    const socketConfig = getSocketConfig();

    console.log('🔧 Socket 连接配置:', {
      url: socketConfig.url,
      options: socketConfig.options,
      env_USE_CUSTOM_SERVER: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER,
      env_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    });

    // 使用配置创建 socket 连接
    socket = io(socketConfig.url, socketConfig.options);

    console.log('🚀 连接到:', socketConfig.url, '配置:', socketConfig.options);

    // 添加详细的连接日志
    socket.on('connect', () => {
      console.log('✅ Socket 客户端连接成功，ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket 客户端断开连接，原因:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket 客户端连接错误:', error);
      console.error('错误详情:', {
        message: error?.message || '未知错误',
        type: (error as any)?.type || 'unknown',
        description: (error as any)?.description || 'none',
        transport: (error as any)?.transport || 'unknown',
        stack: error?.stack || 'no stack trace',
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket 重新连接成功，尝试次数:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔄❌ Socket 重连失败:', error);
    });
  }
  return socket;
}

// 同步版本，用于向后兼容
export function getSocketSync(): Socket {
  if (!socket || socket.disconnected) {
    // 如果 socket 不存在，创建一个但不等待初始化
    const socketConfig = getSocketConfig();
    socket = io(socketConfig.url, socketConfig.options);

    // 异步初始化服务器
    initializeSocketServer().catch(console.error);
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    console.log('断开 Socket 连接');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
