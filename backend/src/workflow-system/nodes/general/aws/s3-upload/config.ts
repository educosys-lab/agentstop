import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const s3UploadConfig: NodeConfigType[] = [
	{
		name: 'access_key_id',
		label: 'AWS Access Key ID',
		description: '',
		type: 'text',
		placeholder: 'Enter your AWS Access Key ID',
		validation: [{ field: 'access_key_id', type: 'string', required: true, label: '' }],
	},
	{
		name: 'secret_access_key',
		label: 'AWS Secret Access Key',
		description: '',
		type: 'text',
		placeholder: 'Enter your AWS Secret Access Key',
		validation: [{ field: 'secret_access_key', type: 'string', required: true, label: '' }],
	},
	{
		name: 'region',
		label: 'AWS Region',
		description: '',
		type: 'text',
		placeholder: 'Enter AWS Region (e.g., us-east-1)',
		validation: [{ field: 'region', type: 'string', required: true, label: '' }],
	},
	{
		name: 'bucket_name',
		label: 'S3 Bucket Name',
		description: '',
		type: 'text',
		placeholder: 'Enter S3 Bucket Name',
		validation: [{ field: 'bucket_name', type: 'string', required: true, label: '' }],
	},
	{
		name: 'file_path',
		label: 'File Path or URL',
		description: '',
		type: 'text',
		placeholder: 'Enter file path or URL (e.g., /path/to/file.jpg or https://example.com/file.jpg)',
		validation: [{ field: 'file_path', type: 'string', required: true, label: '' }],
	},
	{
		name: 'destination_key',
		label: 'Destination Key',
		description: '',
		type: 'text',
		placeholder: 'Enter S3 destination key (e.g., uploads/file.jpg)',
		validation: [{ field: 'destination_key', type: 'string', required: true, label: '' }],
	},
] as const;

export type S3UploadConfigType = {
	access_key_id: string;
	secret_access_key: string;
	region: string;
	bucket_name: string;
	file_path: string;
	destination_key: string;
};
