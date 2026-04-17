'use client';

import Image from 'next/image';
import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

const featureBullets = ['Makacs foltok ellen', 'Friss illatélmény', 'Tiszta, ápolt összhatás'];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function BeforeAfterSection() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePositionFromClientX = useCallback((clientX: number) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const { left, width } = slider.getBoundingClientRect();

    if (width <= 0) {
      return;
    }

    const next = ((clientX - left) / width) * 100;
    setPosition(clamp(next, 0, 100));
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      updatePositionFromClientX(event.clientX);
    },
    [updatePositionFromClientX]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) {
        return;
      }

      updatePositionFromClientX(event.clientX);
    },
    [isDragging, updatePositionFromClientX]
  );

  const stopDragging = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPosition((current) => clamp(current - 2, 0, 100));
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPosition((current) => clamp(current + 2, 0, 100));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setPosition(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setPosition(100);
    }
  }, []);

  return (
    <section className="ds-section" aria-labelledby="before-after-heading">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading id="before-after-heading">Lásd a különbséget egy mozdulattal</SectionHeading>
          <SectionDescription className="mx-auto mt-4 text-base leading-7 sm:text-lg">
            Húzd el a csúszkát, és nézd meg, hogyan vált a makacs folt tiszta, friss ruhává.
          </SectionDescription>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,251,255,0.96)_100%)] p-4 shadow-[0_22px_60px_rgba(15,23,42,0.09)] sm:p-6 md:p-8">
          <div
            ref={sliderRef}
            className="group relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onPointerLeave={stopDragging}
            role="slider"
            aria-label="Előtte és utána összehasonlító csúszka"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            style={{ touchAction: 'none' }}
          >
            <Image src="/shirt-before.jpg" alt="Koszos ing a tisztítás előtt" fill priority sizes="(max-width: 768px) 100vw, 960px" className="object-cover" />

            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r border-white/20"
              style={{ width: `${position}%` }}
              aria-hidden="true"
            >
              <Image
                src="/shirt-after.jpg"
                alt="Tiszta ing a tisztítás után"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-cover"
              />
            </div>

            <span className="absolute left-4 top-4 rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur">
              Előtte
            </span>
            <span className="absolute right-4 top-4 rounded-full border border-sky-200/70 bg-sky-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 shadow-sm backdrop-blur">
              Utána
            </span>

            <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }} aria-hidden="true">
              <div className="absolute inset-y-0 -ml-px w-0.5 bg-white/85 shadow-[0_0_0_1px_rgba(15,23,42,0.08)]" />
              <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 shadow-[0_10px_24px_rgba(15,23,42,0.22)] backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
                <span className="text-[11px] tracking-[0.18em] text-slate-500">◀ ▶</span>
              </div>
            </div>
          </div>

          <ul className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-3 sm:gap-3 sm:text-[15px]">
            {featureBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm ring-1 ring-slate-100">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span className="font-medium">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
