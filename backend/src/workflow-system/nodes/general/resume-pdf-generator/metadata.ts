import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const resumePdfGeneratorMetadata: MetadataType = {
	type: 'resume-pdf-generator',
	label: 'Resume PDF Generator',
	description: `Generates a professional PDF resume from user-provided details.`,
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/resume-pdf-generator.svg`,
};
