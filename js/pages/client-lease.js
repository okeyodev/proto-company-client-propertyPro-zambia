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
    ? `<div style="display:grid;gap:8px">${documents.map((name) => `<div style="display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--border);border-radius:8px"><span>📄</span><span style="flex:1;min-width:0;overflow-wrap:anywhere">${esc(name)}</span><button class="btn btn-sm" type="button" data-lease-document="${esc(name)}">View</button></div>`).join("")}</div>`
    : `<div class="muted">No lease documents have been added.</div>`;
  document.querySelectorAll("[data-lease-document]").forEach((button) => {
    button.addEventListener("click", () => viewLeaseDocument(button.dataset.leaseDocument));
  });

  const chart = document.getElementById("rentChart");
  const rent = Number(lease.rent) || 0;
  const previousRent = Math.round(rent / (1 + (Number(lease.escalation) || 0) / 100));
  chart.innerHTML = `<div style="display:flex;align-items:end;gap:12px;height:190px;padding:12px 8px 0">
    ${[previousRent, rent].map((amount, index) => `<div style="flex:1;text-align:center"><div style="height:${Math.max(14, Math.round(amount / Math.max(rent, 1) * 140))}px;background:${index ? "var(--blue)" : "#93C5FD"};border-radius:6px 6px 0 0"></div><div style="font-size:11px;margin-top:6px">${index ? "Current rent" : "Previous rent"}</div><b style="font-size:12px">${formatCurrency(amount)}</b></div>`).join("")}
  </div>`;
}

function viewLeaseDocument(name) {
  showClientRecordDetails(name, [
    { label: "Document", value: name },
    { label: "Lease", value: (window.state.leases || [])[0]?.id || "Current lease" },
    { label: "Availability", value: "Demo document record. The source file is not attached to this portal." },
  ]);
}

function uploadLeaseKyc() {
  let input = document.getElementById("leaseKycInput");
  if (!input) {
    input = document.createElement("input");
    input.type = "file";
    input.id = "leaseKycInput";
    input.accept = ".pdf,.png,.jpg,.jpeg";
    input.hidden = true;
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const lease = (window.state.leases || [])[0];
      if (!lease) {
        toast("No active lease is available for this KYC document.", "error");
        return;
      }
      lease.documents = [...(lease.documents || []), file.name];
      saveState();
      renderLease();
      toast(`${file.name} added to the local lease document list. It was not uploaded to a server.`, "success");
    });
    document.body.appendChild(input);
  }
  input.click();
}

function downloadLeaseAgreement() {
  const lease = (window.state.leases || [])[0];
  if (!lease) {
    toast("No lease agreement is available to download.", "error");
    return;
  }
  const date = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-ZM") : "Not specified";
  const safeText = (value) => String(value ?? "").replace(/[^\x20-\x7E]/g, " ").replace(/[()\\]/g, "\\$&");
  const lines = [
    "PROPERTYPRO ZAMBIA - LEASE AGREEMENT SUMMARY",
    `Agreement: ${lease.id}`,
    `Tenant: ${lease.tenant || CLIENT_TENANT.name}`,
    `Property: ${lease.property || CLIENT_TENANT.property}`,
    `Unit: ${lease.unit || CLIENT_TENANT.unit}`,
    `Lease term: ${date(lease.start)} to ${date(lease.end)}`,
    `Monthly rent: ${formatCurrency(lease.rent)}`,
    `Security deposit: ${formatCurrency(lease.deposit)}`,
    `Annual escalation: ${Number(lease.escalation) || 0}%`,
    `Status: ${lease.status || "Active"}`,
    "",
    "This downloaded summary reflects the lease information stored in the tenant portal.",
    "For the signed legal agreement, contact your property manager.",
  ];
  const commands = ["BT", "/F1 12 Tf", "50 740 Td", "16 TL"];
  lines.forEach((line, index) => {
    if (index) commands.push("T*");
    commands.push(`(${safeText(line)}) Tj`);
  });
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lease.id || "lease-agreement"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Lease agreement summary downloaded as PDF.", "success");
}
