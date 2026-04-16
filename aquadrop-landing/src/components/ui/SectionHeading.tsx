import type { HTMLAttributes, ReactNode } from 'react';

type BaseSectionTextProps = {
  children: ReactNode;
  className?: string;
};

type SectionHeadingProps = BaseSectionTextProps & Omit<HTMLAttributes<HTMLHeadingElement>, 'children' | 'className'>;
type SectionEyebrowProps = BaseSectionTextProps & Omit<HTMLAttributes<HTMLParagraphElement>, 'children' | 'className'>;
type SectionDescriptionProps = BaseSectionTextProps & Omit<HTMLAttributes<HTMLParagraphElement>, 'children' | 'className'>;

export function SectionHeading({ children, className, ...props }: SectionHeadingProps) {
  return (
    <h2 className={['ds-section-heading', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </h2>
  );
}

export function SectionEyebrow({ children, className, ...props }: SectionEyebrowProps) {
  return (
    <p className={['text-sm font-semibold uppercase tracking-[0.12em] text-brand-primary', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  );
}

export function SectionDescription({ children, className, ...props }: SectionDescriptionProps) {
  return (
    <p className={['mt-4 max-w-2xl text-lg leading-8 text-slate-700', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  );
}
