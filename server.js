const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const http = require("http")
const dotenv = require("dotenv")
dotenv.config()

const app = express()
const server = http.createServer(app)

// Inizializza Socket.IO con CORS sulla stessa porta
const { initializeSocketIO } = require("./utilis/socket.helper.js")
const io = initializeSocketIO(server)
app.set("io", io)

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/users", require("./routes/user.routes"))
app.use("/api/clients", require("./routes/client.routes"))
app.use("/api/workout-plans", require("./routes/workout-plan.routes"))
app.use("/api/messages", require("./routes/message.routes"))
app.use("/api/notifications", require("./routes/notification.routes"))


app.use("/uploads", express.static("uploads"));

// Error handler
const { errorHandler } = require("./middlewares/error.middleware")
app.use(errorHandler)

// Avvia server
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
})
