/**
 * AutoPollution Manager Pro - Vehicle Management API (Tenant Isolated)
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware to extract verified centre ID
const requireTenant = (req, res, next) => {
  const centreId = req.headers['x-centre-id'];
  if (!centreId) {
    return res.status(401).json({ error: 'Missing tenant identification.' });
  }
  req.centreId = centreId;
  next();
};

// Add Vehicle
router.post('/', requireTenant, async (req, res) => {
  const { vno, owner, phone, whatsapp, vtype, fuelType, pucNo, expDate, regDate, notes, consentGiven } = req.body;
  if (!vno || !owner || !phone || !expDate) {
    return res.status(400).json({ error: 'Missing required vehicle fields.' });
  }

  const db = admin.firestore();
  const cleanVno = vno.toUpperCase().replace(/[\s-]/g, '').trim();

  // Check duplicate inside this centre
  const existing = await db.collection('centres').doc(req.centreId)
    .collection('vehicles')
    .where('vno', '==', cleanVno)
    .get();

  if (!existing.empty) {
    return res.status(409).json({ error: `Vehicle ${cleanVno} is already registered in this centre.` });
  }

  const vDoc = db.collection('centres').doc(req.centreId).collection('vehicles').doc();
  const newVehicle = {
    id: vDoc.id,
    vno: cleanVno,
    owner: owner.trim(),
    phone: phone.trim(),
    whatsapp: (whatsapp || phone).trim(),
    vtype: vtype || '4W - Car',
    fuelType: fuelType || 'Petrol',
    pucNo: pucNo || '',
    regDate: regDate || new Date().toISOString().split('T')[0],
    expDate: expDate,
    notes: notes || '',
    consentGiven: consentGiven !== false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await vDoc.set(newVehicle);
  res.status(201).json(newVehicle);
});

// List Vehicles
router.get('/', requireTenant, async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('centres').doc(req.centreId)
    .collection('vehicles')
    .orderBy('expDate', 'asc')
    .get();

  const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(list);
});

module.exports = router;
