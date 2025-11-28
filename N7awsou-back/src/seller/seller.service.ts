import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { DatabaseService } from 'src/database/database.service';
import { $Enums, Prisma } from '@prisma/client';

@Injectable()
export class SellerService {
  constructor(
    private readonly databaseService: DatabaseService,

  ) { }

  async create(createSellerDto: CreateSellerDto , userId: number) {

    const foundUser = await this.databaseService.user.findUnique({
      where:{
        id:userId,
      }})

    if (!foundUser) {
      throw new Error('User not found');
    }


    const createdSeller = await this.databaseService.seller.create({
      data: {
        ...createSellerDto,
      },
    });

  const updatedUser = await this.databaseService.user.update({
      where: { id: createSellerDto.userId },
      data: {
        role: foundUser.role!=="ADMIN" ? 'VENDEUR' : foundUser?.role,
      },
    });
    console.log('Seller created:', updatedUser);
    return createdSeller;
  }


  findAll() {
    return this.databaseService.seller.findMany();
  }

  findOne(id: number) {
    return this.databaseService.seller.findUnique({
      where: { id },
    });
  }

  update(id: number, updateSellerDto: UpdateSellerDto) {
    return this.databaseService.seller.update({
      where: { id },
      data: {
        ...updateSellerDto,
      }
    });
  }

  remove(id: number) {
    return this.databaseService.seller.delete({
      where: { id },
    });
  }
}
