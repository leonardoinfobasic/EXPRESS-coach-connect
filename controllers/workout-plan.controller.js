const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const notificationController = require("./notification.controller");

// Ottiene tutti i piani di allenamento dell'utente corrente
exports.getWorkoutPlans = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let workoutPlans = [];

    if (userRole === "TRAINER") {
      workoutPlans = await prisma.workoutPlan.findMany({
        where: {
          trainerId: userId,
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } else if (userRole === "CLIENT") {
  let client = await prisma.client.findUnique({
    where: { userId },
  });

  if (!client) {
    // Se non esiste ancora un cliente per questo utente, lo creiamo
    client = await prisma.client.create({
  data: {
    user: {
      connect: {
        id: userId
      }
    }
  }
});
    workoutPlans = []; // Nessuna scheda iniziale per ora
  } else {
    workoutPlans = await prisma.workoutPlan.findMany({
      where: {
        clientId: client.id,
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}

    res.status(200).json(workoutPlans);
  } catch (error) {
    console.error("Errore nel recupero dei workout plans:", error);
    next(error);
  }
};


// Ottiene un piano di allenamento specifico
exports.getWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planId = Number.parseInt(req.params.id);

    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        OR: [
          { trainerId: userId },
          { client: { userId: userId } },
        ],
      },
      include: {
        exercises: true,
        trainer: {
          select: {
            name: true,
            email: true,
          },
        },
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: "Piano di allenamento non trovato" });
    }

    res.status(200).json(workoutPlan);
  } catch (error) {
    next(error);
  }
};

// Crea un nuovo piano di allenamento
exports.createWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, exercises, clientId, startDate, endDate, status } = req.body;

    if (!title || !exercises) {
      return res.status(400).json({ message: "title e exercises sono richiesti" });
    }

    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        title,
        description,
        trainerId: userId,
        clientId: clientId ? Number(clientId) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "ACTIVE",
        exercises: {
          create: exercises.map((ex) => ({
            day: ex.day,
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTime: ex.restTime,
            notes: ex.notes,
            exerciseOrder: ex.exerciseOrder
          }))
        },
      },
      include: {
        exercises: true,
      },
    });

    res.status(201).json(workoutPlan);
  } catch (error) {
    next(error);
  }
};

// Aggiorna un piano di allenamento
exports.updateWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planId = Number.parseInt(req.params.id);
    const { title, description, clientId, startDate, endDate, status, exercises } = req.body;

    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        trainerId: userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({ message: "Piano di allenamento non trovato" });
    }

    await prisma.workoutExercise.deleteMany({
      where: { workoutPlanId: planId },
    });

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id: planId },
      data: {
        title,
        description,
        clientId: clientId ? Number(clientId) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        exercises: {
          create: exercises.map((ex) => ({
            day: ex.day,
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTime: ex.restTime,
            notes: ex.notes,
            exerciseOrder: ex.exerciseOrder
          }))
        },
      },
      include: {
        exercises: true,
        client: {
          include: {
            user: true
          }
        }
      },
    });

    if (updatedPlan.client?.user?.id) {
      await notificationController.createSystemNotification(
        updatedPlan.client.user.id,
        `Il tuo piano di allenamento "${updatedPlan.title}" è stato aggiornato.`,
        "workout",
        updatedPlan.id
      );
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error("Errore nel salvataggio della scheda:", error);
    next(error);
  }
};

// Elimina un piano di allenamento
exports.deleteWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planId = Number.parseInt(req.params.id);

    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        trainerId: userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({ message: "Piano di allenamento non trovato" });
    }

    await prisma.workoutPlan.delete({
      where: { id: planId },
    });

    res.status(200).json({ message: "Piano di allenamento eliminato con successo" });
  } catch (error) {
    next(error);
  }
};

// Assegna un piano di allenamento a un cliente
exports.assignWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planId = Number.parseInt(req.params.planId);
    const clientId = Number.parseInt(req.params.clientId);

    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        trainerId: userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({ message: "Piano di allenamento non trovato" });
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        trainerId: userId,
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente non trovato" });
    }

    await prisma.workoutPlan.update({
      where: { id: planId },
      data: { clientId: clientId },
    });

    if (client.userId) {
      await notificationController.createSystemNotification(
        client.userId,
        `Ti è stato assegnato un nuovo piano di allenamento: ${existingPlan.title}`,
        "workout",
        planId
      );
    }

    res.status(200).json({ message: "Piano assegnato con successo" });
  } catch (error) {
    next(error);
  }
};

// Ritorna tutti i piani di allenamento associati al cliente loggato
exports.getWorkoutPlanForClient = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        workoutPlans: {
          include: {
            exercises: true,
            trainer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client || client.workoutPlans.length === 0) {
      return res.status(404).json({ message: "Nessun piano di allenamento trovato" });
    }

    res.status(200).json(client.workoutPlans);
  } catch (error) {
    next(error);
  }
};
