import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

const DEFAULT_RICH_TEMPLATE = `
<div class="product-description-container" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p style="font-size: 16px; margin-bottom: 20px;">
    Sản phẩm <strong>{title}</strong> là phụ tùng ô tô cao cấp được sản xuất theo tiêu chuẩn kỹ thuật nghiêm ngặt, đảm bảo độ bền vượt trội và khả năng tương thích hoàn hảo với dòng xe của bạn.
  </p>

  <h3 style="color: #1e293b; border-bottom: 2px solid #ef4444; padding-bottom: 6px; margin-top: 25px;">
    📋 Thông số kỹ thuật sản phẩm
  </h3>

  <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
    <tbody>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Tên sản phẩm</td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{title}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">Mã phụ tùng (SKU)</td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{sku}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">Chất liệu</td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{material}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">Dòng xe tương thích</td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{carModels}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">Kích thước / Ghi chú</td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">{shortDescription}</td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #1e293b; border-bottom: 2px solid #ef4444; padding-bottom: 6px; margin-top: 25px;">
    ✨ Ưu điểm nổi bật
  </h3>

  <ul style="padding-left: 20px; margin: 15px 0;">
    <li style="margin-bottom: 8px;">Thiết kế chuẩn xác 100% theo form zin của xe, lắp đặt dễ dàng.</li>
    <li style="margin-bottom: 8px;">Chất liệu cao cấp chịu lực, chịu nhiệt tốt, chống mài mòn cao.</li>
    <li style="margin-bottom: 8px;">Hoạt động ổn định, êm ái, kéo dài tuổi thọ cho hệ thống xe.</li>
  </ul>

  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin-top: 25px;">
    <strong style="color: #991b1b;">🛡️ Cam kết chất lượng & Bảo hành:</strong>
    <p style="margin: 5px 0 0 0; font-size: 13px; color: #7f1d1d;">
      Cam kết sản phẩm mới 100%, kiểm tra kỹ lưỡng trước khi giao hàng. Hỗ trợ đổi trả miễn phí trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.
    </p>
  </div>
</div>
`.trim();

@Injectable()
export class ProductTemplateService {
  private readonly logger = new Logger(ProductTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDefaultTemplate(): Promise<string> {
    try {
      const template = await this.prisma.productTemplate.findFirst({
        where: { isDefault: true },
      });

      if (template) {
        return template.content;
      }

      // If no default template exists, create one
      const created = await this.prisma.productTemplate.create({
        data: {
          name: 'Mẫu Phụ tùng Ô tô Chuẩn SEO (Mặc định)',
          content: DEFAULT_RICH_TEMPLATE,
          isDefault: true,
        },
      });

      return created.content;
    } catch (error) {
      this.logger.error('Error fetching product template from DB:', error);
      return DEFAULT_RICH_TEMPLATE;
    }
  }

  async getAllTemplates() {
    await this.getDefaultTemplate(); // Ensure default template exists
    return this.prisma.productTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplateById(id: string) {
    return this.prisma.productTemplate.findUnique({
      where: { id },
    });
  }

  async upsertTemplate(data: {
    id?: string;
    name: string;
    content: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      // Unset previous defaults
      await this.prisma.productTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    if (data.id) {
      return this.prisma.productTemplate.update({
        where: { id: data.id },
        data: {
          name: data.name,
          content: data.content,
          isDefault: data.isDefault ?? false,
        },
      });
    }

    return this.prisma.productTemplate.create({
      data: {
        name: data.name,
        content: data.content,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.productTemplate.delete({
      where: { id },
    });
  }

  async setDefaultTemplate(id: string) {
    await this.prisma.productTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.productTemplate.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async renderTemplateById(
    templateId: string,
    data: {
      title: string;
      sku?: string | null;
      material?: string | null;
      carModels?: string | null;
      shortDescription?: string | null;
    },
  ): Promise<string> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      return this.renderFallbackHtml(data);
    }

    return template.content
      .replace(/{title}/g, data.title || '')
      .replace(/{sku}/g, data.sku || 'Chưa cập nhật')
      .replace(/{material}/g, data.material || 'Theo tiêu chuẩn nhà sản xuất')
      .replace(/{carModels}/g, data.carModels || 'Đa dạng dòng xe')
      .replace(/{shortDescription}/g, data.shortDescription || 'Không có');
  }

  async renderFallbackHtml(data: {
    title: string;
    sku?: string | null;
    material?: string | null;
    carModels?: string | null;
    shortDescription?: string | null;
  }): Promise<string> {
    const templateContent = await this.getDefaultTemplate();

    return templateContent
      .replace(/{title}/g, data.title || '')
      .replace(/{sku}/g, data.sku || 'Chưa cập nhật')
      .replace(/{material}/g, data.material || 'Theo tiêu chuẩn nhà sản xuất')
      .replace(/{carModels}/g, data.carModels || 'Đa dạng dòng xe')
      .replace(/{shortDescription}/g, data.shortDescription || 'Không có');
  }
}
