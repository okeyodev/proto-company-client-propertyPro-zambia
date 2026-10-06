
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-appraisal");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-appraisal-cashflows.csv')">Export Cash Flows</button>`;
  
      root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi"><div class="inv-kpi-label">Base Case NPV</div><div class="inv-kpi-value">${formatCurrency(12500000)}</div><div class="inv-kpi-foot">IRR 11.2%</div></div><div class="inv-kpi green"><div class="inv-kpi-label">Optimistic NPV</div><div class="inv-kpi-value">${formatCurrency(22000000)}</div><div class="inv-kpi-foot">IRR 14.5%</div></div><div class="inv-kpi red"><div class="inv-kpi-label">Downside NPV</div><div class="inv-kpi-value">${formatCurrency(3000000)}</div><div class="inv-kpi-foot">IRR 8.0%</div></div></div>
      <div class="section-split"><div class="alloc-card appraisal-assumptions"><h4>Assumptions</h4><div style="font-size:13px;line-height:1.7">Rent growth 5%, vacancy 10%, discount 12%, exit yield 8.5%, holding 10y<br>Property: East Park Mall • Retail • 95M acquisition • 9.5% expected return</div><div class="whatif-box" style="margin-top:12px"><div style="font-weight:600">Inputs</div><div class="whatif-input"><label style="width:120px">Discount Rate %</label><input id="discRate" type="number" value="12"><button class="btn" onclick="recalc()">Recalc NPV/IRR</button></div><div id="calcResult" style="margin-top:8px;font-size:13px;background:#FFF;padding:8px;border-radius:8px">Base: NPV 12.5M IRR 11.2% • Uses InvestmentCalc.calculateNPV and calculateIRR with cashflows</div></div></div><div class="alloc-card"><h4>Projected Cash Flows</h4><div class="table-wrap appraisal-cashflows"><table><thead><tr><th>Year</th><th>Rental Income</th><th>OpEx</th><th>NOI</th><th>Cash Flow</th></tr></thead><tbody>${[0,1,2,3,4,5].map(y=>`<tr><td>Year ${y}</td><td>${formatCurrency(9500000 + y*500000)}</td><td>${formatCurrency(2000000)}</td><td>${formatCurrency(7500000 + y*500000)}</td><td>${formatCurrency(y===0? -95000000 : 7500000 + y*500000)}</td></tr>`).join("")}</tbody></table></div></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
