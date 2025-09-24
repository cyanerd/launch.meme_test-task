import { useCallback } from 'react';
import { useWalletStore } from '../stores/useWalletStore';

interface ValidationRule<T = unknown> {
  field: string;
  value: T;
  validator: (value: T) => boolean;
  message: string;
}

interface UseFormValidationOptions {
  onError?: (message: string) => void;
}

interface UseFormValidationReturn {
  validateWalletConnection: () => boolean;
  validateRequiredFields: (fields: { field: string; value: unknown; message: string }[]) => boolean;
  validateRules: (rules: ValidationRule[]) => boolean;
  validateTokenCreation: (formData: {
    name?: string;
    symbol?: string;
    imageFile?: File | null;
    photo?: string;
  }) => boolean;
  validateProfileUpdate: (formData: {
    name?: string;
    telegram?: string;
  }) => boolean;
}

export function useFormValidation({
  onError
}: UseFormValidationOptions = {}): UseFormValidationReturn {
  const { connected } = useWalletStore();

  const showError = useCallback((message: string) => {
    onError?.(message);
  }, [onError]);

  const validateWalletConnection = useCallback((): boolean => {
    if (!connected) {
      showError('Please connect your wallet first');
      return false;
    }
    return true;
  }, [connected, showError]);

  const validateRequiredFields = useCallback((fields: { field: string; value: unknown; message: string }[]): boolean => {
    for (const { value, message } of fields) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        showError(message);
        return false;
      }
    }
    return true;
  }, [showError]);

  const validateRules = useCallback((rules: ValidationRule[]): boolean => {
    for (const { value, validator, message } of rules) {
      if (!validator(value)) {
        showError(message);
        return false;
      }
    }
    return true;
  }, [showError]);

  const validateTokenCreation = useCallback((formData: {
    name?: string;
    symbol?: string;
    imageFile?: File | null;
    photo?: string;
  }): boolean => {
    // Validate wallet connection
    if (!validateWalletConnection()) return false;

    // Validate required fields
    const requiredFields = [
      { field: 'name', value: formData.name, message: 'Token name is required' },
      { field: 'symbol', value: formData.symbol, message: 'Token symbol (ticker) is required' }
    ];

    if (!validateRequiredFields(requiredFields)) return false;

    // Validate image
    if (!formData.imageFile && !formData.photo) {
      showError('Token image is required');
      return false;
    }

    return true;
  }, [validateWalletConnection, validateRequiredFields, showError]);

  const validateProfileUpdate = useCallback((formData: {
    name?: string;
    telegram?: string;
  }): boolean => {
    // Validate wallet connection
    if (!validateWalletConnection()) return false;

    // For profile, at least one field should be filled
    if ((!formData.name || !formData.name.trim()) && (!formData.telegram || !formData.telegram.trim())) {
      showError('At least one field (name or telegram) must be filled');
      return false;
    }

    return true;
  }, [validateWalletConnection, showError]);

  return {
    validateWalletConnection,
    validateRequiredFields,
    validateRules,
    validateTokenCreation,
    validateProfileUpdate
  };
}
