# 聊天室项目

一个基于 Next.js 和 Socket.IO 的实时聊天应用，支持最多两个用户同时在线聊天。

## 功能特点

- 🔐 硬编码用户登录系统
- 💬 实时聊天功能
- 👥 最多支持两个用户同时在线
- 📱 响应式设计
- 🎨 现代化 UI 界面

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS
- **实时通信**: Socket.IO
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

#### 方式一：自定义服务器（推荐，功能完整）

```bash
npm run dev
```

#### 方式二：标准 Next.js 模式（Vercel 兼容测试）

```bash
npm run dev:vercel
```

#### 方式三：自动检测模式

```bash
npm run dev:auto
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建

#### 本地生产环境

```bash
npm run build
npm run start
```

#### Vercel 兼容模式

```bash
npm run build
npm run start:vercel
```

## 测试账号

项目内置了以下测试账号：

| 用户名 | 密码      | 显示名 |
| ------ | --------- | ------ |
| user1  | password1 | 用户一 |
| user2  | password2 | 用户二 |
| admin  | admin123  | 管理员 |
| guest  | guest123  | 访客   |

## 使用说明

1. **登录**: 使用上述任意账号登录系统
2. **聊天**: 最多支持两个用户同时在线聊天
3. **限制**: 当聊天室满员时，新用户将无法加入
4. **实时**: 消息实时同步，支持查看在线用户

## 项目结构

```
chat/
├── app/                    # Next.js App Router
│   ├── chat/              # 聊天页面
│   ├── login/             # 登录页面
│   └── globals.css        # 全局样式
├── lib/                   # 工具函数
│   ├── auth.ts            # 认证相关
│   ├── socket.ts          # Socket.IO 客户端
│   └── config.ts          # 环境配置管理
├── pages/api/             # API 路由（Vercel 兼容）
│   └── socket.ts          # Socket.IO API 路由
├── scripts/               # 工具脚本
│   └── start.js          # 智能启动脚本
├── server.js              # 自定义 Socket.IO 服务器
├── vercel.json           # Vercel 部署配置
└── package.json          # 项目配置
```

## 环境配置

### 环境变量说明

| 变量名                          | 本地开发                | Vercel 部署                   | 说明                 |
| ------------------------------- | ----------------------- | ----------------------------- | -------------------- |
| `NEXT_PUBLIC_USE_CUSTOM_SERVER` | `true`                  | `false`                       | 是否使用自定义服务器 |
| `NEXT_PUBLIC_SOCKET_URL`        | `http://localhost:3000` | `https://your-app.vercel.app` | Socket.IO 连接地址   |
| `NODE_ENV`                      | `development`           | `production`                  | 运行环境             |

### 本地环境变量文件

创建 `.env.local` 文件：

```bash
# 本地开发环境配置
NODE_ENV=development
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_USE_CUSTOM_SERVER=true
PORT=3000
```

## 部署

### Vercel 部署（推荐）

1. **准备代码**

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **在 Vercel 中设置环境变量**

   - `NEXT_PUBLIC_USE_CUSTOM_SERVER=false`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-app-name.vercel.app`

3. **连接到 Vercel**

   - 将 GitHub 仓库连接到 Vercel
   - Vercel 会自动检测 Next.js 项目并使用合适的构建设置

4. **部署**
   - Vercel 会自动构建和部署
   - 项目将使用 API 路由模式的 Socket.IO

### 其他平台部署

#### 支持 Node.js 自定义服务器的平台

如 Railway、Render、DigitalOcean 等：

```bash
# 环境变量设置
NEXT_PUBLIC_USE_CUSTOM_SERVER=true
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
NODE_ENV=production

# 启动命令
npm run start
```

#### 无服务器平台

如 Netlify Functions、AWS Lambda 等：

```bash
# 环境变量设置
NEXT_PUBLIC_USE_CUSTOM_SERVER=false
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com

# 构建命令
npm run build

# 启动命令（如适用）
npm run start:vercel
```

## 开发说明

### 数据存储

- **本地开发**：聊天记录存储在自定义服务器内存中，重启后会丢失
- **Vercel 部署**：由于无服务器特性，每次函数调用间状态会重置

### 配置说明

- 用户信息硬编码在 `lib/auth.ts` 中
- 最大在线用户数配置在 `server.js` 和 `pages/api/socket.ts` 中 (MAX_USERS = 2)
- Socket.IO 配置在 `lib/config.ts` 中管理

### 运行模式

- **自定义服务器模式**：使用 `server.js`，支持完整的 WebSocket 连接
- **API 路由模式**：使用 `pages/api/socket.ts`，主要依赖 polling 传输

### 环境检测

项目会根据 `NEXT_PUBLIC_USE_CUSTOM_SERVER` 环境变量自动选择合适的 Socket.IO 配置。

## License

MIT
