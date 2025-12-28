import { defineStore } from "pinia";

export const useMyTokenStore = defineStore("myTokenStore", () => {
  const accessToken = ref<string | null>(null)
  
  const setToken = (newToken: string) => {
    accessToken.value = newToken
    if (process.client) {
      localStorage.setItem('accessToken', newToken)
    }
  }
  
  const clearToken = () => {
    accessToken.value = null
    if (process.client) {
      localStorage.removeItem('accessToken')
    }
  }
  
  const initializeToken = () => {
    if (process.client) {
      const stored = localStorage.getItem('accessToken')
      if (stored) {
        accessToken.value = stored
      }
    }
  }
  
  return {
    accessToken,
    setToken,
    clearToken,
    initializeToken
  };
}, {
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    paths: ['accessToken']
  }
})