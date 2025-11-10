import * as path from 'path';
import * as fs from 'fs';
import appRootPath from 'app-root-path';

import { padNumber } from '../utils/number.util';
import { DefaultReturnType } from '../types/return.type';
import { returnErrorString } from '../utils/return.util';

export const getAllLogs = (): DefaultReturnType<Record<string, any>> => {
	try {
		const baseFolder = path.join(appRootPath.path, 'logs');
		if (!fs.existsSync(baseFolder)) return {};

		const buildStructure = (dirPath: string): Record<string, any> => {
			const result: Record<string, any> = {};

			const entries = fs.readdirSync(dirPath, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dirPath, entry.name);

				if (entry.isDirectory()) {
					// Recurse into subdirectory, even if empty
					result[entry.name] = buildStructure(fullPath);
				} else if (entry.isFile()) {
					const content = fs.readFileSync(fullPath, 'utf8');
					result[entry.name] = content;
				}
			}

			return result;
		};

		return buildStructure(baseFolder);
	} catch (error) {
		return {
			userMessage: 'Error getting logs!',
			error: 'Error getting logs!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['LoggerActions - getAllLogs - catch'],
		};
	}
};

export const deleteLog = (filePath: string): DefaultReturnType<true> => {
	try {
		const logsBasePath = path.join(appRootPath.path, 'logs');
		const targetPath = path.join(logsBasePath, `/${filePath}`);

		const today = new Date();
		const currentFile = `${today.getFullYear()}-${padNumber(today.getMonth() + 1)}-${padNumber(today.getDate())}-${padNumber(today.getHours())}`; // 'YYYY-MM-DD-HH'

		if (path.basename(targetPath) === `${currentFile}.log`) {
			return {
				userMessage: 'Cannot delete active log file!',
				error: 'Cannot delete active log file!',
				errorType: 'BadRequestException',
				errorData: {},
				trace: ['LoggerActions - deleteLog - if (path.basename(targetPath) === `${currentFile}.log`)`'],
			};
		}

		// Ensure deletion stays within logs directory
		if (!targetPath.startsWith(logsBasePath)) {
			return {
				userMessage: 'Invalid path!',
				error: 'Invalid path: Outside logs directory!',
				errorType: 'BadRequestException',
				errorData: {},
				trace: ['LoggerActions - deleteLog - if (!targetPath.startsWith(logsBasePath))'],
			};
		}

		const stat = fs.statSync(targetPath);

		if (stat.isDirectory()) {
			const contents = fs.readdirSync(targetPath);
			if (contents.length > 0) {
				return {
					userMessage: 'Cannot delete non-empty directory!',
					error: 'Cannot delete non-empty directory!',
					errorType: 'BadRequestException',
					errorData: {},
					trace: ['LoggerActions - deleteLog - if (contents.length > 0)'],
				};
			}

			fs.rmSync(targetPath, { recursive: true, force: true });
		} else fs.unlinkSync(targetPath);

		return true;
	} catch (error) {
		return {
			userMessage: 'Error deleting log!',
			error: 'Error deleting log!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['LoggerActions - deleteLog - catch'],
		};
	}
};
