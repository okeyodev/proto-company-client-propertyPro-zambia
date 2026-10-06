
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-cash");
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
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-cash-and-banks.csv')">Export CSV</button>`;
  
      const cash = s.cashAccounts||[];
      root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi"><div class="inv-kpi-label">Current Cash</div><div class="inv-kpi-value">${formatCurrency(cash.reduce((a,b)=>a+(b.balanceZMW||b.balance),0))}</div></div><div class="inv-kpi"><div class="inv-kpi-label">Available Cash</div><div class="inv-kpi-value">${formatCurrency(cash.reduce((a,b)=>a+(b.available||b.balance),0))}</div></div><div class="inv-kpi"><div class="inv-kpi-label">Committed Cash</div><div class="inv-kpi-value">${formatCurrency(cash.reduce((a,b)=>a+(b.committed||0),0))}</div></div><div class="inv-kpi"><div class="inv-kpi-label">30-Day Proj</div><div class="inv-kpi-value">${formatCurrency(45000000)}</div></div><div class="inv-kpi"><div class="inv-kpi-label">90-Day Proj</div><div class="inv-kpi-value">${formatCurrency(72000000)}</div></div></div><div class="card"><div class="card-head"><h3>Cash & Banks • Multi-currency • BoZ Rates • Inflows Outflows Liquidity Forecast</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Account</th><th>Bank</th><th>Currency</th><th>Balance</th><th>Balance ZMW</th><th>Available</th><th>Committed</th><th>Type</th><th>Fund</th></tr></thead><tbody>${cash.map(c=>`<tr><td><b>${c.name}</b><br><span style="font-size:11px;color:var(--muted)">${c.account}</span></td><td>${c.bank}</td><td>${c.currency}</td><td>${formatCurrency(c.balance)}</td><td>${formatCurrency(c.balanceZMW||c.balance)}</td><td>${formatCurrency(c.available||c.balance)}</td><td>${formatCurrency(c.committed||0)}</td><td><span class="pill blue">${c.type}</span></td><td>${c.fundId}</td></tr>`).join("")}</tbody></table></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
