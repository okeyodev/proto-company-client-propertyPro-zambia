
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-board");
  setTimeout(renderBoard, 400);
});
function renderBoard(){
  const s = window.state;
  if(!s.investmentAssets){ setTimeout(renderBoard,300); return; }
  const calc = window.InvestmentCalc;
  const total = s.investmentAssets.reduce((a,b)=> a+b.marketValue,0);
  const propVal = s.investmentAssets.filter(x=>x.assetClass==="Property").reduce((a,b)=>a+b.marketValue,0);
  const fiVal = s.investmentAssets.filter(x=>x.assetClass==="Fixed Income").reduce((a,b)=>a+b.marketValue,0);
  const eqVal = s.investmentAssets.filter(x=>x.assetClass==="Listed Equities").reduce((a,b)=>a+b.marketValue,0);
  const cisVal = s.investmentAssets.filter(x=>x.assetClass==="Collective Investment Schemes").reduce((a,b)=>a+b.marketValue,0);
  const cashVal = s.investmentAssets.filter(x=>x.assetClass==="Cash").reduce((a,b)=>a+b.marketValue,0);
  const altVal = s.investmentAssets.filter(x=>x.assetClass==="Unlisted Equity").reduce((a,b)=>a+b.marketValue,0);
  const filters = document.getElementById("filters");
  if(filters) filters.innerHTML = `<select class="inv-filter"><option>Board Pack Q3 2026</option></select><select class="inv-filter"><option>All Funds</option></select>`;
  const actions = document.getElementById("actions");
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Board Pack PDF...','info')">Export PDF</button><button class="btn pay-now-btn" onclick="toast('Board Pack Generated','success')">Generate Board Pack</button>`;
  const root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="inv-kpi-grid">
      <div class="inv-kpi"><div class="inv-kpi-label">Total Fund Value</div><div class="inv-kpi-value">${formatCurrency(total)}</div><div class="inv-kpi-foot">Pension + Accident Funds</div></div>
      <div class="inv-kpi green"><div class="inv-kpi-label">Property</div><div class="inv-kpi-value">${formatCurrency(propVal)}</div><div class="inv-kpi-foot">${calc.calculatePortfolioAllocation(propVal,total).toFixed(1)}% of fund</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Fixed Income</div><div class="inv-kpi-value">${formatCurrency(fiVal)}</div><div class="inv-kpi-foot">${calc.calculatePortfolioAllocation(fiVal,total).toFixed(1)}%</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Equities</div><div class="inv-kpi-value">${formatCurrency(eqVal)}</div><div class="inv-kpi-foot">${calc.calculatePortfolioAllocation(eqVal,total).toFixed(1)}%</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Cash</div><div class="inv-kpi-value">${formatCurrency(cashVal)}</div><div class="inv-kpi-foot">Liquidity</div></div>
    </div>
    <div class="board-grid">
      <div class="board-card"><h3>TOTAL FUND VALUE Breakdown</h3>
        ${[
          {label:"Fixed Income", val:fiVal},
          {label:"Property", val:propVal},
          {label:"Listed Equities", val:eqVal},
          {label:"CIS", val:cisVal},
          {label:"Unlisted", val:altVal},
          {label:"Cash", val:cashVal}
        ].map(r=>`<div class="board-stat"><span>${r.label}</span><b>${formatCurrency(r.val)} • ${calc.calculatePortfolioAllocation(r.val,total).toFixed(1)}%</b></div>`).join("")}
      </div>
      <div class="board-card"><h3>PROPERTY Contribution</h3>
        <div class="board-stat"><span>Total Value</span><b>${formatCurrency(propVal)}</b></div>
        <div class="board-stat"><span>Rental Income (annual)</span><b>${formatCurrency(61000000)}</b></div>
        <div class="board-stat"><span>Operating Costs</span><b>${formatCurrency(16300000)}</b></div>
        <div class="board-stat"><span>NOI</span><b>${formatCurrency(44700000)}</b></div>
        <div class="board-stat"><span>Occupancy</span><b>88.8%</b></div>
        <div class="board-stat"><span>Arrears</span><b>${formatCurrency(170000)} • ${calc.calculateArrearsRatio(170000,211520).toFixed(1)}%</b></div>
        <div class="board-stat"><span>Yield</span><b>8.9% avg</b></div>
        <div class="board-stat"><span>Valuation Change YoY</span><b style="color:#16A34A">+5.8% • ${formatCurrency(propVal*0.058)}</b></div>
        <div style="margin-top:12px"><button class="btn" onclick="goToPage('investment-property')">View Property Portfolio</button></div>
      </div>
    </div>
    <div class="card" style="margin-top:14px"><div class="card-head"><h3>Board Pack Contents</h3></div><div class="card-body">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        ${["Portfolio Valuation","Asset Allocation","Property Portfolio","NOI & Yield","Occupancy & Arrears","Investment Performance","Risk","Compliance","Cash & Liquidity"].map(n=>`<div style="padding:10px;border:1px solid var(--border);border-radius:8px;background:#F8FAFC"><b style="font-size:13px">${n}</b><div style="font-size:11px;color:var(--muted);margin-top:4px">Included in Board Pack • IAS 40 / IFRS 13</div></div>`).join("")}
      </div>
    </div></div>
  `;
}
