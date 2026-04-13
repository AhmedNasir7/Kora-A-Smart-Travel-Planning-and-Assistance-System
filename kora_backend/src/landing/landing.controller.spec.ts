import { Test, TestingModule } from '@nestjs/testing';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';

describe('LandingController', () => {
  let controller: LandingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandingController],
      providers: [LandingService],
    }).compile();

    controller = module.get<LandingController>(LandingController);
  });

  it('should return landing page payload', () => {
    const payload = controller.getLandingPageData();

    expect(payload).toHaveProperty('metadata');
    expect(payload).toHaveProperty('hero');
    expect(payload).toHaveProperty('trips');
    expect(payload).toHaveProperty('packing');
    expect(payload).toHaveProperty('timeline');
    expect(payload).toHaveProperty('footer');
  });

  it('should include trips data used by frontend cards', () => {
    const payload = controller.getLandingPageData();

    expect(Array.isArray(payload.trips.items)).toBe(true);
    expect(payload.trips.items.length).toBeGreaterThan(0);
    expect(payload.trips.items[0]).toMatchObject({
      name: expect.any(String),
      dateRange: expect.any(String),
      progress: expect.any(Number),
      tasksRemaining: expect.any(Number),
      status: expect.any(String),
      statusColor: expect.any(String),
    });
  });
});