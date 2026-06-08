import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LocationPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export default function LocationPermissionDialog({
  isOpen,
  onClose,
  onRetry,
}: LocationPermissionDialogProps) {
  const { t } = useTranslation('chat');

  const handleOpenSettings = () => {
    // Show instructions for enabling location access
    alert(t('location.enable_location_instructions', {
      defaultValue: 'To enable location access:\n\n1. Click the lock icon in the address bar\n2. Select "Site settings"\n3. Change location to "Allow"\n4. Refresh the page and try again\n\nAlternatively, you can go to browser settings and enable location for this site.'
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-xon-surface-container border border-xon-surface-outline text-xon-text-primary max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-xon-container-green">
              <MapPin className="h-6 w-6 text-xon-green" />
            </div>
            <div>
              <DialogTitle className="text-xon-text-primary">
                {t('location.permission_required', { defaultValue: 'Location Access Required' })}
              </DialogTitle>
              <DialogDescription className="text-xon-text-secondary mt-1">
                {t('location.permission_description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-xon-surface-container-hover rounded-lg p-4 border border-xon-surface-outline">
            <h4 className="font-medium text-xon-text-primary mb-2">
              {t('location.how_to_enable')}
            </h4>
            <ol className="text-sm text-xon-text-secondary space-y-1 list-decimal list-inside">
              <li>{t('location.step_1')}</li>
              <li>{t('location.step_2')}</li>
              <li>{t('location.step_3')}</li>
              <li>{t('location.step_4')}</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
        
          <Button
            variant="outline"
            onClick={handleOpenSettings}
            className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('location.open_settings')}
          </Button>
        
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
