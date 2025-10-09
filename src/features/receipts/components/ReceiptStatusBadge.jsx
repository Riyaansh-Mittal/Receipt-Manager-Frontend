import React from 'react';
import Badge from '../../../components/ui/Badge';
import {
  getReceiptStatusLabel,
  getReceiptStatusColor,
} from '../../../utils/receipt';

/**
 * Receipt Status Badge Component
 */
const ReceiptStatusBadge = ({ status, className = '' }) => {
  const label = getReceiptStatusLabel(status);
  const variant = getReceiptStatusColor(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default ReceiptStatusBadge;
