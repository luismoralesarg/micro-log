import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export function useSubscription(user) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    try {
      const getStatus = httpsCallable(functions, 'getSubscriptionStatus');
      const result = await getStatus();
      setSubscription(result.data);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setSubscription({ status: 'trialing', isActive: true, daysLeft: 14 });
    }
    setLoading(false);
  };

  const subscribe = async () => {
    const createCheckout = httpsCallable(functions, 'createCheckoutSession');
    const result = await createCheckout({ returnUrl: window.location.origin });
    window.location.href = result.data.url;
  };

  const manageSubscription = async () => {
    const createPortal = httpsCallable(functions, 'createPortalSession');
    const result = await createPortal({ returnUrl: window.location.href });
    window.location.href = result.data.url;
  };

  return { subscription, loading, subscribe, manageSubscription, refresh: checkSubscription };
}
