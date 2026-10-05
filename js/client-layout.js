/**
 * ============================================================================
 * PropertyPro Zambia Ltd - Client Portal Layout Engine
 * File: js/client-layout.js - Senior Developer Navigation Fix v3.2
 * Original: Converted from company dashboard layout.js (admin) to tenant
 *           self-service - same engine, same styling, same behavior
 * Fix Date: 2026-10-05
 * Author: Senior Frontend Engineer (Original Dashboard Designer)
 *
 * PURPOSE:
 *   Central navigation and layout engine for Tenant Portal (Client Side).
 *   Renders sidebar, topbar, breadcrumb, handles navigation between pages,
 *   manages responsive mobile behavior, search, notifications, and future
 *   page registration.
 *
 * NAVIGATION FIX APPLIED - WHY THIS FILE WAS BROKEN BEFORE:
 *   Issue 1: Inconsistent asset paths - index.html used "./css/" "./js/" while
 *            Nested pages need "../css/" and "../js/" paths while the root
 *            dashboard uses "./css/" and "./js/". All navigation destinations
 *            now use app-root-relative paths.
 *   Issue 2: bindNav() used direct per-element listeners with _boundNav flag.
 *            When NAV_CONFIG grows (future pages) or sidebar re-renders,
 *            old listeners detached, new items had no navigation. Fixed with
 *            event delegation + _boundNav guard + re-bind on every render.
 *   Issue 3: No validation for NAV_CONFIG entries. Adding a page with missing
 *            id/file would crash renderSidebar() or goToPage(). Now we validate,
 *            deduplicate by id, skip invalid entries gracefully with console.warn
 *            + toast, portal stays usable.
 *   Issue 4: Custom pages feature was half-implemented - STORAGE_KEYS.customPages
 *            existed but never read. Now loadCustomPages() merges localStorage
 *            saved pages into NAV_CONFIG automatically (future-proof).
 *   Issue 5: goToPage() resolves page files from the app root, regardless of
 *            whether navigation starts on index.html or inside /pages.
 *
 * FUTURE-PROOF DESIGN (Senior Dev Intent):
 *   - NAV_CONFIG is SINGLE SOURCE OF TRUTH. Add new page here and sidebar
 *     instantly shows it, navigation works, active state + breadcrumb auto.
 *   - Public API: Layout.registerPage(config) / unregisterPage(id) /
 *     getNavConfig() / refreshSidebar() - lets other modules or runtime code
 *     add pages without touching this file (e.g. plugin system).
 *   - Deduplication by id prevents duplicate nav items if same page registered twice.
 *   - Section grouping preserved - new sections auto-render as nav-section-title.
 *   - localStorage persistence for collapsed state + custom pages + scrollTop
 *     ensures UX survives reloads.
 *   - Error boundaries: invalid entries skipped, missing file shows toast
 *     instead of white screen.
 *
 * HOW TO ADD NEW PAGE (For Future Devs):
 *   1. Create pages/reports.html (use an existing page as a template)
 *   2. In this file NAV_CONFIG push:
 *      { id: 'client-reports', section: 'Finance', label: 'My Reports',
 *        file: 'pages/reports.html', icon: ICONS.billing, badge: 'New' }
 *   3. Or dynamically: Layout.registerPage({ id: 'client-reports', ... })
 *   4. Call Layout.init({ currentPage: 'client-reports' }) in new page's DOMContentLoaded
 *   5. Done - navigation, active state, breadcrumb, mobile close all work.
 *
 * DEBUGGING:
 *   - Console log "[Client Layout] Loaded - X pages" confirms count
 *   - localStorage: propertypro_client_sidebar_collapsed (0/1), 
 *     propertypro_client_custom_pages (JSON array), 
 *     propertypro_client_sidebar_nav_scroll_top
 *   - Check #app-sidebar, #app-topbar, #app-breadcrumb exist in HTML
 *   - If nav-item click does nothing: check window.goToPage exists, check
 *     data-page attribute matches NAV_CONFIG id, check console for warn
 *   - Search: Ctrl+K / Cmd+K opens #globalSearchBackdrop
 *
 * DEPENDENCIES:
 *   - css/common.css: root vars --sidebar-w 280px, --sidebar-collapsed 72px
 *   - css/layout.css: .sidebar gradient #0B1E35, .topbar 64px, .app flex
 *   - js/client-common.js: state, toast(), formatCurrency(), bindNav()
 * ============================================================================
 */

(function (global) {
  // --------------------------------------------------------------------------
  // STORAGE KEYS - Persisted UI state for better UX across reloads
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    collapsed: "propertypro_client_sidebar_collapsed", // 0 = expanded, 1 = collapsed (desktop)
    customPages: "propertypro_client_custom_pages", // JSON array of custom NAV_CONFIG entries added via registerPage()
    navScrollTop: "propertypro_client_sidebar_nav_scroll_top", // Preserve sidebar scroll position
    lastPage: "propertypro_client_last_page", // Last visited page id for restoring
  };
  // Resolve page files from the app root, regardless of whether this script is loaded by index.html or a page in /pages.
  const layoutScript = document.currentScript;
  const APP_BASE_URL = layoutScript && layoutScript.src
    ? new URL("../", layoutScript.src)
    : new URL(window.location.pathname.includes("/pages/") ? "../" : "./", window.location.href);

  // --------------------------------------------------------------------------
  // ICONS - SVG icons for nav items, same design system as admin dashboard
  // --------------------------------------------------------------------------
  const ICONS = {
    home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1V9.5z"/></svg>`,
    lease: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`,
    billing: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`,
    payments: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>`,
    maintenance: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-3.8 3.8z"/><path d="M3 6l4 4"/><path d="M3 10l4 4"/></svg>`,
    notices: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18 8A6 6 0 0 0 6 8c0 7-6 9-6 9h18s-6-2-6-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
    messages: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>`,
    settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/></svg>`,
    utilities: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    investment: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 3v18h18"/><path d="M7 16l4-4 3 3 5-6"/><circle cx="18" cy="9" r="1"/></svg>`,
    portfolio: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    asset: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
    deal: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>`,
    risk: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M12 22V12"/><path d="M20 14.5a2.5 2.5 0 0 1-5 0V9h5v5.5z"/></svg>`,
    compliance: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
    performance: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    report: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    cash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>`,
    integration: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    valuation: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><path d="M8 6v12"/><path d="M14 6v12"/></svg>`,
  };

  // --------------------------------------------------------------------------
  // NAV_CONFIG - Single Source of Truth for all navigation - Extended with Investment Management
  // --------------------------------------------------------------------------
  const DEFAULT_NAV_CONFIG = [
    { id: "s-overview", section: "Overview", label: "Section:Overview", isSection: true },
    { id: "client-dashboard", section: "Overview", label: "My Dashboard", file: "index.html", icon: ICONS.home },
    { id: "investment-dashboard", section: "Overview", label: "Investment Dashboard", file: "pages/investment-dashboard.html", icon: ICONS.investment, badge: "New" },

    { id: "s-tenancy", section: "My Tenancy", label: "Section:My Tenancy", isSection: true },
    { id: "client-lease", section: "My Tenancy", label: "My Lease", file: "pages/lease.html", icon: ICONS.lease },
    { id: "client-unit", section: "My Tenancy", label: "My Unit & Property", file: "pages/unit.html", icon: ICONS.grid },
    { id: "investment-portfolios", section: "My Tenancy", label: "Portfolios", file: "pages/investment-portfolios.html", icon: ICONS.portfolio },
    { id: "investment-performance", section: "My Tenancy", label: "Performance Dashboard", file: "pages/investment-performance.html", icon: ICONS.performance },
    { id: "investment-benchmarks", section: "My Tenancy", label: "Benchmarks", file: "pages/investment-benchmarks.html", icon: ICONS.valuation },

    { id: "s-investment", section: "Investment Management", label: "Section:Investment Management", isSection: true },
    { id: "investment-board", section: "Investment Management", label: "Board Dashboard", file: "pages/investment-board.html", icon: ICONS.grid },
    { id: "investment-asset-register", section: "Investment Management", label: "Asset Register", file: "pages/investment-asset-register.html", icon: ICONS.asset },
    { id: "investment-allocation", section: "Investment Management", label: "Asset Allocation", file: "pages/investment-allocation.html", icon: ICONS.grid },
    { id: "investment-fixed-income", section: "Investment Management", label: "Fixed Income", file: "pages/investment-fixed-income.html", icon: ICONS.cash },
    { id: "investment-equities", section: "Investment Management", label: "Listed Equities", file: "pages/investment-equities.html", icon: ICONS.performance },
    { id: "investment-unlisted", section: "Investment Management", label: "Unlisted / SPVs", file: "pages/investment-unlisted.html", icon: ICONS.asset },
    { id: "investment-cis", section: "Investment Management", label: "CIS", file: "pages/investment-cis.html", icon: ICONS.portfolio },
    { id: "investment-cash", section: "Investment Management", label: "Cash & Banks", file: "pages/investment-cash.html", icon: ICONS.cash },
    { id: "investment-compliance", section: "Investment Management", label: "Compliance Monitor", file: "pages/investment-compliance.html", icon: ICONS.compliance, badge: "7" },
    { id: "investment-risk", section: "Investment Management", label: "Risk Dashboard", file: "pages/investment-risk.html", icon: ICONS.risk },
    { id: "investment-reports", section: "Investment Management", label: "Reports & Board Pack", file: "pages/investment-reports.html", icon: ICONS.report },

    { id: "s-property-invest", section: "Property Investments", label: "Section:Property Investments", isSection: true },
    { id: "property-investment-detail", section: "Property Investments", label: "Property Details", file: "pages/property-investment-detail.html", icon: ICONS.valuation },
    { id: "investment-property", section: "Property Investments", label: "Property Investments", file: "pages/investment-property.html", icon: ICONS.home, badge: "7" },
    { id: "client-maintenance", section: "Property Investments", label: "Maintenance Requests", file: "pages/maintenance.html", icon: ICONS.maintenance, badge: "7" },

    { id: "s-deals", section: "Deal Management", label: "Section:Deal Management", isSection: true },
    { id: "investment-deals", section: "Deal Management", label: "Deal Pipeline", file: "pages/investment-deals.html", icon: ICONS.deal },
    { id: "investment-appraisal", section: "Deal Management", label: "Appraisal Workspace", file: "pages/investment-appraisal.html", icon: ICONS.valuation },
    { id: "investment-cp", section: "Deal Management", label: "Conditions Precedent", file: "pages/investment-cp.html", icon: ICONS.billing },
    { id: "investment-approvals", section: "Deal Management", label: "Approvals", file: "pages/investment-approvals.html", icon: ICONS.compliance },

    { id: "s-finance", section: "Finance", label: "Section:Finance", isSection: true },
    { id: "client-payments", section: "Finance", label: "Payments & Receipts", file: "pages/payments.html", icon: ICONS.payments },
    { id: "client-invoices", section: "Finance", label: "Invoices & Statements", file: "pages/invoices.html", icon: ICONS.billing, badge: "7" },
    { id: "client-utilities", section: "Finance", label: "Utilities & Meters", file: "pages/utilities.html", icon: ICONS.utilities },

    { id: "s-integration", section: "Integration", label: "Section:Integration", isSection: true },
    { id: "investment-development", section: "Integration", label: "Development Projects", file: "pages/investment-development.html", icon: ICONS.grid },
    { id: "investment-documents", section: "Integration", label: "Documents", file: "pages/investment-documents.html", icon: ICONS.billing },
    { id: "investment-audit", section: "Integration", label: "Audit Trail", file: "pages/investment-audit.html", icon: ICONS.report },
    { id: "investment-erp", section: "Integration", label: "ERPNext Integration", file: "pages/investment-erp.html", icon: ICONS.integration },
    { id: "property-integration", section: "Integration", label: "Property ↔ Investment", file: "pages/property-integration.html", icon: ICONS.integration },
    { id: "client-notices", section: "Integration", label: "Notices & Alerts", file: "pages/notices.html", icon: ICONS.notices, badge: "7" },
    { id: "client-messages", section: "Integration", label: "Messages & Support", file: "pages/messages.html", icon: ICONS.messages, badge: "7" },
    { id: "client-profile", section: "Integration", label: "My Profile", file: "pages/profile.html", icon: ICONS.users },
    { id: "client-settings", section: "Integration", label: "Settings", file: "pages/settings.html", icon: ICONS.settings },
  ];
  const NAV_CONFIG = [...DEFAULT_NAV_CONFIG];

  // --------------------------------------------------------------------------
  // FUTURE-PROOF HELPERS
  // --------------------------------------------------------------------------
  function loadCustomPages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.customPages);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(validateNavEntry);
    } catch (e) {
      console.warn("[Client Layout] Failed to load custom pages", e);
      return [];
    }
  }

  function saveCustomPages(pages) {
    try {
      localStorage.setItem(STORAGE_KEYS.customPages, JSON.stringify(pages));
    } catch (e) {
      console.warn("[Client Layout] Failed to save custom pages", e);
    }
  }

  function validateNavEntry(entry) {
    if (!entry || typeof entry !== "object") return false;
    if (!entry.id || typeof entry.id !== "string") return false;
    if (entry.isSection) return !!entry.section;
    return !!entry.label && typeof entry.file === "string" && !!entry.file.trim();
  }

  function deduplicateNavConfig(config) {
    const seen = new Map();
    config.forEach((entry) => {
      if (validateNavEntry(entry)) seen.set(entry.id, entry);
    });
    const result = [];
    const added = new Set();
    config.forEach((entry) => {
      if (!added.has(entry.id) && seen.has(entry.id)) {
        result.push(seen.get(entry.id));
        added.add(entry.id);
      }
    });
    seen.forEach((entry, id) => {
      if (!added.has(id)) { result.push(entry); added.add(id); }
    });
    return result;
  }

  function mergeNavConfig() {
    const custom = loadCustomPages();
    // Rebuild from defaults so unregisterPage removes runtime entries immediately.
    const combined = deduplicateNavConfig([...DEFAULT_NAV_CONFIG, ...custom]);
    NAV_CONFIG.splice(0, NAV_CONFIG.length, ...combined);
  }

  mergeNavConfig();

  // --------------------------------------------------------------------------
  // CORE NAVIGATION HELPERS
  // --------------------------------------------------------------------------
  function getPageMeta(id) {
    if (!id) return null;
    return NAV_CONFIG.find((n) => n.id === id && !n.isSection) || null;
  }

  function guessMeta(id) {
    const exact = getPageMeta(id);
    if (exact) return exact;
    const lower = (id || "").toLowerCase();
    const partial = NAV_CONFIG.find((n) => !n.isSection && lower.includes(n.id.replace("client-", "").toLowerCase()));
    if (partial) return partial;
    return NAV_CONFIG.find((n) => n.id === "client-dashboard") || NAV_CONFIG.find((n) => !n.isSection) || null;
  }

  function resolvePath(file) {
    if (!file) return "#";
    if (file.startsWith("http") || file.startsWith("//")) return file;
    try {
      return new URL(file, APP_BASE_URL).href;
    } catch (e) {
      console.warn("[Client Layout] Could not resolve page path:", file, e);
      return "#";
    }
  }

  function goToPage(id) {
    const meta = getPageMeta(id) || guessMeta(id);
    if (!meta) {
      console.warn("[Client Layout] No navigation entry for", id);
      if (window.toast) toast(`Page "${id}" not found`, "error");
      return;
    }
    if (!meta.file) {
      console.warn("[Client Layout] Entry has no file:", meta);
      if (window.toast) toast(`Page "${meta.label}" is not yet available`, "info");
      return;
    }
    try { localStorage.setItem(STORAGE_KEYS.lastPage, id); } catch (e) {}
    const target = resolvePath(meta.file);
    console.log(`[Client Layout] Navigating: ${id} -> ${meta.file} -> ${target}`);
    location.href = target;
  }

  // --------------------------------------------------------------------------
  // RENDERING
  // --------------------------------------------------------------------------
  function renderSidebar(container, currentPage) {
    if (!container) { console.warn("[Client Layout] renderSidebar: container missing"); return; }
    mergeNavConfig();
    let html = `
      <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="brand-mark">PP</div>
          <div class="brand-text"><strong>PropertyPro</strong><span>Tenant Portal • ZM</span></div>
          <button class="icon-btn collapse-btn" id="btnCollapseSidebar" title="Collapse sidebar (desktop)" style="margin-left:auto;width:28px;height:28px;border:1px solid #1C3A5F;background:rgba(255,255,255,.06);border-radius:7px;display:grid;place-items:center;color:#7B92B2;cursor:pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        </div>
        <div class="nav" id="sidebarNav">`;
    let currentSection = null;
    NAV_CONFIG.forEach((item) => {
      if (!validateNavEntry(item)) { console.warn("[Client Layout] Skipping invalid nav entry", item); return; }
      if (item.hidden) return;
      if (item.isSection) {
        html += `<div class="nav-section-title">${item.section}</div>`;
        currentSection = item.section; return;
      }
      const active = currentPage === item.id ? "active" : "";
      const href = item.file ? resolvePath(item.file) : "#";
      html += `<a class="nav-item ${active}" href="${href}" data-page="${item.id}" data-file="${item.file || ''}" data-section="${item.section || currentSection || ''}" title="${item.label}"${active ? ' aria-current="page"' : ""}>
                 <span class="ico">${item.icon || ""}</span>
                 <span class="nav-label">${item.label}</span>
                 ${item.badge ? `<span class="badge">${item.badge}</span>` : ""}
               </a>`;
    });
    html += `</div>
        <div class="sidebar-footer">
          <div class="portfolio-summary">
            <div class="label">My Tenancy • Kabwelwa Supermarket</div>
            <div class="vals"><div><strong>Zambezi Mall</strong><span>Unit 12 • Lusaka</span></div><div><strong>ZMW 85K</strong><span>Monthly • Active</span></div></div>
            <div style="margin-top:10px;background:rgba(255,255,255,.06);border:1px solid #1C3A5F;border-radius:8px;padding:8px 10px;display:flex;gap:8px;align-items:center">
              <div style="width:28px;height:28px;border-radius:50%;background:#EFF6FF;color:#1D4ED8;display:grid;place-items:center;font-weight:800;font-size:11px">KS</div>
              <div style="line-height:1.1"><div style="font-size:12px;color:#F1F5F9;font-weight:700">Kabwelwa Supermarket</div><div style="font-size:10px;color:#7B92B2">T-1042 • Tenant • *123#</div></div>
              <span style="margin-left:auto;background:#16A34A;color:#FFF;font-size:10px;padding:2px 6px;border-radius:20px;font-weight:700">Online</span>
            </div>
            <div style="margin-top:8px;background:#FFFBEB;border:1px dashed #FDE68A;border-radius:8px;padding:8px 10px"><div style="font-size:10px;font-weight:700;color:#92400E">USSD • No Internet? Dial</div><div style="font-size:13px;font-weight:800;color:#0F172A">*123*4*1# • Balance • Pay</div></div>
          </div>
        </div>
      </div>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>`;
    container.innerHTML = html;
    try {
      const savedScroll = localStorage.getItem(STORAGE_KEYS.navScrollTop);
      if (savedScroll) {
        const navEl = document.getElementById("sidebarNav");
        if (navEl) navEl.scrollTop = parseInt(savedScroll, 10) || 0;
      }
    } catch (e) {}
    try {
      const collapsed = localStorage.getItem(STORAGE_KEYS.collapsed);
      const sidebarEl = document.getElementById("sidebar");
      if (collapsed === "1" && sidebarEl && window.innerWidth > 1024) sidebarEl.classList.add("collapsed");
    } catch (e) {}
  }

  function renderTopbar(container, currentPage) {
    if (!container) return;
    container.innerHTML = `
      <div class="topbar">
        <button class="icon-btn" id="btnToggleSidebar" title="Open menu (mobile)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
        <button class="icon-btn" id="btnCollapseSidebar" title="Collapse sidebar (desktop)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><path d="M9 12H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4"/><path d="M15 12h4a2 2 0 0 0 2 2v4a2 2 0 0 0-2 2h-4"/></svg></button>
        <div class="search-wrap" id="topSearchWrap"><span class="search-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg></span><input id="searchInput" placeholder="Search my lease, invoices, maintenance..." autocomplete="off" /><kbd>Ctrl K</kbd></div>
        <div class="topbar-right" style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <div style="position:relative">
            <button class="icon-btn" id="btnNotif" type="button" title="Notifications" aria-label="Open notifications" aria-expanded="false" aria-controls="notifPanel"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18 8A6 6 0 0 0 6 8c0 7-6 9-6 9h18s-6-2-6-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><span id="notifCount" style="position:absolute;top:-4px;right:-4px;background:#DC2626;color:#FFF;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:20px;display:grid;place-items:center;padding:0 4px">0</span></button>
            <div class="notif-panel" id="notifPanel" aria-label="Notifications"><div class="notif-head"><strong>Notifications</strong><button class="btn btn-sm" id="btnNotifClose" type="button" aria-label="Close notifications">✕</button></div><div class="notif-body" id="notifBody"></div><div class="notif-foot"><button class="btn btn-sm" style="flex:1" onclick="goToPage('client-notices')">View all notices</button></div></div>
          </div>
          <button class="icon-btn" id="btnSearchOpen" title="Search (Ctrl+K)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg></button>
          <div class="avatar" title="Kabwelwa Supermarket T-1042">KS</div>
        </div>
      </div>`;
  }

  function autoBreadcrumbs(currentPage) {
    const meta = getPageMeta(currentPage) || guessMeta(currentPage);
    if (!meta) return [{ label: "Home", href: resolvePath("index.html") }, { label: "My Dashboard", href: resolvePath("index.html") }];
    return [
      { label: "Home", href: resolvePath("index.html") },
      { label: meta.section, href: resolvePath(meta.file || "index.html") },
      { label: meta.label, href: resolvePath(meta.file) },
    ];
  }

  function renderBreadcrumb(container, crumbs) {
    if (!container) return;
    container.innerHTML = `<div class="breadcrumb">${crumbs.map((c, i) => (i === crumbs.length - 1 ? `<b>${c.label}</b>` : `<a href="${c.href}">${c.label}</a><span class="sep">›</span>`)).join("")}</div>`;
  }

  function openSearchFallback() {
    document.getElementById("globalSearchBackdrop")?.classList.add("open");
    setTimeout(() => document.getElementById("globalSearchInput")?.focus(), 100);
  }

  function closeSearch() {
    document.getElementById("globalSearchBackdrop")?.classList.remove("open");
  }

  function ensureGlobalElements() {
    if (!document.getElementById("toastContainer")) {
      const tc = document.createElement("div"); tc.id = "toastContainer"; tc.className = "toast-container"; document.body.appendChild(tc);
    }
    if (!document.getElementById("globalSearchBackdrop")) {
      const bd = document.createElement("div"); bd.id = "globalSearchBackdrop"; bd.className = "modal-backdrop";
      bd.innerHTML = `<div class="modal"><div class="modal-head"><div style="display:flex;align-items:center;gap:10px;flex:1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.8"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg><input id="globalSearchInput" placeholder="Search my lease, invoices, maintenance..." style="flex:1;border:0;outline:0;font-size:14px" autofocus /></div><button class="btn btn-ghost" onclick="document.getElementById('globalSearchBackdrop').classList.remove('open')">Esc</button></div><div class="modal-body"><div class="small muted" style="margin-bottom:8px">Try: Lease L-2026-001, INV-, MNT-, Zambezi</div><div id="globalSearchResults"></div></div></div>`;
      document.body.appendChild(bd);
    }
  }

  // Keep the shared topbar notification control working on every client page.
  function bindNotifications() {
    if (document._clientNotificationsBound) return;
    document._clientNotificationsBound = true;
    function renderNotifications() {
      const activeNotices = (global.state?.notices || []).filter((notice) => notice.status === "Active");
      const count = document.getElementById("notifCount");
      const body = document.getElementById("notifBody");
      if (count) {
        count.textContent = String(activeNotices.length);
        count.hidden = activeNotices.length === 0;
      }
      if (body) {
        body.innerHTML = activeNotices.length
          ? activeNotices.slice(0, 5).map((notice) => `
              <a class="notif-item" href="${resolvePath(getPageMeta("client-notices")?.file || "pages/notices.html")}" style="text-decoration:none;color:inherit">
                <span class="ico">📣</span>
                <span class="txt"><span class="t">${global.escapeHtml ? global.escapeHtml(notice.title) : notice.title}</span><span class="s">${global.escapeHtml ? global.escapeHtml(notice.publishDate || notice.status) : (notice.publishDate || notice.status)}</span></span>
              </a>`).join("")
          : '<div class="notif-item"><span class="txt"><span class="t">You’re all caught up</span><span class="s">There are no active notices.</span></span></div>';
      }
    }

    renderNotifications();
    global.addEventListener("propertypro:stateUpdated", renderNotifications);
    document.addEventListener("click", (event) => {
      const button = event.target.closest("#btnNotif");
      const panel = document.getElementById("notifPanel");

      if (button && panel) {
        const isOpen = panel.classList.toggle("open");
        button.setAttribute("aria-expanded", String(isOpen));
        if (!isOpen) return;
        renderNotifications();
        return;
      }

      if (event.target.closest("#btnNotifClose")) {
        if (panel) panel.classList.remove("open");
        document.getElementById("btnNotif")?.setAttribute("aria-expanded", "false");
        return;
      }

      if (panel?.classList.contains("open") && !event.target.closest("#notifPanel")) {
        panel.classList.remove("open");
        document.getElementById("btnNotif")?.setAttribute("aria-expanded", "false");
      }
    });
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Future-proof
  // --------------------------------------------------------------------------
  function registerPage(pageConfig) {
    if (!validateNavEntry(pageConfig)) { console.warn("[Client Layout] registerPage invalid config", pageConfig); if (window.toast) toast("Invalid page config", "error"); return false; }
    if (pageConfig.isSection) { console.warn("[Client Layout] Cannot register section via registerPage"); return false; }
    const custom = loadCustomPages();
    const filtered = custom.filter((p) => p.id !== pageConfig.id);
    filtered.push(pageConfig);
    saveCustomPages(filtered); mergeNavConfig(); refreshSidebar();
    console.log(`[Client Layout] Registered page ${pageConfig.id} -> ${pageConfig.file}`);
    if (window.toast) toast(`Page "${pageConfig.label}" registered`, "success");
    return true;
  }

  function unregisterPage(id) {
    const custom = loadCustomPages();
    const filtered = custom.filter((p) => p.id !== id);
    if (filtered.length === custom.length) { console.warn("[Client Layout] unregisterPage not found", id); return false; }
    saveCustomPages(filtered); mergeNavConfig(); refreshSidebar();
    console.log(`[Client Layout] Unregistered page ${id}`); return true;
  }

  function getNavConfig() { mergeNavConfig(); return [...NAV_CONFIG]; }
  function refreshSidebar() {
    const sidebarContainer = document.getElementById("app-sidebar");
    const currentPage = document.body.getAttribute("data-current-page") || window.__currentPage || "client-dashboard";
    if (sidebarContainer) {
      renderSidebar(sidebarContainer, currentPage);
      if (window.bindNav) { try { window.bindNav(currentPage); } catch (e) {} }
    }
  }

  // --------------------------------------------------------------------------
  // INIT
  // --------------------------------------------------------------------------
  function init(options) {
    options = options || {};
    const currentPage = options.currentPage || "client-dashboard";
    window.__currentPage = currentPage;
    document.body.setAttribute("data-current-page", currentPage);
    mergeNavConfig();
    const sidebarContainer = document.getElementById("app-sidebar");
    const topbarContainer = document.getElementById("app-topbar");
    const breadcrumbContainer = document.getElementById("app-breadcrumb");
    renderSidebar(sidebarContainer, currentPage);
    renderTopbar(topbarContainer, currentPage);
    renderBreadcrumb(breadcrumbContainer, options.breadcrumbs || autoBreadcrumbs(currentPage));
    ensureGlobalElements();
    bindNotifications();
    const navEl = document.getElementById("sidebarNav");
    if (navEl) {
      navEl.addEventListener("scroll", () => {
        try { localStorage.setItem(STORAGE_KEYS.navScrollTop, String(navEl.scrollTop)); } catch (e) {}
      });
    }
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearchFallback(); }
      if (e.key === "Escape") { closeSearch(); document.getElementById("notifPanel")?.classList.remove("open"); }
    });
    global.goToPage = goToPage;
    global.Layout = {
      init, goToPage, renderSidebar, renderTopbar, renderBreadcrumb,
      autoBreadcrumbs, NAV_CONFIG, getPageMeta, guessMeta, resolvePath, STORAGE_KEYS,
      registerPage, unregisterPage, getNavConfig, refreshSidebar,
    };
    console.log(`[Client Layout] Initialized - currentPage=${currentPage}, total pages=${NAV_CONFIG.filter(n=>!n.isSection).length} (including ${loadCustomPages().length} custom)`);
  }

  // --------------------------------------------------------------------------
  // GLOBAL SIDEBAR CONTROLS
  // --------------------------------------------------------------------------
  function bindGlobalSidebarControls() {
    if (window._sidebarControlsBound) return;
    window._sidebarControlsBound = true;
    function getSidebar() { return document.getElementById("sidebar") || document.querySelector(".sidebar"); }
    function getOverlay() { return document.getElementById("sidebarOverlay") || document.querySelector(".sidebar-overlay"); }
    function openMobile() { const s = getSidebar(), o = getOverlay(); if (!s) return; s.classList.add("mobile-open"); if (o) o.classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeMobile() { const s = getSidebar(), o = getOverlay(); if (s) s.classList.remove("mobile-open"); if (o) o.classList.remove("open"); document.body.style.overflow = ""; }
    function toggleMobile() { const s = getSidebar(); if (!s) return; if (s.classList.contains("mobile-open")) closeMobile(); else openMobile(); }
    document.addEventListener("click", (e) => {
      const collapseBtn = e.target.closest("#btnCollapseSidebar");
      if (collapseBtn) {
        if (window.innerWidth <= 1024) return;
        e.preventDefault(); e.stopPropagation();
        const sb = getSidebar();
        if (sb) { sb.classList.toggle("collapsed"); try { localStorage.setItem(STORAGE_KEYS.collapsed, sb.classList.contains("collapsed") ? "1" : "0"); } catch (err) {} }
        return;
      }
      const toggleBtn = e.target.closest("#btnToggleSidebar");
      if (toggleBtn) { e.preventDefault(); e.stopPropagation(); toggleMobile(); return; }
      const overlay = e.target.closest("#sidebarOverlay");
      if (overlay && overlay.classList.contains("open")) { closeMobile(); return; }
      const navItem = e.target.closest(".nav-item[data-page]");
      if (navItem && window.innerWidth <= 1024) { setTimeout(closeMobile, 150); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindGlobalSidebarControls);
  else bindGlobalSidebarControls();

  if (!global.initCommon) {
    global.initCommon = function (pageId) { init({ currentPage: pageId }); if (global.bindNav) try { global.bindNav(pageId); } catch (e) {} };
  } else {
    const orig = global.initCommon;
    global.initCommon = function (pageId) {
      try { orig(pageId); } catch (e) {}
      init({ currentPage: pageId });
      try { if (global.bindNav) global.bindNav(pageId); ensureGlobalElements(); } catch (e) {}
    };
  }

  global.Layout = {
    init, goToPage, renderSidebar, renderTopbar, renderBreadcrumb,
    autoBreadcrumbs, NAV_CONFIG, getPageMeta, guessMeta, resolvePath, STORAGE_KEYS,
    registerPage, unregisterPage, getNavConfig, refreshSidebar,
  };
  console.log("[Client Layout] Loaded -", NAV_CONFIG.length, "entries (", NAV_CONFIG.filter(n=>!n.isSection).length, "pages), tenant portal - Senior Dev Fix v3.2 Future-Proof");
})(window);
