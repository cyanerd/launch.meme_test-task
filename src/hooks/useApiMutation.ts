import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useApiClient } from './useApiClient';
import { getApiErrorMessage } from '../lib/utils';
import type { LaunchMemeApiClient } from '../lib/api';
import type { 
  CreateTokenDraftRequest, 
  CreateTokenDraftResponse, 
  UpdateProfileRequest, 
  UpdateProfileResponse, 
  UploadFileRequest 
} from '../types/api';

interface ApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  apiMethod: (apiClient: LaunchMemeApiClient, variables: TVariables) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  showSnackbar?: (message: string, type?: 'error' | 'success') => void;
}

export function useApiMutation<TData = unknown, TVariables = unknown>({
  apiMethod,
  successMessage,
  errorMessage = 'An error occurred. Please try again.',
  onSuccess,
  onError,
  showSnackbar,
  ...options
}: ApiMutationOptions<TData, TVariables>) {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: (variables: TVariables) => apiMethod(apiClient, variables),
    onSuccess: (data, variables) => {
      if (successMessage && showSnackbar) {
        showSnackbar(successMessage, 'success');
      }
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const message = getApiErrorMessage(error, errorMessage);
      if (showSnackbar) {
        showSnackbar(message, 'error');
      }
      onError?.(error, variables);
    },
    ...options,
  });
}

// Convenience hooks for common API operations
export function useCreateTokenMutation(options?: {
  showSnackbar?: (message: string, type?: 'error' | 'success') => void;
  onSuccess?: (data: CreateTokenDraftResponse, variables: CreateTokenDraftRequest) => void;
  onError?: (error: Error, variables: CreateTokenDraftRequest) => void;
}) {
  return useApiMutation({
    apiMethod: (apiClient, data: CreateTokenDraftRequest) => apiClient.createTokenDraft(data),
    successMessage: 'Token created successfully!',
    errorMessage: 'Failed to create token. Please try again.',
    ...options,
  });
}

export function useUpdateProfileMutation(options?: {
  showSnackbar?: (message: string, type?: 'error' | 'success') => void;
  onSuccess?: (data: UpdateProfileResponse, variables: UpdateProfileRequest) => void;
  onError?: (error: Error, variables: UpdateProfileRequest) => void;
}) {
  return useApiMutation({
    apiMethod: (apiClient, data: UpdateProfileRequest) => apiClient.updateProfile(data),
    successMessage: 'Profile updated successfully!',
    errorMessage: 'Failed to update profile. Please try again.',
    ...options,
  });
}

export function useUploadFileMutation(showSnackbar?: (message: string, type?: 'error' | 'success') => void) {
  return useApiMutation({
    apiMethod: (apiClient, data: UploadFileRequest) => apiClient.uploadFile(data),
    successMessage: 'File uploaded successfully!',
    errorMessage: 'Failed to upload file. Please try again.',
    showSnackbar,
  });
}
