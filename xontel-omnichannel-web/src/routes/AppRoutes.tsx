import React, { Suspense, useMemo, useEffect } from 'react';
import { useRoutes, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '@hooks/useAuth';
import { ROUTE_CONFIG } from './config';
import { Skeleton } from '@components/ui/skeleton';
import NotFound from '@pages/NotFound';
import AccessGuard from './guards/AccessGuard';
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '../i18n';

const AppRoutesSkeletonFallback = () => {
  return (
    <div className="min-h-screen bg-xon-surface text-xon-text-primary flex flex-col">
      <div className="grid lg:grid-cols-2 flex-1">
        {/* Left side / marketing panel (hidden on mobile) */}
        <div className="relative hidden lg:flex flex-col justify-between border-r border-xon-surface-outline px-12 py-10 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Logo at top */}
            <div className="mb-4">
              <Skeleton className="h-12 w-32 rounded-md" />
            </div>

            {/* Text in middle */}
            <div className="space-y-4 max-w-md">
              <Skeleton variant="text" className="h-10 w-3/4" />
              <Skeleton variant="text" className="h-4 w-full" />
            </div>

            {/* Copyright footer */}
            <Skeleton variant="text" className="h-3 w-48" />
          </div>
        </div>

        {/* Right side / auth card */}
        <div className="flex flex-col px-12 py-10 bg-xon-surface">
          <div className="flex-1 flex items-center">
            <div className="mx-auto w-full max-w-md space-y-6">
              <div className="flex flex-col space-y-2">
                <Skeleton variant="text" className="h-8 w-1/2" />
                <Skeleton variant="text" className="h-4 w-3/4" />
              </div>

              <div className="bg-xon-surface-container border border-xon-surface-outline rounded-xl p-6 shadow-md backdrop-blur">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-4 w-20" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-4 w-24" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>

                  <div className="flex justify-end">
                    <Skeleton variant="text" className="h-3 w-24" />
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-xon-surface-outline" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-xon-surface-container px-2 text-xon-text-secondary">
                          <Skeleton className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-md" />

                  <div className="mt-4 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-xon-surface-outline" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-xon-surface-container px-2 text-xon-text-secondary">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </div>
                </div>

                <Skeleton variant="text" className="h-3 w-1/2 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AppRoutes() {
  const auth = useAuth();

  const routes = useMemo(
    () => [
      ...ROUTE_CONFIG.map(route => ({
        path: route.path,
        element: (
          <AccessGuard access={route.access} isAuthenticated={auth.isAuthenticated}>
            {route.render(auth)}
          </AccessGuard>
        ),
      })),
      { path: '*', element: <NotFound /> },
    ],
    [auth]
  );

  const element = useRoutes(routes);

  return <Suspense fallback={<AppRoutesSkeletonFallback />}>{element}</Suspense>;
}



