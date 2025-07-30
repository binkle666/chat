# 🚀 Vercel 部署指南

## 📋 部署清单

✅ 代码已提交到本地 Git  
⏳ 推送到 GitHub  
⏳ 设置 Vercel 项目  
⏳ 配置环境变量  
⏳ 部署验证

---

## 第一步：创建 GitHub 仓库

1. 访问 [GitHub.com](https://github.com/new)
2. 创建新仓库：

   - **Repository name**: `chat-room` (或您喜欢的名字)
   - **Description**: `实时聊天室 - 支持两人在线聊天`
   - **Public** (推荐) 或 **Private**
   - **不要** 勾选 "Add a README file" (我们已经有了)
   - 点击 **Create repository**

3. 复制仓库 URL (类似 `https://github.com/your-username/chat-room.git`)

## 第二步：推送代码到 GitHub

在终端中运行以下命令 (替换为您的仓库 URL)：

```bash
# 添加远程仓库 (替换为您的 URL)
git remote add origin https://github.com/YOUR-USERNAME/chat-room.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第三步：部署到 Vercel

### 3.1 登录 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录

### 3.2 导入项目

1. 点击 **"New Project"**
2. 找到您刚创建的 `chat-room` 仓库
3. 点击 **"Import"**

### 3.3 配置项目设置

**重要：** 在部署前，请配置以下设置：

#### 🔧 环境变量 (Environment Variables)

在 Vercel 项目设置中添加：

| 变量名                          | 值                                 |
| ------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_USE_CUSTOM_SERVER` | `false`                            |
| `NEXT_PUBLIC_SOCKET_URL`        | `https://YOUR-APP-NAME.vercel.app` |

**注意：** `YOUR-APP-NAME` 将是 Vercel 自动生成的域名

#### ⚙️ 构建设置

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (默认)
- **Output Directory**: `.next` (默认)
- **Install Command**: `npm install` (默认)

### 3.4 部署

1. 点击 **"Deploy"**
2. 等待构建完成 (约 2-3 分钟)
3. 部署成功后会显示您的应用 URL

## 第四步：更新 Socket URL 环境变量

部署成功后：

1. 复制 Vercel 提供的应用 URL (如 `https://chat-room-abc123.vercel.app`)
2. 回到 Vercel 项目设置 → Environment Variables
3. 更新 `NEXT_PUBLIC_SOCKET_URL` 为实际的应用 URL
4. 重新部署项目 (Deployments → ... → Redeploy)

## 第五步：验证部署

访问您的应用并测试：

1. **主页**: `https://your-app.vercel.app`
2. **调试页面**: `https://your-app.vercel.app/debug`
3. **测试连接**: `https://your-app.vercel.app/simple-test`
4. **聊天室**: `https://your-app.vercel.app/chat`

### ✅ 测试清单

- [ ] 页面能正常加载
- [ ] 可以登录 (测试账号: user1/password1)
- [ ] Socket.IO 连接成功
- [ ] 可以发送和接收消息
- [ ] 用户状态正确显示

---

## 🔧 故障排除

### 问题 1: 连接失败

- 检查环境变量 `NEXT_PUBLIC_SOCKET_URL` 是否正确
- 确保 URL 是 HTTPS 而不是 HTTP

### 问题 2: 构建失败

- 检查 package.json 依赖版本
- 查看 Vercel 构建日志

### 问题 3: 功能异常

- 查看浏览器开发者控制台
- 检查 Vercel 函数日志

---

## 🎯 测试账号

| 用户名 | 密码      | 显示名 |
| ------ | --------- | ------ |
| user1  | password1 | 用户一 |
| user2  | password2 | 用户二 |
| admin  | admin123  | 管理员 |
| guest  | guest123  | 访客   |

---

## 📱 功能特性

- ✅ 支持最多 2 人同时在线
- ✅ 实时消息传递
- ✅ 用户状态显示
- ✅ 单用户也可发送消息
- ✅ 响应式设计
- ✅ 硬编码用户认证

---

## 🚀 下一步优化建议

1. **自定义域名**: 在 Vercel 中绑定自己的域名
2. **数据持久化**: 集成数据库保存聊天记录
3. **用户系统**: 实现真实的用户注册登录
4. **文件传输**: 支持图片和文件分享
5. **消息功能**: 添加表情、回复、删除等功能

---

**🎉 恭喜！您的聊天室应用即将上线！**
