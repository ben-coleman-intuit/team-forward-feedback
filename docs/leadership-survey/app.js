/**
 * Anonymous leadership survey → Google Apps Script → Google Sheet.
 *
 * Replace the URL below with your deployed Web App URL (ends in /exec).
 */
const WEBAPP_URL = "REPLACE_ME_WITH_LEADERSHIP_WEBAPP_URL";

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
  const warning = document.getElementById("config-warning");

  if (!WEBAPP_URL || WEBAPP_URL.indexOf("REPLACE_ME") !== -1) {
    warning.classList.remove("hidden");
    warning.textContent = "Set WEBAPP_URL in leadership-survey/app.js to your deployed Apps Script URL.";
    return;
  }

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
    const catDesc = document.createElement("span");
    catDesc.className = "cat-desc";
    catDesc.textContent = cat.desc;
    labelRow.appendChild(catLabel);

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
    const descP = document.createElement("p");
    descP.style.margin = "0";
    descP.style.fontSize = "0.8rem";
    descP.style.color = "#a1a1aa";
    descP.textContent = cat.desc;
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    btn.disabled = true;
    msg.textContent = "Submitting…";
    msg.className = "msg";

    const payload = {};
    CATEGORIES.forEach((cat) => {
      payload[cat.key] = document.getElementById("r_" + cat.key).value;
    });
    payload.free_text = document.getElementById("freeText").value.trim();

    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      msg.textContent = "Timed out — please try again.";
      msg.className = "msg error";
      btn.disabled = false;
    }, 25000);

    function onMessage(ev) {
      if (!ev.data || ev.data.type !== "leadership-survey") return;
      if (
        typeof ev.origin !== "string" ||
        (ev.origin.indexOf("script.google.com") === -1 &&
          ev.origin.indexOf("googleusercontent.com") === -1)
      ) return;
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      if (ev.data.ok) {
        formRoot.classList.add("hidden");
        done.classList.remove("hidden");
      } else {
        msg.textContent = "Something went wrong. Please try again.";
        msg.className = "msg error";
        btn.disabled = false;
      }
    }
    window.addEventListener("message", onMessage);

    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = WEBAPP_URL;
    hiddenForm.target = "sheet-iframe";
    hiddenForm.style.display = "none";

    for (const [k, v] of Object.entries(payload)) {
      const inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = k;
      inp.value = String(v ?? "");
      hiddenForm.appendChild(inp);
    }

    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    document.body.removeChild(hiddenForm);
  });
}

init();
