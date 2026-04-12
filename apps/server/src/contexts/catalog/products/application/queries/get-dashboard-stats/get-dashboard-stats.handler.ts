import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery } from './get-dashboard-stats.query';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { JobStatus } from '@prisma/client';

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler implements IQueryHandler<GetDashboardStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<unknown> {
    // Basic counts
    const [
      totalProducts,
      completedProducts,
      processingProducts,
      failedProducts,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: JobStatus.COMPLETED } }),
      this.prisma.product.count({
        where: { status: { in: [JobStatus.PENDING, JobStatus.PROCESSING] } },
      }),
      this.prisma.product.count({ where: { status: JobStatus.FAILED } }),
    ]);

    // Error analysis
    const failedItems = await this.prisma.product.findMany({
      where: { status: JobStatus.FAILED, errorLog: { not: null } },
      select: { errorLog: true },
    });

    let duplicateSku = 0;
    let missingId = 0;
    let otherErrors = 0;

    for (const item of failedItems) {
      const err = item.errorLog?.toLowerCase() || '';
      if (
        err.includes('trùng mã sku') ||
        err.includes('trùng sku') ||
        err.includes('sku already exists') ||
        err.includes('woocommerce_rest_product_invalid_id_duplicate')
      ) {
        duplicateSku++;
      } else if (
        err.includes('invalid id') ||
        err.includes('id không hợp lệ') ||
        err.includes('hỏng trên wp') ||
        err.includes('không tìm thấy')
      ) {
        missingId++;
      } else {
        otherErrors++;
      }
    }

    const totalErrors = failedItems.length;
    let errorAnalysis: { label: string; value: number; color: string }[] = [];
    if (totalErrors > 0) {
      errorAnalysis = [
        {
          label: 'Trùng mã SKU / Đã tồn tại',
          value: Math.round((duplicateSku / totalErrors) * 100),
          color: 'bg-red-600 dark:bg-rose-500',
        },
        {
          label: 'ID hỏng / Bị xóa trên WP',
          value: Math.round((missingId / totalErrors) * 100),
          color: 'bg-red-400 dark:bg-rose-400',
        },
        {
          label: 'Khác',
          value: Math.round((otherErrors / totalErrors) * 100),
          color: 'bg-slate-300 dark:bg-slate-600',
        },
      ].sort((a, b) => b.value - a.value); // Sort descending
    }

    // 7 Days Activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentItems = await this.prisma.product.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    });

    const datesMenu = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    const activityDataMap: Record<
      string,
      { name: string; completed: number; failed: number }
    > = {};
    const dows = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (const d of datesMenu) {
      const dateObj = new Date(d);
      activityDataMap[d] = {
        name: dows[dateObj.getDay()],
        completed: 0,
        failed: 0,
      };
    }

    for (const item of recentItems) {
      const d = item.createdAt.toISOString().split('T')[0];
      if (activityDataMap[d]) {
        if (item.status === JobStatus.COMPLETED) {
          activityDataMap[d].completed++;
        } else if (item.status === JobStatus.FAILED) {
          activityDataMap[d].failed++;
        }
      }
    }

    const recentActivity = Object.values(activityDataMap);

    return {
      stats: {
        totalProducts,
        completedProducts,
        processingProducts,
        failedProducts,
      },
      errorAnalysis,
      recentActivity,
    };
  }
}
