/**
 * AutoPollution Manager Pro - Backend Cloud Functions Entry Point
 * Implements:
 * 1. Express REST API with multi-tenant isolation
 * 2. Meta WhatsApp Cloud API webhooks & delivery receipts
 * 3. Razorpay payment verification webhooks
 * 4. Scheduled Daily Cron Job (8:00 AM Asia/Kolkata)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Import Sub-modules
const authRoutes = require('../api/auth');
const vehicleRoutes = require('../api/vehicles');
const reminderRoutes = require('../api/reminders');
const paymentRoutes = require('../api/payments');
const whatsappWebhook = require('../webhooks/whatsapp');
const razorpayWebhook = require('../webhooks/razorpay');
const { runDailyReminderScheduler } = require('../scheduled-jobs/daily-reminder');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/payments', paymentRoutes);

// Mount Webhook endpoints
app.use('/webhooks/whatsapp', whatsappWebhook);
app.use('/webhooks/razorpay', razorpayWebhook);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'AutoPollution Manager Pro Commercial SaaS',
    timezone: 'Asia/Kolkata',
    timestamp: new Date().toISOString()
  });
});

// Export Cloud Functions HTTPS API
exports.api = functions.region('asia-south1').https.onRequest(app);

// Part 8: Cloud Scheduler - Daily Reminders at 8:00 AM IST (Asia/Kolkata)
// Crontab '0 8 * * *' in Asia/Kolkata timezone
exports.dailyScheduledReminders = functions
  .region('asia-south1')
  .pubsub.schedule('0 8 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('⏰ [8:00 AM IST] Executing AutoPollution Pro daily reminder scheduled job...');
    const result = await runDailyReminderScheduler(db);
    console.log('✅ Daily reminder execution summary:', result);
    return result;
  });

// Standalone runner for direct node execution / local testing
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`AutoPollution Pro Server running on port ${PORT}`);
  });
}
