import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null

export const useSocket = () => {
  const isConnected = ref(false)
  const messages = ref<any[]>([])

  const initSocket = () => {
    if (socket && socket.connected) return socket

    const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
    const host = window.location.hostname
    const port = window.location.port

    socket = io(`${protocol}://${host}:${port || (protocol === 'https' ? 443 : 80)}`, {
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
    })

    socket.on('message_read', (data) => {
      const index = messages.value.findIndex(m => m.message_id === data.message_id)
      if (index !== -1) {
        messages.value[index].is_read = true
      }
    })

    socket.on('user_joined', (data) => {
      console.log('User joined conversation:', data)
    })

    socket.on('user_left', (data) => {
      console.log('User left conversation:', data)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    return socket
  }

  const sendMessage = (conversationId: number, content: string) => {
    if (socket && socket.connected) {
      const user = userStore()
      socket.emit('send_message', {
        conversation_id: conversationId,
        content,
        sender_id: user.user?.user_id || 0
      })
    }
  }

  const joinConversation = (conversationId: number) => {
    if (socket && socket.connected) {
      const user = userStore()
      socket.emit('join_conversation', {
        conversation_id: conversationId,
        user_id: user.user?.user_id || 0
      })
    }
  }

  const leaveConversation = (conversationId: number) => {
    if (socket && socket.connected) {
      const user = userStore()
      socket.emit('leave_conversation', {
        conversation_id: conversationId,
        user_id: user.user?.user_id || 0
      })
    }
  }

  const markAsRead = (messageId: number, conversationId: number) => {
    if (socket && socket.connected) {
      socket.emit('mark_as_read', {
        message_id: messageId,
        conversation_id: conversationId
      })
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  return {
    isConnected,
    messages,
    initSocket,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    disconnect
  }
}
