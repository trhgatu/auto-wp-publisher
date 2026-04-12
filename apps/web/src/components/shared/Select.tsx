import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  leftIcon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Chọn một mục",
  className,
  leftIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={cn("relative w-full min-w-[200px]", className)}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-300 text-left hover:border-red-400 dark:hover:border-red-500/50 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-500/10 group",
          isOpen &&
            "border-red-600 dark:border-red-500 ring-4 ring-red-500/10 dark:ring-red-500/10",
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {leftIcon && (
            <span className="text-slate-400 dark:text-slate-500 group-hover:text-red-500 transition-colors">
              {leftIcon}
            </span>
          )}
          {selectedOption ? (
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 group-hover:text-red-500",
            isOpen && "rotate-180 text-red-600 dark:text-red-500",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 isolate">
          <div className="max-h-64 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-[10px] transition-all duration-200 group text-left",
                  option.value === value
                    ? "bg-red-600/10 dark:bg-red-500/10 text-red-700 dark:text-red-500"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {option.icon && (
                    <span className="flex-shrink-0 text-lg">{option.icon}</span>
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
                {option.value === value && (
                  <Check className="w-4 h-4 text-red-600 animate-in zoom-in duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
