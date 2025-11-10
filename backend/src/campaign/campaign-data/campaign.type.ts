export const CAMPAIGN_TYPE = ['whatsapp'] as const;
export type CampaignType = (typeof CAMPAIGN_TYPE)[number];

export type CampaignDataType = {
	id: string;
	userId: string;
	campaignName: string;
	created: number;
	templateName: string;
	type: CampaignType;
};
