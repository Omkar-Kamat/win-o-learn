import React from 'react';

export default function Card({ children, padding = 'lg', hover = false, className = '', ...props }) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div
      className={`bg-card border border-base rounded-[16px] shadow-card ${paddings[padding]} ${hover ? 'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-raised' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
