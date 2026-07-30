'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Platform is currently free (Stripe disabled for now) — the paid plans page
 * is retired. Any visitor is redirected to their area, or to login.
 * Kept as a route so old links / bookmarks don't 404, and so paid plans can
 * be re-enabled later by restoring this page.
 */
export default function PlansPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'care_giver') router.replace('/caregiver');
    else if (user.role === 'care_recipient') router.replace('/dashboard');
    else if (user.role === 'admin') router.replace('/admin');
    else if (user.role === 'support') router.replace('/support');
    else router.replace('/');
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
    </div>
  );
}
