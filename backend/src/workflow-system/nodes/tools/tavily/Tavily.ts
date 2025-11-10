import { Injectable } from '@nestjs/common';

import { tavilyToolMetadata } from './metadata';
import { tavilyToolConfig } from './config';
import { tavilyToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class TavilyTool extends ToolBaseNode {
	metadata = tavilyToolMetadata;
	config = tavilyToolConfig;
	validate = tavilyToolValidate;
}
