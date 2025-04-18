import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {ShopService} from "../shop/shop.service";
import {Shop as ShopModel} from '@prisma/client';
import {CreateShopDTO} from "./dto/create-shop.dto"
import {AuthGuard} from "../auth/auth.guard";
import {ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {ShopResponseDTO} from "./dto/responce-shop.dto";

@ApiTags('Shop')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) {}


    @Get('all')
    @ApiOperation({ summary: 'Get all shops' })
    @ApiResponse({
        status: 200,
        description: 'Returns a list of all the user\'s shop',
        type: ShopResponseDTO,
        isArray: true,
    })
    async getAll() {
        return this.shopService.all();
    }

    @Post('create')
    @ApiOperation({ summary: 'Create a new shop' })
    @ApiBody({
        description: 'Дані для створення магазину',
        type: CreateShopDTO,
        examples: {
            example1: {
                summary: 'Example of creating a shop',
                value: {
                    name: 'Action',
                    location: 'Ebkeriege 5, 26389 Wilhelmshaven',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Shop created successfully',
        type: ShopResponseDTO,

    })
    async create(@Body() createShopDTO: CreateShopDTO):  Promise<ShopModel> {
        return this.shopService.create(createShopDTO);
    }

    @Put(":id")
    @ApiOperation({ summary: 'Update shop by ID' })
    @ApiParam({
        name: 'id',
        description: 'ID магазину для оновлення',
        type: Number,
        example: 2,
    })
    @ApiBody({
        description: 'New shop data',
        type: CreateShopDTO,
        examples: {
            example1: {
                summary: 'Updating shop information',
                value: {
                    name: 'Netto',
                    location: 'Peterstraße 146, 26389 Wilhelmshaven',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Shop updated successfully',
        type: ShopResponseDTO,

    })
    async update(@Param('id') id: bigint, @Body() createShopDTO: CreateShopDTO) {
        return this.shopService.update({
            where: { id: Number(id) },
            data: createShopDTO ,
        })
    }

    @ApiOperation({ summary: 'Delete shop by ID' })
    @ApiParam({
        name: 'id',
        description: 'shop ID for delete',
        type: Number,
        example: 5,
    })
    @ApiResponse({
        status: 200,
        description: 'Shop deleted successfully',
        type: ShopResponseDTO,
    })
    @Delete(":id")
    async delete(@Param('id') id: bigint) {
        return this.shopService.delete({ id: Number(id) });
    }
}
