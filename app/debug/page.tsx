'use client';

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_USE_CUSTOM_SERVER: process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  const clientInfo = {
    'window.location.origin':
      typeof window !== 'undefined' ? window.location.origin : 'N/A',
    'window.location.hostname':
      typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    'window.location.port':
      typeof window !== 'undefined' ? window.location.port : 'N/A',
    'window.location.protocol':
      typeof window !== 'undefined' ? window.location.protocol : 'N/A',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">环境变量调试</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">环境变量</h2>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono text-sm text-gray-600">
                    {key}:
                  </span>
                  <span className="font-mono text-sm text-blue-600">
                    {value || 'undefined'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">客户端信息</h2>
            <div className="space-y-2">
              {Object.entries(clientInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono text-sm text-gray-600">
                    {key}:
                  </span>
                  <span className="font-mono text-sm text-green-600">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">连接配置推荐</h3>
          <div className="text-sm text-blue-700">
            <p>
              <strong>当前应该使用:</strong>
            </p>
            <p>
              URL:{' '}
              {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
            </p>
            <p>
              Path:{' '}
              {process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER === 'true'
                ? '(默认)'
                : '/api/socket'}
            </p>
            <p>
              Mode:{' '}
              {process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER === 'true'
                ? '自定义服务器'
                : 'API 路由'}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <a
            href="/test-socket"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            测试 Socket.IO 连接
          </a>
          <a
            href="/chat"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ml-2"
          >
            进入聊天室
          </a>
          <a
            href="/login"
            className="inline-block bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded ml-2"
          >
            登录页面
          </a>
        </div>
      </div>
    </div>
  );
}
