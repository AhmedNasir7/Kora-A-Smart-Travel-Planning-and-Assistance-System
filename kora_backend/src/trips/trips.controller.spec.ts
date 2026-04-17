import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

describe('TripsController', () => {
  let controller: TripsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        TripsService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'KORA_DEFAULT_USER_ID') {
                return '00000000-0000-0000-0000-000000000000';
              }

              return '';
            },
          },
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
  });

  it('returns trips list', async () => {
    const response = await controller.listTrips();
    expect(Array.isArray(response.items)).toBe(true);
    expect(response.tabs).toContain('idea');
  });

  it('creates a new trip', async () => {
    const created = await controller.createTrip({
      destination: 'Rome',
      dates: 'Aug 10 - Aug 17',
      status: 'Draft',
      emoji: '🏛️',
    });

    expect(created.destination).toBe('Rome');
    expect(created.status).toBe('Draft');
  });
});
