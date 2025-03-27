import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
} from '@nestjs/common';
import {UserService} from "./user.service";
import { User as UserModel } from '@prisma/client';
import {CreateUserDTO} from "./dto/create-user.dto";


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("all")
    async getAll() {
        return this.userService.all();
    }

    /*@Get(":id")
    async getOne(@Param('id') id: bigint) {
        return this.userService.findById({ id: Number(id) });
    }*/

    @Post('create')
    async create(@Body() createUserDTO: CreateUserDTO):  Promise<UserModel> {
        return this.userService.createUser(createUserDTO);
    }

    @Put(":id")
    async update(@Param('id') id: bigint, @Body() createUserDTO: CreateUserDTO) {
        return this.userService.updateUser({
            where: { id: Number(id) },
            data: createUserDTO ,
        })
    }

    @Delete(":id")
    async delete(@Param('id') id: bigint) {
        return this.userService.deleteUser({ id: Number(id) });
    }
}
