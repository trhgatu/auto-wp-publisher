import * as XLSX from "xlsx";
import type { ImportProductDto } from "@repo/shared";

const cleanPrice = (val: string) => {
  if (!val) return "";
  return val.replace(/[.,\sđđ]/g, "");
};

export const parseExcelFile = (
  data: string | ArrayBuffer,
  isCsv: boolean = false,
): ImportProductDto[] => {
  const wb = XLSX.read(data, { type: isCsv ? "string" : "binary" });
  const wsname = wb.SheetNames[0];
  const ws = wb.Sheets[wsname];
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  if (!rawData || rawData.length === 0) {
    throw new Error("File Excel trống hoặc không đúng định dạng.");
  }

  const mappedData: (ImportProductDto | null)[] = rawData.map((row) => {
    const keys = Object.keys(row);
    if (keys.length < 2) return null;

    const findKey = (possibleNames: string[]) => {
      const lowerKeys = keys.map((k) => k.toLowerCase());

      for (const name of possibleNames) {
        const idx = lowerKeys.indexOf(name.toLowerCase());
        if (idx !== -1) return keys[idx];
      }

      return keys.find((k) =>
        possibleNames.some((name) =>
          k.toLowerCase().includes(name.toLowerCase()),
        ),
      );
    };

    const getVal = (possibleNames: string[]) => {
      const key = findKey(possibleNames);
      return key ? String(row[key]) : "";
    };

    const getUrlVal = (possibleNames: string[]) => {
      const val = getVal(possibleNames).trim();
      if (!val) return "";
      if (!val.toLowerCase().startsWith("http")) return "";
      return val;
    };

    let titleKey = findKey([
      "dòng xe",
      "tên sản phẩm",
      "tên hàng",
      "tiêu đề",
      "chi tiết dòng xe",
      "product",
      "title",
    ]);
    if (!titleKey)
      titleKey = findKey(["tên", "item", "hàng", "model", "models"]);

    let title = titleKey ? row[titleKey] : null;

    if (!title || String(title).trim() === "") {
      const h = findKey(["hãng"]);
      const d = findKey(["dòng"]);
      const m = findKey(["mã hàng"]);
      if (h && d) {
        title = `${row[h]} ${row[d]} ${m ? row[m] : ""}`;
      }
    }

    if (!title || String(title).trim() === "") return null;

    const brand = getVal(["hãng xe", "hãng", "brand", "hiệu"]);
    const model = getVal(["dòng xe", "model", "models", "loại xe"]);
    const partNumber = getVal(["mã phụ tùng", "mã hàng", "sku"]);
    const priceStr = getVal(["giá bán", "giá niêm yết", "đơn giá"]);

    const price = priceStr.length < 15 ? cleanPrice(priceStr) : "";

    const category = brand || "Chưa phân loại";

    const smartTags = [brand, model, partNumber]
      .map((t) => (t ? String(t).trim() : ""))
      .filter((t) => t !== "")
      .join(", ");

    return {
      title: String(title).trim(),
      dimensions: getVal(["kích thước", "dimensions", "size"]),
      material: getVal(["chất liệu", "material", "vật liệu"]),
      price: price,
      sku: partNumber,
      carModels: model || getVal(["dòng xe", "models", "loại xe"]),
      carDetail: getVal(["chi tiết dòng xe", "chi tiết", "detail", "mô tả"]),
      shortDescription: getVal([
        "mô tả ngắn",
        "short description",
        "tóm tắt",
        "short_description",
      ]),
      partNumbers: partNumber,
      video: getUrlVal(["video", "youtube", "clip"]),
      shopeeLink: getUrlVal(["shopee", "link shopee"]),
      lazadaLink: getUrlVal(["lzd", "lazada", "link lazada"]),
      tiktokLink: getUrlVal(["tiktok", "link tiktok"]),
      imageUrl: getUrlVal([
        "ảnh đại diện",
        "ảnh chính",
        "ảnh",
        "image",
        "hình",
        "url",
      ]),
      galleryImageUrls: getVal([
        "thư viện ảnh",
        "thư viện",
        "gallery",
        "images",
        "danh sách ảnh",
      ])
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u.toLowerCase().startsWith("http"))
        .join(","),
      category: category,
      tags: smartTags,
    };
  });

  return mappedData.filter((d): d is ImportProductDto => d !== null);
};
