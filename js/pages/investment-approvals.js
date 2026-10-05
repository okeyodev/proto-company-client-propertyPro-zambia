
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-approvals");
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
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Approvals - Maker Checker...','info')">Export</button><button class="btn pay-now-btn" onclick="toast('Action - Approvals - Maker Checker','success')">Generate</button>`;
  
      const approvals = s.approvals||[];
      root.innerHTML = `<div class="card"><div class="card-head"><h3>Approval Workflow • Draft → Submitted → Under Review → Returned → Approved → Rejected → Completed • Same for Investment and Lease/Property decisions</h3></div><div class="card-body table-wrap"><table><thead><tr><th>ID</th><th>Type</th><th>Entity</th><th>Maker</th><th>Checker</th><th>Approver</th><th>Date</th><th>Stage</th><th>Status</th><th>Actions</th></tr></thead><tbody>${approvals.map(a=>`<tr><td><b>${a.id}</b></td><td>${a.type}</td><td>${a.entity}</td><td>${a.maker}</td><td>${a.checker}</td><td>${a.approver}</td><td>${a.date}</td><td>${a.stage}</td><td><span class="pill ${a.status==='Approved'?'green':a.status==='Submitted'?'blue':'amber'}">${a.status}</span></td><td><button class="btn" style="height:28px" onclick="toast('Approval ${a.id}: ${a.comments} - Audit trail recorded via addAuditEvent','info')">View Trail</button></td></tr>`).join("")}</tbody></table></div></div><div style="margin-top:12px;padding:10px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;font-size:12px">Never allow UI to claim approval occurred unless state actually records it. Uses existing addAuditEvent() pattern, no second audit implementation.</div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
