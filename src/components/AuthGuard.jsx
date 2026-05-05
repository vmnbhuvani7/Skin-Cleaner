'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PUBLIC_ROUTES, AUTH_ROUTES, DEFAULT_LOGIN_REDIRECT, DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';
import { hasAccess } from '@/utils/roleUtils';
import Loader from '@/components/ui/Loader';
import { toast } from 'react-toastify';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    let shouldRedirect = false;
    let targetPath = '';

    if (token) {
      if (isAuthRoute) {
        shouldRedirect = true;
        targetPath = DEFAULT_LOGIN_REDIRECT;
      } else {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userRole = user?.role?.name || 'Organization';
        
        if (!isPublicRoute && !hasAccess(userRole, pathname)) {
          toast.error('You do not have permission to access this page');
          shouldRedirect = true;
          targetPath = DEFAULT_LOGIN_REDIRECT;
        }
      }
    } else {
      if (!isPublicRoute) {
        shouldRedirect = true;
        targetPath = DEFAULT_LOGOUT_REDIRECT;
      }
    }

    if (shouldRedirect && pathname !== targetPath) {
      setIsRedirecting(true);
      router.replace(targetPath);
      // Safety timeout to clear loading if navigation takes too long or fails
      const timer = setTimeout(() => {
        setIsRedirecting(false);
        setIsInitialized(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRedirecting(false);
      setIsInitialized(true);
    }
  }, [pathname, router]);

  if (!isInitialized || isRedirecting) {
    return <Loader fullScreen />;
  }

  return <>{children}</>;
}


