import React, { forwardRef } from 'react';

/**
 * Textarea Component
 */
const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      required = false,
      disabled = false,
      rows = 3,
      maxLength,
      showCount = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(props.value?.length || 0);

    const handleChange = (e) => {
      setCharCount(e.target.value.length);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const baseClasses =
      'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y';
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
        
        <textarea
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          className={`${baseClasses} ${errorClasses} ${widthClass} ${className}`}
          disabled={disabled}
          {...props}
          onChange={handleChange}
        />
        
        <div className="flex justify-between mt-1">
          <div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
          
          {showCount && maxLength && (
            <p className="text-sm text-gray-500">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
