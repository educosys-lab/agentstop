'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { monthsShort } from '@/data/date.data';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CampaignAnalyticsType } from '../_types/CampaignAnalytics.type';

type ResponseOverDayPropsType = {
	data: CampaignAnalyticsType['responses'];
};

export function ResponseOverDay({ data }: ResponseOverDayPropsType) {
    const startMonth = monthsShort[data[0].month];
    const startYear = data[0].year;

    const endMonth = monthsShort[data[data.length - 1].month];
    const endYear = data[data.length - 1].year;

	const chartData = data.map((item) => ({
		date: `${monthsShort[item.month]} ${item.date}`,
		responseCount: item.responseCount,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Response over day</CardTitle>
				<CardDescription>
					Campaign performance ({startMonth} {startYear} - {endMonth} {endYear})
				</CardDescription>
			</CardHeader>

			<CardContent>
				<ChartContainer config={{}}>
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />

						<XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />

						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

						<Bar dataKey="responseCount" fill="#3B82F6" radius={8} name="Response Count-" />
					</BarChart>
				</ChartContainer>
			</CardContent>

			{/* <CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 font-medium leading-none">
					Engagement up by 5.2% this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">
					Based on total WhatsApp messages sent during campaigns
				</div>
			</CardFooter> */}
		</Card>
	);
}
