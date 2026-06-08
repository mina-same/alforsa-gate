import React from 'react';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { Phone, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CallConfirmationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    contactName: string;
}

export default function CallConfirmationSheet({
    isOpen,
    onClose,
    onConfirm,
    contactName
}: CallConfirmationSheetProps) {
    const isMobile = useIsMobile();

    const CallContent = () => (
        <div className="flex flex-col p-3 pb-8 space-y-3">
            {/* Header */}
            <div className={`relative flex items-center justify-center pt-2 ${!isMobile ? 'pb-2' : ''}`}>
                <span className="text-[17px] font-bold tracking-tight text-xon-text-primary">{contactName}</span>
                {isMobile ? (
                    <SheetClose asChild>
                        <button
                            className="absolute right-0 -top-1 w-9 h-9 flex items-center justify-center rounded-full bg-xon-surface-container hover:bg-xon-surface-container-hover transition-colors"
                            onClick={onClose}
                        >
                            <X className="w-[22px] h-[22px] text-xon-text-secondary" />
                        </button>
                    </SheetClose>
                ) : (
                    <DialogClose asChild>
                        <button
                            className="absolute right-0 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-xon-surface hover:bg-xon-surface-hover transition-colors"
                            onClick={onClose}
                        >
                            <X className="w-[20px] h-[20px] text-xon-text-secondary" />
                        </button>
                    </DialogClose>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-xon-surface rounded-[16px] p-3 flex flex-col items-center text-center">
                <p className="text-[14px] leading-[1.4] text-xon-text-secondary font-normal">
                    This business uses a secure service from Meta to manage this call. <span className="text-xon-blue font-semibold cursor-pointer hover:underline">Learn more</span>
                </p>
            </div>

            {/* Call Selection Item */}
            <button
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
                className="w-full flex items-center justify-between bg-xon-surface hover:bg-xon-surface-hover active:opacity-80 transition-colors px-5 py-3 rounded-[16px] group"
            >
                <span className="text-[17px] font-medium text-xon-text-primary">Call</span>
                <Phone className="w-6 h-6 text-xon-text-secondary group-active:scale-90 transition-transform" />
            </button>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="bottom" className="sm:max-w-md mx-auto rounded-t-[24px] p-0 border-none bg-xon-surface-container overflow-hidden outline-none ring-0">
                    <CallContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent hideClose className="max-w-[400px] p-0 bg-xon-surface-container border-xon-surface-outline overflow-hidden rounded-[20px]">
                <DialogTitle className="sr-only">Call {contactName}</DialogTitle>
                <CallContent />
            </DialogContent>
        </Dialog>
    );
}
