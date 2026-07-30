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
      "tên sản phẩm",
      "tên hàng",
      "tiêu đề",
      "chi tiết dòng xe",
      "dòng xe",
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

    const carMake = getVal(["hãng xe", "hãng"]);
    const excelBrand = getVal(["thương hiệu", "brand", "hiệu", "nhãn hiệu"]);
    const model = getVal(["dòng xe", "model", "models", "loại xe"]);
    const partNumber = getVal(["mã phụ tùng", "mã hàng", "sku"]);
    const priceStr = getVal(["giá bán", "giá niêm yết", "đơn giá"]);

    const price = priceStr.length < 15 ? cleanPrice(priceStr) : "";

    const category =
      getVal(["danh mục", "nhóm hàng"]) || carMake || "Chưa phân loại";

    const smartTags = [carMake, model, partNumber]
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
      brand: excelBrand,
      tags: smartTags,
    };
  });

  return mappedData.filter((d): d is ImportProductDto => d !== null);
};

export const downloadSampleExcelTemplate = () => {
  const sampleData = [
    {
      "Tên sản phẩm": "Lọc gió động cơ Toyota Camry 2.5Q 2018-2023",
      "Mã phụ tùng (SKU)": "17801-0H050",
      "Danh mục": "Lọc gió",
      "Thương hiệu": "Toyota",
      "Dòng xe": "Camry 2018-2023",
      "Giá bán": "180000",
      "Mô tả ngắn":
        "Lọc gió động cơ cao cấp lọc sạch bụi bẩn bảo vệ động cơ xe Camry",
      "Kích thước": "240 x 220 x 50 mm",
      "Chất liệu": "Sợi tổng hợp cao cấp",
      "Link Shopee": "https://shopee.vn/product/sample-1",
      "Link Lazada": "",
      "Link TikTok": "",
      "Link Video": "",
    },
    {
      "Tên sản phẩm": "Lọc gió động cơ Toyota Vios 1.5 2014-2022",
      "Mã phụ tùng (SKU)": "17801-0M020",
      "Danh mục": "Lọc gió",
      "Thương hiệu": "Toyota",
      "Dòng xe": "Vios 2014-2022",
      "Giá bán": "150000",
      "Mô tả ngắn":
        "Lọc gió động cơ Vios hàng chuẩn OEM lọc sạch không khí nạp",
      "Kích thước": "230 x 180 x 42 mm",
      "Chất liệu": "Giấy lọc chuyên dụng",
      "Link Shopee": "https://shopee.vn/product/sample-2",
      "Link Lazada": "",
      "Link TikTok": "",
      "Link Video": "",
    },
    {
      "Tên sản phẩm": "Lọc xăng Toyota Innova 2.0 2008-2016",
      "Mã phụ tùng (SKU)": "23300-0C010",
      "Danh mục": "Lọc xăng",
      "Thương hiệu": "Toyota",
      "Dòng xe": "Innova 2008-2016",
      "Giá bán": "250000",
      "Mô tả ngắn":
        "Lọc xăng nhiên liệu Innova lọc sạch cặn bẩn béc phun kim phun",
      "Kích thước": "80 x 80 x 130 mm",
      "Chất liệu": "Hợp kim & Màng lọc",
      "Link Shopee": "",
      "Link Lazada": "",
      "Link TikTok": "",
      "Link Video": "",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mau_Import_Phu_Tung");
  XLSX.writeFile(wb, "File_Mau_Import_SanPham_AutoWP.xlsx");
};
