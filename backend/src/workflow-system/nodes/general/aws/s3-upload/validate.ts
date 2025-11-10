import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { parseJson } from 'src/shared/utils/json.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const s3UploadValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({ defaultData: z.unknown({ message: 'Invalid default data' }) }),
	config: z.object(
		{
			access_key_id: z
				.string({ message: 'Invalid AWS Access Key ID' })
				.min(1, { message: 'AWS Access Key ID is required' }),
			secret_access_key: z
				.string({ message: 'Invalid AWS Secret Access Key' })
				.min(1, { message: 'AWS Secret Access Key is required' }),
			region: z.string({ message: 'Invalid AWS Region' }).min(1, { message: 'AWS Region is required' }),
			bucket_name: z
				.string({ message: 'Invalid S3 Bucket Name' })
				.min(1, { message: 'S3 Bucket Name is required' }),
			file_path: z
				.string({ message: 'Invalid file path or URL' })
				.min(1, { message: 'File path or URL is required' })
				.regex(/^https?:\/\/[^\s/$.?#].[^\s]*$/, { message: 'File path must be a valid URL' }),
			destination_key: z
				.string({ message: 'Invalid destination key' })
				.min(1, { message: 'Destination key is required' }),
		},
		{ message: 'Invalid S3 upload config' },
	),
});

export type S3UploadDataType = z.infer<typeof s3UploadValidationSchema>['data'] & { defaultData: unknown };
export type S3UploadConfigType = z.infer<typeof s3UploadValidationSchema>['config'];

export const s3UploadValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<S3UploadDataType, S3UploadConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<S3UploadDataType, S3UploadConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 's3UploadValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<S3UploadDataType, S3UploadConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: s3UploadValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 's3UploadValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
