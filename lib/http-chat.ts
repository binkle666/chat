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
  lastSeen: Date;
}

class HttpChatClient {
  private userId: number | null = null;
  private lastMessageId: string | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private listeners: { [event: string]: Function[] } = {};

  constructor(private baseUrl: string = '') {}

  // 事件监听器
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.listeners[event]) return;
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      );
    } else {
      this.listeners[event] = [];
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  async joinChat(user: { id: number; username: string; displayName: string }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join chat');
      }

      this.userId = user.id;
      this.startPolling();

      // 处理历史消息
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach((msg: any) => {
          this.emit('new-message', {
            ...msg,
            timestamp: new Date(msg.timestamp),
          });
        });
        this.lastMessageId = data.messages[data.messages.length - 1].id;
      }

      this.emit('users-updated', data.users || []);
      this.emit('connected', { userId: this.userId });

      return data;
    } catch (error) {
      console.error('加入聊天室失败:', error);
      this.emit('connect_error', error);
      throw error;
    }
  }

  async sendMessage(content: string) {
    if (!this.userId) {
      throw new Error('Not connected to chat');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  async leaveChat() {
    if (!this.userId) return;

    try {
      await fetch(`${this.baseUrl}/api/chat?userId=${this.userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('离开聊天室失败:', error);
    } finally {
      this.stopPolling();
      this.userId = null;
      this.lastMessageId = null;
      this.emit('disconnected', {});
    }
  }

  private startPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.pollInterval = setInterval(async () => {
      await this.poll();
    }, 2000); // 每2秒轮询一次
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async poll() {
    if (!this.userId) return;

    try {
      const url = new URL(`${this.baseUrl}/api/chat`);
      url.searchParams.set('userId', this.userId.toString());
      if (this.lastMessageId) {
        url.searchParams.set('lastMessageId', this.lastMessageId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Polling failed');
      }

      const data = await response.json();

      // 处理新消息
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach((msg: any) => {
          this.emit('new-message', {
            ...msg,
            timestamp: new Date(msg.timestamp),
          });
        });
        this.lastMessageId = data.messages[data.messages.length - 1].id;
      }

      // 更新用户列表
      this.emit('users-updated', data.users || []);
    } catch (error) {
      console.error('轮询失败:', error);
      this.emit('connect_error', error);
    }
  }

  // 兼容 Socket.IO 的接口
  get connected() {
    return this.userId !== null;
  }

  disconnect() {
    this.leaveChat();
  }
}

// 创建全局实例
let httpChatClient: HttpChatClient | null = null;

export function getHttpChatClient(): HttpChatClient {
  if (!httpChatClient) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    httpChatClient = new HttpChatClient(baseUrl);
  }
  return httpChatClient;
}

export function disconnectHttpChat() {
  if (httpChatClient) {
    httpChatClient.disconnect();
    httpChatClient = null;
  }
}
