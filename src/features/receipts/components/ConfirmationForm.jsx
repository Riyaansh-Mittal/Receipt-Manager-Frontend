import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";
import CategorySelector from "./CategorySelector";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
} from "../../../constants/receipt.constants";
import {
  validateReceiptDate,
  validateVendor,
  validateTags,
} from "../../../utils/receipt";
import { validateAmount } from "../../../utils/currency";
import { formatAmountForInput } from "../../../utils/currency";

/**
 * Receipt Confirmation Form Component
 */
const ConfirmationForm = ({
  extractedData,
  suggestedCategory,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: extractedData?.receipt_date || "",
      amount:
        extractedData?.total_amount && !isNaN(extractedData.total_amount)
          ? formatAmountForInput(extractedData.total_amount)
          : "",
      currency: extractedData?.currency || DEFAULT_CURRENCY,
      category_id: suggestedCategory?.category_id || "",
      vendor: extractedData?.vendor_name || "",
      description: "",
      is_business_expense: false,
      is_reimbursable: false,
      tags: "",
    },
  });

  const vendorValue = watch("vendor");
  const [tagArray, setTagArray] = useState([]);

  const handleTagInput = (e) => {
    const value = e.target.value;
    setValue("tags", value);

    // Parse tags (comma or space separated)
    const tags = value
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setTagArray(tags);
  };

  const removeTag = (index) => {
    const newTags = tagArray.filter((_, i) => i !== index);
    setTagArray(newTags);
    setValue("tags", newTags.join(", "));
  };

  const onFormSubmit = (data) => {
    // Convert tags string to array
    const tags = tagArray.length > 0 ? tagArray : undefined;

    // Clean up data
    const submitData = {
      date: data.date,
      amount: parseFloat(data.amount),
      currency: data.currency,
      category_id: data.category_id,
      vendor: data.vendor || undefined,
      description: data.description || undefined,
      is_business_expense: data.is_business_expense,
      is_reimbursable: data.is_reimbursable,
      tags,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Date and Amount Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="date"
          control={control}
          rules={{
            required: "Date is required",
            validate: validateReceiptDate,
          }}
          render={({ field }) => (
            <Input
              {...field}
              type="date"
              label="Receipt Date"
              error={errors.date?.message}
              required
            />
          )}
        />

        <Controller
          name="amount"
          control={control}
          rules={{
            required: "Amount is required",
            validate: validateAmount,
          }}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              step="0.01"
              min="0.01"
              max="999999.99"
              label="Amount"
              error={errors.amount?.message}
              required
            />
          )}
        />
      </div>

      {/* Currency and Vendor Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="currency"
          control={control}
          rules={{ required: "Currency is required" }}
          render={({ field }) => (
            <Select
              {...field}
              label="Currency"
              error={errors.currency?.message}
              required
              options={CURRENCIES.map((curr) => ({
                value: curr.code,
                label: `${curr.symbol} ${curr.code} - ${curr.name}`,
              }))}
            />
          )}
        />

        <Controller
          name="vendor"
          control={control}
          rules={{ validate: validateVendor }}
          render={({ field }) => (
            <Input
              {...field}
              label="Vendor/Merchant"
              placeholder="e.g., Starbucks"
              error={errors.vendor?.message}
              helperText="Leave empty to use AI suggestion"
            />
          )}
        />
      </div>

      {/* Category Selector */}
      <Controller
        name="category_id"
        control={control}
        rules={{ required: "Category is required" }}
        render={({ field }) => (
          <CategorySelector
            value={field.value}
            onChange={field.onChange}
            vendor={vendorValue}
            aiSuggestion={suggestedCategory} // ✅ Pass AI suggestion
            error={errors.category_id?.message}
            required
          />
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label="Description (Optional)"
            placeholder="Add any notes about this expense..."
            rows={3}
            maxLength={500}
            showCount
          />
        )}
      />

      {/* Tags */}
      <div>
        <Controller
          name="tags"
          control={control}
          rules={{ validate: validateTags }}
          render={({ field }) => (
            <Input
              {...field}
              onChange={handleTagInput}
              label="Tags (Optional)"
              placeholder="meeting, client, Q4 (comma or space separated)"
              error={errors.tags?.message}
              helperText="Max 10 tags, 50 characters each"
            />
          )}
        />

        {/* Tag Display */}
        {tagArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tagArray.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <Controller
          name="is_business_expense"
          control={control}
          render={({ field: { value, onChange } }) => (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                This is a business expense
              </span>
            </label>
          )}
        />

        <Controller
          name="is_reimbursable"
          control={control}
          render={({ field: { value, onChange } }) => (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                This expense is reimbursable
              </span>
            </label>
          )}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          fullWidth
        >
          Confirm Receipt
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          fullWidth
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ConfirmationForm;
