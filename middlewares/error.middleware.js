const { Prisma } = require("@prisma/client")

const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Errori di Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Errore di violazione di constraint unico
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "Violazione di vincolo unico",
        field: err.meta?.target,
      })
    }

    // Record non trovato
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Record non trovato",
      })
    }

    // Violazione di foreign key
    if (err.code === "P2003") {
      return res.status(400).json({
        message: "Violazione di chiave esterna",
      })
    }
  }

  // Errori di validazione Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Errore di validazione dei dati",
      error: process.env.NODE_ENV === "development" ? err.message : "Dati non validi",
    })
  }

  // Errori di autenticazione JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Token non valido",
    })
  }

  // Errore generico
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    message: err.message || "Si è verificato un errore interno",
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  })
}

module.exports = {
  errorHandler,
}
