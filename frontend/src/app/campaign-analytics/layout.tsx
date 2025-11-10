import { ReactNode } from 'react';

import { CAMPAIGN_ANALYTICS_DEFAULT_METADATA } from './seo';

import { AutoRedirect } from '@/app/_components/auto-redirect/AutoRedirect';

export const metadata = CAMPAIGN_ANALYTICS_DEFAULT_METADATA;

export default function CampaignAnalyticsLayout({ children }: { children: ReactNode }) {
	return <AutoRedirect>{children}</AutoRedirect>;
}
