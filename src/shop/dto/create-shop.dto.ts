import { IsString } from 'class-validator';

export class CreateShopDTO {
  @IsString()
  name: string;

  @IsString()
  address: string;
}
