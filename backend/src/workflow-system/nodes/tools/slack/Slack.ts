import { Injectable } from '@nestjs/common';

import { slackToolMetadata } from './metadata';
import { slackToolConfig } from './config';
import { slackToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class SlackTool extends ToolBaseNode {
	metadata = slackToolMetadata;
	config = slackToolConfig;
	validate = slackToolValidate;
}
