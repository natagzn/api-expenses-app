import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {ReceiptService} from "../receipt/receipt.service";
import {Goods, Receipt} from "@prisma/client";
import {CreateGoodsDTO} from "../goods/dto/create-goods.dto";

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService,
                private receiptService: ReceiptService) {}

    async expensesPerCategory(req: Request, start: Date, end: Date): Promise<{ category: string, totalAmount: number }[]> {
        if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException('Невірно вказані дати початку або завершення');
        }
        const receipts = await this.receiptService.allReceiptsPeriod(req, start, end);
        if (!receipts || receipts.length === 0) {
            throw new NotFoundException('Чеки за вказаний період не знайдені');
        }

        const categoryAnalytics: { [key: string]: number } = {};

        try {
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

            const result = Object.keys(categoryAnalytics).map(category => ({
                category,
                totalAmount: categoryAnalytics[category],
            }));

            return result;
        } catch (error){
            throw new InternalServerErrorException('Не вдалося обробити витрати по категоріях');
        }
    }


    totalAmount(receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[]): number {
        let totalAmount = 0;
        for (const item of receipts) {
            totalAmount += item.receipt.sum;
        }
        return totalAmount;
    }


    async expensesPerPeriod(req: Request, start: Date, end: Date): Promise<{
        totalAmount: number;
        receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
    }>  {
        if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException('Невірно вказані дати початку або завершення');
        }
        const receipts = await this.receiptService.allReceiptsPeriod(req, start, end);
        if (!receipts || receipts.length === 0) {
            throw new NotFoundException('Чеки за вказаний період не знайдені');
        }

        let totalAmount = this.totalAmount(receipts);
        return {totalAmount, receipts};
    }

    async expensesToday(req: Request):  Promise<{
        totalAmount: number;
        receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
    }> {
        const currentDate = new Date();
        const receipts = await this.receiptService.allReceiptsPeriod(req, currentDate, currentDate);
        if (!receipts || receipts.length === 0) {
            throw new NotFoundException('Чеки за вказаний період не знайдені');
        }

        const totalAmount = this.totalAmount(receipts);
        return {totalAmount, receipts};
    }

    async expensesWeek(req: Request):  Promise<{
        totalAmount: number;
        receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
    }> {

        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        const receipts = await this.receiptService.allReceiptsPeriod(req, oneWeekAgo, today);
        if (!receipts || receipts.length === 0) {
            throw new NotFoundException('Чеки за вказаний період не знайдені');
        }

        let totalAmount = this.totalAmount(receipts);
        return {totalAmount, receipts};
    }

    async expensesMounth(req: Request):  Promise<{
        totalAmount: number;
        receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
    }> {
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);

        const receipts = await this.receiptService.allReceiptsPeriod(req, oneMonthAgo, today);
        if (!receipts || receipts.length === 0) {
            throw new NotFoundException('Чеки за вказаний період не знайдені');
        }

        let totalAmount = this.totalAmount(receipts);
        return {totalAmount, receipts};
    }

}
