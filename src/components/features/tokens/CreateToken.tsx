import { useState } from 'react';
import { useApiClient } from '../../../hooks/useApiClient';
import { getApiErrorMessage, formatFileSize } from '../../../lib/utils';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { useCreateTokenMutation } from '../../../hooks/useApiMutation';
import type { CreateTokenDraftDto } from '../../../types/forms';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { ChevronRight, Loader2, Upload } from 'lucide-react';
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

export function CreateToken() {
  const { showSnackbar } = useUIStore();

  const [formData, setFormData] = useState<CreateTokenDraftDto>({
    name: '',
    symbol: '',
    description: '',
    decimals: 9,
    supply: 1000000000,
    photo: '',
    metadataUri: '',
    hardcap: 100,
    website: '',
    x: '',
    telegram: '',
    version: 1,
  });

  // Image upload hook
  const imageUpload = useImageUpload({
    onError: (error) => showSnackbar(error, 'error')
  });

  // Form validation hook
  const formValidation = useFormValidation({
    onError: (message) => showSnackbar(message, 'error')
  });
  const [buyAmount, setBuyAmount] = useState<string>('');


  const [openSections, setOpenSections] = useState({
    basic: true,
    social: false,
    advanced: false,
  });

  const apiClient = useApiClient();
  const createTokenMutation = useCreateTokenMutation({ showSnackbar });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formValidation.validateTokenCreation({
      name: formData.name,
      symbol: formData.symbol,
      imageFile: imageUpload.imageFile,
      photo: formData.photo
    })) {
      return;
    }

    try {
      let photoUrl: string | null = formData.photo;
      let metadataUri = formData.metadataUri;

      // Upload image if provided
      if (imageUpload.imageFile && !photoUrl) {
        const uploadedUrl = await imageUpload.uploadImage(imageUpload.imageFile);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      // Generate metadata URI if not provided
      if (!metadataUri) {
        const metadata = JSON.stringify({
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          image: photoUrl,
          external_url: formData.website,
          attributes: [],
        });

        const metadataResult = await apiClient.uploadFile({
          file: btoa(metadata),
          metadata: metadata,
        });

        metadataUri = metadataResult.url || '';
      }

      // Create token
      await createTokenMutation.mutateAsync({
        ...formData,
        photo: photoUrl!, // We know photoUrl is not null due to form validation
        metadataUri,
      });

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        decimals: 9,
        supply: 1000000000,
        photo: '',
        metadataUri: '',
        hardcap: 100,
        website: '',
        x: '',
        telegram: '',
        version: 1,
      });
      imageUpload.clearImage();
      setBuyAmount('');
    } catch (error) {
      console.error('Error in token creation process:', error);
      const errorMessage = getApiErrorMessage(error, 'Failed to create token. Please try again.');
      showSnackbar(errorMessage, 'error');
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isLoading = imageUpload.isUploading || createTokenMutation.isPending;

  return (
    <div className="space-y-6 animate-slide-up">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload section - First */}
        <div className="glass rounded-xl p-6">
          <div
            className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/20 transition-all duration-200"
            onDragOver={imageUpload.handleDragOver}
            onDrop={imageUpload.handleDrop}
            onClick={() => {
              // Trigger file input click when clicking on the upload area (but not during drag operations)
              const fileInput = document.getElementById('file-input') as HTMLInputElement;
              if (fileInput) {
                fileInput.click();
              }
            }}
          >
            {imageUpload.imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imageUpload.imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-xl object-cover shadow-lg"
                />
                {imageUpload.imageFile && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>File: {imageUpload.imageFile.name}</p>
                    <p>Size: {formatFileSize(imageUpload.imageFile.size)}</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="hover:bg-destructive/10 hover:border-destructive/30"
                  onClick={imageUpload.clearImage}
                >
                  Remove image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Upload an image</h3>
                  <p className="text-muted-foreground mt-2">
                    Drag and drop an image here<br />
                    or click the button to select from your PC.
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Allowed file types: JPG, PNG, GIF, SVG</p>
                  <p>Maximum file size: 5 Mb</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/svg+xml"
                    id="file-input"
                    className="hidden"
                    onChange={imageUpload.handleImageChange}
                  />
                  <label htmlFor="file-input">
                    <Button type="button" variant="outline" className="hover:bg-primary/10 hover:border-primary/30" asChild>
                      <span className="cursor-pointer">Select the file</span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form sections */}
        <div className="space-y-4">
          {/* Basic Data Section */}
          <AccordionSection
            title="1. Basic data"
            subtitle="Once your coin/token has been minted, all information becomes immutable and cannot be altered."
            isOpen={openSections.basic}
            onToggle={() => toggleSection('basic')}
          >
            <div className="space-y-4 py-1">
              <Input
                name="name"
                placeholder="Token name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
              <Input
                name="symbol"
                placeholder="Token symbol (ticker)"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                required
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
              <Textarea
                name="description"
                placeholder="Token description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={100}
                rows={4}
                className="w-full resize-none bg-background/50 border-border/50 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Must be no longer than 100 characters and cannot be left empty.
              </p>
            </div>
          </AccordionSection>

          {/* Social Optional Data Section */}
          <AccordionSection
            title="2. Social links (optional)"
            isOpen={openSections.social}
            onToggle={() => toggleSection('social')}
          >
            <div className="space-y-4 py-1">
              <Input
                name="telegram"
                placeholder="Telegram link"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
              <Input
                name="twitter"
                placeholder="Twitter (X) link"
                value={formData.x}
                onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
              <Input
                name="website"
                placeholder="Website link"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
          </AccordionSection>

          {/* Advanced Section */}
          <AccordionSection
            title="3. Advanced settings"
            isOpen={openSections.advanced}
            onToggle={() => toggleSection('advanced')}
          >
            <div className="space-y-4 py-1">
              <Input
                name="buyAmount"
                placeholder="Initial buy amount (SOL)"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
          </AccordionSection>

          {/* Create Button */}
          <div className="pt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-primary hover:opacity-90 text-white py-6 px-8 rounded-xl font-semibold text-xl shadow-lg hover:shadow-xl transition-all duration-200 min-h-[60px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Creating your meme coin...
                </>
              ) : (
                <>
                  <span>🚀&nbsp;&nbsp;Create Token</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

    </div>
  );
}
