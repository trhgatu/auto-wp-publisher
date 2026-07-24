import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GeminiService } from '@catalog/integrations';

const DEFAULT_PROMPT = `Bạn là một chuyên gia viết nội dung mô tả sản phẩm phụ tùng ô tô tối ưu SEO chuyên sâu.
Hãy viết một bài mô tả sản phẩm ĐẦY ĐỦ, CHI TIẾT và CHUYÊN NGHIỆP bằng tiếng Việt với độ dài khoảng 600 - 800 từ (định dạng HTML chuẩn, chỉ sử dụng thẻ <p>, <h3>, <ul>, <li>, <strong>, <em>, tuyệt đối không dùng thẻ <html> hay <body>).

Thông tin sản phẩm:
- Tên sản phẩm: {title}
- Mã phụ tùng (SKU): {sku}
- Chất liệu: {material}
- Dòng xe tương thích: {carModels}
- Kích thước: {dimensions}
- Ghi chú: {shortDescription}
- Từ khóa SEO chính: {focusKeyword}

Bắt buộc triển khai bài viết theo 5 phần chi tiết sau để đạt tối thiểu 600 - 800 từ:
1. <h3>1. Tổng quan & Vai trò của {title}</h3>
   Viết đoạn văn phân tích tầm quan trọng của sản phẩm trong vận hành ô tô. BẮT BUỘC chứa từ khóa "{focusKeyword}" ngay ở 50 từ đầu tiên.
2. <h3>2. Thông số kỹ thuật & Chất liệu cấu thành</h3>
   Phân tích chi tiết chất liệu {material}, độ bền, tiêu chuẩn sản xuất và độ chịu nhiệt/chịu lực.
3. <h3>3. Dòng xe tương thích & Ưu điểm vượt trội</h3>
   Trình bày rõ tương thích với {carModels}, khớp form zin 100%, chống mài mòn và tiết kiệm chi phí sửa chữa dài hạn.
4. <h3>4. Hướng dẫn lắp đặt & Thời điểm cần thay thế</h3>
   Cung cấp các dấu hiệu cho thấy cần bảo dưỡng/thay thế phụ tùng và lưu ý khi thao tác lắp đặt.
5. <h3>5. Cam kết chất lượng & Chính sách đổi trả</h3>
   Khẳng định chất lượng hàng mới 100%, bảo hành uy tín và hỗ trợ đổi trả nếu có lỗi sản xuất.`;

@Controller('ai-settings')
export class AiSettingsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  @Get('models')
  async getAvailableModels() {
    return this.geminiService.getAvailableModels();
  }

  @Get()
  async getAiSetting() {
    let setting = await this.prisma.aiSetting.findUnique({
      where: { id: 'default' },
    });

    if (!setting) {
      setting = await this.prisma.aiSetting.create({
        data: {
          id: 'default',
          systemPrompt: DEFAULT_PROMPT,
          temperature: 0.7,
          modelName: 'gemini-2.5-flash',
        },
      });
    }

    return setting;
  }

  @Post()
  async saveAiSetting(
    @Body()
    body: {
      systemPrompt: string;
      temperature: number;
      modelName: string;
    },
  ) {
    return this.prisma.aiSetting.upsert({
      where: { id: 'default' },
      update: {
        systemPrompt: body.systemPrompt,
        temperature: Number(body.temperature),
        modelName: body.modelName,
      },
      create: {
        id: 'default',
        systemPrompt: body.systemPrompt,
        temperature: Number(body.temperature),
        modelName: body.modelName,
      },
    });
  }
}
