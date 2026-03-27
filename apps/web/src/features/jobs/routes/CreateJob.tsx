import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  FileText,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ImportProductSchema } from "@repo/shared";
import type { ImportProductDto } from "@repo/shared";
import { createJob } from "../api/createJob";

export const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ImportProductDto>({
    title: "",
    sku: "",
    baseDescription: "",
    category: "Uncategorized",
    sourceUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[e.target.name];
        return newErrs;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      title: formData.title,
      baseDescription: formData.baseDescription,
      category: formData.category,
      ...(formData.sku ? { sku: formData.sku } : {}),
      ...(formData.sourceUrl ? { sourceUrl: formData.sourceUrl } : {}),
    };

    // Thay vì bắt Exception, sử dụng safeParse để tránh lỗi lệch ZodError Class ở Monorepo
    const result = ImportProductSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0].toString()] = e.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await createJob(payload as ImportProductDto);
      navigate("/");
    } catch {
      alert("Có lỗi xảy ra khi gọi máy chủ API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tạo Bài Viết Mới</h1>
        <p className="text-muted-foreground mt-2">
          Điền thông tin thủ công để phần mềm tự động lấy nội dung và đăng tải
          lên WordPress.
        </p>
      </div>

      <div className="glass rounded-xl p-8 border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tiêu đề (Bắt buộc)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="VD: Review Laptop XYZ"
                  />
                </div>
                {errors.title && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mã Bài Viết (Tùy chọn)
                </label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="SKU-1234..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Mô tả sơ bộ (Bắt buộc)</span>
                <span className="text-xs text-muted-foreground">
                  Tối thiểu 10 ký tự
                </span>
              </label>
              <textarea
                name="baseDescription"
                value={formData.baseDescription}
                onChange={handleChange}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Nêu ngắn gọn các ý chính muốn thể hiện trong bài viết này..."
              />
              {errors.baseDescription && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.baseDescription}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                  <LinkIcon className="h-4 w-4" /> Link Nguồn tham khảo (Tùy
                  chọn)
                </label>
                <input
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="https://..."
                />
                {errors.sourceUrl && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.sourceUrl}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Chuyên mục (Category)
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                >
                  <option value="Uncategorized">Chưa phân loại</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Tài chính">Tài chính</option>
                  <option value="Đời sống">Đời sống</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border/50">
            <div className="flex items-center text-sm text-muted-foreground bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10">
              <AlertCircle className="w-4 h-4 mr-2 text-primary" />
              Bài viết sẽ được AI tự động biên tập và đẩy lên Web.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 text-primary-foreground text-sm font-medium px-6 py-2.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý Job...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gửi Hệ Thống & Đăng Ngay
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
