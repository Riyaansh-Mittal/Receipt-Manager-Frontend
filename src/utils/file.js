import { UPLOAD_CONFIG } from '../constants/api.constants';
import { FILE_TYPES } from '../constants/receipt.constants';

/**
 * Validate file before upload
 */
export const validateFile = (file) => {
  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('Please select a file');
    return { valid: false, errors };
  }

  // Check file size
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = (UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Check file type
  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    const allowedExtensions = Object.values(FILE_TYPES)
      .map((t) => t.ext)
      .join(', ');
    errors.push(`Invalid file type. Allowed: ${allowedExtensions}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Get file type label
 */
export const getFileTypeLabel = (mimeType) => {
  return FILE_TYPES[mimeType]?.label || 'Unknown';
};

/**
 * Create file preview URL
 */
export const createFilePreview = (file) => {
  if (!file) return null;
  
  // Only create preview for images
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  
  return null;
};

/**
 * Revoke file preview URL
 */
export const revokeFilePreview = (url) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Compress image before upload (optional optimization)
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Calculate file hash for duplicate detection (optional)
 */
export const calculateFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Check if file is an image
 */
export const isImage = (file) => {
  return file && file.type.startsWith('image/');
};

/**
 * Check if file is a PDF
 */
export const isPDF = (file) => {
  return file && file.type === 'application/pdf';
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  }
  if (mimeType === 'application/pdf') {
    return '📄';
  }
  return '📎';
};
