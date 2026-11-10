/**
 * AutoPollution Manager Pro - Auth & Centre API
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Register new centre in Pending Approval status
router.post('/register', async (req, res) => {
  const { name, ownerName, phone, email, address, state, district } = req.body;

  if (!name || !ownerName || !phone || !email) {
    return res.status(400).json({ error: 'Missing mandatory registration fields.' });
  }

  const db = admin.firestore();

  // Generate unique centre ID
  const stateCode = (state || 'IND').substring(0, 2).toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const centreId = `${stateCode}-PUC-${randNum}`;

  const centreRef = db.collection('centres').doc();
  const centreData = {
    id: centreRef.id,
    centreId,
    name: name.trim(),
    ownerName: ownerName.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    address: address || '',
    state: state || '',
    district: district || '',
    status: 'pending', // Awaiting Super Admin approval
    role: 'centre',
    plan: 'basic',
    subscriptionValidTill: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await centreRef.set(centreData);
  res.status(201).json({ message: 'Centre registered in pending approval status.', centre: centreData });
});

// Super Admin approval endpoint
router.post('/approve/:id', async (req, res) => {
  const db = admin.firestore();
  await db.collection('centres').doc(req.params.id).update({
    status: 'approved',
    approvedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  res.json({ success: true, message: 'Centre approved successfully.' });
});

module.exports = router;
