import express from "express";
import { iniciarLlamada, procesarMenu } from "../controllers/ivrController.js";

const router = express.Router();

// Ruta principal: El Webhook que Twilio llamará al recibir/generar la llamada
router.post("/iniciar", iniciarLlamada);

// Ruta de procesamiento: Maneja la opción (1 o 2) digitada por el usuario
router.post("/procesar-seleccion", procesarMenu);

export default router;
