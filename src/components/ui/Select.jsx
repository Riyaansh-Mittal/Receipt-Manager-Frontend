import React, { forwardRef } from 'react';

/**
 * Select/Dropdown Component
 */
const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      placeholder = 'Select an option',
      fullWidth = true,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';
    const errorClasses = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${widthClass} ${className}`}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
