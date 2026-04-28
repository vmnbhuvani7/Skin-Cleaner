'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PUBLIC_ROUTES, AUTH_ROUTES, DEFAULT_LOGIN_REDIRECT, DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';
import Loader from '@/components/ui/Loader';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (token) {
      // Logged in: only redirect away from auth pages like login/signup
      if (isAuthRoute) {
        router.replace(DEFAULT_LOGIN_REDIRECT);
      } else {
        setLoading(false);
      }
    } else {
      // Not logged in: redirect away if the route is NOT public (so all new routes are private by default)
      if (!isPublicRoute) {
        router.replace(DEFAULT_LOGOUT_REDIRECT);
      } else {
        setLoading(false);
      }
    }
  }, [pathname, router]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return <>{children}</>;
}


