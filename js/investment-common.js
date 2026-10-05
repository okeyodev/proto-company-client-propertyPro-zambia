/**
 * ============================================================================
 * PropertyPro Zambia Ltd - Investment Management Common Core
 * File: js/investment-common.js - Phase 1 Foundation
 * 
 * PURPOSE:
 *   Shared data layer for Investment Management + Property Management integration.
 *   Extends window.state with investment portfolios, assets, valuations, deals,
 *   compliance, risk, performance, cash, benchmarks, etc.
 *   Provides calculation engine that uses real operational data (rent, invoices,
 *   payments, maintenance, utilities) to derive investment metrics without
 *   duplicate entry.
 * 
 * INTEGRATION PRINCIPLE:
 *   PropertyId is the critical link. investmentAsset.propertyId -> properties.id
 *   No duplication of property record inside investment record.
 * 
 * DEPENDS ON: client-common.js must load first (provides state, saveState, formatCurrency, toast, addAuditEvent)
 * ============================================================================
 */

(function(global){
  // Constants
  const INVESTMENT_FUNDS = [
    { id: "PENSION", name: "Pension Fund", code: "PF", description: "Workers Pension Fund - Long term growth" },
    { id: "ACCIDENT", name: "Accident Fund", code: "AF", description: "Workers Accident Compensation Fund" },
    { id: "ECIS", name: "ECIS Fund", code: "ECIS", description: "Employers Compensation" }
  ];

  const PORTFOLIO_TYPES = {
    "PORT-001": { id: "PORT-001", name: "Pension Fund - Main", fundId: "PENSION", type: "Main", value: 1840000000 },
    "PORT-002": { id: "PORT-002", name: "Accident Fund - Main", fundId: "ACCIDENT", type: "Main", value: 920000000 },
    "PORT-PROP": { id: "PORT-PROP", name: "Property Portfolio", fundId: "PENSION", type: "Sub-Portfolio", parent: "PORT-001", value: 420000000 },
    "PORT-FI": { id: "PORT-FI", name: "Fixed Income Portfolio", fundId: "PENSION", type: "Sub-Portfolio", parent: "PORT-001", value: 620000000 },
    "PORT-EQ": { id: "PORT-EQ", name: "Equities Portfolio", fundId: "PENSION", type: "Sub-Portfolio", parent: "PORT-001", value: 380000000 },
    "PORT-CIS": { id: "PORT-CIS", name: "CIS Portfolio", fundId: "PENSION", type: "Sub-Portfolio", parent: "PORT-001", value: 210000000 },
    "PORT-ALT": { id: "PORT-ALT", name: "Alternatives Portfolio", fundId: "PENSION", type: "Sub-Portfolio", parent: "PORT-001", value: 115000000 },
    "PORT-CASH": { id: "PORT-CASH", name: "Cash & Liquidity", fundId: "PENSION", type: "Liquidity", parent: "PORT-001", value: 94600000 }
  };

  const ASSET_CLASSES = ["Fixed Income", "Listed Equities", "Property", "Unlisted Equity", "Collective Investment Schemes", "Cash", "Infrastructure", "Forest Plantation", "Other"];

  const SAA_TARGETS = [
    { assetClass: "Fixed Income", target: 35, min: 25, max: 45 },
    { assetClass: "Property", target: 20, min: 15, max: 25 },
    { assetClass: "Listed Equities", target: 20, min: 15, max: 25 },
    { assetClass: "Collective Investment Schemes", target: 12, min: 5, max: 20 },
    { assetClass: "Unlisted Equity", target: 5, min: 0, max: 10 },
    { assetClass: "Cash", target: 5, min: 2, max: 10 },
    { assetClass: "Other", target: 3, min: 0, max: 8 }
  ];

  // Investment Mock Data - Zambia specific, ZMW
  const investmentMock = {
    investmentPortfolios: Object.values(PORTFOLIO_TYPES),
    funds: INVESTMENT_FUNDS,
    strategicAllocation: SAA_TARGETS,
    investmentAssets: [
      // Property Assets - linked to propertyId
      {
        id: "INV-PROP-001",
        name: "Zambezi Mall",
        assetClass: "Property",
        subClass: "Retail",
        propertyId: "P-001",
        fundId: "PENSION",
        portfolioId: "PORT-PROP",
        ownership: 100,
        quantity: 1,
        acquisitionDate: "2019-06-15",
        acquisitionCost: 62000000,
        marketValue: 86400000,
        fairValue: 86400000,
        insuranceValue: 92000000,
        annualRentalIncome: 33600000, // 2.8M *12
        grossIncome: 33600000,
        operatingCosts: 7200000,
        noi: 26400000,
        yield: 8.4,
        netYield: 6.2,
        occupancy: 84.8,
        vacancy: 15.2,
        size: 18400,
        debt: 0,
        encumbrance: "None",
        status: "Active",
        lastValuation: "2026-09-30",
        valuer: "Knight Frank Zambia",
        risk: "Low",
        income: 26400000,
        costPerSqm: 391,
        incomePerSqm: 1826
      },
      {
        id: "INV-PROP-002",
        name: "Lusaka Office Tower",
        assetClass: "Property",
        subClass: "Office",
        propertyId: "P-002",
        fundId: "PENSION",
        portfolioId: "PORT-PROP",
        ownership: 100,
        quantity: 1,
        acquisitionDate: "2020-03-10",
        acquisitionCost: 95000000,
        marketValue: 120000000,
        fairValue: 120000000,
        insuranceValue: 135000000,
        annualRentalIncome: 14400000,
        grossIncome: 14400000,
        operatingCosts: 3200000,
        noi: 11200000,
        yield: 9.3,
        netYield: 7.2,
        occupancy: 92.5,
        vacancy: 7.5,
        size: 8500,
        debt: 15000000,
        encumbrance: "Mortgage - Zanaco",
        status: "Active",
        lastValuation: "2026-09-30",
        valuer: "GVA Zambia",
        risk: "Low",
        income: 11200000
      },
      {
        id: "INV-PROP-003",
        name: "Copperbelt Industrial Park",
        assetClass: "Property",
        subClass: "Industrial",
        propertyId: "P-003",
        fundId: "PENSION",
        portfolioId: "PORT-PROP",
        ownership: 80,
        quantity: 1,
        acquisitionDate: "2021-08-20",
        acquisitionCost: 48000000,
        marketValue: 65000000,
        fairValue: 65000000,
        insuranceValue: 70000000,
        annualRentalIncome: 7800000,
        grossIncome: 7800000,
        operatingCosts: 1800000,
        noi: 6000000,
        yield: 9.2,
        netYield: 7.1,
        occupancy: 88.0,
        vacancy: 12.0,
        size: 12000,
        debt: 0,
        status: "Active",
        lastValuation: "2026-08-15",
        valuer: "Knight Frank Zambia",
        risk: "Medium",
        income: 6000000
      },
      {
        id: "INV-PROP-004",
        name: "Mukuba Residential Estate",
        assetClass: "Property",
        subClass: "Residential",
        propertyId: "P-004",
        fundId: "ACCIDENT",
        portfolioId: "PORT-PROP",
        ownership: 100,
        quantity: 1,
        acquisitionDate: "2018-11-05",
        acquisitionCost: 35000000,
        marketValue: 48500000,
        fairValue: 48500000,
        insuranceValue: 52000000,
        annualRentalIncome: 5200000,
        grossIncome: 5200000,
        operatingCosts: 1100000,
        noi: 4100000,
        yield: 8.5,
        netYield: 6.5,
        occupancy: 95.0,
        vacancy: 5.0,
        size: 45,
        units: 45,
        debt: 0,
        status: "Active",
        lastValuation: "2026-09-01",
        valuer: "Spectrum Properties",
        risk: "Low",
        income: 4100000
      },
      // Fixed Income
      {
        id: "INV-FI-001",
        name: "GRZ 91-Day T-Bill 12% 2026-12-15",
        assetClass: "Fixed Income",
        subClass: "Treasury Bill",
        propertyId: null,
        fundId: "PENSION",
        portfolioId: "PORT-FI",
        issuer: "Government of Zambia",
        counterparty: "Bank of Zambia",
        quantity: 50000000,
        faceValue: 50000000,
        cost: 48500000,
        carryingValue: 49200000,
        marketValue: 49500000,
        fairValue: 49500000,
        coupon: 12.0,
        yield: 12.5,
        maturity: "2026-12-15",
        accruedInterest: 1200000,
        rating: "B-",
        status: "Active",
        lastValuation: "2026-10-05",
        risk: "Low",
        income: 6000000
      },
      {
        id: "INV-FI-002",
        name: "GRZ 10-Year Bond 13.5% 2032",
        assetClass: "Fixed Income",
        subClass: "Government Bond",
        fundId: "PENSION",
        portfolioId: "PORT-FI",
        issuer: "Government of Zambia",
        counterparty: "BoZ",
        quantity: 300000000,
        faceValue: 300000000,
        cost: 295000000,
        carryingValue: 302000000,
        marketValue: 310000000,
        fairValue: 310000000,
        coupon: 13.5,
        yield: 13.2,
        maturity: "2032-06-15",
        accruedInterest: 8500000,
        rating: "B-",
        status: "Active",
        lastValuation: "2026-10-05",
        risk: "Medium",
        income: 40500000
      },
      {
        id: "INV-FI-003",
        name: "Zanaco Corporate Bond 11% 2028",
        assetClass: "Fixed Income",
        subClass: "Corporate Bond",
        fundId: "PENSION",
        portfolioId: "PORT-FI",
        issuer: "Zanaco PLC",
        counterparty: "Zanaco",
        quantity: 80000000,
        faceValue: 80000000,
        cost: 80000000,
        carryingValue: 81000000,
        marketValue: 82000000,
        fairValue: 82000000,
        coupon: 11.0,
        yield: 10.8,
        maturity: "2028-03-20",
        accruedInterest: 2200000,
        rating: "A-",
        status: "Active",
        lastValuation: "2026-10-01",
        risk: "Low",
        income: 8800000
      },
      // Listed Equities
      {
        id: "INV-EQ-001",
        name: "ZCCM Investments Holdings",
        assetClass: "Listed Equities",
        subClass: "Mining",
        ticker: "ZCCM-IH",
        fundId: "PENSION",
        portfolioId: "PORT-EQ",
        quantity: 2500000,
        cost: 12500000,
        marketValue: 18750000,
        fairValue: 18750000,
        unrealized: 6250000,
        dividend: 750000,
        broker: "Stockbrokers Zambia",
        status: "Active",
        lastValuation: "2026-10-05",
        risk: "Medium",
        income: 750000,
        yield: 4.0
      },
      {
        id: "INV-EQ-002",
        name: "Zambeef Products PLC",
        assetClass: "Listed Equities",
        subClass: "Agriculture",
        ticker: "ZAMBEF",
        fundId: "PENSION",
        portfolioId: "PORT-EQ",
        quantity: 8000000,
        cost: 16000000,
        marketValue: 20000000,
        fairValue: 20000000,
        unrealized: 4000000,
        dividend: 400000,
        broker: "African Alliance",
        status: "Active",
        lastValuation: "2026-10-05",
        risk: "Medium",
        income: 400000,
        yield: 2.0
      },
      // CIS
      {
        id: "INV-CIS-001",
        name: "Atlas Mara Zambia Equity Fund",
        assetClass: "Collective Investment Schemes",
        subClass: "Equity Fund",
        fundId: "PENSION",
        portfolioId: "PORT-CIS",
        fundManager: "Atlas Mara",
        mandate: "Zambian Equities",
        nav: 105.5,
        units: 1000000,
        cost: 100000000,
        marketValue: 105500000,
        fairValue: 105500000,
        managementFee: 1.5,
        performance: 5.5,
        status: "Active",
        lastValuation: "2026-10-04",
        risk: "Medium",
        income: 2500000,
        yield: 2.4
      },
      // Unlisted
      {
        id: "INV-UNL-001",
        name: "Lusaka South Multi-Facility Economic Zone SPV",
        assetClass: "Unlisted Equity",
        subClass: "SPV",
        fundId: "PENSION",
        portfolioId: "PORT-ALT",
        ownership: 25,
        cost: 45000000,
        marketValue: 52000000,
        fairValue: 52000000,
        status: "Active",
        lastValuation: "2026-09-15",
        risk: "High",
        income: 0
      },
      // Cash
      {
        id: "INV-CASH-001",
        name: "Zanaco Current Account ZMW",
        assetClass: "Cash",
        subClass: "Bank Balance",
        fundId: "PENSION",
        portfolioId: "PORT-CASH",
        bank: "Zanaco",
        account: "1234567890",
        currency: "ZMW",
        balance: 45000000,
        marketValue: 45000000,
        fairValue: 45000000,
        status: "Active",
        risk: "Low",
        income: 450000
      },
      {
        id: "INV-CASH-002",
        name: "Stanbic USD Account",
        assetClass: "Cash",
        subClass: "Bank Balance",
        fundId: "PENSION",
        portfolioId: "PORT-CASH",
        bank: "Stanbic",
        account: "USD-7890",
        currency: "USD",
        balance: 2500000,
        balanceZMW: 49600000,
        marketValue: 49600000,
        fairValue: 49600000,
        status: "Active",
        risk: "Low",
        income: 0
      }
    ],
    valuations: [
      { id: "VAL-001", assetId: "INV-PROP-001", propertyId: "P-001", date: "2024-09-30", previousDate: "2023-09-30", valuer: "Knight Frank Zambia", method: "Income Approach - DCF", marketValue: 78000000, previousValue: 72000000, change: 6000000, changePct: 8.33, insuranceValue: 85000000, report: "VAL-2024-001.pdf", status: "Approved" },
      { id: "VAL-002", assetId: "INV-PROP-001", propertyId: "P-001", date: "2025-09-30", previousDate: "2024-09-30", valuer: "Knight Frank Zambia", method: "Income Approach - DCF", marketValue: 82000000, previousValue: 78000000, change: 4000000, changePct: 5.13, insuranceValue: 88000000, report: "VAL-2025-001.pdf", status: "Approved" },
      { id: "VAL-003", assetId: "INV-PROP-001", propertyId: "P-001", date: "2026-09-30", previousDate: "2025-09-30", valuer: "Knight Frank Zambia", method: "Income Approach - DCF + Market", marketValue: 86400000, previousValue: 82000000, change: 4400000, changePct: 5.37, insuranceValue: 92000000, report: "VAL-2026-001.pdf", status: "Approved" },
      { id: "VAL-004", assetId: "INV-PROP-002", propertyId: "P-002", date: "2026-09-30", previousDate: "2025-09-30", valuer: "GVA Zambia", method: "Market Approach", marketValue: 120000000, previousValue: 112000000, change: 8000000, changePct: 7.14, insuranceValue: 135000000, report: "VAL-2026-002.pdf", status: "Approved" }
    ],
    investmentTransactions: [
      { id: "TXN-001", assetId: "INV-PROP-001", type: "Acquisition", date: "2019-06-15", amount: 62000000, description: "Acquisition of Zambezi Mall", status: "Settled" },
      { id: "TXN-002", assetId: "INV-PROP-001", type: "Valuation Gain", date: "2026-09-30", amount: 4400000, description: "Fair value gain - IAS 40", status: "Booked" },
      { id: "TXN-003", assetId: "INV-FI-002", type: "Coupon", date: "2026-09-15", amount: 10125000, description: "GRZ Bond coupon", status: "Received" }
    ],
    investmentDeals: [
      { id: "DEAL-001", name: "East Park Mall Acquisition", type: "Property", asset: "Retail Mall", value: 95000000, expectedReturn: 9.5, risk: "Medium", stage: "Screening", stageNum: 2, officer: "Chanda Mwanza", nextAction: "Investment Committee Review", approvalStatus: "Pending", date: "2026-09-20", irr: 11.2, npv: 12500000 },
      { id: "DEAL-002", name: "GRZ 15-Year Bond - ZMW 100M", type: "Fixed Income", asset: "Gov Bond", value: 100000000, expectedReturn: 13.5, risk: "Low", stage: "Due Diligence", stageNum: 3, officer: "Mukuka Banda", nextAction: "Credit Analysis", approvalStatus: "Under Review", date: "2026-10-01", irr: 13.5, npv: 5000000 },
      { id: "DEAL-003", name: "Kafue Industrial Development", type: "Development", asset: "Industrial Park", value: 120000000, expectedReturn: 14.0, risk: "High", stage: "Origination", stageNum: 1, officer: "Lubinda Zulu", nextAction: "Feasibility Study", approvalStatus: "Draft", date: "2026-09-15", irr: 16.0, npv: 18000000 },
      { id: "DEAL-004", name: "Atlas Mara CIS Additional Units", type: "CIS", asset: "Equity Fund", value: 25000000, expectedReturn: 8.0, risk: "Medium", stage: "MIC Approval", stageNum: 4, officer: "Chanda Mwanza", nextAction: "MIC Pack Preparation", approvalStatus: "Submitted", date: "2026-10-03", irr: 8.5, npv: 2000000 }
    ],
    appraisals: [
      { id: "APPR-001", dealId: "DEAL-001", property: "East Park Mall", method: "DCF", baseCase: { npv: 12500000, irr: 11.2 }, optimistic: { npv: 22000000, irr: 14.5 }, downside: { npv: 3000000, irr: 8.0 }, assumptions: "Rent growth 5%, vacancy 10%, discount 12%", recommendation: "Proceed to MIC", status: "Completed" }
    ],
    conditionsPrecedent: [
      { id: "CP-001", dealId: "DEAL-001", condition: "Title deed verification", responsible: "Legal", due: "2026-10-15", status: "Pending", evidence: "", approval: "Pending", comments: "ZRA verification required" },
      { id: "CP-002", dealId: "DEAL-001", condition: "Environmental clearance", responsible: "Compliance", due: "2026-10-20", status: "Submitted", evidence: "EIA-2026.pdf", approval: "Verified", comments: "" },
      { id: "CP-003", dealId: "DEAL-002", condition: "BoZ approval for large exposure", responsible: "Risk", due: "2026-10-10", status: "Overdue", evidence: "", approval: "Pending", comments: "Awaiting BoZ letter" }
    ],
    complianceRules: [
      { id: "RULE-001", name: "Single Bank Exposure", description: "No single bank >20% of portfolio", threshold: 20, type: "Concentration", severity: "High" },
      { id: "RULE-002", name: "Property Allocation", description: "Property 15-25%", thresholdMin: 15, thresholdMax: 25, type: "Allocation", severity: "High" },
      { id: "RULE-003", name: "Liquidity Minimum", description: "Cash min 2%", thresholdMin: 2, type: "Liquidity", severity: "Medium" }
    ],
    complianceBreaches: [
      { id: "BR-001", ruleId: "RULE-001", rule: "Single Bank Exposure", asset: "Zanaco accounts", portfolio: "PORT-CASH", threshold: 20, actual: 22.5, severity: "Medium", detected: "2026-10-02", status: "Open", owner: "Treasury", resolution: "Move funds to Stanbic", assetId: "INV-CASH-001" },
      { id: "BR-002", ruleId: "RULE-002", rule: "Property Allocation", asset: "Property Portfolio", portfolio: "PORT-001", threshold: 25, actual: 22.8, severity: "Low", detected: "2026-10-05", status: "Monitoring", owner: "Investment", resolution: "Within range" }
    ],
    cashAccounts: [
      { id: "CASH-001", name: "Zanaco ZMW Main", bank: "Zanaco", account: "1234567890", currency: "ZMW", balance: 45000000, available: 38000000, committed: 7000000, type: "Current", fundId: "PENSION" },
      { id: "CASH-002", name: "Stanbic USD", bank: "Stanbic", account: "USD-7890", currency: "USD", balance: 2500000, balanceZMW: 49600000, available: 49600000, committed: 0, type: "Current", fundId: "PENSION" },
      { id: "CASH-003", name: "BoZ Liquidity", bank: "Bank of Zambia", account: "BoZ-001", currency: "ZMW", balance: 35000000, available: 35000000, committed: 0, type: "Reserve", fundId: "PENSION" }
    ],
    benchmarks: [
      { id: "BM-001", name: "Zambian Govt Bond Index", type: "Fixed Income", return: 12.8 },
      { id: "BM-002", name: "LuSE All Share", type: "Equity", return: 8.2 },
      { id: "BM-003", name: "Property Benchmark Zambia", type: "Property", return: 7.5 }
    ],
    performanceMetrics: {
      totalValue: 1840000000,
      propertyValue: 420000000,
      totalIncome: 82400000,
      portfolioYield: 9.2,
      twrr: 8.7,
      mwrr: 9.1,
      cashPosition: 94600000,
      complianceBreaches: 2,
      occupancy: 84.8,
      noi: 32700000,
      ytdReturn: 7.2,
      benchmarkReturn: 9.5
    },
    riskMetrics: [
      { type: "Concentration", value: "Zanaco 22.5%", severity: "Medium", limit: "20%" },
      { type: "Vacancy", value: "15.2% Zambezi", severity: "Low", limit: "20%" },
      { type: "Liquidity", value: "5.1%", severity: "Low", limit: "2% min" },
      { type: "Currency", value: "USD 2.7%", severity: "Low", limit: "10%" },
      { type: "Credit", value: "B- GRZ", severity: "Medium", limit: "B-" }
    ],
    developmentProjects: [
      { id: "DEV-001", name: "Kafue Industrial Park", status: "Feasibility", budget: 120000000, spent: 5000000, progress: 15, feasibility: { npv: 18000000, irr: 16.0 }, contractor: "TBD", stage: "Feasibility → Appraisal → Approval → Development → Property Asset → Investment Portfolio" }
    ],
    boardReports: [
      { id: "RPT-001", name: "Q3 2026 Board Investment Report", type: "Board", date: "2026-09-30", status: "Approved", pages: 45 },
      { id: "RPT-002", name: "Q3 2026 Property Portfolio Report", type: "Property", date: "2026-09-30", status: "Approved", pages: 32 },
      { id: "RPT-003", name: "Q3 2026 Compliance & Risk", type: "Risk", date: "2026-09-30", status: "Draft", pages: 28 }
    ],
    documents: [
      { id: "DOC-001", name: "Zambezi Mall Title Deed", category: "Title", entity: "Property", entityId: "P-001", version: 1, uploadedBy: "Legal", uploaded: "2019-06-15", status: "Active", confidentiality: "Confidential", expiry: null },
      { id: "DOC-002", name: "Valuation Report VAL-2026-001", category: "Valuation", entity: "Investment Asset", entityId: "INV-PROP-001", version: 1, uploadedBy: "Knight Frank", uploaded: "2026-09-30", status: "Approved", confidentiality: "Internal", expiry: "2027-09-30" },
      { id: "DOC-003", name: "Lease L-2026-001 Kabwelwa", category: "Lease Agreement", entity: "Lease", entityId: "L-2026-001", version: 2, uploadedBy: "Leasing", uploaded: "2024-01-01", status: "Active", confidentiality: "Confidential", expiry: "2026-12-31" }
    ],
    approvals: [
      { id: "APR-001", type: "New Investment", entity: "DEAL-001 East Park Mall", maker: "Chanda Mwanza", checker: "Risk Team", approver: "MIC", date: "2026-10-03", status: "Submitted", comments: "Awaiting MIC review", stage: "MIC/FIC/Board Approval" },
      { id: "APR-002", type: "Property Valuation", entity: "INV-PROP-001", maker: "Valuation Team", checker: "Finance", approver: "CFO", date: "2026-09-30", status: "Approved", comments: "Approved per IAS 40", stage: "Completed" }
    ]
  };

  // Calculation Engine - Reusable
  const Calc = {
    calculatePropertyNOI: (grossIncome, operatingExpenses) => (grossIncome || 0) - (operatingExpenses || 0),
    calculateGrossYield: (annualRent, marketValue) => marketValue ? ((annualRent||0)/marketValue)*100 : 0,
    calculateNetYield: (noi, marketValue) => marketValue ? ((noi||0)/marketValue)*100 : 0,
    calculateOccupancy: (occupied, total) => total ? (occupied/total)*100 : 0,
    calculateVacancy: (occupancy) => 100 - (occupancy||0),
    calculateArrearsRatio: (arrears, totalInvoiced) => totalInvoiced ? (arrears/totalInvoiced)*100 : 0,
    calculatePortfolioAllocation: (assetValue, totalValue) => totalValue ? (assetValue/totalValue)*100 : 0,
    calculateAllocationDrift: (current, target) => (current||0) - (target||0),
    calculateValuationChange: (current, previous) => {
      const change = (current||0) - (previous||0);
      const pct = previous ? (change/previous)*100 : 0;
      return { change, pct };
    },
    calculateIncomePerSqm: (income, size) => size ? income/size : 0,
    calculateCostPerSqm: (cost, size) => size ? cost/size : 0,
    calculateNOIMargin: (noi, grossIncome) => grossIncome ? (noi/grossIncome)*100 : 0,
    calculateOER: (opEx, grossIncome) => grossIncome ? (opEx/grossIncome)*100 : 0,
    calculateNPV: (rate, cashflows) => {
      // cashflows: array of numbers, rate decimal
      return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1+rate, i), 0);
    },
    calculateIRR: (cashflows, guess=0.1) => {
      // Simplified Newton-Raphson
      let r = guess;
      for(let iter=0; iter<100; iter++){
        let npv = 0, dnpv = 0;
        cashflows.forEach((cf,i)=>{
          npv += cf / Math.pow(1+r,i);
          if(i>0) dnpv += -i * cf / Math.pow(1+r,i+1);
        });
        if(Math.abs(npv) < 0.01) break;
        if(dnpv===0) break;
        r = r - npv/dnpv;
        if(r < -0.99) r = -0.99;
      }
      return r*100;
    },
    calculateTWRR: (periodReturns) => {
      // periodReturns array of % returns, TWRR = product(1+r)-1
      let prod = 1;
      periodReturns.forEach(r=>{ prod *= (1 + r/100); });
      return (prod-1)*100;
    },
    calculateMWRR: (irr) => irr, // placeholder - MWRR ~ IRR
    // Derived from operational state
    getPropertyIncome: (state, propertyId) => {
      const invoices = (state.invoices||[]).filter(inv=> inv.propertyId===propertyId || inv.property===PORTFOLIO_TYPES["PORT-PROP"]?.name || propertyId==="P-001");
      // For demo, use all invoices as Zambezi Mall income
      const gross = invoices.reduce((s,i)=> s + (i.total||0), 0);
      return gross;
    },
    getPropertyOperatingCosts: (state, propertyId) => {
      const maint = (state.maintenance||[]).length * 2500; // estimate
      const utils = (state.utilities||[]).reduce((s,u)=> s + (u.amount||0), 0);
      return maint + utils + 15000; // add mgmt, insurance
    },
    getPortfolioTotal: (assets) => assets.reduce((s,a)=> s + (a.marketValue||0), 0),
    getAllocationStatus: (current, target, min, max) => {
      if(current < min || current > max) return "Breach";
      if(Math.abs(current-target) > 2) return "Watch";
      return "Normal";
    }
  };

  // Merge into state
  function ensureInvestmentState(){
    const s = global.state || global.window?.state;
    if(!s) return;
    // Only add if not exists, preserve existing
    Object.keys(investmentMock).forEach(k=>{
      if(!s[k]) s[k] = JSON.parse(JSON.stringify(investmentMock[k]));
    });
    // Ensure properties P-002 P-003 P-004 exist for investment link
    if(!s.properties.find(p=>p.id==="P-002")){
      s.properties.push(
        {id:"P-002", name:"Lusaka Office Tower", type:"Office", units:45, occupied:42, city:"Lusaka", value:120, rent:1.2, status:"Stabilized", yield:9.3, lat:-15.4167, lng:28.2871, address:"Cairo Road, Lusaka"},
        {id:"P-003", name:"Copperbelt Industrial Park", type:"Industrial", units:24, occupied:21, city:"Ndola", value:65, rent:0.65, status:"Growth", yield:9.2, lat:-12.9587, lng:28.6366, address:"Industrial Area, Ndola"},
        {id:"P-004", name:"Mukuba Residential Estate", type:"Residential", units:45, occupied:43, city:"Kitwe", value:48.5, rent:0.43, status:"Stabilized", yield:8.5, lat:-12.8042, lng:28.2134, address:"Mukuba, Kitwe"}
      );
    }
    if(global.saveState) global.saveState();
    console.log("[Investment Common] merged", Object.keys(investmentMock).length, "slices");
  }

  // Initialize when DOM ready or state exists
  if(global.document){
    if(document.readyState==="loading"){
      document.addEventListener("DOMContentLoaded", ensureInvestmentState);
    } else {
      setTimeout(ensureInvestmentState, 100);
    }
  }

  // Expose
  global.INVESTMENT_FUNDS = INVESTMENT_FUNDS;
  global.PORTFOLIO_TYPES = PORTFOLIO_TYPES;
  global.ASSET_CLASSES = ASSET_CLASSES;
  global.SAA_TARGETS = SAA_TARGETS;
  global.investmentMock = investmentMock;
  global.InvestmentCalc = Calc;
  global.ensureInvestmentState = ensureInvestmentState;

  // Search extension
  const originalHandleSearch = global.handleSearchInput;
  global.handleSearchInputExtended = function(e){
    const q = (e.target.value||"").toLowerCase().trim();
    if(!q){ if(global.closeSearch) global.closeSearch(); return; }
    const results = [];
    const s = global.state || {};
    (s.investmentAssets||[]).forEach(a=>{
      if(a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
        results.push({type:"Investment Asset", title:a.id, sub:a.name, page:"investment-asset-register"});
    });
    (s.investmentPortfolios||[]).forEach(p=>{
      if(p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
        results.push({type:"Portfolio", title:p.id, sub:p.name, page:"investment-portfolios"});
    });
    (s.investmentDeals||[]).forEach(d=>{
      if(d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q))
        results.push({type:"Deal", title:d.id, sub:d.name, page:"investment-deals"});
    });
    (s.properties||[]).forEach(pr=>{
      if(pr.name.toLowerCase().includes(q) || pr.id.toLowerCase().includes(q))
        results.push({type:"Property", title:pr.id, sub:pr.name, page:"property-investment-detail"});
    });
    (s.complianceBreaches||[]).forEach(b=>{
      if(b.id.toLowerCase().includes(q) || b.rule.toLowerCase().includes(q))
        results.push({type:"Compliance Breach", title:b.id, sub:b.rule, page:"investment-compliance"});
    });
    // Keep original results too
    (s.invoices||[]).forEach(inv=>{
      if(inv.id.toLowerCase().includes(q) || (inv.description||"").toLowerCase().includes(q))
        results.push({type:"Invoice", title:inv.id, sub:inv.description, page:"client-invoices"});
    });
    (s.maintenance||[]).forEach(m=>{
      if(m.id.toLowerCase().includes(q) || m.issue.toLowerCase().includes(q))
        results.push({type:"Maintenance", title:m.id, sub:m.issue, page:"client-maintenance"});
    });
    if(global.renderSearchResults) global.renderSearchResults(results);
    if(global.openSearch) global.openSearch();
  };

  // Override global search to include investment records
  global.handleSearchInput = global.handleSearchInputExtended;

})(window);
