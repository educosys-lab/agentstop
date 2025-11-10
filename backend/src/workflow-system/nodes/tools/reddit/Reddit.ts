import { Injectable } from '@nestjs/common';
import { redditToolMetadata } from './metadata';
import { redditToolConfig, redditToolAiGenerateProps, redditToolAiPrompt } from './config';
import { redditToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class RedditTool extends ToolBaseNode {
	metadata = redditToolMetadata;
	config = redditToolConfig;
	aiGenerateProps = redditToolAiGenerateProps;
	aiPrompt = redditToolAiPrompt;
	validate = redditToolValidate;
}
