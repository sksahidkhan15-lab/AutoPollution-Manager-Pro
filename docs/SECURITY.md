# Security & Multi-Tenant Compliance Guide

## 1. Multi-Tenant Cryptographic Isolation
Each Pollution Testing Centre is provisioned as an independent tenant:
- All database read/write queries are strictly partitioned by `centreId`.
- Firestore Security Rules evaluate `request.auth.uid == centreId` for all document interactions.
- Super Admin operations require `request.auth.token.role == 'admin'`.

---

## 2. Token & Secret Management
- **Zero Token Exposure in Frontend**: Meta WhatsApp Access Tokens, Razorpay Secret Keys, and backend database administrative keys are never delivered to client browsers.
- **Server-Side Token Storage**: WhatsApp WABA access tokens are stored in private server-side Firestore partitions inaccessible to client SDKs.

---

## 3. Regulatory TRAI / DLT & DPDP Act Compliance
- **Customer Consent**: The system tracks explicit customer consent status (`consentGiven: true/false`), timestamp, and opt-out mechanisms.
- **TRAI Anti-Spam (UCC) Guard**: Daily automated jobs strictly enforce duplicate message suppression, ensuring no recipient receives more than one reminder within a 20-hour window.
- **Zero Data Deletion on Expiry**: If a testing centre's subscription lapses, all vehicle records and compliance certificates are retained in read-only mode and are never deleted.
