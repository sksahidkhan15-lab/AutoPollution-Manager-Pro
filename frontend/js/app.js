/**
 * AutoPollution Manager Pro - Application Orchestration & UI Utilities
 */

// Global Toast Notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Confirmation Dialog before deleting important data
function confirmAction(title, message, onConfirm) {
  let modal = document.getElementById('confirmActionModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirmActionModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 400px;">
      <div class="modal-header">
        <h3 class="modal-title" style="color:var(--danger);">${title}</h3>
        <button class="modal-close" onclick="document.getElementById('confirmActionModal').classList.remove('open')">&times;</button>
      </div>
      <p style="font-size:0.9rem; color:var(--text-main); margin-bottom:16px;">${message}</p>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('confirmActionModal').classList.remove('open')">Cancel</button>
        <button id="confirmYesBtn" class="btn btn-danger btn-sm">Yes, Proceed</button>
      </div>
    </div>
  `;

  document.getElementById('confirmYesBtn').onclick = () => {
    modal.classList.remove('open');
    if (typeof onConfirm === 'function') onConfirm();
  };

  modal.classList.add('open');
}

// Format Vehicle Number to Uppercase and clean spaces
function formatVehicleNumber(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', () => {
    inputEl.value = inputEl.value.toUpperCase().replace(/\s+/g, '');
  });
}

// Format 10-digit Indian Mobile number
function formatMobileNumber(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', () => {
    inputEl.value = inputEl.value.replace(/\D/g, '').slice(0, 10);
  });
}

// Export Vehicles to CSV
function exportVehiclesToCSV() {
  const centreId = AppDB.getCurrentCentreId();
  const centre = AppDB.getCentreById(centreId);
  const vehicles = AppDB.getVehicles(centreId);

  if (vehicles.length === 0) {
    showToast('No vehicle records to export.', 'info');
    return;
  }

  const headers = ['Vehicle No', 'Owner Name', 'Mobile', 'WhatsApp', 'Vehicle Type', 'Fuel Type', 'PUC Certificate No', 'Registration Date', 'Expiry Date', 'Status', 'Consent Given', 'Notes'];
  const rows = vehicles.map(v => {
    const status = AppDB.getExpiryStatus(v.expDate).label;
    return [
      `"${v.vno}"`,
      `"${v.owner}"`,
      `"${v.phone}"`,
      `"${v.whatsapp || v.phone}"`,
      `"${v.vtype || ''}"`,
      `"${v.fuelType || ''}"`,
      `"${v.pucNo || ''}"`,
      `"${v.regDate || ''}"`,
      `"${v.expDate || ''}"`,
      `"${status}"`,
      `"${v.consentGiven ? 'YES' : 'NO'}"`,
      `"${(v.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `AutoPollution_${centre ? centre.centreId : 'Export'}_${new Date().toISOString().split('T')[0]}.csv`;

  // Native Android bridge support
  if (window.AndroidBridge && typeof window.AndroidBridge.downloadCsv === 'function') {
    window.AndroidBridge.downloadCsv(filename, csvContent);
    showToast('CSV downloaded via Android Storage!', 'success');
  } else {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Vehicle records CSV exported successfully!', 'success');
  }
}

// Setup common header session badges
function renderHeaderProfile() {
  const session = AppAuth.getSession();
  const badgeEl = document.getElementById('headerTenantBadge');
  const userMenuEl = document.getElementById('headerUserMenu');

  if (session && badgeEl) {
    if (session.role === 'admin') {
      badgeEl.innerHTML = `🛡️ Super Admin`;
      badgeEl.style.background = '#dc2626';
    } else {
      badgeEl.innerHTML = `🏢 ${session.centreId || 'Centre'}`;
      badgeEl.title = session.name;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeaderProfile();
});
