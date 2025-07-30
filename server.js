const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// 聊天室状态
const connectedUsers = new Map()
const messages = []
const MAX_USERS = 2

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('用户连接:', socket.id)

    // 用户加入聊天室
    socket.on('join-chat', (user) => {
      console.log('用户加入聊天室:', user)
      
      // 检查是否达到最大用户数
      if (connectedUsers.size >= MAX_USERS) {
        // 检查是否是已存在的用户重新连接
        const existingUser = Array.from(connectedUsers.values()).find(u => u.id === user.id)
        if (!existingUser) {
          socket.emit('room-full', { message: '聊天室已满，最多只能有两个用户在线' })
          return
        }
      }

      // 如果用户已经在线，更新socket ID
      const existingUser = Array.from(connectedUsers.values()).find(u => u.id === user.id)
      if (existingUser) {
        // 移除旧的连接
        const oldSocketId = Array.from(connectedUsers.entries())
          .find(([_, u]) => u.id === user.id)?.[0]
        if (oldSocketId) {
          connectedUsers.delete(oldSocketId)
        }
      }

      // 添加新用户
      connectedUsers.set(socket.id, { ...user, socketId: socket.id })
      socket.join('chat-room')
      
      // 发送当前在线用户列表
      const userList = Array.from(connectedUsers.values())
      io.to('chat-room').emit('users-updated', userList)
      
      // 发送历史消息
      socket.emit('message-history', messages)
      
      // 通知其他用户有新用户加入
      socket.to('chat-room').emit('user-joined', {
        user: { ...user, socketId: socket.id },
        message: `${user.displayName} 加入了聊天室`
      })

      console.log('当前在线用户:', userList.map(u => u.displayName))
    })

    // 发送消息
    socket.on('send-message', (data) => {
      const user = connectedUsers.get(socket.id)
      if (!user) {
        console.log('未找到用户:', socket.id)
        return
      }

      const message = {
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        content: data.content,
        timestamp: new Date()
      }

      messages.push(message)
      
      // 只保留最近100条消息
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100)
      }

      console.log('新消息:', message.displayName, ':', message.content)
      io.to('chat-room').emit('new-message', message)
    })

    // 用户断开连接
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id)
      if (user) {
        connectedUsers.delete(socket.id)
        
        console.log('用户离开:', user.displayName)
        
        // 通知其他用户有用户离开
        socket.to('chat-room').emit('user-left', {
          user,
          message: `${user.displayName} 离开了聊天室`
        })
        
        // 更新在线用户列表
        const userList = Array.from(connectedUsers.values())
        io.to('chat-room').emit('users-updated', userList)
        
        console.log('当前在线用户:', userList.map(u => u.displayName))
      }
      console.log('用户断开连接:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
}) 