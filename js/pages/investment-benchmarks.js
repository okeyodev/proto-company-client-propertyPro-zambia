
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-benchmarks");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-benchmarks.csv')">Export CSV</button><button class="btn pay-now-btn" type="button" onclick="render()">Refresh Benchmarks</button>`;
  
      const bms = s.benchmarks||[];
      root.innerHTML = `<div class="card"><div class="card-head"><h3>Benchmarks • Fund vs Benchmark</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Benchmark</th><th>Type</th><th>Return</th><th>Portfolio Return</th><th>Excess</th></tr></thead><tbody>${bms.map(b=>`<tr><td><b>${b.name}</b></td><td>${b.type}</td><td>${b.return}%</td><td>${(Number(b.return) + 0.8).toFixed(1)}%</td><td style="color:#16A34A">+0.8%</td></tr>`).join("")}<tr><td><b>Overall Benchmark</b></td><td>Composite</td><td>9.5%</td><td>8.7%</td><td style="color:#DC2626">-0.8%</td></tr></tbody></table></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
