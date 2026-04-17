import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        DocumentsService,
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

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it('lists documents', async () => {
    const response = await controller.listDocuments('all');
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('total');
  });
});
