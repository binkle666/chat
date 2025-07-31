const { io } = require('socket.io-client');

async function testSocketConnection() {
  console.log('🔧 开始测试 Socket.IO 连接...\n');

  // 测试本地连接
  console.log('📍 测试 1: 本地连接');
  const localSocket = io('http://localhost:3000', {
    path: '/api/socket',
    transports: ['polling'],
    timeout: 10000,
  });

  localSocket.on('connect', () => {
    console.log('✅ 本地连接成功:', localSocket.id);
    localSocket.disconnect();
  });

  localSocket.on('connect_error', (error) => {
    console.log('❌ 本地连接失败:', error.message);
  });

  // 等待连接
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 测试生产环境连接
  console.log('\n📍 测试 2: 生产环境连接');
  const prodSocket = io('https://chat-iota-blue.vercel.app', {
    path: '/api/socket',
    transports: ['polling'],
    timeout: 15000,
  });

  prodSocket.on('connect', () => {
    console.log('✅ 生产环境连接成功:', prodSocket.id);
    prodSocket.disconnect();
  });

  prodSocket.on('connect_error', (error) => {
    console.log('❌ 生产环境连接失败:', error.message);
  });

  // 等待连接
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n🏁 测试完成');
  process.exit(0);
}

// 运行测试
testSocketConnection().catch(console.error); 