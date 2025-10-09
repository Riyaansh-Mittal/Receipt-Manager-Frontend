import React from 'react';

/**
 * Card Component - Must pass through onClick properly
 */
const Card = ({ 
  children, 
  className = '', 
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const handleClick = (e) => {
    if (onClick) {
      console.log('🎯 Card onClick triggered');
      onClick(e);
    }
  };
  
  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
