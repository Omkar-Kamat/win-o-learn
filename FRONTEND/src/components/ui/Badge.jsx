export default function Badge({ children, variant = 'primary', size = 'md', className = '' }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const sizes = {
    sm: 'px-2 py-0.5 text-tiny',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const variants = {
    primary: 'bg-primary-light text-primary-text-on',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning-text-on border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-info/10 text-info border border-info/20',
    default: 'bg-surface text-muted border border-base'
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
