
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-risk");
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
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Risk Dashboard...','info')">Export</button><button class="btn pay-now-btn" onclick="toast('Action - Risk Dashboard','success')">Generate</button>`;
  
      const risks = s.riskMetrics||[];
      root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi"><div class="inv-kpi-label">Concentration</div><div class="inv-kpi-value">Zanaco 22.5%</div><div class="inv-kpi-foot">Limit 20% • Medium</div></div><div class="inv-kpi"><div class="inv-kpi-label">Vacancy</div><div class="inv-kpi-value">15.2%</div><div class="inv-kpi-foot">Zambezi Mall • Low</div></div><div class="inv-kpi"><div class="inv-kpi-label">Liquidity</div><div class="inv-kpi-value">5.1%</div><div class="inv-kpi-foot">Min 2% • Low</div></div><div class="inv-kpi"><div class="inv-kpi-label">VaR</div><div class="inv-kpi-value">ZMW 12.5M</div><div class="inv-kpi-foot">95% 1-day</div></div></div>
      <div class="section-split"><div class="card"><div class="card-head"><h3>Risk Metrics • Concentration Credit Liquidity Duration Convexity VaR Currency Counterparty Property ALM</h3></div><div class="card-body">${risks.map(r=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F1F5F9"><div><b>${r.type}</b><div style="font-size:11px;color:var(--muted)">Limit: ${r.limit}</div></div><div style="text-align:right"><b>${r.value}</b><div><span class="pill ${r.severity==='High'?'red':r.severity==='Medium'?'amber':'green'}">${r.severity}</span></div></div></div>`).join("")}</div></div><div class="card"><div class="card-head"><h3>Property in Consolidated Portfolio Risk</h3></div><div class="card-body"><div style="font-size:13px;line-height:1.6">Property Portfolio Value ${formatCurrency(s.investmentAssets.filter(a=>a.assetClass==="Property").reduce((a,b)=>a+b.marketValue,0))} • 22.8% allocation • Contributes to concentration, vacancy, geographic concentration (Lusaka 75%), lease expiry concentration (L-2026-001 8 months), arrears, insurance expiry, maintenance exposure, valuation risk (DCF method sensitivity), regulatory/compliance risk (ZRA TPIN).<br><br>ALM: Assets ${formatCurrency(s.investmentAssets.reduce((a,b)=>a+b.marketValue,0))} • Liabilities (Pension obligations) • Duration mismatch monitoring • Liquidity forecast 30/90 days.</div></div></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
