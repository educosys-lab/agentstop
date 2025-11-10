import { Injectable } from '@nestjs/common';
import { linkedinToolMetadata } from './metadata';
import { linkedinToolConfig, linkedinToolAiGenerateProps, linkedinToolAiPrompt } from './config';
import { linkedinToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class LinkedInTool extends ToolBaseNode {
	metadata = linkedinToolMetadata;
	config = linkedinToolConfig;
	aiGenerateProps = linkedinToolAiGenerateProps;
	aiPrompt = linkedinToolAiPrompt;
	validate = linkedinToolValidate;
}
