import React from 'react';

const badgeVariants = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

/**
 * Reusable Badge component
 */
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = badgeVariants[variant] || badgeVariants.default;
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
