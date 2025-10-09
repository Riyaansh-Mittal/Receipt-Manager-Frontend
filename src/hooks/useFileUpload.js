import { useState, useCallback } from 'react';
import { validateFile, compressImage } from '../utils/file';

/**
 * Custom hook for file upload with validation and preview
 */
export const useFileUpload = (options = {}) => {
  const {
    onValidate = validateFile,
    compress = false,
    maxWidth = 1920,
    quality = 0.8,
  } = options;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(
    async (selectedFile) => {
      setError(null);
      setIsProcessing(true);

      try {
        // Validate file
        const validation = onValidate(selectedFile);
        if (!validation.valid) {
          setError(validation.errors.join(', '));
          setIsProcessing(false);
          return false;
        }

        // Compress image if enabled
        let processedFile = selectedFile;
        if (compress && selectedFile.type.startsWith('image/')) {
          try {
            processedFile = await compressImage(selectedFile, maxWidth, quality);
          } catch (compressionError) {
            console.warn('Image compression failed, using original:', compressionError);
            processedFile = selectedFile;
          }
        }

        // Create preview for images
        if (processedFile.type.startsWith('image/')) {
          const previewUrl = URL.createObjectURL(processedFile);
          setPreview(previewUrl);
        }

        setFile(processedFile);
        setIsProcessing(false);
        return true;
      } catch (err) {
        setError('Failed to process file');
        setIsProcessing(false);
        return false;
      }
    },
    [onValidate, compress, maxWidth, quality]
  );

  const clearFile = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setError(null);
  }, [preview]);

  const reset = useCallback(() => {
    clearFile();
    setIsProcessing(false);
  }, [clearFile]);

  return {
    file,
    preview,
    error,
    isProcessing,
    handleFileSelect,
    clearFile,
    reset,
  };
};

export default useFileUpload;
