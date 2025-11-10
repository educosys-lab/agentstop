import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { multerConfig } from './multer.config';
import { handleMulterUpload } from './file.service';

@Controller('files')
export class FileController {
	@Post('upload')
	@UseInterceptors(FileInterceptor('file', multerConfig))
	async upload(@UploadedFile() file: Express.Multer.File) {
		return handleMulterUpload({ file });
	}
}
