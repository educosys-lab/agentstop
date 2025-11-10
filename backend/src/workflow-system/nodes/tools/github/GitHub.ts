import { Injectable } from '@nestjs/common';

import { gitHubToolMetadata } from './metadata';
import { gitHubToolConfig } from './config';
import { gitHubToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class GitHubTool extends ToolBaseNode {
	metadata = gitHubToolMetadata;
	config = gitHubToolConfig;
	validate = gitHubToolValidate;
}
