#!/usr/bin/env node

console.log('🚀 Vercel 模式完整测试\n');

console.log('1️⃣ 检查服务器状态...');
const http = require('http');

// 检查服务器是否运行
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Next.js 服务器正在运行');
        resolve(true);
      } else {
        reject(new Error(`服务器返回状态码: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
};

// 检查 API 路由
const checkApiRoute = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/api/socket', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          // Socket.IO API 路由会返回 "Transport unknown" 这是正常的
          if (result.message === 'Transport unknown' || result.success) {
            console.log('✅ Socket.IO API 路由响应正常');
            resolve(true);
          } else {
            console.log('⚠️ API 路由响应:', result);
            resolve(true); // 仍然继续测试
          }
        } catch (e) {
          console.log('⚠️ API 响应解析失败，但这可能是正常的');
          resolve(true); // 继续测试实际的 Socket.IO 连接
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('API 请求超时'));
    });
  });
};

// 测试 Socket.IO 连接
const testSocketConnection = () => {
  return new Promise((resolve, reject) => {
    const { io } = require('socket.io-client');
    
    console.log('2️⃣ 测试 Socket.IO 连接...');
    
    const socket = io('http://localhost:3001', {
      path: '/api/socket',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      timeout: 10000,
      forceNew: true
    });

    let connected = false;

    socket.on('connect', () => {
      console.log('✅ Socket.IO 连接成功');
      console.log('   Socket ID:', socket.id);
      connected = true;
      
      // 测试聊天功能
      socket.emit('join-chat', {
        id: 888,
        username: 'testuser',
        displayName: '测试用户888'
      });
    });

    socket.on('users-updated', (users) => {
      console.log('✅ 收到用户列表更新');
      console.log('   在线用户:', users.map(u => u.displayName));
      
      setTimeout(() => {
        socket.disconnect();
        resolve(true);
      }, 1000);
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Socket.IO 连接失败');
      console.log('   错误:', error.message);
      reject(error);
    });

    // 10秒超时
    setTimeout(() => {
      if (!connected) {
        socket.disconnect();
        reject(new Error('连接超时'));
      }
    }, 10000);
  });
};

// 运行所有测试
async function runTests() {
  try {
    await checkServer();
    await checkApiRoute();
    await testSocketConnection();
    
    console.log('\n🎉 所有测试通过！Vercel 模式运行正常');
    console.log('\n📝 接下来你可以:');
    console.log('   1. 在浏览器中访问 http://localhost:3001');
    console.log('   2. 登录并测试聊天功能');
    console.log('   3. 如果还有问题，检查浏览器开发者控制台');
    
  } catch (error) {
    console.log('\n❌ 测试失败:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('   1. 确保运行了 npm run dev:vercel');
    console.log('   2. 检查端口 3001 是否被占用');
    console.log('   3. 重启开发服务器');
  }
  
  process.exit(0);
}

runTests(); 