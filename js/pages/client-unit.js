document.addEventListener("DOMContentLoaded", () => {
  initCommon("client-unit");
  renderUnit();
});

function renderUnit() {
  const unit = (state.units || [])[0];
  const property = (state.properties || []).find((item) => item.id === (unit && unit.propertyId));
  const esc = escapeHtml;
  if (!unit) {
    document.getElementById("unitDetails").textContent = "No unit record is currently available.";
    return;
  }
  document.getElementById("unitKpiGrid").innerHTML = [
    ["Unit", `${unit.unit} • ${unit.floor || "Floor not recorded"}`],
    ["Area", `${Number(unit.size) || 0} m²`],
    ["Monthly Rent", formatCurrency(unit.rent)],
    ["Occupancy", unit.status || "Occupied"],
  ].map(([label, value]) => `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${esc(value)}</div></div>`).join("");

  document.getElementById("unitDetails").innerHTML = `
    <div class="detail-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">
      <div><b>Unit</b><div>${esc(unit.id)} • Unit ${esc(unit.unit)}</div></div>
      <div><b>Property</b><div>${esc(unit.property || (property && property.name) || "")}</div></div>
      <div><b>Floor</b><div>${esc(unit.floor || "Not specified")}</div></div>
      <div><b>Floor Area</b><div>${Number(unit.size) || 0} m²</div></div>
      <div><b>Tenant</b><div>${esc(unit.tenant || CLIENT_TENANT.name)}</div></div>
      <div><b>Monthly Rent</b><div>${formatCurrency(unit.rent)}</div></div>
      <div><b>Occupancy</b><div>${esc(unit.status || "Occupied")}</div></div>
      <div><b>Property Address</b><div>${esc((property && property.address) || "Plot 1234, Great East Road, Lusaka")}</div></div>
    </div>`;

  const content = document.querySelector(".enterprise-page .section-split");
  if (content && !document.getElementById("unitPropertyHighlights")) {
    const card = document.createElement("div");
    card.id = "unitPropertyHighlights";
    card.className = "card";
    card.style.marginTop = "14px";
    card.innerHTML = `<div class="card-head"><h3>Property Snapshot</h3><span class="pill green">${esc((property && property.status) || "Active")}</span></div>
      <div class="card-body"><div class="detail-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">
        <div><b>Property Type</b><div>${esc((property && property.type) || "Retail")}</div></div>
        <div><b>Total Units</b><div>${Number((property && property.units) || 184).toLocaleString()}</div></div>
        <div><b>Occupied Units</b><div>${Number((property && property.occupied) || 156).toLocaleString()}</div></div>
        <div><b>City</b><div>${esc((property && property.city) || CLIENT_TENANT.city)}</div></div>
      </div></div>`;
    content.after(card);
  }
}
