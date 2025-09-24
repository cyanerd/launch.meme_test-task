import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../hooks/useApiClient';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { useUpdateProfileMutation } from '../../../hooks/useApiMutation';
import type { ProfileFormData } from '../../../types/forms';
import type { ProfileData } from '../../../types/api';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useUIStore } from '../../../stores/useUIStore';

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, subtitle, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors focus:outline-none focus:ring-0"
      >
        <div className="flex-1">
          <h6 className="text-lg font-semibold text-foreground">{title}</h6>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <ChevronRight
          className={`h-5 w-5 text-primary transition-transform duration-200 ${isOpen ? 'rotate-90' : ''
            }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'
          }`}
      >
        <div className="px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ProfileForm() {
  const { connected, publicKey } = useWalletStore();
  const { authenticated, loginWithTwitter } = useAuthStore();
  const { showSnackbar } = useUIStore();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    telegram: '',
  });

  const [isConnectedX, setIsConnectedX] = useState(false);
  const [isTwitterLoading, setIsTwitterLoading] = useState(false);

  // Accordion states
  const [openSections, setOpenSections] = useState({
    contacts: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  const apiClient = useApiClient();
  const formValidation = useFormValidation({
    onError: (message) => showSnackbar(message, 'error')
  });

  // Get profile query
  const profileQuery = useQuery({
    queryKey: ['profile', publicKey?.toString()],
    queryFn: async (): Promise<ProfileData> => {
      if (!connected || !publicKey) {
        throw new Error('Wallet not connected');
      }
      return apiClient.getProfile({ wallet: publicKey.toString() });
    },
    enabled: connected && !!publicKey,
    retry: false,
  });

  // Profile update mutation
  const updateProfileMutation = useUpdateProfileMutation({
    showSnackbar,
    onSuccess: () => {
      profileQuery.refetch();
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConnectX = async () => {
    try {
      setIsTwitterLoading(true);
      await loginWithTwitter();
      setIsConnectedX(true);
      showSnackbar('Made it look like I connected Twitter', 'success');
    } catch (error) {
      console.error('Twitter login failed:', error);
      showSnackbar('Failed to pretend connecting to Twitter', 'error');
    } finally {
      setIsTwitterLoading(false);
    }
  };

  const handleSaveData = () => {
    if (!formValidation.validateProfileUpdate(formData)) {
      return;
    }

    updateProfileMutation.mutate({
      name: formData.name,
      telegram: formData.telegram,
      wallet: publicKey?.toString() || '',
    });
  };

  const handleResetData = () => {
    // Reset to original data from backend or empty values
    if (profileQuery.data && typeof profileQuery.data === 'object' && 'info' in profileQuery.data) {
      const profileInfo = (profileQuery.data as { info: { name: string; telegram: string } }).info;
      setFormData({
        name: profileInfo.name || '',
        telegram: profileInfo.telegram || '',
      });
    } else {
      // If no data from backend, reset to empty
      setFormData({
        name: '',
        telegram: '',
      });
    }
    setIsConnectedX(false);
  };

  // Update form data when profile is loaded and check X connection status
  useEffect(() => {
    if (profileQuery.data && typeof profileQuery.data === 'object' && 'info' in profileQuery.data) {
      const profileInfo = (profileQuery.data as any).info;
      setFormData({
        name: profileInfo.name || '',
        telegram: profileInfo.telegram || '',
      });
      setIsConnectedX(authenticated);
    }
  }, [profileQuery.data, authenticated]);

  const isFormValid = formValidation.validateProfileUpdate(formData);
  const isLoading = updateProfileMutation.isPending;

  // Check if form data has changes compared to original data
  const hasChanges = () => {
    if (!profileQuery.data || typeof profileQuery.data !== 'object' || !('info' in profileQuery.data)) {
      return formData.name.trim() !== '' || formData.telegram.trim() !== '';
    }

    const profileInfo = (profileQuery.data as { info: { name: string; telegram: string } }).info;
    return formData.name !== (profileInfo.name || '') ||
      formData.telegram !== (profileInfo.telegram || '');
  };

  const canReset = hasChanges() || isFormValid;

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Connect X Button */}
      <div className="glass rounded-xl p-6">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleConnectX}
            disabled={isConnectedX || isTwitterLoading}
            className={`font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-3 ${isConnectedX
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl'
              }`}
          >
            {isTwitterLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : isConnectedX ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X Connected ✓
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Connect X
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contacts Section */}
      <div className="space-y-4">
        <AccordionSection
          title="Contact Information"
          subtitle="Update your personal details and social links"
          isOpen={openSections.contacts}
          onToggle={() => toggleSection('contacts')}
        >

          <div className="space-y-4">
            <div className="py-1">
              <Input
                type="text"
                placeholder="Display name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Telegram username or link"
                value={formData.telegram}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('telegram', e.target.value)}
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              onClick={handleSaveData}
              disabled={!isFormValid || isLoading}
              className="flex-1 bg-gradient-primary hover:opacity-90 text-white py-6 px-6 rounded-xl font-semibold text-md shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span>💾&nbsp;&nbsp;Save Profile</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleResetData}
              disabled={!canReset}
              variant="outline"
              className="flex-1 border-border hover:bg-accent/20 text-foreground py-6 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Changes
            </Button>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
