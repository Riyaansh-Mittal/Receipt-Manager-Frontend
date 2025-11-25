import React from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import ConfidenceScore from './ConfidenceScore';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

/**
 * Extracted Data Preview Component with Null Safety
 */
const ExtractedDataPreview = ({ extractedData, confidenceScores }) => {
  if (!extractedData) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">No extracted data available</p>
        </div>
      </Card>
    );
  }

  const {
    vendor_name,
    receipt_date,
    total_amount,
    currency,
    tax_amount,
    subtotal,
    line_items,
  } = extractedData;

  // Helper to check if value exists
  const hasValue = (val) => val !== null && val !== undefined && val !== '';

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Extracted Data
          </h3>
          <Badge variant="info">Auto-detected</Badge>
        </div>

        {/* Main Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <p className="text-base font-medium text-gray-900">
              {hasValue(vendor_name) ? vendor_name : (
                <span className="text-gray-400 italic">Not detected</span>
              )}
            </p>
            {confidenceScores?.vendor && hasValue(vendor_name) && (
              <ConfidenceScore
                score={confidenceScores.vendor}
                label="Confidence"
                showBadge={false}
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <p className="text-base font-medium text-gray-900">
              {hasValue(receipt_date) ? formatDate(receipt_date) : (
                <span className="text-gray-400 italic">Not detected</span>
              )}
            </p>
            {confidenceScores?.date && hasValue(receipt_date) && (
              <ConfidenceScore
                score={confidenceScores.date}
                label="Confidence"
                showBadge={false}
              />
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <p className="text-lg font-bold text-gray-900">
              {hasValue(total_amount) ? formatCurrency(total_amount, currency) : (
                <span className="text-gray-400 italic">Not detected</span>
              )}
            </p>
            {confidenceScores?.amount && hasValue(total_amount) && (
              <ConfidenceScore
                score={confidenceScores.amount}
                label="Confidence"
                showBadge={false}
              />
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <p className="text-base font-medium text-gray-900">
              {hasValue(currency) ? currency : 'USD'}
            </p>
          </div>
        </div>

        {/* Additional Details */}
        {(hasValue(tax_amount) || hasValue(subtotal)) && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Breakdown
            </h4>
            <div className="space-y-2">
              {hasValue(subtotal) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>
              )}
              {hasValue(tax_amount) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(tax_amount, currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Line Items */}
        {line_items && Array.isArray(line_items) && line_items.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Line Items
            </h4>
            <div className="space-y-2">
              {line_items.slice(0, 7).map((item, index) => {
                // Skip invalid items
                if (!item || (!item.description && !item.amount)) {
                  return null;
                }

                return (
                  <div
                    key={index}
                    className="flex justify-between items-start text-sm"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900">
                        {hasValue(item.description) ? item.description : (
                          <span className="text-gray-400 italic">Item {index + 1}</span>
                        )}
                      </p>
                      {hasValue(item.quantity) && (
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 ml-4">
                      {hasValue(item.price) ? formatCurrency(item.price, currency) : (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </span>
                  </div>
                );
              })}
              {line_items.length > 7 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{line_items.length - 7} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Warning for low confidence */}
        {confidenceScores &&
          Object.values(confidenceScores).some((score) => score < 0.7) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Some data has low confidence. Please review and correct if needed.
              </p>
            </div>
          )}

        {/* Info if no data extracted */}
        {!hasValue(vendor_name) && 
         !hasValue(receipt_date) && 
         !hasValue(total_amount) && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ No data could be extracted automatically. Please enter the details manually.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExtractedDataPreview;
