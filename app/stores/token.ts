import { defineStore } from "pinia";

export const useMyTokenStore = defineStore("myTokenStore", () => {
  const accessToken = ref<string | null>(null)
  const setToken = (newToken: string) => {
    accessToken.value = newToken
  }
  const clearToken = () => {
    accessToken.value = null
  }
  return {
    accessToken,
    setToken,
    clearToken
  };
})