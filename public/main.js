import { parseXmlToJson } from "./utils.js";

// SELECTORES ELEMENTOS
const terminalText = document.getElementById("terminal-text");
const btnLlamar = document.getElementById("btn-llamar");
const btnColgar = document.getElementById("btn-colgar");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const keypadButtons = document.querySelectorAll(".key-btn");

// LISTA DE CONTACTOS Y CONTROLES CORREGIDOS
const phoneInput = document.getElementById("phone-input");
const btnAddNumber = document.getElementById("btn-add-number");
const numbersList = document.getElementById("numbers-list");

// METRICAS
const countAns = document.getElementById("count-ans");

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
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

// ACCIONES DE LLAMADA
async function iniciarLlamada() {
  activeCall = true;
  updateStatus("calling");
  const destination = selectedNumber || "Test Line";
  updateTerminal(`Dialing to: ${destination}...`, "system");

  // Simula sumar uno al contador de contestadas cuando conecta
  let currentAns = parseInt(countAns.textContent.replace(",", ""));
  countAns.textContent = (currentAns + 1).toLocaleString();

  try {
    const response = await fetch("/api/ivr/iniciar", { method: "POST" });
    if (response.ok) {
      const xml = await response.text();
      const parsed = parseXmlToJson(xml);
      if (parsed.say) {
        updateTerminal(parsed.say, "ivr");
        hablar(parsed.say);
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
  window.speechSynthesis.cancel();
  updateStatus("idle");
  updateTerminal("Call ended. System returned to standby.", "system");
}

// ENVIAR DÍGITO SELECCIONADO (INTERACCIÓN IVR)
async function enviarDigito(digito) {
  if (!activeCall) return;

  updateTerminal(`DTMF tone sent: Key [${digito}]`, "system");

  try {
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
        hablar(parsed.say);
      }
    }
  } catch (err) {
    updateTerminal(`Error sending tone: ${err.message}`, "system");
  }
}

// GESTIÓN DINÁMICA DE CONTACTOS (CORREGIDA)
function renderNumbers() {
  numbersList.innerHTML = "";
  savedNumbers.forEach((num, index) => {
    const li = document.createElement("li");

    const numSpan = document.createElement("span");
    numSpan.textContent = `📱 ${num}`;

    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete";
    delBtn.textContent = "✖";
    delBtn.setAttribute("data-index", index);

    li.appendChild(numSpan);
    li.appendChild(delBtn);

    if (selectedNumber === num) {
      li.classList.add("selected");
    }

    // Selección de número al hacer clic
    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-delete")) return;
      selectedNumber = num;
      renderNumbers();
      updateTerminal(`Selected target: ${num}. Press CALL to dial.`, "system");
    });

    // Eliminar número
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (savedNumbers[index] === selectedNumber) {
        selectedNumber = null;
      }
      savedNumbers.splice(index, 1);
      renderNumbers();
    });

    numbersList.appendChild(li);
  });
}

// EVENTOS DE LA INTERFAZ
btnLlamar.addEventListener("click", iniciarLlamada);
btnColgar.addEventListener("click", colgarLlamada);

// AGREGAR NÚMERO (CORREGIDO DE RAÍZ)
btnAddNumber.addEventListener("click", () => {
  const val = phoneInput.value.trim();
  if (val) {
    savedNumbers.push(val);
    phoneInput.value = "";
    renderNumbers();
    updateTerminal(`Added and synchronized: ${val}`, "system");
  } else {
    updateTerminal("Please enter a valid number.", "system");
  }
});

phoneInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    btnAddNumber.click();
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
