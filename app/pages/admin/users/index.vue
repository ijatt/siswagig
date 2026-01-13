<template>
  <div>
    <NuxtLayout name="admin">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Users Management</h1>
          <p class="text-slate-500 mt-1">Manage all platform users and their roles</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <Icon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search users by name or email..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                @input="debouncedSearch"
              />
            </div>
          </div>
          
          <!-- Role Filter -->
          <select 
            v-model="roleFilter"
            @change="fetchUsers"
            class="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all bg-white"
          >
            <option value="all">All Roles</option>
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Location</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Stats</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Joined</th>
                <th class="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="user in users" :key="user.user_id" class="hover:bg-slate-50 transition-colors">
                <!-- User Info -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="user.image_url || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'"
                      class="w-10 h-10 rounded-xl object-cover"
                      :alt="user.name"
                    />
                    <div>
                      <p class="font-medium text-slate-800">{{ user.name }}</p>
                      <p class="text-sm text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                
                <!-- Role -->
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
                    user.role === 'freelancer' ? 'bg-violet-100 text-violet-700' :
                    user.role === 'client' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  ]">
                    <Icon :name="user.role === 'freelancer' ? 'i-lucide-code' : user.role === 'client' ? 'i-lucide-building' : 'i-lucide-shield'" class="text-xs" />
                    {{ user.role }}
                  </span>
                </td>
                
                <!-- Location -->
                <td class="px-6 py-4">
                  <p class="text-sm text-slate-600">{{ user.location || 'Not specified' }}</p>
                </td>
                
                <!-- Stats -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4 text-sm text-slate-600">
                    <span class="flex items-center gap-1">
                      <Icon name="i-lucide-briefcase" class="text-slate-400" />
                      {{ user._count?.jobs || 0 }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="i-lucide-file-text" class="text-slate-400" />
                      {{ user._count?.applications || 0 }}
                    </span>
                  </div>
                </td>
                
                <!-- Joined Date -->
                <td class="px-6 py-4">
                  <p class="text-sm text-slate-600 whitespace-nowrap">{{ formatDate(user.created_at) }}</p>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Change Role Dropdown -->
                    <UDropdownMenu :items="getRoleActions(user)">
                      <button class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Change Role">
                        <Icon name="i-lucide-user-cog" />
                      </button>
                    </UDropdownMenu>
                    
                    <!-- Delete -->
                    <button 
                      @click="confirmDelete(user)"
                      class="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                      title="Delete User"
                      :disabled="user.role === 'admin'"
                    >
                      <Icon name="i-lucide-trash-2" />
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="users.length === 0 && !pending">
                <td colspan="6" class="px-6 py-12 text-center">
                  <Icon name="i-lucide-users" class="text-4xl text-slate-300 mb-3" />
                  <p class="text-slate-500">No users found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination" class="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p class="text-sm text-slate-600">
            Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} users
          </p>
          <div class="flex items-center gap-2">
            <button 
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <UModal v-model:open="showDeleteModal">
        <template #content>
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="i-lucide-alert-triangle" class="text-2xl text-red-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-800">Delete User</h3>
                <p class="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p class="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{{ userToDelete?.name }}</strong>? All their data including jobs, applications, and reviews will be permanently removed.
            </p>
            <div class="flex justify-end gap-3">
              <button 
                @click="showDeleteModal = false"
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteUser"
                class="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Loading State -->
      <div v-if="pending" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p class="text-slate-600 font-medium">Loading users...</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

useSeoMeta({
  title: 'Users Management | SiswaGig Admin',
  description: 'Manage all platform users'
})

const toast = useToast()
const tokenStore = useMyTokenStore()

// State
const searchQuery = ref('')
const roleFilter = ref('all')
const currentPage = ref(1)
const showDeleteModal = ref(false)
const userToDelete = ref<any>(null)

// Fetch users
const { data, pending, refresh } = await useFetch('/api/admin/users', {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  },
  query: {
    page: currentPage,
    role: roleFilter,
    search: searchQuery
  }
})

const users = computed(() => data.value?.users || [])
const pagination = computed(() => data.value?.pagination)

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchUsers()
  }, 300)
}

// Fetch users function
const fetchUsers = async () => {
  await refresh()
}

// Go to page
const goToPage = (page: number) => {
  currentPage.value = page
  fetchUsers()
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get role actions for dropdown
const getRoleActions = (user: any) => [
  [
    {
      label: 'Set as Freelancer',
      icon: 'i-lucide-code',
      disabled: user.role === 'freelancer',
      onSelect: () => changeRole(user.user_id, 'freelancer')
    },
    {
      label: 'Set as Client',
      icon: 'i-lucide-building',
      disabled: user.role === 'client',
      onSelect: () => changeRole(user.user_id, 'client')
    },
    {
      label: 'Set as Admin',
      icon: 'i-lucide-shield',
      disabled: user.role === 'admin',
      onSelect: () => changeRole(user.user_id, 'admin')
    }
  ]
]

// Change user role
const changeRole = async (userId: number, role: string) => {
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: { role }
    })
    
    toast.add({
      title: 'Success',
      description: 'User role updated successfully',
      color: 'success'
    })
    
    await fetchUsers()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.statusMessage || 'Failed to update user role',
      color: 'error'
    })
  }
}

// Confirm delete
const confirmDelete = (user: any) => {
  if (user.role === 'admin') {
    toast.add({
      title: 'Error',
      description: 'Cannot delete admin accounts',
      color: 'error'
    })
    return
  }
  userToDelete.value = user
  showDeleteModal.value = true
}

// Delete user
const deleteUser = async () => {
  if (!userToDelete.value) return
  
  try {
    await $fetch(`/api/admin/users/${userToDelete.value.user_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    })
    
    toast.add({
      title: 'Success',
      description: 'User deleted successfully',
      color: 'success'
    })
    
    showDeleteModal.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.statusMessage || 'Failed to delete user',
      color: 'error'
    })
  }
}
</script>
