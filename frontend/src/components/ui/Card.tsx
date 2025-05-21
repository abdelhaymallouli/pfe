import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'flat';
  isPressable?: boolean;
  isHoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { 
      className, 
      variant = 'default', 
      isPressable = false, 
      isHoverable = false, 
      children, 
      ...props 
    }, 
    ref
  ) => {
    const variantStyles = {
      default: 'bg-white shadow-card',
      outlined: 'bg-white border border-gray-200',
      flat: 'bg-gray-50',
    };

    const hoverStyles = isHoverable 
      ? 'transition-all duration-200 hover:shadow-elevated hover:-translate-y-1' 
      : '';

    const pressableStyles = isPressable 
      ? 'cursor-pointer active:scale-[0.98] transition-transform' 
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl overflow-hidden',
          variantStyles[variant],
          hoverStyles,
          pressableStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = false, ...props }, ref) => {
    const borderStyles = withBorder ? 'border-b border-gray-200' : '';
    
    return (
      <div
        ref={ref}
        className={cn('px-6 py-4', borderStyles, className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-6 py-4', className)}
    {...props}
  />
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-6 py-4 bg-gray-50', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';