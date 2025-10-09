import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  uploadReceipt,
  pollUploadStatus,
  fetchExtractedData,
  fetchReceiptDetails,
  confirmReceipt,
  fetchReceipts,
  resetUploadState,
  setFilters,
  clearCurrentReceipt,
  invalidateCache as invalidateReceiptCache,
  selectReceipts,
  selectCurrentReceipt,
  selectExtractedData,
  selectUploadProgress,
  selectUploadStatus,
  selectUploadError,
  selectListStatus,
} from "../../../store/slices/receipt.slice";
import { showNotification } from "../../../store/slices/notification.slice";
import { REQUEST_STATUS } from "../../../constants/status.constants";
import { RECEIPT_ERROR_CODES } from "../../../constants/error.constants";

/**
 * Custom hook for receipt operations
 */
export const useReceipt = () => {
  const dispatch = useDispatch();
  const receipts = useSelector(selectReceipts);
  const currentReceipt = useSelector(selectCurrentReceipt);
  const extractedData = useSelector(selectExtractedData);
  const uploadProgress = useSelector(selectUploadProgress);
  const uploadStatus = useSelector(selectUploadStatus);
  const uploadError = useSelector(selectUploadError);
  const listStatus = useSelector(selectListStatus);

  const handleUpload = useCallback(
    async (file, onProgress) => {
      try {
        const resultAction = await dispatch(
          uploadReceipt({ file, onProgress })
        );

        if (uploadReceipt.fulfilled.match(resultAction)) {
          // ✅ Extract receipt ID from response
          const receiptId = resultAction.payload?.data?.receipt_id;

          if (!receiptId) {
            console.error(
              "❌ No receipt ID in response:",
              resultAction.payload
            );
            dispatch(
              showNotification({
                type: "error",
                message: "Upload succeeded but no receipt ID received.",
              })
            );
            return false;
          }

          console.log("✅ Upload successful, receipt ID:", receiptId);

          // Return success with receipt ID
          return {
            success: true,
            receiptId: receiptId,
          };
        } else {
          // Handle specific errors
          const error = resultAction.payload;

          // Duplicate receipt
          if (error?.code === RECEIPT_ERROR_CODES.DUPLICATE_RECEIPT) {
            return {
              success: false,
              error: error.code,
              existingReceiptId: error.context?.existing_receipt_id,
              message: error.message,
            };
          }

          // Quota exceeded
          if (
            error?.code === RECEIPT_ERROR_CODES.MONTHLY_UPLOAD_LIMIT_EXCEEDED
          ) {
            dispatch(
              showNotification({
                type: "error",
                message: error.message || "Monthly upload limit exceeded.",
                duration: 8000,
              })
            );
            return { success: false, error: error.code };
          }

          // Generic upload error
          dispatch(
            showNotification({
              type: "error",
              message:
                error.message || "Failed to upload receipt. Please try again.",
            })
          );
          return { success: false, error: error.code };
        }
      } catch (error) {
        console.error("❌ Upload exception:", error);
        dispatch(
          showNotification({
            type: "error",
            message: "An unexpected error occurred during upload.",
          })
        );
        return { success: false };
      }
    },
    [dispatch]
  );

  const pollStatus = useCallback(
    async (receiptId) => {
      try {
        const resultAction = await dispatch(pollUploadStatus(receiptId));
        return pollUploadStatus.fulfilled.match(resultAction)
          ? resultAction.payload.data
          : null;
      } catch (error) {
        return null;
      }
    },
    [dispatch]
  );

  const loadExtractedData = useCallback(
    async (receiptId) => {
      try {
        const resultAction = await dispatch(fetchExtractedData(receiptId));

        if (fetchExtractedData.fulfilled.match(resultAction)) {
          return true;
        } else {
          // Handle 202 - still processing
          const error = resultAction.payload;
          if (
            error?.code === RECEIPT_ERROR_CODES.RECEIPT_PROCESSING_IN_PROGRESS
          ) {
            // Don't show error - this is expected
            return false;
          }

          dispatch(
            showNotification({
              type: "error",
              message: error?.message || "Failed to load extracted data.",
            })
          );
          return false;
        }
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const loadReceiptDetails = useCallback(
    async (receiptId) => {
      console.log(
        "🔄 useReceipt: loadReceiptDetails called with ID:",
        receiptId
      );

      try {
        const resultAction = await dispatch(fetchReceiptDetails(receiptId));

        if (fetchReceiptDetails.fulfilled.match(resultAction)) {
          console.log("✅ useReceipt: Receipt details loaded successfully");
          return true;
        } else {
          console.error(
            "❌ useReceipt: Failed to load receipt details:",
            resultAction.error
          );
          return false;
        }
      } catch (error) {
        console.error(
          "❌ useReceipt: Exception loading receipt details:",
          error
        );
        return false;
      }
    },
    [dispatch]
  );

  const handleConfirm = useCallback(
    async (receiptId, confirmationData) => {
      try {
        const resultAction = await dispatch(
          confirmReceipt({ receiptId, confirmationData })
        );

        if (confirmReceipt.fulfilled.match(resultAction)) {
          return true;
        } else {
          const error = resultAction.payload;
          dispatch(
            showNotification({
              type: "error",
              message: error?.message || "Failed to confirm receipt.",
            })
          );
          return false;
        }
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const loadReceipts = useCallback(
    async (params = {}) => {
      try {
        const resultAction = await dispatch(fetchReceipts(params));
        return fetchReceipts.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const resetUpload = useCallback(() => {
    dispatch(resetUploadState());
  }, [dispatch]);

  const updateFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const clearReceipt = useCallback(() => {
    dispatch(clearCurrentReceipt());
  }, [dispatch]);

  const invalidateCache = useCallback(() => {
    dispatch(invalidateReceiptCache());
  }, [dispatch]);

  return {
    receipts,
    currentReceipt,
    extractedData,
    uploadProgress,
    uploadError,
    isUploading: uploadStatus === REQUEST_STATUS.LOADING,
    isLoadingList: listStatus === REQUEST_STATUS.LOADING,
    handleUpload,
    pollStatus,
    loadExtractedData,
    loadReceiptDetails,
    handleConfirm,
    loadReceipts,
    resetUpload,
    updateFilters,
    clearReceipt,
    invalidateCache,
  };
};

export default useReceipt;
