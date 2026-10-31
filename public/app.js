const chat = document.querySelector("#chat");
const form = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message");
const sendButton = document.querySelector("#send");
const newChatButton = document.querySelector("#new-chat");
const dictateButton = document.querySelector("#dictate");
const navButtons = document.querySelectorAll("[data-view]");
const faqButtons = document.querySelectorAll(".faq-button");
const invoiceFile = document.querySelector("#invoice-file");
const dropZone = document.querySelector("#drop-zone");
const filePreview = document.querySelector("#file-preview");
const invoiceResult = document.querySelector("#invoice-result");
const invoiceFields = document.querySelector("#invoice-fields");
const invoiceProducts = document.querySelector("#invoice-products");
const extractionWarning = document.querySelector("#extraction-warning");
const clearInvoiceButton = document.querySelector("#clear-invoice");
const statusFilter = document.querySelector("#status-filter");

let conversationId = null;

function showView(viewId) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-visible", view.id === viewId);
  });
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.textContent;
    messageInput.focus();
  });
});

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

async function showFilePreview(file) {
  if (!file) return;
  if (file.type !== "application/pdf") {
    filePreview.hidden = false;
    filePreview.textContent = "Selecciona un archivo PDF para extraer sus datos.";
    invoiceResult.hidden = true;
    return;
  }
  filePreview.hidden = false;
  filePreview.textContent = `Leyendo ${file.name} (${Math.ceil(file.size / 1024)} KB)...`;
  try {
    const text = await extractPdfText(file);
    const invoice = parseInvoice(text);
    renderInvoice(invoice);
    filePreview.textContent = `${file.name} · Extracción local completada. El archivo no se envió al asistente.`;
  } catch (error) {
    invoiceResult.hidden = true;
    filePreview.textContent = `No fue posible leer el PDF: ${error.message}`;
  }
}

async function extractPdfText(file) {
  const pdfjs = await import("/vendor/pdfjs/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.mjs";
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  return pages.join("\n");
}

function parseMoney(value) {
  return value ? value.replace(/[$,\s]/g, "") : "";
}

function parseInvoice(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const find = (pattern) => normalized.match(pattern)?.[1]?.trim() || "No identificado";
  const productPattern = /(\d+)\s+(.*?)\s+\(?(P\d{3})\)?\s+\$?([\d,]+\.\d{2})\s+\$?([\d,]+\.\d{2})/g;
  const products = [];
  let match;
  while ((match = productPattern.exec(normalized)) !== null) {
    products.push({ quantity: match[1], description: `${match[2].trim()} (${match[3]})`, unit: match[4], amount: match[5] });
  }
  return {
    provider: find(/([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ]+SA(?:\s+DE\s+CV)?)/i),
    providerRfc: find(/RFC:\s*([A-Z0-9]{12,13})/i),
    folio: find(/Folio:\s*([A-Z0-9-]+)/i),
    date: find(/Fecha:\s*(\d{4}-\d{2}-\d{2})/i),
    currency: find(/Moneda:\s*([A-Z]{3})/i),
    payment: find(/Método de pago:\s*(.+?)(?=\s+Vencimiento:)/i),
    dueDate: find(/Vencimiento:\s*(\d{4}-\d{2}-\d{2})/i),
    order: find(/Orden de compra:\s*([A-Z0-9-]+)/i),
    client: find(/CLIENTE:\s*(.+?)(?=\s+RFC:)/i),
    clientRfc: find(/CLIENTE:.*?RFC:\s*([A-Z0-9]{12,13})/i),
    subtotal: parseMoney(find(/Subtotal:\s*\$?([\d,]+\.\d{2})/i)),
    tax: parseMoney(find(/IVA\s*\(\s*16%\s*\):\s*\$?([\d,]+\.\d{2})/i)),
    total: parseMoney(find(/TOTAL:\s*\$?([\d,]+\.\d{2})/i)),
    products
  };
}

function addField(label, value) {
  const field = document.createElement("div");
  field.className = "invoice-field";
  const fieldLabel = document.createElement("span");
  fieldLabel.textContent = label;
  const fieldValue = document.createElement("strong");
  fieldValue.textContent = value;
  field.append(fieldLabel, fieldValue);
  invoiceFields.appendChild(field);
}

function renderInvoice(invoice) {
  invoiceFields.replaceChildren();
  invoiceProducts.replaceChildren();
  [
    ["Proveedor", invoice.provider], ["RFC proveedor", invoice.providerRfc],
    ["Folio", invoice.folio], ["Fecha", invoice.date], ["Moneda", invoice.currency],
    ["Método de pago", invoice.payment], ["Vencimiento", invoice.dueDate],
    ["Orden de compra", invoice.order], ["Cliente", invoice.client],
    ["RFC cliente", invoice.clientRfc], ["Subtotal", `$${invoice.subtotal}`],
    ["IVA", `$${invoice.tax}`], ["Total", `$${invoice.total}`]
  ].forEach(([label, value]) => addField(label, value));
  invoice.products.forEach((product) => {
    const row = document.createElement("tr");
    [product.quantity, product.description, `$${product.unit}`, `$${product.amount}`].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    invoiceProducts.appendChild(row);
  });
  extractionWarning.hidden = invoice.products.length > 0;
  extractionWarning.textContent = "No se detectaron líneas de productos con el formato esperado.";
  invoiceResult.hidden = false;
}

invoiceFile.addEventListener("change", () => showFilePreview(invoiceFile.files[0]));
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
});
["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  });
});
dropZone.addEventListener("drop", (event) => showFilePreview(event.dataTransfer.files[0]));

clearInvoiceButton.addEventListener("click", () => {
  invoiceFile.value = "";
  filePreview.hidden = true;
  invoiceResult.hidden = true;
  invoiceFields.replaceChildren();
  invoiceProducts.replaceChildren();
});

statusFilter.addEventListener("change", () => {
  document.querySelectorAll("#invoice-list tr").forEach((row) => {
    row.hidden = statusFilter.value !== "all" && row.dataset.status !== statusFilter.value;
  });
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
