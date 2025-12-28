<template>
  <UContainer class="max-w-5xl mx-auto py-8 px-4">
    <div class="card-modern overflow-hidden h-[75vh] flex">
      <!-- Inbox List -->
      <Transition name="slide-left" mode="out-in">
        <div
          v-if="!activeChat"
          key="inbox-list"
          class="w-full flex flex-col"
        >
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <UIcon name="i-lucide-messages-square" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-900">Messages</h2>
                  <p class="text-xs text-gray-500">{{ conversations.length }} conversations</p>
                </div>
              </div>
              <UModal v-model:open="showNewChatModal" title="Start New Conversation">
                <UButton
                  class="w-10 h-10 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity"
                  @click="showNewChatModal = true"
                  title="Start new conversation"
                >
                  <UIcon name="i-lucide-plus" class="w-5 h-5 text-white" />
                </UButton>
                <template #body>
                  <div class="p-6 space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Select user</label>
                      <USelectMenu
                        v-model="selectedUser"
                        :items="availableUsers"
                        option-attribute="label"
                        value-attribute="id"
                        searchable
                        placeholder="Search or select users..."
                        :loading="loadingUsers"
                        @search="searchUsers"
                      />
                    </div>

                    <div class="flex gap-3 pt-4">
                      <UButton
                        class="flex-1 btn-gradient"
                        @click="startNewChat"
                        :loading="creatingChat"
                        :disabled="!selectedUser"
                      >
                        Start Chat
                      </UButton>
                      <UButton
                        variant="outline"
                        @click="showNewChatModal = false"
                        class="flex-1"
                      >
                        Cancel
                      </UButton>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>

          <!-- Conversation List -->
          <div class="overflow-y-auto flex-1">
            <div v-if="conversations.length === 0" class="flex flex-col items-center justify-center h-full text-center p-8">
              <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <UIcon name="i-lucide-message-circle" class="w-10 h-10 text-gray-400" />
              </div>
              <p class="text-gray-600 font-medium">No conversations yet</p>
              <p class="text-gray-400 text-sm mt-1">Start a chat with someone!</p>
            </div>
            <div
              v-for="conversation in conversations"
              :key="conversation.conversation_id"
              class="px-4 py-4 border-b border-gray-50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent cursor-pointer transition-all flex items-center gap-4 group"
              @click="openChat(conversation)"
            >
              <div class="relative">
                <img 
                  :src="getOtherUser(conversation)?.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" 
                  :alt="getOtherUser(conversation)?.name"
                  class="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-purple-200 transition-all"
                />
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <p class="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                    {{ getOtherUser(conversation)?.name || 'Unknown User' }}
                  </p>
                  <span class="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {{ formatTime(conversation.messages.at(-1)?.created_at) }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 truncate">
                  {{ conversation.messages.at(-1)?.content || 'No messages' }}
                </p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
            </div>
          </div>
        </div>

        <!-- Chat View -->
        <section
          v-else
          key="chat-view"
          class="flex flex-col w-full bg-gray-50"
        >
          <!-- Chat Header -->
          <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
            <div class="flex items-center gap-4">
              <button
                @click="closeChat"
                class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-purple-100 flex items-center justify-center transition-colors"
              >
                <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-gray-600" />
              </button>
              <img 
                :src="getOtherUser(activeChat)?.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" 
                :alt="getOtherUser(activeChat)?.name"
                class="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-100"
              />
              <div>
                <p class="font-bold text-gray-900">{{ getOtherUser(activeChat)?.name }}</p>
                <p class="text-gray-500 text-sm">{{ getOtherUser(activeChat)?.role }}</p>
              </div>
            </div>
            <div v-if="socketConnected" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-xs font-medium text-green-600">Online</span>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
            <div
              v-for="message in activeChat.messages"
              :key="message.message_id"
              :class="[
                'flex',
                message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-sm',
                  message.sender_id === currentUserId
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                ]"
              >
                <p class="break-words leading-relaxed">{{ message.content }}</p>
                <p
                  :class="[
                    'text-xs mt-2 flex items-center gap-1',
                    message.sender_id === currentUserId
                      ? 'text-white/70'
                      : 'text-gray-400'
                  ]"
                >
                  {{ formatTime(message.created_at) }}
                  <span v-if="message.sender_id === currentUserId" class="ml-1">
                    {{ message.is_read ? '✓✓' : '✓' }}
                  </span>
                </p>
              </div>
            </div>
            
            <!-- Typing Indicator -->
            <div v-if="typingUsers.size > 0" class="flex justify-start">
              <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2">
                  <div class="flex gap-1">
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
                  </div>
                  <span class="text-xs text-gray-400">typing...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-4 bg-white border-t border-gray-100 shrink-0">
            <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-2">
              <input
                v-model="newMessage"
                placeholder="Type your message..."
                class="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
                @keydown.enter.prevent="sendMessage"
                @input="handleMessageInput"
                :disabled="sendingMessage"
              />
              <button
                @click="sendMessage"
                :disabled="sendingMessage || !newMessage.trim()"
                class="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <UIcon name="i-lucide-send" class="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </section>
      </Transition>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useSocket } from '~/composables/socket'

const currentUserId = ref<number>(0)
const conversations = ref<any[]>([])
const activeChat = ref<any>(null)
const newMessage = ref('')
const sendingMessage = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const loadingConversations = ref(false)

const showNewChatModal = ref(false)
const selectedUser = ref<{ label: string; id: number } | undefined>(undefined)
const availableUsers = ref<{ label: string; id: number }[]>([])
const loadingUsers = ref(false)
const creatingChat = ref(false)


const { isConnected: socketConnected, initSocket, sendMessage: socketSendMessage, joinConversation, leaveConversation, messages: socketMessages } = useSocket()

// Get the other user in the conversation
function getOtherUser(conversation: any) {
  if (!conversation.messages[0]?.sender) return null
  
  // Get all unique senders
  const senders = new Set(conversation.messages.map((m: any) => m.sender.user_id))
  const otherUserId = Array.from(senders).find((id: any) => id !== currentUserId.value)
  
  if (otherUserId) {
    const message = conversation.messages.find((m: any) => m.sender.user_id === otherUserId)
    return message?.sender
  }
  
  return conversation.messages[0]?.sender
}

// Format time display
function formatTime(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  if (diff < 60000) return 'now'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
  if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function loadConversations() {
  try {
    loadingConversations.value = true
    const token = useMyTokenStore().accessToken
    
    const data = await $fetch<any[]>(`/api/conversations/${currentUserId.value}`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })
    
    conversations.value = data || []
  } catch (err) {
    console.error('Failed to load conversations:', err)
  } finally {
    loadingConversations.value = false
  }
}

function openChat(conversation: any) {
  activeChat.value = conversation
  joinConversation(conversation.conversation_id)
  // Wait for DOM transition to complete before scrolling
  setTimeout(() => {
    scrollToBottom()
  }, 450)
}

function closeChat() {
  if (activeChat.value) {
    leaveConversation(activeChat.value.conversation_id)
  }
  activeChat.value = null
}

async function searchUsers(query: string) {
  try {
    loadingUsers.value = true
    const token = useMyTokenStore().accessToken
    
    // If empty, load all users
    if (!query) {
      const users = await $fetch<any[]>('/api/user/list', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      availableUsers.value = (users || [])
        .filter(u => u.user_id !== currentUserId.value)
        .map(u => ({ label: u.name, id: u.user_id }))
      return
    }

    // Otherwise search
    const users = await $fetch<any[]>('/api/user/search', {
      query: { q: query },
      headers: {
        authorization: `Bearer ${token}`
      }
    })
    
    // Filter out current user and transform format
    availableUsers.value = (users || [])
      .filter(u => u.user_id !== currentUserId.value)
      .map(u => ({ label: u.name, id: u.user_id }))
  } catch (err) {
    console.error('Failed to search users:', err)
  } finally {
    loadingUsers.value = false
  }
}

async function startNewChat() {
  if (!selectedUser.value) return

  creatingChat.value = true
  try {
    const token = useMyTokenStore().accessToken
    
    const conversation = await $fetch<any>('/api/conversations', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`
      },
      body: {
        participant1_id: currentUserId.value,
        participant2_id: selectedUser.value.id
      }
    })

    // Add to conversations list if not already there
    if (conversation && !conversations.value.some(c => c.conversation_id === conversation.conversation_id)) {
      conversations.value.unshift(conversation)
    }
    console.log('dah lalu');
    
    // Open the new conversation
    //openChat(conversation)
    
    // Reset modal
    showNewChatModal.value = false
    selectedUser.value = undefined
    availableUsers.value = []
  } catch (err) {
    console.error('Failed to start new chat:', err)
  } finally {
    creatingChat.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !activeChat.value) return
  
  sendingMessage.value = true
  try {
    const user = userStore()
    socketSendMessage(activeChat.value.conversation_id, newMessage.value)
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    sendingMessage.value = false
  }
}

const { $io } = useNuxtApp()
if ((($io as any)?.connect)) {
  ($io as any).connect()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const typingUsers = ref<Set<number>>(new Set())
const isCurrentUserTyping = ref(false)
let typingTimeout: NodeJS.Timeout | null = null

// Watch for incoming Socket.IO messages
watch(() => socketMessages.value.length, () => {
  if (activeChat.value && socketMessages.value.length > 0) {
    const incomingMessage = socketMessages.value[socketMessages.value.length - 1]
    if (incomingMessage.conversation_id === activeChat.value.conversation_id) {
      if (!activeChat.value.messages.find((m: any) => m.message_id === incomingMessage.message_id)) {
        activeChat.value.messages.push(incomingMessage)
      }
    }
    scrollToBottom()
  }
})

// Watch for typing indicators
const { typingUsers: socketTypingUsers } = useSocket()
watch(() => socketTypingUsers.value.size, () => {
  if (activeChat.value) {
    typingUsers.value = new Set(socketTypingUsers.value)
  }
})

watch(
  () => activeChat.value?.messages.length,
  () => {
    scrollToBottom()
  }
)

// Handle typing with debounce
const handleMessageInput = () => {
  if (!isCurrentUserTyping.value && socketConnected.value) {
    isCurrentUserTyping.value = true
    const { startTyping } = useSocket()
    startTyping(activeChat.value.conversation_id)
  }
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  typingTimeout = setTimeout(() => {
    if (isCurrentUserTyping.value && socketConnected.value) {
      isCurrentUserTyping.value = false
      const { stopTyping } = useSocket()
      stopTyping(activeChat.value.conversation_id)
    }
  }, 1500)
}

onMounted(async () => {
  const user = userStore()
  currentUserId.value = user.user?.user_id || 0
  
  initSocket()
  await loadConversations()
  
  // Load all users initially
  await searchUsers('')
})

onUnmounted(() => {
  if (activeChat.value) {
    leaveConversation(activeChat.value.conversation_id)
  }
})
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
