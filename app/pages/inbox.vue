<template>
  <UContainer class="max-w-6xl mx-auto py-8">
    <div
      class="flex bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full"
    >
      <!-- Inbox List -->
      <Transition name="slide-left" mode="out-in">
        <UPageCard
          v-if="!activeChat"
          key="inbox-list"
          class="w-full flex flex-col"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Messages</h2>
              <UModal v-model:open="showNewChatModal" title="Start New Conversation">
                <UButton
                  icon="i-heroicons-plus"
                  variant="ghost"
                  color="primary"
                  size="sm"
                  @click="showNewChatModal = true"
                  title="Start new conversation"
                />
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
                        color="primary"
                        @click="startNewChat"
                        :loading="creatingChat"
                        :disabled="!selectedUser"
                        class="flex-1"
                      >
                        Start Chat
                      </UButton>
                      <UButton
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
          </template>
          <div class="overflow-y-auto flex-1">
            <div v-if="conversations.length === 0" class="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
            </div>
            <UButton
              v-for="conversation in conversations"
              :key="conversation.conversation_id"
              variant="ghost"
              color="neutral"
              class="w-full text-left px-4 py-3 transition flex items-center gap-3 hover:bg-gray-50"
              @click="openChat(conversation)"
            >
              <UAvatar 
                :src="getOtherUser(conversation)?.image_url || undefined" 
                size="md"
                :alt="getOtherUser(conversation)?.name"
              />
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ getOtherUser(conversation)?.name }}</p>
                <p class="text-sm text-gray-500 truncate">
                  {{ conversation.messages[0]?.content || 'No messages' }}
                </p>
              </div>
              <div class="text-xs text-gray-400 whitespace-nowrap">
                {{ formatTime(conversation.messages[0]?.created_at) }}
              </div>
            </UButton>
          </div>
        </UPageCard>

        <!-- Chat View -->
        <section
          v-else
          key="chat-view"
          class="flex flex-col w-full h-[70vh]"
        >
          <!-- Chat Header -->
          <div
            class="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0"
          >
            <div class="flex items-center gap-3">
              <UButton
                icon="i-heroicons-arrow-left"
                variant="ghost"
                color="neutral"
                @click="closeChat"
              />
              <UAvatar 
                :src="getOtherUser(activeChat)?.image_url || undefined" 
                size="md"
                :alt="getOtherUser(activeChat)?.name"
              />
              <div>
                <p class="font-semibold">{{ getOtherUser(activeChat)?.name }}</p>
                <p class="text-gray-500 text-sm">{{ getOtherUser(activeChat)?.role }}</p>
              </div>
            </div>
            <div v-if="socketConnected" class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-xs text-green-600">Online</span>
            </div>
          </div>

          <!-- Scrollable Messages Section -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
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
                  'max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg',
                  message.sender_id === currentUserId
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                ]"
              >
                <p class="break-words">{{ message.content }}</p>
                <p
                  :class="[
                    'text-xs mt-1',
                    message.sender_id === currentUserId
                      ? 'text-blue-200'
                      : 'text-gray-500'
                  ]"
                >
                  {{ formatTime(message.created_at) }}
                  <span v-if="message.sender_id === currentUserId" class="ml-1">
                    {{ message.is_read ? '✓✓' : '✓' }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div
            class="p-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0"
          >
            <UInput
              v-model="newMessage"
              placeholder="Type your message..."
              class="flex-1"
              @keydown.enter.prevent="sendMessage"
              :disabled="sendingMessage"
            />
            <UButton
              icon="i-heroicons-paper-airplane"
              color="primary"
              @click="sendMessage"
              :loading="sendingMessage"
            />
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
  scrollToBottom()
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
    const token = useMyTokenStore().accessToken
    
    const message = await $fetch(
      `/api/messages/${activeChat.value.conversation_id}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: {
          content: newMessage.value,
          sender_id: currentUserId.value
        }
      }
    )
    
    // Add message to current conversation
    if (activeChat.value.messages) {
      activeChat.value.messages.push(message)
    }
    
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    sendingMessage.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => socketMessages.value.length, () => {
  if (activeChat.value) {
    scrollToBottom()
  }
})

watch(
  () => activeChat.value?.messages.length,
  () => {
    scrollToBottom()
  }
)

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
