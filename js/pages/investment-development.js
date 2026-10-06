
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-development");
  setTimeout(render, 400);
});
function render(){
  const s = window.state;
  if(!s.investmentAssets){ setTimeout(render,300); return; }
  const calc = window.InvestmentCalc;
  const root = document.getElementById("pageRoot");
  const filters = document.getElementById("filters");
  const actions = document.getElementById("actions");
  if(filters) filters.innerHTML = `<select class="inv-filter"><option>All Funds</option><option>Pension Fund</option></select><input class="inv-filter" placeholder="Search" style="min-width:200px">`;
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportDevelopmentProjects()">Export CSV</button>`;
  
      const devs = s.developmentProjects||[];
      root.innerHTML = `<div class="card"><div class="card-head"><h3>Development Projects • Feasibility → Appraisal → Approval → Development → Property Asset → Investment Portfolio</h3></div><div class="card-body">${devs.map(d=>`<div style="border:1px solid var(--border);border-radius:12px;padding:14px;background:#FFF;margin-bottom:12px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><div><b style="font-size:14px">${d.name} • ${d.id}</b><div style="font-size:12px;color:var(--muted)">Status: ${d.status} • Budget ${formatCurrency(d.budget)} • Spent ${formatCurrency(d.spent)} • Progress ${d.progress}%</div></div><span class="pill blue">${d.status}</span></div><div class="development-metrics" style="margin-top:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px"><div class="mini-kpi"><div class="l">Feasibility NPV</div><div class="v">${formatCurrency(d.feasibility.npv)}</div></div><div class="mini-kpi"><div class="l">Feasibility IRR</div><div class="v">${d.feasibility.irr}%</div></div><div class="mini-kpi"><div class="l">Contractor</div><div class="v">${d.contractor}</div></div><div class="mini-kpi"><div class="l">Stage</div><div class="v" style="font-size:11px">${d.stage}</div></div></div><div style="margin-top:10px" class="chart-box"><div style="display:flex;align-items:center;gap:4px"><div style="flex:1;height:8px;background:#E2E8F0;border-radius:20px;overflow:hidden"><div style="width:${d.progress}%;height:100%;background:#2563EB"></div></div><span style="font-size:12px;font-weight:700">${d.progress}%</span></div><div style="font-size:11px;color:var(--muted);margin-top:6px">Feasibility → Investment Appraisal (NPV/IRR) → Approval (maker-checker) → Construction (payment certificates, variations, retention) → Completion → Property Asset → Investment Portfolio</div></div></div>`).join("")}</div></div>`;
    
}
function exportDevelopmentProjects() {
  const rows = [["Project ID", "Name", "Fund", "Status", "Budget", "Spent", "Progress", "Contractor"]];
  (window.state.developmentProjects || []).forEach((project) => rows.push([
    project.id, project.name, project.fundId, project.status, project.budget,
    project.spent, project.progress, project.contractor,
  ]));
  window.downloadCsvFile("propertypro-development-projects.csv", rows);
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
