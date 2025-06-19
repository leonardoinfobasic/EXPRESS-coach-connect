// message.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getSocketIO } = require("../utilis/socket.helper");
const notificationController = require("./notification.controller");

// Ottiene tutti i messaggi tra l'utente corrente e un altro utente
exports.getConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Invia un nuovo messaggio
exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "receiverId e content sono richiesti" });
    }

    const receiver = await prisma.user.findUnique({ where: { id: Number(receiverId) } });

    if (!receiver) {
      return res.status(404).json({ message: "Destinatario non trovato" });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: Number(receiverId),
        content,
        readAt: null
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      }
    });

    const io = getSocketIO();
    io.to(`user_${receiverId}`).emit("message", message);

    await notificationController.createNotification(
      Number(receiverId),
      "Nuovo messaggio",
      `${req.user.name} ti ha scritto: ${content.substring(0, 30)}${content.length > 30 ? "..." : ""}`,
      "MESSAGE",
      String(senderId)
    );

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// Ottiene tutte le conversazioni per l’utente corrente
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    const conversations = new Map();

    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      if (!msg.readAt && msg.receiverId === userId) {
        conversations.get(otherUser.id).unreadCount++;
      }
    });

    res.json([...conversations.values()]);
  } catch (error) {
    next(error);
  }
};

// Segna un singolo messaggio come letto
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const messageId = Number(req.params.id);

    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message) return res.status(404).json({ message: "Messaggio non trovato" });
    if (message.receiverId !== userId) return res.status(403).json({ message: "Non autorizzato" });

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() }
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// Ottiene tutti i messaggi tra l'utente e un cliente specifico
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = Number(req.params.clientId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: clientId },
          { senderId: clientId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// Segna tutti i messaggi della conversazione come letti
exports.markConversationAsRead = async (req, res, next) => {
  try {
    const myUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: myUserId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    res.status(200).json({ message: "Messaggi della conversazione segnati come letti" });
  } catch (error) {
    console.error("Errore nel marcare come letti:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
