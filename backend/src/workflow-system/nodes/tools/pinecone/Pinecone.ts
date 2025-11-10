import { Injectable } from '@nestjs/common';

import { pineconeToolMetadata } from './metadata';
import { pineconeToolConfig } from './config';
import { pineconeToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class PineconeTool extends ToolBaseNode {
	metadata = pineconeToolMetadata;
	config = pineconeToolConfig;
	validate = pineconeToolValidate;
}
