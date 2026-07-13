// UTILIDADES DE PARSEO DE DATOS

/**
 * Traduce una cadena XML básica de TwiML a un objeto JSON simple para la interfaz web.
 * @param {string} xmlString - El XML crudo que viene de la API.
 * @returns {Object} Un objeto con las etiquetas clave como texto limpio.
 */
export function parseXmlToJson(xmlString) {
  const response = {};

  try {
    // Buscamos el contenido de la etiqueta <Say> usando expresiones regulares básicas
    const sayMatch = xmlString.match(/<Say[^>]*>([\s\S]*?)<\/Say>/);
    if (sayMatch && sayMatch[1]) {
      response.say = sayMatch[1].trim();
    }
  } catch (error) {
    console.error("Error parsing simulated XML response:", error);
  }

  return response;
}
