import { Injectable } from '@nestjs/common';

import { notionToolMetadata } from './metadata';
import { notionToolConfig } from './config';
import { notionToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class NotionTool extends ToolBaseNode {
	metadata = notionToolMetadata;
	config = notionToolConfig;
	validate = notionToolValidate;
}
