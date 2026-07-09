import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

const DEFAULT_PROMPT = `Bạn là một chuyên gia viết nội dung mô tả sản phẩm tối ưu SEO cho cửa hàng phụ tùng ô tô.
Hãy viết một mô tả sản phẩm chi tiết, chuyên nghiệp và cuốn hút bằng ngôn ngữ tiếng Việt (HTML format, chỉ sử dụng các thẻ cơ bản như <p>, <h3>, <ul>, <li>, <strong>, <em>, không viết thẻ <html> hay <body>).

Thông tin sản phẩm:
- Tên sản phẩm: {title}
- Mã phụ tùng (SKU): {sku}
- Chất liệu: {material}
- Dòng xe tương thích: {carModels}
- Kích thước: {dimensions}
- Mô tả ngắn/Ghi chú: {shortDescription}
- Từ khóa chính SEO (Focus Keyword): {focusKeyword}

Yêu cầu bài viết để tối ưu hóa SEO trên WordPress:
1. Có tiêu đề và đoạn giới thiệu sản phẩm lôi cuốn.
2. BẮT BUỘC sử dụng từ khóa chính "{focusKeyword}" ngay ở phần đầu tiên của bài viết (trong 50 từ đầu tiên).
3. Lặp lại từ khóa chính "{focusKeyword}" khoảng 3-5 lần một cách tự nhiên xuyên suốt bài viết (trong các tiêu đề h3 hoặc đoạn văn).
4. Viết mô tả sản phẩm có độ dài tối thiểu là 650 từ để đảm bảo tối ưu hóa RankMath/Yoast SEO.
5. Nêu bật ưu điểm và đặc tính nổi bật của sản phẩm.
6. Cung cấp hướng dẫn sử dụng hoặc lưu ý tương thích dòng xe rõ ràng (nếu có).
7. Định dạng HTML rõ ràng, dễ đọc, không chứa markdown (như \`\`\`html).`;

@Controller('ai-settings')
export class AiSettingsController {
  constructor(private readonly prisma: PrismaService) {}

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
