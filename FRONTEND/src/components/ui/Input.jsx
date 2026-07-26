import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-body">{label}</label>}
      <input
        ref={ref}
        className={`h-11 px-4 rounded-[10px] bg-card border ${error ? 'border-error' : 'border-base'} text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-tiny text-error">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
