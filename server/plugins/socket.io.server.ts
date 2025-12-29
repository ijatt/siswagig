import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Message {
  content: string
  sender_id: number
  conversation_id: number
}

interface TypingData {
  user_id: number
  conversation_id: number
}

// Store socket server globally for use in other parts of the app
let globalSocketServer: SocketIOServer | null = null

export function getSocketServer() {
  return globalSocketServer
}

export default defineNitroPlugin((nitroApp) => {
  let socketServer: SocketIOServer | null = null

  const initSocket = () => {
    if (socketServer) return socketServer

    socketServer = new SocketIOServer(3001, {
      serveClient: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    })

    // Store globally
    globalSocketServer = socketServer

    socketServer.on('error', (err: any) => {
      console.error('Socket.IO error:', err)
      if (err.code === 'EADDRINUSE') {
        console.log('Port 3001 in use, retrying...')
        setTimeout(() => {
          socketServer = null
          initSocket()
        }, 1000)
      }
    })

    socketServer.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join user's personal room for notifications
      socket.on('join_user_room', (data: { user_id: number }) => {
        socket.join(`user_${data.user_id}`)
        console.log(`User ${data.user_id} joined their notification room`)
      })

      socket.on('leave_user_room', (data: { user_id: number }) => {
        socket.leave(`user_${data.user_id}`)
        console.log(`User ${data.user_id} left their notification room`)
      })

      socket.on('join_conversation', (data: { conversation_id: number; user_id: number }) => {
        socket.join(`conversation_${data.conversation_id}`)
        console.log(`User ${data.user_id} joined conversation ${data.conversation_id}`)
      })

      socket.on('leave_conversation', (data: { conversation_id: number; user_id: number }) => {
        socket.leave(`conversation_${data.conversation_id}`)
        console.log(`User ${data.user_id} left conversation ${data.conversation_id}`)
      })

      socket.on('send_message', async (message: Message) => {
        try {
          const savedMessage = await prisma.message.create({
            data: {
              content: message.content,
              sender_id: message.sender_id,
              conversation_id: message.conversation_id
            },
            include: {
              sender: {
                select: {
                  user_id: true,
                  name: true,
                  image_url: true,
                  role: true
                }
              }
            }
          })

          // Update conversation updated_at
          await prisma.conversation.update({
            where: { conversation_id: message.conversation_id },
            data: { updated_at: new Date() }
          })

          // Get conversation participants to send notification
          const conversation = await prisma.conversation.findUnique({
            where: { conversation_id: message.conversation_id },
            select: { participant1_id: true, participant2_id: true }
          })

          if (conversation) {
            // Determine recipient (the other participant)
            const recipientId = conversation.participant1_id === message.sender_id 
              ? conversation.participant2_id 
              : conversation.participant1_id

            if (recipientId) {
              // Create notification for recipient
              const notification = await prisma.notification.create({
                data: {
                  user_id: recipientId,
                  type: 'message',
                  title: 'New Message',
                  message: `${savedMessage.sender.name} sent you a message`,
                  link: `/inbox?conversationId=${message.conversation_id}`
                }
              })

              // Emit notification to recipient's room
              socketServer?.to(`user_${recipientId}`).emit('new-notification', notification)
            }
          }

          // Emit to conversation room
          socketServer?.to(`conversation_${message.conversation_id}`).emit('new_message', savedMessage)
          console.log('Message saved and broadcasted')
        } catch (err) {
          console.error('Error saving message:', err)
          socket.emit('error', 'Failed to save message')
        }
      })

      socket.on('is_typing', (data: TypingData) => {
        socketServer?.to(`conversation_${data.conversation_id}`).emit('user_typing', data)
      })

      socket.on('stop_typing', (data: TypingData) => {
        socketServer?.to(`conversation_${data.conversation_id}`).emit('user_stopped_typing', data)
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })

    return socketServer
  }

  // Initialize socket server
  initSocket()
})
