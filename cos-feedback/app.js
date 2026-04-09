import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * Replace with your project (Supabase → Project Settings → API).
 * The anon key is meant for browser use; lock down access with Row Level Security on `responses`.
 */
const SUPABASE_URL = "https://kvfdwxitmkshnikgxies.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZmR3eGl0bWtzaG5pa2d4aWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTU0MjUsImV4cCI6MjA5MTE3MTQyNX0.GQOqK24Nlo54Am7vjqU-nGct2EIkUU_PfTNLEZX8deQ";

const PLACEHOLDER =
  typeof SUPABASE_URL === "string" &&
  (SUPABASE_URL.includes("YOUR_PROJECT_ID") ||
    !SUPABASE_KEY ||
    SUPABASE_KEY === "YOUR_ANON_KEY" ||
    !SUPABASE_URL.startsWith("http"));

let supabase = null;
if (!PLACEHOLDER && SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

function showConfigWarning() {
  const el = document.getElementById("config-warning");
  if (!el) return;
  el.classList.remove("hidden");
  el.textContent =
    "Set SUPABASE_URL and SUPABASE_KEY at the top of app.js (Supabase → Settings → API).";
}

function setFormMsg(text, kind) {
  const m = document.getElementById("form-msg");
  if (!m) return;
  m.textContent = text;
  m.className = "msg " + (kind || "");
}

async function handleSubmit(ev) {
  ev.preventDefault();
  if (!supabase) {
    setFormMsg("Supabase is not configured.", "error");
    return;
  }

  const btn = document.getElementById("submit-btn");
  const name = document.getElementById("name").value.trim();
  const submittedBy = document.getElementById("submittedBy").value.trim();
  const comments = document.getElementById("comments").value.trim();

  const ratings = {
    submittedBy,
    collaboration: Number(document.getElementById("r_collab").value),
    communication: Number(document.getElementById("r_comm").value),
    reliability: Number(document.getElementById("r_rel").value),
  };

  btn.disabled = true;
  setFormMsg("Submitting…", "");

  const { error } = await supabase.from("responses").insert({
    name,
    ratings,
    comments: comments || null,
  });

  btn.disabled = false;

  if (error) {
    setFormMsg(error.message || "Submit failed", "error");
    return;
  }

  setFormMsg("Saved. Thank you!", "ok");
  document.getElementById("survey-form").reset();
  document.getElementById("r_collab").value = "3";
  document.getElementById("r_comm").value = "3";
  document.getElementById("r_rel").value = "3";
  await loadDashboard();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadDashboard() {
  const status = document.getElementById("dashboard-status");
  const list = document.getElementById("dashboard-list");
  if (!status || !list) return;

  if (!supabase) {
    status.textContent = "Dashboard unavailable until Supabase is configured.";
    list.innerHTML = "";
    return;
  }

  status.textContent = "Loading responses…";

  const { data, error } = await supabase
    .from("responses")
    .select("id, name, ratings, comments, submitted_at")
    .order("submitted_at", { ascending: false });

  if (error) {
    status.textContent = "Could not load responses: " + error.message;
    list.innerHTML = "";
    return;
  }

  if (!data || data.length === 0) {
    status.textContent = "No responses yet.";
    list.innerHTML = "";
    return;
  }

  status.textContent = data.length + " response(s).";
  list.innerHTML = data
    .map((row) => {
      const when = row.submitted_at
        ? new Date(row.submitted_at).toLocaleString()
        : "";
      const ratingsStr = JSON.stringify(row.ratings, null, 2);
      return (
        '<article class="response-card">' +
        "<strong>" +
        escapeHtml(row.name) +
        "</strong> " +
        '<time datetime="' +
        escapeHtml(row.submitted_at || "") +
        '">' +
        escapeHtml(when) +
        "</time>" +
        "<pre>" +
        escapeHtml(ratingsStr) +
        "</pre>" +
        (row.comments
          ? "<p>" + escapeHtml(row.comments).replace(/\n/g, "<br/>") + "</p>"
          : "") +
        "</article>"
      );
    })
    .join("");
}

function init() {
  if (PLACEHOLDER) {
    showConfigWarning();
  }

  const form = document.getElementById("survey-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  loadDashboard();
}

init();
