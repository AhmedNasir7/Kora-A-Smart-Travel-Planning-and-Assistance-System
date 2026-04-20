import { Controller, Get, Headers, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @Query('firstName') firstName?: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.dashboardService.getDashboardData(firstName, requestUserId);
  }
}
