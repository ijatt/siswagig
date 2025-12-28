// stores/user.ts
import { defineStore } from 'pinia'

interface User {
  user_id: number | null
  name: string | null
  email: string | null
  role: string | null
  imageUrl: string | null
  profile_completed: boolean | null
}

export const userStore = defineStore("user", () => {
  const user = ref<User | null>(null)
  const setUser = (newUser: User) => {
    user.value = newUser
  }
  const clearUser = () => {
    
    user.value = null
  }
  return {
    user,
    setUser,
    clearUser
  };
}, {persist: true})
