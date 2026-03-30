let currentLang = "fr";

const TRANSLATIONS = {
  fr: {
    hero_subtitle: "Importez une image ou une video et obtenez le comptage, le suivi, et le niveau de risque mildiou.",
    sys_verifying: "Systeme: verification...",
    sys_ready: "Systeme: pret",
    sys_offline: "Systeme: indisponible",
    step1_title: "Importer", step1_desc: "Choisissez une image ou une video.",
    step2_title: "Generer", step2_desc: "Cliquez sur 'Generer le resultat'.",
    step3_title: "Observer", step3_desc: "L'IA analyse vos plants.",
    img_drop: "Glissez votre image ici ou", btn_browse: "Parcourir", btn_capture: "Prendre une photo",
    img_idle: "Aucun fichier image",
    btn_analyze_img: "1) Generer le resultat (image)",
    vid_drop: "Glissez votre video ici ou", vid_idle: "Aucun fichier video",
    btn_analyze_vid: "2) Generer le resultat (video)",
    step_track_1: "Upload", step_track_2: "Pre-traitement", step_track_3: "IA YOLO", step_track_4: "Finalisation",
    result_title: "Resultat",
    lbl_risk: "Risque Mildiou", lbl_health: "Score Sante", lbl_count: "Plants Detectes",
    lbl_early: "Stade Precoce (Early)", lbl_late: "Stade Avance (Late)", lbl_tracking: "Confiance de Suivi",
    feedback_idle: "Importez une image ou une video puis cliquez sur 'Generer le resultat'.",
    download_hint: "Resultat annote", btn_down_res: "Télécharger le résultat annoté",
    btn_down_pdf: "Télécharger le Rapport (PDF)", btn_reset: "Effacer"
  },
  en: {
    hero_subtitle: "Upload an image or video to get tracking, counting, and late blight risk levels.",
    sys_verifying: "System: verifying...",
    sys_ready: "System: ready",
    sys_offline: "System: unavailable",
    step1_title: "Upload", step1_desc: "Choose an image or video.",
    step2_title: "Generate", step2_desc: "Click 'Generate result'.",
    step3_title: "Observe", step3_desc: "The AI analyzes your crops.",
    img_drop: "Drag your image here or", btn_browse: "Browse", btn_capture: "Take photo",
    img_idle: "No image selected",
    btn_analyze_img: "1) Generate result (image)",
    vid_drop: "Drag your video here or", vid_idle: "No video selected",
    btn_analyze_vid: "2) Generate result (video)",
    step_track_1: "Upload", step_track_2: "Processing", step_track_3: "YOLO AI", step_track_4: "Finalizing",
    result_title: "Results",
    lbl_risk: "Blight Risk", lbl_health: "Health Score", lbl_count: "Plants Detected",
    lbl_early: "Early Stage", lbl_late: "Late Stage", lbl_tracking: "Tracking Confidence",
    feedback_idle: "Upload an image or video then click 'Generate result'.",
    download_hint: "Annotated result", btn_down_res: "Download annotated result",
    btn_down_pdf: "Download Report (PDF)", btn_reset: "Clear"
  },
  ar: {
    hero_subtitle: "قم بتحميل صورة أو فيديو للحصول على التتبع والعد ومستوى خطر اللفحة المتأخرة",
    sys_verifying: "النظام: جار التحقق...",
    sys_ready: "النظام: جاهز",
    sys_offline: "النظام: غير متوفر",
    step1_title: "استيراد", step1_desc: "اختر صورة أو فيديو",
    step2_title: "توليد", step2_desc: "انقر فوق 'توليد النتيجة'",
    step3_title: "مراقبة", step3_desc: "الذكاء الاصطناعي يحلل محاصيلك",
    img_drop: "اسحب صورتك هنا أو", btn_browse: "تصفح", btn_capture: "التقط صورة",
    img_idle: "لم يتم اختيار صورة",
    btn_analyze_img: "توليد النتيجة (صورة)",
    vid_drop: "اسحب الفيديو هنا أو", vid_idle: "لم يتم اختيار فيديو",
    btn_analyze_vid: "توليد النتيجة (فيديو)",
    step_track_1: "رفع", step_track_2: "معالجة", step_track_3: "الذكاء الاصطناعي", step_track_4: "إنهاء",
    result_title: "النتائج",
    lbl_risk: "خطر اللفحة", lbl_health: "درجة الصحة", lbl_count: "عدد النباتات",
    lbl_early: "مرحلة مبكرة", lbl_late: "مرحلة متأخرة", lbl_tracking: "ثقة التتبع",
    feedback_idle: "قم باستيراد صورة أو فيديو ثم انقر فوق 'توليد النتيجة'",
    download_hint: "نتائج مشروحة", btn_down_res: "تنزيل النتيجة",
    btn_down_pdf: "تنزيل التقرير", btn_reset: "مسح"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("langSelect");
  if(langSelect) {
    langSelect.addEventListener("change", (e) => {
      currentLang = e.target.value;
      const htmlEl = document.documentElement;
      htmlEl.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
      htmlEl.setAttribute("lang", currentLang);
      
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if(TRANSLATIONS[currentLang][key]) {
          if(el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.placeholder = TRANSLATIONS[currentLang][key];
          } else {
            el.textContent = TRANSLATIONS[currentLang][key];
          }
        }
      });
      
      // Auto-update active API pill translation if not busy
      checkApiHealth();
    });
  }
});

window.currentLang = currentLang;

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
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const potatoStepper = document.getElementById("potatoStepper");
const stepperFill = document.getElementById("stepperFill");
const rollingPotato = document.getElementById("rollingPotato");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");
const apiPill = document.getElementById("apiPill");
const apiText = document.getElementById("apiText");

let selectedImageFile = null;
let selectedVideoFile = null;
let imageObjectUrl = null;
let videoObjectUrl = null;
let isBusy = false;

let stepperTimer1 = null;
let stepperTimer2 = null;
let stepperTimer3 = null;

function startPotatoStepper() {
  potatoStepper.classList.remove("hidden");
  
  stepperFill.style.width = "0%";
  rollingPotato.style.left = "0%";
  step1.classList.remove("active");
  step2.classList.remove("active");
  step3.classList.remove("active");
  step4.classList.remove("active");
  
  stepperTimer1 = setTimeout(() => {
    stepperFill.style.width = "12%";
    rollingPotato.style.left = "12%";
    step1.classList.add("active");
  }, 100);

  stepperTimer2 = setTimeout(() => {
    stepperFill.style.width = "40%";
    rollingPotato.style.left = "40%";
    step2.classList.add("active");
  }, 1500);

  stepperTimer3 = setTimeout(() => {
    if(!isBusy) return;
    stepperFill.style.width = "83%";
    rollingPotato.style.left = "83%";
    step3.classList.add("active");
  }, 4000);
}

function finishPotatoStepper() {
  clearTimeout(stepperTimer1);
  clearTimeout(stepperTimer2);
  clearTimeout(stepperTimer3);
  
  stepperFill.style.width = "100%";
  rollingPotato.style.left = "100%";
  step1.classList.add("active");
  step2.classList.add("active");
  step3.classList.add("active");
  step4.classList.add("active");
  
  setTimeout(() => {
    potatoStepper.classList.add("hidden");
  }, 1800);
}

const defaultFeedbackText = feedbackText.textContent;
const defaultImageUploadText = imageUploadText.textContent;
const defaultVideoUploadText = videoUploadText.textContent;

function setApiStatus(state, keyOrText, title) {
  apiPill.classList.remove("api-unknown", "api-ok", "api-warn", "api-bad");
  apiPill.classList.add(state);
  
  // Realtime multi-language for system statuses
  const map = {
    "api-ok": { fr: "Systeme: pret", en: "System: ready", ar: "النظام: جاهز" },
    "api-warn": { fr: "Systeme: non pret", en: "System: not ready", ar: "النظام: غير جاهز" },
    "api-bad": { fr: "Systeme: indisponible", en: "System: unavailable", ar: "النظام: غير متوفر" }
  };
  
  const text = map[state] ? map[state][currentLang] : keyOrText;
  apiText.textContent = text;
  apiPill.title = title || text;
}

async function checkApiHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // Increased from 2500 to 8000 to prevent false "Indisponible" on free tier

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
  document.body.classList.remove("red-siren");
  const gaugeFill = document.getElementById("gaugeFill");
  if(gaugeFill) {
    gaugeFill.style.strokeDashoffset = 125.66;
    gaugeFill.classList.remove("danger");
  }
}

function clearResults() {
  riskValue.textContent = "--";
  healthScoreValue.textContent = "-- / 100";
  countValue.textContent = "--";
  trackValue.textContent = "--%";
  sickEarlyValue.textContent = "--";
  sickLateValue.textContent = "--";
  feedbackText.textContent = TRANSLATIONS[currentLang].feedback_idle || defaultFeedbackText;
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
  const rawRisk = result?.risk ?? "0%";
  riskValue.textContent = rawRisk;
  healthScoreValue.textContent = `${result?.healthScore ?? "--"} / 100`;
  countValue.textContent = `${result?.count ?? "--"}`;
  trackValue.textContent = `${result?.tracking ?? "--"}%`;

  sickEarlyValue.textContent = `${result?.sickEarly ?? result?.earlySick ?? result?.early_sick ?? "--"}`;
  sickLateValue.textContent = `${result?.sickLate ?? result?.lateSick ?? result?.late_sick ?? "--"}`;
  feedbackText.textContent = result?.feedback ?? "Analyse terminee.";
  setDownloadLink(result);

  // SVG Gauge Math
  const riskFloat = parseFloat(String(rawRisk).replace('%', '')) || 0;
  const gaugeFill = document.getElementById("gaugeFill");
  if (gaugeFill) {
    const dasharray = 125.66; // approx PI * 40
    const offset = dasharray - ((dasharray * riskFloat) / 100);
    gaugeFill.style.strokeDashoffset = offset;

    if (riskFloat > 70) {
      gaugeFill.classList.add("danger");
      document.body.classList.add("red-siren");
    } else {
      gaugeFill.classList.remove("danger");
      document.body.classList.remove("red-siren");
    }
  }

  // 3D Confetti Celebration if absolute zero risk and plants exist
  if (riskFloat === 0 && (result?.count > 0)) {
    if (typeof confetti !== "undefined") {
      var duration = 3 * 1000;
      var end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#2e7d32', '#f3fbf3', '#ffd54f'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#2e7d32', '#f3fbf3', '#ffd54f'] });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }
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
    
    startPotatoStepper();

    try {
      const result = await analyzeFile(file);
      updateResults(result);
      
      // Auto-scroll to the results card gracefully
      document.getElementById("resultCard").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      feedbackText.textContent = `Echec: ${error.message}`;
      resetResultsUi();
    } finally {
      finishPotatoStepper();
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

// Advanced PDF Certificate Generator
downloadPdfBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // 1. Solid Dark Green Header
  doc.setFillColor(14, 42, 27); 
  doc.rect(0, 0, 210, 42, "F");
  
  // 2. Main Title (Centered, White, Bold)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("BATATA BLIGHT", 105, 24, { align: "center" });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 230, 200);
  doc.text("RAPPORT D'EXPERTISE O.A.D", 105, 34, { align: "center" });
  
  // 3. Document Metadata
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  const now = new Date();
  doc.text(`Date d'analyse : ${now.toLocaleString("fr-FR")}`, 20, 56);
  
  const sourceName = selectedImageFile ? selectedImageFile.name : (selectedVideoFile ? selectedVideoFile.name : "Fichier inconnu");
  doc.text(`Source media : ${sourceName}`, 20, 64);
  
  // Minimalist Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(20, 72, 190, 72);
  
  // 4. Mimic the "Result Card" exactly from the website
  doc.setFillColor(243, 251, 243); // Extremely light green background
  doc.setDrawColor(46, 125, 50); // Primary green border
  doc.setLineWidth(0.8);
  doc.roundedRect(20, 82, 170, 72, 4, 4, "FD"); // Fill and Draw box
  
  doc.setTextColor(14, 42, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RÉSULTATS DE L'INTELLIGENCE ARTIFICIELLE", 105, 94, { align: "center" });
  
  doc.setDrawColor(200, 220, 200);
  doc.setLineWidth(0.3);
  doc.line(25, 100, 185, 100); // Inner separator
  
  // Pull live data
  const risk = riskValue.textContent;
  const hScore = healthScoreValue.textContent;
  const total = countValue.textContent;
  const early = sickEarlyValue.textContent;
  const late = sickLateValue.textContent;
  const tracking = trackValue.textContent;
  
  // Column 1
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "bold");
  doc.text("RISQUE MILDIOU", 30, 114);
  
  doc.setFontSize(18);
  doc.setTextColor(46, 125, 50); // Green
  doc.text(risk, 30, 122);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("PRÉCOCE (EARLY)", 30, 137);
  
  doc.setFontSize(15);
  doc.setTextColor(46, 125, 50);
  doc.text(early, 30, 145);
  
  // Column 2
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("SCORE SANTÉ", 85, 114);
  
  doc.setFontSize(18);
  doc.setTextColor(46, 125, 50);
  doc.text(hScore, 85, 122);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("AVANCÉ (LATE)", 85, 137);
  
  doc.setFontSize(15);
  doc.setTextColor(46, 125, 50);
  doc.text(late, 85, 145);
  
  // Column 3
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("PLANTS DÉTECTÉS", 140, 114);
  
  doc.setFontSize(18);
  doc.setTextColor(46, 125, 50);
  doc.text(total, 140, 122);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("CONFIANCE", 140, 137);
  
  doc.setFontSize(15);
  doc.setTextColor(46, 125, 50);
  doc.text(tracking, 140, 145);
  
  // 5. Feedback / AI Conclusion Text Block
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(220, 225, 220);
  doc.rect(20, 165, 170, 28, "FD");
  
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  
  const splitWarning = doc.splitTextToSize(`Conclusion : ${feedbackText.textContent}`, 160);
  doc.text(splitWarning, 25, 175);
  
  // 6. Professional Footer centered at bottom
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text("Document généré informatiquement par le modèle Batata Blight (Algorithme: YOLOv8).", 105, 280, { align: "center" });
  doc.text("© 2026 Projet de Fin d'Études", 105, 285, { align: "center" });
  
  doc.save("BatataBlight_Certificat.pdf");
});
