import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const pdfGeneratorMetadata: MetadataType = {
	type: 'pdf-generator',
	label: 'PDF Generator',
	description: `This node generates a PDF from the data that is given. It can be used to create reports, invoices, and other documents in PDF format.`,
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/pdf-generator.svg`,
	hidden: true,
};
