const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key);
const PRICE_ID = process.env.STRIPE_PRICE_ID || functions.config().stripe?.price_id;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe?.webhook_secret;

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const uid = context.auth.uid;
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();

  let customerId = userData?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: context.auth.token.email,
      metadata: { firebaseUID: uid }
    });
    customerId = customer.id;
    await db.collection('users').doc(uid).update({ stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    mode: 'subscription',
    success_url: `${data.returnUrl}?success=true`,
    cancel_url: `${data.returnUrl}?canceled=true`,
    metadata: { firebaseUID: uid }
  });

  return { sessionId: session.id, url: session.url };
});

exports.createPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const uid = context.auth.uid;
  const userDoc = await db.collection('users').doc(uid).get();
  const customerId = userDoc.data()?.stripeCustomerId;

  if (!customerId) throw new functions.https.HttpsError('not-found', 'No subscription found');

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: data.returnUrl,
  });

  return { url: session.url };
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { type, data: eventData } = event;

  try {
    switch (type) {
      case 'checkout.session.completed': {
        const session = eventData.object;
        const uid = session.metadata.firebaseUID;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await db.collection('users').doc(uid).update({
          'subscription.status': 'active',
          'subscription.stripeSubscriptionId': session.subscription,
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': false
        });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = eventData.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const uid = customer.metadata.firebaseUID;
        await db.collection('users').doc(uid).update({
          'subscription.status': subscription.status,
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = eventData.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const uid = customer.metadata.firebaseUID;
        await db.collection('users').doc(uid).update({ 'subscription.status': 'expired' });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = eventData.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        const uid = customer.metadata.firebaseUID;
        await db.collection('users').doc(uid).update({ 'subscription.status': 'past_due' });
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).send('Webhook processing failed');
  }
});

exports.getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const uid = context.auth.uid;
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();

  if (!userData) throw new functions.https.HttpsError('not-found', 'User not found');

  const subscription = userData.subscription || {};
  const createdAt = userData.createdAt ? new Date(userData.createdAt) : new Date();
  const trialEndsAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();

  let status = subscription.status || 'trialing';
  let isActive = false;
  let daysLeft = 0;

  if (status === 'active') {
    isActive = true;
    if (subscription.currentPeriodEnd) {
      const periodEnd = subscription.currentPeriodEnd.toDate ? subscription.currentPeriodEnd.toDate() : new Date(subscription.currentPeriodEnd);
      daysLeft = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));
    }
  } else if (now < trialEndsAt) {
    status = 'trialing';
    isActive = true;
    daysLeft = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));
  } else {
    status = subscription.status || 'expired';
    isActive = false;
  }

  return { status, isActive, daysLeft, trialEndsAt: trialEndsAt.toISOString(), cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false };
});
