import { Injectable } from '@nestjs/common';

import { googleCalendarWriteMetadata } from './metadata';
import { googleCalendarWriteTest } from './test';
import { googleCalendarWriteConfig, googleCalendarWriteAiGenerateProps, googleCalendarWriteAiPrompt } from './config';
import { googleCalendarWriteValidate } from './validate';
import { googleCalendarWriteExecute } from './execute';
import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';

@Injectable()
export default class GoogleCalendarWrite extends GeneralBaseNode {
	metadata = googleCalendarWriteMetadata;
	config = googleCalendarWriteConfig;
	aiGenerateProps = googleCalendarWriteAiGenerateProps;
	aiPrompt = googleCalendarWriteAiPrompt;
	execute = googleCalendarWriteExecute;
	validate = googleCalendarWriteValidate;
	terminate = async () => true as const;
	test = googleCalendarWriteTest;
}
