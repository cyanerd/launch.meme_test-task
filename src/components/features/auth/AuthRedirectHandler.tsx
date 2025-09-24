import { useAuthRedirect } from '../../../hooks/useAuthRedirect';

export function AuthRedirectHandler() {
  // This component uses the hook to handle auth redirects
  useAuthRedirect();
  return null;
}
