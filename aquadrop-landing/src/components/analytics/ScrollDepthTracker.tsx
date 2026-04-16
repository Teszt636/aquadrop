'use client';

import { useEffect } from 'react';

import { getScrollDepthEventName, SCROLL_DEPTH_THRESHOLDS, trackEvent } from '@/lib/tracking';

export function ScrollDepthTracker() {
  useEffect(() => {
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        return;
      }

      const currentDepth = Math.round((window.scrollY / scrollableHeight) * 100);

      for (const threshold of SCROLL_DEPTH_THRESHOLDS) {
        if (currentDepth < threshold || trackedThresholds.has(threshold)) {
          continue;
        }

        trackedThresholds.add(threshold);
        trackEvent(getScrollDepthEventName(threshold), { depth_percent: threshold });
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return null;
}
