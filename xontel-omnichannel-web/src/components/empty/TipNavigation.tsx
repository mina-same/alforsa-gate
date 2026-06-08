import React from 'react';
import { Button } from '@components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tip } from './types';

type TipNavigationProps = {
  tips: Tip[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  isRTL: boolean;
  isMobile: boolean;
};

export default function TipNavigation({
  tips,
  activeIndex,
  setActiveIndex,
  goPrev,
  goNext,
  isRTL,
  isMobile,
}: TipNavigationProps) {
  return (
    <div className="grid grid-cols-3 items-center gap-3">
      <div className={`${isRTL ? 'justify-self-end' : 'justify-self-start'}`}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={isRTL ? goNext : goPrev}
          className={`${isMobile ? 'h-11 w-11' : 'h-9 w-9'} p-0 rounded-xl`}
        >
          {isRTL ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {tips.map((tip, idx) => (
          <button
            key={tip.key}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`rounded-full transition-all ${
              isMobile ? 'h-2.5' : 'h-2'
            } ${
              idx === activeIndex
                ? 'bg-primary w-6'
                : 'bg-foreground/20 hover:bg-foreground/30 w-2.5'
            }`}
            aria-label={String(tip.key)}
          />
        ))}
      </div>

      <div className={`${isRTL ? 'justify-self-start' : 'justify-self-end'}`}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={isRTL ? goPrev : goNext}
          className={`${isMobile ? 'h-11 w-11' : 'h-9 w-9'} p-0 rounded-xl`}
        >
          {isRTL ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
