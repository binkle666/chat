'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
  const [status, setStatus] = useState('等待测试');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `${timestamp}: ${msg}`]);
  };

  const testBasicConnection = async () => {
    setStatus('测试中...');
    setLogs([]);
    addLog('开始基础连接测试');

    try {
      // 1. 检查当前地址
      const currentUrl = window.location.origin;
      addLog(`当前地址: ${currentUrl}`);

      // 2. 动态导入 socket.io-client
      const { io } = await import('socket.io-client');
      addLog('Socket.IO 客户端库加载成功');

      // 3. 创建最简单的连接
      addLog('创建 Socket.IO 连接...');
      const socket = io(currentUrl, {
        path: '/api/socket',
        transports: ['polling'], // 只使用 polling，避免 WebSocket 问题
        autoConnect: false, // 手动控制连接
        timeout: 10000,
      });

      // 4. 设置事件监听器
      socket.on('connect', () => {
        addLog('✅ 连接成功!');
        addLog(`Socket ID: ${socket.id}`);
        setStatus('连接成功');

        // 测试加入聊天室
        socket.emit('join-chat', {
          id: 666,
          username: 'simpletest',
          displayName: '简单测试用户',
        });
      });

      socket.on('connect_error', (error) => {
        addLog(`❌ 连接失败: ${error?.message || '未知错误'}`);
        setStatus('连接失败');
      });

      socket.on('users-updated', (users) => {
        addLog(`👥 收到用户列表: ${users.length} 个用户`);
      });

      // 5. 手动触发连接
      addLog('开始连接...');
      socket.connect();

      // 6. 设置超时
      setTimeout(() => {
        if (!socket.connected) {
          addLog('⏰ 连接超时');
          setStatus('连接超时');
          socket.close();
        }
      }, 10000);
    } catch (error) {
      addLog(`❌ 测试异常: ${(error as Error)?.message || '未知异常'}`);
      setStatus('测试异常');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">极简 Socket.IO 测试</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">连接状态:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === '连接成功'
                  ? 'bg-green-100 text-green-800'
                  : status === '连接失败' ||
                    status === '连接超时' ||
                    status === '测试异常'
                  ? 'bg-red-100 text-red-800'
                  : status === '测试中...'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {status}
            </span>
          </div>

          <button
            onClick={testBasicConnection}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
          >
            开始测试
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">测试日志</h2>
          <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">点击"开始测试"查看日志...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">环境信息</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              <strong>当前地址:</strong>{' '}
              {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </p>
            <p>
              <strong>预期连接:</strong>{' '}
              {typeof window !== 'undefined'
                ? window.location.origin + '/api/socket'
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
