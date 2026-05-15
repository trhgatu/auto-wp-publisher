import * as XLSX from "xlsx";
import type { JobItem } from "../api/getJobs";

export const exportProductsToExcel = (products: JobItem[]) => {
  const data = products.map((p) => ({
    "Tên Sản Phẩm": p.name,
    SKU: p.sku || "",
    "Giá bán": p.price || "",
    "Trạng thái":
      p.status === "COMPLETED"
        ? "Đã xong"
        : p.status === "FAILED"
          ? "Lỗi"
          : p.status === "PROCESSING"
            ? "Đang làm"
            : "Chờ xử lý",
    "Link WordPress": p.wpUrl || "",
    "Lỗi (nếu có)": p.errorLog || "",
    "Ngày cập nhật": new Date(p.updatedAt).toLocaleString("vi-VN"),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sản phẩm");

  const maxWidths = data.reduce((acc, row) => {
    Object.entries(row).forEach(([key, val], idx) => {
      const len = Math.max(String(key).length, String(val).length);
      acc[idx] = Math.max(acc[idx] || 0, len);
    });
    return acc;
  }, [] as number[]);

  ws["!cols"] = maxWidths.map((w) => ({ wch: w + 2 }));

  XLSX.writeFile(wb, `Danh_sach_san_pham_${new Date().getTime()}.xlsx`);
};
