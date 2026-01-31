/**
 * Route Guard Component
 * Validates conditions before rendering route content
 * Renders fallback component if condition fails
 */

import { ReactNode, ReactElement } from 'react';

interface RouteGuardProps {
  children: ReactNode;
  condition: boolean;
  fallback: ReactElement;
  loading?: boolean;
}

function RouteGuard({ children, condition, fallback, loading = false }: RouteGuardProps) {
  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Render fallback if condition fails
  if (!condition) {
    return fallback;
  }

  // Render children if condition passes
  return <>{children}</>;
}

export default RouteGuard;
