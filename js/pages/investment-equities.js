
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-equities");
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
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting Listed Equities...','info')">Export</button><button class="btn pay-now-btn" onclick="toast('Action - Listed Equities','success')">Generate</button>`;
  
      const eqs = s.investmentAssets.filter(a=>a.assetClass==="Listed Equities");
      root.innerHTML = `<div class="inv-kpi-grid"><div class="inv-kpi"><div class="inv-kpi-label">Equities Value</div><div class="inv-kpi-value">${formatCurrency(eqs.reduce((a,b)=>a+b.marketValue,0))}</div></div><div class="inv-kpi green"><div class="inv-kpi-label">Unrealized Gain</div><div class="inv-kpi-value">${formatCurrency(eqs.reduce((a,b)=>a+(b.unrealized||0),0))}</div></div><div class="inv-kpi"><div class="inv-kpi-label">Dividend Income</div><div class="inv-kpi-value">${formatCurrency(eqs.reduce((a,b)=>a+(b.dividend||0),0))}</div></div></div><div class="card"><div class="card-head"><h3>Listed Equities • Holdings Broker Quantity Cost Market Unrealized Dividend Corporate Actions • Trades via licensed brokers, no direct exchange UI</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Asset ID</th><th>Name</th><th>Ticker</th><th>Quantity</th><th>Cost</th><th>Market</th><th>Unrealized</th><th>Dividend</th><th>Broker</th><th>Yield</th></tr></thead><tbody>${eqs.map(e=>`<tr><td><b>${e.id}</b></td><td>${e.name}</td><td>${e.ticker}</td><td>${e.quantity.toLocaleString()}</td><td>${formatCurrency(e.cost)}</td><td><b>${formatCurrency(e.marketValue)}</b></td><td style="color:${e.unrealized>=0?'#16A34A':'#DC2626'}">${formatCurrency(e.unrealized)}</td><td>${formatCurrency(e.dividend)}</td><td>${e.broker}</td><td>${e.yield}%</td></tr>`).join("")}</tbody></table></div></div><div style="margin-top:12px" class="card"><div class="card-head"><h3>Corporate Actions</h3></div><div class="card-body"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><div class="mini-kpi"><div class="l">Dividends</div><div class="v">ZCCM-IH ${formatCurrency(750000)} • Zambeef ${formatCurrency(400000)}</div></div><div class="mini-kpi"><div class="l">Rights Issues</div><div class="v">None pending</div></div><div class="mini-kpi"><div class="l">Stock Splits</div><div class="v">None</div></div></div></div></div>`;
    
}
function closeDetail(){ document.getElementById("detailBackdrop")?.classList.remove("open"); }
function recalc(){
  const rate = parseFloat(document.getElementById("discRate")?.value||12)/100;
  const cashflows = [-95000000,7500000,8000000,8500000,9000000,9500000,100000000];
  const npv = window.InvestmentCalc.calculateNPV(rate,cashflows);
  const irr = window.InvestmentCalc.calculateIRR(cashflows);
  document.getElementById("calcResult").innerHTML = `Rate ${(rate*100).toFixed(1)}% • NPV ${formatCurrency(npv)} • IRR ${irr.toFixed(1)}% • Uses reusable calc functions`;
}
