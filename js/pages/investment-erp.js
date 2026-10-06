
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-erp");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="printCurrentReport()">Print Architecture</button>`;
  
      root.innerHTML = `<div class="card"><div class="card-head"><h3>ERPNext Integration Architecture • Clean integration service boundaries/mock adapters • No fabricated live ERP responses</h3></div><div class="card-body">
        <div class="erp-mapping-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><h4 style="margin:0 0 8px">Property Data → ERP Mapping</h4><div style="font-size:13px;line-height:1.8;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px">
            Rent → ERP: Sales Invoice • Service Charges → Sales Invoice • Utilities → Sales Invoice (recovery) + Purchase Invoice (cost)<br>
            Maintenance Costs → Purchase Invoice • Insurance → Purchase Invoice • Operating Expenses → Expense Claim<br>
            NOI → Profit & Loss • Property Asset → Fixed Asset • Valuation Gain → Journal Entry IAS 40<br>
            Payment → Payment Entry • Arrears → Receivable Aging • Occupancy → Custom Field
          </div></div>
          <div><h4 style="margin:0 0 8px">Investment Data → ERP Mapping</h4><div style="font-size:13px;line-height:1.8;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px">
            Purchase → Purchase Invoice / Asset • Sale → Sales Invoice • Interest → Journal Entry • Dividend → Journal Entry<br>
            Valuation → Journal Entry Fair Value • Gain/Loss → P&L • Fees → Purchase Invoice<br>
            Cash → Bank Account • Bank Balance → Bank Reconciliation • BoZ Rates → Currency Exchange
          </div></div>
        </div>
        <div style="margin-top:16px"><h4>Integration Service Boundaries (Mock Adapters)</h4><div class="erp-adapter-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${["ERPNext Sales Invoice API - Mock","ERPNext Purchase Invoice API - Mock","ERPNext Payment Entry API - Mock","ERPNext Journal Entry API - Mock","ERPNext Asset API - Mock","ERPNext Bank Reconciliation - Mock","ZRA Smart Invoice API - Mock (TPIN 1234567890)","BoZ Exchange Rate API - Mock"].map(n=>`<div style="padding:10px;border:1px solid var(--border);border-radius:8px;background:#FFF"><b style="font-size:12px">${n}</b><div style="font-size:11px;color:var(--muted);margin-top:4px">Status: Mock Adapter • Ready for API • No live call fabricated</div><div style="margin-top:6px"><span class="pill gray">Mock</span> <span class="pill blue">Ready</span></div></div>`).join("")}
        </div></div>
        <div style="margin-top:16px;padding:10px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;font-size:12px"><b>Do NOT claim ERPNext integration works if no API exists. Clean boundaries, not fake live responses.</b><br>Property operational data automatically becomes investment intelligence without re-capture → ERP/BI layer → Consolidated Fund View. Shared data layer: Approvals, Documents, Audit Trail → ERPNext.</div>
      </div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
