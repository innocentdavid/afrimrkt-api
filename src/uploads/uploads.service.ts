/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
// import toStream = require('buffer-to-stream');
// import * as toStreamImport from 'buffer-to-stream';
// const toStream: any = toStreamImport;
const streamifier = require('streamifier');

@Injectable()
export class UploadsService {
  async upload(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      return new Promise<UploadApiResponse | UploadApiErrorResponse>(
        (resolve, reject) => {
          const uploadStream = v2.uploader.upload_stream((error, result) => {
            if (error) return reject(error);
            resolve(result);
          });

          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        },
      );
    } catch (error) {
      console.log(error);

      return error;
    }
  }

  findAll() {
    return `This action returns all uploads`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }
}
