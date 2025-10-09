import React, { useState, useEffect } from 'react';
import { useCategory } from '../hooks/useCategory';
import useDebounce from '../../../hooks/useDebounce';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import { formatConfidence } from '../../../utils/receipt';

/**
 * Smart Category Selector with AI Suggestions
 */
const CategorySelector = ({
  value,
  onChange,
  vendor,
  aiSuggestion, // ✅ NEW: Pass AI suggestion from receipt details
  error,
  required = true,
  disabled = false,
  showSuggestions = true,
  showPreferences = true,
}) => {
  const {
    categories,
    preferences,
    suggestions: vendorSuggestions,
    isLoading,
    loadCategories,
    loadPreferences,
    getSuggestions,
    clearCategorySuggestions,
  } = useCategory();

  const [selectedCategory, setSelectedCategory] = useState(value);
  const debouncedVendor = useDebounce(vendor, 500);

  // Load categories on mount
  useEffect(() => {
    console.log('🔄 CategorySelector mounted, categories count:', categories.length);
    if (categories.length === 0) {
      console.log('📥 Loading categories...');
      loadCategories();
    }
  }, [categories.length, loadCategories]);

  // Load preferences
  useEffect(() => {
    if (showPreferences && preferences.length === 0) {
      console.log('📥 Loading preferences...');
      loadPreferences(5);
    }
  }, [showPreferences, preferences.length, loadPreferences]);

  // Get suggestions when vendor changes
  useEffect(() => {
    if (showSuggestions && debouncedVendor && debouncedVendor.length >= 2) {
      console.log('📥 Getting suggestions for vendor:', debouncedVendor);
      getSuggestions(debouncedVendor);
    } else {
      clearCategorySuggestions();
    }
  }, [debouncedVendor, showSuggestions, getSuggestions, clearCategorySuggestions]);

  // ✅ Auto-select AI suggestion if available and no value set
  useEffect(() => {
    if (aiSuggestion && !value && categories.length > 0) {
      const categoryId = aiSuggestion.category?.id || aiSuggestion.id;
      console.log('🤖 Auto-selecting AI suggestion:', categoryId);
      setSelectedCategory(categoryId);
      onChange(categoryId);
    }
  }, [aiSuggestion, value, categories.length, onChange]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    console.log('📝 Category changed to:', newValue);
    setSelectedCategory(newValue);
    onChange(newValue);
  };

  // ✅ Determine which suggestion to show (priority: AI > vendor > none)
  const displaySuggestion = aiSuggestion || vendorSuggestions;
  const shouldShowSuggestion = displaySuggestion && 
    (displaySuggestion.confidence_score || displaySuggestion.confidence || 0) > 0.5;

  console.log('📊 CategorySelector state:', {
    categoriesCount: categories.length,
    preferencesCount: preferences.length,
    hasAiSuggestion: !!aiSuggestion,
    hasVendorSuggestion: !!vendorSuggestions,
    selectedCategory,
  });

  return (
    <div className="space-y-3">
      {/* AI/Vendor Suggestion */}
      {shouldShowSuggestion && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">
                {aiSuggestion ? '🤖 AI Suggestion' : '💡 Vendor Suggestion'}
              </span>
              <Badge variant="info" className="text-xs">
                {formatConfidence(displaySuggestion.confidence_score || displaySuggestion.confidence)} match
              </Badge>
            </div>
            {isLoading && <Spinner size="sm" className="text-blue-600" />}
          </div>
          
          <button
            type="button"
            onClick={() => {
              const categoryId = displaySuggestion.category?.id || displaySuggestion.id;
              setSelectedCategory(categoryId);
              onChange(categoryId);
            }}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedCategory === (displaySuggestion.category?.id || displaySuggestion.id)
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-3xl">
                {displaySuggestion.category?.icon || displaySuggestion.icon || '📁'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {displaySuggestion.category?.name || displaySuggestion.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {displaySuggestion.reasoning || displaySuggestion.reason || 'Suggested based on receipt content'}
                </p>
              </div>
              {selectedCategory === (displaySuggestion.category?.id || displaySuggestion.id) && (
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Frequently Used Categories */}
      {showPreferences && preferences.length > 0 && !shouldShowSuggestion && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequently Used
          </label>
          <div className="flex flex-wrap gap-2">
            {preferences.slice(0, 5).map((pref) => (
              <button
                key={pref.category.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(pref.category.id);
                  onChange(pref.category.id);
                }}
                className={`
                  px-3 py-2 rounded-lg border-2 transition-all flex items-center space-x-2
                  ${
                    selectedCategory === pref.category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <span className="text-lg">{pref.category.icon}</span>
                <span className="text-sm font-medium">{pref.category.name}</span>
                <span className="text-xs text-gray-500">({pref.usage_count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Category Dropdown */}
      <Select
        label="Category"
        value={selectedCategory}
        onChange={handleChange}
        error={error}
        required={required}
        disabled={disabled || isLoading}
        placeholder={categories.length === 0 ? 'Loading categories...' : 'Select a category'}
        options={categories.map((cat) => ({
          value: cat.id,
          label: `${cat.icon} ${cat.name}`,
        }))}
      />

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>Categories loaded: {categories.length}</p>
          <p>Selected: {selectedCategory || 'None'}</p>
          <p>AI Suggestion: {aiSuggestion ? aiSuggestion.category?.name : 'None'}</p>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
