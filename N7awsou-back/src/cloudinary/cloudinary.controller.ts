import {
    Controller,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
  } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('image')
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
    ) {}


    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
      return this.cloudinaryService.uploadFile(file);
    }

    @Post('upload-multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
      return this.cloudinaryService.uploadMultipleFiles(files);
    }
}