document.addEventListener("DOMContentLoaded", () => {
  initCommon("client-dashboard");
  renderClientDashboard();
});

function renderClientDashboard() {
  const lease = (state.leases || [])[0];
  const invoices = state.invoices || [];
  const unpaid = invoices.filter((invoice) => !["Paid", "Cancelled"].includes(invoice.status));
  const outstanding = unpaid.reduce((sum, invoice) => sum + Number(invoice.outstandingAmount ?? invoice.total ?? invoice.amount ?? 0), 0);
  const esc = escapeHtml;
  const money = formatCurrency;

  document.getElementById("clientKpiGrid").innerHTML = [
    ["Monthly Rent", money(lease && lease.rent)],
    ["Lease Status", (lease && lease.status) || "No active lease"],
    ["Lease Ends", lease && lease.end ? new Date(`${lease.end}T00:00:00`).toLocaleDateString("en-ZM", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
    ["Outstanding", money(outstanding)],
    ["Open Requests", (state.maintenance || []).filter((item) => item.status !== "Resolved").length],
  ].map(([label, value]) => `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${esc(value)}</div></div>`).join("");

  const leaseSummary = document.getElementById("leaseSummary");
  if (!lease) {
    leaseSummary.textContent = "No lease record is currently available.";
  } else {
    leaseSummary.innerHTML = `<div class="detail-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">
      <div><b>Agreement</b><div>${esc(lease.id)} • ${esc(lease.status || "Active")}</div></div>
      <div><b>Property & Unit</b><div>${esc(lease.property || CLIENT_TENANT.property)} • Unit ${esc(lease.unit || CLIENT_TENANT.unit)}</div></div>
      <div><b>Monthly Rent</b><div>${money(lease.rent)}</div></div>
      <div><b>Lease Term</b><div>${esc(lease.start)} – ${esc(lease.end)}</div></div>
    </div>`;
  }
  document.getElementById("outstandingAmount").textContent = money(outstanding);

  document.getElementById("invoiceTable").innerHTML = unpaid.slice(0, 4).map((invoice) =>
    `<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border)">
      <div><b>${esc(invoice.id)}</b><div class="muted small">${esc(invoice.description || invoice.type || "Invoice")} • Due ${esc(invoice.due)}</div></div>
      <div style="text-align:right"><b>${money(invoice.outstandingAmount ?? invoice.total ?? invoice.amount)}</b><div class="small">${esc(invoice.status)}</div></div>
    </div>`
  ).join("") || `<div style="padding:14px;color:var(--muted)">No outstanding invoices.</div>`;

  document.getElementById("maintenanceTable").innerHTML = (state.maintenance || []).slice(0, 3).map((item) =>
    `<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border)">
      <div><b>${esc(item.id)}</b><div class="muted small">${esc(item.issue)}</div></div><span class="pill ${item.status === "Resolved" ? "green" : "amber"}">${esc(item.status)}</span>
    </div>`
  ).join("") || `<div style="padding:14px;color:var(--muted)">No maintenance requests.</div>`;

  const notices = (state.notices || []).filter((item) => item.status === "Active").slice(0, 3);
  const noticesList = document.getElementById("noticesList");
  noticesList.innerHTML = notices.map((item) => `<div style="padding:10px 0;border-bottom:1px solid var(--border)"><b>${esc(item.title)}</b><div class="small muted">${esc(item.body || "")}</div></div>`).join("") || `<div class="muted">There are no active notices.</div>`;
  const noticeCount = document.getElementById("noticeCount");
  noticeCount.textContent = `${notices.length} active`;

  const chart = document.getElementById("paymentChart");
  const payments = (state.payments || []).slice(0, 6).reverse();
  const maxPayment = Math.max(1, ...payments.map((payment) => Number(payment.amount) || 0));
  chart.innerHTML = `<div class="payment-chart-bars">${payments.map((payment) => {
    const amount = Number(payment.amount) || 0;
    const date = String(payment.date || "");
    const chartDate = date.length >= 10 ? date.slice(5, 10) : date;
    return `<div class="payment-chart-column" title="${esc(date)} • ${money(amount)}"><div class="payment-chart-bar" style="height:${Math.max(8, Math.round(amount / maxPayment * 130))}px"></div><span class="payment-chart-date">${esc(chartDate)}</span></div>`;
  }).join("")}</div>`;
  document.getElementById("paymentStats").innerHTML = `<div><b>${(state.payments || []).length}</b><div class="small muted">Recorded payments</div></div><div><b>${money((state.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}</b><div class="small muted">Total paid</div></div>`;
}
