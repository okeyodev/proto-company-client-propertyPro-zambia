
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-portfolios");
  setTimeout(renderPortfolios, 400);
});
function renderPortfolios(){
  const s = window.state;
  if(!s.investmentPortfolios){ setTimeout(renderPortfolios,300); return; }
  const calc = window.InvestmentCalc;
  const filters = document.getElementById("filters");
  if(filters) filters.innerHTML = `<input class="inv-filter" placeholder="Search portfolio" id="searchPort"><select class="inv-filter" id="fundFilter"><option value="All Funds">All Funds</option><option value="PENSION">Pension Fund</option><option value="ACCIDENT">Accident Fund</option></select>`;
  const actions = document.getElementById("actions");
  if(actions) actions.innerHTML = `<button class="btn" type="button" onclick="exportVisibleTable('propertypro-portfolios.csv')">Export CSV</button><button class="btn pay-now-btn" type="button" onclick="createPortfolio()">New Portfolio</button>`;
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
  const fundFilter = document.getElementById("fundFilter");
  function renderTable(list){
    tbody.innerHTML = list.map(p=>{
      const val = p.value || s.investmentAssets.filter(a=>a.portfolioId===p.id).reduce((a,b)=>a+b.marketValue,0);
      const alloc = calc.calculatePortfolioAllocation(val,total);
      return `<tr><td><b>${escapeHtml(p.id)}</b></td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.fundId)}</td><td><span class="pill blue">${escapeHtml(p.type)}</span></td><td><b>${formatCurrency(val)}</b></td><td>${alloc.toFixed(1)}%</td><td><span class="trend up">+8.7%</span></td><td><span class="pill green">Low</span></td><td><button class="btn" style="height:28px;font-size:12px" onclick="viewPort('${escapeHtml(p.id)}')">View → Asset Class → Asset → Property</button></td></tr>`;
    }).join("");
  }
  renderTable(portfolios);
  const search = document.getElementById("searchPort");
  const applyFilters = () => {
    const q = (search?.value || "").trim().toLowerCase();
    const fund = fundFilter?.value || "All Funds";
    renderTable(portfolios.filter((portfolio) =>
      (fund === "All Funds" || portfolio.fundId === fund) &&
      (!q || portfolio.name.toLowerCase().includes(q) || portfolio.id.toLowerCase().includes(q))
    ));
  };
  search?.addEventListener("input", applyFilters);
  fundFilter?.addEventListener("change", applyFilters);
}
function viewPort(id){ toast("Drilling: Portfolio "+id+" → Asset Class → Asset → Property Record (same underlying asset)","info"); goToPage("investment-asset-register"); }
function createPortfolio() {
  const name = window.prompt("Enter a name for the new portfolio:");
  if (name === null) return;
  const trimmedName = name.trim();
  if (!trimmedName) {
    toast("Enter a portfolio name to continue.", "error");
    return;
  }
  const fundId = window.prompt("Enter the fund ID (PENSION or ACCIDENT):", "PENSION");
  if (fundId === null) return;
  const normalizedFund = fundId.trim().toUpperCase();
  if (!["PENSION", "ACCIDENT"].includes(normalizedFund)) {
    toast("Choose PENSION or ACCIDENT as the fund ID.", "error");
    return;
  }
  const portfolio = {
    id: `PORT-NEW-${Date.now()}`,
    name: trimmedName,
    fundId: normalizedFund,
    type: "Sub-Portfolio",
    value: 0,
  };
  window.state.investmentPortfolios.unshift(portfolio);
  saveState();
  renderPortfolios();
  toast(`${trimmedName} portfolio created.`, "success");
}
