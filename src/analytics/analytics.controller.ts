import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AnalyticsResponseDTO } from './dto/responce-per-period.dto';
import { CategoryAmountDTO } from './dto/responce-per-category.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('expenses-per-category')
  @ApiOperation({ summary: 'Get expenses per category for a date range' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date in ISO format (yyyy-MM-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date in ISO format (yyyy-MM-dd)',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses grouped by category for the given date range',
    type: [CategoryAmountDTO],
  })
  async getAll(
    @Req() req: Request,
    @Query('startDate') startDateStr: Date,
    @Query('endDate') endDateStr: Date,
  ) {
    return this.analyticsService.expensesPerCategory(
      req,
      startDateStr,
      endDateStr,
    );
  }

  @Get('expenses-per-period')
  @ApiOperation({
    summary:
      'Get expenses per period (e.g. daily, weekly, monthly) for a date range',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date in format (yyyy-MM-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date in format (yyyy-MM-dd)',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses per period for the given date range',
    type: AnalyticsResponseDTO,
  })
  async getAllPeriod(
    @Req() req: Request,
    @Query('startDate') startDateStr: Date,
    @Query('endDate') endDateStr: Date,
  ) {
    return this.analyticsService.expensesPerPeriod(
      req,
      startDateStr,
      endDateStr,
    );
  }

  @Get('expenses-today')
  @ApiOperation({ summary: 'Get total expenses for today' })
  @ApiResponse({
    status: 200,
    description: 'Total expenses for today',
    type: AnalyticsResponseDTO,
  })
  async getReceiptsToday(@Req() req: Request) {
    return this.analyticsService.expensesToday(req);
  }

  @Get('expenses-per-week')
  @ApiOperation({ summary: 'Get total expenses for this week' })
  @ApiResponse({
    status: 200,
    description: 'Total expenses for this week',
    type: AnalyticsResponseDTO,
  })
  async getReceiptsPerWeek(@Req() req: Request) {
    return this.analyticsService.expensesWeek(req);
  }

  @Get('expenses-per-mounth')
  @ApiOperation({ summary: 'Get total expenses for this month' })
  @ApiResponse({
    status: 200,
    description: 'Total expenses for this month',
    type: AnalyticsResponseDTO,
  })
  async getReceiptsPerMounth(@Req() req: Request) {
    return this.analyticsService.expensesMounth(req);
  }
}
