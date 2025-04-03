import {IsDate, IsNumber, IsString} from 'class-validator';


export class CreateReceiptDTO {
    @IsString()
    img: string;

    @IsNumber()
    userId: number;

    @IsNumber()
    categoryId: number;

    @IsNumber()
    shopId: number;

    @IsString()
    seller_name: string;

    @IsString()
    seller_surname: string;

    @IsDate()
    dateOfPurchase: Date;
}
