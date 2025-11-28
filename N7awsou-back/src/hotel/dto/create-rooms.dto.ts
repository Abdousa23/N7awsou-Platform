export class CreateRoomDto {
  hotelId: number;
  occupancy: number;
  priceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  pricePerNight: number;
}
