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
      width: 80,
      render: (url: string) => (
        <Avatar
          shape="square"
          size={48}
          src={url}
          icon={<DatabaseOutlined />}
          className="border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
        />
      ),
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "name",
      key: "name",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (name: string, record: any) => (
        <Link
          to={`/jobs/${record.id}`}
          className="font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 transition-colors uppercase tracking-tight text-xs"
          title={name}
        >
          {name}
        </Link>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 150,
      render: (sku: string) => (
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
          {sku || "-"}
        </span>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 150,
      align: "right" as const,
      render: (price: string) => (
        <span className="font-black text-red-600 dark:text-red-500 text-xs">
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
      width: 130,
      align: "center" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (status: any) => <JobStatusBadge status={status} />,
    },
    {
      title: "Cập nhật lúc",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (date: string) => (
        <div className="flex flex-col text-[10px] font-bold text-slate-500">
          <span className="text-slate-800 dark:text-slate-200">
            {dayjs(date).format("HH:mm:ss")}
          </span>
          <span className="opacity-50">{dayjs(date).format("DD/MM/YYYY")}</span>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 130,
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
        bordered={false}
        bodyStyle={{ padding: 0 }}
        className="shadow-sm overflow-hidden"
      >
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            position: ["bottomCenter"],
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
