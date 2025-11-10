import { Injectable } from '@nestjs/common';

import { quickchartToolMetadata } from './metadata';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class QuickChartTool extends ToolBaseNode {
	metadata = quickchartToolMetadata;
	config = [];
	validate = async () => true as const;
}
