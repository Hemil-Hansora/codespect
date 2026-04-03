import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
          'inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm',
          iconClassName,
        )}
      >
        <Image src="/logo.svg" alt="CodeSpect logo" width={24} height={24} className="h-6 w-6" priority />
      </span>
      {withText ? (
        <span className={cn('text-lg font-bold tracking-tight text-foreground', textClassName)}>CodeSpect</span>
      ) : null}
    </Link>
  );
}
