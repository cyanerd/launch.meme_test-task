import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/useWalletStore';
import { useAuthStore } from '../stores/useAuthStore';

// List of protected routes that require authentication
const PROTECTED_ROUTES = [] as string[];

// Check if route is protected
const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { connected } = useWalletStore();
  const { authenticated } = useAuthStore();

  useEffect(() => {
    // Check if redirect is needed
    const isCurrentRouteProtected = isProtectedRoute(location.pathname);
    const isUserAuthenticated = connected || authenticated;

    if (isCurrentRouteProtected && !isUserAuthenticated) {
      navigate('/');
    }
  }, [connected, authenticated, location.pathname, navigate]);

  return {
    isProtectedRoute: isProtectedRoute(location.pathname),
    isAuthenticated: connected || authenticated
  };
}
