#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🧪 测试 Socket.IO 连接...\n');

// 测试 Vercel 模式连接
console.log('📡 测试 Vercel API 路由模式...');
const socket = io('http://localhost:3001', {
  path: '/api/socket',
  transports: ['polling'],
  autoConnect: true,
  timeout: 10000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('✅ Vercel 模式连接成功!');
  console.log('   Socket ID:', socket.id);
  
  // 测试加入聊天室
  socket.emit('join-chat', {
    id: 999,
    username: 'test',
    displayName: '测试用户'
  });
});

socket.on('connect_error', (error) => {
  console.log('❌ Vercel 模式连接失败:');
  console.log('   错误:', error.message);
  console.log('   类型:', error.type || 'unknown');
  console.log('   描述:', error.description || 'none');
});

socket.on('users-updated', (users) => {
  console.log('👥 用户列表更新:', users);
});

socket.on('room-full', (data) => {
  console.log('🚫 聊天室已满:', data.message);
});

// 5秒后断开连接
setTimeout(() => {
  console.log('\n🔌 断开连接...');
  socket.disconnect();
  process.exit(0);
}, 5000); 