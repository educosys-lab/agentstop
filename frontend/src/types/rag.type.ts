export type SourceType = 'url' | 'text' | 'pdf' | 'docx' | 'ppt' | 'json';

export type RagIngestionType = {
	sourceName: string;
	sourceType: SourceType;
	data: string;
	crawlFullWebsite?: boolean;
};
