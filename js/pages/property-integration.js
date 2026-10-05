
document.addEventListener("DOMContentLoaded", () => {
  initCommon("property-integration");
  setTimeout(renderIntegration, 400);
});
function renderIntegration(){
  const s = window.state;
  if(!s.investmentAssets){ setTimeout(renderIntegration,300); return; }
  const calc = window.InvestmentCalc;
  const prop = s.properties.find(p=>p.id==="P-001");
  const asset = s.investmentAssets.find(a=>a.propertyId==="P-001");
  const root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="card"><div class="card-head"><h3>Property ↔ Investment Integration • Critical Page</h3></div><div class="card-body">
      <div class="integration-flow">
        <div class="flow-node primary"><b>PROPERTY RECORD</b><div style="font-size:12px;margin-top:4px">P-001 Zambezi Mall</div></div>
        <div class="flow-arrow"></div>
        <div class="flow-node"><b>Operational Data</b><div style="font-size:12px;text-align:left">Rent, Occupancy, Arrears, Maintenance, Utilities, Insurance, OpEx</div></div>
        <div class="flow-arrow"></div>
        <div class="flow-node primary"><b>INVESTMENT ASSET</b><div style="font-size:12px">INV-PROP-001 • ${formatCurrency(asset.marketValue)}</div></div>
        <div class="flow-arrow"></div>
        <div class="flow-node dark"><b>BOARD REPORTING</b></div>
      </div>
      <div style="margin-top:16px"><h4>Sync Status - Uses same state/data model</h4><div class="sync-grid">
        ${["Rent Income","Occupancy","Maintenance Costs","Arrears","Insurance","Valuation","NOI","Yield"].map(l=>`<div class="sync-item"><b>${l}</b><span class="status synced">● Synced</span></div>`).join("")}
      </div></div>
    </div></div>
  `;
}
