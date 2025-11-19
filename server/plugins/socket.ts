import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler((event) => {
  // Get or create Socket.IO instance
  if (!(global as any)._socketIO) {
    const server = createServer()
    
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    const activeConversations = new Map<number, Set<number>>()

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`)

      socket.on('join_conversation', async (data) => {
        const { conversation_id, user_id } = data
        socket.join(`conversation_${conversation_id}`)

        if (!activeConversations.has(conversation_id)) {
          activeConversations.set(conversation_id, new Set())
        }
        activeConversations.get(conversation_id)?.add(user_id)

        io.to(`conversation_${conversation_id}`).emit('user_joined', {
          user_id,
          conversation_id,
          activeUsers: Array.from(activeConversations.get(conversation_id) || [])
        })
      })

      socket.on('leave_conversation', (data) => {
        const { conversation_id, user_id } = data
        socket.leave(`conversation_${conversation_id}`)
        activeConversations.get(conversation_id)?.delete(user_id)

        io.to(`conversation_${conversation_id}`).emit('user_left', {
          conversation_id,
          activeUsers: Array.from(activeConversations.get(conversation_id) || [])
        })
      })

      socket.on('send_message', async (data) => {
        try {
          const { conversation_id, content, sender_id } = data

          const message = await prisma.message.create({
            data: {
              conversation_id,
              sender_id,
              content
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

          await prisma.conversation.update({
            where: { conversation_id },
            data: { updated_at: new Date() }
          })

          io.to(`conversation_${conversation_id}`).emit('new_message', message)
        } catch (err) {
          console.error('Error sending message:', err)
          socket.emit('error', 'Failed to send message')
        }
      })

      socket.on('mark_as_read', async (data) => {
        try {
          const { message_id, conversation_id } = data

          const message = await prisma.message.update({
            where: { message_id },
            data: { is_read: true },
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

          io.to(`conversation_${conversation_id}`).emit('message_read', message)
        } catch (err) {
          console.error('Error marking as read:', err)
        }
      })

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
      })
    })

    ;(global as any)._socketIO = io
  }
})
