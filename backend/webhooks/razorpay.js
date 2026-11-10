/**
 * AutoPollution Manager Pro - Razorpay Webhook Handler
 * Verifies X-Razorpay-Signature header before processing payment.captured events.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const admin = require('firebase-admin');

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'autopollution_rzp_webhook_secret';

router.post('/', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = req.body;

  // Validate webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  if (signature && signature !== expectedSignature) {
    console.warn('[Webhook] Invalid Razorpay webhook signature received.');
    return res.status(400).json({ error: 'Signature mismatch' });
  }

  const event = body.event;
  if (event === 'payment.captured') {
    const payment = body.payload.payment.entity;
    const notes = payment.notes || {};
    const centreId = notes.centreId;
    const planId = notes.planId || 'standard';
    const billingCycle = notes.billingCycle || 'monthly';

    if (centreId) {
      const db = admin.firestore();
      const days = billingCycle === 'yearly' ? 365 : 30;
      const validTill = new Date(Date.now() + days * 86400000).toISOString();

      await db.collection('centres').doc(centreId).update({
        plan: planId,
        subscriptionValidTill: validTill,
        lastPaymentId: payment.id,
        paymentStatus: 'captured',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`[Webhook] Activated ${planId} plan for centre ${centreId}`);
    }
  }

  res.json({ status: 'ok' });
});

module.exports = router;
