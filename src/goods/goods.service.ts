import { Injectable } from '@nestjs/common';
import {Goods, Prisma, PrismaClient} from "@prisma/client";
import {withAccelerate} from "@prisma/extension-accelerate";
import {PrismaService} from "../prisma/prisma.service";

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class GoodsService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<Goods[] | null> {
        return await prisma.goods.findMany() || [];
    }

    async create(data: Prisma.GoodsCreateInput): Promise<Goods> {
        return this.prisma.goods.create({
            data,
        });
    }

    async update(params: {
        where: Prisma.GoodsWhereUniqueInput;
        data: Prisma.GoodsUpdateInput;
    }): Promise<Goods> {
        const { where, data } = params;
        return this.prisma.goods.update({
            data,
            where,
        });
    }

    async delete(where: Prisma.GoodsWhereUniqueInput): Promise<Goods> {
        return this.prisma.goods.delete({
            where,
        });
    }
}
