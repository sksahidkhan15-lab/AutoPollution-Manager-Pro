/**
 * AutoPollution Manager Pro - Reminders & Scheduled Jobs Controller
 * Computes 30-day, 7-day, 3-day expiry cohorts and handles preview/send modals.
 */

const RemindersController = {
  // Check due reminders for today
  getDueReminders(centreId = AppDB.getCurrentCentreId()) {
    const vehicles = AppDB.getVehicles(centreId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueList = [];

    vehicles.forEach(v => {
      if (!v.expDate) return;
      const exp = new Date(v.expDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Rule: Send at 30 days, 7 days, 3 days, or already expired
      let reminderReason = null;
      if (diffDays === 30) reminderReason = '30 Days Prior Alert';
      else if (diffDays === 7) reminderReason = '7 Days Prior Alert';
      else if (diffDays === 3) reminderReason = '3 Days Final Notice';
      else if (diffDays === 0) reminderReason = 'Expires Today';
      else if (diffDays < 0 && diffDays >= -7) reminderReason = 'Expired Grace Notice';

      if (reminderReason) {
        // Duplicate check: Was a reminder sent within the last 20 hours?
        const alreadySentToday = v.lastReminderDate && (today.getTime() - new Date(v.lastReminderDate).getTime()) < 20 * 3600000;
        dueList.push({
          vehicle: v,
          diffDays,
          reason: reminderReason,
          alreadySentToday
        });
      }
    });

    return dueList;
  },

  // Open Message Preview Modal before sending
  openMessagePreview(vehicle, type = 'whatsapp') {
    const centreId = AppDB.getCurrentCentreId();
    const settings = AppDB.getSettings(centreId);

    const defaultMsg = type === 'whatsapp' 
      ? MessagingEngine.generateWhatsAppMessage(vehicle, settings)
      : MessagingEngine.generateSMSMessage(vehicle, settings);

    let modal = document.getElementById('messagePreviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'messagePreviewModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="modal-title" id="previewModalTitle">Send Reminder</h3>
            <button class="modal-close" onclick="RemindersController.closeModal()">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">Recipient Mobile Number</label>
            <input type="text" id="previewRecipientPhone" class="form-control" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Message Content (Editable before sending)</label>
            <textarea id="previewMessageBody" class="form-control" rows="8" style="font-size:0.88rem; line-height:1.4;"></textarea>
            <small style="color:var(--text-muted); display:block; margin-top:4px;">
              * Note: The One-Click feature is 100% free software. In WhatsApp, only owner name, vehicle number, and expiry date will be bold.
            </small>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
            <button class="btn btn-secondary btn-sm" onclick="RemindersController.closeModal()">Cancel</button>
            <button id="previewConfirmBtn" class="btn btn-wa btn-sm">Send Now</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = document.getElementById('previewModalTitle');
    const phoneEl = document.getElementById('previewRecipientPhone');
    const msgEl = document.getElementById('previewMessageBody');
    const btnEl = document.getElementById('previewConfirmBtn');

    titleEl.textContent = type === 'whatsapp' ? 'One-Click WhatsApp Reminder' : 'One-Click SMS Reminder';
    phoneEl.value = (type === 'whatsapp' ? (vehicle.whatsapp || vehicle.phone) : vehicle.phone) + ` (${vehicle.owner} - ${vehicle.vno})`;
    msgEl.value = defaultMsg;

    if (type === 'whatsapp') {
      btnEl.className = 'btn btn-wa';
      btnEl.innerHTML = '<span>💬</span> Open WhatsApp & Send';
      btnEl.onclick = () => {
        const finalMsg = msgEl.value;
        MessagingEngine.sendOneClickWhatsApp(vehicle, finalMsg);
        RemindersController.closeModal();
        if (typeof showToast === 'function') showToast('WhatsApp message prepared!', 'success');
        if (typeof loadVehicles === 'function') loadVehicles();
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
      };
    } else {
      btnEl.className = 'btn btn-sms';
      btnEl.innerHTML = '<span>✉️</span> Open SMS & Send';
      btnEl.onclick = () => {
        const finalMsg = msgEl.value;
        MessagingEngine.sendOneClickSMS(vehicle, finalMsg);
        RemindersController.closeModal();
        if (typeof showToast === 'function') showToast('SMS reminder prepared!', 'success');
        if (typeof loadVehicles === 'function') loadVehicles();
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
      };
    }

    modal.classList.add('open');
  },

  closeModal() {
    const modal = document.getElementById('messagePreviewModal');
    if (modal) modal.classList.remove('open');
  }
};

window.RemindersController = RemindersController;
