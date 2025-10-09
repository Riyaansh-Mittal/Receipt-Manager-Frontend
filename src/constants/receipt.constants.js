export const RECEIPT_STATUS = {
  UPLOADED: 'uploaded',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  COMPLETED: 'completed', // Backend returns this
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Map backend status to frontend status
export const STATUS_MAP = {
  'uploaded': RECEIPT_STATUS.UPLOADED,
  'queued': RECEIPT_STATUS.QUEUED,
  'processing': RECEIPT_STATUS.PROCESSING,
  'processed': RECEIPT_STATUS.PROCESSED,
  'completed': RECEIPT_STATUS.PROCESSED, // Map completed to processed
  'confirmed': RECEIPT_STATUS.CONFIRMED,
  'failed': RECEIPT_STATUS.FAILED,
  'cancelled': RECEIPT_STATUS.CANCELLED,
};

export const RECEIPT_STATUS_LABELS = {
  [RECEIPT_STATUS.UPLOADED]: 'Uploaded',
  [RECEIPT_STATUS.QUEUED]: 'Queued',
  [RECEIPT_STATUS.PROCESSING]: 'Processing',
  [RECEIPT_STATUS.PROCESSED]: 'Processed',
  [RECEIPT_STATUS.COMPLETED]: 'Completed',
  [RECEIPT_STATUS.CONFIRMED]: 'Confirmed',
  [RECEIPT_STATUS.FAILED]: 'Failed',
  [RECEIPT_STATUS.CANCELLED]: 'Cancelled',
};

export const RECEIPT_STATUS_COLORS = {
  [RECEIPT_STATUS.UPLOADED]: 'blue',
  [RECEIPT_STATUS.QUEUED]: 'yellow',
  [RECEIPT_STATUS.PROCESSING]: 'orange',
  [RECEIPT_STATUS.PROCESSED]: 'green',
  [RECEIPT_STATUS.COMPLETED]: 'green',
  [RECEIPT_STATUS.CONFIRMED]: 'success',
  [RECEIPT_STATUS.FAILED]: 'error',
  [RECEIPT_STATUS.CANCELLED]: 'default',
};

export const PROCESSING_STAGES = {
  OCR: 'ocr',
  OCR_EXTRACTION: 'ocr_extraction',
  DATA_PARSING: 'data_parsing',
  AI_CATEGORIZATION: 'ai_categorization',
  VALIDATION: 'validation',
  COMPLETED: 'completed',
};

export const PROCESSING_STAGE_LABELS = {
  [PROCESSING_STAGES.OCR]: 'Extracting text...',
  [PROCESSING_STAGES.OCR_EXTRACTION]: 'Extracting text...',
  [PROCESSING_STAGES.DATA_PARSING]: 'Parsing data...',
  [PROCESSING_STAGES.AI_CATEGORIZATION]: 'AI categorizing...',
  [PROCESSING_STAGES.VALIDATION]: 'Validating...',
  [PROCESSING_STAGES.COMPLETED]: 'Complete',
};

export const FILE_TYPES = {
  'image/jpeg': { ext: '.jpg, .jpeg', label: 'JPEG Image' },
  'image/jpg': { ext: '.jpg', label: 'JPG Image' },
  'image/png': { ext: '.png', label: 'PNG Image' },
  'application/pdf': { ext: '.pdf', label: 'PDF Document' },
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const DEFAULT_CURRENCY = 'USD';

export const RECEIPT_SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: '-updated_at', label: 'Recently Updated' },
  { value: 'updated_at', label: 'Least Recently Updated' },
];
