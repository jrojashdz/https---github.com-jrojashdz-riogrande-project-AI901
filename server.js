import express from "express";
import path from "node:path";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const app = express();
const port = Number(process.env.PORT) || 3000;
const projectEndpoint = process.env.FOUNDRY_PROJECT_ENDPOINT;
const agentName = process.env.FOUNDRY_AGENT_NAME;

if (!projectEndpoint || !agentName) {
  throw new Error("FOUNDRY_PROJECT_ENDPOINT y FOUNDRY_AGENT_NAME son obligatorias.");
}

const projectClient = new AIProjectClient(projectEndpoint, new DefaultAzureCredential());
const openai = projectClient.getOpenAIClient();
const agentReference = {
  body: {
    agent_reference: {
      name: agentName,
      type: "agent_reference"
    }
  }
};

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(import.meta.dirname, "public")));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/chat", async (request, response) => {
  const { message, conversation_id: conversationId } = request.body ?? {};

  if (typeof message !== "string" || message.trim().length < 1 || message.length > 2000) {
    response.status(422).json({ detail: "El mensaje debe tener entre 1 y 2000 caracteres." });
    return;
  }

  try {
    const conversation = conversationId
      ? { id: conversationId }
      : await openai.conversations.create();
    const result = await openai.responses.create(
      {
        conversation: conversation.id,
        input: message.trim()
      },
      agentReference
    );

    response.json({
      reply: result.output_text,
      conversation_id: conversation.id
    });
  } catch (error) {
    console.error("Error al consultar Microsoft Foundry:", error);
    response.status(502).json({ detail: "No fue posible obtener una respuesta del asistente." });
  }
});

app.use((error, _request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    response.status(400).json({ detail: "El cuerpo de la solicitud debe ser JSON válido." });
    return;
  }
  next(error);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}.`);
});
