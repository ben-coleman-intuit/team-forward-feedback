import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * Config is set in index.html (mirror values from .env for local work).
 * The anon key is safe in the browser only with RLS policies you trust — see supabase/schema.sql.
 */
const SUPABASE_URL = window.COS_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.COS_SUPABASE_ANON_KEY;

const PLACEHOLDER =
  typeof SUPABASE_URL === "string" &&
  (SUPABASE_URL.includes("REPLACE_WITH") || !SUPABASE_URL.startsWith("http"));

let supabase = null;
if (!PLACEHOLDER && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function showConfigWarning() {
  const el = document.getElementById("config-warning");
  if (!el) return;
  el.classList.remove("hidden");
  el.textContent =
    "Configure window.COS_SUPABASE_URL and window.COS_SUPABASE_ANON_KEY at the top of index.html (copy from .env / Supabase API settings).";
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
