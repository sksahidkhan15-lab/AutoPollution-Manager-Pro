/**
 * AutoPollution Manager Pro - Indian DLT SMS Gateway Integration Service
 * Supports TRAI / DLT compliant header sender IDs, entity IDs, and template IDs.
 */

const axios = require('axios');

async function sendSmsMessage({ provider, apiKey, senderId, entityId, templateId, mobile, message }) {
  if (!apiKey || !senderId) {
    throw new Error('DLT SMS Provider credentials unconfigured.');
  }

  let cleanMobile = mobile.replace(/\D/g, '').slice(-10);

  // Standard Indian SMS Provider HTTP API pattern (e.g. Fast2SMS / Textlocal / Msg91)
  const endpoint = process.env.SMS_GATEWAY_URL || 'https://api.sms-provider.in/v1/send';

  try {
    const response = await axios.post(endpoint, {
      sender_id: senderId,
      entity_id: entityId,
      template_id: templateId,
      recipient: cleanMobile,
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    });

    return {
      status: 'sent',
      messageId: response.data.message_id || 'sms_' + Date.now(),
      raw: response.data
    };
  } catch (err) {
    const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    throw new Error(`DLT SMS Gateway Error: ${msg}`);
  }
}

module.exports = { sendSmsMessage };
