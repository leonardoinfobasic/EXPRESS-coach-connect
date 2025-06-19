const jwt = require("jsonwebtoken")
const prisma = require("../lib/prisma")

const authJwt = async (req, res, next) => {
  try {
    // Ottieni il token dall'header Authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token di autenticazione non fornito" })
    }

    const token = authHeader.split(" ")[1]

    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Ottieni l'utente dal database usando Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    })

    if (!user) {
      return res.status(401).json({ message: "Utente non trovato" })
    }

    // Aggiungi l'utente alla richiesta
    req.user = user
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token scaduto" })
    }
    return res.status(401).json({ message: "Token non valido" })
  }
}

const isTrainer = (req, res, next) => {
  if (req.user && req.user.role === "TRAINER") {
    next()
  } else {
    res.status(403).json({ message: "Accesso negato: richiesto ruolo di trainer" })
  }
}

module.exports = {
  authJwt,
  isTrainer,
}
