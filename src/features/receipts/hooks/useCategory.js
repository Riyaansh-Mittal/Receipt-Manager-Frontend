import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchCategories,
  fetchPreferences,
  fetchSuggestions,
  fetchUsageStats,
  validateCategory,
  clearSuggestions,
  selectCategories,
  selectPreferences,
  selectSuggestions,
  selectUsageStats,
  selectCategoriesStatus,
} from '../../../store/slices/category.slice';
import { REQUEST_STATUS } from '../../../constants/status.constants';

/**
 * Custom hook for category operations
 */
export const useCategory = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const preferences = useSelector(selectPreferences);
  const suggestions = useSelector(selectSuggestions);
  const usageStats = useSelector(selectUsageStats);
  const categoriesStatus = useSelector(selectCategoriesStatus);
  console.log(categories)

  const loadCategories = useCallback(async () => {
    try {
        console.log("LOAD CATEGORIES")
      const resultAction = await dispatch(fetchCategories());
      return fetchCategories.fulfilled.match(resultAction);
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  const loadPreferences = useCallback(
    async (limit = 10) => {
      try {
        const resultAction = await dispatch(fetchPreferences(limit));
        return fetchPreferences.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const getSuggestions = useCallback(
    async (vendor) => {
      if (!vendor || vendor.length < 2) {
        dispatch(clearSuggestions());
        return false;
      }

      try {
        const resultAction = await dispatch(fetchSuggestions(vendor));
        return fetchSuggestions.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const loadUsageStats = useCallback(
    async (months = 12) => {
      try {
        const resultAction = await dispatch(fetchUsageStats(months));
        return fetchUsageStats.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const checkCategoryValidity = useCallback(
    async (categoryId) => {
      try {
        const resultAction = await dispatch(validateCategory(categoryId));
        if (validateCategory.fulfilled.match(resultAction)) {
          return resultAction.payload.data?.valid || false;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const clearCategorySuggestions = useCallback(() => {
    dispatch(clearSuggestions());
  }, [dispatch]);

  return {
    categories,
    preferences,
    suggestions,
    usageStats,
    isLoading: categoriesStatus === REQUEST_STATUS.LOADING,
    loadCategories,
    loadPreferences,
    getSuggestions,
    loadUsageStats,
    checkCategoryValidity,
    clearCategorySuggestions,
  };
};

export default useCategory;
