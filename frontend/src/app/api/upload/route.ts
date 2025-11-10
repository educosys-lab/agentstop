import { saveFile } from './file.service';

export async function POST(req: Request) {
	const data = await req.json();

	const base64File = data.file;
	const fileName = data.fileName;

	if (!base64File || !fileName) {
		return Response.json({ error: 'Required data are missing!' }, { status: 400 });
	}

	try {
		const url = await saveFile({ buffer: Buffer.from(base64File, 'base64'), originalName: fileName });
		return Response.json(url.url);
	} catch (error) {
		console.error('Error:', error);
		return Response.json({ error: 'Error uploading file!' }, { status: 500 });
	}
}
