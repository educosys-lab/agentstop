import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { S3UploadConfigType, S3UploadDataType } from './validate';
import { s3UploadExecute } from './execute';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const s3UploadTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<S3UploadDataType, S3UploadConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await s3UploadExecute({ format, data, config });
};
