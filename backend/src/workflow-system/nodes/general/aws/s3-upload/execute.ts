import * as fs from 'fs';
import axios from 'axios';
import { extname } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { S3UploadConfigType } from './config';
import { S3UploadDataType, s3UploadValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const s3UploadExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<S3UploadDataType, S3UploadConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	try {
		const validate = await s3UploadValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 's3UploadExecute - s3UploadValidate'],
			};
		}

		const { access_key_id, bucket_name, destination_key, file_path, region, secret_access_key } = validate.config;

		const s3Client = new S3Client({
			region: region,
			credentials: { accessKeyId: access_key_id, secretAccessKey: secret_access_key },
		});

		let fileBuffer: Buffer;
		let contentType: string;

		const isUrl = file_path.startsWith('http://') || file_path.startsWith('https://');

		if (isUrl) {
			const response = await axios.get(file_path, { responseType: 'arraybuffer' });

			fileBuffer = Buffer.from(response.data);
			contentType = response.headers['content-type'] || 'application/octet-stream';
		} else {
			if (!fs.existsSync(file_path)) {
				return {
					userMessage: 'File not found!',
					error: 'File not found!',
					errorType: 'BadRequestException',
					errorData: { file_path },
					trace: ['s3UploadExecute - if (!fs.existsSync(file_path))'],
				};
			}

			fileBuffer = fs.readFileSync(file_path);
			const extension = extname(file_path).toLowerCase();
			contentType =
				{
					'.jpg': 'image/jpeg',
					'.jpeg': 'image/jpeg',
					'.png': 'image/png',
					'.pdf': 'application/pdf',
					'.doc': 'application/msword',
					'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				}[extension] || 'application/octet-stream';
		}

		const command = new PutObjectCommand({
			Bucket: bucket_name,
			Key: destination_key,
			Body: fileBuffer,
			ContentType: contentType,
		});

		await s3Client.send(command);

		const fileUrl = `https://${bucket_name}.s3.${region}.amazonaws.com/${destination_key}`;

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: fileUrl },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['s3UploadExecute - catch'],
		};
	}
};
