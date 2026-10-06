
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-property");
  setTimeout(renderPropInvest, 400);
});
function renderPropInvest(){
  const s = window.state;
  if(!s.investmentAssets){ setTimeout(renderPropInvest,300); return; }
  const calc = window.InvestmentCalc;
  const filters = document.getElementById("filters");
  if(filters) filters.innerHTML = `<input class="inv-filter" id="searchProp" placeholder="Search property"><select class="inv-filter" id="subClassFilter"><option>All Sub-Class</option><option>Retail</option><option>Office</option><option>Industrial</option><option>Residential</option></select>`;
  const actions = document.getElementById("actions");
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Property Investment Excel...','info')">Export</button><button class="btn pay-now-btn" onclick="goToPage('property-integration')">View Integration</button>`;
  const props = s.investmentAssets.filter(a=>a.assetClass==="Property");
  const root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="inv-kpi-grid">
      <div class="inv-kpi green"><div class="inv-kpi-label">Property Portfolio Value</div><div class="inv-kpi-value">${formatCurrency(props.reduce((a,b)=>a+b.marketValue,0))}</div><div class="inv-kpi-foot">4 assets • Zambia</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Total NOI</div><div class="inv-kpi-value">${formatCurrency(props.reduce((a,b)=>a+(b.noi||0),0))}</div><div class="inv-kpi-foot">Gross - Operating</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Avg Yield</div><div class="inv-kpi-value">8.9%</div><div class="inv-kpi-foot">Net 6.8%</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Avg Occupancy</div><div class="inv-kpi-value">88.8%</div><div class="inv-kpi-foot">Vacancy 11.2%</div></div>
    </div>
    <div class="card"><div class="card-head"><h3>Property Investments • Every directly held property appears as investment asset • Same underlying asset, no duplicate creation</h3><span class="pill blue" id="count"></span></div><div class="card-body"><div id="propCards" class="property-investment-cards"></div></div></div>
  `;
  const cards = document.getElementById("propCards");
  function render(list){
    document.getElementById("count").textContent = list.length + " properties";
    cards.innerHTML = list.map(p=>{
      const linkedProp = s.properties.find(pr=>pr.id===p.propertyId);
      return `<div class="property-investment-card" style="border:1px solid var(--border);border-radius:12px;padding:14px;background:#FFF;box-shadow:var(--shadow-sm)">
        <div class="property-investment-card-header" style="display:flex;justify-content:space-between"><div><b style="font-size:14px">${p.name}</b><div style="font-size:11px;color:var(--muted)">${p.id} • Property ID ${p.propertyId} • ${p.subClass} • ${p.fundId}</div></div><span class="pill green">${p.status}</span></div>
        <div class="property-investment-metrics" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">
          <div class="mini-kpi"><div class="l">Market Value</div><div class="v">${formatCurrency(p.marketValue)}</div></div>
          <div class="mini-kpi"><div class="l">Acquisition Cost</div><div class="v">${formatCurrency(p.acquisitionCost)}</div></div>
          <div class="mini-kpi"><div class="l">Yield</div><div class="v">${p.yield}%</div></div>
          <div class="mini-kpi"><div class="l">Annual Rental</div><div class="v">${formatCurrency(p.annualRentalIncome)}</div></div>
          <div class="mini-kpi"><div class="l">Operating Costs</div><div class="v">${formatCurrency(p.operatingCosts)}</div></div>
          <div class="mini-kpi"><div class="l">NOI</div><div class="v">${formatCurrency(p.noi)}</div></div>
          <div class="mini-kpi"><div class="l">Occupancy</div><div class="v">${p.occupancy}%</div></div>
          <div class="mini-kpi"><div class="l">Ownership</div><div class="v">${p.ownership}%</div></div>
          <div class="mini-kpi"><div class="l">Size</div><div class="v">${p.size||''} m²</div></div>
        </div>
        <div class="property-investment-actions" style="margin-top:12px;display:flex;gap:8px"><button class="btn" onclick="goToPage('property-investment-detail')">Open Investment Record</button><button class="btn pay-now-btn" onclick="openPropertyManagement('${p.propertyId}')">Open Property Management Record</button></div>
        <div style="margin-top:8px;font-size:11px;color:var(--muted)">Investment Asset ${p.id} ↔ Property ${p.propertyId} • Same underlying asset • ${linkedProp? linkedProp.name : ''}</div>
      </div>`;
    }).join("");
  }
  render(props);
  document.getElementById("searchProp").addEventListener("input", e=>{
    const q = e.target.value.toLowerCase();
    render(props.filter(p=> p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.propertyId.toLowerCase().includes(q)));
  });
  document.getElementById("subClassFilter").addEventListener("change", e=>{
    const v = e.target.value;
    if(v==="All Sub-Class") render(props);
    else render(props.filter(p=> p.subClass===v));
  });
}
function openPropertyManagement(propId){
  toast("Navigating to Property Management Record: "+propId+" (same underlying asset as investment)","info");
  if(propId==="P-001") goToPage("client-dashboard");
  else { toast("Property "+propId+" - Operational data: tenants, leases, rent, maintenance, utilities, insurance, occupancy, arrears","info"); goToPage("property-investment-detail"); }
}
