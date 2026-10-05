
document.addEventListener("DOMContentLoaded", () => {
  initCommon("investment-allocation");
  setTimeout(renderAlloc, 400);
});
function renderAlloc(){
  const s = window.state;
  if(!s.investmentAssets){ setTimeout(renderAlloc,300); return; }
  const calc = window.InvestmentCalc;
  const filters = document.getElementById("filters");
  if(filters) filters.innerHTML = `<select class="inv-filter"><option>Board Approved SAA 2026</option></select>`;
  const actions = document.getElementById("actions");
  if(actions) actions.innerHTML = `<button class="btn" onclick="toast('What-if analysis is analysis tool, does not execute transactions','info')">What-if Model</button><button class="btn pay-now-btn" onclick="goToPage('investment-board')">Board View</button>`;
  const total = s.investmentAssets.reduce((a,b)=>a+b.marketValue,0);
  const data = [
    {assetClass:"Fixed Income", value:s.investmentAssets.filter(a=>a.assetClass==="Fixed Income").reduce((a,b)=>a+b.marketValue,0), target:35, min:25, max:45},
    {assetClass:"Property", value:s.investmentAssets.filter(a=>a.assetClass==="Property").reduce((a,b)=>a+b.marketValue,0), target:20, min:15, max:25},
    {assetClass:"Listed Equities", value:s.investmentAssets.filter(a=>a.assetClass==="Listed Equities").reduce((a,b)=>a+b.marketValue,0), target:20, min:15, max:25},
    {assetClass:"CIS", value:s.investmentAssets.filter(a=>a.assetClass==="Collective Investment Schemes").reduce((a,b)=>a+b.marketValue,0), target:12, min:5, max:20},
    {assetClass:"Cash", value:s.investmentAssets.filter(a=>a.assetClass==="Cash").reduce((a,b)=>a+b.marketValue,0), target:5, min:2, max:10},
    {assetClass:"Unlisted Equity", value:s.investmentAssets.filter(a=>a.assetClass==="Unlisted Equity").reduce((a,b)=>a+b.marketValue,0), target:5, min:0, max:10},
    {assetClass:"Other", value:0, target:3, min:0, max:8}
  ].map(r=>{
    const alloc = calc.calculatePortfolioAllocation(r.value,total);
    return {...r, alloc, drift: calc.calculateAllocationDrift(alloc,r.target), status: calc.getAllocationStatus(alloc,r.target,r.min,r.max)};
  });
  const root = document.getElementById("pageRoot");
  root.innerHTML = `
    <div class="card"><div class="card-head"><h3>Strategic Asset Allocation vs Current</h3></div><div class="card-body">
      <div class="alloc-row header"><div>Asset Class</div><div>Value</div><div>Current %</div><div>Target %</div><div>Range</div><div>Drift</div><div>Status</div></div>
      ${data.map(r=>`<div class="alloc-row"><div><b>${r.assetClass}</b></div><div>${formatCurrency(r.value)}</div><div>${r.alloc.toFixed(1)}%</div><div>${r.target}%</div><div>${r.min}-${r.max}%</div><div style="color:${Math.abs(r.drift)>2?'#D97706':'#16A34A'}">${r.drift>0?'+':''}${r.drift.toFixed(1)}%</div><div><span class="alloc-status ${r.status.toLowerCase()}">${r.status}</span></div></div>`).join("")}
    </div></div>
    <div class="section-split" style="margin-top:14px">
      <div class="alloc-card"><h3 style="margin:0 0 12px;font-size:14px">What-if Model (Analysis Tool)</h3>
        <div class="whatif-box">
          <div style="font-size:13px;font-weight:600">Current Property Allocation: ${data.find(x=>x.assetClass==="Property").alloc.toFixed(1)}%</div>
          <div class="whatif-input"><label style="font-size:13px;width:160px">Proposed Acquisition ZMW</label><input type="number" id="whatifAmount" value="25000000"><button class="btn pay-now-btn" onclick="runWhatIf()">Calculate</button></div>
          <div id="whatifResult" style="margin-top:10px;font-size:13px;background:#FFF;border:1px solid #E2E8F0;border-radius:8px;padding:10px">Enter amount and calculate projected allocation. This does not execute transaction.</div>
        </div>
      </div>
      <div class="alloc-card"><h3 style="margin:0 0 12px;font-size:14px">Allocation Visual</h3><div id="allocVisual"></div></div>
    </div>
  `;
  const visual = document.getElementById("allocVisual");
  visual.innerHTML = data.map(r=>`<div style="display:flex;align-items:center;gap:8px;margin:8px 0"><div style="width:120px;font-size:12px;font-weight:600">${r.assetClass}</div><div class="alloc-bar" style="flex:1"><i style="width:${r.alloc}%;background:#2563EB"></i><i style="width:2px;background:#000;margin-left:${r.target}%;position:relative"></i></div><div style="width:40px;font-size:12px">${r.alloc.toFixed(1)}%</div></div>`).join("") + `<div style="font-size:11px;color:var(--muted);margin-top:8px">Blue bar = current, black line = target</div>`;
  window._allocData = data;
  window._total = total;
}
function runWhatIf(){
  const amt = parseFloat(document.getElementById("whatifAmount").value||0);
  const data = window._allocData;
  const total = window._total;
  const prop = data.find(x=>x.assetClass==="Property");
  const newPropVal = prop.value + amt;
  const newTotal = total + amt;
  const newAlloc = (newPropVal/newTotal)*100;
  const status = newAlloc >= prop.min && newAlloc <= prop.max ? "Within permitted range" : "Breach - Outside range";
  document.getElementById("whatifResult").innerHTML = `
    <div>Current Property Allocation: ${prop.alloc.toFixed(1)}%</div>
    <div>Proposed Acquisition: ${formatCurrency(amt)}</div>
    <div style="margin-top:6px"><b>Projected Allocation: ${newAlloc.toFixed(1)}%</b></div>
    <div style="margin-top:4px">Target: ${prop.target}% • Range: ${prop.min}-${prop.max}%</div>
    <div style="margin-top:6px"><span class="alloc-status ${status.includes('Within')?'normal':'breach'}">${status}</span></div>
    <div style="margin-top:8px;font-size:11px;color:var(--muted)">Analysis tool only - does not execute transaction. Requires MIC/FIC/Board approval via approval workflow.</div>
  `;
}
