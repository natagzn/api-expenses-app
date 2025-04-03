import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {ShopService} from "../shop/shop.service";
import {Shop as ShopModel} from '@prisma/client';
import {CreateShopDTO} from "./dto/create-shop.dto"



@Controller('shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) {}


    @Get("all")
    async getAll() {
        return this.shopService.all();
    }

    @Post('create')
    async create(@Body() createShopDTO: CreateShopDTO):  Promise<ShopModel> {
        return this.shopService.create(createShopDTO);
    }

    @Put(":id")
    async update(@Param('id') id: bigint, @Body() createShopDTO: CreateShopDTO) {
        return this.shopService.update({
            where: { id: Number(id) },
            data: createShopDTO ,
        })
    }

    @Delete(":id")
    async delete(@Param('id') id: bigint) {
        return this.shopService.delete({ id: Number(id) });
    }
}
