import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        blue: 'border-transparent bg-blue-500/20 text-blue-400',
        red: 'border-transparent bg-red-500/20 text-red-400',
        gold: 'border-transparent bg-yellow-500/20 text-yellow-400',
        iron: 'border-transparent bg-gray-500/20 text-gray-400',
        bronze: 'border-transparent bg-amber-700/20 text-amber-600',
        silver: 'border-transparent bg-gray-400/20 text-gray-300',
        platinum: 'border-transparent bg-teal-400/20 text-teal-400',
        emerald: 'border-transparent bg-emerald-500/20 text-emerald-400',
        diamond: 'border-transparent bg-blue-400/20 text-blue-400',
        master: 'border-transparent bg-purple-500/20 text-purple-400',
        grandmaster: 'border-transparent bg-red-500/20 text-red-400',
        challenger: 'border-transparent bg-yellow-300/20 text-yellow-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
