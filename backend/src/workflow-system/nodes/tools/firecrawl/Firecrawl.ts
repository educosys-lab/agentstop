import { Injectable } from '@nestjs/common';

import { firecrawlToolMetadata } from './metadata';
import { firecrawlToolConfig } from './config';
import { firecrawlToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class FirecrawlTool extends ToolBaseNode {
	metadata = firecrawlToolMetadata;
	config = firecrawlToolConfig;
	validate = firecrawlToolValidate;
}
