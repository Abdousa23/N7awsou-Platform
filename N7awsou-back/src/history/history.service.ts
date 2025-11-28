import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateHistoryDto } from './DTO/create-history.dto';
import { UpdateHistoryDto } from './DTO/update-history.dto';

@Injectable()
export class HistoryService {
    constructor(private readonly databaseService: DatabaseService) { }

    getUserHistory(userId: number) {
        return this.databaseService.history.findMany({
            where: { userId },
        });
    }

    getTourHistory(tourId: number) {
        return this.databaseService.history.findMany({
            where: { tourId },
        });
    }


    updateHistoryEntry(id: number, updateHistoryDto: UpdateHistoryDto) {
        return this.databaseService.history.update({
            where: {
                id
            },
            data: updateHistoryDto,
        });
    } async incrementHistoryEntryViews(tourId: number, userId: number) {
        try {
            // First, verify that the tour exists
            const tourExists = await this.databaseService.tour.findUnique({
                where: { id: tourId },
                select: { id: true }
            });

            if (!tourExists) {
                console.log(`Tour with ID ${tourId} does not exist.`);
                throw new NotFoundException(`Tour with ID ${tourId} not found`);
            }

            // Check if user exists
            const userExists = await this.databaseService.user.findUnique({
                where: { id: userId },
                select: { id: true }
            });

            if (!userExists) {
                console.log(`User with ID ${userId} does not exist.`);
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            const existingHistory = await this.databaseService.history.findFirst({
                where: {
                    tourId,
                    userId
                },
            });

            if (!existingHistory) {
                console.log('No existing history found, creating a new entry.');
                return await this.databaseService.history.create({
                    data: {
                        tourId,
                        userId,
                        viewedAt: new Date(),
                        interaction: 1
                    }
                });
            }

            const updatedHistory = await this.databaseService.history.updateMany({
                where: {
                    tourId,
                    userId
                },
                data: {
                    interaction: {
                        increment: 1
                    },
                    viewedAt: new Date() // Update the last viewed time
                },
            });

            console.log('History entry updated:', updatedHistory);
            return updatedHistory;
        } catch (error) {
            console.log('Error in incrementHistoryEntryViews:', error);
            throw error;
        }
    }

    deleteHistoryEntry(id: number) {
        return this.databaseService.history.delete({
            where: {
                id
            },
        });
    }
}
