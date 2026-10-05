document.addEventListener("DOMContentLoaded", () => {
  initCommon("client-lease");
  renderLease();
});

function renderLease() {
  const lease = (state.leases || [])[0];
  if (!lease) {
    document.getElementById("leaseDetails").textContent = "No lease record is currently available.";
    return;
  }
  const esc = escapeHtml;
  const date = (value) => new Date(`${value}T00:00:00`).toLocaleDateString("en-ZM", { day: "2-digit", month: "short", year: "numeric" });
  document.getElementById("leaseKpiGrid").innerHTML = [
    ["Monthly Rent", formatCurrency(lease.rent)],
    ["Security Deposit", formatCurrency(lease.deposit)],
    ["Lease End Date", date(lease.end)],
    ["Annual Escalation", `${Number(lease.escalation) || 0}%`],
  ].map(([label, value]) => `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${esc(value)}</div></div>`).join("");

  document.getElementById("leaseDetails").innerHTML = `
    <div class="detail-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">
      <div><b>Agreement</b><div>${esc(lease.id)} • ${esc(lease.type || "Retail Lease")}</div></div>
      <div><b>Tenant</b><div>${esc(lease.tenant || CLIENT_TENANT.name)}</div></div>
      <div><b>Property & Unit</b><div>${esc(lease.property || CLIENT_TENANT.property)} • Unit ${esc(lease.unit || CLIENT_TENANT.unit)}</div></div>
      <div><b>Lease Term</b><div>${date(lease.start)} – ${date(lease.end)}</div></div>
      <div><b>Monthly Rent</b><div>${formatCurrency(lease.rent)}</div></div>
      <div><b>Deposit Held</b><div>${formatCurrency(lease.deposit)}</div></div>
      <div><b>Escalation</b><div>${Number(lease.escalation) || 0}% annually</div></div>
      <div><b>Status</b><div>${esc(lease.status || "Active")}</div></div>
    </div>`;

  const documents = lease.documents || [];
  document.getElementById("leaseDocs").innerHTML = documents.length
    ? `<div style="display:grid;gap:8px">${documents.map((name) => `<div style="display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--border);border-radius:8px"><span>📄</span><span style="flex:1">${esc(name)}</span><button class="btn btn-sm" type="button" onclick="toast('Demo document: ${esc(name)}','info')">View</button></div>`).join("")}</div>`
    : `<div class="muted">No lease documents have been added.</div>`;

  const chart = document.getElementById("rentChart");
  const rent = Number(lease.rent) || 0;
  const previousRent = Math.round(rent / (1 + (Number(lease.escalation) || 0) / 100));
  chart.innerHTML = `<div style="display:flex;align-items:end;gap:12px;height:190px;padding:12px 8px 0">
    ${[previousRent, rent].map((amount, index) => `<div style="flex:1;text-align:center"><div style="height:${Math.max(14, Math.round(amount / Math.max(rent, 1) * 140))}px;background:${index ? "var(--blue)" : "#93C5FD"};border-radius:6px 6px 0 0"></div><div style="font-size:11px;margin-top:6px">${index ? "Current rent" : "Previous rent"}</div><b style="font-size:12px">${formatCurrency(amount)}</b></div>`).join("")}
  </div>`;
}
