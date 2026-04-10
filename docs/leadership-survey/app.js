import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = "https://kvfdwxitmkshnikgxies.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZmR3eGl0bWtzaG5pa2d4aWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTU0MjUsImV4cCI6MjA5MTE3MTQyNX0.GQOqK24Nlo54Am7vjqU-nGct2EIkUU_PfTNLEZX8deQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIES = [
  { key: "prioritization", label: "Prioritization & Focus", desc: "Helps the team focus on what matters most" },
  { key: "recognition", label: "Recognition & Appreciation", desc: "Acknowledges contributions and celebrates wins" },
  { key: "performance_mgmt", label: "Performance Management", desc: "Sets clear expectations and gives honest, timely feedback" },
  { key: "removing_blockers", label: "Removing Blockers", desc: "Proactively clears obstacles so the team can move fast" },
  { key: "career_growth", label: "Career Growth & Development", desc: "Invests in your growth and creates development opportunities" },
  { key: "communication", label: "Communication & Transparency", desc: "Shares context openly, listens, keeps the team informed" },
  { key: "decision_making", label: "Decision-Making", desc: "Makes timely, well-reasoned decisions and explains the 'why'" },
  { key: "strategic_vision", label: "Strategic Vision", desc: "Provides clear direction and connects work to the bigger picture" },
  { key: "availability", label: "Availability & Accessibility", desc: "Makes time for you when you need it" },
];

/** Red(1) → grey(5) → green(10) */
function scoreColor(v) {
  const t = (Math.max(1, Math.min(10, v)) - 1) / 9;
  if (t < 0.5) {
    const p = t / 0.5;
    return "rgb(" +
      Math.round(239 + (161 - 239) * p) + "," +
      Math.round(68 + (161 - 68) * p) + "," +
      Math.round(68 + (161 - 68) * p) + ")";
  }
  const p = (t - 0.5) / 0.5;
  return "rgb(" +
    Math.round(161 + (74 - 161) * p) + "," +
    Math.round(161 + (222 - 161) * p) + "," +
    Math.round(161 + (128 - 161) * p) + ")";
}

const selections = {};

function buildNumberRow(catKey) {
  const row = document.createElement("div");
  row.className = "number-row";

  for (let i = 1; i <= 10; i++) {
    const box = document.createElement("div");
    box.className = "number-box";
    box.textContent = i;
    box.dataset.value = i;

      box.addEventListener("click", () => {
      if (selections[catKey] === i) {
        delete selections[catKey];
        box.classList.remove("selected");
        return;
      }
      selections[catKey] = i;
      row.querySelectorAll(".number-box").forEach((b) => {
        b.classList.remove("selected");
      });
      box.classList.add("selected");
    });

    row.appendChild(box);
  }

  return row;
}

function init() {
  const formRoot = document.getElementById("form-root");
  const done = document.getElementById("done");

  const form = document.createElement("form");
  form.className = "stack";
  form.setAttribute("novalidate", "");

  CATEGORIES.forEach((cat) => {
    const item = document.createElement("div");
    item.className = "rating-item";

    const catLabel = document.createElement("div");
    catLabel.className = "cat-label";
    catLabel.textContent = cat.label;

    const descP = document.createElement("p");
    descP.className = "cat-desc";
    descP.textContent = cat.desc;

    const numberRow = buildNumberRow(cat.key);

    const hint = document.createElement("div");
    hint.className = "scale-hint";
    hint.innerHTML = "<span>1 = strongly disagree</span><span>10 = strongly agree</span>";

    item.appendChild(catLabel);
    item.appendChild(descP);
    item.appendChild(numberRow);
    item.appendChild(hint);
    form.appendChild(item);
  });

  const textDiv = document.createElement("div");
  textDiv.innerHTML =
    '<label class="field-label" for="freeText">What\'s one thing Ben could do differently to be a more effective leader? (optional)</label>' +
    '<textarea id="freeText" rows="4" maxlength="8000"></textarea>';
  form.appendChild(textDiv);

  const msg = document.createElement("p");
  msg.className = "msg";
  msg.id = "form-msg";

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Submit anonymous feedback";

  form.appendChild(btn);
  form.appendChild(msg);
  formRoot.appendChild(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    msg.textContent = "Submitting…";
    msg.className = "msg";

    const ratings = {};
    CATEGORIES.forEach((cat) => {
      if (selections[cat.key] != null) {
        ratings[cat.key] = selections[cat.key];
      }
    });

    const freeText = document.getElementById("freeText").value.trim();

    const { error } = await supabase.from("leadership_responses").insert({
      ratings,
      free_text: freeText || null,
    });

    if (error) {
      msg.textContent = error.message || "Submit failed — please try again.";
      msg.className = "msg error";
      btn.disabled = false;
      return;
    }

    formRoot.classList.add("hidden");
    done.classList.remove("hidden");
  });
}

init();
