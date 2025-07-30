#!/usr/bin/env node

/**
 * 智能启动脚本
 * 根据环境变量自动选择使用自定义服务器还是 Next.js 标准模式
 */

const { spawn } = require('child_process');
const path = require('path');

// 检查环境变量
const useCustomServer = process.env.NEXT_PUBLIC_USE_CUSTOM_SERVER === 'true';
const isDev = process.env.NODE_ENV !== 'production';

console.log('🚀 环境检测结果:');
console.log(`   - 环境: ${isDev ? '开发' : '生产'}`);
console.log(`   - 使用自定义服务器: ${useCustomServer ? '是' : '否'}`);
console.log(`   - Socket.IO URL: ${process.env.NEXT_PUBLIC_SOCKET_URL || '默认'}`);

let command, args;

if (useCustomServer) {
  // 使用自定义服务器（本地开发）
  command = 'node';
  args = ['server.js'];
  console.log('🔧 启动自定义 Socket.IO 服务器...');
} else {
  // 使用标准 Next.js（Vercel 兼容）
  command = 'next';
  args = isDev ? ['dev'] : ['start'];
  console.log('⚡ 启动标准 Next.js 服务器...');
}

// 启动服务器
const child = spawn(command, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('close', (code) => {
  console.log(`服务器进程退出，代码: ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('启动服务器时出错:', error);
  process.exit(1);
}); 