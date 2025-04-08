import { Injectable } from '@nestjs/common';
import {Shop, Prisma, PrismaClient} from "@prisma/client";
import {withAccelerate} from "@prisma/extension-accelerate";
import {PrismaService} from "../prisma/prisma.service";

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<Shop[] | null> {
        return await prisma.shop.findMany() || [];
    }

    async create(data: Prisma.ShopCreateInput): Promise<Shop> {
        return this.prisma.shop.create({
            data,
        });
    }

    async update(params: {
        where: Prisma.ShopWhereUniqueInput;
        data: Prisma.ShopUpdateInput;
    }): Promise<Shop> {
        const { where, data } = params;
        return this.prisma.shop.update({
            data,
            where,
        });
    }

    async delete(where: Prisma.ShopWhereUniqueInput): Promise<Shop> {
        return this.prisma.shop.delete({
            where,
        });
    }
}
