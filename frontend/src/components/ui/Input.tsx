import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine width
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Base input styles
    const baseInputStyles = 'rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2';
    
    // Icon padding adjustments
    const leftIconPadding = leftIcon ? 'pl-10' : 'pl-3';
    const rightIconPadding = rightIcon ? 'pr-10' : 'pr-3';
    
    // Error styles
    const errorStyles = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '';
    
    // Disabled styles
    const disabledStyles = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
    
    // Combined styles
    const combinedStyles = cn(
      baseInputStyles,
      leftIconPadding,
      rightIconPadding,
      errorStyles,
      disabledStyles,
      widthClass,
      className
    );

    return (
      <div className={widthClass}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={combinedStyles}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';