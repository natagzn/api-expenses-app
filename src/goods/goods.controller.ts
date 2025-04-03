import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {GoodsService} from './goods.service';
import {Goods as GoodsModel} from '@prisma/client';
import {CreateGoodsDTO} from "./dto/create-goods.dto"


@Controller('goods')
export class GoodsController {
    constructor(private readonly goodsService: GoodsService) {}

    @Get("all")
    async getAll() {
        return this.goodsService.all();
    }

    /*@Post('create')
    async create(@Body() createGoodsDTO: CreateGoodsDTO):  Promise<GoodsModel> {
        return this.goodsService.createGoods(createGoodsDTO);
    }*/
    /*@Put(":id")
    async update(@Param('id') id: bigint, @Body() createGoodsDTO: CreateGoodsDTO) {
        return this.goodsService.updateGoods({
            where: { id: Number(id) },
            data: createGoodsDTO ,
        })
    }*/

    @Delete(":id")
    async delete(@Param('id') id: bigint) {
        return this.goodsService.delete({ id: Number(id) });
    }
}
