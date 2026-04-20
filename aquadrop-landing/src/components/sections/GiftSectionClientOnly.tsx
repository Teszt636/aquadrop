'use client';

import { useEffect, useState } from 'react';

import { GiftSection } from './GiftSection';

export function GiftSectionClientOnly() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <GiftSection />;
}
