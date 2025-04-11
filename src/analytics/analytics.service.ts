import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {ReceiptService} from "../receipt/receipt.service";
import {Goods, Receipt} from "@prisma/client";
import {CreateGoodsDTO} from "../goods/dto/create-goods.dto";

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService,
                private receiptService: ReceiptService) {}

    async expensesPerCategory(req: Request, start: Date, end: Date): Promise<{ category: string, totalAmount: number }[]> {
        const receipts = await this.receiptService.allReceiptsPeriod(req, start, end);
        if (!receipts) {
            return [];
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

        const result = Object.keys(categoryAnalytics).map(category => ({
            category,
            totalAmount: categoryAnalytics[category],
        }));

        return result;
    }

    async expensesPerPeriod(req: Request, start: Date, end: Date): Promise<{
        totalAmount: number;
        receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
    }>  {
        const receipts = await this.receiptService.allReceiptsPeriod(req, start, end);
        if (!receipts) {
            return {
                totalAmount: 0,
                receipts: [],
            };
        }

        let totalAmount = 0;
        for (const receipt of receipts) {
            totalAmount += receipt.receipt.sum;
        }
        return {totalAmount, receipts};
    }

    async expensesToday(req: Request):  Promise<{
        totalAmount: number;
        receipts: { receipt: Receipt; goods: CreateGoodsDTO[] }[];
    }> {
        const currentDate = new Date();
        const receipts = await this.receiptService.allReceiptsPeriod(req, currentDate, currentDate);
        if (!receipts) {
            return {
                totalAmount: 0,
                receipts: [],
            };
        }

        let totalAmount = 0;
        for (const receipt of receipts) {
            totalAmount += receipt.receipt.sum;
        }

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
        if (!receipts) {
            return {
                totalAmount: 0,
                receipts: [],
            };
        }

        let totalAmount = 0;
        for (const receipt of receipts) {
            totalAmount += receipt.receipt.sum;
        }
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
        if (!receipts) {
            return {
                totalAmount: 0,
                receipts: [],
            };
        }

        let totalAmount = 0;
        for (const receipt of receipts) {
            totalAmount += receipt.receipt.sum;
        }

        return {totalAmount, receipts};
    }

}
