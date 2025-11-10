import { Injectable } from '@nestjs/common';

import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';
import { discordSendConfig } from './config';
import { discordSendExecute } from './execute';
import { discordSendTest } from './test';
import { discordSendValidate } from './validate';
import { discordSendMetadata } from './metadata';

@Injectable()
export default class DiscordSend extends GeneralBaseNode {
	metadata = discordSendMetadata;
	config = discordSendConfig;
	execute = discordSendExecute;
	validate = discordSendValidate;
	terminate = async () => true as const;
	test = discordSendTest;
}
