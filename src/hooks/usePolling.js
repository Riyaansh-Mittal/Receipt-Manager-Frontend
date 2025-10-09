import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for polling with automatic cleanup
 * Fixed to prevent stale closure issues
 */
export const usePolling = (
  callback,
  interval = import.meta.env.VITE_POLLING_INTERVAL,
  options = {}
) => {
  const {
    enabled = true,
    maxDuration = 120000, // 2 minutes
    stopCondition = null,
  } = options;

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const callbackRef = useRef(callback);
  const stopConditionRef = useRef(stopCondition);

  // Update refs when dependencies change - THIS IS CRITICAL
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    stopConditionRef.current = stopCondition;
  }, [stopCondition]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return; // Already polling

    startTimeRef.current = Date.now();
    
    // Execute immediately on start
    const executeCallback = async () => {
      try {
        const shouldStop = await callbackRef.current();
        
        // Check stop condition
        if (stopConditionRef.current && stopConditionRef.current()) {
          stop();
          return true;
        }
        
        if (shouldStop) {
          stop();
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Polling error:', error);
        return false;
      }
    };

    // Execute immediately
    executeCallback();

    // Set up interval
    intervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTimeRef.current;

      // Check max duration
      if (elapsed >= maxDuration) {
        console.log('Polling stopped: max duration reached');
        stop();
        return;
      }

      // Execute callback
      await executeCallback();
    }, interval);
  }, [interval, maxDuration, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return { start, stop };
};

export default usePolling;
