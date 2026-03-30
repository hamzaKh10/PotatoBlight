// Frontend-only deployment config.
// Set this to your backend URL before deploying (or override it at runtime).
// Dynamically detect if we are testing locally or playing on the live Netlify internet website
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") {
    window.__API_BASE__ = "http://127.0.0.1:8000"; // Local AI
} else {
    window.__API_BASE__ = "https://hamzakharmouch-potatoblight.hf.space"; // Live Internet AI
}

