import {
  RECEIPT_STATUS,
  STATUS_MAP,
  RECEIPT_STATUS_LABELS,
  RECEIPT_STATUS_COLORS,
  PROCESSING_STAGE_LABELS,
} from '../constants/receipt.constants';

/**
 * Normalize status from backend to frontend
 */
export const normalizeStatus = (status) => {
  return STATUS_MAP[status?.toLowerCase()] || status;
};

/**
 * Get receipt status label
 */
export const getReceiptStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  return RECEIPT_STATUS_LABELS[normalized] || status;
};

/**
 * Get receipt status color
 */
export const getReceiptStatusColor = (status) => {
  const normalized = normalizeStatus(status);
  return RECEIPT_STATUS_COLORS[normalized] || 'default';
};

/**
 * Get processing stage label
 */
export const getProcessingStageLabel = (stage) => {
  return PROCESSING_STAGE_LABELS[stage] || stage;
};

/**
 * Check if receipt can be confirmed
 */
export const canConfirmReceipt = (receipt) => {
  if (!receipt) return false;
  
  const normalized = normalizeStatus(receipt.status);
  return (
    (normalized === RECEIPT_STATUS.PROCESSED || 
     normalized === RECEIPT_STATUS.COMPLETED) &&
    receipt.can_be_confirmed !== false
  );
};

/**
 * Check if receipt is processing
 */
export const isReceiptProcessing = (receipt) => {
  if (!receipt) return false;
  
  const normalized = normalizeStatus(receipt.status);
  return (
    normalized === RECEIPT_STATUS.QUEUED ||
    normalized === RECEIPT_STATUS.PROCESSING ||
    normalized === RECEIPT_STATUS.UPLOADED
  );
};

/**
 * Check if receipt processing is complete
 */
export const isReceiptProcessed = (receipt) => {
  if (!receipt) return false;
  
  const normalized = normalizeStatus(receipt.status);
  return (
    normalized === RECEIPT_STATUS.PROCESSED ||
    normalized === RECEIPT_STATUS.COMPLETED
  );
};

/**
 * Check if receipt is confirmed
 */
export const isReceiptConfirmed = (receipt) => {
  if (!receipt) return false;
  
  const normalized = normalizeStatus(receipt.status);
  return normalized === RECEIPT_STATUS.CONFIRMED;
};

/**
 * Check if receipt processing failed
 */
export const isReceiptFailed = (receipt) => {
  if (!receipt) return false;
  
  const normalized = normalizeStatus(receipt.status);
  return normalized === RECEIPT_STATUS.FAILED;
};

/**
 * Get confidence badge variant
 */
export const getConfidenceBadgeVariant = (confidence) => {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.7) return 'info';
  if (confidence >= 0.5) return 'warning';
  return 'error';
};

/**
 * Format confidence percentage
 */
export const formatConfidence = (confidence) => {
  return `${Math.round(confidence * 100)}%`;
};

/**
 * Calculate overall extraction accuracy
 */
export const calculateAccuracy = (confidenceScores) => {
  if (!confidenceScores || Object.keys(confidenceScores).length === 0) {
    return 0;
  }

  const scores = Object.values(confidenceScores);
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
};

/**
 * Validate receipt date
 */
export const validateReceiptDate = (date) => {
  if (!date) {
    return 'Date is required';
  }

  const receiptDate = new Date(date);
  const now = new Date();
  const minDate = new Date('2000-01-01');
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  if (receiptDate > now) {
    return 'Receipt date cannot be in the future';
  }

  if (receiptDate < minDate) {
    return 'Receipt date cannot be before year 2000';
  }

  if (receiptDate < twoYearsAgo) {
    return 'Receipt date cannot be more than 2 years old';
  }

  return null;
};

/**
 * Validate vendor name
 */
export const validateVendor = (vendor) => {
  if (!vendor) {
    return null; // Vendor is optional
  }

  if (vendor.length > 255) {
    return 'Vendor name cannot exceed 255 characters';
  }

  // Check for invalid characters
  const invalidChars = /[<>"']/;
  if (invalidChars.test(vendor)) {
    return 'Vendor name contains invalid characters';
  }

  return null;
};

/**
 * Validate tags
 */
export const validateTags = (tags) => {
  if (!tags || tags.length === 0) {
    return null; // Tags are optional
  }

  if (tags.length > 10) {
    return 'Maximum 10 tags allowed';
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      return 'Each tag cannot exceed 50 characters';
    }
  }

  return null;
};

/**
 * Format processing duration
 */
export const formatProcessingDuration = (seconds) => {
  if (!seconds) return 'N/A';
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
};
