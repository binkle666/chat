'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import {
  Message,
  ChatUser,
  getHttpChatClient,
  disconnectHttpChat,
} from '@/lib/http-chat';
import { Send, LogOut, Users, AlertCircle, Wifi } from 'lucide-react';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // 使用HTTP聊天连接
    initializeHttpConnection(currentUser);

    return () => {
      // 清理HTTP连接
      disconnectHttpChat();
    };
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeHttpConnection = async (currentUser: any) => {
    try {
      setIsReconnecting(true);
      setError('正在连接聊天室...');

      // 确保先清理之前的连接
      disconnectHttpChat();

      // 使用 HTTP 客户端
      const httpClient = getHttpChatClient();

      httpClient.on('connected', () => {
        setIsConnected(true);
        setIsReconnecting(false);
        setError('');
      });

      httpClient.on('new-message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      httpClient.on('users-updated', (users: ChatUser[]) => {
        setConnectedUsers(users);
      });

      httpClient.on('connect_error', (error: any) => {
        setError('连接失败，请刷新页面重试');
        setIsConnected(false);
        setIsReconnecting(false);
      });

      httpClient.on('disconnected', () => {
        setIsConnected(false);
      });

      // 加入聊天室
      await httpClient.joinChat(currentUser);
    } catch (error) {
      setError('连接失败，请刷新页面重试');
      setIsReconnecting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    try {
      const httpClient = getHttpChatClient();
      await httpClient.sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      setError('发送消息失败');
    }
  };

  const handleLogout = () => {
    disconnectHttpChat();
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
                  isConnected
                    ? 'bg-green-500'
                    : isReconnecting
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {isConnected
                  ? '已连接 (HTTP)'
                  : isReconnecting
                  ? '连接中...'
                  : '未连接'}
              </span>
              <Wifi className="w-4 h-4 text-green-500" />
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

      {/* HTTP聊天提示 */}
      {isConnected && (
        <div className="bg-green-50 border-l-4 border-green-400 p-2">
          <div className="flex items-center text-sm">
            <Wifi className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-green-700">HTTP聊天模式 - 稳定可靠</span>
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
              <p className="text-xs text-red-500 mt-2">
                {isReconnecting ? '连接中，请稍候...' : '未连接'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
