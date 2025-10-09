import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReceipt } from '../hooks/useReceipt';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorState from '../../../components/feedback/ErrorState';
import ReceiptStatusBadge from '../components/ReceiptStatusBadge';
import { ROUTES } from '../../../constants/routes.constants';
import { formatCurrency } from '../../../utils/currency';
import { formatDate, formatRelativeTime } from '../../../utils/date';
import { formatFileSize } from '../../../utils/file';
import { formatProcessingDuration, canConfirmReceipt } from '../../../utils/receipt';
import { API_CONFIG } from '../../../constants/api.constants';

/**
 * Receipt Detail Page - Complete with All Data
 */
const ReceiptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentReceipt, loadReceiptDetails, clearReceipt } = useReceipt();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, extracted, ocr

  useEffect(() => {
    console.log('🔍 ReceiptDetailPage mounted with ID:', id);
    
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      if (!id) {
        console.error('❌ No receipt ID provided');
        setError('No receipt ID provided');
        setIsLoading(false);
        return;
      }

      console.log('📥 Loading receipt details for:', id);
      const success = await loadReceiptDetails(id);

      if (!success) {
        console.error('❌ Failed to load receipt details');
        setError('Failed to load receipt details');
      } else {
        console.log('✅ Receipt details loaded successfully');
        console.log('📊 Receipt data:', currentReceipt);
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      console.log('🧹 ReceiptDetailPage unmounting, clearing receipt');
      clearReceipt();
    };
  }, [id, loadReceiptDetails, clearReceipt]);

  // Log receipt data when it changes
  useEffect(() => {
    if (currentReceipt) {
      console.log('📋 Current Receipt Full Data:', currentReceipt);
      console.log('💰 Amount:', currentReceipt.amount);
      console.log('📅 Date:', currentReceipt.date);
      console.log('🏪 Vendor:', currentReceipt.vendor);
      console.log('📦 Extracted Data:', currentReceipt.extracted_data);
      console.log('🤖 AI Suggestion:', currentReceipt.ai_suggestion);
    }
  }, [currentReceipt]);

  const handleReview = () => {
    navigate(ROUTES.RECEIPTS_REVIEW.replace(':id', id));
  };

  const handleBack = () => {
    navigate(ROUTES.RECEIPTS);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LoadingState message="Loading receipt details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorState 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  if (!currentReceipt) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorState 
          message="Receipt not found" 
          onRetry={handleBack}
        />
      </div>
    );
  }

  const receipt = currentReceipt;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="outline" size="sm" onClick={handleBack} className="mb-4">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Receipts
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {receipt.vendor || receipt.original_filename}
              </h1>
              <ReceiptStatusBadge status={receipt.status} />
            </div>
            <p className="text-sm text-gray-600">
              Uploaded {formatRelativeTime(receipt.upload_date)}
            </p>
          </div>

          {canConfirmReceipt(receipt) && (
            <Button onClick={handleReview} className="w-full sm:w-auto">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review & Confirm
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Receipt Image (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Receipt Image Card */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Receipt Image</h3>
              <div className="flex items-center gap-2">
                {receipt.file_size && (
                  <span className="text-sm text-gray-500">
                    {formatFileSize(receipt.file_size)}
                  </span>
                )}
                <button
                  onClick={() => setIsImageExpanded(!isImageExpanded)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isImageExpanded ? "Collapse" : "Expand"}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isImageExpanded ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <ReceiptImagePreview 
              receipt={receipt} 
              isExpanded={isImageExpanded}
            />
          </Card>

          {/* Tabs for Different Data Views */}
          <Card>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Receipt Details
              </button>
              {receipt.extracted_data && (
                <button
                  onClick={() => setActiveTab('extracted')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'extracted'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Extracted Data
                </button>
              )}
              {receipt.ocr_data && (
                <button
                  onClick={() => setActiveTab('ocr')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'ocr'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  OCR Text
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'details' && (
                <ReceiptDetailsView receipt={receipt} />
              )}
              {activeTab === 'extracted' && receipt.extracted_data && (
                <ExtractedDataView data={receipt.extracted_data} aiSuggestion={receipt.ai_suggestion} />
              )}
              {activeTab === 'ocr' && receipt.ocr_data && (
                <OCRDataView data={receipt.ocr_data} />
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Quick Info & Actions */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Info
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-600 mb-1">Status</dt>
                <dd>
                  <ReceiptStatusBadge status={receipt.status} />
                </dd>
              </div>

              {(receipt.amount || receipt.extracted_data?.total_amount) && (
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Total Amount</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      receipt.amount || receipt.extracted_data?.total_amount,
                      receipt.currency || receipt.extracted_data?.currency
                    )}
                  </dd>
                </div>
              )}

              {(receipt.date || receipt.extracted_data?.receipt_date) && (
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Receipt Date</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {formatDate(receipt.date || receipt.extracted_data?.receipt_date, 'long')}
                  </dd>
                </div>
              )}

              {(receipt.vendor || receipt.extracted_data?.vendor_name) && (
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Vendor</dt>
                  <dd className="text-base font-medium text-gray-900 break-words">
                    {receipt.vendor || receipt.extracted_data?.vendor_name}
                  </dd>
                </div>
              )}

              {receipt.category && (
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Category</dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-2xl">{receipt.category.icon}</span>
                    <span className="text-base font-medium text-gray-900">
                      {receipt.category.name}
                    </span>
                  </dd>
                </div>
              )}

              {receipt.description && (
                <div>
                  <dt className="text-sm text-gray-600 mb-1">Description</dt>
                  <dd className="text-sm text-gray-900">
                    {receipt.description}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm text-gray-600 mb-1">Upload Date</dt>
                <dd className="text-sm text-gray-900">
                  {formatDate(receipt.upload_date, 'long')}
                </dd>
              </div>
            </dl>
          </Card>

          {/* AI Suggestion */}
          {receipt.ai_suggestion && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    AI Suggestion
                  </h3>
                  <p className="text-xs text-gray-600">
                    {Math.round((receipt.ai_suggestion.confidence_score || 0) * 100)}% confidence
                  </p>
                </div>
              </div>
              {receipt.ai_suggestion.category && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg mb-2">
                  <span className="text-2xl">{receipt.ai_suggestion.category.icon}</span>
                  <span className="font-medium text-gray-900">
                    {receipt.ai_suggestion.category.name}
                  </span>
                </div>
              )}
              {receipt.ai_suggestion.reasoning && (
                <p className="text-xs text-gray-700 italic">
                  "{receipt.ai_suggestion.reasoning}"
                </p>
              )}
            </Card>
          )}

          {/* Tags */}
          {receipt.tags && receipt.tags.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {receipt.tags.map((tag, index) => (
                  <Badge key={index} variant="info">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Flags */}
          {(receipt.is_business_expense || receipt.is_reimbursable) && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Flags</h3>
              <div className="flex flex-wrap gap-2">
                {receipt.is_business_expense && (
                  <Badge variant="info">
                    💼 Business Expense
                  </Badge>
                )}
                {receipt.is_reimbursable && (
                  <Badge variant="success">
                    💵 Reimbursable
                  </Badge>
                )}
              </div>
            </Card>
          )}

          {/* File Info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">File Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-600">Filename</dt>
                <dd className="font-medium text-gray-900 truncate max-w-[180px]" title={receipt.original_filename}>
                  {receipt.original_filename}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Size</dt>
                <dd className="font-medium text-gray-900">
                  {formatFileSize(receipt.file_size)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Type</dt>
                <dd className="font-medium text-gray-900">
                  {receipt.mime_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                </dd>
              </div>
              {receipt.processing_duration_seconds && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Processing Time</dt>
                  <dd className="font-medium text-gray-900">
                    {formatProcessingDuration(receipt.processing_duration_seconds)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Actions */}
          {receipt.next_actions && receipt.next_actions.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Available Actions
              </h3>
              <div className="space-y-2">
                {receipt.next_actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      if (action.action === 'confirm') {
                        handleReview();
                      }
                    }}
                    fullWidth
                    variant="outline"
                    size="sm"
                  >
                    {action.description}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Receipt Details View Component
 */
const ReceiptDetailsView = ({ receipt }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <InfoItem label="Upload Date" value={formatDate(receipt.upload_date, 'long')} />
        {receipt.processing_started_at && (
          <InfoItem label="Processing Started" value={formatDate(receipt.processing_started_at, 'time')} />
        )}
        {receipt.processing_completed_at && (
          <InfoItem label="Processing Completed" value={formatDate(receipt.processing_completed_at, 'time')} />
        )}
        {receipt.processing_duration_seconds && (
          <InfoItem label="Processing Duration" value={formatProcessingDuration(receipt.processing_duration_seconds)} />
        )}
        <InfoItem label="File Size" value={receipt.file_size_mb ? `${receipt.file_size_mb.toFixed(2)} MB` : formatFileSize(receipt.file_size)} />
        <InfoItem label="File Type" value={receipt.mime_type} />
        <InfoItem label="Processing Progress" value={`${receipt.processing_progress || 0}%`} />
        <InfoItem label="Can Be Confirmed" value={receipt.can_be_confirmed ? 'Yes' : 'No'} />
      </div>
    </div>
  );
};

/**
 * Extracted Data View Component
 */
const ExtractedDataView = ({ data, aiSuggestion }) => {
  if (!data) {
    return <p className="text-gray-500 text-sm">No extracted data available</p>;
  }

  return (
    <div className="space-y-6">
      {/* Main Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Main Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Vendor" value={data.vendor_name} />
          <InfoItem label="Date" value={data.receipt_date ? formatDate(data.receipt_date) : undefined} />
          <InfoItem label="Total Amount" value={data.total_amount ? formatCurrency(data.total_amount, data.currency) : undefined} />
          <InfoItem label="Currency" value={data.currency} />
          <InfoItem label="Tax Amount" value={data.tax_amount ? formatCurrency(data.tax_amount, data.currency) : undefined} />
          <InfoItem label="Subtotal" value={data.subtotal ? formatCurrency(data.subtotal, data.currency) : undefined} />
        </div>
      </div>

      {/* Confidence Scores */}
      {data.confidence_scores && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Confidence Scores</h4>
          <div className="space-y-2">
            {Object.entries(data.confidence_scores).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        value >= 0.8 ? 'bg-green-500' : value >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Line Items */}
      {data.line_items && data.line_items.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Line Items</h4>
          <div className="space-y-2">
            {data.line_items.map((item, index) => (
              <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.description || `Item ${index + 1}`}
                  </p>
                  {item.quantity && (
                    <p className="text-xs text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {item.price ? formatCurrency(item.price, data.currency) : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * OCR Data View Component
 */
const OCRDataView = ({ data }) => {
  if (!data) {
    return <p className="text-gray-500 text-sm">No OCR data available</p>;
  }

  return (
    <div className="space-y-4">
      {data.confidence_score && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-gray-900">Overall Confidence</span>
          <span className="text-lg font-bold text-blue-600">
            {Math.round(data.confidence_score * 100)}%
          </span>
        </div>
      )}

      {data.extracted_text && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Extracted Text</h4>
          <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {data.extracted_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Info Item Component
 */
const InfoItem = ({ label, value }) => {
  if (!value && value !== 0) return null;
  
  return (
    <div>
      <dt className="text-xs text-gray-600 mb-1">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 break-words">{value}</dd>
    </div>
  );
};

/**
 * Receipt Image Preview Component
 */
const ReceiptImagePreview = ({ receipt, isExpanded }) => {
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const getFullImageUrl = () => {
    if (!receipt?.file_url) return null;
    
    const url = receipt.file_url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return `${API_CONFIG.BASE_URL}${url}`;
  };

  const fullImageUrl = getFullImageUrl();
  const isImage = receipt?.mime_type?.startsWith('image/');
  const isPDF = receipt?.mime_type === 'application/pdf';

  const handleImageError = () => {
    console.error('Failed to load image:', fullImageUrl);
    setImageError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fullscreen Modal
  if (isFullscreen && isImage && fullImageUrl && !imageError) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
        onClick={toggleFullscreen}
      >
        <div className="relative max-w-7xl max-h-full">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={fullImageUrl}
            alt={receipt?.original_filename || 'Receipt'}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Image */}
      {isImage && fullImageUrl && !imageError && (
        <div className="relative group">
          <img
            src={fullImageUrl}
            alt={receipt?.original_filename || 'Receipt'}
            className={`w-full object-contain rounded-lg border border-gray-200 cursor-pointer transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'max-h-[600px]'
            }`}
            loading="lazy"
            onError={handleImageError}
            onClick={toggleFullscreen}
          />
          {/* Fullscreen button overlay */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      )}

      {/* Image Error */}
      {isImage && (imageError || !fullImageUrl) && (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-1">{receipt?.original_filename || 'Receipt'}</p>
          <p className="text-xs text-gray-500">Image preview not available</p>
        </div>
      )}

      {/* PDF */}
      {isPDF && fullImageUrl && (
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-300">
          <svg className="h-20 w-20 text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <p className="text-base font-semibold text-gray-900 mb-2">{receipt?.original_filename || 'Receipt.pdf'}</p>
          <p className="text-sm text-gray-600 mb-4">PDF Document</p>
          <a
            href={fullImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open PDF
          </a>
        </div>
      )}
    </div>
  );
};

export default ReceiptDetailPage;
