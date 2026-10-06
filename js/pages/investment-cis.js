
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-cis");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-collective-investments.csv')">Export CSV</button>`;
  
      const cis = s.investmentAssets.filter(a=>a.assetClass==="Collective Investment Schemes");
      root.innerHTML = `<div class="card"><div class="card-head"><h3>CIS • Fund Manager Mandate NAV Units Management Fees Performance Fee Verification</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Asset ID</th><th>Name</th><th>Fund Manager</th><th>Mandate</th><th>NAV</th><th>Units</th><th>Cost</th><th>Market Value</th><th>Mgmt Fee %</th><th>Performance</th><th>Yield</th></tr></thead><tbody>${cis.map(c=>`<tr><td><b>${c.id}</b></td><td>${c.name}</td><td>${c.fundManager}</td><td>${c.mandate}</td><td>${c.nav}</td><td>${c.units.toLocaleString()}</td><td>${formatCurrency(c.cost)}</td><td><b>${formatCurrency(c.marketValue)}</b></td><td>${c.managementFee}%</td><td style="color:#16A34A">+${c.performance}%</td><td>${c.yield}%</td></tr>`).join("")}</tbody></table></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
