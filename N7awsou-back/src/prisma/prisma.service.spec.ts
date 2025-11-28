import { Test, TestingModule } from '@nestjs/testing';
<<<<<<<< HEAD:src/tours/tours.service.spec.ts
import { ToursService } from './tours.service';

describe('ToursService', () => {
  let service: ToursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToursService],
    }).compile();

    service = module.get<ToursService>(ToursService);
========
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
>>>>>>>> a248b2d12bdbb45508fbf95401f135e34c4a6f32:src/prisma/prisma.service.spec.ts
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
