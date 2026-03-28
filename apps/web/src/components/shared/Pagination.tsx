import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  total,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (total === 0) return null;

  return (
    <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs text-muted-foreground order-2 sm:order-1">
        Hiển thị {Math.min((currentPage - 1) * pageSize + 1, total)} -{" "}
        {Math.min(currentPage * pageSize, total)} trong tổng số {total} bản ghi
      </div>

      <div className="flex items-center space-x-2 order-1 sm:order-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1 rounded border border-border hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center">
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            let pageNum = currentPage;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 text-xs rounded transition-all ${
                  currentPage === pageNum
                    ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 scale-110"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1 rounded border border-border hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
