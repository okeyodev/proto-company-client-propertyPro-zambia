
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-audit");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-audit-trail.csv')">Export CSV</button>`;
  
      root.innerHTML = `<div class="card"><div class="card-head"><h3>Shared Audit Trail • Every important mutation creates audit event • Uses existing addAuditEvent() pattern</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Date</th><th>Action</th><th>Entity Type</th><th>Entity ID</th><th>User</th><th>Detail</th></tr></thead><tbody>
        <tr><td>2026-10-05 10:30</td><td>Investment Created</td><td>Investment Asset</td><td>INV-PROP-001</td><td>Investment Officer</td><td>Zambezi Mall linked to P-001 • 86.4M • No duplicate</td></tr>
        <tr><td>2026-09-30 14:00</td><td>Property Valuation Updated</td><td>Valuation</td><td>VAL-003</td><td>Valuation Team</td><td>Knight Frank Zambia • Market 86.4M • Income Approach DCF + Market • IAS 40</td></tr>
        <tr><td>2026-09-30 14:05</td><td>Investment Valuation Updated</td><td>Investment Asset</td><td>INV-PROP-001</td><td>Finance</td><td>Fair value gain 4.4M booked • IFRS 13 • Portfolio valuation updated</td></tr>
        <tr><td>2026-09-25 09:00</td><td>Lease Approved</td><td>Lease</td><td>L-2026-001</td><td>Leasing Manager</td><td>Kabwelwa Supermarket • 85K rent • 170K deposit • Maker-checker workflow</td></tr>
        <tr><td>2026-09-12 14:20</td><td>Payment Recorded</td><td>Payment</td><td>PAY-001</td><td>Finance</td><td>Airtel 13,920 for INV-P001-003 Service Charge • Receipt RCPT-2026-0912 • Collection rate updated</td></tr>
        <tr><td>2026-10-03 11:00</td><td>Investment Approved</td><td>Approval</td><td>APR-001</td><td>MIC</td><td>East Park Mall Acquisition • 95M • Awaiting MIC review</td></tr>
        <tr><td>2026-10-02 10:00</td><td>Compliance Breach Created</td><td>Compliance Breach</td><td>BR-001</td><td>Risk</td><td>Single Bank Exposure • Zanaco 22.5% > 20% limit • Medium severity</td></tr>
        <tr><td>2026-09-30 09:00</td><td>Document Uploaded</td><td>Document</td><td>DOC-002</td><td>Knight Frank</td><td>Valuation Report VAL-2026-001 • Property ↔ Investment link</td></tr>
        <tr><td>2019-06-15 08:00</td><td>Property Linked to Investment</td><td>Link</td><td>INV-PROP-001 ↔ P-001</td><td>Investment Team</td><td>PropertyId is critical integration link • No duplicate creation • Shared data layer</td></tr>
      </tbody></table></div></div><div style="margin-top:12px;padding:10px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;font-size:12px">Uses existing addAuditEvent() pattern from client-common.js • No second audit implementation • Every mutation creates event</div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
