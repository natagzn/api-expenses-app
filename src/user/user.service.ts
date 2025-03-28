import { Injectable } from '@nestjs/common';
//import { User } from './interfaces/user.interface';

import { PrismaClient } from '@prisma/client'
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async all(): Promise<User[] | null> {
        return await prisma.user.findMany() || [];
    }

    async findById(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
        });
    }
    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        return this.prisma.user.update({
            data,
            where,
        });
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where,
        });
    }

    async findOne(email: string): Promise<User | undefined> {
        return this.all().then(users => users?.find(user => user.email === email));
    }

}

