import { Injectable } from '@nestjs/common';

import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';
import { slackSendConfig } from './config';
import { slackSendExecute } from './execute';
import { slackSendTest } from './test';
import { slackSendValidate } from './validate';
import { slackSendMetadata } from './metadata';

@Injectable()
export default class SlackSend extends GeneralBaseNode {
	metadata = slackSendMetadata;
	config = slackSendConfig;
	execute = slackSendExecute;
	validate = slackSendValidate;
	terminate = async () => true as const;
	test = slackSendTest;
}
