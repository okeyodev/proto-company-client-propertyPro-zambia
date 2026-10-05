/**
 * Investment Dashboard - Executive Overview
 * Uses window.state + InvestmentCalc
 */
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-dashboard");
  setTimeout(() => ensureInvestmentState && ensureInvestmentState(), 200);
  setTimeout(renderDashboard, 400);
});

function renderDashboard(){
  const s = window.state;
  if(!s.investmentAssets){ toast("Loading investment data...","info"); setTimeout(renderDashboard, 500); return; }
  const calc = window.InvestmentCalc;
  const perf = s.performanceMetrics || {};
  const total = s.investmentAssets.reduce((a,b)=> a + (b.marketValue||0),0);
  const propVal = s.investmentAssets.filter(x=>x.assetClass==="Property").reduce((a,b)=> a + (b.marketValue||0),0);
  
  const kpi1 = document.getElementById("invKpiGrid");
  if(kpi1){
    const occupancy = s.properties ? (s.properties.reduce((a,p)=> a+p.occupied,0) / s.properties.reduce((a,p)=> a+p.units,0) *100) : perf.occupancy;
    kpi1.innerHTML = `
      <div class="inv-kpi"><div class="inv-kpi-label">Total Portfolio Value</div><div class="inv-kpi-value">${formatCurrency(total)}</div><div class="inv-kpi-foot"><span class="trend up">▲ 5.2% YoY</span> • ${formatCurrency(total*0.052)} gain</div></div>
      <div class="inv-kpi green"><div class="inv-kpi-label">Property Portfolio Value</div><div class="inv-kpi-value">${formatCurrency(propVal)}</div><div class="inv-kpi-foot">4 assets • ${calc.calculatePortfolioAllocation(propVal,total).toFixed(1)}% allocation</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Total Income</div><div class="inv-kpi-value">${formatCurrency(perf.totalIncome||82400000)}</div><div class="inv-kpi-foot">Rent + coupons + dividends</div></div>
      <div class="inv-kpi green"><div class="inv-kpi-label">Portfolio Yield</div><div class="inv-kpi-value">${(perf.portfolioYield||9.2).toFixed(1)}%</div><div class="inv-kpi-foot">Benchmark 9.5%</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">TWRR</div><div class="inv-kpi-value">${(perf.twrr||8.7).toFixed(1)}%</div><div class="inv-kpi-foot">Time-weighted</div></div>
    `;
  }
  const kpi2 = document.getElementById("invKpiGrid2");
  if(kpi2){
    kpi2.innerHTML = `
      <div class="inv-kpi"><div class="inv-kpi-label">MWRR</div><div class="inv-kpi-value">${(perf.mwrr||9.1).toFixed(1)}%</div><div class="inv-kpi-foot">Money-weighted</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Cash Position</div><div class="inv-kpi-value">${formatCurrency(perf.cashPosition||94600000)}</div><div class="inv-kpi-foot">${calc.calculatePortfolioAllocation(perf.cashPosition||94600000,total).toFixed(1)}% • 30-day ${formatCurrency(45000000)}</div></div>
      <div class="inv-kpi red"><div class="inv-kpi-label">Compliance Breaches</div><div class="inv-kpi-value">${(perf.complianceBreaches||2)}</div><div class="inv-kpi-foot">1 Medium • 1 Monitoring</div></div>
      <div class="inv-kpi"><div class="inv-kpi-label">Property Occupancy</div><div class="inv-kpi-value">${(perf.occupancy||84.8).toFixed(1)}%</div><div class="inv-kpi-foot">${(100-(perf.occupancy||84.8)).toFixed(1)}% vacancy</div></div>
      <div class="inv-kpi green"><div class="inv-kpi-label">Property NOI</div><div class="inv-kpi-value">${formatCurrency(perf.noi||32700000)}</div><div class="inv-kpi-foot">Net Operating Income</div></div>
    `;
  }

  // Allocation table
  const allocTable = document.getElementById("allocationTable");
  const saa = s.strategicAllocation || window.SAA_TARGETS;
  const assets = s.investmentAssets;
  const totalVal = calc.getPortfolioTotal(assets);
  const rows = saa.map(t=>{
    const classAssets = assets.filter(a=> a.assetClass===t.assetClass || (t.assetClass==="Fixed Income" && a.assetClass==="Fixed Income") || (t.assetClass==="Listed Equities" && a.assetClass==="Listed Equities") || (t.assetClass==="Collective Investment Schemes" && a.assetClass==="Collective Investment Schemes") || (t.assetClass==="Unlisted Equity" && a.assetClass==="Unlisted Equity") || (t.assetClass==="Cash" && a.assetClass==="Cash") || (t.assetClass==="Other" && a.assetClass==="Other"));
    const val = classAssets.reduce((s,a)=> s + (a.marketValue||0),0);
    // For Property, use propVal etc; if val 0 use allocation from target simulation
    const actualVal = val || (t.assetClass==="Property"? propVal : 0);
    const alloc = calc.calculatePortfolioAllocation(actualVal, totalVal);
    const drift = calc.calculateAllocationDrift(alloc, t.target);
    const status = calc.getAllocationStatus(alloc, t.target, t.min, t.max);
    return { ...t, value: actualVal, allocation: alloc, drift, status };
  });
  // Add real computed
  const fixedIncomeVal = assets.filter(a=>a.assetClass==="Fixed Income").reduce((s,a)=>s+a.marketValue,0);
  const eqVal = assets.filter(a=>a.assetClass==="Listed Equities").reduce((s,a)=>s+a.marketValue,0);
  const cisVal = assets.filter(a=>a.assetClass==="Collective Investment Schemes").reduce((s,a)=>s+a.marketValue,0);
  const cashVal = assets.filter(a=>a.assetClass==="Cash").reduce((s,a)=>s+a.marketValue,0);
  const altVal = assets.filter(a=>a.assetClass==="Unlisted Equity").reduce((s,a)=>s+a.marketValue,0);

  const allocData = [
    { assetClass:"Fixed Income", value:fixedIncomeVal, target:35, min:25, max:45 },
    { assetClass:"Property", value:propVal, target:20, min:15, max:25 },
    { assetClass:"Listed Equities", value:eqVal, target:20, min:15, max:25 },
    { assetClass:"CIS", value:cisVal, target:12, min:5, max:20 },
    { assetClass:"Cash", value:cashVal, target:5, min:2, max:10 },
    { assetClass:"Unlisted Equity", value:altVal, target:5, min:0, max:10 },
  ].map(r=>{
    const alloc = calc.calculatePortfolioAllocation(r.value,totalVal);
    const drift = calc.calculateAllocationDrift(alloc, r.target);
    const status = calc.getAllocationStatus(alloc, r.target, r.min, r.max);
    return {...r, allocation:alloc, drift,status};
  });

  if(allocTable){
    allocTable.innerHTML = `
      <div class="alloc-row header"><div>Asset Class</div><div>Value</div><div>Alloc</div><div>Target</div><div>Range</div><div>Status</div></div>
      ${allocData.map(r=>`
        <div class="alloc-row">
          <div><b>${r.assetClass}</b></div>
          <div>${formatCurrency(r.value)}</div>
          <div>${r.allocation.toFixed(1)}%</div>
          <div>${r.target}%</div>
          <div>${r.min}–${r.max}%</div>
          <div><span class="alloc-status ${r.status.toLowerCase()}">${r.status}</span></div>
        </div>
      `).join("")}
    `;
  }

  // Allocation chart SVG
  const chart = document.getElementById("allocationChart");
  if(chart){
    const colors = {"Fixed Income":"#2563EB","Property":"#16A34A","Listed Equities":"#7C3AED","CIS":"#D97706","Cash":"#06B6D4","Unlisted Equity":"#DC2626"};
    let x=0;
    const bars = allocData.map(r=>{
      const w = r.allocation;
      const bar = `<div style="display:flex;align-items:center;gap:8px;margin:6px 0"><div style="width:80px;font-size:11px;font-weight:600">${r.assetClass}</div><div class="alloc-bar" style="flex:1"><i style="width:${w}% ;background:${colors[r.assetClass]||'#64748B'}"></i></div><div style="width:36px;font-size:11px;font-weight:700">${r.allocation.toFixed(1)}%</div></div>`;
      return bar;
    }).join("");
    chart.innerHTML = bars;
  }

  // Property allocation
  const propAlloc = document.getElementById("propertyAlloc");
  if(propAlloc){
    const props = assets.filter(a=>a.assetClass==="Property");
    propAlloc.innerHTML = props.map(p=>`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px">
        <div><b>${p.name}</b><div style="font-size:11px;color:var(--muted)">${p.subClass} • ${p.occupancy}% occ • ${p.yield}% yield</div></div>
        <div style="text-align:right"><b>${formatCurrency(p.marketValue)}</b><div style="font-size:11px;color:var(--muted)">NOI ${formatCurrency(p.noi)}</div></div>
      </div>
    `).join("") + `<div style="margin-top:8px;display:flex;justify-content:space-between;font-weight:700;font-size:13px"><span>Total Property</span><span>${formatCurrency(propVal)} • ${calc.calculatePortfolioAllocation(propVal,total).toFixed(1)}%</span></div>`;
  }

  const propChart = document.getElementById("propertyChart");
  if(propChart){
    const months = ["May","Jun","Jul","Aug","Sep","Oct"];
    const income = [2.4,2.6,2.7,2.5,2.8,2.8]; // millions
    const svg = `<svg viewBox="0 0 300 80" width="100%" height="80"><polyline fill="none" stroke="#16A34A" stroke-width="2" points="${months.map((m,i)=> `${20+i*48},${70 - income[i]*18}`).join(" ")}"/><g>${months.map((m,i)=> `<text x="${20+i*48}" y="78" font-size="9" fill="#64748B" text-anchor="middle">${m}</text>`).join("")}</g></svg><div style="font-size:11px;color:var(--muted);margin-top:4px">Monthly rental income (ZMW M) • derived from invoices/payments</div>`;
    propChart.innerHTML = svg;
  }

  // Activity feed
  const feed = document.getElementById("activityFeed");
  if(feed){
    const txns = (s.investmentTransactions||[]).slice(0,5);
    feed.innerHTML = txns.map(t=>`
      <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #F1F5F9">
        <div style="width:32px;height:32px;border-radius:8px;background:#F8FAFC;border:1px solid var(--border);display:grid;place-items:center;font-size:12px">📄</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${t.type} • ${t.assetId}</div><div style="font-size:12px;color:var(--muted)">${t.description} • ${t.date}</div></div>
        <div style="font-size:12px;font-weight:700">${formatCurrency(t.amount)}</div>
      </div>
    `).join("") + `<div style="margin-top:8px"><button class="btn" onclick="goToPage('investment-asset-register')">View Asset Register</button></div>`;
  }

  // Pipeline mini
  const pipeMini = document.getElementById("pipelineMini");
  if(pipeMini){
    const deals = s.investmentDeals||[];
    pipeMini.innerHTML = deals.map(d=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F1F5F9">
        <div><div style="font-size:12px;font-weight:700;color:var(--blue)">${d.id}</div><div style="font-size:13px;font-weight:600">${d.name}</div><div style="font-size:11px;color:var(--muted)">${d.type} • ${formatCurrency(d.value)} • ${d.expectedReturn}% exp • ${d.officer}</div></div>
        <div style="text-align:right"><span class="pill ${d.stageNum<=2?'amber':d.stageNum<=4?'blue':'green'}" style="font-size:11px">${d.stage}</span><div style="font-size:11px;color:var(--muted);margin-top:4px">${d.approvalStatus}</div></div>
      </div>
    `).join("");
  }

  // Compliance summary
  const comp = document.getElementById("complianceSummary");
  if(comp){
    const breaches = s.complianceBreaches||[];
    comp.innerHTML = breaches.map(b=>`
      <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #F1F5F9">
        <div style="width:28px;height:28px;border-radius:7px;background:${b.severity==='High'?'#FEF2F2':b.severity==='Medium'?'#FFFBEB':'#F0FDF4'};color:${b.severity==='High'?'#DC2626':b.severity==='Medium'?'#D97706':'#16A34A'};display:grid;place-items:center;font-weight:800;font-size:12px">!</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${b.rule} • ${b.id}</div><div style="font-size:11px;color:var(--muted)">${b.portfolio} • Threshold ${b.threshold}% • Actual ${b.actual}% • ${b.status}</div></div>
        <div><span class="pill ${b.severity==='High'?'red':b.severity==='Medium'?'amber':'green'}">${b.severity}</span></div>
      </div>
    `).join("") + `<div style="margin-top:8px;font-size:12px;color:var(--muted)">Pre-trade and post-trade checks • Single-bank, allocation, concentration, liquidity</div>`;
  }

  const cashSum = document.getElementById("cashSummary");
  if(cashSum){
    const cashAccts = s.cashAccounts||[];
    cashSum.innerHTML = cashAccts.map(c=>`
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px">
        <div><b>${c.name}</b><div style="font-size:11px;color:var(--muted)">${c.bank} • ${c.currency}</div></div>
        <div style="text-align:right"><b>${c.currency==='USD'? formatCurrency(c.balanceZMW||0) : formatCurrency(c.balance)}</b><div style="font-size:11px;color:var(--muted)">Avail ${formatCurrency(c.available||c.balance)}</div></div>
      </div>
    `).join("") + `<div style="margin-top:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      <div class="mini-kpi"><div class="l">Current Cash</div><div class="v">${formatCurrency(94600000)}</div></div>
      <div class="mini-kpi"><div class="l">30-Day Proj</div><div class="v">${formatCurrency(45000000)}</div></div>
      <div class="mini-kpi"><div class="l">90-Day Proj</div><div class="v">${formatCurrency(72000000)}</div></div>
    </div>`;
  }
}

function goToPage(id){ if(window.goToPage) window.goToPage(id); }
