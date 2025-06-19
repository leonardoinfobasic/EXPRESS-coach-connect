const express = require("express")
const router = express.Router()
const notificationController = require("../controllers/notification.controller")
const { authJwt } = require("../middlewares/auth.middleware")

// Ottieni tutte le notifiche dell'utente
router.get("/", authJwt, notificationController.getNotifications)

// Ottieni il conteggio delle notifiche non lette
router.get("/unread-count", authJwt, notificationController.getUnreadCount)

// Segna una notifica come letta
router.put("/:id/read", authJwt, notificationController.markAsRead)

// Segna tutte le notifiche come lette
router.put("/read-all", authJwt, notificationController.markAllAsRead)

// Elimina una notifica
router.delete("/:id", authJwt, notificationController.deleteNotification)

module.exports = router
