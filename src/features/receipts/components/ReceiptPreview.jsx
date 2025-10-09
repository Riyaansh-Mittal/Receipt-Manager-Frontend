import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import { formatFileSize } from '../../../utils/file';
import { API_CONFIG } from '../../../constants/api.constants';

/**
 * Receipt Image/File Preview Component with Proper URL Handling
 */
const ReceiptPreview = ({ receipt, fileUrl }) => {
  const [imageError, setImageError] = useState(false);
  
  // ✅ Construct full image URL
  const getFullImageUrl = () => {
    if (!fileUrl && !receipt?.file_url) return null;
    
    const url = fileUrl || receipt?.file_url;
    
    // If URL already has protocol, use as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Otherwise, prepend base URL
    return `${API_CONFIG.BASE_URL}${url}`;
  };

  const fullImageUrl = getFullImageUrl();
  
  const isImage =
    receipt?.mime_type?.startsWith('image/') ||
    fullImageUrl?.match(/\.(jpg|jpeg|png)$/i);
  const isPDF = receipt?.mime_type === 'application/pdf';

  const handleImageError = () => {
    console.error('Failed to load image:', fullImageUrl);
    setImageError(true);
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
          {receipt?.file_size && (
            <span className="text-sm text-gray-600">
              {formatFileSize(receipt.file_size)}
            </span>
          )}
        </div>

        {/* Image Preview */}
        {isImage && fullImageUrl && !imageError && (
          <div className="relative">
            <img
              src={fullImageUrl}
              alt={receipt?.original_filename || 'Receipt'}
              className="w-full h-auto rounded-lg border border-gray-200"
              loading="lazy"
              onError={handleImageError}
            />
          </div>
        )}

        {/* Image Load Error */}
        {isImage && (imageError || !fullImageUrl) && (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {receipt?.original_filename || 'Receipt'}
            </p>
            <p className="text-xs text-gray-500">
              Image preview not available
            </p>
          </div>
        )}

        {/* PDF Preview */}
        {isPDF && fullImageUrl && (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="h-16 w-16 text-gray-400 mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {receipt?.original_filename || 'Receipt.pdf'}
            </p>
            <a
              href={fullImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Open PDF in new tab →
            </a>
          </div>
        )}

        {/* File Info */}
        {receipt && (
          <div className="pt-4 border-t border-gray-200">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Filename</dt>
                <dd className="font-medium text-gray-900 truncate">
                  {receipt.original_filename}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Upload Date</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(receipt.upload_date).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReceiptPreview;
