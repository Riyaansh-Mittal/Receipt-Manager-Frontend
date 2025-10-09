import React from 'react';
import Badge from '../../../components/ui/Badge';
import {
  formatConfidence,
  getConfidenceBadgeVariant,
} from '../../../utils/receipt';

/**
 * Confidence Score Display Component
 */
const ConfidenceScore = ({ score, label, showBadge = true }) => {
  const variant = getConfidenceBadgeVariant(score);
  const percentage = formatConfidence(score);

  return (
    <div className="flex items-center space-x-2">
      {label && <span className="text-sm text-gray-600">{label}:</span>}
      
      {showBadge ? (
        <Badge variant={variant}>{percentage}</Badge>
      ) : (
        <span className="text-sm font-medium text-gray-900">{percentage}</span>
      )}

      {/* Visual indicator */}
      <div className="flex-1 max-w-[100px]">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              variant === 'success'
                ? 'bg-green-500'
                : variant === 'info'
                ? 'bg-blue-500'
                : variant === 'warning'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${score * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfidenceScore;
