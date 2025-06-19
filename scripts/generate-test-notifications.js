const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function generateTestNotifications() {
  try {
    console.log("Generazione notifiche di test...")

    // Ottieni tutti gli utenti
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    if (users.length === 0) {
      console.log("Nessun utente trovato. Impossibile generare notifiche.")
      return
    }

    console.log(`Trovati ${users.length} utenti.`)

    // Genera notifiche per ogni utente
    for (const user of users) {
      console.log(`Generazione notifiche per l'utente ${user.name} (ID: ${user.id})...`)

      // Notifica di sistema
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Benvenuto in CoachConnect",
          message: "Grazie per esserti registrato! Esplora tutte le funzionalità disponibili.",
          type: "SYSTEM",
          read: false,
        },
      })

      // Notifica di promemoria
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Promemoria profilo",
          message: "Ricordati di completare il tuo profilo con tutte le informazioni necessarie.",
          type: "REMINDER",
          read: Math.random() > 0.5, // Casualmente letta o non letta
        },
      })

      // Notifiche specifiche per ruolo
      if (user.role === "TRAINER") {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Nuovo cliente registrato",
            message: "Un nuovo cliente si è registrato sulla piattaforma. Controlla la sezione clienti.",
            type: "SYSTEM",
            read: Math.random() > 0.7,
          },
        })
      } else {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Nuovo piano di allenamento",
            message: "Il tuo trainer ha creato un nuovo piano di allenamento per te.",
            type: "WORKOUT_PLAN",
            read: Math.random() > 0.3,
          },
        })
      }

      // Notifica di messaggio
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Nuovo messaggio",
          message: `Hai ricevuto un nuovo messaggio da ${user.role === "TRAINER" ? "un cliente" : "il tuo trainer"}.`,
          type: "MESSAGE",
          read: Math.random() > 0.5,
        },
      })
    }

    console.log("Generazione notifiche completata con successo!")
  } catch (error) {
    console.error("Errore durante la generazione delle notifiche:", error)
  } finally {
    await prisma.$disconnect()
  }
}

generateTestNotifications()
  .then(() => console.log("Script completato."))
  .catch((e) => console.error("Errore nello script:", e))
