import { Injectable } from '@nestjs/common';

import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';
import { s3UploadMetadata } from './metadata';
import { s3UploadTest } from './test';
import { s3UploadConfig } from './config';
import { s3UploadValidate } from './validate';
import { s3UploadExecute } from './execute';

@Injectable()
export default class S3Upload extends GeneralBaseNode {
	metadata = s3UploadMetadata;
	config = s3UploadConfig;
	execute = s3UploadExecute;
	validate = s3UploadValidate;
	terminate = async () => true as const;
	test = s3UploadTest;
}
