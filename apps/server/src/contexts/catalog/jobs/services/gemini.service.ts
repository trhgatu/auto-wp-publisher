import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Bạn là một chuyên gia viết nội dung mô tả sản phẩm tối ưu SEO cho cửa hàng phụ tùng ô tô.
Hãy viết một mô tả sản phẩm chi tiết, chuyên nghiệp và cuốn hút bằng ngôn ngữ tiếng Việt (HTML format, chỉ sử dụng các thẻ cơ bản như <p>, <h3>, <ul>, <li>, <strong>, <em>, không viết thẻ <html> hay <body>).

Thông tin sản phẩm:
- Tên sản phẩm: ${data.title}
${data.sku ? `- Mã phụ tùng (SKU): ${data.sku}` : ''}
${data.material ? `- Chất liệu: ${data.material}` : ''}
${data.carModels ? `- Dòng xe tương thích: ${data.carModels}` : ''}
${data.dimensions ? `- Kích thước: ${data.dimensions}` : ''}
${data.shortDescription ? `- Mô tả ngắn/Ghi chú: ${data.shortDescription}` : ''}

Yêu cầu bài viết:
1. Có tiêu đề và đoạn giới thiệu sản phẩm lôi cuốn.
2. Nêu bật ưu điểm và đặc tính nổi bật của sản phẩm.
3. Cung cấp hướng dẫn sử dụng hoặc lưu ý tương thích dòng xe rõ ràng (nếu có).
4. Định dạng HTML rõ ràng, dễ đọc, không chứa markdown (như \`\`\`html).`;

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
            temperature: 0.7,
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

      // Clean up markdown wrapper if model returns it
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
