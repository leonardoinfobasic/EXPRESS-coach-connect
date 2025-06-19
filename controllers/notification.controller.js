const prisma = require("../lib/prisma")
const { getSocketIO } = require("../utilis/socket.helper")

// Ottiene tutte le notifiche dell'utente corrente
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
    res.json(notifications)
  } catch (error) {
    console.error("❌ Errore nel recupero delle notifiche:", error)
    res.status(500).json({ message: "Errore nel recupero delle notifiche" })
  }
}

// Ottiene il conteggio delle notifiche non lette
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id
    const count = await prisma.notification.count({
      where: { userId, read: false },
    })
    res.json({ count })
  } catch (error) {
    console.error("❌ Errore nel conteggio delle notifiche non lette:", error)
    res.status(500).json({ message: "Errore nel conteggio delle notifiche non lette" })
  }
}

// Segna una notifica come letta
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    const notificationId = Number(req.params.id)

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } })

    if (!notification) return res.status(404).json({ message: "Notifica non trovata" })
    if (notification.userId !== userId) return res.status(403).json({ message: "Non autorizzato" })

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    const io = getSocketIO()
    io.to(`user_${userId}`).emit("notification:read", notificationId)

    res.json(updatedNotification)
  } catch (error) {
    console.error("❌ Errore nel segnare la notifica come letta:", error)
    res.status(500).json({ message: "Errore nel segnare la notifica come letta" })
  }
}

// Segna tutte le notifiche come lette
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    const io = getSocketIO()
    io.to(`user_${userId}`).emit("notifications:allRead")

    res.json({ message: "Tutte le notifiche segnate come lette" })
  } catch (error) {
    console.error("❌ Errore nel segnare tutte le notifiche come lette:", error)
    res.status(500).json({ message: "Errore nel segnare tutte le notifiche come lette" })
  }
}

// Elimina una notifica
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id
    const notificationId = Number(req.params.id)

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } })

    if (!notification) return res.status(404).json({ message: "Notifica non trovata" })
    if (notification.userId !== userId) return res.status(403).json({ message: "Non autorizzato" })

    await prisma.notification.delete({ where: { id: notificationId } })

    const io = getSocketIO()
    io.to(`user_${userId}`).emit("notification:deleted", notificationId)

    res.json({ message: "Notifica eliminata con successo" })
  } catch (error) {
    console.error("❌ Errore nell'eliminazione della notifica:", error)
    res.status(500).json({ message: "Errore nell'eliminazione della notifica" })
  }
}

// Elimina tutte le notifiche
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    await prisma.notification.deleteMany({ where: { userId } })

    const io = getSocketIO()
    io.to(`user_${userId}`).emit("notifications:cleared")

    res.json({ message: "Tutte le notifiche eliminate con successo" })
  } catch (error) {
    console.error("❌ Errore nell'eliminazione delle notifiche:", error)
    res.status(500).json({ message: "Errore nell'eliminazione delle notifiche" })
  }
}

// Crea una nuova notifica
exports.createNotification = async (userId, title, message, type = "SYSTEM", entityId = null) => {
  try {
    console.log("🔔 Creando notifica per utente:", userId, "titolo:", title)

    const validTypes = ["WORKOUT_PLAN", "MESSAGE", "REMINDER", "SYSTEM"]
const safeType = typeof type === "string" ? type.toUpperCase() : String(type).toUpperCase()
if (!validTypes.includes(safeType)) {
  throw new Error(`Tipo notifica non valido: ${safeType}`)
}

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: safeType,
        entityId: entityId ? String(entityId) : null,
        read: false,
      },
    })

    const io = getSocketIO()
    io.to(`user_${userId}`).emit("notification:new", notification)

    console.log("✅ Notifica creata:", notification.id)
    return notification
  } catch (error) {
    console.error("❌ Errore nella creazione della notifica:", error)
    return null
  }
}
