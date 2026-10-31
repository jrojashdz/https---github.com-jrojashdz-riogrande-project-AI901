const chat = document.querySelector("#chat");
const form = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message");
const sendButton = document.querySelector("#send");
const newChatButton = document.querySelector("#new-chat");
const dictateButton = document.querySelector("#dictate");

let conversationId = null;

function addMessage(text, type = "assistant") {
  const message = document.createElement("div");
  message.className = `message message-${type}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  message.appendChild(bubble);
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
  return message;
}

function setLoading(isLoading) {
  sendButton.disabled = isLoading;
  newChatButton.disabled = isLoading;
  messageInput.disabled = isLoading;
  sendButton.textContent = isLoading ? "Escribiendo…" : "Enviar";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message || sendButton.disabled) return;

  addMessage(message, "user");
  messageInput.value = "";
  setLoading(true);

  try {
    const result = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversation_id: conversationId })
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.detail || "No fue posible enviar el mensaje.");
    conversationId = data.conversation_id;
    const responseMessage = addMessage(data.reply);
    addSpeakButton(responseMessage, data.reply);
  } catch (error) {
    addMessage(error.message, "error");
  } finally {
    setLoading(false);
    messageInput.focus();
  }
});

newChatButton.addEventListener("click", () => {
  conversationId = null;
  chat.replaceChildren();
  addMessage("Nueva conversación iniciada. ¿En qué puedo ayudarte?");
  messageInput.focus();
});

function addSpeakButton(messageElement, text) {
  if (!("speechSynthesis" in window)) return;
  const speakButton = document.createElement("button");
  speakButton.className = "icon-button";
  speakButton.type = "button";
  speakButton.textContent = "🔊";
  speakButton.setAttribute("aria-label", "Escuchar respuesta");
  speakButton.title = "Escuchar respuesta";
  speakButton.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  });
  messageElement.appendChild(speakButton);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "es-MX";
  recognition.addEventListener("result", (event) => {
    messageInput.value = event.results[0][0].transcript;
    messageInput.focus();
  });
  recognition.addEventListener("end", () => { dictateButton.disabled = false; });
  dictateButton.addEventListener("click", () => {
    dictateButton.disabled = true;
    recognition.start();
  });
} else {
  dictateButton.hidden = true;
}
