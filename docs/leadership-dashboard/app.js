/**
 * Leadership dashboard — fetches data from the same Apps Script (doGet).
 *
 * WEBAPP_URL: same /exec URL as the survey form.
 * DASHBOARD_SECRET: must match the DASHBOARD_SECRET script property in Apps Script.
 *   This protects the GET endpoint so only someone with the passphrase can read results.
 */
const WEBAPP_URL = "REPLACE_ME_WITH_LEADERSHIP_WEBAPP_URL";

const CATEGORIES = [
  { key: "prioritization", label: "Prioritization & Focus" },
  { key: "recognition", label: "Recognition & Appreciation" },
  { key: "performance_mgmt", label: "Performance Management" },
  { key: "removing_blockers", label: "Removing Blockers" },
  { key: "career_growth", label: "Career Growth & Development" },
  { key: "communication", label: "Communication & Transparency" },
  { key: "decision_making", label: "Decision-Making" },
  { key: "strategic_vision", label: "Strategic Vision" },
  { key: "availability", label: "Availability & Accessibility" },
];

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

async function loadDashboard(secret) {
  const gate = document.getElementById("gate");
  const dash = document.getElementById("dashboard");
  const gateMsg = document.getElementById("gate-msg");

  const url = WEBAPP_URL + "?secret=" + encodeURIComponent(secret);

  gateMsg.textContent = "Loading…";
  gateMsg.className = "msg";

  let json;
  try {
    const res = await fetch(url);
    json = await res.json();
  } catch (err) {
    gateMsg.textContent = "Could not reach the server. Check WEBAPP_URL in app.js.";
    gateMsg.className = "msg error";
    return;
  }

  if (json.error) {
    gateMsg.textContent = json.error === "unauthorized" ? "Wrong passphrase." : json.error;
    gateMsg.className = "msg error";
    return;
  }

  if (!json.rows || json.rows.length === 0) {
    gateMsg.textContent = "No responses yet.";
    gateMsg.className = "msg";
    return;
  }

  gate.classList.add("hidden");
  dash.classList.remove("hidden");

  const rows = json.rows;
  const n = rows.length;

  // Compute per-category stats
  const stats = CATEGORIES.map((cat) => {
    const values = rows.map((r) => Number(r[cat.key]) || 0).filter((v) => v >= 1 && v <= 10);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const dist = Array(10).fill(0);
    values.forEach((v) => { dist[v - 1]++; });
    return { ...cat, avg, dist, count: values.length };
  });

  const overallAvg = stats.length
    ? stats.reduce((s, c) => s + c.avg, 0) / stats.length
    : 0;

  // Overall card
  document.getElementById("overall").innerHTML =
    '<div class="overall-card">' +
    '<div class="overall-score">' + round1(overallAvg) + "</div>" +
    '<div class="overall-label">Overall leadership score (1–10)</div>' +
    '<div class="response-count">' + n + " response" + (n !== 1 ? "s" : "") + "</div>" +
    "</div>";

  // Category cards with distribution
  const catContainer = document.getElementById("categories");
  catContainer.innerHTML = stats
    .map((cat) => {
      const maxCount = Math.max(...cat.dist, 1);
      const distHtml = cat.dist
        .map((count, i) => {
          const pct = (count / maxCount) * 100;
          return (
            '<div class="dist-row">' +
            '<span class="dist-label">' + (i + 1) + "</span>" +
            '<div class="dist-bar-bg"><div class="dist-bar" style="width:' + pct + '%"></div></div>' +
            '<span class="dist-count">' + count + "</span>" +
            "</div>"
          );
        })
        .join("");

      return (
        '<div class="cat-card">' +
        '<div class="cat-header"><span class="cat-name">' +
        escapeHtml(cat.label) +
        '</span><span class="cat-avg">' +
        round1(cat.avg) +
        "</span></div>" +
        distHtml +
        "</div>"
      );
    })
    .join("");

  // Free-text responses
  const texts = rows
    .map((r) => (r.free_text || "").trim())
    .filter((t) => t.length > 0);

  const ftContainer = document.getElementById("freetext");
  if (texts.length === 0) {
    ftContainer.innerHTML = '<p class="msg">No free-text responses.</p>';
  } else {
    ftContainer.innerHTML = texts
      .map((t) => '<div class="text-card">' + escapeHtml(t) + "</div>")
      .join("");
  }
}

function init() {
  if (!WEBAPP_URL || WEBAPP_URL.indexOf("REPLACE_ME") !== -1) {
    document.getElementById("gate-msg").textContent =
      "Set WEBAPP_URL in leadership-dashboard/app.js.";
    document.getElementById("gate-msg").className = "msg error";
    return;
  }

  const btn = document.getElementById("gate-btn");
  const input = document.getElementById("passphrase");

  function unlock() {
    const secret = input.value.trim();
    if (!secret) return;
    loadDashboard(secret);
  }

  btn.addEventListener("click", unlock);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlock();
  });
}

init();
