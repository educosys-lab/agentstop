import { Injectable } from '@nestjs/common';

import { airtableToolMetadata } from './metadata';
import { airtableToolConfig } from './config';
import { airtableToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class AirtableTool extends ToolBaseNode {
	metadata = airtableToolMetadata;
	config = airtableToolConfig;
	validate = airtableToolValidate;
}
