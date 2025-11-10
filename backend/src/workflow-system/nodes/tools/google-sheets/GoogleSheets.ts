import { Injectable } from '@nestjs/common';

import { googleSheetsToolMetadata } from './metadata';
import { googleSheetsToolConfig } from './config';
import { googleSheetsToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class GoogleSheetsTool extends ToolBaseNode {
	metadata = googleSheetsToolMetadata;
	config = googleSheetsToolConfig;
	validate = googleSheetsToolValidate;
}
