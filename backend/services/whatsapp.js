/**
 * AutoPollution Manager Pro - Meta WhatsApp Cloud API Service (Graph API v19.0)
 * Uses official Meta Developer App credentials and Embedded Signup.
 */

const axios = require('axios');

const META_GRAPH_VERSION = 'v19.0';
const META_BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * Dispatches an approved WhatsApp message template or session message
 * using the centre's own connected Phone Number ID and Bearer Token.
 */
async function sendWhatsAppMessage({ phoneId, accessToken, recipientPhone, messageText, templateName, variables }) {
  if (!phoneId || !accessToken) {
    throw new Error('Missing Meta WhatsApp credentials for this centre.');
  }

  // Clean phone number to international 91 format
  let cleanNumber = recipientPhone.replace(/\D/g, '');
  if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;

  const url = `${META_BASE_URL}/${phoneId}/messages`;

  // Payload for template message (required for notifications outside 24-hr customer window)
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanNumber,
    type: 'template',
    template: {
      name: templateName || 'puc_renewal_reminder',
      language: {
        code: 'en'
      },
      components: [
        {
          type: 'body',
          parameters: (variables || []).map(val => ({
            type: 'text',
            text: String(val)
          }))
        }
      ]
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const messageId = response.data.messages && response.data.messages[0] ? response.data.messages[0].id : null;
    return {
      status: 'sent',
      messageId: messageId,
      raw: response.data
    };
  } catch (error) {
    const errorDetails = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Meta WhatsApp Cloud API error: ${errorDetails}`);
  }
}

/**
 * Exchanges Meta Embedded Signup authorization code for permanent System User Access Token
 */
async function exchangeMetaOAuthCode(authCode, appId, appSecret) {
  const url = `${META_BASE_URL}/oauth/access_token`;
  const response = await axios.get(url, {
    params: {
      client_id: appId,
      client_secret: appSecret,
      code: authCode
    }
  });
  return response.data;
}

module.exports = {
  sendWhatsAppMessage,
  exchangeMetaOAuthCode
};
