
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-unlisted");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-unlisted-investments.csv')">Export CSV</button>`;
  
      const unl = s.investmentAssets.filter(a=>a.assetClass==="Unlisted Equity");
      root.innerHTML = `<div class="card"><div class="card-head"><h3>Unlisted Equity / SPVs / PPP • Ownership % Capital Calls Distributions Covenants Valuation Fair Value</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Asset ID</th><th>Name</th><th>Ownership %</th><th>Cost</th><th>Market/Fair Value</th><th>Status</th><th>Last Valuation</th><th>Income</th></tr></thead><tbody>${unl.map(u=>`<tr><td><b>${u.id}</b></td><td>${u.name}</td><td>${u.ownership}%</td><td>${formatCurrency(u.cost)}</td><td><b>${formatCurrency(u.marketValue)}</b></td><td><span class="pill green">${u.status}</span></td><td>${u.lastValuation}</td><td>${formatCurrency(u.income||0)}</td></tr>`).join("")}</tbody></table></div></div><div style="margin-top:12px" class="card"><div class="card-head"><h3>Capital Calls & Distributions</h3></div><div class="card-body"><div style="font-size:13px">Lusaka South MFEZ SPV 25% ownership • Capital calls: ZMW 45M committed, 30M called • Distributions: None yet • Covenants: Debt/Equity <60%, occupancy >70% • Supporting docs: SPV agreement, valuation report</div></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
