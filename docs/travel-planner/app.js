const GEOS = [
  { key: "mtv", label: "MTV", isDestination: true, defaultCost: 3400, defaultHC: 147, defaultMgr: 5 },
  { key: "west", label: "West Coast", defaultCost: 1600, defaultHC: 13, defaultMgr: 2 },
  { key: "central", label: "Central", defaultCost: 2900, defaultHC: 16, defaultMgr: 1 },
  { key: "east", label: "East Coast", defaultCost: 3400, defaultHC: 0, defaultMgr: 2 },
  { key: "nyc", label: "NYC", defaultCost: 3400, defaultHC: 19, defaultMgr: 3 },
  { key: "tlv", label: "TLV (Israel)", defaultCost: 17000, defaultHC: 10, defaultMgr: 5 },
];

// Each scenario returns "all" | "managers" | false per geo
const SCENARIOS = [
  {
    id: "all_mtv",
    label: "All team to MTV",
    desc: "Everyone (ICs + managers) flies to Mountain View, including TLV",
    who: (geo) => geo.key === "mtv" ? false : "all",
  },
  {
    id: "all_mtv_ex_israel",
    label: "All team to MTV (ex Israel)",
    desc: "Everyone except TLV flies to Mountain View",
    who: (geo) => (geo.key === "mtv" || geo.key === "tlv") ? false : "all",
  },
  {
    id: "west_central_east_mtv_mgr_nyc",
    label: "West Coast + Central + East to MTV / MTV managers to NYC",
    desc: "West Coast, Central, and East Coast travel to MTV; MTV managers travel to NYC",
    who: (geo) => {
      if (geo.key === "west" || geo.key === "central" || geo.key === "east") return "all";
      if (geo.key === "mtv") return "managers";
      return false;
    },
  },
  {
    id: "all_mtv_plus_tlv_mgr",
    label: "All team to MTV + Israel managers",
    desc: "Everyone except TLV ICs flies to Mountain View; TLV managers included",
    who: (geo) => {
      if (geo.key === "mtv") return false;
      if (geo.key === "tlv") return "managers";
      return "all";
    },
  },
  {
    id: "managers_only_mtv",
    label: "Only managers to MTV",
    desc: "Only managers from each geo travel to Mountain View (no ICs)",
    who: (geo) => geo.key === "mtv" ? false : "managers",
  },
  {
    id: "us_managers_mtv",
    label: "Only US-based managers to MTV",
    desc: "Managers from US geos travel to MTV (TLV excluded)",
    who: (geo) => {
      if (geo.key === "mtv" || geo.key === "tlv") return false;
      return "managers";
    },
  },
  {
    id: "mgrs_visit_teams_ex_israel",
    label: "All managers visit teams (ex Israel)",
    desc: "Every US-based manager travels to where their team is (TLV excluded)",
    who: (geo) => {
      if (geo.key === "tlv") return false;
      return "managers";
    },
  },
];

let activeScenario = null;
let tripDays = 3;
const TWO_DAY_DISCOUNT = 600;

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
  const placeholder = document.getElementById("result-placeholder");

  if (!activeScenario) {
    result.classList.add("hidden");
    if (placeholder) placeholder.classList.remove("hidden");
    return;
  }

  if (placeholder) placeholder.classList.add("hidden");

  const scenario = SCENARIOS.find((s) => s.id === activeScenario);
  if (!scenario) return;

  let total = 0;
  const lines = [];

  GEOS.forEach((geo) => {
    const hc = getVal("hc_" + geo.key);
    const mgr = getVal("mgr_" + geo.key);
    const baseCost = getVal("cost_" + geo.key);
    const cost = tripDays === 2 ? Math.max(0, baseCost - TWO_DAY_DISCOUNT) : baseCost;
    const group = scenario.who(geo);

    let travelers = 0;
    let label = "";
    if (group === "all") {
      travelers = hc + mgr;
      label = geo.label + " — all (" + travelers + " x " + fmt(cost) + ")";
    } else if (group === "managers") {
      travelers = mgr;
      label = geo.label + " — managers (" + travelers + " x " + fmt(cost) + ")";
    }

    if (travelers > 0) {
      const lineCost = travelers * cost;
      total += lineCost;
      lines.push({ label, cost: lineCost });
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

  document.querySelectorAll(".trip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".trip-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      tripDays = Number(btn.dataset.days);
      calculate();
    });
  });

  GEOS.forEach((geo) => {
    const card = document.createElement("div");
    card.className = "geo-card";
    card.innerHTML =
      '<div class="geo-name">' + geo.label + "</div>" +
      "<div>" +
      "<label>ICs</label>" +
      '<input type="number" id="hc_' + geo.key + '" min="0" value="' + (geo.defaultHC || 0) + '" />' +
      "</div>" +
      "<div>" +
      "<label>Managers</label>" +
      '<input type="number" id="mgr_' + geo.key + '" min="0" value="' + (geo.defaultMgr || 0) + '" />' +
      "</div>" +
      "<div>" +
      "<label>Cost / person (3 days)</label>" +
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
