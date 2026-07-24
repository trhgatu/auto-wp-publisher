import React from "react";
import { CodeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/shared/PageHeader";
import { TemplatesList } from "../components/TemplatesList";

export const TemplatesPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Quản lý Mẫu bài viết"
        breadcrumbs={[{ title: "Workspace" }, { title: "Mẫu bài viết" }]}
        icon={<CodeOutlined />}
      />

      <TemplatesList />
    </div>
  );
};
