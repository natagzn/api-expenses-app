import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category as CategoryModel } from '@prisma/client';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { CategoryResponseDTO } from './dto/response-category.dto';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Category')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all categories',
    type: CategoryResponseDTO,
    isArray: true,
  })
  async getAll() {
    return this.categoryService.all();
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDTO,
  })
  @ApiBody({ type: CreateCategoryDTO })
  async create(
    @Body() createCategoryDTO: CreateCategoryDTO,
  ): Promise<CategoryModel> {
    return this.categoryService.createCategory(createCategoryDTO);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID to update',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDTO,
  })
  @ApiBody({ type: CreateCategoryDTO })
  async update(
    @Param('id') id: bigint,
    @Body() createCategoryDTO: CreateCategoryDTO,
  ) {
    return this.categoryService.updateCategory({
      where: { id: Number(id) },
      data: createCategoryDTO,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID to delete',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Category successfully deleted',
    type: CategoryResponseDTO,
  })
  async delete(@Param('id') id: bigint) {
    return this.categoryService.deleteCategory({ id: Number(id) });
  }
}
