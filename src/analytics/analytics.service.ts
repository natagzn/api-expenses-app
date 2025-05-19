import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceiptService } from '../receipt/receipt.service';
import { Receipt } from '@prisma/client';
import { CreateGoodsDTO } from '../goods/dto/create-goods.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private receiptService: ReceiptService,
  ) {}
  private getUserId(req: Request): number {
    const user = (req as any).user;
    if (!user || !user.sub) {
      throw new Error('User ID not found in the request');
    }
    const userId: number = Number(user.sub);
    return userId;
  }

  async expensesPerCategory(
    req: Request,
    start: Date,
    end: Date,
  ): Promise<{ category: string; totalAmount: number }[]> {
    if (!start || !end) {
      throw new BadRequestException('Incorrect start or end dates');
    }
    const receipts = await this.receiptService.allReceiptsPeriod(
      req,
      start,
      end,
    );
    if (!receipts || receipts.length === 0) {
      throw new NotFoundException(
        'Receipts for the specified period were not found.',
      );
    }

    const categoryAnalytics: { [key: string]: number } = {};

    for (const receipt of receipts) {
      for (const good of receipt.goods) {
        if (good.categoryId === null || good.categoryId === undefined) {
          continue;
        }
        const category = await this.prisma.category.findUnique({
          where: { id: good.categoryId },
        });

        const categoryName = category ? category.name : 'Unknown';
        const totalAmount = good.price * good.count;

        if (categoryAnalytics[categoryName]) {
          categoryAnalytics[categoryName] += totalAmount;
        } else {
          categoryAnalytics[categoryName] = totalAmount;
        }
      }
    }

    const result = Object.keys(categoryAnalytics).map((category) => ({
      category,
      totalAmount: categoryAnalytics[category],
    }));
    return result;
  }



  totalAmount(
    receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[],
  ): number {
    let totalAmount = 0;
    for (const item of receipts) {
      totalAmount += item.receipt.sum;
    }
    return totalAmount;
  }


  async expensesPerPeriod(
    req: Request,
    start: Date,
    end: Date,
  ): Promise<{
    totalAmount: number;
    receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
  }> {
    if (!start || !end) {
      throw new BadRequestException('Incorrect start or end dates');
    }
    const receipts = await this.receiptService.allReceiptsPeriod(
      req,
      start,
      end,
    );
    if (!receipts || receipts.length === 0) {
      throw new NotFoundException(
        'Receipts for the specified period were not found.',
      );
    }

    const totalAmount = this.totalAmount(receipts);
    return { totalAmount, receipts };
  }



  async expensesToday(
      req: Request,
  ): Promise<{
    totalAmount: number;
    receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
  }> {
    const userId = this.getUserId(req);

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);


    const { _sum } = await this.prisma.receipt.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: {
        sum: true,
      },
    });

    const totalAmount = _sum?.sum ?? 0;
    if (totalAmount === 0) {
      throw new NotFoundException('No receipts found today');
    }

    const receiptsDb = await this.prisma.receipt.findMany({
      where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      include: {
        goodsInReceipts: {
          include: { goods: true },
        },
      },
    });

    const receipts = receiptsDb.map((r) => ({
      receipt: { ...r, goodsInReceipts: undefined },
      goods: r.goodsInReceipts.map((g) => ({ ...g.goods, count: g.count })),
    }));

    return { totalAmount: totalAmount, receipts };
  }





  async expensesWeek(req: Request): Promise<{
    totalAmount: number;
    receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
  }> {
    const userId = this.getUserId(req);

    const endOfDay  = new Date();
    const startOfDay = new Date(endOfDay);
    startOfDay.setDate(endOfDay.getDate() - 7);

    /*const receipts = await this.receiptService.allReceiptsPeriod(
      req,
      oneWeekAgo,
      today,
    );
    if (!receipts || receipts.length === 0) {
      throw new NotFoundException(
        'Receipts for the specified period were not found.',
      );
    }
*/

    //const totalAmount = this.totalAmount(receipts);


    const { _sum } = await this.prisma.receipt.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: {
        sum: true,
      },
    });

    const totalAmount = _sum?.sum ?? 0;
    if (totalAmount === 0) {
      throw new NotFoundException('No receipts found week');
    }

    const receiptsDb = await this.prisma.receipt.findMany({
      where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      include: {
        goodsInReceipts: {
          include: { goods: true },
        },
      },
    });

    const receipts = receiptsDb.map((r) => ({
      receipt: { ...r, goodsInReceipts: undefined },
      goods: r.goodsInReceipts.map((g) => ({ ...g.goods, count: g.count })),
    }));

    return { totalAmount: totalAmount, receipts };
   // return { totalAmount, receipts };
  }


  async expensesMounth(req: Request): Promise<{
    totalAmount: number;
    receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
  }> {
    const userId = this.getUserId(req);

    const endOfDay  = new Date();
    const startOfDay = new Date(endOfDay);
    startOfDay.setMonth(endOfDay.getMonth() - 1);
    const receiptsDb = await this.prisma.receipt.findMany({
      where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      include: {
        goodsInReceipts: {
          include: { goods: true },
        },
      },
    });

    const { _sum } = await this.prisma.receipt.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: {
        sum: true,
      },
    });

    console.log(userId, receiptsDb);
    const totalAmount = _sum?.sum ?? 0;
    if (totalAmount === 0) {
      throw new NotFoundException('No receipts found mounth');
    }



    const receipts = receiptsDb.map((r) => ({
      receipt: { ...r, goodsInReceipts: undefined },
      goods: r.goodsInReceipts.map((g) => ({ ...g.goods, count: g.count })),
    }));

    return { totalAmount: totalAmount, receipts };
    /*const receipts = await this.receiptService.allReceiptsPeriod(
      req,
      oneMonthAgo,
      today,
    );
    if (!receipts || receipts.length === 0) {
      throw new NotFoundException(
        'Receipts for the specified period were not found.',
      );
    }

    const totalAmount = this.totalAmount(receipts);
    return { totalAmount, receipts };*/
  }
}
