
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-performance");
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
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Performance...','info')">Export</button><button class="btn pay-now-btn" onclick="toast('Action - Performance','success')">Generate</button>`;
  
      const perf = s.performanceMetrics;
      root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi"><div class="inv-kpi-label">TWRR</div><div class="inv-kpi-value">${perf.twrr}%</div><div class="inv-kpi-foot">Benchmark 9.5%</div></div><div class="inv-kpi green"><div class="inv-kpi-label">MWRR</div><div class="inv-kpi-value">${perf.mwrr}%</div></div><div class="inv-kpi"><div class="inv-kpi-label">YTD Return</div><div class="inv-kpi-value">${perf.ytdReturn}%</div></div><div class="inv-kpi"><div class="inv-kpi-label">Income Return</div><div class="inv-kpi-value">5.2%</div></div><div class="inv-kpi"><div class="inv-kpi-label">Capital Return</div><div class="inv-kpi-value">3.5%</div></div></div>
      <div class="section-split"><div class="card"><div class="card-head"><h3>Performance by Fund Portfolio Asset Class Individual Asset Property • Property feeds overall</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Level</th><th>Name</th><th>Value</th><th>TWRR</th><th>Benchmark</th><th>Excess</th><th>Income</th><th>Capital</th></tr></thead><tbody>
        <tr><td>Fund</td><td>Pension Fund</td><td>${formatCurrency(1840000000)}</td><td><b>8.7%</b></td><td>9.5%</td><td style="color:#DC2626">-0.8%</td><td>5.2%</td><td>3.5%</td></tr>
        <tr><td>Portfolio</td><td>Property Portfolio</td><td>${formatCurrency(s.investmentAssets.filter(a=>a.assetClass==="Property").reduce((a,b)=>a+b.marketValue,0))}</td><td><b>9.2%</b></td><td>7.5%</td><td style="color:#16A34A">+1.7%</td><td>6.8%</td><td>2.4%</td></tr>
        <tr><td>Asset Class</td><td>Property</td><td>${formatCurrency(420000000)}</td><td>9.2%</td><td>7.5%</td><td style="color:#16A34A">+1.7%</td><td>6.8%</td><td>2.4%</td></tr>
        ${s.investmentAssets.filter(a=>a.assetClass==="Property").map(p=>`<tr><td>Individual</td><td>${p.name}</td><td>${formatCurrency(p.marketValue)}</td><td>${p.yield}%</td><td>7.5%</td><td style="color:#16A34A">+${(p.yield-7.5).toFixed(1)}%</td><td>${p.netYield}%</td><td>${(p.yield-p.netYield).toFixed(1)}%</td></tr>`).join("")}
      </tbody></table></div></div><div class="card"><div class="card-head"><h3>Attribution</h3></div><div class="card-body"><div style="font-size:13px">Property performance feeds overall portfolio performance. Rental Income → NOI → Yield → Investment Performance → Portfolio Performance → Board Dashboard. Valuation change +5.8% YoY contributes to capital return. Occupancy 88.8% drives income return.</div><div class="chart-box" style="margin-top:12px"><svg viewBox="0 0 300 80" width="100%" height="80"><polyline fill="none" stroke="#2563EB" stroke-width="2" points="20,60 60,50 100,45 140,40 180,35 220,30"/><polyline fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 4" points="20,55 60,50 100,48 140,45 180,42 220,40"/><text x="20" y="75" font-size="9" fill="#64748B">May</text><text x="220" y="75" font-size="9" fill="#64748B">Oct</text></svg><div style="font-size:11px;color:var(--muted)">Blue = Portfolio TWRR, Gray dashed = Benchmark • Property outperforms benchmark by 1.7%</div></div></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
