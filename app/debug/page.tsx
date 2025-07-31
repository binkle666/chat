'use client';

import { useEffect, useState } from 'react';
import { config, getSocketConfig } from '@/lib/config';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [socketConfig, setSocketConfig] = useState<any>({});

  useEffect(() => {
    // 获取环境变量
    const env = {
      NEXT_PUBLIC_USE_CUSTOM_SERVER: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER,
      NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
    };
    setEnvVars(env);

    // 获取 Socket 配置
    const socketCfg = getSocketConfig();
    setSocketConfig(socketCfg);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">调试信息页面</h1>

      <div className="space-y-8">
        {/* 环境变量 */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">环境变量</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </section>

        {/* 配置信息 */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">应用配置</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </section>

        {/* Socket 配置 */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Socket.IO 配置</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(socketConfig, null, 2)}
          </pre>
        </section>

        {/* 浏览器信息 */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">浏览器信息</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(
              {
                origin:
                  typeof window !== 'undefined'
                    ? window.location.origin
                    : 'N/A',
                hostname:
                  typeof window !== 'undefined'
                    ? window.location.hostname
                    : 'N/A',
                protocol:
                  typeof window !== 'undefined'
                    ? window.location.protocol
                    : 'N/A',
                userAgent:
                  typeof navigator !== 'undefined'
                    ? navigator.userAgent
                    : 'N/A',
              },
              null,
              2,
            )}
          </pre>
        </section>

        {/* 快速测试 */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">快速测试</h2>
          <div className="space-y-4">
            <div>
              <strong>预期行为:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>生产环境: useCustomServer 应该为 false</li>
                <li>生产环境: socketUrl 应该使用当前域名</li>
                <li>生产环境: path 应该是 '/api/socket'</li>
                <li>生产环境: transports 应该只有 ['polling']</li>
              </ul>
            </div>

            <div className="mt-4">
              <a
                href="/chat"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                返回聊天页面
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
