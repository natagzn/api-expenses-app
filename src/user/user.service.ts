import { Injectable } from '@nestjs/common';
//import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client'
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { withAccelerate } from '@prisma/extension-accelerate'
import {UpdatePasswordDTO} from "./dto/update-password.dto";

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
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
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


    async updatePassword(userId: number, dto: UpdatePasswordDTO): Promise<User> {
        const { currentPassword, newPassword, confirmNewPassword } = dto;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            throw new Error('Current password is incorrect');
        }

        if (newPassword !== confirmNewPassword) {
            throw new Error('New passwords do not match');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
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

