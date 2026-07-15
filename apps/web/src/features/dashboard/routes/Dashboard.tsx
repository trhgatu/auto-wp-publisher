import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Progress,
  Result,
  Skeleton,
} from "antd";
import { Link } from "react-router-dom";
import {
  CheckCircleOutlined,
  RiseOutlined,
  PlusOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  RobotOutlined,
} from "@ant-design/icons";

import { PageHeader } from "../../../components/shared/PageHeader";

import { useDashboardStats } from "../hooks/useDashboardStats";
import { useTheme } from "../../../hooks/useTheme";

export const Dashboard = () => {
  const { data, isLoading, isError } = useDashboardStats();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card bordered={false}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card bordered={false}>
                <Skeleton active avatar paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card bordered={false}>
              <Skeleton active paragraph={{ rows: 10 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              <Card bordered={false}>
                <Skeleton active paragraph={{ rows: 5 }} />
              </Card>
              <Card bordered={false} style={{ background: "#000" }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Result
        status="error"
        title="Lỗi tải dữ liệu"
        subTitle="Đã có lỗi xảy ra trong quá trình tải dữ liệu bảng điều khiển."
        extra={[
          <Button
            type="primary"
            key="retry"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </Button>,
        ]}
      />
    );
  }

  const errorAnalysisMapped = data.errorAnalysis || [];
  const recentActivityMapped = data.recentActivity || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 transition-colors">
      {/* 1. Header Card */}
      <PageHeader
        title="Bảng điều hành"
        description="Xem tổng quan trạng thái xuất bản bài viết và phân tích hiệu suất hệ thống."
        breadcrumbs={[{ title: "Workspace" }, { title: "Tổng quan" }]}
        extra={
          <Button
            type="primary"
            size="large"
            danger
            className="font-bold text-xs uppercase tracking-tight"
          >
            Xuất báo cáo chi tiết
          </Button>
        }
      />
      {/* 4. Quick Actions Grid (Row 3 - Full-width horizontal action bar) */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          {/* Quick Actions Card */}
          <Card
            bordered={true}
            className="shadow-sm bg-white dark:bg-[#1F1F1F]"
            title={
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                Thao tác nhanh
              </span>
            }
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/create">
                <Button
                  className="w-full flex flex-col items-center justify-center h-20 gap-2 text-xs font-semibold hover:border-[#C62828] hover:text-[#C62828]"
                  type="default"
                >
                  <PlusOutlined className="text-lg text-red-600" />
                  Tạo Job
                </Button>
              </Link>
              <Link to="/jobs">
                <Button
                  className="w-full flex flex-col items-center justify-center h-20 gap-2 text-xs font-semibold hover:border-[#C62828] hover:text-[#C62828]"
                  type="default"
                >
                  <DatabaseOutlined className="text-lg text-blue-600" />
                  Quản lý Job
                </Button>
              </Link>
              <Link to="/websites">
                <Button
                  className="w-full flex flex-col items-center justify-center h-20 gap-2 text-xs font-semibold hover:border-[#C62828] hover:text-[#C62828]"
                  type="default"
                >
                  <GlobalOutlined className="text-lg text-emerald-600" />
                  Cấu hình Wordpress
                </Button>
              </Link>
              <Link to="/ai-settings">
                <Button
                  className="w-full flex flex-col items-center justify-center h-20 gap-2 text-xs font-semibold hover:border-[#C62828] hover:text-[#C62828]"
                  type="default"
                >
                  <RobotOutlined className="text-lg text-amber-600" />
                  Cấu hình AI
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2. Stats Grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">
                  Tổng Job
                </span>
              }
              value={data.stats.totalProducts}
              valueStyle={{ fontWeight: 700, color: "#C62828" }}
            />
            <div className="pt-3 mt-3 border-t border-[#ECECEC]/60 dark:border-[#303030]/40 flex items-center justify-between text-xs">
              <span className="text-[#8C8C8C]">Trong DB</span>
              <span className="font-bold text-[#C62828] bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                Thực tế
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">
                  Thành Công
                </span>
              }
              value={data.stats.completedProducts}
              valueStyle={{ fontWeight: 700, color: "#10b981" }}
            />
            <div className="pt-3 mt-3 border-t border-[#ECECEC]/60 dark:border-[#303030]/40 flex items-center justify-between text-xs">
              <span className="text-[#8C8C8C]">Tỷ lệ hoàn tất</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                {data.stats.totalProducts
                  ? `${Math.round((data.stats.completedProducts / data.stats.totalProducts) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">
                  Đang Xử Lý
                </span>
              }
              value={data.stats.processingProducts}
              valueStyle={{ fontWeight: 700, color: "#3b82f6" }}
            />
            <div className="pt-3 mt-3 border-t border-[#ECECEC]/60 dark:border-[#303030]/40 flex items-center justify-between text-xs">
              <span className="text-[#8C8C8C]">Đang bận</span>
              <span className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                Queue
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">
                  Lỗi Pushing
                </span>
              }
              value={data.stats.failedProducts}
              valueStyle={{ fontWeight: 700, color: "#f59e0b" }}
            />
            <div className="pt-3 mt-3 border-t border-[#ECECEC]/60 dark:border-[#303030]/40 flex items-center justify-between text-xs">
              <span className="text-[#8C8C8C]">Ngay lập tức</span>
              <span className="font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                Cần xử lý
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. Charts & Error Sections */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="shadow-sm"
            title={
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <RiseOutlined className="text-red-600 dark:text-red-500 text-base" />
                  Hoạt động thực tế (7 ngày qua)
                </span>
                <div className="flex items-center gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500" />
                    <span>Thành công</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>Lỗi</span>
                  </div>
                </div>
              </div>
            }
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={recentActivityMapped}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{
                      stroke: theme === "dark" ? "#1e293b" : "#f1f5f9",
                      strokeWidth: 1,
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border:
                        theme === "dark"
                          ? "1px solid #1e293b"
                          : "1px solid #e2e8f0",
                      backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                      boxShadow: "none",
                      padding: "12px",
                    }}
                    itemStyle={{
                      color: theme === "dark" ? "#f1f5f9" : "#0f172a",
                      fontWeight: 800,
                      fontSize: "11px",
                      textTransform: "uppercase",
                    }}
                    labelStyle={{
                      color: "#64748b",
                      fontWeight: 700,
                      fontSize: "10px",
                      marginBottom: "4px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Thành công"
                    stroke={theme === "dark" ? "#ef4444" : "#dc2626"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRed)"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name="Thất bại"
                    stroke={theme === "dark" ? "#475569" : "#cbd5e1"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSlate)"
                  />
                  <defs>
                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={theme === "dark" ? "#ef4444" : "#fee2e2"}
                        stopOpacity={theme === "dark" ? 0.2 : 0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme === "dark" ? "#ef4444" : "#fee2e2"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorSlate" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={theme === "dark" ? "#334155" : "#f1f5f9"}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme === "dark" ? "#334155" : "#f1f5f9"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          {/* Error Analysis Card */}
          <Card
            bordered={true}
            className="shadow-sm h-full"
            bodyStyle={{
              height: "calc(100% - 57px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            title={
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                Phân tích lỗi
              </span>
            }
          >
            <div className="space-y-5">
              {errorAnalysisMapped.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                errorAnalysisMapped.map((err: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-end text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400 uppercase">
                        {err.label}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100">
                        {err.value}%
                      </span>
                    </div>
                    <Progress
                      percent={err.value}
                      showInfo={false}
                      strokeColor={
                        err.color === "bg-red-500"
                          ? "#ef4444"
                          : err.color === "bg-amber-500"
                            ? "#f59e0b"
                            : "#dc2626"
                      }
                      trailColor="rgba(0, 0, 0, 0.04)"
                    />
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-sm font-medium border border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg py-12 text-center">
                  <CheckCircleOutlined className="text-emerald-500 text-3xl mb-2" />
                  <span className="text-emerald-600 dark:text-emerald-500 font-bold">
                    Hệ thống ổn định, không có lỗi.
                  </span>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
