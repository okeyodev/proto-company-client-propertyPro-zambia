
document.addEventListener("DOMContentLoaded", () => {
  initCommon("property-investment-detail");
  setTimeout(renderDetail, 400);
});
let currentAsset = null;
function renderDetail(){
  const s = window.state;
  if(!s.investmentAssets){ setTimeout(renderDetail,300); return; }
  currentAsset = s.investmentAssets.find(a=>a.id==="INV-PROP-001") || s.investmentAssets[0];
  const prop = s.properties.find(p=>p.id===currentAsset.propertyId);
  const calc = window.InvestmentCalc;
  const filters = document.getElementById("filters");
  if(filters) filters.innerHTML = `<select class="inv-filter" id="assetSelect">${s.investmentAssets.filter(a=>a.assetClass==="Property").map(a=>`<option value="${a.id}" ${a.id===currentAsset.id?"selected":""}>${a.name} • ${a.id}</option>`).join("")}</select>`;
  document.getElementById("assetSelect").addEventListener("change", e=>{ currentAsset = s.investmentAssets.find(a=>a.id===e.target.value); renderDetail(); });
  const actions = document.getElementById("actions");
  if(actions) actions.innerHTML = `<button class="btn" onclick="goToPage('investment-property')">Back</button><button class="btn" onclick="toast('Opening Property Management Record for ${currentAsset.propertyId}','info'); goToPage('client-dashboard')">Open Property Management</button><button class="btn pay-now-btn">Open Investment Record</button>`;
  const valuationHistory = s.valuations.filter(v=>v.assetId===currentAsset.id);
  const lastVal = valuationHistory[valuationHistory.length-1];
  const root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="inv-kpi-grid">
      <div class="inv-kpi"><div class="inv-kpi-label">Market Value</div><div class="inv-kpi-value">${formatCurrency(currentAsset.marketValue)}</div><div class="inv-kpi-foot">Prev ${lastVal? formatCurrency(lastVal.previousValue):''}</div></div>
      <div class="inv-kpi green"><div class="inv-kpi-label">NOI</div><div class="inv-kpi-value">${formatCurrency(currentAsset.noi)}</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Yield</div><div class="inv-kpi-value">${currentAsset.yield}% / ${currentAsset.netYield}%</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Ownership</div><div class="inv-kpi-value">${currentAsset.ownership}%</div></div>
    </div>
    <div class="inv-tabs">
      <div class="inv-tab active" data-tab="overview">Overview</div>
      <div class="inv-tab" data-tab="valuation">Valuation</div>
      <div class="inv-tab" data-tab="income">Income</div>
      <div class="inv-tab" data-tab="expenses">Expenses</div>
      <div class="inv-tab" data-tab="performance">Performance</div>
      <div class="inv-tab" data-tab="risk">Risk</div>
      <div class="inv-tab" data-tab="documents">Documents</div>
      <div class="inv-tab" data-tab="transactions">Transactions</div>
      <div class="inv-tab" data-tab="operations">Operations</div>
      <div class="inv-tab" data-tab="audit">Audit</div>
    </div>
    <div style="background:#FFF;border:1px solid var(--border);border-top:0;border-radius:0 0 12px 12px;padding:16px">
      <div class="inv-tab-panel active" id="tab-overview"></div>
      <div class="inv-tab-panel" id="tab-valuation"></div>
      <div class="inv-tab-panel" id="tab-income"></div>
      <div class="inv-tab-panel" id="tab-expenses"></div>
      <div class="inv-tab-panel" id="tab-performance"></div>
      <div class="inv-tab-panel" id="tab-risk"></div>
      <div class="inv-tab-panel" id="tab-documents"></div>
      <div class="inv-tab-panel" id="tab-transactions"></div>
      <div class="inv-tab-panel" id="tab-operations"></div>
      <div class="inv-tab-panel" id="tab-audit"></div>
    </div>
  `;
  document.querySelectorAll(".inv-tab").forEach(tab=>{
    tab.addEventListener("click", ()=>{
      document.querySelectorAll(".inv-tab").forEach(t=>t.classList.remove("active"));
      document.querySelectorAll(".inv-tab-panel").forEach(p=>p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("tab-"+tab.dataset.tab).classList.add("active");
    });
  });
  document.getElementById("tab-overview").innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><h4>Investment Overview</h4><div style="font-size:13px;line-height:1.7">Property: ${prop? prop.name:currentAsset.name}<br>Asset ID: ${currentAsset.id}<br>Property ID: ${currentAsset.propertyId}<br>Class: ${currentAsset.assetClass}<br>Fund: ${currentAsset.fundId}<br>Market: ${formatCurrency(currentAsset.marketValue)}<br>NOI: ${formatCurrency(currentAsset.noi)}<br>Yield: ${currentAsset.yield}%<br>Occupancy: ${currentAsset.occupancy}%<br>Debt: ${formatCurrency(currentAsset.debt||0)}<br>Status: ${currentAsset.status}</div></div><div><h4>Operations Snapshot</h4><div style="font-size:13px;line-height:1.7">Property: ${prop.name} • ${prop.units} units • ${prop.occupied} occ<br>Unit 12: 320m² • Rent 85K • Lease L-2026-001<br>Invoices: 3 • Payments: 2 • Collection 6.5%<br>Maintenance: MNT-001 High AC • MNT-002 Electrical<br>Utilities: ELEC-0012 + WTR-0012 Billed</div><div style="margin-top:12px;padding:8px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;font-size:12px">Property Management operationally, Investment Management financially - same underlying asset, propertyId link</div></div></div>`;
  document.getElementById("tab-valuation").innerHTML = `<h4>Valuation History IAS40 IFRS13</h4><div class="table-wrap"><table><thead><tr><th>Date</th><th>Valuer</th><th>Method</th><th>Market</th><th>Prev</th><th>Change</th><th>%</th><th>Report</th></tr></thead><tbody>${valuationHistory.map(v=>`<tr><td>${v.date}</td><td>${v.valuer}</td><td>${v.method}</td><td><b>${formatCurrency(v.marketValue)}</b></td><td>${formatCurrency(v.previousValue)}</td><td>${formatCurrency(v.change)}</td><td>${v.changePct}%</td><td>${v.report}</td></tr>`).join("")}</tbody></table></div>`;
  document.getElementById("tab-income").innerHTML = `<h4>Income Derived from Invoices/Payments</h4><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"><div class="mini-kpi"><div class="l">Gross Rent</div><div class="v">${formatCurrency(currentAsset.grossIncome)}</div></div><div class="mini-kpi"><div class="l">Service</div><div class="v">${formatCurrency(144000)}</div></div><div class="mini-kpi"><div class="l">Total</div><div class="v">${formatCurrency(currentAsset.grossIncome+144000)}</div></div><div class="mini-kpi"><div class="l">Arrears</div><div class="v">${formatCurrency(85000)}</div></div></div>`;
  document.getElementById("tab-expenses").innerHTML = `<h4>Expenses</h4><div style="padding:12px;background:#F8FAFC;border:1px solid var(--border);border-radius:10px"><div style="display:flex;justify-content:space-between"><span>Gross Income</span><b>${formatCurrency(currentAsset.grossIncome)}</b></div><div style="display:flex;justify-content:space-between;margin-top:6px"><span>- OpEx</span><b>-${formatCurrency(currentAsset.operatingCosts)}</b></div><div style="display:flex;justify-content:space-between;font-weight:800;margin-top:8px;padding-top:8px;border-top:2px solid var(--text)"><span>= NOI</span><b>${formatCurrency(currentAsset.noi)}</b></div></div>`;
  document.getElementById("tab-performance").innerHTML = `<h4>Performance</h4><div class="table-wrap"><table><thead><tr><th>Metric</th><th>Current</th><th>Prev</th><th>Budget</th><th>Portfolio Avg</th><th>Benchmark</th></tr></thead><tbody><tr><td>Gross Yield</td><td><b>${currentAsset.yield}%</b></td><td>8.1%</td><td>8.5%</td><td>8.9%</td><td>7.5%</td></tr><tr><td>Net Yield</td><td><b>${currentAsset.netYield}%</b></td><td>6.0%</td><td>6.5%</td><td>6.8%</td><td>5.8%</td></tr><tr><td>Occupancy</td><td><b>${currentAsset.occupancy}%</b></td><td>82%</td><td>85%</td><td>88.8%</td><td>90%</td></tr></tbody></table></div>`;
  document.getElementById("tab-risk").innerHTML = `<h4>Risk - Vacancy Tenant Concentration Arrears Insurance Maintenance Valuation Geographic Lease Expiry Regulatory</h4><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">${["Vacancy","Tenant Concentration","Arrears","Insurance Expiry","Maintenance","Valuation","Geographic","Lease Expiry","Regulatory"].map(r=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px"><b style="font-size:13px">${r}</b><div style="font-size:11px;color:var(--muted)">Explainable calc - uses actual state</div><span class="pill green" style="margin-top:6px">Low</span></div>`).join("")}</div>`;
  document.getElementById("tab-documents").innerHTML = `<div class="table-wrap"><table><thead><tr><th>Doc ID</th><th>Name</th><th>Category</th><th>Entity</th><th>Status</th></tr></thead><tbody>${s.documents.filter(d=>d.entityId===currentAsset.id||d.entityId===currentAsset.propertyId).map(d=>`<tr><td>${d.id}</td><td>${d.name}</td><td>${d.category}</td><td>${d.entity} ${d.entityId}</td><td>${d.status}</td></tr>`).join("")}</tbody></table></div>`;
  document.getElementById("tab-transactions").innerHTML = `<div class="table-wrap"><table><thead><tr><th>ID</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${s.investmentTransactions.filter(t=>t.assetId===currentAsset.id).map(t=>`<tr><td>${t.id}</td><td>${t.type}</td><td>${t.date}</td><td>${formatCurrency(t.amount)}</td><td>${t.status}</td></tr>`).join("")}</tbody></table></div>`;
  document.getElementById("tab-operations").innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="alloc-card"><h4>Operational Data</h4><div style="font-size:13px">Property ${prop.name} • ${prop.units} units<br>Rent ${formatCurrency(85000)} • Invoices 3 • Payments 2 • Collection 6.5% • Maintenance 2 • Utilities 2</div></div><div class="alloc-card"><h4>Flows to Investment</h4><div style="font-size:13px">Rent → Gross Income → NOI → Yield → Performance → Portfolio → Board</div></div></div>`;
  document.getElementById("tab-audit").innerHTML = `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Action</th><th>Entity</th><th>User</th></tr></thead><tbody><tr><td>2026-09-30</td><td>Valuation Updated</td><td>${currentAsset.id}</td><td>Valuation Team</td></tr><tr><td>2019-06-15</td><td>Property Linked</td><td>${currentAsset.id} ↔ ${currentAsset.propertyId}</td><td>Investment</td></tr></tbody></table></div>`;
}
