const socketIO = require("socket.io")
const jwt = require("jsonwebtoken")

let io

// Inizializza Socket.IO con il server HTTP
const initializeSocketIO = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Middleware per l'autenticazione
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error: Token not provided"))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      next()
    } catch (error) {
      next(new Error("Authentication error: Invalid token"))
    }
  })

  // Gestisci la connessione
  io.on("connection", (socket) => {
    console.log(`Socket connesso: ${socket.id} per l'utente: ${socket.userId}`)

    // Aggiungi l'utente a una stanza personale
    socket.join(`user_${socket.userId}`)

    // Gestisci la disconnessione
    socket.on("disconnect", () => {
      console.log(`Socket disconnesso: ${socket.id}`)
    })

    // Gestisci l'autenticazione esplicita
    socket.on("authenticate", (userId) => {
      if (socket.userId === userId) {
        console.log(`Utente ${userId} autenticato via socket`)
      }
    })
  })

  return io
}

// Ottieni l'istanza di Socket.IO
const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized")
  }
  return io
}

module.exports = {
  initializeSocketIO,
  getSocketIO,
}
