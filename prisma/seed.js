const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniziando il seeding del database...")

  // Hash della password per tutti gli utenti
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Crea utenti
  const trainer = await prisma.user.upsert({
    where: { email: "mario@example.com" },
    update: {},
    create: {
      name: "Mario Rossi",
      email: "mario@example.com",
      password: hashedPassword,
      role: "TRAINER",
    },
  })

  const client1 = await prisma.user.upsert({
    where: { email: "giulia@example.com" },
    update: {},
    create: {
      name: "Giulia Bianchi",
      email: "giulia@example.com",
      password: hashedPassword,
      role: "CLIENT",
    },
  })

  const client2 = await prisma.user.upsert({
    where: { email: "luca@example.com" },
    update: {},
    create: {
      name: "Luca Verdi",
      email: "luca@example.com",
      password: hashedPassword,
      role: "CLIENT",
    },
  })

  const client3 = await prisma.user.upsert({
    where: { email: "anna@example.com" },
    update: {},
    create: {
      name: "Anna Neri",
      email: "anna@example.com",
      password: hashedPassword,
      role: "CLIENT",
    },
  })

  console.log("✅ Utenti creati")

  // Crea profili clienti
  const clientProfile1 = await prisma.client.upsert({
    where: { userId: client1.id },
    update: {},
    create: {
      userId: client1.id,
      trainerId: trainer.id,
      height: 165.5,
      weight: 60.2,
      fitnessGoal: "Perdere peso e tonificare",
      healthIssues: "Nessuno",
      notes: "Cliente motivato",
    },
  })

  const clientProfile2 = await prisma.client.upsert({
    where: { userId: client2.id },
    update: {},
    create: {
      userId: client2.id,
      trainerId: trainer.id,
      height: 180.0,
      weight: 85.5,
      fitnessGoal: "Aumentare massa muscolare",
      healthIssues: "Problemi alla schiena",
      notes: "Necessita di esercizi specifici per la schiena",
    },
  })

  const clientProfile3 = await prisma.client.upsert({
    where: { userId: client3.id },
    update: {},
    create: {
      userId: client3.id,
      trainerId: trainer.id,
      height: 170.0,
      weight: 65.0,
      fitnessGoal: "Migliorare resistenza",
      healthIssues: "Nessuno",
      notes: "Prepararsi per una maratona",
    },
  })

  console.log("✅ Profili clienti creati")

  // Crea piani di allenamento
  const workoutPlan1 = await prisma.workoutPlan.create({
    data: {
      clientId: clientProfile1.id,
      title: "Piano di tonificazione",
      description: "Piano di allenamento per tonificare tutto il corpo",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-07-31"),
      status: "ACTIVE",
    },
  })

  const workoutPlan2 = await prisma.workoutPlan.create({
    data: {
      clientId: clientProfile2.id,
      title: "Piano di ipertrofia",
      description: "Piano di allenamento per aumentare la massa muscolare",
      startDate: new Date("2023-06-15"),
      endDate: new Date("2023-08-15"),
      status: "ACTIVE",
    },
  })

  const workoutPlan3 = await prisma.workoutPlan.create({
    data: {
      clientId: clientProfile3.id,
      title: "Piano di resistenza",
      description: "Piano di allenamento per migliorare la resistenza",
      startDate: new Date("2023-06-10"),
      endDate: new Date("2023-08-10"),
      status: "ACTIVE",
    },
  })

  console.log("✅ Piani di allenamento creati")

  // Crea esercizi per il piano di tonificazione
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutPlanId: workoutPlan1.id,
        day: 1,
        exerciseName: "Squat",
        sets: 3,
        reps: "12-15",
        weight: "Corpo libero",
        restTime: "60s",
        notes: "Mantieni la schiena dritta",
        exerciseOrder: 1,
      },
      {
        workoutPlanId: workoutPlan1.id,
        day: 1,
        exerciseName: "Push-up",
        sets: 3,
        reps: "10-12",
        weight: "Corpo libero",
        restTime: "60s",
        notes: "Mantieni il core contratto",
        exerciseOrder: 2,
      },
      {
        workoutPlanId: workoutPlan1.id,
        day: 1,
        exerciseName: "Plank",
        sets: 3,
        reps: "30s",
        weight: "Corpo libero",
        restTime: "45s",
        notes: "Mantieni la posizione corretta",
        exerciseOrder: 3,
      },
    ],
  })

  // Crea esercizi per il piano di ipertrofia
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutPlanId: workoutPlan2.id,
        day: 1,
        exerciseName: "Panca piana",
        sets: 4,
        reps: "8-10",
        weight: "60kg",
        restTime: "90s",
        notes: "Aumenta il peso gradualmente",
        exerciseOrder: 1,
      },
      {
        workoutPlanId: workoutPlan2.id,
        day: 1,
        exerciseName: "Trazioni",
        sets: 4,
        reps: "8-10",
        weight: "Corpo libero",
        restTime: "90s",
        notes: "Usa l'assistenza se necessario",
        exerciseOrder: 2,
      },
    ],
  })

  // Crea esercizi per il piano di resistenza
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutPlanId: workoutPlan3.id,
        day: 1,
        exerciseName: "Corsa",
        sets: 1,
        reps: "30 minuti",
        weight: "N/A",
        restTime: "N/A",
        notes: "Mantieni un ritmo costante",
        exerciseOrder: 1,
      },
      {
        workoutPlanId: workoutPlan3.id,
        day: 1,
        exerciseName: "Burpees",
        sets: 3,
        reps: "15",
        weight: "Corpo libero",
        restTime: "45s",
        notes: "Esegui il movimento completo",
        exerciseOrder: 2,
      },
    ],
  })

  console.log("✅ Esercizi creati")

  // Crea messaggi
  await prisma.message.createMany({
    data: [
      {
        senderId: trainer.id,
        receiverId: client1.id,
        content: "Ciao Giulia, come sta andando con il nuovo piano di allenamento?",
      },
      {
        senderId: client1.id,
        receiverId: trainer.id,
        content: "Ciao Mario, sta andando molto bene! Sento già dei miglioramenti.",
      },
      {
        senderId: trainer.id,
        receiverId: client2.id,
        content: "Ciao Luca, ricordati di fare gli esercizi per la schiena che ti ho consigliato.",
      },
      {
        senderId: client2.id,
        receiverId: trainer.id,
        content: "Grazie per il promemoria, li sto facendo regolarmente.",
      },
    ],
  })

  console.log("✅ Messaggi creati")

  // Crea notifiche
  await prisma.notification.createMany({
    data: [
      {
        userId: client1.id,
        title: "Nuovo piano di allenamento",
        message: "Il tuo trainer ha creato un nuovo piano di allenamento per te",
        type: "WORKOUT_PLAN",
      },
      {
        userId: client2.id,
        title: "Nuovo piano di allenamento",
        message: "Il tuo trainer ha creato un nuovo piano di allenamento per te",
        type: "WORKOUT_PLAN",
      },
      {
        userId: trainer.id,
        title: "Nuovo messaggio",
        message: "Hai ricevuto un nuovo messaggio da Giulia Bianchi",
        type: "MESSAGE",
      },
    ],
  })

  console.log("✅ Notifiche create")
  console.log("🎉 Seeding completato con successo!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
