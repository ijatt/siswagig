<template>
  <div class="relative" ref="dropdownRef">
    <!-- Notification Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all group"
      :class="{ 'bg-purple-100 hover:bg-purple-200': isOpen }"
    >
      <UIcon 
        name="i-lucide-bell" 
        class="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors"
        :class="{ 'text-purple-600': isOpen }"
      />
      
      <!-- Unread Badge -->
      <span 
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
      
      <!-- Animated Ring for new notifications -->
      <span 
        v-if="hasNewNotification"
        class="absolute inset-0 rounded-xl border-2 border-purple-400 animate-ping opacity-75"
      ></span>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div 
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900">Notifications</h3>
              <span 
                v-if="unreadCount > 0"
                class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
              >
                {{ unreadCount }} new
              </span>
            </div>
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Mark all read
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="i in 3" :key="i" class="flex items-start gap-3">
              <USkeleton class="w-10 h-10 rounded-xl flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-3/4 rounded" />
                <USkeleton class="h-3 w-full rounded" />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="notifications.length === 0" class="py-12 px-4 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-bell-off" class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-500 text-sm">No notifications yet</p>
            <p class="text-gray-400 text-xs mt-1">We'll notify you when something happens</p>
          </div>

          <!-- Notifications -->
          <div v-else class="divide-y divide-gray-50">
            <div
              v-for="notification in notifications"
              :key="notification.notification_id"
              @click="handleNotificationClick(notification)"
              :class="[
                'flex items-start gap-3 p-4 cursor-pointer transition-colors',
                notification.is_read 
                  ? 'bg-white hover:bg-gray-50' 
                  : 'bg-purple-50/50 hover:bg-purple-100/50'
              ]"
            >
              <!-- Icon -->
              <div 
                :class="[
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  getNotificationStyle(notification.type).bg
                ]"
              >
                <UIcon 
                  :name="getNotificationStyle(notification.type).icon" 
                  :class="['w-5 h-5', getNotificationStyle(notification.type).text]" 
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p 
                    :class="[
                      'text-sm line-clamp-1',
                      notification.is_read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'
                    ]"
                  >
                    {{ notification.title }}
                  </p>
                  <span 
                    v-if="!notification.is_read"
                    class="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1.5"
                  ></span>
                </div>
                <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatTimeAgo(notification.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <NuxtLink 
            to="/notifications"
            @click="isOpen = false"
            class="flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View all notifications
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

interface Notification {
  notification_id: number
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

const isOpen = ref(false)
const loading = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const hasNewNotification = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

// Notification styles by type
const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'message':
      return { icon: 'i-lucide-message-circle', bg: 'bg-blue-100', text: 'text-blue-600' }
    case 'application':
      return { icon: 'i-lucide-file-text', bg: 'bg-emerald-100', text: 'text-emerald-600' }
    case 'status_update':
      return { icon: 'i-lucide-bell-ring', bg: 'bg-purple-100', text: 'text-purple-600' }
    case 'system':
      return { icon: 'i-lucide-info', bg: 'bg-gray-100', text: 'text-gray-600' }
    default:
      return { icon: 'i-lucide-bell', bg: 'bg-gray-100', text: 'text-gray-600' }
  }
}

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchNotifications()
    hasNewNotification.value = false
  }
}

// Fetch notifications
const fetchNotifications = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/notifications', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      }
    }) as { notifications: Notification[], unreadCount: number }
    
    notifications.value = data.notifications
    unreadCount.value = data.unreadCount
  } catch (err) {
    console.error('Failed to fetch notifications:', err)
  } finally {
    loading.value = false
  }
}

// Mark single notification as read and navigate
const handleNotificationClick = async (notification: Notification) => {
  if (!notification.is_read) {
    try {
      await $fetch(`/api/notifications/${notification.notification_id}/read`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${useMyTokenStore().accessToken}`
        }
      })
      notification.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }
  
  isOpen.value = false
  
  if (notification.link) {
    navigateTo(notification.link)
  }
}

// Mark all as read
const markAllAsRead = async () => {
  try {
    await $fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${useMyTokenStore().accessToken}`
      }
    })
    notifications.value.forEach(n => n.is_read = true)
    unreadCount.value = 0
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

// Socket.io integration for real-time notifications
const { initSocket, joinUserRoom } = useSocket()
const user = userStore()

onMounted(() => {
  // Initial fetch of unread count
  fetchNotifications()
  
  // Initialize socket and join user's notification room
  const socket = initSocket()
  if (socket && user.user?.user_id) {
    if (socket.connected) {
      joinUserRoom(user.user.user_id)
    }
    
    // Listen for new notifications
    socket.on('new-notification', (notification: Notification) => {
      notifications.value.unshift(notification)
      unreadCount.value++
      hasNewNotification.value = true
      
      // Auto-hide the pulse animation after 3 seconds
      setTimeout(() => {
        hasNewNotification.value = false
      }, 3000)
    })
  }
})

onUnmounted(() => {
  const socket = initSocket()
  if (socket) {
    socket.off('new-notification')
  }
})

// Refresh notifications periodically (every 30 seconds) as fallback
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshInterval = setInterval(() => {
    if (!isOpen.value) {
      fetchNotifications()
    }
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
