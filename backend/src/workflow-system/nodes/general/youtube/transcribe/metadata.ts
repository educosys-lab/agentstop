import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const youTubeTranscribeMetadata: MetadataType = {
	type: 'youtube-transcribe',
	label: 'YouTube Transcribe',
	description: 'Transcribe audio content from a YouTube video into text using Google Speech-to-Text',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/youtube-transcribe.svg`,
	hidden: true,
};
