import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export const Table = ({
  className,
  containerClassName,
  children,
  ...props
}: TableProps) => {
  return (
    <div className={cn("overflow-x-auto w-full", containerClassName)}>
      <table
        className={cn("w-full text-sm text-left border-collapse", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <thead
      className={cn(
        "text-xs bg-[#fafafa] dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 transition-colors font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tbody
      className={cn("divide-y divide-slate-100 dark:divide-slate-800", className)}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr
      className={cn(
        "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <td className={cn("px-4 py-3.5 align-middle", className)} {...props}>
      {children}
    </td>
  );
};

export const TableHeadCell = ({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <th className={cn("px-4 py-4 font-semibold", className)} {...props}>
      {children}
    </th>
  );
};

// Assign sub-components to Table
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.HeadCell = TableHeadCell;
