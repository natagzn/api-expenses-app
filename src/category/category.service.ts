import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';

import { PrismaClient } from '@prisma/client'
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<Category[]> {
        try {
            return await this.prisma.category.findMany();
        } catch (error) {
            throw new InternalServerErrorException('Не вдалося отримати категорії');
        }
    }

    async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
        try {
            return await this.prisma.category.create({ data });
        } catch (error) {
            throw new BadRequestException('Помилка при створенні категорії');
        }
    }

    async updateCategory(params: {
        where: Prisma.CategoryWhereUniqueInput;
        data: Prisma.CategoryUpdateInput;
    }): Promise<Category> {
        const { where, data } = params;

        const existingCategory = await this.prisma.category.findUnique({ where });
        if (!existingCategory) {
            throw new NotFoundException('Категорія не знайдена');
        }

        try {
            return await this.prisma.category.update({ where, data });
        } catch (error) {
            throw new BadRequestException('Не вдалося оновити категорію');
        }
    }

    async deleteCategory(where: Prisma.CategoryWhereUniqueInput): Promise<Category> {
        const existingCategory = await this.prisma.category.findUnique({ where });
        if (!existingCategory) {
            throw new NotFoundException('Категорія не знайдена');
        }
        try {
            return await this.prisma.category.delete({ where });
        } catch (error) {
            throw new InternalServerErrorException('Не вдалося видалити категорію');
        }
    }

}
