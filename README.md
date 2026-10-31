# Río Claro — Chatbot con Microsoft Foundry

Aplicación web de Distribuidora Río Claro con un asistente conversacional conectado a Microsoft Foundry.

## Integrantes del equipo

- Jesús Rojas Hernández
- Aldo Hernández Díaz

## Aplicación desplegada

La aplicación está disponible en Azure App Service:

**https://rio-claro-chatbot-20261030.azurewebsites.net**

Comprobación de salud:

**https://rio-claro-chatbot-20261030.azurewebsites.net/health**

## Reporte de la aplicación

Consulta el reporte completo del proyecto en [docs/APLICACION.md](docs/APLICACION.md).

El reporte incluye la descripción del problema, la arquitectura, las funcionalidades, las capturas de pantalla, la extracción local de facturas y las verificaciones realizadas.

## Funcionalidades

- Chat multi-turno con Microsoft Foundry.
- Preguntas frecuentes para iniciar la conversación.
- Interfaz responsive para escritorio y móvil.
- Dictado por voz y lectura de respuestas.
- Base de conocimiento con dos archivos consultados mediante la herramienta **File Search** de Microsoft Foundry.
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

## Instalación

Desde PowerShell:

```powershell
cd C:\workspace\cursoIA\chatbot-foundry
npm.cmd install
```

## Ejecución en desarrollo

```powershell
npm.cmd run dev
```

Abre:

```text
http://localhost:3000
```

## Ejecución normal

```powershell
npm.cmd start
```

## Verificación

Comprueba el estado del servidor:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

## Crear el agente

Si necesitas crear el agente de Foundry:

```powershell
npm.cmd run create-agent
```

## API

### Health check

```http
GET /health
```

Respuesta:

```json
{
  "status": "ok"
}
```

### Chat

```http
POST /api/chat
Content-Type: application/json
```

Solicitud:

```json
{
  "message": "¿Qué productos manejan?",
  "conversation_id": null
}
```

Respuesta:

```json
{
  "reply": "Respuesta del asistente",
  "conversation_id": "conv_xxx"
}
```

## Seguridad

- No se utilizan API keys.
- Se usa `DefaultAzureCredential`.
- El navegador no se conecta directamente con Foundry.
- Los mensajes están limitados a 2000 caracteres.
- Los PDFs se procesan localmente en el navegador.
- No se deben subir secretos, tokens ni archivos `.env`.

## Documentación adicional

- [Reporte de la aplicación](docs/APLICACION.md)
- [Instrucciones del proyecto](.github/copilot-instructions.md)

## Licencia

Proyecto académico para fines educativos.
