import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReceipt } from "../hooks/useReceipt";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/feedback/EmptyState";
import LoadingState from "../../../components/feedback/LoadingState";
import ReceiptStatusBadge from "../components/ReceiptStatusBadge";
import { ROUTES } from "../../../constants/routes.constants";
import {
  RECEIPT_STATUS,
  RECEIPT_SORT_OPTIONS,
} from "../../../constants/receipt.constants";
import { formatCurrency } from "../../../utils/currency";
import { formatDate, formatRelativeTime } from "../../../utils/date";
import { formatFileSize } from "../../../utils/file";
import { useSelector } from "react-redux";
import {
  selectReceiptsPagination,
  selectReceiptsFilters,
} from "../../../store/slices/receipt.slice";

/**
 * Receipts List Page with Pagination
 */
const ReceiptsListPage = () => {
  const navigate = useNavigate();
  const { receipts, isLoadingList, loadReceipts, updateFilters } = useReceipt();

  const pagination = useSelector(selectReceiptsPagination);
  const currentFilters = useSelector(selectReceiptsFilters);

  const [filters, setFilters] = useState({
    status: currentFilters.status || "",
    ordering: currentFilters.ordering || "-created_at",
    page: pagination.currentPage || 1,
    page_size: pagination.pageSize || 20,
  });

  // Load receipts when filters change
  useEffect(() => {
    console.log("📥 Loading receipts with filters:", filters);
    loadReceipts(filters);
  }, [filters, loadReceipts]);

  // At the top of ReceiptsListPage component
  useEffect(() => {
    console.log("📊 ReceiptsListPage State:", {
      receiptsCount: receipts.length,
      isLoadingList,
      filters,
      pagination,
    });
  }, [receipts, isLoadingList, filters, pagination]);

  // And log when receipts are rendered
  console.log(
    "🎨 Rendering receipts:",
    receipts.map((r) => ({ id: r.id, vendor: r.vendor }))
  );

  const handleFilterChange = (key, value) => {
    console.log("🔄 Filter changed:", key, value);
    const newFilters = { ...filters, [key]: value, page: 1 }; // Reset to page 1 on filter change
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    console.log("📄 Page changed to:", newPage);
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReceiptClick = (receiptId) => {
    console.log("🖱️ Receipt card clicked!");
    console.log("📝 Receipt ID:", receiptId);
    console.log(
      "🔗 Navigating to:",
      ROUTES.RECEIPTS_DETAIL.replace(":id", receiptId)
    );

    try {
      navigate(ROUTES.RECEIPTS_DETAIL.replace(":id", receiptId));
      console.log("✅ Navigation called successfully");
    } catch (error) {
      console.error("❌ Navigation error:", error);
    }
  };

  const handleUploadClick = () => {
    navigate(ROUTES.RECEIPTS_UPLOAD);
  };

  if (isLoadingList && receipts.length === 0) {
    return <LoadingState message="Loading receipts..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-600 mt-1">
            Manage and review your uploaded receipts
          </p>
        </div>
        <Button onClick={handleUploadClick}>
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Receipt
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                // { value: RECEIPT_STATUS.UPLOADED, label: "Uploaded" },
                // { value: RECEIPT_STATUS.PROCESSING, label: "Processing" },
                { value: RECEIPT_STATUS.PROCESSED, label: "Processed" },
                { value: RECEIPT_STATUS.CONFIRMED, label: "Confirmed" },
                // { value: RECEIPT_STATUS.FAILED, label: "Failed" },
              ]}
            />
          </div>

          <div className="flex-1">
            <Select
              label="Sort By"
              value={filters.ordering}
              onChange={(e) => handleFilterChange("ordering", e.target.value)}
              options={RECEIPT_SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Results Info */}
        {pagination.count > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.count
            )}{" "}
            of {pagination.count} receipts
          </div>
        )}
      </Card>

      {/* Receipts List */}
      {receipts.length === 0 ? (
        <EmptyState
          message={
            filters.status
              ? `No ${filters.status} receipts found`
              : "No receipts found"
          }
          icon={
            <svg
              className="h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          action={
            !filters.status && (
              <Button onClick={handleUploadClick}>
                Upload Your First Receipt
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {receipts.map((receipt) => (
              <Card
                key={receipt.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("🖱️ Card clicked for receipt:", receipt.id);
                  handleReceiptClick(receipt.id);
                }}
              >
                <div className="flex items-center justify-between">
                  {/* Receipt Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {receipt.vendor || receipt.original_filename}
                      </h3>
                      <ReceiptStatusBadge status={receipt.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {receipt.date
                            ? formatDate(receipt.date)
                            : formatRelativeTime(receipt.upload_date)}
                        </span>
                      </div>

                      {receipt.amount && (
                        <div className="flex items-center space-x-1">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(receipt.amount, receipt.currency)}
                          </span>
                        </div>
                      )}

                      {receipt.category && (
                        <div className="flex items-center space-x-1">
                          <span>{receipt.category.icon}</span>
                          <span>{receipt.category.name}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {formatFileSize(receipt.file_size_mb * 1024 * 1024)}
                        </span>
                      </div>
                    </div>

                    {/* Processing Progress */}
                    {receipt.processing_progress !== undefined &&
                      receipt.processing_progress < 100 && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-600">
                              Processing
                            </span>
                            <span className="text-xs font-medium text-gray-900">
                              {receipt.processing_progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${receipt.processing_progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Arrow Icon */}
                  <svg
                    className="h-6 w-6 text-gray-400 flex-shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              onPageChange={handlePageChange}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Loading Overlay */}
      {isLoadingList && receipts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl">
            <LoadingState message="Loading..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsListPage;
