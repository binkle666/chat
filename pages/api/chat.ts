import type { NextApiRequest, NextApiResponse } from 'next';

interface ChatUser {
  id: number;
  username: string;
  displayName: string;
  lastSeen: Date;
}

interface Message {
  id: string;
  userId: number;
  username: string;
  displayName: string;
  content: string;
  timestamp: Date;
}

// 内存存储（简单起见，生产环境建议使用数据库）
let connectedUsers = new Map<number, ChatUser>();
let messages: Message[] = [];
const MAX_USERS = 2;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        handleGetMessages(req, res);
        break;
      case 'POST':
        handlePostMessage(req, res);
        break;
      case 'PUT':
        handleJoinChat(req, res);
        break;
      case 'DELETE':
        handleLeaveChat(req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat API 错误:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function handleGetMessages(req: NextApiRequest, res: NextApiResponse) {
  const { userId, lastMessageId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // 更新用户最后在线时间
  const user = connectedUsers.get(Number(userId));
  if (user) {
    user.lastSeen = new Date();
    connectedUsers.set(Number(userId), user);
  }

  // 清理离线用户（超过30秒未活动）
  const now = new Date();
  for (const [id, user] of Array.from(connectedUsers.entries())) {
    if (now.getTime() - user.lastSeen.getTime() > 30000) {
      connectedUsers.delete(id);
    }
  }

  // 获取新消息
  let newMessages = messages;
  if (lastMessageId) {
    const lastIndex = messages.findIndex((m) => m.id === lastMessageId);
    newMessages = lastIndex >= 0 ? messages.slice(lastIndex + 1) : messages;
  }

  res.status(200).json({
    messages: newMessages,
    users: Array.from(connectedUsers.values()),
    userCount: connectedUsers.size,
  });
}

function handlePostMessage(req: NextApiRequest, res: NextApiResponse) {
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'User ID and content required' });
  }

  const user = connectedUsers.get(userId);
  if (!user) {
    return res.status(401).json({ error: 'User not in chat' });
  }

  const message: Message = {
    id: Date.now().toString(),
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    content: content.trim(),
    timestamp: new Date(),
  };

  messages.push(message);

  // 保持最近100条消息
  if (messages.length > 100) {
    messages = messages.slice(-100);
  }

  console.log('新消息 (HTTP API):', message.displayName, ':', message.content);

  res.status(200).json({ success: true, message });
}

function handleJoinChat(req: NextApiRequest, res: NextApiResponse) {
  const { id, username, displayName } = req.body;

  if (!id || !username || !displayName) {
    return res.status(400).json({ error: 'User info required' });
  }

  // 检查用户数限制
  if (connectedUsers.size >= MAX_USERS && !connectedUsers.has(id)) {
    return res.status(403).json({
      error: '聊天室已满，最多只能有两个用户在线',
    });
  }

  const user: ChatUser = {
    id,
    username,
    displayName,
    lastSeen: new Date(),
  };

  connectedUsers.set(id, user);

  console.log('用户加入聊天室 (HTTP API):', displayName);

  res.status(200).json({
    success: true,
    user,
    messages: messages.slice(-50), // 返回最近50条消息
    users: Array.from(connectedUsers.values()),
  });
}

function handleLeaveChat(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const user = connectedUsers.get(Number(userId));
  if (user) {
    connectedUsers.delete(Number(userId));
    console.log('用户离开聊天室 (HTTP API):', user.displayName);
  }

  res.status(200).json({ success: true });
}
