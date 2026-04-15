import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Query('firstName') firstName?: string) {
    return this.dashboardService.getDashboardData(firstName);
  }

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('upcoming')
  getUpcomingEvents() {
    return this.dashboardService.getUpcomingEvents();
  }

  @Get('quick-actions')
  getQuickActions() {
    return this.dashboardService.getQuickActions();
  }

  @Get('active-trip')
  getActiveTrip() {
    return this.dashboardService.getActiveTrip();
  }
}
