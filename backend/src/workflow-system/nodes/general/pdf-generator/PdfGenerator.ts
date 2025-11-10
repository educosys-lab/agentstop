import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../base-node/general/GeneralBaseNode';
import { pdfGeneratorExecute } from './execute';
import { pdfGeneratorTest } from './test';
import { pdfGeneratorValidate } from './validate';
import { pdfGeneratorMetadata } from './metadata';

@Injectable()
export default class PdfGeneratorNode extends GeneralBaseNode {
	metadata = pdfGeneratorMetadata;
	config = [];
	execute = pdfGeneratorExecute;
	validate = pdfGeneratorValidate;
	terminate = async () => true as const;
	test = pdfGeneratorTest;
}
