import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {ReceiptService} from "./receipt.service";
import {CreateReceiptDTO} from "../receipt/dto/create-receipt.dto";
import {Receipt as ReceiptModel} from ".prisma/client";


import { ApiBearerAuth,} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('receipt')
export class ReceiptController {
    constructor(private readonly receiptService: ReceiptService) {}

    @Get("all")
    async getAll() {
        return this.receiptService.all();
    }

    @Post('create')
    async create(@Body() createReceiptDTO: CreateReceiptDTO):  Promise<ReceiptModel | null> {
        return this.receiptService.create(createReceiptDTO);
    }

    @Put(":id")
    async update(@Param('id') id: bigint, @Body() createReceiptDTO: CreateReceiptDTO) {
        return this.receiptService.update({
            where: { id: Number(id) },
            data: createReceiptDTO ,
        })
    }

    @Delete(":id")
    async delete(@Param('id') id: bigint) {
        return this.receiptService.delete({ id: Number(id) });
    }
}
