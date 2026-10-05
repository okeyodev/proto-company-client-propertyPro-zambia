
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-deals");
  setTimeout(render, 250);
});

function render() {
  const s = window.state;
  if (!s.investmentDeals && window.ensureInvestmentState) window.ensureInvestmentState();
  if (!Array.isArray(s.investmentDeals)) { setTimeout(render, 100); return; }
  const root = document.getElementById("pageRoot");
  const filters = document.getElementById("filters");
  const actions = document.getElementById("actions");
  if (!root) return;

  if (filters && !filters.dataset.bound) {
    filters.innerHTML = `<select class="inv-filter" id="dealStageFilter"><option value="">All Stages</option>${["Origination", "Screening", "Appraisal / Due Diligence", "MIC/FIC/Board Approval", "Conditions Precedent", "Deal Closing", "Monitoring"].map((stage, index) => `<option value="${index + 1}">${stage}</option>`).join("")}</select><input class="inv-filter" id="dealSearch" placeholder="Search deals" style="min-width:200px">`;
    filters.dataset.bound = "true";
    filters.querySelector("#dealStageFilter").addEventListener("change", render);
    filters.querySelector("#dealSearch").addEventListener("input", render);
  }
  if (actions) actions.innerHTML = `<button class="btn" type="button" onclick="toast('Deal pipeline export is a demo action.','info')">Export</button>`;

  const deals = Array.isArray(s.investmentDeals) ? s.investmentDeals : [];
  const stages = ["Origination", "Screening", "Appraisal / Due Diligence", "MIC/FIC/Board Approval", "Conditions Precedent", "Deal Closing", "Monitoring"];
  const selectedStage = filters && filters.querySelector("#dealStageFilter") ? filters.querySelector("#dealStageFilter").value : "";
  const query = filters && filters.querySelector("#dealSearch") ? filters.querySelector("#dealSearch").value.trim().toLowerCase() : "";
  const visibleDeals = deals.filter((deal) =>
    (!selectedStage || Number(deal.stageNum) === Number(selectedStage)) &&
    (!query || [deal.id, deal.name, deal.type, deal.officer].some((value) => String(value || "").toLowerCase().includes(query)))
  );
  const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi"><div class="inv-kpi-label">Active Deals</div><div class="inv-kpi-value">${deals.length}</div></div><div class="inv-kpi green"><div class="inv-kpi-label">Total Value</div><div class="inv-kpi-value">${formatCurrency(totalValue)}</div></div></div><div class="pipeline" id="pipeline"></div>`;
  document.getElementById("pipeline").innerHTML = stages.map((stage, index) => {
    const stageDeals = visibleDeals.filter((deal) => Number(deal.stageNum) === index + 1);
    return `<div class="pipeline-col"><h4>${stage} <span>${stageDeals.length}</span></h4>${stageDeals.map((deal) => {
      const esc = escapeHtml;
      const statusClass = deal.approvalStatus === "Draft" ? "gray" : deal.approvalStatus === "Pending" || deal.approvalStatus === "Under Review" ? "amber" : deal.approvalStatus === "Submitted" ? "blue" : "green";
      return `<button type="button" class="pipeline-card" style="width:100%;text-align:left;color:inherit;font:inherit" onclick="viewDeal('${esc(deal.id)}')"><span class="deal-id">${esc(deal.id)}</span><span class="deal-name">${esc(deal.name)}</span><span class="deal-meta"><span>${esc(deal.type)}</span><span>${formatCurrency(Number(deal.value) || 0)}</span><span>${Number(deal.expectedReturn) || 0}%</span><span>${esc(deal.officer)}</span></span><span style="display:block;margin-top:4px"><span class="pill ${statusClass}">${esc(deal.approvalStatus)}</span></span></button>`;
    }).join("") || `<div style="font-size:11px;color:var(--muted);padding:8px;text-align:center">${deals.length && (selectedStage || query) ? "No matching deals" : "No deals"}</div>`}</div>`;
  }).join("");
}

function viewDeal(id) {
  const deal = (window.state.investmentDeals || []).find((item) => item.id === id);
  if (!deal) return;
  showClientRecordDetails(deal.id, [
    { label: "Deal", value: deal.name }, { label: "Type", value: deal.type },
    { label: "Value", value: formatCurrency(Number(deal.value) || 0) },
    { label: "Expected Return", value: `${Number(deal.expectedReturn) || 0}%` }, { label: "Stage", value: deal.stage },
    { label: "Approval Status", value: deal.approvalStatus }, { label: "Officer", value: deal.officer },
    { label: "Next Action", value: deal.nextAction },
  ]);
}

function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
