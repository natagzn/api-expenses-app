import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put, Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {ReceiptService} from "./receipt.service";
import {CreateReceiptDTO} from "../receipt/dto/create-receipt.dto";
import {Receipt as ReceiptModel} from ".prisma/client";


import { ApiBearerAuth,} from '@nestjs/swagger';
import {FileInterceptor} from "@nestjs/platform-express";
import {AuthGuard} from "../auth/auth.guard";

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('receipt')
export class ReceiptController {
    constructor(private readonly receiptService: ReceiptService) {}


    @Get("all")
    async getAll(@Req() req: Request) {
        return this.receiptService.all(req);
    }

    ////
    @Get("all-per-categories")
    async getAllPerCategories(@Req() req: Request) {
        return this.receiptService.receiptsGroupedByCategory(req);
    }

    ////
    @Get("all-per-category")
    async getAllPerCategory(@Req() req: Request, @Query() category: string) {
        return this.receiptService.allReceiptsPerCategory(req, category);
    }

    @Get("search")
    async searh(@Req() req: Request, @Query('searchText') searchText: string) {
        return this.receiptService.search(req, searchText);
    }

    @Post('create')
    async create(@Body() createReceiptDTO: CreateReceiptDTO, @Req() req: Request):  Promise<ReceiptModel | null> {
        return this.receiptService.create(createReceiptDTO, req);
    }

    @Post('photo')
    @UseInterceptors(FileInterceptor('file'))
    async analyzeReceipt(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        return this.receiptService.analyzeReceipt(file, req);
    }

    @Put(":id")
    async update(@Param('id') id: bigint, @Body() createReceiptDTO: CreateReceiptDTO, @Req() req: Request) {
        return this.receiptService.update({
            where: { id: Number(id) },
            data: createReceiptDTO ,
        }, req)
    }

    @Delete(":id")
    async delete(@Param('id') id: bigint, @Req() req: Request) {
        return this.receiptService.delete({ id: Number(id) }, req);
    }
}
