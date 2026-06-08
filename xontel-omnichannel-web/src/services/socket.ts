import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token?: string) {
  if (!socket) {
    socket = io((import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:4000', {
      auth: token ? { token } : undefined,
    })
  }
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

export default socket
