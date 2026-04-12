const GEOS = [
  { key: "mtv", label: "MTV", isDestination: true, defaultCost: 0, defaultHC: 0 },
  { key: "mtv_mgr", label: "MTV — Mgrs w/ remote DR", defaultCost: 3400, defaultHC: 5 },
  { key: "west", label: "West Coast", defaultCost: 1600, defaultHC: 8 },
  { key: "central", label: "Central", defaultCost: 2900, defaultHC: 8 },
  { key: "east", label: "East Coast", defaultCost: 3400, defaultHC: 3 },
  { key: "nyc", label: "NYC", defaultCost: 3400, defaultHC: 12 },
  { key: "tlv", label: "TLV (Israel)", defaultCost: 17000, defaultHC: 15 },
  { key: "tlv_mgr", label: "TLV — Managers", defaultCost: 17000, defaultHC: 5 },
];

const MTV_LOCAL = new Set(["mtv", "mtv_mgr"]);
const TLV_ALL = new Set(["tlv", "tlv_mgr"]);

const SCENARIOS = [
  {
    id: "all_mtv",
    label: "All team to MTV",
    desc: "Everyone flies to Mountain View (including TLV + TLV managers)",
    traveling: (geo) => !MTV_LOCAL.has(geo.key),
  },
  {
    id: "all_mtv_ex_israel",
    label: "All team to MTV (ex Israel)",
    desc: "Everyone except TLV and TLV managers flies to Mountain View",
    traveling: (geo) => !MTV_LOCAL.has(geo.key) && !TLV_ALL.has(geo.key),
  },
  {
    id: "west_central_mtv_mgr_nyc",
    label: "West Coast + Central to MTV / remote managers to NYC",
    desc: "West Coast and Central travel to MTV; MTV managers w/ remote DR travel to NYC",
    traveling: (geo) => geo.key === "west" || geo.key === "central" || geo.key === "mtv_mgr" || geo.key === "east",
  },
  {
    id: "east_nyc",
    label: "East Coast team to NYC",
    desc: "Only East Coast (non-NYC) travels to New York",
    traveling: (geo) => geo.key === "east",
  },
];

let activeScenario = null;

function getVal(id) {
  const el = document.getElementById(id);
  return el ? Number(el.value) || 0 : 0;
}

function fmt(n) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function calculate() {
  const result = document.getElementById("result");
  const totalEl = document.getElementById("result-total");
  const breakdownEl = document.getElementById("result-breakdown");

  if (!activeScenario) {
    result.classList.add("hidden");
    return;
  }

  const scenario = SCENARIOS.find((s) => s.id === activeScenario);
  if (!scenario) return;

  let total = 0;
  const lines = [];

  GEOS.forEach((geo) => {
    const headcount = getVal("hc_" + geo.key);
    const cost = getVal("cost_" + geo.key);
    if (scenario.traveling(geo) && headcount > 0) {
      const lineCost = headcount * cost;
      total += lineCost;
      lines.push({
        label: geo.label + " (" + headcount + " x " + fmt(cost) + ")",
        cost: lineCost,
      });
    }
  });

  result.classList.remove("hidden");
  totalEl.textContent = fmt(total);

  if (lines.length === 0) {
    breakdownEl.innerHTML = '<p style="text-align:center">No one travels in this scenario.</p>';
    return;
  }

  breakdownEl.innerHTML = lines
    .map(
      (l) =>
        '<div class="breakdown-row"><span class="br-label">' +
        l.label +
        "</span><span>" +
        fmt(l.cost) +
        "</span></div>"
    )
    .join("");
}

function init() {
  const grid = document.getElementById("geo-grid");
  const picker = document.getElementById("scenario-picker");

  GEOS.forEach((geo) => {
    const card = document.createElement("div");
    card.className = "geo-card";
    card.innerHTML =
      '<div class="geo-name">' + geo.label + "</div>" +
      "<div>" +
      "<label>Headcount</label>" +
      '<input type="number" id="hc_' + geo.key + '" min="0" value="' + (geo.defaultHC || 0) + '" />' +
      "</div>" +
      "<div>" +
      "<label>Cost per person (3 days)</label>" +
      '<div class="dollar-input"><span class="dollar-sign">$</span>' +
      '<input type="number" id="cost_' + geo.key + '" min="0" value="' + (geo.defaultCost || 0) + '" step="100" />' +
      "</div></div>";
    grid.appendChild(card);
  });

  grid.addEventListener("input", calculate);

  SCENARIOS.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scenario-btn";
    btn.dataset.id = s.id;
    btn.innerHTML =
      '<span class="radio"></span>' +
      "<div><div>" + s.label + '</div><div class="scenario-desc">' + s.desc + "</div></div>";

    btn.addEventListener("click", () => {
      picker.querySelectorAll(".scenario-btn").forEach((b) => b.classList.remove("active"));
      if (activeScenario === s.id) {
        activeScenario = null;
      } else {
        activeScenario = s.id;
        btn.classList.add("active");
      }
      calculate();
    });

    picker.appendChild(btn);
  });
}

init();
