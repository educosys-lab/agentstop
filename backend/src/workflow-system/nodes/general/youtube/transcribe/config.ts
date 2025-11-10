import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const youTubeTranscribeConfig: NodeConfigType[] = [
	{
		name: 'api_key',
		label: 'Gemini API Key',
		description: 'Enter your Gemini API Key to access the transcription service',
		type: 'text',
		placeholder: 'Enter your Gemini API Key',
		validation: [{ field: 'api_key', type: 'string', required: true, label: 'Gemini api key' }],
	},
	{
		name: 'video_url',
		label: 'YouTube Video URL',
		description: 'Enter the URL of the YouTube video you want to transcribe',
		type: 'text',
		placeholder: 'Enter YouTube Video URL',
		validation: [{ field: 'video_url', type: 'string', required: true, label: 'YouTube url' }],
	},
];
