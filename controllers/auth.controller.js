const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const prisma = require("../lib/prisma")

// Registrazione utente
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    // Verifica se l'email è già in uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: "Email già in uso" })
    }

    // Hash della password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Crea il nuovo utente
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "CLIENT",
      },
    })

    // Se è un CLIENT, crea anche il record nella tabella Client
    let clientProfile = null
    if (role === "CLIENT" || !role) {
      clientProfile = await prisma.client.create({
        data: {
          userId: user.id,
          trainerId: 1, // 👈 puoi settare un trainerId di default o lasciarlo null se lo rendi opzionale
        },
      })
    }

    // Genera il token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" })

    // Rimuovi la password prima di inviare la risposta
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      message: "Utente registrato con successo",
      token,
      user: userWithoutPassword,
      clientProfile, // puoi anche ometterlo se non ti serve subito
    })
  } catch (error) {
    next(error)
  }
}

// Login utente
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Verifica se l'utente esiste
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ message: "Credenziali non valide" })
    }

    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenziali non valide" })
    }

    // Genera il token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" })

    // Rimuovi la password dai dati dell'utente
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      message: "Login effettuato con successo",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
}


// ✅ Ottieni profilo completo utente
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Se è trainer
        trainedClients: {
          include: {
            user: true, // nome, email, ecc. del cliente
            workoutPlans: true,
          },
        },
        createdWorkoutPlans: true, // schede che ha creato

        // Se è cliente
        clientProfile: {
          include: {
            trainer: true, // dati del trainer
            workoutPlans: true, // allenamenti ricevuti
          },
        },
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Errore getProfile:", error);
    next(error);
  }
};

// Aggiorna profilo utente
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, bio } = req.body
    const userId = req.user.id

    // Verifica se l'email è già in uso da un altro utente
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return res.status(400).json({ message: "Email già in uso" })
      }
    }

    // Aggiorna il profilo utente
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(bio && { bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        role: true,
        avatar: true,
      },
    })

    res.status(200).json({
      message: "Profilo aggiornato con successo",
      user: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}

// Aggiorna preferenze notifiche
exports.updateNotifications = async (req, res, next) => {
  try {
    const { emailNotifications, pushNotifications, messageNotifications } = req.body
    const userId = req.user.id

    // Aggiorna le preferenze di notifica
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotifications: emailNotifications !== undefined ? emailNotifications : req.user.emailNotifications,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : req.user.pushNotifications,
        messageNotifications: messageNotifications !== undefined ? messageNotifications : req.user.messageNotifications,
      },
      select: {
        id: true,
        emailNotifications: true,
        pushNotifications: true,
        messageNotifications: true,
      },
    })

    res.status(200).json({
      message: "Preferenze notifiche aggiornate con successo",
      notifications: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}

// Cambia password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    // Verifica la password attuale
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Password attuale non corretta" })
    }

    // Hash della nuova password
    const salt = await bcrypt.genSalt(10)
    const hashedNewPassword = await bcrypt.hash(newPassword, salt)

    // Aggiorna la password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    })

    res.status(200).json({
      message: "Password cambiata con successo",
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/users/me → restituisce i dati dell'utente attuale
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me → aggiorna nome ed email
exports.updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Reset password tramite email (senza token email, solo aggiornamento diretto)
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password aggiornata con successo" });
  } catch (error) {
    console.error("Errore forgotPassword:", error);
    next(error);
  }
};

exports.resetPasswordByEmail = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password aggiornata con successo" });
  } catch (error) {
    next(error);
  }
};