import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ApiLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(limit: number = 20, offset: number = 0) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.apiLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.apiLog.count(),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.apiLog.findUnique({
      where: { id },
    });
  }
}
