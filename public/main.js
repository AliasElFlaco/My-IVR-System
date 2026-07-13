// LÓGICA DE LA INTERFAZ WEB DEL IVR

import { parseXmlToJson } from "./utils.js"; // Importación modular estricta

const terminalText = document.getElementById("terminal-text");
const btnIniciar = document.getElementById("btn-iniciar");

// Función auxiliar para actualizar la terminal simulada
function updateTerminal(message, type = "system") {
  terminalText.textContent = `[${type.toUpperCase()}] ${message}`;
  // Cambia el color del texto según el tipo
  terminalText.style.color = type === "ivr" ? "#38bdf8" : "#a7f3d0";
}

// Evento principal: Clic en el botón cristalino de inicio
btnIniciar.addEventListener("click", async () => {
  try {
    updateTerminal("Connecting to IVR Cyber Pipeline...", "system");

    // Hacemos la petición real al endpoint de nuestro servidor Express
    const response = await fetch("/api/ivr/iniciar", { method: "POST" });

    if (response.ok) {
      const rawXml = await response.text();

      // Convertimos el XML de respuesta en un objeto JSON legible
      const parsedResponse = parseXmlToJson(rawXml);
      console.log("IVR JSON Response:", parsedResponse);

      // Extraemos el saludo inicial
      if (parsedResponse.say) {
        updateTerminal(parsedResponse.say, "ivr");
      } else {
        updateTerminal(
          "Wait, call established but greeting is missing.",
          "error",
        );
      }
    } else {
      updateTerminal(`Pipeline Error. Status: ${response.status}`, "error");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    updateTerminal(
      `Fatal Error connecting to backend: ${error.message}`,
      "error",
    );
  }
});
