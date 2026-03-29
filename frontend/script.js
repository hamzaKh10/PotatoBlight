const API_BASE = window.__API_BASE__ || "http://127.0.0.1:8000";

const imageInput = document.getElementById("imageInput");
const imageUploadZone = document.getElementById("imageUploadZone");
const imageUploadText = document.getElementById("imageUploadText");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");
const imagePreview = document.getElementById("imagePreview");
const analyzeImageBtn = document.getElementById("analyzeImageBtn");
const cameraInput = document.getElementById("cameraInput");
const takePhotoBtn = document.getElementById("takePhotoBtn");

const videoInput = document.getElementById("videoInput");
const videoUploadZone = document.getElementById("videoUploadZone");
const videoUploadText = document.getElementById("videoUploadText");
const videoPreviewWrap = document.getElementById("videoPreviewWrap");
const videoPreview = document.getElementById("videoPreview");
const analyzeVideoBtn = document.getElementById("analyzeVideoBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

const riskValue = document.getElementById("riskValue");
const healthScoreValue = document.getElementById("healthScoreValue");
const countValue = document.getElementById("countValue");
const trackValue = document.getElementById("trackValue");
const sickEarlyValue = document.getElementById("sickEarlyValue");
const sickLateValue = document.getElementById("sickLateValue");
const feedbackText = document.getElementById("feedbackText");
const downloadRow = document.getElementById("downloadRow");
const downloadLink = document.getElementById("downloadLink");
const apiPill = document.getElementById("apiPill");
const apiText = document.getElementById("apiText");

let selectedImageFile = null;
let selectedVideoFile = null;
let imageObjectUrl = null;
let videoObjectUrl = null;
let isBusy = false;

const defaultFeedbackText = feedbackText.textContent;
const defaultImageUploadText = imageUploadText.textContent;
const defaultVideoUploadText = videoUploadText.textContent;

function setApiStatus(state, text, title) {
  apiPill.classList.remove("api-unknown", "api-ok", "api-warn", "api-bad");
  apiPill.classList.add(state);
  apiText.textContent = text;
  apiPill.title = title || text;
}

async function checkApiHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: "GET",
      signal: controller.signal
    });
    if (!response.ok) throw new Error("Bad status");
    const data = await response.json();
    if (data?.status === "ok" && data?.model_exists) {
      setApiStatus("api-ok", "Systeme: pret", "Systeme pret");
    } else if (data?.status === "ok" && !data?.model_exists) {
      setApiStatus("api-warn", "Systeme: non pret", "Modele manquant sur le serveur");
    } else {
      setApiStatus("api-warn", "Systeme: non pret", "Systeme non pret");
    }
  } catch (e) {
    setApiStatus("api-bad", "Systeme: indisponible", "Backend indisponible");
  } finally {
    clearTimeout(timeout);
  }
}

async function analyzeFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    let message = "Erreur pendant l'analyse.";
    try {
      const data = await response.json();
      if (data.detail) message = data.detail;
    } catch (err) {
      // Keep default message.
    }
    throw new Error(message);
  }

  return response.json();
}

function resetResultsUi() {
  downloadRow.classList.add("hidden");
  downloadLink.removeAttribute("href");
}

function clearResults() {
  riskValue.textContent = "--";
  healthScoreValue.textContent = "-- / 100";
  countValue.textContent = "--";
  trackValue.textContent = "--%";
  sickEarlyValue.textContent = "--";
  sickLateValue.textContent = "--";
  feedbackText.textContent = defaultFeedbackText;
  resetResultsUi();
}

function refreshButtonStates() {
  if (isBusy) {
    imageInput.disabled = true;
    videoInput.disabled = true;
    analyzeImageBtn.disabled = true;
    analyzeVideoBtn.disabled = true;
    resetAllBtn.disabled = true;
    return;
  }

  imageInput.disabled = false;
  videoInput.disabled = false;
  analyzeImageBtn.disabled = !selectedImageFile;
  analyzeVideoBtn.disabled = !selectedVideoFile;
  resetAllBtn.disabled = !(selectedImageFile || selectedVideoFile);
}

function setDownloadLink(result) {
  const rawUrl =
    result?.outputUrl ||
    result?.output_url ||
    (result?.outputFile
      ? `/api/output/${encodeURIComponent(result.outputFile)}`
      : result?.output_file
        ? `/api/output/${encodeURIComponent(result.output_file)}`
        : null);

  if (!rawUrl) {
    resetResultsUi();
    return;
  }

  const absoluteUrl = rawUrl.startsWith("http")
    ? rawUrl
    : `${API_BASE}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

  downloadLink.href = absoluteUrl;
  downloadRow.classList.remove("hidden");
}

function updateResults(result) {
  riskValue.textContent = result?.risk ?? "--";
  healthScoreValue.textContent = `${result?.healthScore ?? "--"} / 100`;
  countValue.textContent = `${result?.count ?? "--"}`;
  trackValue.textContent = `${result?.tracking ?? "--"}%`;

  sickEarlyValue.textContent = `${result?.sickEarly ?? result?.earlySick ?? result?.early_sick ?? "--"}`;
  sickLateValue.textContent = `${result?.sickLate ?? result?.lateSick ?? result?.late_sick ?? "--"}`;

  feedbackText.textContent = result?.feedback ?? "Analyse terminee.";
  setDownloadLink(result);
}

function setupMediaSection({
  input,
  uploadZone,
  uploadText,
  previewWrap,
  previewEl,
  analyzeBtn,
  acceptPrefix,
  getSelectedFile,
  setSelectedFile,
  getObjectUrl,
  setObjectUrl,
  defaultUploadText,
  analyzingText
}) {
  function showPreview(file) {
    const previousUrl = getObjectUrl();
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    const objectUrl = URL.createObjectURL(file);
    setObjectUrl(objectUrl);
    previewEl.src = objectUrl;
    previewWrap.classList.remove("hidden");
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith(acceptPrefix)) {
      uploadText.textContent = "Format invalide.";
      return;
    }

    setSelectedFile(file);
    uploadText.textContent = `${file.name} importe`;
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = analyzingText.idle;
    showPreview(file);
    clearResults();
    refreshButtonStates();
  }

  input.addEventListener("change", (event) => {
    handleFile(event.target.files[0]);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadZone.classList.add("active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadZone.classList.remove("active");
    });
  });

  uploadZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];
    handleFile(file);
  });

  analyzeBtn.addEventListener("click", async () => {
    const file = getSelectedFile();
    if (!file) return;

    isBusy = true;
    refreshButtonStates();
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = analyzingText.loading;
    feedbackText.textContent = analyzingText.feedback;
    resetResultsUi();

    try {
      const result = await analyzeFile(file);
      updateResults(result);
    } catch (error) {
      feedbackText.textContent = `Echec: ${error.message}`;
      resetResultsUi();
    } finally {
      isBusy = false;
      refreshButtonStates();
      analyzeBtn.textContent = analyzingText.idle;
    }
  });
}

cameraInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) return;
  imageInput.value = "";
  imageUploadText.textContent = `${file.name} importe`;
  selectedImageFile = file;

  if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
  imageObjectUrl = URL.createObjectURL(file);
  imagePreview.src = imageObjectUrl;
  imagePreviewWrap.classList.remove("hidden");

  analyzeImageBtn.disabled = false;
  analyzeImageBtn.textContent = "2) Generer le resultat (image)";
  clearResults();
  refreshButtonStates();
});

takePhotoBtn.addEventListener("click", () => {
  cameraInput.click();
});

setupMediaSection({
  input: imageInput,
  uploadZone: imageUploadZone,
  uploadText: imageUploadText,
  previewWrap: imagePreviewWrap,
  previewEl: imagePreview,
  analyzeBtn: analyzeImageBtn,
  acceptPrefix: "image/",
  getSelectedFile: () => selectedImageFile,
  setSelectedFile: (file) => {
    selectedImageFile = file;
  },
  getObjectUrl: () => imageObjectUrl,
  setObjectUrl: (url) => {
    imageObjectUrl = url;
  },
  defaultUploadText: defaultImageUploadText,
  analyzingText: {
    idle: "2) Generer le resultat (image)",
    loading: "Analyse image en cours...",
    feedback: "Traitement de l'image par le modele..."
  }
});

setupMediaSection({
  input: videoInput,
  uploadZone: videoUploadZone,
  uploadText: videoUploadText,
  previewWrap: videoPreviewWrap,
  previewEl: videoPreview,
  analyzeBtn: analyzeVideoBtn,
  acceptPrefix: "video/",
  getSelectedFile: () => selectedVideoFile,
  setSelectedFile: (file) => {
    selectedVideoFile = file;
  },
  getObjectUrl: () => videoObjectUrl,
  setObjectUrl: (url) => {
    videoObjectUrl = url;
  },
  defaultUploadText: defaultVideoUploadText,
  analyzingText: {
    idle: "2) Generer le resultat (video)",
    loading: "Analyse video en cours...",
    feedback: "Traitement de la video par le modele..."
  }
});

resetAllBtn.addEventListener("click", () => {
  if (isBusy) return;

  if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
  if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);

  imageObjectUrl = null;
  videoObjectUrl = null;
  selectedImageFile = null;
  selectedVideoFile = null;

  imageInput.value = "";
  cameraInput.value = "";
  videoInput.value = "";

  imageUploadText.textContent = defaultImageUploadText;
  videoUploadText.textContent = defaultVideoUploadText;

  imagePreview.removeAttribute("src");
  videoPreview.removeAttribute("src");
  imagePreviewWrap.classList.add("hidden");
  videoPreviewWrap.classList.add("hidden");

  analyzeImageBtn.textContent = "2) Generer le resultat (image)";
  analyzeVideoBtn.textContent = "2) Generer le resultat (video)";

  clearResults();
  refreshButtonStates();
});

clearResults();
refreshButtonStates();
setApiStatus("api-unknown", "Systeme: verification...", "Etat du systeme");
checkApiHealth();
setInterval(checkApiHealth, 10000);

window.addEventListener("beforeunload", () => {
  if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
  if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
});
