import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null

// Shared state - must be outside the composable function to be shared across components
const isConnected = ref(false)
const messages = ref<any[]>([])
const typingUsers = ref<Set<number>>(new Set())
let isInitialized = false

// Get Socket.IO URL based on environment
const getSocketUrl = () => {
  // In browser, connect to same origin (works for both dev and production)
  if (typeof window !== 'undefined') {
    // Use APP_URL from runtime config, or fallback to window.location.origin
    const config = useRuntimeConfig()
    return config.public.APP_URL || window.location.origin
  }
  return 'http://localhost:3000'
}

export const useSocket = () => {
  const initSocket = () => {
    if (socket && socket.connected) {
      return socket
    }

    // Prevent duplicate event listeners
    if (isInitialized && socket) {
      return socket
    }

    // Connect to Socket.IO server on same origin (works on App Platform)
    const socketUrl = getSocketUrl()
    socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
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

    isInitialized = true
    return socket
  }

  // Join user's personal room for notifications
  const joinUserRoom = (userId: number) => {
    if (socket && socket.connected) {
      socket.emit('join_user_room', { user_id: userId })
      console.log('Joined user room for notifications:', userId)
    }
  }

  const leaveUserRoom = (userId: number) => {
    if (socket && socket.connected) {
      socket.emit('leave_user_room', { user_id: userId })
    }
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
      isInitialized = false
    }
  }

  // Get the raw socket instance for direct event handling
  const getSocket = () => socket

  return {
    isConnected,
    messages,
    typingUsers,
    initSocket,
    getSocket,
    sendMessage,
    joinConversation,
    leaveConversation,
    joinUserRoom,
    leaveUserRoom,
    startTyping,
    stopTyping,
    disconnect
  }
}
