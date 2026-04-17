import { Test, TestingModule } from '@nestjs/testing';
import { PackingController } from './packing.controller';
import { PackingService } from './packing.service';

describe('PackingController', () => {
  let controller: PackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackingController],
      providers: [PackingService],
    }).compile();

    controller = module.get<PackingController>(PackingController);
  });

  it('returns packing overview', () => {
    const response = controller.getOverview('Clothing');
    expect(response).toHaveProperty('categories');
    expect(response).toHaveProperty('items');
    expect(response.selectedCategory).toBe('Clothing');
  });
});
