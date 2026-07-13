import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import ivrRoutes from "./routes/ivrRoutes.js";

const app = express();

// Configuración para leer rutas en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVIR LA PÁGINA WEB: Hace pública la carpeta "public"
app.use(express.static(path.join(__dirname, "../public")));

// Middleware global para bypass de túneles
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  res.setHeader("Bypass-Tunnel-Reminder", "true");
  next();
});

// Rutas de la API
app.use("/api/ivr", ivrRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Servidor e Interfaz IVR corriendo en el puerto ${PORT}`);
  console.log(`🔗 Web Interface: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
