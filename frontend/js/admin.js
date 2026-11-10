/**
 * AutoPollution Manager Pro - Super Admin Controller
 * Manages centre approvals, plan upgrades, pricing overrides, and platform statistics.
 */

const AdminController = {
  // Load Super Admin Statistics
  loadAdminStats() {
    const centres = AppDB.getAllCentres();
    const plans = AppDB.getPlans();

    let totalVehicles = 0;
    let waConnectedCount = 0;
    let activeSubs = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    centres.forEach(c => {
      if (c.status === 'pending') pendingCount++;
      else if (c.status === 'approved') approvedCount++;
      else if (c.status === 'rejected') rejectedCount++;

      if (c.waConnected) waConnectedCount++;
      if (new Date(c.subscriptionValidTill) > new Date()) activeSubs++;

      const vList = AppDB.getVehicles(c.id);
      totalVehicles += vList.length;
    });

    return {
      totalCentres: centres.length,
      approvedCount,
      pendingCount,
      rejectedCount,
      activeSubs,
      waConnectedCount,
      totalVehicles,
      plans
    };
  },

  // Approve Centre
  approveCentre(centreId) {
    const updated = AppDB.updateCentreStatus(centreId, 'approved');
    if (updated) {
      if (typeof showToast === 'function') {
        showToast(`Centre ${updated.name} approved successfully with ID ${updated.centreId}!`, 'success');
      }
      return updated;
    }
    throw new Error('Centre not found.');
  },

  // Reject Centre
  rejectCentre(centreId, reason = 'Verification documents incomplete or invalid') {
    const updated = AppDB.updateCentreStatus(centreId, 'rejected', reason);
    if (updated) {
      if (typeof showToast === 'function') {
        showToast(`Centre ${updated.name} rejected.`, 'info');
      }
      return updated;
    }
    throw new Error('Centre not found.');
  },

  // Suspend Centre
  suspendCentre(centreId) {
    const updated = AppDB.updateCentreStatus(centreId, 'suspended');
    if (updated) {
      if (typeof showToast === 'function') {
        showToast(`Centre ${updated.name} suspended.`, 'error');
      }
      return updated;
    }
  },

  // Activate Centre
  activateCentre(centreId) {
    const updated = AppDB.updateCentreStatus(centreId, 'approved');
    if (updated) {
      if (typeof showToast === 'function') {
        showToast(`Centre ${updated.name} activated.`, 'success');
      }
      return updated;
    }
  },

  // Change Centre Plan
  changePlan(centreId, newPlan) {
    const updated = AppDB.updateCentrePlan(centreId, newPlan);
    if (updated) {
      if (typeof showToast === 'function') {
        showToast(`Centre ${updated.name} plan updated to ${newPlan.toUpperCase()}.`, 'success');
      }
      return updated;
    }
  },

  // Update Plan Pricing
  updatePlanPrice(planId, newPrice) {
    const updated = AppDB.updatePlan(planId, { price: Number(newPrice) });
    if (updated) {
      if (typeof showToast === 'function') {
        showToast(`Updated ${updated.name} pricing to ₹${newPrice}/mo.`, 'success');
      }
      return updated;
    }
  }
};

window.AdminController = AdminController;
