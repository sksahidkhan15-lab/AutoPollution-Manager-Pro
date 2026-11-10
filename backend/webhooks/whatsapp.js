/**
 * AutoPollution Manager Pro - Meta WhatsApp Webhook Handler
 * Verifies webhook subscriptions and processes delivery status receipts
 * (sent, delivered, read, failed).
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'autopollution_webhook_secret_token_2026';

// GET verification endpoint for Meta Developer App
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('[Webhook] Meta WhatsApp Webhook verified successfully.');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// POST delivery receipts and incoming customer messages
router.post('/', async (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0]) {
      const value = body.entry[0].changes[0].value;

      // Handle message statuses (delivered, read, failed)
      if (value.statuses && value.statuses[0]) {
        const statusObj = value.statuses[0];
        const messageId = statusObj.id;
        const status = statusObj.status; // 'delivered', 'read', 'failed'
        const recipientId = statusObj.recipient_id;

        console.log(`[Webhook] WhatsApp message ${messageId} to ${recipientId} status: ${status}`);

        // Update Firestore reminder records if matching messageId
        try {
          const db = admin.firestore();
          const query = await db.collectionGroup('reminders')
            .where('apiResponseId', '==', messageId)
            .limit(1)
            .get();

          if (!query.empty) {
            const docRef = query.docs[0].ref;
            await docRef.update({
              deliveryStatus: status,
              lastStatusTimestamp: admin.firestore.FieldValue.serverTimestamp(),
              ...(statusObj.errors ? { failureReason: JSON.stringify(statusObj.errors) } : {})
            });
          }
        } catch (e) {
          console.error('[Webhook] Failed updating message status in DB:', e.message);
        }
      }
    }
    return res.sendStatus(200);
  }
  return res.sendStatus(404);
});

module.exports = router;
