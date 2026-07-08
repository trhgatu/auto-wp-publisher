import { useState, useMemo, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Drawer,
  Tag,
  Space,
} from "antd";
import {
  SearchOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useApiLogs } from "../hooks/useApiLogs";
import type { ApiLogItem } from "../api/getApiLogs";

const { RangePicker } = DatePicker;

import { PageHeader } from "../../../components/shared/PageHeader";

export const ApiHistoryList = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Filtering States
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const startDate = dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : "";
  const endDate = dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : "";

  const { data, isLoading, isFetching } = useApiLogs({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const logs = useMemo(() => data?.items || [], [data?.items]);
  const total = data?.total || 0;
  const selectedLog = useMemo(
    () => logs.find((l: ApiLogItem) => l.id === selectedLogId),
    [logs, selectedLogId],
  );

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    if (logs.length === 0)
      return { successRate: 0, avgDuration: 0, totalErrors: 0 };

    const successes = logs.filter(
      (l) => l.statusCode >= 200 && l.statusCode < 300,
    ).length;
    const durationSum = logs.reduce((acc, curr) => acc + curr.duration, 0);
    const errors = logs.filter((l) => l.statusCode >= 400).length;

    return {
      successRate: Math.round((successes / logs.length) * 100),
      avgDuration: Math.round(durationSum / logs.length),
      totalErrors: errors,
    };
  }, [logs]);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "success";
    if (code >= 400) return "error";
    return "warning";
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "POST":
        return "blue";
      case "PUT":
        return "cyan";
      case "DELETE":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
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
      title: "Phương thức",
      dataIndex: "method",
      key: "method",
      width: 120,
      render: (method: string) => (
        <Tag color={getMethodColor(method)} style={{ fontWeight: "bold" }}>
          {method}
        </Tag>
      ),
    },
    {
      title: "Cổng Endpoint",
      dataIndex: "endpoint",
      key: "endpoint",
      render: (endpoint: string) => (
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[300px] uppercase tracking-tight">
            {endpoint.split("/").pop() || "/"}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
            {endpoint}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusCode",
      key: "statusCode",
      width: 120,
      align: "center" as const,
      render: (code: number) => (
        <Tag color={getStatusColor(code)} style={{ fontWeight: "bold" }}>
          {code}
        </Tag>
      ),
    },
    {
      title: "Độ trễ",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      align: "right" as const,
      render: (duration: number) => (
        <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 tabular-nums">
          {duration}ms <ClockCircleOutlined className="opacity-30" />
        </span>
      ),
    },
  ];

  const formatJson = (jsonStr: string | null) => {
    if (!jsonStr) return "{}";
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Control Center */}
      <PageHeader
        title="Lịch sử API"
        breadcrumbs={[{ title: "Workspace" }, { title: "Giám sát API" }]}
        icon={<HistoryOutlined />}
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
              placeholder="Tìm kiếm theo endpoint hoặc thông điệp lỗi..."
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
              placeholder="Trạng thái API"
              size="large"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              style={{ width: "100%" }}
              options={[
                { label: "Tất cả trạng thái", value: "" },
                { label: "Thành công (2xx)", value: "SUCCESS" },
                { label: "Lỗi hệ thống (4xx+)", value: "ERROR" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={
                <span className="text-xs font-black uppercase text-slate-400">
                  Tổng yêu cầu
                </span>
              }
              value={total}
              prefix={<HistoryOutlined className="text-blue-500 mr-2" />}
              valueStyle={{ fontWeight: 900 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={
                <span className="text-xs font-black uppercase text-slate-400">
                  Tỷ lệ thành công
                </span>
              }
              value={stats.successRate}
              suffix="%"
              prefix={<CheckCircleOutlined className="text-emerald-500 mr-2" />}
              valueStyle={{
                fontWeight: 900,
                color: stats.successRate > 90 ? "#22c55e" : "#f59e0b",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={
                <span className="text-xs font-black uppercase text-slate-400">
                  Độ trễ trung bình
                </span>
              }
              value={stats.avgDuration}
              suffix="ms"
              prefix={<ThunderboltOutlined className="text-amber-500 mr-2" />}
              valueStyle={{ fontWeight: 900 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Logs Table */}
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        className="shadow-sm overflow-hidden"
      >
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={isLoading || isFetching}
          onRow={(record) => ({
            onClick: () => setSelectedLogId(record.id),
            className:
              "cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors",
          })}
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

      {/* Drawer Details */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <CodeOutlined className="text-red-600 text-xl" />
            <div>
              <h3 className="m-0 text-base font-black uppercase">
                Chi tiết API
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                {selectedLog
                  ? dayjs(selectedLog.createdAt).format("DD/MM/YYYY HH:mm:ss")
                  : ""}
              </span>
            </div>
          </div>
        }
        placement="right"
        width={650}
        onClose={() => setSelectedLogId(null)}
        open={!!selectedLogId}
        extra={
          <Button type="primary" onClick={() => setSelectedLogId(null)}>
            Đóng
          </Button>
        }
      >
        {selectedLog && (
          <Space direction="vertical" size="large" className="w-full">
            {/* Latency Stats */}
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" title="Status Code">
                  <Tag
                    color={getStatusColor(selectedLog.statusCode)}
                    className="m-0 font-bold text-sm"
                  >
                    {selectedLog.statusCode}
                  </Tag>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Latency">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {selectedLog.duration}ms
                  </span>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Method">
                  <Tag
                    color={getMethodColor(selectedLog.method)}
                    className="m-0 font-bold text-sm"
                  >
                    {selectedLog.method}
                  </Tag>
                </Card>
              </Col>
            </Row>

            {/* Request */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 tracking-wider mb-2">
                Request Body
              </h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <pre className="text-xs text-indigo-300 font-mono overflow-auto whitespace-pre-wrap max-h-60 m-0">
                  {formatJson(selectedLog.requestBody)}
                </pre>
              </div>
            </div>

            {/* Response */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 tracking-wider mb-2">
                Response Body
              </h4>
              <div
                className={`p-4 rounded-xl border ${selectedLog.statusCode >= 400 ? "bg-rose-950/20 border-rose-900/30" : "bg-slate-950 border-slate-800"}`}
              >
                <pre
                  className={`text-xs font-mono overflow-auto whitespace-pre-wrap max-h-60 m-0 ${selectedLog.statusCode >= 400 ? "text-rose-400" : "text-emerald-400"}`}
                >
                  {selectedLog.responseBody
                    ? formatJson(selectedLog.responseBody)
                    : selectedLog.errorMessage ||
                      "Không có nội dung phản hồi từ máy chủ."}
                </pre>
              </div>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};
