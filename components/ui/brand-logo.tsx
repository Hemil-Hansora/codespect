import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DynamicLogo } from './dynamic-logo';

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  withText?: boolean;
  href?: string;
};

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  withText = true,
  href = '/',
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg',
          iconClassName,
        )}
      >
        <DynamicLogo className="h-full w-full" />
      </span>
      {withText ? (
        <span className={cn('text-lg font-bold tracking-tight text-primary', textClassName)}>CodeSpect</span>
      ) : null}
    </Link>
  );
}
