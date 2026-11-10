/**
 * AutoPollution Manager Pro - Scheduled Daily Reminder Engine
 * Runs at 8:00 AM India Standard Time (Asia/Kolkata).
 * Iterates through all approved centres, inspects upcoming certificate
 * expirations (30d, 7d, 3d), verifies customer consent, enforces idempotency,
 * and logs delivery status into Firestore.
 */

const { sendWhatsAppMessage } = require('../services/whatsapp');
const { sendSmsMessage } = require('../services/sms');

async function runDailyReminderScheduler(db) {
  const executionStartTime = new Date();
  console.log(`[Scheduler] Starting batch reminder processing at ${executionStartTime.toISOString()}`);

  const summary = {
    totalCentresProcessed: 0,
    totalEligibleVehicles: 0,
    remindersSent: 0,
    remindersSkippedDuplicate: 0,
    remindersSkippedNoConsent: 0,
    remindersFailed: 0
  };

  try {
    // 1. Fetch only Approved Centres with active subscriptions
    const centresSnapshot = await db.collection('centres')
      .where('status', '==', 'approved')
      .get();

    for (const centreDoc of centresSnapshot.docs) {
      const centre = { id: centreDoc.id, ...centreDoc.data() };
      summary.totalCentresProcessed++;

      // Check subscription validity
      if (centre.subscriptionValidTill && new Date(centre.subscriptionValidTill) < executionStartTime) {
        console.log(`[Scheduler] Skipping centre ${centre.centreId} - Subscription expired.`);
        continue;
      }

      // 2. Fetch centre's message templates & WhatsApp connection info
      const settingsDoc = await db.collection('centres').doc(centre.id).collection('settings').doc('config').get();
      const settings = settingsDoc.exists ? settingsDoc.data() : {
        centreName: centre.name,
        phone: centre.phone,
        address: centre.address,
        location: centre.location || '',
        mapLink: centre.mapLink || ''
      };

      // 3. Query vehicles in this centre
      const vehiclesSnapshot = await db.collection('centres').doc(centre.id).collection('vehicles').get();

      for (const vehicleDoc of vehiclesSnapshot.docs) {
        const vehicle = { id: vehicleDoc.id, ...vehicleDoc.data() };
        if (!vehicle.expDate) continue;

        // Calculate days to expiry
        const expDate = new Date(vehicle.expDate);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date(executionStartTime);
        today.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Part 8 Rules: 30 days, 7 days, 3 days
        let milestone = null;
        if (diffDays === 30) milestone = '30_DAYS_PRIOR';
        else if (diffDays === 7) milestone = '7_DAYS_PRIOR';
        else if (diffDays === 3) milestone = '3_DAYS_FINAL';

        if (!milestone) continue; // Not a target milestone
        summary.totalEligibleVehicles++;

        // 4. Verify Customer Consent (TRAI / DLT compliance)
        if (vehicle.consentGiven === false) {
          summary.remindersSkippedNoConsent++;
          continue;
        }

        // 5. Prevent Duplicate Reminders (Idempotency Key: centreId_vehicleId_milestone_YYYY-MM-DD)
        const dateKey = executionStartTime.toISOString().split('T')[0];
        const idempotencyKey = `${centre.id}_${vehicle.id}_${milestone}_${dateKey}`;
        const existingLog = await db.collection('centres').doc(centre.id)
          .collection('reminders')
          .doc(idempotencyKey)
          .get();

        if (existingLog.exists && existingLog.data().status === 'sent') {
          summary.remindersSkippedDuplicate++;
          continue;
        }

        // 6. Format formatted message
        const ownerBold = `*${vehicle.owner}*`;
        const vnoBold = `*${vehicle.vno}*`;
        const expBold = `*${vehicle.expDate}*`;

        const waText = `Dear ${ownerBold}, your vehicle ${vnoBold} PUC certificate is expiring on ${expBold}.

Contact: ${settings.centreName || centre.name}
Mob No: ${settings.phone || centre.phone}
Address: ${settings.address || centre.address}
Location: ${settings.location || ''}
Google Maps: ${settings.mapLink || ''}`;

        // 7. Dispatch via Centre's connected Meta WhatsApp Cloud API credentials
        try {
          let sendResult;
          if (centre.waConnected && centre.phoneId && centre.accessToken) {
            sendResult = await sendWhatsAppMessage({
              phoneId: centre.phoneId,
              accessToken: centre.accessToken,
              recipientPhone: vehicle.whatsapp || vehicle.phone,
              messageText: waText,
              templateName: 'puc_renewal_reminder',
              variables: [vehicle.owner, vehicle.vno, vehicle.expDate, centre.name, centre.phone]
            });
          } else {
            // Log as pending for centre operator to send via 1-Click WhatsApp
            sendResult = {
              status: 'pending_one_click',
              messageId: 'local_pending_' + Date.now()
            };
          }

          // 8. Record audit log in Firestore
          await db.collection('centres').doc(centre.id)
            .collection('reminders')
            .doc(idempotencyKey)
            .set({
              vehicleId: vehicle.id,
              vehicleNo: vehicle.vno,
              customerName: vehicle.owner,
              phone: vehicle.whatsapp || vehicle.phone,
              milestone: milestone,
              channel: 'WhatsApp Cloud API',
              status: sendResult.status === 'pending_one_click' ? 'pending' : 'sent',
              apiResponseId: sendResult.messageId || null,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

          summary.remindersSent++;
        } catch (apiError) {
          summary.remindersFailed++;
          console.error(`[Scheduler] Failed sending to ${vehicle.vno}:`, apiError.message);

          await db.collection('centres').doc(centre.id)
            .collection('reminders')
            .doc(idempotencyKey)
            .set({
              vehicleId: vehicle.id,
              vehicleNo: vehicle.vno,
              customerName: vehicle.owner,
              phone: vehicle.whatsapp || vehicle.phone,
              milestone: milestone,
              channel: 'WhatsApp Cloud API',
              status: 'failed',
              failureReason: apiError.message,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
      }
    }
  } catch (err) {
    console.error('[Scheduler] Fatal error in daily reminder loop:', err);
  }

  return summary;
}

module.exports = { runDailyReminderScheduler };
