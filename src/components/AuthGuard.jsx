'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PUBLIC_ROUTES, DEFAULT_LOGIN_REDIRECT, DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
