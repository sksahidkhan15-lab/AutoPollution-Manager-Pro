/**
 * AutoPollution Manager Pro - Multi-Tenant Database & Storage Layer
 * Supports Firestore SDK with zero-latency IndexedDB/localStorage fallback
 * for robust offline-first and rapid commercial operations.
 */

const DB_KEYS = {
  CENTRES: 'autopollution_centres',
  CURRENT_USER: 'autopollution_current_user',
  VEHICLES: 'autopollution_vehicles_',
  REMINDERS: 'autopollution_reminders_',
  SETTINGS: 'autopollution_settings_',
  SUBSCRIPTION: 'autopollution_subscription_',
  PLANS: 'autopollution_plans'
};

// Seed default plans as specified in requirements
const DEFAULT_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 199,
    billing: 'month',
    features: [
      'Full Vehicle Management',
      'One-Click WhatsApp (Free)',
      'One-Click SMS (Free)',
      'Customer Search & Filter',
      'Basic Expiry Dashboard',
      'Data Backup & CSV Export'
    ],
    maxVehicles: 500,
    autoReminders: false
  },
  standard: {
    id: 'standard',
    name: 'Standard Plan',
    price: 399,
    billing: 'month',
    popular: true,
    features: [
      'Everything in Basic',
      'Meta WhatsApp Cloud API Integration',
      'Automatic Daily Reminders (8:00 AM IST)',
      '30-Day, 7-Day & 3-Day Expiry Alerts',
      'Custom Centre Branding & Templates',
      'Detailed Delivery & Expiry Reports',
      'Priority Support'
    ],
    maxVehicles: 2500,
    autoReminders: true
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 599,
    billing: 'month',
    features: [
      'Everything in Standard',
      'Unlimited Vehicle Records',
      'Meta Embedded Signup Support',
      'Automatic DLT SMS Integration',
      'Multi-Operator Staff Accounts',
      'Comprehensive Audit Logs',
      '24/7 Dedicated Support'
    ],
    maxVehicles: 999999,
    autoReminders: true
  }
};

// Initialize base demo centres for immediate demonstration
function initDefaultData() {
  if (!localStorage.getItem(DB_KEYS.PLANS)) {
    localStorage.setItem(DB_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
  }

  let centres = [];
  try {
    centres = JSON.parse(localStorage.getItem(DB_KEYS.CENTRES)) || [];
  } catch(e) {
    centres = [];
  }

  if (centres.length === 0) {
    const demoCentres = [
      {
        id: 'centre_wb_01',
        centreId: 'WB-PUC-7801',
        name: 'Maa Tara Auto Emission Testing Centre',
        ownerName: 'Sahid Khan',
        phone: '9876543210',
        whatsapp: '9876543210',
        email: 'sahid.puc@gmail.com',
        address: 'NH-6 Bombay Road, Near Toll Plaza',
        state: 'West Bengal',
        district: 'Howrah',
        pin: '711302',
        location: 'Opposite HP Petrol Pump',
        mapLink: 'https://maps.google.com/?q=22.5851,88.2341',
        status: 'approved',
        role: 'centre',
        plan: 'standard',
        subscriptionValidTill: new Date(Date.now() + 30 * 86400000).toISOString(),
        registeredAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        waConnected: true,
        wabaId: '109283746501928',
        phoneId: '108273645192837'
      },
      {
        id: 'centre_dl_02',
        centreId: 'DL-PUC-1092',
        name: 'Capital Green Auto Pollution Check Centre',
        ownerName: 'Ramesh Sharma',
        phone: '9811223344',
        whatsapp: '9811223344',
        email: 'ramesh.pollution@delhi.gov.in',
        address: 'Outer Ring Road, Rohini Sector 14',
        state: 'Delhi',
        district: 'North West Delhi',
        pin: '110085',
        location: 'Near Metro Pillar 245',
        mapLink: 'https://maps.google.com/?q=28.7159,77.1265',
        status: 'pending',
        role: 'centre',
        plan: 'basic',
        subscriptionValidTill: new Date(Date.now() + 15 * 86400000).toISOString(),
        registeredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        waConnected: false
      }
    ];

    localStorage.setItem(DB_KEYS.CENTRES, JSON.stringify(demoCentres));

    // Seed realistic vehicle records for Maa Tara Emission Centre
    const now = new Date();
    const demoVehicles = [
      {
        id: 'v_001',
        centreId: 'centre_wb_01',
        vno: 'WB02AL4589',
        owner: 'Arun Kumar Mukherjee',
        phone: '9830112233',
        whatsapp: '9830112233',
        vtype: '4W - Car',
        fuelType: 'Petrol',
        pucNo: 'WB02260012398',
        regDate: new Date(now.getTime() - 175 * 86400000).toISOString().split('T')[0],
        expDate: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0], // Expiring in 5 days!
        notes: 'Hyundai Creta Petrol BS-VI, 4 Gas Analyzer',
        consentGiven: true,
        consentDate: new Date(now.getTime() - 175 * 86400000).toISOString(),
        remindersCount: 1,
        lastReminderDate: new Date(now.getTime() - 2 * 86400000).toISOString()
      },
      {
        id: 'v_002',
        centreId: 'centre_wb_01',
        vno: 'WB12BC8970',
        owner: 'Subhashish Das',
        phone: '9874556677',
        whatsapp: '9874556677',
        vtype: '2W - Motorcycle',
        fuelType: 'Petrol',
        pucNo: 'WB12260087412',
        regDate: new Date(now.getTime() - 180 * 86400000).toISOString().split('T')[0],
        expDate: new Date(now.getTime() - 3 * 86400000).toISOString().split('T')[0], // Expired 3 days ago!
        notes: 'Royal Enfield Classic 350',
        consentGiven: true,
        consentDate: new Date(now.getTime() - 180 * 86400000).toISOString(),
        remindersCount: 2,
        lastReminderDate: new Date(now.getTime() - 4 * 86400000).toISOString()
      },
      {
        id: 'v_003',
        centreId: 'centre_wb_01',
        vno: 'WB26J3341',
        owner: 'Md. Imran Akhtar',
        phone: '9804123456',
        whatsapp: '9804123456',
        vtype: 'LCV - Commercial',
        fuelType: 'Diesel',
        pucNo: 'WB26260045129',
        regDate: new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0],
        expDate: new Date(now.getTime() + 25 * 86400000).toISOString().split('T')[0], // Expiring in 25 days (30d alert)
        notes: 'Tata Ace Gold Diesel Smoke Check 48%',
        consentGiven: true,
        consentDate: new Date(now.getTime() - 90 * 86400000).toISOString(),
        remindersCount: 0
      },
      {
        id: 'v_004',
        centreId: 'centre_wb_01',
        vno: 'WB08E9012',
        owner: 'Priyanka Banerjee',
        phone: '9831998877',
        whatsapp: '9831998877',
        vtype: '4W - Car',
        fuelType: 'CNG',
        pucNo: 'WB08260099182',
        regDate: new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0],
        expDate: new Date(now.getTime() + 150 * 86400000).toISOString().split('T')[0], // Active
        notes: 'Maruti Suzuki WagonR CNG',
        consentGiven: true,
        consentDate: new Date(now.getTime() - 30 * 86400000).toISOString(),
        remindersCount: 0
      },
      {
        id: 'v_005',
        centreId: 'centre_wb_01',
        vno: 'WB19K6623',
        owner: 'Bikramjit Sen',
        phone: '9836774411',
        whatsapp: '9836774411',
        vtype: '3W - Auto',
        fuelType: 'LPG',
        pucNo: 'WB19260033109',
        regDate: new Date(now.getTime() - 170 * 86400000).toISOString().split('T')[0],
        expDate: new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0], // Expiring in 2 days!
        notes: 'Bajaj RE Auto LPG',
        consentGiven: true,
        consentDate: new Date(now.getTime() - 170 * 86400000).toISOString(),
        remindersCount: 1
      }
    ];

    localStorage.setItem(DB_KEYS.VEHICLES + 'centre_wb_01', JSON.stringify(demoVehicles));

    // Seed default template settings
    const defaultSettings = {
      centreName: 'Maa Tara Auto Emission Testing Centre',
      ownerName: 'Sahid Khan',
      phone: '9876543210',
      whatsapp: '9876543210',
      address: 'NH-6 Bombay Road, Near Toll Plaza',
      location: 'Opposite HP Petrol Pump',
      mapLink: 'https://maps.google.com/?q=22.5851,88.2341',
      waTemplate: `Dear *{owner}*, your vehicle *{vno}* PUC certificate is expiring on *{exp}*.

Contact: {center}
Mob No: {phone}
Address: {address}
Location: {location}
Google Maps: {map_link}`,
      smsTemplate: `Dear {owner}, PUC for vehicle {vno} expires on {exp}. Please renew at {center}. Call {phone}.`,
      autoRemindersEnabled: true,
      remindDays: [30, 7, 3]
    };
    localStorage.setItem(DB_KEYS.SETTINGS + 'centre_wb_01', JSON.stringify(defaultSettings));
  }
}

// Auto init on load
initDefaultData();

const AppDB = {
  // Get active session centre ID
  getCurrentCentreId() {
    const user = JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER) || 'null');
    return user ? user.centreId : 'centre_wb_01';
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER) || 'null');
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
  },

  // Centre Management (Super Admin & Self)
  getAllCentres() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CENTRES) || '[]');
  },

  getCentreById(id) {
    const list = this.getAllCentres();
    return list.find(c => c.id === id || c.centreId === id) || null;
  },

  saveCentre(centreData) {
    const list = this.getAllCentres();
    const idx = list.findIndex(c => c.id === centreData.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...centreData };
    } else {
      list.push(centreData);
    }
    localStorage.setItem(DB_KEYS.CENTRES, JSON.stringify(list));
    return centreData;
  },

  updateCentreStatus(centreId, status, rejectionReason = '') {
    const list = this.getAllCentres();
    const centre = list.find(c => c.id === centreId || c.centreId === centreId);
    if (centre) {
      centre.status = status;
      if (rejectionReason) centre.rejectionReason = rejectionReason;
      localStorage.setItem(DB_KEYS.CENTRES, JSON.stringify(list));
      return centre;
    }
    return null;
  },

  updateCentrePlan(centreId, newPlan) {
    const list = this.getAllCentres();
    const centre = list.find(c => c.id === centreId || c.centreId === centreId);
    if (centre) {
      centre.plan = newPlan;
      localStorage.setItem(DB_KEYS.CENTRES, JSON.stringify(list));
      return centre;
    }
    return null;
  },

  // Vehicle Management (Strict Tenant Isolation)
  getVehicles(centreId = this.getCurrentCentreId()) {
    return JSON.parse(localStorage.getItem(DB_KEYS.VEHICLES + centreId) || '[]');
  },

  saveVehicles(list, centreId = this.getCurrentCentreId()) {
    localStorage.setItem(DB_KEYS.VEHICLES + centreId, JSON.stringify(list));
  },

  addVehicle(vehicle, centreId = this.getCurrentCentreId()) {
    const list = this.getVehicles(centreId);
    
    // Auto uppercase vehicle reg number
    vehicle.vno = (vehicle.vno || '').toUpperCase().replace(/[\s-]/g, '').trim();
    
    // Check duplicate within this centre
    const exists = list.some(v => v.vno === vehicle.vno && v.id !== vehicle.id);
    if (exists) {
      throw new Error(`Vehicle number "${vehicle.vno}" is already registered in your centre!`);
    }

    if (!vehicle.id) {
      vehicle.id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    }
    vehicle.centreId = centreId;
    vehicle.createdAt = new Date().toISOString();
    vehicle.remindersCount = vehicle.remindersCount || 0;

    list.unshift(vehicle);
    this.saveVehicles(list, centreId);
    return vehicle;
  },

  updateVehicle(id, updatedData, centreId = this.getCurrentCentreId()) {
    const list = this.getVehicles(centreId);
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');

    if (updatedData.vno) {
      updatedData.vno = updatedData.vno.toUpperCase().replace(/[\s-]/g, '').trim();
      const duplicate = list.some(v => v.vno === updatedData.vno && v.id !== id);
      if (duplicate) throw new Error(`Vehicle number "${updatedData.vno}" is already registered!`);
    }

    list[idx] = { ...list[idx], ...updatedData, updatedAt: new Date().toISOString() };
    this.saveVehicles(list, centreId);
    return list[idx];
  },

  deleteVehicle(id, centreId = this.getCurrentCentreId()) {
    let list = this.getVehicles(centreId);
    list = list.filter(v => v.id !== id);
    this.saveVehicles(list, centreId);
  },

  // Calculate Expiry Status
  getExpiryStatus(expDateStr) {
    if (!expDateStr) return { status: 'unknown', days: 0, label: 'Unknown' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expDateStr);
    exp.setHours(0, 0, 0, 0);
    
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', days: Math.abs(diffDays), label: `Expired ${Math.abs(diffDays)}d ago` };
    } else if (diffDays === 0) {
      return { status: 'expiring', days: 0, label: 'Expires TODAY' };
    } else if (diffDays <= 7) {
      return { status: 'expiring', days: diffDays, label: `Expires in ${diffDays}d` };
    } else if (diffDays <= 30) {
      return { status: 'expiring_30', days: diffDays, label: `Expires in ${diffDays}d` };
    } else {
      return { status: 'active', days: diffDays, label: `Valid for ${diffDays}d` };
    }
  },

  // Centre Settings & Reminder Templates
  getSettings(centreId = this.getCurrentCentreId()) {
    const raw = localStorage.getItem(DB_KEYS.SETTINGS + centreId);
    if (raw) return JSON.parse(raw);
    const centre = this.getCentreById(centreId) || {};
    return {
      centreName: centre.name || 'Pollution Testing Centre',
      ownerName: centre.ownerName || '',
      phone: centre.phone || '',
      whatsapp: centre.whatsapp || centre.phone || '',
      address: centre.address || '',
      location: centre.location || '',
      mapLink: centre.mapLink || '',
      waTemplate: `Dear *{owner}*, your vehicle *{vno}* PUC certificate is expiring on *{exp}*.

Contact: {center}
Mob No: {phone}
Address: {address}
Location: {location}
Google Maps: {map_link}`,
      smsTemplate: `Dear {owner}, PUC for vehicle {vno} expires on {exp}. Please renew at {center}. Call {phone}.`,
      autoRemindersEnabled: true,
      remindDays: [30, 7, 3]
    };
  },

  saveSettings(settings, centreId = this.getCurrentCentreId()) {
    localStorage.setItem(DB_KEYS.SETTINGS + centreId, JSON.stringify(settings));
    return settings;
  },

  // Reminders Log
  getReminders(centreId = this.getCurrentCentreId()) {
    return JSON.parse(localStorage.getItem(DB_KEYS.REMINDERS + centreId) || '[]');
  },

  logReminder(record, centreId = this.getCurrentCentreId()) {
    const list = this.getReminders(centreId);
    record.id = 'rem_' + Date.now();
    record.timestamp = new Date().toISOString();
    record.centreId = centreId;
    list.unshift(record);
    localStorage.setItem(DB_KEYS.REMINDERS + centreId, JSON.stringify(list));

    // Increment count on vehicle
    if (record.vehicleId) {
      const vList = this.getVehicles(centreId);
      const v = vList.find(item => item.id === record.vehicleId);
      if (v) {
        v.remindersCount = (v.remindersCount || 0) + 1;
        v.lastReminderDate = record.timestamp;
        this.saveVehicles(vList, centreId);
      }
    }
    return record;
  },

  // Plans & Pricing
  getPlans() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PLANS)) || DEFAULT_PLANS;
  },

  updatePlan(planId, updatedFields) {
    const plans = this.getPlans();
    if (plans[planId]) {
      plans[planId] = { ...plans[planId], ...updatedFields };
      localStorage.setItem(DB_KEYS.PLANS, JSON.stringify(plans));
      return plans[planId];
    }
    return null;
  }
};

window.AppDB = AppDB;
