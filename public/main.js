import { parseXmlToJson } from "./utils.js";

// SELECTORES ELEMENTOS
const terminalText = document.getElementById("terminal-text");
const btnLlamar = document.getElementById("btn-llamar");
const btnColgar = document.getElementById("btn-colgar");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const keypadButtons = document.querySelectorAll(".key-btn");

// LISTA DE CONTACTOS
const phoneInput = document.getElementById("phone-input");
const btnAddNumber = document.getElementById("btn-add-number");
const numbersList = document.getElementById("numbers-list");

// ESTADO DE LA APLICACIÓN
let activeCall = false;
let selectedNumber = null;
let savedNumbers = ["+1 (800) 555-0199", "+1 (555) 742-1337"];

// INICIALIZACIÓN
function init() {
  renderNumbers();
  updateStatus("idle");
}

// ACTUALIZAR ESTADO VISUAL
function updateStatus(state) {
  if (state === "idle") {
    statusDot.className = "status-dot offline";
    statusText.textContent = "SYSTEM: IDLE (READY)";
    btnLlamar.disabled = false;
    btnColgar.disabled = true;
    toggleKeypad(false);
  } else if (state === "calling") {
    statusDot.className = "status-dot online pulsing";
    statusText.textContent = "SYSTEM: CALL CONNECTED";
    btnLlamar.disabled = true;
    btnColgar.disabled = false;
    toggleKeypad(true);
  }
}

function toggleKeypad(enable) {
  keypadButtons.forEach((btn) => (btn.disabled = !enable));
}

// REPRODUCTOR DE VOZ (SÍNTESIS DE VOZ)
function hablar(texto) {
  // Si hay alguna lectura en curso, la detenemos
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "en-US"; // El IVR está diseñado en inglés
  utterance.rate = 1.0; // Velocidad normal

  window.speechSynthesis.speak(utterance);
}

// ACCIONES DE LLAMADA
async function iniciarLlamada() {
  activeCall = true;
  updateStatus("calling");
  const destination = selectedNumber || "Test Line";
  updateTerminal(`Dialing to: ${destination}...`, "system");

  try {
    const response = await fetch("/api/ivr/iniciar", { method: "POST" });
    if (response.ok) {
      const xml = await response.text();
      const parsed = parseXmlToJson(xml);
      if (parsed.say) {
        updateTerminal(parsed.say, "ivr");
        hablar(parsed.say); // Hace sonar el IVR en tus bocinas
      }
    } else {
      updateTerminal(`Call dropped. Code: ${response.status}`, "system");
      colgarLlamada();
    }
  } catch (err) {
    updateTerminal(`Connection lost: ${err.message}`, "system");
    colgarLlamada();
  }
}

function colgarLlamada() {
  activeCall = false;
  window.speechSynthesis.cancel(); // Silencia la voz inmediatamente
  updateStatus("idle");
  updateTerminal("Call ended. System returned to standby.", "system");
}

// ENVIAR DÍGITO SELECCIONADO (INTERACCIÓN IVR)
async function enviarDigito(digito) {
  if (!activeCall) return;

  updateTerminal(`DTMF tone sent: Key [${digito}]`, "system");

  try {
    // Hacemos el POST de simulación con el formato que espera nuestro ivrController
    const response = await fetch("/api/ivr/procesar-seleccion", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `Digits=${digito}`,
    });

    if (response.ok) {
      const xml = await response.text();
      const parsed = parseXmlToJson(xml);
      if (parsed.say) {
        updateTerminal(parsed.say, "ivr");
        hablar(parsed.say); // Habla la siguiente instrucción del flujo
      }
    }
  } catch (err) {
    updateTerminal(`Error sending tone: ${err.message}`, "system");
  }
}

// MANEJO DE CONTACTOS OUTBOUND
function renderNumbers() {
  numbersList.innerHTML = "";
  savedNumbers.forEach((num, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>📱 ${num}</span> <button class="btn-delete" data-index="${index}">✖</button>`;
    if (selectedNumber === num) li.classList.add("selected");

    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-delete")) return;
      selectedNumber = num;
      renderNumbers();
      updateTerminal(`Selected target: ${num}. Press CALL to dial.`, "system");
    });

    numbersList.appendChild(li);
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      if (savedNumbers[index] === selectedNumber) selectedNumber = null;
      savedNumbers.splice(index, 1);
      renderNumbers();
    });
  });
}

// EVENTOS DE LA INTERFAZ
btnLlamar.addEventListener("click", iniciarLlamada);
btnColgar.addEventListener("click", colgarLlamada);

btnAddNumber.addEventListener("click", () => {
  const val = phoneInput.value.trim();
  if (val) {
    savedNumbers.push(val);
    phoneInput.value = "";
    renderNumbers();
  }
});

keypadButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-key");
    enviarDigito(key);
  });
});

function updateTerminal(message, type = "system") {
  terminalText.textContent = `[${type.toUpperCase()}] ${message}`;
  terminalText.style.color = type === "ivr" ? "#38bdf8" : "#a7f3d0";
}

init();
