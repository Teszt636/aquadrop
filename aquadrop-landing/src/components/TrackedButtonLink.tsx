'use client';

import type { ComponentProps } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { trackEvent } from '@/lib/tracking';

type TrackedButtonLinkProps = ComponentProps<typeof ButtonLink> & {
  eventName: string;
};

export function TrackedButtonLink({ eventName, onClick, ...props }: TrackedButtonLinkProps) {
  return (
    <ButtonLink
      {...props}
      onClick={(event) => {
        trackEvent(eventName);
        onClick?.(event);
      }}
    />
  );
}
