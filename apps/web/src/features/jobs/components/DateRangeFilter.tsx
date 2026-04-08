import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = selected.toISOString().split("T")[0];

    if (!startDate || (startDate && endDate)) {
      onStartDateChange(dateStr);
      onEndDateChange("");
    } else {
      if (dateStr < startDate) {
        onStartDateChange(dateStr);
        onEndDateChange("");
      } else {
        onEndDateChange(dateStr);
        setIsOpen(false);
      }
    }
  };

  const daysInMonth = getDaysInMonth(
    viewDate.getFullYear(),
    viewDate.getMonth(),
  );
  const firstDay = getFirstDayOfMonth(
    viewDate.getFullYear(),
    viewDate.getMonth(),
  );
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const isSelected = (day: number) => {
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      .toISOString()
      .split("T")[0];
    return current === startDate || current === endDate;
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      .toISOString()
      .split("T")[0];
    return current > startDate && current < endDate;
  };

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartDateChange("");
    onEndDateChange("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:border-red-400 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-red-500/10 group min-w-[240px]",
          isOpen && "border-red-600 ring-4 ring-red-500/10",
          (startDate || endDate) && "border-red-200 bg-red-50/30",
        )}
      >
        <Calendar
          className={cn(
            "w-4 h-4 text-slate-400 transition-colors group-hover:text-red-500",
            (startDate || endDate) && "text-red-600",
          )}
        />
        <div className="flex-1 text-left font-medium text-slate-700">
          {startDate || endDate ? (
            <span className="flex items-center gap-2">
              {formatDate(startDate)}
              <span className="text-slate-300">—</span>
              {endDate ? formatDate(endDate) : "..."}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">Lọc theo ngày...</span>
          )}
        </div>
        {(startDate || endDate) && (
          <X
            className="w-3.5 h-3.5 text-slate-400 hover:text-red-600 transition-colors"
            onClick={clearFilter}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-[110] top-full mt-2 left-0 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 isolate backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1),
                )
              }
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
              Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}
            </span>
            <button
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1),
                )
              }
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <div
                key={d}
                className="text-[10px] font-black text-slate-400 text-center py-1"
              >
                {d}
              </div>
            ))}
            {blanks.map((b) => (
              <div key={`b-${b}`} />
            ))}
            {days.map((day) => (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center relative",
                  isSelected(day)
                    ? "bg-red-600 text-white shadow-md shadow-red-200 z-10"
                    : isInRange(day)
                      ? "bg-red-50 text-red-600 rounded-none first:rounded-l-lg last:rounded-r-lg"
                      : "text-slate-600 hover:bg-slate-50 hover:text-red-600",
                )}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
