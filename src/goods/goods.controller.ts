import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {GoodsService} from './goods.service';
import {Goods as GoodsModel} from '@prisma/client';
import {CreateGoodsDTO} from "./dto/create-goods.dto"
import {ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {GoodsResponceDTO} from "./dto/responce-goods.dto";
import {AuthGuard} from "../auth/auth.guard";

@ApiTags('Goods')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('goods')
export class GoodsController {
    constructor(private readonly goodsService: GoodsService) {}

    @Get("all")
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({
        status: 200,
        description: 'List of all products',
        type: GoodsResponceDTO,
        isArray: true,
    })
    async getAll() {
        return this.goodsService.all();
    }

    /*@Post('create')
    @ApiOperation({ summary: 'Створити новий товар' })
    @ApiBody({
           description: 'Дані для створення нового товару',
           type: CreateGoodsDTO,
           examples: {
               example1: {
                   summary: 'Приклад створення товару',
                   value: {
                       name: 'Apple',
                       price: 1.99,
                       count: 2,
                       categoryId: 1
                   }
               }
           }
       })
    @ApiResponse({
           status: 201,
           description: 'Товар успішно створено',
           type: GoodsResponceDTO,
    })
    async create(@Body() createGoodsDTO: CreateGoodsDTO):  Promise<GoodsModel> {
        return this.goodsService.create(createGoodsDTO);
    }*/

    /*@Put(":id")
    @ApiOperation({ summary: 'Оновити товар за ID' })
    @ApiParam({
        name: 'id',
        description: 'Ідентифікатор товару для оновлення',
        type: Number,
    })
    @ApiBody({
        description: 'Дані для оновлення товару',
        type: CreateGoodsDTO,
    })
    @ApiResponse({
        status: 200,
        description: 'Товар успішно оновлений',
        type: GoodsResponceDTO,
    })
    async update(@Param('id') id: bigint, @Body() createGoodsDTO: CreateGoodsDTO) {
        return this.goodsService.update({
            where: { id: Number(id) },
            data: createGoodsDTO ,
        })
    }*/


    @Delete(":id")
    @ApiOperation({ summary: 'Delete product by ID' })
    @ApiParam({
        name: 'id',
        description: 'Product ID to delete',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Product successfully deleted',
        type: GoodsResponceDTO,
    })
    async delete(@Param('id') id: bigint) {
        return this.goodsService.delete({ id: Number(id) });
    }
}
