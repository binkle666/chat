'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import { Message, ChatUser, getSocket, disconnectSocket } from '@/lib/socket';
import { getSocketConfig } from '@/lib/config';
import { Send, LogOut, Users, AlertCircle } from 'lucide-react';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // 确保先清理之前的连接
    disconnectSocket();

    // 初始化 Socket.IO
    const socket = getSocket();

    const socketConfig = getSocketConfig();
    console.log('🔧 初始化 Socket.IO 连接...', {
      url: socketConfig.url,
      options: socketConfig.options,
      useCustomServer: socketConfig.options.path ? false : true,
      currentOrigin:
        typeof window !== 'undefined' ? window.location.origin : 'N/A',
    });

    socket.on('connect', () => {
      console.log('Socket.IO 连接成功:', socket.id);
      setIsConnected(true);
      setError('');
      // 加入聊天室
      socket.emit('join-chat', currentUser);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO 连接断开');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket.IO 连接错误:', error);
      const errorMessage = error?.message || error?.type || '连接错误';
      const errorType = error?.type || 'unknown';
      const errorDescription = error?.description || 'none';

      console.error('错误类型:', errorType);
      console.error('错误描述:', errorDescription);
      setError(`连接失败: ${errorMessage}`);
    });

    socket.on('room-full', (data) => {
      setError(data.message);
    });

    socket.on('users-updated', (users: ChatUser[]) => {
      console.log('用户列表更新:', users);
      setConnectedUsers(users);
    });

    socket.on('message-history', (history: Message[]) => {
      setMessages(
        history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      );
    });

    socket.on('new-message', (message: Message) => {
      console.log('接收到新消息:', message);
      setMessages((prev) => {
        const newMessages = [
          ...prev,
          {
            ...message,
            timestamp: new Date(message.timestamp),
          },
        ];
        console.log('更新后的消息列表:', newMessages);
        return newMessages;
      });
    });

    socket.on('user-joined', (data) => {
      // 可以显示系统消息
    });

    socket.on('user-left', (data) => {
      // 可以显示系统消息
    });

    return () => {
      // 清理所有事件监听器
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room-full');
      socket.off('users-updated');
      socket.off('message-history');
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');

      disconnectSocket();
    };
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const socket = getSocket();
    socket.emit('send-message', { content: newMessage.trim() });
    setNewMessage('');
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">聊天室</h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {isConnected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                在线: {connectedUsers.length}/2
              </span>
            </div>
            <span className="text-sm text-gray-600">
              欢迎, {user.displayName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">退出</span>
            </button>
          </div>
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* 在线用户列表 */}
      {connectedUsers.length > 0 && (
        <div className="bg-blue-50 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700">在线用户:</span>
              {connectedUsers.map((connectedUser) => (
                <span
                  key={connectedUser.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {connectedUser.displayName}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 消息区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>还没有消息，开始聊天吧！</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.userId === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`flex items-end space-x-2 ${
                        message.userId === user.id
                          ? 'flex-row-reverse space-x-reverse'
                          : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                        {message.displayName.charAt(0)}
                      </div>
                      <div>
                        <div
                          className={`chat-bubble ${
                            message.userId === user.id ? 'own' : 'other'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {message.displayName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 消息输入区域 */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 input-field"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>发送</span>
              </button>
            </form>
            {connectedUsers.length < 2 && isConnected && (
              <p className="text-xs text-gray-500 mt-2">
                当前在线：{connectedUsers.length}/2 人，可以发送消息
                {connectedUsers.length === 1 && '（单人模式）'}
              </p>
            )}
            {!isConnected && (
              <p className="text-xs text-red-500 mt-2">连接中...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
