import {Injectable, UnauthorizedException, UploadedFile} from '@nestjs/common';
import {Receipt, Prisma, PrismaClient} from "@prisma/client";
import {withAccelerate} from "@prisma/extension-accelerate";
import {PrismaService} from "../prisma/prisma.service";
import {CreateReceiptDTO} from "../receipt/dto/create-receipt.dto";
import axios from 'axios';
import {CategoryService} from "../category/category.service";
import {ShopService} from "../shop/shop.service";
import {CreateShopDTO} from "../shop/dto/create-shop.dto";
import {CreateGoodsDTO} from "../goods/dto/create-goods.dto";
import * as path from "node:path";
import * as fs from "node:fs";
import {ConfigService} from "@nestjs/config";

//const prisma = new PrismaClient().$extends(withAccelerate())

@Injectable()
export class ReceiptService {
    constructor(private prisma: PrismaService,
                private categoryService: CategoryService,
                private shopService: ShopService,
                private configService: ConfigService,) {}

    private get apiKey(): string {
        return this.configService.get<string>('OPENAI_API_KEY')??'some-key';
    }

    private getUserId(req: Request): number {
        const user = (req as any).user;
        if (!user || !user.sub) {
            throw new Error('User ID not found in the request');
        }
        const userId: number = Number(user.sub);
        return userId;
    }


    async all(req: Request): Promise<Receipt[] | null> {
        const userId = this.getUserId(req);
        return await this.prisma.receipt.findMany({
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
        });    }

    async create(data: CreateReceiptDTO, req: Request): Promise<Receipt | null> {
        const userId = this.getUserId(req);
        data.userId = userId;
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
                throw new Error('Receipt creation failed');
            }

            return createdReceipt;
        });
    }


    async analyzeReceipt(@UploadedFile() file: Express.Multer.File, req): Promise<Receipt | null> {
        try {
            const base64Image = file.buffer.toString('base64');
            const imageDataUrl = `data:${file.mimetype};base64,${base64Image}`;

            const projectRoot = path.resolve(__dirname, '..', '..'); // Вихід з dist/receipt до кореня
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

            const parsedResponse = JSON.parse(response.data.choices[0].message.content);

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
            console.error('Error analyzing receipt:', error.response ? error.response.data : error.message);
            throw new Error('Failed to process the image');
        }
    }

    async responseFormat() {
        const categories = await this.categoryService.all();
        const nameCategories = categories?categories.map((category) => category.name):[];
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
                            description: 'When can\'t parse receipt',
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
            throw new Error(`Категорію "${category}" не знайдено в базі`);
        }

        return foundCategory.id;
    }
    private async mapShopToId(shop: string): Promise<number> {
        const foundShop = await this.prisma.shop.findUnique({
            where: { name: shop },
        });

        if (!foundShop) {
           const newShop = await this.shopService.create({name: shop, address: 'address'});
           return newShop.id;
        }
        return foundShop.id;
    }




    async update(params: {
        where: Prisma.ReceiptWhereUniqueInput;
        data: Prisma.ReceiptUpdateInput;
    }, req: Request): Promise<Receipt> {
        const userId = this.getUserId(req);
        const { where, data } = params;

        const receipt = await this.prisma.receipt.findUnique({
            where,
        });

        if (!receipt || receipt.userId !== userId) {
            throw new UnauthorizedException('You are not authorized to update this receipt');
        }

        return this.prisma.receipt.update({
            data,
            where,
        });
    }

    async delete(where: Prisma.ReceiptWhereUniqueInput): Promise<Receipt> {
        await this.prisma.goodsInReceipt.deleteMany({
            where: {
                receiptId: where.id,
            },
        });

        return this.prisma.receipt.delete({
            where,
        });
    }

}
