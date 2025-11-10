import { Injectable } from '@nestjs/common';

import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';
import { slackReadConfig } from './config';
import { slackReadExecute } from './execute';
import { slackReadTest } from './test';
import { slackReadValidate } from './validate';
import { slackReadMetadata } from './metadata';

@Injectable()
export default class SlackRead extends GeneralBaseNode {
	metadata = slackReadMetadata;
	config = slackReadConfig;
	execute = slackReadExecute;
	validate = slackReadValidate;
	terminate = async () => true as const;
	test = slackReadTest;
}
