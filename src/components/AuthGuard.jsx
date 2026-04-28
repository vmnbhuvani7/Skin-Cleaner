'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PUBLIC_ROUTES, DEFAULT_LOGIN_REDIRECT, DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';
import Loader from '@/components/ui/Loader';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (token) {
      if (isPublicRoute) {
        router.replace(DEFAULT_LOGIN_REDIRECT);
      } else {
        setLoading(false);
      }
    } else {
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


