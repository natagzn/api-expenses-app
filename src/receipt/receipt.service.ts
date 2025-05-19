import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UploadedFile,
} from '@nestjs/common';
import { Receipt, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDTO } from '../receipt/dto/create-receipt.dto';
import axios from 'axios';
import { CategoryService } from '../category/category.service';
import { ShopService } from '../shop/shop.service';
import { CreateGoodsDTO } from '../goods/dto/create-goods.dto';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService,
    private shopService: ShopService,
    private configService: ConfigService,
  ) {}

  private get apiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY') ?? 'some-key';
  }

  private getUserId(req: Request): number {
    const user = (req as any).user;
    if (!user || !user.sub) {
      throw new Error('User ID not found in the request');
    }
    const userId: number = Number(user.sub);
    return userId;
  }

  async all(req: Request): Promise<Receipt[]> {
    const userId = this.getUserId(req);

    const receipts = await this.prisma.receipt.findMany({
      where: {
        userId: userId,
      },
      include: {
        goodsInReceipts: {
          include: {
            goods: true,
          },
        },
      },
    });

    return receipts;
  }

  async allReceiptsPeriod(
    req: Request,
    start: Date,
    end: Date,
  ): Promise<{ receipt: Receipt; goods: CreateGoodsDTO[] }[]> {
    const userId = this.getUserId(req);

    if (!start || !end) {
      throw new BadRequestException(
        'It is necessary to provide correct start and end dates for the period',
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    if (startDate > endDate) {
      throw new BadRequestException(
        'The start date cannot be later than the end date.',
      );
    }

    const receipts = await this.prisma.receipt.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        goodsInReceipts: {
          include: {
            goods: true,
          },
        },
      },
    });

    const result = receipts.map((receipt) => {
      const goodsWithCount = receipt.goodsInReceipts.map((item) => ({
        ...item.goods,
        count: item.count,
      }));

      return {
        receipt: {
          ...receipt,
          goodsInReceipts: undefined,
        },
        goods: goodsWithCount,
      };
    });

    return result;
  }

  async allReceiptsPerCategory(
    req: Request,
    category: string,
  ): Promise<{ receipt: Receipt; goods: CreateGoodsDTO[] }[]> {
    const userId = this.getUserId(req);
    if (!category) {
      throw new BadRequestException('Category required');
    }

    const categoryId = await this.mapCategoryToId(category);

    const receipts = await this.prisma.receipt.findMany({
      where: {
        userId,
        goodsInReceipts: {
          some: {
            goods: {
              categoryId,
            },
          },
        },
      },
      include: {
        goodsInReceipts: {
          include: {
            goods: true,
          },
        },
      },
    });

    const result = receipts.map((receipt) => {
      const goodsWithCount = receipt.goodsInReceipts
        .filter((item) => item.goods.categoryId === categoryId)
        .map((item) => ({
          ...item.goods,
          count: item.count,
        }));

      return {
        receipt: {
          ...receipt,
          goodsInReceipts: undefined,
        },
        goods: goodsWithCount,
      };
    });

    return result;
  }

  async search(req: Request, query: string): Promise<any[]> {
    const userId = this.getUserId(req);
    const lowerQuery = query?.toLowerCase().trim() || '';

    if (!lowerQuery) {
      throw new BadRequestException('Search query cannot be empty');
    }

    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
      include: {
        shop: true,
        goodsInReceipts: {
          include: {
            goods: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const filteredReceipts = receipts.filter((receipt, i) => {
      const shopName = receipt.shop?.name?.toLowerCase() || '';
      const shopMatches = shopName.includes(lowerQuery);

      let goodsMatch = false;

      for (let j = 0; j < receipt.goodsInReceipts.length; j++) {
        const good = receipt.goodsInReceipts[j].goods;
        const goodName = good.name?.toLowerCase() || '';
        const categoryName = good.category?.name?.toLowerCase() || '';

        const goodMatches = goodName.includes(lowerQuery);
        const categoryMatches = categoryName.includes(lowerQuery);

        if (goodMatches || categoryMatches) {
          goodsMatch = true;
        }
      }

      const includeReceipt = shopMatches || goodsMatch;
      return includeReceipt;
    });

    return filteredReceipts;
  }

  async create(data: CreateReceiptDTO, req: Request): Promise<Receipt | null> {
    const userId = this.getUserId(req);
    if (!data.goods || data.goods.length === 0) {
      throw new BadRequestException(
        'Необхідно додати хоча б один товар до чеку',
      );
    }
    data.userId = userId;

    try {
      return this.prisma.$transaction(async (prisma) => {
        const receipt = await prisma.receipt.create({
          data: {
            img: data.img,
            userId: data.userId,
            shopId: data.shopId,
            sellerName: data.sellerName,
            sellerSecondName: data.sellerSecondName,
            sum: 0,
            createdAt: new Date(),
          },
        });

        let totalSum = 0;

        for (const good of data.goods) {
          if (
            !good.name ||
            !good.price ||
            !good.categoryId ||
            good.count <= 0
          ) {
            throw new BadRequestException(
              `Некоректні дані товару: ${JSON.stringify(good)}`,
            );
          }
          const existingGood = await prisma.goods.create({
            data: {
              name: good.name,
              price: good.price,
              categoryId: good.categoryId,
            },
          });

          await prisma.goodsInReceipt.create({
            data: {
              receiptId: receipt.id,
              goodsId: existingGood.id,
              count: good.count,
            },
          });
          totalSum += good.price * good.count;
        }
        await prisma.receipt.update({
          where: { id: receipt.id },
          data: { sum: totalSum },
        });

        const createdReceipt = await prisma.receipt.findUnique({
          where: { id: receipt.id },
          include: { goodsInReceipts: true },
        });
        if (!createdReceipt) {
          throw new InternalServerErrorException(
            'Unable to retrieve created receipt',
          );
        }
        return createdReceipt;
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the receipt.',
      );
    }
  }

  async analyzeReceipt(
    @UploadedFile() file: Express.Multer.File,
    req,
  ): Promise<Receipt | null> {
    try {
      const base64Image = file.buffer.toString('base64');
      const imageDataUrl = `data:${file.mimetype};base64,${base64Image}`;

      const projectRoot = path.resolve(__dirname, '..', '..');
      const uploadPath = path.join(projectRoot, 'uploads', file.originalname);

      const uploadDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(uploadPath, file.buffer);

      const messages = [
        { type: 'text', text: 'Parse details from the receipt' },
        {
          type: 'image_url',
          image_url: { url: imageDataUrl },
        },
      ];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: messages }],
          response_format: await this.responseFormat(),
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const parsedResponse = JSON.parse(
        response.data.choices[0].message.content,
      );

      if (!parsedResponse || !parsedResponse.receipt) {
        throw new InternalServerErrorException('Failed to parse receipt data');
      }

      const goods: CreateGoodsDTO[] = [];
      for (const item of parsedResponse.receipt.expenses_attributes) {
        const categoryId = await this.mapCategoryToId(item.category);
        goods.push({
          name: item.name,
          price: item.amount,
          count: 1,
          categoryId: categoryId,
        });
      }

      const userId = this.getUserId(req);
      const receiptData: CreateReceiptDTO = {
        img: uploadPath,
        userId: userId,
        shopId: await this.mapShopToId(parsedResponse.receipt.merchant),
        sellerName: '',
        sellerSecondName: '',
        dateOfPurchase: parsedResponse.purchased_at,
        sum: 0,
        goods: goods,
      };

      return this.create(receiptData, req);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Не вдалося обробити зображення чеку',
      );
    }
  }

  async responseFormat() {
    const categories = await this.categoryService.all();
    const nameCategories = categories
      ? categories.map((category) => category.name)
      : [];
    return {
      type: 'json_schema',
      json_schema: {
        name: 'Receipt',
        schema: {
          type: 'object',
          properties: {
            receipt: {
              type: 'object',
              properties: {
                expenses_attributes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      amount: { type: 'number', description: 'Double' },
                      category: { type: 'string', enum: nameCategories },
                    },
                    required: ['name', 'amount', 'category'],
                    additionalProperties: false,
                  },
                },
                merchant: { type: 'string' },
                purchased_at: { type: 'string', description: 'In ISO 8601' },
              },
              required: ['expenses_attributes', 'merchant', 'purchased_at'],
              additionalProperties: false,
            },
            error: {
              type: ['string', 'null'],
              description: "When can't parse receipt",
            },
          },
          additionalProperties: false,
          required: ['receipt', 'error'],
        },
        strict: true,
      },
    };
  }
  private async mapCategoryToId(category: string): Promise<number> {
    const foundCategory = await this.prisma.category.findUnique({
      where: { name: category },
    });

    if (!foundCategory) {
      throw new Error(`Category "${category}" not found in the database.`);
    }

    return foundCategory.id;
  }
  private async mapShopToId(shop: string): Promise<number> {
    const foundShop = await this.prisma.shop.findUnique({
      where: { name: shop },
    });

    if (!foundShop) {
      const newShop = await this.shopService.create({
        name: shop,
        address: 'address',
      });
      return newShop.id;
    }
    return foundShop.id;
  }

  async update(
    params: {
      where: Prisma.ReceiptWhereUniqueInput;
      data: Prisma.ReceiptUpdateInput;
    },
    req: Request,
  ): Promise<Receipt> {
    const userId = this.getUserId(req);
    const { where, data } = params;

    const receipt = await this.prisma.receipt.findUnique({
      where,
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }
    if (receipt.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this receipt.',
      );
    }

    return await this.prisma.receipt.update({
      data,
      where,
    });
  }

  async delete(
    where: Prisma.ReceiptWhereUniqueInput,
    req: Request,
  ): Promise<Receipt> {
    const userId = this.getUserId(req);

    const receipt = await this.prisma.receipt.findUnique({
      where,
    });
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }
    if (receipt.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to delete this receipt.',
      );
    }
    await this.prisma.goodsInReceipt.deleteMany({
      where: {
        receiptId: where.id,
      },
    });
    return await this.prisma.receipt.delete({
      where,
    });
  }
}
