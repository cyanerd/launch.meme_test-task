import { useState, useCallback } from 'react';
import { useApiClient } from './useApiClient';

interface UseImageUploadOptions {
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  imageFile: File | null;
  imagePreview: string;
  isUploading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  clearImage: () => void;
}

export function useImageUpload({
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
  onSuccess,
  onError
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const apiClient = useApiClient();

  const validateFile = useCallback((file: File): string | null => {
    // Validate file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG, GIF, and SVG files are allowed';
    }

    return null;
  }, [maxSize, allowedTypes]);

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      throw new Error(validationError);
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();

      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const metadata = JSON.stringify({
              name: file.name,
              type: file.type,
              size: file.size,
            });

            const result = await apiClient.uploadFile({
              file: base64,
              metadata: metadata,
            });

            const url = result.photo || result.url || '';
            onSuccess?.(url);
            resolve(url);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            onError?.(errorMessage);
            reject(error);
          } finally {
            setIsUploading(false);
          }
        };
        reader.onerror = () => {
          const errorMessage = 'Failed to read file';
          onError?.(errorMessage);
          setIsUploading(false);
          reject(new Error(errorMessage));
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  }, [apiClient, validateFile, onSuccess, onError]);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    setImageFile(file);

    try {
      const preview = await createPreview(file);
      setImagePreview(preview);
    } catch (error) {
      onError?.('Failed to create preview');
    }
  }, [validateFile, createPreview, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        onError?.(validationError);
        return;
      }

      // Create synthetic event for handleImageChange
      const syntheticEvent = {
        target: { files: [file] }
      } as any;

      handleImageChange(syntheticEvent);
    }
  }, [validateFile, handleImageChange, onError]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview('');
  }, []);

  return {
    imageFile,
    imagePreview,
    isUploading,
    uploadImage,
    handleImageChange,
    handleDragOver,
    handleDrop,
    clearImage
  };
}
