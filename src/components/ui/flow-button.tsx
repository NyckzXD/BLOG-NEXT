'use client';

import { ArrowRight } from 'lucide-react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CommonProps = {
  text?: string;
  children?: ReactNode;
  className?: string;
};

type FlowButtonProps =
  | (CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className">)
  | (CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">);

export function FlowButton({ text = "Modern Button", href, className, ...props }: FlowButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-accent2/30 bg-transparent px-8 py-3 text-sm font-semibold text-text-main cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[12px] hover:border-transparent hover:text-bg active:scale-[0.95]",
    className
  );

  const content = (
    <>
      {/* Left arrow (arr-2) */}
      <ArrowRight className="absolute left-[-25%] z-[9] h-4 w-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4" />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 transition-all duration-[800ms] ease-out group-hover:translate-x-3">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent to-accent2 opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[220px] group-hover:w-[220px] group-hover:opacity-100" />

      {/* Right arrow (arr-1) */}
      <ArrowRight className="absolute right-4 z-[9] h-4 w-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%]" />
    </>
  );

  if (href !== undefined) {
    return (
      <a
        href={href}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
