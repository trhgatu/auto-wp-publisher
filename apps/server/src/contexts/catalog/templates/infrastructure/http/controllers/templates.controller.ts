import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductTemplateService } from '../../../services/product-template.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templateService: ProductTemplateService) {}

  @Get()
  async getAllTemplates() {
    return this.templateService.getAllTemplates();
  }

  @Get(':id')
  async getTemplateById(@Param('id') id: string) {
    const template = await this.templateService.getTemplateById(id);
    if (!template) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }
    return template;
  }

  @Post()
  async saveTemplate(
    @Body()
    body: {
      id?: string;
      name: string;
      content: string;
      isDefault?: boolean;
    },
  ) {
    if (!body.name || !body.content) {
      throw new HttpException(
        'Name and content are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.templateService.upsertTemplate(body);
  }

  @Post(':id/set-default')
  async setDefaultTemplate(@Param('id') id: string) {
    return this.templateService.setDefaultTemplate(id);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.templateService.deleteTemplate(id);
  }
}
