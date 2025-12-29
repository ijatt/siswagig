export default defineNuxtPlugin(() => {
  const { initSocket, joinUserRoom } = useSocket()
  const user = userStore()

  // Watch for user login/logout to manage socket connections
  watch(
    () => user.user,
    (newUser, oldUser) => {
      if (newUser && newUser.user_id) {
        // User logged in - initialize socket and join notification room
        const socket = initSocket()
        if (socket) {
          // Wait for socket to connect before joining room
          if (socket.connected) {
            joinUserRoom(newUser.user_id)
          } else {
            socket.on('connect', () => {
              joinUserRoom(newUser.user_id)
            })
          }
        }
      }
    },
    { immediate: true }
  )
})
