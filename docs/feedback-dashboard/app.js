// Hardcoded from Google Sheet "Responses" tab — deduped (Sarah→Tyler kept once)
const RAW = [
  {name:"Sam Caslowitz",from:"Megha Sethi",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":8,"Execution":8,"Customer Centric Outcomes":9,"Speed":7,"Communication":10},values:["Courage","Customer obsession","Integrity without compromise","Stronger together"],bestWork:"This year, I've watched Sam step up to lead and drive a broader cross-functional leadership team. He's done a great job bringing structure to the agenda, connecting discussion topics to what matters most across the org, and ensuring planning stays well ahead of schedule.",advice:"",other:""},
  {name:"Sam Caslowitz",from:"Joel Putz",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":9,"Execution":10,"Customer Centric Outcomes":10,"Speed":9,"Communication":10},values:["Integrity without compromise","Stronger together"],bestWork:"Sam partnered with Sarah Zimmerman to create an incredibly impactful dashboard which measured early merchant churn based on friction experienced (auth declines and payment holds specifically). This was an impactful piece of work as it enabled two different capabilities — highlighting to the Policy and Experience teams the impact AND a deep dive into each teammate to determine who is best at delivering the bad news to a customer.",advice:"I don't have anything to add here as my interactions with Sam have been very limited to this one dashboard.",other:""},
  {name:"Yukti Bishambu",from:"Quan Hu",rel:"peer",level:"Analyst",skills:{"Technical Craft":10,"Execution":10,"Customer Centric Outcomes":10,"Speed":10,"Communication":9},values:["Courage","Stronger together","We care and give back"],bestWork:"Since joining the team, Yukti has shown impressive growth and has taken on her responsibilities with remarkable speed. She is a true team player who consistently demonstrates a willingness to learn and a readiness to support her colleagues whenever needed.\nWhat stands out most is her proactive nature; she is not only eager to master her own domain but is also actively stepping out of her comfort zone to understand the broader business. I am particularly impressed with how quickly she has adopted new AI tools into her workflow to drive efficiency.",advice:"Yukti is ready for more cross-functional exposure. I suggest giving her opportunities to lead or support projects that involve the broader team and external stakeholders.",other:""},
  {name:"Yukti Bishambu",from:"Sabrina Wong",rel:"peer",level:"Analyst",skills:{"Technical Craft":10,"Execution":10,"Customer Centric Outcomes":10,"Speed":10,"Communication":10},values:["Courage","Customer obsession","Stronger together"],bestWork:"Yukti has been an incredible buddy as I onboarded. She took the time to set me up on Cursor and Claude and followed up with me. Her AI corner showcase during our team meeting was also really impressive — it has potential to reduce wait times with stakeholders and have them be more self sufficient.",advice:"I'd love to see Yukti sharing her work more broadly across the org. Her AI corner showcase is a perfect example of something that deserves to be seen — she should present it as a demo during FinTech AI Office Hours.",other:"I'm thankful that Yukti took the initiative to become my buddy. She's made it easier for me to get comfortable and feel like part of the team."},
  {name:"Yukti Bishambu",from:"Omar Salas",rel:"stakeholder",level:"Analyst",skills:{"Technical Craft":10,"Execution":8,"Customer Centric Outcomes":10,"Speed":9,"Communication":10},values:["Courage","Customer obsession","Integrity without compromise","Stronger together","We care and give back"],bestWork:"Yukti has been amazing to work with. She has picked up the future loss input file analysis and preparation without skipping a beat from Austin. She also created a Specific Reserve Claude skill in April 2026.",advice:"Keep doing what you are doing and thanks for being so receptive and responsive when I ask questions.",other:"This is both our first full quarter working together. Looking forward to working alongside you and your team."},
  {name:"Austin Joy",from:"Sindhu Bhat",rel:"stakeholder",level:"Senior Staff & People Leader",skills:{"Technical Craft":6,"Execution":6,"Customer Centric Outcomes":8,"Accelerating Teams":8,"Risk Loss Forecasting":9},values:["Courage","Integrity without compromise","Stronger together"],bestWork:"FNPL is a new product and we needed help on building the forecast model and estimate potential losses. Austin has proactively worked with us and his team to deliver a framework. He has been very proactive in understanding the policy and giving us inputs.",advice:"Play a bigger role in discussions with Risk governance and provide outlook to speed up policy approval. Also, provide inputs on what we need as we think about funding FNPL through Capital Markets.",other:""},
  {name:"Austin Joy",from:"Andy Li",rel:"",level:"Senior Staff & People Leader",skills:{"Technical Craft":9,"Execution":10,"Customer Centric Outcomes":9,"Accelerating Teams":10,"Risk Loss Forecasting":8},values:["Courage","Integrity without compromise","Stronger together"],bestWork:"Delivered much improved visibility into business loss drivers, such as Payments / Bill Pay negative balances, and baseline Payroll loss rates. Processes feel streamlined vs. FY25.",advice:"When providing sizing of an initiative impact or loss event, share underlying assumptions or data source as much as possible. Given some Risk teams look at benefit/cost from a different lens than CAO and Finance, we should make sure we are in sync.",other:"Appreciate Austin's responsiveness and diligence in following up on Finance team's requests/questions."},
  {name:"Micky Makanji",from:"Bernadette Orende",rel:"stakeholder",level:"Senior - non Tech",skills:{"Business Processes":10,"Technical Expertise":10,"Analytical Skills":10,"Strategic Thinking":10,"Collaboration":10},values:["Courage","Customer obsession","Integrity without compromise","Stronger together"],bestWork:"Micky has made a strong impression in his first year at Intuit. He has not simply maintained the status quo on PO management, purchase requisitions, and invoicing; he has actively looked for ways to streamline and improve. His proactive partnership with Third-Party Risk Management stands out.",advice:"Stay the course. Keep bringing the same ownership, curiosity, and consistency that have defined your first year.",other:""},
  {name:"Micky Makanji",from:"Sam Caslowitz",rel:"peer",level:"Senior - non Tech",skills:{"Business Processes":9,"Technical Expertise":6,"Analytical Skills":6,"Strategic Thinking":9,"Collaboration":10},values:["Courage","Stronger together"],bestWork:"Ekata fix. We had a big issue with Ekata invoices over the past year were off by hundreds of thousands of dollars. This was something Micky inherited and taken with stride. He has shown a lot of courage by being proactive.",advice:"I would push Micky further on finding ways to implement more technical aspects to his work.",other:""},
  {name:"Micky Makanji",from:"Christy Brescia",rel:"peer",level:"Senior - non Tech",skills:{"Business Processes":8,"Technical Expertise":8,"Analytical Skills":8,"Strategic Thinking":8,"Collaboration":10},values:["Stronger together"],bestWork:"Micky has been a hands on partner from the start. He set up a meeting with me shortly after he was onboarded to discuss the POs we would be partnering on. He takes initiative to communicate with suppliers and AP when issues arise. He has been a great asset to the team.",advice:"",other:""},
  {name:"Quan Hu",from:"Liu He",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":10,"Execution":10,"Customer Centric Outcomes":10,"Accelerating Teams":10,"Credit Loss Forecasting":10},values:["Stronger together"],bestWork:"",advice:"",other:"It was a pleasure working with Quan. Very responsive and clear communications, easy to work with."},
  {name:"Quan Hu",from:"Pulkit Dutta",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":9,"Execution":9,"Customer Centric Outcomes":9,"Accelerating Teams":9,"Credit Loss Forecasting":9},values:["Courage","Customer obsession","Integrity without compromise","Stronger together","We care and give back"],bestWork:"Quan has been working on loss forecasting for FNPL and I appreciate his collaboration and how he thinks through different angles and is able to incorporate the inputs from Risk in his forecasts.",advice:"Simplify some of the complexity in his explanation for easier stakeholder buy in.",other:""},
  {name:"Sarah Zimmerman",from:"Jenna Gould",rel:"peer",level:"Staff",skills:{"Technical Craft":10,"Execution":10,"Customer Centric Outcomes":10,"Accelerating Teams":10,"Communication & Ownership":10},values:["Customer obsession"],bestWork:"Sarah has been an outstanding analytics partner on the Magic Moments Risk pilot program. She dove in with enthusiasm and came back with a thorough, well-structured analysis. She segmented customers by severity, layered in OOP data to qualify the right targets, and landed on a clear, defensible methodology. She's also a natural collaborator — whether building out exec-facing slides, checking in proactively, or working through the 3-month pilot together.",advice:"As the dashboard matures, share insights on data and how the program can grow. Also, document and share her methodology so the framework can be replicated as the program expands. This would have lasting organizational value.",other:"Sarah has been a tremendous partner. The Magic Moments Risk pilot wouldn't have gotten off the ground without her analytical foundation."},
  {name:"Tyler Cialek",from:"Sarah Zimmerman",rel:"peer",level:"Senior Staff",skills:{"Technical Craft":10,"Execution":10,"Customer Centric Outcomes":8,"Accelerating Teams":10,"Driving AI Adoption":10},values:["Stronger together"],bestWork:"Partnering with Tyler on PIN this year has been great. He's been a really strong partner — from the data model and attribution questions through getting things actually shipped when the details matter for the story we're trying to tell. Tyler is extremely reliable, and always delivers high quality work. The AI enablement he's doing has greatly improved productivity for myself and for so many other analysts.",advice:"Expand PIN into something more teams reach for by default — same core datasets and logic, but aimed at broader adoption across partners who care about payments / policy / ops outcomes. Lean on that influence more deliberately — short demos, warm intros to the right owners — so PIN feels like the place people go.",other:""},
  {name:"Anish Talwelkar",from:"Nitya Mynepally",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":10,"Execution":8,"Customer Centric Outcomes":8,"Speed":9,"Communication":10},values:["Courage","Integrity without compromise","Stronger together"],bestWork:"He did an outstanding job building the negative balance dashboard. From a business perspective, it clearly connects the dots across transactions, returns, negative balances, and collections, despite the underlying data complexity and messiness.",advice:"More clearly highlight execution and more proactively share the dashboard's value, insights, and business impact with stakeholders and leadership.",other:"He is already doing a great job; the key opportunity is to communicate and share that work more broadly."},
  {name:"Anish Talwelkar",from:"Omar Salas",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":10,"Execution":8,"Customer Centric Outcomes":10,"Speed":9,"Communication":9},values:["Courage","Customer obsession","Integrity without compromise","Stronger together","We care and give back"],bestWork:"Anish has been amazing to work with. He has picked up the negative balance input file analysis and preparation without skipping a beat from Austin. Anish has been pivotal in providing the Mid Market and High Value Customer breakouts each month.",advice:"Thanks for being so receptive and responsive. Keep doing what you are doing.",other:"This is both our first full quarter working together. Looking forward to working alongside you and your team."},
  {name:"Tyler Cialek",from:"Zhaoyi Li",rel:"stakeholder",level:"Senior Staff",skills:{"Technical Craft":10,"Execution":10,"Customer Centric Outcomes":9,"Accelerating Teams":9,"Driving AI Adoption":10},values:["Courage","Integrity without compromise","Stronger together"],bestWork:"Tyler helped my team build comprehensive tables and dashboards to monitor the health of our risk portfolio. Beyond that, his technical expertise and willingness to support across the org, especially in accelerating AI adoption, have significantly improved my efficiency.",advice:"No additional advice at this time.",other:"No other feedback for now."},
  {name:"Anish Talwelkar",from:"Sarah Zimmerman",rel:"peer",level:"Senior",skills:{"Technical Craft":9,"Execution":9,"Customer Centric Outcomes":7,"Speed":8,"Communication":7},values:["Integrity without compromise"],bestWork:"He\u2019s been good at aggregating all the pieces for capacity into one coherent story: what\u2019s system-generated, what\u2019s human-updated, what\u2019s blocked on inputs, and what\u2019s ready to ship. His stakeholder management shows up as written follow-through \u2014 making implicit \u2018meeting knowledge\u2019 explicit, inviting corrections, and turning discussion into scoped next steps with the right partners. The impact flow tracker rebuild is a real example of him doing the product work that prevents dropped handoffs.",advice:"I think the next step for Anish is to increase his project driving skills and stakeholder influence. He\u2019s strong on the technical and execution aspects of capacity, but he could have even more impact if he took the lead in conversations and advocated for better processes outside of his control.",other:"I feel like Anish is very collaborative and has a great attitude to work with"},
  {name:"Sarah Zimmerman",from:"Matt Lyon",rel:"stakeholder",level:"Staff",skills:{"Technical Craft":10,"Execution":8,"Customer Centric Outcomes":10,"Accelerating Teams":8,"Communication & Ownership":10},values:["Courage","Customer obsession","Stronger together"],bestWork:"Sara really listens to the stakeholders needs, and can quickly put together a plan. She also communicates clearly what the outcome will look like. I also appreciate that Sara can make slight adjustments quickly. The changes to Capacity plan are very impactful, to understand our actuals vs expected.",advice:"Creating things that we don\u2019t know we need, not waiting for us to reach out. Sara has a good understanding of our org, and is extremely intelligent, she could provide us tools, data analysis to take us to the next level.",other:""},
  {name:"Yukti Bishambu",from:"Ryan Corbett",rel:"stakeholder",level:"Analyst",skills:{"Technical Craft":5,"Execution":7,"Customer Centric Outcomes":6,"Speed":7,"Communication":7},values:["Customer obsession"],bestWork:"Yukti is a great listener. She listens, then builds, then shares back for feedback. Listens to feedback and repeats. Leads to building great tools and deliverables, but also stronger partnership networks. The Specific Reserves modeling is a perfect example where we can use AI to eliminate the drudgery, move faster where it matters, and increase accuracy and storytelling! Good hire. Lot of promise.",advice:"",other:""},
  {name:"Austin Joy",from:"Ryan Corbett",rel:"stakeholder",level:"Senior Staff & People Leader",skills:{"Technical Craft":6,"Execution":4,"Customer Centric Outcomes":5,"Accelerating Teams":7,"Risk Loss Forecasting":6},values:["Customer obsession"],bestWork:"There is a before and after when Austin was asked to lead the Reserves and given two resources to support. He has leaned into this role and is working hard to get his team ramped up, but also ensure they can operate independently (keep going, its working). He feels more empowered and that is showing up in better leadership presence, quicker decision making, and being able crystallize a strategic point of view on where we should go longer term. That said, we need to continue to hold high standards and expectations to ensure we are tracking what matters (and that is automated), and able to explain the drivers and the story.",advice:"This is trending better consistent with the above, but a general struggle with Risk we have had is that lots of people are experts in their area, or their policy, but who owns stitching all those (trees) together for an E2E view (is the forest healthy). As the single Risk POC, Austin at times has delegated out or didn\u2019t address (maybe he didn\u2019t know), but VP level leadership expects this and we should continue marching to this. Again, we are trending this way and should continue to lean into. Anticipate the questions.",other:"Trending the right way, lets go!"},
  {name:"Sam Caslowitz",from:"Daniel Jofre",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":8,"Execution":9,"Customer Centric Outcomes":8,"Speed":7,"Communication":8},values:["Integrity without compromise","Stronger together","We care and give back"],bestWork:"Really like the automation you built for exec metrics and coordinating it!",advice:"",other:"Exec risk kpi dash is really helpful for me to check all l1s and l2s in one place - would be awesome if we could automate it"},
  {name:"Micky Makanji",from:"Ella Hu",rel:"stakeholder",level:"Senior - non Tech",skills:{"Business Processes":8,"Technical Expertise":7,"Analytical Skills":8,"Strategic Thinking":7,"Collaboration":9},values:["Stronger together"],bestWork:"Micky supported the Experian subscription upgrade project, where new data services were required. When data expenses exceeded the budget, he helped secure additional funding and obtain the necessary approvals.",advice:"Deepen understanding of Intuit\u2019s products, workflows, and vendor services, and proactively apply that knowledge to improve cross-team alignment and vendor management (e.g., addressing issues such as monthly accrual timing and billing issue)",other:""},
  {name:"Sarah Zimmerman",from:"Raelene Segal",rel:"stakeholder",level:"Staff",skills:{"Technical Craft":9,"Execution":9,"Customer Centric Outcomes":8,"Accelerating Teams":9,"Communication & Ownership":9},values:["Stronger together"],bestWork:"Collaboration on ROI data pipelines and capabilities - Sarah has been a strong collaborator on the ROI data pipelines and capabilities work alongside Akhil, who is leading an ROI initiative for Policy and Operations. Their partnership has been particularly effective in shaping best practices, facilitating thoughtful brainstorming, and developing a clear framework and roadmap. Sarah\u2019s contributions consistently emphasized not just immediate team needs, but also how these capabilities can scale to benefit the broader Risk organization.",advice:"Sarah is consistently operating at the next level \u2014 she\u2019s always upskilling, pushing herself, and raising the bar in how she shows up and delivers impact. For her continued growth, it would be valuable to scale the analytics capabilities she\u2019s building beyond one-off engagements. Creating lightweight forums (e.g., Slack channels or team syncs) could help share use cases more broadly and drive cross-team learning.",other:""},
  {name:"Micky Makanji",from:"Evan Zhu",rel:"stakeholder",level:"Senior - non Tech",skills:{"Business Processes":6,"Technical Expertise":5,"Analytical Skills":7,"Strategic Thinking":6,"Collaboration":8},values:["Courage","Stronger together","We care and give back"],bestWork:"Micky had a strong start this year, quickly leveraging his FP&A background to ramp effectively in a new domain. He was very proactive in reaching out to stakeholders and building early partnerships, particularly helping strengthen the connection between the Risk Analytics team and Finance. He very proactively shared his inputs on finance forecast of vendor spend, which improved visibility in this area.",advice:"Micky should continue to lean into his FP&A background and build on his strong foundation in financial analysis, while continuing to deepen his understanding of the Risk Management domain. A key opportunity going forward is to further connect financial insights to business outcomes.",other:""},
  {name:"Quan Hu",from:"Sindhu Bhat",rel:"stakeholder",level:"Senior",skills:{"Technical Craft":8,"Execution":8,"Customer Centric Outcomes":6,"Accelerating Teams":9,"Credit Loss Forecasting":8},values:["Customer obsession","Integrity without compromise","Stronger together"],bestWork:"Quan has been with Intuit for less than 6 months but has been very proactive in understanding the portfolio, doing analysis to accurately evaluate how for new products loss projection should be done. He has extreme ownership and able to quickly help us with loss projections and our stance for SLT meetings",advice:"Proactively communicate with credit team as these products are new and things change very fast, so staying close will enable him to have right context for projecting losses.",other:""},
];

function escapeHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function scoreColor(v, max) {
  const t = Math.max(0, Math.min(1, (v - 1) / (max - 1)));
  if (t < 0.5) {
    const p = t / 0.5;
    return `rgb(${Math.round(239+(161-239)*p)},${Math.round(68+(161-68)*p)},${Math.round(68+(161-68)*p)})`;
  }
  const p = (t - 0.5) / 0.5;
  return `rgb(${Math.round(161+(74-161)*p)},${Math.round(161+(222-161)*p)},${Math.round(161+(128-161)*p)})`;
}

function groupByMember() {
  const map = {};
  RAW.forEach((r) => {
    if (!map[r.name]) map[r.name] = [];
    map[r.name].push(r);
  });
  return map;
}

function buildMemberCard(name, responses) {
  const card = document.createElement("div");
  card.className = "member-card";
  card.dataset.member = name;

  // Skill averages
  const skillTotals = {};
  const skillCounts = {};
  responses.forEach((r) => {
    for (const [k, v] of Object.entries(r.skills)) {
      skillTotals[k] = (skillTotals[k] || 0) + v;
      skillCounts[k] = (skillCounts[k] || 0) + 1;
    }
  });

  const skillAvgs = Object.keys(skillTotals).map((k) => ({
    label: k,
    avg: skillTotals[k] / skillCounts[k],
    count: skillCounts[k],
  }));

  const overallAvg = skillAvgs.length
    ? skillAvgs.reduce((s, sk) => s + sk.avg, 0) / skillAvgs.length
    : 0;

  // Values frequency
  const valMap = {};
  responses.forEach((r) => r.values.forEach((v) => { valMap[v] = (valMap[v] || 0) + 1; }));
  const valsSorted = Object.entries(valMap).sort((a, b) => b[1] - a[1]);

  // Relationships
  const rels = responses.map((r) => r.from + (r.rel ? ` (${r.rel})` : "")).join(", ");

  let html = `<h2>${escapeHtml(name)}</h2>`;
  html += `<div class="member-meta">${responses.length} response(s) · ${rels}</div>`;
  html += `<div class="member-meta">Operating level: ${escapeHtml(responses[0].level)} · Overall avg: <strong style="color:${scoreColor(overallAvg, 10)}">${overallAvg.toFixed(1)}</strong></div>`;

  // Skills
  html += `<div class="section-title">Skill ratings (avg)</div>`;
  skillAvgs.forEach((sk) => {
    const pct = (sk.avg / 10) * 100;
    const color = scoreColor(sk.avg, 10);
    html += `<div class="skill-row">
      <span class="skill-label">${escapeHtml(sk.label)}</span>
      <div class="skill-bar-bg"><div class="skill-bar" style="width:${pct}%;background:${color}"></div></div>
      <span class="skill-score" style="color:${color}">${sk.avg.toFixed(1)}</span>
    </div>`;
  });

  // Values
  html += `<div class="section-title">Intuit values demonstrated</div><div class="values-list">`;
  valsSorted.forEach(([v, c]) => {
    html += `<span class="value-tag">${escapeHtml(v)}<span class="value-count"> ×${c}</span></span>`;
  });
  html += `</div>`;

  // Narratives — best work
  const bestWork = responses.filter((r) => r.bestWork.trim());
  if (bestWork.length) {
    html += `<div class="section-title">Best work & impact</div>`;
    bestWork.forEach((r) => {
      html += `<div class="narrative-block"><div class="narrator">${escapeHtml(r.from)}</div>${escapeHtml(r.bestWork)}</div>`;
    });
  }

  // Narratives — advice
  const advice = responses.filter((r) => r.advice.trim());
  if (advice.length) {
    html += `<div class="section-title">Growth advice</div>`;
    advice.forEach((r) => {
      html += `<div class="narrative-block"><div class="narrator">${escapeHtml(r.from)}</div>${escapeHtml(r.advice)}</div>`;
    });
  }

  // Narratives — other
  const other = responses.filter((r) => r.other.trim());
  if (other.length) {
    html += `<div class="section-title">Other comments</div>`;
    other.forEach((r) => {
      html += `<div class="narrative-block"><div class="narrator">${escapeHtml(r.from)}</div>${escapeHtml(r.other)}</div>`;
    });
  }

  card.innerHTML = html;
  return card;
}

function init() {
  const members = groupByMember();
  const names = Object.keys(members).sort();
  const summaryBar = document.getElementById("summary-bar");
  const cardsEl = document.getElementById("cards");

  let activeMember = null;

  const exportBtn = document.getElementById("export-btn");

  function render() {
    cardsEl.innerHTML = "";
    const show = activeMember ? [activeMember] : names;
    show.forEach((name) => {
      cardsEl.appendChild(buildMemberCard(name, members[name]));
    });
    exportBtn.classList.toggle("hidden", !activeMember);
  }

  exportBtn.addEventListener("click", () => {
    if (!activeMember) return;
    summaryBar.classList.add("hidden");
    exportBtn.classList.add("hidden");
    document.body.classList.add("printing");
    window.print();
    summaryBar.classList.remove("hidden");
    exportBtn.classList.remove("hidden");
    document.body.classList.remove("printing");
  });

  names.forEach((name) => {
    const chip = document.createElement("span");
    chip.className = "summary-chip";
    chip.innerHTML = `<span class="chip-name">${escapeHtml(name)}</span><span class="chip-count">${members[name].length}</span>`;
    chip.addEventListener("click", () => {
      if (activeMember === name) {
        activeMember = null;
        summaryBar.querySelectorAll(".summary-chip").forEach((c) => c.classList.remove("active"));
      } else {
        activeMember = name;
        summaryBar.querySelectorAll(".summary-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      }
      render();
    });
    summaryBar.appendChild(chip);
  });

  render();
}

init();
