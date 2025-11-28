import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransportDto, TransportType } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TransportService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTransportDto: CreateTransportDto) {
    const transport = await this.databaseService.transport.create({
      data: createTransportDto,
    });
    return transport;
  }

  async findAll() {
    const transports = await this.databaseService.transport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return transports;
  }

  async findOne(id: number) {
    const transport = await this.databaseService.transport.findUnique({
      where: { id },
      include: {
        customTours: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport with ID ${id} not found`);
    }

    return transport;
  }

  async findByType(type: TransportType) {
    const transports = await this.databaseService.transport.findMany({
      where: {
        type: {
          has: type,
        },
      },
      orderBy: {
        price: 'asc',
      },
    });
    return transports;
  }

  async findByDestination(destination: string) {
    const transports = await this.databaseService.transport.findMany({
      where: {
        destination: {
          contains: destination,
          mode: 'insensitive',
        },
      },
      orderBy: {
        price: 'asc',
      },
    });
    return transports;
  }

  async findByCapacity(minCapacity: number) {
    const transports = await this.databaseService.transport.findMany({
      where: {
        capacity: {
          gte: minCapacity,
        },
      },
      orderBy: {
        capacity: 'asc',
      },
    });
    return transports;
  }

  async findByPriceRange(minPrice: number, maxPrice: number) {
    const transports = await this.databaseService.transport.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      orderBy: {
        price: 'asc',
      },
    });
    return transports;
  }

  async update(id: number, updateTransportDto: UpdateTransportDto) {
    // Check if transport exists
    await this.findOne(id);

    const transport = await this.databaseService.transport.update({
      where: { id },
      data: updateTransportDto,
    });

    return transport;
  }

  async remove(id: number) {
    // Check if transport exists
    await this.findOne(id);

    // Check if transport is being used in custom tours
    const customToursCount = await this.databaseService.customTour.count({
      where: { transportId: id },
    });

    if (customToursCount > 0) {
      throw new Error(
        `Cannot delete transport. It is being used in ${customToursCount} custom tour(s).`
      );
    }

    await this.databaseService.transport.delete({
      where: { id },
    });

    return { message: `Transport with ID ${id} has been successfully deleted` };
  }

  async getTransportTypes() {
    return Object.values(TransportType);
  }

  async getStatistics() {
    const total = await this.databaseService.transport.count();
    
    const byType = await this.databaseService.transport.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    const avgPrice = await this.databaseService.transport.aggregate({
      _avg: {
        price: true,
      },
    });

    const avgCapacity = await this.databaseService.transport.aggregate({
      _avg: {
        capacity: true,
      },
    });

    return {
      total,
      byType,
      averagePrice: avgPrice._avg.price,
      averageCapacity: avgCapacity._avg.capacity,
    };
  }
}
