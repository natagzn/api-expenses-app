import {Body, Controller, Get, Query, Req, UseGuards} from '@nestjs/common';
import {AnalyticsService} from "./analytics.service";
import {AuthGuard} from "../auth/auth.guard";

@UseGuards(AuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get("expenses-per-category")
    async getAll(@Req() req: Request, @Query('startDate') startDateStr: Date, @Query('endDate') endDateStr: Date, ) {
        return this.analyticsService.expensesPerCategory(req, startDateStr, endDateStr);
    }

    @Get("expenses-per-period")
    async getAllPeriod(@Req() req: Request, @Query('startDate') startDateStr: Date, @Query('endDate') endDateStr: Date, ) {
        return this.analyticsService.expensesPerPeriod(req, startDateStr, endDateStr);
    }

    //////
    @Get("expenses-today")
    async getReceiptsToday(@Req() req: Request)  {
        return this.analyticsService.expensesToday(req);
    }

    @Get("expenses-per-week")
    async getReceiptsPerWeek(@Req() req: Request)  {
        return this.analyticsService.expensesWeek(req);
    }

    @Get("expenses-per-mounth")
    async getReceiptsPerMounth(@Req() req: Request)  {
        return this.analyticsService.expensesMounth(req);
    }




}
