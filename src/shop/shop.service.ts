import { Injectable, NotFoundException } from '@nestjs/common';
import { Shop, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async all(): Promise<Shop[]> {
    return await this.prisma.shop.findMany();
  }

  async create(data: Prisma.ShopCreateInput): Promise<Shop> {
    return await this.prisma.shop.create({ data });
  }

  async update(params: {
    where: Prisma.ShopWhereUniqueInput;
    data: Prisma.ShopUpdateInput;
  }): Promise<Shop> {
    const { where, data } = params;

    const existingShop = await this.prisma.shop.findUnique({ where });
    if (!existingShop) {
      throw new NotFoundException('Store not found');
    }
    return await this.prisma.shop.update({ data, where });
  }

  async delete(where: Prisma.ShopWhereUniqueInput): Promise<Shop> {
    const existingShop = await this.prisma.shop.findUnique({ where });
    if (!existingShop) {
      throw new NotFoundException('Store not found');
    }
    return await this.prisma.shop.delete({ where });
  }
}
