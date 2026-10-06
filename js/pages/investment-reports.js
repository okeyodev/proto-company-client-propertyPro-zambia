
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-reports");
  setTimeout(render, 250);
});

function render() {
  const s = window.state;
  if (!s.boardReports && window.ensureInvestmentState) window.ensureInvestmentState();
  if (!Array.isArray(s.boardReports)) { setTimeout(render, 100); return; }
  const root = document.getElementById("pageRoot");
  const filters = document.getElementById("filters");
  const actions = document.getElementById("actions");
  if (filters) {
    filters.innerHTML = `<select class="inv-filter" id="reportType"><option>Board</option><option>Management</option><option>Property</option><option>Performance</option><option>Risk</option><option>Compliance</option></select><input class="inv-filter" id="reportSearch" placeholder="Search reports" style="min-width:200px">`;
    filters.querySelector("#reportType").addEventListener("change", renderReports);
    filters.querySelector("#reportSearch").addEventListener("input", renderReports);
  }
  if (actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportReports()">Export CSV</button>`;
  renderReports();
}

function renderReports() {
  const reports = window.state.boardReports || [];
  const query = (document.getElementById("reportSearch")?.value || "").trim().toLowerCase();
  const type = document.getElementById("reportType")?.value || "";
  const filtered = reports.filter((report) =>
    (!type || report.type === type) &&
    (!query || [report.name, report.type, report.status, report.date].some((value) => String(value || "").toLowerCase().includes(query)))
  );
  const root = document.getElementById("pageRoot");
  root.innerHTML = `<div class="card"><div class="card-head"><h3>Reports & Board Packs • Management, MIC/FIC, Board, Property, Investment, Risk & Compliance</h3><span class="pill blue">${filtered.length} reports</span></div><div class="card-body"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">${filtered.map((report) => `<div style="border:1px solid var(--border);border-radius:10px;padding:14px;background:#FFF"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:13px">${escapeHtml(report.name)}</b><span class="pill ${report.status === "Approved" ? "green" : "amber"}">${escapeHtml(report.status)}</span></div><div style="font-size:11px;color:var(--muted);margin-top:6px">Type: ${escapeHtml(report.type)} • Date: ${escapeHtml(report.date)} • ${Number(report.pages) || 0} pages</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn" type="button" style="height:32px;font-size:11px" onclick="viewReport('${escapeHtml(report.id)}')">View</button><button class="btn" type="button" style="height:32px;font-size:11px" onclick="exportReport('${escapeHtml(report.id)}')">CSV</button><button class="btn" type="button" style="height:32px;font-size:11px" onclick="printCurrentReport()">PDF</button></div></div>`).join("") || `<div class="muted">No reports match your search.</div>`}</div><div style="margin-top:16px"><h4>Report Contents</h4><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">${["Portfolio Valuation","Asset Allocation","Property Portfolio","Property NOI","Occupancy","Rent Roll","Arrears","Maintenance","Insurance","Investment Performance","Risk","Compliance","Breaches"].map((name) => `<div style="padding:8px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;font-size:12px"><b>${name}</b></div>`).join("")}</div></div></div></div>`;
}

function exportReports() {
  const rows = [["Report ID", "Name", "Type", "Date", "Status", "Pages"]];
  (window.state.boardReports || []).forEach((report) => rows.push([
    report.id, report.name, report.type, report.date, report.status, report.pages,
  ]));
  window.downloadCsvFile("propertypro-reports-and-board-packs.csv", rows);
}

function exportReport(id) {
  const report = (window.state.boardReports || []).find((item) => item.id === id);
  if (!report) {
    toast("The selected report could not be found.", "error");
    return;
  }
  window.downloadCsvFile(`${report.id}.csv`, [
    ["Report ID", "Name", "Type", "Date", "Status", "Pages"],
    [report.id, report.name, report.type, report.date, report.status, report.pages],
  ]);
}

function viewReport(id) {
  const report = (window.state.boardReports || []).find((item) => item.id === id);
  if (!report) return;
  showClientRecordDetails(report.name, [
    { label: "Report ID", value: report.id }, { label: "Type", value: report.type },
    { label: "Date", value: report.date }, { label: "Status", value: report.status },
    { label: "Pages", value: report.pages },
    { label: "Contents", value: "Portfolio valuation, allocation, property performance, risk and compliance summary." },
  ]);
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
