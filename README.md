# Río Claro — Chatbot con Microsoft Foundry

Aplicación web de Distribuidora Río Claro con un asistente conversacional conectado a Microsoft Foundry.

## Integrantes del equipo

- Jesús Rojas Hernández
- Aldo Hernández Díaz

## Funcionalidades

- Chat multi-turno con Microsoft Foundry.
- Preguntas frecuentes para iniciar la conversación.
- Interfaz responsive para escritorio y móvil.
- Dictado por voz y lectura de respuestas.
- Carga y lectura local de facturas PDF con JavaScript y PDF.js.
- Dashboard visual de facturas con estados:
  - Validada
  - Pendiente
  - Duplicada

> La lectura de facturas es una simulación local del navegador. No la realiza el agente de Microsoft Foundry ni utiliza `/api/chat`.

## Tecnologías

- Node.js 24 LTS
- Express 5
- JavaScript vanilla
- HTML y CSS
- Microsoft Foundry
- `@azure/ai-projects` 2.x
- `@azure/identity`
- PDF.js
- Azure App Service Linux

## Requisitos

- Node.js 24 LTS
- npm
- Azure CLI, si deseas desplegar
- Acceso configurado a Microsoft Foundry

## Configuración local

Copia el archivo de ejemplo:

```powershell
Copy-Item .env.example .env