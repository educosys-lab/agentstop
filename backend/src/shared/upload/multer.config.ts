import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfig = {
	storage: diskStorage({
		destination: (req, file, cb) => {
			const uploadPath = process.env.UPLOAD_PATH || './uploads';
			if (!existsSync(uploadPath)) {
				mkdirSync(uploadPath, { recursive: true });
			}
			cb(null, uploadPath);
		},

		filename: (req, file, cb) => {
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			const extension = extname(file.originalname);
			cb(null, `${uniqueSuffix}${extension}`);
		},
	}),
};
