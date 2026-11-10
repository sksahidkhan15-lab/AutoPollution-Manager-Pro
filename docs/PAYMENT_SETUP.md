# Payment Gateway Integration Guide (Razorpay India)

## 1. Gateway Architecture
AutoPollution Manager Pro integrates with **Razorpay** to process UPI, Debit/Credit Cards, Net Banking, and Wallets across India.

### Security Rule:
**Never activate a subscription merely because the frontend says payment succeeded.** The subscription is only extended after:
1. The backend verifies the cryptographic HMAC-SHA256 signature (`razorpay_order_id + "|" + razorpay_payment_id` with `RAZORPAY_KEY_SECRET`).
2. Or an authenticated webhook event `payment.captured` is received from Razorpay.

---

## 2. Credentials Configuration
1. Register at [dashboard.razorpay.com](https://dashboard.razorpay.com/).
2. Navigate to Settings > API Keys.
3. Generate your **Key ID** (`rzp_live_...`) and **Key Secret**.
4. Configure in backend environment variables:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`

---

## 3. Webhook Setup
In Razorpay Dashboard > Settings > Webhooks:
- **Webhook URL**: `https://YOUR_BACKEND_DOMAIN/webhooks/razorpay`
- **Secret**: Set a strong random secret and add to backend config.
- **Active Events**: Check `payment.captured`, `order.paid`, `payment.failed`.
