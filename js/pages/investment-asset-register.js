
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-asset-register");
  setTimeout(renderAssets, 250);
});
function renderAssets(){
  const s = window.state;
  if(!s.investmentAssets){ if(window.ensureInvestmentState) window.ensureInvestmentState(); setTimeout(renderAssets,100); return; }
  const filters = document.getElementById("filters");
  if(filters) filters.innerHTML = `<input class="inv-filter" id="searchAsset" placeholder="Search Asset ID, Name, Issuer"><select class="inv-filter" id="classFilter"><option>All Asset Classes</option><option>Property</option><option>Fixed Income</option><option>Listed Equities</option><option>Cash</option><option>CIS</option><option>Unlisted Equity</option></select><select class="inv-filter"><option>All Funds</option><option>Pension Fund</option></select>`;
  const actions = document.getElementById("actions");
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="toast('Asset register export is a demo action.','info')">Export Excel</button><button class="btn pay-now-btn" type="button" onclick="openAssetForm()">+ Register Asset</button>`;
  ensureAssetForm();
  const root = document.getElementById("pageRoot");
  root.innerHTML = `<div class="card"><div class="card-head"><h3>Investment Asset Register • Property links to Property Management via propertyId</h3><span class="pill blue" id="count"></span></div><div class="card-body table-wrap"><table><thead><tr><th>Asset ID</th><th>Asset Name</th><th>Asset Class</th><th>Fund</th><th>Portfolio</th><th>Counterparty/Property</th><th>Cost</th><th>Market/Fair Value</th><th>Income</th><th>Yield</th><th>Risk</th><th>Status</th><th>Last Valuation</th><th>Actions</th></tr></thead><tbody id="assetTable"></tbody></table></div></div>`;
  const tbody = document.getElementById("assetTable");
  function render(list){
    document.getElementById("count").textContent = list.length + " assets";
    tbody.innerHTML = list.map(a=>{
      const linkedProp = s.properties.find(p=>p.id===a.propertyId);
      const propLink = linkedProp ? `<a href="#" onclick="goToPage('property-investment-detail'); return false;" style="color:var(--blue);font-weight:600">${escapeHtml(a.propertyId)} • ${escapeHtml(linkedProp.name)}</a>` : escapeHtml(a.issuer||a.bank||"-");
      return `<tr><td><b>${escapeHtml(a.id)}</b></td><td>${escapeHtml(a.name)}</td><td><span class="pill ${a.assetClass==='Property'?'green':a.assetClass==='Fixed Income'?'blue':a.assetClass==='Cash'?'gray':'amber'}">${escapeHtml(a.assetClass)}</span></td><td>${escapeHtml(a.fundId||'')}</td><td>${escapeHtml(a.portfolioId||'')}</td><td>${propLink}</td><td>${formatCurrency(a.cost||a.faceValue||a.balance||0)}</td><td><b>${formatCurrency(a.marketValue)}</b></td><td>${formatCurrency(a.income||0)}</td><td>${Number(a.yield||0).toFixed(1)}%</td><td><span class="pill ${a.risk==='Low'?'green':a.risk==='Medium'?'amber':'red'}">${escapeHtml(a.risk||'Low')}</span></td><td><span class="pill green">${escapeHtml(a.status||'Active')}</span></td><td>${escapeHtml(a.lastValuation||'')}</td><td><button class="btn" style="height:28px;font-size:11px" onclick="viewAsset('${escapeHtml(a.id)}')">Open • Investment + Property</button></td></tr>`;
    }).join("");
  }
  render(s.investmentAssets);
  const search = document.getElementById("searchAsset");
  const classFilter = document.getElementById("classFilter");
  function apply(){
    let list = s.investmentAssets;
    const q = (search.value||"").toLowerCase();
    const cls = classFilter.value;
    if(q) list = list.filter(a=> a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.issuer||"").toLowerCase().includes(q));
    if(cls!=="All Asset Classes") list = list.filter(a=> a.assetClass===cls || (cls==="Property" && a.assetClass==="Property"));
    render(list);
  }
  search.addEventListener("input", apply);
  classFilter.addEventListener("change", apply);
  apply();
}

function ensureAssetForm() {
  if (document.getElementById("assetRegisterBackdrop")) return;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "assetRegisterBackdrop";
  backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="assetFormTitle" style="width:min(560px,95vw)">
    <div class="modal-head"><h3 id="assetFormTitle" style="margin:0">Register Investment Asset</h3><button class="btn btn-ghost" type="button" onclick="closeAssetForm()">✕</button></div>
    <form id="assetRegisterForm">
      <div class="modal-body" style="display:grid;gap:12px">
        <label>Asset name<input class="input" name="name" required maxlength="100" style="width:100%"></label>
        <label>Asset class<select class="input" name="assetClass" required style="width:100%"><option value="">Choose a class</option><option>Property</option><option>Fixed Income</option><option>Listed Equities</option><option>Unlisted Equity</option><option>Collective Investment Schemes</option><option>Cash</option><option>Infrastructure</option><option>Other</option></select></label>
        <label>Acquisition cost (ZMW)<input class="input" name="cost" type="number" min="0" step="0.01" required style="width:100%"></label>
        <label>Market value (ZMW)<input class="input" name="marketValue" type="number" min="0" step="0.01" required style="width:100%"></label>
        <label>Annual income (ZMW)<input class="input" name="income" type="number" min="0" step="0.01" value="0" style="width:100%"></label>
        <label>Linked property (optional)<select class="input" name="propertyId" style="width:100%"><option value="">No linked property</option>${(window.state.properties || []).map((property) => `<option value="${escapeHtml(property.id)}">${escapeHtml(property.name)}</option>`).join("")}</select></label>
        <label>Risk<select class="input" name="risk" style="width:100%"><option>Low</option><option>Medium</option><option>High</option></select></label>
      </div>
      <div class="modal-foot" style="display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--border)"><button class="btn" type="button" onclick="closeAssetForm()">Cancel</button><button class="btn btn-primary" type="submit">Save Asset</button></div>
    </form>
  </div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeAssetForm();
  });
  document.getElementById("assetRegisterForm").addEventListener("submit", saveNewAsset);
}

function openAssetForm() {
  document.getElementById("assetRegisterBackdrop").classList.add("open");
}

function closeAssetForm() {
  document.getElementById("assetRegisterBackdrop").classList.remove("open");
}

function saveNewAsset(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const name = String(values.get("name") || "").trim();
  const assetClass = String(values.get("assetClass") || "");
  const cost = Number(values.get("cost"));
  const marketValue = Number(values.get("marketValue"));
  const income = Number(values.get("income") || 0);
  const propertyId = String(values.get("propertyId") || "");
  if (!name || !assetClass || ![cost, marketValue, income].every((value) => Number.isFinite(value) && value >= 0)) {
    toast("Enter a name, asset class, and valid non-negative amounts.", "error");
    return;
  }
  const assets = window.state.investmentAssets;
  const id = `INV-NEW-${Date.now()}`;
  assets.unshift({
    id, name, assetClass, fundId: "PENSION", portfolioId: "PORT-001", propertyId: propertyId || null,
    cost, marketValue, fairValue: marketValue, income, yield: marketValue ? income / marketValue * 100 : 0,
    risk: String(values.get("risk") || "Low"), status: "Active",
    acquisitionDate: new Date().toISOString().slice(0, 10),
    lastValuation: new Date().toISOString().slice(0, 10),
  });
  saveState();
  closeAssetForm();
  form.reset();
  renderAssets();
  toast(`${name} registered in the demo asset register.`, "success");
}
function viewAsset(id){
  const s = window.state;
  const a = s.investmentAssets.find(x=>x.id===id);
  const prop = s.properties.find(p=>p.id===a.propertyId);
  const detailTitle = document.getElementById("detailTitle");
  const detailBody = document.getElementById("detailBody");
  const backdrop = document.getElementById("detailBackdrop");
  detailTitle.textContent = a.name + " • " + a.id;
  detailBody.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><b>Investment Asset</b><div style="margin-top:8px;font-size:13px">Asset ID: ${a.id}<br>Class: ${a.assetClass}<br>Fund: ${a.fundId}<br>Portfolio: ${a.portfolioId}<br>Cost: ${formatCurrency(a.cost||0)}<br>Market: ${formatCurrency(a.marketValue)}<br>Yield: ${a.yield}%<br>Risk: ${a.risk}</div><div style="margin-top:12px"><button class="btn pay-now-btn" onclick="goToPage('property-investment-detail')">Open Investment Record</button></div></div>
      <div><b>Linked Property Record (same underlying asset)</b>${prop? `<div style="margin-top:8px;font-size:13px">Property ID: ${prop.id}<br>Property: ${prop.name}<br>Type: ${prop.type}<br>Units: ${prop.units} • Occupied: ${prop.occupied}<br>Value: ${formatCurrency(a.marketValue)}<br>NOI: ${formatCurrency(a.noi||a.income)}<br>Occupancy: ${a.occupancy||'-'}%</div><div style="margin-top:12px"><button class="btn" onclick="goToPage('client-dashboard')">Open Property Management Record</button></div>` : `<div style="margin-top:8px;font-size:13px;color:var(--muted)">No property link - ${a.assetClass} asset<br>Issuer: ${a.issuer||a.bank||'-'}</div>`}<div style="margin-top:12px;padding:8px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;font-size:12px">propertyId is critical integration link • No duplicate creation</div></div>
    </div>
  `;
  backdrop.classList.add("open");
}
function closeDetail(){ document.getElementById("detailBackdrop").classList.remove("open"); }
