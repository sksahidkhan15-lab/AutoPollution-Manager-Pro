# Meta WhatsApp Cloud API & Embedded Signup Guide

## 1. Architecture Overview
AutoPollution Manager Pro utilizes one central **Meta Developer App** managed by the platform owner, while allowing individual Pollution Testing Centres to connect their own **WhatsApp Business Account (WABA)** and business phone number via **Meta Embedded Signup**.

This ensures:
- Reminders are dispatched from each centre's official business phone number.
- No centre can view or use another centre's WhatsApp connection.
- Zero risk of token exposure in client-side code.

---

## 2. Setting Up the Central Meta Developer App
1. Go to [developers.facebook.com](https://developers.facebook.com/) and create a Business App.
2. Add the **WhatsApp** product.
3. In WhatsApp > Quickstart, note your **App ID** and **App Secret**.
4. Configure **Embedded Signup** under WhatsApp > Configuration:
   - Allowed redirect URIs: `https://YOUR_DOMAIN/settings.html`
   - Scopes: `whatsapp_business_management`, `whatsapp_business_messaging`.

---

## 3. Webhook Configuration
1. In Meta App Dashboard, navigate to WhatsApp > Configuration > Webhook.
2. Set Callback URL: `https://YOUR_BACKEND_DOMAIN/webhooks/whatsapp`.
3. Set Verify Token: The value defined in `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
4. Subscribe to the `messages` event field to receive delivery receipts (`sent`, `delivered`, `read`, `failed`).

---

## 4. Message Template Submission
Submit the following standard utility template for PUC renewal alerts in WhatsApp Business Manager:
- **Template Name**: `puc_renewal_reminder`
- **Category**: `UTILITY`
- **Language**: English (`en`)
- **Body**:
  ```
  Dear {{1}}, your vehicle {{2}} PUC certificate is expiring on {{3}}.

  Contact: {{4}}
  Mob No: {{5}}
  ```
- **Sample Values**: `Arun Mukherjee`, `WB02AL4589`, `15-Dec-2026`, `Maa Tara Emission Centre`, `9876543210`.
