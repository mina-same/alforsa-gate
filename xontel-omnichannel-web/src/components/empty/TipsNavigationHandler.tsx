import { useEffect, useState } from 'react';
import { Tip } from './types';

export function useTipsNavigation(tips: Tip[], isRTL: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      isRTL ? goPrev() : goNext();
    } else if (isRightSwipe) {
      isRTL ? goNext() : goPrev();
    }
  };

  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + tips.length) % tips.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % tips.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        isRTL ? goNext() : goPrev();
      }
      if (e.key === 'ArrowRight') {
        isRTL ? goPrev() : goNext();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRTL, tips.length]);

  return {
    activeIndex,
    setActiveIndex,
    goPrev,
    goNext,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
