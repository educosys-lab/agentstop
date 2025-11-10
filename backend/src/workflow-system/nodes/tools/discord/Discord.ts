import { Injectable } from '@nestjs/common';

import { discordToolMetadata } from './metadata';
import { discordToolConfig } from './config';
import { discordToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class DiscordTool extends ToolBaseNode {
	metadata = discordToolMetadata;
	config = discordToolConfig;
	validate = discordToolValidate;
}
