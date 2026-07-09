import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Card,
  Modal,
  Space,
  Avatar,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  DeleteOutlined,
  UndoOutlined,
  GlobalOutlined,
  RestOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useJobs } from "../hooks/useJobs";
import { getJobs } from "../api/getJobs";
import type { JobItem } from "../api/getJobs";
import { exportProductsToExcel } from "../utils/excelExporter";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { trashJob } from "../api/trashJob";
import { restoreJob } from "../api/restoreJob";
import { permanentlyDeleteJob } from "../api/permanentlyDeleteJob";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../../hooks/useNotification";

const { RangePicker } = DatePicker;

import { PageHeader } from "../../../components/shared/PageHeader";

export const JobsList = () => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyTrashed, setOnlyTrashed] = useState(false);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const startDate = dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : "";
  const endDate = dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : "";

  const { data, isLoading, isFetching } = useJobs({
    page,
    limit: pageSize,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    onlyTrashed,
  });

  const handleAction = (
    action: () => Promise<void>,
    title: string,
    message: string,
    successMessage: string = "Thao tác đã được thực hiện",
  ) => {
    Modal.confirm({
      title,
      content: message,
      okText: "Đồng ý",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await action();
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
          notify("Thành công", successMessage, "success");
        } catch (err) {
          console.error(err);
          notify("Lỗi", "Không thể thực hiện thao tác", "error");
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      const allData = await getJobs({
        limit: 1000,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        onlyTrashed,
      });

      if (allData.items.length === 0) {
        notify("Thông báo", "Không có dữ liệu để xuất", "info");
        return;
      }

      exportProductsToExcel(allData.items);
      notify("Thành công", "Đã xuất file Excel", "success");
    } catch (err) {
      console.error(err);
      notify("Lỗi", "Không thể xuất file Excel", "error");
    }
  };

  const jobs = data?.items || [];
  const total = data?.total || 0;

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 70,
      render: (url: string) => (
        <Avatar
          shape="square"
          size={40}
          src={url}
          className="border border-[#ECECEC] dark:border-[#303030] bg-[#F6F7FB]"
        />
      ),
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a: JobItem, b: JobItem) => a.name.localeCompare(b.name),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (name: string, record: any) => (
        <Link
          to={`/jobs/${record.id}`}
          className="font-bold text-[#262626] dark:text-[#E5E5E5] hover:text-[#C62828] dark:hover:text-[#D32F2F] transition-colors text-xs uppercase tracking-tight line-clamp-2"
          title={name}
        >
          {name}
        </Link>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right" as const,
      sorter: (a: JobItem, b: JobItem) =>
        Number(a.price || 0) - Number(b.price || 0),
      render: (price: string) => (
        <span className="font-bold text-[#C62828] text-xs">
          {price && !isNaN(Number(price))
            ? `${Number(price).toLocaleString("vi-VN")}đ`
            : price || "-"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (status: any) => <JobStatusBadge status={status} />,
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      sorter: (a: JobItem, b: JobItem) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (date: string) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {dayjs(date).format("HH:mm DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => (
        <Space size="middle">
          {onlyTrashed ? (
            <>
              <Tooltip title="Khôi phục">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <UndoOutlined className="text-emerald-600 dark:text-emerald-400" />
                  }
                  onClick={() =>
                    handleAction(
                      () => restoreJob(record.id),
                      "Khôi phục sản phẩm",
                      "Bạn có chắc chắn muốn đưa sản phẩm này trở lại kho hàng?",
                      "Đã khôi phục sản phẩm thành công",
                    )
                  }
                />
              </Tooltip>
              <Tooltip title="Xóa vĩnh viễn">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    handleAction(
                      () => permanentlyDeleteJob(record.id),
                      "Xóa vĩnh viễn",
                      "Sản phẩm này sẽ bị xóa khỏi hệ thống hoàn toàn và không thể khôi phục. Bạn chắc chứ?",
                      "Đã xóa vĩnh viễn sản phẩm",
                    )
                  }
                />
              </Tooltip>
            </>
          ) : (
            <>
              {record.wpUrl && (
                <Tooltip title="Xem trên Website">
                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <GlobalOutlined className="text-emerald-600 dark:text-emerald-400" />
                    }
                    href={record.wpUrl}
                    target="_blank"
                    rel="noreferrer"
                  />
                </Tooltip>
              )}
              <Tooltip title="Xóa tạm thời">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<RestOutlined />}
                  onClick={() =>
                    handleAction(
                      () => trashJob(record.id),
                      "Bỏ vào thùng rác",
                      "Sản phẩm sẽ được chuyển vào khu vực rác. Bạn có thể khôi phục sau này.",
                      "Đã chuyển sản phẩm vào thùng rác",
                    )
                  }
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Control Center */}
      <PageHeader
        title={onlyTrashed ? "Thùng Rác" : "Kho Sản Phẩm"}
        breadcrumbs={[
          { title: "Workspace" },
          { title: onlyTrashed ? "Thùng Rác" : "Kho Sản Phẩm" },
        ]}
        icon={<DatabaseOutlined />}
        extra={
          <>
            <Button
              onClick={() => {
                setOnlyTrashed(!onlyTrashed);
                setPage(1);
              }}
              icon={onlyTrashed ? <DatabaseOutlined /> : <RestOutlined />}
              className="font-bold h-10 shadow-none transition-all active:scale-95"
            >
              {onlyTrashed ? "Về Kho" : "Thùng Rác"}
            </Button>

            {!onlyTrashed && (
              <>
                <Button
                  onClick={() => setImportModalOpen(true)}
                  icon={<FileExcelOutlined />}
                  type="primary"
                  danger
                  className="font-bold h-10 shadow-none transition-all active:scale-95"
                >
                  Import Excel
                </Button>

                <Link to="/create">
                  <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    danger
                    className="font-bold h-10 shadow-none transition-all active:scale-95"
                  >
                    Thêm mới
                  </Button>
                </Link>

                <Button
                  onClick={handleExport}
                  icon={<DownloadOutlined />}
                  className="font-bold h-10 shadow-none transition-all active:scale-95"
                >
                  Xuất Excel
                </Button>
              </>
            )}
          </>
        }
      />

      {/* Filters */}
      <Card
        bordered={false}
        className="shadow-sm border-t-2 border-red-500 bg-slate-500/5 dark:bg-slate-500/10"
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={12}>
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </Col>
          <Col xs={24} sm={14} lg={8}>
            <RangePicker
              size="large"
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange}
              onChange={(val) => {
                setDateRange(val);
                setPage(1);
              }}
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Col>
          <Col xs={24} sm={10} lg={4}>
            <Select
              placeholder="Trạng thái"
              size="large"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              style={{ width: "100%" }}
              options={[
                { label: "Tất cả trạng thái", value: "" },
                { label: "Đang chờ", value: "PENDING" },
                { label: "Đang đăng bài", value: "PROCESSING" },
                { label: "Hoàn tất", value: "COMPLETED" },
                { label: "Thất bại", value: "FAILED" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table Data */}
      <Card
        bordered={true}
        bodyStyle={{ padding: 0 }}
        className="shadow-sm overflow-hidden bg-white dark:bg-[#1F1F1F]"
      >
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={isLoading || isFetching}
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys) => {
              console.log("Selected row keys:", selectedRowKeys);
            },
          }}
          sticky
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            position: ["bottomRight"],
          }}
        />
      </Card>

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </div>
  );
};
