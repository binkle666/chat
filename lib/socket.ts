import { io, Socket } from 'socket.io-client';
import { getSocketConfig } from './config';

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

export function getSocket(): Socket {
  if (!socket || socket.disconnected) {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    // 简化连接逻辑 - 直接使用当前地址和 API 路径
    const currentOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000';
    const useCustomServer =
      process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER === 'true';

    console.log('🔧 Socket 连接配置:', {
      useCustomServer,
      currentOrigin,
      env_USE_CUSTOM_SERVER: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER,
      env_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    });

    if (useCustomServer) {
      // 自定义服务器模式 (本地开发)
      socket = io(currentOrigin, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        forceNew: true,
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
      console.log('🚀 使用自定义服务器模式连接:', currentOrigin);
    } else {
      // API 路由模式 (Vercel 兼容)
      socket = io(currentOrigin, {
        path: '/api/socket',
        transports: ['polling', 'websocket'],
        autoConnect: true,
        forceNew: true,
        timeout: 30000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
        upgrade: true,
        closeOnBeforeunload: false,
      });
      console.log('🚀 使用 API 路由模式连接:', currentOrigin + '/api/socket');
    }

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

export function disconnectSocket(): void {
  if (socket) {
    console.log('断开 Socket 连接');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
