import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDTO } from '../receipt/dto/create-receipt.dto';
import { Receipt as ReceiptModel } from '.prisma/client';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { ReceiptResponseDTO } from './dto/responce-receipt.dto';
import { ReceiptWithGoodsResponse } from './dto/responce-receipts.dto';

@ApiTags('Receipts')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all receipts of the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of receipts',
    type: [ReceiptResponseDTO],
  })
  async getAll(@Req() req: Request) {
    return this.receiptService.all(req);
  }

  @Get('all-per-category')
  @ApiOperation({ summary: 'Get receipts by a specific category' })
  @ApiQuery({
    name: 'category',
    type: String,
    description: 'Category name',
  })
  @ApiResponse({
    status: 200,
    description: 'Receipts from selected category',
    type: [ReceiptWithGoodsResponse],
  })
  async getAllPerCategory(
    @Req() req: Request,
    @Query('category') category: string,
  ) {
    return this.receiptService.allReceiptsPerCategory(req, category);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search receipts by text (shop, goods, category)' })
  @ApiQuery({
    name: 'searchText',
    type: String,
    description: 'Search term',
  })
  @ApiResponse({
    status: 200,
    description: 'List of receipts',
    type: [ReceiptResponseDTO],
  })
  async searh(@Req() req: Request, @Query('searchText') searchText: string) {
    return this.receiptService.search(req, searchText);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new receipt manually' })
  @ApiBody({
    description: 'Receipt data to be created',
    type: CreateReceiptDTO,
    examples: {
      example: {
        summary: 'Create sample receipt',
        value: {
          date: '2024-04-15T12:00:00.000Z',
          shopId: 1,
          goods: [
            { name: 'Milk', price: 2.5, categoryId: 1 },
            { name: 'Bread', price: 1.2, categoryId: 2 },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Receipt created',
    type: ReceiptResponseDTO,
  })
  async create(
    @Body() createReceiptDTO: CreateReceiptDTO,
    @Req() req: Request,
  ): Promise<ReceiptModel | null> {
    return this.receiptService.create(createReceiptDTO, req);
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and analyze receipt image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image of the receipt (jpg/png)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Analyzed and created receipt',
    type: ReceiptResponseDTO,
  })
  @UseInterceptors(FileInterceptor('file'))
  async analyzeReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.receiptService.analyzeReceipt(file, req);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a receipt by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Receipt ID',
  })
  @ApiBody({
    description: 'Updated receipt data',
    type: CreateReceiptDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Updated receipt',
    type: ReceiptResponseDTO,
  })
  async update(
    @Param('id') id: bigint,
    @Body() createReceiptDTO: CreateReceiptDTO,
    @Req() req: Request,
  ) {
    return this.receiptService.update(
      {
        where: { id: Number(id) },
        data: createReceiptDTO,
      },
      req,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a receipt by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Receipt ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Receipt deleted successfully',
  })
  async delete(@Param('id') id: bigint, @Req() req: Request) {
    return this.receiptService.delete({ id: Number(id) }, req);
  }
}
