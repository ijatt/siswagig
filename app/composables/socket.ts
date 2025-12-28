import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null

export const useSocket = () => {
  const isConnected = ref(false)
  const messages = ref<any[]>([])
  const typingUsers = ref<Set<number>>(new Set())

  const initSocket = () => {
    if (socket && socket.connected) {
      return socket
    }

    // Connect to Socket.IO server on port 3001
    socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      auth: {
        token: useMyTokenStore().accessToken
      }
    })

    socket.on('connect', () => {
      isConnected.value = true
      console.log('Socket connected:', socket?.id)
    })

    socket.on('disconnect', () => {
      isConnected.value = false
      console.log('Socket disconnected')
    })

    socket.on('new_message', (data) => {
      messages.value.push(data)
      console.log('New message received:', data)
    })

    socket.on('user_typing', (data: { user_id: number; conversation_id: number }) => {
      typingUsers.value.add(data.user_id)
      console.log('User typing:', data.user_id)
    })

    socket.on('user_stopped_typing', (data: { user_id: number; conversation_id: number }) => {
      typingUsers.value.delete(data.user_id)
      console.log('User stopped typing:', data.user_id)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    return socket
  }

  const sendMessage = async (conversationId: number, content: string) => {
    const user = userStore()
    if (socket && socket.connected) {
      socket.emit('send_message', {
        content,
        sender_id: user.user?.user_id || 0,
        conversation_id: conversationId
      })
    } else {
      // Fallback to API if socket not connected
      try {
        const token = useMyTokenStore().accessToken
        const response = await $fetch(`/api/messages/${conversationId}`, {
          method: 'POST' as any,
          headers: {
            authorization: `Bearer ${token}`
          },
          body: { content }
        })
        return response
      } catch (err) {
        console.error('Failed to send message:', err)
        throw err
      }
    }
  }

  const joinConversation = (conversationId: number) => {
    const user = userStore()
    if (socket && socket.connected) {
      socket.emit('join_conversation', {
        conversation_id: conversationId,
        user_id: user.user?.user_id || 0
      })
    }
  }

  const leaveConversation = (conversationId: number) => {
    const user = userStore()
    if (socket && socket.connected) {
      socket.emit('leave_conversation', {
        conversation_id: conversationId,
        user_id: user.user?.user_id || 0
      })
    }
  }

  const startTyping = (conversationId: number) => {
    const user = userStore()
    if (socket && socket.connected) {
      socket.emit('is_typing', {
        conversation_id: conversationId,
        user_id: user.user?.user_id || 0
      })
    }
  }

  const stopTyping = (conversationId: number) => {
    const user = userStore()
    if (socket && socket.connected) {
      socket.emit('stop_typing', {
        conversation_id: conversationId,
        user_id: user.user?.user_id || 0
      })
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
    }
  }

  return {
    isConnected,
    messages,
    typingUsers,
    initSocket,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    disconnect
  }
}
