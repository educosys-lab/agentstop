import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const gmailSendMetadata: MetadataType = {
	type: 'gmail-send',
	label: 'Gmail Send',
	description: 'Send emails via your Gmail account',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/gmail-send.svg`,
};
