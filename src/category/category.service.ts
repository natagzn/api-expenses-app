import { Injectable, NotFoundException } from '@nestjs/common';

import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async all(): Promise<Category[]> {
    return await this.prisma.category.findMany();
  }

  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    return await this.prisma.category.create({ data });
  }

  async updateCategory(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: Prisma.CategoryUpdateInput;
  }): Promise<Category> {
    const { where, data } = params;

    const existingCategory = await this.prisma.category.findUnique({ where });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
    return await this.prisma.category.update({ where, data });
  }

  async deleteCategory(
    where: Prisma.CategoryWhereUniqueInput,
  ): Promise<Category> {
    const existingCategory = await this.prisma.category.findUnique({ where });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
    return await this.prisma.category.delete({ where });
  }
}
