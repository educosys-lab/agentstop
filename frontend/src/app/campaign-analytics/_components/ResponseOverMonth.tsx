'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { monthsShort } from '@/data/date.data';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CampaignAnalyticsType } from '../_types/CampaignAnalytics.type';

type ResponseOverMonthPropsType = {
	data: CampaignAnalyticsType['responses'];
};

export function ResponseOverMonth({ data }: ResponseOverMonthPropsType) {
	const startMonth = monthsShort[data[0].month];
	const startYear = data[0].year;

	const endMonth = monthsShort[data[data.length - 1].month];
	const endYear = data[data.length - 1].year;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Response over month</CardTitle>
				<CardDescription>
					Campaign performance ({startMonth} {startYear} - {endMonth} {endYear})
				</CardDescription>
			</CardHeader>

			<CardContent>
				<ChartContainer config={{}}>
					<LineChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
						<CartesianGrid vertical={false} />

						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => monthsShort[value]}
						/>

						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

						<Line
							name="Response Count-"
							dataKey="responseCount"
							type="natural"
							stroke="#3B82F6"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>

			{/* <CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 font-medium leading-none">
					+5.2% growth in messages this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">
					Total WhatsApp messages sent from Jan to Jun 2025
				</div>
			</CardFooter> */}
		</Card>
	);
}
