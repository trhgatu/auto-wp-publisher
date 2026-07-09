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
  icon?: ReactNode; // Kept for compatibility, not rendered
  description?: string; // Add optional description
  extra?: ReactNode;
}

export const PageHeader = ({
  title,
  breadcrumbs,
  description,
  extra,
}: PageHeaderProps) => {
  const formattedItems = breadcrumbs.map((item) => ({
    title: item.href ? <Link to={item.href}>{item.title}</Link> : item.title,
  }));

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#ECECEC] dark:border-[#303030]">
      <div>
        <Breadcrumb
          items={formattedItems}
          className="text-xs mb-2 text-[#8C8C8C]"
        />
        <h1 className="text-2xl font-bold tracking-tight text-[#262626] dark:text-[#E5E5E5] m-0 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[#8C8C8C] mt-1.5 mb-0 font-normal">
            {description}
          </p>
        )}
      </div>

      {extra && (
        <Space size="middle" className="flex-wrap pt-4 md:pt-0">
          {extra}
        </Space>
      )}
    </div>
  );
};
