/**
 * AutoPollution Manager Pro - Reminders & History API
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Log manual or 1-click reminder send
router.post('/log', async (req, res) => {
  const { centreId, vehicleId, vehicleNo, customerName, phone, type, status, message } = req.body;
  if (!centreId || !vehicleNo) {
    return res.status(400).json({ error: 'Missing mandatory reminder fields.' });
  }

  const db = admin.firestore();
  const logRef = db.collection('centres').doc(centreId).collection('reminders').doc();

  const record = {
    id: logRef.id,
    vehicleId,
    vehicleNo,
    customerName,
    phone,
    type,
    status: status || 'sent',
    message: message || '',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  await logRef.set(record);
  res.status(201).json(record);
});

// Fetch reminder history
router.get('/history/:centreId', async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('centres').doc(req.params.centreId)
    .collection('reminders')
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get();

  const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(list);
});

module.exports = router;
