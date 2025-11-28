import { Injectable } from '@nestjs/common';
import { CreateCustomTourDto } from './dto/create-custom-tour.dto';
import { UpdateCustomTourDto } from './dto/update-custom-tour.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CustomTourService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCustomTourDto: CreateCustomTourDto) {

    const {transportId , hotelId , roomId , withGuide ,countryId , cityId , departureDate, returnDate, ...rest } = createCustomTourDto;
    
    // Ensure dates are properly formatted for Prisma
    const formattedDepartureDate = departureDate instanceof Date 
      ? departureDate 
      : new Date(departureDate + 'T00:00:00.000Z');
    
    const formattedReturnDate = returnDate instanceof Date 
      ? returnDate 
      : new Date(returnDate + 'T23:59:59.999Z');
      
    let guideAvailable = withGuide;
    let availableGuide;

    if(withGuide){
    const guides = await this.databaseService.user.findMany({
      where: {
        role: 'GUIDE',
      },
      include:{
        GuideTours:{
          include:{
            tour: true
          }
        }
        
      }
    });


    availableGuide = guides.filter(guide => {
      return guide.GuideTours.length === 0 ||
      guide.GuideTours.every(guideTour => {
        
        return (
          (guideTour?.tour?.departureDate && guideTour.tour.departureDate > formattedReturnDate) ||
          (guideTour?.tour?.returnDate && guideTour.tour.returnDate < formattedDepartureDate)
        );
      });
    });
  

    

    if (availableGuide.length === 0 && withGuide) {
      guideAvailable = false;
    }

  }

    const customTour = await this.databaseService.customTour.create({
      data: {
        ...rest,
        departureDate: formattedDepartureDate,
        returnDate: formattedReturnDate,
        transportId,
        hotelId,
        roomId,
        countryId,
        cityId,
        withGuide: guideAvailable,
      }
    });


    if (withGuide && guideAvailable && availableGuide && availableGuide.length > 0) {
      await this.databaseService.guideTours.create({
        data: {
          guideId: availableGuide[0].id,
          customTourId: customTour.id,
        }
      });
    }


    return customTour;
  }

  findAll() {
    return `This action returns all customTour`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customTour`;
  }

  update(id: number, updateCustomTourDto: UpdateCustomTourDto) {
    return `This action updates a #${id} customTour`;
  }

  remove(id: number) {
    return `This action removes a #${id} customTour`;
  }
}
