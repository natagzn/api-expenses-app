import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
} from '@nestjs/common';
import {CategoryService} from "./category.service";
import { Category as CategoryModel } from '@prisma/client';
import {CreateCategoryDTO} from "./dto/create-category.dto";

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}


    @Get("all")
    async getAll() {
        return this.categoryService.all();
    }

    @Post('create')
    async create(@Body() createCategoryDTO: CreateCategoryDTO):  Promise<CategoryModel> {
        return this.categoryService.createCategory(createCategoryDTO);
    }

    @Put(":id")
    async update(@Param('id') id: bigint, @Body() createCategoryDTO: CreateCategoryDTO) {
        return this.categoryService.updateCategory({
            where: { id: Number(id) },
            data: createCategoryDTO ,
        })
    }

    @Delete(":id")
    async delete(@Param('id') id: bigint) {
        return this.categoryService.deleteCategory({ id: Number(id) });
    }
}
