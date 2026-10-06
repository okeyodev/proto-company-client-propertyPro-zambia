
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-documents");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-documents.csv')">Export CSV</button>`;
  
      const docs = s.documents||[];
      root.innerHTML = `<div class="card"><div class="card-head"><h3>Shared Document Management • Property Lease Valuation Appraisal Term Sheet Approval Insurance Title Due-Diligence • Metadata: ID Category Entity Version Uploaded By Date Status Confidentiality Expiry • OCR/version-control where infrastructure exists</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Doc ID</th><th>Name</th><th>Category</th><th>Entity</th><th>Entity ID</th><th>Version</th><th>Uploaded By</th><th>Date</th><th>Status</th><th>Confidentiality</th><th>Expiry</th></tr></thead><tbody>${docs.map(d=>`<tr><td><b>${d.id}</b></td><td>${d.name}</td><td><span class="pill blue">${d.category}</span></td><td>${d.entity}</td><td>${d.entityId}</td><td>v${d.version}</td><td>${d.uploadedBy}</td><td>${d.uploaded}</td><td><span class="pill green">${d.status}</span></td><td>${d.confidentiality}</td><td>${d.expiry||'-'}</td></tr>`).join("")}</tbody></table></div></div><div style="margin-top:12px"><button class="btn pay-now-btn" type="button" onclick="selectInvestmentDocument()">Upload Document</button><input id="investmentDocumentInput" type="file" hidden></div>`;
      const fileInput = document.getElementById("investmentDocumentInput");
      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const documents = window.state.documents || (window.state.documents = []);
        documents.unshift({
          id: `DOC-${Date.now()}`,
          name: file.name,
          category: "Uploaded",
          entity: "Investment",
          entityId: "Local",
          version: 1,
          uploadedBy: "Current User",
          uploaded: new Date().toISOString().slice(0, 10),
          status: "Selected locally",
          confidentiality: "Internal",
          expiry: "",
        });
        saveState();
        toast("Document added to the local demo register. It was not uploaded to a server.", "success");
        render();
      });
    
}
function selectInvestmentDocument() {
  document.getElementById("investmentDocumentInput")?.click();
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
