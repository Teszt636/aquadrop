'use client';

import type { ComponentProps } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { trackEvent, type TrackingEventName } from '@/lib/tracking';

type TrackedButtonLinkProps = ComponentProps<typeof ButtonLink> & {
  eventName: TrackingEventName;
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
