# RupantorPay Payment Gateway Integration

This document provides complete setup instructions for integrating RupantorPay payment gateway into your Submonth digital product marketplace.

## 🚀 Quick Setup

### 1. Get API Key

1. Sign up or log in to [RupantorPay](https://rupantorpay.com)
2. Go to the **Brands** section
3. Create a new brand or select existing one
4. Copy your **API Key**

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# RupantorPay Configuration
RUPANTORPAY_API_KEY=your_actual_api_key_here

# Base URL Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_HOST=localhost

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Brand Name
```

### 3. Configure Webhook

In your RupantorPay dashboard, set the webhook URL to:
```
https://yourdomain.com/api/payment/webhook
```

For local testing, use:
```
http://localhost:3000/api/payment/webhook
```

## 📋 Integration Features

### ✅ What's Included

- **Payment Initialization**: Create payment requests with order details
- **Payment Verification**: Verify completed transactions
- **Webhook Handling**: Real-time payment status updates
- **Success/Cancel Pages**: Professional payment result pages
- **Order Management**: Automatic order status updates
- **Email Notifications**: Purchase confirmation emails
- **Multi-Currency Support**: USD and BDT support
- **Mobile Responsive**: Works on all devices

### 💳 Supported Payment Methods

- bKash
- Nagad
- Rocket
- Credit/Debit Cards (Visa, Mastercard)
- Mobile Banking
- Other local payment methods

## 🔧 API Endpoints

### Payment Creation
```
POST /api/payment/create
```

### Payment Verification
```
POST /api/payment/verify
```

### Webhook Handler
```
POST /api/payment/webhook
```

### Configuration Check
```
GET /api/payment/config
```

## 📱 Payment Flow

1. **Customer Checkout**: Customer fills in contact information
2. **Order Creation**: Order is created with "pending" status
3. **Payment Redirect**: Customer is redirected to RupantorPay
4. **Payment Processing**: Customer completes payment on RupantorPay
5. **Success Redirect**: Customer returns to success page
6. **Payment Verification**: System verifies payment with RupantorPay
7. **Order Completion**: Order status updated to "completed"
8. **Email Delivery**: Digital products delivered via email

## 🛠️ Testing

### Test Mode
RupantorPay uses the same URL for both sandbox and live environments. Use test credentials provided by RupantorPay for testing.

### Test Cards/Mobile Numbers
Use test credentials provided by RupantorPay dashboard for testing different payment methods.

### Local Testing
For local development, you can use:
- Base URL: `http://localhost:3000`
- Webhook URL: `http://localhost:3000/api/payment/webhook`

## 🔒 Security Features

- **API Key Authentication**: Secure API communication
- **Webhook Verification**: Optional signature verification
- **Order Validation**: Prevents duplicate payments
- **Secure Redirects**: HTTPS-only redirects in production
- **Data Encryption**: All sensitive data encrypted

## 📄 File Structure

```
src/
├── lib/
│   └── rupantorpay.ts          # RupantorPay service configuration
├── app/
│   ├── api/payment/
│   │   ├── create/
│   │   │   └── route.ts        # Payment creation API
│   │   ├── verify/
│   │   │   └── route.ts        # Payment verification API
│   │   ├── webhook/
│   │   │   └── route.ts        # Webhook handler
│   │   └── config/
│   │       └── route.ts        # Configuration endpoint
│   ├── payment/
│   │   ├── success/
│   │   │   └── page.tsx        # Payment success page
│   │   └── cancel/
│   │       └── page.tsx        # Payment cancel page
│   └── checkout/
│       └── page.tsx            # Updated checkout page
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify API key is copied correctly
   - Check if brand is active in RupantorPay dashboard
   - Ensure no extra spaces in API key

2. **Webhook Not Receiving**
   - Check webhook URL is correct and accessible
   - Verify firewall isn't blocking requests
   - Use ngrok for local testing if needed

3. **Payment Verification Failing**
   - Ensure transaction ID is passed correctly
   - Check API key has proper permissions
   - Verify payment is actually completed

4. **Redirect Issues**
   - Check success/cancel URLs are correct
   - Ensure URLs are accessible
   - Use HTTPS in production

### Debug Mode

Enable debug logging by checking browser console and server logs for detailed error messages.

## 📞 Support

For RupantorPay-specific issues:
- Contact RupantorPay support
- Check their documentation at [RupantorPay Docs](https://rupantorpay.com/docs)

For integration issues:
- Check the API endpoints at `/api/payment/config`
- Review server logs for detailed error messages
- Verify all environment variables are set correctly

## 🔄 Updates

This integration follows RupantorPay's official API documentation and will be updated as they release new features or make changes to their API.

---

**Note**: Always test thoroughly in sandbox mode before going live with real payments.