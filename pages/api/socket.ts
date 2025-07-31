import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any & {
      io?: Server;
    };
  };
};

interface ChatUser {
  id: number;
  username: string;
  displayName: string;
  socketId: string;
}

interface Message {
  id: string;
  userId: number;
  username: string;
  displayName: string;
  content: string;
  timestamp: Date;
}

// 内存存储（注意：Vercel 无服务器环境下会在函数调用间重置）
const connectedUsers = new Map<string, ChatUser>();
const messages: Message[] = [];
const MAX_USERS = 2;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  // 检查是否已经初始化
  if (res.socket.server.io) {
    console.log('Socket.IO 服务器已在运行');
    res
      .status(200)
      .json({ success: true, message: 'Socket.IO server already running' });
    return;
  }

  console.log('开始初始化 Socket.IO 服务器...');

  try {
    const io = new Server(res.socket.server, {
      path: '/api/socket', // 明确设置路径
      addTrailingSlash: false,
      cors: {
        origin: [
          'http://localhost:3000',
          'https://chat-iota-blue.vercel.app',
          /^https:\/\/.*\.vercel\.app$/,
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['my-custom-header', 'content-type'],
        credentials: true,
      },
      allowEIO3: true,
      transports: ['polling'], // Vercel 主要支持 polling
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
    });

    // 存储 io 实例
    res.socket.server.io = io;
    console.log('Socket.IO 服务器初始化成功，路径: /api/socket');

    // 设置连接处理
    io.on('connection', (socket) => {
      console.log('用户连接 (API):', socket.id);

      // 用户加入聊天室
      socket.on('join-chat', (user: Omit<ChatUser, 'socketId'>) => {
        console.log('用户加入聊天室 (API):', user, 'Socket ID:', socket.id);
        console.log('当前连接用户数:', connectedUsers.size);

        // 检查最大用户数限制
        if (connectedUsers.size >= MAX_USERS) {
          const existingUser = Array.from(connectedUsers.values()).find(
            (u) => u.id === user.id,
          );
          if (!existingUser) {
            console.log('聊天室已满，拒绝用户:', user.displayName);
            socket.emit('room-full', {
              message: '聊天室已满，最多只能有两个用户在线',
            });
            return;
          }
        }

        // 处理重复登录
        const existingUser = Array.from(connectedUsers.values()).find(
          (u) => u.id === user.id,
        );
        if (existingUser) {
          const oldSocketId = Array.from(connectedUsers.entries()).find(
            ([_, u]) => u.id === user.id,
          )?.[0];
          if (oldSocketId) {
            connectedUsers.delete(oldSocketId);
          }
        }

        // 添加用户
        connectedUsers.set(socket.id, { ...user, socketId: socket.id });
        socket.join('chat-room');

        console.log('用户成功加入:', user.displayName, 'Socket ID:', socket.id);
        console.log('更新后连接用户数:', connectedUsers.size);

        // 发送用户列表
        const userList = Array.from(connectedUsers.values());
        io.to('chat-room').emit('users-updated', userList);

        // 发送历史消息
        socket.emit('message-history', messages);

        // 通知用户加入
        socket.to('chat-room').emit('user-joined', {
          user: { ...user, socketId: socket.id },
          message: `${user.displayName} 加入了聊天室`,
        });

        console.log(
          '当前在线用户 (API):',
          userList.map((u) => u.displayName),
        );
      });

      // 发送消息
      socket.on('send-message', (data: { content: string }) => {
        const user = connectedUsers.get(socket.id);
        if (!user) {
          console.log('未找到用户 (API):', socket.id, '- 用户可能需要重新加入');
          // 通知客户端需要重新加入聊天室
          socket.emit('need-rejoin', {
            message: '会话已过期，请重新连接',
            socketId: socket.id,
          });
          return;
        }

        const message: Message = {
          id: Date.now().toString(),
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          content: data.content,
          timestamp: new Date(),
        };

        messages.push(message);

        // 保持最近100条消息
        if (messages.length > 100) {
          messages.splice(0, messages.length - 100);
        }

        console.log('新消息 (API):', message.displayName, ':', message.content);
        io.to('chat-room').emit('new-message', message);
      });

      // 断开连接
      socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
          connectedUsers.delete(socket.id);

          console.log('用户离开 (API):', user.displayName);

          // 通知用户离开
          socket.to('chat-room').emit('user-left', {
            user,
            message: `${user.displayName} 离开了聊天室`,
          });

          // 更新用户列表
          const userList = Array.from(connectedUsers.values());
          io.to('chat-room').emit('users-updated', userList);

          console.log(
            '当前在线用户 (API):',
            userList.map((u) => u.displayName),
          );
        }
        console.log('用户断开连接 (API):', socket.id);
      });
    });

    res.status(200).json({
      success: true,
      message: 'Socket.IO server initialized successfully',
    });
  } catch (error) {
    console.error('Socket.IO 初始化失败:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize Socket.IO server',
      details: error,
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
