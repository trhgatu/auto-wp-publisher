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
    <div className={cn("relative w-full min-w-[200px]", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl transition-all duration-300 text-left hover:border-indigo-400 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-indigo-500/10 group",
          isOpen && "border-indigo-600 ring-4 ring-indigo-500/10",
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {leftIcon && <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">{leftIcon}</span>}
          {selectedOption ? (
            <span className="font-medium text-slate-700 truncate">{selectedOption.label}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:text-indigo-500",
            isOpen && "rotate-180 text-indigo-600",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 isolate">
          <div className="max-h-64 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-[10px] transition-all duration-200 group text-left",
                  option.value === value
                    ? "bg-indigo-600/10 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                   {option.icon && <span className="flex-shrink-0 text-lg">{option.icon}</span>}
                   <span className="truncate">{option.label}</span>
                </div>
                {option.value === value && (
                  <Check className="w-4 h-4 text-indigo-600 animate-in zoom-in duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
