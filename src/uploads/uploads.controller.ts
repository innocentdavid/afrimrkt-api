import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachment[]'))
  async uploadFile(@UploadedFiles() attachments: Array<Express.Multer.File>) {
    const resFiles = [];

    for (const attachment of attachments) {
      try {
        const uploadFile = await this.uploadsService.upload(attachment);
        if (uploadFile) {
          resFiles.push({
            id: uploadFile.asset_id,
            original: uploadFile.url,
            thumbnail: uploadFile.url,
          });
        } else {
          throw new BadRequestException('Invalid file type.');
        }
      } catch (error) {
        throw new BadRequestException('Invalid file type.');
      }
    }

    return resFiles;
  }

  // async uploadFile(@UploadedFiles() attachments: Array<Express.Multer.File>) {
  //   var resFiles = [];
  //   attachments.forEach((attachment) => {
  //     const uploadFile = await this.uploadsService
  //       .upload(attachment[0])
  //       .catch(() => {
  //         throw new BadRequestException('Invalid file type.');
  //       });
  //     if (uploadFile) {
  //       console.log(uploadFile);
  //       resFiles.push({
  //         id: uploadFile?.asset_id,
  //         original:
  //           'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/aatik-tasneem-7omHUGhhmZ0-unsplash%402x.png',
  //         thumbnail:
  //           'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/conversions/aatik-tasneem-7omHUGhhmZ0-unsplash%402x-thumbnail.jpg',
  //       });
  //     } else {
  //       throw new BadRequestException('Invalid file type.');
  //     }
  //   });
  //   // return [
  //   //   {
  //   //     id: '883',
  //   //     original:
  //   //       'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/aatik-tasneem-7omHUGhhmZ0-unsplash%402x.png',
  //   //     thumbnail:
  //   //       'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/conversions/aatik-tasneem-7omHUGhhmZ0-unsplash%402x-thumbnail.jpg',
  //   //   },
  //   // ];
  // }
}
