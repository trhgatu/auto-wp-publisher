import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Popconfirm,
  message,
  Card,
  Space,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  CodeOutlined,
} from "@ant-design/icons";
import {
  useTemplates,
  useSetDefaultTemplate,
  useDeleteTemplate,
} from "../hooks/useTemplates";
import type { ProductTemplateDto } from "../api/templates";
import { TemplateModal } from "./TemplateModal";

export const TemplatesList: React.FC = () => {
  const { data: templates = [], isLoading } = useTemplates();
  const setDefaultMutation = useSetDefaultTemplate();
  const deleteMutation = useDeleteTemplate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ProductTemplateDto | null>(null);

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (template: ProductTemplateDto) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      message.success("Đã cài đặt làm mẫu mặc định thành công!");
    } catch (err) {
      console.error("Set default error:", err);
      message.error("Lỗi khi cài đặt mẫu mặc định.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Đã xóa mẫu bài viết!");
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Lỗi khi xóa mẫu bài viết.");
    }
  };

  const columns = [
    {
      title: "Tên Mẫu bài viết",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: ProductTemplateDto) => (
        <div className="flex items-center gap-2">
          <CodeOutlined className="text-red-500 text-base" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {name}
          </span>
          {record.isDefault && (
            <Tag color="red" icon={<StarFilled />} className="font-bold ml-2">
              MẶC ĐỊNH
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 220,
      render: (dateStr: string) =>
        dateStr ? new Date(dateStr).toLocaleString("vi-VN") : "—",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 240,
      align: "right" as const,
      render: (_: unknown, record: ProductTemplateDto) => (
        <Space size="middle">
          {!record.isDefault && (
            <Tooltip title="Đặt làm mẫu mặc định">
              <Button
                type="text"
                icon={<StarOutlined className="text-amber-500" />}
                onClick={() => handleSetDefault(record.id)}
                loading={setDefaultMutation.isPending}
              />
            </Tooltip>
          )}

          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa Mẫu bài viết"
            description="Bạn có chắc chắn muốn xóa mẫu bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">
            Quản lý Mẫu bài viết (Product Templates)
          </h2>
          <p className="text-xs text-slate-500 m-0 mt-1">
            Thiết lập các mẫu HTML bài viết tự động sử dụng khi AI không khả
            dụng hoặc khi tạo hàng loạt.
          </p>
        </div>

        <Button
          type="primary"
          danger
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreateModal}
          className="font-semibold"
        >
          Tạo Mẫu Mới
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Table
          dataSource={templates}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        templateToEdit={editingTemplate}
      />
    </div>
  );
};
