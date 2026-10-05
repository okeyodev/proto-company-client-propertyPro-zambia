
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-compliance");
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
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Compliance Monitor...','info')">Export</button><button class="btn pay-now-btn" onclick="toast('Action - Compliance Monitor','success')">Generate</button>`;
  
      const breaches = s.complianceBreaches||[];
      const rules = s.complianceRules||[];
      root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi red"><div class="inv-kpi-label">Breaches</div><div class="inv-kpi-value">${breaches.length}</div><div class="inv-kpi-foot">1 Medium 1 Monitoring</div></div><div class="inv-kpi"><div class="inv-kpi-label">Rules Monitored</div><div class="inv-kpi-value">${rules.length}</div></div><div class="inv-kpi green"><div class="inv-kpi-label">Compliant</div><div class="inv-kpi-value">92%</div></div></div>
      <div class="section-split"><div class="card"><div class="card-head"><h3>Compliance Rules • Pre-trade Post-trade</h3></div><div class="card-body">${rules.map(r=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F1F5F9"><div><b style="font-size:13px">${r.name}</b><div style="font-size:11px;color:var(--muted)">${r.description} • Threshold ${r.threshold||r.thresholdMin+'-'+r.thresholdMax} • ${r.type} • Severity ${r.severity}</div></div><span class="pill blue">${r.type}</span></div>`).join("")}</div></div><div class="card"><div class="card-head"><h3>Breach Register</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Breach ID</th><th>Rule</th><th>Asset</th><th>Portfolio</th><th>Threshold</th><th>Actual</th><th>Severity</th><th>Detected</th><th>Status</th><th>Owner</th><th>Resolution</th></tr></thead><tbody>${breaches.map(b=>`<tr><td><b>${b.id}</b></td><td>${b.rule}</td><td>${b.asset}</td><td>${b.portfolio}</td><td>${b.threshold}%</td><td><b>${b.actual}%</b></td><td><span class="pill ${b.severity==='High'?'red':b.severity==='Medium'?'amber':'green'}">${b.severity}</span></td><td>${b.detected}</td><td><span class="pill ${b.status==='Open'?'red':'blue'}">${b.status}</span></td><td>${b.owner}</td><td>${b.resolution}</td></tr>`).join("")}</tbody></table></div></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
