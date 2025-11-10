import { Injectable } from '@nestjs/common';

import { mongodbToolMetadata } from './metadata';
import { mongodbToolConfig } from './config';
import { mongodbToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class MongoDBTool extends ToolBaseNode {
	metadata = mongodbToolMetadata;
	config = mongodbToolConfig;
	validate = mongodbToolValidate;
}
