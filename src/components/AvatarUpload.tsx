import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { uploadAvatar, deleteAvatar } from '@/services/storageService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  currentPhotoURL: string | null;
  displayName: string;
  uid: string;
  onUploadComplete?: (newPhotoURL: string | null) => void;
}

export function AvatarUpload({
  currentPhotoURL,
  displayName,
  uid,
  onUploadComplete,
}: AvatarUploadProps) {
  const { t } = useTranslation('profile');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const initials = displayName.charAt(0).toUpperCase();
  const displayedPhoto = previewUrl || currentPhotoURL;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('avatar.chooseFile'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatar.fileTooLarge'));
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase
    setIsUploading(true);
    try {
      const newPhotoURL = await uploadAvatar(uid, file);
      await refreshUser();
      toast.success(t('avatar.updated'));
      onUploadComplete?.(newPhotoURL);
      setPreviewUrl(null); // Clear preview, use actual URL now
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('avatar.failedToUpload'));
      setPreviewUrl(null); // Revert preview on error
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentPhotoURL) return;

    setIsUploading(true);
    try {
      await deleteAvatar(uid, currentPhotoURL);
      await refreshUser();
      toast.success(t('avatar.deleted'));
      onUploadComplete?.(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('avatar.failedToDelete'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Avatar preview */}
      <div className="relative">
        {displayedPhoto ? (
          <img
            src={displayedPhoto}
            alt=""
            className={`h-20 w-20 rounded-full object-cover ${isUploading ? 'opacity-50' : ''}`}
          />
        ) : (
          <div
            className={`h-20 w-20 rounded-full bg-divider flex items-center justify-center text-2xl font-medium text-content ${isUploading ? 'opacity-50' : ''}`}
          >
            {initials}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-content-faint border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Upload controls */}
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {currentPhotoURL ? t('avatar.change') : t('avatar.add')}
        </Button>
        {currentPhotoURL && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="text-xs text-content-subtle hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {t('avatar.remove')}
          </button>
        )}
        <p className="text-xs text-content-faint">
          {t('avatar.hint')}
        </p>
      </div>
    </div>
  );
}
