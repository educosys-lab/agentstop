import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const httpMetadata: MetadataType = {
	type: 'http',
	label: 'HTTP Request',
	description: `Make GET, POST, PUT, DELETE HTTP requests`,
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/http.svg`,
};
