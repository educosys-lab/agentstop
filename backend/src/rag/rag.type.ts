export type RagType = {
	id: string;
	userId: string;
	sourceName: string;
	creationTime: number;
};

export type RagIngestionType = {
	sourceName: string;
	sourceType: 'url' | 'text' | 'pdf' | 'docx' | 'ppt' | 'json';
	data: string;
	crawlFullWebsite?: boolean;
};
