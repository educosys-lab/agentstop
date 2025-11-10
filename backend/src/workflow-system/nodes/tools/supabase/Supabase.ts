import { Injectable } from '@nestjs/common';

import { supabaseToolMetadata } from './metadata';
import { supabaseToolConfig } from './config';
import { supabaseToolValidate } from './validate';
import ToolBaseNode from '../../base-node/tool/ToolBaseNode';

@Injectable()
export default class SupabaseTool extends ToolBaseNode {
	metadata = supabaseToolMetadata;
	config = supabaseToolConfig;
	validate = supabaseToolValidate;
}
