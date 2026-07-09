import { Breadcrumb, Space } from "antd";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  icon: ReactNode;
  extra?: ReactNode;
}

export const PageHeader = ({
  title,
  breadcrumbs,
  icon,
  extra,
}: PageHeaderProps) => {
  const formattedItems = breadcrumbs.map((item) => ({
    title: item.href ? <Link to={item.href}>{item.title}</Link> : item.title,
  }));

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/40">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center shadow-md shadow-red-500/10 flex-shrink-0">
          <span className="text-xl text-white flex items-center justify-center">
            {icon}
          </span>
        </div>
        <div>
          <Breadcrumb
            items={formattedItems}
            className="text-xs uppercase tracking-wider mb-1 font-bold text-slate-400 dark:text-slate-500"
          />
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase m-0 leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {extra && (
        <Space size="middle" className="flex-wrap">
          {extra}
        </Space>
      )}
    </div>
  );
};
