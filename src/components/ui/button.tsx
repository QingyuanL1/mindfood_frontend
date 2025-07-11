import React from "react";

type ButtonVariant = 'default' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

const getVariantClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'outline':
      return 'border border-gray-300 text-gray-700 hover:bg-gray-50';
    case 'text':
      return 'text-orange-600 hover:bg-orange-50';
    default:
      return 'bg-orange-500 text-white hover:bg-orange-600';
  }
};

const getSizeClasses = (size: ButtonSize): string => {
  switch (size) {
    case 'sm':
      return 'py-1 px-3 text-xs';
    case 'lg':
      return 'py-3 px-6 text-base';
    default:
      return 'py-2 px-4 text-sm';
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    className = '', 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-colors duration-200 focus:outline-none';
    const variantClasses = getVariantClasses(variant);
    const sizeClasses = getSizeClasses(size);
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button"; 