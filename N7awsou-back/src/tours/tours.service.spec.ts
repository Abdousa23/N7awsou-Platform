import { Test, TestingModule } from '@nestjs/testing';
import { ToursService } from './tours.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ToursService', () => {
  let service: ToursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToursService, PrismaService],
    }).compile();

    service = module.get<ToursService>(ToursService);
  });
});



describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
