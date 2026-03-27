import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { getJobs } from "../api/getJobs";
import type { JobItem } from "../api/getJobs";
import { JobStatusBadge } from "../components/JobStatusBadge";

export const JobsList = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Polling mỗi 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tiến độ Xuất Bản</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi trạng thái các bài viết đang được lấy dữ liệu và lên lịch
          WordPress.
        </p>
      </div>

      <div className="glass rounded-xl shadow-sm overflow-hidden border border-border">
        {jobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">
              Bạn chưa có bài viết nào.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-6 py-4 font-medium">Tên Bài Viết</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Cập nhật lúc</th>
                  <th className="px-6 py-4 font-medium">Log (Nếu lỗi)</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {job.name}
                    </td>
                    <td className="px-6 py-4">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(job.updatedAt).toLocaleTimeString("vi-VN")} -{" "}
                      {new Date(job.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      {job.status === "FAILED" && job.errorLog ? (
                        <span
                          className="text-rose-400 text-xs line-clamp-2"
                          title={job.errorLog}
                        >
                          {job.errorLog}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
