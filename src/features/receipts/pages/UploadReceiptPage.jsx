import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useReceipt } from '../hooks/useReceipt';
import { useFileUpload } from '../../../hooks/useFileUpload';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import FileUpload from '../../../components/ui/FileUpload';
import UploadProgress from '../components/UploadProgress';
import DuplicateReceiptModal from '../components/DuplicateReceiptModal';
import { showNotification } from '../../../store/slices/notification.slice';
import { ROUTES } from '../../../constants/routes.constants';
import { UPLOAD_CONFIG } from '../../../constants/api.constants';
import { RECEIPT_STATUS } from '../../../constants/receipt.constants';
import { normalizeStatus } from '../../../utils/receipt';
import { RECEIPT_ERROR_CODES } from '../../../constants/error.constants';
import { fetchQuotaStatus, invalidateCache as invalidateQuotaCache } from '../../../store/slices/quota.slice';
import { useSelector } from 'react-redux';
import { selectQuotaStatus } from '../../../store/slices/quota.slice';

/**
 * Upload Receipt Page with Correct Flow
 */
const UploadReceiptPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    uploadProgress,
    isUploading,
    handleUpload,
    pollStatus,
    resetUpload,
  } = useReceipt();

  const quotaStatus = useSelector(selectQuotaStatus);

  const {
    file,
    preview,
    error: fileError,
    isProcessing: isFileProcessing,
    handleFileSelect,
    clearFile,
    reset: resetFileUpload,
  } = useFileUpload({
    compress: true,
    maxWidth: 1920,
    quality: 0.85,
  });

  const [uploadStage, setUploadStage] = useState('select');
  const [processingData, setProcessingData] = useState({
    progress: 0,
    stage: null,
    status: null,
  });
  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    existingReceiptId: null,
    message: '',
  });

  // Refs for polling - USE ONLY ONE SOURCE OF TRUTH
  const pollingIntervalRef = useRef(null);
  const currentReceiptIdRef = useRef(null); // This is the ONLY receipt ID ref
  const pollingAttemptsRef = useRef(0);
  const MAX_POLLING_ATTEMPTS = 40;

  // Load quota on mount
  useEffect(() => {
    dispatch(fetchQuotaStatus());
  }, [dispatch]);

  // Polling function - FIXED to use correct receipt ID
  const checkUploadStatus = useCallback(async () => {
    const receiptId = currentReceiptIdRef.current;
    
    if (!receiptId) {
      console.log('❌ No receipt ID, stopping poll');
      return true;
    }

    pollingAttemptsRef.current += 1;

    try {
      console.log(`🔄 Polling attempt ${pollingAttemptsRef.current} for receipt: ${receiptId}`);
      const statusData = await pollStatus(receiptId);
      
      if (!statusData) {
        console.log('⚠️ No status data received');
        return false;
      }

      const { status, progress_percentage, current_stage, error_message } = statusData;
      const normalizedStatus = normalizeStatus(status);
      
      console.log('📊 Status update:', { 
        receiptId,
        status: normalizedStatus, 
        progress: progress_percentage, 
        stage: current_stage 
      });

      // Update processing data
      setProcessingData({
        progress: progress_percentage || 0,
        stage: current_stage,
        status: normalizedStatus,
      });

      // ✅ Check if processing is complete
      if (normalizedStatus === RECEIPT_STATUS.PROCESSED || 
          normalizedStatus === RECEIPT_STATUS.COMPLETED ||
          progress_percentage === 100) {
        console.log('✅ Processing complete!');
        stopPolling();
        setUploadStage('complete');
        
        dispatch(
          showNotification({
            type: 'success',
            message: 'Receipt processed successfully!',
          })
        );

        // Invalidate quota cache
        dispatch(invalidateQuotaCache());

        // Navigate to review page with CORRECT receipt ID
        setTimeout(() => {
          navigate(ROUTES.RECEIPTS_REVIEW.replace(':id', receiptId));
        }, 1500);

        return true;
      }

      // ❌ Check if processing failed
      if (normalizedStatus === RECEIPT_STATUS.FAILED) {
        console.log('❌ Processing failed');
        stopPolling();
        dispatch(
          showNotification({
            type: 'error',
            message: error_message || 'Receipt processing failed. Please try again.',
            duration: 8000,
          })
        );
        setUploadStage('select');
        resetUpload();
        currentReceiptIdRef.current = null;
        return true;
      }

      // ⏱️ Check max attempts
      if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
        console.log('⏱️ Max polling attempts reached');
        stopPolling();
        dispatch(
          showNotification({
            type: 'warning',
            message: 'Processing is taking longer than expected. You can check the receipt status in your receipts list.',
            duration: 10000,
          })
        );
        navigate(ROUTES.RECEIPTS);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Polling error:', error);
      
      if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
        stopPolling();
        dispatch(
          showNotification({
            type: 'error',
            message: 'Unable to check processing status. Please check your receipts list.',
          })
        );
        navigate(ROUTES.RECEIPTS);
        return true;
      }
      
      return false;
    }
  }, [pollStatus, dispatch, navigate, resetUpload]);

  // Start polling
  const startPolling = useCallback(() => {
    console.log('▶️ Starting polling...');
    
    if (pollingIntervalRef.current) {
      console.log('⚠️ Polling already active');
      return;
    }

    pollingAttemptsRef.current = 0;

    // Execute immediately
    checkUploadStatus();

    // Then set up interval
    pollingIntervalRef.current = setInterval(() => {
      checkUploadStatus();
    }, UPLOAD_CONFIG.POLLING_INTERVAL);
  }, [checkUploadStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    console.log('⏹️ Stopping polling...');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingAttemptsRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleUploadClick = async () => {
    if (!file) return;

    // Check quota
    if (quotaStatus && quotaStatus.quota_exceeded) {
      dispatch(
        showNotification({
          type: 'error',
          message: `Monthly upload limit reached (${quotaStatus.current_month_uploads}/${quotaStatus.monthly_limit}). Resets on ${quotaStatus.reset_date}`,
          duration: 8000,
        })
      );
      return;
    }

    setUploadStage('uploading');
    
    // ✅ CLEAR OLD RECEIPT ID BEFORE UPLOAD
    currentReceiptIdRef.current = null;

    const result = await handleUpload(file);

    // Handle different results
    if (result === true) {
      // Success - NOW extract the receipt ID from the response
      // The handleUpload should return the response data
      console.log('✅ Upload successful, waiting for receipt ID...');
      
      // Give Redux state a moment to update
      setTimeout(() => {
        // We need to get the receipt ID from somewhere
        // Let's modify handleUpload to return it
      }, 100);
      
    } else if (result && typeof result === 'object' && result.success === false) {
      // Handle errors
      if (result.error === RECEIPT_ERROR_CODES.DUPLICATE_RECEIPT) {
        setUploadStage('select');
        setDuplicateModal({
          isOpen: true,
          existingReceiptId: result.existingReceiptId,
          message: result.message,
        });
      } else {
        setUploadStage('select');
      }
    } else if (result && result.receiptId) {
      // ✅ SUCCESS WITH RECEIPT ID
      const receiptId = result.receiptId;
      console.log('✅ Upload successful, received receipt ID:', receiptId);
      
      // SET THE RECEIPT ID
      currentReceiptIdRef.current = receiptId;
      
      setUploadStage('processing');
      dispatch(invalidateQuotaCache());
      startPolling();
    } else {
      setUploadStage('select');
    }
  };

  const handleCancel = () => {
    stopPolling();
    resetUpload();
    resetFileUpload();
    setUploadStage('select');
    currentReceiptIdRef.current = null;
    setProcessingData({ progress: 0, stage: null, status: null });
  };

  const handleBack = () => {
    navigate(ROUTES.RECEIPTS);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Duplicate Receipt Modal */}
      <DuplicateReceiptModal
        isOpen={duplicateModal.isOpen}
        onClose={() => setDuplicateModal({ isOpen: false, existingReceiptId: null, message: '' })}
        existingReceiptId={duplicateModal.existingReceiptId}
        message={duplicateModal.message}
      />

      {/* Header */}
      <div>
        <Button variant="outline" size="sm" onClick={handleBack} className="mb-4">
          ← Back to Receipts
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Upload Receipt</h1>
        <p className="text-gray-600 mt-1">
          Upload your receipt for automatic processing and categorization
        </p>
      </div>

      {/* Quota Status */}
      {quotaStatus && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Monthly Uploads</p>
              <p className="text-xs text-blue-700 mt-1">
                {quotaStatus.current_month_uploads || 0} of {quotaStatus.monthly_limit} used
                ({quotaStatus.remaining_uploads} remaining)
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">
                {Math.round(quotaStatus.utilization_percentage || 0)}%
              </p>
            </div>
          </div>
          <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${quotaStatus.utilization_percentage || 0}%` }}
            />
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        {uploadStage === 'select' && (
          <div className="space-y-6">
            <FileUpload
              file={file}
              preview={preview}
              error={fileError}
              isProcessing={isFileProcessing}
              onFileSelect={handleFileSelect}
              onClear={clearFile}
              accept={UPLOAD_CONFIG.ALLOWED_TYPES.join(',')}
              maxSize={UPLOAD_CONFIG.MAX_FILE_SIZE}
            />

            {file && !fileError && (
              <div className="flex gap-4">
                <Button
                  onClick={handleUploadClick}
                  disabled={isUploading || isFileProcessing}
                  loading={isUploading}
                  fullWidth
                >
                  Upload & Process
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFile}
                  disabled={isUploading || isFileProcessing}
                >
                  Clear
                </Button>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                📝 Tips for Better Results
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure the receipt is clearly visible and well-lit</li>
                <li>• Avoid blurry or folded receipts</li>
                <li>• Supported formats: JPG, PNG, PDF</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>
        )}

        {(uploadStage === 'uploading' || uploadStage === 'processing') && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {uploadStage === 'uploading' ? 'Uploading Receipt...' : 'Processing Receipt...'}
              </h3>
              <p className="text-sm text-gray-600">
                {uploadStage === 'uploading'
                  ? 'Securely uploading your file'
                  : 'Extracting data and categorizing'}
              </p>
            </div>

            <UploadProgress
              receipt={null}
              progress={uploadStage === 'uploading' ? uploadProgress : processingData.progress}
              stage={processingData.stage}
            />

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-3 bg-gray-100 rounded text-xs font-mono">
                <p><strong>Current Receipt ID:</strong> {currentReceiptIdRef.current || 'None'}</p>
                <p><strong>Status:</strong> {processingData.status || 'N/A'}</p>
                <p><strong>Progress:</strong> {processingData.progress}%</p>
                <p><strong>Stage:</strong> {processingData.stage || 'N/A'}</p>
                <p><strong>Polling Active:</strong> {pollingIntervalRef.current ? 'Yes' : 'No'}</p>
                <p><strong>Attempts:</strong> {pollingAttemptsRef.current}/{MAX_POLLING_ATTEMPTS}</p>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {uploadStage === 'complete' && (
          <div className="text-center space-y-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">Processing Complete!</h3>
            <p className="text-gray-600">Redirecting to review page...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadReceiptPage;
