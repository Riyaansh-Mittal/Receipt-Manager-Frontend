import React, { useRef } from 'react';
import { getFileIcon, formatFileSize } from '../../utils/file';
import Button from './Button';

/**
 * File Upload Component with drag and drop
 */
const FileUpload = ({
  file,
  preview,
  error,
  isProcessing,
  onFileSelect,
  onClear,
  accept,
  maxSize,
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  return (
    <div className={className}>
      {!file ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessing}
          />

          <div className="flex flex-col items-center space-y-4">
            <svg
              className={`h-16 w-16 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {isDragging ? 'Drop file here' : 'Upload Receipt'}
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop or{' '}
                <span className="text-blue-600 font-medium">browse</span>
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <p>Supported: JPG, PNG, PDF</p>
              <p>Max size: {maxSize ? `${(maxSize / 1024 / 1024).toFixed(0)}MB` : '10MB'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-start space-x-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">{getFileIcon(file.type)}</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(file.size)}
              </p>
              
              {isProcessing && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-600">Processing...</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isProcessing}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
