---
name: 'Backend Express'
description: 'Usar al crear o modificar el backend Node.js que llama a Microsoft Foundry.'
applyTo: 'server.js,scripts/**'
---
# Reglas del backend

* Crea el `AIProjectClient` y el cliente de OpenAI una sola vez al iniciar, no en cada request.
* Referencia al agente en cada `responses.create` con
  `{ body: { agent_reference: { name: AGENT_NAME, type: "agent_reference" } } }`.
  Nunca uses la propiedad `agent` (la API la rechaza con 400).
* Respeta el contrato de /api/chat de copilot-instructions.md: respuesta `{ reply, conversation_id }`
  y errores `{ detail }`.
* Usa `async/await` y envuelve las llamadas al SDK en `try/catch` y responde 502 genérico.
* Resuelve rutas de archivos con `import.meta.dirname`, no con el directorio actual.
* Lee las variables FOUNDRY_PROJECT_ENDPOINT, FOUNDRY_AGENT_NAME y FOUNDRY_MODEL_DEPLOYMENT; no
  inventes otros nombres.
* scripts/create-agent.js crea el agente con kind "prompt" y debe incluir en sus instrucciones la
  regla de alcance (solo temas de RhinoSoft) y las reglas de IA responsable.
* No agregues dependencias nuevas sin mencionarlas en el plan.