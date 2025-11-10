import { Injectable } from '@nestjs/common';

import { redisToolMetadata } from './metadata';
import { redisToolConfig } from './config';
import { redisToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class RedisTool extends ToolBaseNode {
	metadata = redisToolMetadata;
	config = redisToolConfig;
	validate = redisToolValidate;
}
