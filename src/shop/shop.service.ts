import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {Shop, Prisma, PrismaClient} from "@prisma/client";
import {withAccelerate} from "@prisma/extension-accelerate";
import {PrismaService} from "../prisma/prisma.service";

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<Shop[]> {
        try {
            return await this.prisma.shop.findMany();
        } catch (error) {
            throw new InternalServerErrorException('Не вдалося отримати список магазинів');
        }
    }

    async create(data: Prisma.ShopCreateInput): Promise<Shop> {
        try {
            return await this.prisma.shop.create({ data });
        } catch (error) {
            throw new BadRequestException('Не вдалося створити магазин. Перевірте вхідні дані');
        }
    }

    async update(params: {
        where: Prisma.ShopWhereUniqueInput;
        data: Prisma.ShopUpdateInput;
    }): Promise<Shop> {
        const { where, data } = params;

        const existingShop = await this.prisma.shop.findUnique({ where });
        if (!existingShop) {
            throw new NotFoundException('Магазин не знайдено');
        }
        try {
            return await this.prisma.shop.update({ data, where });
        } catch (error) {
            throw new BadRequestException('Не вдалося оновити магазин');
        }
    }

    async delete(where: Prisma.ShopWhereUniqueInput): Promise<Shop> {
        const existingShop = await this.prisma.shop.findUnique({ where });
        if (!existingShop) {
            throw new NotFoundException('Магазин не знайдено');
        }
        try {
            return await this.prisma.shop.delete({ where });
        } catch (error) {
            throw new InternalServerErrorException('Не вдалося видалити магазин');
        }
    }
}
