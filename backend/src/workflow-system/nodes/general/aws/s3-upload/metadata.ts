import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const s3UploadMetadata: MetadataType = {
	type: 'aws-s3-upload',
	label: 'AWS S3 Upload',
	description: 'Upload files to an AWS S3 bucket',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/aws-s3.svg`,
	hidden: true,
};
