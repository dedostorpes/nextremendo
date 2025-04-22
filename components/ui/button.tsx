// components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
