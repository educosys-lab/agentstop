import { Injectable } from '@nestjs/common';

import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';
import { discordReadConfig } from './config';
import { discordReadExecute } from './execute';
import { discordReadTest } from './test';
import { discordReadValidate } from './validate';
import { discordReadMetadata } from './metadata';

@Injectable()
export default class DiscordReadNode extends GeneralBaseNode {
	metadata = discordReadMetadata;
	config = discordReadConfig;
	execute = discordReadExecute;
	validate = discordReadValidate;
	terminate = async () => true as const;
	test = discordReadTest;
}
