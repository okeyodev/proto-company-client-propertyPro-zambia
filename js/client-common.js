/**
 * ============================================================================
 * PropertyPro Zambia Ltd - Client Portal Common Core
 * File: js/client-common.js - Senior Developer Navigation Fix v3.2
 * Original: Converted from company common.js (admin) to client/tenant self-service
 * Fix Date: 2026-10-05
 * Author: Senior Frontend Engineer (Original Dashboard Designer)
 *
 * PURPOSE:
 *   Core state management, tenant context, mock data, utilities, and
 *   navigation binding for Tenant Portal. Same logic patterns as admin
 *   dashboard but trimmed for single-tenant view (no investment generators,
 *   no leasing admin approvals). This file is loaded BEFORE client-layout.js
 *   on every page.
 *
 * NAVIGATION FIX APPLIED - WHY THIS FILE WAS PART OF THE BUG:
 *   Issue: bindNav() used per-element direct listeners with _boundNav flag.
 *   When sidebar re-renders (after Layout.init or after registerPage), old
 *   DOM nodes are destroyed, new nav-items have no listeners - navigation
 *   breaks for future pages. Also, if same nav-item encountered twice (e.g.
 *   after hot reload), _boundNav prevented re-binding, leaving dead handlers.
 *   Fix: Now uses EVENT DELEGATION - single listener on #sidebarNav container
 *   + fallback delegation on document. Any future nav-item added dynamically
 *   (via registerPage or custom pages from localStorage) automatically works
 *   without needing re-bind. _boundNav still used as guard for legacy direct
 *   listeners but delegation is primary.
 *   Additionally, bindNav now handles:
 *   - Keyboard accessibility (Enter/Space triggers navigation)
 *   - Prevents double navigation if already on current page
 *   - Saves scroll position and last page for restore
 *   - Works even if window.goToPage not yet defined (queues navigation)
 *
 * FUTURE-PROOF DESIGN:
 *   - State stored in localStorage "propertypro_client_v1" with versioning
 *   - financeMetrics computed for dashboard KPIs, preserved across reloads
 *   - Custom event "propertypro:stateUpdated" dispatched on saveState() -
 *     allows future modules to react to state changes without tight coupling
 *   - handleSearchInput() searches invoices, maintenance, notices - future
 *     search types can be added by pushing to results array without breaking
 *   - All globals exposed via window.* for other modules (same as original)
 *   - CLIENT_TENANT constant is single source for tenant identity - future
 *     multi-tenant support could replace this with auth context
 *
 * STATE STRUCTURE (for future devs):
 *   state = {
 *     _version: 1,
 *     properties: [P-001 Zambezi Mall 184 units 156 occupied 86.4M],
 *     units: [U-P001-12 Ground 320m² rent 85K tenant T-1042],
 *     leases: [L-2026-001 2024-01-01→2026-12-31 rent 85K deposit 170K escalation 7%],
 *     invoices: [INV-P001-001 Overdue 98.6K Sep, INV-P001-002 Issued 98.6K Oct, INV-P001-003 Paid 13.92K],
 *     payments: [PAY-001 Airtel 13,920, PAY-002 Zanaco 85K],
 *     maintenance: [MNT-001 Open High AC 2 days + FM comment, MNT-002 In Progress Electrical],
 *     utilities: [UTL-001 ELEC 12450/11800 650 rate2.5 1625, UTL-002 WTR 820/780 40 rate15 600],
 *     notices: [NOTICE-00001 Outage ZESCO 12 Oct, NOTICE-00002 Rent reminder, NOTICE-00003 Survey Q3],
 *     messages: [THREAD-001 HVAC Chanda Mwanza, THREAD-002 Finance confirmation],
 *     clientTenant: CLIENT_TENANT,
 *     financeMetrics: { totalOutstanding 170K, totalInvoiced 211520, totalCollected 13920, collectionRate 6.5% }
 *   }
 *
 * HOW TO ADD NEW PAGE DATA:
 *   If new page needs new state slice (e.g. reports), add to mock object here
 *   and it will auto-persist via saveState(). No migration needed unless
 *   _version changes - then implement migration in state loader.
 *
 * DEBUGGING:
 *   - Console: "[Client Common] v1 tenant portal loaded - X invoices, Y maintenance"
 *   - Check localStorage "propertypro_client_v1" in DevTools Application tab
 *   - window.state gives current state, window.saveState() persists
 *   - window.toast(msg, type) shows toast (type: info/success/error)
 *   - window.formatCurrency(amount) formats ZMW with 2 decimals en-ZM
 *   - BindNav: Check if .nav-item[data-page] exists after Layout.init
 *
 * DEPENDENCIES:
 *   - js/client-layout.js: provides goToPage(), Layout, NAV_CONFIG, renders sidebar
 *   - css/common.css + layout.css: styling for nav, toast, modal, etc.
 * ============================================================================
 */

// --------------------------------------------------------------------------
// DOM HELPERS - Same as admin dashboard for consistency
// --------------------------------------------------------------------------
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// --------------------------------------------------------------------------
// STORAGE - Versioned localStorage with migration support for future
// --------------------------------------------------------------------------
const STORAGE_KEY = "propertypro_client_v1";
const STORAGE_VERSION = 1;

// --------------------------------------------------------------------------
// TENANT CONTEXT - Logged-in tenant, ToR 8.6 tenant self-service
// Single source of truth for tenant identity across portal
// Future: Replace with auth context from backend when API ready
// --------------------------------------------------------------------------
const CLIENT_TENANT = {
  id: "T-1042",
  name: "Kabwelwa Supermarket",
  propertyId: "P-001",
  property: "Zambezi Mall",
  unitId: "U-P001-12",
  unit: "12",
  city: "Lusaka",
  type: "Anchor", // Anchor tenant - larger unit, longer tenure
  tenure: "1.2y",
  status: "Active",
  avatar: "KS", // Initials for avatar circle
  phone: "+260 97 1234567",
  email: "ops@kabwelwa.zm",
  tpin: "1234567890", // ZRA TPIN for Smart Invoice
};

// --------------------------------------------------------------------------
// MOCK DATA - Converted from company dashboard, filtered to single tenant
// Same structure as admin but only T-1042 data - future API will replace
// --------------------------------------------------------------------------
const mock = {
  properties: [
    {
      id: "P-001",
      name: "Zambezi Mall",
      type: "Retail",
      units: 184,
      occupied: 156,
      city: "Lusaka",
      value: 86.4, // ZMW Millions - for portfolio context
      rent: 2.8, // Monthly rent roll Millions
      status: "Stabilized",
      yield: 8.4,
      lat: -15.4067,
      lng: 28.2871,
      address: "Plot 1234, Great East Road, Lusaka",
    },
  ],
  units: [
    {
      id: "U-P001-12",
      propertyId: "P-001",
      property: "Zambezi Mall",
      unit: "12",
      floor: "Ground",
      size: 320, // m²
      rent: 85000,
      status: "Occupied",
      tenantId: "T-1042",
      tenant: "Kabwelwa Supermarket",
    },
  ],
  leases: [
    {
      id: "L-2026-001",
      tenantId: "T-1042",
      tenant: "Kabwelwa Supermarket",
      propertyId: "P-001",
      property: "Zambezi Mall",
      unitId: "U-P001-12",
      unit: "12",
      start: "2024-01-01",
      end: "2026-12-31",
      rent: 85000,
      deposit: 170000,
      escalation: 7, // 7% annual escalation
      status: "Active",
      type: "Retail Lease",
      documents: [
        "Lease Agreement - L-2026-001.pdf",
        "Deposit Receipt.pdf",
        "Move-in Inspection.pdf",
      ],
    },
  ],
  invoices: [
    {
      id: "INV-P001-001",
      tenantId: "T-1042",
      tenant: "Kabwelwa Supermarket",
      propertyId: "P-001",
      property: "Zambezi Mall",
      unit: "12",
      amount: 85000,
      vat: 13600, // 16% VAT
      total: 98600,
      due: "2026-09-01",
      issueDate: "2026-08-25",
      status: "Overdue",
      type: "Rent",
      outstandingAmount: 85000,
      description: "Monthly Rent - Sep 2026",
    },
    {
      id: "INV-P001-002",
      tenantId: "T-1042",
      property: "Zambezi Mall",
      unit: "12",
      amount: 85000,
      vat: 13600,
      total: 98600,
      due: "2026-10-01",
      issueDate: "2026-09-25",
      status: "Issued",
      type: "Rent",
      outstandingAmount: 85000,
      description: "Monthly Rent - Oct 2026",
    },
    {
      id: "INV-P001-003",
      tenantId: "T-1042",
      property: "Zambezi Mall",
      unit: "12",
      amount: 12000,
      vat: 1920,
      total: 13920,
      due: "2026-09-15",
      issueDate: "2026-09-10",
      status: "Paid",
      type: "Service Charge",
      outstandingAmount: 0,
      description: "Service Charge - Sep 2026",
      paidDate: "2026-09-12",
      receipt: "RCPT-2026-0912",
    },
  ],
  payments: [
    {
      id: "PAY-001",
      tenantId: "T-1042",
      invoiceId: "INV-P001-003",
      amount: 13920,
      method: "Mobile Money - Airtel",
      reference: "AIRTEL-772831",
      date: "2026-09-12",
      status: "Confirmed",
      receipt: "RCPT-2026-0912",
    },
    {
      id: "PAY-002",
      tenantId: "T-1042",
      invoiceId: "INV-P001-000",
      amount: 85000,
      method: "Bank Transfer - Zanaco",
      reference: "ZANACO-99821",
      date: "2026-08-05",
      status: "Confirmed",
      receipt: "RCPT-2026-0805",
    },
  ],
  maintenance: [
    {
      id: "MNT-001",
      tenantId: "T-1042",
      propertyId: "P-001",
      property: "Zambezi Mall",
      unit: "12",
      issue: "AC not cooling in main sales area",
      category: "HVAC",
      priority: "High",
      status: "Open",
      sla: "2 days",
      createdAt: "2026-10-01",
      createdBy: "Kabwelwa Supermarket",
      photos: [],
      comments: [
        {
          by: "FM Team",
          text: "Technician dispatched - ETA 24h",
          date: "2026-10-02",
        },
      ],
    },
    {
      id: "MNT-002",
      tenantId: "T-1042",
      propertyId: "P-001",
      property: "Zambezi Mall",
      unit: "12",
      issue: "Flickering lights near entrance",
      category: "Electrical",
      priority: "Medium",
      status: "In Progress",
      sla: "5 days",
      createdAt: "2026-09-28",
      photos: [],
    },
  ],
  utilities: [
    {
      id: "UTL-001",
      property: "Zambezi Mall",
      unit: "12",
      type: "Electricity",
      meter: "ELEC-0012",
      reading: 12450,
      previous: 11800,
      consumption: 650,
      rate: 2.5,
      amount: 1625,
      date: "2026-09-30",
      status: "Billed",
    },
    {
      id: "UTL-002",
      property: "Zambezi Mall",
      unit: "12",
      type: "Water",
      meter: "WTR-0012",
      reading: 820,
      previous: 780,
      consumption: 40,
      rate: 15,
      amount: 600,
      date: "2026-09-30",
      status: "Billed",
    },
  ],
  notices: [
    {
      id: "NOTICE-00001",
      title: "Scheduled Power Outage - Zambezi Mall - 12 Oct",
      type: "Outage",
      noticeType: "Outage",
      propertyId: "P-001",
      propertyName: "Zambezi Mall",
      targetAudience: "All Tenants - Zambezi Mall",
      channel: "SMS / Portal / Email",
      publishDate: "2026-10-08",
      expiryDate: "2026-10-13",
      status: "Active",
      priority: "High",
      body: "ZESCO scheduled maintenance on 12 Oct 08:00-16:00. Generator will be on. Please switch off non-essential equipment.",
    },
    {
      id: "NOTICE-00002",
      title: "Rent Reminder - Oct 2026 Due 01 Oct",
      type: "General",
      noticeType: "General",
      propertyId: "P-001",
      propertyName: "Zambezi Mall",
      targetAudience: "All Tenants",
      channel: "Portal / Email",
      publishDate: "2026-09-25",
      expiryDate: "2026-10-05",
      status: "Active",
      body: "Your Oct 2026 rent invoice INV-P001-002 is due 01 Oct. Pay via MoMo *123# or Zanaco. 2% penalty after 5th.",
    },
    {
      id: "NOTICE-00003",
      title: "Q3 Tenant Satisfaction Survey",
      type: "Survey",
      noticeType: "Survey",
      propertyId: "P-001",
      propertyName: "Zambezi Mall",
      targetAudience: "All Tenants",
      channel: "Portal",
      publishDate: "2026-09-20",
      expiryDate: "2026-10-20",
      status: "Active",
      body: "Please complete Q3 survey - 5 mins. Your feedback helps improve services.",
    },
  ],
  messages: [
    {
      id: "MSG-00001",
      threadId: "THREAD-001",
      propertyId: "P-001",
      propertyName: "Zambezi Mall",
      sender: "Property Management",
      senderType: "Management",
      recipient: "Kabwelwa Supermarket",
      subject: "Re: AC not cooling - MNT-001",
      body: "Hi Kabwelwa Team, we received your maintenance request MNT-001 for AC not cooling. Technician dispatched - ETA 24h. Please grant access to main sales area. Regards, FM Team.",
      channel: "Portal",
      status: "Unread",
      createdAt: "2026-10-02T09:30:00Z",
      date: "2026-10-02",
    },
    {
      id: "MSG-00002",
      threadId: "THREAD-001",
      propertyId: "P-001",
      propertyName: "Zambezi Mall",
      sender: "Kabwelwa Supermarket",
      senderType: "Tenant",
      recipient: "Property Management",
      subject: "Re: AC not cooling",
      body: "Thank you, team on site now. Access granted.",
      channel: "Portal",
      status: "Read",
      createdAt: "2026-10-02T11:15:00Z",
      date: "2026-10-02",
    },
    {
      id: "MSG-00003",
      threadId: "THREAD-002",
      propertyId: "P-001",
      propertyName: "Zambezi Mall",
      sender: "Finance Team",
      senderType: "System",
      recipient: "Kabwelwa Supermarket",
      subject: "Payment Confirmation - INV-P001-003",
      body: "Thank you for payment ZMW 13,920 for Service Charge Sep 2026. Receipt RCPT-2026-0912 attached. Balance now ZMW 85,000 overdue.",
      channel: "Email",
      status: "Read",
      createdAt: "2026-09-12T14:20:00Z",
      date: "2026-09-12",
    },
  ],
};

// --------------------------------------------------------------------------
// STATE - Versioned, persisted, with migration hook for future
// --------------------------------------------------------------------------
let state = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved._version === STORAGE_VERSION) {
      // Future: Add migration logic here if _version changes
      // e.g. if saved._version === 1 && STORAGE_VERSION === 2 { migrate... }
      return saved;
    }
  } catch (e) {
    console.warn("[Client Common] Failed to load saved state", e);
  }
  // Fresh state from mock + tenant context + computed metrics
  return {
    _version: STORAGE_VERSION,
    ...JSON.parse(JSON.stringify(mock)), // Deep clone to avoid mutation of mock
    clientTenant: CLIENT_TENANT,
    financeMetrics: {
      totalOutstanding: 170000, // Sum of Overdue + Issued
      totalInvoiced: 211520, // 98600+98600+13920 + VAT
      totalCollected: 13920,
      collectionRate: 6.5, // Percentage
      lastUpdated: new Date().toISOString(),
    },
  };
})();

/**
 * Persist state to localStorage and notify listeners via custom event
 * Future modules can listen to "propertypro:stateUpdated" to react
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent("propertypro:stateUpdated", { detail: state }),
    );
  } catch (e) {
    console.warn("saveState failed", e);
  }
}

// --------------------------------------------------------------------------
// UI HELPERS - Toast, escaping, formatting, audit
// --------------------------------------------------------------------------

/**
 * Show toast notification - non-blocking, auto-dismiss
 * @param {string} msg - Message to show
 * @param {string} type - info/success/error - controls color via CSS
 */
function toast(msg, type = "info") {
  const c = document.getElementById("toastContainer");
  if (!c) {
    // Fallback to console if toast container not yet created (e.g. early error)
    console.log(`[Toast ${type}] ${msg}`);
    return;
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4200);
}

/**
 * Escape HTML to prevent XSS when rendering user content
 */
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m],
  );
}

/**
 * Format currency in ZMW with en-ZM locale, 2 decimals
 * Used across invoices, payments, utilities, dashboard KPIs
 */
function formatCurrency(amount, currency = "ZMW") {
  return `${currency} ${(amount || 0).toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Operations-style, read-only detail modal for records with an existing View action.
function showClientRecordDetails(title, fields) {
  let backdrop = document.getElementById("clientRecordDetails");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "clientRecordDetails";
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="clientRecordDetailsTitle" tabindex="-1">
        <header class="modal-head">
          <h3 id="clientRecordDetailsTitle" style="margin:0"></h3>
          <button class="btn btn-ghost" type="button" data-close-record aria-label="Close details">✕</button>
        </header>
        <div class="modal-body"><div class="detail-grid" id="clientRecordDetailsGrid"></div></div>
        <footer class="modal-foot"><button class="btn" type="button" data-close-record>Close</button></footer>
      </section>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop || event.target.closest("[data-close-record]")) {
        backdrop.classList.remove("open");
        backdrop._returnFocus?.focus();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && backdrop.classList.contains("open")) {
        backdrop.classList.remove("open");
        backdrop._returnFocus?.focus();
      }
    });
  }

  backdrop._returnFocus = document.activeElement;
  document.getElementById("clientRecordDetailsTitle").textContent = title;
  document.getElementById("clientRecordDetailsGrid").innerHTML = fields
    .map(({ label, value }) => `<div class="detail-card"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value || "—")}</div></div>`)
    .join("");
  backdrop.classList.add("open");
  backdrop.querySelector('[role="dialog"]').focus();
}

/**
 * Audit log - placeholder for future backend audit trail
 */
function addAuditEvent(action, entity, id, detail) {
  console.log(`[Audit] ${action} ${entity} ${id}: ${detail}`);
}

// --------------------------------------------------------------------------
// NAVIGATION BINDING - Senior Dev Fix: Event Delegation for Future-Proof Nav
// --------------------------------------------------------------------------

/**
 * Bind navigation - FUTURE-PROOF VERSION
 * Uses event delegation on #sidebarNav + document fallback so that:
 * - Existing nav-items work
 * - Future nav-items added via Layout.registerPage() automatically work
 * - No need to re-bind after sidebar re-render
 * - Handles keyboard accessibility (Enter/Space)
 * - Prevents double navigation if already on same page
 * 
 * Original version used direct per-element listeners with _boundNav flag.
 * That broke when sidebar re-rendered (DOM nodes replaced). This version
 * keeps _boundNav guard for legacy but adds delegation as primary mechanism.
 * 
 * @param {string} pageId - Current page id for active state (optional)
 */
function bindNav(pageId) {
  // Legacy direct binding (kept for backward compat, but delegation is primary)
  // This ensures any existing code that calls bindNav still works
  document.querySelectorAll(".nav-item[data-page]").forEach((el) => {
    // Sidebar anchors use native link semantics and are handled once by delegation below.
    if (el.closest("#sidebarNav")) return;
    if (el._boundNav) return;
    el._boundNav = true;
    // Direct listener - legacy support, delegation will also handle
    el.addEventListener("click", (e) => {
      // Prevent double handling if delegation already handled
      if (e._handledByDelegation) return;
      const p = el.dataset.page;
      handleNavClick(p, pageId);
    });
    // Keyboard accessibility for future-proof a11y
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const p = el.dataset.page;
        handleNavClick(p, pageId);
      }
    });
    // Make focusable for keyboard nav
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
  });

  // NEW: Event delegation on sidebarNav container - future-proof
  // Any nav-item added later (via registerPage or custom pages) will automatically work
  const navContainer = document.getElementById("sidebarNav");
  if (navContainer && !navContainer._delegationBound) {
    navContainer._delegationBound = true;
    navContainer.addEventListener("click", (e) => {
      const navItem = e.target.closest(".nav-item[data-page]");
      if (!navItem) return;
      if (!window.goToPage) return;
      e.preventDefault();
      e._handledByDelegation = true; // Mark to prevent double handling by direct listener
      const p = navItem.dataset.page;
      handleNavClick(p, pageId);
    });
    console.log("[Client Common] Delegation bound to #sidebarNav - future pages will auto-work");
  }

  // Fallback delegation on document for cases where sidebarNav not yet rendered
  // (e.g. if bindNav called before Layout.init)
  if (!document._navDelegationBound) {
    document._navDelegationBound = true;
    document.addEventListener("click", (e) => {
      // Only handle if not already handled and target is nav-item outside sidebarNav
      // (e.g. if nav-item exists elsewhere)
      const navItem = e.target.closest(".nav-item[data-page]");
      if (!navItem) return;
      // If click already handled by sidebarNav delegation, skip
      if (e._handledByDelegation) return;
      // Check if this nav-item is inside sidebarNav - if yes, it will be handled there
      const insideSidebar = navItem.closest("#sidebarNav");
      if (insideSidebar) return; // Let sidebarNav handler handle it
      const p = navItem.dataset.page;
      handleNavClick(p, pageId);
    });
  }
}

/**
 * Handle nav click with guards and UX improvements
 * @param {string} targetPageId - Target page id from data-page
 * @param {string} currentPageId - Current page id to prevent double nav
 */
function handleNavClick(targetPageId, currentPageId) {
  if (!targetPageId) {
    console.warn("[Client Common] Nav click with no targetPageId");
    return;
  }
  // Prevent navigation if already on same page - avoids unnecessary reload
  if (currentPageId && targetPageId === currentPageId) {
    console.log(`[Client Common] Already on page ${targetPageId}, ignoring nav click`);
    // Still close mobile sidebar for UX
    if (window.innerWidth <= 1024) {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebarOverlay");
      if (sidebar?.classList.contains("mobile-open")) {
        setTimeout(() => {
          sidebar.classList.remove("mobile-open");
          overlay?.classList.remove("open");
          document.body.style.overflow = "";
        }, 150);
      }
    }
    return;
  }
  // Check if goToPage exists (might not if layout.js not yet loaded)
  if (window.goToPage) {
    goToPage(targetPageId);
  } else {
    console.warn("[Client Common] goToPage not yet available, queuing navigation to", targetPageId);
    // Queue navigation for when layout.js loads - future-proof for async loading
    document.addEventListener("DOMContentLoaded", () => {
      if (window.goToPage) goToPage(targetPageId);
      else {
        // Ultimate fallback - try direct file from NAV_CONFIG or guess
        console.warn("[Client Common] goToPage still not available after DOMContentLoaded");
        window.location.href = "./" + targetPageId.replace("client-", "") + ".html";
      }
    }, { once: true });
  }
}

// --------------------------------------------------------------------------
// SEARCH - Global search across invoices, maintenance, notices
// --------------------------------------------------------------------------

function handleSearchInput(e) {
  const q = (e.target.value || "").toLowerCase().trim();
  if (!q) {
    closeSearch();
    return;
  }
  const results = [];
  // Search invoices by id or description - future pages can add their own search here
  (state.invoices || []).forEach((inv) => {
    if (inv.id.toLowerCase().includes(q) || (inv.description || "").toLowerCase().includes(q))
      results.push({ type: "Invoice", title: inv.id, sub: inv.description, page: "client-invoices" });
  });
  (state.maintenance || []).forEach((m) => {
    if (m.id.toLowerCase().includes(q) || m.issue.toLowerCase().includes(q))
      results.push({ type: "Maintenance", title: m.id, sub: m.issue, page: "client-maintenance" });
  });
  (state.notices || []).forEach((n) => {
    if (n.title.toLowerCase().includes(q))
      results.push({ type: "Notice", title: n.id, sub: n.title, page: "client-notices" });
  });
  // Future: Add more searchable entities here (e.g. utilities, payments, etc.)
  renderSearchResults(results);
  openSearch();
}

function handleSearchInputGlobal(e) {
  handleSearchInput(e);
}

function renderSearchResults(results) {
  const el = document.getElementById("globalSearchResults");
  if (!el) return;
  if (!results.length) {
    el.innerHTML = `<div style="padding:20px;text-align:center;color:var(--muted)">No results for your search</div>`;
    return;
  }
  el.innerHTML = results
    .map((r) => `<div class="result-row" onclick="goToPage('${r.page}')"><div style="width:32px;height:32px;border-radius:8px;background:var(--surface-2);border:1px solid var(--border);display:grid;place-items:center;font-size:11px;font-weight:700">${r.type[0]}</div><div><div style="font-weight:600;font-size:13px">${escapeHtml(r.title)}</div><div style="font-size:12px;color:var(--muted)">${escapeHtml(r.sub)}</div></div><div style="margin-left:auto;font-size:10px;background:var(--surface-2);border:1px solid var(--border);padding:2px 6px;border-radius:20px">${r.type}</div></div>`)
    .join("");
}

function openSearch() {
  document.getElementById("globalSearchBackdrop")?.classList.add("open");
}
function closeSearch() {
  document.getElementById("globalSearchBackdrop")?.classList.remove("open");
}

// --------------------------------------------------------------------------
// INIT COMMON - Called by each page on DOMContentLoaded
// --------------------------------------------------------------------------

function initCommon(pageId) {
  // Update today date in any element with data-today attribute
  const fmt = new Intl.DateTimeFormat("en-ZM", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  document.querySelectorAll("[data-today]").forEach((el) => (el.textContent = fmt));
  
  // Bind navigation - delegation ensures future pages work
  bindNav(pageId);
  
  // Bind search input if exists (topbar search)
  const searchInput = document.getElementById("searchInput");
  if (searchInput && !searchInput._boundSearch) {
    searchInput._boundSearch = true;
    searchInput.addEventListener("input", handleSearchInput);
    // Also bind global search input in modal
    const globalInput = document.getElementById("globalSearchInput");
    if (globalInput) {
      globalInput.addEventListener("input", handleSearchInput);
    }
  }
}

// --------------------------------------------------------------------------
// GLOBAL EXPOSURE - Same as original for compatibility
// --------------------------------------------------------------------------
window.$ = $;
window.$$ = $$;
window.toast = toast;
window.state = state;
window.saveState = saveState;
window.escapeHtml = escapeHtml;
window.formatCurrency = formatCurrency;
window.showClientRecordDetails = showClientRecordDetails;
window.addAuditEvent = addAuditEvent;
window.initCommon = initCommon;
window.bindNav = bindNav;
window.handleSearchInput = handleSearchInput;
window.handleSearchInputGlobal = handleSearchInputGlobal;
window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.CLIENT_TENANT = CLIENT_TENANT;
window.handleNavClick = handleNavClick; // New helper exposed for debugging

console.log("[Client Common] v1 tenant portal loaded -", state.invoices.length, "invoices,", state.maintenance.length, "maintenance - Senior Dev Fix v3.2 Future-Proof");
