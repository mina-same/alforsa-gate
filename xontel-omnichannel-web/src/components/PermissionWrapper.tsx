import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { userPermissionsStorage } from "@/lib/userPermissions";

interface PermissionWrapperProps {
  permissionKey?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  // When true, also shows fallback if any API request returns 403
  listenForForbidden?: boolean;
  children: React.ReactNode;
}

export default function PermissionWrapper({
  permissionKey,
  requireAll = false,
  fallback = null,
  listenForForbidden = false,
  children,
}: PermissionWrapperProps) {
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!listenForForbidden) return;
    const handler = () => setForbidden(true);
    window.addEventListener("api:forbidden", handler);
    return () => window.removeEventListener("api:forbidden", handler);
  }, [listenForForbidden]);

  const { pathname } = useLocation();

  // Reset forbidden state on route change so navigating away clears the screen
  useEffect(() => {
    if (!listenForForbidden) return;
    setForbidden(false);
  }, [pathname, listenForForbidden]);

  if (forbidden) return <>{fallback}</>;

  if (!permissionKey) return <>{children}</>;

  const keys = Array.isArray(permissionKey) ? permissionKey : [permissionKey];
  const hasAccess = requireAll
    ? keys.every((k) => userPermissionsStorage.hasPermission(k))
    : keys.some((k) => userPermissionsStorage.hasPermission(k));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
