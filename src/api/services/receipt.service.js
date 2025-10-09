import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const receiptService = {
  // Upload Receipt
  uploadReceipt: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      API_ENDPOINTS.RECEIPTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data;
  },

  // Get Upload Status
  getUploadStatus: async (receiptId) => {
    const response = await apiClient.get(
      API_ENDPOINTS.RECEIPTS.UPLOAD_STATUS.replace(':id', receiptId)
    );
    return response.data;
  },

  // Get Receipt Details
  getReceiptDetails: async (receiptId) => {
    console.log('📡 Fetching receipt details for:', receiptId);
    const response = await apiClient.get(
      API_ENDPOINTS.RECEIPTS.DETAIL.replace(':id', receiptId)
    );
    console.log('📦 Receipt details response:', response.data);
    return response.data;
  },

  // Get Extracted Data
  getExtractedData: async (receiptId) => {
    const response = await apiClient.get(
      API_ENDPOINTS.RECEIPTS.EXTRACTED_DATA.replace(':id', receiptId)
    );
    return response.data;
  },

  // Confirm Receipt
  confirmReceipt: async (receiptId, confirmationData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.RECEIPTS.CONFIRM.replace(':id', receiptId),
      confirmationData
    );
    return response.data;
  },

  // List Receipts
  listReceipts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.RECEIPTS.LIST, {
      params,
    });
    return response.data;
  },
};

export default receiptService;
