# Stripe Configuration Guide

## Prerequisites

- Stripe account (https://dashboard.stripe.com/register)
- Firebase project with Functions enabled

## Step 1: Get API Keys

1. Go to [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)
2. Copy your keys:
   - **Publishable key**: `pk_test_xxx...` (starts with `pk_`)
   - **Secret key**: `sk_test_xxx...` (starts with `sk_`)

> Use `test` keys for development, `live` keys for production

## Step 2: Create Product & Price

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click **"Add Product"**
3. Fill in:
   - **Name**: `micro.log Pro`
   - **Description**: `Unlimited encrypted micro-journaling`
4. Add a price:
   - **Pricing model**: Recurring
   - **Amount**: `$2.00`
   - **Billing period**: Monthly
5. Save and copy the **Price ID**: `price_xxx...`

## Step 3: Configure Environment Variables

### Frontend (.env)

Create `/home/user/micro-log/.env`:

```bash
cp .env.example .env
```

Edit `.env` and add:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Backend (functions/.env)

Create `/home/user/micro-log/functions/.env`:

```bash
cp functions/.env.example functions/.env
```

Edit `functions/.env` and add:

```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PRICE_ID=price_your_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Add after Step 5
```

## Step 4: Deploy Functions

```bash
cd functions
npm install
npm run deploy
```

Note the function URL after deployment:
```
✔ functions[stripeWebhook]: https://us-central1-YOUR_PROJECT.cloudfunctions.net/stripeWebhook
```

## Step 5: Configure Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your function URL:
   ```
   https://us-central1-YOUR_PROJECT.cloudfunctions.net/stripeWebhook
   ```
4. Select events to listen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret**: `whsec_xxx...`
7. Add it to `functions/.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
8. Re-deploy functions:
   ```bash
   npm run deploy
   ```

## Step 6: Test the Integration

### Test with Stripe CLI (recommended)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local emulator
stripe listen --forward-to localhost:5001/YOUR_PROJECT/us-central1/stripeWebhook

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### Test Cards

| Scenario | Card Number |
|----------|-------------|
| Success | `4242 4242 4242 4242` |
| Decline | `4000 0000 0000 0002` |
| Requires auth | `4000 0025 0000 3155` |

Use any future expiry date and any 3-digit CVC.

## Checklist

- [ ] Publishable key in `.env`
- [ ] Secret key in `functions/.env`
- [ ] Price ID in `functions/.env`
- [ ] Functions deployed
- [ ] Webhook endpoint created in Stripe
- [ ] Webhook secret in `functions/.env`
- [ ] Functions re-deployed with webhook secret
- [ ] Test payment completed successfully

## Troubleshooting

### "No such price" error
- Verify `STRIPE_PRICE_ID` matches exactly (including `price_` prefix)

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Re-deploy functions after adding the secret

### Subscription not updating after payment
- Check Firebase Functions logs: `npm run logs`
- Verify webhook events are being received in Stripe Dashboard
