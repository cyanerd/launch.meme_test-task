// Common form types used across the application

export interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  supply: number;
  photo: string;
  metadataUri: string;
  hardcap: number;
  website: string;
  x: string;
  telegram: string;
  version: number;
}

export interface ProfileFormData {
  name: string;
  telegram: string;
}

export interface AccordionSectionState {
  [key: string]: boolean;
}

export interface CreateTokenDraftDto {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  supply: number;
  photo: string;
  metadataUri: string;
  hardcap: number;
  website: string;
  x: string;
  telegram: string;
  version: number;
}

// Form validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormField<T = unknown> {
  name: string;
  value: T;
  required?: boolean;
  validator?: (value: T) => boolean;
  errorMessage?: string;
}
