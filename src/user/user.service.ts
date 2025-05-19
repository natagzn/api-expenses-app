import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
//import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { UpdatePasswordDTO } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async all(): Promise<User[] | null> {
    return (await this.prisma.user.findMany()) || [];
  }

  async findById(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
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

    const existingUser = await this.prisma.user.findUnique({
      where,
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      data,
      where,
    });
  }

  async updatePassword(userId: number, dto: UpdatePasswordDTO): Promise<User> {
    const { currentPassword, newPassword, confirmNewPassword } = dto;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!passwordMatch) {
        throw new Error('Current password    try {is incorrect');
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.delete({
      where,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOne(email: string): Promise<User | undefined> {
    const user = await this.all().then((users) =>
      users?.find((user) => user.email === email),
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
