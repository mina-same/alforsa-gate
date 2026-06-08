import React, { lazy } from 'react';
import type { AuthContextValue } from '@hooks/useAuth';
import DashboardLayout from '@app/DashboardLayout';
import NotFound from '@/pages/NotFound';

const AuthPage = lazy(() => import('@pages/AuthPage'));
const ForgotPassword = lazy(() => import('@/components/auth/ForgotPassword'));
const SecuritySettingsPage = lazy(() => import('@/pages/SecuritySettingsPage'));
const PasswordSettingsPage = lazy(() => import('@/pages/PasswordSettingsPage'));
const TwoFactorSettingsPage = lazy(() => import('@/pages/TwoFactorSettingsPage'));
const EmailInboxPage = lazy(() => import('@/pages/EmailInboxPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));

export const ROUTE_PATHS = {
  root: '/',
  login: '/login',
  forgot: '/forgot-password',
  signup: '/signup',
  otp: '/otp',
  profile: '/profile',
  profileAnalytics: '/profile/analytics',
  profileAccount: '/profile/account',
  editProfile: '/profile/edit',
  notifications: '/profile/notifications',
  security: '/profile/security',
  passwordSettings: '/profile/security/password',
  twoFactorSettings: '/profile/security/2fa',
  resetPassword: '/profile/account/reset-password',
  email: '/email',
  privacyPolicy: '/privacy-policy',
  notfound:'/*'
} as const;

export type RouteAccess = 'public' | 'auth' | 'guest';

export interface AppRoute {
  path: string;
  access?: RouteAccess;
  render: (auth: AuthContextValue) => React.ReactNode;
}

export const ROUTE_CONFIG: AppRoute[] = [
  {
    path: ROUTE_PATHS.privacyPolicy,
    access: 'public',
    render: () => <PrivacyPolicyPage />,
  },
  {
    path: ROUTE_PATHS.login,
    access: 'guest',
    render: auth => <AuthPage onSuccess={auth.login} />,
  },
  {
    path: ROUTE_PATHS.signup,
    access: 'guest',
    render: auth => <AuthPage onSuccess={auth.login} />,
  },
  {
    path: ROUTE_PATHS.forgot,
    access: 'guest',
    render: auth => <ForgotPassword />,
  },
  {
    path: ROUTE_PATHS.otp,
    access: 'guest',
    render: auth => <ForgotPassword />,
  },
  {
    path: ROUTE_PATHS.profile,
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: ROUTE_PATHS.profileAnalytics,
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: ROUTE_PATHS.profileAccount,
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: ROUTE_PATHS.editProfile,
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: ROUTE_PATHS.notifications,
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: ROUTE_PATHS.security,
    access: 'auth',
    render: () => <SecuritySettingsPage />,
  },
  {
    path: ROUTE_PATHS.passwordSettings,
    access: 'auth',
    render: () => <PasswordSettingsPage />,
  },
  {
    path: ROUTE_PATHS.twoFactorSettings,
    access: 'auth',
    render: () => <TwoFactorSettingsPage />,
  },
  {
    path: ROUTE_PATHS.resetPassword,
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: '/settings',
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: ROUTE_PATHS.root,
    access: 'auth',
    render: () => <DashboardLayout />,
  },
  {
    path: ROUTE_PATHS.notfound,
    access: 'auth',
    render: () => <NotFound />,
  },
  {
    path: ROUTE_PATHS.email,
    access: 'auth',
    render: () => <DashboardLayout />,
  },

];
