import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useReceipt } from '../hooks/useReceipt';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorState from '../../../components/feedback/ErrorState';
import ExtractedDataPreview from '../components/ExtractedDataPreview';
import ConfirmationForm from '../components/ConfirmationForm';
import { showNotification } from '../../../store/slices/notification.slice';
import { ROUTES } from '../../../constants/routes.constants';
import { invalidateCache as invalidateReceiptCache } from '../../../store/slices/receipt.slice';
import { invalidateCache as invalidateQuotaCache } from '../../../store/slices/quota.slice';
import { isReceiptProcessed } from '../../../utils/receipt';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { API_CONFIG } from '../../../constants/api.constants';

/**
 * Review Receipt Page - Enhanced UI
 */
const ReviewReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    currentReceipt,
    loadReceiptDetails,
    handleConfirm,
    clearReceipt,
  } = useReceipt();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      console.log('📥 Loading receipt details for:', id);
      
      const success = await loadReceiptDetails(id);

      if (!success) {
        setError('Failed to load receipt data');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      clearReceipt();
    };
  }, [id, loadReceiptDetails, clearReceipt]);

  // Check if receipt is ready for confirmation
  useEffect(() => {
    if (currentReceipt && !isLoading) {
      console.log('📊 Current receipt:', currentReceipt);
      
      if (!isReceiptProcessed(currentReceipt)) {
        console.log('⚠️ Receipt not yet processed');
        dispatch(
          showNotification({
            type: 'warning',
            message: 'Receipt is still processing. Please wait...',
          })
        );
        
        setTimeout(() => {
          navigate(ROUTES.RECEIPTS);
        }, 3000);
      }
    }
  }, [currentReceipt, isLoading, dispatch, navigate]);

  const handleSubmit = async (confirmationData) => {
    setIsConfirming(true);

    const success = await handleConfirm(id, confirmationData);

    if (success) {
      dispatch(
        showNotification({
          type: 'success',
          message: 'Receipt confirmed successfully! Ledger entry created.',
        })
      );

      dispatch(invalidateReceiptCache());
      dispatch(invalidateQuotaCache());

      navigate(ROUTES.RECEIPTS);
    } else {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Failed to confirm receipt. Please try again.',
        })
      );
    }

    setIsConfirming(false);
  };

  const handleCancel = () => {
    navigate(ROUTES.RECEIPTS);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LoadingState message="Loading receipt details..." />
      </div>
    );
  }

  if (error || !currentReceipt) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorState 
          message={error || 'Receipt not found'} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  const hasExtractedData = currentReceipt.extracted_data || currentReceipt.ocr_data;
  const hasAiSuggestion = currentReceipt.ai_suggestion;

  if (!hasExtractedData) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorState 
          message="Receipt data not yet available. Please try again in a moment."
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  const getFullImageUrl = () => {
    if (!currentReceipt?.file_url) return null;
    const url = currentReceipt.file_url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_CONFIG.BASE_URL}${url}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTES.RECEIPTS)}
          className="mb-4"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Receipts
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review & Confirm</h1>
            <p className="text-gray-600 mt-1">
              Review the extracted data and make corrections if needed
            </p>
          </div>
          
          {/* Quick Summary Badge */}
          {currentReceipt.extracted_data?.total_amount && (
            <div className="flex items-center gap-3">
              <Badge variant="info" className="text-lg px-4 py-2">
                {formatCurrency(
                  currentReceipt.extracted_data.total_amount,
                  currentReceipt.extracted_data.currency
                )}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestion Alert */}
      {hasAiSuggestion && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                AI Category Suggestion
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Our AI suggests categorizing this as{' '}
                <span className="font-semibold">
                  {currentReceipt.ai_suggestion.category?.icon}{' '}
                  {currentReceipt.ai_suggestion.category?.name}
                </span>{' '}
                with {Math.round((currentReceipt.ai_suggestion.confidence_score || 0) * 100)}% confidence
              </p>
              {currentReceipt.ai_suggestion.reasoning && (
                <p className="text-xs text-gray-600 italic">
                  💡 {currentReceipt.ai_suggestion.reasoning}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Receipt Image & Extracted Data (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Receipt Image */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Receipt Image</h3>
              <button
                onClick={() => setImageExpanded(!imageExpanded)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {imageExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            
            <EnhancedReceiptImage 
              imageUrl={getFullImageUrl()} 
              filename={currentReceipt.original_filename}
              isExpanded={imageExpanded}
            />
          </Card>

          {/* Extracted Data */}
          <ExtractedDataPreview
            extractedData={currentReceipt.extracted_data}
            confidenceScores={currentReceipt.extracted_data?.confidence_scores}
          />

          {/* Mobile: Show form here on mobile */}
          <div className="lg:hidden">
            <Card className="sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Details
              </h3>
              <ConfirmationForm
                extractedData={currentReceipt.extracted_data}
                suggestedCategory={hasAiSuggestion ? currentReceipt.ai_suggestion : null}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isConfirming}
              />
            </Card>
          </div>
        </div>

        {/* Right Column - Confirmation Form (1/3) - Sticky on Desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Review and edit the information below
                </p>
              </div>
              
              <ConfirmationForm
                extractedData={currentReceipt.extracted_data}
                suggestedCategory={hasAiSuggestion ? currentReceipt.ai_suggestion : null}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isConfirming}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Bar (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-7xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Scroll to form on mobile
              const formElement = document.querySelector('form');
              if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            disabled={isConfirming}
            className="flex-1"
          >
            Review Form
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Receipt Image Component
 */
const EnhancedReceiptImage = ({ imageUrl, filename, isExpanded }) => {
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-600">Image not available</p>
      </div>
    );
  }

  // Fullscreen Modal
  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
        onClick={() => setIsFullscreen(false)}
      >
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={imageUrl}
          alt={filename}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-900 mb-1">Failed to load image</p>
        <p className="text-xs text-gray-600">{filename}</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={imageUrl}
        alt={filename}
        className={`w-full object-contain rounded-lg border border-gray-200 cursor-pointer transition-all duration-300 ${
          isExpanded ? 'max-h-none' : 'max-h-[500px]'
        }`}
        onError={() => setImageError(true)}
        onClick={() => setIsFullscreen(true)}
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button
          onClick={() => setIsFullscreen(true)}
          className="px-4 py-2 bg-white rounded-lg shadow-lg font-medium text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <svg className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          View Full Size
        </button>
      </div>

      {/* Filename Caption */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        {filename}
      </div>
    </div>
  );
};

export default ReviewReceiptPage;
