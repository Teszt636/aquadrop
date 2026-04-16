type SectionHeadingProps = {
  children: string;
  className?: string;
};

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return <h2 className={['ds-section-heading', className].filter(Boolean).join(' ')}>{children}</h2>;
}
