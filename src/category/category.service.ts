import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client'
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<Category[] | null> {
        return await prisma.category.findMany() || [];
    }

    async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
        return this.prisma.category.create({
            data,
        });
    }

    async updateCategory(params: {
        where: Prisma.CategoryWhereUniqueInput;
        data: Prisma.CategoryUpdateInput;
    }): Promise<Category> {
        const { where, data } = params;
        return this.prisma.category.update({
            data,
            where,
        });
    }

    async deleteCategory(where: Prisma.CategoryWhereUniqueInput): Promise<Category> {
        return this.prisma.category.delete({
            where,
        });
    }

}
