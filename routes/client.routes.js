const express = require("express");
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchUsers,
} = require("../controllers/client.controller");

const { authJwt } = require("../middlewares/auth.middleware"); // ✅ IMPORTATO

const router = express.Router();

// Cerca utenti (autenticato)
router.get("/search", authJwt, searchUsers);

// Ottieni tutti i clienti
router.get("/", authJwt, getAllClients);

// Ottieni un cliente specifico
router.get("/:id", authJwt, getClientById);

// Crea un nuovo cliente
router.post("/", authJwt, createClient);

// Aggiorna un cliente
router.put("/:id", authJwt, updateClient);

// Elimina un cliente
router.delete("/:id", authJwt, deleteClient);

module.exports = router;
