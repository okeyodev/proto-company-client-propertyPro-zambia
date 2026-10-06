
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-cp");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-conditions-precedent.csv')">Export CSV</button>`;
  
      const cps = s.conditionsPrecedent||[];
      root.innerHTML = `<div class="card"><div class="card-head"><h3>Conditions Precedent • Pending Submitted Verified Waived Overdue Complete</h3></div><div class="card-body table-wrap"><table><thead><tr><th>ID</th><th>Deal</th><th>Condition</th><th>Responsible</th><th>Due Date</th><th>Status</th><th>Evidence</th><th>Approval</th><th>Comments</th></tr></thead><tbody>${cps.map(cp=>`<tr><td><b>${cp.id}</b></td><td>${cp.dealId}</td><td>${cp.condition}</td><td>${cp.responsible}</td><td>${cp.due}</td><td><span class="pill ${cp.status==='Verified'?'green':cp.status==='Overdue'?'red':cp.status==='Submitted'?'blue':'amber'}">${cp.status}</span></td><td>${cp.evidence? `<button class="btn" type="button" onclick="viewConditionEvidence('${escapeHtml(cp.id)}')">${escapeHtml(cp.evidence)}</button>` : '-'}</td><td>${cp.approval}</td><td>${cp.comments}</td></tr>`).join("")}</tbody></table></div></div>`;
    
}
function viewConditionEvidence(id) {
  const condition = (window.state.conditionsPrecedent || []).find((item) => item.id === id);
  if (!condition) {
    toast("The selected condition could not be found.", "error");
    return;
  }
  showClientRecordDetails(`Evidence • ${condition.id}`, [
    { label: "Condition", value: condition.condition },
    { label: "Evidence file", value: condition.evidence },
    { label: "Status", value: condition.status },
    { label: "Availability", value: "The evidence file is referenced in this demo but is not attached." },
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
