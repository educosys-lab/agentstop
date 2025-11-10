import { NodeConfigType } from 'src/workflow-system/workflow-system.type';

export const redisToolConfig: NodeConfigType[] = [
	{
		name: 'REDIS_HOST',
		label: 'Redis Host',
		description: 'Hostname of the Redis database.',
		type: 'text',
		placeholder: 'Enter the hostname',
		validation: [
			{
				field: 'REDIS_HOST',
				label: 'Redis host',
				type: 'string',
				required: true,
			},
		],
	},
	{
		name: 'REDIS_PORT',
		label: 'Redis Port',
		description: 'Port number of the Redis database.',
		type: 'text',
		placeholder: 'Enter the port',
		validation: [
			{
				field: 'REDIS_PORT',
				label: 'Redis port',
				type: 'string',
				required: true,
			},
		],
	},
	{
		name: 'REDIS_PWD',
		label: 'Redis Password',
		description: 'Password for the Redis database.',
		type: 'text',
		placeholder: 'Enter the password',
		validation: [
			{
				field: 'REDIS_PWD',
				label: 'Redis password',
				type: 'string',
				required: false,
				isSensitiveData: true,
			},
		],
	},
	{
		name: 'REDIS_SSL',
		label: 'Enable SSL',
		description: 'Enable SSL for Redis connection.',
		type: 'select',
		defaultValue: 'False',
		options: [
			{ value: 'True', label: 'True' },
			{ value: 'False', label: 'False' },
		],
		validation: [
			{
				field: 'REDIS_SSL',
				label: 'Redis SSL',
				type: 'string',
				required: true,
			},
		],
	},
	{
		name: 'REDIS_CA_PATH',
		label: 'Redis CA Path',
		description: 'Path to the Redis CA certificate.',
		type: 'text',
		placeholder: 'Enter the CA path',
		validation: [
			{
				field: 'REDIS_CA_PATH',
				label: 'Redis CA path',
				type: 'string',
				required: false,
			},
		],
	},
	{
		name: 'REDIS_CLUSTER_MODE',
		label: 'Redis Cluster Mode',
		description: 'Enable Redis cluster mode.',
		type: 'select',
		defaultValue: 'False',
		options: [
			{ value: 'True', label: 'True' },
			{ value: 'False', label: 'False' },
		],
		validation: [
			{
				field: 'REDIS_CLUSTER_MODE',
				label: 'Redis cluster mode',
				type: 'string',
				required: true,
			},
		],
	},
];
