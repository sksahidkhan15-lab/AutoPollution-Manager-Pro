/**
 * AutoPollution Manager Pro - Messaging & WhatsApp Integration Engine
 * Provides:
 * 1. FREE One-Click WhatsApp & SMS (Available on ALL plans: Basic, Standard, Premium)
 * 2. Meta WhatsApp Cloud API Client & Embedded Signup Management
 * 3. Native Android Intent launching via WebAppBridge
 */

const MessagingEngine = {
  // Generate WhatsApp Message with Strict Formatting:
  // "Only owner name, vehicle number and expiry date should be bold in WhatsApp"
  generateWhatsAppMessage(vehicle, settings) {
    const ownerBold = `*${vehicle.owner || 'Customer'}*`;
    const vnoBold = `*${vehicle.vno || 'Vehicle'}*`;
    const expBold = `*${vehicle.expDate || 'Soon'}*`;
    
    const center = settings.centreName || 'Pollution Testing Centre';
    const phone = settings.phone || '';
    const address = settings.address || '';
    const location = settings.location || '';
    const mapLink = settings.mapLink || '';

    // If centre customized template, substitute variables
    if (settings.waTemplate) {
      return settings.waTemplate
        .replace(/\{owner\}/g, ownerBold)
        .replace(/\{vno\}/g, vnoBold)
        .replace(/\{exp\}/g, expBold)
        .replace(/\{center\}/g, center)
        .replace(/\{phone\}/g, phone)
        .replace(/\{address\}/g, address)
        .replace(/\{location\}/g, location)
        .replace(/\{map_link\}/g, mapLink);
    }

    return `Dear ${ownerBold}, your vehicle ${vnoBold} PUC certificate is expiring on ${expBold}.

Contact: ${center}
Mob No: ${phone}
Address: ${address}
Location: ${location}
Google Maps: ${mapLink}`;
  },

  // Generate Standard SMS Message
  generateSMSMessage(vehicle, settings) {
    const center = settings.centreName || 'Pollution Testing Centre';
    const phone = settings.phone || '';
    if (settings.smsTemplate) {
      return settings.smsTemplate
        .replace(/\{owner\}/g, vehicle.owner || 'Customer')
        .replace(/\{vno\}/g, vehicle.vno || 'Vehicle')
        .replace(/\{exp\}/g, vehicle.expDate || 'Soon')
        .replace(/\{center\}/g, center)
        .replace(/\{phone\}/g, phone);
    }
    return `Dear ${vehicle.owner}, PUC for vehicle ${vehicle.vno} expires on ${vehicle.expDate}. Please visit ${center} to renew. Contact: ${phone}.`;
  },

  // Format Phone Number with India +91 prefix
  cleanIndiaPhone(phone) {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return '91' + digits;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return digits;
    }
    return digits;
  },

  // One-Click WhatsApp: Opens WhatsApp with prefilled message
  sendOneClickWhatsApp(vehicle, customMessage = null) {
    const centreId = AppDB.getCurrentCentreId();
    const settings = AppDB.getSettings(centreId);
    const targetPhone = vehicle.whatsapp || vehicle.phone;
    const formattedPhone = this.cleanIndiaPhone(targetPhone);
    const message = customMessage || this.generateWhatsAppMessage(vehicle, settings);
    const encodedMsg = encodeURIComponent(message);

    // Check if running in Android Native App container
    if (window.AndroidBridge && typeof window.AndroidBridge.openWhatsApp === 'function') {
      window.AndroidBridge.openWhatsApp(formattedPhone, message);
    } else {
      // Standard browser wa.me link
      const waUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
    }

    // Log reminder in Centre's history
    AppDB.logReminder({
      vehicleId: vehicle.id,
      customerName: vehicle.owner,
      vehicleNo: vehicle.vno,
      phone: targetPhone,
      type: 'One-Click WhatsApp',
      status: 'sent',
      message: message,
      cost: 'FREE (Software Feature)'
    }, centreId);

    return true;
  },

  // One-Click SMS: Opens native SMS application with prefilled message
  sendOneClickSMS(vehicle, customMessage = null) {
    const centreId = AppDB.getCurrentCentreId();
    const settings = AppDB.getSettings(centreId);
    const targetPhone = vehicle.phone;
    const message = customMessage || this.generateSMSMessage(vehicle, settings);
    const encodedMsg = encodeURIComponent(message);

    // Check if running in Android Native App container
    if (window.AndroidBridge && typeof window.AndroidBridge.openSMS === 'function') {
      window.AndroidBridge.openSMS(targetPhone, message);
    } else {
      // Browser standard sms: URI
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const smsUrl = isIOS ? `sms:${targetPhone}&body=${encodedMsg}` : `sms:${targetPhone}?body=${encodedMsg}`;
      window.location.href = smsUrl;
    }

    // Log reminder
    AppDB.logReminder({
      vehicleId: vehicle.id,
      customerName: vehicle.owner,
      vehicleNo: vehicle.vno,
      phone: targetPhone,
      type: 'One-Click SMS',
      status: 'sent',
      message: message,
      cost: 'FREE (Software Feature)'
    }, centreId);

    return true;
  },

  // Meta WhatsApp Cloud API Simulation & Test Sender
  async sendMetaCloudApiMessage(vehicle, templateName = 'puc_expiry_alert') {
    const centreId = AppDB.getCurrentCentreId();
    const centre = AppDB.getCentreById(centreId);

    if (!centre.waConnected || !centre.phoneId) {
      throw new Error('Meta WhatsApp Cloud API is not connected for your centre. Please connect via Settings > WhatsApp.');
    }

    // Check customer consent
    if (vehicle.consentGiven === false) {
      throw new Error(`Customer ${vehicle.owner} has opted out of automated reminders.`);
    }

    // Simulate API call to Meta WhatsApp Cloud API (Graph API v19.0)
    // POST https://graph.facebook.com/v19.0/{phone-number-id}/messages
    const success = Math.random() > 0.05; // 95% realistic delivery rate

    if (success) {
      AppDB.logReminder({
        vehicleId: vehicle.id,
        customerName: vehicle.owner,
        vehicleNo: vehicle.vno,
        phone: vehicle.whatsapp || vehicle.phone,
        type: 'Automated Meta Cloud API',
        status: 'sent',
        apiMessageId: 'wamid.HBgL' + Math.random().toString(36).substring(2, 10),
        template: templateName,
        cost: 'Included in Plan'
      }, centreId);
      return { success: true };
    } else {
      const errorMsg = 'Meta API Error #131026: Message undeliverable to recipient number.';
      AppDB.logReminder({
        vehicleId: vehicle.id,
        customerName: vehicle.owner,
        vehicleNo: vehicle.vno,
        phone: vehicle.whatsapp || vehicle.phone,
        type: 'Automated Meta Cloud API',
        status: 'failed',
        failureReason: errorMsg
      }, centreId);
      throw new Error(errorMsg);
    }
  }
};

window.MessagingEngine = MessagingEngine;
