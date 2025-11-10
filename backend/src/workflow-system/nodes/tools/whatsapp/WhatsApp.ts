import { Injectable } from '@nestjs/common';

import { whatsappToolMetadata } from './metadata';
import { whatsappToolConfig, whatsappToolAiGenerateProps, whatsappToolAiPrompt } from './config';
import { whatsappToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class WhatsAppTool extends ToolBaseNode {
	metadata = whatsappToolMetadata;
	config = whatsappToolConfig;
	aiGenerateProps = whatsappToolAiGenerateProps;
	aiPrompt = whatsappToolAiPrompt;
	validate = whatsappToolValidate;
}
