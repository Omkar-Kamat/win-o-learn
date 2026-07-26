import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, error, className = '', children, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-body">{label}</label>}
      <select
        ref={ref}
        className={`h-11 px-4 rounded-[10px] bg-card border ${error ? 'border-error' : 'border-base'} text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-tiny text-error">{error}</span>}
    </div>
  );
});
Select.displayName = 'Select';
export default Select;
