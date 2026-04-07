/**
 * Static GitHub Pages → Google Apps Script → Google Sheet.
 * Copy config: npm run docs:sync
 *
 * 1. Deploy google-sheet-webapp.gs (see comments in that file).
 * 2. Paste Web App URL below (must end with /exec).
 * 3. Optional: set FORM_SECRET in Script properties and the same string here.
 */
const GOOGLE_SCRIPT_WEBAPP_URL = "https://script.google.com/a/macros/intuit.com/s/AKfycbzKB6joGCeUbm7EA3q80iFFS5zaxtAAnTiwHTD8Py8rqhaoT88KXY7qJ4A537TKHsD6/exec";

/** Optional — must match Script property FORM_SECRET if you set one */
const FORM_SECRET = "";

const RELATIONSHIPS = [
  { value: "direct_report", label: "Direct report" },
  { value: "peer", label: "Peer" },
  { value: "stakeholder", label: "Stakeholder" },
  { value: "leader", label: "Leader" },
];

function firstName(displayName) {
  const first = String(displayName || "")
    .trim()
    .split(/\s+/)[0];
  return first || "them";
}

async function loadJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to load " + url);
  return r.json();
}

function getSubject(members, id) {
  return members.find((m) => m.id === id);
}

function renderSkills(members, subjectId, container) {
  const subject = getSubject(members, subjectId);
  if (!subject) return;
  container.innerHTML = "";
  subject.skills.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "skill-row";
    const label = document.createElement("label");
    label.htmlFor = `skill-${s.key}`;
    label.textContent = `${i + 1}. ${s.label}`;
    const range = document.createElement("input");
    range.type = "range";
    range.min = "1";
    range.max = "10";
    range.step = "1";
    range.value = "5";
    range.id = `skill-${s.key}`;
    range.name = `skill_${s.key}`;
    const num = document.createElement("span");
    num.className = "skill-num";
    num.textContent = "5";
    range.addEventListener("input", () => {
      num.textContent = range.value;
    });
    row.appendChild(label);
    row.appendChild(range);
    row.appendChild(num);
    container.appendChild(row);
  });
}

function updateSubheading(members, subjectId, el) {
  const subject = getSubject(members, subjectId);
  if (!subject) return;
  el.textContent = `${firstName(subject.displayName)} is aiming to operate at ${subject.operatingLevel} level`;
}

function collectSkillScores(members, subjectId) {
  const subject = getSubject(members, subjectId);
  if (!subject) return {};
  const out = {};
  for (const s of subject.skills) {
    const input = document.getElementById(`skill-${s.key}`);
    out[s.key] = input ? Number(input.value) : 5;
  }
  return out;
}

function formatSkillsForEmail(members, subjectId, scores) {
  const subject = getSubject(members, subjectId);
  if (!subject) return "";
  return subject.skills
    .map((s) => `${s.label}: ${scores[s.key] ?? "?"}`)
    .join("\n");
}

/**
 * POST fields to Apps Script via hidden form + iframe (avoids CORS on fetch).
 */
function postToGoogleSheet(payload) {
  return new Promise((resolve, reject) => {
    const ms = 25000;
    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("Timed out — check the Web App URL and Sheet permissions."));
    }, ms);

    function onMessage(ev) {
      if (!ev.data || ev.data.type !== "team-forward-feedback") return;
      if (
        typeof ev.origin === "string" &&
        ev.origin.indexOf("script.google.com") === -1
      ) {
        return;
      }
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      if (ev.data.ok) {
        resolve();
      } else {
        reject(new Error("Google Sheet rejected the submission."));
      }
    }
    window.addEventListener("message", onMessage);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = GOOGLE_SCRIPT_WEBAPP_URL;
    form.target = "sheet-iframe";
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    const flat = { ...payload };
    if (FORM_SECRET) {
      flat.form_secret = FORM_SECRET;
    }

    for (const [k, v] of Object.entries(flat)) {
      const inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = k;
      inp.value = String(v ?? "");
      form.appendChild(inp);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  });
}

async function init() {
  const loading = document.getElementById("loading");
  const formRoot = document.getElementById("form-root");
  const done = document.getElementById("done");

  if (
    !GOOGLE_SCRIPT_WEBAPP_URL ||
    GOOGLE_SCRIPT_WEBAPP_URL.indexOf("REPLACE_ME") !== -1
  ) {
    loading.textContent =
      "Set GOOGLE_SCRIPT_WEBAPP_URL in docs/app.js (see docs/google-sheet-webapp.gs).";
    return;
  }

  let members;
  let intuitValues;

  try {
    const [teamData, intuitData] = await Promise.all([
      loadJson("team.json"),
      loadJson("intuit-values.json"),
    ]);
    members = teamData.members;
    intuitValues = intuitData.values || [];
  } catch (e) {
    loading.textContent =
      "Could not load team.json / intuit-values.json. Check paths for GitHub Pages.";
    console.error(e);
    return;
  }

  if (!members || members.length === 0) {
    loading.textContent = "No team members in team.json.";
    return;
  }

  loading.classList.add("hidden");
  formRoot.classList.remove("hidden");

  const defaultId = members[0].id;

  const form = document.createElement("form");
  form.className = "stack";
  form.id = "feedback-form";
  form.setAttribute("novalidate", "");

  const fSubject = document.createElement("div");
  fSubject.innerHTML = `<label class="field-label" for="subject">Feedback for</label>`;
  const subjectSelect = document.createElement("select");
  subjectSelect.id = "subject";
  subjectSelect.required = true;
  members.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.displayName;
    subjectSelect.appendChild(opt);
  });
  subjectSelect.value = defaultId;
  fSubject.appendChild(subjectSelect);
  form.appendChild(fSubject);

  const row = document.createElement("div");
  row.className = "row2";
  row.innerHTML = `
    <div>
      <label class="field-label" for="submitterName">Your name</label>
      <input id="submitterName" name="submitterName" type="text" autocomplete="name" required maxlength="200" />
    </div>
    <div>
      <label class="field-label" for="submitterEmail">Your email</label>
      <input id="submitterEmail" name="submitterEmail" type="email" autocomplete="email" required maxlength="320" />
    </div>`;
  form.appendChild(row);

  const fRel = document.createElement("div");
  const relLabel = document.createElement("label");
  relLabel.className = "field-label";
  relLabel.htmlFor = "relationship";
  const relSelect = document.createElement("select");
  relSelect.id = "relationship";
  relSelect.required = true;
  RELATIONSHIPS.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.value;
    opt.textContent = r.label;
    relSelect.appendChild(opt);
  });
  fRel.appendChild(relLabel);
  fRel.appendChild(relSelect);
  form.appendChild(fRel);

  const skillsFs = document.createElement("fieldset");
  skillsFs.className = "skills";
  const skillsLegend = document.createElement("legend");
  skillsLegend.textContent = "Rate each skill (1 = low, 10 = high)";
  const subheading = document.createElement("p");
  subheading.className = "subheading";
  subheading.id = "operatingSubheading";
  const skillsContainer = document.createElement("div");
  skillsContainer.id = "skills-sliders";
  skillsFs.appendChild(skillsLegend);
  skillsFs.appendChild(subheading);
  skillsFs.appendChild(skillsContainer);
  form.appendChild(skillsFs);

  const intuitFs = document.createElement("fieldset");
  intuitFs.className = "intuit";
  const intuitLegend = document.createElement("legend");
  intuitLegend.id = "intuitLegend";
  const intuitUl = document.createElement("ul");
  intuitUl.className = "intuit-list";
  intuitUl.id = "intuit-checkboxes";
  intuitFs.appendChild(intuitLegend);
  intuitFs.appendChild(intuitUl);
  form.appendChild(intuitFs);

  const n1 = document.createElement("div");
  n1.innerHTML = `
    <label class="field-label" for="narrativeBestWork">Best work this year — what made it awesome and the impact</label>
    <textarea id="narrativeBestWork" required rows="5"></textarea>`;
  const n2 = document.createElement("div");
  n2.innerHTML = `
    <label class="field-label" for="narrativeAdvice">Career growth advice for greater impact</label>
    <textarea id="narrativeAdvice" required rows="5"></textarea>`;
  const n3 = document.createElement("div");
  n3.innerHTML = `
    <label class="field-label" for="narrativeOther">Any other feedback</label>
    <textarea id="narrativeOther" required rows="4"></textarea>`;
  form.appendChild(n1);
  form.appendChild(n2);
  form.appendChild(n3);

  const err = document.createElement("p");
  err.className = "error hidden";
  err.id = "form-error";
  form.appendChild(err);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Submit feedback";
  form.appendChild(submitBtn);

  formRoot.appendChild(form);

  function refreshIntuitLegend() {
    const sid = subjectSelect.value;
    const sub = getSubject(members, sid);
    intuitLegend.textContent = sub
      ? `Select the Intuit values that ${firstName(sub.displayName)} most often demonstrates`
      : "";
  }

  function rebuildIntuitCheckboxes() {
    intuitUl.innerHTML = "";
    intuitValues.forEach((v, i) => {
      const li = document.createElement("li");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = `intuit-${i}`;
      cb.value = v;
      const lab = document.createElement("label");
      lab.htmlFor = `intuit-${i}`;
      lab.textContent = v;
      li.appendChild(cb);
      li.appendChild(lab);
      intuitUl.appendChild(li);
    });
  }

  function syncSubject() {
    const sid = subjectSelect.value;
    updateSubheading(members, sid, subheading);
    relLabel.textContent = `Relationship to ${firstName(getSubject(members, sid)?.displayName)}`;
    renderSkills(members, sid, skillsContainer);
    refreshIntuitLegend();
  }

  subjectSelect.addEventListener("change", syncSubject);
  rebuildIntuitCheckboxes();
  syncSubject();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.classList.add("hidden");
    submitBtn.disabled = true;

    const sid = subjectSelect.value;
    const subject = getSubject(members, sid);
    if (!subject) {
      err.textContent = "Select a teammate.";
      err.classList.remove("hidden");
      submitBtn.disabled = false;
      return;
    }

    const selectedIntuit = Array.from(
      intuitUl.querySelectorAll('input[type="checkbox"]:checked'),
    ).map((c) => c.value);

    if (selectedIntuit.length === 0) {
      err.textContent = "Select at least one Intuit value.";
      err.classList.remove("hidden");
      submitBtn.disabled = false;
      return;
    }

    const submitterName = document.getElementById("submitterName").value.trim();
    const submitterEmail = document.getElementById("submitterEmail").value.trim();
    const relationship = relSelect.value;
    const scores = collectSkillScores(members, sid);
    const narrativeBestWork = document.getElementById("narrativeBestWork").value.trim();
    const narrativeAdvice = document.getElementById("narrativeAdvice").value.trim();
    const narrativeOther = document.getElementById("narrativeOther").value.trim();

    const skillBlock = formatSkillsForEmail(members, sid, scores);
    const intuitJoined = [...selectedIntuit].sort().join("; ");

    const payload = {
      submitter_name: submitterName,
      submitter_email: submitterEmail,
      feedback_for: subject.displayName,
      feedback_for_id: subject.id,
      relationship,
      operating_level: subject.operatingLevel,
      skill_ratings: skillBlock,
      intuit_values: intuitJoined,
      narrative_best_work: narrativeBestWork,
      narrative_advice: narrativeAdvice,
      narrative_other: narrativeOther,
      submission_json: JSON.stringify(
        {
          subjectMemberId: subject.id,
          subjectDisplayName: subject.displayName,
          submitterName,
          submitterEmail,
          relationship,
          skillScores: scores,
          intuitValues: selectedIntuit.sort(),
          narrativeBestWork,
          narrativeAdvice,
          narrativeOther,
        },
        null,
        0,
      ),
    };

    try {
      await postToGoogleSheet(payload);
      formRoot.classList.add("hidden");
      done.classList.remove("hidden");
    } catch (fe) {
      err.textContent =
        fe instanceof Error ? fe.message : "Submit failed. Try again.";
      err.classList.remove("hidden");
      submitBtn.disabled = false;
    }
  });
}

init();
