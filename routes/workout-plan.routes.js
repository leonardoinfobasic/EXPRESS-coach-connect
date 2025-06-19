const express = require("express");
const {
  getWorkoutPlans,
  getWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  assignWorkoutPlan,
} = require("../controllers/workout-plan.controller");
const { getWorkoutPlanForClient } = require("../controllers/workout-plan.controller");


const { authJwt } = require("../middlewares/auth.middleware"); // ✅ IMPORTATO

const router = express.Router();

// Tutte le rotte sono protette da autenticazione

// Ottieni tutti i piani di allenamento
router.get("/", authJwt, getWorkoutPlans);

router.get("/client/me", authJwt, getWorkoutPlanForClient);

// Ottieni un piano di allenamento specifico
router.get("/:id", authJwt, getWorkoutPlan);

// Crea un nuovo piano di allenamento
router.post("/", authJwt, createWorkoutPlan);

// Aggiorna un piano di allenamento
router.put("/:id", authJwt, updateWorkoutPlan);

// Elimina un piano di allenamento
router.delete("/:id", authJwt, deleteWorkoutPlan);

// Assegna un piano a un cliente
router.post("/:planId/assign/:clientId", authJwt, assignWorkoutPlan);




module.exports = router;
