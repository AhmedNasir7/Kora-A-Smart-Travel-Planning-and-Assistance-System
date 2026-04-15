import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [DashboardService],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should return full dashboard data', () => {
    const response = controller.getDashboard();
    expect(response).toHaveProperty('stats');
    expect(response).toHaveProperty('upcomingEvents');
    expect(response).toHaveProperty('quickActions');
    expect(response).toHaveProperty('activeTrip');
  });

  it('should return stats', () => {
    const stats = controller.getStats();
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty('label');
    expect(stats[0]).toHaveProperty('value');
  });
});
