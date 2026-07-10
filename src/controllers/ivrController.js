// CONTROLADOR DEL SISTEMA IVR

// 1. Maneja el saludo inicial y abre el receptor de dígitos (<Gather>)
export const iniciarLlamada = (req, res) => {
  // Retornamos el XML en una sola línea continua para evitar errores de compilación en Twilio
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?><Response><Gather numDigits="1" action="/api/ivr/procesar-seleccion" method="POST" timeout="5"><Say language="en-US" voice="Polly.Kendall">Welcome to Vrinet. If you placed an order press 1. If you believe this is fraud press 2.</Say></Gather><Say language="en-US" voice="Polly.Kendall">No input received. Goodbye.</Say></Response>';

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.status(200).send(xml);
};

// 2. Procesa la opción que el cliente marcó en su teléfono
export const procesarMenu = (req, res) => {
  const laTecla = req.body && req.body.Digits ? req.body.Digits : null;
  let xml = "";

  // Validamos las opciones 1, 2 o el 4 (por si el entorno de prueba consume el primer dígito)
  if (laTecla === "1" || laTecla === "2" || laTecla === "4") {
    xml =
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say language="en-US" voice="Polly.Kendall">Thank you. Please hold while we transfer your call.</Say><Dial>+1234567890</Dial></Response>';
  } else {
    xml =
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say language="en-US" voice="Polly.Kendall">Invalid option. Goodbye.</Say><Hangup/></Response>';
  }

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.status(200).send(xml);
};
