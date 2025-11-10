import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../base-node/general/GeneralBaseNode';
import { resumePdfGeneratorAiGenerateProps, resumePdfGeneratorAiPrompt, resumePdfGeneratorConfig } from './config';
import { resumePdfGeneratorExecute } from './execute';
import { resumePdfGeneratorTest } from './test';
import { resumePdfGeneratorValidate } from './validate';
import { resumePdfGeneratorMetadata } from './metadata';

@Injectable()
export default class ResumePdfGeneratorNode extends GeneralBaseNode {
	metadata = resumePdfGeneratorMetadata;
	config = resumePdfGeneratorConfig;
	aiGenerateProps = resumePdfGeneratorAiGenerateProps;
	aiPrompt = resumePdfGeneratorAiPrompt;
	execute = resumePdfGeneratorExecute;
	validate = resumePdfGeneratorValidate;
	terminate = async () => true as const;
	test = resumePdfGeneratorTest;
}
