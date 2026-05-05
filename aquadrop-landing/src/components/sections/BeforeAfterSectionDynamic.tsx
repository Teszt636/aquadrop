'use client';

import dynamic from 'next/dynamic';

export const BeforeAfterSectionDynamic = dynamic(
  () => import('@/components/sections/BeforeAfterSection').then((mod) => mod.BeforeAfterSection),
  {
    ssr: false,
    loading: () => (
      <div className="ds-section">
        <div className="ds-container">
          <div className="min-h-[420px]" />
        </div>
      </div>
    ),
  }
);
