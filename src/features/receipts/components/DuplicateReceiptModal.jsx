import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes.constants';

/**
 * Duplicate Receipt Modal Component
 */
const DuplicateReceiptModal = ({ isOpen, onClose, existingReceiptId, message }) => {
  const navigate = useNavigate();

  const handleViewExisting = () => {
    onClose();
    navigate(ROUTES.RECEIPTS_DETAIL.replace(':id', existingReceiptId));
  };

  const handleGoToList = () => {
    onClose();
    navigate(ROUTES.RECEIPTS);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Receipt Detected"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <svg
            className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              {message || 'This receipt has already been uploaded. Would you like to view the existing receipt?'}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            💡 <strong>Tip:</strong> We detected a duplicate based on the file content. This helps prevent accidental duplicate entries.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleViewExisting} fullWidth>
          View Existing Receipt
        </Button>
        <Button variant="outline" onClick={handleGoToList} fullWidth>
          Go to Receipts List
        </Button>
      </div>
    </Modal>
  );
};

export default DuplicateReceiptModal;
