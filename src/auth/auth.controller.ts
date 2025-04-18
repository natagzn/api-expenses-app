
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {ApiBody, ApiResponse, ApiTags} from "@nestjs/swagger";
import {SignInDTO} from "./dto/sign-in.dto";

@ApiTags('User')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiBody({
        description: 'Дані для входу (електронна пошта та пароль)',
        type: SignInDTO,
        examples: {
            example1: {
                summary: 'Приклад запиту для входу',
                value: {
                    email: 'user@example.com',
                    password: 'password123',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Успішний вхід',
        type: String,
    })
    @ApiResponse({
        status: 401,
        description: 'Невірні облікові дані',
    })
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }
}
