import express from "express";
import ivrRoutes from "./routes/ivrRoutes.js";

const app = express();

// Middlewares esenciales para parsear JSON y datos de formularios (Twilio envía datos como x-www-form-urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware global para bypass de túneles (Evita pantallas de advertencia de ngrok/localtunnel)
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  res.setHeader("Bypass-Tunnel-Reminder", "true");
  next();
});

// Registrar las rutas del IVR bajo el prefijo /api/ivr
app.use("/api/ivr", ivrRoutes);

// Puerto de escucha local
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Servidor IVR Profesional corriendo en el puerto ${PORT}`);
  console.log(
    `🔗 Webhook inicial listo en: http://localhost:${PORT}/api/ivr/iniciar`,
  );
  console.log(`=================================================`);
});
