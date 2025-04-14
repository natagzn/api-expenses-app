import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {Goods, Prisma, PrismaClient} from "@prisma/client";
import {withAccelerate} from "@prisma/extension-accelerate";
import {PrismaService} from "../prisma/prisma.service";

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class GoodsService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<Goods[]> {
        try {
            return await this.prisma.goods.findMany();
        } catch (error) {
            throw new InternalServerErrorException('Не вдалося отримати список товарів');
        }
    }

    async create(data: Prisma.GoodsCreateInput): Promise<Goods> {
        try {
            return await this.prisma.goods.create({ data });
        } catch (error) {
            throw new BadRequestException('Не вдалося створити товар. Перевірте вхідні дані');
        }
    }


    async update(params: {
        where: Prisma.GoodsWhereUniqueInput;
        data: Prisma.GoodsUpdateInput;
    }): Promise<Goods> {
        const { where, data } = params;

        const existingGoods = await this.prisma.goods.findUnique({ where });
        if (!existingGoods) {
            throw new NotFoundException('Товар не знайдено');
        }

        try {
            return await this.prisma.goods.update({ where, data });
        } catch (error) {
            throw new BadRequestException('Не вдалося оновити товар');
        }
    }

    async delete(where: Prisma.GoodsWhereUniqueInput): Promise<Goods> {
        const existingGoods = await this.prisma.goods.findUnique({ where });
        if (!existingGoods) {
            throw new NotFoundException('Товар не знайдено');
        }

        try {
            return await this.prisma.goods.delete({ where });
        } catch (error) {
            throw new InternalServerErrorException('Не вдалося видалити товар');
        }
    }
}
