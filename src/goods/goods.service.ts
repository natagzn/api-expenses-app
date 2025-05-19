import { Injectable, NotFoundException } from '@nestjs/common';
import { Goods, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoodsService {
  constructor(private prisma: PrismaService) {}

  async all(): Promise<Goods[]> {
    return await this.prisma.goods.findMany();
  }

  async create(data: Prisma.GoodsCreateInput): Promise<Goods> {
    return await this.prisma.goods.create({ data });
  }
  async update(params: {
    where: Prisma.GoodsWhereUniqueInput;
    data: Prisma.GoodsUpdateInput;
  }): Promise<Goods> {
    const { where, data } = params;

    const existingGoods = await this.prisma.goods.findUnique({ where });
    if (!existingGoods) {
      throw new NotFoundException('Product not found');
    }

    return await this.prisma.goods.update({ where, data });
  }

  async delete(where: Prisma.GoodsWhereUniqueInput): Promise<Goods> {
    const existingGoods = await this.prisma.goods.findUnique({ where });
    if (!existingGoods) {
      throw new NotFoundException('Product not found');
    }

    return await this.prisma.goods.delete({ where });
  }
}
