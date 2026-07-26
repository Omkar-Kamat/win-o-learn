import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  leftIcon, 
  className = '', 
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-hover',
    secondary: 'bg-card text-body border border-base hover:bg-surface',
    ghost: 'bg-transparent text-body hover:bg-primary-light hover:text-primary-text-on',
    danger: 'bg-error text-white hover:opacity-90'
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-[10px]',
    md: 'h-11 px-5 text-base rounded-[10px]',
    lg: 'h-12 px-6 text-lg rounded-[10px]'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
    </button>
  );
}
