import { useState, useCallback } from 'react';
import { REQUEST_STATUS } from '../constants/status.constants';

/**
 * Hook to handle async operations with status tracking
 * @returns {Object} { execute, status, value, error, isPending, isSuccess, isError }
 */
export const useAsync = () => {
  const [status, setStatus] = useState(REQUEST_STATUS.IDLE);
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    setStatus(REQUEST_STATUS.LOADING);
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus(REQUEST_STATUS.SUCCEEDED);
      return response;
    } catch (err) {
      setError(err);
      setStatus(REQUEST_STATUS.FAILED);
      throw err;
    }
  }, []);

  return {
    execute,
    status,
    value,
    error,
    isPending: status === REQUEST_STATUS.LOADING,
    isSuccess: status === REQUEST_STATUS.SUCCEEDED,
    isError: status === REQUEST_STATUS.FAILED,
  };
};

export default useAsync;
