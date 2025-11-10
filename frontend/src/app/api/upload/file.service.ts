import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadPath = process.env.UPLOAD_PATH || './uploads';

/**
 * 🧱 Ensure upload directory exists
 */
function ensureUploadDir() {
	if (!existsSync(uploadPath)) {
		mkdirSync(uploadPath, { recursive: true });
	}
}

/**
 * ✅ Save (upload) a file buffer manually
 * (Useful when file data comes from API, queue, or AI service)
 */
export async function saveFile({ buffer, originalName }: { buffer: Buffer | Uint8Array; originalName: string }) {
	ensureUploadDir();

	const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
	const extension = extname(originalName);
	const filename = `${uniqueSuffix}${extension}`;
	const filePath = join(uploadPath, filename);

	await fs.writeFile(filePath, buffer);

	return { filename, path: filePath, url: `/files/${filename}` };
}

/**
 * 📖 Read file from uploads folder
 */
export async function readFile({ filename }: { filename: string }): Promise<Buffer> {
	const filePath = join(uploadPath, filename);
	try {
		return await fs.readFile(filePath);
	} catch {
		throw new Error(`File not found: ${filename}`);
	}
}

/**
 * 🗑️ Delete a file
 */
export async function deleteFile({ filename }: { filename: string }): Promise<{ deleted: boolean }> {
	const filePath = join(uploadPath, filename);
	try {
		await fs.unlink(filePath);
		return { deleted: true };
	} catch (err: any) {
		if (err.code === 'ENOENT') throw new Error(`File not found: ${filename}`);
		throw err;
	}
}

/**
 * 📜 List all uploaded files
 */
export async function listFiles(): Promise<string[]> {
	try {
		ensureUploadDir();
		return await fs.readdir(uploadPath);
	} catch {
		return [];
	}
}

/**
 * 📏 Get file stats (size, created date, etc.)
 */
export async function getFileInfo({ filename }: { filename: string }) {
	const filePath = join(uploadPath, filename);
	const stats = await fs.stat(filePath);
	return {
		filename,
		size: stats.size,
		createdAt: stats.birthtime,
		modifiedAt: stats.mtime,
	};
}
