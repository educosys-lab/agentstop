import { Injectable } from '@nestjs/common';

import { youTubeTranscribeMetadata } from './metadata';
import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';
import { youTubeTranscribeConfig } from './config';
import { youTubeTranscribeExecute } from './execute';
import { youTubeTranscribeTest } from './test';
import { youTubeTranscribeValidate } from './validate';

@Injectable()
export default class YouTubeTranscribeNode extends GeneralBaseNode {
	metadata = youTubeTranscribeMetadata;
	config = youTubeTranscribeConfig;
	execute = youTubeTranscribeExecute;
	validate = youTubeTranscribeValidate;
	terminate = async () => true as const;
	test = youTubeTranscribeTest;
}
