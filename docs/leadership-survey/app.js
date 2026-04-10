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

function init() {
  const formRoot = document.getElementById("form-root");
  const done = document.getElementById("done");

  const form = document.createElement("form");
  form.className = "stack";
  form.setAttribute("novalidate", "");

  CATEGORIES.forEach((cat) => {
    const item = document.createElement("div");
    item.className = "rating-item";

    const labelRow = document.createElement("div");
    labelRow.className = "label-row";
    const catLabel = document.createElement("span");
    catLabel.className = "cat-label";
    catLabel.textContent = cat.label;
    labelRow.appendChild(catLabel);

    const descP = document.createElement("p");
    descP.style.margin = "0";
    descP.style.fontSize = "0.8rem";
    descP.style.color = "#a1a1aa";
    descP.textContent = cat.desc;

    const sliderRow = document.createElement("div");
    sliderRow.className = "slider-row";
    const range = document.createElement("input");
    range.type = "range";
    range.min = "1";
    range.max = "10";
    range.step = "1";
    range.value = "5";
    range.id = "r_" + cat.key;
    const num = document.createElement("span");
    num.className = "score-display";
    num.textContent = "5";
    range.addEventListener("input", () => { num.textContent = range.value; });
    sliderRow.appendChild(range);
    sliderRow.appendChild(num);

    item.appendChild(labelRow);
    item.appendChild(descP);
    item.appendChild(sliderRow);
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
      ratings[cat.key] = Number(document.getElementById("r_" + cat.key).value);
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
