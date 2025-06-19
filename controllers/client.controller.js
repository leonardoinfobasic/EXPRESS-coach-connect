const prisma = require("../lib/prisma")

// Ottieni tutti i clienti (solo per i trainer)
exports.getAllClients = async (req, res, next) => {
  try {
    // Verifica che l'utente sia un trainer
    if (req.user.role !== "TRAINER") {
      return res.status(403).json({ message: "Accesso negato: richiesto ruolo di trainer" })
    }

    // Ottieni tutti i clienti associati al trainer
    const clients = await prisma.client.findMany({
      where: {
        trainerId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json(clients)
  } catch (error) {
    next(error)
  }
}

// Ottieni un cliente specifico
exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params
    console.log("getClientById - Client ID:", id, "User:", req.user.id, "Role:", req.user.role)

    // Verifica che l'utente sia un trainer
    if (req.user.role !== "TRAINER") {
      return res.status(403).json({ message: "Accesso negato: richiesto ruolo di trainer" })
    }

    // Ottieni il cliente con i suoi piani di allenamento
    const client = await prisma.client.findFirst({
      where: {
        id: Number.parseInt(id),
        trainerId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        workoutPlans: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        progressRecords: {
          orderBy: {
            recordDate: "desc",
          },
          take: 10,
        },
      },
    })

    console.log("getClientById - Found client:", !!client)

    if (!client) {
      return res.status(404).json({ message: "Cliente non trovato" })
    }

    console.log("getClientById - Client data:", {
      id: client.id,
      userId: client.userId,
      trainerId: client.trainerId,
      workoutPlansCount: client.workoutPlans?.length || 0,
    })

    res.status(200).json(client)
  } catch (error) {
    console.error("getClientById - Error:", error)
    next(error)
  }
}

// Crea un nuovo cliente
exports.createClient = async (req, res, next) => {
  try {
    console.log("createClient - Request body:", req.body)

    // Verifica che l'utente sia un trainer
    if (req.user.role !== "TRAINER") {
      return res.status(403).json({ message: "Accesso negato: richiesto ruolo di trainer" })
    }

    const { userId, email, height, weight, fitnessGoal, healthIssues, notes } = req.body

    let userToLink

    // Se è stato fornito un userId, usa quello
    if (userId) {
      userToLink = await prisma.user.findUnique({
        where: { id: userId },
      })
    }
    // Altrimenti, cerca l'utente per email
    else if (email) {
      userToLink = await prisma.user.findUnique({
        where: { email },
      })
    }

    if (!userToLink) {
      return res.status(404).json({ message: "Utente non trovato" })
    }

    // Verifica che l'utente non sia già un cliente di questo trainer
    const existingClient = await prisma.client.findFirst({
      where: {
        userId: userToLink.id,
        trainerId: req.user.id,
      },
    })

    if (existingClient) {
      return res.status(400).json({ message: "Questo utente è già un cliente di questo trainer" })
    }

    // Crea il nuovo cliente
    const client = await prisma.client.create({
      data: {
        userId: userToLink.id,
        trainerId: req.user.id,
        height,
        weight,
        fitnessGoal,
        healthIssues,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    console.log("createClient - Created client:", client.id)

    res.status(201).json({
      message: "Cliente creato con successo",
      client,
    })
  } catch (error) {
    console.error("createClient - Error:", error)
    next(error)
  }
}

// Aggiorna un cliente
exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params
    const { height, weight, fitnessGoal, healthIssues, notes } = req.body

    // Verifica che l'utente sia un trainer
    if (req.user.role !== "TRAINER") {
      return res.status(403).json({ message: "Accesso negato: richiesto ruolo di trainer" })
    }

    // Verifica che il cliente esista e appartenga a questo trainer
    const existingClient = await prisma.client.findFirst({
      where: {
        id: Number.parseInt(id),
        trainerId: req.user.id,
      },
    })

    if (!existingClient) {
      return res.status(404).json({ message: "Cliente non trovato" })
    }

    // Aggiorna il cliente
    const client = await prisma.client.update({
      where: { id: Number.parseInt(id) },
      data: {
        height,
        weight,
        fitnessGoal,
        healthIssues,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    res.status(200).json({
      message: "Cliente aggiornato con successo",
      client,
    })
  } catch (error) {
    console.error("updateClient - Error:", error)
    next(error)
  }
}

// Elimina un cliente
exports.deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params

    // Verifica che l'utente sia un trainer
    if (req.user.role !== "TRAINER") {
      return res.status(403).json({ message: "Accesso negato: richiesto ruolo di trainer" })
    }

    // Verifica che il cliente esista e appartenga a questo trainer
    const existingClient = await prisma.client.findFirst({
      where: {
        id: Number.parseInt(id),
        trainerId: req.user.id,
      },
    })

    if (!existingClient) {
      return res.status(404).json({ message: "Cliente non trovato" })
    }

    // Elimina il cliente (cascade eliminerà anche i piani di allenamento e i progressi)
    await prisma.client.delete({
      where: { id: Number.parseInt(id) },
    })

    res.status(200).json({
      message: "Cliente eliminato con successo",
    })
  } catch (error) {
    console.error("deleteClient - Error:", error)
    next(error)
  }
}

// Cerca utenti non ancora clienti
exports.searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query
    console.log("=== SEARCH USERS DEBUG ===")
    console.log("Query received:", query)
    console.log("User ID:", req.user.id)
    console.log("User role:", req.user.role)

    // Verifica che l'utente sia un trainer
    if (req.user.role !== "TRAINER") {
      console.log("Access denied - not a trainer")
      return res.status(403).json({ message: "Accesso negato: richiesto ruolo di trainer" })
    }

    if (!query || query.trim().length < 2) {
      console.log("Query too short or empty")
      return res.status(200).json([])
    }

    // Prima, vediamo tutti gli utenti nel database
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })
    console.log("All users in database:", allUsers)

    // Trova gli ID degli utenti che sono già clienti di questo trainer
    const existingClients = await prisma.client.findMany({
      where: {
        trainerId: req.user.id,
      },
      select: {
        userId: true,
      },
    })

    const existingClientUserIds = existingClients.map((client) => client.userId)
    console.log("Existing client user IDs for this trainer:", existingClientUserIds)

    // Cerca utenti che non sono già clienti di questo trainer
    // Usiamo una query più semplice compatibile con MySQL
    const searchTerm = `%${query.trim().toLowerCase()}%`

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [{ name: { contains: query.trim() } }, { email: { contains: query.trim() } }],
          },
          {
            id: { notIn: existingClientUserIds.length > 0 ? existingClientUserIds : [-1] },
          },
          {
            id: { not: req.user.id }, // Esclude il trainer stesso
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
      take: 10,
    })

    console.log("Search results:", users)
    console.log("=== END SEARCH DEBUG ===")

    res.status(200).json(users)
  } catch (error) {
    console.error("searchUsers - Error:", error)
    res.status(500).json({ message: "Errore interno del server" })
  }
}
