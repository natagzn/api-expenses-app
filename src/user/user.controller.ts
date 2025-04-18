import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete, UseGuards,
} from '@nestjs/common';
import {UserService} from "./user.service";
import { User as UserModel } from '@prisma/client';
import {CreateUserDTO} from "./dto/create-user.dto";
import {UpdateUserDTO} from "./dto/update-user.dto";
import {UpdatePasswordDTO} from "./dto/update-password.dto";
import {ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "../auth/auth.guard";
import {UserResponseDTO} from "./dto/responce-user.dto";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("all")
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Retrieve all users' })
    @ApiResponse({
        status: 200,
        description: 'A list of all users',
        type: [UserResponseDTO],
    })
    async getAll() {
        return this.userService.all();
    }

    @Get(":id")
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Retrieve user by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User found',
        type: UserResponseDTO,
    })
    async getOne(@Param('id') id: bigint) {
        return this.userService.findById({ id: Number(id) });
    }

    @Post('register')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({
        description: 'User data for creation',
        type: CreateUserDTO,
        examples: {
            example: {
                summary: 'Sample user',
                value: {
                    email: 'john.doe@example.com',
                    password: 'SecurePassword123!',
                    firstName: 'John',
                    lastName: 'Doe',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'User successfully created',
        type: UserResponseDTO,
    })
    async create(@Body() createUserDTO: CreateUserDTO):  Promise<UserModel> {
        return this.userService.createUser(createUserDTO);
    }

    @Put(":id")
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update a user by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @ApiBody({ description: 'Data to update the user', type: UpdateUserDTO })
    @ApiResponse({
        status: 200,
        description: 'User successfully updated',
        type: UserResponseDTO,
    })
    async update(@Param('id') id: bigint, @Body() updateUserDTO: UpdateUserDTO) {
        return this.userService.updateUser({
            where: { id: Number(id) },
            data: updateUserDTO ,
        })
    }

    @Put(':id/password')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update user password' })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @ApiBody({
        description: 'Old and new password',
        type: UpdatePasswordDTO,
        examples: {
            example: {
                summary: 'Password update example',
                value: {
                    oldPassword: 'OldPass123!',
                    newPassword: 'NewPass456!',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Password successfully updated',
    })
    async updatePassword(@Param('id') id: number, @Body() updatePasswordDTO: UpdatePasswordDTO,) {
        return this.userService.updatePassword(Number(id), updatePasswordDTO);
    }


    @Delete(":id")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User successfully deleted',
        type: UserResponseDTO,
    })
    async delete(@Param('id') id: bigint) {
        return this.userService.deleteUser({ id: Number(id) });
    }
}
