document.addEventListener("DOMContentLoaded", () => {
  initCommon("client-maintenance");
  bindMaintenancePage();
  renderMaintenance();
});

function bindMaintenancePage() {
  const filter = document.getElementById("mntFilter");
  const search = document.getElementById("mntSearch");
  filter.addEventListener("change", renderMaintenance);
  search.addEventListener("input", renderMaintenance);
  document.getElementById("btnSubmitMnt").addEventListener("click", submitMaintenanceRequest);

  const uploadButton = document.querySelector("#newMntBackdrop .modal-body .btn-sm");
  const uploadArea = uploadButton && uploadButton.parentElement;
  if (uploadButton && uploadArea) {
    const fileInput = document.createElement("input");
    fileInput.id = "maintenancePhotoFiles";
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.hidden = true;
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 5) {
        toast("Select no more than 5 photos.", "error");
        fileInput.value = "";
        return;
      }
      uploadArea.querySelector("[data-photo-label]").textContent = fileInput.files.length
        ? `${fileInput.files.length} photo${fileInput.files.length === 1 ? "" : "s"} selected`
        : "Drag photos here or click to upload (max 5)";
    });
    uploadButton.before(fileInput);
    uploadButton.addEventListener("click", () => fileInput.click());
    const label = document.createElement("div");
    label.dataset.photoLabel = "";
    label.style.cssText = "font-size:12px;color:var(--muted);margin-top:6px";
    uploadButton.after(label);
  }
}

function renderMaintenance() {
  const records = state.maintenance || [];
  const status = document.getElementById("mntFilter").value;
  const query = document.getElementById("mntSearch").value.trim().toLowerCase();
  const visible = records.filter((item) =>
    (!status || item.status === status) &&
    (!query || [item.id, item.issue, item.category, item.status].some((value) => String(value || "").toLowerCase().includes(query)))
  );
  document.getElementById("mntCount").textContent = String(visible.length);
  document.getElementById("mntKpiGrid").innerHTML = [
    ["Total Requests", records.length],
    ["Open", records.filter((item) => item.status === "Open").length],
    ["In Progress", records.filter((item) => item.status === "In Progress").length],
    ["Resolved", records.filter((item) => item.status === "Resolved").length],
  ].map(([label, value]) => `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`).join("");

  const tbody = document.querySelector("#mntTable tbody");
  tbody.innerHTML = visible.map((item) => `<tr>
    <td><b>${escapeHtml(item.id)}</b></td><td>${escapeHtml(item.createdAt || "")}</td>
    <td>${escapeHtml(item.issue)}</td><td>${escapeHtml(item.category)}</td>
    <td>${escapeHtml(item.priority)}</td><td><span class="pill ${item.status === "Open" ? "red" : item.status === "Resolved" ? "green" : "amber"}">${escapeHtml(item.status)}</span></td>
    <td>${escapeHtml(item.sla || "—")}</td>
    <td><button class="btn btn-sm" type="button" onclick="viewMaintenanceRequest('${escapeHtml(item.id)}')">View</button></td>
  </tr>`).join("") || `<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--muted)">No maintenance requests match this filter.</td></tr>`;
}

function viewMaintenanceRequest(id) {
  const item = (state.maintenance || []).find((record) => record.id === id);
  if (!item) return;
  const comments = (item.comments || []).map((comment) => `${comment.by}: ${comment.text}`).join("\n") || "No updates yet.";
  showClientRecordDetails(item.id, [
    { label: "Issue", value: item.issue }, { label: "Category", value: item.category },
    { label: "Priority", value: item.priority }, { label: "Status", value: item.status },
    { label: "SLA", value: item.sla }, { label: "Updates", value: comments },
  ]);
}

function submitMaintenanceRequest() {
  const title = document.getElementById("mntTitle").value.trim();
  if (!title) {
    toast("Enter an issue title before submitting.", "error");
    document.getElementById("mntTitle").focus();
    return;
  }
  const now = new Date();
  state.maintenance.unshift({
    id: `MNT-${Date.now()}`,
    tenantId: CLIENT_TENANT.id,
    propertyId: CLIENT_TENANT.propertyId,
    property: CLIENT_TENANT.property,
    unit: CLIENT_TENANT.unit,
    issue: title,
    category: document.getElementById("mntCategory").value,
    priority: document.getElementById("mntPriority").value,
    description: document.getElementById("mntDesc").value.trim(),
    status: "Open",
    sla: "2 days",
    createdAt: now.toISOString().slice(0, 10),
    createdBy: CLIENT_TENANT.name,
    photos: Array.from(document.getElementById("maintenancePhotoFiles")?.files || [], (file) => file.name),
    comments: [],
  });
  saveState();
  document.getElementById("newMntBackdrop").classList.remove("open");
  document.getElementById("mntTitle").value = "";
  document.getElementById("mntDesc").value = "";
  const photoInput = document.getElementById("maintenancePhotoFiles");
  if (photoInput) photoInput.value = "";
  renderMaintenance();
  toast("Maintenance request submitted.", "success");
}
