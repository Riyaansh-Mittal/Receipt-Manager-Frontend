import React from 'react';
import ProgressBar from '../../../components/ui/ProgressBar';
import Spinner from '../../../components/ui/Spinner';
import { getProcessingStageLabel } from '../../../utils/receipt';

/**
 * Upload Progress Component
 */
const UploadProgress = ({ receipt, progress, stage }) => {
  const getProgressColor = () => {
    if (progress === 100) return 'green';
    if (progress >= 75) return 'blue';
    if (progress >= 50) return 'yellow';
    return 'blue';
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        color={getProgressColor()}
        size="md"
        animated={progress < 100}
        showPercentage
      />

      {/* Current Stage */}
      {stage && (
        <div className="flex items-center justify-center space-x-2">
          <Spinner size="sm" className="text-blue-600" />
          <span className="text-sm text-gray-600">
            {getProcessingStageLabel(stage)}
          </span>
        </div>
      )}

      {/* Status Messages */}
      <div className="text-center">
        {progress < 100 && (
          <p className="text-sm text-gray-600">
            Please don't close this page. This usually takes 30-60 seconds.
          </p>
        )}
        {progress === 100 && (
          <p className="text-sm text-green-600 font-medium">
            Processing complete! Loading results...
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadProgress;
