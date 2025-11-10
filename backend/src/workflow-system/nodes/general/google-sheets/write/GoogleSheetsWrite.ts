import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { googleSheetsWriteConfig, googleSheetsWriteAiGenerateProps } from './config';
import { googleSheetsWriteExecute } from './execute';
import { googleSheetsWriteTest } from './test';
import { googleSheetsWriteValidate } from './validate';
import { googleSheetsWriteMetadata } from './metadata';

@Injectable()
export default class WriteGoogleSheetsNode extends GeneralBaseNode {
	metadata = googleSheetsWriteMetadata;
	config = googleSheetsWriteConfig;
	aiGenerateProps = googleSheetsWriteAiGenerateProps;
	execute = googleSheetsWriteExecute;
	validate = googleSheetsWriteValidate;
	terminate = async () => true as const;
	test = googleSheetsWriteTest;
}
