import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { gmailSendConfig, gmailSendAiGenerateProps } from './config';
import { gmailSendExecute } from './execute';
import { gmailSendTest } from './test';
import { gmailSendValidate } from './validate';
import { gmailSendMetadata } from './metadata';

@Injectable()
export default class GmailSend extends GeneralBaseNode {
	metadata = gmailSendMetadata;
	config = gmailSendConfig;
	aiGenerateProps = gmailSendAiGenerateProps;
	execute = gmailSendExecute;
	validate = gmailSendValidate;
	terminate = async () => true as const;
	test = gmailSendTest;
}
