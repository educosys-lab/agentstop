import * as path from 'path';
import * as fs from 'fs';
import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import appRootPath from 'app-root-path';

const RESERVED_NAMES = [
	'CON',
	'PRN',
	'AUX',
	'NUL',
	'COM1',
	'COM2',
	'COM3',
	'COM4',
	'COM5',
	'COM6',
	'COM7',
	'COM8',
	'COM9',
	'LPT1',
	'LPT2',
	'LPT3',
	'LPT4',
	'LPT5',
	'LPT6',
	'LPT7',
	'LPT8',
	'LPT9',
];

type LogLevel = 'info' | 'warn' | 'error';

const isProd = process.env.NODE_ENV === 'production';
const loggerMap = new Map<string, Logger>();

const sanitizeFilename = (input: string): string => {
	let filename = input
		.replace(/[^a-zA-Z0-9-_\.]/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_+|_+$/g, '');

	if (RESERVED_NAMES.includes(filename.toUpperCase())) filename = '_' + filename;
	return filename;
};

const getLogger = (id: string, level: LogLevel): { logger: Logger; logFilePath: string } => {
	const sanitizedFilename = sanitizeFilename(id);

	const logDir = path.join(appRootPath.path, 'logs', level, sanitizedFilename);
	if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

	const loggerKey = `${level}:${sanitizedFilename}`;
	if (loggerMap.has(loggerKey)) return { logger: loggerMap.get(loggerKey)!, logFilePath: logDir };

	const transport = new DailyRotateFile({
		filename: path.join(logDir, '%DATE%.log'), // file format: logs/level/id/YYYY-MM-DD-HH.log
		datePattern: 'YYYY-MM-DD-HH', // rotate hourly
	});

	const logger = createLogger({
		level,
		format: format.combine(
			format.timestamp(),
			format.printf(
				(props: { timestamp: string; level: string; message: string }) =>
					`${props.timestamp} [${props.level}]: ${props.message}\n`,
			),
		),
		transports: [
			transport,
			...(isProd
				? []
				: [
						new transports.Console({
							format: format.combine(
								format.colorize(),
								format.printf(
									(props: { timestamp: string; level: string; message: string }) =>
										`${props.timestamp} [${props.level}]: ${props.message}`,
								),
							),
						}),
					]),
		],
	});

	loggerMap.set(loggerKey, logger);
	return { logger, logFilePath: logDir };
};

const getCallerLocation = () => {
	const err = new Error();
	const stackLines = (err.stack || '').split('\n');

	const callerLine = stackLines[3] || stackLines[2] || 'unknown';
	return callerLine.replace(/^\s*at\s*/, '').trim();
};

export const log = (
	id:
		| (string & {})
		| ('system' | 'access' | 'auth' | 'admin' | 'interact' | 'payment' | 'template' | 'user' | 'workflow'),
	level: LogLevel,
	log: { message: string; data: Record<string, any>; trace: string[] },
) => {
	const location = getCallerLocation();
	const logWithLocation = typeof log === 'string' ? { message: log, location } : { ...log, location };

	const { logger } = getLogger(id || 'undefined', level);
	const finalMessage = JSON.stringify(logWithLocation, null, 2);
	logger.log(level, finalMessage);
};

export const info = (
	id:
		| (string & {})
		| ('system' | 'access' | 'auth' | 'admin' | 'interact' | 'payment' | 'template' | 'user' | 'workflow'),
	level: LogLevel,
	log: string,
) => {
	const { logger } = getLogger(id || 'undefined', level);
	const finalMessage = JSON.stringify(log, null, 2);
	logger.log(level, finalMessage);
};
