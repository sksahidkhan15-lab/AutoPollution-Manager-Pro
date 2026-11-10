/**
 * AutoPollution Manager Pro - Authentication & Multi-Tenant Session
 * Handles Centre registration, pending approval state, login, logout,
 * password reset and Super Admin access.
 */

const AppAuth = {
  // Session key
  SESSION_KEY: 'autopollution_auth_session',

  // Initialize or restore session
  initSession() {
    const session = this.getSession();
    if (session) {
      // Check if centre data was updated
      if (session.role === 'centre') {
        const fresh = AppDB.getCentreById(session.id);
        if (fresh) {
          session.status = fresh.status;
          session.plan = fresh.plan;
          session.subscriptionValidTill = fresh.subscriptionValidTill;
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
      }
    }
    return session;
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY)) || null;
    } catch(e) {
      return null;
    }
  },

  // Register New Centre
  registerCentre(data) {
    // Validate required fields
    if (!data.name || !data.ownerName || !data.phone || !data.email || !data.password) {
      throw new Error('Please fill in all mandatory fields.');
    }
    if (data.phone.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Check if email or phone already registered
    const existingCentres = AppDB.getAllCentres();
    const phoneExists = existingCentres.some(c => c.phone === data.phone);
    if (phoneExists) {
      throw new Error('A centre is already registered with this mobile number.');
    }
    const emailExists = existingCentres.some(c => c.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      throw new Error('A centre is already registered with this email address.');
    }

    // Generate state prefix and unique Centre ID
    const stateCodes = {
      'West Bengal': 'WB', 'Delhi': 'DL', 'Maharashtra': 'MH', 'Karnataka': 'KA',
      'Tamil Nadu': 'TN', 'Uttar Pradesh': 'UP', 'Gujarat': 'GJ', 'Bihar': 'BR',
      'Rajasthan': 'RJ', 'Punjab': 'PB', 'Haryana': 'HR', 'Madhya Pradesh': 'MP'
    };
    const prefix = stateCodes[data.state] || 'IND';
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const centreId = `${prefix}-PUC-${randDigits}`;
    const id = 'centre_' + Date.now();

    const newCentre = {
      id: id,
      centreId: centreId,
      name: data.name.trim(),
      ownerName: data.ownerName.trim(),
      phone: data.phone.trim(),
      whatsapp: data.whatsapp ? data.whatsapp.trim() : data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      address: data.address.trim(),
      state: data.state || 'West Bengal',
      district: data.district || '',
      pin: data.pin || '',
      location: data.location || '',
      mapLink: data.mapLink || '',
      password: data.password, // In production, hashed via Firebase Auth / bcrypt
      status: 'pending', // PENDING APPROVAL - Super Admin must approve
      role: 'centre',
      plan: 'basic',
      subscriptionValidTill: new Date(Date.now() + 14 * 86400000).toISOString(), // 14-day trial
      registeredAt: new Date().toISOString(),
      waConnected: false
    };

    AppDB.saveCentre(newCentre);

    // Initial empty vehicle list & default template
    AppDB.saveVehicles([], id);
    AppDB.saveSettings({
      centreName: newCentre.name,
      ownerName: newCentre.ownerName,
      phone: newCentre.phone,
      whatsapp: newCentre.whatsapp,
      address: newCentre.address,
      location: newCentre.location,
      mapLink: newCentre.mapLink,
      waTemplate: `Dear *{owner}*, your vehicle *{vno}* PUC certificate is expiring on *{exp}*.

Contact: {center}
Mob No: {phone}
Address: {address}
Location: {location}
Google Maps: {map_link}`,
      smsTemplate: `Dear {owner}, PUC for vehicle {vno} expires on {exp}. Please renew at {center}. Call {phone}.`,
      autoRemindersEnabled: true,
      remindDays: [30, 7, 3]
    }, id);

    return newCentre;
  },

  // Login
  login(identifier, password, asSuperAdmin = false) {
    if (!identifier || !password) {
      throw new Error('Please enter username/mobile/email and password.');
    }

    // Super Admin Login check
    if (asSuperAdmin || identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@autopollution.com') {
      if (password === 'Admin@123' || password === 'admin') {
        const adminSession = {
          id: 'super_admin_master',
          centreId: 'SUPER-ADMIN',
          name: 'Super Administrator',
          role: 'admin',
          email: 'admin@autopollution.com',
          status: 'approved'
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(adminSession));
        return adminSession;
      } else {
        throw new Error('Invalid Super Admin credentials.');
      }
    }

    // Centre Login
    const cleanId = identifier.trim().toLowerCase();
    const centres = AppDB.getAllCentres();
    const centre = centres.find(c => 
      c.email.toLowerCase() === cleanId || 
      c.phone === identifier.trim() || 
      c.centreId.toLowerCase() === cleanId
    );

    if (!centre) {
      throw new Error('No registered centre found with this Email, Mobile, or Centre ID.');
    }

    if (centre.password && centre.password !== password) {
      throw new Error('Incorrect password. Please try again or use Forgot Password.');
    }

    // Check Approval Status
    if (centre.status === 'pending') {
      const err = new Error('Your centre registration is currently PENDING approval from Super Admin. Once approved, you can log in immediately.');
      err.code = 'PENDING_APPROVAL';
      err.centre = centre;
      throw err;
    }

    if (centre.status === 'rejected') {
      const reason = centre.rejectionReason ? ` Reason: ${centre.rejectionReason}` : '';
      throw new Error(`Your application was rejected.${reason} Please contact support.`);
    }

    if (centre.status === 'suspended') {
      throw new Error('Your centre account has been suspended. Please contact AutoPollution Pro Support.');
    }

    // Successful login session
    const session = {
      id: centre.id,
      centreId: centre.centreId,
      name: centre.name,
      ownerName: centre.ownerName,
      phone: centre.phone,
      email: centre.email,
      role: 'centre',
      status: centre.status,
      plan: centre.plan || 'basic',
      subscriptionValidTill: centre.subscriptionValidTill,
      waConnected: centre.waConnected
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    AppDB.setCurrentUser(session);
    return session;
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    AppDB.setCurrentUser(null);
  },

  // Require Authenticated User
  requireAuth(requiredRole = 'centre') {
    const session = this.initSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    if (requiredRole === 'admin' && session.role !== 'admin') {
      window.location.href = 'dashboard.html';
      return null;
    }
    return session;
  }
};

window.AppAuth = AppAuth;
