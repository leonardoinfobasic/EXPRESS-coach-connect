const { Server } = require("socket.io");

let io;

// Funzione per inizializzare Socket.IO
exports.initializeSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL, // 🔐 CORS corretto
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Nuovo client connesso:", socket.id);

    // Quando l'utente si autentica, unisce il socket alla sua stanza personale
    socket.on("authenticate", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`✅ Utente ${userId} autenticato sul socket ${socket.id}`);
      }
    });

    // Disconnessione
    socket.on("disconnect", () => {
      console.log("❌ Client disconnesso:", socket.id);
    });

    // (opzionale) Potresti loggare altri eventi qui se vuoi
  });

  return io;
};

// Funzione per ottenere l'istanza di Socket.IO
exports.getSocketIO = () => {
  if (!io) {
    throw new Error("⚠️ Socket.IO non è stato inizializzato. Chiama initializeSocketIO prima.");
  }
  return io;
};

// Funzione per inviare una notifica a un utente specifico
exports.sendNotificationToUser = (userId, notification) => {
  if (!io) {
    throw new Error("⚠️ Socket.IO non è stato inizializzato.");
  }

  io.to(`user_${userId}`).emit("notification", notification);
};