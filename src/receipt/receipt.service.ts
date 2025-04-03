import { Injectable } from '@nestjs/common';
import {Receipt, Prisma, PrismaClient} from "@prisma/client";
import {withAccelerate} from "@prisma/extension-accelerate";
import {PrismaService} from "../prisma/prisma.service";
import {CreateReceiptDTO} from "../receipt/dto/create-receipt.dto";

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class ReceiptService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<Receipt[] | null> {
        return await prisma.receipt.findMany() || [];
    }




    async create(data: CreateReceiptDTO): Promise<Receipt | null> {
        return this.prisma.$transaction(async (prisma) => {
            const receipt = await prisma.receipt.create({
                data: {
                    img: data.img,
                    userId: data.userId,
                    categoryId: data.categoryId,
                    shopId: data.shopId,
                    sellerName: data.sellerName,
                    sellerSecondName: data.sellerSecondName,
                    createdAt: new Date(),
                },
            });

            for (const good of data.goods) {
                const existingGood = await prisma.goods.create({
                    data: {
                        name: good.name,
                        price: good.price,
                    },
                });

                await prisma.goodsInReceipt.create({
                    data: {
                        receiptId: receipt.id,
                        goodsId: existingGood.id,
                        count: good.count,
                    },
                });
            }

            const createdReceipt = await prisma.receipt.findUnique({
                where: { id: receipt.id },
                include: { goodsInReceipts: true },
            });

            if (!createdReceipt) {
                throw new Error('Receipt creation failed');
            }

            return createdReceipt;
        });
    }




    async update(params: {
        where: Prisma.ReceiptWhereUniqueInput;
        data: Prisma.ReceiptUpdateInput;
    }): Promise<Receipt> {
        const { where, data } = params;
        return this.prisma.receipt.update({
            data,
            where,
        });
    }

    async delete(where: Prisma.ReceiptWhereUniqueInput): Promise<Receipt> {
        return this.prisma.receipt.delete({
            where,
        });
    }
}
