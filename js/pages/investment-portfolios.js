
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-portfolios");
  setTimeout(renderPortfolios, 400);
});
function renderPortfolios(){
  const s = window.state;
  if(!s.investmentPortfolios){ setTimeout(renderPortfolios,300); return; }
  const calc = window.InvestmentCalc;
  const filters = document.getElementById("filters");
  if(filters) filters.innerHTML = `<input class="inv-filter" placeholder="Search portfolio" id="searchPort"><select class="inv-filter" id="fundFilter"><option>All Funds</option><option>Pension Fund</option><option>Accident Fund</option></select>`;
  const actions = document.getElementById("actions");
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('Exporting portfolios...','info')">Export</button><button class="btn pay-now-btn" onclick="toast('New Portfolio - Workflow','info')">New Portfolio</button>`;
  const root = document.getElementById("pageRoot");
  const total = s.investmentAssets.reduce((a,b)=>a+b.marketValue,0);
  root.innerHTML = `
    <div class="inv-kpi-grid">
      <div class="inv-kpi"><div class="inv-kpi-label">Total Fund</div><div class="inv-kpi-value">${formatCurrency(total)}</div><div class="inv-kpi-foot">Across 2 main funds</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Pension Fund</div><div class="inv-kpi-value">${formatCurrency(1840000000)}</div><div class="inv-kpi-foot">Main fund</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Accident Fund</div><div class="inv-kpi-value">${formatCurrency(920000000)}</div><div class="inv-kpi-foot">Compensation</div></div>
      <div class="inv-kpi green"><div class="inv-kpi-label">Property Exposure</div><div class="inv-kpi-value">22.8%</div><div class="inv-kpi-foot">Within 15-25% limit</div></div>
    </div>
    <div class="card"><div class="card-head"><h3>Portfolios</h3></div><div class="card-body table-wrap"><table><thead><tr><th>Portfolio ID</th><th>Name</th><th>Fund</th><th>Type</th><th>Value</th><th>Allocation</th><th>Performance</th><th>Risk</th><th>Actions</th></tr></thead><tbody id="portTable"></tbody></table></div></div>
  `;
  const tbody = document.getElementById("portTable");
  const portfolios = s.investmentPortfolios;
  function renderTable(list){
    tbody.innerHTML = list.map(p=>{
      const val = p.value || s.investmentAssets.filter(a=>a.portfolioId===p.id).reduce((a,b)=>a+b.marketValue,0);
      const alloc = calc.calculatePortfolioAllocation(val,total);
      return `<tr><td><b>${p.id}</b></td><td>${p.name}</td><td>${p.fundId}</td><td><span class="pill blue">${p.type}</span></td><td><b>${formatCurrency(val)}</b></td><td>${alloc.toFixed(1)}%</td><td><span class="trend up">+8.7%</span></td><td><span class="pill green">Low</span></td><td><button class="btn" style="height:28px;font-size:12px" onclick="viewPort('${p.id}')">View → Asset Class → Asset → Property</button></td></tr>`;
    }).join("");
  }
  renderTable(portfolios);
  const search = document.getElementById("searchPort");
  if(search) search.addEventListener("input", e=>{
    const q = e.target.value.toLowerCase();
    renderTable(portfolios.filter(p=> p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)));
  });
}
function viewPort(id){ toast("Drilling: Portfolio "+id+" → Asset Class → Asset → Property Record (same underlying asset)","info"); goToPage("investment-asset-register"); }
