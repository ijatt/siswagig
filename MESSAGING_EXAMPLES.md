# Messaging System - Code Examples

## Starting a Conversation

### From a User Profile Page
```ts
// pages/freelancer/[id].vue
const startConversation = async (userId: number) => {
  try {
    const conversation = await $fetch('/api/conversations', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      },
      body: {
        participant1_id: currentUserId,
        participant2_id: userId
      }
    })
    
    // Navigate to inbox with that conversation
    await navigateTo(`/inbox?conversation=${conversation.conversation_id}`)
  } catch (err) {
    console.error('Failed to start conversation:', err)
  }
}
```

### Add Message Button to Profile Card
```vue
<template>
  <div class="profile-card">
    <!-- Other profile info -->
    <UButton 
      @click="startConversation(user.user_id)"
      color="primary"
    >
      <UIcon name="i-heroicons-envelope" />
      Message
    </UButton>
  </div>
</template>
```

## Accessing Stored User ID

### From User Store
```ts
import { userStore } from '~/stores/user'

const user = userStore()
const userId = user.user?.user_id  // Access user ID

// Or destructure
const { user: userData } = userStore()
const id = userData?.user_id
```

### In Composables
```ts
export const useMessaging = () => {
  const getCurrentUserId = () => {
    const user = userStore()
    return user.user?.user_id || 0
  }
  
  return { getCurrentUserId }
}
```

## Socket.IO Event Handling

### Listen for New Messages
```ts
const { messages } = useSocket()

watch(() => messages.value, (newMessages) => {
  console.log('New messages received:', newMessages)
  // Update UI, notifications, etc.
})
```

### Custom Event Handlers
```ts
// In composable
const socket = initSocket()

socket?.on('user_joined', (data) => {
  console.log(`User ${data.user_id} joined conversation ${data.conversation_id}`)
  // Update active users list
})

socket?.on('user_left', (data) => {
  console.log(`User left conversation ${data.conversation_id}`)
  // Remove from active users
})
```

## Sending Messages Programmatically

### Via API Only (No Socket)
```ts
const sendMessageViaAPI = async (
  conversationId: number,
  content: string,
  userId: number
) => {
  const message = await $fetch(
    `/api/messages/${conversationId}`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      },
      body: {
        content,
        sender_id: userId
      }
    }
  )
  
  return message
}
```

### Via Socket (Recommended)
```ts
const { sendMessage } = useSocket()

// Simply emit the event
// The server will handle saving to database
sendMessage(conversationId, 'Hello!')

// Message appears via Socket event 'new_message'
```

## Loading Conversations

### Get All User Conversations
```ts
const loadUserConversations = async (userId: number) => {
  try {
    const conversations = await $fetch<any[]>(
      `/api/conversations/${userId}`,
      {
        headers: {
          authorization: `Bearer ${useMyTokenStore().accessToken}`
        }
      }
    )
    
    return conversations || []
  } catch (err) {
    console.error('Failed to load conversations:', err)
    return []
  }
}
```

### Usage in Component
```ts
onMounted(async () => {
  const user = userStore()
  const conversations = await loadUserConversations(
    user.user?.user_id || 0
  )
  
  // Process conversations...
})
```

## Message Management

### Mark Message as Read
```ts
const markMessageRead = async (messageId: number, conversationId: number) => {
  const { markAsRead } = useSocket()
  
  // Via Socket (recommended for real-time)
  markAsRead(messageId, conversationId)
  
  // Or via API if needed
  await $fetch(`/api/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${useMyTokenStore().accessToken}`
    },
    body: { is_read: true }
  })
}
```

### Get All Messages in Conversation
```ts
const getConversationMessages = async (conversationId: number) => {
  try {
    const messages = await $fetch<any[]>(
      `/api/messages/${conversationId}`,
      {
        headers: {
          authorization: `Bearer ${useMyTokenStore().accessToken}`
        }
      }
    )
    
    return messages || []
  } catch (err) {
    console.error('Failed to load messages:', err)
    return []
  }
}
```

## Real-Time Presence

### Track Active Users in Conversation
```ts
const activeUsers = ref<number[]>([])

const { initSocket } = useSocket()

onMounted(() => {
  const socket = initSocket()
  
  // Join conversation
  socket?.emit('join_conversation', {
    conversation_id: conversationId,
    user_id: currentUserId
  })
  
  // Listen for user activity
  socket?.on('user_joined', (data) => {
    if (!activeUsers.value.includes(data.user_id)) {
      activeUsers.value.push(data.user_id)
    }
  })
  
  socket?.on('user_left', (data) => {
    activeUsers.value = data.activeUsers
  })
})
```

## Error Handling

### Network Errors
```ts
const { isConnected } = useSocket()

watch(() => isConnected.value, (connected) => {
  if (!connected) {
    showNotification('Connection lost. Reconnecting...')
  } else {
    showNotification('Connection restored!')
  }
})
```

### Message Send Errors
```ts
const sendMessage = async () => {
  try {
    const message = await $fetch(
      `/api/messages/${conversationId}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${useMyTokenStore().accessToken}`
        },
        body: {
          content: messageText,
          sender_id: currentUserId
        }
      }
    )
    
    messageText = ''
    showNotification('Message sent!')
  } catch (err) {
    if (err.statusCode === 401) {
      showError('You must be logged in to send messages')
    } else if (err.statusCode === 400) {
      showError('Message cannot be empty')
    } else {
      showError('Failed to send message. Please try again.')
    }
  }
}
```

## Advanced: Custom Hooks

### useConversation Hook
```ts
export const useConversation = (conversationId: number) => {
  const messages = ref<any[]>([])
  const loading = ref(false)
  const { joinConversation, leaveConversation } = useSocket()
  
  const loadMessages = async () => {
    loading.value = true
    try {
      messages.value = await $fetch<any[]>(
        `/api/messages/${conversationId}`,
        {
          headers: {
            authorization: `Bearer ${useMyTokenStore().accessToken}`
          }
        }
      )
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    loadMessages()
    joinConversation(conversationId)
  })
  
  onUnmounted(() => {
    leaveConversation(conversationId)
  })
  
  return {
    messages,
    loading
  }
}

// Usage
const { messages, loading } = useConversation(conversationId)
```

### useMessagingUI Hook
```ts
export const useMessagingUI = () => {
  const conversations = ref<any[]>([])
  const activeChat = ref<any>(null)
  const newMessage = ref('')
  const loading = ref(false)
  
  const openChat = (conversation: any) => {
    activeChat.value = conversation
  }
  
  const closeChat = () => {
    activeChat.value = null
  }
  
  const getOtherUser = (conversation: any) => {
    if (!conversation.messages[0]?.sender) return null
    // Implementation...
  }
  
  return {
    conversations,
    activeChat,
    newMessage,
    loading,
    openChat,
    closeChat,
    getOtherUser
  }
}
```

## Database Queries (Backend Reference)

### Prisma Queries

```ts
// Get user's conversations
const conversations = await prisma.conversation.findMany({
  where: {
    messages: {
      some: { sender_id: userId }
    }
  },
  include: {
    messages: {
      include: { sender: true },
      orderBy: { created_at: 'desc' },
      take: 1
    }
  }
})

// Get messages in conversation
const messages = await prisma.message.findMany({
  where: { conversation_id: conversationId },
  include: { sender: true, attachments: true },
  orderBy: { created_at: 'asc' }
})

// Create message
const message = await prisma.message.create({
  data: {
    conversation_id: conversationId,
    sender_id: userId,
    content: 'Hello!'
  },
  include: { sender: true }
})

// Mark as read
const updated = await prisma.message.update({
  where: { message_id: messageId },
  data: { is_read: true }
})
```

## Testing

### Unit Test Example
```ts
import { describe, it, expect } from 'vitest'

describe('useSocket', () => {
  it('should initialize socket connection', async () => {
    const { initSocket, isConnected } = useSocket()
    initSocket()
    
    // Give socket time to connect
    await new Promise(r => setTimeout(r, 100))
    expect(isConnected.value).toBe(true)
  })
  
  it('should send message event', () => {
    const { initSocket, sendMessage } = useSocket()
    const socket = initSocket()
    
    const emitSpy = vi.spyOn(socket, 'emit')
    sendMessage(1, 'Test message')
    
    expect(emitSpy).toHaveBeenCalledWith('send_message', expect.any(Object))
  })
})
```
