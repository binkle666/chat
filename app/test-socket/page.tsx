'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export default function TestSocketPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = () => {
    addLog('🔧 开始测试连接...')
    
    // 清除之前的连接
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }

    const currentOrigin = window.location.origin
    addLog(`📍 当前地址: ${currentOrigin}`)
    
    // 检查环境变量
    const useCustomServer = process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
    addLog(`🔧 USE_CUSTOM_SERVER: ${useCustomServer}`)
    addLog(`🔧 SOCKET_URL: ${socketUrl}`)

    // 直接使用当前地址进行连接
    const testSocket = io(currentOrigin, {
      path: '/api/socket',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      forceNew: true,
      timeout: 10000,
      reconnection: false // 禁用重连以便更好地观察错误
    })

    addLog(`🚀 尝试连接到: ${currentOrigin}/api/socket`)

    testSocket.on('connect', () => {
      addLog('✅ 连接成功!')
      addLog(`🆔 Socket ID: ${testSocket.id}`)
      setConnected(true)
      
      // 测试加入聊天室
      testSocket.emit('join-chat', {
        id: 777,
        username: 'testuser',
        displayName: '测试用户777'
      })
    })

    testSocket.on('connect_error', (error: any) => {
      addLog(`❌ 连接失败: ${error.message}`)
      addLog(`❌ 错误类型: ${error.type || 'unknown'}`)
      addLog(`❌ 错误描述: ${error.description || 'none'}`)
      addLog(`❌ 传输方式: ${error.transport || 'unknown'}`)
      addLog(`❌ 完整错误: ${JSON.stringify(error, null, 2)}`)
    })

    testSocket.on('users-updated', (users) => {
      addLog(`👥 用户列表更新: ${users.map((u: any) => u.displayName).join(', ')}`)
    })

    testSocket.on('disconnect', (reason) => {
      addLog(`🔌 连接断开: ${reason}`)
      setConnected(false)
    })

    setSocket(testSocket)
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setConnected(false)
      addLog('🔌 手动断开连接')
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Socket.IO 连接测试</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={testConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              测试连接
            </button>
            <button
              onClick={disconnect}
              disabled={!connected}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              断开连接
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              清除日志
            </button>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {connected ? '已连接' : '未连接'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">连接日志</h2>
          <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">点击"测试连接"开始测试...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">调试信息</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>当前地址:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>USE_CUSTOM_SERVER:</strong> {process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER || 'undefined'}</p>
            <p><strong>SOCKET_URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'undefined'}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 