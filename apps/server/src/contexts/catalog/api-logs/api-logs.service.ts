import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApiLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    limit: number = 20,
    offset: number = 0,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.ApiLogWhereInput = {};

    if (search) {
      where.OR = [
        { endpoint: { contains: search, mode: 'insensitive' } },
        { errorMessage: { contains: search, mode: 'insensitive' } },
        { method: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'SUCCESS') {
      where.statusCode = { gte: 200, lt: 300 };
    } else if (status === 'ERROR') {
      where.statusCode = { gte: 400 };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Cộng thêm 1 ngày để bao gồm cả ngày kết thúc (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.apiLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.apiLog.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.apiLog.findUnique({
      where: { id },
    });
  }
}
