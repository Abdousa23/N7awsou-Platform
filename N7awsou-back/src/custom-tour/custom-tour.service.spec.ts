import { Test, TestingModule } from '@nestjs/testing';
import { CustomTourService } from './custom-tour.service';

describe('CustomTourService', () => {
  let service: CustomTourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomTourService],
    }).compile();

    service = module.get<CustomTourService>(CustomTourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
