import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const projectEndpoint = process.env.FOUNDRY_PROJECT_ENDPOINT;
const agentName = process.env.FOUNDRY_AGENT_NAME;
const modelDeployment = process.env.FOUNDRY_MODEL_DEPLOYMENT;

if (!projectEndpoint || !agentName || !modelDeployment) {
  throw new Error("FOUNDRY_PROJECT_ENDPOINT, FOUNDRY_AGENT_NAME y FOUNDRY_MODEL_DEPLOYMENT son obligatorias.");
}

const projectClient = new AIProjectClient(projectEndpoint, new DefaultAzureCredential());
const agent = await projectClient.agents.createVersion(agentName, {
  kind: "prompt",
  model: modelDeployment,
  instructions: [
    "Eres el asistente virtual de Río Claro.",
    "Ayuda únicamente con productos, servicios y procesos de RhinoSoft.",
    "Si la pregunta no está relacionada con RhinoSoft, recházala amablemente y explica el alcance.",
    "No inventes datos. Indica cuando no tengas información suficiente.",
    "Sigue las prácticas de IA responsable: sé respetuoso, transparente, seguro y protege la privacidad."
  ].join(" ")
});

console.log(`Agente creado: ${agent.name ?? agentName}`);
console.log(`Versión: ${agent.version ?? "actual"}`);
