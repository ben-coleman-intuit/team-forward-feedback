import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = "https://kvfdwxitmkshnikgxies.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZmR3eGl0bWtzaG5pa2d4aWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTU0MjUsImV4cCI6MjA5MTE3MTQyNX0.GQOqK24Nlo54Am7vjqU-nGct2EIkUU_PfTNLEZX8deQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


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

/** 1 = red, 5 = grey, 10 = green. Accepts any value 1–10 (including fractional averages). */
function scoreColor(v) {
  const t = (Math.max(1, Math.min(10, v)) - 1) / 9; // 0 → 1
  if (t < 0.5) {
    const p = t / 0.5;
    const r = Math.round(239 + (161 - 239) * p);
    const g = Math.round(68 + (161 - 68) * p);
    const b = Math.round(68 + (161 - 68) * p);
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  const p = (t - 0.5) / 0.5;
  const r = Math.round(161 + (74 - 161) * p);
  const g = Math.round(161 + (222 - 161) * p);
  const b = Math.round(161 + (128 - 161) * p);
  return "rgb(" + r + "," + g + "," + b + ")";
}

async function loadDashboard() {
  const dash = document.getElementById("dashboard");
  const gateMsg = document.getElementById("gate-msg");

  gateMsg.textContent = "Loading…";
  gateMsg.className = "msg";

  const { data, error } = await supabase
    .from("leadership_responses")
    .select("id, ratings, free_text, submitted_at")
    .order("submitted_at", { ascending: false });

  if (error) {
    gateMsg.textContent = error.message || "Could not load responses.";
    gateMsg.className = "msg error";
    return;
  }

  if (!data || data.length === 0) {
    gateMsg.textContent = "No responses yet.";
    gateMsg.className = "msg";
    return;
  }

  gateMsg.classList.add("hidden");
  dash.classList.remove("hidden");

  const rows = data;
  const n = rows.length;

  const stats = CATEGORIES.map((cat) => {
    const values = rows
      .map((r) => Number(r.ratings && r.ratings[cat.key]) || 0)
      .filter((v) => v >= 1 && v <= 10);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const dist = Array(10).fill(0);
    values.forEach((v) => { dist[v - 1]++; });
    return { ...cat, avg, dist, count: values.length };
  });

  const overallAvg = stats.length
    ? stats.reduce((s, c) => s + c.avg, 0) / stats.length
    : 0;

  document.getElementById("overall").innerHTML =
    '<div class="overall-card">' +
    '<div class="overall-score" style="color:' + scoreColor(overallAvg) + '">' + round1(overallAvg) + "</div>" +
    '<div class="overall-label">Overall leadership score (1\u201310)</div>' +
    '<div class="response-count">' + n + " response" + (n !== 1 ? "s" : "") + "</div>" +
    "</div>";

  const catContainer = document.getElementById("categories");
  catContainer.innerHTML = stats
    .map((cat) => {
      const maxCount = Math.max(...cat.dist, 1);
      const barsHtml = cat.dist
        .map((count, i) => {
          const pct = Math.round((count / maxCount) * 100);
          const color = scoreColor(i + 1);
          if (count === 0) {
            return (
              '<div class="hist-col">' +
              '<div class="hist-bar empty" style="height:2%"></div>' +
              "</div>"
            );
          }
          return (
            '<div class="hist-col">' +
            '<span class="hist-count">' + count + "</span>" +
            '<div class="hist-bar" style="height:' + pct + "%;background:" + color + '"></div>' +
            "</div>"
          );
        })
        .join("");

      const labelsHtml =
        '<div class="hist-labels">' +
        Array.from({ length: 10 }, (_, i) => "<span>" + (i + 1) + "</span>").join("") +
        "</div>";

      return (
        '<div class="cat-card">' +
        '<div class="cat-header"><span class="cat-name">' +
        escapeHtml(cat.label) +
        '</span><span class="cat-avg" style="color:' + scoreColor(cat.avg) + '">avg ' +
        round1(cat.avg) +
        "</span></div>" +
        '<div class="histogram">' + barsHtml + "</div>" +
        labelsHtml +
        "</div>"
      );
    })
    .join("");

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

loadDashboard();
