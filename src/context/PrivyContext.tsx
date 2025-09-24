import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { PrivyProvider as PrivyProviderBase, usePrivy } from '@privy-io/react-auth';
import type { User } from '../types';

interface PrivyContextType {
  login: () => void;
  sendEmailOtp: (email: string) => Promise<void>;
  logout: () => void;
  authenticated: boolean;
  user: User | null;
  ready: boolean;
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

interface PrivyProviderProps {
  children: ReactNode;
}

const PrivyAuthWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const privy = usePrivy();

  const sendEmailOtp = async (_email: string) => {
    try {
      // TODO: Implement Privy email OTP login
      console.log('Email OTP not implemented yet');
    } catch (error) {
      throw error;
    }
  };

  const value: PrivyContextType = {
    login: () => {},
    sendEmailOtp,
    logout: privy.logout,
    authenticated: privy.authenticated,
    user: privy.user as User | null,
    ready: privy.ready
  };

  return (
    <PrivyContext.Provider value={value}>
      {children}
    </PrivyContext.Provider>
  );
};

export const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;

  if (!appId) {
    throw new Error('VITE_PRIVY_APP_ID environment variable is required');
  }

  return (
    <PrivyProviderBase
      appId={appId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#0ea5e9',
          logo: undefined,
          showWalletLoginFirst: false,
        },
        loginMethods: ['email'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
        legal: {
          termsAndConditionsUrl: undefined,
          privacyPolicyUrl: undefined,
        },
      }}
    >
      <PrivyAuthWrapper>{children}</PrivyAuthWrapper>
    </PrivyProviderBase>
  );
};

export const usePrivyAuth = (): PrivyContextType => {
  const context = useContext(PrivyContext);
  if (context === undefined) {
    throw new Error('usePrivyAuth must be used within a PrivyProvider');
  }
  return context;
};
