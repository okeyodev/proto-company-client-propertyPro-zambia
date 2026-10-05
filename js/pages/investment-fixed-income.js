
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-fixed-income");
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
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Fixed Income...','info')">Export</button><button class="btn pay-now-btn" onclick="toast('Action - Fixed Income','success')">Generate</button>`;
  
      const fis = s.investmentAssets.filter(a=>a.assetClass==="Fixed Income");
      root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi"><div class="inv-kpi-label">FI Portfolio</div><div class="inv-kpi-value">${formatCurrency(fis.reduce((a,b)=>a+b.marketValue,0))}</div></div><div class="inv-kpi"><div class="inv-kpi-label">Avg Yield</div><div class="inv-kpi-value">12.1%</div></div><div class="inv-kpi"><div class="inv-kpi-label">Accrued Interest</div><div class="inv-kpi-value">${formatCurrency(fis.reduce((a,b)=>a+(b.accruedInterest||0),0))}</div></div></div><div class="card"><div class="card-head"><h3>Fixed Income • T-bills Bonds Placements • Coupon Accrual Maturity Collateral • Day-count Actual/360 30/360</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Asset ID</th><th>Name</th><th>Face Value</th><th>Cost</th><th>Carrying</th><th>Fair Value</th><th>Coupon</th><th>Yield</th><th>Maturity</th><th>Accrued</th><th>Counterparty</th><th>Rating</th></tr></thead><tbody>${fis.map(f=>`<tr><td><b>${f.id}</b></td><td>${f.name}</td><td>${formatCurrency(f.faceValue)}</td><td>${formatCurrency(f.cost)}</td><td>${formatCurrency(f.carryingValue)}</td><td><b>${formatCurrency(f.marketValue)}</b></td><td>${f.coupon}%</td><td>${f.yield}%</td><td>${f.maturity}</td><td>${formatCurrency(f.accruedInterest)}</td><td>${f.counterparty}</td><td>${f.rating}</td></tr>`).join("")}</tbody></table></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
