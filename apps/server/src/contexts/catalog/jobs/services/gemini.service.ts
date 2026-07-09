import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateProductDescription(data: {
    title: string;
    sku?: string | null;
    material?: string | null;
    carModels?: string | null;
    dimensions?: string | null;
    shortDescription?: string | null;
  }): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY?.replace(/['"]/g, '').trim();
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not defined in environment variables. Falling back to default template.',
      );
      return null;
    }

    const words = data.title.split(/[-|/]/)[0].trim().split(/\s+/);
    const focusKeyword = words.slice(0, Math.min(4, words.length)).join(' ');

    let promptTemplate = `Bạn là một chuyên gia viết nội dung mô tả sản phẩm tối ưu SEO cho cửa hàng phụ tùng ô tô.
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

    let temperature = 0.7;
    let modelName = 'gemini-2.5-flash';

    try {
      const setting = await this.prisma.aiSetting.findUnique({
        where: { id: 'default' },
      });
      if (setting) {
        promptTemplate = setting.systemPrompt;
        temperature = setting.temperature;
        modelName = setting.modelName;
      }
    } catch (err) {
      this.prisma.aiSetting
        .upsert({
          where: { id: 'default' },
          update: { systemPrompt: promptTemplate },
          create: { id: 'default', systemPrompt: promptTemplate },
        })
        .catch(() => {});
      this.logger.error(`Error loading AI Settings: ${String(err)}`);
    }

    const prompt = promptTemplate
      .replace(/{title}/g, data.title || '')
      .replace(/{sku}/g, data.sku || '')
      .replace(/{material}/g, data.material || '')
      .replace(/{carModels}/g, data.carModels || '')
      .replace(/{dimensions}/g, data.dimensions || '')
      .replace(/{shortDescription}/g, data.shortDescription || '')
      .replace(/{focusKeyword}/g, focusKeyword);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: Number(temperature),
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Gemini API error [${response.status}]: ${errorText}`,
        );
        return null;
      }

      const resBody = (await response.json()) as {
        candidates?: {
          content?: {
            parts?: { text?: string }[];
          };
        }[];
      };

      const generatedText = resBody.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        this.logger.warn('Received empty response from Gemini API.');
        return null;
      }

      return generatedText
        .replace(/```html/gi, '')
        .replace(/```/g, '')
        .trim();
    } catch (error) {
      this.logger.error(
        `Failed to generate content from Gemini API: ${String(error)}`,
      );
      return null;
    }
  }
}
