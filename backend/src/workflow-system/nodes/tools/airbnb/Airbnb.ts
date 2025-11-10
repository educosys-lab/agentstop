import { Injectable } from '@nestjs/common';

import { airbnbToolMetadata } from './metadata';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class AirbnbTool extends ToolBaseNode {
	metadata = airbnbToolMetadata;
	config = [];
	validate = async () => true as const;
}
