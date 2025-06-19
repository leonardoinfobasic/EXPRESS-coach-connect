const prisma = require("../lib/prisma")

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configura dove salvare le immagini
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nessun file caricato" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    // ✅ Salva l'URL nel campo "avatar" dell'utente loggato
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: imageUrl },
    });

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Errore nel salvataggio immagine:", error);
    res.status(500).json({ message: "Errore nel salvataggio immagine" });
  }
};


module.exports = { uploadImage };

module.exports = {
  upload,
  uploadImage,
};
