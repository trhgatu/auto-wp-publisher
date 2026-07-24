import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAvailableModels(): Promise<{ label: string; value: string }[]> {
    const apiKey = process.env.GEMINI_API_KEY?.replace(/['"]/g, '').trim();
    if (!apiKey) return [];

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = (await res.json()) as {
        models?: {
          name: string;
          displayName: string;
          description: string;
          supportedGenerationMethods?: string[];
        }[];
      };

      return (data.models || [])
        .filter(
          (m) =>
            m.supportedGenerationMethods?.includes('generateContent') &&
            m.name.includes('gemini'),
        )
        .map((m) => {
          const modelId = m.name.replace('models/', '');
          return {
            label: `${m.displayName || modelId} (${modelId})`,
            value: modelId,
          };
        });
    } catch (err) {
      this.logger.error(
        `Failed to fetch models list from Gemini API: ${String(err)}`,
      );
      return [];
    }
  }

  private getApiKeys(): string[] {
    const rawKeys = process.env.GEMINI_API_KEY || '';
    return rawKeys
      .split(',')
      .map((k) => k.replace(/['"]/g, '').trim())
      .filter((k) => k.length > 0);
  }

  async generateProductDescription(data: {
    title: string;
    sku?: string | null;
    material?: string | null;
    carModels?: string | null;
    dimensions?: string | null;
    shortDescription?: string | null;
  }): Promise<string | null> {
    const apiKeys = this.getApiKeys();
    if (apiKeys.length === 0) {
      this.logger.warn(
        'GEMINI_API_KEY is not defined in environment variables. Falling back to default template.',
      );
      return null;
    }

    const words = data.title.split(/[-|/]/)[0].trim().split(/\s+/);
    const focusKeyword = words.slice(0, Math.min(4, words.length)).join(' ');

    let promptTemplate = `Bạn là một chuyên gia viết nội dung mô tả sản phẩm phụ tùng ô tô tối ưu SEO chuyên sâu.
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

    // Retry loop with key rotation & delay for 429 Rate Limits
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Pick key based on attempt index
      const apiKey = apiKeys[(attempt - 1) % apiKeys.length];
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

        if (response.status === 429) {
          this.logger.warn(
            `⚠️ Gemini API 429 Rate Limit hit (Attempt ${attempt}/${maxRetries}). Retrying...`,
          );
          if (attempt < maxRetries) {
            const waitTime = attempt * 5000; // 5s, 10s...
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          }
        }

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

        const generatedText =
          resBody.candidates?.[0]?.content?.parts?.[0]?.text;
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
          `Failed to generate content from Gemini API (Attempt ${attempt}): ${String(error)}`,
        );
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }

    return null;
  }
}
