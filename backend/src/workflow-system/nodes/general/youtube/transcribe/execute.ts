import * as ytdl from '@distube/ytdl-core';
import { WritableStreamBuffer } from 'stream-buffers';
import axios from 'axios';

import { YouTubeTranscribeConfigType, YouTubeTranscribeDataType, youTubeTranscribeValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { WORKFLOW_SYSTEM } from 'src/workflow-system/workflow-system.constant';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const youTubeTranscribeExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<YouTubeTranscribeDataType, YouTubeTranscribeConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await youTubeTranscribeValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'youTubeTranscribeExecute - youTubeTranscribeValidate'],
			};
		}

		const { api_key, video_url } = validate.config;

		const videoInfo = await ytdl.getInfo(video_url);

		const videoDurationSeconds = parseInt(videoInfo.videoDetails.lengthSeconds, 10);

		if (videoDurationSeconds > WORKFLOW_SYSTEM.YOUTUBE_TRANSCRIBE_LIMIT) {
			return {
				userMessage: 'Video duration exceeds 1 hour!',
				error: 'Video duration exceeds 1 hour!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['youTubeTranscribeExecute - ytdl.getInfo'],
			};
		}

		const audioFormat = ytdl.chooseFormat(videoInfo.formats, {
			filter: (format) => {
				const isAudio = format.codecs === 'opus' && format.container === 'webm';

				const extendedFormat = format as typeof format & {
					audioTrack?: {
						displayName: string;
						id: string;
						audioIsDefault: boolean;
					};
				};

				const isEnglishOrDefault =
					!extendedFormat.audioTrack ||
					extendedFormat.audioTrack.audioIsDefault ||
					extendedFormat.audioTrack.displayName.toLowerCase().includes('english');
				return isAudio && isEnglishOrDefault;
			},
			quality: 'highestaudio',
		});

		const bufferStream = new WritableStreamBuffer();
		await new Promise<void>((resolve, reject) => {
			ytdl.downloadFromInfo(videoInfo, { format: audioFormat })
				.on('error', reject)
				.pipe(bufferStream)
				.on('finish', resolve);
		});

		const audioBuffer = bufferStream.getContents();
		if (!audioBuffer) {
			return {
				userMessage: 'Failed to download or buffer audio from YouTube!',
				error: 'Failed to download or buffer audio from YouTube!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['youTubeTranscribeExecute - ytdl.downloadFromInfo'],
			};
		}

		const audioBase64 = audioBuffer.toString('base64');
		const response = await axios.post(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${api_key}`,
			{
				contents: [
					{
						parts: [
							{
								text: 'Transcribe the audio content to text in English. Provide only the transcription without any additional commentary.',
							},
							{ inlineData: { mimeType: 'audio/webm', data: audioBase64 } },
						],
					},
				],
			},
			{ headers: { 'Content-Type': 'application/json' } },
		);

		const candidates = response.data?.candidates;
		if (!Array.isArray(candidates) || candidates.length === 0) {
			return {
				userMessage: 'No transcription candidates returned from Gemini API!',
				error: 'No transcription candidates returned from Gemini API!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['youTubeTranscribeExecute - axios.post'],
			};
		}

		const parts = candidates[0].content?.parts;
		if (!Array.isArray(parts) || parts.length === 0) {
			return {
				userMessage: 'No content parts returned in candidate!',
				error: 'No content parts returned in candidate!',
				errorType: 'InternalServerErrorException',
				errorData: {},
				trace: ['youTubeTranscribeExecute - axios.post'],
			};
		}

		const transcribedText = parts[0].text?.trim() || 'No transcription available';

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: transcribedText },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['youTubeTranscribeExecute - catch'],
		};
	}
};
