import { Test, TestingModule } from '@nestjs/testing';
import { CustomTourController } from './custom-tour.controller';
import { CustomTourService } from './custom-tour.service';

describe('CustomTourController', () => {
  let controller: CustomTourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomTourController],
      providers: [CustomTourService],
    }).compile();

    controller = module.get<CustomTourController>(CustomTourController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
