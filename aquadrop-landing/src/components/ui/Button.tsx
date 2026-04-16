import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import Link, { type LinkProps } from 'next/link';

type ButtonVariant = 'primary' | 'secondary';

type ButtonStyleProps = {
  variant?: ButtonVariant;
  className?: string;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

type ButtonLinkProps = Omit<LinkProps, 'className'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | 'className'> &
  ButtonStyleProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'ds-button-primary',
  secondary: 'ds-button-secondary'
};

function buildButtonClassName(variant: ButtonVariant, className = '') {
  return `${variantClasses[variant]} ${className}`.trim();
}

export function Button({
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return <button className={buildButtonClassName(variant, className)} type={type} {...props} />;
}

export function ButtonLink({ className = '', variant = 'primary', ...props }: ButtonLinkProps) {
  return <Link className={buildButtonClassName(variant, className)} {...props} />;
}
