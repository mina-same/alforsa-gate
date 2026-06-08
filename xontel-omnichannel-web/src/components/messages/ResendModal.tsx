import React from 'react';
import { RotateCcw, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResend: () => void;
  onDelete: () => void;
}

export default function ResendModal({
  open,
  onOpenChange,
  onResend,
  onDelete,
}: ResendModalProps) {
  const isMobile = useIsMobile();

  const handleResend = () => {
    onResend();
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  const content = (
    <div className="flex flex-col w-full">
      <div className="flex flex-col border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleResend}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 group"
        >
          <span className="text-base font-normal text-gray-900 dark:text-gray-100 items-start">Send again</span>
          <RotateCcw className="h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400" />
        </button>

        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <span className="text-base font-normal text-red-500 group-hover:text-red-600">Delete</span>
          <Trash2 className="h-5 w-5 text-red-500 group-hover:text-red-600" />
        </button>
      </div>
    </div>
  );

  const header = (
    <div className="flex items-center justify-between px-4 py-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Your message was not sent.
      </h2>
      {/* <button
        onClick={() => onOpenChange(false)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button> */}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="p-0 border-t-0 rounded-t-[20px] bg-white dark:bg-gray-900 outline-none">
          <SheetHeader className="sr-only">
            <SheetTitle>Resend Message</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col">
            {header}
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Resend Message</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          {header}
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}

