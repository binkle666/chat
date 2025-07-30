#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证环境配置和依赖是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 部署前检查...\n');

// 检查必要文件
const requiredFiles = [
  'package.json',
  'next.config.js',
  'vercel.json',
  'pages/api/socket.ts',
  'lib/config.ts',
  'server.js'
];

let hasErrors = false;

console.log('📁 检查必要文件:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (缺失)`);
    hasErrors = true;
  }
});

// 检查环境变量
console.log('\n🔧 检查环境配置:');
const envVars = [
  'NEXT_PUBLIC_USE_CUSTOM_SERVER',
  'NEXT_PUBLIC_SOCKET_URL'
];

envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: ${value}`);
  } else {
    console.log(`   ⚠️  ${envVar}: 未设置（将使用默认值）`);
  }
});

// 检查 package.json 脚本
console.log('\n📦 检查 package.json 脚本:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'dev:vercel', 'build', 'start', 'start:vercel'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`   ✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`   ❌ ${script}: 缺失`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('   ❌ 无法读取 package.json');
  hasErrors = true;
}

// 检查依赖
console.log('\n🔌 检查关键依赖:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['next', 'react', 'socket.io', 'socket.io-client'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: 缺失`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('   ❌ 无法检查依赖');
  hasErrors = true;
}

// 总结
console.log('\n📊 检查结果:');
if (hasErrors) {
  console.log('   ❌ 发现问题，请修复后再部署');
  process.exit(1);
} else {
  console.log('   ✅ 所有检查通过，可以部署');
}

console.log('\n🚀 部署建议:');
console.log('   - 本地测试: npm run dev');
console.log('   - Vercel 测试: npm run dev:vercel');
console.log('   - 构建测试: npm run build');
console.log('   - 部署到 Vercel: 推送到 GitHub 并连接 Vercel');

console.log('\n📝 Vercel 环境变量设置:');
console.log('   NEXT_PUBLIC_USE_CUSTOM_SERVER=false');
console.log('   NEXT_PUBLIC_SOCKET_URL=https://your-app-name.vercel.app'); 